# Codex .me

**A .me kernel and a knowledge graph that explains itself.**

Twitch viewers type `!me` to create their own independent **this.me 4.2.1** kernel. A native **this.gui 4.2.1** bubble represents each kernel. Select a bubble to explore its public facts, dependency graph, actual construction script and real `explain()` results. Select a graph node to see why it has its value. No node is selected automatically.

The current demo contains only .me kernels and their graphs. Robot bodies and the psyche/body narrative were removed at the owner's request. Codex builds the project; the product does not use an LLM or require AI API keys.

## Built with Codex in this session

Creator: **Abella E. (suign)**, creator of neurons.me and this.me. GitHub: **suiGn**. Twitch channel: **suignn** (display name suiGnn); viewer test account: **jabellae**.

**Submission session ID: `01a17f67-001b-7681-bb9f-ecc477f091a5`.** This is the dedicated project's Codex session; an earlier conversation ID is not evidence of work here.

**Preexisting work:** the original Space demo, unchanged vendored this.me 4.2.1 kernel/model, chat parser/rate limiter, ten original tests, mock server, SPEC-for-codex.md and environment template. These were not created in this session.

**Built here with Codex:** Node/Express/ws Twitch OAuth and token refresh, EventSub, replies through Send Chat Message, .GUI setup/profile/logout/theme UI, web/OBS views, local camera tracking using existing GUI hooks, and the current per-user kernel registry, real graph projection, selectable explanations and highlighted scripts. The Space and Spider stages are historical: [Space documentation](docs/SPACE-LEGACY.md), [Spider-stage documentation](docs/SPIDERS-LEGACY.md). [Session evidence](evidence/SESSION.md) distinguishes offline checks from actual live observations.

## Run locally

```sh
npm install
cp .env.example .env  # only if .env does not already exist
npm start
```

Fill `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `TWITCH_CHANNEL` locally in `.env`; do not put secrets in chat. The registered redirect is exactly `http://localhost:3017/auth/callback`. `.env` and `.tokens.json` are ignored. The server never sends the client secret or tokens to the browser, saves tokens privately and refreshes them when needed.

