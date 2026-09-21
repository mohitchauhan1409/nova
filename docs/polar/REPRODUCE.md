# Reproduce the Polar demonstration

Use `polar-nova` with the existing ignored provider credentials. The dedicated
profile store is `BE/data/sites.polar.json`; do not replace owner-edited profiles.
Keep the same configured models. No provider changes were made. After a fresh
clone, run `npm ci` and restore the ignored local credentials through the existing
project setup. Credentials and runtime profile stores are intentionally absent
from the backup.

```sh
npm test
NOVA_RECORDING_MODE=true NOVA_RECORDING_SHOW_ACTION_CURSOR=true npm run build
npm run dev
```

Reload the existing unpacked
extension from `web/dist-extension` and launch Polar through the local Nova
dashboard. Use only the already signed-in Vector account. Do not substitute the
in-app browser or a different Chrome profile. Rebuilding alone does not reload
the installed extension.

Local fixture checks (not live website proof):

```sh
npx tsx scripts/polar-theme-check.ts
npx tsx scripts/video/recording-cursor-smoke.ts --url=https://polar.sh/dashboard/vectoros '--color=rgb(23, 23, 31)'
```

Review the measured live coverage in VALIDATION.md before expanding scope. For every
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
Final edit decisions and actual click receipts are in `evidence/final-edit.json` and `evidence/final-cues.json`. See BACKUP.md for independently recovered media hashes and remote refs.


## Rebuild the final export

The raw recording stays unchanged. The edit utility's legacy effect is not the approved tap, so its temporary audio output is discarded. Render the silent edit, then use the exact approved renderer:

```sh
python3 scripts/video/edit-recording.py artifacts/polar/media/nova-polar-original.mov docs/polar/evidence/final-edit.json /tmp/polar-silent.mp4 /tmp/polar-empty-audio.mp4
python3 scripts/video/add-click-sounds.py --source /tmp/polar-silent.mp4 --cues docs/polar/evidence/final-cues.json --output /tmp/polar-clicks.mp4 --report /tmp/polar-sound.json
python3 scripts/video/verify-click-export.py /tmp/polar-clicks.mp4 docs/polar/evidence/final-cues.json /tmp/polar-decoded.json --fps 30
```

Use Python with NumPy installed, plus FFmpeg/FFprobe. Existing outputs are not overwritten. The raw canvas is 3024×1714 at 30 fps; only right-side black capture padding is cropped, producing 2744×1714 native pixels. The debugger mask has four frame-specific entrance heights before its steady row dimensions. There are no privacy covers, voice, keyboard sounds or music.
