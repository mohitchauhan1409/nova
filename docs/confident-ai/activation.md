# Reproduce the recorded Confident runtime

The captured runtime was deliberately split: extension/frontend commit `b7e31723147e0b79d5e181796e7e2edaa82702b9` and backend commit `94debcde941dcb30de7e3b89aebf26f963b109d9`. Source/docs checkout `49368c4` at capture and subsequent commits do not change the already loaded runtime. The recorded extension was version 0.7.1; its archived build SHA-256 was `28e1152748e9f193067e8f2abf8296b4551d73bd0e142e5438a3edd567249e96` (205,031 bytes).

These commands are a future activation recipe, not operations performed during documentation. Run only after the current session/recorder is stopped and ports 8787/5173 are free. Use Node.js 20.19+ and the authorized Chrome profile. Start in a clone containing both commits and an already authorized ignored `.env`; no secret values belong in commands, docs or Git.

## Isolated checkouts and frozen frontend

```sh
nova_repo="$PWD"
nova_replay_root="$PWD/../Nova-confident-recorded"
mkdir -p "$nova_replay_root"
git worktree add --detach "$nova_replay_root/extension" b7e31723147e0b79d5e181796e7e2edaa82702b9
git worktree add --detach "$nova_replay_root/backend" 94debcde941dcb30de7e3b89aebf26f963b109d9

cd "$nova_replay_root/extension"
npm ci
NOVA_RECORDING_MODE=true NOVA_RECORDING_SHOW_ACTION_CURSOR=true npm run build
```

Both flags must be on the same `npm run build`: they configure Vite and the extension bundler. Recording mode hides the operator/system pointer while `NOVA_RECORDING_SHOW_ACTION_CURSOR=true` retains Nova's actual action cursor. Recording mode alone also suppresses Nova's action cursor. The build produces the ignored `web/dist`, `web/dist-extension` and `web/releases` outputs. Its local extension ZIP is an installation output, not a fourth delivered recording. ZIP metadata/build time can differ on rebuild; the captured archive hash identifies the original build, not a promised byte-for-byte reproducible ZIP.

## Backend, authorized credentials and local dashboard

```sh
cd "$nova_replay_root/backend"
npm ci
install -m 600 "$nova_repo/.env" .env
cp -R "$nova_replay_root/extension/web/dist" web/dist
cp -R "$nova_replay_root/extension/web/releases" web/releases
NOVA_RECORDING_MODE=true NOVA_RECORDING_SHOW_ACTION_CURSOR=true npm start
```

The backend runs `tsx BE/src/server.ts`, serving the frozen frontend locally at `http://127.0.0.1:8787`. Do not run `npm run build` in the backend checkout and then load its newly generated extension as though it were the recorded b7e3172 build. The isolated backend keeps its own ignored `BE/data` site store and pairing state; there is no data-directory environment override. Do not copy live pairing tokens or dump runtime state into version control.

In the authorized Chrome profile, load/reload **only** `$nova_replay_root/extension/web/dist-extension` through the normal extension UI. Open the local dashboard, confirm pairing/version, choose Confident AI, and verify Vector / My first project. Stop any earlier active Nova session before opening another. Do not rebuild or reload during a take.

## Guide and saved-object boundaries

The backend at 94debcde includes the two trusted normal-navigation links for the existing Northstar prompt and dataset and the prompt-index omission rule. A fresh isolated site store initializes from that source. A reused store preserves owner-edited instructions; compare at a stopped checkpoint rather than replacing it blindly. The later source guide correction `8dd383a` documents the failed pencil/inline editor path and prefers validated New Golden creation; it was available in source but was not loaded into the frozen recorded backend. Activating a later guide/backend is a new configuration and requires affected revalidation.

The account now has eight saved task-owned goldens and prompt `5fb11cb`; activation does not reset that account state. Inspect [verification/synthetic-objects.json](verification/synthetic-objects.json) and the live UI before any new task. Reuse matching inputs; do not recreate the two final boundary cases or delete previous cases to replay footage. The final recording used ordinary dashboard actions, not hidden account APIs or executable website macros.

For capture, retain Nova's actual action cursor and use the recorder's `--hide-cursor` option for the system pointer; see [shared recording instructions](../../scripts/video/README.md). Media editing and approved-tap verification are separate from activation. Only the three linked recording deliverables in the repository README are primary artifacts.
