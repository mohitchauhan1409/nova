# Bolna recordings

These two videos are archived only on `bolna-nova`, using Git LFS. `main` does not contain them. Git LFS preserves both files exactly. The final sound edit copies the existing video stream without re-encoding; only the new audio track is encoded.

| Recording | Duration | Size | File |
| --- | --- | --- | --- |
| Original two-flow recording | 11:16.6 | 543,480,247 bytes | [Original MP4](../artifacts/bolna/founder-recording-v2/nova-bolna-two-flows-raw.mp4) |
| Final edit with synchronized typing and click effects | 6:38.8 | 229,615,858 bytes | [Final MP4](../artifacts/bolna/founder-recording-v2/edit-v3/nova-bolna-with-sounds.mp4) |

Both are 3024 × 1964 H.264 videos at 30 fps. Screenshots, earlier takes, duplicate containers, intermediate edits and test audio were removed. Other runtime data and generated artifacts remain ignored.

## Download from GitHub

Open a recording above while viewing `bolna-nova`, then use GitHub's download control. The repository is private, so the viewer must have repository access. Git LFS stores the full media separately from its small Git pointer; GitHub serves the original stored file. See [GitHub's Git LFS documentation](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage).

## Restore on this computer

Install Git LFS if necessary (`brew install git-lfs` on macOS), then in this repository:

```sh
git lfs install --local
git fetch origin
git switch bolna-nova
git restore --source=origin/bolna-nova -- \
  artifacts/bolna/founder-recording-v2/nova-bolna-two-flows-raw.mp4 \
  artifacts/bolna/founder-recording-v2/edit-v3/nova-bolna-with-sounds.mp4
git lfs pull origin bolna-nova
```

The restore command deliberately replaces the two local copies with the archived versions. It works when either local recording has been deleted. To obtain them on a new computer, install Git LFS, clone this private repository with `--branch bolna-nova`, and run `git lfs pull`.

## Integrity

SHA-256 checksums:

```text
Original: 6ad6809b18eb4babf6fef53ec1ea2c89be7ab7056e2079d9c17c22aba375e65e
Final:    7d1bffc8bfdb1145d913d8ad97f52f102090d4f87a1dda030a16c3f493ec1911
```

## Added interaction sounds

The latest final includes synthesized keyboard and mouse foley aligned to visible text changes and recorded action receipts. It contains 974 key effects and 66 clicks, with varied timbre/level, silent reading pauses, and no music or ambient noise bed. These are added editing effects, not microphone audio. Duration, resolution, frame count, and every encoded video packet are unchanged from the silent edit.

The prior silent final remains recoverable from [commit 9d61204](https://github.com/mohitchauhan1409/nova/blob/9d61204d73ada528fb0ffbecfd11efe7de70925c/artifacts/bolna/founder-recording-v2/edit-v2/nova-bolna.mp4). Only the original and latest final are retained in the current branch checkout.

The repeatable cue sheet is `scripts/video/bolna-sound-cues.json`; `scripts/video/add-bolna-sounds.py` generates the original sound effects using Python, numpy and FFmpeg. Render a fresh copy from the current final (its existing audio is ignored):

```sh
python3 scripts/video/add-bolna-sounds.py --render \
  --source artifacts/bolna/founder-recording-v2/edit-v3/nova-bolna-with-sounds.mp4 \
  --output /tmp/nova-bolna-remix.mp4 --work /tmp/nova-audio-work
```

The optional analysis mode requires the local edit plan and retained session receipts; ordinary rendering needs only the committed cue sheet and video.
