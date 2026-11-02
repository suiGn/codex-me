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
const user = (id, login = id) => ({ id, login, display_name: login.toUpperCase(), ...(id === 'viewer' ? { profile_image_url: 'https://static-cdn.jtvnw.net/test-avatar.png' } : {}) });
let time = 1000;
const registry = createSpiders({ kernelOnly: true, faceOwnerId: 'a', now: () => time });
registry.ensure({ userId: 'a', user: 'a', profile: user('a') });registry.ensure({ userId: 'b', user: 'b', profile: user('b') });
const send = text => { time += 4000; return registry.handle({ userId: 'a', user: 'a', text }); };
for(const kernel of registry.presences()) {
 assert.deepEqual([...new Set(kernel.graph.nodes.map(n=>n.path.split('.')[0]))].sort(),kernel.id==='kernel-1'?['face','stream','twitch']:['twitch']);
 for(const path of ['enabled','energy','active'])assert.equal(registry.query(kernel.id,path,'run').status,404);
}
registry.updateFace({x:.2,y:.4});assert.equal(registry.query('kernel-1','stream.focus','run').output,false);
registry.updateFace({x:.5,y:.4});assert.equal(registry.query('kernel-1','stream.focus','run').output,true);
assert.equal(registry.query('kernel-2','face.x','run').status,404);assert.equal(registry.query('kernel-2','stream.focus','run').status,404);
assert.equal(registry.query('kernel-1','twitch.profile.login','run').output,'a');assert.equal(registry.query('kernel-2','twitch.profile.login','run').output,'b');
assert.match(send('!me explain stream.focus').reply,/face.x=0.5/);assert.equal(registry.handle({userId:'a',user:'a',text:'!explain'}).reply,null);
assert.equal(send('!explain').presentation.path,'stream.focus');
for(const text of ['!me on','!me off','!me set energy 20','!me set enabled true','!me rule active threshold 30','!me set face.x 1','!me set stream.focus true','!me set twitch.profile.id forged','!me rule stream.focus "true"'])assert.equal(parseMeChat(text).kind,'invalid',text);
for(let i=0;i<700;i++)registry.updateFace({x:(i%100)/100,y:.5});
registry.updateFace({x:.5,y:.5});const trace=registry.query('kernel-1','stream.focus','explain').output;assert.equal(trace.expr,'face.x > 0.4 && face.x < 0.6');assert.ok(trace.derivation.inputs.some(i=>i.path==='face.x'&&i.value===.5));
const presentation=createPresentation(registry,{now:()=>time});
assert.equal(presentation.select({id:'kernel-1',path:'stream.focus',operation:'explain'},'chat'),204);
assert.deepEqual(presentation.frame().view.rows[0].explain,trace);
assert.equal(presentation.select({id:'kernel-2',path:'twitch.profile.login',operation:'explain'},'chat'),429);
time+=16000;assert.equal(presentation.frame().view,null);
assert.equal(presentation.select({id:'kernel-1',path:'missing',operation:'run'}),404);
const repo=new URL('../',import.meta.url).pathname,root=await mkdtemp(join(tmpdir(),'codex-live-graph-'));await symlink(join(repo,'overlay'),join(root,'overlay'),'dir');
await writeFile(join(root,'.tokens.json'),JSON.stringify({access_token:'offline',refresh_token:'offline',expires_at:Date.now()+3600000,user_id:'channel',login:'suignn'}));
let upstream;const posted=[];
class FakeSocket extends EventEmitter { constructor(){super();upstream=this;queueMicrotask(()=>this.emit('message',JSON.stringify({metadata:{message_type:'session_welcome'},payload:{session:{id:'offline',keepalive_timeout_seconds:60}}})));}close(){this.emit('close');}terminate(){this.close();} }
const remote=async(url,options={})=>{
 if(url.endsWith('/validate'))return Response.json({client_id:'offline',user_id:'channel',login:'suignn',scopes:['user:read:chat','user:write:chat'],expires_in:3600});
 if(url.includes('/users?')){const id=new URL(url).searchParams.get('id');return Response.json({data:[user(id||'channel',id && id!=='channel'?id:'suignn')]});}
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
 await context.route('https://static-cdn.jtvnw.net/test-avatar.png',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="#9146ff"/></svg>'}));
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
 const face=async value=>{const send=()=>fetch(origin+'/api/face',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-CSRF-Token':status.csrf},body:JSON.stringify(value)});let response=await send();if(response.status===429){await web.waitForTimeout(110);response=await send();}assert.equal(response.status,204);};
 await web.waitForTimeout(3200);await face({x:.5,y:.5,aspect:4/3});notify('!me');await web.locator('[data-me-bubble="kernel-2"]').waitFor();
 await obs.locator('[data-stream-presentation="kernel-2"]').waitFor();
 const viewerBubble=obs.locator('[data-me-bubble="kernel-2"]');assert.equal(await viewerBubble.getAttribute('data-focus'),null);assert.equal(await viewerBubble.getAttribute('data-face-follow'),null);assert.equal(await viewerBubble.locator('[data-focus-label]').count(),0);
 const viewer=(await(await fetch(origin+'/api/kernels')).json()).kernels.find(k=>k.id==='kernel-2');assert.deepEqual([...new Set(viewer.graph.nodes.map(n=>n.path.split('.')[0]))],['twitch']);
 assert.equal((await fetch(origin+'/api/kernels/kernel-2/query?path=face.x&operation=run')).status,404);assert.equal((await fetch(origin+'/api/kernels/kernel-2/query?path=stream.focus&operation=explain')).status,404);
 notify('!me explain stream.focus');await web.waitForTimeout(1100);notify('!explain');
 const until=Date.now()+3000;while(!posted.some(p=>p.message.includes('Path not available in your kernel: stream.focus'))&&Date.now()<until)await web.waitForTimeout(100);
 assert.ok(posted.some(p=>p.message.includes('Path not available in your kernel: stream.focus')));
 const host=await fetch(origin+'/api/presentation',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-CSRF-Token':status.csrf},body:JSON.stringify({id:'kernel-1',path:'stream.focus',operation:'explain'})});assert.equal(host.status,204);
 await face({x:.5,y:.5,aspect:4/3});await obs.waitForFunction(()=>document.querySelector('[data-stream-presentation="kernel-1"] [data-presented-value="stream.focus"]')?.textContent==='true');
 await face({x:.2,y:.5,aspect:4/3});await obs.waitForFunction(()=>document.querySelector('[data-presented-value="stream.focus"]')?.textContent==='false');
 await face({x:.5,y:.5,aspect:4/3});await obs.waitForFunction(()=>document.querySelector('[data-presented-value="stream.focus"]')?.textContent==='true');
 assert.equal(await viewerBubble.getAttribute('data-focus'),null);assert.equal(await viewerBubble.getAttribute('data-face-follow'),null);assert.equal((await fetch(origin+'/api/kernels/kernel-1/query?path=energy&operation=run')).status,404);assert.deepEqual(errors,[]);
 await mkdir(join(repo,'evidence/live-graph'),{recursive:true});await obs.screenshot({path:join(repo,'evidence/live-graph/chat-explain.png')});
 await face({x:null,y:null});await obs.waitForFunction(()=>document.querySelector('[data-presented-value="stream.focus"]')?.textContent==='undefined');
 await web.locator('[data-viewer-row="kernel-2"]').click();
 const viewerCard=web.locator('[data-bubble-navigation="kernel-2"]');await viewerCard.locator('[data-twitch-profile="kernel-2"]').waitFor();
 assert.equal(await viewerCard.getByRole('button',{name:'Inspect profile display name',exact:true}).innerText(),'VIEWER');
 assert.equal(await web.getByRole('button',{name:'Twitch',exact:true}).getAttribute('aria-pressed'),'true');
 await viewerCard.getByRole('button',{name:'Close bubble navigation',exact:true}).click();
 const joinParticipant=id=>upstream.emit('message',JSON.stringify({metadata:{message_type:'notification',message_id:crypto.randomUUID()},payload:{subscription:{type:'channel.chat.message'},event:{broadcaster_user_id:'channel',chatter_user_id:id,chatter_user_login:id,chatter_user_name:id,message_id:crypto.randomUUID(),message:{text:'!me'},badges:[]}}}));
 for(let i=2;i<=8;i++)joinParticipant('viewer'+i);
 await obs.waitForFunction(()=>document.querySelector('[data-viewer-overflow]')?.textContent==='+2 more');
 assert.equal(await web.locator('[data-viewer-row]').count(),6);assert.equal(await obs.locator('[data-viewer-row]').count(),6);
 assert.equal(await obs.locator('[data-viewer-rail] [data-me-bubble="kernel-1"]').count(),0);
 assert.equal(await obs.locator('[data-viewer-rail] [data-focus-label],[data-viewer-rail] [data-face-follow]').count(),0);
 assert.equal(await obs.locator('[data-viewer-row="kernel-2"] img').getAttribute('src'),'https://static-cdn.jtvnw.net/test-avatar.png');
 assert.equal(await obs.locator('[data-viewer-orb]').count(),6);
 assert.equal(await web.locator('[data-viewer-row="kernel-2"]').evaluate(el=>el.tagName),'BUTTON');assert.equal(await obs.locator('[data-viewer-row="kernel-2"]').evaluate(el=>el.tagName),'DIV');assert.equal(await obs.locator('[data-viewer-row="kernel-2"]').getAttribute('tabindex'),'-1');
 const railBounds=await obs.locator('[data-viewer-rail]').boundingBox(),svgBounds=await obs.locator('#kernels-scene').boundingBox();assert.ok(railBounds.x>svgBounds.x+svgBounds.width*.75);assert.ok(railBounds.x+railBounds.width<=svgBounds.x+svgBounds.width);
 await obs.emulateMedia({reducedMotion:'reduce'});assert.equal(await obs.locator('.viewer-arrival').first().evaluate(el=>getComputedStyle(el).animationName),'none');
 await mkdir(join(repo,'evidence/participants'),{recursive:true});await obs.screenshot({path:join(repo,'evidence/participants/offline-rail.png')});
 await writeFile(join(repo,'evidence/participants/result.json'),JSON.stringify({mode:'OFFLINE: real GUI/server/WS, simulated Twitch joins and public avatar',checks:['streamer remains separate','participants are in right-side source rail','verified profile avatar and small GUI orb','row opens correct kernel and preserves chat panel','six-row cap and +2 overflow from eight declared viewers','OBS noninteractive while web rows are buttons','no viewer face/focus badges','one-shot arrival respects reduced motion'],errors},null,2)+'\n');
 await writeFile(join(repo,'evidence/live-graph/result.json'),JSON.stringify({mode:'OFFLINE: simulated Twitch; real kernel, server, browser and WS',checks:['original bubble card has only profile and Stream/Channel/Followers; code stays in inspector','official video exists only in web view with channel/parent/muted and unobscured400x300 minimum','host selection and close synchronize to separate OBS view','viewer declares and explains own Twitch data; cannot query owner camera paths; host presents own native focus','isolated user kernels; only verified channel ID receives face/focus','only twitch/face/stream.focus; legacy facts and write/rule commands removed','per-user and global presentation limits','Origin/CSRF host checks','face state feeds rules; loss clears presence','no real Twitch writes'],errors},null,2)+'\n');
 console.log('PASS: host/OBS presentation, read-only chat graph, native explain, isolation and face inputs (offline).');
}finally{await browser?.close();await service.stop();await rm(root,{recursive:true,force:true});}