1. Ensure :3017 is free. Stop `npm run mock` if it is using that port. Other local services are unrelated and should remain untouched.
2. Open [Stream setup](http://localhost:3017/) and **Connect with Twitch** (`/auth/login`). OAuth uses state and `user:read:chat user:write:chat`. OBS's Twitch account connection is separate.
3. Open the [web demo](http://localhost:3017/overlay/?dev=0). In the configured channel's Twitch chat, use a viewer account such as **jabellae** and type `!me`. The authorized reply account's messages are ignored to prevent bot loops.
4. Select your bubble. Inspect **Knowledge graph**, choose a fact/rule node, and read its real explanation and script. Clicking the scene background clears selection to **Select a node**.
5. Repeat `!me` after three seconds: it reports the same kernel instead of duplicating it. Browser reloads and separate views retain server-owned kernels. **Server restarts clear viewer entries.** The verified suignn channel is bootstrapped automatically; other viewers rejoin explicitly.

## Safe chat syntax

| Command | Result |
|---|---|
| `!me` or `!me new ME()` | Declare your kernel once. |
| `!me me("identity.owner")` | Read a validated path in your own kernel. |
| `!me me.explain("identity.present")` | Explain that path using the real kernel. |
| `!explain` | Explain `identity.present`. |

The grammar is an allowlist, never JavaScript evaluation. It does not permit changing ownership, executing arbitrary scripts or editing arbitrary graph facts. Writes have a 3-second gap/five per 30 seconds; reads/explanations have a 1-second gap/ten per 30 seconds. EventSub duplicates are ignored. Legacy Spider creation commands are not supported in the current demo.

## What the graph shows

The initial kernel has `identity.owner`, `identity.createdAt`, `identity.registered` and `identity.present`. The last value is derived by the actual `registered` rule. Graph nodes come from public `exportSnapshot().memories`; their displayed values are read through `me(path)`. Dependency edges come from `me.explain(path).derivation.inputs`, not from an inferred model or fabricated graph. For example, `identity.registered → identity.present` is a real dependency. This first graph is intentionally small.

The inspector shows one explanation at a time. **View script** is collapsed by default to avoid repeating the graph; it uses the existing GUI `CodeBlock` for the actual JavaScript construction script. The object inspector is separate from GUI's general semantic/interface inspector and browser DOM developer tools. Selecting graph nodes only reads state; it does not execute or rewrite scripts. Face following changes presentation only and does not invent kernel facts or explanation results.

## Chat, web and OBS

**Twitch chat** opens the official chat iframe beside the scene, using the configured channel and `parent=localhost`. **Inspector** returns to the selected kernel. The panel uses GUI theme tokens; dark mode requests Twitch's native dark chat with `darkpopout=1`. The iframe retains Twitch's fonts/palette, and changing mode reloads it. Light mode uses Twitch's saved/default appearance. Browser theme preferences and Twitch login sessions are independent between browsers.

Twitch may disable embedded typing for owners/moderators if it considers the frame obscured. **Open chat window** provides the official standalone popout; this was separately verified to expose an editable composer. A later owner report confirmed their chat was loading correctly. The responsive web viewport and theme-menu placement avoid the layout clipping previously found. No custom bypass of Twitch's visibility checks is used.

The [OBS source](http://localhost:3017/overlay/?transparent=1&dev=0) is a fixed **1920×1080 transparent scene with .me bubbles only**: no chat, topbar or inspector. Add it as an OBS Browser source at those dimensions, above the camera/game source. Refresh that source after app updates. This page alone does not broadcast. Start Streaming in OBS to publish the composition to Twitch; going live requires the owner's authorization. Chat and the local demo work while the channel is offline. The app does not currently embed Twitch's video player.

Earlier live broadcasts verified camera/overlay compositing, but also showed severe network frame loss. Reducing scene complexity does not establish that the upload issue is resolved. See [measured lag evidence](evidence/lag-diagnosis/result.json).

## Optional face tracking

In Stream setup, **Start face tracking** requests the local camera; **Stop tracking** releases it. Existing GUI `useFaceLandmarker`/`useFaceOverlay` hooks publish a forehead anchor that moves the channel owner's .me bubble. Detection runs locally at about six checks/second; only transient `{x,y,aspect}` goes to the loopback server with origin/CSRF/session checks. No images, audio or identity templates are uploaded or persisted. No face verification endpoint is called. Hook source, hashes, license and reproducible build instructions are under `ui/vendor/face/` and `tools/build-face-vendor.mjs` (TypeScript 5.9.3).

The mapping assumes the same camera centered and fitted inside OBS's 1920×1080 canvas, without crop or mirroring. Custom camera transforms are not calibrated. Real camera tracking/alignment remains unverified; synthetic checks are not live camera evidence. Camera access and model/WASM downloads depend on browser permissions and network availability. Loading media without a camera stream is displayed as waiting for camera access.

## Verification and evidence

```sh
npm test
CHECK_PORT=3018 npm run check:server
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' CHECK_PORT=3018 node tools/kernel-check.mjs
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' CHECK_PORT=3018 node tools/face-check.mjs
```

Run checks sequentially on a free check port. The original ten tests remain unchanged. Server tests use fake Twitch HTTP/EventSub; kernel graph tests use actual pinned kernels, real local sockets and browser rendering with simulated Twitch. They verify graph values against kernel reads, actual dependency inputs, viewer isolation, no robot rendering, node explanations, empty selection, synchronization, reloads and threaded replies. [Kernel evidence](evidence/kernels/) and synthetic face evidence are labeled offline. They do not prove a new real Twitch command was sent after this pivot. Earlier Spider browser checks describe the historical product stage.

`npm run mock` and the original Space model/parser/tests are preserved. The old Space view is available at `/overlay/?demo=space&dev=0`. No changes were made to the this.me kernel, claims, NRP, GUI package, Netget or unrelated services.

## Local endpoints

- `GET /`, `/auth/login`, `/auth/callback`; `POST /auth/logout` (same-origin CSRF): setup/authentication. Logout removes local tokens and disconnects chat; it does not log out twitch.tv or revoke Twitch's application grant.
- `GET /healthz`, `/api/status`: connection/public profile status, without credentials.
- `GET /api/kernels`: `{type:"kernels",kernels:[...]}` with public graph/script/explanation projections.
- `/ws`: views send `{type:"hello",role:"overlay",version:1,view:"kernels"}` and receive kernel snapshots and transient face positions.
- `POST /api/face`: validated local position relay, not a camera upload.
- `/overlay/`, `/ui/`: public app assets. Legacy `/api/spiders` and the Space transport remain for compatibility; they are not the current product interface.
