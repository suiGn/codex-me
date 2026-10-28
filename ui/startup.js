import { createThemeControls } from '/overlay/theme-controls.js';
const G = window.GUI;
const root = document.getElementById('root');
if (!G || !window.React || !window.ReactDOM) {
  root.textContent = 'Could not load React 18.3.1 / this.gui 4.2.1 from jsDelivr. Check your connection and reload.';
} else {
  const h = React.createElement;
  const { Box, Typography, Card, CardContent, Button } = G.Atoms;
  const { Hero } = G.Molecules;
  const initial = JSON.parse(document.getElementById('startup-status').textContent);
  const font = '"IBM Plex Mono", "SF Mono", ui-monospace, Menlo, monospace';
  const mono = { fontFamily: font, lineHeight: 1.6 };
  const label = { ...mono, fontSize: 11, letterSpacing: '.09em', textTransform: 'uppercase', color: 'text.secondary' };
  function AccountHeading() {
    return h(Box, { component: 'span', sx: { display: 'flex', alignItems: 'center', gap: 1.5 } },
      h(Box, { component: 'img', src: '/ui/assets/twitch-glitch-purple.svg', alt: '', sx: { width: 24, height: 28, flexShrink: 0, objectFit: 'contain' } }),
      h(Typography, { component: 'span', sx: { ...label, color: theme => theme.palette.mode === 'light' ? '#772ce8' : '#bf94ff' } }, 'Twitch chat · Stream setup'));
  }
  function AccountPanel({ status, offline, onLogout, loggingOut, logoutError }) {
    const user = status.profile;
    const login = user?.login || status.login;
    const name = user?.display_name || login;
    const [photoFailed, setPhotoFailed] = React.useState(false);
    React.useEffect(() => setPhotoFailed(false), [user?.profile_image_url]);
    const connected = !offline && status.authed && status.eventsub === 'connected';
    const actionSx = { ...mono, fontSize: 12, textTransform: 'none', flexShrink: 0 };
    return h(Card, { variant: 'outlined', sx: { bgcolor: 'background.paper', mb: 2 } },
      h(CardContent, { sx: { p: 2, '&:last-child': { pb: 2 } } },
        h(AccountHeading),
        h(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2, mt: 1.5, flexWrap: 'wrap' } },
          status.authed ? h(React.Fragment, null,
            h(Box, { sx: { width: 44, height: 44, flexShrink: 0, borderRadius: '50%', overflow: 'hidden', bgcolor: '#9146ff', display: 'grid', placeItems: 'center', ...mono, fontSize: 20, color: '#fff' } },
              user?.profile_image_url && !photoFailed
                ? h(Box, { component: 'img', src: user.profile_image_url, alt: `${login}'s Twitch profile`, referrerPolicy: 'no-referrer', onError: () => setPhotoFailed(true), sx: { display: 'block', width: '100%', height: '100%', objectFit: 'cover' } })
                : String(login || '?').slice(0, 1).toUpperCase()),
            h(Box, { sx: { minWidth: 0 } },
              h(Typography, { id: 'account-status', sx: { ...mono, fontSize: 16, fontWeight: 600 } }, name),
              h(Typography, { component: 'a', href: `https://www.twitch.tv/${encodeURIComponent(login)}`, target: '_blank', rel: 'noopener noreferrer', sx: { ...mono, color: theme => theme.palette.mode === 'light' ? '#772ce8' : '#bf94ff', fontSize: 12, textDecoration: 'none' } }, `@${login}`)))
            : h(Typography, { id: 'account-status', sx: { ...mono, fontSize: 13 } }, 'Connect Twitch to listen to chat.'),
          h(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, ml: { sm: 'auto' } } },
            h(Box, { component: 'span', sx: { width: 6, height: 6, borderRadius: '50%', bgcolor: connected ? 'success.main' : 'text.secondary' } }),
            h(Typography, { id: 'eventsub-status', 'aria-live': 'polite', sx: { ...mono, fontSize: 12 } }, offline ? 'Server unavailable' : connected ? 'Chat connected' : status.authed ? 'Reconnecting…' : 'Not connected')),
          h(Typography, { id: 'overlay-status', title: 'Open overlay browser tabs, not Twitch viewers', sx: { ...mono, fontSize: 12, color: 'text.secondary' } }, `${status.overlays} demo tab${status.overlays === 1 ? '' : 's'}`),
          status.authed
            ? h(Button, { type: 'button', variant: 'text', onClick: onLogout, disabled: loggingOut, sx: actionSx }, loggingOut ? 'Logging out…' : 'Log out')
            : h(Button, { component: 'a', href: '/auth/login', variant: 'contained', sx: { ...actionSx, bgcolor: '#9146ff', color: '#fff', '&:hover': { bgcolor: '#772ce8' } } }, 'Connect with Twitch')),
        user?.description ? h(Typography, { sx: { ...mono, fontSize: 11, color: 'text.secondary', mt: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, user.description) : null,
        logoutError ? h(Typography, { role: 'alert', sx: { ...mono, color: 'error.main', fontSize: 12, mt: 1 } }, logoutError) : null));
  }
  function TwitchWordmark() {
    const { mode } = G.useThemeContext();
    return h(Box, { component: 'img', src: mode === 'light' ? '/ui/assets/twitch-wordmark-black.svg' : '/ui/assets/twitch-wordmark-white.svg', alt: 'Twitch', sx: { width: 88, height: 'auto', display: 'block' } });
  }
  const { ModeToggle, ThemeSelector } = createThemeControls(G, React);
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
      h(Box, { component: 'header', 'data-gui-node-id': 'GUI.window.layout.bars.top', sx: { borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', px: { xs: 3, md: 5 }, height: 48, py: 0, display: 'flex', alignItems: 'center', gap: 2 } },
        h(Typography, { sx: { ...mono, fontSize: 20, fontWeight: 600, flexShrink: 0 } }, 'Codex .me'),
        h(Box, { sx: { ml: 'auto', display: 'flex', alignItems: 'center', gap: 3 } },
          h(TwitchWordmark),
          h(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 } },
            h(Typography, { component: 'a', href: 'https://www.npmjs.com/package/this.me', target: '_blank', rel: 'noopener noreferrer', sx: { ...label, textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: 'text.primary' } } }, 'this.me 4.2.1'),
            h(Typography, { 'aria-hidden': true, sx: label }, '·'),
            h(Typography, { component: 'a', href: 'https://www.npmjs.com/package/this.gui', target: '_blank', rel: 'noopener noreferrer', sx: { ...label, textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: 'text.primary' } } }, 'this.gui 4.2.1')),
          h(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 } }, h(ThemeSelector), h(ModeToggle)))),
      h(Box, { component: 'main', 'data-gui-node-id': 'GUI.window.layout.content', sx: { maxWidth: 1100, mx: 'auto', px: { xs: 3, md: 5 }, py: { xs: 3, md: 4 } } },
        h(AccountPanel, { status, offline, onLogout: logout, loggingOut, logoutError }),
        h(Hero, {
          'data-gui-component': 'Hero',
          layout: 'flow', height: 'auto', mode: 'left', backgroundType: 'color', padding: 2, contentPaddingY: 2, contentMaxWidth: '100%',
          header: 'Codex .me', headerVariant: 'h5', subheader: 'Hackathon project', subheaderVariant: 'overline',
          typography: 'Space demo · Oli, Tiko & Lua', typographyVariant: 'body2',
          options: [
            h(Button, { ...button, key: 'demo', variant: 'outlined', href: '/overlay/?dev=0' }, 'Open demo'),
            h(Button, { ...button, key: 'obs', variant: 'outlined', href: '/overlay/?transparent=1&dev=0' }, 'Open OBS source'),
            h(Typography, { key: 'hackathon', component: 'a', href: 'https://twitchcon-codex.devpost.com/', target: '_blank', rel: 'noopener noreferrer', sx: { ...mono, alignSelf: 'center', fontSize: 12, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'text.primary', textDecoration: 'underline' } } }, 'Codex x TwitchCon Hackathon 2026')
          ],
          sx: { border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper', mb: 2 }
        }),
        h(Card, { variant: 'outlined', sx: { bgcolor: 'background.paper' } }, h(CardContent, { sx: { p: 2, '&:last-child': { pb: 2 } } },
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
