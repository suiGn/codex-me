// Codex .me world: the Space demo simulation (space-model.js, unmodified) + chat commands mapped onto it.
// Each robot has its own .me kernel (r.k.me). Nothing here evaluates chat text: commands.js already turned it into
// a validated path / value / expression, and only those reach the kernel API.
import * as S from "./space-model.js";
import { NAMES } from "./commands.js";

export const MAX_REPLY = 450, SEED = 7;
export const BUILTIN_RULES = new Set([...S.RULE_NAMES, ...S.KEPT_RULES.map(([n]) => n), "acceptTip"]);

export function createSim(ME, { seed = SEED } = {}) {
  return { ME, seed, w: S.createWorld(ME, { seed }), chatRules: [] };
}
export const tick = (sim, n = 1) => { for (let i = 0; i < n; i++) S.step(sim.w, 1); };
const R = (sim, id) => S.robotOf(sim.w, id);
const cap = (s) => (s.length > MAX_REPLY ? s.slice(0, MAX_REPLY - 1) + "…" : s);
const fmt = (v) => (typeof v === "number" ? String(Math.round(v * 100) / 100) : v && typeof v === "object" && v.__ptr ? `-> ${v.__ptr}` : JSON.stringify(v));

// follow pointers on any prefix: robots.1.home.name -> rocks.b612.name (me.explain does not follow them itself)
export function resolve(me, path) {
  const segs = path.split("."); let hops = 0;
  for (let i = 1; i <= segs.length && hops < 8; i++) {
    const v = me(segs.slice(0, i).join("."));
    if (v && typeof v === "object" && typeof v.__ptr === "string") { const rest = segs.slice(i); return resolve(me, [v.__ptr, ...rest].join(".")); }
  }
  return path;
}
// a branch has no value of its own: list the leaves under it from inspect().index (flat path -> value)
function branch(me, path) {
  const ix = me.inspect().index, pre = path + ".", kids = new Map();
  for (const [p, v] of Object.entries(ix)) if (p.startsWith(pre)) {
    const rest = p.slice(pre.length);
    if (!kids.has(rest)) kids.set(rest, fmt(v));   // leaves, relative: batteries.1.charge=36
  }
  return kids;
}
export function read(me, path) {
  const v = me(path);
  if (v !== undefined) return { value: v, text: fmt(v) };
  const real = resolve(me, path);
  if (real !== path) { const r = read(me, real); return { ...r, via: real }; }
  const kids = branch(me, path);
  if (!kids.size) return { value: undefined, text: "undefined" };
  return { branch: kids.size, text: `{${kids.size}} ` + [...kids].map(([k, v]) => `${k}=${v}`).join(", ") };
}
// one line: path = v because expr [input=v, ...]
export function reason(me, path) {
  const real = resolve(me, path), e = me.explain(real), via = real !== path ? ` (via -> ${real})` : "";
  if (!e) return `${path} = undefined`;
  if (!e.expr) return `${path}${via} = ${fmt(e.value)} (stored fact)`;
  const ins = (e.derivation?.inputs || []).map((x) => `${x.label}=${fmt(x.value)}`);
  return `${path}${via} = ${fmt(e.value)} because ${e.expr}` + (ins.length ? ` [${ins.join(", ")}]` : "");
}
const whyFlag = (r) => { const b = `robots.${r.id}`; return reason(r.k.me, `${b}.${S.flagOf(r)}`); };

