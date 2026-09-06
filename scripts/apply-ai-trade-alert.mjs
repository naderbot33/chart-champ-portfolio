#!/usr/bin/env node
/*
 * Apply one preconfigured AI trade alert to the isolated paper-portfolio state.
 *
 * Usage:
 *   node scripts/apply-ai-trade-alert.mjs --event EVENT.json --plans PLANS.json
 *
 * The event identifies one enabled plan action and supplies only observed facts
 * (timestamp and fill price). The registry owns ticker, portfolio, quantity,
 * trigger condition, and instrument metadata, so free-form alert text can never
 * change portfolio math.
 */
import { createHash } from "node:crypto";
import {
  appendFileSync,
  chmodSync,
  closeSync,
  mkdirSync,
  openSync,
  readFileSync,
  realpathSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_STATE = join(ROOT, "data", "ai-portfolio-state.js");
const DEFAULT_LEDGER = join(ROOT, "runtime", "ai-trade-alert-receipts.jsonl");
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u;
const TICKER_PATTERN = /^[A-Z0-9][A-Z0-9./=-]{0,24}$/u;
const SIGNALS = new Set(["BUY", "TAKE_PROFIT", "SELL"]);
const TRIGGER_KINDS = new Set([
  "ENTRY",
  "TAKE_PROFIT",
  "FINAL_TARGET",
  "STOP_LOSS",
  "THESIS_INVALIDATION",
  "TIME_EXIT"
]);
const TIME_EXIT_ACTION_ID = "time-exit";
const EPSILON = 0.000001;

export function parseArguments(argv) {
  const options = {
    event: null,
    plans: null,
    state: DEFAULT_STATE,
    ledger: DEFAULT_LEDGER
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--event") options.event = resolve(argv[++index]);
    else if (argument === "--plans") options.plans = resolve(argv[++index]);
    else if (argument === "--state") options.state = resolve(argv[++index]);
    else if (argument === "--ledger") options.ledger = resolve(argv[++index]);
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (!options.event) throw new Error("--event is required");
  if (!options.plans) throw new Error("--plans is required");
  if (new Set([options.event, options.plans, options.state, options.ledger]).size !== 4) {
    throw new Error("Event, plan, state, and receipt paths must be different files");
  }
  return options;
}

function readJson(path, label) {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`${label} could not be read: ${error.message}`);
  }
  return parsed;
}

export function loadState(path) {
  const window = {};
  try {
    new Function("window", readFileSync(path, "utf8"))(window);
  } catch (error) {
    throw new Error(`AI portfolio state could not be read: ${error.message}`);
  }
  const state = window.AI_PORTFOLIO_STATE;
  if (state?.schemaVersion !== 1 || !state.portfolios || typeof state.portfolios !== "object") {
    throw new Error("AI portfolio state must contain schemaVersion 1 and portfolios");
  }
  return state;
}

function assertId(value, label) {
  if (!ID_PATTERN.test(String(value || ""))) throw new Error(`${label} is invalid`);
}

function positiveNumber(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive JSON number`);
  }
  return value;
}

function positiveInteger(value, label) {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${label} must be a positive JSON integer`);
  }
  return value;
}

function canonicalTimestamp(value, label) {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString() !== value) {
    throw new Error(`${label} must be an exact ISO-8601 UTC timestamp`);
  }
  return value;
}

