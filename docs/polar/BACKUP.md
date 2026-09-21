# Verified private code and media backup

Repository: [mohitchauhan1409/nova](https://github.com/mohitchauhan1409/nova).
Branch: [polar-nova](https://github.com/mohitchauhan1409/nova/tree/polar-nova).

Verified on 2026-09-21 after the completed Git and Git LFS push:

- Remote main: `b68a7be87338d8587528a8fa0f47d3eba2fd6b1a`.
- Remote Polar media payload: `6baec09b1b8499147ae7279c20fe8a45e5e87de8`.
- This attestation is committed afterward on the same branch. The media payload commit identifies the exact recovered source, edits, code and recording evidence.

A fresh HTTPS clone into `/private/tmp/nova-polar-final-recovery-20260921`
downloaded all three objects from GitHub into its own `.git/lfs` cache. No Git
alternates or LFS reference directories were used. Recovered bytes, sizes and
SHA-256 hashes match the final local media and committed LFS pointers.

| Media | Bytes | SHA-256 |
| --- | ---: | --- |
| nova-polar-clicks.mp4 | 28026626 | `201f758acb54450cd5b555a52b027ca8f857c301c71af2b2cfbe3c0c76c85653` |
| nova-polar-original.mov | 108027659 | `51d3d3c9df1522a9b5f976b1d6494d70fee1c100a51daae92cef27bc016cf85e` |
| nova-polar-silent.mp4 | 27299236 | `d033952fbea00a7555e27c43247cac0a27be5a4aa7de42452c39c1af85a35f3a` |

The remote Polar tree contains exactly these three retained videos. Main is an
ancestor of the Polar payload and contains no startup-specific assets or videos.
Reusable action, observation, scroll and policy fixes are on main; Polar theme,
guides, research, script, evidence and media remain on polar-nova. Repository
privacy was rechecked. Machine-readable proof: [remote-recovery.json](evidence/remote-recovery.json).

## Recover the deliverables

```sh
GIT_LFS_SKIP_SMUDGE=1 git clone --branch polar-nova https://github.com/mohitchauhan1409/nova.git nova-polar-recovered
cd nova-polar-recovered
git lfs install --local
git lfs fetch --include='artifacts/polar/media/*' --exclude='' origin polar-nova
git lfs checkout
shasum -a 256 artifacts/polar/media/*
git log -1 --format=%H -- docs/polar/BACKUP.md
```

For the immutable recording payload, check out the Polar payload commit above
before `git lfs checkout`. The final documentation commit follows it without
changing media. Source and export geometry, decoded audio checks, edit timing and
practical limitations are in [VALIDATION.md](VALIDATION.md).
