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

- Market quotes were refreshed September 6 to the September 4, 2026 regular
  close (source times 1:00:00–1:01:10 PM PT). Nine open holdings and SPY were
  verified; ORCL's closed-position history and the transaction ledger were
  preserved. These are dated closing prices, not live Sunday quotes.
  The source timestamp determines the session label, not retrieval time.
- Research merges the August baseline and reviewed Discord sync: 82 tickers.
- 39 setup records: unverified or overdue states are explicit. Missing outcome
  evidence must never be replaced with inferred fills or a synthetic win rate.
- Nine older setup source bodies were recovered and hash-matched to their
  successful delivery receipts. The journal now includes COIN/NDSN/WMT (Aug 20),
  BJ/ROST/V (Aug 21), and STZ/CLF/AXON (Aug 24), with original source links and
  explicitly unknown outcomes. Live Discord follow-up readback is still pending.
  Many research chart updates still lack a Discord permalink; retained
  transcription hashes are identified as such.
- Chart return starts at the June 25 close; headline return starts May 22.
- Retired AI portfolio artifacts and raw Watchlists tracker are excluded from
  publication. Old Watchlists URLs redirect to Research.

## September 6 closing-price follow-up

The user-authorized closing snapshot and nine recovered setups are published.
All 134 public file hashes were verified at 2026-09-06T16:17:07Z. All 96 tests
passed. See `docs/2026-09-06-closing-price-refresh.md` for validation and gaps.
The normal actual-time release validator correctly returned a weekend skip;
its safeguards and the retired posting schedules were not changed. Do not
treat the historical Friday-close validation as current-day freshness.

## Discord ownership

Routing and consolidation receipts belong to the separate Discord Automations
project, `research/2026-09-05-discord-consolidation.md`. Preserve archived channel
read permissions and message IDs used by historical source links.
The website's old automatic posting schedules are retired. Test-only fixtures
preserve safety coverage; do not install them as schedules. No credential or
session data belongs in this handoff.
