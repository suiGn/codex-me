# Codex .me

A deterministic, reactive knowledge graph for Twitch, with a live overlay.

Viewers type `!me` in chat and each one gets their own graph, shown as a bubble on stream. Each graph contains its viewer's Twitch data (profile, stream, channel, followers). The streamer's graph also receives local face-tracking data. Rules recompute affected values, and every derived value can explain why it has that value. For example, `stream.focus` turns true when the streamer's face is centered, and `explain()` shows it came from `face.x = 0.53`.

Everything runs locally on the streamer's machine. No LLM at runtime, no AI keys. Built with Codex in this session.

## Built with Codex in this session

Creator: **Abella E. (suign)**, creator of neurons.me and this.me. GitHub: **suiGn**. Twitch channel: **suignn** (display name suiGnn); viewer test account: **jabellae**.

**Submission session ID: `01a17f67-001b-7681-bb9f-ecc477f091a5`.** This is the dedicated project's Codex session; an earlier conversation ID is not evidence of work here.

**Preexisting work:** the original Space demo, unchanged vendored this.me 4.2.1 kernel/model, chat parser/rate limiter, ten original tests, mock server, SPEC-for-codex.md and environment template. These were not created in this session.

**Built here with Codex:** Node/Express/ws Twitch OAuth and token refresh, EventSub, replies through Send Chat Message, .GUI setup/profile/logout/theme UI, web/OBS views, local OBS WebSocket controls, local camera tracking using existing GUI hooks, and the current per-user kernel registry, real graph projection, selectable explanations and highlighted scripts. The Space and Spider stages are historical: [Space documentation](docs/SPACE-LEGACY.md), [Spider-stage documentation](docs/SPIDERS-LEGACY.md). [Session evidence](evidence/SESSION.md) distinguishes offline checks from actual live observations.

## Run locally

Requirements: Node.js 24 (the version used for project checks), npm, and your own Twitch developer application with a confidential client. OBS Studio is needed to broadcast the transparent overlay; it is not needed to inspect the web app.

```sh
git clone https://github.com/suiGn/codex-me.git
cd codex-me
npm install
# Keep an existing .env; otherwise create it from the example.
[ -f .env ] || cp .env.example .env
```

Before starting, fill `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `TWITCH_CHANNEL`, and `TWITCH_REDIRECT_URI` locally in `.env`. Register the exact redirect `http://localhost:3017/auth/callback` in your Twitch application's OAuth settings. Use the login of the channel you want to connect. Never paste credentials into chat or commit them. `.env` and `.tokens.json` are ignored; the server keeps OAuth tokens locally and refreshes them when needed. Client secrets and tokens are never sent to the browser.

Ensure port 3017 is free, then run:

```sh
npm start
```

Open http://localhost:3017/ and connect your Twitch account. The detailed web/OBS flow follows below.

