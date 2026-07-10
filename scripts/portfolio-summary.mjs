/* Build, dry-run, or deliver the #public-portfolio Discord update. */
import { createHash } from "node:crypto";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_CHANNEL_ID = "1483112393109409903";
const DEFAULT_WEBHOOK_NAME = "ChartChamp Market Bot";

function parseArguments(argv) {
  const options = {
    dryRun: false,
    channelId: DEFAULT_CHANNEL_ID,
    session: "auto",
    snapshot: join(ROOT, "data", "live-prices.json"),
    state: join(ROOT, "runtime", "portfolio-delivery-state.json"),
    log: join(ROOT, "runtime", "portfolio-delivery.jsonl"),
    draft: join(ROOT, "runtime", "portfolio-draft.json"),
    now: null,
    maxAgeMinutes: 60,
    messageLimit: 1900
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--dry-run") options.dryRun = true;
    else if (argument === "--channel-id") options.channelId = argv[++index];
    else if (argument === "--session") options.session = argv[++index];
    else if (argument === "--snapshot") options.snapshot = resolve(argv[++index]);
    else if (argument === "--state") options.state = resolve(argv[++index]);
    else if (argument === "--log") options.log = resolve(argv[++index]);
    else if (argument === "--draft") options.draft = resolve(argv[++index]);
    else if (argument === "--now") options.now = argv[++index];
    else if (argument === "--max-age-minutes") options.maxAgeMinutes = Number(argv[++index]);
    else if (argument === "--message-limit") options.messageLimit = Number(argv[++index]);
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (!["auto", "open", "close"].includes(options.session)) {
    throw new Error("--session must be auto, open, or close");
  }
  if (!/^\d+$/.test(String(options.channelId))) throw new Error("--channel-id is invalid");
  if (!Number.isFinite(options.maxAgeMinutes) || options.maxAgeMinutes <= 0) {
    throw new Error("--max-age-minutes must be positive");
  }
  if (!Number.isInteger(options.messageLimit) || options.messageLimit < 1 || options.messageLimit > 2000) {
    throw new Error("--message-limit must be an integer from 1 to 2000");
  }
  return options;
}

function loadAppData() {
  const window = {};
  new Function("window", readFileSync(join(ROOT, "data", "app-data.js"), "utf8"))(window);
  if (!window.APP_DATA?.portfolio) throw new Error("window.APP_DATA.portfolio is missing");
  return window.APP_DATA;
}

function zonedParts(date, timeZone) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    })
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );
}

function dayKey(parts) {
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function inferSession(now) {
  return Number(zonedParts(now, "America/Los_Angeles").hour) < 10 ? "open" : "close";
}

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);

const signedMoney = (value) => `${value >= 0 ? "+" : "−"}${money(Math.abs(value))}`;
const signedPercent = (value) => `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(2)}%`;

function formatTimestamp(timestamp) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(new Date(timestamp));
}

