import { ObsControls } from '/ui/obs-controls.js';
import { KernelTree } from './kernel-tree.js';
import { TwitchSurface } from './twitch-surface.js';
import { KernelConsole } from './kernel-console.js';
import { TwitchSections } from './kernel-graph.js';
import { TwitchChat, TwitchWordmark } from './twitch-chat.js';
import { createThemeControls } from './theme-controls.js';
const G = window.GUI, h = React.createElement;
const { Box, Typography, Button, Avatar } = G.Atoms;
const { ThemeSelector, ModeToggle } = createThemeControls(G, React);
const transparent = new URLSearchParams(location.search).get('transparent') === '1';
if (transparent) document.body.classList.add('transparent');
else document.documentElement.classList.add('spiders-web');
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' };
function TwitchProfile({ kernel, compact = false, onClose, path, selectPath }) {
  const values = Object.fromEntries((kernel.graph?.nodes || []).map(node => [node.path, node.value]));
  const login = values['twitch.profile.login'] || kernel.owner;
  const name = values['twitch.profile.displayName'] || login;
  const link = `https://www.twitch.tv/${encodeURIComponent(login)}`;
  const binding = field => ({ 'data-me-path': `twitch.profile.${field}`, 'data-path-selected': path === `twitch.profile.${field}`, onClick: () => selectPath?.(`twitch.profile.${field}`) });
  return h(Box, { 'data-twitch-profile': kernel.id, 'data-me-path': 'twitch.profile', 'data-path-selected': path === 'twitch.profile' || path === 'twitch.profile.id', sx: { display: 'flex', alignItems: 'center', gap: 1.25, p: compact ? 0 : 1.25, mb: compact ? 1.5 : 2, border: compact ? 0 : 1, borderColor: 'divider', borderRadius: 2, bgcolor: compact ? 'transparent' : 'action.hover' } },
    h(Button, { ...binding('profileImageUrl'), 'aria-label': 'Inspect profile image', 'aria-pressed': path === 'twitch.profile.profileImageUrl', sx: { p: 0, minWidth: 0, borderRadius: '50%', flexShrink: 0 } }, h(Avatar, { 'data-profile-avatar': login, src: values['twitch.profile.profileImageUrl'] || undefined, alt: `${login}'s Twitch profile`, imgProps: { referrerPolicy: 'no-referrer' }, sx: { width: compact ? 36 : 44, height: compact ? 36 : 44, flexShrink: 0, bgcolor: '#9146ff', color: '#fff', ...mono } }, login.slice(0, 1).toUpperCase())),
    h(Box, { sx: { flex: 1, minWidth: 0 } },
      h(Button, { ...binding('displayName'), 'aria-label': 'Inspect profile display name', 'aria-pressed': path === 'twitch.profile.displayName', sx: { ...mono, display: 'block', p: 0, minWidth: 0, maxWidth: '100%', textTransform: 'none', textAlign: 'left', color: 'text.primary', fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, name),
      h(Typography, { ...binding('login'), component: 'a', href: link, target: '_blank', rel: 'noopener noreferrer', sx: { ...mono, fontSize: 11, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main', textDecoration: 'underline' } } }, `@${login}.twitch`)),
    h(G.Atoms.Tooltip, { title: 'Open in Twitch', describeChild: true, arrow: true }, h(Box, { component: 'a', href: link, target: '_blank', rel: 'noopener noreferrer', 'aria-label': `Open ${login} on Twitch`, sx: { display: 'flex', alignItems: 'center', flexShrink: 0 } },
      h(Box, { component: 'img', src: '/ui/assets/twitch-glitch-purple.svg', alt: 'Twitch', sx: { width: 18, height: 21, display: 'block' } }))),
    onClose ? h(Button, { size: 'small', onClick: onClose, 'aria-label': 'Close bubble navigation', sx: { minWidth: 24, px: 0.5, color: 'text.secondary' } }, '×') : null);
}
function BubbleNavigation({ anchor, kernel, path, selectPath, onClose }) {
  const card = React.useRef(null);
  const [position, setPosition] = React.useState({ left: 0, top: 0, width: 340, visibility: 'hidden' });
  React.useLayoutEffect(() => {
    const scene = anchor.closest('main');
    const update = () => {
      const bounds = scene.getBoundingClientRect(), bubble = anchor.getBoundingClientRect();
      const width = Math.min(340, Math.max(0, bounds.width - 24));
      const right = bubble.right - bounds.left + 12, before = bubble.left - bounds.left - width - 12;
      const height = Math.min(card.current?.scrollHeight + 2 || 500, bounds.height - 24);
      const below = bubble.bottom - bounds.top + 12;
      const beside = below + height <= bounds.height - 12 ? null : right + width <= bounds.width - 12 ? right : before >= 12 ? before : null;
      const left = beside ?? Math.max(12, Math.min(bounds.width - width - 12, bubble.x + bubble.width / 2 - bounds.x - width / 2));
      const preferredTop = beside === null ? below : bubble.top - bounds.top;
      const top = Math.max(12, Math.min(preferredTop, bounds.height - height - 12));
      setPosition({ left, top, width, maxHeight: Math.max(0, bounds.height - top - 12) });
    };
    update();
    const observer = new ResizeObserver(update); observer.observe(scene); if (card.current) observer.observe(card.current);
    anchor.addEventListener('transitionend', update);
    return () => { observer.disconnect(); anchor.removeEventListener('transitionend', update); };
  }, [anchor, kernel]);
  return h(Box, { ref: card, 'data-bubble-navigation': kernel.id, role: 'region', 'aria-label': `Controls for @${kernel.owner}`, onKeyDown: event => { if (event.key === 'Escape') { event.stopPropagation(); onClose(); anchor.focus(); } },
    sx: { position: 'absolute', ...position, zIndex: 5, boxSizing: 'border-box', p: 1.5, overflowY: 'auto', bgcolor: 'background.paper', color: 'text.primary', border: 1, borderColor: 'divider', borderRadius: 2, boxShadow: 6, '& [data-path-selected="true"]': { outline: '1px solid', outlineColor: 'primary.main', outlineOffset: 2 } } },
    h(TwitchProfile, { kernel, compact: true, onClose, path, selectPath }),
    h(TwitchSections, { owner: kernel.owner, path, selectPath }),
    h(TwitchSurface, { key: kernel.id, kernel, path, selectPath }));
}
function Kernel({ kernel, index, count, selected, onSelect, face }) {
  const columns = Math.max(1, Math.ceil(Math.sqrt(count * 16 / 9))), rows = Math.ceil(count / columns);
  const rowCount = Math.min(columns, count - Math.floor(index / columns) * columns);
  const tracked = face && face.owner === kernel.owner;
  const side = React.useRef(1);
  if (tracked) { if (face.x > 0.78) side.current = -1; else if (face.x < 0.22) side.current = 1; }
  const fitWidth = face ? Math.min(1920, 1080 * face.aspect) : 1920;
  const fitHeight = face ? Math.min(1080, 1920 / face.aspect) : 1080;
  const scale = tracked ? 2.8 : Math.min(3.6, 1600 / columns / 145, 780 / rows / 100);
  const x = tracked ? Math.max(44 * scale, Math.min(1920 - 44 * scale, (1920 - fitWidth) / 2 + face.x * fitWidth + side.current * 160)) : (index % columns + 0.5 + (columns - rowCount) / 2) * 1600 / columns + 160;
  const y = tracked ? Math.max(64 * scale, Math.min(1080 - 44 * scale, (1080 - fitHeight) / 2 + face.y * fitHeight - 90)) : (Math.floor(index / columns) + 0.5) * 780 / rows + 110;
  return h('g', { 'data-me-id': kernel.id, 'data-me-bubble': kernel.id, 'data-face-follow': tracked ? 'true' : undefined,
    transform: `translate(${x} ${y}) scale(${scale})`, onClick: onSelect, role: transparent ? undefined : 'button', tabIndex: transparent ? undefined : 0,
    onKeyDown: event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(event); } },
    'aria-label': `.me kernel @${kernel.owner}`, 'aria-pressed': transparent ? undefined : selected,
    className: 'me-companion', style: { cursor: transparent ? 'default' : 'pointer' } },
    h('title', null, `@${kernel.owner} · ${kernel.presenceReason}`),
    !transparent ? h('rect', { x: -44, y: -60, width: 88, height: 100, fill: 'transparent', pointerEvents: 'all' }) : null,
    h('g', { className: 'me-companion-float', 'data-companion-motion': true, style: { animationDelay: `${-index * 0.8}s` } },
    h('circle', { className: 'me-companion-halo', r: 27, fill: 'none', stroke: 'currentColor', strokeWidth: 0.7, pointerEvents: 'none' }),
    selected && !transparent ? h('circle', { r: 29, fill: 'none', stroke: 'currentColor', opacity: 0.65, strokeDasharray: '2 3' }) : null,
    h('foreignObject', { x: -22, y: -22, width: 44, height: 44, style: { overflow: 'visible', pointerEvents: 'none' } },
      h(Box, { className: 'me-visual', sx: { width: 64, height: 64, transform: 'scale(0.6875)', transformOrigin: 'top left' } },
        h(G.Monad, { kind: 'me', variant: 'bubble', mode: 'contained', seed: kernel.owner, label: `@${kernel.owner} · .me`, solid: true, core: 'flat', ring: 1, tooltip: false }))),
    h('text', { 'data-me-label': kernel.owner, y: -34, textAnchor: 'middle', style: { ...mono, fontSize: 12, fill: 'currentColor' } }, `@${kernel.owner}`)));
}
function App() {
  const [kernels, setKernels] = React.useState([]), [connected, setConnected] = React.useState(false), [selected, select] = React.useState(null);
  const [bubbleAnchor, setBubbleAnchor] = React.useState(null);
  const [path, selectPath] = React.useState(''), [face, setFace] = React.useState(null), [panel, setPanel] = React.useState('chat');
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
  const section = path === 'twitch' ? 'stream' : path.split('.')[1];
  const detailsVisible = panel === 'inspector' || !!bubbleAnchor;
  React.useEffect(() => {
    if (path.startsWith('twitch.stream.') && current?.graph?.nodes.some(node => node.path === path && node.value == null)) selectPath('twitch.stream');
  }, [current?.id, current?.sections?.stream?.updatedAt, path]);
  const [sectionError, setSectionError] = React.useState(null);
  React.useEffect(() => {
    if (!current || !detailsVisible || !['channel','stream','followers'].includes(section)) { setSectionError(null); return; }
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch(`/api/kernels/${encodeURIComponent(current.id)}/sections/${section}`, { signal: controller.signal });
        const data = await response.json();
        if (!controller.signal.aborted) setSectionError(response.ok ? null : { id: current.id, section, message: data.error || 'Twitch data unavailable.' });
      } catch { if (!controller.signal.aborted) setSectionError({ id: current.id, section, message: 'Could not reach the server.' }); }
    };
    let timer;
    const schedule = () => { timer = setTimeout(async () => { if (!document.hidden) await load(); if (!controller.signal.aborted) schedule(); }, section === 'stream' ? 5000 : 30000); };
    const visible = () => { if (!document.hidden) void load(); };
    document.addEventListener('visibilitychange', visible);
    load().finally(() => { if (!controller.signal.aborted) schedule(); });
    return () => { controller.abort(); clearTimeout(timer); document.removeEventListener('visibilitychange', visible); };
  }, [current?.id, section, detailsVisible]);
  const selectFromInspector = nextPath => {
    selectPath(nextPath);
    // Reopen the same selected node without changing the active sidebar or input focus.
    if (!bubbleAnchor && current) setBubbleAnchor(document.querySelector(`[data-me-bubble="${current.id}"]`));
  };
  const openKernel = (kernel, anchor) => {
    if (transparent) return;
    if (selected !== kernel.id) { select(kernel.id); selectPath('twitch'); }
    setBubbleAnchor(selected === kernel.id && bubbleAnchor ? null : anchor);
  };
  const scene = h(Box, { component: 'main', sx: { minWidth: 0, minHeight: 0, height: '100%', position: 'relative', color: 'text.primary' } },
    h('svg', { id: 'kernels-scene', onClick: event => { if (event.target === event.currentTarget) { select(null); setBubbleAnchor(null); } }, viewBox: '0 0 1920 1080', width: '100%', height: '100%', role: 'img', 'aria-label': 'Community kernels', style: { display: 'block' } },
      kernels.map((kernel, index) => h(Kernel, { key: kernel.id, kernel, index, count: kernels.length, selected: selected === kernel.id, face, onSelect: event => openKernel(kernel, event.currentTarget) }))),
    !transparent && current && bubbleAnchor ? h(BubbleNavigation, { anchor: bubbleAnchor, kernel: current, path, selectPath, onClose: () => setBubbleAnchor(null) }) : null,
    !transparent && !kernels.length ? h(Box, { sx: { position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', textAlign: 'center', px: 2, pointerEvents: 'none' } },
      h(Typography, { sx: { ...mono, fontSize: 24 } }, 'Your .me starts here.'), h(Typography, { sx: { ...mono, color: 'text.secondary', mt: 1 } }, 'Type !me in Twitch chat.')) : null);
  if (transparent) return h(Box, { sx: { width: 1920, height: 1080, bgcolor: 'transparent' } }, scene);
  return h(Box, { sx: { width: '100vw', height: '100vh', display: 'grid', gridTemplateRows: '48px 1fr', bgcolor: 'background.default', color: 'text.primary' } },
    h(Box, { component: 'header', sx: { px: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' } },
      h(Box, { component: 'img', src: '/ui/assets/twitch-glitch-purple.svg', alt: 'Twitch', sx: { width: 18, height: 21, display: 'block', flexShrink: 0 } }),
      h(Typography, { component: 'a', href: '/', sx: { ...mono, fontSize: 20, fontWeight: 600, color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } } }, 'Codex .me'),
      h(Typography, { sx: { ...mono, color: 'text.secondary', fontSize: 12 } }, `${kernels.length} ${connected ? 'connected' : 'connecting…'}`), h(Box, { sx: { flex: 1 } }),
      h(ThemeSelector, { reservedRight: panel === 'chat' ? 360 : 0 }), h(ModeToggle)),
    h(Box, { sx: { display: 'grid', gridTemplateColumns: { xs: `minmax(0, 1fr) ${panel === 'chat' ? 360 : 280}px`, lg: 'minmax(0, 1fr) 360px' }, minHeight: 0 } }, scene,
      h(Box, { component: 'aside', sx: { minHeight: 0, display: 'flex', flexDirection: 'column', borderLeft: 1, borderColor: 'divider', bgcolor: 'background.paper' } },
        h(Box, { sx: { display: 'flex', gap: 1, p: 1, borderBottom: 1, borderColor: 'divider' } },
          h(Button, { size: 'small', variant: panel === 'chat' ? 'outlined' : 'text', onClick: () => setPanel('chat'), 'aria-label': 'Twitch', 'aria-pressed': panel === 'chat', sx: { ...mono, minHeight: 32 } }, h(TwitchWordmark, { width: 52 })),
          h(Button, { size: 'small', variant: panel === 'inspector' ? 'contained' : 'text', onClick: () => setPanel('inspector'), 'aria-pressed': panel === 'inspector', sx: mono }, 'Inspector'),
          h(Button, { size: 'small', variant: panel === 'obs' ? 'contained' : 'text', onClick: () => setPanel('obs'), 'aria-pressed': panel === 'obs', sx: mono }, 'OBS')),
        panel === 'obs' ? h(Box, { sx: { flex: 1, minHeight: 0, overflowY: 'auto' } }, h(ObsControls)) : null,
        panel === 'chat' ? h(Box, { sx: { flex: 1, minHeight: 0 } }, h(TwitchChat, { kernels })) : null,
        h(Box, { sx: { display: panel === 'inspector' ? 'block' : 'none', p: 2, overflowY: 'auto', flex: 1, minHeight: 0 } },
          current ? h(React.Fragment, null,
            h(TwitchProfile, { kernel: current, path, selectPath: selectFromInspector }),
            h(KernelTree, { kernel: current, path, selectPath: selectFromInspector }),
            sectionError && sectionError.id === current.id && sectionError.section === section ? h(Typography, { role: 'alert', sx: { ...mono, fontSize: 11, color: 'error.main' } }, sectionError.message) : null,
            h(Box, { sx: { display: path === 'twitch' ? 'none' : 'block' } }, h(KernelConsole, { kernel: current, path: panel === 'inspector' && path !== 'twitch' ? path : '' })))
            : h(Typography, { role: 'status', 'data-inspector-empty': true, sx: { ...mono, fontSize: 14, color: 'text.secondary' } }, 'Select a node')))));
}
const type = { type: 'Kernels', resolve: () => h(App) };
const Theme = ({ children }) => h(G.Theme, { initialThemeId: 'neurons.me', initialMode: 'dark' }, children);
G.mount({ type: 'Kernels', props: {} }, document.getElementById('root'), { gui: { ...G, Theme, registry: { ...G.registry, Kernels: type } } });
