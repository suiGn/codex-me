import { pathParts, joinPath, pathChildren } from './kernel-paths.js';
const R = window.React, h = R.createElement, G = window.GUI;
const { Box, Typography, Button } = G.Atoms;
const { Menu, MenuItem } = G.Molecules;
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' };
export function KnowledgeGraph({ graph, path, selectPath }) {
  const [menu, setMenu] = R.useState(null);
  const nodes = graph?.nodes || [], parts = pathParts(path), children = pathChildren(nodes, path);
  const current = nodes.find(node => node.path === path), visible = new Set(children.map(child => child.path));
  const directInput = current?.inputs?.length === 1 && [current.inputs[0].path, pathParts(current.inputs[0].path).at(-1)].includes(current.expression);
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
    current ? h(Box, { key: current.path, 'data-path-value': path, sx: { mb: 2 } },
      h(Box, { sx: { display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 1, mb: 1.5 } },
        h(Typography, { 'data-node-value': path, sx: { ...mono, fontSize: 20, fontWeight: 600, lineHeight: 1.4, overflowWrap: 'anywhere' } },
          current.path === 'identity.createdAt' && typeof current.value === 'number'
            ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(current.value))
            : JSON.stringify(current.value) ?? 'undefined'),
        h(Box, { component: 'span', title: current.kind === 'fact' ? 'Stored fact' : current.kind, sx: { ...mono, fontSize: 10, color: 'text.secondary', border: 1, borderColor: 'divider', borderRadius: 1, px: 0.75, py: 0.25 } }, current.kind === 'fact' ? 'Stored' : current.kind === 'derived' ? 'Derived' : 'Linked')),
      current.expression ? h(Box, { 'data-node-rule': path, sx: { borderLeft: 2, borderColor: 'divider', pl: 1.5, my: 1.5 } },
        h(Typography, { sx: { ...mono, fontSize: 10, color: 'text.secondary', mb: 0.5 } }, directInput ? 'From' : 'Rule'),
        !directInput ? h(Typography, { component: 'code', sx: { ...mono, display: 'block', fontSize: 12, overflowWrap: 'anywhere' } }, String(current.expression)) : null,
        ...(current.inputs || []).map(input => h(Button, { key: input.path, size: 'small', onClick: () => go(input.path), title: input.path,
          'aria-label': `Inspect input ${input.path}`, sx: { ...button, display: 'flex', width: '100%', justifyContent: 'space-between', gap: 1, color: 'text.secondary', mt: 0.5 } },
          h('span', null, pathParts(input.path).at(-1)), h('span', null, JSON.stringify(input.value) ?? 'undefined')))) : null,
      h(Box, { component: 'details', 'data-node-explanation': path, sx: { my: 1.5 } },
        h(Box, { component: 'summary', sx: { ...mono, fontSize: 12, cursor: 'pointer', color: 'text.secondary' } }, 'View explanation'),
        h(Typography, { 'data-kernel-explanation': path, sx: { ...mono, fontSize: 11, overflowWrap: 'anywhere', mt: 1 } }, current.explanation))) : null,
    edges.length ? h(Box, { sx: { my: 1 } }, edges.map((edge, i) => h(Box, { key: i, 'data-graph-edge': `${edge.source}->${edge.target}`, sx: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 } },
      h(Button, { size: 'small', onClick: () => go(edge.source), sx: button }, pathParts(edge.source).at(-1)),
      h(Typography, { component: 'span', title: `${edge.target} depends on ${edge.source}`, sx: { fontSize: 12, color: 'text.secondary' } }, '→'),
      h(Button, { size: 'small', onClick: () => go(edge.target), sx: button }, pathParts(edge.target).at(-1))))) : null);
}
