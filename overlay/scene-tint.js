import OverlaySwatch from '/ui/vendor/overlay-swatch/OverlaySwatch.js';
const R = window.React, h = R.createElement;
const storageKey = 'codex-me:scene-tint';
export function SceneTint({ transparent }) {
  const [revision, setRevision] = R.useState(0);
  R.useEffect(() => {
    const update = event => { if (event.key === storageKey || event.key === null) setRevision(value => value + 1); };
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, []);
  return h(R.Fragment, null,
    h('div', { id: 'scene-tint', 'data-scene-tint': true, 'aria-hidden': true, style: { position: 'absolute', inset: 0, pointerEvents: 'none' } }),
    h(OverlaySwatch, { key: revision, overlay: false, target: '#scene-tint', storageKey, defaultOpacity: 18, size: 32, zIndex: 4,
      style: transparent ? { display: 'none' } : { position: 'absolute', top: 16, left: 16, right: 'auto' },
      title: 'Drag ↔ color · ↕ opacity · Double-click to follow theme' }));
}
