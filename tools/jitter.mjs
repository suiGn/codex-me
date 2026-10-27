// Visual smoothness: per-frame robot screen positions (from the SVG transform) for ~6 s, both pages.
// node tools/jitter.mjs [url] [seconds]   env THROTTLE=4 DPR=2
import { chromium } from "playwright";
const url = process.argv[2] || "http://localhost:3017/overlay/", secs = +(process.argv[3] || 6);
const b = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome" }); const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: +(process.env.DPR || 1) });
const pg = await ctx.newPage(); const cdp = await ctx.newCDPSession(pg);
if (process.env.THROTTLE) await cdp.send("Emulation.setCPUThrottlingRate", { rate: +process.env.THROTTLE });
await pg.goto(url); await pg.waitForFunction(() => window.codex || window.__space, null, { timeout: 30000 }); await pg.waitForTimeout(1500);
if (process.env.CHAT) await pg.evaluate(() => { let i = 0; setInterval(() => window.codex?.handle({ user: "v" + (i % 5), text: ["!walk oli to 1.2", "!status tiko", "!battery lua 40", "!explain oli.battery"][i++ % 4], local: true, isBroadcaster: true }), 700); });
const rec = await pg.evaluate((secs) => new Promise((done) => {
  const out = [], t0 = performance.now();
  const f = (now) => { const gs = [...document.querySelectorAll("svg g[transform*='rotate'][transform*='scale']")].slice(0, 6);
    out.push({ now, p: gs.map((g) => { const m = /translate\(([-\d.]+)[ ,]+([-\d.]+)/.exec(g.getAttribute("transform")); return m ? [+m[1], +m[2]] : null; }) });
    if (now - t0 < secs * 1000) requestAnimationFrame(f); else done(out); };
  requestAnimationFrame(f); }), secs);
await b.close();
const n = rec[0].p.length, res = [];
for (let k = 0; k < n; k++) {
  const d = []; for (let i = 1; i < rec.length; i++) { const a = rec[i - 1].p[k], c = rec[i].p[k]; if (a && c) d.push({ v: Math.hypot(c[0] - a[0], c[1] - a[1]), dt: rec[i].now - rec[i - 1].now }); }
  const mov = d.filter((x) => x.v > 0.01); if (mov.length < d.length * 0.5) continue;  // pick robots that walk most of the time
  const v = mov.map((x) => x.v / x.dt * 16.67), m = v.reduce((a, b) => a + b, 0) / v.length, sd = Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length);
  let zj = 0; for (let i = 1; i < d.length; i++) if (d[i - 1].v <= 0.01 && d[i].v > 0.01) zj++;
  const sorted = [...v].sort((a, b) => a - b);
  res.push({ robot: k, frames: d.length, movingFrames: mov.length, pxPerFrame: +m.toFixed(3), cv: +(sd / m).toFixed(3), p95OverMedian: +(sorted[Math.floor(v.length * 0.95)] / sorted[Math.floor(v.length / 2)]).toFixed(2), zeroThenJump: zj });
}
const gaps = rec.slice(1).map((r, i) => r.now - rec[i].now);
console.log(JSON.stringify({ url, frames: rec.length, stalls: gaps.filter((g) => g > 25).length, maxGap: +Math.max(...gaps).toFixed(1), robots: res }));
