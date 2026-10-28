# Codex .me

One Twitch viewer. One .me. Viewers type **`!me`** to declare presence and get their native .GUI .me bubble. They attach a Spider body to that same **this.me 4.2.1** kernel; **`!spider`** remains the shortcut that creates both. The bubble represents the kernel (the psyche), and the original Spider drawing represents its body. The web inspector shows the creator, actual script and real `explain()` results for both presence and attachment. OBS uses a clean, transparent view of the same Spiders.

This first version only creates Spiders: no walking, batteries, planets, radio or physics. It uses the original Space demo robot drawing in a resting pose and renders on state changes rather than running a continuous simulation. Codex builds the project; the product does not use an LLM or require AI API keys.

```text
Twitch chat → EventSub → Node server → one kernel per Twitch user ID
                                  ├→ synchronized web + OBS snapshots
                                  └→ queued threaded reply via Twitch Send Chat Message
```

## Build provenance

**This Codex session/thread ID:** `01a17f67-001b-7681-bb9f-ecc477f091a5`. Work began October 27, 2026. This is the project build session, not an earlier conversation.

**Prior work:** the Space demo's `overlay/`, `space-model.js`, `world.js`, `commands.js`, vendored this.me 4.2.1, the original 10 tests, mock server, screenshot/performance tools, `SPEC-for-codex.md`, `.env.example` and secret ignore rules. Baseline commit: `f97acdca00791083a6762ef30152d222e14cea12`. A pre-existing lockfile adjustment was present.

**Built with Codex here:** Express/ws Twitch integration, OAuth and refresh/recovery, EventSub, chat replies, .GUI startup page, profile/logout/theme controls, the owner-requested Space presentation and walk fixes, and now the simplified server-owned Spider registry and synchronized .GUI views. Codex also created offline regression checks and these reproduction materials. The pinned kernel, original Space model, parser and original test files remain unchanged. The test script was adjusted for Node 24 test discovery.

The owner confirmed real chat commands, robot movement and replies in the earlier Space demo, and the public video was verified on suignn's Twitch channel. These are prior-stage live checks. The new Spider creation flow has separate offline evidence. A real Spider owned by jabellae was subsequently verified in the live server registry and restored web view; its new live threaded reply was not independently checked. See [session evidence](evidence/SESSION.md). OBS previously reported network dropped frames; reducing simulation work does not establish that the upload issue is resolved.

## Run locally

Requires Node.js 24, npm and a Confidential Twitch developer application. The browser loads pinned React 18.3.1 and this.gui 4.2.1 from jsDelivr with SRI and needs internet access.

```sh
npm ci
cp .env.example .env  # only if .env does not already exist
npm start
```

Fill `.env` locally with `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `TWITCH_CHANNEL` and `TWITCH_REDIRECT_URI`. Never paste secrets into chat. The registered app is **Codex .me**, Confidential, Chat Bot; the exact redirect is `http://localhost:3017/auth/callback`. The configured channel is **suignn**; GitHub account **suiGn** is a different identifier.

Before starting, check port 3017 is free. Stop only this project's mock/server if necessary; do not modify other local services.

