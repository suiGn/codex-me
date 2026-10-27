// Dev stand-in for the Codex server's /ws side only (no Twitch). Serves overlay/ on :3017 and lets you
// type chat lines on stdin as "user: text"; prints the overlay's replies. Not the real server: see SPEC-for-codex.md.
import http from "node:http"; import { readFile } from "node:fs/promises"; import { extname, join, normalize } from "node:path";
import { WebSocketServer } from "ws"; import readline from "node:readline";
const ROOT = new URL("../overlay/", import.meta.url).pathname, PORT = +(process.env.PORT || 3017);
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
const srv = http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://x");
  if (u.pathname === "/overlay" || u.pathname === "/") { res.writeHead(301, { location: "/overlay/" + u.search }).end(); return; }   // relative ./overlay.js needs the slash
  const p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  const f = join(ROOT, p.replace(/^\/overlay(\/|$)/, "/").replace(/\/$/, "/index.html"));
  if (!f.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  let body; try { body = await readFile(f); } catch { res.writeHead(404).end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" }).end(body);
});
const wss = new WebSocketServer({ server: srv, path: "/ws" }); let n = 0;
wss.on("connection", (s) => s.on("message", (d) => console.log("overlay>", d.toString())));
export const broadcast = (m) => { for (const c of wss.clients) if (c.readyState === 1) c.send(JSON.stringify(m)); };
srv.listen(PORT, () => console.log(`mock on http://localhost:${PORT}/overlay/  ws://localhost:${PORT}/ws`));
readline.createInterface({ input: process.stdin }).on("line", (l) => { const m = /^(\w+):\s*(.*)$/.exec(l); if (m) broadcast({ type: "chat", id: `mock-${++n}`, user: m[1], text: m[2], isMod: false, isBroadcaster: m[1] === "broadcaster" }); });
