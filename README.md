# Chart Champ Portfolio

Static public portfolio dashboard for the Chart Champ community.

## Files

- `index.html` - page structure and required dashboard sections.
- `assets/styles.css` - responsive dashboard styling.
- `assets/app.js` - calculations, ticker search, Twelve Data fetch logic, and rendering logic.
- `data/portfolio-data.js` - starter portfolio data plus sourced static fallback prices.
- `data/twelve-data-config.js` - local Twelve Data API key config.

## Current Portfolio

Updated May 22, 2026:

- $10,000 total portfolio
- $5,000 cash
- $5,000 SQQQ
- SQQQ entry: $40.86
- Purchase date: May 22, 2026

The public page uses the sourced static snapshot in
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
