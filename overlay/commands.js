// Chat command parser for Codex .me (Space robots). Pure: no kernel, no DOM, no clock (time is passed in).
// parse(text) -> { ok:true, cmd, kind:"read"|"write"|"mod", args, code } | { ok:false, cmd, error } | null (not ours)

export const ROBOTS = { oli: 1, tiko: 2, lua: 3 };
export const NAMES = { 1: "oli", 2: "tiko", 3: "lua" };
export const LIMITS = { pathMax: 96, segMax: 10, exprMax: 96, strMax: 40 };
// names that are kernel methods or JS internals: never a path segment (me.robots[1].explain is a function, not a fact)
export const DENY = new Set(["__proto__", "prototype", "constructor", "__ptr", "toString", "valueOf", "hasOwnProperty", "then",
  "memories", "encryptedBranches", "inspect", "explain", "execute", "exportSnapshot", "hydrate", "importSnapshot", "rehydrate",
  "replayMemories", "learn", "prove", "setRecomputeMode", "getRecomputeMode", "installRecipientKey", "uninstallRecipientKey",
  "storeWrappedKey", "searchExact", "buildVectorIndex", "searchVector", "as", "withScope", "readPath", "postulate"]);
const SEG = /^[A-Za-z_][A-Za-z0-9_]{0,31}$/;

const robotId = (s) => { s = String(s ?? "").toLowerCase(); return ROBOTS[s] ?? (/^[1-3]$/.test(s) ? +s : null); };

// Path grammar: [robot:] seg ( "." seg | "[" n "]" )*   seg = identifier | integer. A first segment that is a robot
// name means robots.<id>. Returns { robot: id|null, path: "a.b.3.c" } or throws. allowIter: "[i]" allowed as the LAST step.
export function parsePath(src, { allowIter = false } = {}) {
  if (typeof src !== "string" || !src || src.length > LIMITS.pathMax) throw new Error("path missing or too long");
  let robot = null, s = src;
  const pm = /^([A-Za-z0-9]+):(.+)$/.exec(s);
  if (pm) { robot = robotId(pm[1]); if (!robot) throw new Error(`unknown robot "${pm[1]}"`); s = pm[2]; }
  let iter = false;
  if (allowIter && s.endsWith("[i]")) { iter = true; s = s.slice(0, -3); }
  const segs = s.replace(/\[(\d{1,4})\]/g, ".$1").split(".");
  if (segs.length > LIMITS.segMax) throw new Error("path too deep");
  for (const g of segs) {
    if (!(SEG.test(g) || /^\d{1,4}$/.test(g))) throw new Error(`bad path step "${g}"`);
    if (DENY.has(g)) throw new Error(`"${g}" is not a fact name`);
  }
  if (robotId(segs[0]) && !/^\d/.test(segs[0])) { const id = robotId(segs[0]); if (robot && robot !== id) throw new Error("two robots in one path"); robot = id; segs.splice(0, 1, "robots", String(id)); }
  if (segs[0] === "robots" && /^\d+$/.test(segs[1] ?? "")) { const id = +segs[1]; if (!robot) robot = id; }
  return { robot, path: segs.join("."), iter };
}

// Value grammar: number | true | false | word (letters, digits, space _ . -), max 40 chars. Never code.
export function parseValue(src) {
  const s = String(src ?? "").trim();
  if (/^-?\d{1,9}(\.\d{1,6})?$/.test(s)) return +s;
  if (s === "true") return true; if (s === "false") return false;
  const q = /^"([^"]*)"$/.exec(s), t = q ? q[1] : s;
  if (t.length >= 1 && t.length <= LIMITS.strMax && /^[A-Za-z0-9 _.\-]+$/.test(t)) return t;
  throw new Error("value must be a number, true/false or a short word");
}

