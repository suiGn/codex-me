// Offline proof: real pinned kernels, real HTTP/ws/browser; Twitch is simulated.
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtemp, symlink, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createSpiders } from '../lib/spiders.mjs';
import { createApp } from '../server.mjs';
let clock = 1000;
const registry = createSpiders({ now: () => clock });
const command = (userId, user, text = '!spider') => registry.handle({ userId, user, text });
assert.equal(command('a', 'Alice').changed, true);
clock += 4000;
assert.equal(command('a', 'ALICE').changed, false);
assert.equal(registry.snapshot().length, 1);
clock += 4000;
assert.equal(command('a', 'renamed_alice').changed, false); // stable Twitch ID, even after a login rename
assert.equal(command('b', 'Bob').changed, true);
assert.equal(registry.snapshot().length, 2);
assert.equal(registry.snapshot()[0].owner, 'alice');
assert.equal(registry.snapshot()[1].owner, 'bob');
assert.match(registry.snapshot()[0].reason, /spider.created = true because registered \[registered=true\]/);
clock += 4000;
assert.match(command('a', 'Alice', '!explain').reply, /because registered/);
assert.equal(command('c', 'bad<script>').changed, false); // invalid identity cannot create
assert.equal(registry.snapshot().length, 2);
assert.equal(command('c', 'Carol', '!spider Alice'), null);
assert.equal(command('c', 'Carol', '!walk oli left'), null);
const root = await mkdtemp(join(tmpdir(), 'codex-spiders-'));
const repo = fileURLToPath(new URL('../', import.meta.url));
await symlink(join(repo, 'overlay'), join(root, 'overlay'));
await writeFile(join(root, '.tokens.json'), JSON.stringify({ access_token: 'offline', refresh_token: 'offline-refresh', user_id: 'bot', login: 'offlinebot', expires_at: Date.now() + 3600000 }));
let socket, browser;
const sent = [], errors = [];
class FakeSocket extends EventEmitter {
 constructor() { super(); socket = this; setTimeout(() => this.emit('message', JSON.stringify({ metadata: { message_type: 'session_welcome' }, payload: { session: { id: 'offline', keepalive_timeout_seconds: 600 } } })), 10); }
 terminate() { this.emit('close'); } close() { this.terminate(); }
}
const remote = async (url, options) => {
 if (url.endsWith('/validate')) return Response.json({ client_id: 'offline', user_id: 'bot', login: 'offlinebot', scopes: ['user:read:chat', 'user:write:chat'], expires_in: 3600 });
 if (url.includes('/users?')) return Response.json({ data: [{ id: 'channel' }] });
 if (url.endsWith('/subscriptions')) return Response.json({ data: [{ id: 'subscription' }] });
 if (url.endsWith('/chat/messages')) { sent.push(JSON.parse(options.body)); return Response.json({ data: [{ is_sent: true }] }); }
 throw Error('Unexpected offline request');
};
const port = process.env.CHECK_PORT || '3018', origin = `http://localhost:${port}`;
const service = createApp({ PORT: port, TWITCH_CLIENT_ID: 'offline', TWITCH_CLIENT_SECRET: 'offline', TWITCH_CHANNEL: 'offline' }, { root, fetch: remote, Socket: FakeSocket, logger: { log() {} } });
const until = async fn => { for (let i=0;i<300;i++) { if (fn()) return; await new Promise(r=>setTimeout(r,20)); } assert.fail('Timed out'); };
const notify = (userId, user, id, text = '!spider') => socket.emit('message', JSON.stringify({ metadata: { message_type: 'notification', message_id: id }, payload: { subscription: { type: 'channel.chat.message' }, event: { broadcaster_user_id: 'channel', chatter_user_id: userId, chatter_user_login: user, chatter_user_name: user, message_id: id, message: { text }, badges: [] } } }));
try {
 await service.start(); await until(()=>socket);
 browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
 const web = await browser.newPage({ viewport: { width: 1920, height: 1080 } }), obs = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
 for (const page of [web,obs]) page.on('pageerror', e=>errors.push(e.message));
 await web.goto(origin+'/overlay/?dev=0'); await obs.goto(origin+'/overlay/?transparent=1&dev=0');
 await web.waitForFunction(()=>document.body.textContent.includes('0 .me · 0 Spiders · connected'));
 assert.equal(await web.locator('[data-spider-id]').count(),0);
 notify('alice-id','alice','chat-alice'); notify('alice-id','alice','chat-alice');
 await web.waitForSelector('[data-spider-id="spider-1"]'); await obs.waitForSelector('[data-spider-id="spider-1"]');
 notify('bob-id','bob','chat-bob');
 await web.waitForSelector('[data-spider-id="spider-2"]'); await obs.waitForSelector('[data-spider-id="spider-2"]');
 await until(()=>sent.length===2);
 assert.equal(sent[0].reply_parent_message_id,'chat-alice'); assert.match(sent[0].message,/because registered/);
 assert.equal(sent[1].reply_parent_message_id,'chat-bob');
 await web.reload(); await web.waitForSelector('[data-spider-id="spider-2"]');
 assert.equal(await web.locator('[data-spider-id]').count(),2);
 await web.locator('[data-spider-id="spider-1"]').click();
 assert.match(await web.locator('aside').innerText(),/@alice/);
 assert.match(await web.locator('aside').innerText(),/me.identity.owner\("alice"\)/);
 assert.equal(await obs.locator('header,aside,footer').count(),0);
 const size=await obs.locator('#spiders-scene').boundingBox(); assert.equal(size.width,1920);assert.equal(size.height,1080);
 assert.equal(await obs.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');
 notify('charlie-id','charlie','chat-presence','!me');
 await web.waitForSelector('[data-me-id="spider-3"]'); await obs.waitForSelector('[data-me-id="spider-3"]');
 assert.equal(await web.locator('[data-spider-id]').count(),2);
 await new Promise(resolve=>setTimeout(resolve,3100));
 notify('charlie-id','charlie','chat-attach','!me me.spider.registered(true)');
 await web.waitForSelector('[data-spider-id="spider-3"]'); await obs.waitForSelector('[data-spider-id="spider-3"]');
 notify('charlie-id','charlie','chat-read','!me me("identity.owner")');
 await until(()=>sent.length===5);
 assert.match(sent[4].message,/identity.owner = "charlie"/);
 assert.equal(await web.locator('.me-visual').count(),3);
 const api=await (await fetch(origin+'/api/spiders')).json();assert.equal(api.spiders.length,3);assert.equal(api.mes.length,3);
 assert.deepEqual(errors,[]);
 await mkdir(join(repo,'evidence/spiders'),{recursive:true});
 await web.screenshot({path:join(repo,'evidence/spiders/offline-web.png')});
 await obs.screenshot({path:join(repo,'evidence/spiders/offline-obs.png'),omitBackground:true});
 const result={mode:'OFFLINE — simulated Twitch, real server/ws/browser and vendored this.me 4.2.1',checks:['one Spider per stable Twitch user ID','independent creator facts and real kernel explanation','invalid identities and arbitrary creation arguments rejected','duplicate EventSub event creates/replies once','two synchronized views','reload retains server-owned Spiders','creator script in inspector','transparent OBS without chrome','threaded Twitch replies through simulated Send Chat Message','explicit presence renders a native GUI bubble before body attachment','attach keeps the same kernel ID and synchronizes both views','chat syntax reads only the sender kernel'],spiders:api.spiders,sent,errors};
 await writeFile(join(repo,'evidence/spiders/result.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({checks:result.checks,spiders:api.spiders.length,replies:sent.length,errors},null,2));
} finally { await browser?.close();await service.stop();await rm(root,{recursive:true,force:true}); }
