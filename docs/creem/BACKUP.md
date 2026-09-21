# Verified private backup

Repository: [mohitchauhan1409/nova](https://github.com/mohitchauhan1409/nova), verified private.
Branch: [creem-nova](https://github.com/mohitchauhan1409/nova/tree/creem-nova).
Verification time: 2026-09-21T03:54:44.512922+00:00.

- Remote main: `2ddbe3cd8a68707985506745101728a0f6ca188c`.
- Remote code/media commit: `98bb1b74dfe469292a0e8d18dd15b4986fd24d2e`.
- This verification document is committed afterward on the same branch; it does not change the recovered videos.
- The startup commit includes main. The independently fetched main tree contains no Creem/Bolna asset paths or artifacts directory.
- The startup tree contains exactly the three video paths below. All three LFS objects were downloaded into a newly initialized, independent Git/LFS cache and checked against their remote pointer OIDs, byte counts and SHA-256 values. No Git alternates or primary workspace LFS cache was used.

All media paths are under `artifacts/creem/final/`.

| File | Bytes | SHA-256 / LFS OID |
| --- | ---: | --- |
| `nova-creem-raw.mov` | 55,534,676 | `45a0e36852719eb202920f86c0b90af9bac76e166bce98ac7df6ea4084c0db1c` |
| `nova-creem-silent.mp4` | 16,422,889 | `d112ff124bcb0018b952645c58b7e06dda596f572426c59d5a86130e828c7a5f` |
| `nova-creem.mp4` | 16,850,479 | `a94883514c9af5166575e8c7e54f6c4f9c8a4b9aa121d81218e4a90ec12c3884` |

The raw source is unchanged. Both final edits are 287 seconds, 8,610 frames at 30 fps, 2748×1714 native browser pixels. The raw canvas is 3024×1714; only empty capture padding is cropped from edits. The approved click-only export has 50 evidenced taps. See [validation](VALIDATION.md), [script](DEMO-SCRIPT.md) and [reproduction](REPRODUCE.md).

## Recovery

Use normal GitHub authentication for this private repository; no credentials belong in commands, source files or recordings.

```sh
GIT_LFS_SKIP_SMUDGE=1 git clone --branch creem-nova https://github.com/mohitchauhan1409/nova.git nova-creem-recovered
cd nova-creem-recovered
git lfs pull --include='artifacts/creem/final/nova-creem-raw.mov,artifacts/creem/final/nova-creem-silent.mp4,artifacts/creem/final/nova-creem.mp4' --exclude=''
shasum -a 256 artifacts/creem/final/nova-creem-raw.mov artifacts/creem/final/nova-creem-silent.mp4 artifacts/creem/final/nova-creem.mp4
```

Compare with the table above. The machine-readable independent recovery evidence is `artifacts/creem/final/backup-verification.json`.

## Branch separation

Main contains the reusable trial-edit approval correction, route settling, recording flags and click receipts, physical-pointer capture switch, decoded audio verification, and native-padding editor support with regression checks. It retains the shared Nova experience.

The startup branch alone contains Creem branding and lavender cursor override, declarative guides and isolated site store, synthetic scenario documentation, live verification evidence, edit/cue plans and the retained videos. The installed Creem capture build remains ready with the action-cursor visibility flag enabled.
