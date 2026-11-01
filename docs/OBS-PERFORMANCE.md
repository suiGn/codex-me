# OBS performance check

Measured October 31, 2026 using OBS WebSocket v5 and the actual codex-me Browser source. **Preview only:** streaming was already inactive. No stream/recording was started or stopped. Source visibility was restored and verified afterward; no encoder, camera, resolution or authentication settings changed.

1920×1080 canvas,1280×720 output,30fps. Each phase:1.5s settling then10 one-second samples. Missed frames are interval deltas.

| Phase | Mean render | Mean OBS CPU | FPS | Missed render frames |
| --- | ---: | ---: | ---: | ---: |
| Visible A |1.856ms|4.87%|30|0/310|
| Hidden |2.097ms|4.95%|30|0/312|
| Visible B |1.535ms|4.60%|30|0/309|

Hiding did not improve these measurements. Render times stayed within the33.3ms frame budget. This shows no preview-render bottleneck under the measured load, not zero overlay cost or guaranteed live-stream fluency.

Browser shutdown-when-hidden was false and remained unchanged: this isolates visibility/compositing rather than all Browser-source processing. Camera inference and Twitch playback load were not independently controlled. Output counters stayed zero because streaming was inactive, so current encoder/network performance is unmeasured.

Historical October30 logs show x264 veryfast and two separate failure types. One completed output had11.8% encoding skips and0.8% network drops. Later outputs had encoding skips34.6%,1.5%,0.3% and network drops92.9%,64.6%,70.5%, respectively. These are separate historical runs, not controlled attribution to the overlay. Full logs are not copied into this repository.

Next: once the user starts a real stream with the intended camera/tracking setup, repeat visible/hidden/visible while sampling render, encoder and network counters separately. Keep other scene/settings constant. Do not automatically start/stop the broadcast.

Raw sanitized result: evidence/obs-performance/preview-comparison.json.
Protocol: https://github.com/obsproject/obs-websocket/blob/master/docs/generated/protocol.md#getstats


## Live comparison — November 1, 2026

Repeated after the user started broadcasting. Camera-derived face.present was true, with one kernel and two connected overlay views. The broadcast remained active; no encoder/camera/network settings were changed. Source visibility was restored and confirmed.

| Phase | Mean render | Mean OBS CPU | FPS | Render skips | Output-thread skips | Stream-output skips | Congestion at end |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Visible A |3.056ms|6.10%|30|0|0|0|0|
| Hidden |2.963ms|6.23%|30|0|0|0|0|
| Visible B |3.076ms|5.65%|30|0|0|0|0|

Each measured phase lasted10 seconds after1.5s settling, using counter deltas. Rendering differed by about0.1ms with no frame-loss improvement from hiding. No current render/encoding/output congestion bottleneck was observed during this short live test; this does not exclude intermittent problems or measure Twitch playback delay. The Browser source continued to run while hidden, as in the preview test, so this isolates visibility/compositing rather than removing every browser task.

An independent10-second read-only WebSocket sample received61 distinct face timestamps, with166.87ms mean and209ms maximum interval between timestamps. Thus face-position input is about6Hz even though OBS produces30fps. This measures input cadence, not end-to-end camera/display latency or model execution time. Current relay cadence can limit the companion's responsiveness; this test did not change detection or animation settings.

Sanitized raw evidence: evidence/obs-performance/live-comparison.json.
