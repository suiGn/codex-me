import express from 'express';
import { readTwitchSection } from './lib/twitch-sections.mjs';
import { createFaceTracking } from './lib/face-tracking.mjs';
import { createSpiders, parseMeChat } from './lib/spiders.mjs';
import { startupPage } from './ui/startup-page.mjs';
import dotenv from 'dotenv';
import { WebSocket, WebSocketServer } from 'ws';
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { readFile, writeFile, rename, chmod, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const SCOPES = ['user:read:chat', 'user:write:chat'];
const MANAGE_SCOPE = 'channel:manage:broadcast';
const EVENTSUB = 'wss://eventsub.wss.twitch.tv/ws';

// Dependency injection keeps verification entirely offline, without real credentials or chat writes.
export function createApp(config, { fetch: request = globalThis.fetch, Socket = WebSocket, root = ROOT, logger = console, authRetryMs = 30000 } = {}) {
  const port = Number(config.PORT || 3017);
  const origin = `http://localhost:${port}`;
  const redirect = config.TWITCH_REDIRECT_URI || `${origin}/auth/callback`;
  const tokenFile = join(root, '.tokens.json');
  const app = express();
  app.disable('x-powered-by');
  const server = createServer(app);
  const overlays = new WebSocketServer({ noServer: true, maxPayload: 8192 });
  const states = new Map(), seen = new Set(), pending = new Map();
  const logoutCsrf = randomBytes(32).toString('hex');
  const faceTracking = createFaceTracking({ broadcast: message => {
    for (const client of overlays.clients) if ((client.spiders || client.kernels) && client.readyState === WebSocket.OPEN) client.send(JSON.stringify(message));
  } });
  let generation = 0, requests = new AbortController(), tokenWrite = Promise.resolve(), loggingOut = false;
  const spiders = createSpiders({ kernelOnly: true });
  const spiderSnapshot = () => ({ type: 'spiders', spiders: spiders.snapshot(), mes: spiders.presences() });
  const kernelSnapshot = () => ({ type: 'kernels', kernels: spiders.presences().map(({ id, owner, createdAt, present, presenceReason, script, graph, sections }) => ({ id, owner, createdAt, present, presenceReason, script, graph, sections })) });
  const broadcastRegistry = () => {
    for (const client of overlays.clients) if (client.readyState === WebSocket.OPEN && (client.spiders || client.kernels)) client.send(JSON.stringify(client.kernels ? kernelSnapshot() : spiderSnapshot()));
  };
  const queue = [], sockets = new Set(), timers = new Set();
  let tokens = null, refreshJob = null, authBusy = false, broadcaster = null, primary = null, profile = null;
  let channelLogin = config.TWITCH_CHANNEL.trim().toLowerCase();
  let active = null, candidate = null, eventsub = 'down', detail = 'Not authenticated';
  let stopped = false, suspended = false, reconnectTimer = null, retryDelay = 1000;
  let refreshTimer = null, queueTimer = null, sending = false, nextSend = 0;
  const log = (message) => logger.log(`[server] ${message}`);
  // Never log request/response bodies, OAuth codes, URLs with state, or exception objects.
  const fail = (context) => log(`${context} failed; check configuration or authorize again at /auth/login`);
  function later(fn, ms) {
    const timer = setTimeout(() => { timers.delete(timer); fn(); }, ms);
    timers.add(timer); timer.unref?.(); return timer;
  }
  function cancel(timer) { clearTimeout(timer); timers.delete(timer); }
  async function remote(url, options = {}) {
    return request(url, { ...options, signal: AbortSignal.any([AbortSignal.timeout(8000), requests.signal]) });
  }
  function save() {
    const snapshot = tokens, epoch = generation;
    tokenWrite = tokenWrite.catch(() => {}).then(async () => {
      if (!snapshot || generation !== epoch || tokens !== snapshot || stopped) return;
      const temp = `${tokenFile}.tmp`;
      try {
        await writeFile(temp, JSON.stringify(snapshot, null, 2) + '\n', { mode: 0o600 });
        await chmod(temp, 0o600);
        if (generation !== epoch || tokens !== snapshot || stopped) return;
        await rename(temp, tokenFile);
        await chmod(tokenFile, 0o600);
      } finally { await unlink(temp).catch(() => {}); }
    });
    return tokenWrite;
  }
  function scheduleRefresh() {
    cancel(refreshTimer);
    if (tokens && !stopped) {
      const epoch = generation;
      refreshTimer = later(() => refresh().catch(error => handleAuthFailure(error, epoch)), Math.max(1000, tokens.expires_at - Date.now() - 60000));
    }
  }
  async function validate(access) {
    const res = await remote('https://id.twitch.tv/oauth2/validate', { headers: { Authorization: `OAuth ${access}` } });
    if (!res.ok) throw Object.assign(new Error('Token validation failed'), { status: res.status });
    const data = await res.json();
    if (data.client_id !== config.TWITCH_CLIENT_ID || !data.user_id || !data.login || !SCOPES.every(s => data.scopes?.includes(s))) throw new Error('Token identity or scopes mismatch');
    return data;
  }
  async function exchange(form) {
    const res = await remote('https://id.twitch.tv/oauth2/token', { method: 'POST', body: new URLSearchParams({ client_id: config.TWITCH_CLIENT_ID, client_secret: config.TWITCH_CLIENT_SECRET, ...form }) });
    if (!res.ok) throw Object.assign(new Error('Token exchange failed'), { status: res.status });
    const data = await res.json();
    if (!data.access_token || !data.refresh_token || !(data.expires_in > 0)) throw new Error('Invalid token response');
    return data;
  }
  function refresh() {
    if (refreshJob) return refreshJob;
    refreshJob = (async () => {
      if (!tokens?.refresh_token) throw new Error('Authorization required');
      const previous = tokens;
      const data = await exchange({ grant_type: 'refresh_token', refresh_token: previous.refresh_token });
      const identity = await validate(data.access_token);
      if (tokens !== previous || stopped) throw new Error('Session changed');
      if (identity.user_id !== previous.user_id) throw new Error('Identity changed');
      tokens = { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: Date.now() + identity.expires_in * 1000, user_id: identity.user_id, login: identity.login, scopes: identity.scopes };
      await save(); scheduleRefresh(); log('Token refreshed');
    })().finally(() => { refreshJob = null; });
    return refreshJob;
  }
  async function api(path, body, method) {
    if (!tokens) throw new Error('Authorization required');
    const epoch = generation;
    if (tokens.expires_at <= Date.now() + 60000) await refresh();
    for (let attempt = 0; attempt < 2; attempt++) {
      if (!tokens || epoch !== generation) throw new Error('Session ended');
      const access = tokens.access_token;
      const res = await remote(`https://api.twitch.tv/helix/${path}`, { method: method || (body ? 'POST' : 'GET'), headers: { Authorization: `Bearer ${access}`, 'Client-Id': config.TWITCH_CLIENT_ID, ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
      if (!tokens || epoch !== generation) throw new Error('Session ended');
      if (res.status === 401 && attempt === 0) {
        try { if (tokens?.access_token === access) await refresh(); } catch (error) { handleAuthFailure(error, epoch); throw new Error('Authorization required'); }
        continue;
      }
      if (res.status === 401) invalidate();
      if (!res.ok) throw new Error(`Twitch HTTP ${res.status}`);
      return res.status === 204 ? null : res.json();
    }
    invalidate(); throw new Error('Authorization required');
  }
  function disconnect() {
    cancel(reconnectTimer); reconnectTimer = null;
    active = candidate = null;
    for (const socket of sockets) { cancel(socket.watchdog); socket.terminate(); }
    sockets.clear(); eventsub = 'down';
  }
  function invalidate() {
    tokens = null; profile = null; suspended = true; cancel(refreshTimer); disconnect(); queue.length = 0; pending.clear();
    detail = 'Authorization expired or revoked; use /auth/login'; fail('Authorization');
  }
  function handleAuthFailure(error, epoch = generation) {
    if (generation !== epoch || stopped || loggingOut || !tokens) return;
    const transient = ['AbortError', 'TimeoutError', 'TypeError'].includes(error.name) || error.status === 429 || error.status >= 500;
    if (!transient) { invalidate(); return; }
    detail = 'Twitch temporarily unavailable; retrying shortly';
    log('Twitch validation/refresh temporarily unavailable; retaining session and retrying');
    cancel(refreshTimer);
    refreshTimer = later(() => void maintenance(), authRetryMs);
  }
  function retry() {
    if (stopped || suspended || !tokens || reconnectTimer || candidate) return;
    reconnectTimer = later(() => { reconnectTimer = null; connect(); }, retryDelay);
    retryDelay = Math.min(30000, retryDelay * 2);
  }
  function watchdog(socket) {
    cancel(socket.watchdog);
    socket.watchdog = later(() => socket.terminate(), (socket.keepalive || 10) * 1000 + 5000);
  }
  function connect(url = EVENTSUB, old = null) {
    if (stopped || suspended || !tokens) return;
    const target = new URL(url);
    if (target.protocol !== 'wss:' || !['eventsub.wss.twitch.tv', 'eventsub.wss.twitch.tv.'].includes(target.hostname)) throw new Error('Invalid reconnect target');
    const socket = new Socket(url);
    sockets.add(socket); candidate = socket;
    socket.keepalive = old?.keepalive || 10; watchdog(socket);
    socket.on('error', () => fail('EventSub connection'));
    socket.on('message', async raw => {
      if (stopped || suspended || !sockets.has(socket)) return;
      let message;
      try { message = JSON.parse(raw.toString()); } catch { return; }
      if (!message || typeof message !== 'object') return;
      const { metadata = {}, payload = {} } = message;
      try {
        switch (metadata.message_type) {
          case 'session_welcome': {
            socket.keepalive = payload.session.keepalive_timeout_seconds || socket.keepalive;
            watchdog(socket);
            if (!old) await api('eventsub/subscriptions', { type: 'channel.chat.message', version: '1', condition: { broadcaster_user_id: broadcaster, user_id: tokens.user_id }, transport: { method: 'websocket', session_id: payload.session.id } });
            if (!sockets.has(socket) || stopped || suspended) return;
            active = socket; if (candidate === socket) candidate = null;
            eventsub = 'connected'; detail = 'Subscribed to channel.chat.message'; retryDelay = 1000;
            if (old) { sockets.delete(old); cancel(old.watchdog); old.close(); }
            log(old ? 'EventSub migrated (subscriptions retained)' : 'EventSub subscribed');
            break;
          }
          case 'session_keepalive': watchdog(socket); break;
          case 'session_reconnect':
            watchdog(socket);
            if (!candidate) connect(payload.session.reconnect_url, socket);
            break;
          case 'revocation':
            invalidate(); detail = `Subscription revoked: ${String(payload.subscription?.status || 'unknown').replace(/[^a-z_]/g, '')}`;
            log(detail); disconnect(); queue.length = 0; pending.clear(); break;
          case 'notification': {
            watchdog(socket);
            if (payload.subscription?.type !== 'channel.chat.message' || seen.has(metadata.message_id)) return;
            seen.add(metadata.message_id); if (seen.size > 500) seen.delete(seen.values().next().value);
            const e = payload.event;
            if (!e || e.broadcaster_user_id !== broadcaster || e.chatter_user_id === tokens?.user_id || !e.message?.text?.startsWith('!')) return;
            const command = parseMeChat(e.message.text), epoch = generation;
            let twitchProfile;
            if (command?.kind === 'presence' && !spiders.has(e.chatter_user_id)) {
              try { twitchProfile = await lookupTwitchUser(e.chatter_user_id); }
              catch { fail('Viewer profile lookup'); }
              if (generation !== epoch || !tokens || suspended || stopped) return;
            }
            const order = spiders.handle({ userId: e.chatter_user_id, user: e.chatter_user_login || e.chatter_user_name, text: e.message.text, profile: twitchProfile });
            if (order) {
              if (order.changed) broadcastRegistry();
              if (order.reply && queue.length < 100) { queue.push({ id: e.message_id, text: order.reply, at: Date.now() }); void drain(); }
              log(order.changed ? 'Kernel declared' : 'Kernel command handled'); break;
            }
            const m = { type: 'chat', id: e.message_id, user: e.chatter_user_name, text: e.message.text, isMod: !!e.badges?.some(b => b.set_id === 'moderator'), isBroadcaster: e.chatter_user_id === e.broadcaster_user_id || !!e.badges?.some(b => b.set_id === 'broadcaster') };
            const now = Date.now();
            for (const [id, at] of pending) if (now - at > 20000) pending.delete(id);
            if (pending.size >= 1000) pending.delete(pending.keys().next().value);
            pending.set(m.id, now);
            for (const client of overlays.clients) if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(m));
            log(`Command forwarded (${overlays.clients.size} overlays)`); break;
          }
        }
      } catch { fail('EventSub setup'); socket.terminate(); }
    });
    socket.on('close', () => {
      cancel(socket.watchdog); sockets.delete(socket);
      if (active === socket) { active = null; eventsub = 'down'; detail = 'EventSub disconnected; reconnecting'; }
      if (candidate === socket) candidate = null;
      // A failed migration keeps the original connection until its replacement is ready.
      if (!active) retry();
    });
  }
  // Single-flight, bounded lookup cache also limits retries during upstream failures.
  const twitchUsers = new Map();
  async function lookupTwitchUser(userId) {
    const cached = twitchUsers.get(userId);
    if (cached && Date.now() - cached.at < 30000) return cached.promise;
    if (twitchUsers.size >= 500) twitchUsers.delete(twitchUsers.keys().next().value);
    const promise = (async () => {
      const data = await api(`users?id=${encodeURIComponent(userId)}`);
      const user = data.data?.find(user => user.id === userId);
      if (!user || !/^[a-z0-9_]{1,25}$/.test(user.login) || typeof user.display_name !== 'string') throw new Error('Profile not found');
      return { id: user.id, login: user.login, display_name: user.display_name, profile_image_url: user.profile_image_url };
    })();
    twitchUsers.set(userId, { at: Date.now(), promise });
    return promise;
  }
  async function loadProfile() {
    const epoch = generation, userId = tokens?.user_id;
    if (!userId) return;
    try {
      const data = await api(`users?id=${encodeURIComponent(userId)}`);
      if (!tokens || generation !== epoch || tokens.user_id !== userId) return;
      const user = data.data?.find(user => user.id === userId);
      if (!user) return;
      let image = null;
      try { const url = new URL(user.profile_image_url); if (url.protocol === 'https:') image = url.href; } catch {}
      profile = { id: user.id, login: user.login || tokens.login, display_name: user.display_name || user.login || tokens.login, profile_image_url: image, description: user.description || '' };
    } catch { if (generation === epoch) fail('Twitch profile lookup'); }
  }
  async function startEvents() {
    disconnect(); suspended = false;
    const data = await api(`users?login=${encodeURIComponent(config.TWITCH_CHANNEL)}`);
    if (!data.data?.[0]?.id) throw new Error('Channel not found');
    if (!tokens || suspended || loggingOut) return;
    broadcaster = data.data[0].id;
    channelLogin = data.data[0].login || channelLogin;
    if (channelLogin === 'suignn') {
      const seeded = spiders.ensure({ userId: broadcaster, user: channelLogin, profile: data.data[0] });
      if (seeded.changed) broadcastRegistry();
    }
    await loadProfile();
    if (tokens && !suspended && !loggingOut) connect();
  }
  async function drain() {
    if (sending || stopped) return;
    cancel(queueTimer);
    while (queue.length && Date.now() - queue[0].at > 20000) queue.shift();
    if (!queue.length || !tokens || suspended) return;
    if (Date.now() < nextSend) { queueTimer = later(drain, nextSend - Date.now()); return; }
    const item = queue.shift(); sending = true; nextSend = Date.now() + 1500;
    try {
      // Refresh first so a stale queued reply is never sent after a slow refresh.
      if (tokens.expires_at <= Date.now() + 60000) await refresh();
      if (Date.now() - item.at <= 20000) {
        const result = await api('chat/messages', { broadcaster_id: broadcaster, sender_id: tokens.user_id, message: item.text, ...(item.id ? { reply_parent_message_id: item.id } : {}) });
        if (result.data?.[0]?.is_sent) log('Chat reply sent');
        else log(`Chat reply dropped (${String(result.data?.[0]?.drop_reason?.code || 'unknown').replace(/[^a-zA-Z0-9_]/g, '')})`);
      }
    } catch { fail('Chat reply'); }
    finally { sending = false; if (queue.length) queueTimer = later(drain, Math.max(0, nextSend - Date.now())); }
  }
  server.on('upgrade', (req, socket, head) => {
    const address = req.socket.remoteAddress;
    if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(address) || req.url !== '/ws' || (req.headers.origin && req.headers.origin !== origin) || req.headers.host !== `localhost:${port}`) {
      socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'); return;
    }
    overlays.handleUpgrade(req, socket, head, client => overlays.emit('connection', client));
  });
  overlays.on('connection', client => {
    client.on('error', () => {});
    client.on('message', raw => {
      let m; try { m = JSON.parse(raw.toString()); } catch { return; }
      if (!m || typeof m !== 'object') return;
      if (m.type === 'hello' && m.role === 'overlay' && m.version === 1) { client.hello = true; primary ||= client; if (m.view === 'spiders' || m.view === 'kernels') { client.kernels = m.view === 'kernels'; client.spiders = !client.kernels; client.send(JSON.stringify(client.kernels ? kernelSnapshot() : spiderSnapshot())); client.send(JSON.stringify({ type: 'face', face: faceTracking.snapshot() })); } return; }
      if (client !== primary || m.type !== 'reply' || typeof m.text !== 'string' || !m.text.trim() || [...m.text].length > 450 || (m.id !== null && typeof m.id !== 'string')) return;
      // Only replies to commands seen on Twitch can cause chat writes. Null IDs remain supported.
      const at = m.id === null ? Date.now() : pending.get(m.id);
      if (!at || Date.now() - at > 20000 || !tokens || suspended || !broadcaster) return;
      if (m.id !== null) pending.delete(m.id);
      if (queue.length < 100) { queue.push({ id: m.id, text: m.text, at }); void drain(); }
    });
    client.on('close', () => { if (primary === client) primary = [...overlays.clients].find(c => c !== client && c.hello && c.readyState === WebSocket.OPEN) || null; });
  });
  app.use((req, res, next) => {
    if (req.headers.host !== `localhost:${port}`) return res.status(403).send('Use localhost');
    res.set('Cache-Control', 'no-store'); res.set('Referrer-Policy', 'no-referrer'); next();
  });
  app.get('/healthz', (req, res) => res.json({ ok: true, authed: !!tokens, eventsub, overlays: overlays.clients.size }));
  const publicStatus = () => ({ authed: !!tokens, login: tokens?.login || null, channel: channelLogin, profile: tokens ? profile : null, eventsub, detail, overlays: overlays.clients.size });
  app.get('/api/kernels', (req, res) => res.json(kernelSnapshot()));
  const sectionJobs = new Map();
  app.get('/api/kernels/:id/sections/:section', async (req, res) => {
    const { id, section } = req.params, target = spiders.target(id);
    if (!target) return res.status(404).json({ error: 'Kernel not found' });
    if (!['channel','stream','followers'].includes(section)) return res.status(400).json({ error: 'Unknown section' });
    if (!tokens || suspended || stopped) return res.status(401).json({ error: 'Connect Twitch to load this section.' });
    const key = `${id}:${section}`, previous = target.sections[section];
    if (sectionJobs.has(key)) await sectionJobs.get(key);
    else if (!previous.attemptedAt || Date.now() - previous.attemptedAt >= 30000) {
      const epoch = generation;
      const job = (async () => {
        spiders.sectionState(id, section, { status: 'loading', attemptedAt: Date.now(), error: null });
        broadcastRegistry();
        try {
          const values = await readTwitchSection(api, target.userId, section);
          if (epoch !== generation || !tokens || suspended || stopped) return;
          spiders.importSection(id, section, values);
          spiders.sectionState(id, section, { attemptedAt: Date.now() });
        } catch {
          if (epoch !== generation || stopped) return;
          spiders.sectionState(id, section, { status: 'error', error: 'Twitch data unavailable. Retrying shortly.', attemptedAt: Date.now() });
          fail(`Twitch ${section} lookup`);
        } finally { if (!stopped) broadcastRegistry(); }
      })();
      sectionJobs.set(key, job);
      try { await job; } finally { sectionJobs.delete(key); }
    }
    const state = spiders.target(id)?.sections[section];
    res.status(state?.status === 'ready' ? 200 : 502).json(state || { error: 'Section unavailable' });
  });
  // Local companion permissions: Twitch token ownership is not a multi-user web session.
  const channelWrites = new Set();
  const capability = id => {
    const target = spiders.target(id);
    const own = !!tokens && target?.userId === tokens.user_id;
    return { own, canEditChannel: own && !!tokens.scopes?.includes(MANAGE_SCOPE) && !suspended && !stopped,
      ...(own ? { csrf: logoutCsrf } : {}) };
  };
  app.get('/api/kernels/:id/permissions', (req, res) => {
    if (!spiders.target(req.params.id)) return res.status(404).json({ error: 'Kernel not found' });
    res.json(capability(req.params.id));
  });
  app.patch('/api/kernels/:id/channel', express.json({ limit: '4kb' }), async (req, res) => {
    const id = req.params.id, target = spiders.target(id);
    if (req.headers.origin !== origin || req.headers['x-csrf-token'] !== logoutCsrf) return res.status(403).json({ error: 'Invalid local request' });
    if (!target) return res.status(404).json({ error: 'Kernel not found' });
    if (!capability(id).canEditChannel) return res.status(403).json({ error: 'Channel owner authorization with channel:manage:broadcast is required.' });
    const body = req.body;
    if (!body || Array.isArray(body) || !Object.keys(body).length || Object.keys(body).some(key => !['title','broadcaster_language'].includes(key)) ||
      ('title' in body && (typeof body.title !== 'string' || !body.title.trim() || [...body.title].length > 140)) ||
      ('broadcaster_language' in body && (typeof body.broadcaster_language !== 'string' || !/^(?:[a-z]{2}|other)$/.test(body.broadcaster_language)))) return res.status(400).json({ error: 'Use a nonempty title (up to 140 characters) and a valid language code.' });
    if (channelWrites.has(id)) return res.status(409).json({ error: 'A channel update is already in progress.' });
    channelWrites.add(id);
    const epoch = generation;
    try {
      await sectionJobs.get(`${id}:channel`);
      if (epoch !== generation || !capability(id).canEditChannel) return res.status(403).json({ error: 'Authorization changed.' });
      await api(`channels?broadcaster_id=${encodeURIComponent(target.userId)}`, body, 'PATCH');
      // The PATCH succeeded even if the subsequent public read is temporarily unavailable.
      try {
        const values = await readTwitchSection(api, target.userId, 'channel');
        if (epoch === generation && tokens) { spiders.importSection(id, 'channel', values); spiders.sectionState(id, 'channel', { attemptedAt: Date.now() }); broadcastRegistry(); }
        res.json({ ok: true });
      } catch {
        spiders.sectionState(id, 'channel', { status: 'error', attemptedAt: 0, error: 'Saved to Twitch. Refresh to reload channel data.' }); broadcastRegistry();
        res.json({ ok: true, warning: 'Saved to Twitch. Reload the section to refresh its data.' });
      }
    } catch { res.status(502).json({ error: 'Twitch could not confirm the update. Reload the channel before retrying.' }); }
    finally { channelWrites.delete(id); }
  });
  app.get('/api/kernels/:id/query', (req, res) => {
    const result = spiders.query(req.params.id, req.query.path, req.query.operation);
    res.status(result.status).json(result.error ? { error: result.error } : { output: result.output });
  });
  app.get('/api/spiders', (req, res) => res.json(spiderSnapshot()));
  app.post('/api/face', express.json({ limit: '1kb' }), (req, res) => {
    if (req.headers.origin !== origin || req.headers['x-csrf-token'] !== logoutCsrf) return res.sendStatus(403);
    if (!tokens || suspended || !broadcaster) return res.sendStatus(401);
    res.sendStatus(faceTracking.update(req.body, channelLogin));
  });
  app.get('/api/status', (req, res) => res.json(publicStatus()));
  app.get('/', (req, res) => res.type('html').send(startupPage({ ...publicStatus(), logoutCsrf })));
  app.use('/ui', express.static(join(ROOT, 'ui'), { dotfiles: 'deny' }));
  app.get('/overlay/', (req, res, next) => {
    if (req.query.demo === 'space') return next();
    res.sendFile(join(root, 'overlay/spiders.html'), error => { if (error) next(); });
  });
  app.use('/overlay', express.static(join(root, 'overlay'), { dotfiles: 'deny' }));
  app.post('/auth/logout', async (req, res) => {
    if (req.headers.origin !== origin || req.headers['x-csrf-token'] !== logoutCsrf) return res.status(403).send('Invalid logout request');
    if (loggingOut) return res.status(409).send('Logout in progress');
    loggingOut = true; generation++;
    tokens = null; profile = null; suspended = true; broadcaster = null;
    requests.abort(); requests = new AbortController();
    cancel(refreshTimer); cancel(queueTimer); disconnect();
    queue.length = 0; pending.clear(); seen.clear(); states.clear();
    detail = 'Logged out; connect Twitch to resume';
    try {
      await refreshJob?.catch(() => {});
      await tokenWrite.catch(() => {});
      await unlink(tokenFile).catch(error => { if (error.code !== 'ENOENT') throw error; });
      await unlink(`${tokenFile}.tmp`).catch(error => { if (error.code !== 'ENOENT') throw error; });
      detail = 'Logged out; connect Twitch to resume';
      res.setHeader('Set-Cookie', 'oauth_state=; HttpOnly; SameSite=Lax; Path=/auth; Max-Age=0');
      log('Logged out; local tokens removed'); res.json({ ok: true });
    } catch { detail = 'Disconnected; could not remove local tokens. Check file permissions before restarting.'; fail('Logout token cleanup'); res.status(500).json({ ok: false }); }
    finally { loggingOut = false; }
  });
  app.get('/auth/login', (req, res) => {
    if (loggingOut) return res.status(409).send('Logout in progress');
    const now = Date.now();
    for (const [state, expires] of states) if (expires.expires < now) states.delete(state);
    if (states.size >= 100) return res.status(429).send('Too many pending logins');
    const manage = req.query.manage === '1';
    if (manage && !tokens) return res.status(401).send('Connect Twitch first.');
    const state = randomBytes(32).toString('hex'); states.set(state, { expires: now + 600000, manage, userId: manage ? tokens.user_id : null });
    res.setHeader('Set-Cookie', `oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/auth; Max-Age=600`);
    res.redirect(`https://id.twitch.tv/oauth2/authorize?${new URLSearchParams({ response_type: 'code', client_id: config.TWITCH_CLIENT_ID, redirect_uri: redirect, scope: [...SCOPES, ...(manage ? [MANAGE_SCOPE] : [])].join(' '), state })}`);
  });
  app.get('/auth/callback', async (req, res) => {
    const state = req.query.state;
    const cookie = req.headers.cookie?.split(';').map(s => s.trim()).find(s => s.startsWith('oauth_state='))?.slice(12);
    const expires = typeof state === 'string' ? states.get(state) : null;
    if (!expires || expires.expires < Date.now() || cookie !== state) return res.status(400).send('Invalid or expired OAuth state');
    states.delete(state); res.setHeader('Set-Cookie', 'oauth_state=; HttpOnly; SameSite=Lax; Path=/auth; Max-Age=0');
    if (req.query.error || typeof req.query.code !== 'string') return res.status(400).send('Twitch authorization declined or missing code');
    if ((tokens && !expires.manage) || authBusy) return res.status(409).send('Already authorized; log out from stream setup to change accounts');
    authBusy = true;
    const previousTokens = tokens;
    const epoch = generation;
    try {
      const data = await exchange({ code: req.query.code, grant_type: 'authorization_code', redirect_uri: redirect });
      const identity = await validate(data.access_token);
      if (expires.manage && (!tokens || tokens.user_id !== expires.userId || identity.user_id !== expires.userId || !identity.scopes.includes(MANAGE_SCOPE))) return res.status(403).send('Authorize channel editing using the same Twitch account.');
      if (generation !== epoch || loggingOut || stopped) return res.status(409).send('Login cancelled');
      tokens = { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: Date.now() + identity.expires_in * 1000, user_id: identity.user_id, login: identity.login, scopes: identity.scopes };
      await save(); scheduleRefresh();
      await startEvents(); log('OAuth complete; tokens saved privately'); res.redirect('/');
    } catch (error) { if (generation === epoch && (!expires.manage || tokens !== previousTokens)) { if (tokens) handleAuthFailure(error, epoch); else invalidate(); } fail('OAuth connection'); res.status(502).send('Twitch connection failed. Check local configuration and visit /auth/login.'); }
    finally { authBusy = false; }
  });
  app.use((err, req, res, next) => { fail('HTTP request'); res.status(500).send('Request failed'); });
  async function maintenance() {
    if (!tokens || stopped) return;
    const epoch = generation;
    try {
      if (tokens.expires_at <= Date.now() + 60000) await refresh();
      const identity = await validate(tokens.access_token);
      if (!tokens || generation !== epoch) return;
      if (identity.user_id !== tokens.user_id) throw new Error('Identity changed');
      tokens.scopes = identity.scopes; tokens.expires_at = Date.now() + identity.expires_in * 1000; await save(); scheduleRefresh();
      if (active) detail = 'Subscribed to channel.chat.message';
      else if (!candidate && !suspended) await startEvents();
    } catch (error) {
      if (generation !== epoch) return;
      if (error.status === 401) { try { await refresh(); } catch (refreshError) { handleAuthFailure(refreshError, epoch); } }
      else handleAuthFailure(error, epoch);
    }
  }
  return {
    app, server,
    async start() {
      await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, 'localhost', () => { server.removeListener('error', reject); resolve(); }); });
      log(`Listening at ${origin}; overlay: ${origin}/overlay/?transparent=1&dev=0`);
      try {
        tokens = JSON.parse(await readFile(tokenFile, 'utf8'));
        await chmod(tokenFile, 0o600);
        if (!tokens.access_token || !tokens.refresh_token || !Number.isFinite(tokens.expires_at)) throw new Error('Invalid token file');
        if (tokens.expires_at <= Date.now() + 60000) await refresh();
        else {
          try { const identity = await validate(tokens.access_token); if (identity.user_id !== tokens.user_id) throw new Error('Identity changed'); tokens.scopes = identity.scopes; tokens.expires_at = Date.now() + identity.expires_in * 1000; await save(); }
          catch { await refresh(); }
        }
        scheduleRefresh(); await startEvents();
      } catch (error) { if (error.code !== 'ENOENT') { if (tokens) handleAuthFailure(error); else invalidate(); } else tokens = null; }
      const tick = () => { later(async () => { await maintenance(); tick(); }, 3600000); }; tick();
      return server;
    },
    async stop() {
      stopped = true; disconnect(); for (const timer of timers) clearTimeout(timer); timers.clear();
      for (const client of overlays.clients) client.terminate();
      overlays.close(); await new Promise(resolve => server.close(resolve));
    },
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  dotenv.config({ path: join(ROOT, '.env'), quiet: true });
  const config = process.env;
  const missing = ['TWITCH_CLIENT_ID', 'TWITCH_CLIENT_SECRET', 'TWITCH_CHANNEL'].filter(key => !config[key]?.trim());
  if (missing.length) { console.error(`Missing configuration: ${missing.join(', ')}. Fill .env locally using .env.example.`); process.exitCode = 1; }
  else {
    const service = createApp(config);
    service.start().catch(() => { console.error('Server startup failed. Check that the configured port is free.'); process.exitCode = 1; });
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { service.stop().then(() => process.exit(0)); });
  }
}
