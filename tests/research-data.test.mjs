import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const ROOT = new URL("../", import.meta.url);

async function loadData() {
  // These dated regression cases protect the retained August 19 baseline.
  // discord-research-sync.test.mjs validates the merged, currently published view.
  const window = {};
  const source = await readFile(new URL("data/app-data.js", ROOT), "utf8");
  new Function("window", source)(window);
  return window.APP_DATA;
}

test("every linked active holding opens a complete research note", async () => {
  const data = await loadData();
  const research = new Map(data.research.tickers.map((ticker) => [ticker.ticker, ticker]));

  for (const holding of data.portfolio.holdings) {
    if (holding.assetClass === "Cash" || holding.closed === true || !holding.researchKey) continue;
    assert.equal(holding.researchKey, holding.ticker, `${holding.ticker} research key`);
    assert.ok(research.has(holding.researchKey), `${holding.ticker} research note exists`);
  }
});

test("TSM note uses the newest July 13 posted chart and 429 support", async () => {
  const data = await loadData();
  const tsm = data.research.tickers.find((ticker) => ticker.ticker === "TSM");

  assert.equal(tsm.tvSymbol, "NYSE:TSM");
  assert.equal(tsm.chartReady, true);
  assert.equal(tsm.postedChartUrl, "https://www.tradingview.com/x/jgTWIthz/");
  assert.equal(tsm.postedChartDate, "2026-07-13");
  assert.equal(tsm.postedChartChannel, "stocks");
  assert.ok(tsm.levels.support.some((level) => level.price.includes("429")));
  assert.ok(tsm.bullish.some((factor) => factor.includes("$429")));
  assert.ok(tsm.bearish.some((factor) => factor.includes("below $429")));
});

