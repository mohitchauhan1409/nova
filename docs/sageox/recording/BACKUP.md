# Verified private backup

Repository: https://github.com/mohitchauhan1409/nova (verified private).
The current media commit on sageox-nova is 3cf6c5a5de0ae22ca824d3cef2a7de2c2ccc4eff.
Reusable tap rendering and integer-frame cover fixes are on main at
6b37b43500b00a7ec28bdc0252372d6752c63332. A later documentation-only commit records
this recovery verification and does not change the media.

A fresh independent HTTPS clone downloaded all three current LFS objects from the
remote. Local LFS filters were installed before pulling and checking them out.
All three recovered SHA-256 checksums match: 146,815,600 bytes total.
See remote-recovery.json and checksums.sha256.

```sh
git clone --branch sageox-nova --single-branch https://github.com/mohitchauhan1409/nova.git
cd nova
git lfs install --local
git lfs pull
shasum -a 256 -c docs/sageox/recording/checksums.sha256
```

Exactly the original MOV, silent MP4 and click-only MP4 are tracked with exact
Git LFS paths. The new original source is unchanged after capture. It intentionally
retains account/tab details for this private video at the owner's request. Only
the debugger row is concealed in edited copies. Credentials and raw backend/page
observations remain ignored. Main contains no SageOx profile, fixtures or media.

The previous masked source remains recoverable byte-for-byte at commit 8747138;
its text receipts are in previous-masked-take. It was superseded by a new capture,
not edited to invent the pixels hidden by its baked-in covers.

After validation, 112 temporary frame assets and 12 temporary/superseded media
files were removed. The fresh recovery checkout was removed after checksum
verification. Three current media deliverables remain. Unrelated files and website
records were preserved, along with useful text evidence and the synthetic manifest.
