// Rendered card navigation; the inspector's code hierarchy lives in kernel-tree.js.
const R = window.React, h = R.createElement, G = window.GUI;
const { Box, Button } = G.Atoms;
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' };
const sections = ['stream','channel','followers'];
export function TwitchSections({ owner = '', path, selectPath }) {
  const section = sections.includes(path.split('.')[1]) ? path.split('.')[1] : path === 'twitch' ? 'stream' : null;
  const prefix = R.useId();
  return h(Box, { 'data-kernel-path': path, 'data-kernel-owner': owner, sx: { minWidth: 0, mb: 1.5 } },
    h(Box, { role: 'tablist', 'aria-label': 'Twitch sections', sx: { display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', borderBottom: 1, borderColor: 'divider' } },
      sections.map((name, index) => h(Button, { key: name, role: 'tab', id: `${prefix}-${name}`, 'aria-selected': section === name, tabIndex: section === name ? 0 : -1,
        onClick: () => selectPath(`twitch.${name}`), onKeyDown: event => {
          const next = event.key === 'ArrowRight' ? (index+1)%sections.length : event.key === 'ArrowLeft' ? (index+sections.length-1)%sections.length : event.key === 'Home' ? 0 : event.key === 'End' ? sections.length-1 : null;
          if (next === null) return; event.preventDefault(); selectPath(`twitch.${sections[next]}`); event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next].focus();
        }, sx: { ...mono, fontSize: { xs: 10, lg: 11 }, px: 0.25, minWidth: 0, textTransform: 'none', borderRadius: 0, borderBottom: 2, borderColor: section === name ? 'primary.main' : 'transparent', color: section === name ? 'text.primary' : 'text.secondary' } }, name[0].toUpperCase()+name.slice(1)))));
}
