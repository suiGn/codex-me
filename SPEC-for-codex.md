# Codex .me: server contract (for Codex)

Build one Node server (Express + `ws`) on **port 3017**. It is the only piece missing: the overlay, the
command parser and the .me kernel already exist and run in the browser (`overlay/`). The server does not parse
commands and does not touch the kernel. It moves chat lines in and reply lines out.

```
Twitch chat --EventSub WS--> server --/ws--> overlay (parses, applies to this.me, renders)
Twitch chat <--Send Chat Message-- server <--/ws-- overlay (reply)
```

Do not modify `overlay/commands.js`, `overlay/world.js`, `overlay/space-model.js` or `overlay/vendor/`. Tests: `node --test test/`.

## 1. Config

`.env` (git-ignored; template `.env.example`), loaded with `dotenv`:

| var | meaning |
|---|---|
| `TWITCH_CLIENT_ID` | app client id |
| `TWITCH_CLIENT_SECRET` | app secret, Confidential client. Never logged, never sent to the browser |
| `TWITCH_REDIRECT_URI` | `http://localhost:3017/auth/callback` (must match the app console exactly) |
| `TWITCH_CHANNEL` | login of the channel to read/write |
| `PORT` | default 3017 |

Tokens are stored in `.tokens.json` (git-ignored, mode 0600): `{ access_token, refresh_token, expires_at, user_id, login }`.
Exit with a clear message if `TWITCH_CLIENT_ID` or `TWITCH_CLIENT_SECRET` is missing.

## 2. HTTP routes

| route | behaviour |
|---|---|
| `GET /` | plain status page: authed as `<login>` or a link to `/auth/login`; EventSub state; number of overlay sockets |
| `GET /overlay/*` | static files from `./overlay` (OBS source: `http://localhost:3017/overlay/?transparent=1&dev=0`) |
| `GET /auth/login` | create random `state` (kept in memory, 10 min), redirect to `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=…&redirect_uri=…&scope=user:read:chat%20user:write:chat&state=…` |
| `GET /auth/callback` | reject if `state` unknown or `error` present. `POST https://id.twitch.tv/oauth2/token` (form: `client_id, client_secret, code, grant_type=authorization_code, redirect_uri`). Then `GET https://id.twitch.tv/oauth2/validate` to get `user_id`/`login` and confirm both scopes. Save `.tokens.json`, start EventSub, redirect to `/` |
| `GET /healthz` | `{ ok, authed, eventsub: "connected"|"down", overlays: n }` |
| `WS /ws` | overlay socket (section 4) |

