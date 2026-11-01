let tint = null;
const listeners = new Set();
export function receiveTint(value) { tint = value; for (const notify of listeners) notify(); }
const subscribe = notify => { listeners.add(notify); return () => listeners.delete(notify); };
export const useTint = () => React.useSyncExternalStore(subscribe, () => tint);
