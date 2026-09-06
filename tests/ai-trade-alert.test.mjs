import assert from "node:assert/strict";
import {
  copyFile,
  mkdtemp,
  readFile,
  stat,
  writeFile
} from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  applyTradeAlert,
  loadState,
  validatePlanRegistry
} from "../scripts/apply-ai-trade-alert.mjs";

const ROOT = new URL("../", import.meta.url);

const longTermPlan = {
  schemaVersion: 1,
  plans: [
    {
      id: "cper-long-term-2026-08",
      portfolioId: "long-term-investing-agent",
      ticker: "CPER",
      enabled: true,
      instrument: {
        name: "United States Copper Index Fund",
        assetClass: "Commodity ETF",
        marketSegment: "Commodities",
        researchKey: null
      },
      levels: { entry: "$39.11", stop: "$37.40", target1: "$42", target2: "$43" },
      actions: [
        {
          id: "target-1",
          signal: "TAKE_PROFIT",
          shares: 14,
          condition: { operator: "AT_OR_ABOVE", price: 42 }
        },
        {
          id: "stop-exit",
          signal: "SELL",
          shares: "ALL",
          condition: { operator: "AT_OR_BELOW", price: 37.4 }
        }
      ]
    }
  ]
};

function event(overrides = {}) {
  return {
    schemaVersion: 1,
    eventId: "event-cper-target-1",
    planId: "cper-long-term-2026-08",
    actionId: "target-1",
    portfolioId: "long-term-investing-agent",
    ticker: "CPER",
    signal: "TAKE_PROFIT",
    triggeredAt: "2026-08-10T16:35:00.000Z",
    price: 42,
    source: { provider: "trendspider", alertId: "alert-cper-target-1" },
    ...overrides
  };
}

function timeExitPlan(overrides = {}) {
  const registry = structuredClone(longTermPlan);
  const plan = registry.plans[0];
  plan.version = 7;
  plan.actions.push({
    id: "time-exit",
    signal: "SELL",
    shares: "ALL",
    condition: {
      operator: "TIME_EXIT",
      expiresAt: "2026-08-10T19:45:00.000Z",
      freshnessLimitMinutes: 20
    }
  });
  Object.assign(plan, overrides);
  return registry;
}

function timeExitEvent(overrides = {}) {
  return {
    schemaVersion: 1,
    eventId: "event-cper-time-exit",
    planId: "cper-long-term-2026-08",
    planVersion: 7,
    actionId: "time-exit",
    portfolioId: "long-term-investing-agent",
    ticker: "CPER",
    signal: "SELL",
    triggerKind: "TIME_EXIT",
    triggeredAt: "2026-08-10T19:45:30.000Z",
    price: 40.25,
    source: {
      provider: "chartchamp-monitor",
      alertId: "monitor-cper-time-exit-source"
    },
    ...overrides
  };
}

async function fixture({ plans = longTermPlan, alert = event() } = {}) {
  const directory = await mkdtemp(join(tmpdir(), "chartchamp-ai-alert-"));
  const state = join(directory, "ai-portfolio-state.js");
  const planPath = join(directory, "plans.json");
  const eventPath = join(directory, "event.json");
  const ledger = join(directory, "private", "receipts.jsonl");
  await copyFile(new URL("data/ai-portfolio-state.js", ROOT), state);
  await writeFile(planPath, `${JSON.stringify(plans, null, 2)}\n`, "utf8");
  await writeFile(eventPath, `${JSON.stringify(alert, null, 2)}\n`, "utf8");
  return {
    directory,
    state,
    plans: planPath,
    event: eventPath,
    ledger
  };
}

