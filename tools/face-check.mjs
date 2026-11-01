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
for (const colors of [['red','blue'],['#123456'],['#123456','#abcdef','white'],['url(x)','#ffffff']]) assert.equal(tracking.update({x:.2,y:.3,aspect:1,points:[[.25,.4]],colors},'owner'),400);
for (const points of [Array.from({length:479},()=>[.5,.5]), [[2,.5]], [[NaN,.5]], [{x:.5,y:.5}], [[.5,.5,1]]]) assert.equal(tracking.update({x:.2,y:.3,aspect:1,points},'owner'),400);
assert.equal(tracking.update({x:.2,y:.3,aspect:1,points:[[.25,.4]]},'owner'),204);
assert.deepEqual(tracking.snapshot().points,[[.25,.4]]);
assert.equal(tracking.snapshot().owner,'owner');time+=100;assert.equal(tracking.update({x:.2,y:.3,aspect:1,points:[[.25,.4]],colors:['#aa3366','#33aa66']},'owner'),204);assert.deepEqual(tracking.snapshot().colors,['#aa3366','#33aa66']); time+=2000;assert.equal(tracking.snapshot(),null);
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
 const page=await context.newPage(),obs=await context.newPage(),errors=[];
 await page.addInitScript(()=>{window.__trackGrabs=0;if(window.ImageCapture){const grab=ImageCapture.prototype.grabFrame;ImageCapture.prototype.grabFrame=function(){window.__trackGrabs++;return grab.call(this);};}});
 page.on('pageerror',e=>errors.push(e.message));obs.on('pageerror',e=>errors.push(e.message));
 let detections=0, relayFailures=0;
 await page.route('**/api/face',route=>{if(!relayFailures++){return route.fulfill({status:503,body:'Transient offline test failure'});}return route.continue();});
 await page.route('**/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs',route=>route.fulfill({contentType:'text/javascript',body:`export const FilesetResolver={forVisionTasks:async()=>({})};export const FaceLandmarker={createFromOptions:async()=>({detectForVideo:()=>({faceLandmarks:[Array.from({length:468},()=>({x:0.25,y:0.4}))]})})};`}));
 page.on('response',response=>{if(response.url().endsWith('/api/face')&&response.status()===204)detections++;});
 page.setDefaultTimeout(60000); obs.setDefaultTimeout(60000);
 await page.goto(origin+'/overlay/?dev=0&panel=camera',{waitUntil:'domcontentloaded'}); console.log('Setup loaded'); await obs.goto(origin+'/overlay/?transparent=1&dev=0',{waitUntil:'domcontentloaded'}); console.log('OBS loaded');
 await obs.waitForSelector('[data-me-id]');
 const response=await fetch(origin+'/api/face',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({x:0.5,y:0.5,aspect:1})});assert.equal(response.status,403);
 assert.equal(await page.locator('video').count(),0);
 await page.getByRole('button',{name:'Start face tracking'}).click();
 await page.getByText('Face found · .me companion follows you').waitFor({timeout:15000});
 await obs.waitForSelector('[data-face-follow="true"]');
 assert.equal(await page.locator('video').isVisible(),false);
 assert.equal(await page.locator('video').evaluate(el=>el.srcObject.getVideoTracks()[0].readyState),'live');
 await page.getByRole('button',{name:'Show camera preview',exact:true}).click();
 await page.locator('video').waitFor({state:'visible'});
 const capture=await page.locator('video').evaluate(el=>({width:el.videoWidth,height:el.videoHeight}));assert.deepEqual(capture,{width:640,height:480});
 const bubble = obs.locator('[data-me-bubble][data-face-follow]');
 assert.equal(await bubble.locator('.me-visual').count(),1);
 assert.equal(await bubble.locator('[data-spider-shape]').count(),0);
 assert.equal(await obs.locator('[data-spider-shape], [data-spider-id]').count(),0);
 await obs.waitForFunction(() => { const el = document.querySelector('[data-me-bubble][data-face-follow]'); if (!el) return false; const m = el.ownerSVGElement.getCTM().inverse().multiply(el.getCTM()); return Math.abs(m.e-760)<0.01 && Math.abs(m.f-342)<0.01 && Math.abs(m.a-2.8)<0.01; });
 const position = await bubble.evaluate(el => { const m = el.ownerSVGElement.getCTM().inverse().multiply(el.getCTM()); return {x:m.e,y:m.f,scale:m.a}; });
 assert.ok(Math.abs(position.x-760)<0.01); assert.ok(Math.abs(position.y-342)<0.01); assert.ok(Math.abs(position.scale-2.8)<0.01);
 assert.equal(await obs.locator('[data-face-points]').count(),0);
 await page.getByRole('button',{name:'Show face points in overlay',exact:true}).click();
 await obs.waitForSelector('canvas[data-face-points]');
 const mesh = await obs.locator('canvas[data-face-points]').evaluate(el => { const c=el.getContext('2d'); return { width:el.width, height:el.height, alpha:c.getImageData(602,432,1,1).data[3] }; });
 assert.equal(mesh.width,1920); assert.equal(mesh.height,1080); assert.ok(mesh.alpha > 0);
 const parity=await page.evaluate(async()=>{
   const {drawFaceMesh}=await import('/ui/face-mesh.js');
   const points=Array.from({length:468},()=>[.25,.4]),radii=[];
   for(const width of [320,1920]){
     const canvas=document.createElement('canvas');canvas.width=width;canvas.height=width*9/16;
     const ctx=canvas.getContext('2d'),arc=ctx.arc.bind(ctx);let radius;
     ctx.arc=(x,y,r,...rest)=>{radius=r;arc(x,y,r,...rest)};
     drawFaceMesh(canvas,{points,aspect:16/9,colors:['#aa3366','#33aa66']});radii.push(radius);
   }
   return radii;
 });assert.deepEqual(parity,[1.25,2.5]);
 await page.getByRole('button',{name:'Hide camera preview',exact:true}).click();
 assert.equal(await page.locator('video').isVisible(),false);
 const relayBefore=detections;await page.waitForResponse(r=>r.url().endsWith('/api/face')&&r.status()===204);assert.ok(detections>relayBefore);
 await page.getByRole('button',{name:'Show camera preview',exact:true}).click();
 await page.getByRole('button',{name:'Hide face points in overlay',exact:true}).click();
 await obs.waitForFunction(()=>!document.querySelector('[data-face-points]'));
 const beforeDrift=await bubble.locator('[data-companion-motion]').evaluate(el=>getComputedStyle(el).transform);
 await page.waitForTimeout(250);
 assert.notEqual(await bubble.locator('[data-companion-motion]').evaluate(el=>getComputedStyle(el).transform),beforeDrift);
 await obs.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await bubble.locator('[data-companion-motion]').evaluate(el=>getComputedStyle(el).animationName),'none');
 await obs.emulateMedia({reducedMotion:'no-preference'});
 // Switching panels must not release the authorized camera track.
 await page.locator('button[aria-label="Twitch"]').click();
 assert.equal(await page.locator('video').isVisible(), false);
 assert.equal(await page.locator('video').evaluate(el=>el.srcObject.getVideoTracks()[0].readyState),'live');
 await page.locator('button[aria-label="Settings"]').click();
 await page.getByRole('menuitem',{name:'Face tracking',exact:true}).click();
 await page.locator('video').waitFor({state:'visible'});
 // Simulate paused rAF in the camera tab: the fallback must keep the real relay fresh.
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;document.querySelector('video').pause();});
 await page.waitForTimeout(2200);const beforeFallback=detections;
 await page.waitForResponse(response=>response.url().endsWith('/api/face')&&response.status()===204,{timeout:10000});assert.ok(detections>beforeFallback);assert.ok(await page.evaluate(()=>window.__trackGrabs)>0);
 assert.equal(await bubble.count(),1);
 await page.getByRole('button',{name:'Stop tracking'}).click();
 await obs.waitForFunction(()=>!document.querySelector('[data-face-follow]'));
 assert.equal(await page.locator('video').count(),0);
 assert.ok(detections>0);assert.ok(relayFailures>1);assert.deepEqual(errors,[]);
 await mkdir(join(repo,'evidence/face-tracking'),{recursive:true});
 await page.screenshot({path:join(repo,'evidence/face-tracking/offline-controls.png'),fullPage:true});
 await writeFile(join(repo,'evidence/face-tracking/result.json'),JSON.stringify({mode:'OFFLINE: simulated camera, landmarks and Twitch; real existing GUI hooks/server/ws/browser',checks:['strict coordinate validation; owner cannot be injected','rate limit; stale coordinates expire','CSRF required','camera only starts after click','existing GUI hook plus stalled-rAF fallback keep the relay fresh','companion sits beside the face with CSS drift and reduced-motion support','owner .me bubble moves in separate OBS view with correct 16:9 mapping; no Spider bodies','transient relay failure clears after a successful retry without stale disconnected status','shared mesh caps ring radius and thin strokes at OBS resolution; capture matches the 4:3 OBS camera; validated theme colors relay to OBS; optional points map correctly and clear when disabled','camera preview is hidden by default; toggling it keeps the camera and relay alive','stop removes camera and clears follow position','no Twitch chat messages sent'],detections,errors},null,2)+'\n');
 console.log('PASS: GUI tracking integration, local relay, OBS mapping, stop, CSRF and validation (offline).');
}finally{await browser?.close();await service.stop();await rm(root,{recursive:true,force:true});}
