import { pathParts, joinPath, pathChildren } from './kernel-paths.js';
const R = window.React, h = R.createElement, G = window.GUI;
const { Box, Typography, Button } = G.Atoms;
const { Menu, MenuItem } = G.Molecules;
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' };
export function KnowledgeGraph({ graph, path, selectPath }) {
  const [menu, setMenu] = R.useState(null);
  const nodes = graph?.nodes || [], parts = pathParts(path), children = pathChildren(nodes, path);
  const current = nodes.find(node => node.path === path), visible = new Set(children.map(child => child.path));
  const edges = (graph?.edges || []).filter(edge => visible.has(edge.source) && visible.has(edge.target));
  const go = value => { setMenu(null); selectPath(value); };
  const button = { ...mono, textTransform: 'none', minWidth: 0, px: 0.5, py: 0.25, fontSize: 12 };
  const arrow = (parent, label) => pathChildren(nodes, parent).length > 1 ? h(Button, { size: 'small', 'aria-label': label, 'aria-haspopup': 'menu', 'aria-expanded': !!menu && menu.label === label,
    onClick: event => setMenu({ anchor: event.currentTarget, parent, label }), sx: { ...button, px: 0.25 } },
    h('svg', { 'aria-hidden': true, width: 12, height: 12, viewBox: '0 0 12 12', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4 }, h('path', { d: 'M3 4.5 6 7.5 9 4.5' }))) : null;
  return h(Box, { 'data-knowledge-graph': true },
    h(Box, { component: 'nav', 'aria-label': 'Kernel path', 'data-kernel-path': path, sx: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.25, borderBottom: 1, borderColor: 'divider', pb: 1, mb: 1 } },
      h(Button, { size: 'small', onClick: () => go(''), 'aria-label': 'Go to kernel root', sx: button }, 'me://'),
      ...parts.map((part, i) => {
        const target = joinPath(parts.slice(0, i + 1)), parent = joinPath(parts.slice(0, i));
        return h(R.Fragment, { key: target },
          i ? h(Typography, { 'aria-hidden': true, sx: { ...mono, fontSize: 12, color: 'text.secondary' } }, '/') : null,
          h(Button, { size: 'small', onClick: () => go(target), 'aria-current': i === parts.length - 1 ? 'location' : undefined, 'aria-label': `Open path ${target}`, sx: button }, part),
          arrow(parent, `Siblings of ${target}`));
      })),
    h(Menu, { anchorEl: menu?.anchor || null, open: !!menu, onClose: () => setMenu(null), MenuListProps: { 'aria-label': menu?.label || 'Path choices' } },
      pathChildren(nodes, menu?.parent || '').map(child => h(MenuItem, { key: child.path, selected: child.path === path, 'data-path-option': child.path, onClick: () => go(child.path), sx: { ...mono, fontSize: 12 } }, child.name))),
    h(Box, { 'data-path-children': path, sx: { mb: 2 } }, children.map(child => h(Button, {
      key: child.path, 'data-graph-node': child.node ? child.path : undefined, 'data-graph-branch': child.branch ? child.path : undefined,
      'aria-label': `Open ${child.path}`, onClick: () => go(child.path), title: child.node?.explanation,
      sx: { ...mono, display: 'flex', width: '100%', justifyContent: 'space-between', gap: 1, textTransform: 'none', color: 'text.primary', borderBottom: 1, borderColor: 'divider', borderRadius: 0, py: 1, px: 0.5, fontSize: 12 } },
      h(Box, { component: 'span', sx: { flexShrink: 0 } }, child.name),
      h(Box, { component: 'span', sx: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'text.secondary', fontSize: 11 } }, child.branch ? '›' : JSON.stringify(child.node?.value) ?? 'undefined')))),
    current ? h(Box, { 'data-path-value': path, sx: { mb: 2 } },
      h(Typography, { sx: { ...mono, fontSize: 14, overflowWrap: 'anywhere' } }, JSON.stringify(current.value) ?? 'undefined'),
      h(Typography, { sx: { ...mono, fontSize: 11, color: 'text.secondary', mt: 0.5 } }, current.kind)) : null,
    edges.length ? h(Box, { sx: { my: 1 } }, edges.map((edge, i) => h(Box, { key: i, 'data-graph-edge': `${edge.source}->${edge.target}`, sx: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 } },
      h(Button, { size: 'small', onClick: () => go(edge.source), sx: button }, pathParts(edge.source).at(-1)),
      h(Typography, { component: 'span', title: `${edge.target} depends on ${edge.source}`, sx: { fontSize: 12, color: 'text.secondary' } }, '→'),
      h(Button, { size: 'small', onClick: () => go(edge.target), sx: button }, pathParts(edge.target).at(-1))))) : null);
}