function validateCondition(condition, label) {
  const operator = condition?.operator;
  if (!["AT_OR_ABOVE", "AT_OR_BELOW", "BETWEEN", "TIME_EXIT"].includes(operator)) {
    throw new Error(`${label} condition operator is invalid`);
  }
  if (operator === "TIME_EXIT") {
    const keys = Object.keys(condition || {});
    const expected = ["operator", "expiresAt", "freshnessLimitMinutes"];
    if (keys.some((key) => !expected.includes(key)) || expected.some((key) => !keys.includes(key))) {
      throw new Error(`${label} TIME_EXIT condition shape is invalid`);
    }
    const freshnessLimitMinutes = positiveInteger(
      condition.freshnessLimitMinutes,
      `${label} freshnessLimitMinutes`
    );
    if (freshnessLimitMinutes > 60) {
      throw new Error(`${label} freshnessLimitMinutes cannot exceed 60`);
    }
    return {
      operator,
      expiresAt: canonicalTimestamp(condition.expiresAt, `${label} expiresAt`),
      freshnessLimitMinutes
    };
  }
  if (operator === "BETWEEN") {
    const minimum = positiveNumber(condition.minimum, `${label} condition minimum`);
    const maximum = positiveNumber(condition.maximum, `${label} condition maximum`);
    if (minimum > maximum) throw new Error(`${label} condition range is inverted`);
    return { operator, minimum, maximum };
  }
  return { operator, price: positiveNumber(condition.price, `${label} condition price`) };
}

export function validatePlanRegistry(registry) {
  if (registry?.schemaVersion !== 1 || !Array.isArray(registry.plans)) {
    throw new Error("Plan registry must contain schemaVersion 1 and a plans array");
  }
  const planIds = new Set();
  for (const plan of registry.plans) {
    assertId(plan?.id, "Plan id");
    assertId(plan?.portfolioId, `Plan ${plan?.id} portfolioId`);
    if (planIds.has(plan.id)) throw new Error(`Plan id ${plan.id} is duplicated`);
    planIds.add(plan.id);
    if (plan.enabled !== true) continue;
    if (plan.version !== undefined) positiveInteger(plan.version, `Plan ${plan.id} version`);
    const ticker = String(plan.ticker || "").toUpperCase();
    if (!TICKER_PATTERN.test(ticker)) throw new Error(`Plan ${plan.id} ticker is invalid`);
    if (!plan.instrument || typeof plan.instrument !== "object") {
      throw new Error(`Plan ${plan.id} instrument is missing`);
    }
    for (const field of ["name", "assetClass", "marketSegment"]) {
      if (!String(plan.instrument[field] || "").trim()) {
        throw new Error(`Plan ${plan.id} instrument ${field} is missing`);
      }
    }
    if (!Array.isArray(plan.actions) || !plan.actions.length) {
      throw new Error(`Plan ${plan.id} has no actions`);
    }
    const actionIds = new Set();
    for (const action of plan.actions) {
      assertId(action?.id, `Plan ${plan.id} action id`);
      if (actionIds.has(action.id)) throw new Error(`Plan ${plan.id} action ${action.id} is duplicated`);
      actionIds.add(action.id);
      if (!SIGNALS.has(action.signal)) throw new Error(`Plan ${plan.id} action ${action.id} signal is invalid`);
      if (action.signal === "SELL") {
        if (action.shares !== "ALL") throw new Error(`Plan ${plan.id} SELL action must use ALL shares`);
      } else {
        positiveNumber(action.shares, `Plan ${plan.id} action ${action.id} shares`);
      }
      const condition = validateCondition(action.condition, `Plan ${plan.id} action ${action.id}`);
      if (condition.operator === "TIME_EXIT") {
        if (action.id !== TIME_EXIT_ACTION_ID || action.signal !== "SELL" || action.shares !== "ALL") {
          throw new Error(`Plan ${plan.id} TIME_EXIT action must SELL ALL with the reserved action id`);
        }
        if (!Number.isInteger(plan.version)) {
          throw new Error(`Plan ${plan.id} TIME_EXIT action requires a plan version`);
        }
      }
    }
  }
  return registry;
}