test("July 6-August 7 Discord snapshots resolve to the research tickers", async () => {
  const data = await loadData();
  const research = new Map(data.research.tickers.map((ticker) => [ticker.ticker, ticker]));
  const expected = {
    BABA: "https://www.tradingview.com/x/hBAtF6dp/",
    AAPL: "https://www.tradingview.com/x/tUSWgWAf/",
    NFLX: "https://www.tradingview.com/x/aBXhwO89/",
    PLTR: "https://www.tradingview.com/x/pbK050Ku/",
    MSFT: "https://www.tradingview.com/x/yWFjVaXr/",
    META: "https://www.tradingview.com/x/pXB3nxGw/",
    ORCL: "https://www.tradingview.com/x/SEGmrJR7/",
    TSM: "https://www.tradingview.com/x/jgTWIthz/",
    CRCL: "https://www.tradingview.com/x/vWqYXYsP/",
    VIX: "https://www.tradingview.com/x/xRql2ppN/",
    IWM: "https://www.tradingview.com/x/KT5HFVgq/",
    QQQ: "https://www.tradingview.com/x/11TuD6Yn/",
    BTC: "https://www.tradingview.com/x/ncwziUG7/",
    ETH: "https://www.tradingview.com/x/VcwfiLXP/",
    NVO: "https://www.tradingview.com/x/t2mdZUYE/",
    SYM: "https://www.tradingview.com/x/2G9dyk2h/",
    SOFI: "https://www.tradingview.com/x/jPEjEsBv/",
    GOLD: "https://www.tradingview.com/x/wg6zO99O/",
    SLV: "https://www.tradingview.com/x/j5ykPx5F/",
    REXR: "https://www.tradingview.com/x/fjDKlLP6/",
    WM: "https://www.tradingview.com/x/POkgWQDs/",
    NVAX: "https://www.tradingview.com/x/dP4csqXH/",
    O: "https://www.tradingview.com/x/1DhfHEx1/",
    SOUN: "https://www.tradingview.com/x/UFENV5Wu/",
    SMCI: "https://www.tradingview.com/x/OPYPASZx/",
    TSLA: "https://www.tradingview.com/x/vCG36Dbx/",
    TQQQ: "https://www.tradingview.com/x/mVZ50peU/",
    SQQQ: "https://www.tradingview.com/x/qKaWIM1J/",
    AMZN: "https://www.tradingview.com/x/OG3oejFv/",
    PYPL: "https://www.tradingview.com/x/FWeROzFw/",
    MGNX: "https://www.tradingview.com/x/S46rVSmz/",
    HD: "https://www.tradingview.com/x/Yq0VwGkd/",
    MSTR: "https://www.tradingview.com/x/eEX9jb70/",
    IBM: "https://www.tradingview.com/x/mQ7dqfjW/",
    TEM: "https://www.tradingview.com/x/uIp5kG8V/",
    LINK: "https://www.tradingview.com/x/WFMEVUPd/",
    SPY: "https://www.tradingview.com/x/50186jRc/",
    HOOD: "https://www.tradingview.com/x/n02G51ho/",
    AMD: "https://www.tradingview.com/x/YCKBLo8j/",
    HHH: "https://www.tradingview.com/x/U1wjzCfc/",
    MON: "https://www.tradingview.com/x/8249uTFD/",
    CBRS: "https://www.tradingview.com/x/RjlRkw7D/",
    ADBE: "https://www.tradingview.com/x/3rklRZiH/",
    AXP: "https://www.tradingview.com/x/DcTSBbDi/",
    GOOGL: "https://www.tradingview.com/x/uj9JUUtu/",
    XRP: "https://www.tradingview.com/x/YvUJjGkO/",
    COIN: "https://www.tradingview.com/x/asF1Pfhw/",
    USOIL: "https://www.tradingview.com/x/NrDsE96k/",
    BULL: "https://www.tradingview.com/x/GT7hHRc4/",
    SNAP: "https://www.tradingview.com/x/NZ529F5T/",
    CLF: "https://www.tradingview.com/x/2hkeNf6m/",
    BMNR: "https://www.tradingview.com/x/ccnp6Ed4/",
    TLT: "https://www.tradingview.com/x/72VIBXi6/"
  };

  assert.equal(data.meta.updatedAt, "2026-08-19");
  assert.equal(data.research.tickers.length, 60);
  for (const [ticker, url] of Object.entries(expected)) {
    assert.equal(research.get(ticker).postedChartUrl, url, `${ticker} posted chart`);
    assert.match(url, /^https:\/\/www\.tradingview\.com\/x\/[A-Za-z0-9]+\/$/);
  }
  assert.equal(research.get("MON").tvSymbol, "COINBASE:MONUSD");
  assert.equal(research.get("MON").postedChartChannel, "crypto");
  assert.equal(research.get("IWM").name, "iShares Russell 2000 ETF");
  assert.equal(research.get("IWM").tvSymbol, "AMEX:IWM");
  assert.equal(research.get("SMCI").name, "Super Micro Computer");
  assert.equal(research.get("SMCI").tvSymbol, "NASDAQ:SMCI");
  assert.equal(research.get("CBRS").name, "Cerebras Systems");
  assert.equal(research.get("CBRS").tvSymbol, "NASDAQ:CBRS");
  assert.equal(research.get("BULL").name, "Webull Corporation");
  assert.equal(research.get("BULL").tvSymbol, "NASDAQ:BULL");
  assert.equal(research.get("BMNR").tvSymbol, "NYSE:BMNR");
  assert.equal(research.get("TLT").tvSymbol, "NASDAQ:TLT");
  assert.equal(research.get("USOIL").postedChartChannel, "commodities");
  assert.equal(research.get("XRP").postedChartChannel, "crypto");
});

test("retained July 22 chart updates use the source-post timeframes and levels", async () => {
  const data = await loadData();
  const research = new Map(data.research.tickers.map((ticker) => [ticker.ticker, ticker]));
  const expected = {
    IWM: ["6 hours", "$292.66", "$309.91"],
    TQQQ: ["6 hours", "$68.61", "$71.52"],
    SMCI: ["12 hours", "Recent range", "$35.61"],
    MON: ["12 hours", "$0.01814", "$0.025"]
  };

  for (const [ticker, [timeframe, support, resistance]] of Object.entries(expected)) {
    const note = research.get(ticker);
    assert.equal(note.postedChartDate, "2026-07-22", `${ticker} source date`);
    assert.equal(note.analysisTimeframe, timeframe, `${ticker} timeframe`);
    assert.ok(note.levels.support.some((level) => level.price === support), `${ticker} support`);
    assert.ok(note.levels.resistance.some((level) => level.price === resistance), `${ticker} resistance`);
  }
});

