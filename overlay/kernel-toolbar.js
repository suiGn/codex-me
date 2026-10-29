const R = window.React, h = R.createElement, G = window.GUI;
const { Box, Button, Tooltip } = G.Atoms;
const modes = ['Explain', 'Script'];
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' };
const action = { minWidth: 26, height: 28, p: 0.5, color: 'text.secondary' };

// One compact row: readable mode choice, source location, optional raw trace.
export function KernelToolbar({ prefix, mode, onMode, lines, location, onSource, jsonOpen, onJson }) {
  return h(Box, { 'data-kernel-toolbar': true, sx: { display: 'flex', alignItems: 'center', gap: 0.5, minHeight: 28, mb: 0.75 } },
    h(Box, { role: 'tablist', 'aria-label': 'Kernel views', sx: { display: 'inline-flex', gap: 0.25 } },
      modes.map((label, index) => h(Button, { key: label, role: 'tab', id: `${prefix}-${label}`, 'aria-selected': mode === label, 'aria-controls': `${prefix}-panel`, tabIndex: mode === label ? 0 : -1,
        onClick: () => onMode(label), onKeyDown: event => {
          const next = ['ArrowRight', 'ArrowLeft'].includes(event.key) ? (index + 1) % modes.length : event.key === 'Home' ? 0 : event.key === 'End' ? modes.length - 1 : null;
          if (next === null) return;
          event.preventDefault(); onMode(modes[next]); event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next].focus();
        }, sx: { ...mono, minWidth: 0, height: 28, px: 0.9, py: 0.25, fontSize: 11, lineHeight: 1.4, fontWeight: mode === label ? 600 : 400, textTransform: 'none', borderRadius: 0.75, bgcolor: mode === label ? 'action.selected' : 'transparent', color: mode === label ? 'text.primary' : 'text.secondary' } }, label))),
    h(Box, { sx: { flex: 1 } }),
    lines.length ? h(Tooltip, { title: `Go to source · ${location}`, describeChild: true },
      h(Button, { size: 'small', 'aria-label': 'View in Script', onClick: onSource, sx: { ...action, ...mono, fontSize: 10, textTransform: 'none', px: 0.5 } }, lines.length === 1 ? `L${lines[0]}` : `L${lines[0]}–${lines.at(-1)}`)) : null,
    mode === 'Explain' && lines.length ? h(Tooltip, { title: jsonOpen ? 'Hide JSON' : 'Show JSON', describeChild: true },
      h(Button, { size: 'small', 'aria-label': 'Explain JSON', 'aria-expanded': jsonOpen, onClick: onJson, sx: { ...action, bgcolor: jsonOpen ? 'action.selected' : 'transparent' } },
        h('svg', { width: 15, height: 15, viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, 'aria-hidden': true }, h('path', { d: 'M7 3H5v5l-2 2 2 2v5h2M13 3h2v5l2 2-2 2v5h-2' })))) : null);
}
