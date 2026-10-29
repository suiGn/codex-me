import { FaceTracking } from '/ui/face-tracking.js';
const R = window.React, h = R.createElement, G = window.GUI;
export function FaceControls({ kernels, channel }) {
  const owner = kernels.find(kernel => kernel.owner === channel);
  const [permission, setPermission] = R.useState(null);
  R.useEffect(() => {
    setPermission(null);
    if (!owner) return;
    const abort = new AbortController();
    fetch(`/api/kernels/${encodeURIComponent(owner.id)}/permissions`, { signal: abort.signal, cache: 'no-store' })
      .then(r => { if (!r.ok) throw Error(); return r.json(); })
      .then(value => { if (!abort.signal.aborted) setPermission({ id: owner.id, ...value }); })
      .catch(() => { if (!abort.signal.aborted) setPermission({ id: owner.id, own: false }); });
    return () => abort.abort();
  }, [owner?.id]);
  const allowed = permission?.id === owner?.id && permission?.own && !!permission?.csrf;
  return h(G.Atoms.Box, { sx: { px: 1, pb: 2 } },
    h(FaceTracking, { csrf: allowed ? permission.csrf : null, authed: !!allowed, owner: channel || 'channel owner' }),
    !allowed ? h(G.Atoms.Typography, { role: 'status', sx: { fontSize: 12, px: 2, pt: 1 } }, 'Connect the Twitch channel owner to enable face tracking.') : null);
}
