# Bolna recordings

These two videos are archived only on `bolna-nova`, using Git LFS. `main` does not contain them. Both files retain their original bytes and quality; no additional compression was applied for GitHub.

| Recording | Duration | Size | File |
| --- | --- | --- | --- |
| Original two-flow recording | 11:16.6 | 543,480,247 bytes | [Original MP4](../artifacts/bolna/founder-recording-v2/nova-bolna-two-flows-raw.mp4) |
| Final edit, including faster typing | 6:38.8 | 225,921,462 bytes | [Final MP4](../artifacts/bolna/founder-recording-v2/edit-v2/nova-bolna.mp4) |

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
  artifacts/bolna/founder-recording-v2/edit-v2/nova-bolna.mp4
git lfs pull origin bolna-nova
```

The restore command deliberately replaces the two local copies with the archived versions. It works when either local recording has been deleted. To obtain them on a new computer, install Git LFS, clone this private repository with `--branch bolna-nova`, and run `git lfs pull`.

## Integrity

SHA-256 checksums:

```text
Original: 6ad6809b18eb4babf6fef53ec1ea2c89be7ab7056e2079d9c17c22aba375e65e
Final:    933005e9789b35ab4b84c728fbb81567590c2fc4e25060460af0fa2ea2fe3c42
```
