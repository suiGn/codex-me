// Browser proof of the real server + unchanged overlay. Twitch is simulated, explicitly offline.
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtemp, symlink, rm, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createApp } from '../server.mjs';
const repo = fileURLToPath(new URL('../', import.meta.url));
const root = await mkdtemp(join(tmpdir(), 'codex-me-browser-'));
await symlink(join(repo, 'overlay'), join(root, 'overlay'));
const evidence = join(repo, 'evidence'); await mkdir(evidence, { recursive: true });
let socket, browser;
const sent = [], logs = [];
class FakeSocket extends EventEmitter {
  constructor() { super(); socket = this; setTimeout(() => this.emit('message', JSON.stringify({ metadata: { message_type: 'session_welcome' }, payload: { session: { id: 'offline-session', keepalive_timeout_seconds: 600 } } })), 10); }
  terminate() { this.emit('close'); } close() { this.terminate(); }
}
const remote = async (url, options) => {
  if (url.endsWith('/token')) return Response.json({ access_token: 'offline', refresh_token: 'offline-refresh', expires_in: 3600 });
  if (url.endsWith('/validate')) return Response.json({ client_id: 'offline', user_id: 'offline-bot', login: 'offline_bot', scopes: ['user:read:chat', 'user:write:chat'], expires_in: 3600 });
  if (url.includes('/users?')) return Response.json({ data: [{ id: 'offline-channel' }] });
  if (url.endsWith('/subscriptions')) return Response.json({ data: [{ id: 'offline-subscription' }] });
  if (url.endsWith('/chat/messages')) { sent.push(JSON.parse(options.body)); return Response.json({ data: [{ is_sent: true, message_id: 'offline-reply' }] }); }
  throw new Error('Unexpected remote URL');
};
const service = createApp({ PORT: '3017', TWITCH_CLIENT_ID: 'offline', TWITCH_CLIENT_SECRET: 'offline', TWITCH_CHANNEL: 'offline' }, { root, fetch: remote, Socket: FakeSocket, logger: { log: m => logs.push(m) } });
try {
  await service.start();
  const login = await fetch('http://localhost:3017/auth/login', { redirect: 'manual' });
  const state = new URL(login.headers.get('location')).searchParams.get('state');
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const callback = await fetch(`http://localhost:3017/auth/callback?state=${state}&code=offline`, { redirect: 'manual', headers: { cookie } }); assert.equal(callback.status, 302);
  browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:3017/overlay/?clock=manual&dev=0');
  await page.waitForFunction(() => window.codex && /connected/.test(document.getElementById('ws-status')?.textContent || ''));
  const before = await page.evaluate(() => window.codex.snapshot());
  await page.screenshot({ path: join(evidence, 'offline-before.png') });
  socket.emit('message', JSON.stringify({ metadata: { message_type: 'notification', message_id: 'offline-event-1' }, payload: { subscription: { type: 'channel.chat.message' }, event: { broadcaster_user_id: 'offline-channel', chatter_user_id: 'offline-viewer', chatter_user_name: 'OfflineViewer', message_id: 'offline-chat-1', message: { text: '!walk oli left' }, badges: [] } } }));
  await page.waitForFunction(() => window.codex.sim.w.robots[0].dir === -1);
  await page.evaluate(() => window.codex.advance(20));
  const after = await page.evaluate(() => window.codex.snapshot());
  assert.notEqual(after.robots[0].pos, before.robots[0].pos);
  for (let i = 0; i < 100 && !sent.length; i++) await new Promise(r => setTimeout(r, 20));
  assert.equal(sent.length, 1); assert.equal(sent[0].reply_parent_message_id, 'offline-chat-1');
  assert.match(sent[0].message, /because/); assert.deepEqual(errors, []);
  await page.screenshot({ path: join(evidence, 'offline-after.png') });
  const result = { mode: 'OFFLINE — simulated Twitch, real server and unchanged browser overlay', session_id: '01a17f67-001b-7681-bb9f-ecc477f091a5', command: '!walk oli left', before: before.robots[0], after: after.robots[0], reply: sent[0], browser_errors: errors, server_log: logs };
  await writeFile(join(evidence, 'offline-browser.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ mode: result.mode, before_pos: before.robots[0].pos, after_pos: after.robots[0].pos, reply: sent[0].message, browser_errors: errors }, null, 2));
} finally { await browser?.close(); await service.stop(); await rm(root, { recursive: true, force: true }); }
