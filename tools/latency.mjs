// Input-to-visible latency through the real dev box: type a command, press Enter, then measure (in the page, performance.now)
// submit -> new log card in the DOM, submit -> next painted frame with it, submit -> robot's on-screen transform changes.
// Also: dropped commands (no card within 4 s), and keydown->paint for typing in the box.
// usage: node tools/latency.mjs [query] [n]   env THROTTLE=4 DPR=2
import { chromium } from "playwright"; import { spawn } from "node:child_process";
const Q = process.argv[2] ?? "", N = +(process.argv[3] || 16), DPR = +(process.env.DPR || 1);
const srv = spawn("node", ["tools/mock-server.mjs"], { stdio: ["pipe", "ignore", "inherit"] }); await new Promise((r) => setTimeout(r, 700));
const b = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome" });
const pg = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: DPR });
const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
await pg.goto(`http://localhost:3017/overlay/${Q ? "?" + Q : ""}`); await pg.waitForFunction(() => window.codex && document.getElementById("dev-text"), null, { timeout: 20000 });
await pg.waitForTimeout(1200);
if (process.env.THROTTLE) { const cdp = await pg.context().newCDPSession(pg); await cdp.send("Emulation.setCPUThrottlingRate", { rate: +process.env.THROTTLE }); }
await pg.evaluate(() => {
  window.__lat = [];
  const form = document.getElementById("dev");
  form.addEventListener("submit", () => {
    const t0 = performance.now(), cards0 = new Set([...document.querySelectorAll("[data-log-id]")].map((e) => e.dataset.logId));
    const rob = () => [...document.querySelectorAll("#scene g")].slice(0, 3).map((g) => g.getAttribute("transform")).join("|"), r0 = rob();
    const rec = { card: null, paint: null, move: null }, simT0 = window.codex.sim.w.t;
    const poll = () => { const now = performance.now();
      if (rec.card == null && [...document.querySelectorAll("[data-log-id]")].some((e) => !cards0.has(e.dataset.logId))) { rec.card = now - t0; requestAnimationFrame(() => setTimeout(() => { rec.paint = performance.now() - t0; }, 0)); }
      if (rec.move == null && window.codex.sim.w.t > simT0) rec.move = now - t0;   // first frame drawn after a sim step that includes the command
      if ((rec.card == null || rec.move == null) && now - t0 < 4000) requestAnimationFrame(poll); else window.__lat.push(rec); };
    queueMicrotask(poll);   // first check right after the handler, then every frame
  }, true);
});
const typ = [];
for (let i = 0; i < N; i++) {
  const to = i % 2 ? 1.4 : -1.4;
  await pg.click("#dev-text");
  const k0 = Date.now(); await pg.keyboard.type(`!walk oli to ${to}`, { delay: 0 }); typ.push(Date.now() - k0);
  await pg.keyboard.press("Enter"); await pg.waitForTimeout(1200);
}
await pg.waitForTimeout(4200);
const lat = await pg.evaluate(() => window.__lat);
const q = (a, p) => { const s = a.filter((x) => x != null).sort((x, y) => x - y); return s.length ? +s[Math.min(s.length - 1, Math.floor(p * s.length))].toFixed(1) : null; };
const col = (k) => lat.map((r) => r[k]);
console.log(JSON.stringify({ query: Q, throttle: +(process.env.THROTTLE || 1), dpr: DPR, commands: N, dropped: col("card").filter((x) => x == null).length,
  cardMs: { p50: q(col("card"), .5), p95: q(col("card"), .95) }, paintMs: { p50: q(col("paint"), .5), p95: q(col("paint"), .95) },
  moveMs: { p50: q(col("move"), .5), p95: q(col("move"), .95), never: col("move").filter((x) => x == null).length }, typing18charsMs: { p50: q(typ, .5) }, errors: errs }));
await b.close(); srv.kill();
