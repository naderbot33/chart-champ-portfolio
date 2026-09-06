/* Validate a refreshed portfolio snapshot before deploy or Discord delivery. */
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function argumentsFrom(argv) {
  const values = {
    snapshot: join(ROOT, "data", "live-prices.json"),
    session: "auto",
    now: null,
    log: join(ROOT, "runtime", "portfolio-validation.json"),
    strict: false,
    maxAgeMinutes: 45
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--strict") values.strict = true;
    else if (argument === "--snapshot") values.snapshot = resolve(argv[++index]);
    else if (argument === "--session") values.session = argv[++index];
    else if (argument === "--now") values.now = argv[++index];
    else if (argument === "--log") values.log = resolve(argv[++index]);
    else if (argument === "--max-age-minutes") values.maxAgeMinutes = Number(argv[++index]);
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (!['auto', 'open', 'close'].includes(values.session)) {
    throw new Error("--session must be auto, open, or close");
  }
  if (!Number.isFinite(values.maxAgeMinutes) || values.maxAgeMinutes <= 0) {
    throw new Error("--max-age-minutes must be positive");
  }
  return values;
}

function loadAppData() {
  const path = join(ROOT, "data", "app-data.js");
  const window = {};
  new Function("window", readFileSync(path, "utf8"))(window);
  if (!window.APP_DATA?.portfolio) throw new Error("window.APP_DATA.portfolio is missing");
  return window.APP_DATA;
}

function zonedParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });
  return Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );
}

function dayKey(parts) {
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function inferredSession(now) {
  const pacific = zonedParts(now, "America/Los_Angeles");
  return Number(pacific.hour) < 10 ? "open" : "close";
}

function hasUsMarketWeekday(now) {
  const weekday = zonedParts(now, "America/New_York").weekday;
  return !["Sat", "Sun"].includes(weekday);
}

function validDateKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value)) && Number.isFinite(Date.parse(`${value}T00:00:00Z`));
}

function validateLedger(portfolio, errors) {
  const allHoldings = Array.isArray(portfolio.holdings) ? portfolio.holdings : [];
  const seen = new Set();
  const cashHoldings = [];
  let ledgerCash = Number(portfolio.startingValue);
  let realizedTotal = 0;

  for (const holding of allHoldings) {
    const ticker = String(holding?.ticker || "").toUpperCase();
    if (!ticker) {
      errors.push("A portfolio holding is missing its ticker");
      continue;
    }
    if (seen.has(ticker)) errors.push(`${ticker} is configured more than once`);
    seen.add(ticker);

    if (holding.assetClass === "Cash") {
      cashHoldings.push(holding);
      continue;
    }

    const configuredShares = Number(holding.shares);
    const configuredBasis = Number(holding.costBasis);
    if (!Number.isFinite(configuredShares) || configuredShares < 0) {
      errors.push(`${ticker} shares must be a non-negative finite number`);
    }
    if (holding.closed === true && configuredShares > 0.000001) {
      errors.push(`${ticker} is marked closed but still has configured shares`);
    }
    if (holding.closed !== true && configuredShares <= 0) {
      errors.push(`${ticker} has no shares but is not marked closed`);
    }
    if (!Number.isFinite(configuredBasis) || configuredBasis < 0) {
      errors.push(`${ticker} cost basis must be a non-negative finite number`);
    }

    const transactions = (Array.isArray(holding.transactions) ? holding.transactions : [])
      .slice()
      .sort((a, b) => String(a?.date || "").localeCompare(String(b?.date || "")));
    if (!transactions.length) {
      errors.push(`${ticker} has no executed transaction ledger`);
      continue;
    }

    let shares = 0;
    let basis = 0;
    let realized = 0;
    for (const transaction of transactions) {
      const txShares = Number(transaction?.shares);
      const price = Number(transaction?.price);
      const amount = Number.isFinite(Number(transaction?.amount))
        ? Number(transaction.amount)
        : txShares * price;
      if (
        !validDateKey(transaction?.date) ||
        !["buy", "sell"].includes(transaction?.type) ||
        !Number.isFinite(txShares) ||
        txShares <= 0 ||
        !Number.isFinite(price) ||
        price <= 0 ||
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        errors.push(`${ticker} has an invalid executed transaction`);
        continue;
      }

      if (transaction.type === "buy") {
        shares += txShares;
        basis += amount;
        ledgerCash -= amount;
      } else {
        if (txShares > shares + 0.000001) {
          errors.push(`${ticker} sell transaction exceeds owned shares`);
          continue;
        }
        const soldBasis = shares > 0 ? (basis / shares) * txShares : 0;
        shares -= txShares;
        basis -= soldBasis;
        realized += amount - soldBasis;
        ledgerCash += amount;
      }
    }

    if (Math.abs(shares - configuredShares) > 0.000001) {
      errors.push(`${ticker} configured shares do not reconcile with executed transactions`);
    }
    if (Math.abs(basis - configuredBasis) > 0.02) {
      errors.push(`${ticker} configured cost basis does not reconcile with executed transactions`);
    }
    if (Math.abs(realized - Number(holding.realizedPnl || 0)) > 0.02) {
      errors.push(`${ticker} realized P/L does not reconcile with executed transactions`);
    }
    realizedTotal += realized;
  }

  if (cashHoldings.length !== 1) {
    errors.push("Portfolio must contain exactly one cash holding");
  } else {
    const cash = cashHoldings[0];
    const cashValues = [Number(cash.shares), Number(cash.costBasis), Number(cash.marketValue)];
    if (!cashValues.every(Number.isFinite) || cashValues.some((value) => Math.abs(value - ledgerCash) > 0.02)) {
      errors.push("Cash fields do not reconcile with executed transactions");
    }
  }
  if (Math.abs(realizedTotal - Number(portfolio.realizedPnl || 0)) > 0.02) {
    errors.push("Portfolio realized P/L does not reconcile with executed transactions");
  }

  for (const order of Array.isArray(portfolio.pendingOrders) ? portfolio.pendingOrders : []) {
    if (
      order?.status !== "Pending" ||
      !validDateKey(order?.date) ||
      !order?.ticker ||
      !["Buy", "Sell"].includes(order?.side) ||
      !Number.isFinite(Number(order?.amount)) ||
      Number(order.amount) <= 0 ||
      !Number.isFinite(Number(order?.limitPrice)) ||
      Number(order.limitPrice) <= 0
    ) {
      errors.push("A pending order is invalid or incorrectly marked as executed");
    }
  }
}

