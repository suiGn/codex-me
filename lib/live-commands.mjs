import { parsePath } from '../overlay/commands.js';
const number = token => /^\d{1,3}(?:\.\d{1,2})?$/.test(token || '') && Number(token) <= 100 ? Number(token) : null;
export function liveCommand(text) {
  const words = text.trim().split(/\s+/);
  if (/^!explain$/i.test(words[0]) && words.length === 2) {
    try { return { kind: 'explain', path: parsePath(words[1]).path }; } catch { return { kind: 'invalid' }; }
  }
  if (!/^!me$/i.test(words[0])) return null;
  const [, action, ...args] = words;
  if (['on','off'].includes(action) && !args.length) return { kind: 'set', field: 'enabled', value: action === 'on' };
  if (['read','explain'].includes(action) && args.length === 1) {
    try { return { kind: action, path: parsePath(args[0]).path }; } catch { return { kind: 'invalid' }; }
  }
  if (action === 'set' && args.length === 2) {
    if (args[0] === 'energy' && number(args[1]) !== null) return { kind: 'set', field: 'energy', value: number(args[1]) };
    if (args[0] === 'enabled' && ['true','false'].includes(args[1])) return { kind: 'set', field: 'enabled', value: args[1] === 'true' };
    return { kind: 'invalid' };
  }
  if (action === 'rule') {
    if (args[0] !== 'active') return { kind: 'invalid' };
    if (args[1] === 'threshold' && args.length === 3 && number(args[2]) !== null)
      return { kind: 'rule', expression: `enabled && energy > ${number(args[2])}` };
    if (args[1] === 'compare' && args[2] === 'energy' && ['>','>=','<','<=','==','!='].includes(args[3]) && args.length === 5 && number(args[4]) !== null)
      return { kind: 'rule', expression: `enabled && energy ${args[3]} ${number(args[4])}` };
    if (args[1] === 'and' && args.length === 4 && args.slice(2).every(path => ['enabled','face.present'].includes(path)))
      return { kind: 'rule', expression: [...new Set(['enabled', ...args.slice(2)])].join(' && ') };
    return { kind: 'invalid' };
  }
  return null;
}
export const LIVE_HELP = '!me · !me on/off · !me set energy 20 · !me rule active threshold 30 · !me rule active compare energy >= 30 · !me rule active and enabled face.present · !me read active · !me explain active. Writes: enabled/energy only; face.* is read-only. Wait 3s between writes.';
