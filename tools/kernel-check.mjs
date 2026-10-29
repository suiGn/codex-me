// Offline proof: actual this.me 4.2.1 kernels and explanations; simulated Twitch, real server/ws/browser.
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtemp, symlink, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { chromium } from 'playwright';
import ME from '../overlay/vendor/this.me-4.2.1.es.js';
import { createSpiders } from '../lib/spiders.mjs';
import { createApp } from '../server.mjs';
import { pathChildren, pathParts, joinPath } from '../overlay/kernel-paths.js';
const nested=[{path:'identity.owner',value:'a'},{path:'identity.present',value:true},{path:'items[0].value',value:1},{path:'identityExtra.value',value:2}];
assert.deepEqual(pathChildren(nested).map(n=>n.path),['identity','items','identityExtra']);
assert.deepEqual(pathChildren(nested,'identity').map(n=>n.name),['owner','present']);
assert.equal(pathChildren(nested,'items')[0].path,'items[0]');
assert.equal(pathChildren(nested,'items[0]')[0].node.value,1);
assert.equal(joinPath(pathParts('items[0].value')),'items[0].value');
let clock=1000;const registry=createSpiders({kernelOnly:true,now:()=>clock});
registry.ensure({userId:'owner',user:'owner'});
let first=registry.presences()[0];assert.equal(registry.snapshot().length,0);assert.doesNotMatch(first.script,/spider/);
const expected=new ME();expected.identity.owner('owner');expected.identity.createdAt(1000);expected.identity.registered(true);expected.identity['=']('present','registered');
for(const node of first.graph.nodes){assert.deepEqual(node.value,expected(node.path));assert.equal(node.expression,expected.explain(node.path).expr);assert.deepEqual(registry.query(first.id,node.path,'run').output,expected(node.path));}
assert.deepEqual(first.graph.edges,[{source:'identity.registered',target:'identity.present',kind:'dependsOn'}]);
assert.match(first.graph.nodes.find(n=>n.path==='identity.present').explanation,/identity.present = true because registered \[registered=true\]/);
assert.equal(registry.handle({userId:'new',user:'new',text:'!spider'}).changed,false);assert.equal(registry.presences().length,1);
clock+=4000;assert.equal(registry.handle({userId:'new',user:'new',text:'!me'}).changed,true);
clock+=4000;assert.match(registry.handle({userId:'new',user:'new',text:'!me me("identity.owner")'}).reply,/"new"/);
assert.equal(registry.presences().length,2);
const root=await mkdtemp(join(tmpdir(),'codex-kernel-')),repo=new URL('../',import.meta.url).pathname;
await symlink(join(repo,'overlay'),join(root,'overlay'),'dir');
await writeFile(join(root,'.tokens.json'),JSON.stringify({access_token:'offline',refresh_token:'offline',expires_at:Date.now()+3600000,user_id:'channel',login:'suignn'}));
let upstream;const sent=[];
class FakeSocket extends EventEmitter{constructor(){super();upstream=this;queueMicrotask(()=>this.emit('message',JSON.stringify({metadata:{message_type:'session_welcome'},payload:{session:{id:'offline',keepalive_timeout_seconds:60}}})));}close(){this.emit('close');}terminate(){this.close();}}
const remote=async(url,options)=>{
 if(url.endsWith('/validate'))return Response.json({client_id:'offline',user_id:'channel',login:'suignn',scopes:['user:read:chat','user:write:chat'],expires_in:3600});
 if(url.includes('/users?'))return Response.json({data:[{id:'channel',login:'suignn',display_name:'suiGnn'}]});
 if(url.endsWith('/subscriptions'))return Response.json({data:[{id:'offline'}]});
 if(url.endsWith('/chat/messages')){sent.push(JSON.parse(options.body));return Response.json({data:[{is_sent:true}]});}
 throw Error('Unexpected endpoint');
};
const port=process.env.CHECK_PORT||'3018',origin=`http://localhost:${port}`,errors=[];
const service=createApp({PORT:port,TWITCH_CLIENT_ID:'offline',TWITCH_CLIENT_SECRET:'offline',TWITCH_CHANNEL:'suignn'},{root,fetch:remote,Socket:FakeSocket,logger:{log(){}}});let browser;
try{
 await service.start();browser=await chromium.launch(process.env.CHROME?{executablePath:process.env.CHROME}:{});
 const context=await browser.newContext({viewport:{width:1280,height:960}});
 for(const [url,path]of [['react@18.3.1/umd/react.production.min.js','react/umd/react.production.min.js'],['react-dom@18.3.1/umd/react-dom.production.min.js','react-dom/umd/react-dom.production.min.js'],['this.gui@4.2.1/dist/this.gui.umd.js','this.gui/dist/this.gui.umd.js']]){const body=await readFile(join(repo,'node_modules',path));await context.route('https://cdn.jsdelivr.net/npm/'+url,route=>route.fulfill({contentType:'text/javascript',body}));}
 const web=await context.newPage(),obs=await context.newPage({viewport:{width:1920,height:1080}});
 for(const page of[web,obs]){page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(30000);}
 await web.goto(origin+'/overlay/?dev=0');await obs.goto(origin+'/overlay/?transparent=1&dev=0');
 await web.waitForSelector('[data-me-id="kernel-1"]');await obs.waitForSelector('[data-me-id="kernel-1"]');
 assert.equal(await web.locator('[data-inspector-empty]').innerText(),'Select a node');
 assert.equal(await web.locator('[data-me-script]').count(),0);
 assert.equal(await web.locator('[data-spider-id],[data-spider-shape]').count(),0);
 await web.locator('[data-me-id="kernel-1"]').click();
 assert.equal(await web.locator('[data-graph-branch="identity"]').count(),1);
 assert.equal(await web.locator('[data-kernel-explanation]').count(),0);
 await web.locator('[data-graph-branch="identity"]').click();
 assert.equal(await web.getByRole('button',{name:'Siblings of identity',exact:true}).count(),0);
 assert.equal(await web.getByRole('button',{name:'Children of me://',exact:true}).count(),0);
 assert.equal(await web.locator('[data-graph-node]').count(),4);assert.equal(await web.locator('[data-graph-edge]').count(),1);
 assert.doesNotMatch(await web.locator('[data-path-children="identity"]').innerText(),/identity\./);
 await web.locator('[data-graph-node="identity.present"]').click();

 await web.waitForSelector('[data-query-output="run"] code');
 assert.equal(JSON.parse(await web.locator('[data-query-output="run"] code').innerText()),true);
 await web.getByRole('tab',{name:'Explain',exact:true}).click();
 await web.waitForSelector('[data-query-output="explain"] code');
 const trace=JSON.parse(await web.locator('[data-query-output="explain"] code').innerText());
 assert.equal(trace.path,'identity.present');assert.equal(trace.value,true);assert.equal(trace.expr,'registered');
 assert.equal(trace.derivation.inputs[0].path,'identity.registered');assert.deepEqual(trace.meta.dependsOn,['identity.registered']);
 assert.equal(await web.locator('[data-query-output="run"]').isVisible(),true);
 assert.equal(await web.getByRole('tab',{name:'Explain',exact:true}).getAttribute('aria-selected'),'true');
 await web.getByRole('button',{name:'Siblings of identity.present',exact:true}).click();
 assert.equal(await web.getByRole('menuitem').count(),4);
 await web.getByRole('menuitem',{name:'owner',exact:true}).click();
 assert.equal(await web.locator('[data-kernel-path]').getAttribute('data-kernel-path'),'identity.owner');

 await web.waitForSelector('[data-query-output="run"] code');
 assert.equal(JSON.parse(await web.locator('[data-query-output="run"] code').innerText()),'suignn');
 assert.equal(await web.getByRole('tab',{name:'Explain',exact:true}).getAttribute('aria-selected'),'true');
 await web.waitForSelector('[data-query-output="explain"] code');
 const factTrace=JSON.parse(await web.locator('[data-query-output="explain"] code').innerText());
 assert.equal(factTrace.value,'suignn');assert.equal(factTrace.expr,null);assert.equal(factTrace.derivation,null);
 await web.getByRole('button',{name:'Go to kernel root'}).click();
 assert.equal(await web.locator('[data-graph-branch="identity"]').count(),1);
 assert.equal(await web.getByRole('tab').count(),2);
 assert.equal(await web.getByRole('tab',{name:'Explain',exact:true}).getAttribute('aria-selected'),'true');
 await web.getByRole('tab',{name:'Script',exact:true}).click();
 assert.equal(await web.getByRole('button',{name:'Run me()',exact:true}).count(),0);
 assert.equal(await web.getByRole('tab',{name:'Script',exact:true}).getAttribute('aria-selected'),'true');
 assert.match(await web.locator('[data-me-script] code').innerText(),/new ME/);
 assert.doesNotMatch(await web.locator('[data-me-script] code').innerText(),/spider/);
 await web.getByRole('tab',{name:'Script',exact:true}).press('ArrowRight');
 assert.equal(await web.getByRole('tab',{name:'Explain',exact:true}).getAttribute('aria-selected'),'true');
 assert.match(await web.getByRole('tabpanel').innerText(),/Select a path/);
 await web.getByRole('tab',{name:'Explain',exact:true}).press('Home');
 assert.equal(await web.getByRole('tab',{name:'Script',exact:true}).getAttribute('aria-selected'),'true');
 for (const [suffix,status] of [['kernel-1/query?path=identity.present&operation=run',200],['kernel-1/query?path=identity.present&operation=explain',200],['missing/query?path=identity.owner&operation=run',404],['kernel-1/query?path=identity.missing&operation=run',404],['kernel-1/query?path=__proto__.x&operation=run',400],['kernel-1/query?path=identity.owner&operation=write',400]]) {
   assert.equal((await fetch(origin+'/api/kernels/'+suffix)).status,status);
 }
 const notify=()=>upstream.emit('message',JSON.stringify({metadata:{message_type:'notification',message_id:'viewer-event'},payload:{subscription:{type:'channel.chat.message'},event:{broadcaster_user_id:'channel',chatter_user_id:'viewer',chatter_user_login:'viewer',message_id:'chat-id',message:{text:'!me'},badges:[]}}}));
 notify();notify();await web.waitForSelector('[data-me-id="kernel-2"]');await obs.waitForSelector('[data-me-id="kernel-2"]');
 await web.waitForTimeout(100);assert.equal(sent.length,1);assert.equal(sent[0].reply_parent_message_id,'chat-id');
 await web.reload();await web.waitForSelector('[data-me-id="kernel-2"]');assert.equal(await web.locator('[data-inspector-empty]').count(),1);
 assert.equal(await obs.locator('header,aside,iframe').count(),0);assert.equal(await obs.locator('#kernels-scene').evaluate(el=>el.getBoundingClientRect().width),1920);
 assert.deepEqual(errors,[]);
 await web.locator('[data-me-id="kernel-1"]').click();
 await web.getByRole('tab',{name:'Explain',exact:true}).click();
 await web.locator('[data-me-id="kernel-2"]').click();
 assert.equal(await web.getByRole('tab',{name:'Explain',exact:true}).getAttribute('aria-selected'),'true');
 await web.locator('[data-graph-branch="identity"]').click();
 await web.locator('[data-graph-node="identity.owner"]').click();
 await web.waitForSelector('[data-query-output="run"] code');
 await web.waitForSelector('[data-query-output="explain"] code');
 assert.equal(JSON.parse(await web.locator('[data-query-output="run"] code').innerText()),'viewer');
 assert.equal(JSON.parse(await web.locator('[data-query-output="explain"] code').innerText()).value,'viewer');
 const data=await(await fetch(origin+'/api/kernels')).json();assert.equal(data.kernels.length,2);assert.ok(data.kernels.every(k=>!JSON.stringify(k).includes('spider')));
 await mkdir(join(repo,'evidence/kernels'),{recursive:true});
 await web.screenshot({path:join(repo,'evidence/kernels/offline-graph.png')});
 await writeFile(join(repo,'evidence/kernels/result.json'),JSON.stringify({mode:'OFFLINE — real kernel, graph, server/ws/browser; simulated Twitch',checks:['one independent kernel per stable viewer ID','no body facts or robot rendering','graph values match actual me(path)','dependency edge comes from actual explain inputs','hierarchical path children, array path grouping, sibling menu, breadcrumbs and real leaf explanations','empty inspector until selection; query results reset on path changes','always-visible output above Script/Explain tabs; real automatic queries','active tab persists across paths and kernels without stale results','invalid paths, missing kernels and write operations rejected','native GUI syntax colors; accessible tab semantics and arrow/Home navigation','deduplicated chat declaration and threaded reply','web/OBS synchronization and reload retention','fixed transparent OBS without chrome/iframes'],kernels:data.kernels,errors},null,2)+'\n');
 console.log('PASS: real kernel graph, explanations, safe chat, synchronized views and no robots.');
}finally{await browser?.close();await service.stop();await rm(root,{recursive:true,force:true});}
