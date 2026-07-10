import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const ROOT = new URL("../", import.meta.url);

async function loadData() {
  const window = {};
  const source = await readFile(new URL("data/app-data.js", ROOT), "utf8");
  new Function("window", source)(window);
  return window.APP_DATA;
}

test("every active holding opens a complete research note", async () => {
  const data = await loadData();
  const research = new Map(data.research.tickers.map((ticker) => [ticker.ticker, ticker]));

  for (const holding of data.portfolio.holdings) {
    if (holding.assetClass === "Cash") continue;
    assert.equal(holding.researchKey, holding.ticker, `${holding.ticker} research key`);
    assert.ok(research.has(holding.researchKey), `${holding.ticker} research note exists`);
  }
});

test("TSM note preserves the posted 428 support thesis", async () => {
  const data = await loadData();
  const tsm = data.research.tickers.find((ticker) => ticker.ticker === "TSM");

  assert.equal(tsm.tvSymbol, "NYSE:TSM");
  assert.equal(tsm.chartReady, true);
  assert.equal(tsm.postedChartUrl, "https://www.tradingview.com/x/a8oSysFT/");
  assert.equal(tsm.postedChartDate, "2026-07-10");
  assert.ok(tsm.levels.support.some((level) => level.price.includes("428")));
  assert.ok(tsm.bullish.some((factor) => factor.includes("$428")));
  assert.ok(tsm.bearish.some((factor) => factor.includes("below $428")));
});

test("recent Discord chart snapshots resolve to the expected holdings", async () => {
  const data = await loadData();
  const research = new Map(data.research.tickers.map((ticker) => [ticker.ticker, ticker]));
  const expected = {
    BABA: "https://www.tradingview.com/x/HiZPMzjF/",
    NFLX: "https://www.tradingview.com/x/2cOzd8aZ/",
    PLTR: "https://www.tradingview.com/x/NjmXGwkE/",
    MSFT: "https://www.tradingview.com/x/eRsoQHEt/",
    META: "https://www.tradingview.com/x/B1GWwpA0/",
    ORCL: "https://www.tradingview.com/x/HrdF7U1C/",
    TSM: "https://www.tradingview.com/x/a8oSysFT/"
  };

  for (const [ticker, url] of Object.entries(expected)) {
    assert.equal(research.get(ticker).postedChartUrl, url, `${ticker} posted chart`);
    assert.match(url, /^https:\/\/www\.tradingview\.com\/x\/[A-Za-z0-9]+\/$/);
  }

  assert.equal(research.get("AAPL").postedChartUrl, undefined,
    "AAPL falls back to its live TradingView symbol because #stocks has no TradingView URL");
});

test("research ratings and analysis structures remain valid", async () => {
  const data = await loadData();
  const risks = new Set(data.meta.riskScale);
  const ratings = new Set(data.meta.fundamentalsScale);

  for (const ticker of data.research.tickers) {
    assert.ok(risks.has(ticker.risk), `${ticker.ticker} risk rating`);
    assert.ok(ratings.has(ticker.fundamentals.rating), `${ticker.ticker} fundamental rating`);
    assert.ok(ticker.bullish.length > 0, `${ticker.ticker} bullish case`);
    assert.ok(ticker.bearish.length > 0, `${ticker.ticker} bearish case`);
    assert.ok(ticker.levels.support.length + ticker.levels.resistance.length > 0,
      `${ticker.ticker} price levels`);
    assert.ok(ticker.fundamentals.metrics.length > 0, `${ticker.ticker} fundamental metrics`);
  }
});