test("CPER take-profit and sell alerts update shares, cash, basis, and realized P/L", async () => {
  const files = await fixture();
  const first = applyTradeAlert(files, { clock: () => new Date("2026-08-10T16:35:05.000Z") });
  assert.equal(first.outcome, "applied");
  assert.equal(first.signal, "TAKE_PROFIT");

  let state = loadState(files.state);
  let portfolio = state.portfolios.longTermInvestingAgent;
  let cper = portfolio.holdings.find((holding) => holding.ticker === "CPER");
  let cash = portfolio.holdings.find((holding) => holding.assetClass === "Cash");
  assert.equal(cper.shares, 14);
  assert.equal(cper.costBasis, 547.54);
  assert.equal(cper.realizedPnl, 40.46);
  assert.equal(cper.closed, false);
  assert.equal(cash.marketValue, 9492.92);
  assert.equal(portfolio.realizedPnl, 40.46);
  assert.equal(portfolio.decisions[0].action, "Took profit");
  assert.match(portfolio.displayNote, /recorded a TAKE PROFIT alert for CPER/u);

  const stop = event({
    eventId: "event-cper-stop",
    actionId: "stop-exit",
    signal: "SELL",
    triggeredAt: "2026-08-11T17:00:00.000Z",
    price: 37.4,
    source: { provider: "trendspider", alertId: "alert-cper-stop" }
  });
  await writeFile(files.event, `${JSON.stringify(stop, null, 2)}\n`, "utf8");
  const second = applyTradeAlert(files, { clock: () => new Date("2026-08-11T17:00:04.000Z") });
  assert.equal(second.signal, "SELL");

  state = loadState(files.state);
  portfolio = state.portfolios.longTermInvestingAgent;
  cper = portfolio.holdings.find((holding) => holding.ticker === "CPER");
  cash = portfolio.holdings.find((holding) => holding.assetClass === "Cash");
  assert.equal(cper.shares, 0);
  assert.equal(cper.costBasis, 0);
  assert.equal(cper.closed, true);
  assert.equal(cper.realizedPnl, 16.52);
  assert.equal(cash.marketValue, 10016.52);
  assert.equal(portfolio.realizedPnl, 16.52);
  assert.equal(portfolio.decisions[0].action, "Sold");

  const receipts = (await readFile(files.ledger, "utf8")).trim().split("\n").map(JSON.parse);
  assert.deepEqual(receipts.map((receipt) => receipt.signal), ["TAKE_PROFIT", "SELL"]);
  assert.equal((await stat(files.ledger)).mode & 0o777, 0o600);
});

test("the same source event is idempotent and a changed replay is rejected", async () => {
  const files = await fixture();
  applyTradeAlert(files, { clock: () => new Date("2026-08-10T16:35:05.000Z") });
  const sourceAfterFirst = await readFile(files.state, "utf8");
  const duplicate = applyTradeAlert(files, { clock: () => new Date("2026-08-10T16:36:05.000Z") });
  assert.equal(duplicate.outcome, "duplicate");
  assert.equal(await readFile(files.state, "utf8"), sourceAfterFirst);
  assert.equal((await readFile(files.ledger, "utf8")).trim().split("\n").length, 1);

  await writeFile(files.event, `${JSON.stringify(event({ price: 42.5 }), null, 2)}\n`, "utf8");
  assert.throws(() => applyTradeAlert(files), /Idempotency key was reused/u);
  assert.equal(await readFile(files.state, "utf8"), sourceAfterFirst);
});

test("a fresh TIME_EXIT sells all remaining shares and an exact replay stays idempotent", async () => {
  const files = await fixture({ plans: timeExitPlan(), alert: timeExitEvent() });
  const applied = applyTradeAlert(files, {
    clock: () => new Date("2026-08-10T19:46:00.000Z")
  });

  assert.equal(applied.outcome, "applied");
  assert.equal(applied.planVersion, 7);
  assert.equal(applied.triggerKind, "TIME_EXIT");
  assert.equal(applied.price, 40.25);

  const state = loadState(files.state);
  const portfolio = state.portfolios.longTermInvestingAgent;
  const cper = portfolio.holdings.find((holding) => holding.ticker === "CPER");
  const cash = portfolio.holdings.find((holding) => holding.assetClass === "Cash");
  assert.equal(cper.shares, 0);
  assert.equal(cper.costBasis, 0);
  assert.equal(cper.closed, true);
  assert.equal(cper.realizedPnl, 31.92);
  assert.equal(cash.marketValue, 10031.92);
  assert.equal(portfolio.realizedPnl, 31.92);
  assert.deepEqual(
    state.appliedEvents.map(({ actionId, planVersion, triggerKind }) => ({
      actionId,
      planVersion,
      triggerKind
    })),
    [{ actionId: "time-exit", planVersion: 7, triggerKind: "TIME_EXIT" }]
  );

  const sourceAfterFirst = await readFile(files.state, "utf8");
  const duplicate = applyTradeAlert(files, {
    // Recovery can safely recognize the exact event after its initial freshness
    // window without applying a second financial mutation.
    clock: () => new Date("2026-08-11T19:46:00.000Z")
  });
  assert.equal(duplicate.outcome, "duplicate");
  assert.equal(await readFile(files.state, "utf8"), sourceAfterFirst);
  assert.equal((await readFile(files.ledger, "utf8")).trim().split("\n").length, 1);

  await writeFile(
    files.event,
    `${JSON.stringify(timeExitEvent({ price: 40.26 }), null, 2)}\n`,
    "utf8"
  );
  assert.throws(
    () => applyTradeAlert(files, {
      clock: () => new Date("2026-08-11T19:46:00.000Z")
    }),
    /Idempotency key was reused/u
  );
  assert.equal(await readFile(files.state, "utf8"), sourceAfterFirst);
});

