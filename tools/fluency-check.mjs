// OFFLINE A/B renderer benchmark. Synthetic inference; no Twitch or OBS changes.
import { execFileSync } from 'node:child_process';
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
for (const points of [Array.from({length:479},()=>[.5,.5]), [[2,.5]], [[NaN,.5]], [{x:.5,y:.5}], [[.5,.5,1]]]) assert.equal(tracking.update({x:.2,y:.3,aspect:1,points},'owner'),400);
assert.equal(tracking.update({x:.2,y:.3,aspect:1,points:[[.25,.4]]},'owner'),204);
assert.deepEqual(tracking.snapshot().points,[[.25,.4]]);
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
 await context.route('https://player.twitch.tv/**',route=>route.fulfill({contentType:'text/html',body:'Offline video fixture'}));
 await context.route('https://www.twitch.tv/embed/**',route=>route.fulfill({contentType:'text/html',body:'Offline chat fixture'}));
 if (process.env.BASELINE === '1') for (const file of ['overlay/spiders.js','overlay/stream-presentation.js','ui/face-tracking.js']) { const body=execFileSync('git',['show','92c30b1:'+file],{cwd:repo}); await context.route(origin+'/'+file,r=>r.fulfill({contentType:'text/javascript',body})); }
 const page=await context.newPage(),obs=await context.newPage(),errors=[];
 await page.addInitScript(()=>{window.__trackGrabs=0;if(window.ImageCapture){const grab=ImageCapture.prototype.grabFrame;ImageCapture.prototype.grabFrame=function(){window.__trackGrabs++;return grab.call(this);};}});
 page.on('pageerror',e=>errors.push(e.message));obs.on('pageerror',e=>errors.push(e.message));
 let detections=0, relayFailures=0;
 await page.route('**/api/face',route=>{if(!relayFailures++){return route.fulfill({status:503,body:'Transient offline test failure'});}return route.continue();});
 await page.route('**/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs',route=>route.fulfill({contentType:'text/javascript',body:`export const FilesetResolver={forVisionTasks:async()=>({})};export const FaceLandmarker={createFromOptions:async()=>({detectForVideo:()=>({faceLandmarks:[Array.from({length:468},()=>({x:0.5+Math.sin(performance.now()/700)*0.15,y:0.4}))]})})};`}));
 page.on('response',response=>{if(response.url().endsWith('/api/face')&&response.status()===204)detections++;});
 page.setDefaultTimeout(60000); obs.setDefaultTimeout(60000);
 await page.goto(origin+'/overlay/?dev=0&panel=camera',{waitUntil:'domcontentloaded'}); console.log('Setup loaded'); await obs.goto(origin+'/overlay/?transparent=1&dev=0',{waitUntil:'domcontentloaded'}); console.log('OBS loaded');
 await obs.waitForSelector('[data-me-id]');

 await page.getByRole('button',{name:'Start face tracking',exact:true}).click();
 await page.getByText('Face found · .me companion follows you').waitFor();
 await page.getByRole('button',{name:'Show face points in overlay',exact:true}).click();
 await obs.waitForSelector('[data-face-points]');
 const sessions=await Promise.all([page,obs].map(p=>context.newCDPSession(p)));
 for(const session of sessions)await session.send('Performance.enable');
 const before=await Promise.all(sessions.map(s=>s.send('Performance.getMetrics')));
 const cadence=await Promise.all([page,obs].map(p=>p.evaluate(()=>new Promise(resolve=>{
   const frames=[],long=[];let last=performance.now(),start=last;
   const observer=new PerformanceObserver(list=>long.push(...list.getEntries().map(e=>e.duration)));observer.observe({type:'longtask'});
   const tick=now=>{frames.push(now-last);last=now;if(now-start<6000)requestAnimationFrame(tick);else{observer.disconnect();frames.sort((a,b)=>a-b);resolve({frames:frames.length,frameGapP95Ms:frames[Math.floor(frames.length*.95)],maxFrameGapMs:frames.at(-1),longTasks:long.length,maxLongTaskMs:Math.max(0,...long)});}};requestAnimationFrame(tick);
 }))));
 const after=await Promise.all(sessions.map(s=>s.send('Performance.getMetrics')));
 const result={mode:'OFFLINE: synthetic moving landmarks; fake Twitch/video; real GUI/browser/server/WS. Does not measure MediaPipe inference or Twitch delivery.',baseline:process.env.BASELINE==='1',views:cadence.map((c,i)=>{const b=Object.fromEntries(before[i].metrics.map(m=>[m.name,m.value])),a=Object.fromEntries(after[i].metrics.map(m=>[m.name,m.value]));return{view:i?'OBS source':'web',...c,mainThreadTaskMs:(a.TaskDuration-b.TaskDuration)*1000}}),errors};
 await mkdir(join(repo,'evidence/fluency'),{recursive:true});
 await writeFile(join(repo,'evidence/fluency',result.baseline?'before.json':'after.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result,null,2));assert.deepEqual(errors,[]);
 await page.getByRole('button',{name:'Stop tracking',exact:true}).click();
}finally{await browser?.close();await service.stop();await rm(root,{recursive:true,force:true});}