export function validateEvent(event) {
  if (event?.schemaVersion !== 1) throw new Error("Event schemaVersion must be 1");
  for (const [field, label] of [
    ["eventId", "Event id"],
    ["planId", "Event planId"],
    ["actionId", "Event actionId"],
    ["portfolioId", "Event portfolioId"]
  ]) assertId(event?.[field], label);
  if (!SIGNALS.has(event.signal)) throw new Error("Event signal must be BUY, TAKE_PROFIT, or SELL");
  if (event.planVersion !== undefined) positiveInteger(event.planVersion, "Event planVersion");
  if (event.triggerKind !== undefined && !TRIGGER_KINDS.has(event.triggerKind)) {
    throw new Error("Event triggerKind is invalid");
  }
  const ticker = String(event.ticker || "").toUpperCase();
  if (!TICKER_PATTERN.test(ticker)) throw new Error("Event ticker is invalid");
  canonicalTimestamp(event.triggeredAt, "Event triggeredAt");
  const price = positiveNumber(event.price, "Event price");
  assertId(event?.source?.provider, "Event source provider");
  assertId(event?.source?.alertId, "Event source alertId");
  if (event.triggerKind === "TIME_EXIT") {
    if (event.actionId !== TIME_EXIT_ACTION_ID
        || event.signal !== "SELL"
        || event.source.provider !== "chartchamp-monitor"
        || !Number.isInteger(event.planVersion)) {
      throw new Error("TIME_EXIT event identity is invalid");
    }
  }
  return {
    schemaVersion: 1,
    eventId: event.eventId,
    planId: event.planId,
    ...(event.planVersion !== undefined ? { planVersion: event.planVersion } : {}),
    actionId: event.actionId,
    portfolioId: event.portfolioId,
    ticker,
    signal: event.signal,
    ...(event.triggerKind !== undefined ? { triggerKind: event.triggerKind } : {}),
    triggeredAt: event.triggeredAt,
    price,
    source: {
      provider: event.source.provider,
      alertId: event.source.alertId
    }
  };
}

function priceConditionMatches(condition, price) {
  if (condition.operator === "AT_OR_ABOVE") return price + EPSILON >= condition.price;
  if (condition.operator === "AT_OR_BELOW") return price - EPSILON <= condition.price;
  return price + EPSILON >= condition.minimum && price - EPSILON <= condition.maximum;
}

function validateActionTrigger(plan, action, condition, event, now) {
  if (plan.version !== undefined || event.planVersion !== undefined) {
    if (!Number.isInteger(plan.version) || event.planVersion !== plan.version) {
      throw new Error("Event plan version does not match its plan");
    }
  }
  if (condition.operator !== "TIME_EXIT") {
    if (event.triggerKind === "TIME_EXIT") {
      throw new Error("TIME_EXIT event cannot use a price-triggered plan action");
    }
    if (!priceConditionMatches(condition, event.price)) {
      throw new Error("Event price does not satisfy its plan condition");
    }
    return;
  }

  if (action.id !== TIME_EXIT_ACTION_ID
      || event.triggerKind !== "TIME_EXIT"
      || event.signal !== "SELL"
      || action.shares !== "ALL") {
    throw new Error("Event does not match its TIME_EXIT plan action");
  }
  const current = now instanceof Date ? now : new Date(now);
  if (!Number.isFinite(current.getTime())) throw new Error("Current time is invalid");
  const triggeredAt = Date.parse(event.triggeredAt);
  const expiresAt = Date.parse(condition.expiresAt);
  if (triggeredAt < expiresAt || current.getTime() < expiresAt) {
    throw new Error("TIME_EXIT cannot apply before plan expiry");
  }
  const ageMinutes = (current.getTime() - triggeredAt) / 60000;
  if (ageMinutes < -2 || ageMinutes > condition.freshnessLimitMinutes) {
    throw new Error("TIME_EXIT event is outside the freshness window");
  }
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function dateInPacific(isoTimestamp) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    })
      .formatToParts(new Date(isoTimestamp))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function fingerprint(event) {
  return createHash("sha256").update(JSON.stringify(event)).digest("hex");
}

function sourceHash(event) {
  return createHash("sha256")
    .update(`${event.source.provider}:${event.source.alertId}`)
    .digest("hex");
}

