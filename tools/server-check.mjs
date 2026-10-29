// Offline integration checks. Twitch HTTP and EventSub are simulated; /ws uses real sockets.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter, once } from 'node:events';
import { mkdtemp, readFile, stat, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { WebSocket } from 'ws';
import { createApp } from '../server.mjs';

async function until(check) { for (let i = 0; i < 200; i++) { if (check()) return; await delay(10); } assert.fail('Timed out'); }
const CHECK_PORT = process.env.CHECK_PORT || '3017';
const config = { PORT: CHECK_PORT, TWITCH_CLIENT_ID: 'offline-client', TWITCH_CLIENT_SECRET: 'offline-secret', TWITCH_CHANNEL: 'suign' };
class FakeSocket extends EventEmitter {
  static all = [];
  constructor(url) { super(); this.url = url; FakeSocket.all.push(this); }
  terminate() { if (!this.closed) { this.closed = true; this.emit('close'); } }
  close() { this.terminate(); }
  message(type, payload, id = crypto.randomUUID()) { this.emit('message', Buffer.from(JSON.stringify({ metadata: { message_type: type, message_id: id }, payload }))); }
  welcome() { this.message('session_welcome', { session: { id: 'session-id', keepalive_timeout_seconds: 10 } }); }
}

test('offline Twitch server integration', async t => {
  const root = await mkdtemp(join(tmpdir(), 'codex-me-check-'));
  await mkdir(join(root, 'overlay')); await writeFile(join(root, 'overlay/index.html'), '<h1>Offline overlay fixture</h1>');
  const calls = [], logs = [];
  let rejectOnce = false, dropped = false;
  const token = { access_token: 'offline-access', refresh_token: 'offline-refresh', expires_in: 3600 };
  const remote = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/oauth2/token')) return Response.json(token);
    if (url.endsWith('/oauth2/validate')) return Response.json({ client_id: config.TWITCH_CLIENT_ID, user_id: 'bot', login: 'demo_bot', scopes: ['user:read:chat', 'user:write:chat'], expires_in: 3600 });
    if (url.includes('/helix/users?id=bot')) return Response.json({ data: [{ id: 'bot', login: 'demo_bot', display_name: 'DemoBot', profile_image_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/offline.png', description: 'Offline bot profile', email: 'private@example.invalid' }] });
    if (url.includes('/helix/users?')) return Response.json({ data: [{ id: 'channel' }] });
    if (url.endsWith('/eventsub/subscriptions')) return Response.json({ data: [{ id: 'subscription' }] }, { status: 202 });
    if (url.endsWith('/chat/messages')) {
      if (rejectOnce) { rejectOnce = false; return Response.json({}, { status: 401 }); }
      return Response.json({ data: [{ is_sent: !dropped, ...(dropped ? { drop_reason: { code: 'automod_held' } } : {}) }] });
    }
    assert.fail(`Unexpected external endpoint: ${url}`);
  };
  const service = createApp(config, { root, fetch: remote, Socket: FakeSocket, logger: { log: m => logs.push(m) } });
  const clients = [];
  t.after(async () => { clients.forEach(c => c.terminate()); await service.stop(); await rm(root, { recursive: true, force: true }); });
  await service.start();
  const local = (path, options) => fetch(`http://localhost:${CHECK_PORT}${path}`, options);
  await t.test('unauthenticated status, static files and secret isolation', async () => {
    assert.deepEqual(await (await local('/healthz')).json(), { ok: true, authed: false, eventsub: 'down', overlays: 0 });
    assert.match(await (await local('/overlay/')).text(), /Offline overlay/);
    assert.equal((await local('/.tokens.json')).status, 404);
    assert.equal((await local('/.env')).status, 404);
    assert.ok(!(await (await local('/')).text()).includes(config.TWITCH_CLIENT_SECRET));
  });
  let cookie, state;
  await t.test('OAuth scopes, redirect, state, CSRF cookie and replay protection', async () => {
    const login = await local('/auth/login', { redirect: 'manual' });
    const url = new URL(login.headers.get('location'));
    assert.equal(url.origin + url.pathname, 'https://id.twitch.tv/oauth2/authorize');
    assert.equal(url.searchParams.get('scope'), 'user:read:chat user:write:chat');
    assert.equal(url.searchParams.get('redirect_uri'), `http://localhost:${CHECK_PORT}/auth/callback`);
    assert.ok(!url.toString().includes(config.TWITCH_CLIENT_SECRET));
    state = url.searchParams.get('state'); cookie = login.headers.get('set-cookie').split(';')[0];
    assert.equal((await local('/auth/callback?state=unknown&code=ignored')).status, 400);
    assert.equal((await local(`/auth/callback?state=${state}&code=ignored`)).status, 400);
    assert.equal((await local(`/auth/callback?state=${state}&code=offline-code`, { redirect: 'manual', headers: { cookie } })).status, 302);
    assert.equal((await local(`/auth/callback?state=${state}&code=offline-code`, { headers: { cookie } })).status, 400);
    assert.equal((await stat(join(root, '.tokens.json'))).mode & 0o777, 0o600);
    assert.deepEqual(Object.keys(JSON.parse(await readFile(join(root, '.tokens.json'), 'utf8'))).sort(), ['access_token', 'refresh_token', 'expires_at', 'user_id', 'login', 'scopes'].sort());
    const form = calls.find(c => c.url.endsWith('/token')).options.body;
    assert.equal(form.get('grant_type'), 'authorization_code');
  });
  const first = FakeSocket.all.at(-1);
  await t.test('welcome subscribes with exact WebSocket payload', async () => {
    first.welcome(); await until(() => calls.some(c => c.url.endsWith('/subscriptions')));
    assert.deepEqual(JSON.parse(calls.find(c => c.url.endsWith('/subscriptions')).options.body), { type: 'channel.chat.message', version: '1', condition: { broadcaster_user_id: 'channel', user_id: 'bot' }, transport: { method: 'websocket', session_id: 'session-id' } });
    await until(() => logs.some(l => l.includes('EventSub subscribed')));
    assert.equal((await (await local('/healthz')).json()).eventsub, 'connected');
    first.message('session_keepalive', {});
  });
  await t.test('Twitch profile belongs to the reply account and exposes only public fields', async () => {
    const status = await (await local('/api/status')).json();
    assert.deepEqual(status.profile, { id: 'bot', login: 'demo_bot', display_name: 'DemoBot', profile_image_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/offline.png', description: 'Offline bot profile' });
    assert.equal(status.channel, 'suign');
    assert.ok(!JSON.stringify(status).includes('private@example.invalid'));
    assert.ok(!JSON.stringify(status).includes('offline-access'));
  });
  await t.test('foreign WebSocket origins rejected', async () => {
    const bad = new WebSocket(`ws://localhost:${CHECK_PORT}/ws`, { origin: 'https://untrusted.example' });
    bad.on('error', () => {});
    const [, response] = await once(bad, 'unexpected-response'); assert.equal(response.statusCode, 403); response.resume(); bad.terminate();
  });
  const primary = new WebSocket(`ws://localhost:${CHECK_PORT}/ws`, { origin: `http://localhost:${CHECK_PORT}` });
  const preview = new WebSocket(`ws://localhost:${CHECK_PORT}/ws`); clients.push(primary, preview);
  await Promise.all([once(primary, 'open'), once(preview, 'open')]);
  primary.send(JSON.stringify({ type: 'hello', role: 'overlay', version: 1 })); await delay(20);
  preview.send(JSON.stringify({ type: 'hello', role: 'overlay', version: 1 }));
  primary.send('null'); primary.send('{bad json'); primary.send('42');
  first.emit('message', Buffer.from('null')); first.emit('message', Buffer.from('{bad json'));
  const received = [], previewMessages = [];
  primary.on('message', raw => received.push(JSON.parse(raw))); preview.on('message', raw => previewMessages.push(JSON.parse(raw)));
  const event = { broadcaster_user_id: 'channel', chatter_user_id: 'viewer', chatter_user_name: 'Viewer', message_id: 'chat-1', message: { text: '!walk oli left' }, badges: [{ set_id: 'moderator' }] };
  const notify = (e, id) => FakeSocket.all.at(-1).message('notification', { subscription: { type: 'channel.chat.message' }, event: e }, id);
  await t.test('exact overlay JSON, badges, duplicate and own-message filtering', async () => {
    notify(event, 'event-1'); notify(event, 'event-1');
    notify({ ...event, chatter_user_id: 'bot' }, 'event-self');
    notify({ ...event, message: { text: 'ordinary chat' } }, 'event-plain');
    await until(() => received.length === 1); await delay(30);
    assert.equal(received.length, 1); assert.equal(previewMessages.length, 1);
    assert.deepEqual(received[0], { type: 'chat', id: 'chat-1', user: 'Viewer', text: '!walk oli left', isMod: true, isBroadcaster: false });
  });
  const sent = () => calls.filter(c => c.url.endsWith('/chat/messages'));
  await t.test('only primary replies, parent ID, 401 refresh and single retry', async () => {
    preview.send(JSON.stringify({ type: 'reply', id: 'chat-1', text: 'Preview must stay silent' })); await delay(30); assert.equal(sent().length, 0);
    rejectOnce = true;
    primary.send(JSON.stringify({ type: 'reply', id: 'chat-1', text: 'Offline move reply' }));
    await until(() => sent().length === 2);
    assert.deepEqual(JSON.parse(sent()[0].options.body), { broadcaster_id: 'channel', sender_id: 'bot', message: 'Offline move reply', reply_parent_message_id: 'chat-1' });
    assert.equal(calls.filter(c => c.url.endsWith('/token') && c.options.body.get('grant_type') === 'refresh_token').length, 1);
    primary.send(JSON.stringify({ type: 'reply', id: 'chat-1', text: 'Duplicate' }));
    primary.send(JSON.stringify({ type: 'reply', id: 'forged', text: 'Unknown command' }));
    await delay(50); assert.equal(sent().length, 2);
  });
  await t.test('reply length validation, rate spacing and Twitch drops', async () => {
    notify({ ...event, message_id: 'chat-2' }, 'event-2'); await until(() => received.length === 2);
    primary.send(JSON.stringify({ type: 'reply', id: 'chat-2', text: 'x'.repeat(451) })); await delay(20); assert.equal(sent().length, 2);
    dropped = true;
    primary.send(JSON.stringify({ type: 'reply', id: 'chat-2', text: 'Second' }));
    await delay(100); assert.equal(sent().length, 2);
    await until(() => logs.some(l => l.includes('automod_held'))); assert.equal(sent().length, 3);
  });
  await t.test('reconnect migrates only after welcome without resubscribing', async () => {
    first.message('session_reconnect', { session: { reconnect_url: 'wss://eventsub.wss.twitch.tv/ws?reconnect=offline' } });
    const second = FakeSocket.all.at(-1); assert.notEqual(second, first); assert.ok(!first.closed);
    second.welcome(); await until(() => first.closed);
    assert.equal(calls.filter(c => c.url.endsWith('/subscriptions')).length, 1);
  });
  await t.test('primary disconnect promotes preview; revocation stops EventSub', async () => {
    primary.close(); await once(primary, 'close'); await delay(30);
    notify({ ...event, message_id: 'chat-3', chatter_user_id: 'channel', badges: [] }, 'event-3');
    await until(() => previewMessages.length === 3); assert.equal(previewMessages.at(-1).isBroadcaster, true);
    FakeSocket.all.at(-1).message('revocation', { subscription: { status: 'authorization_revoked' } });
    assert.equal((await (await local('/healthz')).json()).eventsub, 'down');
    assert.match(await (await local('/')).text(), /authorization_revoked/);
    assert.ok(logs.every(l => !l.includes(config.TWITCH_CLIENT_SECRET) && !l.includes(token.access_token) && !l.includes(token.refresh_token)));
  });
});

for (const mode of ['valid saved token', 'expired saved token', 'saved token rejected with 401', 'missing scopes']) {
  test(`startup: ${mode}`, async t => {
    const root = await mkdtemp(join(tmpdir(), 'codex-me-startup-'));
    await writeFile(join(root, '.tokens.json'), JSON.stringify({ access_token: 'saved-access', refresh_token: 'saved-refresh', expires_at: Date.now() + (mode === 'expired saved token' ? -1000 : 3600000), user_id: 'bot', login: 'demo_bot' }));
    let refreshes = 0, validations = 0;
    const remote = async (url, options) => {
      if (url.endsWith('/token')) { refreshes++; assert.equal(options.body.get('grant_type'), 'refresh_token'); return Response.json({ access_token: 'renewed', refresh_token: 'rotated', expires_in: 3600 }); }
      if (url.endsWith('/validate')) {
        validations++;
        if (mode === 'saved token rejected with 401' && validations === 1) return Response.json({}, { status: 401 });
        return Response.json({ client_id: config.TWITCH_CLIENT_ID, user_id: 'bot', login: 'demo_bot', scopes: mode === 'missing scopes' ? [] : ['user:read:chat', 'user:write:chat'], expires_in: 3600 });
      }
      if (url.includes('/users?')) return Response.json({ data: [{ id: 'channel' }] });
      assert.fail(`Unexpected endpoint ${url}`);
    };
    const service = createApp(config, { root, fetch: remote, Socket: FakeSocket, logger: { log() {} } });
    t.after(async () => { await service.stop(); await rm(root, { recursive: true, force: true }); });
    await service.start();
    const status = await (await fetch(`http://localhost:${CHECK_PORT}/healthz`)).json();
    assert.equal(status.authed, mode !== 'missing scopes');
    assert.equal(refreshes, mode === 'valid saved token' ? 0 : 1);
    assert.ok(validations >= 1);
    if (refreshes && mode !== 'missing scopes') {
      const saved = JSON.parse(await readFile(join(root, '.tokens.json'), 'utf8'));
      assert.equal(saved.refresh_token, 'rotated'); assert.ok(saved.expires_at > Date.now());
    }
  });
}

test('logout rejects CSRF, cancels refresh, deletes tokens and allows reconnect', async t => {
  const root = await mkdtemp(join(tmpdir(), 'codex-me-logout-'));
  await writeFile(join(root, '.tokens.json'), JSON.stringify({ access_token: 'saved', refresh_token: 'refresh', expires_at: Date.now() + 3600000, user_id: 'bot', login: 'demo_bot' }));
  let releaseRefresh, refreshStarted = false, chatAttempts = 0;
  const calls = [];
  const remote = async (url, options) => {
    calls.push(url);
    if (url.endsWith('/validate')) return Response.json({ client_id: config.TWITCH_CLIENT_ID, user_id: 'bot', login: 'demo_bot', scopes: ['user:read:chat', 'user:write:chat'], expires_in: 3600 });
    if (url.includes('/users?')) return Response.json({ data: [{ id: 'channel' }] });
    if (url.endsWith('/subscriptions')) return Response.json({ data: [{ id: 'subscription' }] });
    if (url.endsWith('/chat/messages')) { chatAttempts++; return Response.json({}, { status: 401 }); }
    if (url.endsWith('/token')) {
      refreshStarted = true;
      // Deliberately ignore AbortSignal: even a late response must not resurrect the session.
      return new Promise(resolve => { releaseRefresh = () => resolve(Response.json({ access_token: 'late-access', refresh_token: 'late-refresh', expires_in: 3600 })); });
    }
    assert.fail(`Unexpected endpoint ${url}`);
  };
  const service = createApp(config, { root, fetch: remote, Socket: FakeSocket, logger: { log() {} } });
  let client;
  t.after(async () => { releaseRefresh?.(); client?.terminate(); await service.stop(); await rm(root, { recursive: true, force: true }); });
  await service.start();
  const origin = `http://localhost:${CHECK_PORT}`;
  const page = await (await fetch(origin)).text();
  const initial = JSON.parse(page.match(/id="startup-status" type="application\/json">(.*?)<\/script>/s)[1]);
  const headers = { Origin: origin, 'X-CSRF-Token': initial.logoutCsrf };
  assert.equal((await fetch(`${origin}/auth/logout`)).status, 404);
  assert.equal((await fetch(`${origin}/auth/logout`, { method: 'POST' })).status, 403);
  assert.equal((await fetch(`${origin}/auth/logout`, { method: 'POST', headers: { ...headers, Origin: 'https://foreign.example' } })).status, 403);
  assert.equal((await (await fetch(`${origin}/healthz`)).json()).authed, true);
  const pendingLogin = await fetch(`${origin}/auth/login`, { redirect: 'manual' });
  const state = new URL(pendingLogin.headers.get('location')).searchParams.get('state');
  const cookie = pendingLogin.headers.get('set-cookie').split(';')[0];
  const socket = FakeSocket.all.at(-1); socket.welcome(); await delay(20);
  client = new WebSocket(`ws://localhost:${CHECK_PORT}/ws`); await once(client, 'open');
  client.send(JSON.stringify({ type: 'hello', role: 'overlay', version: 1 })); await delay(20);
  const next = once(client, 'message');
  socket.message('notification', { subscription: { type: 'channel.chat.message' }, event: { broadcaster_user_id: 'channel', chatter_user_id: 'viewer', chatter_user_name: 'Viewer', message_id: 'logout-chat', message: { text: '!walk oli left' }, badges: [] } });
  await next;
  client.send(JSON.stringify({ type: 'reply', id: 'logout-chat', text: 'Offline reply' }));
  await until(() => refreshStarted);
  const loggingOut = fetch(`${origin}/auth/logout`, { method: 'POST', headers });
  for (let i = 0; i < 100; i++) { if (!(await (await fetch(`${origin}/healthz`)).json()).authed) break; await delay(10); }
  assert.equal((await (await fetch(`${origin}/healthz`)).json()).authed, false);
  releaseRefresh();
  assert.equal((await loggingOut).status, 200);
  assert.equal(chatAttempts, 1); assert.ok(socket.closed);
  await assert.rejects(readFile(join(root, '.tokens.json')), { code: 'ENOENT' });
  await assert.rejects(readFile(join(root, '.tokens.json.tmp')), { code: 'ENOENT' });
  const status = await (await fetch(`${origin}/api/status`)).json();
  assert.equal(status.authed, false); assert.equal(status.eventsub, 'down'); assert.equal(status.login, null); assert.equal(status.profile, null); assert.match(status.detail, /Logged out/);
  assert.equal((await fetch(`${origin}/auth/callback?state=${state}&code=stale`, { headers: { cookie } })).status, 400);
  assert.equal((await fetch(`${origin}/auth/login`, { redirect: 'manual' })).status, 302);
  assert.ok(!calls.some(url => url.includes('/revoke')));
});

for (const failure of ['network', 503, 400]) {
  test(`refresh failure ${failure}: ${failure === 400 ? 'requires authorization' : 'retains session and retries'}`, async t => {
    const root = await mkdtemp(join(tmpdir(), 'codex-me-retry-'));
    await writeFile(join(root, '.tokens.json'), JSON.stringify({ access_token: 'expired', refresh_token: 'saved-refresh', expires_at: Date.now() - 1000, user_id: 'bot', login: 'demo_bot' }));
    let refreshes = 0;
    const logs = [], socketCount = FakeSocket.all.length;
    const remote = async url => {
      if (url.endsWith('/token')) {
        refreshes++;
        if (refreshes === 1) {
          if (failure === 'network') throw new TypeError('Offline fixture');
          return Response.json({}, { status: failure });
        }
        return Response.json({ access_token: 'recovered', refresh_token: 'rotated-refresh', expires_in: 3600 });
      }
      if (url.endsWith('/validate')) return Response.json({ client_id: config.TWITCH_CLIENT_ID, user_id: 'bot', login: 'demo_bot', scopes: ['user:read:chat', 'user:write:chat'], expires_in: 3600 });
      if (url.includes('/users?')) return Response.json({ data: [{ id: url.includes('id=bot') ? 'bot' : 'channel', login: 'demo_bot' }] });
      if (url.endsWith('/subscriptions')) return Response.json({ data: [{ id: 'recovered-subscription' }] });
      assert.fail(`Unexpected endpoint ${url}`);
    };
    const service = createApp(config, { root, fetch: remote, Socket: FakeSocket, authRetryMs: 25, logger: { log: message => logs.push(message) } });
    t.after(async () => { await service.stop(); await rm(root, { recursive: true, force: true }); });
    await service.start();
    const statusUrl = `http://localhost:${CHECK_PORT}/healthz`;
    assert.equal((await (await fetch(statusUrl)).json()).authed, failure !== 400);
    if (failure === 400) {
      await delay(80); assert.equal(refreshes, 1); assert.equal(FakeSocket.all.length, socketCount);
    } else {
      await until(() => FakeSocket.all.length > socketCount);
      FakeSocket.all.at(-1).welcome();
      await until(() => logs.some(message => message.includes('EventSub subscribed')));
      assert.equal((await (await fetch(statusUrl)).json()).eventsub, 'connected');
      assert.equal(refreshes, 2);
      assert.equal(JSON.parse(await readFile(join(root, '.tokens.json'), 'utf8')).access_token, 'recovered');
      assert.ok(!logs.some(message => message.includes('Authorization failed')));
    }
  });
}
