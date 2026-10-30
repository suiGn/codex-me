const h = window.React.createElement, G = window.GUI;
export function StreamPresentation({ view }) {
  if (!view) return null;
  return h('foreignObject', { x: 55, y: 70, width: 720, height: 900, pointerEvents: 'none', 'data-stream-presentation': view.id, 'data-presentation-path': view.path },
    h(G.Atoms.Box, { sx: { p: 3, borderRadius: 3, bgcolor: 'rgba(9,15,20,.94)', color: '#f2f7f5', border: '1px solid rgba(180,230,210,.4)', fontFamily: 'monospace', overflow: 'hidden' } },
      h('div', { style: { fontSize: 23, marginBottom: 18, color: '#a8ead1' } }, `me://${view.owner}/${view.path.replaceAll('.', '/')}`),
      view.rows.slice(0, 6).map(row => h('div', { key: row.path, style: { marginBottom: 20 } },
        h('div', { style: { fontSize: 19, opacity: .7 } }, row.path),
        h('div', { 'data-presented-value': row.path, style: { fontSize: 30, fontWeight: 600, overflowWrap: 'anywhere', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } }, JSON.stringify(row.value)),
        view.operation === 'explain' ? h('div', { 'data-presented-explain': row.path, style: { marginTop: 7, fontSize: 18, lineHeight: 1.5, overflowWrap: 'anywhere' } }, row.reason) : null,
        view.operation === 'explain' && row.inputs?.length ? h('div', { style: { marginTop: 10, fontSize: 18, color: '#a8ead1', lineHeight: 1.5 } }, row.inputs.map(input => `${input.path}: ${JSON.stringify(input.value)} → ${row.path}`).join(' · ')) : null)),
      view.total > 6 ? h('div', { style: { fontSize: 17, opacity: .7 } }, `${view.total - 6} more paths in the app`) : null));
}
export function KernelLiveValues({ kernel, path, selectPath }) {
  const nodes = (kernel.graph?.nodes || []).filter(n => ['enabled','energy','active','face.present','face.x','face.y'].includes(n.path));
  return h(G.Atoms.Box, { sx: { display: 'flex', gap: .5, flexWrap: 'wrap', mb: 1 } }, nodes.map(node => h(G.Atoms.Button, {
    key: node.path, size: 'small', 'data-live-path': node.path, 'aria-pressed': path === node.path, onClick: () => selectPath(node.path),
    sx: { fontFamily: 'monospace', fontSize: 11, textTransform: 'none', bgcolor: path === node.path ? 'action.selected' : 'transparent' }
  }, `${node.path}: ${JSON.stringify(node.value)}`)));
}
