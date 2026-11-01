// OFFLINE: real server/UI/permissions; simulated Twitch only. No channel writes.
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
try{
 await service.start();
 const access=await(await fetch(origin+'/api/scene-tint')).json();assert.equal(access.canEdit,true);
 const post=(value,extra={})=>fetch(origin+'/api/scene-tint',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-CSRF-Token':access.csrf,...extra},body:JSON.stringify(value)});
 assert.equal((await post({h:20,s:50,l:50,a:20},{Origin:'https://evil.invalid'})).status,403);
 assert.equal((await post({h:20,s:50,l:50,a:20},{'X-CSRF-Token':'wrong'})).status,403);
 for(const value of [{h:400,s:50,l:50,a:20},{h:20,s:50,l:50,a:101},{h:20,s:50,l:50,a:20,color:'url(x)'},{h:20,s:50,l:50},{h:'red',s:50,l:50,a:20}])assert.equal((await post(value)).status,400);
 browser=await chromium.launch(process.env.CHROME?{executablePath:process.env.CHROME}:{});
 const context=await browser.newContext({viewport:{width:1280,height:960}}), other=await browser.newContext({viewport:{width:1280,height:960}});
 for(const target of [context,other]){
 for(const[url,path]of[['react@18.3.1/umd/react.production.min.js','react/umd/react.production.min.js'],['react-dom@18.3.1/umd/react-dom.production.min.js','react-dom/umd/react-dom.production.min.js'],['this.gui@4.2.1/dist/this.gui.umd.js','this.gui/dist/this.gui.umd.js']]){const body=await readFile(join(repo,'node_modules',path));await target.route('https://cdn.jsdelivr.net/npm/'+url,r=>r.fulfill({contentType:'text/javascript',body}));}
 await target.route('https://player.twitch.tv/**',r=>r.fulfill({contentType:'text/html',body:'<p>Offline Twitch video fixture</p>'}));
 await target.route('https://www.twitch.tv/embed/**',r=>r.fulfill({contentType:'text/html',body:'Offline Twitch chat'}));


 }

 const page=await context.newPage(),obs=await other.newPage(),errors=[];for(const p of[page,obs]){p.setDefaultTimeout(15000);p.on('pageerror',e=>errors.push(e.message));}
 await page.goto(origin+'/overlay/?dev=0');await obs.goto(origin+'/overlay/?transparent=1&dev=0');
 await obs.waitForFunction(()=>document.querySelector('#scene-tint')?.style.background && document.querySelector('#scene-tint').style.background!=='transparent');
 assert.equal(await obs.getByRole('slider').count(),0);
 assert.equal(await obs.evaluate(()=>localStorage.getItem('codex-me:scene-tint')),null);
 const swatch=page.getByRole('slider',{name:'Overlay color and opacity',exact:true});
 const before=await obs.locator('#scene-tint').evaluate(el=>getComputedStyle(el).backgroundColor);
 const box=await swatch.boundingBox();await page.mouse.move(box.x+16,box.y+16);await page.mouse.down();await page.mouse.move(box.x+76,box.y-4,{steps:6});await page.mouse.up();
 await obs.waitForFunction(old=>getComputedStyle(document.querySelector('#scene-tint')).backgroundColor!==old,before);
 const webColor=await page.locator('#scene-tint').evaluate(el=>getComputedStyle(el).backgroundColor);
 await obs.waitForFunction(color=>getComputedStyle(document.querySelector('#scene-tint')).backgroundColor===color,webColor);
 await obs.reload();await obs.waitForFunction(color=>getComputedStyle(document.querySelector('#scene-tint')).backgroundColor===color,webColor);
 await swatch.dblclick();await obs.waitForFunction(color=>getComputedStyle(document.querySelector('#scene-tint')).backgroundColor!==color,webColor);
 assert.equal(await page.locator('[data-theme-default=true][role=slider]').count(),1);
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
 await mkdir(join(repo,'evidence/scene-tint'),{recursive:true});await obs.screenshot({path:join(repo,'evidence/scene-tint/offline-source.png')});
 const logout=await fetch(origin+'/auth/logout',{method:'POST',redirect:'manual',headers:{Origin:origin,'X-CSRF-Token':access.csrf}});assert.equal(logout.status,200);
 const signedOut=await(await fetch(origin+'/api/scene-tint')).json();assert.equal(signedOut.canEdit,false);assert.equal(signedOut.tint,null);assert.equal((await post({h:20,s:50,l:50,a:20})).status,403);
 await obs.waitForFunction(()=>document.querySelector('#scene-tint')?.style.background==='transparent');
 await writeFile(join(repo,'evidence/scene-tint/result.json'),JSON.stringify({mode:'OFFLINE: real GUI/server/WS, fake Twitch, independent browser contexts',checks:['separate OBS storage has no saved tint','owner initial tint is shared','drag hue/opacity matches in separate source','OBS reload replays latest tint','double-click theme reset is shared','no swatch control inside OBS','Origin/CSRF and strict HSL numeric validation; logout clears tint and blocks writes','no channel writes or browser errors'],errors},null,2)+'\n');
 console.log('PASS: independent-browser tint relay, drag/reset/reconnect and security.');
}finally{await browser?.close();await service.stop();await rm(root,{recursive:true,force:true});}
