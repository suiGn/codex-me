import { sourceDeclarations } from './kernel-source.js';
const R = window.React, h = R.createElement, G = window.GUI;
const { Box, Typography, Button } = G.Atoms;
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' };
const codeStyle = { minWidth: 0, '& pre code': { whiteSpace: 'pre-wrap !important', overflowWrap: 'anywhere' }, '& pre code > span': { display: 'block !important', overflowWrap: 'anywhere' }, '& pre code > span > span': { display: 'inline !important' } };
const code = (source, language, title, numbered = false) => h(G.CodeBlock, { code: source, language, title, wrapLongLines: true, showLineNumbers: numbered, showCopyButton: true, style: { borderRadius: 8 } });
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
const tabs = ['Explain', 'Script'];
function useQuery(kernel, path, operation, enabled) {
  const [result, setResult] = R.useState(null);
  const nodes = kernel.graph?.nodes || [], leaf = nodes.some(node => node.path === path);
  const paths = leaf ? [path] : nodes.filter(node => node.path.startsWith(path+'.')).map(node => node.path);
  const revision = kernel.sections?.[path.split('.')[1]]?.updatedAt || 0;
  const key = JSON.stringify([kernel.id, path, operation, paths, revision]);
  R.useEffect(() => {
    if (!enabled || !paths.length) return;
    const controller = new AbortController();
    (async () => {
      try {
        const entries = await Promise.all(paths.map(async target => {
          const response = await fetch(`/api/kernels/${encodeURIComponent(kernel.id)}/query?${new URLSearchParams({ path: target, operation })}`, { signal: controller.signal });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Query failed');
          return [target.slice(path.length+1), data.output];
        }));
        // A section is a UI projection of actual leaf reads/traces, not a native namespace read.
        if (!controller.signal.aborted) setResult({ key, output: leaf ? entries[0][1] : Object.fromEntries(entries), projection: !leaf });
      } catch (e) { if (!controller.signal.aborted) setResult({ key, error: e.message }); }
    })();
    return () => controller.abort();
  }, [key, enabled]);
  return result?.key === key ? result : null;
}
function renderResult(result, operation, kernel, path, leaf) { return !leaf
    ? null
    : result?.error ? h(Typography, { role: 'alert', sx: { fontSize: 12, color: 'error.main' } }, result.error)
    : result ? h(Box, { 'data-query-output': operation, 'aria-live': 'polite' }, operation === 'run' && !result.projection
      ? h(CodeLine, { key: `${kernel.id}:${path}:${JSON.stringify(result.output)}`, value: result.output })
      : code(JSON.stringify(result.output, null, 2), 'json', result.projection ? operation === 'run' ? 'Values' : 'Explanations' : `me.explain(${JSON.stringify(path)})`))
    : h(Typography, { role: 'status', sx: { ...mono, fontSize: 12, color: 'text.secondary' } }, 'Loading…'); }
export function KernelOutput({ kernel, path, compact = false }) {
  const leaf = kernel.graph?.nodes.some(node => node.path === path || node.path.startsWith(path+'.'));
  const output = useQuery(kernel, path, 'run', leaf);
  const state = kernel.sections?.[path.split('.')[1]];
  if (!leaf || state?.status === 'error') return h(Typography, { role: state?.status === 'error' ? 'alert' : 'status', sx: { ...mono, fontSize: 11, color: state?.status === 'error' ? 'error.main' : 'text.secondary', mb: 1 } }, state?.error || 'Loading Twitch…');
  return h(Box, { component: 'section', 'aria-label': 'Output', sx: { ...codeStyle, mb: compact ? 0 : 2 } }, renderResult(output, 'run', kernel, path, leaf));
}
export function KernelConsole({ kernel, path }) {
  const [tab, setTab] = R.useState('Explain');
  const scriptRef = R.useRef(null), [jump, setJump] = R.useState(0);
  const declarations = sourceDeclarations(kernel, path);
  const lines = declarations.map(item => item.line);
  const location = lines.length === 1 ? `line ${lines[0]}` : lines.every((line, index) => line === lines[0] + index) ? `lines ${lines[0]}–${lines.at(-1)}` : `lines ${lines.join(', ')}`;
  R.useLayoutEffect(() => {
    if (tab === 'Script' && jump && declarations.length) scriptRef.current?.querySelector(`pre code > span:nth-of-type(${declarations[0].line})`)?.scrollIntoView({ block: 'nearest' });
  }, [tab, jump, kernel.script, path]);
  const highlights = Object.fromEntries(declarations.map(item => [`& pre code > span:nth-of-type(${item.line})`, { bgcolor: 'action.selected', boxShadow: 'inset 2px 0 currentColor' }]));
  const leaf = kernel.graph?.nodes.some(node => node.path === path || node.path.startsWith(path+'.'));
  const explanation = useQuery(kernel, path, 'explain', leaf && tab === 'Explain');
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
      tab === 'Script' ? h(Box, { ref: scriptRef, 'data-me-script': kernel.id, 'data-source-lines': declarations.map(item => item.line).join(','), sx: highlights }, code(kernel.script, 'javascript', 'Script', true))
        : h(R.Fragment, null,
          declarations.length ? h(Box, { 'data-explain-source': path, 'data-source-lines': lines.join(','), sx: { mb: 1.5 } },
            code(declarations.map(item => item.source).join('\n'), 'javascript', `${declarations.length === 1 ? 'Declaration' : 'Declarations'} · ${location}`),
            h(Button, { size: 'small', onClick: () => { setJump(declarations[0].line); setTab('Script'); }, sx: { ...mono, fontSize: 11, textTransform: 'none' } }, 'View in Script')) : null,
          renderResult(explanation, 'explain', kernel, path, leaf))));
}
