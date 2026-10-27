// Codex .me overlay: chat commands -> the Space demo's robots (one this.me kernel each) -> scene + log with explain() reasons.
// UI: this.gui (window.GUI, UMD) — the page is one spec resolved by GUI.mount, theme neurons.me dark, panels are .GUI Cards.
// Performance: the sim ticks on a fixed clock; the scene is drawn on requestAnimationFrame into persistent SVG nodes
// (attributes only, positions interpolated between ticks); panels re-render only when a tick or a command bumps their store;
// explain() runs once per robot per tick (never per frame); the log keeps 30 entries.
import ME from "./vendor/this.me-4.2.1.es.js";
import { parse, createRateLimiter } from "./commands.js";
import { createSim, tick, apply, snapshot, reason, S } from "./world.js";

const G = window.GUI, h = React.createElement;
const { Box, Typography, Card, CardContent, Divider, TextField, Button } = G.Atoms;
const MONO = '"IBM Plex Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace';
const alpha = (c, a) => `color-mix(in srgb, ${c} ${Math.round(a * 100)}%, transparent)`;

const Q = new URLSearchParams(location.search);
const TRANSPARENT = Q.get("transparent") === "1", DEV = Q.get("dev") !== "0";
if (TRANSPARENT) document.body.classList.add("transparent");
const WS_URL = Q.get("ws") || "ws://localhost:3017/ws";
// clock as in Demos/Robots/Space: the sim steps inside requestAnimationFrame from an accumulator, 10 simulated min/s by
// default (TICK_MS = 100 ms per simulated minute, ?tick=ms), at most 12 steps per frame. ?clock=manual: only codex.advance(n).
const TICK_MS = +(Q.get("tick") || 100), MANUAL = Q.get("clock") === "manual";
const LOG_MAX = 30, LOG_SHOWN = 6;

const sim = createSim(ME);
const limits = { read: createRateLimiter({ gapMs: 1000, burst: 10, windowMs: 30000 }), write: createRateLimiter({ gapMs: 3000, burst: 5, windowMs: 30000 }) };

// ── stores (same shape as the Space demo's): panels subscribe with useSyncExternalStore ──
function createStore(state) { const ls = new Set(); let v = 0; return { state, subscribe: (cb) => (ls.add(cb), () => ls.delete(cb)), version: () => v, set(p) { if (p) Object.assign(state, p); v++; ls.forEach((cb) => cb()); } }; }
const useStore = (s) => { React.useSyncExternalStore(s.subscribe, s.version); return s.state; };
const world = createStore({ snap: snapshot(sim), why: {}, touched: new Set() });   // bumped per tick / command
const logS = createStore({ entries: [] });                                            // bumped per command
const wsS = createStore({ text: "ws: not connected" });
let seq = 0;

// scene state: a snapshot per sim step (cheap reads), drawn every frame between prev and snap
const scene = { snap: world.state.snap, prev: world.state.snap, v: 0 };
function stepped(tween) { const snap = snapshot(sim); scene.prev = tween === "keep" ? scene.prev : tween ? scene.snap : snap; scene.snap = snap; scene.v++; }
// panels: snapshot + explain() for the three robots, at most 4 times a second (the demo's tick store) or right after a command
let lastUi = 0, uiV = -1;
function publish(touched) {
  const snap = scene.snap, why = {};
  for (const r of snap.robots) why[r.id] = reason(sim.w.robots[r.id - 1].k.me, `robots.${r.id}.${r.flag}`);
  lastUi = performance.now(); uiV = scene.v;
  world.set({ snap, why, ...(touched ? { touched } : {}) });
  stats.publishes++;
}

