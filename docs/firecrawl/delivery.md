# Firecrawl recording delivery — September 22, 2026

The accepted final4 recording completes a structured scrape, its stock revision, a bounded two-page crawl, its one-page revision, saved-result checks and a closing comparison. Earlier preparation and candidate scenario notes are historical; this document records what actually happened.

The opening uses a populated single-tab Personal Team dashboard with Nova closed. Nova first navigates to Scrape, then asks for details. The user selects Help me choose, Both formats and the typed title/price schema. Nova enters configuration through the live visual fields, saves and reopens it, executes the job, and reopens persisted output. A follow-up adds numeric stock_count in a separate run. Two bounded crawl runs follow, with explicit limits and saved-run comparisons.

| Saved result | Verified content |
| --- | --- |
| [Base scrape](https://firecrawl.dev/app/t/jMrRDaLBFKK/playground/N5aXjuX8lhZKI0RYWSH56) | title A Light in the Attic; price_gbp 51.77; Markdown + JSON |
| [Stock revision](https://firecrawl.dev/app/t/jMrRDaLBFKK/playground/htmPdl4_f8Macad7e6Cod) | same title/price plus numeric stock_count 22 |
| [Two-page crawl](https://firecrawl.dev/app/t/jMrRDaLBFKK/playground/01a0c7c5-8ba1-749d-977a-02db35a0d6cb) | All products and Books; limit2, depth1, entireWebsite off |
| [One-page revision](https://firecrawl.dev/app/t/jMrRDaLBFKK/playground/01a0c7c6-f402-739b-8f6f-9c013cd29001) | All products; limit1, depth1, entireWebsite off |

Firecrawl was retained under the user's criterion of an agent operating the product's own dashboard. The live Support Agent stated it could not control the browser or dashboard. Firecrawl Agent and Interact do execute tasks on target websites; the video and eligibility decision acknowledge that distinction.

Three primary recordings are in [artifacts/firecrawl/media](../../artifacts/firecrawl/media): untouched original, debugger-row-masked silent version, and the same edited video with Nova click sounds. Each is **11m21.533s, 3024×1776, 30fps, 20,446 frames**. The entire timeline remains at native speed with no cuts. Exactly 55 Nova click-kind actions have taps; operator clicks and keyboard/fill actions are silent.

**Timing limitation:** this session retained action-start receipts but no recordingClicks dispatch ledger. Taps are aligned to the nearest frame of actionSteps.at, which occurs before driver.execute. Exact mouse-dispatch alignment within one frame cannot be claimed. All55 actions were visually reviewed. Decoded taps agree with their selected cues within0.020833ms, with zero sound outside the allowed tap regions. Silent/click versions have identical encoded video streams. Four mistaken JSON-download clicks and public-Playground detours remain visible; subsequent real tab actions and saved-result checks demonstrate the actual output.

Backend build during recording was **9ae243425dcf1a124babc2ce0b44cf74dffcfe7b**. The frontend was the installed working-tree build immediately preceding a1f3393838ca70c1502d0e1e65798d647a2fafbd, not an exactly frozen commit. The installed manifest timestamp was11:16:35 +05:30; later backend-only changes did not rebuild it. Source guide flags were not changed after recording to imply broader validation.

[Full media QA](../../artifacts/firecrawl/qa/media-QA.md), [immutable manifest](../../artifacts/firecrawl/qa/manifest.json), [cue provenance](../../artifacts/firecrawl/qa/provenance-limits.json) and [export workflow](../../artifacts/firecrawl/qa/EXPORT-WORKFLOW.md) retain the exact evidence, limitations and reproduction steps. No source test suite was rerun for this media/documentation delivery; prior implementation checks remain historical in local-validation.md.

| File | SHA256 |
| --- | --- |
| nova-firecrawl-original.mov | 8dfb8984e949dfe4d275edea3e00c435679c941f4dd1b6733bd965ed94b4f816 |
| nova-firecrawl-silent.mp4 | 8cfd3e8e3936445becd1f1a6256b2dc0eb509ac6cf5b99c1920611850484179d |
| nova-firecrawl-clicks.mp4 | 02a8dc266848d16447134e8c63709f8e32b72b38839297772041a2c5ec10df28 |

Git LFS tracks only these three primary media paths. Independent HTTPS recovery has now passed for media commit `85dced1ee86d8c997411163b8532b519fe23d493`: a fresh clone with smudge disabled used a previously absent isolated LFS store, downloaded and checked out all three objects, matched every size/SHA256 against the accepted local recordings, and returned `Git LFS fsck OK`. No local media or cached LFS objects were copied. See [remote-recovery.json](remote-recovery.json) for the exact recovery paths, setup notes and checks. The receipt-only commit is pushed afterward; the coordinator confirms its final local/remote/recovery HEAD equality separately.
