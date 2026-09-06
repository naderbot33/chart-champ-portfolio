# ChartChamp current release

Canonical source branch: `codex/chartchamp-community-refresh` in
`naderbot33/chart-champ-portfolio`. Local checkout on this Mac:
`/Users/naderbot/Projects/chart-champ-portfolio`.

Public destination: https://chartchamp.web.app (Firebase project `dailystockpick`,
hosting site `chartchamp`). Do not deploy the obsolete remote main checkout.

## Build and release

1. `node --test tests/*.test.mjs`
2. `node scripts/build-site.mjs`
3. Validate the printed staged public directory or serve `dist` using
   `node scripts/serve-site.mjs` (localhost 8766).
4. Publish the printed staging config with the existing authorized Firebase CLI.
   The config targets only `chartchamp`. Verify remote hashes against that stage.

The build allowlist is in `scripts/portfolio-local-release.mjs`; both design
releases and guarded market-data releases use it. Never deploy source root.
Shareable Research and Setup HTML pages derive from the same source records.
Generated output and private runtime receipts are ignored by Git.

## Data truth

- Market quote snapshot remains September 4, 2026, 9:34 AM PT. A design deploy
  does not refresh quotes or promote historical opinions into current advice.
- Research merges the August baseline and reviewed Discord sync: 82 tickers.
- 30 setup records: unverified or overdue states are explicit. Missing outcome
  evidence must never be replaced with inferred fills or a synthetic win rate.
- Nine older setup source bodies await readback. Many chart updates lack a
  Discord permalink; retained transcription hashes are identified as such.
- Chart return starts at the June 25 close; headline return starts May 22.
- Retired AI portfolio artifacts and raw Watchlists tracker are excluded from
  publication. Old Watchlists URLs redirect to Research.

## Discord ownership

Routing and consolidation receipts belong to the separate Discord Automations
project, `research/2026-09-05-discord-consolidation.md`. Preserve archived channel
read permissions and message IDs used by historical source links.
The website's old automatic posting schedules are retired. Test-only fixtures
preserve safety coverage; do not install them as schedules. No credential or
session data belongs in this handoff.
