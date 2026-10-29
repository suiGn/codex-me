import { pathParts, pathChildren } from './kernel-paths.js';
const R = window.React, h = R.createElement, G = window.GUI;
const { Box, Typography, Button } = G.Atoms;
const { Menu, MenuItem } = G.Molecules;
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' };
export function KnowledgeGraph({ graph, owner = '', path, selectPath, showFields = true }) {
  const resources = showFields ? ['stream','channel','followers','profile'] : ['stream','channel','followers'];
  const [menu, setMenu] = R.useState(null);
  const section = resources.includes(path.split('.')[1]) ? path.split('.')[1] : showFields ? 'stream' : null;
  const root = `twitch.${section}`, fields = pathChildren(graph?.nodes || [], root), parts = pathParts(path).slice(2);
  const prefix = R.useId();
  const go = value => { setMenu(null); selectPath(value); };
  return h(Box, { 'data-knowledge-graph': true, 'data-kernel-path': path, 'data-kernel-owner': owner, 'data-me-address': `me://${owner}/${pathParts(path).join('/')}`, sx: { minWidth: 0, mb: 1.5 } },
    h(Box, { role: 'tablist', 'aria-label': 'Twitch sections', sx: { display: 'grid', gridTemplateColumns: `repeat(${resources.length},minmax(0,1fr))`, borderBottom: 1, borderColor: 'divider' } },
      resources.map((name, index) => h(Button, { key: name, role: 'tab', id: `${prefix}-${name}`, 'aria-controls': `${prefix}-fields`, 'aria-selected': section === name, tabIndex: section === name ? 0 : -1,
        onClick: () => go(`twitch.${name}`), onKeyDown: event => {
          const next = event.key === 'ArrowRight' ? (index+1)%resources.length : event.key === 'ArrowLeft' ? (index+resources.length-1)%resources.length : event.key === 'Home' ? 0 : event.key === 'End' ? resources.length-1 : null;
          if (next === null) return; event.preventDefault(); go(`twitch.${resources[next]}`); event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next].focus();
        }, sx: { ...mono, fontSize: { xs: 10, lg: 11 }, px: 0.25, minWidth: 0, textTransform: 'none', borderRadius: 0, borderBottom: 2, borderColor: section === name ? 'primary.main' : 'transparent', color: section === name ? 'text.primary' : 'text.secondary' } }, name[0].toUpperCase()+name.slice(1)))),
    showFields && h(Box, { role: 'group', id: `${prefix}-fields`, 'aria-label': `${section} fields`, sx: { display: 'flex', alignItems: 'center', minHeight: 28, mt: 0.5 } },
      fields.length ? h(Button, { size: 'small', onClick: event => setMenu(event.currentTarget), 'aria-label': `Fields of ${root}`, 'aria-haspopup': 'menu', 'aria-expanded': !!menu,
        sx: { ...mono, fontSize: 11, minWidth: 0, px: 0.5, textTransform: 'none', color: 'text.secondary' } }, parts.length ? parts.join('/') : 'All fields',
        h('svg', { 'aria-hidden': true, width: 12, height: 12, viewBox: '0 0 12 12', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, style: { marginLeft: 4 } }, h('path', { d: 'M3 4.5 6 7.5 9 4.5' }))) : null),
    h(Menu, { anchorEl: menu, open: !!menu, onClose: () => setMenu(null), MenuListProps: { 'aria-label': `Fields of ${root}` } },
      h(MenuItem, { selected: path === root, onClick: () => go(root), 'data-path-option': root, sx: { ...mono, fontSize: 12 } }, 'All fields'),
      fields.map(child => h(MenuItem, { key: child.path, selected: child.path === path, 'data-path-option': child.path, onClick: () => go(child.path), sx: { ...mono, fontSize: 12, gap: 2, justifyContent: 'space-between', maxWidth: 320 } },
        child.name, child.node ? h(Typography, { component: 'span', sx: { ...mono, fontSize: 11, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 } }, JSON.stringify(child.node.value)) : null))));
}
