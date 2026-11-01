// Shared local drawing adapter for GUI face preview and OBS. Original contour
// indices/style come from ui/vendor/face/useFaceOverlay.ts (same license).
const MESH_CONNECTIONS = [
    // face oval
    [10, 338],
    [338, 297],
    [297, 332],
    [332, 284],
    [284, 251],
    [251, 389],
    [389, 356],
    [356, 454],
    [454, 323],
    [323, 361],
    [361, 288],
    [288, 397],
    [397, 365],
    [365, 379],
    [379, 378],
    [378, 400],
    [400, 377],
    [377, 152],
    [152, 148],
    [148, 176],
    [176, 149],
    [149, 150],
    [150, 136],
    [136, 172],
    [172, 58],
    [58, 132],
    [132, 93],
    [93, 234],
    [234, 127],
    [127, 162],
    [162, 21],
    [21, 54],
    [54, 103],
    [103, 67],
    [67, 109],
    [109, 10],
    // lips outer (approx)
    [61, 146],
    [146, 91],
    [91, 181],
    [181, 84],
    [84, 17],
    [17, 314],
    [314, 405],
    [405, 321],
    [321, 375],
    [375, 291],
    [291, 61],
    // nose ridge-ish
    [1, 2],
    [2, 98],
    [1, 5],
    [5, 4],
];

const fallback = '#74caff';
function themeColors(element) {
  const css = getComputedStyle(element);
  const primary = css.getPropertyValue('--gui-primary').trim() || css.getPropertyValue('--color-primary').trim() || fallback;
  return [primary, css.getPropertyValue('--gui-secondary').trim() || primary];
}
export function faceMeshColors(element) {
  if (!element) return [fallback, fallback];
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d');
  return themeColors(element).map(color => {
    ctx.clearRect(0,0,1,1); ctx.fillStyle = color; ctx.fillRect(0,0,1,1);
    return '#' + [...ctx.getImageData(0,0,1,1).data].slice(0,3).map(v=>v.toString(16).padStart(2,'0')).join('');
  });
}
export function drawFaceMesh(canvas, { points, aspect, mirror = false, fit = 'contain', meshStep = 4, connections, colors } = {}) {
  const ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h); if (!points?.length || !aspect) return;
  const width = fit === 'cover' ? Math.max(w,h*aspect) : Math.min(w,h*aspect), height = width/aspect;
  const point = p => { const x = Array.isArray(p) ? p[0] : p.x, y = Array.isArray(p) ? p[1] : p.y; return [(w-width)/2 + (mirror ? 1-x : x)*width,(h-height)/2+y*height]; };
  const [primary, secondary] = colors || themeColors(canvas), scale = w/320;
  const gradient = ctx.createLinearGradient(0,0,w,0); gradient.addColorStop(0,primary); gradient.addColorStop(1,secondary);
  ctx.save(); ctx.strokeStyle = gradient;
  const real = points.length > 200;
  if (real && connections !== false) {
    ctx.globalAlpha=.35; ctx.lineWidth=1.25*scale; ctx.beginPath();
    for (const [a,b] of MESH_CONNECTIONS) if (points[a] && points[b]) { ctx.moveTo(...point(points[a])); ctx.lineTo(...point(points[b])); }
    ctx.stroke();
  }
  ctx.globalAlpha=.95; ctx.lineWidth=1.75*scale; ctx.shadowBlur=10*scale; ctx.shadowColor=primary;
  const radius=(real?2.25:4)*scale, step=real?Math.max(1,meshStep):1;
  ctx.beginPath();
  for(let i=0;i<points.length;i+=step){const [x,y]=point(points[i]);ctx.moveTo(x+radius,y);ctx.arc(x,y,radius,0,Math.PI*2);}
  ctx.stroke(); ctx.restore();
}
