import { TwitchChat } from './twitch-chat.js';
import { createThemeControls } from './theme-controls.js';
const G = window.GUI, h = React.createElement;
const { Box, Typography, Button, Card, CardContent } = G.Atoms;
const { ThemeSelector, ModeToggle } = createThemeControls(G, React);
const transparent = new URLSearchParams(location.search).get('transparent') === '1';
if (transparent) document.body.classList.add('transparent');
else document.documentElement.classList.add('spiders-web');
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' };
function Spider({ spider, index, count, onSelect, face }) {
  const columns = Math.max(1, Math.ceil(Math.sqrt(count * 16 / 9))), rows = Math.ceil(count / columns);
  const rowCount = Math.min(columns, count - Math.floor(index / columns) * columns);
  const tracked = face && face.owner === spider.owner;
  const fitWidth = face ? Math.min(1920, 1080 * face.aspect) : 1920;
  const fitHeight = face ? Math.min(1080, 1920 / face.aspect) : 1080;
  const x = (index % columns + 0.5 + (columns - rowCount) / 2) * 1600 / columns + 160, y = (Math.floor(index / columns) + 0.5) * 780 / rows + 110;
  const scale = Math.min(2.8, 1600 / columns / 145, 780 / rows / 100);
  // Move only the psyche bubble; the Spider body retains its grid transform.
  const bubbleX = tracked ? Math.max(44, Math.min(1876, (1920 - fitWidth) / 2 + face.x * fitWidth)) : x;
  const bubbleY = tracked ? Math.max(64, Math.min(1036, (1080 - fitHeight) / 2 + face.y * fitHeight - 32)) : y;
  const bubbleTransform = tracked ? `translate(${(bubbleX - x) / scale} ${(bubbleY - y) / scale}) scale(${1 / scale})` : undefined;
  const legs = [];
  // Original Space robot geometry, at its resting gait phase (no movement loop).
  for (const side of [-1, 1]) for (let j = 0; j < 4; j++) {
    const swing = Math.sin(j * 1.6 + (side > 0 ? Math.PI : 0)) * 1.6, base = -4.5 + j * 3 + swing;
    legs.push(h('polyline', { key: `${side}:${j}`, points: `${side * 3},${-6 + j * 1.2} ${side * 7},${-9 + base * 0.4} ${side * 10},${base * 0.8}` }));
  }
  return h('g', { 'data-me-id': spider.id, 'data-spider-id': spider.attached ? spider.id : undefined, transform: `translate(${x} ${y}) scale(${scale})`, onClick: onSelect, role: transparent ? undefined : 'button', tabIndex: transparent ? undefined : 0, onKeyDown: ev => { if (ev.key === 'Enter' || ev.key === ' ') onSelect(); }, 'aria-label': `.me for @${spider.owner}${spider.attached ? ' with Spider' : ''}`, style: { cursor: transparent ? 'default' : 'pointer' } },
    h('title', null, `@${spider.owner} · ${spider.reason}`),
    !transparent ? h('rect', { x: -44, y: -90, width: 88, height: 150, fill: 'transparent', pointerEvents: 'all' }) : null,
    h('circle', { r: 24, cy: -10, fill: 'none', stroke: 'currentColor', opacity: 0, className: 'spider-arrival' }),
    h('g', { 'data-me-bubble': spider.id, 'data-face-follow': tracked ? 'true' : undefined, transform: bubbleTransform, style: { transition: 'transform 150ms linear' } },
    h('foreignObject', { x: -22, y: tracked ? -22 : spider.attached ? -78 : -38, width: 44, height: 44, style: { overflow: 'visible', pointerEvents: 'none' } },
      h(Box, { className: 'me-visual', sx: { width: 64, height: 64, transform: 'scale(0.6875)', transformOrigin: 'top left' } }, h(G.Monad, { kind: 'me', variant: 'bubble', mode: 'contained', seed: spider.owner, label: `@${spider.owner} · .me`, solid: true, core: 'flat', ring: 1, tooltip: false }))),
    h('text', { 'data-me-label': spider.owner, y: tracked ? -32 : spider.attached ? -88 : -48, textAnchor: 'middle', style: { ...mono, fontSize: 12, fill: 'currentColor' } }, `@${spider.owner}`)),
    spider.attached && !tracked ? h('line', { x1: 0, y1: -32, x2: 0, y2: -20, stroke: 'currentColor', opacity: 0.4, strokeDasharray: '2 2' }) : null,
    spider.attached ? h('g', { 'data-spider-shape': 'space-original', stroke: 'currentColor', strokeWidth: 0.9, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' },
      ...legs,
      h('ellipse', { cx: 0, cy: -8, rx: 5.2, ry: 4, fill: 'var(--spider-bg)' }),
      h('circle', { cx: 5.5, cy: -10, r: 2.4, fill: 'var(--spider-bg)' }),
      h('line', { x1: 0, y1: -12, x2: 0, y2: -17 }),
      h('circle', { cx: 0, cy: -18, r: 1.1, fill: 'currentColor', stroke: 'none' })) : null,
    spider.attached ? h('text', { 'data-body-label': spider.id, y: 28, textAnchor: 'middle', style: { ...mono, fontSize: 10, fill: 'currentColor', opacity: 0.7 } }, 'Spider') : null);
}
function App() {
  const [spiders, setSpiders] = React.useState([]), [connected, setConnected] = React.useState(false), [selected, select] = React.useState(null);
  const [face, setFace] = React.useState(null);
  const [panel, setPanel] = React.useState('inspector');
  React.useEffect(() => {
    const timer = setInterval(() => setFace(value => value && Date.now() - value.at >= 2000 ? null : value), 500);
    return () => clearInterval(timer);
  }, []);
  React.useEffect(() => {
    let socket, timer, stopped = false, delay = 1000;
    const connect = () => {
      socket = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`);
      socket.onopen = () => { delay = 1000; socket.send(JSON.stringify({ type: 'hello', role: 'overlay', version: 1, view: 'spiders' })); };
      socket.onmessage = ev => { try { const data = JSON.parse(ev.data); if (data.type === 'face') setFace(data.face); if (data.type === 'spiders' && Array.isArray(data.spiders)) { setSpiders(data.mes || data.spiders); setConnected(true); } } catch {} };
      socket.onclose = () => { setConnected(false); if (!stopped) { timer = setTimeout(connect, delay); delay = Math.min(delay * 2, 15000); } };
      socket.onerror = () => {};
    };
    connect(); return () => { stopped = true; clearTimeout(timer); socket?.close(); };
  }, []);
  const current = spiders.find(s => s.id === selected) || spiders.at(-1);
  const scene = h(Box, { component: 'main', sx: theme => ({ minWidth: 0, minHeight: 0, height: '100%', position: 'relative', color: 'text.primary', '--spider-bg': theme.palette.background.default }) },
    h('svg', { id: 'spiders-scene', viewBox: '0 0 1920 1080', width: '100%', height: '100%', role: 'img', 'aria-label': 'Community Spiders', style: { display: 'block' } },
      spiders.map((spider, index) => h(Spider, { key: spider.id, spider, index, count: spiders.length, face, onSelect: () => { select(spider.id); setPanel('inspector'); } }))),
    !transparent && !spiders.length ? h(Box, { sx: { position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', textAlign: 'center', px: 2, pointerEvents: 'none' } },
      h(Typography, { sx: { ...mono, fontSize: 24 } }, 'Your .me starts here.'),
      h(Typography, { sx: { ...mono, color: 'text.secondary', mt: 1 } }, 'Type !me in Twitch chat. One .me per viewer.')) : null);
  if (transparent) return h(Box, { sx: { width: 1920, height: 1080, bgcolor: 'transparent' } }, scene);
  return h(Box, { sx: { width: '100vw', height: '100vh', display: 'grid', gridTemplateRows: '48px 1fr', bgcolor: 'background.default', color: 'text.primary' } },
    h(Box, { component: 'header', sx: { px: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' } },
      h(Typography, { sx: { ...mono, fontSize: 20, fontWeight: 600 } }, 'Codex .me'),
      h(Typography, { sx: { ...mono, color: 'text.secondary', fontSize: 12 } }, `${spiders.length} .me · ${spiders.filter(s => s.attached).length} Spiders · ${connected ? 'connected' : 'connecting…'}`),
      h(Box, { sx: { flex: 1 } }),
      h(Button, { component: 'a', href: '/', size: 'small', sx: mono }, 'Stream setup'), h(ThemeSelector, { reservedRight: panel === 'chat' ? 360 : 0 }), h(ModeToggle)),
    h(Box, { sx: { display: 'grid', gridTemplateColumns: { xs: `minmax(0, 1fr) ${panel === 'chat' ? 360 : 280}px`, lg: 'minmax(0, 1fr) 360px' }, minHeight: 0 } }, scene,
      h(Box, { component: 'aside', sx: { minHeight: 0, display: 'flex', flexDirection: 'column', borderLeft: 1, borderColor: 'divider', bgcolor: 'background.paper' } },
        h(Box, { sx: { display: 'flex', gap: 1, p: 1, borderBottom: 1, borderColor: 'divider' } },
          h(Button, { size: 'small', variant: panel === 'chat' ? 'contained' : 'text', onClick: () => setPanel('chat'), 'aria-pressed': panel === 'chat', sx: mono }, 'Twitch chat'),
          h(Button, { size: 'small', variant: panel === 'inspector' ? 'contained' : 'text', onClick: () => setPanel('inspector'), 'aria-pressed': panel === 'inspector', sx: mono }, 'Inspector')),
        panel === 'chat' ? h(Box, { sx: { flex: 1, minHeight: 0 } }, h(TwitchChat)) : null,
        h(Box, { sx: { display: panel === 'inspector' ? 'block' : 'none', p: 2, overflowY: 'auto', flex: 1, minHeight: 0 } },
        h(Typography, { sx: { ...mono, fontSize: 16, mb: 2 } }, '.me object inspector'),
        h(Typography, { sx: { ...mono, fontSize: 13, color: 'text.secondary', mb: 2 } }, 'Your .me is the psyche. Its Spider is the body. Select either to inspect the same kernel. Wait 3s between writes.'),
        h(Box, { component: 'pre', sx: { ...mono, fontSize: 11, whiteSpace: 'pre-wrap', mb: 2 } }, '!me\n!me me.spider.registered(true)\n!me me("identity.owner")\n!me me.explain("spider.created")'),
        current ? h(Card, { variant: 'outlined' }, h(CardContent, null,
          h(Typography, { sx: { ...mono, fontWeight: 600 } }, `.me @${current.owner}`),
          h(Typography, { sx: { ...mono, fontSize: 12, color: 'text.secondary', my: 1 } }, current.attached ? '.me + Spider · one this.me 4.2.1 kernel' : '.me presence · this.me 4.2.1 kernel'),
          h(Typography, { sx: { ...mono, fontSize: 12, overflowWrap: 'anywhere', my: 2 } }, current.presenceReason),
          current.attached ? h(Typography, { sx: { ...mono, fontSize: 12, overflowWrap: 'anywhere', my: 2 } }, current.reason) : null,
          h(Box, { 'data-me-script': current.id, sx: { minWidth: 0, '& pre code': { whiteSpace: 'pre-wrap !important', overflowWrap: 'anywhere' }, '& pre code > span': { display: 'block !important', overflowWrap: 'anywhere' }, '& pre code > span > span': { display: 'inline !important' } } }, h(G.CodeBlock, { code: current.script, language: 'javascript', title: '.me script', wrapLongLines: true, showLineNumbers: false, showCopyButton: true, style: { borderRadius: 8 } })))) : null))));
}
const type = { type: 'Spiders', resolve: () => h(App) };
const Theme = ({ children }) => h(G.Theme, { initialThemeId: 'neurons.me', initialMode: 'dark' }, children);
G.mount({ type: 'Spiders', props: {} }, document.getElementById('root'), { gui: { ...G, Theme, registry: { ...G.registry, Spiders: type } } });