test("retained July 23 posts preserve five Research records", async () => {
  const data = await loadData();
  const research = new Map(data.research.tickers.map((ticker) => [ticker.ticker, ticker]));
  const expected = {
    ORCL: ["1 week", "$123", "$141"],
    CLF: ["12 hours", "Recent range", "$11.32"],
    GOOGL: ["12 hours", "$295.88", "$329.28"],
    SYM: ["12 hours", "$31.62", "$43.69"],
    SOFI: ["1 week", "$14.89", "$20"]
  };

  for (const [ticker, [timeframe, support, resistance]] of Object.entries(expected)) {
    const note = research.get(ticker);
    assert.equal(note.postedChartDate, "2026-07-23", `${ticker} source date`);
    assert.equal(note.analysisTimeframe, timeframe, `${ticker} timeframe`);
    assert.ok(note.levels.support.some((level) => level.price === support), `${ticker} support`);
    assert.ok(note.levels.resistance.some((level) => level.price === resistance), `${ticker} resistance`);
  }

  assert.ok(research.get("SYM").levels.resistance.some(({ price }) => price === "$52.16"));
  assert.ok(research.get("SOFI").levels.support.some(({ price }) => price === "$13.55"));
  assert.ok(research.get("SOFI").levels.resistance.some(({ price }) => price === "$24.68"));
});

test("retained July 24 post preserves AXP", async () => {
  const data = await loadData();
  const research = new Map(data.research.tickers.map((ticker) => [ticker.ticker, ticker]));
  const expected = {
    AXP: ["stocks", "6 hours", "$289.47", "$327"]
  };

  for (const [ticker, [channel, timeframe, support, resistance]] of Object.entries(expected)) {
    const note = research.get(ticker);
    assert.equal(note.postedChartDate, "2026-07-24", `${ticker} source date`);
    assert.equal(note.postedChartChannel, channel, `${ticker} source channel`);
    assert.equal(note.analysisTimeframe, timeframe, `${ticker} timeframe`);
    assert.ok(note.levels.support.some((level) => level.price === support), `${ticker} support`);
    assert.ok(note.levels.resistance.some((level) => level.price === resistance), `${ticker} resistance`);
  }
});

test("July 27 stock and crypto posts retain nine Research records", async () => {
  const data = await loadData();
  const research = new Map(data.research.tickers.map((ticker) => [ticker.ticker, ticker]));
  const expected = {
    NFLX: ["stocks", "12 hours", "$70", "$74.90"],
    HD: ["stocks", "12 hours", "$310", "$337.81"],
    META: ["stocks", "12 hours", "$544.12", "$606.21"],
    CRCL: ["stocks", "12 hours", "$64.00", "$70–$71"],
    AMD: ["stocks", "12 hours", "Recent range / local lows", "$528.50"],
    BULL: ["stocks", "12 hours", "$7.52", "$9"],
    CBRS: ["stocks", "12 hours", "$181", "$198"],
    TSLA: ["stocks", "6 hours", "$299–$300", "$336.84"],
    LINK: ["crypto", "12 hours", "$8.60", "$9.63"]
  };

  for (const [ticker, [channel, timeframe, support, resistance]] of Object.entries(expected)) {
    const note = research.get(ticker);
    assert.equal(note.postedChartDate, "2026-07-27", `${ticker} source date`);
    assert.equal(note.postedChartChannel, channel, `${ticker} source channel`);
    assert.equal(note.analysisTimeframe, timeframe, `${ticker} timeframe`);
    assert.ok(note.levels.support.some((level) => level.price === support), `${ticker} support`);
    assert.ok(note.levels.resistance.some((level) => level.price === resistance), `${ticker} resistance`);
  }
});

test("July 28 stock post retains the unchanged PYPL Research record", async () => {
  const data = await loadData();
  const research = new Map(data.research.tickers.map((ticker) => [ticker.ticker, ticker]));
  const expected = {
    PYPL: ["stocks", "12 hours", "$56.50", "$68.29"]
  };

  for (const [ticker, [channel, timeframe, support, resistance]] of Object.entries(expected)) {
    const note = research.get(ticker);
    assert.equal(note.postedChartDate, "2026-07-28", `${ticker} source date`);
    assert.equal(note.postedChartChannel, channel, `${ticker} source channel`);
    assert.equal(note.analysisTimeframe, timeframe, `${ticker} timeframe`);
    assert.ok(note.levels.support.some((level) => level.price === support), `${ticker} support`);
    assert.ok(note.levels.resistance.some((level) => level.price === resistance), `${ticker} resistance`);
  }
});