// apply one parsed command. msg = { user, isMod, isBroadcaster }. Returns { reply, log: [{code, user, reasons, changed}] }
export function apply(sim, p, msg = {}) {
  const user = msg.user || "anon", out = (reply, codes = [], reasons = [], changed = false) =>
    ({ reply: cap(reply), log: codes.length || reasons.length ? [{ code: codes.join("\n"), user, reasons, changed }] : [] });
  if (!p) return null;
  if (!p.ok) return out(`@${user} ${p.error}`);
  const a = p.args, w = sim.w;
  const kOf = (id) => R(sim, id).k;
  switch (p.cmd) {
    case "help": return out(`@${user} ${HELP_SHORT}`);
    case "me": {
      const r = read(kOf(a.robot ?? 1).me, a.path);
      if (!a.robot) return out(`@${user} which robot's kernel? e.g. oli.battery or lua:objects.comet.near`);
      return out(`@${user} ${NAMES[a.robot]}:${a.path}${r.via ? ` -> ${r.via}` : ""} = ${r.text}`, [p.code]);
    }
    case "explain": {
      if (!a.robot) return out(`@${user} which robot's kernel? e.g. !explain tiko.goCharge`);
      const line = reason(kOf(a.robot).me, a.path);
      return out(`@${user} ${line}`, [p.code], [line]);
    }
    case "status": {
      const r = R(sim, a.robot);
      return out(`@${user} ${r.name}: ${r.status}, heading ${r.dest}; battery ${fmt(r.k.read(`robots.${r.id}.battery`))}%, pos ${fmt(r.truth.pos)} rad. ${whyFlag(r)}`, [], [whyFlag(r)]);
    }
    case "inbox": case "outbox": {
      const r = R(sim, a.robot), ids = S.msgIds(r, p.cmd);
      const items = ids.map((id) => { const b = `robots.${r.id}.${p.cmd}.${id}`, k = r.k;
        return `#${id} ${p.cmd === "inbox" ? "from " + NAMES[k.read(`${b}.from`)] : "to " + NAMES[k.read(`${b}.to`)]} ${k.read(`${b}.kind`)}@${k.read(`${b}.at`)}`; });
      return out(`@${user} ${r.name} ${p.cmd} (${ids.length}): ${items.join(" · ") || "empty"}`, [`me("robots.${r.id}.${p.cmd}")`]);
    }
    case "radio": {
      const x = R(sim, a.a), y = R(sim, a.b), l = S.radio(w, x, y);
      return out(`@${user} ${x.name} -> ${y.name}: ${l.ok ? "in range" : "no link (" + l.why + ")"}, ${Math.round(l.d)} px of ${S.RANGE}`);
    }
    case "walk": {
      const r = R(sim, a.robot), b = `robots.${r.id}`, codes = [];
      if (r.dead) return out(`@${user} ${r.name} is asleep (battery 0). Try !battery ${NAMES[r.id]} 50`);
      if (a.dir) { r.dir = a.dir; codes.push(`// ${r.name} explores ${a.dir < 0 ? "left" : "right"} (adapter heading, not a fact)`); }
      else {
        const f = { tipRock: r.rock, tipPos: a.to, tipAt: w.t };
        for (const [k, v] of Object.entries(f)) { r.written[k] = v; r.k.write(`${b}.${k}`, v); codes.push(S.codeOf(`${b}.${k}`, v)); }
      }
      const line = reason(r.k.me, `${b}.${a.dir ? "explore" : "followTip"}`);
      return out(`@${user} ${r.name}: ${line}`, codes, [line], true);
    }
    case "charge": {
      const r = R(sim, a.robot), b = `robots.${r.id}`;
      r.written.charging = true; r.k.write(`${b}.charging`, true);
      const line = reason(r.k.me, `${b}.goCharge`);
      return out(`@${user} ${r.name}: ${line}`, [p.code], [line], true);
    }
    case "battery": {
      const r = R(sim, a.robot), b = `robots.${r.id}`; let code;
      if (a.level !== undefined) { S.setBattery(w, r.id, a.level); code = `setBattery(${r.id}, ${a.level}) // writes ${b}.batteries[n].charge`; }
      else if (a.op === "add") { if (r.bats.some((x) => x.i === 3)) return out(`@${user} ${r.name} already has battery 3`); S.addBattery(w, r.id); code = `addBattery(${r.id}) // ${b}.batteries[3]`; }
      else { if (!r.bats.some((x) => x.i === a.i) || r.bats.length < 2) return out(`@${user} ${r.name} has no removable battery ${a.i}`); S.removeBattery(w, r.id, a.i); code = `removeBattery(${r.id}, ${a.i}) // ${b}.batteries[${a.i}]["-"]()`; }
      const l1 = reason(r.k.me, `${b}.battery`), l2 = reason(r.k.me, `${b}.mustCharge`);
      return out(`@${user} ${r.name}: ${l1}`, [code], [l1, l2], true);
    }
    case "hello": case "tip": {
      const r = R(sim, a.robot), okq = p.cmd === "hello" ? S.sayHello(w, r.id) : S.shareTip(w, r.id);
      if (!okq) return out(`@${user} ${r.name} ${r.dead ? "is asleep" : p.cmd === "tip" ? "knows no ice left on its rock" : "cannot send"}`);
      return out(`@${user} ${r.name} queued a ${p.cmd} (${r.queue.length}/${S.QUEUE}); one message per ${S.SEND_GAP} min, lands in its outbox`, [`enqueue(${r.id}, {kind:"${p.cmd}"})`], [], true);
    }
    case "set": {
      const r = R(sim, a.robot), k = r.k, e = k.me.explain(a.path);
      if (e?.expr && !(msg.isMod || msg.isBroadcaster)) return out(`@${user} ${a.path} is computed (${e.expr}); only mods overwrite rules`);
      const prev = k.read(a.path);
      if (prev && typeof prev === "object") return out(`@${user} ${a.path} is a pointer; use !link`);
      const rel = a.path.startsWith(`robots.${r.id}.`) ? a.path.slice(`robots.${r.id}.`.length) : a.path;
      if (rel in r.written) r.written[rel] = a.value;   // its sensors re-measure it when the truth changes
      k.write(a.path, a.value); k.index();
      const line = reason(k.me, a.path);
      return out(`@${user} ${NAMES[r.id]}: ${line} (was ${fmt(prev)})`, [p.code], [line], true);
    }
    case "link": {
      const r = R(sim, a.robot), k = r.k, prev = k.read(a.path);
      if (prev !== undefined && !(prev && typeof prev === "object")) return out(`@${user} ${a.path} holds a value; a pointer goes on a new name`);
      k.point(a.path, a.target, true); k.index();
      const v = read(k.me, a.target);
      return out(`@${user} ${NAMES[r.id]}: ${a.path} -> ${a.target} = ${v.text}`, [p.code], [], true);
    }
    case "rule": {
      if (BUILTIN_RULES.has(a.name) && !(msg.isMod || msg.isBroadcaster)) return out(`@${user} "${a.name}" is one of the demo's rules; only mods redefine it`);
      const ids = a.robot ? [a.robot] : [1, 2, 3], lines = [], codes = [];
      for (const id of ids) {
        const k = kOf(id);
        let node = k.me; for (const s of a.path.split(".")) node = node[s];
        node["[i]"]["="](a.name, a.expr); k.index();
        codes.push(`// ${NAMES[id]}: ${p.code}`);
        const sample = a.path === "robots" ? `robots.${id}.${a.name}` : firstMember(k.me, a.path, a.name);
        if (sample) lines.push(reason(k.me, sample));
      }
      if (lines.length && lines.every((l) => / = undefined/.test(l))) lines.push("(undefined: a name in the rule is not a fact here)");
      sim.chatRules.push({ name: a.name, expr: a.expr, path: a.path, robots: ids });
      return out(`@${user} rule ${a.name} on ${a.path}[i] in ${ids.map((i) => NAMES[i]).join(",")}: ${lines[0] || "no members yet"}`, codes, lines, true);
    }
    case "reset": {
      if (!(msg.isMod || msg.isBroadcaster)) return out(`@${user} !reset is for mods`);
      sim.w = S.createWorld(sim.ME, { seed: sim.seed }); sim.chatRules = [];
      return out(`@${user} world reset (seed ${sim.seed}, t=0)`, [p.code], [], true);
    }
  }
  return null;
}
function firstMember(me, path, name) {
  const ids = [...new Set([...branch(me, path).keys()].map((k) => k.split(".")[0]))];
  for (const k of ids) if (me(`${path}.${k}.${name}`) !== undefined) return `${path}.${k}.${name}`;
  return ids[0] ? `${path}.${ids[0]}.${name}` : null;
}
const HELP_SHORT = "!me oli.battery · !explain tiko.goCharge · !walk lua to 1.2 · !charge oli · !battery tiko 20 · !hello oli · !set oli.margin 15 · !rule robots[i] low battery < 30 · !link oli.watch rocks.b325 · !inbox lua";

