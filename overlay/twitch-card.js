import { TwitchSurface } from "./twitch-surface.js";
import { TwitchSections } from "./kernel-graph.js";
const h = React.createElement, G = window.GUI;
const { Box, Typography, Button, Avatar } = G.Atoms;
const mono = { fontFamily: "monospace" };
export function TwitchProfile({ kernel, compact = false, onClose, path, selectPath }) {
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
export function TwitchCard({ kernel, path = 'twitch.stream', selectPath = () => {}, onClose, readOnly = false }) {
  const surfacePath = path.startsWith('twitch') ? path : 'twitch.stream';
  return h(React.Fragment, null,
    h(TwitchProfile, { kernel, compact: true, onClose, path, selectPath }),
    h(TwitchSections, { owner: kernel.owner, path: surfacePath, selectPath }),
    h(TwitchSurface, { kernel, path: surfacePath, selectPath, readOnly }));
}
