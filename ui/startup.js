const G = window.GUI;
const root = document.getElementById('root');
if (!G || !window.React || !window.ReactDOM) {
  root.textContent = 'Could not load React 18.3.1 / this.gui 4.2.1 from jsDelivr. Check your connection and reload.';
} else {
  const h = React.createElement;
  const { Box, Typography, Card, CardContent, Button } = G.Atoms;
  const initial = JSON.parse(document.getElementById('startup-status').textContent);
  const font = '"IBM Plex Mono", "SF Mono", ui-monospace, Menlo, monospace';
  const mono = { fontFamily: font, lineHeight: 1.6 };
  const label = { ...mono, fontSize: 11, letterSpacing: '.09em', textTransform: 'uppercase', color: 'text.secondary' };
  function Panel({ title, value, description, id }) {
    return h(Card, { variant: 'outlined', sx: { bgcolor: 'background.paper', height: '100%' } },
      h(CardContent, { sx: { p: 3 } },
        h(Typography, { sx: label }, title),
        h(Typography, { id, sx: { ...mono, fontSize: 23, fontWeight: 600, mt: 1, overflowWrap: 'anywhere' } }, value),
        h(Typography, { sx: { ...mono, fontSize: 13, color: 'text.secondary', mt: 1 } }, description)));
  }
  function AccountHeading() {
    return h(Box, { component: 'span', sx: { display: 'flex', alignItems: 'center', gap: 1.5 } },
      h(Box, { component: 'img', src: '/ui/assets/twitch-glitch-purple.svg', alt: '', sx: { width: 24, height: 28, flexShrink: 0, objectFit: 'contain' } }),
      h(Typography, { component: 'span', sx: { ...label, color: theme => theme.palette.mode === 'light' ? '#772ce8' : '#bf94ff' } }, 'Twitch chat · Stream setup'));
  }
  function AccountPanel({ status }) {
    const user = status.profile;
    const login = user?.login || status.login;
    const name = user?.display_name || login;
    const [photoFailed, setPhotoFailed] = React.useState(false);
    React.useEffect(() => setPhotoFailed(false), [user?.profile_image_url]);
    if (!status.authed) return h(Panel, { title: h(AccountHeading), id: 'account-status', value: 'Not connected', description: 'Authorize the account that will send chat replies.' });
    return h(Card, { variant: 'outlined', sx: { bgcolor: 'background.paper', height: '100%' } },
      h(CardContent, { sx: { p: 3 } },
        h(AccountHeading),
        h(Box, { sx: { display: 'flex', gap: 2, alignItems: 'center', mt: 2, mb: 2 } },
          h(Box, { sx: { width: 64, height: 64, flexShrink: 0, borderRadius: '50%', overflow: 'hidden', bgcolor: '#9146ff', display: 'grid', placeItems: 'center', ...mono, fontSize: 24, color: '#fff' } },
            user?.profile_image_url && !photoFailed
              ? h(Box, { component: 'img', src: user.profile_image_url, alt: `${login}'s Twitch profile`, referrerPolicy: 'no-referrer', onError: () => setPhotoFailed(true), sx: { display: 'block', width: '100%', height: '100%', objectFit: 'cover' } })
              : String(login || '?').slice(0, 1).toUpperCase()),
          h(Box, { sx: { minWidth: 0 } },
            h(Typography, { id: 'account-status', sx: { ...mono, fontSize: 21, fontWeight: 600, overflowWrap: 'anywhere' } }, name),
            h(Typography, { component: 'a', href: `https://www.twitch.tv/${encodeURIComponent(login)}`, target: '_blank', rel: 'noopener noreferrer', sx: { ...mono, color: theme => theme.palette.mode === 'light' ? '#772ce8' : '#bf94ff', fontSize: 13, textDecoration: 'none', overflowWrap: 'anywhere' } }, `@${login}`))),
        user?.description ? h(Typography, { sx: { ...mono, fontSize: 12, color: 'text.secondary', mb: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere' } }, user.description) : null,
        h(Typography, { sx: { ...mono, fontSize: 12, color: 'text.secondary' } }, `Authorized to read and reply in @${status.channel}.`)));
  }
  function TwitchWordmark() {
    const { mode } = G.useThemeContext();
    return h(Box, { component: 'img', src: mode === 'light' ? '/ui/assets/twitch-wordmark-black.svg' : '/ui/assets/twitch-wordmark-white.svg', alt: 'Twitch', sx: { width: 88, height: 'auto', display: 'block' } });
  }
  function ModeToggle() {
    const { mode, toggleMode } = G.useThemeContext();
    const action = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    return h(Box, { component: 'button', type: 'button', onClick: toggleMode, 'aria-label': action, title: action, sx: { width: 36, height: 36, p: 0, display: 'grid', placeItems: 'center', cursor: 'pointer', border: 1, borderColor: 'divider', borderRadius: '50%', bgcolor: 'background.paper', color: 'text.primary', '&:hover': { bgcolor: 'action.hover' }, '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 3 } } },
      h('svg', { 'aria-hidden': true, width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' },
        mode === 'light' ? h(React.Fragment, null, h('circle', { cx: 12, cy: 12, r: 4 }), h('path', { d: 'M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42' })) : h('path', { d: 'M20.9 13.3A9 9 0 0 1 10.7 3.1 9 9 0 1 0 20.9 13.3Z' })));
  }
  function ThemeSelector() {
    const { themeId, themeName, mode } = G.useThemeContext();
    const selectedTheme = G.GuiThemes.find(theme => theme.themeId === themeId);
    const ref = React.useRef(null);
    React.useEffect(() => {
      const close = event => { if (event.type === 'keydown' ? event.key === 'Escape' : !ref.current?.contains(event.target)) { if (ref.current) ref.current.open = false; } };
      document.addEventListener('pointerdown', close); document.addEventListener('keydown', close);
      return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', close); };
    }, []);
    return h(Box, { component: 'details', ref, sx: { position: 'relative' } },
      h(Box, { component: 'summary', 'aria-label': `Theme selector: ${themeName}, ${mode}`, title: `${themeName} · ${mode} · Change theme`, sx: { position: 'relative', width: 44, height: 44, cursor: 'pointer', listStyle: 'none', borderRadius: '50%', '&::-webkit-details-marker': { display: 'none' }, '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 3 } } },
        h(Box, { sx: { width: 44, height: 44, display: 'grid', placeItems: 'center', border: 1, borderColor: 'divider', borderRadius: '50%', bgcolor: 'background.paper', transition: 'transform 120ms ease', '&:hover': { transform: 'translateY(-1px)' } } },
          selectedTheme?.badgeUrl ? h(Box, { component: 'img', src: selectedTheme.badgeUrl, alt: themeName, sx: { width: 34, height: 34, objectFit: 'contain', borderRadius: '50%' } }) : h(Typography, { sx: mono }, themeName.slice(0, 1))),
        h(Box, { component: 'span', 'aria-hidden': true, sx: { position: 'absolute', bottom: 0, right: 0, width: 19, height: 19, borderRadius: '50%', border: 1, borderColor: 'divider', bgcolor: 'background.paper', color: 'text.secondary', display: 'grid', placeItems: 'center', pointerEvents: 'none' } },
          h('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' },
            mode === 'light' ? h(React.Fragment, null, h('circle', { cx: 12, cy: 12, r: 4 }), h('path', { d: 'M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42' })) : h('path', { d: 'M20.9 13.3A9 9 0 0 1 10.7 3.1 9 9 0 1 0 20.9 13.3Z' })))),
      h(Box, { sx: { position: 'absolute', right: 0, top: 'calc(100% + 12px)', width: 'min(360px, calc(100vw - 48px))', maxHeight: '70vh', overflowY: 'auto', bgcolor: 'background.paper', color: 'text.primary', border: 1, borderColor: 'divider', borderRadius: 2, p: 2, zIndex: 1500, boxShadow: 6 } },
        h(Typography, { sx: { ...label, mb: 1 } }, 'Appearance'),
        h(G.ThemeModeToggle, { variant: 'switchWithLabel', show: 'label' }),
        h(G.ThemesCatalog, { variant: 'grid', minimal: true, compact: true, hideModeToggle: true, onThemeSelect: () => { if (ref.current) ref.current.open = false; }, sx: { mt: 2 } })));
  }
  function Startup() {
    const [status, setStatus] = React.useState(initial);
    const [offline, setOffline] = React.useState(false);
    const [loggingOut, setLoggingOut] = React.useState(false);
    const [logoutError, setLogoutError] = React.useState('');
    const logout = async () => {
      setLoggingOut(true); setLogoutError('');
      try {
        const response = await fetch('/auth/logout', { method: 'POST', headers: { 'X-CSRF-Token': initial.logoutCsrf } });
        if (!response.ok) throw new Error('Logout failed');
        location.reload();
      } catch { setLogoutError('Could not complete logout. Check the local server and try again.'); setLoggingOut(false); }
    };
    React.useEffect(() => {
      let disposed = false;
      const controller = new AbortController();
      const update = async () => {
        try {
          const response = await fetch('/api/status', { cache: 'no-store', signal: controller.signal });
          if (!response.ok) throw new Error('Unavailable');
          const data = await response.json();
          if (!disposed) { setStatus(data); setOffline(false); }
        } catch { if (!disposed) setOffline(true); }
      };
      void update(); const timer = setInterval(update, 3000);
      return () => { disposed = true; clearInterval(timer); controller.abort(); };
    }, []);
    const button = { component: 'a', sx: { ...mono, textTransform: 'none', px: 2.5, py: 1 } };
    return h(Box, { 'data-gui-node-id': 'GUI.window', sx: { minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' } },
      h(Box, { component: 'header', 'data-gui-node-id': 'GUI.window.layout.bars.top', sx: { borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', px: { xs: 3, md: 5 }, py: 2, display: 'flex', alignItems: 'baseline', gap: 2, flexWrap: 'wrap' } },
        h(Typography, { sx: { ...mono, fontSize: 20, fontWeight: 600 } }, 'Codex .me'),
        h(Box, { sx: { ml: 'auto', display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' } },
          h(TwitchWordmark),
          h(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 } },
            h(Typography, { component: 'a', href: 'https://www.npmjs.com/package/this.me', target: '_blank', rel: 'noopener noreferrer', sx: { ...label, textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: 'text.primary' } } }, 'this.me 4.2.1'),
            h(Typography, { 'aria-hidden': true, sx: label }, '·'),
            h(Typography, { component: 'a', href: 'https://www.npmjs.com/package/this.gui', target: '_blank', rel: 'noopener noreferrer', sx: { ...label, textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: 'text.primary' } } }, 'this.gui 4.2.1')),
          h(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 } }, h(ThemeSelector), h(ModeToggle)))),
      h(Box, { component: 'main', 'data-gui-node-id': 'GUI.window.layout.content', sx: { maxWidth: 1100, mx: 'auto', px: { xs: 3, md: 5 }, py: { xs: 3, md: 4 } } },
        h(Box, { sx: { display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' }, alignItems: 'start', gap: 2, mb: 3 } },
          h(AccountPanel, { status }),
          h(Card, { variant: 'outlined', sx: { bgcolor: 'background.paper' } },
            h(CardContent, { sx: { p: 2, '&:last-child': { pb: 2 } } },
              h(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 } },
                h(Typography, { sx: { ...mono, fontSize: 13, color: 'text.secondary' } }, 'Twitch chat'),
                h(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 } },
                  h(Box, { component: 'span', sx: { width: 7, height: 7, borderRadius: '50%', bgcolor: !offline && status.eventsub === 'connected' ? 'success.main' : 'text.secondary' } }),
                  h(Typography, { id: 'eventsub-status', 'aria-live': 'polite', sx: { ...mono, fontSize: 13 } }, offline ? 'Unavailable' : status.eventsub === 'connected' ? 'Connected' : 'Not connected'))),
              h(Box, { sx: { display: 'flex', justifyContent: 'space-between', gap: 2, mt: 1.5, pt: 1.5, borderTop: 1, borderColor: 'divider' } },
                h(Typography, { sx: { ...mono, fontSize: 13, color: 'text.secondary' } }, 'Open demo views'),
                h(Typography, { id: 'overlay-status', sx: { ...mono, fontSize: 13 } }, String(status.overlays))),
              offline || status.eventsub !== 'connected' ? h(Typography, { sx: { ...mono, fontSize: 12, color: 'text.secondary', mt: 1.5 } }, offline ? 'Check the local server and reload.' : status.detail) : null))),
        h(Box, { sx: { display: 'flex', gap: 2, flexWrap: 'wrap', mb: 5 } },
          !status.authed ? h(Button, { ...button, variant: 'contained', href: '/auth/login', sx: { ...button.sx, bgcolor: '#9146ff', color: '#fff', '&:hover': { bgcolor: '#772ce8' } } }, 'Connect with Twitch') : null,
          h(Button, { ...button, variant: 'outlined', href: '/overlay/?dev=0' }, 'Open demo'),
          h(Button, { ...button, variant: 'outlined', href: '/overlay/?transparent=1&dev=0' }, 'Open OBS source'),
          status.authed ? h(Button, { type: 'button', variant: 'text', onClick: logout, disabled: loggingOut, sx: { ...button.sx, ml: { md: 'auto' } } }, loggingOut ? 'Logging out…' : 'Log out') : null),
        logoutError ? h(Typography, { role: 'alert', sx: { ...mono, color: 'error.main', mb: 3 } }, logoutError) : null,
        h(Card, { variant: 'outlined', sx: { bgcolor: 'background.paper' } }, h(CardContent, { sx: { p: 3 } },
          h(Typography, { component: 'h2', sx: { ...mono, fontSize: 17, fontWeight: 600, mb: 2 } }, 'First live command'),
          h(Typography, { sx: { ...mono, fontSize: 13, color: 'text.secondary', mb: 2 } }, `In ${status.channel}'s Twitch chat, use an account other than the authorized reply account and type:`),
          h(Box, { component: 'code', sx: { display: 'block', ...mono, fontSize: 18, overflowWrap: 'anywhere', mb: 2 } }, '!walk oli left'),
          h(Typography, { sx: { ...mono, fontSize: 13, color: 'text.secondary' } }, 'Watch Oli move, read the kernel explanation, and check the threaded chat reply. You can also try !me oli.battery or !explain oli.explore.'))),
        h(Box, { sx: { mt: 4 } }, h(Typography, { sx: label }, 'OBS Browser Source · 1920 × 1080'),
          h(Typography, { component: 'code', sx: { ...mono, display: 'block', mt: 1, fontSize: 12, color: 'text.secondary', overflowWrap: 'anywhere' } }, `${location.origin}/overlay/?transparent=1&dev=0`),
          h(Typography, { sx: { ...mono, fontSize: 12, color: 'text.secondary', mt: 1 } }, 'Use Open demo for browser viewing. The OBS source has a transparent background for compositing.'))));
  }
  const type = { type: 'StreamSetup', resolve: () => h(Startup) };
  const Theme = ({ children }) => h(G.Theme, { initialThemeId: 'neurons.me', initialMode: 'dark' }, children);
  G.mount({ type: 'StreamSetup', props: {} }, root, { gui: { ...G, Theme, registry: { ...G.registry, StreamSetup: type } } });
}
