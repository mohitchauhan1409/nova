# Inngest Local recording script

## Opening

Show one Chrome tab at `localhost:8288/events`, the Development Server label, an empty fresh event list, and the Nova panel.

## Flow 1 — completed release review

1. Ask Nova to send the exact `nova/release.review.requested` fixture for `final-release-01`.
2. Show progressive entry in the structured editor.
3. Review the question card and concrete action confirmation.
4. Confirm once.
5. Open the exact `northstar-release-review` result in the attached tab.
6. Hold on Completed, `validate-release`, `compose-summary`, and Nova's evidence summary.

## Flow 2 — intentional risk failure

1. Start a new Nova conversation and ask for the exact `nova/risk.review.requested` fixture for `final-risk-01` with `mode: fail`.
2. Show progressive input and both confirmation layers.
3. Confirm once and wait for the one retry to finish.
4. Open the exact `northstar-risk-check` run and `validate-risk` step.
5. Hold on Failed, `1 retry`, `SYNTHETIC_RISK_REVIEW_FAILURE`, and Nova's diagnosis.
6. End without using Rerun or Rerun from step.

## Editing

Preserve the original. Shorten only operator review holds. Keep Nova execution, progressive typing, the retry wait, and evidence reading at real speed. The silent export has no audio; the click-only export uses only frame-verified mechanical taps.
