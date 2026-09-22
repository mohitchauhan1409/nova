# Click-only pacing revision — 2026-09-22

The current `nova-firecrawl-clicks.mp4` supersedes the initial click-only export described later in this historical QA report. It reduces the click-only runtime from 681.533s to 602.167s (11.65% shorter) by compressing completed-state operator waits and accelerating only unusually slow sidebar/card scrolling, capped at 1.25×. Every Nova/website execution segment, typing sequence, click frame, result and verification remains at 1×. The original and silent files are unchanged. All 55 cues were remapped from source frames; zero click frames overlap accelerated segments. Decoded click QA passes with zero audio outside tap windows and maximum onset error 0.041667ms. See `clicks-v2/pacing-audit.json` and `clicks-v2/edit-plan.json`. Later statements that the click file shares the initial silent duration or video stream describe the superseded first export.

# Firecrawl accepted final4 media QA

Accepted with the timing and source-build limitations below. This is the completed Firecrawl deliverable, not a rehearsal. All four jobs and saved-run comparisons were performed in the recorded dashboard.

## Source and builds

Accepted raw: `nova-firecrawl-original.mov`; recorder session 57467, 20,446 frames, first-frame epoch **1790057516342**. The retained recorder.log faithfully transcribes the coordinator's actual receipt; it is not a raw console export. The original movie is byte-identical to private/firecrawl-final4-original.mov. Session **7d506f11-282e-472e-92cf-8e27626f11b6** is retained immutably.

Recording backend: **9ae243425dcf1a124babc2ce0b44cf74dffcfe7b**, restarted before this take. Frontend: installed working-tree build immediately preceding **a1f3393838ca70c1502d0e1e65798d647a2fafbd**; manifest mtime September 22 11:16:35 +05:30, preceding that commit by 13 seconds. No cryptographic frontend freeze exists, so no exact frontend commit identity is asserted. Later backend-only changes did not rebuild the extension.

## Media and review

All three movies are **3024 × 1776, 30 fps, 20,446 frames, 681.533333 seconds**. The entire recording remains at 1×: no cut, idle compression, speed change, interpolation, cropped viewport or concealed recovery. Only the debugger infobar is filled in the two edited outputs. The original remains untouched. Exact frame-dependent rectangles are in edit-plan.json; native opening-strip measurements included the row's full close icon during sidebar animation (frames 154–164), and final decoded opening/transition/end frames were inspected. Stable mask: x16, y174, width2218, height114; opening mask spans the full browser width. No other content is masked.

Source review covered all **55 click actions**, their real visual responses and nearby progressive text entry, plus opening, Help-me-choose card, selected Both format, schema rows, both crawls and closing answer. Sampled frames show one orange/brown Nova cursor and no second physical pointer. Some cursor labels clip at viewport edges. This is sampled visual evidence, not a claim to have inspected every captured frame. The edited opening shows one populated Firecrawl tab, Personal Team, Nova closed. Actual saved results remain readable at native resolution. Final output shows the original two-page crawl and the closing comparison.

Decoded output comparison covered **165 frames** (three per click), excluding only the measured debugger strip and a two-pixel scaled codec-edge allowance: maximum mean RGB error **0.162889/255**, maximum p99 **3/255**. Another 16 opening, mask-animation and ending frames were decoded. Silent and click movies have identical encoded video streams: SHA256 **9582778af5ebdce795b35ae84e76f64f8a85f6c1a601151b0ae67a9a4c53c18b**.

## Audio provenance and limitation

The immutable session has 72 actionSteps: **55 clicks, 15 fills, one scroll and one back action**. No trustworthy operator ledger survived and recordingClicks is absent. All 55 click actions were visually reviewed and mapped once; no duplicates. Only these Nova click-kind receipts receive the established seed-2071, 48 kHz stereo tap. Operator actions, implicit fill-focus clicks, text entry, scrolling and back navigation are silent. There is no speech, music or keyboard sound.

**ActionSteps.at is recorded by beginStep before driver.execute. It is an action-start timestamp, not a trusted mouse-dispatch timestamp.** At the coordinator's explicit instruction, cues use the nearest captured frame to this available immutable receipt. No fixed delay or visual retiming was fabricated. This recording therefore does **not** prove sound within one frame of actual click dispatch. Audio decoding verifies alignment only to the chosen action-start cues: maximum onset error **0.020833 ms**, minimum tap correlation **0.999425**, quiet-region peak **0**, decoded peak **0.215913**. This limitation remains even though the cue renderer itself passes.

## Observed results and retained imperfections

Base scrape saved N5aXjuX8lhZKI0RYWSH56 returns title “A Light in the Attic” and price_gbp 51.77. Separate revision htmPdl4_f8Macad7e6Cod adds stock_count 22. Both original and revised saved JSON were reopened for comparison. The two-page crawl 01a0c7c5-8ba1-749d-977a-02db35a0d6cb returns All products and Books; the one-page revision 01a0c7c6-f402-739b-8f6f-9c013cd29001 returns All products. Both use root books.toscrape.com, discovery depth1, entireWebsite off and Markdown, with page limits2 and1 respectively. The native one-result coverage hint remains visible. The Logs page was visited; no stronger independent log inspection claim is made.

Clicks 11, 30, 32 and 39 (zero-based receipt indices) hit the JSON download control rather than the intended result tab, leaving the real browser download popover visible. Subsequent actual tab actions show JSON. Go back sometimes routes through the public Playground; Nova returns via Dashboard and verifies Personal Team before new jobs. All loading transitions, errors, waits and these navigations are retained. The final answer distinguishes dashboard operation by Nova from Firecrawl's real Agent/Interact capabilities on target websites; it does not claim Firecrawl lacks agents.

## Retention

Exactly three primary media files remain. Compact provenance, scripts, source/output frame indices, receipts, mappings, measurements and reports are retained. Task-only PNG/JPEG contact sheets, extracted frames and the legacy empty-sound intermediate were removed after review; their frame indices permit reproduction. No scratch file remains in use. See manifest.json for exact file hashes and metadata, and EXPORT-WORKFLOW.md for reproduction.
