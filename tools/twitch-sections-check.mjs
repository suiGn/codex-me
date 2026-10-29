import test from 'node:test';
import assert from 'node:assert/strict';
import { readTwitchSection } from '../lib/twitch-sections.mjs';
import { createSpiders } from '../lib/spiders.mjs';
const registry = () => {
  const r = createSpiders({kernelOnly:true});
  r.ensure({userId:'123',user:'owner',profile:{id:'123',login:'owner',display_name:'Owner',profile_image_url:'https://example.invalid/a.png'}});
  return r;
};
test('channel projects only requested public fields and matches broadcaster',async()=>{
 const response={data:[{broadcaster_id:'123',title:'Coding',game_name:'Science & Technology',broadcaster_language:'es',tags:['Coding'],delay:999}]};
 assert.deepEqual(await readTwitchSection(async path=>{assert.equal(path,'channels?broadcaster_id=123');return response;},'123','channel'),{title:'Coding',category:'Science & Technology',language:'es',tags:['Coding']});
 await assert.rejects(readTwitchSection(async()=>response,'456','channel'));
});
test('offline clears all live-only fields instead of preserving a previous broadcast',async()=>{
 const r=registry();
 const live=await readTwitchSection(async()=>({data:[{user_id:'123',title:'Live',game_name:'Coding',viewer_count:8,started_at:'2026-10-28T00:00:00Z'}]}),'123','stream');
 r.importSection('kernel-1','stream',live);
 assert.equal(r.query('kernel-1','twitch.stream.viewers','run').output,8);
 r.importSection('kernel-1','stream',await readTwitchSection(async()=>({data:[]}),'123','stream'));
 assert.equal(r.query('kernel-1','twitch.stream.live','run').output,false);
 assert.equal(r.query('kernel-1','twitch.stream.viewers','run').output,null);
 assert.equal(r.query('kernel-1','twitch.stream.title','run').output,null);
 assert.equal(r.presences()[0].script.match(/me.twitch.stream.live\(/g).length,1);
 assert.equal(r.query('kernel-1','twitch.stream.live','explain').output.value,false);
});
test('stream errors and wrong identities never become offline',async()=>{
 await assert.rejects(readTwitchSection(async()=>{throw Error('503');},'123','stream'));
 await assert.rejects(readTwitchSection(async()=>({}),'123','stream'));
 await assert.rejects(readTwitchSection(async()=>({data:[{user_id:'wrong'}]}),'123','stream'));
});
test('followers imports total including zero, never follower identities',async()=>{
 assert.deepEqual(await readTwitchSection(async()=>({total:0,data:[{user_id:'private-list'}]}),'123','followers'),{total:0});
 await assert.rejects(readTwitchSection(async()=>({data:[]}),'123','followers'));
 await assert.rejects(readTwitchSection(async()=>({total:-1}),'123','followers'));
});
test('unloaded resources and errors are transport metadata, never fabricated facts',()=>{
 const r=registry();
 assert.equal(r.query('kernel-1','twitch.followers.total','run').status,404);
 r.sectionState('kernel-1','followers',{status:'error',error:'Unavailable'});
 assert.equal(r.query('kernel-1','twitch.followers.total','run').status,404);
 assert.equal(r.importSection('kernel-1','followers',{email:'private'}),false);
 assert.equal(r.presences()[0].sections.followers.status,'error');
});