test("TIME_EXIT fails closed on time, identity, price, and open-position drift", async () => {
  async function rejected({ plans = timeExitPlan(), alert, clock, pattern }) {
    const files = await fixture({ plans, alert });
    const original = await readFile(files.state, "utf8");
    assert.throws(() => applyTradeAlert(files, { clock }), pattern);
    assert.equal(await readFile(files.state, "utf8"), original);
    assert.equal(existsSync(files.ledger), false);
  }

  await rejected({
    alert: timeExitEvent({ triggeredAt: "2026-08-10T19:44:59.000Z" }),
    clock: () => new Date("2026-08-10T19:46:00.000Z"),
    pattern: /before plan expiry/u
  });
  await rejected({
    alert: timeExitEvent(),
    clock: () => new Date("2026-08-10T19:44:59.000Z"),
    pattern: /before plan expiry/u
  });
  await rejected({
    alert: timeExitEvent(),
    clock: () => new Date("2026-08-10T20:06:00.000Z"),
    pattern: /freshness window/u
  });
  await rejected({
    alert: timeExitEvent({ planVersion: 8 }),
    clock: () => new Date("2026-08-10T19:46:00.000Z"),
    pattern: /plan version does not match/u
  });
  await rejected({
    alert: timeExitEvent({ portfolioId: "swing-trading-agent" }),
    clock: () => new Date("2026-08-10T19:46:00.000Z"),
    pattern: /portfolio does not match/u
  });
  await rejected({
    alert: timeExitEvent({ ticker: "USO" }),
    clock: () => new Date("2026-08-10T19:46:00.000Z"),
    pattern: /ticker does not match/u
  });
  await rejected({
    alert: timeExitEvent({
      source: { provider: "tradingview", alertId: "monitor-cper-time-exit-source" }
    }),
    clock: () => new Date("2026-08-10T19:46:00.000Z"),
    pattern: /TIME_EXIT event identity/u
  });
  await rejected({
    alert: timeExitEvent({ price: 0 }),
    clock: () => new Date("2026-08-10T19:46:00.000Z"),
    pattern: /price must be a positive JSON number/u
  });

  const noPositionPlans = timeExitPlan({
    id: "uso-day-time-exit",
    portfolioId: "day-trading-agent",
    ticker: "USO",
    instrument: {
      name: "United States Oil Fund",
      assetClass: "Commodity ETF",
      marketSegment: "Commodities",
      researchKey: null
    }
  });
  await rejected({
    plans: noPositionPlans,
    alert: timeExitEvent({
      eventId: "event-uso-time-exit",
      planId: "uso-day-time-exit",
      portfolioId: "day-trading-agent",
      ticker: "USO",
      source: {
        provider: "chartchamp-monitor",
        alertId: "monitor-uso-time-exit-source"
      }
    }),
    clock: () => new Date("2026-08-10T19:46:00.000Z"),
    pattern: /requires an open USO position/u
  });

  const missingExpiry = timeExitPlan();
  missingExpiry.plans[0].actions.at(-1).condition.expiresAt = null;
  assert.throws(
    () => validatePlanRegistry(missingExpiry),
    /expiresAt must be an exact ISO-8601 UTC timestamp/u
  );
});