// ── scene: persistent SVG nodes, attributes updated on rAF ──
const NS = "http://www.w3.org/2000/svg";
const mk = (parent, tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
const set = (e, attrs) => { for (const k in attrs) { const v = String(attrs[k]); if (e.getAttribute(k) !== v) e.setAttribute(k, v); } };
const txt = (e, s) => { if (e.textContent !== s) e.textContent = s; };
const n2 = (v) => (typeof v === "number" ? Math.round(v * 10) / 10 : String(v));
const lerp = (a, b, f) => a + (b - a) * f;

function buildScene(svg) {
  const s = world.state.snap, N = {};
  N.t = mk(svg, "text", { x: 16, y: 28, class: "lbl" }); N.sub = mk(svg, "text", { x: 16, y: 48 });
  mk(svg, "circle", { cx: S.SUN.x, cy: S.SUN.y, r: 64, fill: "none", stroke: "var(--faint)" }); mk(svg, "text", { x: 10, y: S.SUN.y - 74 }).textContent = "sun";
  N.rocks = s.rocks.map((rk) => ({ disk: mk(svg, "circle", { r: rk.R, fill: "var(--night)", stroke: "var(--ink)", "stroke-width": 0.8 }), lit: mk(svg, "path", { fill: "var(--day)" }),
    spots: rk.spots.map(() => mk(svg, "circle", { r: 4, stroke: "var(--muted)", "stroke-width": 0.8 })), name: mk(svg, "text", { "text-anchor": "middle" }) }));
  N.flowerStem = mk(svg, "line", { stroke: "var(--muted)" }); N.flowerHead = mk(svg, "circle", { r: 3, fill: "none", stroke: "var(--muted)" });
  N.comet = mk(svg, "circle", { r: 5, fill: "var(--ink)" }); N.cometL = mk(svg, "text", {}); N.cometL.textContent = "comet";
  N.packets = Array.from({ length: 24 }, () => mk(svg, "rect", { width: 6, height: 6, stroke: "var(--ink)", display: "none" }));
  N.robots = s.robots.map(() => {
    const g = mk(svg, "g", { "stroke-width": 0.9, "stroke-linecap": "round", "stroke-linejoin": "round", fill: "none" });
    const legs = Array.from({ length: 8 }, () => mk(g, "polyline", {}));
    mk(g, "ellipse", { cx: 0, cy: -8, rx: 5.2, ry: 4, fill: "var(--bg)" }); mk(g, "circle", { cx: 5.5, cy: -10, r: 2.4, fill: "var(--bg)" });
    mk(g, "line", { x1: 0, y1: -12, x2: 0, y2: -17 }); mk(g, "circle", { cx: 0, cy: -18, r: 1.1, fill: "var(--ink)", stroke: "none" });
    return { g, legs, name: mk(svg, "text", { class: "lbl" }), box: mk(svg, "rect", { width: 56, height: 6, fill: "none", stroke: "var(--ink)" }),
      bar: mk(svg, "rect", { height: 6, fill: "var(--ink)" }), res: mk(svg, "line", { stroke: "var(--muted)" }), info: mk(svg, "text", {}), phase: NaN };
  });
  return N;
}

let drawn = "";
function drawScene(N, f) {
  const s = scene.snap, p = scene.prev, touched = world.state.touched, key = `${scene.v}:${f}:${world.version()}`;
  if (key === drawn) return false;   // nothing new since the last frame: no DOM work
  drawn = key;
  txt(N.t, `t = ${s.t} min`); txt(N.sub, `messages delivered ${s.delivered} · lost ${s.lost}${MANUAL ? " · clock manual" : ` · ${+(1000 / TICK_MS).toFixed(1)} simulated min / s`}`);
  const rocks = s.rocks.map((rk, i) => { const q = p.rocks[i] || rk; return { ...rk, x: lerp(q.x, rk.x, f), y: lerp(q.y, rk.y, f), sun: q.sun + S.wrap(rk.sun - q.sun) * f }; });
  rocks.forEach((rk, i) => { const n = N.rocks[i], a = rk.sun, P = (t) => `${rk.x + rk.R * Math.cos(t)} ${rk.y + rk.R * Math.sin(t)}`;
    set(n.disk, { cx: rk.x, cy: rk.y }); set(n.lit, { d: `M ${P(a - Math.PI / 2)} A ${rk.R} ${rk.R} 0 0 1 ${P(a + Math.PI / 2)} Z` });
    rk.spots.forEach((sp, j) => n.spots[j] && set(n.spots[j], { cx: rk.x + (rk.R - 8) * Math.cos(a + sp.pos), cy: rk.y + (rk.R - 8) * Math.sin(a + sp.pos), fill: sp.left > 0 ? "var(--muted)" : "none" }));
    set(n.name, { x: rk.x, y: rk.y + 5 }); txt(n.name, `${rk.name} · R ${rk.R}`); });
  const byId = Object.fromEntries(rocks.map((r) => [r.id, r]));
  if (s.flower) { const rk = byId[s.flower.rock], a = rk.sun + s.flower.pos, fx = rk.x + rk.R * Math.cos(a), fy = rk.y + rk.R * Math.sin(a);
    set(N.flowerStem, { display: "inline", x1: fx, y1: fy, x2: fx + 10 * Math.cos(a), y2: fy + 10 * Math.sin(a) }); set(N.flowerHead, { display: "inline", cx: fx + 13 * Math.cos(a), cy: fy + 13 * Math.sin(a) }); }
  else { set(N.flowerStem, { display: "none" }); set(N.flowerHead, { display: "none" }); }
  set(N.comet, { display: s.comet.on ? "inline" : "none", cx: s.comet.x, cy: s.comet.y }); set(N.cometL, { display: s.comet.on ? "inline" : "none", x: s.comet.x + 9, y: s.comet.y - 8 });
  N.packets.forEach((e, i) => { const pk = s.packets[i]; if (!pk) return set(e, { display: "none" });
    set(e, { display: "inline", x: pk.x - 3, y: pk.y - 3, fill: pk.kind === "tip" ? "var(--ink)" : "none" }); });
  s.robots.forEach((r, i) => {
    const q = p.robots[i] || r, n = N.robots[i], rk = byId[r.rock], same = q.rock === r.rock;
    const pos = same ? q.pos + S.wrap(r.pos - q.pos) * f : r.pos, a = rk.sun + pos, x = rk.x + rk.R * Math.cos(a), y = rk.y + rk.R * Math.sin(a);
    const walked = same ? lerp(q.walked, r.walked, f) : r.walked, phase = walked / 3, deg = (a * 180) / Math.PI + 90;
    set(n.g, { transform: `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${deg.toFixed(2)}) scale(1.4)`, stroke: r.dead ? "var(--muted)" : "var(--ink)" });
    if (phase !== n.phase) { n.phase = phase; let k = 0;
      for (const side of [-1, 1]) for (let j = 0; j < 4; j++) { const sw = Math.sin(phase + j * 1.6 + (side > 0 ? Math.PI : 0)) * 1.6, base = -4.5 + j * 3 + sw;
        n.legs[k++].setAttribute("points", `${side * 3},${-6 + j * 1.2} ${side * 7},${-9 + base * 0.4} ${side * 10},${base * 0.8}`); } }
    const lx = x + 34 * Math.cos(a), ly = y + 34 * Math.sin(a), left = Math.cos(a) < -0.2, anchor = left ? "end" : "start", bw = 56, bx = left ? lx - bw : lx;
    set(n.name, { x: lx, y: ly - 14, "text-anchor": anchor, "font-weight": touched.has(r.id) ? 700 : 400 }); txt(n.name, r.name);
    set(n.box, { x: bx, y: ly - 8 }); set(n.bar, { x: bx, y: ly - 8, width: (Math.max(0, Math.min(1, r.battery / 100)) * bw).toFixed(1) });
    const rx = bx + (r.reserve / 100) * bw; set(n.res, { x1: rx, x2: rx, y1: ly - 11, y2: ly + 1 });
    set(n.info, { x: lx, y: ly + 12, "text-anchor": anchor }); txt(n.info, `${n2(r.battery)}% · ${r.status}`);
  });
  return true;
}

function sceneVars(t) {
  const dark = t.palette.mode === "dark";
  return { "--ink": t.palette.text.primary, "--muted": t.palette.text.secondary, "--faint": t.palette.text.disabled, "--bg": t.palette.background.default,
    "--day": alpha(t.palette.text.primary, dark ? 0.14 : 0.18), "--night": alpha(t.palette.text.primary, dark ? 0.04 : 0.06) };
}

// ── .GUI page types ──
const label = { fontFamily: MONO, fontSize: 12, color: "text.secondary", letterSpacing: ".04em", textTransform: "uppercase" };
const mono = (extra) => ({ fontFamily: MONO, fontSize: 13, lineHeight: 1.45, ...extra });

function TopBar() {
  const ws = useStore(wsS);
  return h(Box, { sx: { display: "flex", alignItems: "baseline", gap: 3, px: 3, height: "100%" } },
    h(Typography, { sx: mono({ fontSize: 20, fontWeight: 600, color: "text.primary" }) }, "Codex .me"),
    h(Typography, { sx: mono({ color: "text.secondary" }) }, `this.me 4.2.1 · this.gui ${G.version || "4.2.1"} · a kernel per robot · every value is a kernel read`),
    h(Box, { sx: { flex: 1 } }),
    h(Typography, { id: "ws-status", sx: mono({ color: "text.secondary" }) }, ws.text));
}

function Scene() {
  const ref = React.useRef(null);
  React.useEffect(() => { sceneNodes = buildScene(ref.current); return () => { sceneNodes = null; }; }, []);
  return h(Box, { sx: (t) => ({ ...sceneVars(t), height: "100%" }) }, h("svg", { id: "scene", ref, viewBox: "0 0 1000 600", preserveAspectRatio: "xMidYMid meet", "aria-label": "space scene" }));
}

const RobotCard = React.memo(function RobotCard({ r, why, hot }) {
  return h(Card, { variant: "outlined", sx: { bgcolor: "background.paper", borderColor: hot ? "text.primary" : "divider" } },
    h(CardContent, { sx: { p: 1.5, "&:last-child": { pb: 1.5 } } },
      h(Typography, { sx: mono({ color: "text.primary", fontWeight: 600 }) }, `${r.name} `, h("span", { style: { fontWeight: 400, opacity: 0.7 } }, r.role)),
      h(Typography, { sx: mono({ color: "text.secondary" }) }, `${r.status} · battery ${n2(r.battery)}% (reserve ${n2(r.reserve)}) · pos ${n2(r.pos)} · ${r.lit ? "lit" : "dark"}`),
      h(Typography, { sx: mono({ color: "text.primary", mt: 0.5, wordBreak: "break-word" }) }, why)));
}, (a, b) => a.why === b.why && a.hot === b.hot && a.r.status === b.r.status && n2(a.r.battery) === n2(b.r.battery) && n2(a.r.pos) === n2(b.r.pos) && a.r.lit === b.r.lit && a.r.reserve === b.r.reserve);

function Robots() {
  const { snap, why, touched } = useStore(world);
  return h(Box, { sx: { display: "grid", gap: 1.5, p: 2 } }, h(Typography, { sx: label }, "robots · explain()"),
    snap.robots.map((r) => h(RobotCard, { key: r.id, r, why: why[r.id], hot: touched.has(r.id) })));
}
function Rules() {
  const { snap } = useStore(world); const rules = snap.chatRules;
  return h(Box, { sx: { p: 2, pt: 0 } }, h(Typography, { sx: { ...label, mb: 1 } }, "chat rules"),
    rules.length ? rules.map((c, i) => h(Typography, { key: i, sx: mono({ color: "text.primary" }) }, `${c.path}[i].${c.name} = `, h("span", { style: { opacity: 0.7 } }, c.expr)))
      : h(Typography, { sx: mono({ color: "text.secondary" }) }, "none yet · !rule robots[i] name expr"));
}
const LogEntry = React.memo(function LogEntry({ e, first }) {
  const rs = e.reasons || [];
  return h(Card, { variant: "outlined", "data-log-id": e.id, sx: { bgcolor: "background.paper", borderColor: first ? "text.primary" : "divider", opacity: e.err ? 0.75 : 1 } },
    h(CardContent, { sx: { p: 1.5, "&:last-child": { pb: 1.5 } } },
      h(Typography, { sx: mono({ color: "text.secondary" }) }, `${e.user} · t=${e.t} · ${e.text}`),
      e.code ? h(Typography, { sx: mono({ color: "text.primary", wordBreak: "break-word" }) }, e.code) : null,
      rs.slice(0, 2).map((r, i) => h(Typography, { key: i, sx: mono({ color: "text.primary", wordBreak: "break-word" }) }, r)),
      rs.length > 2 ? h(Typography, { sx: mono({ color: "text.secondary" }) }, `+${rs.length - 2} more`) : null,
      h(Typography, { sx: mono({ color: "text.secondary", wordBreak: "break-word" }) }, `reply: ${e.reply}`)));
});
function Log() {
  const { entries } = useStore(logS);
  return h(Box, { id: "log", sx: { display: "grid", gap: 1.5, p: 2, alignContent: "start" } }, h(Typography, { sx: label }, `chat log · newest first · ${entries.length} kept, max ${LOG_MAX}`),
    entries.slice(0, LOG_SHOWN).map((e, k) => h(LogEntry, { key: e.id, e, first: k === 0 })));
}
function DevBox() {
  if (!DEV) return null;
  const onSubmit = (ev) => { ev.preventDefault(); const t = document.getElementById("dev-text");
    handle({ user: document.getElementById("dev-user").value || "dev", text: t.value, isBroadcaster: true, local: true }); t.value = ""; };
  const field = { size: "small", variant: "outlined", autoComplete: "off", inputProps: { spellCheck: false, style: { fontFamily: MONO, fontSize: 13 } } };
  return h(Box, { component: "form", id: "dev", onSubmit, sx: { display: "flex", gap: 1.5, alignItems: "center", px: 3, height: "100%", width: "100%", boxSizing: "border-box" } },
    h(Typography, { sx: label }, "dev"),
    h(TextField, { ...field, id: "dev-user", defaultValue: "dev", sx: { width: 140 } }),
    h(TextField, { ...field, id: "dev-text", placeholder: "!walk oli to -1.2", sx: { flex: 1 } }),
    // a form with two text fields only submits on Enter if it has a submit button
    h(Button, { type: "submit", variant: "outlined", size: "small", sx: { fontFamily: MONO, textTransform: "none" } }, "send"));
}
function Help() { return h(Typography, { sx: mono({ color: "text.secondary", px: 3 }) }, "!me  !explain  !set  !rule  !link  !walk  !battery  !charge  !hello  !tip  !status  !inbox  !reset  !help"); }

const pageType = (type, Comp) => ({ type, resolve: (spec) => { const { key: _k, ...p } = spec.props || {}; return h(Comp, p); } });
const PAGE_TYPES = Object.fromEntries([["CodexTopBar", TopBar], ["CodexScene", Scene], ["CodexRobots", Robots], ["CodexRules", Rules], ["CodexLog", Log], ["CodexDev", DevBox], ["CodexHelp", Help]]
  .map(([t, C]) => [t, pageType(t, C)]));
const N = (type, id, props = {}, children) => ({ type, props: { ...props, "data-gui-node-id": id }, ...(children !== undefined ? { children: [].concat(children) } : {}) });
const bar = (side) => ({ bgcolor: TRANSPARENT ? (t) => alpha(t.palette.background.paper, 0.82) : "background.paper", borderColor: "divider", [`border${side}`]: 1, minHeight: 0, overflow: "hidden" });
function pageSpec() {
  return N("Box", "GUI.window", { sx: { width: 1920, height: 1080, display: "grid", gridTemplateColumns: "400px 1fr 460px", gridTemplateRows: "56px 1fr 56px",
    gridTemplateAreas: '"top top top" "left content right" "bottom bottom bottom"', bgcolor: TRANSPARENT ? "transparent" : "background.default", color: "text.primary", overflow: "hidden" } }, [
    N("Box", "GUI.window.layout.bars.top", { component: "header", sx: { gridArea: "top", ...bar("Bottom") } }, [N("CodexTopBar", "top/brand")]),
    N("Box", "GUI.window.layout.bars.left", { component: "aside", sx: { gridArea: "left", ...bar("Right"), overflowY: "hidden" } }, [N("CodexRobots", "left/robots"), N("CodexRules", "left/rules")]),
    N("Box", "GUI.window.layout.content", { component: "main", sx: { gridArea: "content", minWidth: 0, minHeight: 0, p: 2 } }, [N("CodexScene", "content/scene")]),
    N("Box", "GUI.window.layout.bars.right", { component: "aside", sx: { gridArea: "right", ...bar("Left") } }, [N("CodexLog", "right/log")]),
    N("Box", "GUI.window.layout.bars.bottom", { component: "footer", sx: { gridArea: "bottom", ...bar("Top"), display: "flex", alignItems: "center" } },
      [DEV ? N("CodexDev", "bottom/dev", { sx: { flex: 1 } }) : N("CodexHelp", "bottom/help")]),
  ]);
}
const PageTheme = ({ children }) => h(G.Theme, { initialThemeId: "neurons.me", initialMode: "dark" }, children);
const MOUNT_GUI = { ...G, Theme: PageTheme, registry: { ...G.registry, ...PAGE_TYPES } };

// ── one chat message in, one reply out ──
export function handle(msg) {
  const user = String(msg.user || "anon").slice(0, 40), text = String(msg.text || "").slice(0, 300);
  const p = parse(text);
  if (!p) return null;
  const lim = p.ok && p.kind === "read" ? limits.read : limits.write;
  // the dev box and the broadcaster are not rate limited (the limiter is against chat spam, not the streamer)
  if (!msg.local && !msg.isBroadcaster && !lim.check(user, Date.now()).ok) return null;   // silent drop: replying to spam would spam chat too
  const res = apply(sim, p, { ...msg, user });
  const L = res.log[0] || {};
  const entries = [{ id: ++seq, user, text, t: sim.w.t, code: L.code, reasons: L.reasons, reply: res.reply, err: !p.ok }, ...logS.state.entries].slice(0, LOG_MAX);
  if (p.cmd === "reset" && p.ok && (msg.isMod || msg.isBroadcaster)) { limits.read.reset(); limits.write.reset(); }
  logS.set({ entries });   // the log card first: it is the direct answer to the command
  const touched = new Set([p.args?.robot, p.args?.a, p.args?.b].filter(Boolean));
  // a write shows its effect on the next frame: the next sim step is due now instead of up to TICK_MS later
  // the command's writes show in this frame; the tween in flight keeps going (no freeze-then-jump), motion follows on the next step
  stepped(MANUAL ? false : "keep"); publish(touched);
  return res.reply;
}
export function advance(n = 1) { const t0 = performance.now(); tick(sim, n); stats.step(performance.now() - t0); stepped(false); publish(); return sim.w.t; }

// one rAF loop for everything (the demo's loop): step the sim from the accumulator, draw the scene, refresh panels at 4 Hz
let acc = 0, lastNow = 0, sceneNodes = null;
function loop(now) {
  const dt = lastNow ? Math.min(0.1, (now - lastNow) / 1000) : 0; lastNow = now;
  if (!MANUAL) { acc += (dt * 1000) / TICK_MS; let n = 0;
    while (acc >= 1 && n < 12) { const t0 = performance.now(); tick(sim, 1); stats.step(performance.now() - t0); stepped(true); acc -= 1; n++; }
    if (n === 12) acc = 0; }
  if (sceneNodes) { const t0 = performance.now(); if (drawScene(sceneNodes, MANUAL ? 1 : Math.min(1, acc))) stats.draw(performance.now() - t0); }
  if (uiV !== scene.v && now - lastUi > 250) publish();
  requestAnimationFrame(loop);
}

// ── timing, read by tools/perf.mjs ──
const stats = { publishes: 0, drawMs: [], stepMs: [], draw(ms) { this.drawMs.push(ms); if (this.drawMs.length > 600) this.drawMs.shift(); }, step(ms) { this.stepMs.push(ms); if (this.stepMs.length > 120) this.stepMs.shift(); } };
const avg = (a) => +(a.reduce((x, y) => x + y, 0) / (a.length || 1)).toFixed(3), mx = (a) => +Math.max(0, ...a).toFixed(3);

// ── WebSocket to the Codex server (reconnects). Contract unchanged: in {type:"chat",...}, out {type:"reply",id,text}
let ws, wait = 1000;
function connect() {
  try { ws = new WebSocket(WS_URL); } catch (e) { wsS.set({ text: `ws: ${e.message}` }); return setTimeout(connect, wait); }
  ws.onopen = () => { wait = 1000; wsS.set({ text: `ws: connected ${WS_URL}` }); ws.send(JSON.stringify({ type: "hello", role: "overlay", version: 1 })); };
  ws.onclose = () => { wsS.set({ text: `ws: offline, retry in ${wait / 1000}s` }); setTimeout(connect, wait); wait = Math.min(wait * 2, 15000); };
  ws.onerror = () => {};
  ws.onmessage = (ev) => {
    let m; try { m = JSON.parse(ev.data); } catch { return; }
    if (m.type && m.type !== "chat") return;
    const reply = handle(m);
    if (reply && ws.readyState === 1) ws.send(JSON.stringify({ type: "reply", id: m.id ?? null, text: reply }));
  };
}

window.codex = { handle, advance, snapshot: () => snapshot(sim), sim,
  stats: () => ({ drawMsAvg: avg(stats.drawMs), drawMsMax: mx(stats.drawMs), stepMsAvg: avg(stats.stepMs), stepMsMax: mx(stats.stepMs), publishes: stats.publishes, log: logS.state.entries.length }) };
G.mount(pageSpec(), document.getElementById("root"), { gui: MOUNT_GUI });
connect();
requestAnimationFrame(loop);