function serializeState(state) {
  return [
    "/* Generated by scripts/apply-ai-trade-alert.mjs. */",
    `window.AI_PORTFOLIO_STATE = ${JSON.stringify(state, null, 2)};`,
    ""
  ].join("\n");
}

function atomicWrite(path, content, mode) {
  const temporary = `${path}.${process.pid}.tmp`;
  try {
    writeFileSync(temporary, content, { encoding: "utf8", flag: "wx", mode });
    renameSync(temporary, path);
    chmodSync(path, mode);
  } catch (error) {
    try { unlinkSync(temporary); } catch {}
    throw error;
  }
}

function acquireLock(statePath) {
  const path = `${statePath}.lock`;
  let descriptor;
  try {
    descriptor = openSync(path, "wx", 0o600);
  } catch (error) {
    if (error?.code === "EEXIST") throw new Error("AI portfolio state is locked by another updater");
    throw error;
  }
  return () => {
    try { closeSync(descriptor); } finally { unlinkSync(path); }
  };
}

function portfolioEntry(state, portfolioId) {
  return Object.entries(state.portfolios).find(([, portfolio]) => portfolio?.id === portfolioId);
}

function verifyStateShape(portfolio) {
  if (typeof portfolio?.startingValue !== "number" || !Number.isFinite(portfolio.startingValue) ||
      !Array.isArray(portfolio?.holdings)) {
    throw new Error("Target portfolio is structurally invalid");
  }
  const cash = portfolio.holdings.filter((holding) => holding?.assetClass === "Cash");
  if (cash.length !== 1) throw new Error("Target portfolio must contain exactly one cash holding");
  for (const field of ["shares", "costBasis", "marketValue"]) {
    if (!Number.isFinite(Number(cash[0][field]))) throw new Error(`Target cash ${field} is invalid`);
  }
  let expectedCash = portfolio.startingValue;
  let expectedPortfolioRealized = 0;
  for (const holding of portfolio.holdings.filter((candidate) => candidate.assetClass !== "Cash")) {
    const ticker = String(holding.ticker || "").toUpperCase();
    const transactions = Array.isArray(holding.transactions) ? holding.transactions : [];
    if (!transactions.length) throw new Error(`${ticker || "Holding"} has no transaction ledger`);
    let shares = 0;
    let basis = 0;
    let realized = 0;
    for (const transaction of transactions) {
      const transactionShares = Number(transaction.shares);
      const price = Number(transaction.price);
      const amount = Number(transaction.amount ?? transactionShares * price);
      if (!Number.isFinite(transactionShares) || transactionShares <= 0 ||
          !Number.isFinite(price) || price <= 0 || !Number.isFinite(amount) || amount <= 0 ||
          !["buy", "sell"].includes(transaction.type)) {
        throw new Error(`${ticker} has an invalid transaction`);
      }
      if (transaction.type === "buy") {
        shares += transactionShares;
        basis += amount;
        expectedCash -= amount;
      } else {
        if (transactionShares > shares + EPSILON) throw new Error(`${ticker} transaction oversells shares`);
        const soldBasis = (basis / shares) * transactionShares;
        shares -= transactionShares;
        basis -= soldBasis;
        realized += amount - soldBasis;
        expectedCash += amount;
      }
    }
    if (Math.abs(shares - Number(holding.shares)) > EPSILON) {
      throw new Error(`${ticker} shares do not reconcile with transactions`);
    }
    if (Math.abs(basis - Number(holding.costBasis)) > 0.02) {
      throw new Error(`${ticker} basis does not reconcile with transactions`);
    }
    if (Math.abs(realized - Number(holding.realizedPnl || 0)) > 0.02) {
      throw new Error(`${ticker} realized P/L does not reconcile with transactions`);
    }
    expectedPortfolioRealized += realized;
  }
  if ([cash[0].shares, cash[0].costBasis, cash[0].marketValue]
    .some((value) => Math.abs(Number(value) - expectedCash) > 0.02)) {
    throw new Error("Target cash does not reconcile with transactions");
  }
  if (Math.abs(Number(portfolio.realizedPnl || 0) - expectedPortfolioRealized) > 0.02) {
    throw new Error("Target portfolio realized P/L does not reconcile with transactions");
  }
  return cash[0];
}