test("BUY requires cash and later take-profit cannot exceed owned shares", async () => {
  const plans = {
    schemaVersion: 1,
    plans: [
      {
        id: "aapl-day-setup",
        portfolioId: "day-trading-agent",
        ticker: "AAPL",
        enabled: true,
        instrument: {
          name: "Apple",
          assetClass: "Stock",
          marketSegment: "Stocks",
          researchKey: "AAPL"
        },
        levels: { entry: "$100", stop: "$95", target1: "$110" },
        actions: [
          {
            id: "entry",
            signal: "BUY",
            shares: 10,
            condition: { operator: "AT_OR_ABOVE", price: 100 }
          },
          {
            id: "target",
            signal: "TAKE_PROFIT",
            shares: 20,
            condition: { operator: "AT_OR_ABOVE", price: 110 }
          }
        ]
      }
    ]
  };
  const buy = {
    schemaVersion: 1,
    eventId: "event-aapl-buy",
    planId: "aapl-day-setup",
    actionId: "entry",
    portfolioId: "day-trading-agent",
    ticker: "AAPL",
    signal: "BUY",
    triggeredAt: "2026-08-10T13:35:00.000Z",
    price: 101,
    source: { provider: "tradingview", alertId: "alert-aapl-buy" }
  };
  const files = await fixture({ plans, alert: buy });
  applyTradeAlert(files);
  let state = loadState(files.state);
  let portfolio = state.portfolios.dayTradingAgent;
  assert.equal(portfolio.holdings.find((holding) => holding.ticker === "AAPL").shares, 10);
  assert.equal(portfolio.holdings.find((holding) => holding.assetClass === "Cash").marketValue, 8990);

  const target = {
    ...buy,
    eventId: "event-aapl-target",
    actionId: "target",
    signal: "TAKE_PROFIT",
    triggeredAt: "2026-08-10T15:00:00.000Z",
    price: 110,
    source: { provider: "tradingview", alertId: "alert-aapl-target" }
  };
  await writeFile(files.event, `${JSON.stringify(target, null, 2)}\n`, "utf8");
  const beforeRejectedTarget = await readFile(files.state, "utf8");
  assert.throws(() => applyTradeAlert(files), /exceeds owned shares/u);
  assert.equal(await readFile(files.state, "utf8"), beforeRejectedTarget);

  plans.plans[0].actions[0].shares = 101;
  const insufficient = await fixture({
    plans,
    alert: { ...buy, eventId: "event-too-large", source: { provider: "tradingview", alertId: "alert-too-large" } }
  });
  assert.throws(() => applyTradeAlert(insufficient), /exceeds available cash/u);
  assert.equal(existsSync(insufficient.ledger), false);
});

test("out-of-order, mismatched, and malformed configured signals fail without state writes", async () => {
  const files = await fixture({
    alert: event({
      portfolioId: "swing-trading-agent"
    })
  });
  const original = await readFile(files.state, "utf8");
  assert.throws(() => applyTradeAlert(files), /portfolio does not match/u);
  assert.equal(await readFile(files.state, "utf8"), original);
  assert.equal(existsSync(files.ledger), false);

  const predating = await fixture({
    alert: event({ triggeredAt: "2026-08-01T16:35:00.000Z" })
  });
  assert.throws(() => applyTradeAlert(predating), /predates an existing transaction/u);
  assert.equal(existsSync(predating.ledger), false);

  const malformed = structuredClone(longTermPlan);
  malformed.plans[0].actions[1].shares = 5;
  assert.throws(() => validatePlanRegistry(malformed), /SELL action must use ALL shares/u);

  const allCashPlan = structuredClone(longTermPlan);
  allCashPlan.plans[0].id = "uso-day-plan";
  allCashPlan.plans[0].portfolioId = "day-trading-agent";
  allCashPlan.plans[0].ticker = "USO";
  allCashPlan.plans[0].actions = [
    {
      id: "target-before-buy",
      signal: "TAKE_PROFIT",
      shares: 1,
      condition: { operator: "AT_OR_ABOVE", price: 130 }
    }
  ];
  const noPosition = await fixture({
    plans: allCashPlan,
    alert: {
      ...event(),
      eventId: "event-uso-target",
      planId: "uso-day-plan",
      actionId: "target-before-buy",
      portfolioId: "day-trading-agent",
      ticker: "USO",
      price: 130,
      source: { provider: "trendspider", alertId: "alert-uso-target" }
    }
  });
  assert.throws(() => applyTradeAlert(noPosition), /requires an open USO position/u);
  assert.equal(existsSync(noPosition.ledger), false);
});
