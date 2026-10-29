import { useFaceLandmarker } from './vendor/face/useFaceLandmarker.js';
import { useFaceOverlay } from './vendor/face/useFaceOverlay.js';
const R = window.React, h = R.createElement, G = window.GUI;
const { Box, Button, Typography } = G.Atoms;
export function FaceTracking({ csrf, authed, owner }) {
  const [enabled, setEnabled] = R.useState(false), [stream, setStream] = R.useState(null);
  const [error, setError] = R.useState(''), [relayError, setRelayError] = R.useState(''), [hasFace, setHasFace] = R.useState(false);
  const video = R.useRef(null), canvas = R.useRef(null), busy = R.useRef(null), published = R.useRef(false);
  const lastAnchor = R.useRef(0);
  const epoch = R.useRef(0), activeStream = R.useRef(null);
  const { faceLandmarker, faceLandmarkerLoading, faceLandmarkerError } = useFaceLandmarker({ enabled });
  const send = R.useCallback(async anchor => {
    // Landmarks can leave the camera frame; never submit invalid positions.
    const v = video.current;
    if (anchor && (!v?.videoWidth || !v?.videoHeight || !Number.isFinite(anchor.x) || !Number.isFinite(anchor.y) || anchor.x < 0 || anchor.x > 1 || anchor.y < 0 || anchor.y > 1)) return;
    lastAnchor.current = performance.now();
    if (!anchor && !published.current) return;
    if (busy.current && anchor) return;
    if (!anchor) await busy.current;
    published.current = !!anchor;
    let finish; busy.current = new Promise(resolve => { finish = resolve; });
    try {
      const value = anchor ? { x: anchor.x, y: anchor.y, aspect: v.videoWidth / v.videoHeight } : { x: null, y: null };
      const response = await fetch('/api/face', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }, body: JSON.stringify(value), signal: AbortSignal.timeout(2500), keepalive: !anchor });
      if (response.ok) setRelayError('');
      else if (response.status !== 429) setRelayError(response.status === 403 ? 'Tracking session expired. Reload stream setup.' : response.status === 401 ? 'Reconnect Twitch to resume tracking.' : 'Camera position disconnected. Retrying…');
    } catch { setRelayError('Local server unavailable. Retrying…'); } finally { busy.current = null; finish(); }
  }, [csrf]);
  const getVideoEl = R.useCallback(() => video.current || undefined, []);
  useFaceOverlay({ enabled: !!stream && !!faceLandmarker && !faceLandmarkerError, canvasRef: canvas, getVideoEl, faceLandmarker,
    faceLandmarkerLoading, faceLandmarkerError, variant: 'modal', mirrorPreview: false, detectThrottleMs: 150,
    noFaceMissesToClear: 4, noFaceGraceMs: 600, minFaceHoldMs: 0,
    showMeshConnections: true, meshStep: 4, onHasFaceChange: setHasFace, onHudAnchor: send });
  // Keep using GUI's model. A low-rate track snapshot recovers when browser
  // rAF/video playback pauses; no new camera capture and no images leave this page.
  R.useEffect(() => {
    if (!enabled || !stream || !faceLandmarker || faceLandmarkerError) return;
    const track = stream.getVideoTracks()[0];
    let capture = null;
    try { if (typeof ImageCapture === 'function' && track) capture = new ImageCapture(track); } catch { /* Use the video element where track snapshots are unsupported. */ }
    let detecting = false, disposed = false;
    const tick = async () => {
      if (detecting || performance.now() - lastAnchor.current < 750 || activeStream.current !== stream || track?.readyState !== 'live') return;
      detecting = true; let frame;
      try {
        const element = video.current;
        if (!element) return;
        if (element.srcObject !== stream) element.srcObject = stream;
        if (element.paused) void element.play().catch(() => {});
        if (capture) frame = await capture.grabFrame();
        else if (element.paused || element.readyState < 2) return;
        if (disposed || activeStream.current !== stream) return;
        const result = faceLandmarker.detectForVideo(frame || element, performance.now());
        const point = result?.faceLandmarks?.[0]?.[10];
        setHasFace(!!point);
        void send(point ? { x: point.x, y: point.y } : null);
      } catch { if (!disposed) setRelayError('Camera tracking paused. Return to stream setup to resume.'); }
      finally { frame?.close(); detecting = false; }
    };
    const timer = setInterval(tick, 1000);
    return () => { disposed = true; clearInterval(timer); };
  }, [enabled, stream, faceLandmarker, faceLandmarkerError, send]);
  const stop = R.useCallback(() => {
    epoch.current++; activeStream.current?.getTracks().forEach(track => track.stop()); activeStream.current = null;
    setStream(null); setEnabled(false); setHasFace(false); setRelayError(''); void send(null);
  }, [send]);
  const start = async () => {
    const attempt = ++epoch.current;
    setError(''); setRelayError(''); setEnabled(true);
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 360 }, frameRate: { ideal: 15, max: 15 }, facingMode: 'user' }, audio: false });
      if (attempt !== epoch.current) { media.getTracks().forEach(track => track.stop()); return; }
      activeStream.current = media; setStream(media);
    } catch { if (attempt === epoch.current) { setEnabled(false); setError('Allow camera access in this browser, then try again.'); } }
  };
  R.useEffect(() => { if (video.current) { video.current.srcObject = stream; if (stream) void video.current.play().catch(() => {}); } }, [stream]);
  R.useEffect(() => { if (!authed && enabled) stop(); }, [authed, enabled, stop]);
  R.useEffect(() => {
    const close = () => { epoch.current++; activeStream.current?.getTracks().forEach(t => t.stop()); void send(null); };
    window.addEventListener('pagehide', close);
    return () => { window.removeEventListener('pagehide', close); close(); };
  }, [send]);
  return h(Box, { sx: { border: 1, borderColor: 'divider', borderRadius: 2, p: 2, mt: 2 } },
    h(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 } },
      h(Typography, { sx: { fontFamily: 'monospace', fontSize: 14, flex: 1 } }, `Camera · @${owner}'s .me`),
      h(Button, { size: 'small', disabled: !authed, onClick: enabled ? stop : start }, enabled ? 'Stop tracking' : 'Start face tracking')),
    h(Typography, { role: 'status', sx: { fontFamily: 'monospace', fontSize: 12, color: error || relayError || faceLandmarkerError ? 'error.main' : 'text.secondary', mt: 1 } },
      error || relayError || (faceLandmarkerError ? 'Could not load the .GUI face tracker. Check CDN access.' : !enabled ? 'Optional · .GUI face tracking. Camera stays on this computer; only its position goes to the overlay. This does not broadcast video.' : !stream ? 'Waiting for camera access… Allow the browser camera prompt.' : faceLandmarkerLoading ? 'Loading .GUI face tracker…' : hasFace ? 'Face found · .me companion follows you' : 'Looking for a face…')),
    enabled ? h(Box, { sx: { position: 'relative', width: '100%', maxWidth: 640, aspectRatio: '16 / 9', bgcolor: '#000', mt: 1, overflow: 'hidden' } },
      h('video', { ref: video, autoPlay: true, playsInline: true, muted: true, 'aria-label': 'Local tracking camera', style: { width: '100%', height: '100%', objectFit: 'contain' } }),
      h('canvas', { ref: canvas, 'aria-label': 'GUI face landmarks', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' } })) : null,
    enabled ? h(Typography, { sx: { fontFamily: 'monospace', fontSize: 11, color: 'text.secondary', mt: 1 } }, 'Local preview · not broadcasting. Keep this page open for tracking. To show your camera on Twitch, add the same camera in OBS and start streaming there. Use Fit to Screen without cropping or mirroring.') : null);
}
