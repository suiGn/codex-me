// Official Twitch chat embed. Twitch handles viewer login and message submission.
const R = window.React, h = R.createElement;
const { Box, Typography, Button } = window.GUI.Atoms;
export function TwitchChat() {
  const { mode } = window.GUI.useThemeContext();
  const [channel, setChannel] = R.useState(null), [error, setError] = R.useState(false);
  R.useEffect(() => {
    const abort = new AbortController();
    fetch('/api/status', { signal: abort.signal, cache: 'no-store' })
      .then(response => { if (!response.ok) throw Error(); return response.json(); })
      .then(status => { if (!/^[a-z0-9_]{1,25}$/i.test(status.channel || '')) throw Error(); setChannel(status.channel.toLowerCase()); })
      .catch(() => { if (!abort.signal.aborted) setError(true); });
    return () => abort.abort();
  }, []);
  if (!channel) return h(Typography, { role: 'status', sx: { p: 2, fontSize: 12 } }, error ? 'Could not load the Twitch channel. Reload the demo.' : 'Loading Twitch chat…');
  const src = new URL(`https://www.twitch.tv/embed/${channel}/chat`);
  src.searchParams.set('parent', location.hostname);
  // Twitch owns the iframe styles; darkpopout requests its native dark appearance.
  if (mode === 'dark') src.searchParams.set('darkpopout', '1');
  const popout = new URL(`https://www.twitch.tv/popout/${channel}/chat`);
  popout.searchParams.set('popout', '');
  if (mode === 'dark') popout.searchParams.set('darkpopout', '1');
  return h(Box, { sx: { height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', color: 'text.primary' } },
    h(Box, { sx: { px: 1.5, py: 1, borderBottom: 1, borderColor: 'divider' } },
      h(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 } },
        h(Box, { component: 'img', src: '/ui/assets/twitch-glitch-purple.svg', alt: 'Twitch', sx: { width: 22, height: 26, objectFit: 'contain', flexShrink: 0 } }),
        h(Typography, { sx: { fontFamily: 'monospace', fontSize: 13, fontWeight: 600 } }, 'Twitch chat'),
        h(Typography, { component: 'a', href: `https://www.twitch.tv/${channel}`, target: '_blank', rel: 'noopener noreferrer', sx: { fontFamily: 'monospace', fontSize: 12, color: 'text.secondary', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } } }, `@${channel}`)),
      h(Button, { component: 'a', href: popout.href, target: '_blank', rel: 'noopener noreferrer', size: 'small', sx: { textTransform: 'none', fontFamily: 'monospace' } }, 'Open chat window ↗'),
      h(Typography, { sx: { fontFamily: 'monospace', fontSize: 11, color: 'text.secondary', mt: 0.5 } }, 'Type !me to join, then !me me.spider.registered(true). Use your viewer account, such as jabellae. If sign-in is blocked here, open the chat window.')),
    h('iframe', { title: `${channel} Twitch chat`, src: src.href, style: { display: 'block', width: '100%', flex: 1, minHeight: 0, border: 0, colorScheme: mode } }));
}
