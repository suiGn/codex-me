import assert from 'node:assert/strict';
import { createSpiders, parseMeChat } from '../lib/spiders.mjs';
let time = 1000;
const registry = createSpiders({ now: () => time });
const send = (userId, user, text) => { time += 4000; return registry.handle({ userId, user, text }); };
assert.equal(send('alice', 'alice', '!me').changed, true);
assert.equal(registry.presences().length, 1); assert.equal(registry.snapshot().length, 0);
const presence = registry.presences()[0]; assert.equal(presence.attached, false);
assert.match(presence.presenceReason, /identity.present = true because registered \[registered=true\]/);
assert.equal(send('alice','alice','!me new ME()').changed,false);
assert.equal(send('alice','alice','!me me("identity.owner")').reply,'@alice identity.owner = "alice"');
assert.equal(send('alice','alice','!me me.spider.registered(true)').changed,true);
assert.equal(registry.snapshot().length,1); assert.equal(registry.presences().length,1);
assert.equal(registry.snapshot()[0].id,presence.id);
assert.match(registry.snapshot()[0].script,/me.spider.owner\["->"\]\("identity.owner"\)/);
assert.match(send('alice','alice','!me me.explain("spider.created")').reply,/spider.created = true because registered/);
assert.equal(send('alice','alice','!spider').changed,false);
assert.equal(send('bob','bob','!me new ME()').changed,true);
assert.equal(registry.presences().length,2);assert.equal(registry.snapshot().length,1);
assert.equal(send('bob','bob','!me me("identity.owner")').reply,'@bob identity.owner = "bob"');
for (const text of ['!me process.exit()', '!me new ME("someone")', '!me me.spider.registered(false)', '!me me("identity.__proto__")', '!me me("constructor")', '!me me.identity.owner("alice")', '!me me["="]("x", "true")', '!me me("identity.owner"); process.exit()']) {
 assert.equal(parseMeChat(text).kind,'invalid',text);assert.equal(send('bob','bob',text).changed,false);
}
assert.equal(registry.presences().length,2);assert.equal(registry.snapshot().length,1);
assert.match(send('charlie','charlie','!me me("identity.owner")').reply,/Declare your .me first/);
assert.equal(registry.presences().length,2);
console.log('PASS: explicit presence, one kernel, attach once, independent readers, real explain, pointer association and rejected code/ownership writes');
