// Shared presentation controls; no access to the robot kernels or Twitch credentials.
export function createThemeControls(G, React) {
  const h = React.createElement;
  const { Box, Typography } = G.Atoms;
  const mono = { fontFamily: '"IBM Plex Mono", "SF Mono", ui-monospace, Menlo, monospace', lineHeight: 1.6 };
  const label = { ...mono, fontSize: 11, letterSpacing: '.09em', textTransform: 'uppercase', color: 'text.secondary' };
  function ModeToggle() {
    const { mode, toggleMode } = G.useThemeContext();
    const action = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    return h(Box, { component: 'button', type: 'button', onClick: toggleMode, 'aria-label': action, title: action, sx: { width: 36, height: 36, p: 0, display: 'grid', placeItems: 'center', cursor: 'pointer', border: 1, borderColor: 'divider', borderRadius: '50%', bgcolor: 'background.paper', color: 'text.primary', '&:hover': { bgcolor: 'action.hover' }, '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 3 } } },
      h('svg', { 'aria-hidden': true, width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' },
        mode === 'light' ? h(React.Fragment, null, h('circle', { cx: 12, cy: 12, r: 4 }), h('path', { d: 'M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42' })) : h('path', { d: 'M20.9 13.3A9 9 0 0 1 10.7 3.1 9 9 0 1 0 20.9 13.3Z' })));
  }
  function ThemeSelector() {
    const { themeId, themeName } = G.useThemeContext();
    const selectedTheme = G.GuiThemes.find(theme => theme.themeId === themeId);
    const ref = React.useRef(null);
    React.useEffect(() => {
      const close = event => { if (event.type === 'keydown' ? event.key === 'Escape' : !ref.current?.contains(event.target)) { if (ref.current) ref.current.open = false; } };
      document.addEventListener('pointerdown', close); document.addEventListener('keydown', close);
      return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', close); };
    }, []);
    return h(Box, { component: 'details', ref, sx: { position: 'relative' } },
      h(Box, { component: 'summary', 'aria-label': `Theme selector: ${themeName}`, title: `${themeName} · Change theme`, sx: { width: 44, height: 44, cursor: 'pointer', listStyle: 'none', borderRadius: '50%', '&::-webkit-details-marker': { display: 'none' }, '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 3 } } },
        h(Box, { sx: { width: 44, height: 44, display: 'grid', placeItems: 'center', border: 1, borderColor: 'divider', borderRadius: '50%', bgcolor: 'background.paper', transition: 'transform 120ms ease', '&:hover': { transform: 'translateY(-1px)' } } },
          selectedTheme?.badgeUrl ? h(Box, { component: 'img', src: selectedTheme.badgeUrl, alt: themeName, sx: { width: 34, height: 34, objectFit: 'contain', borderRadius: '50%' } }) : h(Typography, { sx: mono }, themeName.slice(0, 1)))),
      h(Box, { sx: { position: 'absolute', right: 0, top: 'calc(100% + 12px)', width: 'min(360px, calc(100vw - 48px))', boxSizing: 'border-box', maxHeight: '70vh', overflowY: 'auto', bgcolor: 'background.paper', color: 'text.primary', border: 1, borderColor: 'divider', borderRadius: 2, p: 2, zIndex: 1500, boxShadow: 6 } },
        h(Typography, { sx: { ...label, mb: 1 } }, 'Themes'),
        h(G.ThemesCatalog, { variant: 'grid', minimal: true, compact: true, hideModeToggle: true, onThemeSelect: () => { if (ref.current) ref.current.open = false; }, sx: { mt: 1 } })));
  }
  return { ModeToggle, ThemeSelector };
}
