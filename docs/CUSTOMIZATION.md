# Core and customer branches

`main` owns the reusable product. Each startup branch adds knowledge and appearance to the same browser engine. These are full working branches, not disconnected copies or separate applications.

## Start a customer branch

```sh
git switch main
git pull --ff-only
git switch -c startup-nova
```

1. Add a typed `SiteProfile` in `BE/src/sites/`. Give it the real domain, instructions, task triggers and observable steps. Mark flows verified only when the documented result has actually been checked.
2. Register it in `BE/src/sites/customizations.ts`. Set `siteStoreFilename` to a unique filename, such as `sites.startup.json`. This keeps locally edited profiles separate when switching branches. Existing user edits take precedence over built-in presets.
3. Add panel theme overrides to `web/src/panel/customization.css`. Scope **every selector** to `.np-app[data-site="your.actual.hostname"]`. The hostname comes from the active session URL. Other websites should retain the shared Nova design.
4. Add launcher overrides in `web/companion/customization.ts`, returning CSS only for the intended hostname. Keep session activation, cursor behavior and browser actions in the shared launcher/engine.
5. Add client fixtures and regression tests, then run `npm run build` and `npm test`. Exercise the real account separately before claiming live workflow coverage.

Use `npm run dev` to run that checkout. After switching branches, stop/restart the server, rebuild, reload the unpacked extension and begin a fresh session. The frontend and extension are build artifacts: Git switching alone does not replace them.

## Keep improvements shared

Changes to browser tools, action verification, approvals, grouped questions, progress memory, chat/voice behavior and the action timeline belong on `main`. Keep website-specific routes, flow catalogues, copy, colors, fixtures and recordings on the customer branch.

Implement shared fixes on `main`, then bring them into each customer branch:

```sh
git switch startup-nova
git merge main
npm run build
npm test
```

When discovering a generic fix on a customer branch, put that fix in its own commit. Cherry-pick that commit onto `main`, then merge `main` back. Do not merge the entire customer branch into core.

## Local data and distribution

Core uses `BE/data/sites.core.json`. Customer branches select their own file. The Bolna branch deliberately retains `sites.json` for compatibility with the existing local configuration. Site changes persist locally and are not committed; sessions/conversations are memory-only. The `.env` and pairing token remain local across branch switches.

Generated `web/dist`, `web/dist-extension`, release ZIPs, browser data, reports, screenshots, keys and `.env` files are ignored. This Bolna branch explicitly tracks only the two archived MP4 recordings with Git LFS; all other media remains ignored. See [recordings and recovery](BOLNA-RECORDINGS.md). A fresh clone builds its own extension and supplies its own provider credentials. A source repository is not a hosted deployment.
