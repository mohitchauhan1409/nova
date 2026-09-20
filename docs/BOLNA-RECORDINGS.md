# Bolna recordings

These three videos are archived only on `bolna-nova`, using Git LFS. `main` does not contain them. Git LFS preserves all three files exactly. The final sound edit copies the existing video stream without re-encoding; only the new audio track is encoded.

| Recording | Duration | Size | File |
| --- | --- | --- | --- |
| Original two-flow recording | 11:16.6 | 543,480,247 bytes | [Original MP4](../artifacts/bolna/founder-recording-v2/nova-bolna-two-flows-raw.mp4) |
| Silent final edit | 6:38.8 | 225,921,462 bytes | [Silent MP4](../artifacts/bolna/founder-recording-v2/edit-v2/nova-bolna.mp4) |
| Approved click-only edit | 6:38.8 | 226,508,936 bytes | [Click-only MP4](../artifacts/bolna/founder-recording-v2/edit-v4/nova-bolna.mp4) |

All three are 3024 × 1964 H.264 videos at 30 fps. Screenshots, earlier takes, duplicate containers, intermediate edits and test audio were removed. Other runtime data and generated artifacts remain ignored.

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
  artifacts/bolna/founder-recording-v2/edit-v2/nova-bolna.mp4 \
  artifacts/bolna/founder-recording-v2/edit-v4/nova-bolna.mp4
git lfs pull origin bolna-nova
```

The restore command deliberately replaces the three local copies with the archived versions. It works when any local recording has been deleted. To obtain them on a new computer, install Git LFS, clone this private repository with `--branch bolna-nova`, and run `git lfs pull`.

## Integrity

SHA-256 checksums:

```text
Original: 6ad6809b18eb4babf6fef53ec1ea2c89be7ab7056e2079d9c17c22aba375e65e
Silent edit: 933005e9789b35ab4b84c728fbb81567590c2fc4e25060460af0fa2ea2fe3c42
Clicks only: c656ad78874030216801528e0d6e38481bea73cd0b0c6e73c7e98c4154dc5347
```

## Approved interaction sounds

The click-only edit contains 66 synthesized mouse clicks aligned to the recorded actions. It has no keyboard effects, music or ambient noise bed. These are added editing effects, not microphone audio. Duration, resolution, frame count and every encoded video packet match the silent edit.

The retained set is the original 11-minute recording, the silent final edit, and the approved click-only edit. The keyboard-and-click video has been removed from the current branch and local working files. The silent edit was restored from its exact archived version, without re-encoding.

The repeatable cue sheet is `scripts/video/bolna-sound-cues.json`; `scripts/video/add-bolna-sounds.py` generates the sound effects using Python, numpy and FFmpeg. Reproduce the approved click-only edit from the silent video:

```sh
python3 scripts/video/add-bolna-sounds.py --render --clicks-only \
  --source artifacts/bolna/founder-recording-v2/edit-v2/nova-bolna.mp4 \
  --output /tmp/nova-bolna-clicks-only.mp4 --work /tmp/nova-audio-work
```

The optional analysis mode requires the local edit plan and retained session receipts; ordinary rendering needs only the committed cue sheet and video. `--clicks-only` suppresses every keyboard cue while retaining the same click timing, variation, level and stereo position.
