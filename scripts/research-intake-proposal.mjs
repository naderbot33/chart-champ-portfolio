#!/usr/bin/env node
import { lstat, mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { runInNewContext } from "node:vm";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ALLOWED_CHANNELS = new Set(["stocks", "crypto", "bonds", "commodities"]);
const TICKER_PATTERN = /^[A-Z0-9]{1,12}$/u;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;
const CHART_URL_PATTERN = /^https:\/\/(?:www\.)?tradingview\.com\/x\/([A-Za-z0-9]+)\/?$/u;
const BUSINESS_FIELDS = [
  "name",
  "tvSymbol",
  "assetClass",
  "sector",
  "risk",
  "tags",
  "summary",
  "bullish",
  "bearish",
  "fundamentals"
];

const USAGE = `Usage:
  node scripts/research-intake-proposal.mjs --input runtime/research-intake-posts.json
    --after YYYY-MM-DD [--output runtime/research-intake-proposal.json]

The command is local and review-only. It cannot edit Research data, contact
Discord, refresh quotes, or deploy the site.
`;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function assertCalendarDate(value, label = "date") {
  if (!DATE_PATTERN.test(value || "")) throw new TypeError(`${label} must use YYYY-MM-DD`);
  const parsed = new Date(`${value}T12:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new TypeError(`${label} is not a valid calendar date`);
  }
  return value;
}

export function canonicalTradingViewSnapshot(value) {
  if (typeof value !== "string" || value.trim() !== value) return null;
  const match = value.match(CHART_URL_PATTERN);
  if (!match) return null;
  return `https://www.tradingview.com/x/${match[1]}/`;
}

function normalizeLevels(value) {
  if (value === undefined) return { support: [], resistance: [] };
  if (!isPlainObject(value)) return null;
  const output = {};
  for (const side of ["support", "resistance"]) {
    const levels = value[side] ?? [];
    if (!Array.isArray(levels)) return null;
    output[side] = [];
    for (const level of levels) {
      if (!isPlainObject(level)) return null;
      const price = typeof level.price === "string" ? level.price.trim() : "";
      const note = level.note === undefined
        ? ""
        : (typeof level.note === "string" ? level.note.trim() : null);
      if (!price || price.length > 100 || note === null || note.length > 300) return null;
      output[side].push(note ? { price, note } : { price });
    }
  }
  return output;
}

function rejected(inputIndex, ticker, code) {
  return { inputIndex, ...(ticker ? { ticker } : {}), code };
}

function normalizeCandidate(value, inputIndex) {
  if (!isPlainObject(value)) {
    return {
      inputIndex,
      ticker: null,
      validTicker: null,
      postedChartDate: null,
      postedChartUrl: null,
      candidate: null,
      code: "INVALID_CANDIDATE"
    };
  }
  const ticker = typeof value.ticker === "string" ? value.ticker.trim() : "";
  const validTicker = TICKER_PATTERN.test(ticker) ? ticker : null;
  const postedChartUrl = canonicalTradingViewSnapshot(value.postedChartUrl);
  let postedChartDate = null;
  try {
    postedChartDate = assertCalendarDate(value.postedChartDate, "postedChartDate");
  } catch {
    postedChartDate = null;
  }
  const base = { inputIndex, ticker: ticker || null, validTicker, postedChartDate, postedChartUrl };
  if (!TICKER_PATTERN.test(ticker)) {
    return { ...base, candidate: null, code: "INVALID_TICKER" };
  }
  const channel = value.postedChartChannel;
  if (typeof channel !== "string" || !ALLOWED_CHANNELS.has(channel)) {
    return { ...base, candidate: null, code: "INVALID_CHANNEL" };
  }
  if (!postedChartDate) return { ...base, candidate: null, code: "INVALID_POST_DATE" };
  if (!postedChartUrl) {
    return { ...base, candidate: null, code: "INVALID_CHART_URL" };
  }
  let analysisTimeframe = null;
  if (value.analysisTimeframe !== undefined && value.analysisTimeframe !== null) {
    if (typeof value.analysisTimeframe !== "string") {
      return { ...base, candidate: null, code: "INVALID_TIMEFRAME" };
    }
    analysisTimeframe = value.analysisTimeframe.trim();
    if (!analysisTimeframe || analysisTimeframe.length > 80) {
      return { ...base, candidate: null, code: "INVALID_TIMEFRAME" };
    }
  }
  let sourceText = null;
  if (value.sourceText !== undefined && value.sourceText !== null) {
    if (typeof value.sourceText !== "string") {
      return { ...base, candidate: null, code: "INVALID_SOURCE_TEXT" };
    }
    sourceText = value.sourceText.trim();
    if (!sourceText || sourceText.length > 20_000) {
      return { ...base, candidate: null, code: "INVALID_SOURCE_TEXT" };
    }
  }
  const levels = normalizeLevels(value.levels);
  if (!levels) return { ...base, candidate: null, code: "INVALID_LEVELS" };
  return {
    ...base,
    candidate: {
      inputIndex,
      ticker,
      postedChartChannel: channel,
      postedChartDate: value.postedChartDate,
      postedChartUrl,
      analysisTimeframe,
      sourceText,
      levels
    },
    code: null
  };
}

function currentResearchIndex(researchTickers) {
  if (!Array.isArray(researchTickers)) throw new TypeError("Research tickers must be an array");
  const byTicker = new Map();
  const byUrl = new Map();
  const dates = [];
  for (const entry of researchTickers) {
    if (!isPlainObject(entry) || !TICKER_PATTERN.test(entry.ticker || "")) {
      throw new TypeError("Existing Research contains an invalid ticker");
    }
    if (byTicker.has(entry.ticker)) throw new TypeError(`Existing Research repeats ${entry.ticker}`);
    let postedChartDate = null;
    if (entry.postedChartDate !== undefined && entry.postedChartDate !== null) {
      postedChartDate = assertCalendarDate(entry.postedChartDate, `${entry.ticker} postedChartDate`);
      dates.push(postedChartDate);
    }
    let postedChartUrl = null;
    if (entry.postedChartUrl !== undefined && entry.postedChartUrl !== null) {
      postedChartUrl = canonicalTradingViewSnapshot(entry.postedChartUrl);
      if (!postedChartUrl) throw new TypeError(`${entry.ticker} has an invalid existing chart URL`);
      if (byUrl.has(postedChartUrl)) throw new TypeError("Existing Research repeats a chart URL");
      byUrl.set(postedChartUrl, entry.ticker);
    }
    byTicker.set(entry.ticker, {
      ticker: entry.ticker,
      postedChartDate,
      postedChartUrl,
      postedChartChannel: entry.postedChartChannel ?? null
    });
  }
  dates.sort();
  return { byTicker, byUrl, latestPostedChartDate: dates.at(-1) ?? null };
}

function publicationGaps(candidate, existing) {
  const gaps = [];
  if (!candidate.analysisTimeframe) gaps.push("analysisTimeframe");
  if (candidate.levels.support.length === 0) gaps.push("levels.support");
  if (candidate.levels.resistance.length === 0) gaps.push("levels.resistance");
  if (existing) gaps.push("bullish", "bearish");
  else gaps.push(...BUSINESS_FIELDS);
  return [...new Set(gaps)];
}

function proposalFor(candidate, existing) {
  return {
    action: existing ? "update" : "add",
    ticker: candidate.ticker,
    status: "needs-human-review",
    readyToApply: false,
    sourceIndex: candidate.inputIndex,
    source: {
      postedChartDate: candidate.postedChartDate,
      postedChartChannel: candidate.postedChartChannel,
      postedChartUrl: candidate.postedChartUrl,
      ...(candidate.sourceText ? { sourceText: candidate.sourceText } : {})
    },
    existing: existing ? {
      postedChartDate: existing.postedChartDate,
      postedChartChannel: existing.postedChartChannel,
      postedChartUrl: existing.postedChartUrl
    } : null,
    proposedTechnicalFields: {
      postedChartDate: candidate.postedChartDate,
      postedChartChannel: candidate.postedChartChannel,
      postedChartUrl: candidate.postedChartUrl,
      analysisTimeframe: candidate.analysisTimeframe,
      levels: candidate.levels
    },
    missingForPublication: publicationGaps(candidate, existing),
    reviewChecks: [
      "confirm-latest-discord-post",
      "verify-source-levels",
      "neutralize-advice-language",
      "verify-primary-source-fundamentals",
      "approve-before-app-data-change"
    ]
  };
}

export function buildResearchIntakeProposal({ snapshot, researchTickers, cutoffDate }) {
  assertCalendarDate(cutoffDate, "cutoffDate");
  if (!isPlainObject(snapshot) || snapshot.schemaVersion !== 1 || !Array.isArray(snapshot.candidates)) {
    throw new TypeError("Input must be schemaVersion 1 with a candidates array");
  }
  const current = currentResearchIndex(researchTickers);
  const records = snapshot.candidates.map((value, inputIndex) => normalizeCandidate(value, inputIndex));
  const rejections = [];

  const candidateUrlCounts = new Map();
  for (const record of records) {
    if (!record.postedChartUrl) continue;
    candidateUrlCounts.set(
      record.postedChartUrl,
      (candidateUrlCounts.get(record.postedChartUrl) || 0) + 1
    );
  }

  const latestDateByTicker = new Map();
  for (const record of records) {
    if (!record.validTicker || !record.postedChartDate) continue;
    const latest = latestDateByTicker.get(record.validTicker);
    if (!latest || record.postedChartDate > latest) {
      latestDateByTicker.set(record.validTicker, record.postedChartDate);
    }
  }
  const latestCountByTicker = new Map();
  for (const record of records) {
    if (!record.validTicker || !record.postedChartDate) continue;
    if (record.postedChartDate === latestDateByTicker.get(record.validTicker)) {
      latestCountByTicker.set(record.validTicker, (latestCountByTicker.get(record.validTicker) || 0) + 1);
    }
  }

  const proposals = [];
  for (const record of records) {
    const displayTicker = record.ticker || record.validTicker;
    if (record.postedChartUrl && candidateUrlCounts.get(record.postedChartUrl) > 1) {
      rejections.push(rejected(record.inputIndex, displayTicker, "DUPLICATE_CANDIDATE_URL"));
      continue;
    }
    if (record.code || !record.candidate) {
      rejections.push(rejected(record.inputIndex, displayTicker, record.code || "INVALID_CANDIDATE"));
      continue;
    }
    const candidate = record.candidate;
    if (candidate.postedChartDate < latestDateByTicker.get(candidate.ticker)) {
      rejections.push(rejected(candidate.inputIndex, candidate.ticker, "SUPERSEDED_BY_NEWER_CANDIDATE"));
      continue;
    }
    if (latestCountByTicker.get(candidate.ticker) > 1) {
      rejections.push(rejected(candidate.inputIndex, candidate.ticker, "AMBIGUOUS_LATEST_CANDIDATE"));
      continue;
    }
    if (candidate.postedChartDate <= cutoffDate) {
      rejections.push(rejected(candidate.inputIndex, candidate.ticker, "NOT_AFTER_CUTOFF"));
      continue;
    }
    if (current.byUrl.has(candidate.postedChartUrl)) {
      rejections.push(rejected(candidate.inputIndex, candidate.ticker, "DUPLICATE_EXISTING_URL"));
      continue;
    }
    const existing = current.byTicker.get(candidate.ticker);
    if (existing?.postedChartDate && candidate.postedChartDate < existing.postedChartDate) {
      rejections.push(rejected(candidate.inputIndex, candidate.ticker, "OLDER_THAN_EXISTING"));
      continue;
    }
    if (existing?.postedChartDate && candidate.postedChartDate === existing.postedChartDate) {
      rejections.push(rejected(candidate.inputIndex, candidate.ticker, "SAME_DAY_ORDER_UNPROVEN"));
      continue;
    }
    proposals.push(proposalFor(candidate, current.byTicker.get(candidate.ticker)));
  }

  proposals.sort((left, right) => (
    right.source.postedChartDate.localeCompare(left.source.postedChartDate) ||
    left.ticker.localeCompare(right.ticker)
  ));
  rejections.sort((left, right) => left.inputIndex - right.inputIndex || left.code.localeCompare(right.code));
  const add = proposals.filter((proposal) => proposal.action === "add").length;
  const update = proposals.length - add;
  return {
    schemaVersion: 1,
    mode: "review-only",
    approvalRequired: true,
    cutoffDate,
    baseline: {
      researchCount: researchTickers.length,
      latestPostedChartDate: current.latestPostedChartDate
    },
    summary: {
      scanned: snapshot.candidates.length,
      proposed: proposals.length,
      add,
      update,
      rejected: rejections.length
    },
    proposals,
    rejected: rejections
  };
}

export async function loadResearchTickers(appDataPath) {
  const source = await readFile(appDataPath, "utf8");
  const context = { window: {} };
  runInNewContext(source, context, { filename: appDataPath, timeout: 1_000 });
  // Match the live site's reviewed Discord layer, while supporting standalone fixtures.
  const syncPath = path.join(path.dirname(appDataPath), "discord-research-sync.js");
  let syncSource;
  try { syncSource = await readFile(syncPath, "utf8"); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  if (syncSource) runInNewContext(syncSource, context, { filename: syncPath, timeout: 1_000 });
  const tickers = context.window.APP_DATA?.research?.tickers;
  if (!Array.isArray(tickers)) throw new TypeError("app-data.js has no Research ticker array");
  return tickers;
}

function parseArguments(argv) {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) return { help: true };
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!["--input", "--after", "--output"].includes(token)) {
      throw new TypeError(`Unknown argument: ${token}`);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new TypeError(`Missing value for ${token}`);
    const key = token.slice(2);
    if (options[key] !== undefined) throw new TypeError(`Repeated argument: ${token}`);
    options[key] = value;
    index += 1;
  }
  if (!options.input) throw new TypeError("--input is required");
  if (!options.after) throw new TypeError("--after is required");
  return options;
}

async function confinedRuntimePath(root, value, label, { mustExist = false } = {}) {
  const runtime = path.resolve(root, "runtime");
  const resolved = path.resolve(root, value);
  if (path.dirname(resolved) !== runtime || path.extname(resolved) !== ".json") {
    throw new TypeError(`${label} must be a direct JSON child of runtime/`);
  }
  const runtimeInfo = await lstat(runtime).catch(() => null);
  if (!runtimeInfo?.isDirectory() || runtimeInfo.isSymbolicLink()) {
    throw new TypeError("runtime/ must be a real directory");
  }
  if (mustExist) {
    const inputInfo = await lstat(resolved).catch(() => null);
    if (!inputInfo?.isFile() || inputInfo.isSymbolicLink()) {
      throw new TypeError(`${label} must be a regular file, not a symbolic link`);
    }
    const [realRuntime, realInput] = await Promise.all([realpath(runtime), realpath(resolved)]);
    if (path.dirname(realInput) !== realRuntime) {
      throw new TypeError(`${label} resolves outside runtime/`);
    }
  }
  return resolved;
}

export async function runResearchIntakeCli(
  argv,
  { root = ROOT, stdout = process.stdout } = {}
) {
  const options = parseArguments(argv);
  if (options.help) {
    stdout.write(USAGE);
    return { outcome: "help" };
  }
  const inputPath = await confinedRuntimePath(root, options.input, "--input", { mustExist: true });
  const outputPath = options.output
    ? await confinedRuntimePath(root, options.output, "--output")
    : null;
  if (outputPath === inputPath) throw new TypeError("--output must differ from --input");
  const [inputSource, researchTickers] = await Promise.all([
    readFile(inputPath, "utf8"),
    loadResearchTickers(path.resolve(root, "data", "app-data.js"))
  ]);
  let snapshot;
  try {
    snapshot = JSON.parse(inputSource);
  } catch {
    throw new TypeError("Input is not valid JSON");
  }
  const report = buildResearchIntakeProposal({
    snapshot,
    researchTickers,
    cutoffDate: options.after
  });
  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  if (outputPath) {
    await mkdir(path.dirname(outputPath), { recursive: true, mode: 0o700 });
    await writeFile(outputPath, serialized, { encoding: "utf8", flag: "wx", mode: 0o600 });
  }
  stdout.write(serialized);
  return { outcome: outputPath ? "report-written" : "preview", outputPath, report };
}

async function main() {
  try {
    await runResearchIntakeCli(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`Research intake failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) await main();
