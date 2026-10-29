import ME from '../overlay/vendor/this.me-4.2.1.es.js';
import { createRateLimiter, parsePath } from '../overlay/commands.js';
import { read, reason } from '../overlay/world.js';

// This is a whitelist parser for chat text, never a JavaScript interpreter.
export function parseMeChat(text) {
  const t = String(text || '').trim();
  if (/^!spider\s*$/i.test(t)) return { kind: 'create' };
  if (/^!explain\s*$/i.test(t)) return { kind: 'explain' };
  if (!/^!me(?:\s|$)/i.test(t)) return null;
  const syntax = t.replace(/^!me\s*/i, '').replace(/;$/, '').trim();
  if (!syntax || syntax === 'new ME()') return { kind: 'presence' };
  if (syntax === 'me.spider.registered(true)') return { kind: 'attach' };
  const m = /^me(\.explain)?\("([^"\\]{1,96})"\)$/.exec(syntax);
  if (m) {
    try { const path = parsePath(m[2]).path; return { kind: m[1] ? 'explain' : 'read', path }; } catch {}
  }
  return { kind: 'invalid' };
}

// One independent, server-owned kernel per stable Twitch user ID. Session-only.
export function createSpiders({ now = Date.now, kernelOnly = false } = {}) {
  const entries = new Map();
  const writes = createRateLimiter({ gapMs: 3000, burst: 5, windowMs: 30000 });
  const reads = createRateLimiter({ gapMs: 1000, burst: 10, windowMs: 30000 });
  // Projection of public kernel memories and real explain() dependency inputs.
  const graph = me => {
    const memories = new Map(me.exportSnapshot().memories.map(memory => [memory.path, memory]));
    const nodes = [...memories.values()].map(memory => {
      const trace = me.explain(memory.path);
      return { path: memory.path, value: me(memory.path), kind: memory.operator === '=' ? 'derived' : memory.operator === '->' ? 'pointer' : 'fact',
        expression: trace.expr ?? null, explanation: reason(me, memory.path),
        inputs: (trace.derivation?.inputs || []).map(input => ({ path: input.path, value: input.value })) };
    });
    return { nodes, edges: nodes.flatMap(node => node.inputs.map(input => ({ source: input.path, target: node.path, kind: 'dependsOn' }))) };
  };
  const describe = entry => ({ id: entry.id, owner: entry.me('identity.owner'), createdAt: entry.me('identity.createdAt'),
    present: entry.me('identity.present'), attached: entry.me('spider.created') === true, created: entry.me('spider.created') === true,
    capabilities: ['presence', 'create'], presenceReason: reason(entry.me, 'identity.present'),
    reason: reason(entry.me, entry.me('spider.created') === true ? 'spider.created' : 'identity.present'), script: entry.script.join('\n'), ...(kernelOnly ? { graph: graph(entry.me) } : {}) });
  const declare = owner => {
    const me = new ME(), createdAt = now(), id = `${kernelOnly ? 'kernel' : 'spider'}-${entries.size + 1}`;
    me.identity.owner(owner); me.identity.createdAt(createdAt); me.identity.registered(true); me.identity['=']('present', 'registered');
    return { id, me, script: ['const me = new ME();', `me.identity.owner(${JSON.stringify(owner)});`, `me.identity.createdAt(${createdAt});`,
      'me.identity.registered(true);', 'me.identity["="]("present", "registered");'] };
  };
  const attach = entry => {
    const me = entry.me;
    me.spider.owner['->']('identity.owner'); me.spider.capabilities.create(true); me.spider.registered(true); me.spider['=']('created', 'registered');
    entry.script.push('me.spider.owner["->"]("identity.owner");', 'me.spider.capabilities.create(true);', 'me.spider.registered(true);', 'me.spider["="]("created", "registered");');
  };
  return {
    // Trusted bootstrap, using the channel identity resolved by Twitch (never chat-supplied IDs).
    ensure({ userId, user }) {
      const owner = String(user || '').toLowerCase();
      if (!userId || !/^[a-z0-9_]{1,25}$/.test(owner)) return { changed: false };
      let entry = entries.get(userId), changed = false;
      if (!entry) { entry = declare(owner); entries.set(userId, entry); changed = true; }
      if (!kernelOnly && entry.me('spider.created') !== true) { attach(entry); changed = true; }
      return { changed, id: entry.id };
    },
    query(id, path, operation) {
      const entry = [...entries.values()].find(entry => entry.id === id);
      if (!entry) return { status: 404, error: 'Kernel not found' };
      if (!['run', 'explain'].includes(operation)) return { status: 400, error: 'Invalid operation' };
      try { path = parsePath(path).path; } catch { return { status: 400, error: 'Invalid path' }; }
      if (!entry.me.exportSnapshot().memories.some(memory => memory.path === path)) return { status: 404, error: 'Path not found' };
      return { status: 200, output: operation === 'explain' ? entry.me.explain(path) : entry.me(path) };
    },
    snapshot: () => [...entries.values()].filter(e => e.me('spider.created') === true).map(describe),
    presences: () => [...entries.values()].map(describe),
    handle({ userId, user, text }) {
      const command = parseMeChat(text); if (!command) return null;
      const owner = String(user || '').toLowerCase();
      if (!userId || !/^[a-z0-9_]{1,25}$/.test(owner)) return { reply: null, changed: false };
      const limiter = ['read', 'explain'].includes(command.kind) ? reads : writes;
      if (!limiter.check(userId, now()).ok) return { reply: null, changed: false };
      const reply = (message, changed = false, id) => ({ reply: `@${owner} ${message}`.slice(0, 450), changed, ...(id ? { id } : {}) });
      if (kernelOnly && ['create', 'attach'].includes(command.kind)) return reply('This demo uses .me kernels. Declare yours with !me; inspect a path with !me me("identity.owner") or !explain.');
      if (command.kind === 'invalid') return reply(kernelOnly ? 'Syntax: !me · !me me("identity.owner") · !me me.explain("identity.present")' : 'Syntax: !me · !me me.spider.registered(true) · !me me("identity.owner") · !me me.explain("spider.created")');
      let entry = entries.get(userId), changed = false;
      if (!entry && ['presence', 'create'].includes(command.kind)) { entry = declare(owner); entries.set(userId, entry); changed = true; }
      if (!entry) return reply(kernelOnly ? 'Declare your kernel first: !me' : 'Declare your .me first: !me (or create both with !spider)');
      if (command.kind === 'presence') return reply(`${changed ? 'Your .me is here.' : 'Your .me is already here.'} ${reason(entry.me, 'identity.present')}`, changed, entry.id);
      if (command.kind === 'read') return reply(`${command.path} = ${read(entry.me, command.path).text}`);
      if (command.kind === 'explain') return reply(reason(entry.me, command.path || (entry.me('spider.created') === true ? 'spider.created' : 'identity.present')));
      if (entry.me('spider.created') === true) return reply(`You already have a Spider. ${reason(entry.me, 'spider.created')}`);
      attach(entry);
      return reply(`Your Spider is attached to your .me. ${reason(entry.me, 'spider.created')}`, true, entry.id);
    }
  };
}
