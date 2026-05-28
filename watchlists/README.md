# Watchlists Site

Static GitHub Pages-ready watchlist dashboard for the Discord group.

## Files

- `index.html` contains the page structure.
- `assets/styles.css` contains the visual design.
- `assets/app.js` handles search, filtering, EMA state, and detail rendering.
- `assets/charts/` stores local chart screenshots when a chart link is not directly embeddable.
- `data/watchlist-data.js` is the editable source of truth for tickers and notes.
- `data/watchlist-tracker.csv` is the spreadsheet tracker for organizing chart links, chart levels, weekly EMAs, fundamentals ratings, risks, and catalysts.

## Updating A Ticker

Use `data/watchlist-tracker.csv` to organize the work first. The site supports four watchlists: Stocks, Crypto, Commodities, and Bonds.

When a ticker is added, publish it to the site by updating `data/watchlist-data.js` under `overrides`:

```js
MSFT: {
  chartStatus: "published",
  chartUrl: "https://example.com/chart",
  chartImageUrl: "assets/charts/MSFT.png",
  chartCapturedAt: "2026-05-27",
  currentPrice: 430.25,
  weekly7Ema: 421.10,
  weekly200Ema: 317.80,
  support: [420, 405],
  resistance: [440, 460],
  supportNotes: "Nearest support is 420, with deeper support near 405.",
  resistanceNotes: "Initial resistance is 440, then 460.",
  fundamentalsRating: "Strong",
  fundamentalsRationale: "Healthy revenue base and durable market position.",
  risks: "Valuation, macro sensitivity, and execution risk.",
  catalysts: "Earnings, AI/product updates, and enterprise demand."
}
```

The page automatically displays tickers marked `chartStatus: "published"`. It can use a direct chart image URL, a local screenshot path, or a chart link. If the chart link is not directly embeddable, keep `chartUrl` and add a screenshot later under `assets/charts/`.

Fundamentals ratings use this scale: Very Strong, Strong, Moderate, Weak, Very Weak. Keep the rationale short and factual.

EMA trend is calculated automatically:

- Bullish: price is more than 1% above the EMA.
- Neutral: price is within 1% of the EMA.
- Bearish: price is more than 1% below the EMA.

Adjust the neutral band in `metadata.neutralBandPct`.

## Publishing

This folder can be published as a GitHub Pages static site once the repository is connected to GitHub Pages.

Compliance footer: `For educational purposes only. Not financial advice.`
