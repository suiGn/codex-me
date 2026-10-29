const R = window.React, h = R.createElement, G = window.GUI;
const { Box, Typography, Button } = G.Atoms;
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' };
const codeStyle = { minWidth: 0, '& pre code': { whiteSpace: 'pre-wrap !important', overflowWrap: 'anywhere' }, '& pre code > span': { display: 'block !important', overflowWrap: 'anywhere' }, '& pre code > span > span': { display: 'inline !important' } };
const code = (source, language, title) => h(G.CodeBlock, { code: source, language, title, wrapLongLines: true, showLineNumbers: false, showCopyButton: true, style: { borderRadius: 8 } });
export function KernelConsole({ kernel, path }) {
  const [outputs, setOutputs] = R.useState({}), [busy, setBusy] = R.useState(null), [error, setError] = R.useState('');
  const mounted = R.useRef(true);
  R.useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const leaf = kernel.graph?.nodes.some(node => node.path === path);
  const query = async operation => {
    setBusy(operation); setError('');
    try {
      const params = new URLSearchParams({ path, operation });
      const response = await fetch(`/api/kernels/${encodeURIComponent(kernel.id)}/query?${params}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Query failed');
      if (mounted.current) setOutputs(previous => ({ ...previous, [operation]: result.output }));
    } catch (e) { if (mounted.current) setError(e.message); }
    finally { if (mounted.current) setBusy(null); }
  };
  return h(Box, { 'data-kernel-console': kernel.id, sx: codeStyle },
    h(Box, { component: 'details', 'data-me-script': kernel.id, sx: { mb: 2 } },
      h(Box, { component: 'summary', sx: { ...mono, fontSize: 12, cursor: 'pointer', color: 'text.secondary', mb: 1 } }, 'Script'),
      code(kernel.script, 'javascript', 'Construction script')),
    leaf ? h(R.Fragment, null,
      ...['run', 'explain'].map(operation => {
        const expression = `me${operation === 'explain' ? '.explain' : ''}(${JSON.stringify(path)})`;
        return h(Box, { key: operation, sx: { mb: 2 } },
          h(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, mb: 1 } },
            h(Button, { size: 'small', variant: 'outlined', disabled: !!busy, onClick: () => query(operation), 'aria-label': operation === 'run' ? 'Run me()' : 'Run explain()', sx: { ...mono, textTransform: 'none', flexShrink: 0 } }, busy === operation ? 'Running…' : operation === 'run' ? 'Run' : 'Explain'),
            h(Typography, { component: 'code', sx: { ...mono, fontSize: 11, overflowWrap: 'anywhere' } }, expression)),
          Object.hasOwn(outputs, operation) ? h(Box, { 'data-query-output': operation, 'aria-live': 'polite' }, code(JSON.stringify(outputs[operation], null, 2), 'json', operation === 'run' ? 'Run · JSON' : 'Explain · JSON')) : null);
      }),
      error ? h(Typography, { role: 'alert', sx: { fontSize: 12, color: 'error.main' } }, error) : null)
      : h(Typography, { sx: { ...mono, fontSize: 12, color: 'text.secondary' } }, 'Select a path to run or explain.'));
}
