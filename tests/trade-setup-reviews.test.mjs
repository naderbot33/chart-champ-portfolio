import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);
const STATUS_CODES = new Set([
  "WATCHING",
  "TRIGGERED",
  "INVALIDATED_BEFORE_ENTRY",
  "EXPIRED_NO_TRADE",
  "COMPLETED"
]);
const OUTCOME_TYPES = new Set(["OPEN_TRADE", "NO_TRADE", "CLOSED_TRADE"]);
const FORBIDDEN_PORTFOLIO_KEYS = new Set([
  "shares",
  "fillPrice",
  "realizedPnl",
  "unrealizedPnl",
  "portfolioValue",
  "costBasis",
  "marketValue",
  "position"
]);

async function loadReviews() {
  const window = {};
  const source = await readFile(new URL("data/trade-setup-reviews.js", ROOT), "utf8");
  new Function("window", source)(window);
  return window.TRADE_SETUP_REVIEWS;
}

function collectKeys(value, keys = []) {
  if (!value || typeof value !== "object") return keys;
  for (const [key, child] of Object.entries(value)) {
    keys.push(key);
    collectKeys(child, keys);
  }
  return keys;
}

test("setup reviews are a strict non-portfolio journal", async () => {
  const data = await loadReviews();
  assert.equal(data.schemaVersion, 1);
  assert.ok(Number.isFinite(Date.parse(data.updatedAt)));
  assert.equal(data.reviews.length, 6);

  const ids = new Set();
  for (const review of data.reviews) {
    assert.match(review.date, /^\d{4}-\d{2}-\d{2}$/u);
    assert.ok(review.id.startsWith(`${review.date}-`), `${review.id} begins with its review date`);
    assert.ok(!ids.has(review.id), `${review.id} is unique`);
    ids.add(review.id);
    assert.ok(Number.isFinite(Date.parse(review.reviewedAt)), `${review.id} reviewedAt`);
    assert.match(review.ticker, /^[A-Z]+$/u);
    assert.ok(STATUS_CODES.has(review.statusCode), `${review.id} status`);
    assert.ok(OUTCOME_TYPES.has(review.outcome.type), `${review.id} outcome`);
    assert.match(review.chartUrl, /^https:\/\/www\.tradingview\.com\/x\/[A-Za-z0-9]+\/$/u);
    assert.ok(review.setup.entryCondition);
    assert.ok(review.setup.entryZone);
    assert.ok(review.setup.preEntryInvalidation);
    assert.ok(review.setup.plannedStopAfterEntry);
    assert.equal(review.setup.takeProfitLevels.length, 2);
    assert.ok(review.rationale.technicals);
    assert.ok(review.rationale.fundamentals);
    assert.ok(review.outcome.summary);
    assert.ok(review.outcome.sequence.length >= 2);
    assert.ok(review.lesson);

    for (const key of collectKeys(review)) {
      assert.ok(!FORBIDDEN_PORTFOLIO_KEYS.has(key), `${review.id} must not expose ${key}`);
    }
  }
});

test("AMLX records invalidation before entry and the later rally without inventing P/L", async () => {
  const data = await loadReviews();
  const amlx = data.reviews.find((review) => review.ticker === "AMLX");

  assert.equal(amlx.statusCode, "INVALIDATED_BEFORE_ENTRY");
  assert.equal(amlx.outcome.type, "NO_TRADE");
  assert.match(amlx.setup.entryCondition, /five-minute close above it and a successful retest/u);
  assert.match(amlx.setup.preEntryInvalidation, /\$30\.65/u);
  assert.match(amlx.outcome.summary, /later rallied above the original trigger area/u);
  assert.match(amlx.outcome.summary, /no position was opened/u);
  assert.match(amlx.lesson, /no trade—not a stopped-out loss/u);
  assert.doesNotMatch(JSON.stringify(amlx), /realized|unrealized|fill price|portfolio return/iu);
});

test("August 19 setups preserve their actual states without inventing P/L", async () => {
  const data = await loadReviews();
  const tgt = data.reviews.find((review) => review.id === "2026-08-19-tgt-day");
  const mrvl = data.reviews.find((review) => review.id === "2026-08-19-mrvl-swing");
  const mrk = data.reviews.find((review) => review.id === "2026-08-19-mrk-long-term");

  assert.equal(tgt.statusCode, "TRIGGERED");
  assert.equal(tgt.outcome.type, "OPEN_TRADE");
  assert.match(tgt.outcome.summary, /does not invent a closed result or P\/L/u);
  assert.match(tgt.outcome.sequence.join(" "), /7:45 AM.*7:50 AM.*8:00 AM/u);
  assert.match(tgt.outcome.sequence.join(" "), /\$158\.80.*\$161\.98/u);
  assert.equal(tgt.chartUrl, "https://www.tradingview.com/x/W1isJICm/");
  assert.doesNotMatch(JSON.stringify(tgt), /realizedPnl|unrealizedPnl|portfolioValue/u);

  assert.equal(mrvl.statusCode, "WATCHING");
  assert.equal(mrvl.outcome.type, "NO_TRADE");
  assert.match(mrvl.outcome.summary, /required first daily close/u);
  assert.match(mrvl.outcome.sequence.join(" "), /\$237\.27/u);
  assert.equal(mrvl.chartUrl, "https://www.tradingview.com/x/BVJy2Tzh/");

  assert.equal(mrk.statusCode, "WATCHING");
  assert.equal(mrk.outcome.type, "NO_TRADE");
  assert.match(mrk.outcome.summary, /never entered the required \$136–\$140/u);
  assert.match(mrk.outcome.sequence.join(" "), /\$144\.90/u);
  assert.equal(mrk.chartUrl, "https://www.tradingview.com/x/Qbwhst7e/");
});

test("the site exposes one portfolio and a separate setup-review route", async () => {
  const [html, app, appData] = await Promise.all([
    readFile(new URL("index.html", ROOT), "utf8"),
    readFile(new URL("assets/app.js", ROOT), "utf8"),
    readFile(new URL("data/app-data.js", ROOT), "utf8")
  ]);

  assert.match(html, /data-view="setups"/u);
  assert.match(html, /id="view-setups"/u);
  assert.match(html, /<h1>Trade Setups<\/h1>/u);
  assert.doesNotMatch(html, /portfolio-selector|ai-portfolio-state/iu);
  assert.doesNotMatch(appData, /aiPortfolios|Day Trading Agent|Swing Trading Agent|Long Term Investing Agent/u);
  assert.match(app, /function renderSetupReviews\(selectedId\)/u);
  assert.match(app, /canonicalSnapshotUrl/u);
  assert.match(app, /esc\(outcome\.summary/u);
  assert.match(app, /esc\(review\.lesson/u);
  assert.match(app, /review\.statusCode === "COMPLETED" \? "is-complete"/u);
  assert.match(app, /\["portfolio", "research", "setups"\]/u);
});