function createHolding(plan, event) {
  return {
    ticker: event.ticker,
    name: plan.instrument.name,
    assetClass: plan.instrument.assetClass,
    marketSegment: plan.instrument.marketSegment,
    researchKey: plan.instrument.researchKey ?? null,
    entryDate: dateInPacific(event.triggeredAt),
    entryPrice: event.price,
    latestPrice: event.price,
    shares: 0,
    costBasis: 0,
    marketValue: 0,
    dayChangePct: 0,
    realizedPnl: 0,
    transactions: []
  };
}

function updateCash(cash, nextValue, event) {
  const value = roundMoney(nextValue);
  if (value < -EPSILON) throw new Error("Trade would make portfolio cash negative");
  cash.shares = value;
  cash.costBasis = value;
  cash.marketValue = value;
  cash.note = `Cash after the ${event.signal} fill for ${event.ticker}.`;
}

function applyFinancialEvent(portfolio, plan, action, event) {
  const cash = verifyStateShape(portfolio);
  let holding = portfolio.holdings.find(
    (candidate) => String(candidate?.ticker || "").toUpperCase() === event.ticker
  );
  const currentShares = Number(holding?.shares || 0);
  const date = dateInPacific(event.triggeredAt);
  if ((holding?.transactions || []).some((transaction) => String(transaction.date || "") > date)) {
    throw new Error("Event predates an existing transaction for this holding");
  }

  if (event.signal === "BUY") {
    if (currentShares > EPSILON) throw new Error(`${event.ticker} already has an open position`);
    const shares = positiveNumber(action.shares, "BUY shares");
    const amount = roundMoney(shares * event.price);
    if (amount > Number(cash.marketValue) + EPSILON) throw new Error("BUY exceeds available cash");
    if (!holding) {
      holding = createHolding(plan, event);
      portfolio.holdings.push(holding);
    }
    const priorRealized = Number(holding.realizedPnl || 0);
    holding.entryDate = date;
    holding.entryPrice = event.price;
    holding.latestPrice = event.price;
    holding.shares = shares;
    holding.costBasis = amount;
    holding.marketValue = amount;
    holding.dayChangePct = 0;
    holding.realizedPnl = priorRealized;
    holding.transactions = Array.isArray(holding.transactions) ? holding.transactions : [];
    holding.transactions.push({ date, type: "buy", shares, price: event.price, amount });
    delete holding.closed;
    holding.note = `${event.ticker} BUY alert filled under plan ${plan.id}.`;
    updateCash(cash, Number(cash.marketValue) - amount, event);
    return { shares, amount, realized: 0, holding };
  }

  if (!holding || currentShares <= EPSILON || holding.closed === true) {
    throw new Error(`${event.signal} requires an open ${event.ticker} position`);
  }
  const shares = event.signal === "SELL" ? currentShares : positiveNumber(action.shares, "TAKE_PROFIT shares");
  if (shares > currentShares + EPSILON) throw new Error(`${event.signal} exceeds owned shares`);
  const proceeds = roundMoney(shares * event.price);
  const currentBasis = Number(holding.costBasis);
  if (!Number.isFinite(currentBasis) || currentBasis < 0) throw new Error("Holding cost basis is invalid");
  const soldBasis = roundMoney((currentBasis / currentShares) * shares);
  const realized = roundMoney(proceeds - soldBasis);
  const remainingShares = Math.abs(currentShares - shares) < EPSILON ? 0 : currentShares - shares;
  const remainingBasis = remainingShares === 0 ? 0 : roundMoney(currentBasis - soldBasis);

  holding.transactions = Array.isArray(holding.transactions) ? holding.transactions : [];
  holding.transactions.push({ date, type: "sell", shares, price: event.price, amount: proceeds });
  holding.latestPrice = event.price;
  holding.shares = remainingShares;
  holding.costBasis = remainingBasis;
  holding.marketValue = roundMoney(remainingShares * event.price);
  holding.realizedPnl = roundMoney(Number(holding.realizedPnl || 0) + realized);
  holding.closed = remainingShares === 0;
  holding.note = remainingShares === 0
    ? `${event.ticker} position closed by the ${event.signal} alert under plan ${plan.id}.`
    : `${event.ticker} position reduced by the ${event.signal} alert under plan ${plan.id}.`;
  updateCash(cash, Number(cash.marketValue) + proceeds, event);
  return { shares, amount: proceeds, realized, holding };
}

