import { StreamPresentation, KernelLiveValues } from './stream-presentation.js';
import { SceneTint } from './scene-tint.js';
import { FaceControls } from './face-controls.js';
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
if (transparent) { document.body.classList.add('transparent'); document.documentElement.classList.add('kernels-obs'); }
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
    h(KernelLiveValues, { kernel, path, selectPath }),
    h(TwitchSections, { owner: kernel.owner, path, selectPath }),
    path.startsWith('twitch') ? h(TwitchSurface, { key: kernel.id, kernel, path, selectPath }) : h(KernelConsole, { kernel, path }));
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
  const active = kernel.graph?.nodes.find(node => node.path === 'active')?.value;
  return h('g', { 'data-active': active === undefined ? undefined : String(active), 'data-me-id': kernel.id, 'data-me-bubble': kernel.id, 'data-face-follow': tracked ? 'true' : undefined,
    transform: `translate(${x} ${y}) scale(${scale})`, onClick: onSelect, role: transparent ? undefined : 'button', tabIndex: transparent ? undefined : 0,
    onKeyDown: event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(event); } },
    'aria-label': `.me kernel @${kernel.owner}`, 'aria-pressed': transparent ? undefined : selected,
    className: 'me-companion', style: { cursor: transparent ? 'default' : 'pointer', opacity: active === false ? .38 : 1, filter: active === false ? 'grayscale(1)' : undefined } },
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
function FacePoints({ face }) {
  if (!face?.points?.length) return null;
  const width = Math.min(1920, 1080 * face.aspect), height = Math.min(1080, 1920 / face.aspect);
  return h('g', { 'data-face-points': true, pointerEvents: 'none', 'aria-hidden': true, fill: '#5fffc9', stroke: '#072f29', strokeWidth: .8 },
    face.points.map(([x, y], index) => h('circle', { key: index, cx: (1920 - width) / 2 + x * width, cy: (1080 - height) / 2 + y * height, r: 2.4 })));
}
function App() {
  const [kernels, setKernels] = React.useState([]), [connected, setConnected] = React.useState(false), [selected, select] = React.useState(null);
  const hostPresenting = React.useRef(false);
  const [presented, setPresented] = React.useState(null), [presenter, setPresenter] = React.useState(null), [presentError, setPresentError] = React.useState('');
  const [bubbleAnchor, setBubbleAnchor] = React.useState(null);
  const [channelInfo, setChannelInfo] = React.useState(null), [chatError, setChatError] = React.useState(false);
  const [settingsAnchor, setSettingsAnchor] = React.useState(null);
  const settingsMenu = React.useRef(null);
  React.useEffect(() => {
    if (!settingsAnchor) return;
    const outside = event => { if (!settingsAnchor.contains(event.target) && !settingsMenu.current?.contains(event.target)) setSettingsAnchor(null); };
    const escape = event => { if (event.key === 'Escape') { setSettingsAnchor(null); settingsAnchor.focus(); } };
    document.addEventListener('pointerdown', outside, true);
    const blur = () => setSettingsAnchor(null);
    document.addEventListener('keydown', escape);
    window.addEventListener('blur', blur);
    return () => { document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', escape); window.removeEventListener('blur', blur); };
  }, [settingsAnchor]);
  React.useEffect(() => {
    const abort = new AbortController();
    fetch('/api/status', { signal: abort.signal, cache: 'no-store' }).then(r => { if (!r.ok) throw Error(); return r.json(); }).then(data => {
      if (!/^[a-z0-9_]{1,25}$/i.test(data.channel || '')) throw Error();
      setChannelInfo({ channel: data.channel.toLowerCase(), profile: data.profile?.login?.toLowerCase() === data.channel.toLowerCase() ? data.profile : null });
    }).catch(() => { if (!abort.signal.aborted) setChatError(true); });
    return () => abort.abort();
  }, []);
  const [panelPosition, setPanelPosition] = React.useState(null);
  const panelElement = React.useRef(null);
  const panelDrag = React.useRef(null);
  const dragPanel = event => {
    if (panelMode === 'docked' || event.button !== 0 || event.target.closest('button,a')) return;
    const box = event.currentTarget.parentElement.getBoundingClientRect(), area = event.currentTarget.parentElement.parentElement.getBoundingClientRect();
    panelDrag.current = { x: event.clientX, y: event.clientY, left: box.left - area.left, top: box.top - area.top, width: box.width, height: box.height, area };
    event.currentTarget.setPointerCapture(event.pointerId); event.preventDefault();
  };
  const movePanel = event => {
    const drag = panelDrag.current; if (!drag) return;
    setPanelPosition({ left: Math.max(0, Math.min(drag.area.width - drag.width, drag.left + event.clientX - drag.x)), top: Math.max(0, Math.min(drag.area.height - drag.height, drag.top + event.clientY - drag.y)) });
  };
  const [panelMode, setPanelMode] = React.useState('docked');
  const lastPanelMode = React.useRef('docked');
  React.useLayoutEffect(() => { panelElement.current?.style.removeProperty('width'); panelElement.current?.style.removeProperty('height'); }, [panelMode]);
  const panelCollapsed = panelMode === 'minimized';
  const changePanelMode = next => { if (next !== 'minimized') lastPanelMode.current = next; setPanelMode(next); if (next !== panelMode) setPanelPosition(null); };
  const choosePanel = next => { setSettingsAnchor(null); setPanel(next); if (panelCollapsed) changePanelMode(lastPanelMode.current); };
  const panelControl = (label, action, shape) => h(G.Atoms.Tooltip, { title: label, arrow: true },
    h(Button, { size: 'small', 'aria-label': label, 'aria-controls': 'side-panel-content', onClick: action, sx: { minWidth: 28, px: .5 } },
      h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, 'aria-hidden': true }, h('path', { d: shape }))));
  const [path, selectPath] = React.useState(''), [face, setFace] = React.useState(null), [panel, setPanel] = React.useState(new URLSearchParams(location.search).get('panel') === 'camera' ? 'camera' : 'chat');
  React.useEffect(() => { const timer = setInterval(() => setFace(value => value && Date.now() - value.at >= 2000 ? null : value), 500); return () => clearInterval(timer); }, []);
  React.useEffect(() => {
    let socket, timer, stopped = false, delay = 1000;
    const connect = () => {
      socket = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`);
      socket.onopen = () => { delay = 1000; socket.send(JSON.stringify({ type: 'hello', role: 'overlay', version: 1, view: 'kernels' })); };
      socket.onmessage = event => { try { const data = JSON.parse(event.data); if (data.type === 'presentation') setPresented(data.view); if (data.type === 'face') setFace(data.face); if (data.type === 'kernels' && Array.isArray(data.kernels)) { setKernels(data.kernels); setConnected(true); } } catch {} };
      socket.onclose = () => { setConnected(false); if (!stopped) { timer = setTimeout(connect, delay); delay = Math.min(delay * 2, 15000); } };
      socket.onerror = () => {};
    };
    connect(); return () => { stopped = true; clearTimeout(timer); socket?.close(); };
  }, []);
  const current = kernels.find(kernel => kernel.id === selected);
  React.useEffect(() => {
    if (transparent) return;
    const controller = new AbortController();
    fetch('/api/presentation', { signal: controller.signal, cache: 'no-store' }).then(r => r.json()).then(data => { if (!controller.signal.aborted) setPresenter(data.canPresent ? { csrf: data.csrf } : null); }).catch(() => {});
    return () => controller.abort();
  }, []);
  React.useEffect(() => {
    if (transparent || !presenter) return;
    const showing = !!(current && bubbleAnchor && path);
    if (!showing && !hostPresenting.current) return;
    hostPresenting.current = showing;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/presentation', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': presenter.csrf }, body: JSON.stringify(current && bubbleAnchor && path ? { id: current.id, path, operation: 'explain' } : { visible: false }) });
        setPresentError(response.ok ? '' : 'Could not share selection with OBS. Reload the demo to reconnect.');
      } catch { setPresentError('Could not share selection with OBS.'); }
    }, 250);
    return () => clearTimeout(timer);
  }, [presenter, current?.id, path, !!bubbleAnchor]);

  const section = path === 'twitch' ? 'stream' : path.split('.')[1];
  const detailsVisible = (!panelCollapsed && panel === 'inspector') || !!bubbleAnchor;
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
    if (selected !== kernel.id) { select(kernel.id); selectPath('active'); }
    setBubbleAnchor(selected === kernel.id && bubbleAnchor ? null : anchor);
  };
  const scene = h(Box, { component: 'main', sx: { minWidth: 0, minHeight: 0, height: '100%', position: 'relative', color: 'text.primary' } },
    h(SceneTint, { transparent }),
    h('svg', { id: 'kernels-scene', onClick: event => { if (event.target === event.currentTarget) { select(null); setBubbleAnchor(null); } }, viewBox: '0 0 1920 1080', width: '100%', height: '100%', role: 'img', 'aria-label': 'Community kernels', style: { display: 'block', position: 'relative' } },
      h(FacePoints, { face }),
      transparent ? h(StreamPresentation, { view: presented }) : null,
      kernels.map((kernel, index) => h(Kernel, { key: kernel.id, kernel, index, count: kernels.length, selected: selected === kernel.id, face, onSelect: event => openKernel(kernel, event.currentTarget) }))),
    !transparent && current && bubbleAnchor ? h(BubbleNavigation, { anchor: bubbleAnchor, kernel: current, path, selectPath, onClose: () => setBubbleAnchor(null) }) : null,
    !transparent && !kernels.length ? h(Box, { sx: { position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', textAlign: 'center', px: 2, pointerEvents: 'none' } },
      h(Typography, { sx: { ...mono, fontSize: 24 } }, 'Your .me starts here.'), h(Typography, { sx: { ...mono, color: 'text.secondary', mt: 1 } }, 'Type !me in Twitch chat.')) : null);
  if (transparent) return h(Box, { sx: { width: '100vw', height: '100vh', bgcolor: 'transparent' } }, scene);
  return h(Box, { sx: { width: '100vw', height: '100vh', display: 'grid', gridTemplateRows: '48px 1fr', bgcolor: 'background.default', color: 'text.primary' } },
    h(Box, { component: 'header', sx: { px: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' } },
      h(Box, { component: 'img', src: '/ui/assets/twitch-glitch-purple.svg', alt: 'Twitch', sx: { width: 18, height: 21, display: 'block', flexShrink: 0 } }),
      h(Typography, { component: 'a', href: '/', sx: { ...mono, fontSize: 20, fontWeight: 600, color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } } }, 'Codex .me'),
      h(Typography, { sx: { ...mono, color: 'text.secondary', fontSize: 12 } }, `${kernels.length} ${connected ? 'connected' : 'connecting…'}`), h(Box, { sx: { flex: 1 } }),
      h(ThemeSelector, { reservedRight: panelMode === 'docked' && panel === 'chat' ? 360 : 0 }), h(ModeToggle)),
    h(Box, { sx: { position: 'relative', display: 'grid', gridTemplateColumns: panelMode === 'docked' ? 'minmax(0, 1fr) 360px' : 'minmax(0, 1fr)', minHeight: 0 } }, scene,
      h(Box, { component: 'aside', ref: panelElement, 'aria-label': 'Side panel', 'data-panel-mode': panelMode, sx: { ...(panelMode !== 'docked' ? { position: 'absolute', ...(panelPosition ? { left: panelPosition.left, top: panelPosition.top } : { bottom: panelCollapsed ? 0 : 12, right: 12 }), width: 360, minWidth: 320, maxWidth: panelPosition ? `calc(100% - ${panelPosition.left}px)` : 'calc(100% - 12px)', resize: panelCollapsed ? 'horizontal' : 'both', minHeight: panelCollapsed ? 48 : 280, maxHeight: panelPosition ? `calc(100% - ${panelPosition.top}px)` : 'calc(100% - 12px)', height: panelCollapsed ? 'auto' : 'min(560px, calc(100% - 24px))', zIndex: 2, border: 1, borderRadius: '8px 8px 0 0', boxShadow: 8, overflow: 'hidden' } : { minHeight: 0 }), display: 'flex', flexDirection: 'column', borderLeft: 1, borderColor: 'divider', bgcolor: 'background.paper' } },
        h(Box, { onPointerDown: dragPanel, onPointerMove: movePanel, onPointerUp: () => { panelDrag.current = null; }, onPointerCancel: () => { panelDrag.current = null; }, sx: { cursor: panelMode === 'docked' ? 'default' : 'grab', touchAction: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', gap: .5, p: 1, borderBottom: panelCollapsed ? 0 : 1, borderColor: 'divider' } },
          h(Button, { size: 'small', variant: panel === 'chat' ? 'outlined' : 'text', onClick: () => choosePanel('chat'), 'aria-label': 'Twitch', 'aria-pressed': panel === 'chat', sx: { ...mono, minHeight: 32 } }, h(TwitchWordmark, { width: 52 })),
          channelInfo ? h(Box, { 'data-chat-profile': channelInfo.channel, sx: { display: 'flex', alignItems: 'center', gap: .5, flex: 1, minWidth: 0 } },
            h(Avatar, { src: channelInfo.profile?.profile_image_url || undefined, alt: `${channelInfo.channel}'s Twitch profile`, sx: { width: 22, height: 22, fontSize: 11 } }, channelInfo.channel[0]),
            h(Typography, { component: 'a', href: `https://www.twitch.tv/${channelInfo.channel}`, target: '_blank', rel: 'noopener noreferrer', title: 'Open in Twitch', sx: { ...mono, fontSize: 12, color: 'inherit', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, `@${channelInfo.channel}`)) : h(Box, { sx: { flex: 1 } }),
          h(G.Atoms.Tooltip, { title: 'Settings', arrow: true }, h(Button, { size: 'small', 'aria-label': 'Settings', 'aria-haspopup': 'menu', 'aria-expanded': !!settingsAnchor, onClick: event => { const anchor = event.currentTarget; setSettingsAnchor(value => value ? null : anchor); }, sx: { minWidth: 28, px: .5, color: panel !== 'chat' ? 'primary.main' : 'inherit' } },
            h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, 'aria-hidden': true }, h('path', { d: 'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z' }), h('circle', { cx: 12, cy: 12, r: 3 })))),
          settingsAnchor ? ReactDOM.createPortal(h(Box, { ref: settingsMenu, role: 'menu', 'aria-label': 'Panel settings', onPointerDown: event => event.stopPropagation(), sx: { position: 'fixed', zIndex: 1300, right: Math.max(8, window.innerWidth - settingsAnchor.getBoundingClientRect().right), top: Math.max(8, Math.min(window.innerHeight - 150, settingsAnchor.getBoundingClientRect().bottom + 4)), bgcolor: 'background.paper', color: 'text.primary', border: 1, borderColor: 'divider', borderRadius: 1, boxShadow: 6, p: .5, display: 'flex', flexDirection: 'column', minWidth: 140 } },
              h(Button, { role: 'menuitem', autoFocus: true, onClick: () => choosePanel('inspector'), sx: { justifyContent: 'flex-start' } }, 'Inspector'),
              h(Button, { role: 'menuitem', onClick: () => choosePanel('obs'), sx: { justifyContent: 'flex-start' } }, 'OBS'),
              h(Button, { role: 'menuitem', onClick: () => choosePanel('camera'), sx: { justifyContent: 'flex-start' } }, 'Face tracking')), document.body) : null,
          panelControl(panelMode === 'docked' ? 'Float panel' : 'Dock panel', () => changePanelMode(panelMode === 'docked' ? 'floating' : 'docked'), panelMode === 'docked' ? 'M8 4H4v16h16v-4M12 4h8v8M20 4L10 14' : 'M4 4h16v16H4zM15 4v16'),
          panelControl(panelCollapsed ? 'Restore panel' : 'Minimize panel', () => changePanelMode(panelCollapsed ? lastPanelMode.current : 'minimized'), panelCollapsed ? 'M5 15l7-7 7 7' : 'M5 18h14')),
        h(Box, { id: 'side-panel-content', sx: { display: panelCollapsed ? 'none' : 'flex', flexDirection: 'column', flex: 1, minHeight: 0 } },
        h(Box, { sx: { display: panel === 'camera' ? 'block' : 'none', flex: 1, minHeight: 0, overflowY: 'auto' } }, h(FaceControls, { kernels, channel: channelInfo?.channel })),
        panel === 'obs' ? h(Box, { sx: { flex: 1, minHeight: 0, overflowY: 'auto' } }, h(ObsControls)) : null,
        panel === 'chat' ? h(Box, { sx: { flex: 1, minHeight: 0 } }, h(TwitchChat, { channelInfo, error: chatError })) : null,
        h(Box, { sx: { display: panel === 'inspector' ? 'block' : 'none', p: 2, overflowY: 'auto', flex: 1, minHeight: 0 } },
          current ? h(React.Fragment, null,
            h(TwitchProfile, { kernel: current, path, selectPath: selectFromInspector }),
            h(KernelTree, { kernel: current, path, selectPath: selectFromInspector }),
            presentError ? h(Typography, { role: 'alert', sx: { fontSize: 12, color: 'error.main' } }, presentError) : null,
            sectionError && sectionError.id === current.id && sectionError.section === section ? h(Typography, { role: 'alert', sx: { ...mono, fontSize: 11, color: 'error.main' } }, sectionError.message) : null,
            h(Box, { sx: { display: !path || path === 'twitch' ? 'none' : 'block' } }, h(KernelConsole, { kernel: current, path: !panelCollapsed && panel === 'inspector' && path !== 'twitch' ? path : '' })))
            : h(Typography, { role: 'status', 'data-inspector-empty': true, sx: { ...mono, fontSize: 14, color: 'text.secondary' } }, 'Select a node'))))));
}
const type = { type: 'Kernels', resolve: () => h(App) };
const Theme = ({ children }) => h(G.Theme, { initialThemeId: 'neurons.me', initialMode: 'dark' }, children);
G.mount({ type: 'Kernels', props: {} }, document.getElementById('root'), { gui: { ...G, Theme, registry: { ...G.registry, Kernels: type } } });