test("July 31 stock and crypto posts retain six Research records", async () => {
  const data = await loadData();
  const research = new Map(data.research.tickers.map((ticker) => [ticker.ticker, ticker]));
  const expected = {
    BABA: ["stocks", "12 hours", "$120", "$130–$138", "https://www.tradingview.com/x/hBAtF6dp/"],
    AMZN: ["stocks", "12 hours", "$249.74", "$274.95", "https://www.tradingview.com/x/OG3oejFv/"],
    SQQQ: ["stocks", "12 hours", "$40.68", "$45.63", "https://www.tradingview.com/x/qKaWIM1J/"],
    VIX: ["stocks", "12 hours", "$13.97", "Recent local highs", "https://www.tradingview.com/x/xRql2ppN/"],
    NVO: ["stocks", "12 hours", "Low-$40s", "$48.79", "https://www.tradingview.com/x/t2mdZUYE/"],
    COIN: ["crypto", "12 hours", "$137.50", "$159–$175", "https://www.tradingview.com/x/asF1Pfhw/"]
  };

  for (const [ticker, [channel, timeframe, support, resistance, url]] of Object.entries(expected)) {
    const note = research.get(ticker);
    assert.equal(note.postedChartDate, "2026-07-31", `${ticker} source date`);
    assert.equal(note.postedChartChannel, channel, `${ticker} source channel`);
    assert.equal(note.analysisTimeframe, timeframe, `${ticker} timeframe`);
    assert.equal(note.postedChartUrl, url, `${ticker} posted chart`);
    assert.ok(note.levels.support.some((level) => level.price === support), `${ticker} support`);
    assert.ok(note.levels.resistance.some((level) => level.price === resistance), `${ticker} resistance`);
  }
});

test("research ratings and analysis structures remain valid", async () => {
  const data = await loadData();
  const risks = new Set(data.meta.riskScale);
  const ratings = new Set(data.meta.fundamentalsScale);
  const channels = new Set([
    "stocks", "crypto", "bonds", "commodities",
    "ai-day-trading", "ai-swing-trading", "ai-long-term-investing"
  ]);
  const seenTickers = new Set();

  for (const ticker of data.research.tickers) {
    assert.match(ticker.ticker, /^[A-Z0-9]+$/, `${ticker.ticker} uppercase ticker`);
    assert.ok(!seenTickers.has(ticker.ticker), `${ticker.ticker} is unique`);
    seenTickers.add(ticker.ticker);
    assert.match(ticker.tvSymbol, /^[A-Z0-9]+:[A-Z0-9.]+$/, `${ticker.ticker} TradingView symbol`);
    assert.match(ticker.postedChartDate, /^2026-(?:07-(?:0[6-9]|1[0-9]|2[0-9]|3[01])|08-(?:0[5-7]|1[89]))$/,
      `${ticker.ticker} source date is inside the requested window`);
    assert.ok(channels.has(ticker.postedChartChannel), `${ticker.ticker} source channel`);
    assert.ok(ticker.analysisTimeframe, `${ticker.ticker} analysis timeframe`);
    assert.ok(risks.has(ticker.risk), `${ticker.ticker} risk rating`);
    assert.ok(ratings.has(ticker.fundamentals.rating), `${ticker.ticker} fundamental rating`);
    assert.ok(ticker.bullish.length > 0, `${ticker.ticker} bullish case`);
    assert.ok(ticker.bearish.length > 0, `${ticker.ticker} bearish case`);
    assert.ok(ticker.levels.support.length + ticker.levels.resistance.length > 0,
      `${ticker.ticker} price levels`);
    assert.ok(ticker.fundamentals.metrics.length > 0, `${ticker.ticker} fundamental metrics`);
  }

  assert.ok(data.research.tickers.some((ticker) => ticker.postedChartChannel === "stocks"));
  assert.ok(data.research.tickers.some((ticker) => ticker.postedChartChannel === "crypto"));
  assert.ok(data.research.tickers.some((ticker) => ticker.postedChartChannel === "commodities"));
  assert.equal(data.research.tickers.some((ticker) => ticker.postedChartChannel === "bonds"), true,
    "the August 7 #bonds chart post is represented");
});

