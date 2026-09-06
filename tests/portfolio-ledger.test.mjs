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

function closeOnOrBefore(history, date) {
  let close = null;
  for (const row of history || []) {
    if (row.date > date) break;
    close = Number(row.close);
  }
  return close;
}

function replayHolding(holding, date) {
  let shares = 0;
  let basis = 0;
  let realized = 0;
  let cashDelta = 0;
  for (const transaction of holding.transactions || []) {
    if (transaction.date > date) continue;
    const amount = Number(transaction.amount ?? transaction.shares * transaction.price);
    if (transaction.type === "buy") {
      shares += transaction.shares;
      basis += amount;
      cashDelta -= amount;
    } else {
      const soldBasis = (basis / shares) * transaction.shares;
      shares -= transaction.shares;
      basis -= soldBasis;
      realized += amount - soldBasis;
      cashDelta += amount;
    }
  }
  return { shares, basis, realized, cashDelta };
}

test("July 10 fills reconcile shares, cost basis, cash, and realized profit", async () => {
  const { portfolio } = await loadData();
  const byTicker = Object.fromEntries(portfolio.holdings.map((holding) => [holding.ticker, holding]));

  const expected = {
    AAPL: { shares: 2.358672846843, basis: 648.5878594249, realized: 48.5878594249 },
    PLTR: { shares: 6.155316004686, basis: 661.5118110236, realized: 61.5118110236 },
    BABA: { shares: 5.995882073444, basis: 578.6026200873, realized: 78.6026200873 },
    TSM: { shares: 2.314814814815, basis: 1000, realized: 0 }
  };

  for (const [ticker, values] of Object.entries(expected)) {
    const replayed = replayHolding(byTicker[ticker], "2026-07-10");
    assert.ok(Math.abs(replayed.shares - values.shares) < 0.000001, `${ticker} shares`);
    assert.ok(Math.abs(replayed.basis - values.basis) < 0.02, `${ticker} basis`);
    assert.ok(Math.abs(replayed.realized - values.realized) < 0.02, `${ticker} realized P/L`);
  }

  let cashOnJuly10 = portfolio.startingValue;
  let realizedOnJuly10 = 0;
  for (const holding of portfolio.holdings) {
    if (holding.assetClass === "Cash") continue;
    const replayed = replayHolding(holding, "2026-07-10");
    cashOnJuly10 += replayed.cashDelta;
    realizedOnJuly10 += replayed.realized;
  }
  assert.ok(Math.abs(cashOnJuly10 - 3300) < 0.02);
  assert.ok(Math.abs(realizedOnJuly10 - 188.70) < 0.02);
});

test("the META fill, ORCL stop, and NVO buy reconcile the July 17 ledger", async () => {
  const { portfolio } = await loadData();
  const meta = portfolio.holdings.find((holding) => holding.ticker === "META");
  const orcl = portfolio.holdings.find((holding) => holding.ticker === "ORCL");
  const nvo = portfolio.holdings.find((holding) => holding.ticker === "NVO");

  const metaReplay = replayHolding(meta, "2026-07-17");
  assert.ok(Math.abs(metaReplay.shares - 1.249423048382) < 0.000001);
  assert.ok(Math.abs(metaReplay.basis - 678.9364844905) < 0.02);
  assert.ok(Math.abs(metaReplay.realized - 78.9364844904) < 0.02);

  const orclReplay = replayHolding(orcl, "2026-07-17");
  assert.ok(Math.abs(orclReplay.shares) < 0.000001);
  assert.ok(Math.abs(orclReplay.basis) < 0.02);
  assert.ok(Math.abs(orclReplay.realized + 24.5639017444) < 0.02);
  assert.equal(orcl.closed, true);

  const nvoReplay = replayHolding(nvo, "2026-07-17");
  assert.ok(Math.abs(nvoReplay.shares - 19.391118867559) < 0.000001);
  assert.ok(Math.abs(nvoReplay.basis - 1000) < 0.02);

  assert.deepEqual(portfolio.pendingOrders, []);
  let cashOnJuly17 = portfolio.startingValue;
  for (const holding of portfolio.holdings) {
    if (holding.assetClass === "Cash") continue;
    cashOnJuly17 += replayHolding(holding, "2026-07-17").cashDelta;
  }
  assert.ok(Math.abs(cashOnJuly17 - 3675.4360982556) < 0.02);
  let realizedThroughJuly17 = 0;
  for (const holding of portfolio.holdings) {
    if (holding.assetClass === "Cash") continue;
    realizedThroughJuly17 += replayHolding(holding, "2026-07-17").realized;
  }
  assert.ok(Math.abs(realizedThroughJuly17 - 243.0748732818) < 0.02);
});

