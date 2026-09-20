# Verified private backup

Repository: https://github.com/mohitchauhan1409/nova (privacy verified as private).
Reusable fixes are on main at b770ad95df8e964fac1530cd9c567b9dbbf092ca.
Customer code and all three LFS videos were pushed at
87471385f01479c9abed633c13113c19c48f9853 on sageox-nova. A later documentation-only
commit records this recovery result; it does not change the media.

A fresh, independent HTTPS clone of that customer commit downloaded all three
LFS objects from the remote. Local LFS filters were installed in the recovery
checkout, then all three videos were restored. SHA-256 verification passed for
all 164,319,001 bytes. See remote-recovery.json and checksums.sha256.
The initial pull downloaded the objects but skipped checkout until local LFS
filters were installed; the instructions below explicitly include that step.

Recover with your own authenticated access:

```sh
git clone --branch sageox-nova --single-branch https://github.com/mohitchauhan1409/nova.git
cd nova
git lfs install --local
git lfs pull
shasum -a 256 -c docs/sageox/recording/checksums.sha256
```

Exactly the original MOV, silent MP4 and click-only MP4 are LFS-tracked with exact
paths. Main contains no SageOx profile, fixtures, documents or media. Runtime data,
credentials, pairing tokens and raw account observations remain ignored.
The original recording’s hash remained unchanged throughout inspection/export.

After validation, 55 task-created failed recordings, preflights, screenshots and
synthetic editor-test media were removed. The independent recovery checkout was
also removed after checksum verification. Three media deliverables remain in the
workspace; useful text-based evidence and the ignored synthetic-object manifest
are preserved. Unrelated files and website records were not deleted.
