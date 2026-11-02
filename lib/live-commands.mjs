import { parsePath } from '../overlay/commands.js';
export function liveCommand(text) {
  const words = text.trim().split(/\s+/);
  if (/^!explain$/i.test(words[0]) && words.length === 2) {
    try { return { kind: 'explain', path: parsePath(words[1]).path }; } catch { return { kind: 'invalid' }; }
  }
  if (!/^!me$/i.test(words[0])) return null;
  const [, action, ...args] = words;
  if (action === 'leave' && args.length === 0) return { kind: 'leave' };
  if (['read','explain'].includes(action) && args.length === 1) {
    try { return { kind: action, path: parsePath(args[0]).path }; } catch { return { kind: 'invalid' }; }
  }
  return null;
}
export const LIVE_HELP = '!me · !me leave · !me read twitch.profile.login · !explain. Camera paths belong only to the channel owner. No chat writes to facts or rules.';
