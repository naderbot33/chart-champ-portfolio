import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  fundamentalsScale,
  normalizeChartImage,
  parseNumber,
  parseNumberList,
  parseNumbersFromText,
  parseRecentUpdates,
  parseTags,
  readCsvRecords,
  splitSemicolonItems,
  toId,
  toTicker,
  watchlistOrder
} from "./watchlist-csv-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const watchlistsDir = path.join(rootDir, "watchlists");
const csvPath = path.join(watchlistsDir, "data", "watchlist-tracker.csv");
const dataPath = path.join(watchlistsDir, "data", "watchlist-data.js");
const indexPath = path.join(watchlistsDir, "index.html");

const localChartExists = (relativePath) => existsSync(path.join(watchlistsDir, relativePath));

const compactObject = (value) => {
  if (Array.isArray(value)) return value.map(compactObject);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => {
        if (entryValue === null || entryValue === undefined || entryValue === "") return false;
        if (Array.isArray(entryValue) && entryValue.length === 0) return false;
        return true;
      })
      .map(([key, entryValue]) => [key, compactObject(entryValue)])
  );
};

const formatParts = (date, timeZone = "America/Los_Angeles") => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
};

const buildVersion = (date) => {
  const parts = formatParts(date);
  return `${parts.year}${parts.month}${parts.day}-${parts.hour}${parts.minute}`;
};

const rowStatus = (row) => {
  const status = String(row.Status || "").trim().toLowerCase();
  return status === "published" ? "published" : "queued";
};

const uniqueNumbers = (values) => [...new Set(values)];

const buildData = async () => {
  const now = new Date();
  const records = await readCsvRecords(csvPath);
  const names = {};
  const listMap = new Map();
  const overrides = {};

  for (const row of records) {
    const ticker = toTicker(row.Ticker);
    if (!ticker) continue;

    const name = String(row.Name || ticker).trim();
    const watchlist = String(row.Watchlist || "Stocks").trim();
    const assetClass = String(row["Asset Class"] || watchlist).trim();
    const listId = toId(watchlist);
    const status = rowStatus(row);

    names[ticker] = name;

    if (!listMap.has(watchlist)) {
      listMap.set(watchlist, {
        id: listId,
        label: watchlist,
        assetClass,
        tickers: []
      });
    }
    listMap.get(watchlist).tickers.push(ticker);

    const chartUrl = String(row["Chart Link"] || "").trim();
    const chartImageUrl = normalizeChartImage(row["Chart Screenshot File"], chartUrl, localChartExists);
    const support = uniqueNumbers([
      ...parseNumberList(row["Support 1"], row["Support 2"], row["Support 3"], row["Support 4"]),
      ...parseNumbersFromText(row["Support Notes"])
    ]).sort((a, b) => b - a);
    const resistance = uniqueNumbers([
      ...parseNumberList(row["Resistance 1"], row["Resistance 2"], row["Resistance 3"], row["Resistance 4"]),
      ...parseNumbersFromText(row["Resistance Notes"])
    ]).sort((a, b) => a - b);
    const fundamentalsRating = String(row["Fundamentals Rating"] || "Pending").trim();
    const fundamentalsRationale = splitSemicolonItems(row["Fundamentals Rationale"]);
    const risks = splitSemicolonItems(row["Key Risks"]);
    const catalysts = splitSemicolonItems(row["Key Catalysts"]);
    const tagsFieldLooksLikeJson = /^\s*[\[{]/.test(String(row.Tags || ""));
    const tags = parseTags(tagsFieldLooksLikeJson ? row["Name/Source Notes"] : row.Tags || row["Name/Source Notes"]);
    const recentUpdates = parseRecentUpdates(
      row["Recent Updates JSON"] || (tagsFieldLooksLikeJson ? row.Tags : ""),
      ticker
    );

    const override = compactObject({
      tags,
      chartStatus: status,
      chartUrl,
      chartImageUrl,
      chartCapturedAt: String(row["Chart Date/Time"] || "").trim(),
      updatedAt: String(row["Last Updated"] || "").trim(),
      currentPrice: parseNumber(row["Current Price"]),
      weekly7Ema: parseNumber(row["Weekly 7 EMA"]),
      weekly200Ema: parseNumber(row["Weekly 200 EMA"]),
      support,
      resistance,
      fundamentalsRating,
      fundamentalsRationale:
        fundamentalsRationale.length > 1 ? fundamentalsRationale : fundamentalsRationale[0],
      risks: risks.length > 1 ? risks : risks[0],
      catalysts: catalysts.length > 1 ? catalysts : catalysts[0],
      recentUpdates
    });

    const hasPublishedData = status === "published";
    const hasNotes =
      tags.length > 0 ||
      fundamentalsRationale.length > 0 ||
      risks.length > 0 ||
      catalysts.length > 0 ||
      recentUpdates.length > 0;

    if (hasPublishedData || hasNotes) {
      overrides[ticker] = override;
    }
  }

  const knownLists = watchlistOrder.map((label) => {
    return (
      listMap.get(label) || {
        id: toId(label),
        label,
        assetClass: label,
        tickers: []
      }
    );
  });
  const remainingLists = [...listMap.entries()]
    .filter(([label]) => !watchlistOrder.includes(label))
    .map(([, list]) => list)
    .sort((a, b) => a.label.localeCompare(b.label));

  return {
    data: {
      metadata: {
        title: "Watchlists",
        updatedAt: now.toISOString(),
        neutralBandPct: 1,
        defaultChartStatus: "queued",
        fundamentalsScale
      },
      names: Object.fromEntries(Object.entries(names).sort(([a], [b]) => a.localeCompare(b))),
      lists: [...knownLists, ...remainingLists],
      overrides
    },
    version: buildVersion(now)
  };
};

const updateIndexVersions = async (version) => {
  const html = await readFile(indexPath, "utf8");
  const nextHtml = html
    .replace(/assets\/styles\.css\?v=[^"]+/g, `assets/styles.css?v=${version}`)
    .replace(/data\/watchlist-data\.js\?v=[^"]+/g, `data/watchlist-data.js?v=${version}`)
    .replace(/assets\/app\.js\?v=[^"]+/g, `assets/app.js?v=${version}`);
  await writeFile(indexPath, nextHtml, "utf8");
};

const main = async () => {
  const { data, version } = await buildData();
  await writeFile(dataPath, `window.WATCHLIST_DATA = ${JSON.stringify(data, null, 2)};\n`, "utf8");
  await updateIndexVersions(version);
  console.log(`Built watchlist data from CSV (${version}).`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