// Expression grammar (rules), recursive descent, returns canonical text or throws:
//   or := and ("||" and)*   and := not ("&&" not)*   not := "!" not | cmp
//   cmp := sum (("<"|"<="|">"|">="|"=="|"!=") sum)?   sum := prod (("+"|"-") prod)*   prod := un (("*"|"/") un)*
//   un := "-" un | atom      atom := NUMBER | NAME ("." NAME | "[]" ("." NAME)?)* | "(" or ")"
// NAME follows the path rules (no kernel method names). Aggregates like robots[i].batteries[].charge are allowed.
export function parseExpr(src) {
  if (typeof src !== "string" || !src.trim()) throw new Error("empty expression");
  if (src.length > LIMITS.exprMax) throw new Error(`expression over ${LIMITS.exprMax} chars`);
  const toks = [], re = /\s*(<=|>=|==|!=|&&|\|\||\[\]|\[i\]|\[\d{1,4}\]|[<>!()+\-*/.]|\d+(?:\.\d+)?|[A-Za-z_][A-Za-z0-9_]*)/y;
  let pos = 0;
  while (pos < src.length) {
    if (!src.slice(pos).trim()) break;
    re.lastIndex = pos; const m = re.exec(src);
    if (!m) throw new Error(`unexpected "${src.slice(pos).trim()[0]}"`);
    toks.push(m[1]); pos = re.lastIndex;
  }
  let i = 0, names = 0; const peek = () => toks[i], take = () => toks[i++];
  const name = () => {
    let t = take();
    if (!/^[A-Za-z_]/.test(t) || DENY.has(t) || t.length > 32) throw new Error(`"${t}" not allowed`);
    let out = t;
    for (;;) {
      if (peek() === "[]" || peek() === "[i]" || /^\[\d+\]$/.test(peek() ?? "")) { out += take(); continue; }
      if (peek() === ".") { take(); const n = take(); if (!n || !(/^[A-Za-z_]\w*$/.test(n) || /^\d+$/.test(n)) || DENY.has(n)) throw new Error(`bad name after "."`); out += "." + n; continue; }
      break;
    }
    names++; return out;
  };
  const atom = () => {
    const t = peek();
    if (t === undefined) throw new Error("expression ends early");
    if (t === "(") { take(); const e = or(); if (take() !== ")") throw new Error('missing ")"'); return `(${e})`; }
    if (/^\d/.test(t)) return take();
    if (/^[A-Za-z_]/.test(t)) return name();
    throw new Error(`unexpected "${t}"`);
  };
  const un = () => (peek() === "-" ? (take(), `-${un()}`) : atom());
  const prod = () => { let e = un(); while (peek() === "*" || peek() === "/") e += ` ${take()} ${un()}`; return e; };
  const sum = () => { let e = prod(); while (peek() === "+" || peek() === "-") e += ` ${take()} ${prod()}`; return e; };
  const cmp = () => { const a = sum(); if (["<", "<=", ">", ">=", "==", "!="].includes(peek())) { const op = take(); return `${a} ${op} ${sum()}`; } return a; };
  const not = () => (peek() === "!" ? (take(), `!${not()}`) : cmp());
  const and = () => { let e = not(); while (peek() === "&&") { take(); e += ` && ${not()}`; } return e; };
  const or = () => { let e = and(); while (peek() === "||") { take(); e += ` || ${and()}`; } return e; };
  const out = or();
  if (i < toks.length) throw new Error(`unexpected "${toks[i]}"`);
  if (!names) throw new Error("expression must read a fact");
  return out;
}

const codePath = (p) => "me" + p.split(".").map((s) => (/^\d+$/.test(s) ? `[${s}]` : `.${s}`)).join("");
const ok = (cmd, kind, args, code) => ({ ok: true, cmd, kind, args, code });

export const HELP = "read: !me <path> · !explain <path> · !status <robot> · !radio <a> <b> · !inbox|!outbox <robot>  " +
  "write: !walk <robot> left|right|to <rad> · !charge <robot> · !battery <robot> <0-100>|add|remove <i> · !hello|!tip <robot> · " +
  "!set <path> <value> · !rule <coll[i]> <name> <expr> · !link <path> <path> · !reset (mods). Paths: oli.battery, lua:objects.comet.near";

