// Official Twitch video player. Web-only: never load it into the OBS source.
const h = window.React.createElement, G = window.GUI;
export function TwitchVideo({ channel }) {
  if (!/^[a-z0-9_]{1,25}$/i.test(channel || '')) return h(G.Atoms.Box, { role: 'status', sx: { display: 'grid', placeItems: 'center', minHeight: 300, bgcolor: '#000', color: '#fff' } }, 'Loading Twitch video…');
  const src = new URL('https://player.twitch.tv/');
  src.searchParams.set('channel', channel);
  src.searchParams.set('parent', location.hostname);
  src.searchParams.set('muted', 'true');
  src.searchParams.set('autoplay', 'true');
  return h(G.Atoms.Box, { 'data-twitch-video': channel, component: 'section', 'aria-label': `Live video from ${channel}`, sx: { minWidth: 400, minHeight: 300, position: 'relative', bgcolor: '#000' } },
    h('iframe', { title: `${channel} Twitch live video`, src: src.href, allow: 'autoplay; fullscreen; picture-in-picture', allowFullScreen: true,
      style: { display: 'block', width: '100%', height: '100%', border: 0, minWidth: 400, minHeight: 300 } }));
}