1. Ensure :3017 is free. Stop `npm run mock` if it is using that port. Other local services are unrelated and should remain untouched.
2. Open [Stream setup](http://localhost:3017/) and **Connect with Twitch** (`/auth/login`). OAuth uses state and `user:read:chat user:write:chat`. OBS's Twitch account connection is separate.
3. Open the [web demo](http://localhost:3017/overlay/?dev=0). In the configured channel's Twitch chat, use a viewer account such as **jabellae** and type only `!me` (do not append your username). The authorized reply account's messages are ignored to prevent bot loops.
4. Select your bubble. Use its rendered **Stream / Channel / Followers** controls. The separate inspector shows the matching path, raw output, construction script and real explanation. Clicking the scene background clears selection to **Select a node**.
5. Repeat `!me` after three seconds: it reports the same kernel instead of duplicating it. Browser reloads and separate views retain server-owned kernels. **Server restarts clear viewer entries.** The verified suignn channel is bootstrapped automatically; other viewers rejoin explicitly.

## Face-driven graph rule

Only the configured channel owner's kernel includes camera facts and this fixed native rule:

```js
me["="]("stream.focus", "face.x > 0.4 && face.x < 0.6");
```

`face.x` is the streamer's trusted, read-only horizontal camera coordinate. These camera paths are not copied into viewers' kernels. With tracking active, the rule is true strictly between 0.4 and 0.6 and false outside that band. This indicates framing, not psychological attention. Without a face, the native kernel result is undefined because the input is missing; the app does not invent false. The inspector's `stream.focus` node lights green when true, and a small focus readout appears beside the bubble in both web/OBS views. Native `explain()` exposes the actual `face.x` dependency and value. No arbitrary chat expressions or additional camera/OBS privileges were added.

To demonstrate: **Settings → Face tracking → Start face tracking**, then **Settings → Inspector**, select your bubble and **stream → focus**, and move into/out of the center band. Use **Explain JSON** for the complete native trace. The streamer's selection shares this result with OBS. Viewer chat commands explain only the viewer's own Twitch data; they do not read the streamer's camera as their own. Broadcasting still requires the user's own OBS action. Face facts update at the existing twice-per-second graph cadence.

Offline verification: `CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' CHECK_PORT=3018 node tools/focus-check.mjs`.

## Live chat demo

| Command | Result |
|---|---|
| `!me` | Declare your independent kernel and present your own Twitch profile on stream. |
| `!me leave` | Remove only your own session kernel and orb. Join again with `!me`. |
| `!me read twitch.profile.login` | Read your verified Twitch login. |
| `!me explain twitch.profile.login` | Explain your own verified Twitch login. |
| `!explain` | Explain your own Twitch login by default; the channel owner defaults to focus. |
| `!me me("twitch.profile.login")` | Existing validated read syntax. |
| `!me me.explain("twitch.profile.login")` | Existing validated explanation syntax. |

Viewer kernels contain their own `twitch` data only. The channel owner's kernel additionally contains `face` and `stream.focus`. Identity binding uses Twitch's verified channel ID, not a chat-supplied username. A viewer must not inherit the streamer's camera coordinates, rule or focus badge; entering chat does not start their own camera. Legacy `enabled`, `energy`, `active`, on/off, set and rule-template commands have been removed. Chat declares, reads and explains; it cannot overwrite imported facts or the fixed face rule, execute JavaScript, enable a camera or start a broadcast.

Declaration, leave and invalid-command attempts retain the 3-second gap/five-per-30-second limit per stable Twitch user ID; reads/explanations retain a 1-second gap/ten-per-30-second limit. Commands target the sender's kernel. Maximum 64 session kernels. EventSub duplicates and the reply account's own messages are ignored. Legacy Spider creation commands remain unsupported.

## Shared presentation: app → OBS → Twitch

Open a bubble in the web app and select a public fact or branch. The authenticated channel owner's selection is relayed by the localhost:3017 server to all kernel views, including a separately loaded transparent OBS source. For Twitch resources, that source uses the same profile and Stream / Channel / Followers card component as the web app, with editing disabled. Live kernel paths display their actual value and native `explain()` reason and dependency values. Closing the bubble clears the presentation. The web app retains editing controls; the shared Twitch card contains server-confirmed public values only, never unsaved edits, credentials or a DOM capture.

Viewer commands declare/present only their own kernel. Declaration/read/explain requests can place it on stream for 15 seconds. Shared chat presentations have a global two-second gap; host selections take priority for three seconds. Host presentation writes require the authenticated broadcaster, exact Origin and CSRF; WebSocket clients cannot publish arbitrary presentation payloads. New OBS connections receive the current presentation immediately. More than six selected leaves are summarized in the broadcast card; all paths remain inspectable in the app.

`face.present`, `face.x` and `face.y` are trusted read-only facts about the **streamer's tracked face**, stored only in the channel owner's kernel. Viewers' kernels do not contain these paths or `stream.focus`. Positions are normalized and rounded to two decimals; lost/stopped/stale tracking sets presence false and coordinates null. No chat command can enable a camera, change these facts or start a broadcast. Optical display points remain transient outside the kernel.

Camera inputs refresh at most twice per second, unchanged facts are not rewritten, and the runtime periodically reconstructs each kernel from current facts and native rule expressions to bound internal write history. This uses public this.me construction/read/explain APIs and preserves the public state/rules; it is not a persistent event history or a modified kernel. Server restart clears session data.

## What the graph shows

Each kernel stores four real public Twitch profile fields under `twitch.profile`: `id`, `login`, `displayName`, and `profileImageUrl`. The server imports them from [Get Users](https://dev.twitch.tv/docs/api/reference/#get-users), mapping Twitch's `display_name` and `profile_image_url` to camelCase paths. The verified channel bootstrap uses its Get Users response; a new viewer's `!me` resolves the trusted EventSub user ID through the same API. Profiles are snapshots at declaration, not continuous polling. Failed or mismatched lookups do not create placeholder profiles; the viewer can retry. Concurrent lookups share one bounded, 30-second cache entry per user. These public profile fields accompany the live facts and rule above; the sections below add explicit public-field projections. No email, OAuth credentials or private response fields enter the kernel.

Graph nodes come from public `exportSnapshot().memories`; values are read through `me(path)`. Imported profile values are stored facts, so their actual `me.explain(path)` has no derivation. No rule or dependency edge is fabricated to make this API import look computed. The displayed script contains the exact field declarations used to build that kernel. The diagnostic local address `me://<login>/twitch` identifies a kernel path backed by an API snapshot, not an arbitrary API proxy. In the actual protocol, the authority is a namespace, not automatically a Twitch username: this demo uses the verified Twitch login as a session-local alias. Displaying that alias does not claim/register it in NRP or turn this breadcrumb into a protocol resolver.

The selected kernel's profile header renders its real Twitch avatar, display name and linked login using GUI atoms; the existing Twitch Glitch asset marks the profile and web topbar. Missing avatars fall back to the login initial. These controls remain outside the transparent OBS scene.

The profile and bubble card use the label `@<login>.twitch` with the actual avatar and Twitch logo. This is a local account label, not a claimed protocol namespace or a registered domain. **Stream / Channel / Followers** are always-visible card tabs; Profile facts remain available in the technical inspector. The bubble is a rendered GUI surface: Channel is a labeled form with a human-readable language name and tags; Stream shows live/offline status and live statistics; Followers shows the actual count. The account header itself is the rendered profile, and its Twitch icon opens the channel and has an accessible **Open in Twitch** tooltip; no duplicate profile tab or View on Twitch button is shown. Twitch resource forms retain their rendered GUI presentation; live facts expose their native output and explanation. Channel, Stream and Followers are API resource choices, not invented kernel facts before loading.

Clicking a bubble opens its controls beside the node, synchronized with the inspector. Both share the selected kernel/path. Clicking or focusing a channel field, selecting tags, a profile avatar/display name, a follower count or any available live-stream value selects its matching inspector leaf. The matching rendered control receives a theme-colored outline. Selecting a branch or leaf in the inspector also reopens the selected node’s card if closed, without moving keyboard focus or changing the active sidebar. Selecting a profile ID highlights its account header; no extra ID field is added to the GUI. The bubble card retains its original profile and Stream / Channel / Followers UI, initially showing Stream. Live facts and rule code stay in the Inspector; they are not added to the bubble card. The inspector tree begins at me and includes twitch, plus face and stream.focus only for the camera owner. Closing the card preserves selection. Editing controls remain outside the transparent OBS source; the selected public value and reason are shared through the presentation card.

The inspector alone presents formatted whole-section JSON or a compact leaf value, with an icon-only Copy action and no surrounding code card. Its code tree starts at **me**, including the live graph and **twitch** branch, with **profile / stream / channel / followers** as lowercase property keys instead of category tabs. Expand branches to see actual stored leaves and their values, then select a row to inspect it. The root is a navigation view without a duplicate aggregate output; selecting a branch or leaf reveals its Output, Explain and Script controls. Arrow keys, Home/End and Enter navigate the tree. Branches are UI groupings of real memory paths; unloaded API sections have no fabricated values and are fetched on selection. Long string previews are truncated in the tree, while selecting the leaf exposes its complete value. It automatically reads `me(path)` from the existing server kernel. Compact **Explain / Script** controls below the output show the actual `me.explain(path)` JSON or the complete construction source, including expression, derivation and metadata from this.me 4.2.1. Tab selection persists across paths and kernels; obsolete query results are hidden. Explain is initially selected; arrow keys and Home/End navigate the tabs. Native GUI syntax highlighting is preserved without code-block headers, borders or backgrounds; copy actions use the overlapping-squares icon with accessible tooltips. Explain presents the matching syntax directly on the inspector background. Its compact **L…** link identifies the original source line(s), and the **{}** icon reveals the unmodified native explanation only when requested. The location link (**View in Script** to assistive technology) opens the complete, numbered script and scrolls to the highlighted declaration. Locations refer to the currently displayed reproducible construction script; they are not native VM execution frames or historical call stacks. Unrelated profile/section declarations are omitted from the Explain excerpt. The construction script is not re-executed, and arbitrary code/eval is not accepted. This object inspector is separate from GUI's general interface inspector and browser DOM developer tools. Face following changes presentation only. Bubble sizes use a larger resting cap (3.6) and tracking scale (2.8), with density limits and proportional frame margins to keep the scene readable.

### Permissions and optional channel editing

This is a local broadcaster companion. Permissions come from the **Twitch account authenticated with this app**, not the account signed into an embedded twitch.tv chat window. It is not a hosted multi-user authentication system. Other viewers' channel forms are read-only. A moderator badge alone does not authorize editing channel information through this API.

For your own kernel, the form initially says **Your channel · read access**. **Authorize channel editing** explicitly requests the additional `channel:manage:broadcast` scope through Twitch OAuth; basic login keeps only the original chat scopes. The upgrade requires the same Twitch user ID and preserves the existing session if it is declined or the account does not match. No permission is granted automatically.

After the owner authorizes the scope, Title, Category and Language become editable. **Save to Twitch** sends only changed fields through the server to [Modify Channel Information](https://dev.twitch.tv/docs/api/reference#modify-channel-information), `PATCH /helix/channels`; its `broadcaster_id` must match the token user ID. Category uses a debounced [Search Categories](https://dev.twitch.tv/docs/api/reference#search-categories) picker. Select a Twitch result before saving; the server verifies its numeric game_id through Get Games before sending the PATCH. Clearing the category sends game_id=0. Search results contain only public id/name fields, with bounded 30-second caching. Tags remain read-only. **Cancel** discards local drafts. Server checks enforce ownership, verified scopes, exact local Origin, CSRF, an explicit field allowlist and value limits. OAuth credentials never reach the browser. A successful save reloads public channel data into the same kernel so Output, Script and Explain reflect Twitch's response. Failed reads after a successful update are distinguished from failed writes.

To reproduce: select your bubble → Channel → Authorize channel editing → approve on Twitch with the same account → reopen the demo → edit title/language or search and select a category → Save to Twitch. This changes the real channel only when you submit Save. The automated save proof uses simulated Twitch; real editing has not been exercised or authorized by the agent.


### Public Twitch sections

Opening a section reads its actual data through the server, imports whitelisted values into that user's existing this.me kernel, then makes the fields navigable. Only the currently selected section refreshes while visible: Stream about every five seconds, Channel and Followers every 30 seconds after the previous request completes. Concurrent requests share a server job; successful/failed requests use the same per-section cache interval. Returning to the tab also refreshes the visible section. Reading these public sections needs no additional OAuth scope; optional owner editing uses the separate authorization above.

| Section | Kernel fields | Twitch source |
|---|---|---|
| Channel | `twitch.channel.title`, `.category`, `.language`, `.tags` | [Get Channel Information](https://dev.twitch.tv/docs/api/reference/#get-channel-information) |
| Stream | `twitch.stream.live`, `.title`, `.category`, `.viewers`, `.startedAt` | [Get Streams](https://dev.twitch.tv/docs/api/reference/#get-streams) |
| Followers | `twitch.followers.total` | [Get Channel Followers](https://dev.twitch.tv/docs/api/reference/#get-channel-followers), total only |
| Profile | `twitch.profile.id`, `.login`, `.displayName`, `.profileImageUrl` | Get Users at declaration |

Channel contains persistent broadcast settings, which can be edited while offline. Stream describes an active broadcast; title/category overlap with channel settings when live, while viewers and startedAt belong to that broadcast. Stream `live` is normalized by the adapter from the presence of a matching stream in a successful API response. Successful empty stream data means offline, with live-only fields cleared to `null` in the kernel. Unavailable stream properties are hidden in the rendered card and inspector tree/section projections until they have actual values; false and zero remain valid visible values. The complete construction script still reflects the true stored facts. It is imported as a stored fact, not represented as a fabricated kernel derivation. API errors are displayed as unavailable; they never manufacture offline or a zero follower count. Followers imports only `total`, never follower identities. Its public count works with the existing authorization; detailed follower lists would require additional authorization and are outside this change.

Output and Explain use the real kernel reads/traces of imported fields, refreshing when new API data arrives. Whole-section output is an explicit UI projection: it collects real leaf `me(path)` results into one object, and whole-section Explain collects each real `me.explain(path)` trace. It does not fabricate a native namespace read or namespace-level explanation. Single-field views still show the exact native result. Script shows the current reproducible declarations, not a growing polling history. Section loading/status timestamps are transport metadata, not synthetic graph facts. Unloaded fields are absent; chat reads inspect the currently imported state.

## Chat, web and OBS

**Twitch** (the same official wordmark used on the landing, with light/dark variants) opens the official chat iframe beside the scene, using the configured channel and `parent=localhost`. **Inspector** opens the selected kernel only when explicitly clicked. Twitch is the initial panel; clicking a bubble, changing a card section or selecting a GUI field preserves the active panel and chat iframe. Native inspector read/explain queries pause while its panel is hidden. GUI data loading still serves visible card controls; section polling stops when both the card and inspector are hidden. The wordmark appears only on the top panel selector. A compact channel profile row below it shows the real avatar, linked login and a Twitch Glitch icon with an Open in Twitch tooltip; lengthy instructions are omitted. The channel row identifies the channel, not the independent twitch.tv viewer login. The panel uses GUI theme tokens; dark mode requests Twitch's native dark chat with `darkpopout=1`. The iframe retains Twitch's fonts/palette, and changing mode reloads it. Light mode uses Twitch's saved/default appearance. Browser theme preferences and Twitch login sessions are independent between browsers.

Twitch may disable embedded typing for owners/moderators if it considers the frame obscured. The **Open in Twitch** chat icon provides the official standalone popout; this was separately verified to expose an editable composer. A later owner report confirmed their chat was loading correctly. The responsive web viewport and theme-menu placement avoid the layout clipping previously found. No custom bypass of Twitch's visibility checks is used.

The [OBS source](http://localhost:3017/overlay/?transparent=1&dev=0) is a fixed **1920×1080 transparent scene with .me bubbles only**: no chat, topbar or inspector. Add it as an OBS Browser source at those dimensions, above the camera/game source. Refresh that source after app updates. This page alone does not broadcast. Start Streaming in OBS, or use the connected OBS controls in this app, to publish the composition to Twitch; going live requires the owner's authorization. Chat and the local demo work while the channel is offline. The app does not currently embed Twitch's video player.

Earlier live broadcasts verified camera/overlay compositing, but also showed severe network frame loss. Reducing scene complexity does not establish that the upload issue is resolved. See [measured lag evidence](evidence/lag-diagnosis/result.json).

## OBS controls in the app

Open **Settings → OBS** in the demo, or the OBS Studio panel in Stream setup. OBS must remain installed and running. The app controls its configured output; it does not embed the OBS application, select a streaming destination, add sources or replace the encoder.

1. In OBS, open **Tools → WebSocket Server Settings** and enable the server. Keep authentication enabled. Note its port (normally 4455) and password.
2. In this app’s OBS panel, enter that port and password locally and click **Connect OBS**. Do not paste the password into chat. Optional `.env` defaults are `OBS_WEBSOCKET_PORT` and `OBS_WEBSOCKET_PASSWORD`; changing them requires restarting this app. Passwords entered in the form remain in memory and are cleared from the form after connection.
3. Check the current program scene and **Show preview**. This is a manual 640px JPEG snapshot, not a continuous video player. It is relayed locally and is not saved by the app. **Refresh preview** updates it.
4. **Start streaming** and **Stop streaming** send one explicit command to OBS. Connecting, polling or previewing never starts a stream. **Disconnect controls**, logging out and closing this app leave an existing OBS broadcast running.

The backend implements [OBS WebSocket v5](https://github.com/obsproject/obs-websocket/blob/master/docs/generated/protocol.md), including SHA-256 challenge-response authentication, request timeouts and a narrow request allowlist. Connections are fixed to `127.0.0.1` with a validated local port; no browser-provided host, arbitrary RPC or stream keys are accepted. Controls require the authenticated channel owner plus local Origin/CSRF checks. OBS credentials are never returned in status responses or logs. This follows the existing local companion authorization model, not hosted multi-user sessions.

**OBS status** reports its output directly while connected. **Twitch Stream** reports what Twitch’s API confirms; the two can differ during ingest startup, reconnects or network trouble. Visible stream data is checked about every five seconds and upon returning to the tab; Channel and Followers retain their 30-second cache/polling. Hidden views do not poll. OBS status checks run every two seconds while its controls are visible. The OBS panel shows output frame skips, which are not a diagnosis of their cause.

Run `CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" CHECK_PORT=3018 npm run check:obs` on a free check port. Tests use a fake OBS WebSocket server and fake Twitch with real local sockets, authentication, RPC, HTTP and GUI. They cover password rejection, timeouts, owner/CSRF checks, preview, explicit start/stop, disconnect semantics and logout. No real stream is started or stopped by these checks. A real OBS connection and its Streaming state have now been verified. Real StartStream/StopStream commands have not been exercised by the agent. Preview tests accept both OBS JPEG MIME aliases and normalize them to image/jpeg; actual preview rendering still requires verification after reconnection.

## Optional face tracking

In the demo, open **Settings → Face tracking**. **Start face tracking** requests the local camera; **Stop tracking** releases it. Existing GUI `useFaceLandmarker`/`useFaceOverlay` hooks publish a face anchor. The owner's .me bubble follows beside it with an offset, 280 ms eased travel, gentle CSS drift and a subtle halo; side switching uses a wide threshold to avoid jitter. Reduced-motion preferences disable drift and easing, and the hit area stays fixed while the visual floats. Foreground detection runs locally at about six checks/second; only transient `{x,y,aspect}` (plus optional display points when enabled) goes to the loopback server with origin/CSRF/session checks. No images, audio or identity templates are uploaded or persisted. If GUI frame callbacks stall, a watchdog reuses the same model at most once per second. On supported browsers, `ImageCapture.grabFrame()` reads the existing authorized video track into a temporary local ImageBitmap, which is closed after detection; it opens no second camera. Other browsers fall back to the video element. Local relay requests time out after 2.5 seconds rather than holding the sending lock indefinitely. The demo must remain open. Camera controls stay mounted when switching to Twitch, Inspector or OBS, so changing panels does not stop tracking. Stream setup links here instead of opening a separate camera. No face verification endpoint is called. Hook source, hashes, license and reproducible build instructions are under `ui/vendor/face/` and `tools/build-face-vendor.mjs` (TypeScript 5.9.3).

The mapping assumes the same camera centered and fitted inside OBS's 1920×1080 canvas, without crop or mirroring. Custom camera transforms are not calibrated. The local browser has reported a ready 640×360 camera, Face found, and an active face-follow bubble after reconnecting. Visual alignment with an actual OBS camera composition remains unverified; synthetic checks are not live broadcast evidence. Camera access and model/WASM downloads depend on browser permissions and network availability. Loading media without a camera stream is displayed as waiting for camera access. Motion and paused-preview recovery are covered by the synthetic camera check, including stalled rAF, a deliberately paused video element, fresh relay updates, reduced-motion and stopping the camera. A successful relay update clears transient connection errors; invalid or out-of-frame landmarks are not submitted. The local camera preview does not broadcast video or add a camera source to OBS. To show a face on Twitch, add that camera in OBS alongside the transparent overlay and start streaming there.

## Verification and evidence

```sh
npm test
CHECK_PORT=3018 npm run check:server
node --test tools/twitch-sections-check.mjs
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' CHECK_PORT=3018 npm run check:live
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' CHECK_PORT=3018 node tools/face-check.mjs
```

Category editing is tested offline with simulated Twitch: search, cache, owner/scope/CSRF checks, invalid-ID rejection, chosen-ID PATCH and reimport into the real kernel. Draft edits survive background data refreshes. Panel checks verify chat remains active and hidden inspector queries stop. The live category search was verified without saving a change.

Run checks sequentially on a free check port. The original ten tests remain unchanged. Server tests use fake Twitch HTTP/EventSub; the current live-graph check uses actual pinned kernels, real local sockets and browser rendering with simulated Twitch. The older tools/kernel-check.mjs and evidence/kernels capture the earlier profile-only interface; use check:live for the current command/presentation flow. They verify imported public Twitch fields against kernel reads, real stored-fact traces, viewer isolation, no robot rendering, node explanations, empty selection, synchronization, reloads and threaded replies. [Kernel evidence](evidence/kernels/) and synthetic face evidence are labeled offline. They do not prove a new real Twitch command was sent after this pivot. Earlier Spider browser checks describe the historical product stage.

`npm run mock` and the original Space model/parser/tests are preserved. The old Space view is available at `/overlay/?demo=space&dev=0`. No changes were made to the this.me kernel, claims, NRP, GUI package, Netget or unrelated services.

## Local endpoints

- `GET /`, `/auth/login`, `/auth/callback`; `POST /auth/logout` (same-origin CSRF): setup/authentication. Logout removes local tokens and disconnects chat; it does not log out twitch.tv or revoke Twitch's application grant.
- `GET /healthz`, `/api/status`: connection/public profile status, without credentials.
- `GET /api/kernels/:id/query?path=twitch.profile.login&operation=run|explain`: read-only query of an existing public leaf; returns `{output: ...}`. Invalid operations/paths return 400; missing kernels/leaves return 404.
- `GET /api/kernels/:id/sections/channel|stream|followers`: load/cache a public section for an existing kernel; unavailable upstream data returns 502 without fabricated values.
- `GET /api/kernels/:id/permissions`: local token ownership and editing capability; no OAuth credentials.
- `GET /api/kernels/:id/categories?query=...`: permitted owner category search, 2–100 characters, at most ten public results.
- `PATCH /api/kernels/:id/channel`: owner-only title/category/language update with scope, Origin and CSRF checks.
- `GET /api/kernels`: `{type:"kernels",kernels:[...]}` with public graph/script/explanation projections.
- `/ws`: views send `{type:"hello",role:"overlay",version:1,view:"kernels"}` and receive kernel snapshots and transient face positions.
- `POST /api/face`: validated local position relay, not a camera upload.
- `/overlay/`, `/ui/`: public app assets. Legacy `/api/spiders` and the Space transport remain for compatibility; they are not the current product interface.

Following a channel happens on twitch.tv: open the linked @channel while signed into the viewer account and use Twitch’s Follow button. The public follow/unfollow write endpoints were [removed by Twitch](https://discuss.dev.twitch.com/t/deprecation-of-create-and-delete-follows-api-endpoints/32351/1); this app does not emulate a follow API.

The web panel has three window modes: **docked** (full-height sidebar that reserves scene width), **floating** (a Messenger-style window at the bottom right), and **minimized** (its compact header at the bottom edge). Icon-only controls float/dock or minimize/restore the entire panel. Restoring remembers its previous expanded mode. The shared header contains Twitch, the channel avatar/username, Settings (Inspector, OBS and Face tracking), and window controls. Drag an empty part of its header to move the floating window or minimized bar. Resize the floating window from its lower-right corner; the minimized bar can be resized horizontally. Switching window modes resets manual position and size. Mode changes keep the chat iframe mounted; minimized inspector queries pause. The transparent OBS source is unaffected.

The transparent kernel source keeps its logical 1920×1080 SVG viewBox but fits the browser viewport. In OBS use a 1920×1080 Browser source as before; smaller browser previews now keep the bubble visible. A regular browser may show white behind transparency; no opaque background is added to the OBS output.

## Joined participants in the overlay

Viewers who declare themselves with `!me` appear in a compact list on the right of the scene, with their public Twitch avatar, username and a small GUI .me orb. The list shows up to six rows plus an overflow count. This counts declared participants in the current server session, not Twitch's online viewers. In the web app, clicking a row opens that participant's existing card and selects its kernel without switching the active sidebar. In the transparent OBS source the list is visual only. The channel owner's larger companion stays separate; camera facts and `stream.focus` remain exclusive to that owner.

Offline verification with simulated Twitch joins: `npm run check:live` (set `CHROME` to your installed Chrome executable). The fixture in `evidence/participants/` checks eight joins, six visible rows, overflow, avatars, selection, OBS behavior and camera isolation.

## Theme-linked scene tint

The circle at the scene's top left uses the new GUI **OverlaySwatch** source. Drag horizontally for hue and vertically for opacity; double-click restores the current theme color. Initial opacity is 18%. Only the scene is tinted; the chat, navigation and inspector remain untouched. The transparent source paints the same alpha layer without showing its editing circle. Editor settings are saved per GUI theme/mode. The authenticated channel owner's resolved HSL color/opacity is now relayed through localhost:3017 to OBS over WebSocket, so its separate browser storage and theme do not diverge. Drag updates are coalesced at 100 ms; theme changes and double-click reset share the resolved color too. Reloading the OBS source replays the latest server value. The OBS source has no editor or independent saved tint; before a host publishes, its layer is transparent. Opacity 0 means no visible tint;100 covers the camera completely. This changes the OBS Browser source composition; Twitch's player shows it after broadcast playback delay. Host publication requires exact Origin, CSRF and authenticated broadcaster ownership. Only four bounded HSL/alpha numbers are accepted; logout clears the shared tint. Server state is session-only; the web editor republishes its saved value after reload.

Only this small GUI component is included under `ui/vendor/overlay-swatch/`, with original TS/TSX, hashes, MIT licenses and explicit browser/theme adapters. The main GUI remains 4.2.1; the kernel is unchanged. Rebuild with `node tools/build-overlay-swatch.mjs /path/to/typescript/lib/typescript.js /path/to/esbuild/lib/main.js` using TypeScript 5.9.3 and esbuild 0.28.1. The pure MUI color utility is bundled; no second React or theme provider is mounted.

### Face points on the overlay

In **Settings → Face tracking**, enable **Show face points in overlay** and start tracking. The optional dots are drawn in both the web scene and the transparent OBS source, so they can appear in the broadcast. Disable them with **Hide face points in overlay**. They follow the same contained, unmirrored camera mapping as the companion; keep OBS framing aligned.

The existing GUI tracker supplies the real landmarks; only every fourth valid point is sampled (at most 128 normalized x/y pairs), rounded to four decimals, and relayed with the face anchor. The server enforces the point count, coordinate bounds, 8KB body limit and existing Origin/CSRF/auth/rate checks. Points expire with the face snapshot after two seconds and are never written to disk or added to kernels. No image, face template or identity recognition is sent. The toggle is off initially.

## Final demo verification

Run `npm test`, `npm run check:server`, and `CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" CHECK_PORT=3018 npm run check:live` sequentially on a free test port. The live-graph check uses simulated Twitch with the actual kernel, HTTP server, two browser views and WebSockets; it does not send real Twitch messages. Camera-specific checks: `CHECK_PORT=3018 node tools/face-check.mjs` with the same CHROME variable. [English video plan and live recording checklist](docs/DEMO-VIDEO.md). A passing offline check is not evidence of a completed public Twitch recording or submission.

## Watching the stream inside the app

The web demo includes the [official Twitch video player](https://dev.twitch.tv/docs/embed/video-and-clips/) above the interactive local scene, beside the existing chat. It uses the configured channel and the required parent hostname, starts muted to avoid audio feedback, and leaves the native player controls unobstructed. If autoplay is blocked, press Play. When the channel is offline, the Twitch player displays its own offline state; this does not start a broadcast. The lower scene remains interactive and can be used to select a bubble or inspect its public data.

The transparent OBS source contains no Twitch video iframe, avoiding recursive capture. It continues to provide only the source overlay/presentation. The browser video shows the delayed stream already composed by OBS; the separate lower scene shows local controls and current state. No second local bubble layer is placed on top of the embedded video.

## Fluency check (offline)

The face relay updates only mesh/companion subscribers, rather than rendering the video, chat and forms for every position. Display landmarks retain MediaPipe indices (maximum478 coordinate pairs;16KiB request cap), so the overlay reproduces the existing GUI contour connections and hollow, theme-colored points. A single batched canvas stroke draws the point rings only when coordinates or theme change. No second model or camera is created. Kernel projections are reused until facts/section state change; each WebSocket frame is serialized once per view type. When the GUI preview stops delivering positions, the same-model fallback checks every200ms after300ms without an anchor. Browsers can still throttle background tabs.

Run the isolated synthetic comparison, without touching port 3017 or real Twitch/OBS:

```sh
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' CHECK_PORT=3018 BASELINE=1 node tools/fluency-check.mjs
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' CHECK_PORT=3018 node tools/fluency-check.mjs
```

Baseline is commit92c30b1. Results in `evidence/fluency/` use moving synthetic landmarks and mocked Twitch video/chat; they do **not** measure MediaPipe inference, OBS encoding or Twitch delivery latency. On the recorded six-second run, web main-thread tasks fell from607ms to386ms and source tasks from212ms to179ms. Frame-gap p95 remained about50ms, so these results do not demonstrate60fps or an end-to-end lag fix. An initial per-point canvas stroke was rejected because frame gaps worsened; the retained renderer batches all point rings. Real OBS separately reported “Encoding overloaded” while broadcasting. Encoder settings were not changed and the broadcast was not stopped.

After app updates, refresh the OBS Browser source to replace its cached JavaScript. If the local server restarts, reload the camera-control page before starting tracking again so it receives a fresh CSRF token. Stream video playback can require pressing Play when browser autoplay is paused.

The real [OBS preview comparison](docs/OBS-PERFORMANCE.md) maintained30fps with no new missed render frames across visible/hidden/visible intervals. Streaming was inactive; current encoder/network performance remains unmeasured.


### One visible video and one face-mesh renderer

The web app shows the Twitch stream as its main video. Local camera capture is still required for tracking because the Twitch player is a delayed, cross-origin broadcast. The duplicate camera preview is hidden by default; **Show camera preview** opens it only for framing/diagnostics, and **Hide camera preview** closes it without stopping the camera or relay. The controls show whether tracking is active. Hidden preview skips mesh painting while the existing GUI detector continues to run.

Both optional local preview and OBS now call `ui/face-mesh.js`, using the existing GUI contour indices, hollow rings, gradient and a shared bounded scale (1–2× based on the fitted video width). The earlier copy kept a2.25px radius on a1920px canvas, making broadcast dots far smaller than sidebar dots. The sender also relays its two theme colors as validated six-digit hex values with the transient points, so OBS's separate browser theme does not recolor the mesh. This modifies the local vendored JS drawing adapter only; original TS, GUI package, MediaPipe detector and kernel remain unchanged. Points are still optional; no images are relayed.

Checks: simulated-camera integration verifies hidden default/live track, toggles without stopping, bounded ring sizes and strict color validation. A post-refresh real OBS10-second sample retained30fps,3.45ms average render,zero new render/output-thread skips andzero congestion. A separate synthetic6-second browser check recorded roughly60fps with no long tasks; that excludes real inference/Twitch delivery and is not directly comparable to earlier runs under different system load.


### Category picker

Opening Category now shows popular Twitch categories immediately, using [Get Top Games](https://dev.twitch.tv/docs/api/reference/#get-top-games). Typing two or more characters switches to [Search Categories](https://dev.twitch.tv/docs/api/reference/#search-categories); one-character input shows guidance. The result list is portalled outside the constrained bubble card to avoid clipping, with explicit loading, empty and error states. Arrow keys navigate; Escape closes only the list. Picking a verified result changes the local draft; only **Save to Twitch** submits it. Existing ownership/scope checks,30-second read cache and server-side category-ID validation remain.

Offline check (real UI/server; simulated Twitch; no channel writes): `CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' CHECK_PORT=3018 node tools/category-check.mjs`.


Tracking capture requests640×480 with4:3 aspect to match the measured OBS camera source (640×480, Fit to Screen, zero crop). The previous640×360 capture framed the face differently from OBS; rendering those coordinates over the4:3 camera expanded the apparent mesh. The preview contains the full4:3 feed inside its own16:9 box; normalized points use that actual capture aspect in both views. Ring radius is capped at2.5px and stroke at1.3px on the1920×1080 OBS canvas, with a subtle glow. This replaces the earlier uncapped13.5px radius/10.5px stroke. No coordinate expansion or manual face-shape correction is applied. If the OBS camera source's aspect or crop is changed, align the capture/framing again.

Offline tint check: `CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' CHECK_PORT=3018 node tools/tint-check.mjs`. It uses separate browser contexts to ensure the OBS source cannot inherit localStorage from the editor.
