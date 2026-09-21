# Resume the Polar demonstration

Use `polar-nova` with the existing ignored provider credentials. The dedicated
profile store is `BE/data/sites.polar.json`; do not replace owner-edited profiles.
Keep the same configured models. No provider changes were made.

```sh
npm test
NOVA_RECORDING_MODE=true NOVA_RECORDING_SHOW_ACTION_CURSOR=true npm run build
npm run dev
```

Once Computer can inspect and click Chrome again, reload the existing unpacked
extension from `web/dist-extension` and launch Polar through the local Nova
dashboard. Use only the already signed-in Vector account. Do not substitute the
in-app browser or a different Chrome profile. Rebuilding alone does not reload
the installed extension.

Local fixture checks (not live website proof):

```sh
npx tsx scripts/polar-theme-check.ts
npx tsx scripts/video/recording-cursor-smoke.ts --url=https://polar.sh/dashboard/vectoros '--color=rgb(23, 23, 31)'
```

Complete the research and live checks in VALIDATION.md before recording. For every
take, close the old task-owned tab and freshly launch Polar through Nova; start
on Home with Nova closed, exactly one target tab and no pre-existing debugger
row. Preserve unrelated work in its own window in the same profile.

Use the existing `record-window.swift` with `--hide-cursor` and no privacy masks.
Keep Nova's own cursor enabled. Inspect actual capture geometry rather than
reusing any previous video's coordinates. Only the complete debugger row may be
masked in edited copies. Record real click receipts for both actors, preserve
normal Nova execution speed, and keep the raw source unchanged.

Use the unchanged tap renderer, source-to-edited cue mapping and decoded export
verification. Retain raw, silent and click-only videos on this branch alone and
verify an independent Git LFS recovery before claiming media backup is complete.
No media has been delivered at this checkpoint.
