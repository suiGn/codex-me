// Official Twitch chat embed. Twitch handles viewer login and message submission.
const R = window.React, h = R.createElement;
const { Box, Typography, Button, Avatar, Tooltip } = window.GUI.Atoms;
// Same official wordmark assets and mode selection as the landing page.
export function TwitchWordmark({ width = 70 }) {
  const { mode } = window.GUI.useThemeContext();
  return h(Box, { component: 'img', src: mode === 'light' ? '/ui/assets/twitch-wordmark-black.svg' : '/ui/assets/twitch-wordmark-white.svg', alt: 'Twitch', sx: { width, height: 'auto', display: 'block', flexShrink: 0 } });
}
export function TwitchChat({ kernels = [] }) {
  const { mode } = window.GUI.useThemeContext();
  const [profile, setProfile] = R.useState(null);
  const [channel, setChannel] = R.useState(null), [error, setError] = R.useState(false);
  R.useEffect(() => {
    const abort = new AbortController();
    fetch('/api/status', { signal: abort.signal, cache: 'no-store' })
      .then(response => { if (!response.ok) throw Error(); return response.json(); })
      .then(status => { if (!/^[a-z0-9_]{1,25}$/i.test(status.channel || '')) throw Error(); setChannel(status.channel.toLowerCase()); if (status.profile?.login?.toLowerCase() === status.channel.toLowerCase()) setProfile(status.profile); })
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
  const kernel = kernels.find(item => item.owner === channel);
  const fields = Object.fromEntries((kernel?.graph?.nodes || []).map(node => [node.path, node.value]));
  const photo = fields['twitch.profile.profileImageUrl'] || profile?.profile_image_url;
  const name = fields['twitch.profile.displayName'] || profile?.display_name || channel;
  return h(Box, { sx: { height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', color: 'text.primary' } },
    h(Box, { 'data-chat-profile': channel, 'aria-label': 'Channel profile', sx: { mx: 1, mt: 1, px: 1, py: 0.75, display: 'flex', alignItems: 'center', gap: 1, border: 1, borderColor: 'divider', borderRadius: 1.5 } },
      h(Avatar, { src: photo || undefined, alt: `${channel}'s Twitch profile`, imgProps: { referrerPolicy: 'no-referrer' }, sx: { width: 28, height: 28, fontSize: 12 } }, channel.slice(0,1).toUpperCase()),
      h(Typography, { component: 'a', href: `https://www.twitch.tv/${channel}`, target: '_blank', rel: 'noopener noreferrer', title: name, sx: { flex: 1, minWidth: 0, fontFamily: 'monospace', fontSize: 12, color: 'text.primary', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', '&:hover': { textDecoration: 'underline' } } }, `@${channel}`),
      h(Tooltip, { title: 'Open in Twitch', describeChild: true, arrow: true },
        h(Button, { component: 'a', href: popout.href, target: '_blank', rel: 'noopener noreferrer', size: 'small', 'aria-label': 'Open in Twitch', sx: { minWidth: 28, width: 28, height: 28, p: 0 } },
          h(Box, { component: 'img', src: '/ui/assets/twitch-glitch-purple.svg', alt: '', 'aria-hidden': true, sx: { width: 18, height: 21, display: 'block' } })))),
    h(Box, { sx: { flex: 1, minHeight: 0, p: 1, display: 'flex', position: 'relative' } }, h('iframe', { title: `${channel} Twitch chat`, src: src.href, style: { display: 'block', width: '100%', flex: 1, minHeight: 0, border: 0, colorScheme: mode } })));
}
