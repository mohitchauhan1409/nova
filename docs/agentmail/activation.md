# AgentMail activation and persisted-guide synchronization

This is the reproduction procedure for the isolated `agentmail-nova` worktree. Only the live-session owner activates it. Finish any running Nova task, finalize the recorder, retain session/click evidence, and stop the previously owned backend before a handover. One backend, one installed extension and one browser owner are active at a time.

## Recorded implementation identities

| Component | Identity in successful final take 2 |
| --- | --- |
| Backend in successful final take 2 | `f78542b53572fb953828c3d704b1583e6157d214` |
| Main integrated for the editor-opening guard | `2d2b1e4` (includes `3eed` asynchronous editor preflight guard) |
| Trusted AgentMail guide revision | `192283688190f2ace9e151f16d6d3f537ab3663d` |
| Extension source build | `d2d6325c657f3b5f45f326db56565300e26826bd` |
| Extension ZIP SHA-256 | `38be34e27e224b1f52c9e547ac1d3ec14b57d477d2f807e47968303720fc3616` |
| Extension release | 0.7.1; 204,964 bytes; built 2026-09-21 at 18:13:42.104 UTC |

The later changes were backend/guide-only, so the coordinator retained the existing extension bytes. A source commit does not identify the installed extension by itself. Rebuilding may produce another archive hash; record its actual `web/releases/extension.json`, source revision and ZIP checksum instead of reusing the historical hash above.

## Per-worktree build and data

Run commands from the AgentMail worktree, never the original checkout or another startup's directory:

```sh
cd /Users/macbook/Desktop/Nova-batch-20260921/worktrees/agentmail
NOVA_RECORDING_MODE=true NOVA_RECORDING_SHOW_ACTION_CURSOR=true npm run build
```

Use Node 20.19 or newer and this worktree's dependencies. If dependencies are absent, install from its lockfile during a safe preparation window. `npm run build` runs TypeScript checking, the production dashboard build and extension packaging. It replaces this worktree's ignored `web/dist`, `web/dist-extension` and `web/releases`; never run it during capture or while another session depends on those output files. Both recording flags are needed to retain click receipts **and** the visible Nova action cursor.

`BE/src/config.ts` derives the root from its own module location. It loads the worktree's ignored `.env` and fixes `dataDir` to that same worktree's `BE/data`; it does not accept a data-directory environment override. AgentMail selects `BE/data/sites.agentmail.json` through `BE/src/sites/customizations.ts`. Pairing state is local to that worktree too. Sessions and conversations are in memory and end on backend restart, so export required evidence first. Keep provider credentials, pairing tokens, local data and session dumps out of Git and video. Do not print them to establish identity.

## Why an existing site store needs an explicit guide update

`SiteStore` initializes a missing store from trusted source profiles and adds a missing site. It preserves the instructions and flows of an already saved matching site. Consequently, editing `BE/src/sites/agentmail.ts` or restarting the backend does **not** replace an existing AgentMail guide. Do not delete the store to force an upgrade: that would discard owner edits and local observations.

The observed draft-row behavior requires this exact rule from the trusted profile:

> Draft subject rows open an editor with one single click. Never double-click a draft row: each click can open another composer for the same draft. After clicking once, wait and inspect for Edit Draft before any further activation; reuse an already-open matching editor. For every saved verification, reopen with one single click only.

The coordinator synchronized that sentence into the ignored AgentMail store while the backend was stopped. An initial single-click check passed, but the first full take later opened two composers through two separate single clicks while the editor appeared asynchronously. Guide wording alone did not prevent that repeated activation. Shared guard `3eed`, merged through main `2d2b1e4` into backend `f78542b53572fb953828c3d704b1583e6157d214`, adds a pre-action check for a newly appearing editor. The coordinator reports 89 focused tests passed; this documentation worker did not run them. On that backend, the open-for-review regression completed four verified steps and the coordinator independently confirmed exactly one unchanged composer. The close/reopen regression also passed: two verified steps and the coordinator’s AX check confirmed exactly one Edit Draft with the same recipient, subject and unfinished body. Final recording/export QA remains separate.

For another existing store, compare the saved AgentMail instructions/flows with the reviewed source profile while stopped. Preserve owner edits and patch only the approved difference. The following optional offline command performs **only this exact single-click insertion**, using the trusted local profile as its source. It refuses an unexpected anchor or an ambiguous AgentMail entry, leaves an already current guide alone, and preserves every other profile field. Run it only in the stopped AgentMail worktree; it is a reproduction command, not part of startup automation.

