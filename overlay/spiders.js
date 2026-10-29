import { KernelConsole } from './kernel-console.js';
import { KnowledgeGraph } from './kernel-graph.js';
import { TwitchChat } from './twitch-chat.js';
import { createThemeControls } from './theme-controls.js';
const G = window.GUI, h = React.createElement;
const { Box, Typography, Button, Avatar } = G.Atoms;
const { ThemeSelector, ModeToggle } = createThemeControls(G, React);
const transparent = new URLSearchParams(location.search).get('transparent') === '1';
if (transparent) document.body.classList.add('transparent');
else document.documentElement.classList.add('spiders-web');
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' };
function TwitchProfile({ kernel }) {
  const values = Object.fromEntries((kernel.graph?.nodes || []).map(node => [node.path, node.value]));
  const login = values['twitch.login'] || kernel.owner;
  const name = values['twitch.displayName'] || login;
  const link = `https://www.twitch.tv/${encodeURIComponent(login)}`;
  return h(Box, { 'data-twitch-profile': kernel.id, sx: { display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, mb: 2, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'action.hover' } },
    h(Avatar, { src: values['twitch.profileImageUrl'] || undefined, alt: `${login}'s Twitch profile`, imgProps: { referrerPolicy: 'no-referrer' }, sx: { width: 44, height: 44, flexShrink: 0, bgcolor: '#9146ff', color: '#fff', ...mono } }, login.slice(0, 1).toUpperCase()),
    h(Box, { sx: { flex: 1, minWidth: 0 } },
      h(Typography, { sx: { ...mono, fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, name),
      h(Typography, { component: 'a', href: link, target: '_blank', rel: 'noopener noreferrer', sx: { ...mono, fontSize: 11, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main', textDecoration: 'underline' } } }, `@${login}`)),
    h(Box, { component: 'a', href: link, target: '_blank', rel: 'noopener noreferrer', 'aria-label': `Open ${login} on Twitch`, sx: { display: 'flex', alignItems: 'center', flexShrink: 0 } },
      h(Box, { component: 'img', src: '/ui/assets/twitch-glitch-purple.svg', alt: 'Twitch', sx: { width: 18, height: 21, display: 'block' } })));
}
function Kernel({ kernel, index, count, selected, onSelect, face }) {
  const columns = Math.max(1, Math.ceil(Math.sqrt(count * 16 / 9))), rows = Math.ceil(count / columns);
  const rowCount = Math.min(columns, count - Math.floor(index / columns) * columns);
  const tracked = face && face.owner === kernel.owner;
  const fitWidth = face ? Math.min(1920, 1080 * face.aspect) : 1920;
  const fitHeight = face ? Math.min(1080, 1920 / face.aspect) : 1080;
  const x = tracked ? Math.max(44, Math.min(1876, (1920 - fitWidth) / 2 + face.x * fitWidth)) : (index % columns + 0.5 + (columns - rowCount) / 2) * 1600 / columns + 160;
  const y = tracked ? Math.max(64, Math.min(1036, (1080 - fitHeight) / 2 + face.y * fitHeight - 32)) : (Math.floor(index / columns) + 0.5) * 780 / rows + 110;
  const scale = tracked ? 1 : Math.min(2.8, 1600 / columns / 145, 780 / rows / 100);
  return h('g', { 'data-me-id': kernel.id, 'data-me-bubble': kernel.id, 'data-face-follow': tracked ? 'true' : undefined,
    transform: `translate(${x} ${y}) scale(${scale})`, onClick: onSelect, role: transparent ? undefined : 'button', tabIndex: transparent ? undefined : 0,
    onKeyDown: event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(); } },
    'aria-label': `.me kernel @${kernel.owner}`, 'aria-pressed': transparent ? undefined : selected,
    style: { cursor: transparent ? 'default' : 'pointer', transition: 'transform 150ms linear' } },
    h('title', null, `@${kernel.owner} · ${kernel.presenceReason}`),
    !transparent ? h('rect', { x: -44, y: -60, width: 88, height: 100, fill: 'transparent', pointerEvents: 'all' }) : null,
    selected && !transparent ? h('circle', { r: 29, fill: 'none', stroke: 'currentColor', opacity: 0.65, strokeDasharray: '2 3' }) : null,
    h('foreignObject', { x: -22, y: -22, width: 44, height: 44, style: { overflow: 'visible', pointerEvents: 'none' } },
      h(Box, { className: 'me-visual', sx: { width: 64, height: 64, transform: 'scale(0.6875)', transformOrigin: 'top left' } },
        h(G.Monad, { kind: 'me', variant: 'bubble', mode: 'contained', seed: kernel.owner, label: `@${kernel.owner} · .me`, solid: true, core: 'flat', ring: 1, tooltip: false }))),
    h('text', { 'data-me-label': kernel.owner, y: -34, textAnchor: 'middle', style: { ...mono, fontSize: 12, fill: 'currentColor' } }, `@${kernel.owner}`));
}
function App() {
  const [kernels, setKernels] = React.useState([]), [connected, setConnected] = React.useState(false), [selected, select] = React.useState(null);
  const [path, selectPath] = React.useState(''), [face, setFace] = React.useState(null), [panel, setPanel] = React.useState('inspector');
  React.useEffect(() => { const timer = setInterval(() => setFace(value => value && Date.now() - value.at >= 2000 ? null : value), 500); return () => clearInterval(timer); }, []);
  React.useEffect(() => {
    let socket, timer, stopped = false, delay = 1000;
    const connect = () => {
      socket = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`);
      socket.onopen = () => { delay = 1000; socket.send(JSON.stringify({ type: 'hello', role: 'overlay', version: 1, view: 'kernels' })); };
      socket.onmessage = event => { try { const data = JSON.parse(event.data); if (data.type === 'face') setFace(data.face); if (data.type === 'kernels' && Array.isArray(data.kernels)) { setKernels(data.kernels); setConnected(true); } } catch {} };
      socket.onclose = () => { setConnected(false); if (!stopped) { timer = setTimeout(connect, delay); delay = Math.min(delay * 2, 15000); } };
      socket.onerror = () => {};
    };
    connect(); return () => { stopped = true; clearTimeout(timer); socket?.close(); };
  }, []);
  const current = kernels.find(kernel => kernel.id === selected);
  const scene = h(Box, { component: 'main', sx: { minWidth: 0, minHeight: 0, height: '100%', position: 'relative', color: 'text.primary' } },
    h('svg', { id: 'kernels-scene', onClick: event => { if (event.target === event.currentTarget) select(null); }, viewBox: '0 0 1920 1080', width: '100%', height: '100%', role: 'img', 'aria-label': 'Community kernels', style: { display: 'block' } },
      kernels.map((kernel, index) => h(Kernel, { key: kernel.id, kernel, index, count: kernels.length, selected: selected === kernel.id, face, onSelect: () => { select(kernel.id); selectPath(''); setPanel('inspector'); } }))),
    !transparent && !kernels.length ? h(Box, { sx: { position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', textAlign: 'center', px: 2, pointerEvents: 'none' } },
      h(Typography, { sx: { ...mono, fontSize: 24 } }, 'Your .me starts here.'), h(Typography, { sx: { ...mono, color: 'text.secondary', mt: 1 } }, 'Type !me in Twitch chat.')) : null);
  if (transparent) return h(Box, { sx: { width: 1920, height: 1080, bgcolor: 'transparent' } }, scene);
  return h(Box, { sx: { width: '100vw', height: '100vh', display: 'grid', gridTemplateRows: '48px 1fr', bgcolor: 'background.default', color: 'text.primary' } },
    h(Box, { component: 'header', sx: { px: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' } },
      h(Box, { component: 'img', src: '/ui/assets/twitch-glitch-purple.svg', alt: 'Twitch', sx: { width: 18, height: 21, display: 'block', flexShrink: 0 } }),
      h(Typography, { sx: { ...mono, fontSize: 20, fontWeight: 600 } }, 'Codex .me'),
      h(Typography, { sx: { ...mono, color: 'text.secondary', fontSize: 12 } }, `${kernels.length} kernel${kernels.length === 1 ? '' : 's'} · ${connected ? 'connected' : 'connecting…'}`), h(Box, { sx: { flex: 1 } }),
      h(Button, { component: 'a', href: '/', size: 'small', sx: mono }, 'Stream setup'), h(ThemeSelector, { reservedRight: panel === 'chat' ? 360 : 0 }), h(ModeToggle)),
    h(Box, { sx: { display: 'grid', gridTemplateColumns: { xs: `minmax(0, 1fr) ${panel === 'chat' ? 360 : 280}px`, lg: 'minmax(0, 1fr) 360px' }, minHeight: 0 } }, scene,
      h(Box, { component: 'aside', sx: { minHeight: 0, display: 'flex', flexDirection: 'column', borderLeft: 1, borderColor: 'divider', bgcolor: 'background.paper' } },
        h(Box, { sx: { display: 'flex', gap: 1, p: 1, borderBottom: 1, borderColor: 'divider' } },
          h(Button, { size: 'small', variant: panel === 'chat' ? 'contained' : 'text', onClick: () => setPanel('chat'), 'aria-pressed': panel === 'chat', sx: mono }, 'Twitch chat'),
          h(Button, { size: 'small', variant: panel === 'inspector' ? 'contained' : 'text', onClick: () => setPanel('inspector'), 'aria-pressed': panel === 'inspector', sx: mono }, 'Inspector')),
        panel === 'chat' ? h(Box, { sx: { flex: 1, minHeight: 0 } }, h(TwitchChat)) : null,
        h(Box, { sx: { display: panel === 'inspector' ? 'block' : 'none', p: 2, overflowY: 'auto', flex: 1, minHeight: 0 } },
          h(Typography, { sx: { ...mono, fontSize: 16, mb: 2 } }, '.me kernel'),
          current ? h(React.Fragment, null,
            h(TwitchProfile, { kernel: current }),
            h(Typography, { sx: { ...mono, fontSize: 12, color: 'text.secondary', mb: 1 } }, 'Knowledge graph'),
            h(KnowledgeGraph, { graph: current.graph, path, selectPath }),
            h(KernelConsole, { kernel: current, path }))
            : h(Typography, { role: 'status', 'data-inspector-empty': true, sx: { ...mono, fontSize: 14, color: 'text.secondary' } }, 'Select a node')))));
}
const type = { type: 'Kernels', resolve: () => h(App) };
const Theme = ({ children }) => h(G.Theme, { initialThemeId: 'neurons.me', initialMode: 'dark' }, children);
G.mount({ type: 'Kernels', props: {} }, document.getElementById('root'), { gui: { ...G, Theme, registry: { ...G.registry, Kernels: type } } });
