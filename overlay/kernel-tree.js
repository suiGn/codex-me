import { pathParts, pathChildren, visibleNodes } from './kernel-paths.js';
const R = window.React, h = R.createElement, G = window.GUI;
const { Box, Button, Typography } = G.Atoms;
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' };

export function KernelTree({ kernel, path, selectPath }) {
  const [open, setOpen] = R.useState(() => new Set(['', 'twitch', 'stream']));
  const rootRef = R.useRef(null);
  R.useEffect(() => { setOpen(new Set(['', 'twitch', 'stream'])); }, [kernel.id]);
  R.useEffect(() => {
    const parts = pathParts(path);
    setOpen(previous => new Set([...previous, ...parts.map((_, index) => parts.slice(0, index + 1).join('.'))]));
  }, [path, kernel.id]);
  const nodes = visibleNodes(kernel.graph);
  const sections = ['profile','stream','channel','followers'].filter(name => kernel.sections?.[name]);
  const children = parent => parent === '' ? [{ name: 'twitch', path: 'twitch', branch: true }, ...pathChildren(nodes).filter(n => n.path !== 'twitch')] : parent === 'twitch'
    ? sections.map(name => ({ name, path: `twitch.${name}`, branch: true, node: null }))
    : pathChildren(nodes, parent);
  const rows = [];
  const visit = (item, prefix, depth, last, position, count) => {
    const descendants = children(item.path), branch = item.branch || descendants.length > 0;
    rows.push({ ...item, prefix, depth, last, branch, position, count });
    if (branch && open.has(item.path)) descendants.forEach((child, index) => visit(child, depth ? prefix + (last ? '   ' : '│  ') : '', depth + 1, index === descendants.length - 1, index + 1, descendants.length));
  };
  visit({ path: '', name: 'me', branch: true }, '', 0, true, 1, 1);
  const visibleSelection = rows.some(row => row.path === path) ? path : '';
  const toggle = (target, expanded) => setOpen(previous => { const next = new Set(previous); expanded ? next.add(target) : next.delete(target); return next; });
  const focus = target => rootRef.current?.querySelectorAll('[role="treeitem"]')[target]?.focus();
  return h(Box, { 'data-kernel-tree': true, 'data-kernel-path': path, sx: { ...mono, mb: path === 'twitch' ? 0 : 1.5, minWidth: 0 } },
    h(Box, { ref: rootRef, role: 'tree', 'aria-label': 'me', sx: { minWidth: 0 } }, rows.map((row, index) => {
      const value = row.node ? (JSON.stringify(row.node.value) ?? 'undefined') : null;
      const focusNode = row.path === 'stream.focus', lit = focusNode && row.node?.value === true;
      const state = kernel.sections?.[row.path.split('.')[1]];
      return h(Button, { key: row.path, role: 'treeitem', 'aria-label': row.depth ? row.path : 'me', 'aria-level': row.depth + 1, 'aria-setsize': row.count, 'aria-posinset': row.position,
        'aria-expanded': row.branch ? open.has(row.path) : undefined, 'aria-selected': row.path === path, 'aria-busy': row.branch && state?.status === 'loading' ? true : undefined,
        'data-path-option': row.path, 'data-focus': focusNode ? (row.node?.value === undefined ? 'undefined' : String(row.node.value)) : undefined, tabIndex: row.path === visibleSelection ? 0 : -1,
        onClick: () => { if (row.branch) toggle(row.path, row.path === '' || !open.has(row.path)); selectPath(row.path); },
        onKeyDown: event => {
          if (event.key === 'ArrowDown') { event.preventDefault(); focus(Math.min(rows.length - 1, index + 1)); }
          else if (event.key === 'ArrowUp') { event.preventDefault(); focus(Math.max(0, index - 1)); }
          else if (event.key === 'Home') { event.preventDefault(); focus(0); }
          else if (event.key === 'End') { event.preventDefault(); focus(rows.length - 1); }
          else if (event.key === 'ArrowRight' && row.branch) { event.preventDefault(); if (!open.has(row.path)) { toggle(row.path, true); selectPath(row.path); } else if (rows[index+1]?.depth > row.depth) focus(index+1); }
          else if (event.key === 'ArrowLeft') { event.preventDefault(); if (row.depth && row.branch && open.has(row.path)) toggle(row.path, false); else if (row.depth) { const parent = row.path.slice(0, row.path.lastIndexOf('.')); focus(rows.findIndex(item => item.path === parent)); } }
        },
        sx: { ...mono, display: 'flex', width: '100%', minWidth: 0, minHeight: 27, px: 0.5, py: 0.25, gap: 0, borderRadius: 0.5, justifyContent: 'flex-start', fontSize: 12, lineHeight: 1.6, textTransform: 'none', textAlign: 'left', color: 'text.primary', bgcolor: row.path === path ? 'action.selected' : 'transparent' } },
        row.depth ? h(Typography, { component: 'span', 'aria-hidden': true, sx: { ...mono, fontSize: 'inherit', whiteSpace: 'pre', color: 'text.disabled', flexShrink: 0 } }, row.prefix + (row.last ? '└─ ' : '├─ ')) : null,
        focusNode ? h(Box, { component: 'span', 'aria-hidden': true, 'data-focus-indicator': true, sx: { width: 7, height: 7, mr: .75, borderRadius: '50%', flexShrink: 0, bgcolor: lit ? 'success.main' : 'text.disabled', boxShadow: lit ? '0 0 8px currentColor' : 'none', color: 'success.main' } }) : null,
        h(Typography, { component: 'code', sx: { ...mono, fontSize: 'inherit', flexShrink: 0, color: lit ? 'success.main' : row.branch ? 'primary.main' : 'text.primary' } }, row.name),
        value !== null ? h(Typography, { component: 'code', title: value, sx: { ...mono, fontSize: 'inherit', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: typeof row.node.value === 'string' ? 'success.main' : typeof row.node.value === 'number' ? 'info.main' : 'warning.main' } }, h('span', { style: { opacity: 0.5 } }, ': '), value) : null,
        row.branch && state?.status === 'loading' ? h('span', { 'aria-hidden': true, style: { marginLeft: 6, opacity: 0.5 } }, '…') : null);
    })));
}
