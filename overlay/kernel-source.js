// Source locations in the displayed reproducible construction script, not VM execution frames.
export function sourceDeclarations(kernel, path) {
  const known = new Set((kernel.graph?.nodes || []).map(node => node.path));
  return (kernel.script || '').split('\n').flatMap((source, index) => {
    const match = /^me\.([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)\(/.exec(source);
    const derived = /^me\["="\]\("([^"]+)",/.exec(source);
    const target = match?.[1] || derived?.[1];
    if (!target || !known.has(target) || (target !== path && !target.startsWith(path + '.'))) return [];
    return [{ path: target, line: index + 1, source }];
  });
}
