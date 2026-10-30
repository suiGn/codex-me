// Drawing style/contours from the vendored GUI useFaceOverlay (same license).
// No model or camera here. Draw only on a new relay frame or theme change.
import { useFace } from './face-state.js';
const h = React.createElement;
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
export function FacePoints() {
  const face = useFace(), canvas = React.useRef(null), theme = window.GUI.useThemeContext();
  React.useLayoutEffect(() => {
    const el = canvas.current; if (!el) return;
    const ctx = el.getContext('2d'); ctx.clearRect(0, 0, 1920, 1080);
    if (!face?.points?.length) return;
    const width = Math.min(1920, 1080 * face.aspect), height = Math.min(1080, 1920 / face.aspect);
    const map = p => [(1920 - width) / 2 + p[0] * width, (1080 - height) / 2 + p[1] * height];
    const styles = getComputedStyle(el);
    const primary = styles.getPropertyValue('--gui-primary').trim() || styles.getPropertyValue('--color-primary').trim() || 'rgba(116, 202, 255, 1)';
    const secondary = styles.getPropertyValue('--gui-secondary').trim() || primary;
    const gradient = ctx.createLinearGradient(0, 0, 1920, 0); gradient.addColorStop(0, primary); gradient.addColorStop(1, secondary);
    ctx.strokeStyle = gradient; ctx.globalAlpha = .35; ctx.lineWidth = 1.25;
    ctx.beginPath();
    for (const [a,b] of MESH_CONNECTIONS) if (face.points[a] && face.points[b]) { ctx.moveTo(...map(face.points[a])); ctx.lineTo(...map(face.points[b])); }
    ctx.stroke(); ctx.globalAlpha = .95; ctx.lineWidth = 1.75; ctx.shadowBlur = 10; ctx.shadowColor = primary;
    ctx.beginPath();
    for (let i = 0; i < face.points.length; i += 4) { const [x,y] = map(face.points[i]); ctx.moveTo(x + 2.25, y); ctx.arc(x, y, 2.25, 0, Math.PI * 2); }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [face, theme.themeId, theme.mode]);
  if (!face?.points?.length) return null;
  return h('foreignObject', { x: 0, y: 0, width: 1920, height: 1080, pointerEvents: 'none', 'aria-hidden': true }, h('canvas', { ref: canvas, width: 1920, height: 1080, 'data-face-points': true, style: { width: '100%', height: '100%' } }));
}
