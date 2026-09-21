# Creem validation log

- Shared test suite:233 tests passed after all repairs; affected post-settling tests117 passed. Normal and capture builds passed. Theme fixture passed320/400/480px, dark question cards, working timeline,Chat default,no horizontal overflow; other domains unchanged.
- Live rehearsal1: Nova created Vector Business and TEAMS20, revised the same product to21 days. Early asynchronous route snapshots caused redundant clicks rejected as unavailable; no duplicate records. Fixed common view settling to650ms and documented route waiting.
- Live rehearsal2: Nova created Vector Studio, reopened it, then updated the same ID from7 to14 days with no confirmation. STUDIO15 saved without confirmation and Nova reopened the discount to verify its exact product relationship. Nova stopped and resumed a read-only Home summary successfully.
- A development backend restart after the second product save reset that conversation. The product was independently confirmed persisted before reconnecting. This was outside the final take; partial traces and the later complete revision/offer trace were exported. Do not restart the backend during a take.
- Initial catalog creation was classified sensitive by the planner in one rehearsal. Site guidance now correctly classifies requested sandbox catalog records as changes, retaining real transaction/account boundaries. Subsequent revision and discount ran fluidly.
- Loading counts can briefly be absent or zero during route changes. Guidance requires loaded evidence; no universal asynchronous-site guarantee is claimed.
- Capture preflight: native3024×1716,30fps; fresh-launch check also captured3024×1714 before window settled. Actual final dimensions must be probed, not assumed. System cursor disabled via ScreenCaptureKit; Nova action label/ring/cursor hidden by capture build. Character-paced input verified in decoded frames. Native side panel,Chat default,launcher hidden on open/restored on close.
- Preflight export:30s,900frames,2 operator and4 Nova taps. Decoded audio onset error0ms,minimum waveform correlation0.999721,non-click silence peak0. Video stream copied unchanged on audio mux. Only the complete browser debugging row is covered; no account/privacy masks.
- Exact approved audio provenance: retained Bolna LFS SHA256 c656ad78874030216801528e0d6e38481bea73cd0b0c6e73c7e98c4154dc5347. Current band_noise/click_sound functions are AST-identical;48kHz stereo,seed2071,gain1.6,cap0.30,same actor pan. Reconstructed approved peak-13.53dBFS matches its report; first decoded tap correlation0.999815. No new effect selected.

Measured real rehearsal1: initial user message→first action4.049s;→grouped card12.781s; Help me choose→remaining card6.432s; final card submission→saved product response41.516s; revision43.258s including confirmation/operator time. Discount included a long operator implementation pause awaiting confirmation, so it is not presented as pure model latency. Configured gpt-5.6-sol retained. Final actual timings will be added from the final session, separate from edited duration.

- Final attempt1 was stopped after a natural-language revision exposed a narrower approval parser: “give teams21 days to try it” did not contain “update.” Added a generic observed-trial-editor rule with7 regression cases, preserving negation, hypothetical/review/stop checks and sensitive boundaries. The exact wording passed through Nova: saved/reopened Scale at21 days, with price/description retained and no confirmation. No failed result will be represented as completed.

- Test portability: the pointer-receipt test initially relied on a Node-provided navigator global. Its browser mock now supplies navigator.platform explicitly;233 tests pass on the current runtime. No browser behavior changed.

- Latest user direction supersedes cursor-free capture: only Nova's action cursor
  should be visible. Shared capture flag added on main353f9d3; scoped Creem
  pointer/label/ring use #cfc2fa. Three isolated modes passed, including a black
  incoming accent to prove Creem stays lavender. Live catalog preflight shows the
  visible lavender cursor while ScreenCaptureKit excludes the physical pointer.
  Only one Chrome tab is open. The stopped Growth take is superseded.
- In that stopped take, an unnecessary delivery inspection targeted a covered
  catalog control behind the product drawer. Nova did not loop; the actual saved
  product and trial were independently verified. Guide now checks requested fields
  and drawer controls, without unrelated attachment checks for this subscription.

- Revised cursor preflight exported35s/1050frames with3 operator and3 Nova taps. Decoded onset error at most0.020833ms,minimum tap correlation0.999659,non-click silence peak0. The decoded final frame shows lavender Nova pointer/ring/label, no physical pointer, only the Creem tab, and the complete debugging row concealed. The unedited source is3024×1714 at30fps.

## Retained final take

The continuous final session saved and reopened Vector Teams at USD99/month,
14-day free trial, then revised the same ID to21 days. It created and reopened
Teams Welcome / TEAMSTART20:20% once, exact Teams product link,0/50,no expiry.
The three closing requests calculated79.20 before tax, confirmed Starter/Pro
remain outside the offer, and opened Home to report the actual sandbox figures.
No operator website action or private website API completed Nova's work.

Two attempts to dismiss an already disappearing creation confirmation were
rejected as unavailable before dispatch. Nova then opened the saved discount
and verified it. Both failed steps remain visible at normal speed, with no tap
added for either rejected attempt. This is a recovered transient obstruction,
not a claim of flawless or exhaustive coverage.

Real measured final timings, from message and click receipts:

| Interval | Seconds |
| --- | ---: |
| Opening request to first dispatched action |3.559|
| Opening request to first grouped card |12.226|
| Help me choose to remaining-questions card |7.404|
| Final card submission to saved/reopened product response |36.102|
| Trial revision to saved/reopened confirmation |21.158|
| Connected offer to saved/reopened confirmation |53.257|
| Invoice arithmetic response |3.682|
| Other-plan scope response |2.564|
| Home request to loaded activity summary |13.874|

The configured gpt-5.6-sol model was retained:41 calls,336488 input tokens
(155759 cached),4673 output tokens. Screen time is not reported as latency.
Raw duration304.633s/9139 frames. Edited duration287s/8610 frames:13.5 seconds
of documented operator idle compressed and4.133s of unused tail trimmed.
All Nova execution, recovery and operator typing remain1× speed.

Capture has one Creem tab, Home initially visible with Nova closed and no
debugger row. Only Nova's lavender action cursor is visible. Raw3024×1714;
edited2748×1714 at30fps removes only276 columns of empty recorder padding,
verified across all9139 source frames. Browser pixels are not rescaled.
The only mask is the complete browser debugger row, source frames949 onward, with per-frame heights during its opening animation.
Main2ddbe3c adds optional padding crop support; three regression checks passed,
including a decoded synthetic padded-source export. All other theme/build
checks above remain applicable; only the video editor changed afterward.

Limitations: these are sandbox catalog/offer workflows. Product description
entitlements are scenario text; no delivery backend was configured.79.20 is
conditional on redeeming TEAMSTART20, not a real issued invoice. Live payments,
external recipients, usage ingestion and production onboarding were excluded.

Decoded final audio verification passed for all50 actual clicks (22 operator,
28 Nova): maximum onset error0.104167ms, minimum tap correlation0.999608,
non-click silence peak0, decoded peak0.220796 (no clipping). Video stream hash
matches the silent export exactly. Inspected the decoded frame at every mapped
click, the opening, progressive typing, saved outcomes and final Home summary.
The only retained media are the original raw, silent edit and click-only edit.
Failed takes, preflight videos, scratch audio containers and temporary theme
screenshots were removed after verification; useful text evidence remains.

A final boundary audit found the debugger text already visible in the partial
row at source frames949–950, before the full-height detector triggered. The EDL
now masks36px at949–950,92px at951, then104px from952, all starting at y158.
The Test mode banner stays visible during the animation. The corrected exports
were decoded and reverified before final delivery.
