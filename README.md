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
3. Open the [web demo](http://localhost:3017/overlay/?dev=0). In the configured channel's Twitch chat, use a viewer account such as **jabellae** and type only `!me` (do not append your username). The authorized reply account's messages are ignored to prevent bot loops.
4. Select your bubble. Use its rendered **Stream / Channel / Followers** controls. The separate inspector shows the matching path, raw output, construction script and real explanation. Clicking the scene background clears selection to **Select a node**.
5. Repeat `!me` after three seconds: it reports the same kernel instead of duplicating it. Browser reloads and separate views retain server-owned kernels. **Server restarts clear viewer entries.** The verified suignn channel is bootstrapped automatically; other viewers rejoin explicitly.

## Safe chat syntax

| Command | Result |
|---|---|
| `!me` or `!me new ME()` | Declare your kernel once. |
| `!me me("twitch.profile.login")` | Read a validated path in your own kernel. |
| `!me me.explain("twitch.profile.login")` | Explain that path using the real kernel. |
| `!explain` | Explain `twitch.profile.login`. |

The grammar is an allowlist, never JavaScript evaluation. It does not permit changing ownership, executing arbitrary scripts or editing arbitrary graph facts. Writes have a 3-second gap/five per 30 seconds; reads/explanations have a 1-second gap/ten per 30 seconds. EventSub duplicates are ignored. Legacy Spider creation commands are not supported in the current demo.

## What the graph shows

Each kernel stores four real public Twitch profile fields under `twitch.profile`: `id`, `login`, `displayName`, and `profileImageUrl`. The server imports them from [Get Users](https://dev.twitch.tv/docs/api/reference/#get-users), mapping Twitch's `display_name` and `profile_image_url` to camelCase paths. The verified channel bootstrap uses its Get Users response; a new viewer's `!me` resolves the trusted EventSub user ID through the same API. Profiles are snapshots at declaration, not continuous polling. Failed or mismatched lookups do not create placeholder profiles; the viewer can retry. Concurrent lookups share one bounded, 30-second cache entry per user. Only these public profile fields are imported at declaration; the sections below add their own explicit public-field projections. No email, OAuth credentials or private response fields enter the kernel.

Graph nodes come from public `exportSnapshot().memories`; values are read through `me(path)`. Imported profile values are stored facts, so their actual `me.explain(path)` has no derivation. No rule or dependency edge is fabricated to make this API import look computed. The displayed script contains the exact field declarations used to build that kernel. The diagnostic local address `me://<login>/twitch` identifies a kernel path backed by an API snapshot, not an arbitrary API proxy. In the actual protocol, the authority is a namespace, not automatically a Twitch username: this demo uses the verified Twitch login as a session-local alias. Displaying that alias does not claim/register it in NRP or turn this breadcrumb into a protocol resolver.

The selected kernel's profile header renders its real Twitch avatar, display name and linked login using GUI atoms; the existing Twitch Glitch asset marks the profile and web topbar. Missing avatars fall back to the login initial. These controls remain outside the transparent OBS scene.

The profile and bubble card use the label `@<login>.twitch` with the actual avatar and Twitch logo. This is a local account label, not a claimed protocol namespace or a registered domain. **Stream / Channel / Followers** are always-visible card tabs; Profile facts remain available in the technical inspector. The bubble is a rendered GUI surface: Channel is a labeled form with a human-readable language name and tags; Stream shows live/offline status and live statistics; Followers shows the actual count. The account header itself is the rendered profile, and its Twitch icon opens the channel and has an accessible **Open in Twitch** tooltip; no duplicate profile tab or View on Twitch button is shown. It contains no raw JSON, script or Explain view. Channel, Stream and Followers are API resource choices, not invented kernel facts before loading.

Clicking a bubble opens its controls beside the node, synchronized with the inspector. Both share the selected kernel/path. Focusing a channel field, clicking a follower count or clicking live/offline status selects its matching inspector leaf. Selecting that leaf in the inspector highlights the matching GUI control, without replacing the form. The card initially shows Stream (Live now or Offline); the inspector initially selects the me.twitch root. Closing the card preserves selection. These controls remain outside the transparent OBS source.

The inspector alone presents formatted whole-section JSON or a compact leaf value, with an icon-only Copy action and no surrounding code card. Its code tree starts at **me.twitch**, with **profile / stream / channel / followers** as lowercase property keys instead of category tabs. Expand branches to see actual stored leaves and their values, then select a row to inspect it. The root is a navigation view without a duplicate aggregate output; selecting a branch or leaf reveals its Output, Explain and Script controls. Arrow keys, Home/End and Enter navigate the tree. Branches are UI groupings of real memory paths; unloaded API sections have no fabricated values and are fetched on selection. Long string previews are truncated in the tree, while selecting the leaf exposes its complete value. It automatically reads `me(path)` from the existing server kernel. Compact **Explain / Script** controls below the output show the actual `me.explain(path)` JSON or the complete construction source, including expression, derivation and metadata from this.me 4.2.1. Tab selection persists across paths and kernels; obsolete query results are hidden. Explain is initially selected; arrow keys and Home/End navigate the tabs. Native GUI syntax highlighting is preserved without code-block headers, borders or backgrounds; copy actions use the overlapping-squares icon with accessible tooltips. Explain presents the matching syntax directly on the inspector background. Its compact **L…** link identifies the original source line(s), and the **{}** icon reveals the unmodified native explanation only when requested. The location link (**View in Script** to assistive technology) opens the complete, numbered script and scrolls to the highlighted declaration. Locations refer to the currently displayed reproducible construction script; they are not native VM execution frames or historical call stacks. Unrelated profile/section declarations are omitted from the Explain excerpt. The construction script is not re-executed, and arbitrary code/eval is not accepted. This object inspector is separate from GUI's general interface inspector and browser DOM developer tools. Face following changes presentation only.

### Permissions and optional channel editing

This is a local broadcaster companion. Permissions come from the **Twitch account authenticated with this app**, not the account signed into an embedded twitch.tv chat window. It is not a hosted multi-user authentication system. Other viewers' channel forms are read-only. A moderator badge alone does not authorize editing channel information through this API.

For your own kernel, the form initially says **Your channel · read access**. **Authorize channel editing** explicitly requests the additional `channel:manage:broadcast` scope through Twitch OAuth; basic login keeps only the original chat scopes. The upgrade requires the same Twitch user ID and preserves the existing session if it is declined or the account does not match. No permission is granted automatically.

After the owner authorizes the scope, Stream title and Language become editable. **Save to Twitch** sends only changed fields through the server to [Modify Channel Information](https://dev.twitch.tv/docs/api/reference#modify-channel-information), `PATCH /helix/channels`; its `broadcaster_id` must match the token user ID. Category and tags remain read-only in this version. **Cancel** discards local drafts. Server checks enforce ownership, verified scopes, exact local Origin, CSRF, an explicit field allowlist and value limits. OAuth credentials never reach the browser. A successful save reloads public channel data into the same kernel so Output, Script and Explain reflect Twitch's response. Failed reads after a successful update are distinguished from failed writes.

To reproduce: select your bubble → Channel → Authorize channel editing → approve on Twitch with the same account → reopen the demo → edit title/language → Save to Twitch. This changes the real channel only when you submit Save. The automated save proof uses simulated Twitch; real editing has not been exercised or authorized by the agent.


### Public Twitch sections

Opening a section reads its actual data through the server, imports whitelisted values into that user's existing this.me kernel, then makes the fields navigable. Only the currently selected section refreshes, approximately every 30 seconds after the previous request completes while the page is visible. Concurrent requests share a server job and successful/failed requests are cached for 30 seconds. Reading these public sections needs no additional OAuth scope; optional owner editing uses the separate authorization above.

| Section | Kernel fields | Twitch source |
|---|---|---|
| Channel | `twitch.channel.title`, `.category`, `.language`, `.tags` | [Get Channel Information](https://dev.twitch.tv/docs/api/reference/#get-channel-information) |
| Stream | `twitch.stream.live`, `.title`, `.category`, `.viewers`, `.startedAt` | [Get Streams](https://dev.twitch.tv/docs/api/reference/#get-streams) |
| Followers | `twitch.followers.total` | [Get Channel Followers](https://dev.twitch.tv/docs/api/reference/#get-channel-followers), total only |
| Profile | `twitch.profile.id`, `.login`, `.displayName`, `.profileImageUrl` | Get Users at declaration |

Stream `live` is normalized by the adapter from the presence of a matching stream in a successful API response. Successful empty stream data means offline, with live-only fields cleared to `null`. It is imported as a stored fact, not represented as a fabricated kernel derivation. API errors are displayed as unavailable; they never manufacture offline or a zero follower count. Followers imports only `total`, never follower identities. Its public count works with the existing authorization; detailed follower lists would require additional authorization and are outside this change.

Output and Explain use the real kernel reads/traces of imported fields, refreshing when new API data arrives. Whole-section output is an explicit UI projection: it collects real leaf `me(path)` results into one object, and whole-section Explain collects each real `me.explain(path)` trace. It does not fabricate a native namespace read or namespace-level explanation. Single-field views still show the exact native result. Script shows the current reproducible declarations, not a growing polling history. Section loading/status timestamps are transport metadata, not synthetic graph facts. Unloaded fields are absent; chat reads inspect the currently imported state.

## Chat, web and OBS

**Twitch** (the same official wordmark used on the landing, with light/dark variants) opens the official chat iframe beside the scene, using the configured channel and `parent=localhost`. **Inspector** returns to the selected kernel. The wordmark appears only on the top panel selector. A compact channel profile row below it shows the real avatar, linked login and a Twitch Glitch icon with an Open in Twitch tooltip; lengthy instructions are omitted. The channel row identifies the channel, not the independent twitch.tv viewer login. The panel uses GUI theme tokens; dark mode requests Twitch's native dark chat with `darkpopout=1`. The iframe retains Twitch's fonts/palette, and changing mode reloads it. Light mode uses Twitch's saved/default appearance. Browser theme preferences and Twitch login sessions are independent between browsers.

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
node --test tools/twitch-sections-check.mjs
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' CHECK_PORT=3018 node tools/kernel-check.mjs
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' CHECK_PORT=3018 node tools/face-check.mjs
```

Run checks sequentially on a free check port. The original ten tests remain unchanged. Server tests use fake Twitch HTTP/EventSub; kernel graph tests use actual pinned kernels, real local sockets and browser rendering with simulated Twitch. They verify imported public Twitch fields against kernel reads, real stored-fact traces, viewer isolation, no robot rendering, node explanations, empty selection, synchronization, reloads and threaded replies. [Kernel evidence](evidence/kernels/) and synthetic face evidence are labeled offline. They do not prove a new real Twitch command was sent after this pivot. Earlier Spider browser checks describe the historical product stage.

`npm run mock` and the original Space model/parser/tests are preserved. The old Space view is available at `/overlay/?demo=space&dev=0`. No changes were made to the this.me kernel, claims, NRP, GUI package, Netget or unrelated services.

## Local endpoints

- `GET /`, `/auth/login`, `/auth/callback`; `POST /auth/logout` (same-origin CSRF): setup/authentication. Logout removes local tokens and disconnects chat; it does not log out twitch.tv or revoke Twitch's application grant.
- `GET /healthz`, `/api/status`: connection/public profile status, without credentials.
- `GET /api/kernels/:id/query?path=twitch.profile.login&operation=run|explain`: read-only query of an existing public leaf; returns `{output: ...}`. Invalid operations/paths return 400; missing kernels/leaves return 404.
- `GET /api/kernels/:id/sections/channel|stream|followers`: load/cache a public section for an existing kernel; unavailable upstream data returns 502 without fabricated values.
- `GET /api/kernels/:id/permissions`: local token ownership and editing capability; no OAuth credentials.
- `PATCH /api/kernels/:id/channel`: owner-only title/language update with scope, Origin and CSRF checks.
- `GET /api/kernels`: `{type:"kernels",kernels:[...]}` with public graph/script/explanation projections.
- `/ws`: views send `{type:"hello",role:"overlay",version:1,view:"kernels"}` and receive kernel snapshots and transient face positions.
- `POST /api/face`: validated local position relay, not a camera upload.
- `/overlay/`, `/ui/`: public app assets. Legacy `/api/spiders` and the Space transport remain for compatibility; they are not the current product interface.