// everything the overlay draws, plain data
export function snapshot(sim) {
  const w = sim.w;
  return {
    t: w.t, comet: { ...w.comet }, flower: w.flower && { ...w.flower },
    rocks: w.rocks.map((rk) => ({ id: rk.id, name: rk.name, x: rk.x, y: rk.y, R: rk.R, sun: S.sunAngle(rk), spots: rk.spots.map((s) => ({ pos: s.pos, left: s.left })) })),
    robots: w.robots.map((r) => { const b = `robots.${r.id}`, xy = S.robotXY(w, r, 0);
      return { id: r.id, name: r.name, role: r.role, rock: r.rock, pos: r.truth.pos, x: xy.x, y: xy.y, a: xy.a, walked: r.walked, moving: r.moving, dead: r.dead,
        status: r.status, dest: r.dest, flag: S.flagOf(r), battery: r.k.read(`${b}.battery`), reserve: r.k.read(`${b}.reserve`),
        bats: r.bats.map((x) => ({ i: x.i, capacity: x.capacity, charge: r.k.read(`${b}.batteries.${x.i}.charge`) })), lit: S.litAt(r.truth.pos), queue: r.queue.length }; }),
    packets: w.packets.map((p) => { const to = S.robotXY(w, R(sim, p.to), 8), f = Math.min(1, (w.t - p.sentAt) / Math.max(1e-6, p.arriveAt - p.sentAt));
      return { kind: p.kind, from: p.from, to: p.to, x: p.x0 + (to.x - p.x0) * f, y: p.y0 + (to.y - p.y0) * f }; }),
    chatRules: sim.chatRules.slice(-6), delivered: w.delivered, lost: w.lost,
  };
}
export { S };
