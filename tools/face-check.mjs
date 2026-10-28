// OFFLINE: fake camera + fake MediaPipe landmarks + fake Twitch. Real GUI hooks/server/ws/rendering.
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtemp, mkdir, writeFile, readFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { createApp } from '../server.mjs';
import { createFaceTracking } from '../lib/face-tracking.mjs';
let time = 1000; const messages = [];
const tracking = createFaceTracking({ now: () => time, broadcast: m => messages.push(m) });
assert.equal(tracking.update({x:0.2,y:0.3,aspect:16/9},'owner'),204);
assert.equal(tracking.update({x:0.3,y:0.4,aspect:16/9},'owner'),429);
time+=100;
for (const value of [{x:2,y:0.2,aspect:1},{x:0.2,y:0.3,aspect:0},{x:NaN,y:0,aspect:1},{x:0.2,y:0.3,aspect:1,owner:'other'},{image:'private'}]) assert.equal(tracking.update(value,'owner'),400);
assert.equal(tracking.snapshot().owner,'owner'); time+=2000;assert.equal(tracking.snapshot(),null);
assert.equal(tracking.update({x:null,y:null},'owner'),204);assert.equal(messages.at(-1).face,null);
const root = await mkdtemp(join(tmpdir(),'codex-face-')), repo = new URL('../',import.meta.url).pathname;
await symlink(join(repo,'overlay'),join(root,'overlay'),'dir');
await writeFile(join(root,'.tokens.json'),JSON.stringify({access_token:'offline',refresh_token:'offline',expires_at:Date.now()+3600000,user_id:'channel',login:'suignn'}));
class FakeSocket extends EventEmitter { constructor(){super();queueMicrotask(()=>this.emit('message',JSON.stringify({metadata:{message_type:'session_welcome'},payload:{session:{id:'offline',keepalive_timeout_seconds:60}}})));} close(){this.emit('close');} terminate(){this.close();} }
const remote = async url => {
 if(url.endsWith('/validate'))return Response.json({client_id:'offline',user_id:'channel',login:'suignn',scopes:['user:read:chat','user:write:chat'],expires_in:3600});
 if(url.includes('/users?'))return Response.json({data:[{id:'channel',login:'suignn',display_name:'suiGnn'}]});
 if(url.endsWith('/subscriptions'))return Response.json({data:[{id:'offline'}]});
 throw Error('Unexpected Twitch call — this check must not send chat');
};
const port=process.env.CHECK_PORT||'3018',origin=`http://localhost:${port}`;
const service=createApp({PORT:port,TWITCH_CLIENT_ID:'offline',TWITCH_CLIENT_SECRET:'offline',TWITCH_CHANNEL:'suignn'},{root,fetch:remote,Socket:FakeSocket,logger:{log(){}}});
let browser;
try {
 await service.start(); console.log("Offline server ready");
 browser=await chromium.launch({...(process.env.CHROME?{executablePath:process.env.CHROME}:{}),args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
 console.log("Browser ready");
 const context=await browser.newContext({permissions:['camera'],viewport:{width:1280,height:960}});
 for (const [url,path] of [['react@18.3.1/umd/react.production.min.js','react/umd/react.production.min.js'],['react-dom@18.3.1/umd/react-dom.production.min.js','react-dom/umd/react-dom.production.min.js'],['this.gui@4.2.1/dist/this.gui.umd.js','this.gui/dist/this.gui.umd.js']]) {
  const body=await readFile(join(repo,'node_modules',path));
  await context.route('https://cdn.jsdelivr.net/npm/'+url,route=>route.fulfill({contentType:'text/javascript',body}));
 }
 const page=await context.newPage(),obs=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));obs.on('pageerror',e=>errors.push(e.message));
 let detections=0;
 await page.route('**/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs',route=>route.fulfill({contentType:'text/javascript',body:`export const FilesetResolver={forVisionTasks:async()=>({})};export const FaceLandmarker={createFromOptions:async()=>({detectForVideo:()=>({faceLandmarks:[Array.from({length:468},()=>({x:0.25,y:0.4}))]})})};`}));
 page.on('response',response=>{if(response.url().endsWith('/api/face')&&response.status()===204)detections++;});
 page.setDefaultTimeout(60000); obs.setDefaultTimeout(60000);
 await page.goto(origin,{waitUntil:'domcontentloaded'}); console.log('Setup loaded'); await obs.goto(origin+'/overlay/?transparent=1&dev=0',{waitUntil:'domcontentloaded'}); console.log('OBS loaded');
 await obs.waitForSelector('[data-spider-id]');
 const response=await fetch(origin+'/api/face',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({x:0.5,y:0.5,aspect:1})});assert.equal(response.status,403);
 assert.equal(await page.locator('video').count(),0);
 await page.getByRole('button',{name:'Start face tracking'}).click();
 await page.getByText('Face found · Spider follows your forehead').waitFor();
 await obs.waitForSelector('[data-face-follow="true"]');
 const transform=await obs.locator('[data-face-follow]').getAttribute('transform');
 assert.match(transform,/translate\(480 412/);
 await page.getByRole('button',{name:'Stop tracking'}).click();
 await obs.waitForFunction(()=>!document.querySelector('[data-face-follow]'));
 assert.equal(await page.locator('video').count(),0);
 assert.ok(detections>0);assert.deepEqual(errors,[]);
 await mkdir(join(repo,'evidence/face-tracking'),{recursive:true});
 await page.screenshot({path:join(repo,'evidence/face-tracking/offline-controls.png'),fullPage:true});
 await writeFile(join(repo,'evidence/face-tracking/result.json'),JSON.stringify({mode:'OFFLINE: simulated camera, landmarks and Twitch; real existing GUI hooks/server/ws/browser',checks:['strict coordinate validation; owner cannot be injected','rate limit; stale coordinates expire','CSRF required','camera only starts after click','existing GUI hook publishes forehead anchor','owner Spider moves in separate OBS view with correct 16:9 mapping','stop removes camera and clears follow position','no Twitch chat messages sent'],detections,errors},null,2)+'\n');
 console.log('PASS: GUI tracking integration, local relay, OBS mapping, stop, CSRF and validation (offline).');
}finally{await browser?.close();await service.stop();await rm(root,{recursive:true,force:true});}