function githubOutput(values) {
  if (!process.env.GITHUB_OUTPUT) return;
  const content = Object.entries(values)
    .map(([key, value]) => `${key}=${String(value).replace(/[\r\n]+/g, " ")}`)
    .join("\n");
  appendFileSync(process.env.GITHUB_OUTPUT, `${content}\n`);
}

function writeLog(path, result) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(result, null, 2)}\n`, "utf8");
}

function finish(options, partial) {
  const result = {
    checkedAt: options.now.toISOString(),
    ...partial
  };
  const outputs = {
    should_proceed: result.shouldProceed,
    snapshot_valid: result.snapshotValid,
    status: result.status,
    reason: result.reason,
    session: result.session,
    source_timestamp: result.sourceTimestamp || "",
    benchmark_status: result.benchmarkStatus || "unavailable"
  };
  writeLog(options.log, result);
  githubOutput(outputs);
  console.log(JSON.stringify(result, null, 2));
  if (options.strict && result.status === "invalid") process.exitCode = 1;
}

function main() {
  const options = argumentsFrom(process.argv.slice(2));
  const parsedNow = options.now ? new Date(options.now) : new Date();
  if (!Number.isFinite(parsedNow.getTime())) throw new Error("--now must be an ISO-8601 timestamp");
  options.now = parsedNow;
  const session = options.session === "auto" ? inferredSession(parsedNow) : options.session;

  let appData;
  let snapshot;
  try {
    appData = loadAppData();
    snapshot = JSON.parse(readFileSync(options.snapshot, "utf8"));
  } catch (error) {
    finish(options, {
      status: "invalid",
      shouldProceed: false,
      snapshotValid: false,
      session,
      sourceTimestamp: null,
      reason: `Snapshot could not be loaded: ${error.message}`,
      warnings: []
    });
    return;
  }

  const portfolio = appData.portfolio;
  const holdings = (portfolio.holdings ?? []).filter(
    (holding) =>
      holding?.ticker &&
      holding.assetClass !== "Cash" &&
      holding.closed !== true &&
      Number(holding.shares) > 0
  );
  const errors = [];
  const warnings = [];

  const ledgerErrors = [];
  validateLedger(portfolio, ledgerErrors);
  errors.push(...ledgerErrors.map((error) => `community portfolio: ${error}`));
  if (!validDateKey(portfolio?.chartStartDate)) {
    errors.push("community portfolio: chartStartDate must be a YYYY-MM-DD date");
  }

  if (!holdings.length) errors.push("No non-cash holdings are configured");
  if (snapshot.chartStartDate && snapshot.chartStartDate !== portfolio.chartStartDate) {
    errors.push("Snapshot chartStartDate does not match app-data.js");
  }
  if (!snapshot?.prices || typeof snapshot.prices !== "object") {
    errors.push("Snapshot prices object is missing");
  }

  const sourceTimes = [];
  const snapshotFallbackTime = Date.parse(snapshot.sourceTimestamp || snapshot.generatedAt);
  for (const holding of holdings) {
    const ticker = String(holding.ticker).toUpperCase();
    const quote = snapshot?.prices?.[ticker];
    if (!quote) {
      errors.push(`${ticker} quote is missing`);
      continue;
    }
    if (quote.stale === true) errors.push(`${ticker} quote is marked stale`);
    if (!Number.isFinite(Number(quote.last)) || !Number.isFinite(Number(quote.prevClose))) {
      errors.push(`${ticker} quote prices are invalid`);
    }
    const directTimestamp = Date.parse(quote.asOf);
    const timestamp = Number.isFinite(directTimestamp) ? directTimestamp : snapshotFallbackTime;
    if (!Number.isFinite(timestamp)) errors.push(`${ticker} quote timestamp is invalid`);
    else {
      if (!Number.isFinite(directTimestamp)) {
        warnings.push(`${ticker} uses the snapshot-level source timestamp`);
      }
      sourceTimes.push({ ticker, timestamp });
    }
    if (!Array.isArray(quote.history) || quote.history.length < 2) {
      errors.push(`${ticker} quote history has fewer than two points`);
    }
  }

  if (errors.length) {
    finish(options, {
      status: "invalid",
      shouldProceed: false,
      snapshotValid: false,
      session,
      sourceTimestamp: null,
      benchmarkStatus: "unavailable",
      reason: errors.join("; "),
      warnings
    });
    return;
  }

  const sourceTimestampMs = Math.min(...sourceTimes.map((item) => item.timestamp));
  const sourceTimestamp = new Date(sourceTimestampMs).toISOString();
  const newestTimestampMs = Math.max(...sourceTimes.map((item) => item.timestamp));
  const nowEastern = zonedParts(parsedNow, "America/New_York");
  const sourceEastern = zonedParts(new Date(sourceTimestampMs), "America/New_York");
  const sourceDay = dayKey(sourceEastern);
  const currentDay = dayKey(nowEastern);
  const ageMinutes = (parsedNow.getTime() - sourceTimestampMs) / 60000;
  const sourceMinuteOfDay = Number(sourceEastern.hour) * 60 + Number(sourceEastern.minute);

  let benchmarkStatus = "unavailable";
  const benchmarkTicker = String(portfolio.benchmarkTicker || "").toUpperCase();
  const benchmark = snapshot.benchmark;
  if (!benchmarkTicker) {
    warnings.push("No benchmarkTicker is configured; portfolio-only chart fallback will render");
  } else if (!benchmark) {
    warnings.push(`${benchmarkTicker} benchmark data is missing; portfolio-only chart fallback will render`);
  } else if (
    benchmark.stale === true ||
    String(benchmark.ticker || "").toUpperCase() !== benchmarkTicker ||
    !Number.isFinite(Number(benchmark.last)) ||
    !Array.isArray(benchmark.history) ||
    benchmark.history.length < 2 ||
    !Number.isFinite(Date.parse(benchmark.asOf))
  ) {
    warnings.push(`${benchmarkTicker} benchmark data is unusable; portfolio-only chart fallback will render`);
  } else {
    benchmarkStatus = "available";
  }

  let skipReason = null;
  if (!hasUsMarketWeekday(parsedNow)) {
    skipReason = "U.S. market weekday check failed";
  } else if (sourceDay !== currentDay) {
    skipReason = `Latest holding quotes are from ${sourceDay}, not the current U.S. market date ${currentDay}`;
  } else if (ageMinutes < -5) {
    skipReason = "Quote source timestamp is unexpectedly in the future";
  } else if (ageMinutes > options.maxAgeMinutes) {
    skipReason = `Oldest holding quote is ${Math.round(ageMinutes)} minutes old (limit ${options.maxAgeMinutes})`;
  } else if (session === "open" && sourceMinuteOfDay < 9 * 60 + 29) {
    skipReason = "Opening snapshot does not contain an in-session quote at or after 9:29 AM Eastern";
  } else if (session === "close" && sourceMinuteOfDay < 15 * 60 + 55) {
    skipReason = "Closing snapshot does not contain a quote at or after 3:55 PM Eastern";
  }

  finish(options, {
    status: skipReason ? "skipped" : "ready",
    shouldProceed: !skipReason,
    snapshotValid: true,
    session,
    sourceTimestamp,
    newestSourceTimestamp: new Date(newestTimestampMs).toISOString(),
    ageMinutes: Number(ageMinutes.toFixed(1)),
    benchmarkStatus,
    reason: skipReason || "Snapshot is fresh and matches the expected market session",
    warnings
  });
}

try {
  main();
} catch (error) {
  console.error(error.stack || error.message);
  process.exitCode = 1;
}
