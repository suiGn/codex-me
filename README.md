# Codex .me: chat-controlled overlay on this.me 4.2.1

Twitch chat writes into one .me kernel; the overlay draws the kernel and logs every change with its `explain()` reason.
Scene and spider drawing come from `.me/Demos/Robots/Space` (Oli, Tiko, Lua on B 612 and B 325).

- `overlay/index.html` 1920x1080 OBS browser source, built on .GUI: React 18.3.1 + this.gui 4.2.1 UMD from jsDelivr (SRI-pinned, same loading as Demos/Robots/Space), one spec through `GUI.mount`, theme neurons.me dark, layout ids `GUI.window.layout.bars.{top,left,right,bottom}` and `GUI.window.layout.content`. Needs network for the CDN. `?transparent=1` transparent background, `?dev=0` hides the test box, `?ws=` socket URL (default `ws://localhost:3017/ws`).
- `overlay/commands.js` pure parser + per-user rate limiter. `overlay/space-model.js` is the Space demo model, copied unmodified (one kernel per robot). `overlay/world.js` maps parsed commands onto it and formats explain() reasons.
- `overlay/vendor/this.me-4.2.1.es.js` unmodified npm dist (sha256 `0bd2cc60d15dfc9ff8942d390c075bbc22b4ae3a24d3cbfe581511ea84478757`).
- `node --test test/` unit tests (parser, grammar, rate limit, and the real kernel).
- `node tools/mock-server.mjs` serves the overlay and /ws on :3017; type `user: !walk oli to -1.4` on stdin. `npm run shots` re-renders shots/ with the sim clock in manual mode.
- `node tools/perf.mjs [query] [seconds]` frame timing in headless Chrome under chat load (`THROTTLE=6` for a slow CPU).
- `node tools/latency.mjs [query] [n]` submit-to-visible latency through the dev box (`THROTTLE=4 DPR=2`). `PERF_URL=<url> node tools/perf.mjs` measures another page, e.g. the Space demo.
- `node tools/jitter.mjs [url]` per-frame robot screen positions for 6 s: speed variance, freeze-then-jump frames, stalls (`CHAT=1` adds commands, `THROTTLE`, `DPR`).
- `node tools/shots.mjs` scripted run through /ws with screenshots in `shots/`.
- `SPEC-for-codex.md` the Twitch server Codex builds.

The overlay is served over http (ES modules do not load from file://).
