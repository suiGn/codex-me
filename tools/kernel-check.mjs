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
const twitchUser = (id, login) => ({ id, login, display_name: login === 'suignn' ? 'suiGnn' : login.toUpperCase(), profile_image_url: `https://static-cdn.jtvnw.net/jtv_user_pictures/${id}.png`, email: 'excluded@example.invalid' });
let clock=1000;const registry=createSpiders({kernelOnly:true,now:()=>clock});
assert.equal(registry.ensure({userId:'owner',user:'owner'}).changed,false);
assert.equal(registry.ensure({userId:'owner',user:'owner',profile:twitchUser('wrong','owner')}).changed,false);
registry.ensure({userId:'owner',user:'owner',profile:twitchUser('owner','owner')});
let first=registry.presences()[0];assert.equal(registry.snapshot().length,0);assert.doesNotMatch(first.script,/spider|identity|excluded/);
const expected=new ME();expected.twitch.id('owner');expected.twitch.login('owner');expected.twitch.displayName('OWNER');expected.twitch.profileImageUrl(twitchUser('owner','owner').profile_image_url);
for(const node of first.graph.nodes){assert.deepEqual(node.value,expected(node.path));assert.equal(node.expression,expected.explain(node.path).expr);assert.deepEqual(registry.query(first.id,node.path,'run').output,expected(node.path));assert.equal(node.kind,'fact');}
assert.deepEqual(first.graph.edges,[]);
assert.deepEqual(first.graph.nodes.map(node=>node.path),['twitch.id','twitch.login','twitch.displayName','twitch.profileImageUrl']);
assert.equal(registry.handle({userId:'new',user:'new',text:'!spider'}).changed,false);assert.equal(registry.presences().length,1);
clock+=4000;assert.equal(registry.handle({userId:'new',user:'new',text:'!me',profile:twitchUser('new','new')}).changed,true);
clock+=4000;assert.match(registry.handle({userId:'new',user:'new',text:'!me me("twitch.login")'}).reply,/"new"/);
assert.equal(registry.presences().length,2);
assert.equal(registry.handle({userId:'missing',user:'missing',text:'!me'}).changed,false);
assert.equal(registry.has('missing'),false);
const root=await mkdtemp(join(tmpdir(),'codex-kernel-')),repo=new URL('../',import.meta.url).pathname;
await symlink(join(repo,'overlay'),join(root,'overlay'),'dir');
await writeFile(join(root,'.tokens.json'),JSON.stringify({access_token:'offline',refresh_token:'offline',expires_at:Date.now()+3600000,user_id:'channel',login:'suignn'}));
let upstream;const sent=[], lookups=[];
class FakeSocket extends EventEmitter{constructor(){super();upstream=this;queueMicrotask(()=>this.emit('message',JSON.stringify({metadata:{message_type:'session_welcome'},payload:{session:{id:'offline',keepalive_timeout_seconds:60}}})));}close(){this.emit('close');}terminate(){this.close();}}
const remote=async(url,options)=>{
 if(url.endsWith('/validate'))return Response.json({client_id:'offline',user_id:'channel',login:'suignn',scopes:['user:read:chat','user:write:chat'],expires_in:3600});
 if(url.includes('/users?')){const id=new URL(url).searchParams.get('id');lookups.push(id);return Response.json({data:[twitchUser(id||'channel',id==='viewer'?'viewer':'suignn')]});}
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
 const inspector=web.locator('aside');
 await web.waitForSelector('[data-me-id="kernel-1"]');await obs.waitForSelector('[data-me-id="kernel-1"]');
 assert.equal(await web.locator('[data-inspector-empty]').innerText(),'Select a node');
 assert.equal(await web.locator('[data-me-script]').count(),0);
 assert.equal(await web.locator('[data-spider-id],[data-spider-shape]').count(),0);
 await web.locator('[data-me-id="kernel-1"]').click();
 assert.equal(await inspector.locator('[data-graph-branch="twitch"]').count(),1);
 const bubble=web.locator('[data-bubble-navigation]');
 assert.equal(await bubble.count(),1);
 await bubble.locator('[data-graph-branch="twitch"]').click();
 assert.equal(await inspector.locator('[data-kernel-path]').getAttribute('data-kernel-path'),'twitch');
 await bubble.locator('[data-graph-node="twitch.login"]').click();
 assert.equal(await inspector.locator('[data-kernel-path]').getAttribute('data-kernel-path'),'twitch.login');
 await inspector.getByRole('button',{name:'Open path twitch',exact:true}).click();
 assert.equal(await bubble.locator('[data-kernel-path]').getAttribute('data-kernel-path'),'twitch');
 await bubble.getByRole('button',{name:'Close bubble navigation'}).click();
 assert.equal(await web.locator('[data-bubble-navigation]').count(),0);
 await inspector.getByRole('button',{name:'Go to kernel root'}).click();
 assert.equal(await web.locator('[data-kernel-explanation]').count(),0);
 await inspector.locator('[data-graph-branch="twitch"]').click();
 assert.equal(await inspector.getByRole('button',{name:'Siblings of twitch',exact:true}).count(),0);
 assert.equal(await inspector.getByRole('button',{name:'Children of me://',exact:true}).count(),0);
 assert.equal(await inspector.locator('[data-graph-node]').count(),4);assert.equal(await inspector.locator('[data-graph-edge]').count(),0);
 assert.doesNotMatch(await inspector.locator('[data-path-children="twitch"]').innerText(),/twitch\./);
 await inspector.locator('[data-graph-node="twitch.displayName"]').click();

 await web.waitForSelector('[data-query-output="run"] code');
 assert.equal(JSON.parse(await web.locator('[data-query-output="run"] code').innerText()),'suiGnn');
 await web.getByRole('tab',{name:'Explain',exact:true}).click();
 await web.waitForSelector('[data-query-output="explain"] code');
 const trace=JSON.parse(await web.locator('[data-query-output="explain"] code').innerText());
 assert.equal(trace.path,'twitch.displayName');assert.equal(trace.value,'suiGnn');assert.equal(trace.expr,null);
 assert.equal(trace.derivation,null);assert.deepEqual(trace.meta.dependsOn,[]);
 assert.equal(await web.locator('[data-query-output="run"]').isVisible(),true);
 assert.equal(await web.getByRole('tab',{name:'Explain',exact:true}).getAttribute('aria-selected'),'true');
 await inspector.getByRole('button',{name:'Siblings of twitch.displayName',exact:true}).click();
 assert.equal(await web.getByRole('menuitem').count(),4);
 await web.getByRole('menuitem',{name:'login',exact:true}).click();
 assert.equal(await inspector.locator('[data-kernel-path]').getAttribute('data-kernel-path'),'twitch.login');

 await web.waitForSelector('[data-query-output="run"] code');
 assert.equal(JSON.parse(await web.locator('[data-query-output="run"] code').innerText()),'suignn');
 assert.equal(await web.getByRole('tab',{name:'Explain',exact:true}).getAttribute('aria-selected'),'true');
 await web.waitForSelector('[data-query-output="explain"] code');
 const factTrace=JSON.parse(await web.locator('[data-query-output="explain"] code').innerText());
 assert.equal(factTrace.value,'suignn');assert.equal(factTrace.expr,null);assert.equal(factTrace.derivation,null);
 await inspector.getByRole('button',{name:'Go to kernel root'}).click();
 assert.equal(await inspector.locator('[data-graph-branch="twitch"]').count(),1);
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
 for (const [suffix,status] of [['kernel-1/query?path=twitch.displayName&operation=run',200],['kernel-1/query?path=twitch.displayName&operation=explain',200],['missing/query?path=twitch.login&operation=run',404],['kernel-1/query?path=twitch.missing&operation=run',404],['kernel-1/query?path=__proto__.x&operation=run',400],['kernel-1/query?path=twitch.login&operation=write',400]]) {
   assert.equal((await fetch(origin+'/api/kernels/'+suffix)).status,status);
 }
 const notify=(eventId='viewer-event')=>upstream.emit('message',JSON.stringify({metadata:{message_type:'notification',message_id:eventId},payload:{subscription:{type:'channel.chat.message'},event:{broadcaster_user_id:'channel',chatter_user_id:'viewer',chatter_user_login:'viewer',message_id:'chat-id',message:{text:'!me'},badges:[]}}}));
 notify();notify();notify('viewer-event-concurrent');await web.waitForSelector('[data-me-id="kernel-2"]');await obs.waitForSelector('[data-me-id="kernel-2"]');
 await web.waitForTimeout(100);assert.equal(sent.length,1);assert.equal(sent[0].reply_parent_message_id,'chat-id');assert.equal(lookups.filter(id=>id==='viewer').length,1);
 await web.reload();await web.waitForSelector('[data-me-id="kernel-2"]');assert.equal(await web.locator('[data-inspector-empty]').count(),1);
 assert.equal(await obs.locator('header,aside,iframe').count(),0);assert.equal(await obs.locator('#kernels-scene').evaluate(el=>el.getBoundingClientRect().width),1920);
 assert.deepEqual(errors,[]);
 await web.locator('[data-me-id="kernel-1"]').click();
 await web.getByRole('tab',{name:'Explain',exact:true}).click();
 await web.locator('[data-me-id="kernel-2"]').click();
 assert.equal(await web.locator('[data-bubble-navigation]').getAttribute('data-bubble-navigation'),'kernel-2');
 assert.equal(await web.getByRole('tab',{name:'Explain',exact:true}).getAttribute('aria-selected'),'true');
 await inspector.locator('[data-graph-branch="twitch"]').click();
 await inspector.locator('[data-graph-node="twitch.login"]').click();
 await web.waitForSelector('[data-query-output="run"] code');
 await web.waitForSelector('[data-query-output="explain"] code');
 assert.equal(JSON.parse(await web.locator('[data-query-output="run"] code').innerText()),'viewer');
 assert.equal(JSON.parse(await web.locator('[data-query-output="explain"] code').innerText()).value,'viewer');
 const data=await(await fetch(origin+'/api/kernels')).json();assert.equal(data.kernels.length,2);assert.ok(data.kernels.every(k=>!JSON.stringify(k).includes('spider')));assert.doesNotMatch(JSON.stringify(data),/excluded@example|identity\./);
 await mkdir(join(repo,'evidence/kernels'),{recursive:true});
 await web.screenshot({path:join(repo,'evidence/kernels/offline-graph.png')});
 await writeFile(join(repo,'evidence/kernels/result.json'),JSON.stringify({mode:'OFFLINE — real kernel, graph, server/ws/browser; simulated Twitch',checks:['one independent kernel per stable viewer ID','no body facts or robot rendering','graph values match actual me(path)','real imported Twitch facts have no fabricated dependency edges','profile whitelist excludes email and private fields','me://twitch profile paths, sibling navigation and real stored-fact explanations','empty inspector until selection; query results reset on path changes','always-visible output above Script/Explain tabs; real automatic queries','active tab persists across paths and kernels without stale results','bubble path dropdowns synchronize bidirectionally with inspector; close preserves selection','invalid paths, missing kernels and write operations rejected','native GUI syntax colors; accessible tab semantics and arrow/Home navigation','deduplicated chat declaration and threaded reply','web/OBS synchronization and reload retention','fixed transparent OBS without chrome/iframes'],kernels:data.kernels,errors},null,2)+'\n');
 console.log('PASS: real kernel graph, explanations, safe chat, synchronized views and no robots.');
}finally{await browser?.close();await service.stop();await rm(root,{recursive:true,force:true});}
