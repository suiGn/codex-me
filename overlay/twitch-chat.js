// Official Twitch chat embed. Twitch handles viewer login and message submission.
const R = window.React, h = R.createElement;
const { Box, Typography } = window.GUI.Atoms;
// Same official wordmark assets and mode selection as the landing page.
export function TwitchWordmark({ width = 70 }) {
  const { mode } = window.GUI.useThemeContext();
  return h(Box, { component: 'img', src: mode === 'light' ? '/ui/assets/twitch-wordmark-black.svg' : '/ui/assets/twitch-wordmark-white.svg', alt: 'Twitch', sx: { width, height: 'auto', display: 'block', flexShrink: 0 } });
}
export function TwitchChat({ channelInfo, error = false }) {
  const { mode } = window.GUI.useThemeContext();
  const channel = channelInfo?.channel;
  if (!channel) return h(Typography, { role: 'status', sx: { p: 2, fontSize: 12 } }, error ? 'Could not load the Twitch channel. Reload the demo.' : 'Loading Twitch chat…');
  const src = new URL(`https://www.twitch.tv/embed/${channel}/chat`);
  src.searchParams.set('parent', location.hostname);
  // Twitch owns the iframe styles; darkpopout requests its native dark appearance.
  if (mode === 'dark') src.searchParams.set('darkpopout', '1');
  return h(Box, { sx: { height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', color: 'text.primary' } },
    h(Box, { sx: { flex: 1, minHeight: 0, p: 1, display: 'flex', position: 'relative' } }, h('iframe', { title: `${channel} Twitch chat`, src: src.href, style: { display: 'block', width: '100%', flex: 1, minHeight: 0, border: 0, colorScheme: mode } })));
}
