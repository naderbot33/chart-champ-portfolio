# Public Portfolio Dashboard

Local static first version of the Chart Champ Portfolio page.

## Files

- `index.html` - page structure and required dashboard sections.
- `assets/styles.css` - responsive dashboard styling.
- `assets/app.js` - calculations, ticker search, Twelve Data fetch logic, and rendering logic.
- `data/portfolio-data.js` - starter portfolio data plus sourced static fallback prices.
- `data/twelve-data-config.js` - local Twelve Data API key config.

## Current Data Mode

The first version uses the starter fake portfolio:

- 25% SPY
- 25% QQQ
- 25% NVDA
- 25% AAPL
- Purchase date: April 1, 2026

Prices use the Twelve Data API when a local API key is configured. If no key is
available, the page falls back to the sourced static snapshot in
`data/portfolio-data.js`.

## Future API Path

Add a Twelve Data key in `data/twelve-data-config.js` for local testing:

```js
window.TWELVE_DATA_CONFIG = {
  enabled: true,
  apiKey: "YOUR_TWELVE_DATA_KEY"
};
```

Do not publish a public API key in a static GitHub Pages build. Before public
launch, confirm display and redistribution terms and move the key to a backend
or scheduled build process.

## Compliance Footer

For educational purposes only. Not financial advice.
