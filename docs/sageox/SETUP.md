# Run and recover the SageOx experience

Use the private repository’s `sageox-nova` branch. It was created from main; only
reusable engine/verification/recording changes were promoted to main. The customer
profile, palette, fixtures and media remain on this branch.

## Local setup

1. Install Node 20.19+ and the repository dependencies with `npm ci`.
2. Keep provider credentials in the ignored `.env`; use `.env.example` for names.
   Do not commit or copy pairing tokens or browser state.
3. Run `npm run build` and `npm test`; then `npm run dev` for the local dashboard.
4. Load `web/dist-extension` as the Nova unpacked extension in the intended Chrome
   profile, reload the extension after a rebuild, and reconnect to the local backend.
5. Launch SageOx from its Nova dashboard card. Only explicitly launched/attached
   tabs receive Nova. Use the signed-in team selected by the owner.
6. The customer site store is ignored `BE/data/sites.sageox.json`. Existing owner
   edits must be preserved; compare a saved baseline before applying guide updates.

The delivered build remains the SageOx branch. Chat is the default; Live talk was
not used. No microphone access is needed for pasted VTT. Keep the actual browser
security indicator enabled. Capture/edit redaction never disables browser security.

## Reproduction

Use DEMO-SCRIPT.md and the exact timestamped VTT fixture. Inspect existing terms
and the exact discussion title before creating anything. Reuse a matching saved
record instead of duplicating it. The source has two fictional speakers and four
20-second turns. Verify the 01:20 transcript independently of Summary processing.
Processing is asynchronous; no fixed completion time is promised. Plans in the
observed account require a coding session; no browser plan creation was claimed.

For capture and rendering, see `scripts/video/README.md` and `recording/`.
Recorder masks were measured for the retained 3024 × 1776 window; remeasure if the
window, zoom, sidebar width or website layout changes. Do not reuse pixels blindly.

## Private media recovery

Install Git LFS, clone the existing private repository with your own GitHub access,
checkout `sageox-nova`, and run `git lfs pull`. Exactly three named media files are
tracked. Compare them against `recording/checksums.sha256` using `shasum -a 256 -c`.
The final delivery report records remote branch placement and an independent fresh
LFS recovery check. Runtime observations, credentials and account identities are
excluded from source control.
