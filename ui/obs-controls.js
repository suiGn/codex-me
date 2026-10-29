// Same GUI controls in the demo sidebar and stream setup. No automatic broadcast actions.
const R = window.React, h = R.createElement, G = window.GUI;
const { Box, Typography, Button } = G.Atoms;
export function ObsControls() {
  const [state, setState] = R.useState(null), [error, setError] = R.useState(''), [statusError, setStatusError] = R.useState(''), [busy, setBusy] = R.useState(false);
  const [port, setPort] = R.useState('4455'), [password, setPassword] = R.useState(''), [preview, setPreview] = R.useState(null);
  const csrf = R.useRef(null), alive = R.useRef(true), actionBusy = R.useRef(false);
  const refresh = async signal => {
    const response = await fetch('/api/obs', { signal, cache: 'no-store' });
    const data = await response.json();
    if (alive.current) {
      if (!csrf.current && data.port) setPort(String(data.port));
      if (data.csrf) csrf.current = data.csrf;
      setState(response.ok ? data : null);
      if (!response.ok) throw Error(data.error || 'Could not read OBS status.');
      if (!data.connected) setPreview(null);
    }
  };
  R.useEffect(() => {
    alive.current = true; const controller = new AbortController(); let timer;
    const poll = async () => {
      try { if (!actionBusy.current && !document.hidden) { await refresh(controller.signal); if (alive.current) setStatusError(''); } }
      catch (e) { if (alive.current && !controller.signal.aborted) setStatusError(e.message || 'Local server unavailable.'); }
      if (alive.current) timer = setTimeout(poll, 2000);
    };
    poll(); return () => { alive.current = false; controller.abort(); clearTimeout(timer); };
  }, []);
  const act = async action => {
    if (actionBusy.current || !csrf.current) return;
    actionBusy.current = true; setBusy(true); setError('');
    try {
      const response = await fetch(`/api/obs/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf.current }, body: JSON.stringify(action === 'connect' ? { port: Number(port), ...(password ? { password } : {}) } : {}) });
      const data = await response.json(); if (!response.ok) throw Error(data.error || 'OBS request failed.');
      if (alive.current) { if (action === 'preview') setPreview(data); else { setState(data); setPreview(null); } if (action === 'connect') setPassword(''); }
    } catch (e) { if (alive.current) setError(e.message || 'Local server unavailable. Check OBS before retrying.'); }
    finally { actionBusy.current = false; if (alive.current) setBusy(false); }
  };
  const connected = state?.connected === true, streaming = state?.streaming === true;
  const button = { size: 'small', disabled: busy, sx: { textTransform: 'none' } };
  return h(Box, { 'data-obs-controls': true, sx: { p: 2, display: 'grid', gap: 1.5, minWidth: 0 } },
    h(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 } },
      h(Box, { 'aria-hidden': true, sx: { width: 7, height: 7, borderRadius: '50%', bgcolor: connected ? streaming ? 'error.main' : 'success.main' : 'text.disabled' } }),
      h(Typography, { component: 'h2', sx: { fontSize: 15, fontWeight: 600, flex: 1 } }, 'OBS Studio'),
      h(Typography, { role: 'status', 'data-obs-status': true, sx: { fontSize: 12, color: 'text.secondary' } }, !state ? 'Unavailable' : !connected ? 'Disconnected' : state.reconnecting ? 'Reconnecting' : streaming ? 'Streaming' : 'Ready')),
    !connected ? h(R.Fragment, null,
      h(Typography, { sx: { fontSize: 12, color: 'text.secondary' } }, 'Keep OBS open. Enable Tools → WebSocket Server Settings in OBS, then connect here.'),
      h(G.TextField, { label: 'Local WebSocket port', size: 'small', type: 'number', value: port, onChange: e => setPort(e.target.value), disabled: busy, inputProps: { min: 1024, max: 65535 } }),
      h(G.TextField, { label: 'OBS WebSocket password', size: 'small', type: 'password', autoComplete: 'off', value: password, onChange: e => setPassword(e.target.value), disabled: busy, helperText: 'Password entered here stays in memory.' }),
      h(Button, { ...button, variant: 'outlined', disabled: busy || !csrf.current || !Number.isInteger(Number(port)) || Number(port) < 1024 || Number(port) > 65535, onClick: () => act('connect') }, busy ? 'Connecting…' : 'Connect OBS')) : h(R.Fragment, null,
      h(Typography, { sx: { fontSize: 12, overflowWrap: 'anywhere' } }, state.scene || 'No program scene'),
      streaming && state.timecode ? h(Typography, { sx: { fontFamily: 'monospace', fontSize: 12 } }, state.timecode) : null,
      state.totalFrames > 0 ? h(Typography, { sx: { fontSize: 12, color: 'text.secondary' } }, `${(100 * state.skippedFrames / state.totalFrames).toFixed(1)}% output frames skipped`) : null,
      h(Box, { sx: { display: 'flex', gap: 1, flexWrap: 'wrap' } },
        h(Button, { ...button, variant: 'contained', color: streaming ? 'error' : 'primary', disabled: busy || typeof state.streaming !== 'boolean' || state.reconnecting, onClick: () => act(streaming ? 'stop' : 'start') }, streaming ? 'Stop streaming' : 'Start streaming'),
        h(Button, { ...button, variant: 'outlined', onClick: () => act('preview') }, preview ? 'Refresh preview' : 'Show preview')),
      h(Button, { ...button, onClick: () => act('disconnect') }, 'Disconnect controls')),
    error || statusError ? h(Typography, { role: 'alert', sx: { fontSize: 12, color: 'error.main' } }, error || statusError) : null,
    preview && connected ? h(Box, null, h(Box, { component: 'img', src: preview.image, alt: `OBS program preview: ${preview.scene}`, sx: { display: 'block', width: '100%', borderRadius: 1 } }), h(Typography, { sx: { fontSize: 11, color: 'text.secondary', mt: 0.5 } }, 'Snapshot · refresh to update')) : null,
    h(Typography, { sx: { fontSize: 11, color: 'text.secondary' } }, 'Controls the output configured in OBS. Preview and connection do not start a stream. Disconnecting controls leaves a running stream on.'));
}