Scopes: exactly `user:read:chat user:write:chat`. The authorizing account is the sender of replies (the
broadcaster's own account or a bot account).

Refresh: before expiry and on any 401, `POST https://id.twitch.tv/oauth2/token` with `grant_type=refresh_token`.
Validate the token at start and hourly (Twitch requires periodic validation).

## 3. EventSub (WebSocket transport)

1. Resolve `TWITCH_CHANNEL` to `broadcaster_id`: `GET https://api.twitch.tv/helix/users?login=<channel>`
   (headers `Authorization: Bearer <user token>`, `Client-Id`).
2. Connect `wss://eventsub.wss.twitch.tv/ws`. On `session_welcome`, within 10 s, `POST https://api.twitch.tv/helix/eventsub/subscriptions`:
   ```json
   { "type": "channel.chat.message", "version": "1",
     "condition": { "broadcaster_user_id": "<broadcaster_id>", "user_id": "<token user_id>" },
     "transport": { "method": "websocket", "session_id": "<welcome.payload.session.id>" } }
   ```
3. `session_keepalive`: reset a watchdog to `keepalive_timeout_seconds` + 5 s; on timeout reconnect from step 2.
4. `session_reconnect`: open `payload.session.reconnect_url`, close the old socket after the new welcome (do not resubscribe).
5. `revocation`: log it, show it on `/`, stop.
6. Deduplicate `notification` by `metadata.message_id` (keep the last 500).

On `notification` with `subscription.type == "channel.chat.message"`:
- ignore if `event.chatter_user_id == token user_id` (our own replies; prevents loops)
- ignore if `event.message.text` does not start with `!`
- else forward to every overlay socket (section 4).

## 4. Overlay socket `/ws` (exact JSON)

Server → overlay, one per chat command:
```json
{ "type": "chat", "id": "<event.message_id>", "user": "<event.chatter_user_name>",
  "text": "<event.message.text>", "isMod": true|false, "isBroadcaster": true|false }
```
`isMod` = some `event.badges[].set_id == "moderator"`; `isBroadcaster` = `set_id == "broadcaster"` (or
`chatter_user_id == broadcaster_user_id`). The overlay also accepts a bare `{ "user", "text" }`.

Overlay → server:
```json
{ "type": "hello", "role": "overlay", "version": 1 }
{ "type": "reply", "id": "<the chat id it answers, or null>", "text": "<= 450 chars>" }
```
The overlay rate-limits per user (one command per 3 s, five per 30 s; excess is dropped silently, no reply) and
checks mod rights for `!reset`. If several overlays are open, send replies only from the first socket that said
`hello` (others are previews), or dedupe by `id`.

Bind `/ws` to localhost only; reject an `Origin` header that is not `http://localhost:3017` (or absent, for OBS).

## 5. Replies: Send Chat Message

`POST https://api.twitch.tv/helix/chat/messages` with headers `Authorization: Bearer <user token>`, `Client-Id`, `Content-Type: application/json`:
```json
{ "broadcaster_id": "<broadcaster_id>", "sender_id": "<token user_id>",
  "message": "<reply text, max 500 chars>", "reply_parent_message_id": "<id from the overlay, if not null>" }
```
Check `data[0].is_sent`; if false, log `drop_reason`. Queue replies and send at most one per 1.5 s (well
under Twitch's chat limits); drop replies older than 20 s. On 401 refresh once and retry once.

## 6. Commands the overlay already answers (for the README / chat panel)

The WS contract (section 4) is unchanged: the server forwards every `!` line; the overlay parses, rate-limits and replies.
Unknown `!foo` gets no reply. Rate limits are per user, in the overlay: reads 1 s gap / 10 per 30 s, writes 3 s gap / 5 per 30 s;
over the limit the overlay stays silent. The server's own reply queue (1 per 1.5 s) still applies on top.

The world is the Space demo (`overlay/space-model.js`, copied unmodified from `.me/Demos/Robots/Space`): robots Oli (1), Tiko (2), Lua (3),
each with its OWN this.me kernel. The overlay advances the simulation one simulated minute per 500 ms (fixed tick, seed 7).

Paths: `oli.battery` = `robots.1.battery` in Oli's kernel; `robots[2].batteries[1].charge`; `lua:objects.comet.near` (prefix = whose kernel).
Path steps are identifiers or integers (`[n]` or `.n`), max 10 steps / 96 chars; kernel method names and JS internals are refused.

| chat | what runs (real, this.me 4.2.1) | kind |
|---|---|---|
| `!me <path>` | `me("<path>")`; a branch lists its leaves from `me.inspect().index`; pointers are read through | read |
| `!explain <path>` | `me.explain(path)` after resolving pointer prefixes; reply `path = v because expr [input=v, ...]` | read |
| `!status <robot>` / `!inbox <robot>` / `!outbox <robot>` / `!radio <a> <b>` | adapter state + kernel reads; `radio()` from the model | read |
| `!walk <robot> left\|right` | the robot's explore heading (adapter `r.dir`) | write |
| `!walk <robot> to <rad>` | writes `tipRock`, `tipPos`, `tipAt` into its kernel; its own `followTip` rule then walks it (Tiko slips on ice, so its rule says false) | write |
| `!charge <robot>` | `me.robots[N].charging(true)`; its `goCharge` rule sends it to the sunny side | write |
| `!battery <robot> <0-100>` / `add 3` / `remove <i>` | model `setBattery` / `addBattery` / `removeBattery` | write |
| `!hello <robot>` / `!tip <robot>` | model `sayHello` / `shareTip`: queued, sent by radio, lands in outbox/inbox | write |
| `!set <path> <value>` | `me.<path>(value)`; value = number, true/false or a word of max 40 chars. Computed facts: mods only. Sensed facts are re-measured by the robot when the truth changes | write |
| `!rule <coll[i]> <name> <expr>` | `me.<coll>["[i]"]["="](name, expr)` in all three kernels (or one with `oli:`). Grammar: fact names, numbers, `+ - * /`, comparisons, `&& \|\| !`, parentheses, `[]` aggregates, max 96 chars. Redefining a demo rule: mods only | write |
| `!link <path> <target>` | `me.<path>["->"](target)` inside one robot's kernel | write |
| `!reset` | new world, same seed; mods / broadcaster only | mod |
| `!help` | the command list | read |

## 7. Done means

- `npm start` serves `/overlay/`; `/auth/login` → Twitch → `/auth/callback` → `.tokens.json` written.
- Typing `!walk oli to -1.4` in the channel's chat moves Oli on the overlay and the bot answers in a thread reply.
- `.env` and `.tokens.json` are never committed; the secret never appears in logs or responses.
- `tools/mock-server.mjs` (stdin → /ws) stays working for offline demos.
