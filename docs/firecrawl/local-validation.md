# Local preparation checks

2026-09-22. These are isolated source checks, not live workflow evidence.

- `npm run typecheck`: passed.
- `npm test -- tests/site-store.test.ts tests/site-experience.test.ts tests/page-theme.test.ts tests/extension-theme.test.ts tests/action-cursor.test.ts`: 5 files, 17 tests passed. Exercises preset seeding, URL matching, preservation of user edits, isolated site storage, passive theme routing and cursor lifetime.
- Parsed all 29 panel override rules with PostCSS; every selector is scoped to the actual Firecrawl hostname.
- Parsed launcher CSS; checked unrelated/spoofed/invalid URLs receive no customization and that its initial cursor palette equals the profile-derived session palette.
- `git diff --check`: passed.

Used a temporary worktree-local `node_modules` symlink to the existing `/Users/macbook/Desktop/Nova/node_modules`, then removed it after the checks. No dependencies installed, build run, browser accessed, extension reloaded, runtime started or recording taken by this worker. The coordinator authorized an isolated Firecrawl branch commit after these checks; main and the installed runtime are untouched.

Theme uses actual screenshot samples, but local source checks do not prove rendered appearance. Coordinator must inspect the real panel, launch position, selected cards and single-color action cursor during preflight. Both registered flows remain unverified pending successful Nova rehearsals and independent persisted-result checks. Manual preparation receipts are in `scenario.md` and are not counted as Nova passes.