function calculatePortfolio(portfolio, snapshot) {
  const positions = [];
  let currentValue = 0;
  let previousValue = 0;
  const sourceTimes = [];
  const snapshotFallbackTime = Date.parse(snapshot.sourceTimestamp || snapshot.generatedAt);

  for (const holding of portfolio.holdings ?? []) {
    const shares = Number(holding.shares ?? 0);
    const costBasis = Number(holding.costBasis ?? 0);
    if (holding.assetClass === "Cash") {
      const value = Number(holding.marketValue ?? costBasis ?? shares);
      currentValue += value;
      previousValue += value;
      continue;
    }

    const ticker = String(holding.ticker).toUpperCase();
    const quote = snapshot.prices?.[ticker];
    if (!quote || quote.stale === true) throw new Error(`${ticker} is missing a fresh quote`);
    const last = Number(quote.last);
    const prevClose = Number(quote.prevClose);
    const directAsOf = Date.parse(quote.asOf);
    const asOf = Number.isFinite(directAsOf) ? directAsOf : snapshotFallbackTime;
    if (![shares, costBasis, last, prevClose, asOf].every(Number.isFinite)) {
      throw new Error(`${ticker} has invalid portfolio or quote values`);
    }
    const marketValue = shares * last;
    currentValue += marketValue;
    previousValue += shares * prevClose;
    sourceTimes.push(asOf);
    positions.push({ ticker, contribution: marketValue - costBasis });
  }

  if (!sourceTimes.length) throw new Error("No quoted portfolio positions were found");
  const sourceTimestamp = new Date(Math.min(...sourceTimes)).toISOString();
  const startingValue = Number(portfolio.startingValue);
  const totalReturn = currentValue - startingValue;
  const dayReturn = currentValue - previousValue;
  const totalReturnPct = startingValue ? (totalReturn / startingValue) * 100 : 0;
  const dayReturnPct = previousValue ? (dayReturn / previousValue) * 100 : 0;
  const ascending = [...positions].sort((a, b) => a.contribution - b.contribution);
  const detractor = ascending[0]?.contribution < 0 ? ascending[0] : null;
  const contributor = ascending.at(-1)?.contribution > 0 ? ascending.at(-1) : null;

  return {
    currentValue,
    totalReturn,
    totalReturnPct,
    dayReturn,
    dayReturnPct,
    contributor,
    detractor,
    sourceTimestamp
  };
}

function buildContent(metrics, session) {
  const label = session === "open" ? "Market Open" : "Market Close";
  const contributor = metrics.contributor
    ? `${metrics.contributor.ticker} (${signedMoney(metrics.contributor.contribution)})`
    : "None — no holding is above cost basis";
  const detractor = metrics.detractor
    ? `${metrics.detractor.ticker} (${signedMoney(metrics.detractor.contribution)})`
    : "None — no holding is below cost basis";

  return [
    `📊 **ChartChamp Portfolio — ${label}**`,
    `**Value:** ${money(metrics.currentValue)}`,
    `**Total return:** ${signedMoney(metrics.totalReturn)} (${signedPercent(metrics.totalReturnPct)})`,
    `**Today:** ${signedMoney(metrics.dayReturn)} (${signedPercent(metrics.dayReturnPct)})`,
    `**Top contributor:** ${contributor}`,
    `**Top detractor:** ${detractor}`,
    `_Yahoo Finance quotes as of ${formatTimestamp(metrics.sourceTimestamp)}._`,
    "🔗 https://chartchamp.web.app/",
    "*Educational portfolio tracking only — not financial advice.*"
  ].join("\n");
}

function atomicJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  renameSync(temporary, path);
}

function appendLog(path, record) {
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, `${JSON.stringify(record)}\n`, "utf8");
}

function loadState(path) {
  if (!existsSync(path)) return { deliveries: [] };
  try {
    const state = JSON.parse(readFileSync(path, "utf8"));
    return { deliveries: Array.isArray(state.deliveries) ? state.deliveries : [] };
  } catch {
    return { deliveries: [] };
  }
}

function assertFreshSource(sourceTimestamp, now, maxAgeMinutes) {
  const source = new Date(sourceTimestamp);
  const sourceParts = zonedParts(source, "America/New_York");
  const nowParts = zonedParts(now, "America/New_York");
  if (["Sat", "Sun"].includes(nowParts.weekday)) throw new Error("U.S. market is closed for the weekend");
  if (dayKey(sourceParts) !== dayKey(nowParts)) {
    throw new Error(`Quote date ${dayKey(sourceParts)} is not the current U.S. market date`);
  }
  const ageMinutes = (now.getTime() - source.getTime()) / 60000;
  if (ageMinutes < -5 || ageMinutes > maxAgeMinutes) {
    throw new Error(`Quote freshness is ${Math.round(ageMinutes)} minutes (limit ${maxAgeMinutes})`);
  }
}

