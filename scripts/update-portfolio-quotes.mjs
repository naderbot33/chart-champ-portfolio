import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataPath = path.join(rootDir, "data", "portfolio-data.js");
const outputPath = path.join(rootDir, "data", "live-prices.js");

const toFiniteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const firstFinite = (...values) => {
  for (const value of values) {
    const number = toFiniteNumber(value);
    if (number !== null) return number;
  }
  return null;
};

const roundPrice = (value) => {
  const number = toFiniteNumber(value);
  return number === null ? null : Number(number.toFixed(4));
};

const dateKeyFromTimestamp = (timestampSeconds) => {
  const date = new Date(timestampSeconds * 1000);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
};

const loadPortfolioData = async () => {
  const code = await readFile(dataPath, "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox, { filename: dataPath });
  return sandbox.window.PORTFOLIO_DATA;
};

const fetchYahooChart = async (ticker) => {
  const params = new URLSearchParams({
    range: "1y",
    interval: "1d",
    includePrePost: "false"
  });
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 quote-refresh"
    }
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance request failed for ${ticker}: ${response.status}`);
  }

  const payload = await response.json();
  const error = payload.chart?.error;
  const result = payload.chart?.result?.[0];
  if (error || !result) {
    throw new Error(error?.description || `No Yahoo Finance chart data for ${ticker}`);
  }

  const meta = result.meta || {};
  const timestamps = Array.isArray(result.timestamp) ? result.timestamp : [];
  const closes = result.indicators?.quote?.[0]?.close || [];
  const rowsByDate = new Map();

  timestamps.forEach((timestamp, index) => {
    const close = roundPrice(closes[index]);
    if (close === null) return;
    rowsByDate.set(dateKeyFromTimestamp(timestamp), {
      datetime: dateKeyFromTimestamp(timestamp),
      close
    });
  });

  const marketTime = firstFinite(meta.regularMarketTime, timestamps.at(-1));
  const latestPrice = roundPrice(firstFinite(meta.regularMarketPrice, closes.at(-1)));
  if (marketTime === null || latestPrice === null) {
    throw new Error(`Latest Yahoo Finance quote missing for ${ticker}`);
  }

  const latestDate = dateKeyFromTimestamp(marketTime);
  rowsByDate.set(latestDate, {
    datetime: latestDate,
    close: latestPrice
  });

  const history = Array.from(rowsByDate.values()).sort((a, b) => b.datetime.localeCompare(a.datetime));
  const previousHistoryClose = history.find((row) => row.datetime < latestDate)?.close;
  const previousClose = roundPrice(firstFinite(meta.previousClose, previousHistoryClose, meta.chartPreviousClose));

  return {
    symbol: meta.symbol || ticker,
    latestPrice,
    previousClose,
    latestDate,
    priceTimestamp: new Date(marketTime * 1000).toISOString(),
    currency: meta.currency || "USD",
    exchangeName: meta.exchangeName || "",
    history: history.slice(0, 260)
  };
};

const main = async () => {
  const portfolioData = await loadPortfolioData();
  const holdings = portfolioData.holdings.filter((holding) => holding.quoteEnabled !== false);
  const prices = {};

  for (const holding of holdings) {
    prices[holding.ticker] = await fetchYahooChart(holding.ticker);
  }

  const snapshot = {
    generatedAt: new Date().toISOString(),
    provider: "Yahoo Finance chart API",
    prices
  };

  await writeFile(
    outputPath,
    `window.PORTFOLIO_LIVE_PRICES = ${JSON.stringify(snapshot, null, 2)};\n`,
    "utf8"
  );
  console.log(`Updated ${Object.keys(prices).length} quote snapshot(s).`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