test("August 18 AI-channel charts add complete AMGN and HAE Research notes", async () => {
  const data = await loadData();
  const research = new Map(data.research.tickers.map((ticker) => [ticker.ticker, ticker]));
  const expected = {
    AMGN: ["ai-long-term-investing", "$414–$420", "$422", "https://www.tradingview.com/x/mLCkJ9rZ/"],
    HAE: ["ai-swing-trading", "$100", "$107.50", "https://www.tradingview.com/x/v2fBNkrd/"]
  };

  for (const [ticker, [channel, support, resistance, chartUrl]] of Object.entries(expected)) {
    const note = research.get(ticker);
    assert.ok(note, `${ticker} note exists`);
    assert.equal(note.postedChartDate, "2026-08-18");
    assert.equal(note.postedChartChannel, channel);
    assert.equal(note.postedChartUrl, chartUrl);
    assert.ok(note.tags.includes("watch only"), `${ticker} is not presented as a filled trade`);
    assert.ok(note.levels.support.some((level) => level.price === support), `${ticker} support`);
    assert.ok(note.levels.resistance.some((level) => level.price === resistance), `${ticker} trigger`);
  }

  assert.equal(research.has("AMLX"), false, "invalidated AMLX stays in the setup-review journal");
});

test("August 19 AI-channel charts add complete TGT, MRVL, and MRK Research notes", async () => {
  const data = await loadData();
  const research = new Map(data.research.tickers.map((ticker) => [ticker.ticker, ticker]));
  const expected = {
    TGT: ["ai-day-trading", "$160.00", "$160.50", "https://www.tradingview.com/x/W1isJICm/"],
    MRVL: ["ai-swing-trading", "$228–$234", "$240.50", "https://www.tradingview.com/x/BVJy2Tzh/"],
    MRK: ["ai-long-term-investing", "$136–$140", "$140", "https://www.tradingview.com/x/Qbwhst7e/"]
  };

  for (const [ticker, [channel, support, resistance, chartUrl]] of Object.entries(expected)) {
    const note = research.get(ticker);
    assert.ok(note, `${ticker} note exists`);
    assert.equal(note.postedChartDate, "2026-08-19");
    assert.equal(note.postedChartChannel, channel);
    assert.equal(note.postedChartUrl, chartUrl);
    assert.ok(note.levels.support.some((level) => level.price === support), `${ticker} support`);
    assert.ok(note.levels.resistance.some((level) => level.price === resistance), `${ticker} trigger`);
  }

  assert.ok(research.get("TGT").tags.includes("triggered setup"));
  assert.ok(research.get("MRVL").tags.includes("watch only"));
  assert.ok(research.get("MRK").tags.includes("watch only"));
});

test("August 5-7 eligible chart posts refresh or add Research records", async () => {
  const data = await loadData();
  const research = new Map(data.research.tickers.map((ticker) => [ticker.ticker, ticker]));
  const expected = {
    SNAP: ["2026-08-05", "stocks", "12 hours", "$4.81–$5.38", "$7.07", "https://www.tradingview.com/x/NZ529F5T/"],
    BMNR: ["2026-08-05", "crypto", "6 hours", "$12.86", "$17.62", "https://www.tradingview.com/x/ccnp6Ed4/"],
    CLOV: ["2026-08-06", "stocks", "1 week", "$3.81", "$6.46", "https://www.tradingview.com/x/po7a6W5Z/"],
    MU: ["2026-08-06", "stocks", "12 hours", "$862", "$955.41", "https://www.tradingview.com/x/a6Hg1LWL/"],
    USOIL: ["2026-08-06", "commodities", "3 hours", "$77.02", "$107.45", "https://www.tradingview.com/x/NrDsE96k/"],
    QQQ: ["2026-08-07", "stocks", "6 hours", "$705.23", "$722", "https://www.tradingview.com/x/11TuD6Yn/"],
    SOUN: ["2026-08-07", "stocks", "6 hours", "$5.80–$6.41", "$8.99–$10.18", "https://www.tradingview.com/x/UFENV5Wu/"],
    HOOD: ["2026-08-07", "stocks", "6 hours", "$65.57", "$95.61", "https://www.tradingview.com/x/n02G51ho/"],
    PLTR: ["2026-08-07", "stocks", "6 hours", "$164", "$189.61–$199.17", "https://www.tradingview.com/x/pbK050Ku/"],
    NVAX: ["2026-08-07", "stocks", "6 hours", "$6.60", "$11.52", "https://www.tradingview.com/x/dP4csqXH/"],
    BTC: ["2026-08-07", "crypto", "6 hours", "$60,029", "$65,552", "https://www.tradingview.com/x/ncwziUG7/"],
    ETH: ["2026-08-07", "crypto", "6 hours", "$1,834.15", "$1,939.94", "https://www.tradingview.com/x/VcwfiLXP/"],
    MSTR: ["2026-08-07", "crypto", "6 hours", "$88.24–$100.61", "$197.27", "https://www.tradingview.com/x/eEX9jb70/"],
    GOLD: ["2026-08-07", "commodities", "6 hours", "$4,270.88", "$4,376.60", "https://www.tradingview.com/x/wg6zO99O/"],
    SLV: ["2026-08-07", "commodities", "1 week", "$49.44–$50.00", "$58.50", "https://www.tradingview.com/x/j5ykPx5F/"],
    TLT: ["2026-08-07", "bonds", "1 week", "$80.30–$82.47", "$96.88", "https://www.tradingview.com/x/72VIBXi6/"]
  };

  for (const [ticker, [date, channel, timeframe, support, resistance, url]] of Object.entries(expected)) {
    const note = research.get(ticker);
    assert.ok(note, `${ticker} research note exists`);
    assert.equal(note.postedChartDate, date);
    assert.equal(note.postedChartChannel, channel);
    assert.equal(note.analysisTimeframe, timeframe);
    assert.equal(note.postedChartUrl, url);
    assert.ok(note.levels.support.some((level) => level.price === support), `${ticker} support`);
    assert.ok(note.levels.resistance.some((level) => level.price === resistance), `${ticker} resistance`);
  }
});

