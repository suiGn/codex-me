# Codex .me

Twitch chat controls Oli, Tiko and Lua in Abella E.'s (suign) .me Space demo. Each robot runs its own **this.me 4.2.1** kernel. The overlay shows the resulting state, the command, and the kernel's real `explain()` reason. Codex builds the integration; the running product does not use an LLM or require an AI API key.

```text
Twitch channel.chat.message → EventSub WebSocket → server.mjs → /ws → overlay
Twitch Send Chat Message    ← queued replies    ← server.mjs ← /ws ← overlay
```

## Build provenance

**This build session/thread ID:** `01a17f67-001b-7681-bb9f-ecc477f091a5` (October 27, 2026). This is the session that implemented the Twitch server, not an earlier conversation.

**Already present before this session:** `overlay/`, the unmodified Space model, `world.js`, `commands.js`, the 1920×1080 this.gui 4.2.1 OBS interface and its optimizations, vendored this.me 4.2.1, the 10 original tests, `tools/mock-server.mjs`, other screenshot/performance tools, `SPEC-for-codex.md`, `.env.example` and secret ignore rules. These are prior work, not work built in this session. Baseline commit: `f97acdca00791083a6762ef30152d222e14cea12`. A pre-existing lockfile adjustment was also present.

**Built with Codex in this session:** `server.mjs` (Express + ws), Twitch authorization code OAuth, token validation and refresh, EventSub subscription/recovery, the overlay transport and chat reply queue, offline server/browser checks, the .GUI startup/status page, and these reproduction/evidence instructions. No overlay, kernel or original test files were changed. The test script was adjusted to discover the existing files on Node 24.

Current verification: original tests and offline server checks pass. The real browser overlay moves Oli and produces a real kernel explanation through the server with **simulated Twitch**. Live OAuth as **suignn** and the EventSub subscription are now verified. A real command → robot movement → Twitch reply is **still pending**. See [session evidence](evidence/SESSION.md).

## Run locally

Requires Node.js 24 (tested with 24.13.1), npm, a Twitch account, and a Confidential Twitch developer app. The overlay loads React 18.3.1 and this.gui 4.2.1 from jsDelivr with SRI, so the browser needs internet access.

```sh
git clone https://github.com/suiGn/codex-me.git
cd codex-me
npm ci
cp .env.example .env
```

If `.env` already exists, edit it without overwriting it. Fill these values **locally**, never in a chat message or a screen recording:

```dotenv
TWITCH_CLIENT_ID=your_app_client_id
TWITCH_CLIENT_SECRET=your_app_client_secret
TWITCH_REDIRECT_URI=http://localhost:3017/auth/callback
TWITCH_CHANNEL=your_channel_login
PORT=3017
```

The registered app is **Codex .me**, Confidential, Chat Bot, with that exact redirect. The server exits clearly if the client ID, secret or channel is missing. It binds to localhost, serves only `overlay/`, and never sends credentials to the overlay. `.env`, `.tokens.json`, and its temporary file are ignored; saved tokens have mode `0600`. Tokens are validated at startup and hourly, refreshed before expiry and once on a 401. Failed authorization requires a new login.

Before starting, check the port:

```sh
lsof -nP -iTCP:3017 -sTCP:LISTEN
```

If the project's mock is running there, stop it with Ctrl-C in its terminal. Identify any other listener before stopping it. Other local services need no changes.

```sh
npm start
```

