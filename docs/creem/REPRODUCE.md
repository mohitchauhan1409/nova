# Run and reproduce the Creem experience

Use the private `creem-nova` branch. Keep existing ignored backend credentials.
With Node20.19+ and installed dependencies, run `npm run dev` in the repository.
Build with `NOVA_RECORDING_MODE=true NOVA_RECORDING_SHOW_ACTION_CURSOR=true npm run build`, then reload the existing Nova
unpacked extension from `web/dist-extension` in signed-in Chrome. Normal product
builds omit that environment variable and retain the normal action cursor.

Open the local Nova dashboard (`http://127.0.0.1:5173`), choose Creem → Open with
Nova, and use the native browser side panel. The target is
`https://www.creem.io/dashboard/home`. Creem access has been explicitly authorized.
The existing Vector-Os store must remain in Test mode. Do not complete production
onboarding, change accounts, or repeat sandbox checkouts in live mode.

`BE/src/sites/customizations.ts` registers the declarative profile and isolated
`sites.creem.json` local store. Existing owner profiles are preserved. The theme
is scoped to creem.io in `web/src/panel/customization.css`; the launch pill is
scoped in `web/companion/customization.ts`. No private website API or click macro
is used. The exact prompts and outcomes are in DEMO-SCRIPT.md.

Validation commands:

```sh
npm test
NOVA_RECORDING_MODE=true NOVA_RECORDING_SHOW_ACTION_CURSOR=true npm run build
npx tsx scripts/creem-theme-check.ts
npx tsx scripts/creem-session-report.ts session-label
```

Do not edit watched backend modules or restart the backend during an active
session. Export its messages/traces before any development restart.

Recording:

```sh
swiftc scripts/video/record-window.swift -o /tmp/nova-record-window
/tmp/nova-record-window list
/tmp/nova-record-window record WINDOW_ID output.mov --hide-cursor
```

Use the observed window ID, preserve the emitted first-frame epoch, and stop with
Return. Fresh-launch for every take; close only the prior task-owned tab. Verify
Home, closed Nova, visible launcher, correct signed-in window and no existing
debugging bar. Close every other browser tab. Use character-paced input, keeping all Nova actions at normal speed.
The final capture manifest records the actual resolution. Do not apply capture
masks. Only edited copies conceal the complete browser-owned debugging row.

Editing uses the retained frame EDL and source-to-edited cue map. The reusable
`edit-recording.py` can create the silent export with an empty clicks array; its
extra scratch audio container is temporary and must be removed. Then use the
unchanged `add-click-sounds.py` renderer and `verify-click-export.py`. The exact
final cue file includes actual operator/Nova receipts, frame mapping and evidence.
No sound is assigned to typing, scrolling or thinking. Review decoded frames as
well as automated audio checks. The raw recording remains untouched.

The final EDL removes only empty right-hand capture padding:2748×1714 exported
from a3024×1714 canvas, with no scaling of browser pixels. Padding was checked
across every source frame. This optional generic editor feature is on main.
To reproduce into fresh output filenames, run:

```sh
python3 scripts/video/edit-recording.py artifacts/creem/final/nova-creem-raw.mov artifacts/creem/final/edit-plan.json silent-rebuild.mp4 scratch-rebuild.mp4
python3 scripts/video/add-click-sounds.py --source silent-rebuild.mp4 --cues artifacts/creem/final/click-cues.json --output clicks-rebuild.mp4 --report sound-rebuild.json
python3 scripts/video/verify-click-export.py clicks-rebuild.mp4 artifacts/creem/final/click-cues.json decoded-rebuild.json --fps 30
```

The audio utilities require NumPy. Remove the temporary scratch container after
verifying the recreated outputs. These commands refuse to overwrite media.

Only raw, final silent and final click-only media are retained. Git LFS handles
those exact paths on the startup branch. BACKUP.md records verified remote refs,
media hashes and independent-cache recovery; ordinary local commits alone are
not a verified backup.

Latest cursor preference: only Nova’s website-rendered action cursor is visible. The Creem override uses #cfc2fa consistently for the pointer, label surface and ring, regardless of observed page accent. The physical/operator cursor remains excluded by --hide-cursor.
