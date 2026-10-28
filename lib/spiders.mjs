import ME from '../overlay/vendor/this.me-4.2.1.es.js';
import { createRateLimiter } from '../overlay/commands.js';

// One server-owned kernel per Twitch user ID. Browser reloads cannot create duplicates.
// Deliberately session-only: no credentials, database, movement loop or physics.
export function createSpiders({ now = Date.now } = {}) {
  const entries = new Map();
  const limits = createRateLimiter({ gapMs: 3000, burst: 5, windowMs: 30000 });
  const describe = entry => {
    const e = entry.me.explain('spider.created');
    const inputs = (e.derivation?.inputs || []).map(i => `${i.label}=${JSON.stringify(i.value)}`).join(', ');
    return { id: entry.id, owner: entry.me('spider.owner'), createdAt: entry.me('spider.createdAt'),
      created: entry.me('spider.created'), capabilities: ['create'],
      reason: `${e.path} = ${e.value} because ${e.expr} [${inputs}]`, script: entry.script };
  };
  return {
    snapshot: () => [...entries.values()].map(describe),
    handle({ userId, user, text }) {
      const match = /^!(spider|explain)\s*$/i.exec(text.trim());
      if (!match) return null;
      const owner = String(user || '').toLowerCase();
      if (!userId || !/^[a-z0-9_]{1,25}$/.test(owner)) return { reply: null, changed: false };
      if (!limits.check(userId, now()).ok) return { reply: null, changed: false };
      const existing = entries.get(userId);
      if (existing) return { reply: `@${owner} ${match[1].toLowerCase() === 'spider' ? 'You already have a Spider. ' : ''}${describe(existing).reason}`, changed: false };
      if (match[1].toLowerCase() === 'explain') return { reply: `@${owner} Create your Spider first: !spider`, changed: false };
      const me = new ME(), id = `spider-${entries.size + 1}`, createdAt = now();
      me.spider.owner(owner); me.spider.createdAt(createdAt); me.spider.capabilities.create(true);
      me.spider.registered(true); me.spider['=']('created', 'registered');
      const script = ['const me = new ME();', `me.spider.owner(${JSON.stringify(owner)});`, `me.spider.createdAt(${createdAt});`,
        'me.spider.capabilities.create(true);', 'me.spider.registered(true);', 'me.spider["="]("created", "registered");', 'me.explain("spider.created");'].join('\n');
      const entry = { id, me, script }; entries.set(userId, entry);
      return { reply: `@${owner} Your Spider is here. ${describe(entry).reason}`, changed: true, id };
    }
  };
}
