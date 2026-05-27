# Watchlists Site

Static GitHub Pages-ready watchlist dashboard for the Discord group.

## Files

- `index.html` contains the page structure.
- `assets/styles.css` contains the visual design.
- `assets/app.js` handles search, filtering, EMA state, and detail rendering.
- `data/watchlist-data.js` is the editable source of truth for tickers and notes.

## Updating A Ticker

Edit `data/watchlist-data.js` and add or update the ticker under `overrides`:

```js
MSFT: {
  chartStatus: "reviewed",
  currentPrice: 430.25,
  weekly7Ema: 421.10,
  weekly200Ema: 317.80,
  support: [420, 405],
  resistance: [440, 460],
  shortTerm: "Short-term note.",
  longTerm: "Long-term note.",
  fundamentals: "Fundamental note.",
  risk: "Risk note."
}
```

EMA trend is calculated automatically:

- Bullish: price is more than 1% above the EMA.
- Neutral: price is within 1% of the EMA.
- Bearish: price is more than 1% below the EMA.

Adjust the neutral band in `metadata.neutralBandPct`.

## Publishing

This folder can be published as a GitHub Pages static site once the repository is connected to GitHub Pages.

Compliance footer: `For educational purposes only. Not financial advice.`
