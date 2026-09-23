# Requesty synthetic baseline

## Objects

Every run uses unique names beginning with `nova-demo-`:

- Policy: `nova-demo-triage-fallback-[run]`
- Prompt: `nova-demo-triage-prompt-[run]`

Rehearsal and final suffixes are chosen only at run time and supplied in the user request or focused answer; they are not hidden runtime answers.

## Policy shape

- Strategy: Fallback.
- Primary and fallback: exact visible rows supplied by the user or chosen after the user delegates selection.
- Attempts: visible default unless the user requests a supported change.
- Provider/region: read from the selected rows.
- Execution: never; saving configuration does not authorize inference.

## Prompt shape

- One SYSTEM message classifies only synthetic support text.
- Output is a bounded JSON object such as `severity`, `summary`, and a user-approved third field.
- The message explicitly prohibits contacting people, using external tools, or processing real customer data.
- The new policy is selected only if the exact saved policy is visible in optional Model search.
- Parameters retain product defaults unless the user explicitly changes one.

## Reset and cleanup

Objects are isolated by unique suffixes, so rehearsals do not overwrite one another. Do not delete them during the unattended batch because deletion requires a separate protected confirmation. No traffic or spend state needs reset.