Open [stream setup](http://localhost:3017/), rendered with **this.gui 4.2.1** and the same neurons.me dark theme as the overlay. It shows the authorized Twitch account with its real public display name, @login, profile photo, description and channel link from [Twitch Get Users](https://dev.twitch.tv/docs/api/reference/#get-users), alongside a compact Twitch chat connection indicator and open demo-view count, updating the displayed status every three seconds. The profile is fetched on startup/OAuth, kept in memory, and cleared on logout; no additional scopes are requested. **Open demo** opens the interactive Space demo with an opaque background for browser viewing; **Open OBS source** uses transparency for OBS. `GET /api/status` supplies only public connection status; credentials stay on the server. `GET /healthz` reports `{ok, authed, eventsub, overlays}`; `eventsub` is `connected` only after the subscription succeeds.

## First live command

Authorizing the app enables the live bot's automatic replies. Perform this step when ready to allow writes in the configured Twitch channel.

1. Choose the reply account. **The server ignores every message from the authorized account**, as required by the contract. To type commands from `suignn`, authorize a separate bot account. If you authorize `suignn`, type commands from a different viewer account.
2. Visit [OAuth login](http://localhost:3017/auth/login), check which Twitch account is signed in, and authorize `user:read:chat` and `user:write:chat`. The callback checks a random single-use state, a browser cookie, the app ID and both scopes. Tokens stay in `.tokens.json`.
3. Confirm the setup page shows the intended account and Twitch chat connected. Open the [overlay](http://localhost:3017/overlay/?transparent=1&dev=0). In OBS, add that URL as a Browser Source at **1920×1080**.
4. From the other account, type `!walk oli left` in the configured Twitch channel. Oli's heading changes and the simulation moves him; the overlay logs the command and `explain()` reason. The authorized account sends the overlay's answer as a threaded Twitch reply.
5. Try `!explain oli.explore` or `!me oli.battery`, allowing for the per-user limits below. The target-position variant is `!walk oli to -1.4`.

Keep one main overlay open first: only the first socket to send the overlay hello may produce replies. Other sockets are previews with their own browser simulations; they do not receive historical state. If the primary closes, the oldest remaining registered overlay takes over. Reopening a browser starts a new simulation.

**Log out** on the setup page disconnects EventSub, aborts pending Twitch requests, clears queued replies and pending OAuth states, and removes local tokens. It is protected by a same-origin POST and CSRF token. It does not sign you out of twitch.tv or revoke the app grant in your Twitch account. To change the reply account, log out here, choose the intended account on Twitch, and connect again. Revocations stop EventSub and queued replies. Unexpected disconnects reconnect with backoff; Twitch-directed migrations retain subscriptions without resubscribing. Missed events during a full disconnect are not replayed.

## Commands

Paths accept robot aliases, e.g. `oli.battery`, `robots[2].batteries[1].charge`, or `lua:objects.comet.near` (the prefix selects the kernel). Identifier/integer steps only: at most 10 steps and 96 characters; kernel method names and JS internals are refused. Readable paths are confined to the demo kernels.

| Chat | Action |
| --- | --- |
| `!me <path>` | Read a leaf or list a branch; follow pointers. |
| `!explain <path>` | Show the real kernel reason and input values. |
| `!status oli`, `!inbox lua`, `!outbox tiko`, `!radio oli lua` | Read robot/adapter state and radio information. |
| `!walk oli left`, `!walk oli right`, `!walk oli to -1.4` | Set adapter heading or write tip facts used by the robot's own rule. |
| `!charge oli` | Enable charging; its rule drives it toward sunlight. |
| `!battery tiko 20`, `!battery tiko add 3`, `!battery tiko remove 1` | Set battery level, add a battery, or remove one. |
| `!hello lua`, `!tip oli` | Queue radio messages in the demo. |
| `!set oli.margin 15` | Write a number, boolean or short word. Computed facts require mod/broadcaster rights. |
| `!rule robots[i] low battery < 30` | Add a safe rule; redefining a demo rule requires mod/broadcaster rights. |
| `!link oli.watch rocks.b325` | Create a pointer inside one kernel. |
| `!reset` | Reset the world; mods/broadcaster only. |
| `!help` | Show the command list. |

Rules allow fact names, numbers, arithmetic, comparisons, `&&`, `||`, `!`, parentheses and collection aggregates; no JavaScript calls, strings, ternaries, `min()` or `max()`. Values and explanations come from this.me 4.2.1, never generated text. Sensor facts may be re-measured by the simulation.

The unchanged overlay rate-limits viewers: reads have a 1 s gap / 10 per 30 s, writes a 3 s gap / 5 per 30 s. The broadcaster bypasses these overlay limits. Excess and unknown commands are silent. The server accepts replies up to 450 characters, sends at most one queued reply every 1.5 s, drops queued replies older than 20 s, and checks Twitch's `is_sent` / `drop_reason`. A 401 permits one refresh and one retry. Server logs record outcomes without secrets or chat contents.

## Offline checks and demo

Do not run these port-3017 checks alongside the live server or the mock.

```sh
npm test                 # the 10 original tests; no network or port needed
npm run check:server     # real local HTTP + /ws, simulated Twitch HTTP and EventSub
# Or CHECK_PORT=3018 npm run check:server while the live app remains on 3017.
npx playwright install chromium
npm run check:browser    # real unchanged overlay + server, simulated Twitch
```

For installed Chrome on macOS instead of Playwright Chromium:

```sh
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm run check:browser
```

The browser check writes `evidence/offline-before.png`, `offline-after.png` and `offline-browser.json`. It asserts that `!walk oli left` changes Oli's position and returns an actual explanation through Send Chat Message's simulated endpoint. **These files do not prove a connection to Twitch.**

The original stdin mock remains available:

```sh
npm run mock
# Then type in that terminal:
# viewer: !walk oli left
# reader: !explain oli.explore
```

Open `http://localhost:3017/overlay/` while the mock is running. It prints overlay replies locally and never connects to Twitch. Existing `shots`, `perf`, `latency` and `tools/jitter.mjs` tools remain available; `tools/shots.mjs` uses a manual simulation clock for reproducibility.

## Official references checked October 27, 2026

- [OAuth authorization code flow](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#authorization-code-grant-flow), [refresh](https://dev.twitch.tv/docs/authentication/refresh-tokens/), [required token validation](https://dev.twitch.tv/docs/authentication/validate-tokens/).
- [Local chatbot token/scopes](https://dev.twitch.tv/docs/chat/authenticating/), [channel.chat.message](https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/#channelchatmessage), [WebSocket lifecycle](https://dev.twitch.tv/docs/eventsub/handling-websocket-events/).
- [Get Users](https://dev.twitch.tv/docs/api/reference/#get-users), [Create EventSub Subscription](https://dev.twitch.tv/docs/api/reference/#create-eventsub-subscription), [Send Chat Message](https://dev.twitch.tv/docs/api/reference/#send-chat-message).
- [Hackathon rules](https://twitchcon-codex.devpost.com/rules): deadline **November 2, 2026, 14:00 Pacific / 16:00 Mexico City**. Submission needs a runnable repository, English description of features and Codex use, this build session ID, and a public YouTube video under 3 minutes showing Twitch functionality and the Codex build. New-work timing and prior components must be represented accurately.

Repository: [suiGn/codex-me](https://github.com/suiGn/codex-me). No live demo video or submission has been published by this session.

The setup page uses official Twitch Glitch and wordmark assets from [Twitch Brand Assets](https://brand.twitch.com/), with original source paths recorded in [asset attribution](ui/assets/README.md).