```sh
./node_modules/.bin/tsx --input-type=module <<'JS'
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { agentmailProfile } from './BE/src/sites/agentmail.ts';

const filename = 'BE/data/sites.agentmail.json';
const original = readFileSync(filename, 'utf8');
const sites = JSON.parse(original);
const matches = sites.filter(site => site.id === 'agentmail' &&
  new URL(site.url).hostname === 'console.agentmail.to');
if (matches.length !== 1) throw new Error('Expected one saved AgentMail profile.');
const saved = matches[0];
const rule = agentmailProfile.instructions.match(
  /Draft subject rows open an editor with one single click\.[\s\S]*?For every saved verification, reopen with one single click only\./
)?.[0];
if (!rule) throw new Error('Trusted profile does not contain the reviewed rule.');
if (saved.instructions.includes(rule)) {
  process.stdout.write('Saved AgentMail guide already contains the reviewed rule.\n');
} else {
  const anchor = 'Open the intended inbox and inspect Drafts before starting, using the exact subject, recipient and inbox to avoid duplicates.';
  if (saved.instructions.split(anchor).length !== 2 ||
      saved.instructions.includes('Draft subject rows open an editor')) {
    throw new Error('Saved guide differs; review its owner edits before merging.');
  }
  const backup = `${filename}.before-guide-sync-${Date.now()}`;
  writeFileSync(backup, original, { mode: 0o600, flag: 'wx' });
  saved.instructions = saved.instructions.replace(anchor, `${anchor} ${rule}`);
  const temporary = `${filename}.guide-sync-${Date.now()}.tmp`;
  writeFileSync(temporary, JSON.stringify(sites, null, 2), { mode: 0o600, flag: 'wx' });
  renameSync(temporary, filename);
  process.stdout.write('Updated only the reviewed AgentMail instruction; local backup retained.\n');
}
JS
```

This command does not synchronize arbitrary future guide or flow changes, change verification flags, or launch Nova. Review future differences individually through the normal website configuration UI or an equally scoped stopped-store edit. Do not overwrite the entire saved profile from source, and do not import an unrelated startup's data. Keep the local backup private and retain it until the saved guide and live behavior are verified.

## Start, reload, pair and launch freshly

After the prior backend has stopped and any guide synchronization is complete, start the AgentMail backend from its own directory:

```sh
cd /Users/macbook/Desktop/Nova-batch-20260921/worktrees/agentmail
npm start
```

Use the normal loopback address `http://127.0.0.1:8787`. This extension setup expects port 8787; do not launch multiple startup backends or quietly move one to another port. Keep the owning terminal running. Preserve the configured model strategy and local provider setup rather than changing credentials or models for activation.

In the authorized Chrome profile, use `chrome://extensions` to load this worktree's `web/dist-extension` through **Load unpacked**, or use **Reload** on that exact existing extension card after an extension rebuild. A backend-only restart does not rebuild browser code; retain and record the already verified extension identity when appropriate. Reloading or switching a checkout alone does not synchronize an existing site store.

Open [Nova setup](http://127.0.0.1:8787/#setup), refresh it after activation and verify the available/installed extension relationship. Dashboard launches pair automatically. If manual pairing is necessary, use the setup page's private advanced pairing flow; never place the token in this document, shell history, committed files or footage.

Close the previous task-owned AgentMail tab after preserving its state, then launch AgentMail freshly through its Nova dashboard card. Verify the actual hostname `console.agentmail.to`, the intended signed-in organization/pod, the correct backend pairing and the dark AgentMail theme. For each final take or restart, use normal Overview, Nova initially closed, one target tab in the recording window, and no pre-existing debugger row. Preserve unrelated user work outside that recording window. Open the panel with its floating launcher.

Before freezing a new setup, verify an actual single-click draft-row opening, saved/reopened results for affected flows, startup-matched panel/launcher/cards, one accurately anchored white Nova arrow/label/ring, and absent system/tool pointers with ordinary text carets retained. A screenshot, a successful build or an extension version alone does not prove those behaviors. See [live-verification.md](live-verification.md) and the [current script](demo-script.md) for recorded coverage and known failures.

## Final QA status

The second take completed successfully on backend `f78542b53572fb953828c3d704b1583e6157d214` with the unchanged extension identified above. The coordinator independently confirmed saved/reopened metadata, same address, one editor, the correct October 5 draft, two total drafts, preserved reference, and no sending or scheduling. The failed first take remains explicitly documented in [live-verification.md](live-verification.md); its footage is not included in final deliverables.

Untouched raw, silent edit and approved-click edit are complete. Native canvas and 1× typing/Nova motion are preserved; the actual animated debugger row and 37 real click receipts drove the edit. Local render/decoded audio checks and independent numerical review pass. Targeted independent visual review is finishing; remote LFS recovery remains coordinator-owned and is not claimed until independently checked. [Delivery README](README.md) and [final QA report](evidence/final-qa-report.json) contain exact files, hashes, timing, evidence and bounded coverage. Later source merges must retain these captured backend/extension identities separately from the eventual delivery commit.
