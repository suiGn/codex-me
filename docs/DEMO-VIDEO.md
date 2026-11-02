# Hackathon demo video plan (English, under 3 minutes)

Target duration: 2:40. Record actual Twitch behavior; do not describe the offline fixture as a live test. The existing Space, kernel and GUI library are preexisting work; this session built the Twitch bridge and current experience on top of them.

| Time | Footage / action | Narration |
|---|---|---|
| 0:00–0:15 | Live Twitch channel with the transparent OBS source above the camera. | “Your chat can join a live knowledge graph and ask why its values behave that way.” |
| 0:15–0:35 | Viewer jabellae sends `!me`. Their avatar and small orb appear in the right-side participant list. | “Each viewer gets an independent this.me kernel with their verified Twitch identity. My camera belongs only to my kernel.” |
| 0:35–0:55 | With face tracking already enabled, move into/out of the center band; show stream.focus changing and its node lighting green. | “A real camera coordinate enters the graph. The kernel recalculates a rule when I move.” |
| 0:55–1:15 | Select stream.focus in the Inspector; show its expression and native Explain JSON with face.x as input. | “The graph shows both the result and the exact input that produced it.” |
| 1:15–1:35 | Send `!explain` as the viewer to explain their Twitch profile, then select the owner’s stream.focus in the app to show its camera-derived explanation on OBS. | “This explanation comes from the kernel, not generated text or an LLM.” |
| 1:35–1:55 | Streamer opens the existing bubble card, then selects face.x and stream.focus in the Inspector; compare the app and OBS program preview. Close it to clear. | “The streamer’s selected public value is synchronized to the broadcast. Private controls stay in the app.” |
| 1:55–2:10 | Stop tracking; show face.present=false and stream.focus=undefined, with the native missing-input explanation. | “Without a face coordinate, the kernel reports a missing input. It does not invent a result.” |
| 2:10–2:35 | Codex session, selected source changes, tests and session ID. | “I built the OAuth, EventSub and chat bridge, shared presentation, safe command handling and integration checks with Codex, using my existing this.me and this.gui libraries.” |
| 2:35–2:40 | Project name and repository. | “Codex .me: a live graph that explains itself, built together through Twitch chat.” |

## Recording checklist

- Authorize the channel owner in the local app; use a different Twitch viewer account for commands. The reply account is ignored to prevent bot loops.
- To repeat the entrance, send `!me leave` from the viewer account, wait at least three seconds, then send `!me`. Only the sender can leave.
- Refresh the app and the OBS Browser source after code updates. Source URL: `http://localhost:3017/overlay/?transparent=1&dev=0`, dimensions 1920×1080.
- Streaming starts only by the human’s explicit action. Do not capture passwords, tokens, OAuth codes or private files.
- Allow at least three seconds between declarations; at most five declaration/leave/invalid attempts per 30 seconds. Read/explain requests have a separate one-second gap. Legacy enabled/energy/active and their write/rule commands are removed. Shared chat cards have a two-second global gap and expire after 15 seconds; a host selection has priority for three seconds.
- Use only the takes in which the real Twitch channel visibly receives the command and the resulting video. Record a retry if anything fails; do not conceal a missing integration with mock output.
- Keep a local recording before uploading. Publishing the public YouTube video and submitting the form require the owner’s authorization.
- Include the dedicated build session ID: `01a17f67-001b-7681-bb9f-ecc477f091a5`.

Rules checked October 30, 2026: https://twitchcon-codex.devpost.com/rules. Deadline November 2, 2026 at 14:00 Pacific (16:00 Mexico City). Materials in English; public YouTube video under three minutes showing Twitch functionality and Codex use, repository with instructions, description and build session ID.
