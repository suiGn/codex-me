import { pathParts, joinPath, pathChildren } from './kernel-paths.js';
const R = window.React, h = R.createElement, G = window.GUI;
const { Box, Typography, Button } = G.Atoms;
const { Menu, MenuItem } = G.Molecules;
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' };
export function KnowledgeGraph({ graph, owner = '', path, selectPath }) {
  const [menu, setMenu] = R.useState(null), bar = R.useRef(null);
  const nodes = graph?.nodes || [], parts = pathParts(path);
  R.useEffect(() => { if (bar.current) bar.current.scrollLeft = bar.current.scrollWidth; }, [path]);
  const go = value => { setMenu(null); selectPath(value); };
  const button = { ...mono, textTransform: 'none', minWidth: 0, px: 0.5, py: 0.25, fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 };
  const segment = (target, label, root = false) => {
    const children = pathChildren(nodes, target), name = `Children of ${target || 'me://'}`;
    return h(Box, { key: target, component: 'span', sx: { display: 'inline-flex', alignItems: 'center', flexShrink: 0 } },
      h(Button, { size: 'small', onClick: () => go(target), 'data-path-segment': target, 'aria-current': target === path ? 'location' : undefined,
        'aria-label': root ? 'Go to kernel root' : `Open path ${target}`, sx: button }, label),
      children.length ? h(Button, { size: 'small', 'aria-label': name, title: `Browse ${target || 'kernel root'}`, 'aria-haspopup': 'menu', 'aria-expanded': menu?.parent === target,
        onClick: event => setMenu({ anchor: event.currentTarget, parent: target, label: name }), sx: { ...button, px: 0.25 } },
        h('svg', { 'aria-hidden': true, width: 12, height: 12, viewBox: '0 0 12 12', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4 }, h('path', { d: 'M3 4.5 6 7.5 9 4.5' }))) : null);
  };
  return h(Box, { 'data-knowledge-graph': true, sx: { minWidth: 0 } },
    h(Box, { component: 'nav', ref: bar, 'aria-label': 'Kernel path', 'data-kernel-path': path, 'data-kernel-owner': owner, 'data-me-address': `me://${owner}${path ? '/'+parts.join('/') : ''}`,
      sx: { display: 'flex', alignItems: 'center', flexWrap: 'nowrap', overflowX: 'auto', whiteSpace: 'nowrap', gap: 0.25, borderBottom: 1, borderColor: 'divider', pb: 1, mb: 1.5 } },
      segment('', `me://${owner}`, true),
      ...parts.map((part, i) => h(R.Fragment, { key: joinPath(parts.slice(0, i + 1)) },
        i || owner ? h(Typography, { 'aria-hidden': true, sx: { ...mono, fontSize: 12, color: 'text.secondary', flexShrink: 0 } }, '/') : null,
        segment(joinPath(parts.slice(0, i + 1)), part)))),
    h(Menu, { anchorEl: menu?.anchor || null, open: !!menu, onClose: () => setMenu(null), MenuListProps: { 'aria-label': menu?.label || 'Path choices' } },
      pathChildren(nodes, menu?.parent || '').map(child => h(MenuItem, { key: child.path, selected: joinPath(parts.slice(0, pathParts(child.path).length)) === child.path,
        'data-path-option': child.path, onClick: () => go(child.path), title: child.node?.explanation,
        sx: { ...mono, fontSize: 12, display: 'flex', gap: 2, justifyContent: 'space-between', maxWidth: 320 } },
        h('span', null, child.name),
        child.node ? h(Box, { component: 'span', sx: { color: 'text.secondary', fontSize: 11, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 } }, JSON.stringify(child.node.value) ?? 'undefined') : null))));
}
