// Transient camera coordinates and optional bounded display points; no images, templates or identities.
export function createFaceTracking({ broadcast, now = Date.now }) {
  let current = null, last = 0;
  const snapshot = () => current && now() - current.at < 2000 ? current : null;
  return {
    snapshot,
    update(value, owner) {
      if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(k => !['x', 'y', 'aspect', 'points', 'colors'].includes(k))) return 400;
      const empty = value.x === null && value.y === null;
      if (!empty && (!Number.isFinite(value.x) || !Number.isFinite(value.y) || value.x < 0 || value.x > 1 || value.y < 0 || value.y > 1 || !Number.isFinite(value.aspect) || value.aspect < 0.5 || value.aspect > 3)) return 400;
      if (value.points !== undefined && (!Array.isArray(value.points) || value.points.length > 478 || value.points.some(p => !Array.isArray(p) || p.length !== 2 || p.some(n => !Number.isFinite(n) || n < 0 || n > 1)))) return 400;
      if (value.colors !== undefined && (!value.points?.length || !Array.isArray(value.colors) || value.colors.length !== 2 || value.colors.some(c => typeof c !== 'string' || !/^#[0-9a-f]{6}$/i.test(c)))) return 400;
      if (empty && value.points !== undefined) return 400;
      if (!empty && now() - last < 90) return 429;
      last = now(); current = empty ? null : { x: value.x, y: value.y, aspect: value.aspect, owner, at: now(), ...(value.points?.length ? { points: value.points.map(p => [...p]), ...(value.colors ? { colors: [...value.colors] } : {}) } : {}) };
      broadcast({ type: 'face', face: snapshot() }); return 204;
    }
  };
}