1. Open [stream setup](http://localhost:3017/) and choose **Connect with Twitch**. Authorize the reply account (suignn) for `user:read:chat` and `user:write:chat`.
2. Open **Open demo** for the full web view, or load the OBS source below.
3. From another Twitch account, such as **jabellae**, type `!me` in suignn's chat. Wait three seconds, then type `!me me.spider.registered(true)` to attach the body. `!spider` creates both in one step. Messages from the authorized reply account are ignored to prevent feedback loops.
4. Confirm the .me bubble and attached Spider labeled @jabellae appear in both views and suignn sends threaded replies. Repeat `!spider` after at least three seconds: it must report the existing Spider, with no duplicate.
5. Type `!me me("identity.owner")` to read your creator login, or `!me me.explain("spider.created")` for the attachment explanation. `!explain` remains a shortcut. Select a Spider in the web view to inspect its creator and kernel script.

## Commands and lifetime

| Chat text | Kernel operation / result |
| --- | --- |
| `!me` or `!me new ME()` | Declares presence once: constructs the sender's kernel and initializes `identity` facts/rule. Repeating it reuses the same kernel. |
| `!me me.spider.registered(true)` | Associates a Spider with that kernel, once. Declaring presence first is required. |
| `!me me("identity.owner")` | Calls the sender kernel's reader for a validated path. |
| `!me me.explain("spider.created")` | Calls the sender kernel's real `explain()` for a validated path. |
| `!spider` | Shortcut: declare presence and attach its Spider, or report the existing body. |
| `!explain` | Explains the sender's attached Spider, or the presence rule if there is no body yet. |

`!me` is a chat adapter prefix. The forms after it correspond to real this.me 4.2.1 operations; this is a deliberately limited grammar, not general JavaScript execution. An optional final semicolon is accepted. Arbitrary assignments, expressions, owner changes, constructors with arguments and method/internal paths are rejected. Reads/explanations always address the sender's own kernel; a path cannot select another user's .me.

The server uses the stable Twitch user ID for uniqueness. The visible @username is the creator's login at creation time. Each kernel stores creator/time in `identity`, with `identity.present` derived from its registration fact. Attaching a body adds Spider facts/rules to that same kernel and points `spider.owner` at `identity.owner` using the real `["->"]` operator. No second kernel is created for the body. The native .GUI `Monad` (`kind="me"`, contained bubble) is the visual representation; its username seed is visual context, while ownership is bound by the Twitch user ID on the server. The inspector displays the exact script and the real kernel explanation; viewers cannot submit executable JavaScript or arbitrary scripts in this version.

Spiders are kept in server memory. Browser reloads, OBS source reloads and WebSocket reconnections restore the same registry. **Restarting the server clears the Spider session.** No persistence or cross-server account inventory is claimed. Writes are rate-limited per user (3-second gap, five per 30 seconds); reads/explanations use a separate 1-second gap and ten per 30 seconds. EventSub duplicates are ignored, and only the server handles Spider replies, avoiding duplicate replies from multiple views.

## Web and OBS views

- [Web demo](http://localhost:3017/overlay/?dev=0): .GUI topbar, community scene and a selectable Spider inspector. An empty scene explains how to join.
- [OBS source](http://localhost:3017/overlay/?transparent=1&dev=0): transparent **1920×1080**, only .me bubbles, their attached Spiders and creator labels, with a brief creation shine. No topbar, sidebar or footer. An empty registry is intentionally transparent.

In OBS Studio, add a **Browser** source with the OBS URL and dimensions 1920×1080. Keep shutdown-when-hidden and refresh-on-scene-change off. A source reload no longer resets the Spider registry because it belongs to the server. The OBS Twitch connection under **Settings → Stream → Connect Account** is separate from this application's chat authorization. Connect OBS as suignn; use jabellae as a viewer. Going live publicly requires the owner's authorization.

A custom operator chat dock can use `https://www.twitch.tv/popout/suignn/chat?popout=`. This dock is not automatically included in the video. See [official OBS Browser Source documentation](https://obsproject.com/kb/browser-source).

## Server and security

`server.mjs` binds to localhost on 3017 and rejects unexpected hosts/origins. OAuth uses authorization code, state and an HttpOnly SameSite cookie. Secrets/tokens never go to the browser or logs. `.env`, `.tokens.json` and its temporary file are ignored; tokens use mode 0600. Tokens are validated at startup/hourly, refreshed before expiry and retried once after a 401. Transient network/429/5xx errors retain the session and retry after 30 seconds; rejected authorization requires login.

**Log out** disconnects EventSub, aborts requests, clears queued replies/pending OAuth and deletes local tokens using a same-origin CSRF-protected POST. It does not sign out twitch.tv or revoke Twitch's app grant. It does not clear the Spider registry. No new Twitch scopes or AI credentials were added for Spiders.

EventSub handles welcome, keepalive watchdog and reconnect/migration. Replies are queued at most every 1.5 seconds, capped at 450 characters, and stale replies older than 20 seconds are dropped. Twitch `is_sent` and `drop_reason` are checked. A full network disconnect can lose events; they are not replayed.

- `GET /api/status`: public account and connection status.
- `GET /healthz`: `{ok, authed, eventsub, overlays}`. Overlay count means connected browser sources, not Twitch viewers.
- `GET /api/spiders`: public `mes` (all declared presences) and `spiders` (attached bodies) snapshot including creator, creation script and explanation, without credentials or kernel objects.
- `/ws`: Spider views send `{type:"hello",role:"overlay",version:1,view:"spiders"}` and receive `{type:"spiders",spiders:[...],mes:[...]}` on connection and creation. The earlier Space transport remains available for the legacy demo.

## Verification

```sh
npm test                         # original 10 tests, unchanged
CHECK_PORT=3018 npm run check:server
node tools/me-syntax-check.mjs
CHECK_PORT=3018 node tools/spider-check.mjs
```

Use a free check port. The browser check needs Playwright's browser, or `CHROME` pointing to an installed Chrome executable. It uses fake Twitch HTTP/EventSub with real HTTP/ws, the vendored 4.2.1 kernel and a real browser. It verifies uniqueness (including login rename), independent creator facts, true kernel explanations, EventSub deduplication, threaded replies, synchronized web/OBS, reload recovery and transparent presentation. Outputs under [evidence/spiders](evidence/spiders/) are **offline evidence, not proof of real Twitch creation**.

The earlier Space experience remains available at `/overlay/?demo=space&dev=0` and is documented in [the historical Space README](docs/SPACE-LEGACY.md). Its original mock still runs with `npm run mock` (port 3017; do not start it over the real server). `npm run check:browser` targets that legacy Space flow and also needs port 3017 free.

## Hackathon evidence

Project: [Codex x TwitchCon Hackathon](https://twitchcon-codex.devpost.com/), [official rules](https://twitchcon-codex.devpost.com/rules). Submission materials must distinguish prior work, work built in this session and actual live checks. The public YouTube video under three minutes must show the project on Twitch and how Codex built it. No submission video has been recorded/uploaded by the agent. Deadline recorded for this project: November 2, 2026, 14:00 Pacific / 16:00 Mexico City.

Twitch endpoints/scopes were verified against official [OAuth](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/), [token refresh](https://dev.twitch.tv/docs/authentication/refresh-tokens/), [EventSub WebSocket](https://dev.twitch.tv/docs/eventsub/handling-websocket-events/), [channel.chat.message](https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/#channelchatmessage), and [Send Chat Message](https://dev.twitch.tv/docs/api/reference/#send-chat-message) documentation. Twitch branding assets are attributed in [ui/assets/README.md](ui/assets/README.md).
