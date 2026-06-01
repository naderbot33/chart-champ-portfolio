# Watchlists Site

Static GitHub Pages-ready watchlist dashboard for the Discord group.

## Files

- `index.html` contains the page structure.
- `assets/styles.css` contains the visual design.
- `assets/app.js` handles search, filtering, EMA state, and detail rendering.
- `assets/charts/` stores local chart screenshots when a chart link is not directly embeddable.
- `data/watchlist-tracker.csv` is the editable source of truth for chart links, levels, weekly EMAs, fundamentals ratings, risks, catalysts, tags, and recent updates.
- `data/watchlist-data.js` is generated from the CSV for the website. Do not hand-edit it.
- `scripts/validate-watchlist-data.mjs` checks whether published CSV rows have the required fields.
- `scripts/build-watchlist-data.mjs` regenerates the website data and bumps the Watchlists asset version.

## Updating A Ticker

Use `data/watchlist-tracker.csv` to organize the work. The site supports four watchlists: Stocks, Crypto, Commodities, and Bonds.

For a ticker to appear publicly, set `Status` to `Published` and fill in:

- Chart Link
- Current Price
- Weekly 7 EMA
- Weekly 200 EMA
- At least one Support level
- At least one Resistance level
- Fundamentals Rating
- Fundamentals Rationale
- Key Risks
- Key Catalysts
- Last Updated

Then run:

```sh
node scripts/validate-watchlist-data.mjs
node scripts/build-watchlist-data.mjs
```

The page automatically displays tickers marked `Published`. It can use a direct chart image URL, a local screenshot path, or a TrendSpider chart link. If the local screenshot path is missing, the build script derives the TrendSpider CDN image URL from the chart link.

Fundamentals ratings use this scale: Very Strong, Strong, Moderate, Weak, Very Weak. Keep the rationale short and factual.

EMA trend is calculated automatically:

- Bullish: price is more than 1% above the EMA.
- Neutral: price is within 1% of the EMA.
- Bearish: price is more than 1% below the EMA.

Adjust the neutral band in `metadata.neutralBandPct`.

## Publishing

This folder can be published as a GitHub Pages static site once the repository is connected to GitHub Pages.

Compliance footer: `For educational purposes only. Not financial advice.`
