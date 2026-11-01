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
 browser=await chromium.launch(process.env.CHROME?{executablePath:process.env.CHROME}:{});
 const context=await browser.newContext({viewport:{width:1280,height:960}});
 for(const[url,path]of[['react@18.3.1/umd/react.production.min.js','react/umd/react.production.min.js'],['react-dom@18.3.1/umd/react-dom.production.min.js','react-dom/umd/react-dom.production.min.js'],['this.gui@4.2.1/dist/this.gui.umd.js','this.gui/dist/this.gui.umd.js']]){const body=await readFile(join(repo,'node_modules',path));await context.route('https://cdn.jsdelivr.net/npm/'+url,r=>r.fulfill({contentType:'text/javascript',body}));}
 await context.route('https://player.twitch.tv/**',r=>r.fulfill({contentType:'text/html',body:'<p>Offline Twitch video fixture</p>'}));
 await context.route('https://www.twitch.tv/embed/**',r=>r.fulfill({contentType:'text/html',body:'Offline Twitch chat'}));

 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
 await page.goto(origin+'/overlay/?dev=0');await page.locator('[data-me-bubble="kernel-1"]').click();
 const card=page.locator('[data-bubble-navigation]');await card.getByRole('tab',{name:'Channel',exact:true}).click();
 const field=card.getByRole('combobox',{name:'Category',exact:true});await field.waitFor();await field.click();
 const popular=page.getByRole('listbox',{name:'Popular Twitch categories',exact:true});await popular.getByRole('option',{name:'Just Chatting',exact:true}).waitFor();
 assert.equal(await popular.evaluate(el=>el.parentElement===document.body),true);
 await field.fill('M');await page.getByText('Type at least 2 characters to search',{exact:true}).first().waitFor();assert.equal(await page.getByRole('listbox').getByRole('option').count(),0);
 await field.fill('Music');const list=page.getByRole('listbox',{name:'Twitch categories',exact:true});await list.getByRole('option',{name:'Music',exact:true}).waitFor();
 assert.equal(await card.getByRole('button',{name:'Save to Twitch',exact:true}).isEnabled(),false);
 await field.press('ArrowDown');await list.getByRole('option',{name:'Music',exact:true}).press('Enter');
 await page.waitForFunction(()=>!document.querySelector('[role="listbox"]'));assert.equal(await field.inputValue(),'Music');assert.equal(await card.getByRole('button',{name:'Save to Twitch',exact:true}).isEnabled(),true);
 await card.getByRole('button',{name:'Cancel',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[data-bubble-navigation] input[role=combobox]')?.value==='');
 await field.click();await popular.getByRole('option',{name:'Just Chatting',exact:true}).waitFor();assert.equal(calls.filter(v=>v==='popular').length,1);
 await field.fill('missing');await list.getByText('No categories found',{exact:true}).waitFor();
 await field.fill('fail');await list.getByRole('alert').waitFor();
 await field.fill('Music');await list.getByRole('option',{name:'Music',exact:true}).waitFor();
 await field.press('Escape');await page.waitForFunction(()=>!document.querySelector('[role="listbox"]'));
 await field.click();await list.getByRole('option',{name:'Music',exact:true}).waitFor();await card.getByRole('textbox',{name:'Title',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('[role="listbox"]'));
 assert.equal((await fetch(origin+'/api/kernels/kernel-1/categories?query=x')).status,400);assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
 await field.fill('Music');await list.getByRole('option',{name:'Music',exact:true}).waitFor();
 await mkdir(join(repo,'evidence/categories'),{recursive:true});await page.screenshot({path:join(repo,'evidence/categories/offline-picker.png')});
 await writeFile(join(repo,'evidence/categories/result.json'),JSON.stringify({mode:'OFFLINE: real server and GUI, simulated Twitch; no channel writes',checks:['popular categories on focus without typing','portal avoids card clipping','one-character guidance','search results and genuine empty/error states','arbitrary typed text cannot save without a verified ID','keyboard pick closes popup and preserves ID','cancel does not write','popular/search cache','Escape/outside focus closes list','no browser errors or channel writes'],calls,errors},null,2)+'\n');
 console.log('PASS: category defaults, search, portal, keyboard pick, validation, cancel and error states.');
}finally{await browser?.close();await service.stop();await rm(root,{recursive:true,force:true});}
