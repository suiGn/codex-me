// Shared, public presentation only: references to server-owned kernel facts.
export function createPresentation(registry, { now = Date.now } = {}) {
  let selected = null, lastChat = -Infinity, lastHost = -Infinity;
  const select = (value, source = 'host') => {
    if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(k => !['id','path','operation','visible'].includes(k))) return 400;
    if (value.visible === false) { if (source !== 'host') return 403; selected = null; return 204; }
    if (typeof value.id !== 'string' || typeof value.path !== 'string' || value.path.length > 96 || !['run','explain'].includes(value.operation)) return 400;
    const kernel = registry.presences().find(k => k.id === value.id);
    if (!kernel || !kernel.graph.nodes.some(n => n.path === value.path || n.path.startsWith(value.path + '.'))) return 404;
    if (source === 'chat' && (now() - lastChat < 2000 || now() - lastHost < 3000)) return 429;
    if (source === 'host' && now() - lastHost < 200) return 429;
    if (source === 'chat') lastChat = now(); else lastHost = now();
    selected = { id: value.id, path: value.path, operation: value.operation, source, until: source === 'chat' ? now() + 15000 : Infinity };
    return 204;
  };
  const frame = () => {
    if (!selected || now() >= selected.until) { selected = null; return { type: 'presentation', view: null }; }
    const kernel = registry.presences().find(k => k.id === selected.id);
    if (!kernel) { selected = null; return { type: 'presentation', view: null }; }
    const nodes = kernel.graph.nodes.filter(n => n.path === selected.path || n.path.startsWith(selected.path + '.'));
    return { type: 'presentation', view: { id: kernel.id, owner: kernel.owner, path: selected.path, operation: selected.operation, source: selected.source,
      total: nodes.length, rows: nodes.slice(0, 10).map(node => ({ path: node.path, value: node.value, expression: node.expression, reason: node.explanation, inputs: node.inputs,
        explain: registry.query(kernel.id, node.path, 'explain').output })) } };
  };
  return { select, frame, clear() { selected = null; } };
}
