// Frame timing in headless Chrome: rAF deltas, long tasks, and the overlay's own step / draw cost.
// usage: node tools/perf.mjs [query] [seconds]   (starts the mock server itself)
import { chromium } from "playwright"; import { spawn } from "node:child_process";
const Q = process.argv[2] ?? "", SEC = +(process.argv[3] || 6);
const srv = spawn("node", ["tools/mock-server.mjs"], { stdio: ["pipe", "ignore", "inherit"] });
await new Promise((r) => setTimeout(r, 700));
const b = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--disable-gpu-vsync", "--disable-frame-rate-limit"].slice(0, 0) });
const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
// PERF_URL=... measures another page with the same counters (e.g. the Space demo: no chat load there, it plays on its own)
const URL_ = process.env.PERF_URL || `http://localhost:3017/overlay${Q ? "?" + Q : "/"}`;
await pg.goto(URL_); await pg.waitForFunction(() => window.codex || window.__space, null, { timeout: 30000 });
await pg.waitForTimeout(1000);
const cdp = await pg.context().newCDPSession(pg); await cdp.send("Performance.enable");
const M = async () => Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
if (process.env.THROTTLE) await cdp.send("Emulation.setCPUThrottlingRate", { rate: +process.env.THROTTLE });
const m0 = await M();
// chat load: one command per 400 ms from rotating users, like a busy stream
const r = await pg.evaluate(async (SEC) => {
  const lines = ["!walk oli to 1.2", "!me tiko", "!charge tiko", "!explain oli mustCharge", "!battery add nina 1", "!walk tiko to -0.4", "!me oli battery", "!help"];
  let i = 0; const chat = setInterval(() => window.codex?.handle({ user: "u" + (i % 50), text: lines[i++ % lines.length], isBroadcaster: true }), 400);
  const lt = []; const po = new PerformanceObserver((l) => { for (const e of l.getEntries()) lt.push(e.duration); }); po.observe({ type: "longtask", buffered: false });
  const d = []; let last = performance.now(), end = last + SEC * 1000;
  await new Promise((res) => { const f = (t) => { d.push(t - last); last = t; if (t < end) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
  clearInterval(chat); po.disconnect();
  d.sort((a, b) => a - b); const q = (p) => +d[Math.min(d.length - 1, Math.floor(p * d.length))].toFixed(1);
  return { frames: d.length, fps: +(d.length / SEC).toFixed(1), p50: q(.5), p95: q(.95), p99: q(.99), max: +d[d.length - 1].toFixed(1), over20ms: d.filter((x) => x > 20).length,
    longTasks: lt.length, longTaskMax: +Math.max(0, ...lt).toFixed(1), domNodes: document.getElementsByTagName("*").length, own: (window.codex || window.__space).stats?.() };
}, SEC);
const m1 = await M(), per = (k) => +(((m1[k] - m0[k]) * 1000) / SEC).toFixed(1);   // ms of main-thread work per wall second
r.mainThreadMsPerSec = { task: per("TaskDuration"), script: per("ScriptDuration"), layout: per("LayoutDuration"), style: per("RecalcStyleDuration"), layouts: m1.LayoutCount - m0.LayoutCount, styleRecalcs: m1.RecalcStyleCount - m0.RecalcStyleCount };
// visual update rate: how often the robot positions on screen actually change
r.sceneUpdatesPerSec = await pg.evaluate(async () => { const g = () => [...document.querySelectorAll("#scene g, svg g[data-robot], svg .spider, svg g")].slice(0, 3).map((e) => e.getAttribute("transform")).join("|");
  let n = 0, last = g(); const end = performance.now() + 2000; await new Promise((res) => { const f = () => { const c = g(); if (c !== last) { n++; last = c; } performance.now() < end ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); }); return n / 2; });
console.log(JSON.stringify({ query: Q, ...r, errors: errs }));
await b.close(); srv.kill();
