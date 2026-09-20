# Validation and limits

The reusable engine is tested with isolated browser fixtures. Tests cover policy and approvals, transport authentication, trusted browser input, microphone permission behavior, action verification, privacy, question cards, progress memory, draft replacement, and customer profile registration. Fixture passes do not establish compatibility with every live website.

## Branch separation check — 20 September 2026

Core passed 200 unit/integration tests in 19 files, the production build, and isolated question-card, panel, and packaged launcher-visibility checks. The panel was also visually inspected. These results cover the source split and shared behavior, not new live-site workflow certification.

## Bolna branch separation check — 20 September 2026

The Bolna branch passed the production build and all 224 tests before the additional hostname-scope test; the affected suites then passed all 29 tests including that new case (225 total cases now). Both the generic and Bolna panel checks passed, along with the packaged launcher open/close/reload checks. The Bolna panel was visually inspected; a browser assertion verifies that switching to another hostname restores the core appearance. No signed-in Bolna task or outbound communication was performed for this repository split.

The client additions are isolated in site profiles, scoped theme hooks, client fixtures/scripts and `BOLNA-*` documents. Existing local profiles are preserved. Historical live workflow observations are retained in [the original validation log](BOLNA-VALIDATION-HISTORY.md) and [workflow lab](BOLNA-WORKFLOW-LAB.md); reports remain local and ignored. The original and both sound-comparison recordings are archived in Git LFS only on this branch; see [recordings and recovery](BOLNA-RECORDINGS.md).

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
