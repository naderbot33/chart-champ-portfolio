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

  const cash = byTicker.CASH;
  assert.equal(cash.marketValue, 3300);
  assert.equal(cash.shares, 3300);
  assert.ok(Math.abs(portfolio.realizedPnl - 188.70) < 0.01);
});

test("the pending META order changes no shares, basis, cash, or realized profit", async () => {
  const { portfolio } = await loadData();
  const meta = portfolio.holdings.find((holding) => holding.ticker === "META");
  const order = portfolio.pendingOrders.find((candidate) => candidate.ticker === "META");

  assert.equal(order.status, "Pending");
  assert.equal(order.amount, 400);
  assert.equal(order.limitPrice, 677);
  assert.equal(meta.transactions.filter((transaction) => transaction.type === "sell").length, 0);
  assert.ok(Math.abs(meta.shares - 1.840264998160) < 0.000001);
  assert.equal(meta.costBasis, 1000);
  assert.equal(meta.realizedPnl, undefined);
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
    const marketValue = holding.shares * snapshot.prices[holding.ticker].last;
    totalValue += marketValue;
    contributions += marketValue - holding.costBasis + Number(holding.realizedPnl || 0);
  }

  assert.ok(Math.abs(contributions - (totalValue - portfolio.startingValue)) < 0.02);
});
