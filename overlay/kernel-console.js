const R = window.React, h = R.createElement, G = window.GUI;
const { Box, Typography, Button } = G.Atoms;
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' };
const codeStyle = { minWidth: 0, '& pre code': { whiteSpace: 'pre-wrap !important', overflowWrap: 'anywhere' }, '& pre code > span': { display: 'block !important', overflowWrap: 'anywhere' }, '& pre code > span > span': { display: 'inline !important' } };
const code = (source, language, title) => h(G.CodeBlock, { code: source, language, title, wrapLongLines: true, showLineNumbers: false, showCopyButton: true, style: { borderRadius: 8 } });
const tabs = ['Script', 'Output', 'Explain'];
export function KernelConsole({ kernel, path }) {
  const [tab, setTab] = R.useState('Script'), [outputs, setOutputs] = R.useState({}), [error, setError] = R.useState('');
  const leaf = kernel.graph?.nodes.some(node => node.path === path);
  const operation = tab === 'Explain' ? 'explain' : 'run';
  const prefix = `console-${kernel.id}`;
  R.useEffect(() => {
    if (tab === 'Script' || !leaf || Object.hasOwn(outputs, operation)) return;
    const controller = new AbortController();
    setError('');
    (async () => {
      try {
        const params = new URLSearchParams({ path, operation });
        const response = await fetch(`/api/kernels/${encodeURIComponent(kernel.id)}/query?${params}`, { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Query failed');
        if (!controller.signal.aborted) setOutputs(previous => ({ ...previous, [operation]: result.output }));
      } catch (e) { if (!controller.signal.aborted) setError(e.message); }
    })();
    return () => controller.abort();
  }, [tab, kernel.id, path, leaf, operation, outputs]);
  return h(Box, { 'data-kernel-console': kernel.id, sx: codeStyle },
    h(Box, { role: 'tablist', 'aria-label': 'Kernel views', sx: { display: 'flex', borderBottom: 1, borderColor: 'divider', mb: 1.5 } },
      tabs.map(label => h(Button, { key: label, role: 'tab', id: `${prefix}-${label}`, 'aria-selected': tab === label, 'aria-controls': `${prefix}-panel`, tabIndex: tab === label ? 0 : -1,
        onClick: () => setTab(label), onKeyDown: event => {
          const index = tabs.indexOf(label);
          const next = event.key === 'ArrowRight' ? (index + 1) % 3 : event.key === 'ArrowLeft' ? (index + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : null;
          if (next === null) return;
          event.preventDefault(); setTab(tabs[next]); event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next].focus();
        }, sx: { ...mono, flex: 1, minWidth: 0, textTransform: 'none', fontSize: 12, borderRadius: 0, borderBottom: 2, borderColor: tab === label ? 'primary.main' : 'transparent', color: tab === label ? 'text.primary' : 'text.secondary' } }, label))),
    h(Box, { role: 'tabpanel', id: `${prefix}-panel`, 'aria-labelledby': `${prefix}-${tab}`, tabIndex: 0 },
      tab === 'Script' ? h(Box, { 'data-me-script': kernel.id }, code(kernel.script, 'javascript', 'Script'))
        : !leaf ? h(Typography, { sx: { ...mono, fontSize: 12, color: 'text.secondary' } }, 'Select a path to see its output or explanation.')
        : error ? h(Typography, { role: 'alert', sx: { fontSize: 12, color: 'error.main' } }, error)
        : Object.hasOwn(outputs, operation) ? h(Box, { 'data-query-output': operation, 'aria-live': 'polite' }, code(JSON.stringify(outputs[operation], null, 2), 'json', `me${tab === 'Explain' ? '.explain' : ''}(${JSON.stringify(path)})`))
        : h(Typography, { role: 'status', sx: { ...mono, fontSize: 12, color: 'text.secondary' } }, 'Loading…')));
}
