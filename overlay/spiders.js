import { createThemeControls } from './theme-controls.js';
const G = window.GUI, h = React.createElement;
const { Box, Typography, Button, Card, CardContent } = G.Atoms;
const { ThemeSelector, ModeToggle } = createThemeControls(G, React);
const transparent = new URLSearchParams(location.search).get('transparent') === '1';
if (transparent) document.body.classList.add('transparent');
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' };
const ink = { fill: 'currentColor', stroke: 'currentColor' };
function Spider({ spider, index, count, onSelect }) {
  const columns = Math.max(1, Math.ceil(Math.sqrt(count * 16 / 9))), rows = Math.ceil(count / columns);
  const x = (index % columns + 0.5) * 1600 / columns + 160, y = (Math.floor(index / columns) + 0.5) * 780 / rows + 110;
  const scale = Math.min(2.8, 1600 / columns / 145, 780 / rows / 100);
  const legs = [];
  for (const side of [-1, 1]) for (let j = 0; j < 4; j++) legs.push(h('polyline', { key: `${side}:${j}`, points: `${side * 5},${-7 + j * 4} ${side * (17 + Math.abs(j - 1.5) * 2)},${-22 + j * 11} ${side * 29},${-30 + j * 19}`, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }));
  return h('g', { 'data-spider-id': spider.id, transform: `translate(${x} ${y}) scale(${scale})`, onClick: onSelect, role: transparent ? undefined : 'button', tabIndex: transparent ? undefined : 0, onKeyDown: ev => { if (ev.key === 'Enter' || ev.key === ' ') onSelect(); }, 'aria-label': `Spider created by @${spider.owner}`, style: { cursor: transparent ? 'default' : 'pointer' } },
    h('title', null, `@${spider.owner} · ${spider.reason}`),
    !transparent ? h('rect', { x: -44, y: -40, width: 88, height: 100, fill: 'transparent', pointerEvents: 'all' }) : null,
    h('circle', { r: 37, cy: -3, fill: 'none', stroke: 'currentColor', opacity: 0, className: 'spider-arrival' }),
    ...legs,
    h('ellipse', { cx: 0, cy: 3, rx: 9, ry: 13, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 }),
    h('circle', { cx: 0, cy: -12, r: 7, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 }),
    h('circle', { cx: -2.5, cy: -13, r: 1, ...ink }), h('circle', { cx: 2.5, cy: -13, r: 1, ...ink }),
    h('text', { y: 47, textAnchor: 'middle', style: { ...mono, fontSize: 12, fill: 'currentColor' } }, `@${spider.owner}`));
}
function App() {
  const [spiders, setSpiders] = React.useState([]), [connected, setConnected] = React.useState(false), [selected, select] = React.useState(null);
  React.useEffect(() => {
    let socket, timer, stopped = false, delay = 1000;
    const connect = () => {
      socket = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`);
      socket.onopen = () => { delay = 1000; socket.send(JSON.stringify({ type: 'hello', role: 'overlay', version: 1, view: 'spiders' })); };
      socket.onmessage = ev => { try { const data = JSON.parse(ev.data); if (data.type === 'spiders' && Array.isArray(data.spiders)) { setSpiders(data.spiders); setConnected(true); } } catch {} };
      socket.onclose = () => { setConnected(false); if (!stopped) { timer = setTimeout(connect, delay); delay = Math.min(delay * 2, 15000); } };
      socket.onerror = () => {};
    };
    connect(); return () => { stopped = true; clearTimeout(timer); socket?.close(); };
  }, []);
  const current = spiders.find(s => s.id === selected) || spiders.at(-1);
  const scene = h(Box, { component: 'main', sx: { minWidth: 0, minHeight: 0, height: '100%', position: 'relative', color: 'text.primary' } },
    h('svg', { id: 'spiders-scene', viewBox: '0 0 1920 1080', width: '100%', height: '100%', role: 'img', 'aria-label': 'Community Spiders', style: { display: 'block' } },
      spiders.map((spider, index) => h(Spider, { key: spider.id, spider, index, count: spiders.length, onSelect: () => select(spider.id) }))),
    !transparent && !spiders.length ? h(Box, { sx: { position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', textAlign: 'center', px: 2, pointerEvents: 'none' } },
      h(Typography, { sx: { ...mono, fontSize: 24 } }, 'Your Spider starts here.'),
      h(Typography, { sx: { ...mono, color: 'text.secondary', mt: 1 } }, 'Type !spider in Twitch chat. One per viewer.')) : null);
  if (transparent) return h(Box, { sx: { width: 1920, height: 1080, bgcolor: 'transparent' } }, scene);
  return h(Box, { sx: { width: '100vw', height: '100vh', display: 'grid', gridTemplateRows: '48px 1fr', bgcolor: 'background.default', color: 'text.primary' } },
    h(Box, { component: 'header', sx: { px: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' } },
      h(Typography, { sx: { ...mono, fontSize: 20, fontWeight: 600 } }, 'Codex .me'),
      h(Typography, { sx: { ...mono, color: 'text.secondary', fontSize: 12 } }, `${spiders.length} Spiders · ${connected ? 'connected' : 'connecting…'}`),
      h(Box, { sx: { flex: 1 } }),
      h(Button, { component: 'a', href: '/', size: 'small', sx: mono }, 'Stream setup'), h(ThemeSelector), h(ModeToggle)),
    h(Box, { sx: { display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr) 280px', lg: 'minmax(0, 1fr) 360px' }, minHeight: 0 } }, scene,
      h(Box, { component: 'aside', sx: { p: 2, borderLeft: 1, borderColor: 'divider', overflowY: 'auto', bgcolor: 'background.paper' } },
        h(Typography, { sx: { ...mono, fontSize: 16, mb: 2 } }, 'Spider inspector'),
        h(Typography, { sx: { ...mono, fontSize: 13, color: 'text.secondary', mb: 2 } }, 'Create: !spider · Explain yours: !explain. Select a Spider to inspect its kernel.'),
        current ? h(Card, { variant: 'outlined' }, h(CardContent, null,
          h(Typography, { sx: { ...mono, fontWeight: 600 } }, `@${current.owner}`),
          h(Typography, { sx: { ...mono, fontSize: 12, color: 'text.secondary', my: 1 } }, 'Spider robot · this.me 4.2.1 · capability: create'),
          h(Typography, { sx: { ...mono, fontSize: 12, overflowWrap: 'anywhere', my: 2 } }, current.reason),
          h(Box, { component: 'pre', sx: { ...mono, fontSize: 11, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', m: 0 } }, current.script))) : null)));
}
const type = { type: 'Spiders', resolve: () => h(App) };
const Theme = ({ children }) => h(G.Theme, { initialThemeId: 'neurons.me', initialMode: 'dark' }, children);
G.mount({ type: 'Spiders', props: {} }, document.getElementById('root'), { gui: { ...G, Theme, registry: { ...G.registry, Spiders: type } } });
