# Validation and limits

The reusable engine is tested with isolated browser fixtures. Tests cover policy and approvals, transport authentication, trusted browser input, microphone permission behavior, action verification, privacy, question cards, progress memory, draft replacement, and customer profile registration. Fixture passes do not establish compatibility with every live website.

## Branch separation check — 20 September 2026

Core passed 200 unit/integration tests in 19 files, the production build, and isolated question-card, panel, and packaged launcher-visibility checks. The panel was also visually inspected. These results cover the source split and shared behavior, not new live-site workflow certification.

## Repeatable checks

```sh
npm ci
npm run setup:browser
npm run build
npm test
```

Build includes TypeScript checking, the dashboard, the native side panel, and the extension ZIP. The API tests read that ZIP, so build before the first test run. These checks do not call paid model or voice APIs. GitHub Actions runs the same build and unit/integration suite on both maintained branches.

With the development server running, additional isolated presentation and packaged-extension checks are available:

```sh
npm run test:questions
npm run test:panel
npm run test:launcher-visibility
npm run test:control
```

The panel regression checks chat by default, Live talk, responsive widths, verified versus failed action states, all active steps, scrolling to new steps, preserving manual scroll position, and expanding completed histories. The launcher regression checks hiding while the panel is open, surviving reload, and returning on close. These use disposable browser profiles and never control the user's signed-in browser.

Other smoke scripts may require a visible display, a running backend, or paid providers. See README before running them. Customer-specific live evidence and recording history belong on the customer branch.

## Completion and platform boundaries

Nova requires observed evidence before reporting completion. It can still encounter unsupported controls, changed pages, sign-in, human verification, permission denial, or unobservable effects. It should report those limits without inventing success. A click receipt is not proof that a multi-step business outcome completed.

This is a local engineering preview with a loopback backend and an unpacked Chromium extension. It has not completed a production security audit, a browser-store review, exhaustive live-site coverage, or a large-sample performance benchmark. Mobile support remains a separate phase. See [capabilities](CAPABILITIES.md) for the action support matrix.

## Recording and ordinary edit follow-ups (2026-09-21)

- Added explicit capture-build mode with hidden action pointer/label/rings and
  actual click receipts. Normal builds do not collect these events.
- Native click tests cover input-focus clicks, hover, rejected targets and failed
  releases. A decoded real recording is still required to establish cue alignment.
- Desktop recorder supports `--hide-cursor` through ScreenCaptureKit; it does not
  hide browser security UI or product content.
- Explicit ordinary record revisions can save without repeating a preference
  approval. Sensitive context, message composers, negations, hypothetical requests,
  later cancellation and review requests retain their existing boundaries.
- Following a changed view, the shared runner allows a bounded 650 ms transition
  before reobserving, addressing client-side pages whose initial controls change
  before navigation completes. No action is replayed during that interval.
