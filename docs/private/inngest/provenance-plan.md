# Inngest evidence and provenance plan

## Sources of truth

- The Local Dev Server at `http://localhost:8288` supplies run, event, step, retry, timing, and error evidence.
- `fixtures/local-demo/server.mjs` defines the two synthetic functions and the intentional failure token.
- Nova session action steps identify verified navigation and execution actions without storing field values.
- The original capture is immutable; the frame EDL, click cues, and audio reports document every derived export.

## Required visible evidence

1. The address bar shows `localhost:8288` and the page identifies itself as the Development Server.
2. The exact event names and final synthetic IDs are visible before confirmation.
3. The release run is completed and both named steps are visible.
4. The risk run is failed, `validate-risk` shows one retry, and `SYNTHETIC_RISK_REVIEW_FAILURE` is visible.
5. Nova's summaries distinguish the intentional fixture failure from a product incident and state that no rerun occurred.

## Claim discipline

The recording proves only these local synthetic runs. It does not claim Production access, deployment, real telemetry, customer impact, or a successful rerun. Generated click sounds are post-production effects tied to recorded action timestamps or inspected frame transitions; they are not ambient audio.
