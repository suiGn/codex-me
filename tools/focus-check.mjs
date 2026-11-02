import { createSpiders, parseMeChat } from '../lib/spiders.mjs';
// OFFLINE: real native kernel/server/GUI/WS; simulated Twitch and face coordinates.
import assert from 'node:assert/strict';
import { createApp } from '../server.mjs';
import { EventEmitter } from 'node:events';
import { mkdtemp,writeFile,readFile,symlink,rm,mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
const user=(id,login=id)=>({id,login,display_name:login.toUpperCase()});
const calls=[],writes=[];
const repo=new URL('../',import.meta.url).pathname,root=await mkdtemp(join(tmpdir(),'codex-live-graph-'));await symlink(join(repo,'overlay'),join(root,'overlay'),'dir');
await writeFile(join(root,'.tokens.json'),JSON.stringify({access_token:'offline',refresh_token:'offline',expires_at:Date.now()+3600000,user_id:'channel',login:'suignn'}));
let upstream;const posted=[];
class FakeSocket extends EventEmitter { constructor(){super();upstream=this;queueMicrotask(()=>this.emit('message',JSON.stringify({metadata:{message_type:'session_welcome'},payload:{session:{id:'offline',keepalive_timeout_seconds:60}}})));}close(){this.emit('close');}terminate(){this.close();} }
const remote=async(url,options={})=>{
 if(url.endsWith('/validate'))return Response.json({client_id:'offline',user_id:'channel',login:'suignn',scopes:['user:read:chat','user:write:chat','channel:manage:broadcast'],expires_in:3600});
 if(url.includes('/users?')){const id=new URL(url).searchParams.get('id');return Response.json({data:[user(id||'channel',id==='viewer'?'viewer':'suignn')]});}
 if(options.method==='PATCH'){writes.push(options.body);throw Error('No writes expected');}
 if(url.includes('/channels?'))return Response.json({data:[{broadcaster_id:'channel',title:'Offline fixture',game_name:'',broadcaster_language:'en',tags:[]}]});
 if(url.includes('/games/top?')){calls.push('popular');return Response.json({data:[{id:'509658',name:'Just Chatting'},{id:'26936',name:'Music'}]});}
 if(url.includes('/search/categories?')){const q=new URL(url).searchParams.get('query');calls.push(q);if(q==='fail')return new Response('',{status:503});return Response.json({data:q==='missing'?[]:[{id:'26936',name:'Music'}]});}
 if(url.includes('/streams?'))return Response.json({data:[]});
 if(url.endsWith('/subscriptions'))return Response.json({data:[{id:'offline'}]});
 if(url.endsWith('/chat/messages')){posted.push(JSON.parse(options.body));return Response.json({data:[{is_sent:true}]});}
 throw Error('Unexpected Twitch request');
};
const port=process.env.CHECK_PORT||'3018',origin=`http://localhost:${port}`;
const service=createApp({PORT:port,TWITCH_CLIENT_ID:'offline',TWITCH_CLIENT_SECRET:'offline',TWITCH_CHANNEL:'suignn'},{root,fetch:remote,Socket:FakeSocket,logger:{log(){}}});let browser;
const registry=createSpiders({kernelOnly:true,faceOwnerId:'one'});registry.ensure({userId:'one',user:'one',profile:user('one')});
registry.ensure({userId:'two',user:'two',profile:user('two')});
const viewerScript=registry.presences().find(k=>k.id==='kernel-2').script;
const query=op=>registry.query('kernel-1','stream.focus',op).output;
for(const [x,expected] of [[null,undefined],[.2,false],[.4,false],[.5,true],[.6,false],[.8,false],[null,undefined]]){
 registry.updateFace(x===null?null:{x,y:.5});assert.equal(query('run'),expected);
 const trace=query('explain');assert.equal(trace.expr,'face.x > 0.4 && face.x < 0.6');assert.ok(trace.derivation.inputs.some(i=>i.path==='face.x'&&i.value===x));
 assert.ok(registry.presences()[0].graph.edges.some(e=>e.source==='face.x'&&e.target==='stream.focus'));
}
for(let i=0;i<700;i++)registry.updateFace({x:i%2?.5:.8,y:.5});registry.updateFace({x:.5,y:.5});assert.equal(query('run'),true);assert.equal(registry.query('kernel-2','face.x','run').status,404);assert.equal(registry.query('kernel-2','stream.focus','run').status,404);assert.equal(registry.presences().find(k=>k.id==='kernel-2').script,viewerScript);registry.ensure({userId:'three',user:'three',profile:user('three')});assert.deepEqual([...new Set(registry.presences().find(k=>k.id==='kernel-3').graph.nodes.map(n=>n.path.split('.')[0]))],['twitch']);
assert.equal(registry.presences()[0].script.split('me["="]("stream.focus",').length,2);
assert.equal(parseMeChat('!me set stream.focus false').kind,'invalid');assert.equal(parseMeChat('!me explain stream.focus').path,'stream.focus');
const rebound=createSpiders({kernelOnly:true,faceOwnerId:'one'});for(const id of ['one','two'])rebound.ensure({userId:id,user:id,profile:user(id)});rebound.updateFace({x:.5,y:.5});rebound.setFaceOwner('two');assert.equal(rebound.query('kernel-1','face.x','run').status,404);assert.equal(rebound.query('kernel-1','stream.focus','run').status,404);rebound.updateFace({x:.5,y:.5});assert.equal(rebound.query('kernel-2','stream.focus','run').output,true);assert.equal(rebound.query('kernel-1','twitch.profile.login','run').output,'one');
try{
 await service.start();const access=await(await fetch(origin+'/api/presentation')).json();
 const face=value=>fetch(origin+'/api/face',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-CSRF-Token':access.csrf},body:JSON.stringify(value)});
 browser=await chromium.launch(process.env.CHROME?{executablePath:process.env.CHROME}:{});
 const context=await browser.newContext({viewport:{width:1280,height:960}});
 for(const[url,path]of[['react@18.3.1/umd/react.production.min.js','react/umd/react.production.min.js'],['react-dom@18.3.1/umd/react-dom.production.min.js','react-dom/umd/react-dom.production.min.js'],['this.gui@4.2.1/dist/this.gui.umd.js','this.gui/dist/this.gui.umd.js']]){const body=await readFile(join(repo,'node_modules',path));await context.route('https://cdn.jsdelivr.net/npm/'+url,r=>r.fulfill({contentType:'text/javascript',body}));}
 await context.route('https://player.twitch.tv/**',r=>r.fulfill({contentType:'text/html',body:'<p>Offline Twitch video fixture</p>'}));
 await context.route('https://www.twitch.tv/embed/**',r=>r.fulfill({contentType:'text/html',body:'Offline Twitch chat'}));


 const page=await context.newPage(),obs=await context.newPage(),errors=[];for(const p of[page,obs]){p.setDefaultTimeout(15000);p.on('pageerror',e=>errors.push(e.message));}
 await page.goto(origin+'/overlay/?dev=0');await obs.goto(origin+'/overlay/?transparent=1&dev=0');
 await page.locator('[data-me-bubble="kernel-1"]').click();await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('menuitem',{name:'Inspector',exact:true}).click();
 const node=page.getByRole('treeitem',{name:'stream.focus',exact:true});await node.waitFor();assert.equal(await node.getAttribute('data-focus'),'undefined');await node.click();
 await obs.waitForFunction(()=>document.querySelector('[data-presented-value="stream.focus"]')?.textContent==='undefined');
 assert.equal((await face({x:.5,y:.5,aspect:4/3})).status,204);
 await page.waitForFunction(()=>document.querySelector('[data-path-option="stream.focus"]')?.dataset.focus==='true');
 await obs.waitForFunction(()=>document.querySelector('[data-presented-value="stream.focus"]')?.textContent==='true');
 assert.equal(await obs.locator('[data-me-bubble="kernel-1"]').getAttribute('data-focus'),'true');
 assert.match(await obs.locator('[data-presented-explain="stream.focus"]').innerText(),/face.x=0.5/);
 assert.match(await page.locator('[data-explain-source="stream.focus"]').innerText(),/face.x > 0.4 && face.x < 0.6/);
 const native=(await(await fetch(origin+'/api/kernels/kernel-1/query?path=stream.focus&operation=explain')).json()).output;assert.equal(native.value,true);assert.ok(native.derivation.inputs.some(i=>i.path==='face.x'&&i.value===.5));
 await mkdir(join(repo,'evidence/focus'),{recursive:true});await obs.screenshot({path:join(repo,'evidence/focus/offline-centered.png')});
 await face({x:.2,y:.5,aspect:4/3});await page.waitForFunction(()=>document.querySelector('[data-path-option="stream.focus"]')?.dataset.focus==='false');await obs.waitForFunction(()=>document.querySelector('[data-presented-value="stream.focus"]')?.textContent==='false');
 await face({x:null,y:null});await page.waitForFunction(()=>document.querySelector('[data-path-option="stream.focus"]')?.dataset.focus==='undefined');await obs.waitForFunction(()=>document.querySelector('[data-presented-value="stream.focus"]')?.textContent==='undefined');
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
 await writeFile(join(repo,'evidence/focus/result.json'),JSON.stringify({mode:'OFFLINE: real this.me4.2.1/server/GUI/WS; simulated Twitch and face coordinates',checks:['strict center bounds .4 and .6 excluded','.5 true and outside false','missing face remains native undefined','native face.x dependency and real explain','only verified camera owner receives face/rule; existing and late viewers stay Twitch-only; owner rebind prunes old camera paths','rule survives700 face updates/compaction','chat cannot overwrite fixed rule or face input','inspector node and bubble focus indicator update','selected value/explanation updates in separate OBS source','source declaration shown accurately','no channel writes or browser errors'],centeredNativeExplain:native,errors},null,2)+'\n');
 console.log('PASS: native face-driven stream.focus, dependencies, live UI and OBS explain.');
}finally{await browser?.close();await service.stop();await rm(root,{recursive:true,force:true});}
