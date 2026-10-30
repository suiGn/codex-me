// OFFLINE: real kernel/parser/server/browser/WebSocket, simulated Twitch only.
import assert from 'node:assert/strict';
import { createSpiders, parseMeChat } from '../lib/spiders.mjs';
import { createPresentation } from '../lib/presentation.mjs';
import { createApp } from '../server.mjs';
import { EventEmitter } from 'node:events';
import { mkdtemp, writeFile, readFile, symlink, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
const user = (id, login = id) => ({ id, login, display_name: login.toUpperCase() });
let time = 1000;
const registry = createSpiders({ kernelOnly: true, now: () => time });
registry.ensure({ userId: 'a', user: 'a', profile: user('a') });registry.ensure({ userId: 'b', user: 'b', profile: user('b') });
const send = text => { time += 4000; return registry.handle({ userId: 'a', user: 'a', text }); };
assert.equal(registry.query('kernel-1','active','run').output,true);
assert.equal(send('!me set energy 20').changed,true);
assert.equal(registry.query('kernel-1','active','run').output,false);
assert.equal(registry.query('kernel-2','energy','run').output,100);
assert.equal(registry.handle({userId:'a',user:'a',text:'!me set energy 50'}).reply,null);
assert.equal(send('!me rule active threshold 10').changed,true);
assert.equal(registry.query('kernel-1','active','run').output,true);
send('!me off');assert.equal(registry.query('kernel-1','active','run').output,false);
send('!me on');send('!me rule active and enabled face.present');
assert.equal(registry.query('kernel-1','active','run').output,false);
registry.updateFace({x:.3,y:.4});assert.equal(registry.query('kernel-1','active','run').output,true);
assert.equal(registry.query('kernel-2','face.x','run').output,.3);
registry.updateFace(null);assert.equal(registry.query('kernel-1','active','run').output,false);
time+=31000;send('!me rule active compare energy <= 20');assert.equal(registry.query('kernel-1','active','run').output,true);
for (const text of ['!me set face.present true','!me set face.x 1','!me set twitch.profile.id forged','!me set energy 101','!me set energy -1','!me rule active compare face.x > 2','!me rule active "true"','!me rule active compare energy > 1;alert(1)','!me rule active and enabled constructor','!me rule other threshold 30']) assert.equal(parseMeChat(text).kind,'invalid',text);
for(let i=0;i<700;i++)registry.updateFace({x:(i%100)/100,y:.5});
registry.updateFace(null);
assert.equal(registry.query('kernel-1','energy','run').output,20);
assert.equal(registry.presences()[0].graph.nodes.filter(n=>n.path==='active').length,1);
const trace=registry.query('kernel-1','active','explain').output;assert.equal(trace.expr,'enabled && energy <= 20');assert.ok(trace.derivation.inputs.some(i=>i.path==='energy'&&i.value===20));
const presentation=createPresentation(registry,{now:()=>time});
assert.equal(presentation.select({id:'kernel-1',path:'active',operation:'explain'},'chat'),204);
assert.deepEqual(presentation.frame().view.rows[0].explain,trace);
assert.equal(presentation.select({id:'kernel-2',path:'active',operation:'explain'},'chat'),429);
time+=16000;assert.equal(presentation.frame().view,null);
assert.equal(presentation.select({id:'kernel-1',path:'missing',operation:'run'}),404);
const repo=new URL('../',import.meta.url).pathname,root=await mkdtemp(join(tmpdir(),'codex-live-graph-'));await symlink(join(repo,'overlay'),join(root,'overlay'),'dir');
await writeFile(join(root,'.tokens.json'),JSON.stringify({access_token:'offline',refresh_token:'offline',expires_at:Date.now()+3600000,user_id:'channel',login:'suignn'}));
let upstream;const posted=[];
class FakeSocket extends EventEmitter { constructor(){super();upstream=this;queueMicrotask(()=>this.emit('message',JSON.stringify({metadata:{message_type:'session_welcome'},payload:{session:{id:'offline',keepalive_timeout_seconds:60}}})));}close(){this.emit('close');}terminate(){this.close();} }
const remote=async(url,options={})=>{
 if(url.endsWith('/validate'))return Response.json({client_id:'offline',user_id:'channel',login:'suignn',scopes:['user:read:chat','user:write:chat'],expires_in:3600});
 if(url.includes('/users?')){const id=new URL(url).searchParams.get('id');return Response.json({data:[user(id||'channel',id==='viewer'?'viewer':'suignn')]});}
 if(url.includes('/streams?'))return Response.json({data:[]});
 if(url.endsWith('/subscriptions'))return Response.json({data:[{id:'offline'}]});
 if(url.endsWith('/chat/messages')){posted.push(JSON.parse(options.body));return Response.json({data:[{is_sent:true}]});}
 throw Error('Unexpected Twitch request');
};
const port=process.env.CHECK_PORT||'3018',origin=`http://localhost:${port}`;
const service=createApp({PORT:port,TWITCH_CLIENT_ID:'offline',TWITCH_CLIENT_SECRET:'offline',TWITCH_CHANNEL:'suignn'},{root,fetch:remote,Socket:FakeSocket,logger:{log(){}}});let browser;
try{
 await service.start(); console.log('Offline server ready');
 const status=await(await fetch(origin+'/api/presentation')).json();assert.equal(status.canPresent,true);assert.ok(status.csrf);
 assert.equal((await fetch(origin+'/api/presentation',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({visible:false})})).status,403);
 assert.equal((await fetch(origin+'/api/presentation',{method:'POST',headers:{Origin:'http://evil.invalid','X-CSRF-Token':status.csrf,'Content-Type':'application/json'},body:JSON.stringify({visible:false})})).status,403);
 browser=await chromium.launch(process.env.CHROME?{executablePath:process.env.CHROME}:{});
 const context=await browser.newContext({viewport:{width:1280,height:960}});
 for(const[url,path]of[['react@18.3.1/umd/react.production.min.js','react/umd/react.production.min.js'],['react-dom@18.3.1/umd/react-dom.production.min.js','react-dom/umd/react-dom.production.min.js'],['this.gui@4.2.1/dist/this.gui.umd.js','this.gui/dist/this.gui.umd.js']]){const body=await readFile(join(repo,'node_modules',path));await context.route('https://cdn.jsdelivr.net/npm/'+url,r=>r.fulfill({contentType:'text/javascript',body}));}
 await context.route('https://player.twitch.tv/**',r=>r.fulfill({contentType:'text/html',body:'<p>Offline Twitch video fixture</p>'}));
 await context.route('https://www.twitch.tv/embed/**',r=>r.fulfill({contentType:'text/html',body:'Offline Twitch chat'}));
 const web=await context.newPage(),obs=await context.newPage(),errors=[];
 for(const page of[web,obs]){page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));}
 await web.goto(origin+'/overlay/?dev=0');await obs.goto(origin+'/overlay/?transparent=1&dev=0');
 await web.locator('[data-me-bubble="kernel-1"]').click();
 const card=web.locator('[data-bubble-navigation]');
 await card.getByText('Offline',{exact:true}).waitFor();
 assert.deepEqual(await card.getByRole('tab').allTextContents(),['Stream','Channel','Followers']);
 assert.equal(await card.locator('[data-kernel-console],[data-live-path]').count(),0);
 const player=web.locator('iframe[title="suignn Twitch live video"]');await player.waitFor();
 const url=new URL(await player.getAttribute('src'));assert.equal(url.origin,'https://player.twitch.tv');assert.equal(url.searchParams.get('channel'),'suignn');assert.equal(url.searchParams.get('parent'),'localhost');assert.equal(url.searchParams.get('muted'),'true');
 const videoBounds=await player.boundingBox(),sceneBounds=await web.locator('#kernels-scene').boundingBox();assert.ok(videoBounds.height>=300&&videoBounds.width>=400);assert.ok(sceneBounds.y>=videoBounds.y+videoBounds.height-1);
 assert.equal(await obs.locator('iframe').count(),0);
 await obs.locator('[data-presentation-path="twitch.stream"]').waitFor();
 await obs.getByText('Offline',{exact:true}).waitFor();
 assert.deepEqual(await obs.getByRole('tab').allTextContents(),['Stream','Channel','Followers']);
 await card.getByRole('button',{name:'Inspect profile display name',exact:true}).click();
 await obs.locator('[data-presentation-path="twitch.profile.displayName"]').waitFor();
 assert.equal(await obs.getByRole('button',{name:'Inspect profile display name',exact:true}).innerText(),'SUIGNN');
 await web.getByRole('button',{name:'Close bubble navigation',exact:true}).click();await obs.waitForFunction(()=>!document.querySelector('[data-stream-presentation]'));
 const notify=text=>upstream.emit('message',JSON.stringify({metadata:{message_type:'notification',message_id:crypto.randomUUID()},payload:{subscription:{type:'channel.chat.message'},event:{broadcaster_user_id:'channel',chatter_user_id:'viewer',chatter_user_login:'viewer',chatter_user_name:'Viewer',message_id:crypto.randomUUID(),message:{text},badges:[]}}}));
 await web.waitForTimeout(3200);notify('!me');await web.locator('[data-me-bubble="kernel-2"]').waitFor();
 await obs.locator('[data-stream-presentation="kernel-2"]').waitFor();
 await web.waitForTimeout(3200);notify('!me set energy 20');
 await obs.waitForFunction(()=>document.querySelector('[data-presented-value="active"]')?.textContent==='false');
 assert.equal(await obs.locator('[data-me-bubble="kernel-2"]').getAttribute('data-active'),'false');
 assert.match(await obs.locator('[data-presented-explain="active"]').innerText(),/energy=20/);
 assert.equal((await(await fetch(origin+'/api/kernels/kernel-1/query?path=energy&operation=run')).json()).output,100);
 await web.waitForTimeout(2200);notify('!me explain active');await obs.locator('[data-presented-explain="active"]').waitFor();
 const frame=(await(await fetch(origin+'/api/presentation')).json()).view;assert.equal(frame.id,'kernel-2');assert.equal(frame.rows[0].explain.expr,'enabled && energy > 30');
 assert.ok(posted.some(p=>p.message.includes('energy=20')));assert.deepEqual(errors,[]);
 await mkdir(join(repo,'evidence/live-graph'),{recursive:true});await obs.screenshot({path:join(repo,'evidence/live-graph/chat-explain.png')});
 await writeFile(join(repo,'evidence/live-graph/result.json'),JSON.stringify({mode:'OFFLINE: simulated Twitch; real kernel, server, browser and WS',checks:['original bubble card has only profile and Stream/Channel/Followers; code stays in inspector','official video exists only in web view with channel/parent/muted and unobscured400x300 minimum','host selection and close synchronize to separate OBS view','chat declares, sets energy, changes active and publishes native explanation','isolated user kernels','templated rules only; face facts read-only','per-user and global presentation limits','Origin/CSRF host checks','face state feeds rules; loss clears presence','no real Twitch writes'],errors},null,2)+'\n');
 console.log('PASS: host/OBS presentation, safe chat rules, native explain, isolation and face inputs (offline).');
}finally{await browser?.close();await service.stop();await rm(root,{recursive:true,force:true});}