function decisionFor(plan, action, event, result) {
  const actionLabel = event.signal === "BUY"
    ? "Bought"
    : event.signal === "TAKE_PROFIT" ? "Took profit" : "Sold";
  const realizedText = event.signal === "BUY" ? "" : ` Realized P/L on this fill: ${money(result.realized)}.`;
  return {
    date: dateInPacific(event.triggeredAt),
    ticker: event.ticker,
    action: actionLabel,
    status: "Filled",
    summary:
      `${event.ticker} ${event.signal.replace("_", " ")} alert filled ${result.shares} shares at ${money(event.price)}.${realizedText}`,
    details: [
      `Plan: ${plan.id}`,
      `Signal: ${event.signal}; action: ${action.id}`,
      `Fill: ${result.shares} shares at ${money(event.price)} (${money(result.amount)})`,
      `Triggered: ${event.triggeredAt}`
    ],
    ...(plan.levels && typeof plan.levels === "object" ? { levels: plan.levels } : {})
  };
}

export function applyEventToState(state, registry, rawEvent, { now = new Date() } = {}) {
  const event = validateEvent(rawEvent);
  validatePlanRegistry(registry);
  const plan = registry.plans.find((candidate) => candidate.id === event.planId);
  if (!plan || plan.enabled !== true) throw new Error(`Active plan ${event.planId} was not found`);
  if (plan.portfolioId !== event.portfolioId) throw new Error("Event portfolio does not match its plan");
  if (String(plan.ticker).toUpperCase() !== event.ticker) throw new Error("Event ticker does not match its plan");
  const action = plan.actions.find((candidate) => candidate.id === event.actionId);
  if (!action) throw new Error(`Plan action ${event.actionId} was not found`);
  if (action.signal !== event.signal) throw new Error("Event signal does not match its plan action");
  const condition = validateCondition(action.condition, `Plan ${plan.id} action ${action.id}`);

  const normalizedFingerprint = fingerprint(event);
  const existing = Array.isArray(state.appliedEvents) ? state.appliedEvents : [];
  const duplicate = existing.find(
    (record) => record.eventId === event.eventId || record.sourceHash === sourceHash(event)
  );
  if (duplicate) {
    if (duplicate.fingerprint !== normalizedFingerprint) {
      throw new Error("Idempotency key was reused with different event content");
    }
    return { outcome: "duplicate", event, state, stateChanged: false };
  }
  validateActionTrigger(plan, action, condition, event, now);
  if (existing.some((record) => record.planId === plan.id && record.actionId === action.id)) {
    throw new Error(`Plan action ${action.id} was already applied`);
  }
  const priorPlanEvents = existing.filter((record) => record.planId === plan.id);
  if (priorPlanEvents.some((record) => record.signal === "SELL")) {
    throw new Error(`Plan ${plan.id} was already closed`);
  }
  const newestPrior = priorPlanEvents
    .map((record) => Date.parse(record.triggeredAt))
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0];
  if (Number.isFinite(newestPrior) && Date.parse(event.triggeredAt) < newestPrior) {
    throw new Error("Event is older than an already applied event for this plan");
  }

  const match = portfolioEntry(state, event.portfolioId);
  if (!match) throw new Error(`Portfolio ${event.portfolioId} was not found`);
  const [, portfolio] = match;
  const result = applyFinancialEvent(portfolio, plan, action, event);
  portfolio.realizedPnl = roundMoney(
    portfolio.holdings
      .filter((holding) => holding.assetClass !== "Cash")
      .reduce((total, holding) => total + Number(holding.realizedPnl || 0), 0)
  );
  portfolio.decisions = Array.isArray(portfolio.decisions) ? portfolio.decisions : [];
  portfolio.decisions.unshift(decisionFor(plan, action, event, result));
  portfolio.displayNote =
    `${portfolio.label || event.portfolioId} recorded a ${event.signal.replace("_", " ")} alert ` +
    `for ${event.ticker} at ${money(event.price)} on ${dateInPacific(event.triggeredAt)}.`;
  verifyStateShape(portfolio);
  state.appliedEvents = existing.concat({
    eventId: event.eventId,
    sourceHash: sourceHash(event),
    fingerprint: normalizedFingerprint,
    planId: plan.id,
    actionId: action.id,
    portfolioId: event.portfolioId,
    ticker: event.ticker,
    signal: event.signal,
    ...(event.planVersion !== undefined ? { planVersion: event.planVersion } : {}),
    ...(event.triggerKind !== undefined ? { triggerKind: event.triggerKind } : {}),
    triggeredAt: event.triggeredAt
  });
  state.updatedAt = event.triggeredAt;
  return { outcome: "applied", event, state, stateChanged: true, result };
}

