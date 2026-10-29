// UI-only path grouping over real memory paths; a branch is not a synthetic kernel fact.
export const pathParts = path => String(path || '').match(/[^.[\]]+|\[\d+\]/g) || [];
export const joinPath = parts => parts.reduce((path, part) => path + (part.startsWith('[') ? '' : path ? '.' : '') + part, '');
export function pathChildren(nodes, parent = '') {
  const prefix = pathParts(parent), children = new Map();
  for (const node of nodes || []) {
    const parts = pathParts(node.path);
    if (parts.length <= prefix.length || !prefix.every((part, i) => parts[i] === part)) continue;
    const path = joinPath(parts.slice(0, prefix.length + 1));
    if (!children.has(path)) children.set(path, { path, name: parts[prefix.length], node: null, branch: false });
    const child = children.get(path);
    if (parts.length === prefix.length + 1) child.node = node;
    else child.branch = true;
  }
  return [...children.values()];
}
