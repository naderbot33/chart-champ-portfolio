/*
 * Refresh ChartChamp's holding and benchmark quote history from Yahoo Finance.
 *
 * The holding list, benchmark ticker, and chart start date come from
 * data/app-data.js. A failed holding request carries forward the previous quote
 * with `stale: true`; scheduled validation will then skip deployment and
 * Discord delivery. Benchmark failures are non-fatal so the dashboard can use
 * its documented portfolio-only fallback.
 */
import {
  existsSync,
  readFileSync,
  renameSync,
  writeFileSync
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_JS = join(ROOT, "data", "app-data.js");
const OUT_JS = join(ROOT, "data", "live-prices.js");
const OUT_JSON = join(ROOT, "data", "live-prices.json");
const USER_AGENT =
  "Mozilla/5.0 (compatible; ChartChampPortfolio/1.0; +https://chartchamp.web.app/)";

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const roundPrice = (value) => Math.round(Number(value) * 10000) / 10000;
const isFiniteNumber = (value) => Number.isFinite(Number(value));
const isPositiveNumber = (value) => isFiniteNumber(value) && Number(value) > 0;
const isoDay = (unixSeconds) => new Date(unixSeconds * 1000).toISOString().slice(0, 10);

function loadAppData() {
  const window = {};
  new Function("window", readFileSync(DATA_JS, "utf8"))(window);
  if (!window.APP_DATA?.portfolio) {
    throw new Error("data/app-data.js did not define window.APP_DATA.portfolio");
  }
  return window.APP_DATA;
}

function loadPreviousSnapshot() {
  if (!existsSync(OUT_JSON)) return { prices: {}, benchmark: null };
  try {
    const snapshot = JSON.parse(readFileSync(OUT_JSON, "utf8"));
    return {
      prices: snapshot?.prices ?? {},
      benchmark: snapshot?.benchmark ?? null
    };
  } catch (error) {
    console.warn(`Previous quote snapshot could not be read: ${error.message}`);
    return { prices: {}, benchmark: null };
  }
}

function sessionLabel(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    hour12: false
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  if (hour < 9) return "pre-market";
  if (hour < 12) return "morning";
  if (hour < 16) return "intraday";
  return "close";
}

async function yahooRequest(ticker) {
  const params = new URLSearchParams({
    range: "1y",
    interval: "1d",
    includePrePost: "false",
    events: "div,splits"
  });
  const attempts = [
    { host: "query1", delay: 0 },
    { host: "query2", delay: 2500 },
    { host: "query1", delay: 8000 }
  ];
  let lastError;

  for (const attempt of attempts) {
    if (attempt.delay) await sleep(attempt.delay);
    try {
      const url = `https://${attempt.host}.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
        ticker
      )}?${params}`;
      const response = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(15000)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const chartError = payload?.chart?.error;
      const result = payload?.chart?.result?.[0];
      if (chartError || !result) {
        throw new Error(chartError?.description || "missing chart result");
      }
      return result;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Yahoo Finance request failed");
}

function normalizeYahooChart(ticker, result) {
  const meta = result?.meta ?? {};
  const timestamps = Array.isArray(result?.timestamp) ? result.timestamp : [];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  const rows = new Map();

  timestamps.forEach((timestamp, index) => {
    if (!isFiniteNumber(timestamp) || !isPositiveNumber(closes[index])) return;
    rows.set(isoDay(timestamp), {
      date: isoDay(timestamp),
      close: roundPrice(closes[index])
    });
  });

  const marketTime = Number(meta.regularMarketTime ?? timestamps.at(-1));
  const last = Number(meta.regularMarketPrice ?? closes.at(-1));
  if (!isFiniteNumber(marketTime) || !isPositiveNumber(last)) {
    throw new Error(`Yahoo Finance returned no current regular-market quote for ${ticker}`);
  }

  const lastDay = isoDay(marketTime);
  rows.set(lastDay, { date: lastDay, close: roundPrice(last) });
  const history = Array.from(rows.values()).sort((a, b) => a.date.localeCompare(b.date));
  const precedingClose = [...history].reverse().find((row) => row.date < lastDay)?.close;
  const prevClose = [
    meta.previousClose,
    precedingClose,
    meta.chartPreviousClose,
    last
  ].map(Number).find(isPositiveNumber);

  return {
    ticker: String(meta.symbol || ticker).toUpperCase(),
    last: roundPrice(last),
    prevClose: roundPrice(prevClose),
    history: history.slice(-260),
    asOf: new Date(marketTime * 1000).toISOString(),
    currency: meta.currency || "USD",
    exchangeName: meta.exchangeName || ""
  };
}

async function fetchQuote(ticker) {
  return normalizeYahooChart(ticker, await yahooRequest(ticker));
}

function atomicWrite(path, content) {
  const temporaryPath = `${path}.tmp`;
  writeFileSync(temporaryPath, content, "utf8");
  renameSync(temporaryPath, path);
}

async function main() {
  const appData = loadAppData();
  const portfolio = appData.portfolio;
  const previous = loadPreviousSnapshot();
  const holdings = portfolio.holdings ?? [];
  const tickers = [...new Set(
    holdings
      .filter((holding) =>
        holding?.ticker &&
        holding.assetClass !== "Cash" &&
        holding.closed !== true &&
        Number(holding.shares) > 0
      )
      .map((holding) => String(holding.ticker).toUpperCase())
  )];
  const closedTickers = [...new Set(
    holdings
      .filter((holding) =>
        holding?.ticker &&
        holding.assetClass !== "Cash" &&
        (holding.closed === true || Number(holding.shares) <= 0)
      )
      .map((holding) => String(holding.ticker).toUpperCase())
  )];
  const benchmarkTicker = String(portfolio.benchmarkTicker || "").toUpperCase();

  if (!tickers.length) {
    throw new Error("No quote-enabled holdings were found in the community portfolio");
  }

  const prices = {};
  const failures = [];
  let freshHoldingCount = 0;

  for (const ticker of tickers) {
    if (Object.keys(prices).length) await sleep(300);
    try {
      prices[ticker] = await fetchQuote(ticker);
      freshHoldingCount += 1;
      console.log(`${ticker}: ${prices[ticker].last} as of ${prices[ticker].asOf}`);
    } catch (error) {
      failures.push({ ticker, reason: error.message });
      if (previous.prices[ticker]) {
        prices[ticker] = { ...previous.prices[ticker], stale: true };
        console.warn(`${ticker}: ${error.message}; previous quote retained and marked stale`);
      } else {
        console.warn(`${ticker}: ${error.message}; no previous quote is available`);
      }
    }
  }

  for (const ticker of closedTickers) {
    if (previous.prices[ticker]) {
      prices[ticker] = { ...previous.prices[ticker], closed: true };
      console.log(`${ticker}: retained historical quote series for closed position`);
    }
  }

  if (!freshHoldingCount) {
    throw new Error("Every holding quote request failed; the existing snapshot was left untouched");
  }

  let benchmark = null;
  if (benchmarkTicker) {
    try {
      benchmark = await fetchQuote(benchmarkTicker);
      console.log(`${benchmarkTicker} benchmark: ${benchmark.last} as of ${benchmark.asOf}`);
    } catch (error) {
      failures.push({ ticker: benchmarkTicker, reason: error.message, benchmark: true });
      benchmark = previous.benchmark
        ? { ...previous.benchmark, ticker: benchmarkTicker, stale: true }
        : null;
      console.warn(
        `${benchmarkTicker} benchmark: ${error.message}; dashboard will use its portfolio-only fallback`
      );
    }
  }

  const holdingSourceTimes = Object.values(prices)
    .filter((quote) => !quote.stale && !quote.closed && Number.isFinite(Date.parse(quote.asOf)))
    .map((quote) => Date.parse(quote.asOf));
  const sourceTimestamp = holdingSourceTimes.length
    ? new Date(Math.min(...holdingSourceTimes)).toISOString()
    : null;
  const generatedAt = new Date().toISOString();
  const snapshot = {
    generatedAt,
    sourceTimestamp,
    session: sessionLabel(new Date()),
    provider: "Yahoo Finance chart API",
    chartStartDate: portfolio.chartStartDate || null,
    benchmarkTicker: benchmarkTicker || null,
    prices,
    benchmark,
    failures
  };
  const serialized = JSON.stringify(snapshot, null, 2);

  atomicWrite(OUT_JSON, `${serialized}\n`);
  atomicWrite(OUT_JS, `window.LIVE_PRICES = ${serialized};\n`);
  console.log(
    `Wrote ${Object.keys(prices).length}/${tickers.length} holding quotes` +
      (benchmark ? ` plus ${benchmarkTicker}` : "; benchmark unavailable")
  );
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
