import test from "node:test";
import assert from "node:assert/strict";
import ME from "this.me";
import { parse, parseExpr, parsePath, parseValue, createRateLimiter } from "../overlay/commands.js";
import { createSim, tick, apply, snapshot, S } from "../overlay/world.js";

const run = (sim, t, msg = { user: "u" }) => apply(sim, parse(t), msg);

test("non-commands and unknown commands are ignored", () => {
  assert.equal(parse("hello"), null); assert.equal(parse("!dance"), null); assert.equal(parse(42), null);
});
test("path grammar: identifiers, [n], dots, robot aliases; no kernel methods or JS internals", () => {
  assert.deepEqual(parsePath("oli.battery"), { robot: 1, path: "robots.1.battery", iter: false });
  assert.deepEqual(parsePath("robots[2].batteries[1].charge"), { robot: 2, path: "robots.2.batteries.1.charge", iter: false });
  assert.deepEqual(parsePath("lua:objects.comet.near"), { robot: 3, path: "objects.comet.near", iter: false });
  assert.equal(parsePath("objects.ice.seen").robot, null);
  assert.equal(parsePath("robots[i]", { allowIter: true }).iter, true);
  for (const bad of ["", "oli.__proto__", "oli.constructor", "oli.explain", "a..b", "a.b()", "a[x]", "x;y", "bob:a", "oli:tiko.battery", "a.".repeat(20) + "a", "robots[i]"]) assert.throws(() => parsePath(bad), undefined, bad);
});
test("values: numbers, booleans, short words only", () => {
  assert.equal(parseValue("12.5"), 12.5); assert.equal(parseValue("true"), true); assert.equal(parseValue('"B 612"'), "B 612");
  for (const bad of ["", "a".repeat(41), "x=>1", "{}", "<b>"]) assert.throws(() => parseValue(bad), undefined, bad);
});
test("rule expressions: facts, numbers, arithmetic, comparisons, && || !, aggregates; no calls or strings", () => {
  assert.equal(parseExpr("battery<30&&!charging"), "battery < 30 && !charging");
  assert.equal(parseExpr("robots[i].batteries[].charge / 2 > 10"), "robots[i].batteries[].charge / 2 > 10");
  assert.equal(parseExpr("got - at <= robots[1].maxAge"), "got - at <= robots[1].maxAge");
  for (const bad of ["", "4 > 3", "battery >", "(battery", "process.exit()", "constructor > 1", "battery > 'a'", "a = 1", "a; b", "x.explain > 1", "x".repeat(97)]) assert.throws(() => parseExpr(bad), undefined, bad);
});
test("commands parse with kind read/write/mod", () => {
  assert.equal(parse("!me oli.battery").kind, "read"); assert.equal(parse("!explain tiko.goCharge").kind, "read");
  assert.equal(parse("!walk oli left").kind, "write"); assert.deepEqual(parse("!walk lua to -1.2").args, { robot: 3, to: -1.2 });
  assert.equal(parse("!set oli.margin 12").code, "me.robots[1].margin(12)");
  assert.equal(parse("!rule robots[i] low battery < 30").code, 'me.robots["[i]"]["="]("low", "battery < 30")');
  assert.equal(parse("!link oli.watch rocks.b325").code, 'me.robots[1].watch["->"]("rocks.b325")');
  assert.equal(parse("!reset").kind, "mod");
  for (const bad of ["!walk bob left", "!walk oli to 9", "!battery oli 101", "!battery oli remove 7", "!set objects.ice.seen true", "!set oli.x a(b)", "!rule robots low x > 1", "!rule robots[i] __proto__ x > 1", "!radio oli oli", "!me"]) assert.equal(parse(bad).ok, false, bad);
});
test("rate limiter: gap and burst per user, case-insensitive", () => {
  const rl = createRateLimiter({ gapMs: 3000, burst: 3, windowMs: 30000 });
  assert.equal(rl.check("Ana", 0).ok, true); assert.equal(rl.check("ana", 1000).ok, false); assert.equal(rl.check("bo", 1000).ok, true);
  assert.equal(rl.check("ana", 3000).ok, true); assert.equal(rl.check("ana", 6000).ok, true);
  const r = rl.check("ana", 9000); assert.equal(r.ok, false); assert.equal(r.retryMs, 21000);
  assert.equal(rl.check("ana", 30001).ok, true);
});
test("the copied Space model still verifies on this.me 4.2.1", () => {
  const sim = createSim(ME); tick(sim, 200);
  const v = S.verifyWorld(ME, sim.w);
  assert.equal(v.ok, true, JSON.stringify(v.mismatches).slice(0, 300)); assert.ok(v.checked > 100);
});
test("deterministic: same commands + same ticks -> same world", () => {
  const go = () => { const s = createSim(ME); tick(s, 20); run(s, "!walk oli to -1.4"); run(s, "!battery lua 15"); tick(s, 60); return JSON.stringify(snapshot(s)); };
  assert.equal(go(), go());
});
test("walk, charge, battery drive the robots through their own kernels", () => {
  const sim = createSim(ME); tick(sim, 5);
  const oli = sim.w.robots[0], p0 = oli.truth.pos;
  let r = run(sim, "!walk oli to -1.4");
  assert.match(r.reply, /followTip = true because/); assert.equal(oli.k.read("robots.1.tipPos"), -1.4);
  tick(sim, 10); assert.ok(oli.truth.pos < p0, "oli walked toward -1.4");
  r = run(sim, "!battery tiko 4");
  assert.match(r.reply, /robots\.2\.battery = 4 because/); assert.equal(sim.w.robots[1].k.read("robots.2.mustCharge"), true);
  r = run(sim, "!charge lua"); assert.match(r.reply, /goCharge = true because .*charging=true/);
  tick(sim, 1); assert.equal(sim.w.robots[2].action, "charge");
  const b0 = sim.w.robots[1].truth.battery; tick(sim, 150);
  assert.ok(sim.w.robots[1].truth.battery > b0, "tiko charged in the sun");
});
test("generic reads, explain through pointers, set, rule, link, radio, inbox", () => {
  const sim = createSim(ME); tick(sim, 60);
  assert.match(run(sim, "!me oli.battery").reply, /^@u oli:robots\.1\.battery = \d/);
  const branch = run(sim, "!me oli").reply; assert.match(branch, /\{\d+\} id=1, name="Oli"/); assert.match(run(sim, "!me tiko.batteries").reply, /1\.capacity=60/); assert.ok(branch.length <= 450);
  assert.match(run(sim, "!explain oli.home.name").reply, /via -> rocks\.b612\.name\) = "B 612"/);
  assert.match(run(sim, "!set oli.margin 20").reply, /margin = 20 \(stored fact\) \(was 8\)/);
  assert.match(run(sim, "!explain oli.reserve").reply, /margin=20/);
  assert.match(run(sim, "!set oli.goCharge true").reply, /only mods/);
  assert.match(run(sim, "!rule robots[i] mustCharge battery < 99").reply, /only mods/);
  assert.match(run(sim, "!rule robots[i] lowBat battery < 101").reply, /lowBat = true because battery < 101/);
  assert.equal(sim.w.robots[2].k.read("robots.3.lowBat"), true);
  assert.match(run(sim, "!link oli.watch rocks.b612").reply, /-> rocks\.b612 = \{2\} name="B 612", radius=112/);
  assert.equal(sim.w.robots[0].k.read("robots.1.watch.radius"), 112);
  assert.match(run(sim, "!radio oli tiko").reply, /in range/);
  assert.match(run(sim, "!outbox oli").reply, /to (tiko|lua) hello/);
  assert.match(run(sim, "!hello lua").reply, /queued a hello/);
  assert.match(run(sim, "!reset").reply, /for mods/);
  run(sim, "!reset", { user: "m", isMod: true }); assert.equal(sim.w.t, 0); assert.equal(sim.w.robots[0].k.read("robots.1.margin"), 8);
});
