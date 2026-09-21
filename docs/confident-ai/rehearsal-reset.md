# Confident rehearsal and final baseline checklist

Historical pre-capture checklist, updated 22 September 2026. The final take has now added both boundary cases, for eight observed records. Do not execute the six-case creation plan again; inspect current exact inputs and reuse existing records. Independent final-tag verification passed; media QA is recorded separately.

The coordinator alone owns browser, runtime and recorder. All preparation occurs outside the final take. Saved evidence and retained failures are in [live-verification.md](live-verification.md).

## Preserve existing records

Keep the existing Northstar prompt and dataset in Vector / My first project. The saved prompt `ecd3bf0` asks one missing detail at a time, preserves all policy rules, one `{customer_message}` variable, warm tone and a 120-word limit. This is the final prompt baseline; do not reset it unnecessarily.

Six goldens are verified: standard jacket at 18 days with receipt, personalized-flask change of mind at 10 days, damaged mug at 5 days, unused jacket with unknown delivery date, unused standard jacket at 31 days with receipt, and personalized flask damaged six days after delivery. Preserve their Inputs, Expected Outputs, tags, IDs and blank execution fields. Do not reset, delete or attempt inline edits of them. Nova's approved pencil and inline-cell editor attempts did not succeed.

## Second creation rehearsal — saved with recovery

The coordinator independently reopened both new Edit Golden forms, verified exact Inputs/Expected Outputs and the requested tags, and confirmed blank Actual Output:

- `cmubo3f8x001dki0t52jmmpnm`: “My unused standard jacket was delivered 31 days ago and I have the receipt. Can I return it?”; tag `window-boundary`.
- `cmubo5jww000xmh0tboexaj5b`: “My personalized flask arrived damaged six days after delivery. What should I do?”; tag `damage-review`.

Nova reloaded and verified six saved cases. This was a multi-request recovery, including an unnecessary tag gate, a stale approval and one approved Save; do not call it a clean autonomous pass. The final request uses “delivered exactly seven days ago and arrived damaged” and puts “Tag them …” in a separate sentence to avoid the observed conditional-word limitation. Existing cases need no edits or deletion.

## Final baseline

1. Keep the six goldens intact. The final creates the distinct exactly-30-day standard jacket and exactly-7-day damaged standard mug; no previous record needs deletion or reset.
2. Reset only the same dataset alias from Readiness to **Northstar Returns Coverage**, using its observed alias editor and Save; reload to verify persistence and the same dataset ID/count.
3. Verify the one-question-at-a-time prompt and 120-word limit. Its final grouped revision and later 100-word revision must be real useful changes. Preserve commit history.
4. Return to normal project Home, establish a fresh Nova session with one target tab and panel closed, and freeze backend `94debcde941dcb30de7e3b89aebf26f963b109d9` with extension `b7e3172` for the take. Documentation/source-guide commits do not imply runtime reactivation. Check actual Nova cursor, theme, focus and launcher before capture.
5. Follow [demo-script.md](demo-script.md). Final target is eight unique saved cases; no scores, Actual Output or evaluation run is claimed.

If an interrupted create may already have saved, inspect its exact Input/ID before trying again. Never repeat creation solely because the agent's final report was inconclusive. If a final target already exists, stop and reconcile the script rather than duplicating it.

## Evidence and stopping rules

Record actual task IDs, prompt commits, runtime hashes, first-progress/action/final-reply timestamps, independent reopen results and recoveries. A final reply is not persistence proof. Keep raw sessions private.

Do not use paid versioning, branching, trial/upgrade, provider setup or evaluation to fulfill the take. Stop for unresolved save failure, duplicate record, wrong project, exposed secret, extra target tab, missing/duplicated Nova cursor or visible operator/system pointer. Never secretly repair an on-camera Nova result with operator input or edit retained failures into apparent success. Recording, audiovisual QA and backup remain pending until verified.
