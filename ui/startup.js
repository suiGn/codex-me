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
  function AccountPanel({ status }) {
    const user = status.profile;
    const login = user?.login || status.login;
    const name = user?.display_name || login;
    const [photoFailed, setPhotoFailed] = React.useState(false);
    React.useEffect(() => setPhotoFailed(false), [user?.profile_image_url]);
    if (!status.authed) return h(Panel, { title: 'Twitch account', id: 'account-status', value: 'Not connected', description: 'Authorize the account that will send chat replies.' });
    return h(Card, { variant: 'outlined', sx: { bgcolor: 'background.paper', height: '100%' } },
      h(CardContent, { sx: { p: 3 } },
        h(Typography, { sx: label }, 'Twitch account'),
        h(Box, { sx: { display: 'flex', gap: 2, alignItems: 'center', mt: 2, mb: 2 } },
          h(Box, { sx: { width: 64, height: 64, flexShrink: 0, borderRadius: '50%', overflow: 'hidden', bgcolor: '#9146ff', display: 'grid', placeItems: 'center', ...mono, fontSize: 24, color: '#fff' } },
            user?.profile_image_url && !photoFailed
              ? h(Box, { component: 'img', src: user.profile_image_url, alt: `${login}'s Twitch profile`, referrerPolicy: 'no-referrer', onError: () => setPhotoFailed(true), sx: { display: 'block', width: '100%', height: '100%', objectFit: 'cover' } })
              : String(login || '?').slice(0, 1).toUpperCase()),
          h(Box, { sx: { minWidth: 0 } },
            h(Typography, { id: 'account-status', sx: { ...mono, fontSize: 21, fontWeight: 600, overflowWrap: 'anywhere' } }, name),
            h(Typography, { component: 'a', href: `https://www.twitch.tv/${encodeURIComponent(login)}`, target: '_blank', rel: 'noopener noreferrer', sx: { ...mono, color: '#bf94ff', fontSize: 13, textDecoration: 'none', overflowWrap: 'anywhere' } }, `@${login}`))),
        user?.description ? h(Typography, { sx: { ...mono, fontSize: 12, color: 'text.secondary', mb: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere' } }, user.description) : null,
        h(Typography, { sx: { ...mono, fontSize: 12, color: 'text.secondary' } }, `Authorized to read and reply in @${status.channel}.`)));
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
          h(Box, { component: 'img', src: '/ui/assets/twitch-wordmark-white.svg', alt: 'Twitch', sx: { width: 88, height: 'auto', display: 'block' } }),
          h(Typography, { sx: label }, 'this.me 4.2.1 · this.gui 4.2.1'))),
      h(Box, { component: 'main', 'data-gui-node-id': 'GUI.window.layout.content', sx: { maxWidth: 1100, mx: 'auto', px: { xs: 3, md: 5 }, py: { xs: 4, md: 7 } } },
        h(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 } },
          h(Box, { component: 'img', src: '/ui/assets/twitch-glitch-purple.svg', alt: '', sx: { width: 24, height: 28, objectFit: 'contain' } }),
          h(Typography, { sx: { ...label, color: '#bf94ff' } }, 'Twitch chat · Stream setup')),
        h(Typography, { component: 'h1', sx: { ...mono, fontSize: { xs: 28, md: 40 }, fontWeight: 600, mt: 1, mb: 1 } }, 'Your chat. Three robots.'),
        h(Typography, { sx: { ...mono, color: 'text.secondary', fontSize: 15, maxWidth: 750, mb: 4 } }, 'Connect Twitch, open the Space overlay, and let viewers control Oli, Tiko and Lua. Every robot runs its own kernel and shows the reason behind its behavior.'),
        h(Box, { sx: { display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 } },
          h(AccountPanel, { status }),
          h(Panel, { title: 'EventSub', id: 'eventsub-status', value: offline ? 'Server unavailable' : status.eventsub === 'connected' ? 'Connected' : 'Waiting', description: offline ? 'Check the local server and reload.' : status.detail }),
          h(Panel, { title: 'Overlay sockets', id: 'overlay-status', value: String(status.overlays), description: 'The first registered overlay sends replies. Additional overlays are previews.' })),
        h(Box, { sx: { display: 'flex', gap: 2, flexWrap: 'wrap', mb: 5 } },
          !status.authed ? h(Button, { ...button, variant: 'contained', href: '/auth/login', sx: { ...button.sx, bgcolor: '#9146ff', color: '#fff', '&:hover': { bgcolor: '#772ce8' } } }, 'Connect with Twitch') : null,
          h(Button, { ...button, variant: 'outlined', href: '/overlay/?dev=0' }, 'Open overlay'),
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
          h(Typography, { sx: { ...mono, fontSize: 12, color: 'text.secondary', mt: 1 } }, 'Use Open overlay for browser viewing. The OBS source has a transparent background for compositing.'))));
  }
  const type = { type: 'StreamSetup', resolve: () => h(Startup) };
  const Theme = ({ children }) => h(G.Theme, { initialThemeId: 'neurons.me', initialMode: 'dark' }, children);
  G.mount({ type: 'StreamSetup', props: {} }, root, { gui: { ...G, Theme, registry: { ...G.registry, StreamSetup: type } } });
}
