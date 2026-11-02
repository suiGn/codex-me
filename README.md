# Codex .me

A deterministic, **reactive knowledge graph** for **Twitch**, with a live reactive overlay.

Viewers type `!me` in chat and each one gets their own graph, shown as a bubble on stream. Each graph contains its viewer's Twitch data (profile, stream, channel, followers). **The streamer's graph also receives local face-tracking data.** Rules recompute affected values, and every derived value can explain why it has that value. For example, `stream.focus` turns true when the streamer's face is centered, and `explain()` shows it came from `face.x = 0.53`.

Everything runs locally on the streamer's machine. *No LLM at runtime, no AI keys*. Built with **Codex** in this session.

## Built with Codex in this session

Built by [suiGn](https://github.com/suiGn).

**Live on Twitch**: [suignn](https://twitch.tv/suignn).

**Submission session ID: `01a17f67-001b-7681-bb9f-ecc477f091a5`.** This is the dedicated project's Codex session; an earlier conversation ID is not evidence of work here.

**Preexisting:** this.me 4.2.1 and the .GUI library (including its face-tracking hooks), created by suiGn; the original overlay and demo model, chat parser/world adapter and rate limiter, ten original tests, mock server, screenshot/performance tools, SPEC-for-codex.md and environment template. The vendored kernel and original model remain unchanged.

**Built with Codex in this session:** Twitch OAuth and token refresh, EventSub and chat replies; one independent graph per viewer through `!me`, with `!me leave` to exit; Twitch profile, stream, channel and followers in the **GUI**; the inspector with native values, dependency graphs, scripts and real `explain()`; integration of existing **GUI** face tracking into the streamer's graph and its `stream.focus` rule; the synchronized OBS overlay with theme-linked tint, face points, shared presentations and a compact participant list; local OBS WebSocket controls; and integration checks and reproduction instructions. Legacy energy/activation demo state was removed. [Session evidence](evidence/SESSION.md) separates offline checks from live observations.

## Run locally

Requirements: Node.js 24, npm, a confidential Twitch developer application and a browser with camera support for optional tracking. OBS Studio must be installed and running to broadcast the composition; the web demo and chat can work while offline.

```sh
git clone https://github.com/suiGn/codex-me.git
cd codex-me
npm install
# Keep an existing .env; otherwise create it from the example.
[ -f .env ] || cp .env.example .env
```

Fill `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `TWITCH_CHANNEL` and `TWITCH_REDIRECT_URI` locally in `.env`. Register the exact redirect `http://localhost:3017/auth/callback` in the Twitch application. Channel means the Twitch login, not its display name. Do not share or commit credentials: `.env` and `.tokens.json` are ignored. Tokens stay on the server and refresh automatically; OAuth credentials are never sent to the browser.

Check that port 3017 is free. Stop `npm run mock` if it occupies that port; unrelated services need no changes.

```sh
npm start
```

1. Open [Codex .me](http://localhost:3017/) and **Connect with Twitch**. Basic OAuth requests `user:read:chat` and `user:write:chat`, with state validation. Connecting OBS to Twitch is a separate step.
2. Open the [web demo](http://localhost:3017/overlay/?dev=0). The configured channel owner is added automatically. From another Twitch account, type only `!me` in that channel's chat. The reply account's own messages are ignored to prevent loops.
3. Click a participant row or the owner's bubble to open its card. **Stream / Channel / Followers** render public Twitch data. Open **Settings → Inspector** to navigate the corresponding graph, values and explanations. Clicking a bubble does not switch away from chat.
4. For a repeatable entrance, send `!me leave`, wait at least three seconds, then send `!me` again from that same viewer account.

One independent kernel runs per verified Twitch user ID in the streamer's local Node process, not on each viewer's device. Kernels are session-only. Browser reloads retain them; restarting the server clears viewer entries, and viewers must rejoin.

## Chat commands

| Command | Result |
|---|---|
| `!me` | Join with your own kernel; repeat without creating a duplicate. Present your Twitch login on stream. |
| `!me leave` | Remove only your kernel, orb and participant row. Rejoin with `!me`. |
| `!me read twitch.profile.login` | Read your verified Twitch login. |
| `!me explain twitch.profile.login` | Explain that stored value. |
| `!explain` | Explain your own default path: Twitch login for viewers, focus for the camera owner. |
| `!me me("twitch.profile.login")` | Equivalent validated read syntax. |
| `!me me.explain("twitch.profile.login")` | Equivalent validated explanation syntax. |

Paths always target the sender's kernel. `!me jabellae` is not a declaration or a way to target another user. Declaration, leave and invalid attempts share a three-second gap and five-per-30-second limit per user; reads/explanations have a one-second gap and ten-per-30-second limit. Maximum 64 session kernels. Duplicate EventSub deliveries and reply-account messages are ignored.

Chat can join, leave, read and explain. It cannot submit arbitrary code, write imported facts or rules, enable cameras, edit another account or start broadcasts. Legacy energy/activation and robot commands are not part of the current demo.

## Graph, GUI and inspector

Viewer kernels contain their own public `twitch` data. Only the verified configured channel owner additionally receives `face` and `stream.focus`.

```text
me
├─ twitch
│  ├─ profile
│  ├─ stream
│  ├─ channel
│  └─ followers
└─ face / stream.focus   (channel owner only)
```

| Branch | Fields | Source |
|---|---|---|
| `twitch.profile` | `id`, `login`, `displayName`, `profileImageUrl` | Twitch Get Users, verified at declaration |
| `twitch.stream` | `live`, `title`, `category`, `viewers`, `startedAt` | Twitch Get Streams |
| `twitch.channel` | `title`, `category`, `language`, `tags` | Twitch Get Channel Information |
| `twitch.followers` | `total` | Twitch Get Channel Followers, count only |

Profile is a declaration-time snapshot. Other sections load on selection; visible Stream refreshes about every five seconds, Channel and Followers every 30 seconds. Failed reads show errors instead of invented data. Stream is an active broadcast; Channel holds persistent broadcast settings, including title/category while offline. Unavailable stream details are omitted from the rendered card rather than displayed as null fields. Following a channel happens on twitch.tv through the linked account, not through a custom follow command.

The GUI card renders the profile and resources. The inspector navigates actual memory paths with a tree, compact output and Copy icon, then **Explain / Script**. Its selected tab persists when changing paths. Explain shows the relevant declaration with syntax highlighting; the source-line link opens and highlights that declaration in the full reproducible construction script. **Explain JSON** exposes the native trace. These source locations are not VM stack frames. Inspector selection and rendered GUI controls highlight each other without forcing the sidebar to change.

Values come from `me(path)`, graph nodes from public `exportSnapshot().memories`, and dependencies/explanations from native `me.explain(path)`. Imported Twitch fields are stored facts, not fabricated derivations. Branch JSON is an app projection of real leaf reads. The script is inspectable construction source, not an editor that executes arbitrary code. The kernel is unchanged. `me://<login>/...` and `@<login>.twitch` are local UI aliases, not NRP registrations or a general API proxy.

### Optional channel editing

Permissions use the account authenticated with this app, independently of the account signed into the Twitch chat iframe. Other participants' channel forms are read-only; a moderator badge does not grant API editing.

For your own channel, **Authorize channel editing** requests the additional `channel:manage:broadcast` scope with the same Twitch account. Title, Category and Language then become editable. Category opens popular Twitch categories immediately; entering two or more characters searches. Select a verified category before saving; clearing it sends game_id=0. Tags remain read-only. Selection changes only a draft; **Save to Twitch** explicitly submits changed fields through Modify Channel Information. **Cancel** discards drafts. Ownership, scope, Origin, CSRF and field limits are checked server-side; successful writes reimport Twitch's public response into the graph.

## Web view and broadcast overlay

The web demo shows the official Twitch video player above the interactive local scene, alongside chat. Video starts muted; press Play if autoplay is blocked. The player shows Twitch's delayed broadcast, including an offline state when appropriate. The local scene is an editor/control surface and does not itself broadcast a camera.

The panel header contains Twitch, the channel avatar/login, Settings and window controls. Settings opens Inspector, OBS or Face tracking. Docked mode reserves scene width; floating mode acts like a movable/resizable chat window; minimized mode keeps a movable compact bar. Clicking a bubble preserves the active panel. Twitch's own embedded chat keeps its native appearance. If it blocks typing or playback in an embedded browser, use its **Open in Twitch** link; browser login sessions can differ.

Add this URL as an OBS **Browser source**, **1920×1080**, above the camera or game source:

```text
http://localhost:3017/overlay/?transparent=1&dev=0
```

The source contains the streamer orb, participant rail, optional face points, theme tint and selected public presentation. It has no chat, topbar, inspector, Twitch video iframe or camera capture. Keep the real camera as a separate OBS source. This avoids recursively capturing the Twitch stream. OBS must remain running to transmit; the app controls OBS rather than replacing it.

**Refresh the OBS Browser source after app updates or if it loaded while localhost was off.** On November 2, an empty source recovered after refresh, with the orb, points and focus visible again while the broadcast continued. After a server restart, reload the web demo before restarting tracking so it receives fresh session/CSRF state.

### Participants and shared presentations

Viewers who send `!me` appear on the right with their public avatar, username and small GUI orb: up to six rows plus `+N more`. This is a count of declared participants, not Twitch's online viewer count. Web rows open the existing card and select its kernel; OBS rows are visual only. `!me leave` removes the sender from both views. The streamer's larger, face-following orb stays separate; viewers never inherit camera/focus data.

Opening a bubble and selecting a public branch or fact shares the authenticated host's selection with OBS. Twitch resources use the same Stream / Channel / Followers card, read-only in the source. Live kernel paths show their value and real explanation/dependencies. Closing the card clears the presentation. Only public server-confirmed values are shared, never drafts, controls or credentials.

Viewer declaration/read/explain commands can present only their own kernel for 15 seconds. Shared chat presentations have a two-second global gap; host selections take priority for three seconds. New source connections receive the current selection. Publication requires local host ownership, exact Origin and CSRF; arbitrary WebSocket payloads cannot publish presentations.

### Theme-linked tint

The scene's **OverlaySwatch** circle uses the existing GUI component. Drag horizontally for hue and vertically for opacity; double-click restores the theme color. Default opacity is 18%, saved per theme/mode. The host's resolved color and opacity synchronize to OBS through the local server, with drag updates coalesced at 100 ms. OBS replays the latest value after reconnecting and has no independent tint editor/storage. Opacity 0 is transparent; 100 covers the camera completely. Twitch shows the change after broadcast playback delay.

Only the component is vendored under `ui/vendor/overlay-swatch/`, with source, hashes, licenses and browser adapters. The main GUI remains 4.2.1. Rebuild with `node tools/build-overlay-swatch.mjs /path/to/typescript/lib/typescript.js /path/to/esbuild/lib/main.js` (TypeScript 5.9.3, esbuild 0.28.1).

## Face tracking and the live rule

Open **Settings → Face tracking → Start face tracking** and permit local camera access. **Stop tracking** releases it. This is landmark tracking, not identity recognition. Existing GUI hooks run locally; no camera images, audio or identity templates are sent to the app server. Camera/model availability depends on browser permissions and model/WASM downloads. Keep the demo open.

Capture requests 640×480, 4:3, up to 15fps. For aligned points, use the same camera centered and fitted inside OBS's 1920×1080 canvas, without crop or mirroring. Other camera transforms are not calibrated. The preview is hidden by default; **Show camera preview** is optional and does not start a second camera. Switching sidebar panels keeps tracking mounted.

Only normalized face coordinates and optional display points/theme colors go to the loopback server. The point relay permits up to 478 indexed coordinate pairs, with a 16 KiB body cap and Origin/CSRF/ownership/rate checks. Display points expire after two seconds and stay outside the kernel. **Show face points in overlay** enables the same shared contour/ring renderer in the optional preview and OBS. Rings are capped at 2.5px radius and 1.3px stroke on the full-size source, preserving the fitted camera aspect.

Only the channel owner's graph stores `face.present`, `face.x`, `face.y` and this fixed native rule:

```js
me["="]("stream.focus", "face.x > 0.4 && face.x < 0.6");
```

Focus is true strictly between 0.4 and 0.6, false outside. It describes framing, not psychological attention. Missing/stopped/stale tracking clears presence and coordinates; the native result is `undefined`, not invented false. The inspector node lights green when true, with a focus readout beside the owner's orb. Select **stream → focus → Explain** to inspect the expression; **Explain JSON** reveals its exact native inputs. Host selection shares the explanation with the stream.

Detection is throttled to about six checks/second; a same-model fallback checks every 200 ms after 300 ms without an anchor. Browser background throttling still applies. Graph facts update at most twice per second, rounded to two decimals; unchanged facts are not rewritten. The runtime periodically rebuilds current facts/rules through public kernel APIs to bound write history. The companion uses eased motion and gentle drift; reduced-motion preferences disable those effects. Source and build details for reused hooks are in `ui/vendor/face/` and `tools/build-face-vendor.mjs`.

## OBS controls

1. Open OBS **Tools → WebSocket Server Settings**, enable its server and keep authentication enabled. Default port: 4455.
2. In **Settings → OBS**, enter the port/password locally and click **Connect OBS**. Optional `.env` defaults: `OBS_WEBSOCKET_PORT`, `OBS_WEBSOCKET_PASSWORD`. Never paste passwords into chat.
3. Check the scene/output state. **Show preview / Refresh preview** requests a manual JPEG snapshot, not another live player.
4. **Start streaming / Stop streaming** send one explicit command each. Connecting or previewing does not start broadcasting. Disconnecting controls, logging out or closing this app leaves an existing OBS broadcast running.

The app uses OBS WebSocket v5 on loopback with challenge-response authentication, bounded requests and host/Origin/CSRF checks. It does not choose the broadcast destination, add sources, expose stream keys or embed OBS itself. OBS output status and Twitch Stream status can temporarily differ during ingest/reconnects. Neither status alone measures viewer playback latency.

## Verification and evidence

Run checks sequentially on a free test port; none of these commands starts a real broadcast or sends real Twitch messages:

```sh
npm test
CHECK_PORT=3018 npm run check:server
node --test tools/twitch-sections-check.mjs
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' CHECK_PORT=3018 npm run check:live
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' CHECK_PORT=3018 npm run check:obs
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' CHECK_PORT=3018 node tools/focus-check.mjs
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' CHECK_PORT=3018 node tools/face-check.mjs
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' CHECK_PORT=3018 node tools/category-check.mjs
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' CHECK_PORT=3018 node tools/tint-check.mjs
```

Set `CHROME` to your installed Chrome executable. The ten original tests remain unchanged; server checks cover OAuth/EventSub/replies with simulated Twitch. Browser checks use real kernels, GUI, local sockets and separate web/OBS views with synthetic Twitch/camera inputs. Current checks cover viewer isolation, join/leave/rejoin, native focus/explain, shared presentations, six-row overflow, owner permissions, camera/mesh mapping, category drafts and tint synchronization. Offline fixtures are labeled and do not substitute for a public live recording.

Real broadcasts and OBS/source observations are recorded separately in [session evidence](evidence/SESSION.md). The November 1 [live OBS comparison](docs/OBS-PERFORMANCE.md#live-comparison--november-1-2026) held 30fps with zero new render/output/stream skips in three short measured intervals; it does not guarantee future performance or measure Twitch delivery latency. Face input was about 6Hz. Older overload/network-loss results remain historical evidence rather than a diagnosis of the current run.

The original `npm run mock`, model, parser and tests remain available for compatibility; historical Space/Spider fixtures describe earlier stages. Use `check:live` for the current product. No kernel, claims, NRP, upstream GUI package, Netget or unrelated service is modified by this integration.

## Local API and security

- `/`, `/auth/login`, `/auth/callback`, `POST /auth/logout`: setup, OAuth and local logout. Logout removes local tokens/disconnects chat; it does not sign out twitch.tv or revoke its application grant.
- `GET /healthz`, `/api/status`: connection/public profile status.
- `GET /api/kernels`: public graph/script projections.
- `GET /api/kernels/:id/query?path=twitch.profile.login&operation=run|explain`: read existing leaves; missing kernel/path returns 404.
- `GET /api/kernels/:id/sections/channel|stream|followers`: import/cache selected public data.
- `GET /api/kernels/:id/permissions`, `/api/kernels/:id/categories?query=...`: permissions/category picker; empty query loads popular categories, two or more characters search.
- `PATCH /api/kernels/:id/channel`: explicitly authorized owner edits.
- `GET/POST /api/scene-tint`, `POST /api/presentation`, `POST /api/face`: bounded host tint, presentation and coordinate relay.
- `GET /api/obs`, `POST /api/obs/:action`: local OBS status/controls.
- `/ws`: kernel views send `{type:"hello",role:"overlay",version:1,view:"kernels"}` and receive registry, face, presentation and tint frames.
- `/overlay/`, `/ui/`: app assets.

This is a local broadcaster companion, not a hosted multi-user authentication service. Write capabilities require the app's authenticated broadcaster with exact local Origin and CSRF checks. Public graph projections omit OAuth secrets, private Twitch fields and OBS credentials.

## Submission

[English video plan and recording checklist](docs/DEMO-VIDEO.md). Record actual Twitch chat and broadcast behavior, show how Codex built the integration, and include the dedicated session ID above. Publish a public YouTube video under three minutes and provide its link with the public repository and English project description. A passing offline check or running OBS source is not evidence that the final video or submission has been completed.