test("the August 4 trims and NVO add reconcile shares, cash, and realized profit", async () => {
  const { portfolio } = await loadData();
  const byTicker = Object.fromEntries(portfolio.holdings.map((holding) => [holding.ticker, holding]));
  const expected = {
    PLTR: { shares: 3.049725942574, basis: 327.7540470484, realized: 227.7540470484 },
    MSFT: { shares: 1.418735161088, basis: 500.5581395350, realized: 200.5581395350 },
    BABA: { shares: 2.895106879646, basis: 279.3778138858, realized: 179.3778138858 },
    TQQQ: { shares: 13.308114975380, basis: 892.1760279495, realized: 86.1760279495 },
    NVO: { shares: 38.949975495963, basis: 1869, realized: 0 }
  };

  let realized = 0;
  for (const [ticker, values] of Object.entries(expected)) {
    const replayed = replayHolding(byTicker[ticker], "2026-08-04");
    assert.ok(Math.abs(replayed.shares - values.shares) < 0.000001, `${ticker} shares`);
    assert.ok(Math.abs(replayed.basis - values.basis) < 0.02, `${ticker} basis`);
    assert.ok(Math.abs(replayed.realized - values.realized) < 0.02, `${ticker} realized P/L`);
  }

  for (const holding of portfolio.holdings) {
    if (holding.assetClass === "Cash") continue;
    realized += replayHolding(holding, "2026-08-04").realized;
  }
  const cash = byTicker.CASH;
  assert.ok(Math.abs(cash.marketValue - 1600.4360982556) < 0.02);
  assert.ok(Math.abs(cash.costBasis - cash.marketValue) < 0.000001);
  assert.ok(Math.abs(cash.shares - cash.marketValue) < 0.000001);
  assert.ok(Math.abs(realized - 796.8264705896) < 0.02);
  assert.ok(Math.abs(portfolio.realizedPnl - realized) < 0.02);

  const decisions = portfolio.decisions.filter((entry) => entry.date === "2026-08-04");
  assert.deepEqual(decisions.map((entry) => entry.status), ["Filled", "Filled"]);
});

test("the TQQQ and META buys reconcile the July 23 ledger", async () => {
  const { portfolio } = await loadData();
  const meta = portfolio.holdings.find((holding) => holding.ticker === "META");
  const tqqq = portfolio.holdings.find((holding) => holding.ticker === "TQQQ");

  const metaReplay = replayHolding(meta, "2026-07-23");
  assert.ok(Math.abs(metaReplay.shares - 4.567273081561) < 0.000001);
  assert.ok(Math.abs(metaReplay.basis - 2678.9364844905) < 0.02);
  assert.ok(Math.abs(metaReplay.realized - 78.9364844904) < 0.02);

  const tqqqReplay = replayHolding(tqqq, "2026-07-23");
  assert.ok(Math.abs(tqqqReplay.shares - 24.98508353222) < 0.000001);
  assert.ok(Math.abs(tqqqReplay.basis - 1675) < 0.02);

  let cashOnJuly23 = portfolio.startingValue;
  let realizedThroughJuly23 = 0;
  for (const holding of portfolio.holdings) {
    if (holding.assetClass === "Cash") continue;
    const replayed = replayHolding(holding, "2026-07-23");
    cashOnJuly23 += replayed.cashDelta;
    realizedThroughJuly23 += replayed.realized;
  }
  assert.ok(Math.abs(cashOnJuly23 - 0.4360982556) < 0.02);
  assert.ok(Math.abs(realizedThroughJuly23 - 243.0748732818) < 0.02);
});

test("transaction replay preserves the July 9 portfolio history", async () => {
  const { portfolio } = await loadData();
  const snapshot = JSON.parse(await readFile(new URL("data/live-prices.json", ROOT), "utf8"));
  let cash = portfolio.startingValue;
  let positions = 0;

  for (const holding of portfolio.holdings) {
    if (holding.assetClass === "Cash") continue;
    const replayed = replayHolding(holding, "2026-07-09");
    cash += replayed.cashDelta;
    if (replayed.shares <= 0) continue;
    const close = closeOnOrBefore(snapshot.prices?.[holding.ticker]?.history, "2026-07-09");
    assert.ok(Number.isFinite(close), `${holding.ticker} July 9 close is available`);
    positions += replayed.shares * close;
  }

  assert.ok(Math.abs(cash + positions - 10840.541232) < 0.02);
});

test("open plus realized contributions reconcile with total portfolio return", async () => {
  const { portfolio } = await loadData();
  const snapshot = JSON.parse(await readFile(new URL("data/live-prices.json", ROOT), "utf8"));
  const cash = portfolio.holdings.find((holding) => holding.assetClass === "Cash").marketValue;
  let totalValue = cash;
  let contributions = 0;

  for (const holding of portfolio.holdings) {
    if (holding.assetClass === "Cash") continue;
    if (holding.closed === true || holding.shares <= 0) {
      contributions += Number(holding.realizedPnl || 0) - Number(holding.costBasis || 0);
      continue;
    }
    const last = snapshot.prices[holding.ticker]?.last ?? holding.latestPrice ?? holding.entryPrice;
    assert.ok(Number.isFinite(last), `${holding.ticker} has a usable price`);
    const marketValue = holding.shares * last;
    totalValue += marketValue;
    contributions += marketValue - holding.costBasis + Number(holding.realizedPnl || 0);
  }

  assert.ok(Math.abs(contributions - (totalValue - portfolio.startingValue)) < 0.02);
});

test("the public data model exposes one community portfolio and no AI ledgers", async () => {
  const data = await loadData();

  assert.ok(data.portfolio);
  assert.equal("aiPortfolios" in data, false);
});