test("AI Analysis stays concise and valid for every Research ticker", async () => {
  const data = await loadData();
  const scale = ["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"];
  const expectedTickers = data.research.tickers.map((ticker) => ticker.ticker).sort();
  const rated = data.research.tickers.filter((ticker) => ticker.aiAnalysis);

  assert.deepEqual(data.meta.aiAnalysisScale, scale);
  assert.deepEqual(rated.map((ticker) => ticker.ticker).sort(), expectedTickers);

  for (const ticker of rated) {
    assert.ok(scale.includes(ticker.aiAnalysis.rating), `${ticker.ticker} AI rating`);
    assert.equal(ticker.aiAnalysis.why, ticker.aiAnalysis.why.trim(), `${ticker.ticker} trimmed why`);
    assert.ok(ticker.aiAnalysis.why.length > 0 && ticker.aiAnalysis.why.length <= 160,
      `${ticker.ticker} concise why`);
  }
});

test("pre-existing Research tickers have complete July monthly updates for August momentum", async () => {
  const data = await loadData();
  const scale = ["Positive", "Mixed", "Negative"];
  const tickers = data.research.tickers.map((ticker) => ticker.ticker).sort();
  const updates = data.research.monthlyUpdates || {};

  assert.deepEqual(data.meta.monthlyMomentumScale, scale);
  const monthlyTickers = tickers.filter((ticker) =>
    !["TGT", "MRVL", "MRK", "AMGN", "HAE", "CLOV", "MU", "BMNR", "TLT"].includes(ticker)
  );
  assert.deepEqual(Object.keys(updates).sort(), monthlyTickers, "monthly updates cover the pre-existing Research tickers");

  for (const ticker of monthlyTickers) {
    const update = updates[ticker];
    assert.equal(update.period, "July 2026", `${ticker} period`);
    assert.equal(update.asOf, "2026-07-31", `${ticker} cutoff`);
    assert.ok(scale.includes(update.momentum), `${ticker} momentum`);
    for (const field of [
      "julyReturnPct", "lastClose", "shortReturnPct", "versusSma20Pct", "versusSma50Pct", "rsi14"
    ]) {
      assert.equal(typeof update[field], "number", `${ticker} ${field} is numeric`);
      assert.ok(Number.isFinite(update[field]), `${ticker} ${field} is finite`);
    }
    assert.ok(update.lastClose > 0, `${ticker} has a positive close`);
    assert.ok(update.rsi14 >= 0 && update.rsi14 <= 100, `${ticker} RSI range`);
    assert.ok(["5 sessions", "7 days"].includes(update.shortWindow), `${ticker} short window`);
    assert.match(update.sourceSymbol, /^[A-Z0-9^=.\-]+$/, `${ticker} source symbol`);
    assert.equal(update.summary, update.summary.trim(), `${ticker} trimmed summary`);
    assert.equal(update.watch, update.watch.trim(), `${ticker} trimmed watch`);
    assert.ok(update.summary.length >= 40 && update.summary.length <= 220, `${ticker} concise summary`);
    assert.ok(update.watch.length >= 20 && update.watch.length <= 140, `${ticker} concise watch`);
    assert.doesNotMatch(update.summary + update.watch, /https?:\/\/|<[^>]+>/i, `${ticker} clean copy`);
  }

  assert.equal(updates.ETH.lastClose, 1860.35, "ETH uses the dated Jul 31 close");
  assert.equal(updates.BTC.shortWindow, "7 days", "crypto uses a seven-day comparison");
  assert.equal(updates.GOLD.sourceSymbol, "GC=F", "gold uses the disclosed futures proxy");
  assert.match(updates.GOLD.sourceNote, /futures proxy/i);
  assert.equal(updates.USOIL.sourceSymbol, "CL=F", "oil uses the disclosed futures proxy");
  assert.match(updates.USOIL.sourceNote, /futures proxy/i);
  assert.match(updates.VIX.sourceNote, /non-investable/i);
  assert.match(updates.CBRS.sourceNote, /limited .*history/i);
});