function webhookUrl() {
  const value = process.env.DISCORD_PORTFOLIO_WEBHOOK;
  if (!value) throw new Error("DISCORD_PORTFOLIO_WEBHOOK is not configured");
  const url = new URL(value);
  const allowed = ["discord.com", "discordapp.com", "canary.discord.com", "ptb.discord.com"];
  if (url.protocol !== "https:" || !allowed.includes(url.hostname)) {
    throw new Error("DISCORD_PORTFOLIO_WEBHOOK is not a Discord HTTPS webhook URL");
  }
  return url;
}

async function verifyWebhook(url, channelId) {
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "ChartChampPortfolio/1.0" },
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(`Discord webhook metadata check failed: HTTP ${response.status}`);
  const metadata = await response.json();
  if (String(metadata.channel_id) !== String(channelId)) {
    throw new Error(`Discord webhook is bound to channel ${metadata.channel_id}, expected ${channelId}`);
  }
  if (metadata.name !== DEFAULT_WEBHOOK_NAME) {
    throw new Error(`Discord webhook is named ${metadata.name || "(unnamed)"}, expected ${DEFAULT_WEBHOOK_NAME}`);
  }
  return metadata;
}

async function deliver(url, content) {
  const target = new URL(url);
  target.searchParams.set("wait", "true");
  const response = await fetch(target, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "ChartChampPortfolio/1.0"
    },
    body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`Discord delivery failed: HTTP ${response.status} ${detail}`);
  }
  return response.json();
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const now = options.now ? new Date(options.now) : new Date();
  if (!Number.isFinite(now.getTime())) throw new Error("--now must be an ISO-8601 timestamp");
  const session = options.session === "auto" ? inferSession(now) : options.session;
  const appData = loadAppData();
  const snapshot = JSON.parse(readFileSync(options.snapshot, "utf8"));
  const metrics = calculatePortfolio(appData.portfolio, snapshot);
  assertFreshSource(metrics.sourceTimestamp, now, options.maxAgeMinutes);
  const content = buildContent(metrics, session);
  if (content.length > options.messageLimit) {
    throw new Error(`Discord content is ${content.length} characters (limit ${options.messageLimit})`);
  }

  const contentHash = createHash("sha256").update(content).digest("hex");
  const dedupeKey = createHash("sha256")
    .update(`${options.channelId}|${metrics.sourceTimestamp}|${contentHash}`)
    .digest("hex");
  const draft = {
    channelId: options.channelId,
    generatedAt: now.toISOString(),
    sourceTimestamp: metrics.sourceTimestamp,
    content,
    dedupeKey,
    dryRun: options.dryRun
  };
  atomicJson(options.draft, draft);

  const baseLog = {
    timestamp: now.toISOString(),
    channelId: options.channelId,
    sourceTimestamp: metrics.sourceTimestamp,
    contentHash,
    dedupeKey,
    dryRun: options.dryRun
  };
  if (options.dryRun) {
    appendLog(options.log, { ...baseLog, result: "dry-run", messageId: null });
    console.log(JSON.stringify(draft, null, 2));
    return;
  }

  const state = loadState(options.state);
  const duplicate = state.deliveries.some((delivery) => delivery.dedupeKey === dedupeKey);
  if (duplicate) {
    appendLog(options.log, { ...baseLog, result: "skipped-duplicate", messageId: null });
    console.log("Duplicate portfolio update skipped.");
    return;
  }

  try {
    const url = webhookUrl();
    await verifyWebhook(url, options.channelId);
    const message = await deliver(url, content);
    const record = {
      ...baseLog,
      result: "sent",
      messageId: String(message.id),
      discordChannelId: String(message.channel_id)
    };
    state.deliveries.push({
      dedupeKey,
      sentAt: now.toISOString(),
      sourceTimestamp: metrics.sourceTimestamp,
      contentHash,
      messageId: record.messageId
    });
    state.deliveries = state.deliveries.slice(-200);
    atomicJson(options.state, state);
    appendLog(options.log, record);
    console.log(`Discord portfolio update sent as message ${record.messageId}.`);
  } catch (error) {
    appendLog(options.log, { ...baseLog, result: "failed", messageId: null, reason: error.message });
    throw error;
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
