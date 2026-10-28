// Offline regression: directional orders replace an old destination, respect kernel priorities,
// and produce a short visible shine through the unchanged mock WebSocket transport.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import ME from '../overlay/vendor/this.me-4.2.1.es.js';
import { createSim, apply, tick, S } from '../overlay/world.js';
import { parse } from '../overlay/commands.js';
const run = (sim, text) => apply(sim, parse(text), { user: 'OfflineViewer' });
const checks = [];
for (const [direction, sign] of [['left', -1], ['right', 1]]) {
  const sim = createSim(ME), oli = sim.w.robots[0], base = 'robots.1';
  run(sim, '!battery oli 90');
  run(sim, '!walk oli to 1.4');
  const before = oli.truth.pos;
  const result = run(sim, `!walk oli ${direction}`);
  assert.ok(Math.abs(S.wrap(oli.k.read(`${base}.tipPos`) - before) - sign * 0.8) < 1e-9);
  assert.equal(oli.k.read(`${base}.followTip`), true);
  assert.match(result.reply, /followTip = true because/);
  tick(sim, 1);
  assert.equal(Math.sign(S.wrap(oli.truth.pos - before)), sign);
  assert.ok(oli.walked > 0);
  checks.push(`${direction}: replaces prior tip and moves on next simulation step`);
}
{
  const sim = createSim(ME), oli = sim.w.robots[0];
  run(sim, '!battery oli 4');
  const result = run(sim, '!walk oli left');
  assert.match(result.reply, /walk left waiting; robots.1.goCharge = true because/);
  tick(sim, 1);
  assert.equal(oli.action, 'charge');
  checks.push('low battery: walk reports charging priority and does not override it');
}
const port = process.env.CHECK_PORT || '3018';
const server = spawn(process.execPath, ['tools/mock-server.mjs'], { env: { ...process.env, PORT: port }, stdio: ['pipe', 'pipe', 'pipe'] });
let browser;
const replies = [], errors = [];
try {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.once('exit', code => reject(new Error(`Mock exited early: ${code}`)));
    server.stderr.on('data', d => errors.push(String(d)));
    server.stdout.on('data', d => { const text = String(d); replies.push(text); if (text.includes('mock on')) resolve(); });
  });
  browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`http://localhost:${port}/overlay/?dev=0&clock=manual&ws=${encodeURIComponent(`ws://localhost:${port}/ws`)}`);
  await page.waitForFunction(() => /connected/.test(document.getElementById('ws-status')?.textContent || ''));
  const before = await page.evaluate(() => window.codex.snapshot().robots[0]);
  const beforeTransform = await page.locator('#scene g').first().getAttribute('transform');
  server.stdin.write('OfflineViewer: !walk oli left\n');
  await page.waitForFunction(() => +document.querySelector('[data-order-shine="1"]').getAttribute('opacity') > 0);
  await mkdir('evidence/order-check', { recursive: true });
  await page.screenshot({ path: 'evidence/order-check/order-shine.png' });
  assert.equal(await page.locator('[data-order-shine="2"]').getAttribute('opacity'), '0');
  const whileShining = await page.locator('[data-order-shine="1"]').getAttribute('opacity');
  const after = await page.evaluate(() => { window.codex.advance(1); return window.codex.snapshot().robots[0]; });
  assert.ok(S.wrap(after.pos - before.pos) < 0);
  await page.waitForFunction(before => document.querySelector('#scene g').getAttribute('transform') !== before, beforeTransform);
  await page.waitForFunction(() => +document.querySelector('[data-order-shine="1"]').getAttribute('opacity') === 0);
  server.stdin.write('reader: !me oli.battery\n');
  await page.waitForFunction(() => document.body.textContent.includes('!me oli.battery'));
  assert.equal(await page.locator('[data-order-shine="1"]').getAttribute('opacity'), '0');
  server.stdin.write('invalid: !walk oli nowhere\n');
  await page.waitForFunction(() => document.body.textContent.includes('!walk oli nowhere'));
  assert.equal(await page.locator('[data-order-shine="1"]').getAttribute('opacity'), '0');
  await page.screenshot({ path: 'evidence/order-check/order-complete.png' });
  assert.deepEqual(errors, []);
  checks.push('WebSocket order: target robot shines, other robots do not; shine expires in manual clock too');
  checks.push('read and invalid command do not shine');
  await writeFile('evidence/order-check/result.json', JSON.stringify({ mode: 'OFFLINE — mock chat, vendored this.me 4.2.1, real browser', checks, before_pos: before.pos, after_pos: after.pos, shine_opacity: whileShining, replies, errors }, null, 2) + '\n');
  console.log(JSON.stringify({ checks, before_pos: before.pos, after_pos: after.pos, errors }, null, 2));
} finally { await browser?.close(); server.kill(); }
