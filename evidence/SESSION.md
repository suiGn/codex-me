# Build session evidence — October 27, 2026

Build thread/session ID: **`01a17f67-001b-7681-bb9f-ecc477f091a5`**.

Confirmed from this session's `CODEX_THREAD_ID` and `CODEX_SESSION_ID`. No earlier conversation ID is used as evidence for this build.

Author: **Abella E. (suign)**, creator of neurons.me and this.me.
Repository: [suiGn/codex-me](https://github.com/suiGn/codex-me), local work on `main`.
Baseline commit: `f97acdca00791083a6762ef30152d222e14cea12`.

## Provenance

Before this session: the complete optimized overlay, three independent robot kernels, copied Space model, parser, world adapter, 10 original tests, mock, screenshots/performance tooling, server contract and environment template already existed. Their original creation dates are not established by this session. Do not claim they were built here. The initial working tree also contained a three-line lockfile version-range adjustment; it was preserved.

This session built the Twitch server and its integration checks, verified official API documentation, reproduced the browser flow offline, and wrote English reproduction/submission materials. The existing `overlay/`, `test/` and mock source were unchanged during the initial server implementation. Later owner-requested overlay presentation changes are recorded below; original tests, mock, kernel, model and parser remain unchanged.

## Recorded checks

| Evidence | Result | What it proves |
| --- | --- | --- |
| [Original tests](original-tests.txt) | 10 passed | Existing parser, rate limits, real kernel and demo behavior still pass. |
| [Server checks](server-checks.txt) | 14 passed | Local HTTP/WS, OAuth state/cookie, scopes, token storage/refresh/startup, EventSub payload and migration, command forwarding, primary-only replies, reply limits and revocation. Twitch is mocked. |
| [CLI and mock checks](cli-and-mock.json) | Passed | Actual server CLI serves overlay and redirects to OAuth with fake local config; the unchanged mock still bridges stdin and WS. No Twitch authorization was performed. |
| [Browser trace](offline-browser.json) | Passed; no page errors | Real unchanged overlay + real server with simulated Twitch; command moves Oli and the overlay returns its actual kernel explanation. |
| [Before](offline-before.png) / [After](offline-after.png) | 1920×1080 | Offline browser captures from this session; not live Twitch footage. |

Observed command: `!walk oli left`. Oli moved from position `0.4` to `-0.13571428571430388` after 20 manually advanced simulation minutes. The actual overlay reply, also recorded in the JSON trace, was:

```text
@OfflineViewer Oli: robots.1.explore = true because !goCharge && !shelter && !watchComet && !followTip [goCharge=false, shelter=false, watchComet=false, followTip=false]
```

The CLI also correctly rejected startup with blank local configuration. `.env` was prepared from `.env.example` for the owner to fill locally. No secrets were requested in chat or included in evidence. The old `node tools/mock-server.mjs` listener from `~/codex-me-old` was identified and stopped to free port 3017. No other service was stopped or reconfigured.

## Pending live acceptance

- [x] Owner filled `.env` locally and chose **suignn** as the reply account.
- [ ] Owner permits the live bot to write replies to the configured channel.
- [x] `npm start`; owner completed `/auth/login` in Twitch.
- [x] `/` shows **suignn** authenticated and EventSub connected.
- [ ] From a different account, `!walk oli left` appears in real Twitch chat.
- [ ] Oli moves in the overlay and the authorized bot sends the real threaded reply.
- [ ] Capture live Twitch/OBS footage and add its date/result here.

**During the initial offline implementation, no real OAuth exchange, Twitch subscription, real chat write, deployment, push, YouTube upload or Devpost submission was performed.** The later OAuth/EventSub verification is recorded below; no test chat message was sent by Codex. Offline checks must not be presented as live acceptance.

## Submission description draft

Codex .me lets Twitch viewers control Oli, Tiko and Lua in a shared on-stream Space demo. Each robot runs its own this.me 4.2.1 kernel. Safe chat commands let viewers move robots, adjust batteries, send robot radio messages, read paths and add constrained rules or pointers. The OBS overlay shows the state and the real `explain()` reason behind each command's result. Moderator checks protect reset and built-in rule overrides.

I used OpenAI Codex in session `01a17f67-001b-7681-bb9f-ecc477f091a5` to implement and verify the missing Node.js Twitch bridge: authorization code OAuth, private token persistence/refresh, EventSub WebSockets and queued Send Chat Message replies. Codex checked Twitch's official documentation and tested the bridge with the existing overlay. The optimized overlay, Space model, kernels, parser, mock and original tests were prior work and were not created in this session. The product runs without an LLM or AI API key.

Before submission, update this draft with the live acceptance result and confirm the creation dates of prior project work against the official submission period.

## Video capture plan — target 2:45, English

1. **0:00–0:20:** Name, project goal and full chat → robot → explanation loop.
2. **0:20–1:15:** Real Twitch chat beside the overlay. From a viewer account type `!walk oli left`; show Oli moving, the overlay reason and the actual bot reply. Then show `!explain oli.explore`.
3. **1:15–1:50:** Show this Codex session implementing `server.mjs`, the official documentation checks and passing tests. State clearly which components were already present.
4. **1:50–2:20:** Show a second safe action/read, the individual robot kernels and moderator protection, using real footage. Allow for command rate limits.
5. **2:20–2:45:** Show repository reproduction instructions, this session ID and the final live acceptance result.

Hide `.env`, `.tokens.json`, OAuth codes and account credentials during capture. Use the offline screenshots only as explicitly labeled offline build/testing footage. Upload the final video publicly to YouTube only when authorized; add its URL to the submission.

## Rules verification

[Official rules](https://twitchcon-codex.devpost.com/rules) reviewed October 27, 2026. Submission period: October 23 through **November 2, 2026 at 14:00 Pacific / 16:00 Mexico City**. The rules require work built during that period, an interactive Twitch project, runnable repository with source/assets/instructions, feature and Codex-use description, the build thread's session ID, and an English or English-translated public YouTube video under 3 minutes showing Twitch functionality and the Codex build. Prior work is disclosed here; this session does not certify the dates or eligibility of that earlier work. Final submission remains pending the live run and video.


## Follow-up: .GUI from startup

At the owner's request, the startup/OAuth status page now uses **this.gui 4.2.1**, React 18.3.1 and the neurons.me dark theme from the initial screen. It displays public connection status, polls `/api/status`, and provides distinct browser-overlay and transparent OBS links. No existing overlay or kernel files were changed.

The owner completed OAuth as **suignn**. The live server confirmed `authed: true` and `eventsub: connected`; the .GUI page visibly showed the account, connected subscription and two overlay sockets. See [startup capture](gui-startup.png) and [public status snapshot](gui-startup-status.json). All 10 original tests and 14 server checks passed after this UI change; server checks ran on 3018 to leave the authenticated 3017 service undisturbed during verification. The project server alone was then restarted to load the new page. No command was posted to Twitch by Codex, and the real chat-command acceptance remains pending.


## Follow-up: logout and Twitch branding

Added a local **Log out** action and the official, unmodified Twitch Glitch/purple and white wordmark assets to stream setup. Logout requires a same-origin POST plus CSRF token, stops EventSub, cancels Twitch requests, clears queued replies/OAuth states, and deletes local access/refresh tokens. Serialized writes and a session-generation check prevent an in-progress refresh from restoring a logged-out session. Twitch's own browser login and the app grant remain untouched.

Verification: 10 original tests and 15 server checks passed. The added check covers CSRF rejection, logout during a deliberately delayed refresh, file deletion, no post-logout chat retry, and fresh login availability. See [server results](logout-server-checks.txt). Browser logout was clicked only in an isolated fixture with fake credentials on port 3018; [logged-out screenshot](twitch-logout-offline.png) is explicitly offline. The real **suignn** session remained authenticated; [updated setup screenshot](twitch-branded-setup.png) shows the available Log out control and live EventSub connection. Codex did not post a Twitch chat message.


## Follow-up: real Twitch account profile

The setup page now obtains the authorized reply account's profile through Twitch Get Users, independently of the configured chat channel. Only public fields (ID, login, display name, profile photo URL and description) enter page status; email and credentials are excluded. Profile state is cleared on logout or invalidation. No new scopes were added. The channel name is taken from Twitch's canonical login.

The live API returned display name **suiGnn**, login **suignn**, the account's real photo and description **.me**. Browser verification confirmed the image rendered and EventSub remained connected. See [profile screenshot](twitch-real-profile.png), [public profile result](twitch-profile-status.json) and [16 server checks](profile-server-checks.txt). The 10 original tests also passed. The overlay and kernel remain unchanged; no chat test message was sent by Codex.

## Follow-up: compact demo entry

Removed the setup headline and introductory paragraph at the owner's request. The Twitch Glitch icon and “Twitch chat · Stream setup” label now appear inside the account card for both signed-in and signed-out states. Renamed the browser action to **Open demo**; the project remains **Codex .me**, and **Open OBS source** remains the separate transparent stream view. JavaScript syntax and the rendered page were checked in the browser; no backend, overlay or kernel source changed. See [compact setup](compact-stream-setup.png).


## Follow-up: compact connection status

Replaced the oversized EventSub and socket cards with a compact **Twitch chat · Connected** indicator and **Open demo views** count. The profile card retains the real photo, display name and @login. This is a presentation change; the underlying EventSub subscription and overlay behavior are unchanged. Syntax and browser rendering were verified. See [compact connection status](compact-chat-status.png).


## Follow-up: topbar theme selector

Added a topbar **Theme** menu using this.gui 4.2.1's native `ThemesCatalog` and `ThemeModeToggle` components. Browser preferences persist under the existing codex-me theme scope. Verified light/dark switching, selecting Cherry Byte, and preserving the selection after a reload; restored neurons.me dark afterward. The Twitch wordmark switches between original official white/black assets for contrast, and profile-link accent color follows the mode. Syntax and browser appearance were checked; no server or overlay source changed. See [theme menu](theme-selector.png) and [light-mode check](theme-light.png).


## Follow-up: selected-theme thumbnail

Matched the visible theme control on the owner's localhost reference: the topbar trigger now displays the actual selected theme's circular badge from `GUI.GuiThemes`, plus a small sun/moon mode indicator. Its accessible label and tooltip identify the current theme and mode. The native catalogue and persisted theme selection remain unchanged. Syntax and rendered thumbnail were verified; the localhost reference was only viewed. See [active-theme thumbnail](active-theme-thumbnail.png).

## Follow-up: direct mode toggle and npm links

Added a separate sun/moon button beside the selected-theme thumbnail, using the existing .GUI `toggleMode` action. The current mode remains visible in the thumbnail badge. The `this.me 4.2.1` and `this.gui 4.2.1` topbar labels now link to their npm package pages with `target="_blank"` and `rel="noopener noreferrer"`. Syntax and rendered links were checked; the direct mode button was tested in both directions and restored to dark. See [topbar capture](mode-toggle-npm-links.png).


## Follow-up: one mode control

Removed the redundant light/dark switch inside the theme menu and the mode badge on the theme thumbnail. The separate topbar sun/moon button is now the only mode control; the thumbnail and its menu select themes only. Syntax and browser rendering were verified. See [single mode control](single-mode-control.png).


## Follow-up: overlay theme controls and hackathon reference

At the owner's explicit request to apply the controls to the overlay too, updated only its topbar presentation. Extracted the existing theme selector and sole sun/moon mode button into `overlay/theme-controls.js`, shared by setup and overlay, so the original mock can serve it without modification. Added npm links and **Built for Codex x TwitchCon Hackathon 2026** linked to the official event. Adjusted header overflow so the theme menu can open, and used border-box sizing to keep the menu within the visible edge. The fixed 1920×1080 canvas and robot behavior are unchanged.

Rechecked [official rules](https://twitchcon-codex.devpost.com/rules). The caption is descriptive build context; no event logos or claims of organizer status were added.

All 10 original tests passed. The existing browser acceptance check ran with simulated Twitch on port 3018 and an explicit WS override: Oli moved and its actual explanation returned, with zero page errors. Separate evidence is in [offline browser result](overlay-ui-check/offline-browser.json) and [1920×1080 view](overlay-ui-check/offline-after.png). The unchanged mock on 3019 served the shared module and forwarded stdin commands ([mock result](overlay-ui-check/mock-check.json)). Live browser checks verified the new preview, unclipped menu and setup's shared module; no Twitch test message was sent. See [live topbar](overlay-topbar.png) and [theme menu](overlay-theme-menu.png). The original open overlay tab was preserved; verification used a separate preview.


## Follow-up: standard-height bars and project card

Confirmed from this.gui 4.2.1's installed TopBar implementation that standard dense sizing is 48 px. The app already rendered through `GUI.mount` with .GUI atoms, but setup's custom header padding made it taller; the overlay used a fixed 56 px row. Both now use 48 px. Removed the hackathon caption from the overlay topbar and moved the context to a dedicated **Codex .me** project card on setup, alongside **Open demo** and **Open OBS source**.

Syntax and the live setup page were checked ([project card](project-card.png)). The existing browser acceptance flow passed with simulated Twitch on 3018 at 1920×1080, verifying movement, real explanation, and no page errors; see [result](project-card-check/offline-browser.json) and [overlay view](project-card-check/offline-after.png). Existing open demo tabs were preserved. No kernel, model, parser, server or original tests changed.

## Follow-up: uncluttered single-row overlay header

Simplified the overlay header to the project name, abbreviated npm links, a short local connection indicator, theme thumbnail and single mode button. Removed the technical sentence, visible package versions and full WebSocket URL; version/connection details remain in tooltips. The inner header fits the browser viewport while the OBS canvas remains 1920×1080, with a fixed 48 px header and no wrapping. Syntax and both existing demo tabs were verified after reloading their older JavaScript; reloads restart each tab's local simulation. See [single-row overlay](single-row-overlay.png). No robot behavior or server source changed.


## Follow-up: compact native Hero and session recovery (2026-10-28)

Combined the real account profile, chat connection, open demo-tab count and logout into one compact card. The counter explicitly means connected overlay browser tabs, not Twitch viewers; the two existing demo tabs explain the displayed value of two. Replaced the manual project card with this.gui 4.2.1's actual `G.Molecules.Hero`, using flow layout and automatic height. Reduced card padding and verified the live rendered page. See [compact native Hero](compact-native-hero.png).

The live server initially reported failed authorization. Its saved access token was expired and rejected by validation; restarting with the existing refresh token restored suignn and the EventSub subscription without another OAuth grant. The earlier failure's cause was not established. Server recovery now distinguishes temporary network/timeout, rate-limit and Twitch 5xx failures from rejected authorization, retaining the session and retrying after 30 seconds for transient failures. Added offline checks for network failure, HTTP 503 recovery and HTTP 400 rejection. All 19 server checks and the 10 original tests passed; see [server checks](hero-recovery-server-checks.txt). Restarted only this project's port-3017 server with the fix and confirmed the live account remains connected. No real Twitch chat test message was sent; the viewer-command-to-real-chat-reply acceptance step remains pending.


## OBS integration rehearsal (2026-10-28)

Installed OBS Studio 32.2.2 using Homebrew's official-source OBS cask on the owner's Apple Silicon Mac. Created a Browser Source pointing at the local transparent overlay, explicitly set to 1920×1080; visually verified all three robots, explanation panels and connected transport in the OBS preview. Added the custom `suignn Twitch chat` browser dock and verified the Twitch welcome message. Opened Settings → Stream → Twitch → Connect Account, leaving the login for the owner to complete and authorize. No passwords, stream keys or OAuth credentials were read or included in evidence. No real chat message, recording or public stream was started. The live server health reported authenticated, EventSub connected and two overlays after OBS joined. OBS authorization, the real viewer-command/reply check and broadcast verification remain pending. Reproduction steps are in the README.


## Directional walk and order shine (2026-10-28)

The owner supplied a real Twitch exchange: jabellae sent `!walk oli left` and suignn replied with a kernel explanation. The OBS log also visibly contained jabellae's commands, establishing real chat ingress and threaded reply, but the owner reported no visible commanded movement. Inspection found left/right only changed the adapter exploration heading; an existing destination or kernel priority could continue to govern motion, and the reply described `explore` instead of the requested destination.

At the owner's request, changed only the command adapter (`world.js`) and overlay renderer: left/right now write a destination 0.8 radians from the current position through existing tip facts; an obsolete radio-tip provenance pointer is removed when the viewer replaces its destination. The kernel continues to decide using its existing rules. Replies identify a charging/shelter/comet blocker when present or explain `followTip`. Added a theme-colored, expanding 1.2-second halo for accepted robot writes, restarting on another order; reads, errors and rejected writes do not trigger it. The halo acknowledges receipt rather than promising movement.

The original 10 tests pass unchanged. The new offline regression uses the vendored 4.2.1 kernel and the unchanged mock on 3018 with an explicit WS override; it verifies both directions, replacement of a prior destination, position/rendered transform change, charging priority and shine targeting/expiry. See [results](order-check/result.json), [order shine](order-check/order-shine.png), and [completed command](order-check/order-complete.png). No page errors. Refreshed the existing OBS Browser Source to load the fix, which restarted its local simulation; verified the preview reconnected. No Twitch messages or broadcast were sent by the agent. Live movement with the updated code still needs the viewer's next command.


## First authorized Twitch broadcast (2026-10-28)

After the owner said “start next step” in the context of starting the public stream, muted Mic/Aux and started OBS streaming. Confirmed OBS showed Stop Streaming and an advancing stream timer. Opened the public channel in a separate browser tab: Twitch showed suiGnn LIVE, active playback and the robot scene beside the chat, including jabellae's previous commands and genuine `followTip` replies. The owner had confirmed the corrected movement worked in OBS. Saved [live Twitch screenshot](twitch-live-robots.png). No agent-written chat messages, recording, YouTube upload or submission occurred.

Quality limitation: OBS reported 419 dropped frames (57.6%) at 25 seconds, 671 (49.4%) at 46 seconds, and 1525 (52.8%) at 1:36. Output settings showed 6000 kbps. A reduction to 3000 kbps was attempted in the UI but was not confirmed applied; the settings window closed during interaction. The stream remained live at the last observation. Smooth broadcast delivery still needs resolution before recording submission evidence.


## Animation-only transparent OBS view (2026-10-28)

At the owner's request, transparent mode now mounts only the .GUI content/scene in the fixed 1920×1080 canvas. Topbar, both sidebars and footer are omitted rather than merely covered. Simulation-time/message counters are hidden in this mode; robot names, batteries, status, movement and order shine remain. The full web view retains its original controls and panels. No model, kernel, parser or chat-transport changes.

Offline browser verification with the unchanged mock on port 3018 confirmed an exactly 1920×1080 scene, transparent root background, no header/aside/footer, hidden counters, an order-triggered shine and retained full web chrome, with no page errors. See [result](obs-animation-only/result.json) and [transparent scene](obs-animation-only/transparent.png). Refreshed the existing live OBS Browser Source and visually confirmed the clean full-frame scene; this reset its local simulation. See [OBS preview](obs-animation-only/obs-preview.png). The broadcast stayed active. The previously observed network dropped-frame limitation remains unresolved.


## Scope change: one creator-owned Spider per viewer (2026-10-28)

The owner explicitly replaced the Space simulation with creation only: one Spider robot per Twitch user, identified by its creator and with an independent this.me kernel. Implemented `lib/spiders.mjs` with the vendored 4.2.1 engine, using stable Twitch user IDs for uniqueness. `!spider` creates or reports an existing Spider; `!explain` reads that viewer's actual creation explanation. Creator login, creation timestamp, create capability, registration and the derived `created = registered` rule are established with verified kernel APIs. No arbitrary script execution or new scopes.

The registry belongs to the server and broadcasts public snapshots to Spider views, so multiple overlays and reloads share the same Spiders. Creation replies use the existing Twitch queue directly, independent of overlay count. State lasts for the server process; restarting clears it. New .GUI web view provides a selectable inspector with the actual setup script and explanation. OBS remains transparent and scene-only. The scene is static after creation, with a one-time CSS arrival shine and no continuous simulation/render loop. The original Space model/parser/tests/mock remain unchanged and the earlier experience is available through `?demo=space`; archived its instructions in `docs/SPACE-LEGACY.md` and rewrote the current README in English.

All 10 original tests and 19 server checks passed. The focused [offline Spider acceptance](spiders/result.json) passed uniqueness across login casing/rename, separate creator facts/kernels, real explanation, invalid identity/creation arguments, EventSub duplicate handling, one threaded reply per creation, synchronized web/OBS snapshots, browser reload retention, inspector selection and a full transparent 1920×1080 OBS scene. No browser errors. Test output: [original tests](spiders/original-tests.txt), [server checks](spiders/server-checks.txt), [browser check](spiders/browser-check.txt). Simulated views: [web](spiders/offline-web.png), [OBS](spiders/offline-obs.png). These sample users are offline fixtures, not real Twitch creations.

Restarted only the verified project process on port 3017 and confirmed authenticated EventSub connectivity. Refreshed the existing OBS and transparent browser sources, then opened the web demo: it shows zero Spiders, connected, and the `!spider` instruction ([live ready state](spiders/live-ready.png)). The already authorized stream stayed active. No real Twitch message was sent by the agent. First real creation in the new scope remains pending; previous live movement checks describe the archived Space stage. No claim that reduced simulation work fixes the separately observed network dropped frames.


## Restore the original robot drawing (2026-10-28)

The owner requested the same Spider appearance as the previous Space demo. Replaced the new front-facing illustration with the original eight-leg point formula at gait phase zero, the same body ellipse, offset head, antenna and endpoint, stroke width and joins. This is a stationary rendering only; no simulation or kernel changes. Preserved creator labels, one-per-user registry, inspector and arrival shine.

Syntax and the existing Spider browser acceptance check passed. Refreshed the live OBS source and both existing web/transparent views without restarting the server. A real registry entry for jabellae was present and survived all display reloads; the live web inspector showed its creator, actual script and real explanation. See [original shape with real creator](spiders/original-shape-live.png). This verifies a real Twitch creation reached the registry and UI; this follow-up did not independently inspect its threaded reply. No agent chat messages were sent.


## Introduce .me presence, body association and chat syntax (2026-10-28)

After the owner approved introducing .me as the chat language, implemented a strict allowlist: `!me` / `!me new ME()` declares presence once, `!me me.spider.registered(true)` attaches its body, `!me me("identity.owner")` reads a validated path in the sender's kernel, and `!me me.explain("spider.created")` invokes the real explanation. `!spider` remains the one-step shortcut; `!explain` explains the existing body or presence. No evaluation of chat JavaScript, arbitrary assignment, owner changes or constructors with arguments.

Each stable Twitch user ID still owns one server kernel. Identity facts and the actual `identity.present = registered` rule are established on declaration. Attaching adds the Spider facts/rule to that same kernel and a real pointer from `spider.owner` to `identity.owner`. A new public `mes` array carries all presences alongside `spiders` for attached bodies, preserving the earlier snapshot field. Reads are scoped to the sender; no other-user selector is accepted. The web inspector shows the actual setup script and real explanations.

Located this.gui 4.2.1's exported `Monad` in the installed declarations/implementation and used its native contained `kind="me"` bubble, seeded/labeled with the creator. The bubble is the visual representation of the server kernel, linked by a short line to the original robot body. Bubbles and bodies share selection. Native bubble interactions/animations are disabled in this display; the app does not connect to namespace/claims/NRP/netget services. This is a demo association, not a namespace ownership grant.

All 10 original tests and 19 server checks passed ([original](me-syntax/original-tests.txt), [server](me-syntax/server-checks.txt)). The [grammar regression](me-syntax/grammar-check.txt) checks presence without a body, idempotent construction, one-time attachment, same kernel ID, owner pointer, independent readers, actual explanation and rejected code/ownership writes. The extended offline browser check also passed explicit presence rendering before body attachment, native GUI bubbles, two-view synchronization, sender-only reads and threaded replies through fake Twitch; [output](me-syntax/browser-check.txt), [detailed results](spiders/result.json), [rendered sample](spiders/offline-web.png). No browser errors.

Restarted only this project's local server, which intentionally cleared its in-memory registry as explained to the owner. Confirmed EventSub subscribed and refreshed OBS/web to the new UI. The live web guide showed zero .me/Spiders and connected ([ready](me-syntax/live-ready.png)). Broadcast remains active; no agent chat message was sent. First real use of the new explicit .me syntax is pending. The earlier real jabellae creation refers to the prior creation-only stage. The network upload issue remains separate and unresolved.


## Distinguish owner from body; declare suignn (2026-10-28)

At the owner's request, moved `@username` above the .me bubble and labeled the attached body `Spider`; the inspector heading also explicitly says `.me @username`. Added a trusted idempotent registry bootstrap for the suignn channel, using its Twitch-resolved broadcaster ID during EventSub startup. It declares one psyche and one body without chat writes or changing own-message filtering. Other viewers remain opt-in.

Grammar/isolation checks including bootstrap idempotency passed, as did all 19 existing server checks and the full offline browser flow with no page errors. See [grammar](owner-body/grammar-check.txt), [server](owner-body/server-checks.txt), [browser](owner-body/browser-check.txt). Restarted only the project server (after notifying the owner that session-only jabellae must rejoin), confirmed the live registry contains exactly suignn with attached=true, and refreshed OBS/web. [Live screenshot](owner-body/suignn-live.png) verifies separate labels and the real suignn kernel/script. No agent chat message was sent. Broadcast stayed active.


## Camera compositing enabled (2026-10-28)

The owner explicitly requested turning on the camera after discussing tracking. Added an OBS Video Capture Device source, placed it below the transparent Browser source and selected the available FaceTime HD Camera. After initially receiving no image, visually confirmed actual camera frames filling the canvas with the .me bubbles and original Spider drawings above them. The existing Mic/Aux mute stayed enabled. Confirmed the same camera/overlay composite on the public suignn Twitch viewer, with LIVE status. No face recognition or tracking was added and no camera images were committed to the repository. The screenshot shown to the owner is a temporary local file only.

The Twitch viewer also visibly showed jabellae's real `!me` and `!spider` messages with genuine threaded presence and attachment explanations from suignn. This establishes real use of these aliases in the current .me experience; the longer explicit read/write chat forms remain verified offline. No agent chat messages were sent. The existing network dropped-frame issue remains separate from successful camera compositing.
