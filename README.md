# ChartChamp Portfolio

Source for the ChartChamp educational portfolio at
[chartchamp.web.app](https://chartchamp.web.app/). This repository is separate
from the archived VladStocks files; nothing here imports, edits, or deploys from
that archive.

## Dashboard

The static dashboard includes the current summary, cash split, holdings table,
position sparklines, decision log, a cash-aware Portfolio vs. SPY chart, and a
sorted gain/loss contribution chart. The comparison begins on the configured
`chartStartDate`; SPY is normalized to the portfolio value on that date. If the
benchmark is unavailable, the dashboard renders the portfolio line by itself.

Configuration lives in `data/app-data.js`. Refreshed Yahoo Finance history is
written to both `data/live-prices.json` and the browser-compatible
`data/live-prices.js` global.

## Portfolio refresh and delivery

`.github/workflows/portfolio-update.yml` runs on weekdays at 6:35 AM and 1:05
PM in `America/Los_Angeles`. Each scheduled run:

1. refreshes holding and SPY quote history;
2. validates the U.S. market date, expected open/close session, freshness, and
   snapshot structure;
3. deploys the validated site to Firebase Hosting; and
4. verifies the webhook's bound channel, applies duplicate and length guards,
   then posts the portfolio summary.

Closed-market, stale, structurally invalid, duplicate, and over-limit updates
are skipped. Validation and delivery records are uploaded as private workflow
artifacts. Manual workflow runs are hard-coded as no-send dry runs and may
deploy a seven-day Firebase preview.

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

For educational purposes only. Not financial advice.
