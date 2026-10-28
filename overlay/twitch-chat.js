// Official Twitch chat embed. Twitch handles viewer login and message submission.
const R = window.React, h = R.createElement;
const { Box, Typography, Button } = window.GUI.Atoms;
export function TwitchChat() {
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
  return h(Box, { sx: { height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' } },
    h(Box, { sx: { px: 1.5, py: 1, borderBottom: 1, borderColor: 'divider' } },
      h(Button, { component: 'a', href: `https://www.twitch.tv/popout/${channel}/chat?popout=`, target: '_blank', rel: 'noopener noreferrer', size: 'small', sx: { textTransform: 'none', fontFamily: 'monospace' } }, `@${channel} · Open chat window`),
      h(Typography, { sx: { fontFamily: 'monospace', fontSize: 11, color: 'text.secondary', mt: 0.5 } }, 'Type !me to join, then !me me.spider.registered(true). Use your viewer account, such as jabellae. If sign-in is blocked here, open the chat window.')),
    h('iframe', { title: `${channel} Twitch chat`, src: src.href, style: { display: 'block', width: '100%', flex: 1, minHeight: 0, border: 0 } }));
}