export function applyTradeAlert(options, { clock = () => new Date() } = {}) {
  mkdirSync(dirname(options.state), { recursive: true });
  const releaseLock = acquireLock(options.state);
  try {
    const originalSource = readFileSync(options.state, "utf8");
    const originalMode = statSync(options.state).mode & 0o777;
    const state = loadState(options.state);
    const registry = readJson(options.plans, "Plan registry");
    const event = readJson(options.event, "Trade alert event");
    const now = clock();
    if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
      throw new Error("Clock must return a valid Date");
    }
    const applied = applyEventToState(state, registry, event, { now });
    if (!applied.stateChanged) {
      return {
        outcome: "duplicate",
        eventId: applied.event.eventId,
        planId: applied.event.planId,
        actionId: applied.event.actionId
      };
    }

    const nextSource = serializeState(applied.state);
    const stateHash = createHash("sha256").update(nextSource).digest("hex");
    atomicWrite(options.state, nextSource, originalMode);
    const receipt = {
      schemaVersion: 1,
      recordedAt: now.toISOString(),
      outcome: "applied",
      eventId: applied.event.eventId,
      planId: applied.event.planId,
      ...(applied.event.planVersion !== undefined
        ? { planVersion: applied.event.planVersion }
        : {}),
      actionId: applied.event.actionId,
      portfolioId: applied.event.portfolioId,
      ticker: applied.event.ticker,
      signal: applied.event.signal,
      ...(applied.event.triggerKind !== undefined
        ? { triggerKind: applied.event.triggerKind }
        : {}),
      triggeredAt: applied.event.triggeredAt,
      price: applied.event.price,
      sourceProvider: applied.event.source.provider,
      sourceAlertId: applied.event.source.alertId,
      stateHash
    };
    try {
      mkdirSync(dirname(options.ledger), { recursive: true, mode: 0o700 });
      appendFileSync(options.ledger, `${JSON.stringify(receipt)}\n`, { encoding: "utf8", mode: 0o600 });
      chmodSync(options.ledger, 0o600);
    } catch (error) {
      atomicWrite(options.state, originalSource, originalMode);
      throw new Error(`Receipt ledger write failed; state was rolled back: ${error.message}`);
    }
    return receipt;
  } finally {
    releaseLock();
  }
}

async function main() {
  const result = applyTradeAlert(parseArguments(process.argv.slice(2)));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (process.argv[1]
    && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1])) {
  main().catch((error) => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  });
}
