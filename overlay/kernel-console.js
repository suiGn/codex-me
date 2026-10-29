import { sourceDeclarations } from './kernel-source.js';
const R = window.React, h = R.createElement, G = window.GUI;
const { Box, Typography, Button } = G.Atoms;
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' };
const codeStyle = { minWidth: 0, '& pre code': { whiteSpace: 'pre-wrap !important', overflowWrap: 'anywhere' }, '& pre code > span': { display: 'block !important', overflowWrap: 'anywhere' }, '& pre code > span > span': { display: 'inline !important' } };
function CopyIcon({ text, label = 'Copy code' }) {
  const [copied, setCopied] = R.useState(false), [error, setError] = R.useState(false);
  R.useEffect(() => { setCopied(false); setError(false); }, [text]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setError(false); }
    catch { setError(true); }
  };
  return h(G.Atoms.Tooltip, { title: error ? 'Could not copy' : copied ? 'Copied' : 'Copy', describeChild: true, arrow: true },
    h(Button, { size: 'small', onClick: copy, 'aria-label': label, sx: { minWidth: 26, width: 26, height: 26, p: 0.5, flexShrink: 0, color: error ? 'error.main' : 'text.secondary' } },
      h('svg', { width: 15, height: 15, viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, 'aria-hidden': true },
        copied ? h('path', { d: 'm4 10 4 4 8-9' }) : h(R.Fragment, null, h('rect', { x: 7, y: 7, width: 10, height: 10, rx: 1.5 }), h('path', { d: 'M13 5V3H3v10h2' })))));
}
function InlineCode({ source, language, numbered = false, copyLabel = 'Copy code' }) {
  return h(Box, { 'data-inline-code': true, sx: { display: 'flex', alignItems: 'flex-start', gap: 0.5, minWidth: 0, '& pre': { padding: '0 !important', background: 'transparent !important', fontSize: '12px !important', lineHeight: '1.65 !important' } } },
    h(Box, { sx: { flex: 1, minWidth: 0 } }, h(G.CodeBlock, { code: source, language, wrapLongLines: true, showLineNumbers: numbered, showCopyButton: false, style: { border: 0, borderRadius: 0, background: 'transparent', color: 'inherit', overflow: 'visible' } })),
    h(CopyIcon, { key: source, text: source, label: copyLabel }));
}
const code = (source, language, numbered = false) => h(InlineCode, { source, language, numbered });
function CodeLine({ value }) {
  return h(InlineCode, { source: JSON.stringify(value), language: 'json', copyLabel: 'Copy output' });
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
      : code(JSON.stringify(result.output, null, 2), 'json'))
    : h(Typography, { role: 'status', sx: { ...mono, fontSize: 12, color: 'text.secondary' } }, 'Loading…'); }
export function KernelOutput({ kernel, path, compact = false }) {
  const leaf = kernel.graph?.nodes.some(node => node.path === path || node.path.startsWith(path+'.'));
  const output = useQuery(kernel, path, 'run', leaf);
  const state = kernel.sections?.[path.split('.')[1]];
  if (!leaf || state?.status === 'error') return h(Typography, { role: state?.status === 'error' ? 'alert' : 'status', sx: { ...mono, fontSize: 11, color: state?.status === 'error' ? 'error.main' : 'text.secondary', mb: 1 } }, state?.error || 'Loading Twitch…');
  return h(Box, { component: 'section', 'aria-label': 'Output', sx: { ...codeStyle, mb: compact ? 0 : 2 } }, renderResult(output, 'run', kernel, path, leaf));
}
export function KernelConsole({ kernel, path }) {
  const [tab, setTab] = R.useState('Explain'), [jsonOpen, setJsonOpen] = R.useState(false);
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
      tab === 'Script' ? h(Box, { ref: scriptRef, 'data-me-script': kernel.id, 'data-source-lines': declarations.map(item => item.line).join(','), sx: highlights }, code(kernel.script, 'javascript', true))
        : h(R.Fragment, null,
          declarations.length ? h(Box, { 'data-explain-source': path, 'data-source-lines': lines.join(','), sx: { mb: 1.5 } },
            code(declarations.map(item => item.source).join('\n'), 'javascript'),
            h(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 } },
              h(G.Atoms.Tooltip, { title: `View in Script · ${location}`, describeChild: true }, h(Button, { size: 'small', 'aria-label': 'View in Script', onClick: () => { setJump(declarations[0].line); setTab('Script'); }, sx: { ...mono, minWidth: 0, px: 0, fontSize: 10, color: 'text.secondary', textTransform: 'none' } }, lines.length === 1 ? `L${lines[0]}` : `L${lines[0]}–${lines.at(-1)}`)),
              h(Button, { size: 'small', 'aria-label': 'Explain JSON', 'aria-expanded': jsonOpen, onClick: () => setJsonOpen(value => !value), sx: { ...mono, minWidth: 0, px: 0.5, fontSize: 10, color: 'text.secondary', textTransform: 'none' } }, jsonOpen ? 'JSON ▴' : 'JSON ▾'))) : null,
          (jsonOpen || !declarations.length || explanation?.error) ? renderResult(explanation, 'explain', kernel, path, leaf) : null)));
}
