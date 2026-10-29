// OFFLINE ONLY: real local sockets, OBS v5 auth/RPC and GUI; fake OBS/Twitch.
import assert from 'node:assert/strict';
import { EventEmitter, once } from 'node:events';
import { createHash } from 'node:crypto';
import { WebSocketServer } from 'ws';
import { mkdtemp, writeFile, readFile, symlink, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { createApp } from '../server.mjs';
import { createObsControl } from '../lib/obs-control.mjs';
const repo=new URL('../',import.meta.url).pathname, hash=x=>createHash('sha256').update(x).digest('base64');
const fake=new WebSocketServer({port:0,host:'127.0.0.1'});await once(fake,'listening');
const obsPort=fake.address().port, calls=[], password='offline-obs-password';let active=false, deny=false, hang=false, image='data:image/jpeg;base64,/9j/2Q==';
fake.on('connection',socket=>{
 let ready=false;socket.send(JSON.stringify({op:0,d:{rpcVersion:1,authentication:{salt:'offline-salt',challenge:'offline-challenge'}}}));
 socket.on('message',raw=>{const {op,d}=JSON.parse(raw);
  if(op===1){assert.equal(d.rpcVersion,1);if(d.authentication!==hash(hash(password+'offline-salt')+'offline-challenge'))return socket.close(4009);ready=true;return socket.send(JSON.stringify({op:2,d:{negotiatedRpcVersion:1}}));}
  assert.ok(ready);assert.equal(op,6);calls.push(d);
  if(hang)return;
  let responseData={};if(d.requestType==='GetStreamStatus')responseData={outputActive:active,outputReconnecting:false,outputTimecode:active?'00:00:02.000':'00:00:00.000',outputSkippedFrames:2,outputTotalFrames:100};
  else if(d.requestType==='GetCurrentProgramScene')responseData={currentProgramSceneName:'Offline demo scene'};
  else if(d.requestType==='StartStream'){if(!deny)active=true;}
  else if(d.requestType==='StopStream')active=false;
  else if(d.requestType==='GetSourceScreenshot'){assert.deepEqual(d.requestData,{sourceName:'Offline demo scene',imageFormat:'jpg',imageWidth:640,imageCompressionQuality:60});responseData={imageData:image};}
  else assert.fail('Unexpected OBS RPC '+d.requestType);
  socket.send(JSON.stringify({op:7,d:{requestId:d.requestId,requestStatus:{result:!deny,code:deny?500:100},responseData}}));
 });
});
const client=createObsControl({port:obsPort,password,timeout:150});let browser,service,root;
try {
 await assert.rejects(client.connect({port:80}),/local OBS port/);
 await assert.rejects(client.connect({password:'wrong'}),/password rejected/);
 assert.equal((await client.connect()).streaming,false);
 assert.ok(calls.every(c=>c.requestType.startsWith('Get')));
 deny=true;await assert.rejects(client.action('start'),/OBS rejected/);deny=false;
 assert.equal((await client.action('start')).streaming,true);
 client.disconnect();assert.equal(active,true);assert.equal(client.snapshot().connected,false);
 await client.connect();assert.equal((await client.action('stop')).streaming,false);
 hang=true;await assert.rejects(client.status(true),/did not confirm/);hang=false;
 await assert.rejects(client.action('ToggleStream'),/Unsupported/);client.disconnect();
 // Reset counts: following integration assertions cover only browser/API actions.
 calls.length=0;
 root=await mkdtemp(join(tmpdir(),'codex-obs-'));await symlink(join(repo,'overlay'),join(root,'overlay'),'dir');
 await writeFile(join(root,'.tokens.json'),JSON.stringify({access_token:'offline',refresh_token:'offline',user_id:'channel',login:'suignn',expires_at:Date.now()+3600000}));
 class FakeTwitch extends EventEmitter {constructor(){super();queueMicrotask(()=>this.emit('message',JSON.stringify({metadata:{message_type:'session_welcome'},payload:{session:{id:'offline',keepalive_timeout_seconds:60}}})));}close(){this.emit('close');}terminate(){this.close();}}
 const remote=async url=>{
  if(url.endsWith('/validate'))return Response.json({client_id:'offline',user_id:'channel',login:'suignn',scopes:['user:read:chat','user:write:chat'],expires_in:3600});
  if(url.includes('/users?'))return Response.json({data:[{id:'channel',login:'suignn',display_name:'suiGnn'}]});
  if(url.endsWith('/subscriptions'))return Response.json({data:[{id:'offline'}]});
  throw Error('Unexpected Twitch call');
 };
 const port=process.env.CHECK_PORT||3018,origin=`http://localhost:${port}`;
 service=createApp({PORT:port,TWITCH_CHANNEL:'suignn',TWITCH_CLIENT_ID:'offline',OBS_WEBSOCKET_PORT:obsPort,OBS_WEBSOCKET_PASSWORD:password},{root,fetch:remote,Socket:FakeTwitch,logger:{log(){}}});await service.start();
 let status=await(await fetch(origin+'/api/obs')).json();assert.equal(status.connected,false);assert.ok(status.csrf);assert.equal(JSON.stringify(status).includes(password),false);
 const headers={Origin:origin,'Content-Type':'application/json','X-CSRF-Token':status.csrf};
 const post=(action,body={},extra={})=>fetch(origin+'/api/obs/'+action,{method:'POST',headers:{...headers,...extra},body:JSON.stringify(body)});
 assert.equal((await post('connect',{}, {'X-CSRF-Token':'wrong'})).status,403);
 assert.equal((await post('connect',{}, {Origin:'https://other.invalid'})).status,403);
 assert.equal((await post('rpc')).status,400);
 assert.equal((await post('connect',{host:'remote.invalid'})).status,400);
 assert.equal(calls.length,0);
 browser=await chromium.launch({...(process.env.CHROME?{executablePath:process.env.CHROME}:{}),headless:true});
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 for(const [url,path] of [['react@18.3.1/umd/react.production.min.js','react/umd/react.production.min.js'],['react-dom@18.3.1/umd/react-dom.production.min.js','react-dom/umd/react-dom.production.min.js'],['this.gui@4.2.1/dist/this.gui.umd.js','this.gui/dist/this.gui.umd.js']])await context.route('https://cdn.jsdelivr.net/npm/'+url,async r=>r.fulfill({contentType:'text/javascript',body:await readFile(join(repo,'node_modules',path))}));
 await context.route('https://www.twitch.tv/**',r=>r.fulfill({contentType:'text/html',body:'Offline Twitch chat fixture'}));
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setContent('<body style="background:#10131a;color:#b8ffc8;font:24px monospace">OFFLINE OBS PREVIEW<br>Simulated scene · no broadcast</body>');image='data:image/jpeg;base64,'+(await page.screenshot({type:'jpeg'})).toString('base64');
 await page.goto(origin+'/overlay/?dev=0');
 await page.getByRole('button',{name:'OBS',exact:true}).click();const panel=page.locator('[data-obs-controls]');
 await panel.getByText('Disconnected',{exact:true}).waitFor();
 await panel.getByRole('button',{name:'Connect OBS',exact:true}).click();await panel.getByText('Ready',{exact:true}).waitFor();
 assert.equal(calls.some(c=>['StartStream','StopStream'].includes(c.requestType)),false);
 await panel.getByRole('button',{name:'Show preview',exact:true}).click();await panel.getByRole('img',{name:'OBS program preview: Offline demo scene'}).waitFor();
 assert.equal(calls.some(c=>['StartStream','StopStream'].includes(c.requestType)),false);
 await panel.getByRole('button',{name:'Start streaming',exact:true}).click();await panel.getByText('Streaming',{exact:true}).waitFor();assert.equal(calls.filter(c=>c.requestType==='StartStream').length,1);
 await panel.getByRole('button',{name:'Disconnect controls',exact:true}).click();await panel.getByText('Disconnected',{exact:true}).waitFor();assert.equal(active,true);assert.equal(calls.filter(c=>c.requestType==='StopStream').length,0);
 await panel.getByRole('button',{name:'Connect OBS',exact:true}).click();await panel.getByRole('button',{name:'Stop streaming',exact:true}).waitFor();await panel.getByRole('button',{name:'Stop streaming',exact:true}).click();await panel.getByText('Ready',{exact:true}).waitFor();assert.equal(calls.filter(c=>c.requestType==='StopStream').length,1);
 await panel.getByRole('button',{name:'Show preview',exact:true}).click();
 await mkdir(join(repo,'evidence/obs'),{recursive:true});await page.screenshot({path:join(repo,'evidence/obs/offline-controls.png')});
 assert.deepEqual(errors,[]);
 await page.getByRole('button',{name:'Twitch',exact:true}).click();await page.getByRole('button',{name:'OBS',exact:true}).click();await page.locator('[data-obs-status]').getByText('Ready',{exact:true}).waitFor();
 const logout=await fetch(origin+'/auth/logout',{method:'POST',headers});assert.equal(logout.status,200);assert.equal((await fetch(origin+'/api/obs')).status,403);assert.equal((await post('start')).status,403);
 await writeFile(join(repo,'evidence/obs/result.json'),JSON.stringify({mode:'OFFLINE: fake OBS and Twitch, real WebSocket v5 auth/RPC, server and GUI',checks:['challenge-response authentication and wrong-password rejection','fixed loopback and validated ports; no host/RPC forwarding','owner/Origin/CSRF and option allowlist','status and manual snapshot never start a stream','one explicit StartStream/StopStream RPC per click','disconnect leaves a running stream on','request errors and timeout handling','logout revokes controls','sidebar GUI roundtrip'],errors},null,2)+'\n');
 console.log('PASS: offline OBS authentication, RPC, owner/CSRF gating and GUI controls.');
} finally {client.disconnect();await browser?.close();await service?.stop();for(const socket of fake.clients)socket.terminate();await new Promise(r=>fake.close(r));if(root)await rm(root,{recursive:true,force:true});}