test("Research renders the escaped monthly outlook separately from the AI rating", async () => {
  const source = await readFile(new URL("assets/app.js", ROOT), "utf8");
  const aiPosition = source.indexOf("aiCard +");
  const monthlyPosition = source.indexOf("monthlyCard +", aiPosition);
  const historyPosition = source.indexOf('historical-context');

  assert.match(source, /DATA\.research\.monthlyUpdates/);
  assert.match(source, /monthlyReady/);
  assert.match(source, /esc\(monthly\.summary\)/);
  assert.match(source, /esc\(monthly\.watch\)/);
  assert.match(source, /esc\(monthly\.sourceNote\)/);
  assert.match(source, /Price momentum only; educational, not financial advice\./);
  assert.ok(aiPosition > historyPosition && monthlyPosition > aiPosition,
    "older analysis and monthly context remain inside collapsed history");
});

test("the site loads setup reviews instead of the retired AI portfolio overlay", async () => {
  const source = await readFile(new URL("index.html", ROOT), "utf8");

  assert.match(source, /assets\/styles\.css\?v=20260906-refresh/);
  assert.match(source, /data\/app-data\.js\?v=20260904-discord-sync/);
  assert.match(source, /data\/trade-setup-reviews\.js\?v=20260904-discord-sync/);
  assert.match(source, /data\/discord-research-sync\.js\?v=20260904-discord-sync/);
  assert.match(source, /assets\/app\.js\?v=20260906-refresh/);
  assert.match(source, /data\/live-prices\.js\?v=20260904-discord-sync/);
  assert.doesNotMatch(source, /ai-portfolio-state\.js/);
  assert.ok(
    source.indexOf("data/app-data.js") < source.indexOf("data/trade-setup-reviews.js") &&
      source.indexOf("data/trade-setup-reviews.js") < source.indexOf("assets/app.js"),
    "setup reviews load after app data and before the renderer"
  );
});

test("Research conditionally renders an escaped AI Analysis card", async () => {
  const source = await readFile(new URL("assets/app.js", ROOT), "utf8");

  assert.match(source, /ai && ai\.rating && ai\.why/);
  assert.match(source, /Historical analysis: ' \+ esc\(ai\.rating\)/);
  assert.match(source, /<strong>Rationale:<\/strong> ' \+ esc\(ai\.why\)/);
  assert.match(source, /Educational view, not financial advice\./);
});

test("research chart button uses each note's source channel", async () => {
  const source = await readFile(new URL("assets/app.js", ROOT), "utf8");

  assert.match(source, /"stocks", "crypto", "bonds", "commodities"/);
  assert.match(source, /"ai-day-trading", "ai-swing-trading", "ai-long-term-investing"/);
  assert.match(source, /Open latest #' \+ esc\(postedChartChannel\(t\.postedChartChannel\)\) \+ ' chart/);
  assert.doesNotMatch(source, /Open latest #stocks chart/);
});

test("the site shell revalidates so Research code and data cannot drift", async () => {
  const config = JSON.parse(await readFile(new URL("firebase.json", ROOT), "utf8"));
  const rootRule = config.hosting.headers.find((rule) => rule.source === "/");
  const cacheControl = rootRule?.headers?.find((header) => header.key === "Cache-Control")?.value;

  assert.match(cacheControl, /no-cache/);
  assert.match(cacheControl, /max-age=0/);
});
