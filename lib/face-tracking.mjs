// Transient camera position only. Never accepts images, landmarks, templates or identities.
export function createFaceTracking({ broadcast, now = Date.now }) {
  let current = null, last = 0;
  const snapshot = () => current && now() - current.at < 2000 ? current : null;
  return {
    snapshot,
    update(value, owner) {
      if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(k => !['x', 'y', 'aspect'].includes(k))) return 400;
      const empty = value.x === null && value.y === null;
      if (!empty && (!Number.isFinite(value.x) || !Number.isFinite(value.y) || value.x < 0 || value.x > 1 || value.y < 0 || value.y > 1 || !Number.isFinite(value.aspect) || value.aspect < 0.5 || value.aspect > 3)) return 400;
      if (!empty && now() - last < 90) return 429;
      last = now(); current = empty ? null : { x: value.x, y: value.y, aspect: value.aspect, owner, at: now() };
      broadcast({ type: 'face', face: snapshot() }); return 204;
    }
  };
}
