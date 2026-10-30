// Tracking updates only redraw the companion/mesh, never the player, chat or forms.
let face = null, expiry;
const listeners = new Set();
export function receiveFace(value) {
  clearTimeout(expiry); face = value;
  for (const notify of listeners) notify();
  if (value) expiry = setTimeout(() => receiveFace(null), Math.max(0, 2000 - (Date.now() - value.at)));
}
const subscribe = notify => { listeners.add(notify); return () => listeners.delete(notify); };
export const useFace = () => React.useSyncExternalStore(subscribe, () => face);