export function parse(text) {
  if (typeof text !== "string") return null;
  const t = text.trim();
  if (!t.startsWith("!") || t.length > 300) return null;
  const [head, ...rest] = t.split(/\s+/), cmd = head.slice(1).toLowerCase();
  const bad = (error) => ({ ok: false, cmd, error });
  const P = (s, o) => { try { return parsePath(s, o); } catch (e) { return { error: e.message }; } };
  const needRobot = (s, usage) => { const id = robotId(s); return id ? null : bad(usage); };
  switch (cmd) {
    case "help": return ok("help", "read", {}, null);
    case "me": case "explain": {
      if (rest.length !== 1) return bad(`usage: !${cmd} <path>  e.g. oli.battery, tiko.goCharge, lua:objects.comet.near`);
      const p = P(rest[0]); if (p.error) return bad(p.error);
      return ok(cmd, "read", p, cmd === "me" ? `me(${JSON.stringify(p.path)})` : `me.explain(${JSON.stringify(p.path)})`);
    }
    case "status": case "inbox": case "outbox": {
      const e = needRobot(rest[0], `usage: !${cmd} <oli|tiko|lua>`); if (e || rest.length !== 1) return e || bad(`usage: !${cmd} <robot>`);
      return ok(cmd, "read", { robot: robotId(rest[0]) }, null);
    }
    case "radio": {
      const a = robotId(rest[0]), b = robotId(rest[1]);
      if (!a || !b || a === b || rest.length !== 2) return bad("usage: !radio <robot> <other robot>");
      return ok(cmd, "read", { a, b }, null);
    }
    case "walk": {
      const r = robotId(rest[0]), how = (rest[1] || "").toLowerCase();
      if (!r) return bad("usage: !walk <robot> left|right|to <rad -3.14..3.14>");
      if ((how === "left" || how === "right") && rest.length === 2) return ok(cmd, "write", { robot: r, dir: how === "left" ? -1 : 1 }, null);
      if (how === "to" && rest.length === 3 && /^-?\d(\.\d{1,3})?$/.test(rest[2]) && Math.abs(+rest[2]) <= 3.14)
        return ok(cmd, "write", { robot: r, to: +rest[2] }, null);
      return bad("usage: !walk <robot> left|right|to <rad -3.14..3.14>");
    }
    case "charge": case "hello": case "tip": {
      const r = robotId(rest[0]); if (!r || rest.length !== 1) return bad(`usage: !${cmd} <robot>`);
      return ok(cmd, "write", { robot: r }, cmd === "charge" ? `me.robots[${r}].charging(true)` : null);
    }
    case "battery": {
      const r = robotId(rest[0]);
      if (r && rest.length === 2 && /^\d{1,3}(\.\d)?$/.test(rest[1]) && +rest[1] <= 100) return ok(cmd, "write", { robot: r, level: +rest[1] }, null);
      if (r && rest.length === 3 && /^(add|remove)$/i.test(rest[1]) && /^[1-3]$/.test(rest[2])) return ok(cmd, "write", { robot: r, op: rest[1].toLowerCase(), i: +rest[2] }, null);
      return bad("usage: !battery <robot> <0-100> | add 3 | remove <1-3>");
    }
    case "set": {
      if (rest.length < 2) return bad("usage: !set <path> <value>");
      const p = P(rest[0]); if (p.error) return bad(p.error);
      if (!p.robot) return bad("which robot? e.g. !set oli.margin 12 or !set lua:objects.ice.seen true");
      let v; try { v = parseValue(rest.slice(1).join(" ")); } catch (e) { return bad(e.message); }
      return ok(cmd, "write", { ...p, value: v }, `${codePath(p.path)}(${JSON.stringify(v)})`);
    }
    case "link": {
      if (rest.length !== 2) return bad("usage: !link <path> <target path>  e.g. !link oli.watching rocks.b612");
      const a = P(rest[0]), b = P(rest[1]); if (a.error || b.error) return bad(a.error || b.error);
      if (!a.robot) return bad("which robot's kernel? e.g. !link oli.watching rocks.b612");
      if (b.robot && b.robot !== a.robot && rest[1].includes(":")) return bad("a pointer stays inside one kernel");
      return ok(cmd, "write", { robot: a.robot, path: a.path, target: b.path }, `${codePath(a.path)}["->"](${JSON.stringify(b.path)})`);
    }
    case "rule": {
      if (rest.length < 3) return bad("usage: !rule <coll[i]> <name> <expr>  e.g. !rule robots[i] lowBat battery < 30");
      const p = P(rest[0], { allowIter: true }); if (p.error) return bad(p.error);
      if (!p.iter) return bad('the rule target ends in [i], e.g. robots[i] or oli:robots.1.inbox[i]');
      const name = rest[1]; if (!SEG.test(name) || DENY.has(name)) return bad(`bad rule name "${name}"`);
      let expr; try { expr = parseExpr(rest.slice(2).join(" ")); } catch (e) { return bad(`rule: ${e.message}`); }
      return ok(cmd, "write", { robot: rest[0].includes(":") || p.path.startsWith("robots.") && p.path !== "robots" ? p.robot : null, path: p.path, name, expr },
        `${codePath(p.path)}["[i]"]["="](${JSON.stringify(name)}, ${JSON.stringify(expr)})`);
    }
    case "reset": return rest.length ? bad("usage: !reset") : ok(cmd, "mod", {}, "createWorld(ME)");
    default: return null;   // unknown "!foo": stay silent, other bots own other commands
  }
}

// Per-user rate limit: at most `burst` per `windowMs`, and `gapMs` between two. Time is passed in.
export function createRateLimiter({ gapMs = 3000, burst = 5, windowMs = 30000, maxUsers = 5000 } = {}) {
  const seen = new Map();
  return {
    check(user, now) {
      const k = String(user || "anon").toLowerCase();
      const ts = (seen.get(k) || []).filter((t) => now - t < windowMs);
      if (ts.length && now - ts[ts.length - 1] < gapMs) return { ok: false, retryMs: gapMs - (now - ts[ts.length - 1]) };
      if (ts.length >= burst) return { ok: false, retryMs: windowMs - (now - ts[0]) };
      ts.push(now); seen.delete(k); seen.set(k, ts);
      if (seen.size > maxUsers) seen.delete(seen.keys().next().value);
      return { ok: true };
    },
    reset() { seen.clear(); },
  };
}
