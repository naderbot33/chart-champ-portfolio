# ChartChamp Portfolio

Source for the ChartChamp educational portfolio at
[chartchamp.web.app](https://chartchamp.web.app/). This repository is
self-contained; nothing here imports, edits, or deploys from retired project
archives.

## Dashboard

The static dashboard includes the current summary, cash split, holdings table,
position sparklines, decision log, a cash-aware Portfolio vs. SPY chart, and a
sorted gain/loss contribution chart. The comparison begins on the configured
`chartStartDate`; SPY is normalized to the portfolio value on that date. If the
benchmark is unavailable, the dashboard renders the portfolio line by itself.

Configuration lives in `data/app-data.js`. Refreshed Yahoo Finance history is
written to both `data/live-prices.json` and the browser-compatible
`data/live-prices.js` global.

Reviewed Discord content is applied by `data/discord-research-sync.js` after the
historical research and setup-review baseline files, and before the renderer.
The layer keeps original post dates and source links, does not change the
portfolio ledger, and marks imported setups without verified follow-ups as
outcome-unverified. The research intake helper reads the same merged view.
`tests/discord-research-sync.test.mjs` protects current merged content while the
older dated tests preserve the baseline. Older fundamentals and monthly momentum
are explicitly historical; reviewing a new chart does not refresh those facts.

## Portfolio refresh and delivery

The old GitHub posting schedule is retired. `portfolio-update.yml` is now a
manual build-only preview. Discord operations belong to the separate Discord
Automations project; this repository does not schedule posts.

Run `node --test tests/*.test.mjs` and `node scripts/build-site.mjs` to validate
and stage an explicit public allowlist. Firebase serves `dist`, never the source
root. The build creates shareable ticker/setup pages from the same records and
excludes retired portfolio files and the raw Watchlists tracker. `/watchlists`
redirects to Research. `scripts/portfolio-local-release.mjs` retains the guarded
market-data refresh workflow; a design-only publication preserves quote dates.

Repository secrets required after approval:

- `FIREBASE_SERVICE_ACCOUNT` — Firebase deployment service-account JSON
- `FIREBASE_PROJECT_ID` — Firebase project ID (`dailystockpick`)
- `DISCORD_PORTFOLIO_WEBHOOK` — webhook bound to ChartChamp
  `#public-portfolio`

Do not commit webhook URLs, Firebase credentials, `.env` files, or generated
runtime state. The other six browser-backed channel jobs and their Keychain
setup are documented in `automation/README.md`.

## Local no-send checks

Requires Node.js 20 or newer.

```sh
node --check assets/app.js
node --check scripts/update-quotes.mjs
node --check scripts/validate-portfolio-snapshot.mjs
node --check scripts/portfolio-summary.mjs
node scripts/update-quotes.mjs
node scripts/validate-portfolio-snapshot.mjs --session auto
node scripts/portfolio-summary.mjs --dry-run --session auto
```

The last command only prints and records a draft; it never contacts Discord.

## Review-only Research intake

`scripts/research-intake-proposal.mjs` compares a normalized local Discord
snapshot with the published Research list. It proposes only genuinely newer
TradingView snapshots and never edits the site, contacts Discord, refreshes
quotes, or deploys Firebase.

Place the ignored local input under `runtime/`:

```json
{
  "schemaVersion": 1,
  "candidates": [
    {
      "ticker": "AAPL",
      "postedChartDate": "2026-07-21",
      "postedChartChannel": "stocks",
      "postedChartUrl": "https://www.tradingview.com/x/Example123/",
      "analysisTimeframe": "6 hours",
      "sourceText": "Exact locally reviewed Discord analysis",
      "levels": {
        "support": [{ "price": "$100", "note": "Decision support" }],
        "resistance": [{ "price": "$110", "note": "Immediate resistance" }]
      }
    }
  ]
}
```

Preview the JSON report on stdout, or write one new private report file:

```sh
node scripts/research-intake-proposal.mjs \
  --input runtime/research-intake-posts.json \
  --after 2026-07-20

node scripts/research-intake-proposal.mjs \
  --input runtime/research-intake-posts.json \
  --after 2026-07-20 \
  --output runtime/research-intake-proposal.json
```

Candidate-level problems are recorded as rejections. Duplicate links, older or
same-day updates, and multiple latest links for one ticker are held for review.
The optional output uses exclusive creation and refuses to overwrite a prior
report. Human approval and complete technical/fundamental copy are still
required before changing `data/app-data.js`.

For educational purposes only. Not financial advice.
