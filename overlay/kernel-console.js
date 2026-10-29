const R = window.React, h = R.createElement, G = window.GUI;
const { Box, Typography, Button } = G.Atoms;
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' };
const codeStyle = { minWidth: 0, '& pre code': { whiteSpace: 'pre-wrap !important', overflowWrap: 'anywhere' }, '& pre code > span': { display: 'block !important', overflowWrap: 'anywhere' }, '& pre code > span > span': { display: 'inline !important' } };
const code = (source, language, title) => h(G.CodeBlock, { code: source, language, title, wrapLongLines: true, showLineNumbers: false, showCopyButton: true, style: { borderRadius: 8 } });
function CodeLine({ value }) {
  const [copied, setCopied] = R.useState(false), [error, setError] = R.useState('');
  const text = JSON.stringify(value);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setError(''); }
    catch { setError('Could not copy. Select the value to copy it manually.'); }
  };
  return h(R.Fragment, null,
    h(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, px: 1.25, py: 0.5, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'action.hover' } },
      h(Typography, { component: 'code', sx: { ...mono, flex: 1, minWidth: 0, overflowX: 'auto', whiteSpace: 'pre', fontSize: 12, color: 'text.primary' } }, text),
      h(Button, { size: 'small', onClick: copy, 'aria-label': 'Copy output', sx: { ...mono, minWidth: 0, flexShrink: 0, textTransform: 'none', fontSize: 11 } }, copied ? 'Copied' : 'Copy')),
    error ? h(Typography, { role: 'alert', sx: { fontSize: 12, color: 'error.main', mt: 0.5 } }, error) : null);
}
const tabs = ['Script', 'Explain'];
function useQuery(id, path, operation, enabled) {
  const [result, setResult] = R.useState(null);
  const key = JSON.stringify([id, path, operation]);
  R.useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    (async () => {
      try {
        const params = new URLSearchParams({ path, operation });
        const response = await fetch(`/api/kernels/${encodeURIComponent(id)}/query?${params}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Query failed');
        if (!controller.signal.aborted) setResult({ key, output: data.output });
      } catch (e) { if (!controller.signal.aborted) setResult({ key, error: e.message }); }
    })();
    return () => controller.abort();
  }, [id, path, operation, enabled, key]);
  return result?.key === key ? result : null;
}
function renderResult(result, operation, kernel, path, leaf) { return !leaf
    ? null
    : result?.error ? h(Typography, { role: 'alert', sx: { fontSize: 12, color: 'error.main' } }, result.error)
    : result ? h(Box, { 'data-query-output': operation, 'aria-live': 'polite' }, operation === 'run'
      ? h(CodeLine, { key: `${kernel.id}:${path}`, value: result.output })
      : code(JSON.stringify(result.output, null, 2), 'json', `me.explain(${JSON.stringify(path)})`))
    : h(Typography, { role: 'status', sx: { ...mono, fontSize: 12, color: 'text.secondary' } }, 'Loading…'); }
export function KernelOutput({ kernel, path, compact = false }) {
  const leaf = kernel.graph?.nodes.some(node => node.path === path);
  const output = useQuery(kernel.id, path, 'run', leaf);
  if (!leaf) return null;
  return h(Box, { component: 'section', 'aria-label': 'Output', sx: { mb: compact ? 0 : 2 } }, renderResult(output, 'run', kernel, path, leaf));
}
export function KernelConsole({ kernel, path }) {
  const [tab, setTab] = R.useState('Script');
  const leaf = kernel.graph?.nodes.some(node => node.path === path);
  const explanation = useQuery(kernel.id, path, 'explain', leaf && tab === 'Explain');
  const prefix = `console-${kernel.id}`;
  return h(Box, { 'data-kernel-console': kernel.id, sx: codeStyle },
    h(KernelOutput, { kernel, path }),
    h(Box, { role: 'tablist', 'aria-label': 'Kernel views', sx: { display: 'flex', borderBottom: 1, borderColor: 'divider', mb: 1.5 } },
      tabs.map(label => h(Button, { key: label, role: 'tab', id: `${prefix}-${label}`, 'aria-selected': tab === label, 'aria-controls': `${prefix}-panel`, tabIndex: tab === label ? 0 : -1,
        onClick: () => setTab(label), onKeyDown: event => {
          const index = tabs.indexOf(label);
          const next = ['ArrowRight', 'ArrowLeft'].includes(event.key) ? (index + 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
          if (next === null) return;
          event.preventDefault(); setTab(tabs[next]); event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next].focus();
        }, sx: { ...mono, flex: 1, minWidth: 0, textTransform: 'none', fontSize: 12, borderRadius: 0, borderBottom: 2, borderColor: tab === label ? 'primary.main' : 'transparent', color: tab === label ? 'text.primary' : 'text.secondary' } }, label))),
    h(Box, { role: 'tabpanel', id: `${prefix}-panel`, 'aria-labelledby': `${prefix}-${tab}`, tabIndex: 0 },
      tab === 'Script' ? h(Box, { 'data-me-script': kernel.id }, code(kernel.script, 'javascript', 'Script')) : renderResult(explanation, 'explain', kernel, path, leaf)));
}
