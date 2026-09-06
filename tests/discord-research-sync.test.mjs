import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { loadResearchTickers } from "../scripts/research-intake-proposal.mjs";

const ROOT = new URL("../", import.meta.url);
async function loadSite() {
  const context = { window: {} };
  for (const name of ["app-data", "trade-setup-reviews", "discord-research-sync"]) {
    const source = await readFile(new URL(`data/${name}.js`, ROOT), "utf8");
    runInNewContext(source, context, { timeout: 1000 });
  }
  return JSON.parse(JSON.stringify(context.window));
}

test("the live Discord layer preserves the portfolio and dated baseline context", async () => {
  const site = await loadSite();
  const baseline = { window: {} };
  runInNewContext(await readFile(new URL("data/app-data.js", ROOT), "utf8"), baseline);
  assert.deepEqual(site.APP_DATA.portfolio, JSON.parse(JSON.stringify(baseline.window.APP_DATA.portfolio)));
  assert.deepEqual(site.APP_DATA.research.monthlyUpdates, JSON.parse(JSON.stringify(baseline.window.APP_DATA.research.monthlyUpdates)));
  assert.equal(site.APP_DATA.meta.updatedAt, "2026-09-04");
  const sync = site.DISCORD_RESEARCH_SYNC;
  assert.equal(sync.coverage.status, "complete-four-channel-review");
  assert.equal(sync.researchUpdates.length, 53);
  const oldByTicker = new Map(baseline.window.APP_DATA.research.tickers.map(note => [note.ticker, note]));
  const notes = site.APP_DATA.research.tickers;
  assert.equal(new Set(notes.map(note => note.ticker)).size, notes.length);
  for (const update of sync.researchUpdates) {
    const actual = notes.find(note => note.ticker === update.ticker);
    assert.ok(actual, update.ticker);
    assert.match(actual.postedChartUrl, /^https:\/\/www\.tradingview\.com\/x\/[A-Za-z0-9]+\/$/);
    assert.ok(actual.postedChartDate > "2026-08-07" && actual.postedChartDate <= "2026-09-04");
    assert.ok(actual.sourceText.length > 20, `${actual.ticker} exact source commentary`);
    assert.equal(actual.sourceText, update.sourceText);
    assert.deepEqual(actual.levels, update.levels);
    assert.equal(actual.sourceReviewDate, "2026-09-04");
    assert.ok(actual.name && actual.analysisTimeframe);
    if (actual.chartReady) assert.ok(actual.tvSymbol);
    const prior = oldByTicker.get(actual.ticker);
    if (prior && !update.fundamentals) assert.equal(actual.fundamentals.asOf, prior.postedChartDate);
    if (prior?.aiAnalysis && !Object.hasOwn(update, "aiAnalysis")) assert.equal(actual.aiAnalysis.asOf, prior.postedChartDate);
  }
  assert.equal(notes.find(note => note.ticker === "TLT").postedChartDate, "2026-08-07");
});

test("published setup imports are historical ideas with unknown outcomes, not simulated fills", async () => {
  const site = await loadSite();
  const reviews = site.DISCORD_RESEARCH_SYNC.setupReviews;
  assert.equal(reviews.length, 24);
  assert.equal(site.TRADE_SETUP_REVIEWS.reviews.length, 30);
  assert.equal(new Set(reviews.map(review => review.id)).size, reviews.length);
  for (const review of reviews) {
    assert.equal(review.statusCode, "REVIEW_PENDING");
    assert.equal(review.outcome.type, "UNKNOWN");
    assert.ok(review.date >= "2026-08-25" && review.date <= "2026-09-03");
    assert.match(review.sourceMessageUrl, /^https:\/\/discord\.com\/channels\/1178077469505486868\/\d+\/\d+$/);
    assert.match(review.sourceSha256, /^[a-f0-9]{64}$/);
    assert.ok(review.setup.entryCondition && review.setup.preEntryInvalidation);
    assert.equal(review.setup.takeProfitLevels.length, 2);
    assert.ok(review.rationale.technicals && review.rationale.fundamentals && review.riskReward);
    assert.equal(review.chartUrl, undefined, "no chart was present in the source body");
    assert.doesNotMatch(JSON.stringify(review), /"(?:shares|fillPrice|realizedPnl|unrealizedPnl|portfolioValue|costBasis|marketValue|position)"\s*:/);
  }
  assert.match(reviews.find(review => review.ticker === "SLB").lesson, /contradiction/);
  assert.match(reviews.find(review => review.ticker === "ALL").lesson, /ambiguity/);
  assert.match(reviews.find(review => review.ticker === "IBKR").lesson, /ambiguity/);
  assert.match(reviews.find(review => review.ticker === "CRM").setup.plannedStopAfterEntry, /weekly/i);
  assert.match(reviews.find(review => review.ticker === "NVDA" && review.horizon === "Long-term idea").setup.plannedStopAfterEntry, /daily/i);
  assert.equal(reviews.some(review => ["PLTR", "CLH", "BAC"].includes(review.ticker)), false);
});

test("the intake helper and site use the same current research view", async () => {
  const site = await loadSite();
  const fromHelper = await loadResearchTickers(new URL("data/app-data.js", ROOT).pathname);
  assert.deepEqual(JSON.parse(JSON.stringify(fromHelper)), site.APP_DATA.research.tickers);
});

test("script order, source escaping, and historical labels are preserved", async () => {
  const html = await readFile(new URL("index.html", ROOT), "utf8");
  const app = await readFile(new URL("assets/app.js", ROOT), "utf8");
  assert.ok(html.indexOf("data/trade-setup-reviews.js") < html.indexOf("data/discord-research-sync.js"));
  assert.ok(html.indexOf("data/discord-research-sync.js") < html.indexOf("assets/app.js"));
  assert.match(app, /esc\(t\.sourceText\)/);
  assert.match(app, /esc\(t\.sourceCaveat\)/);
  assert.match(app, /Historical momentum snapshot/);
  assert.match(app, /Historical fundamentals as of/);
  assert.match(html, /Historical plans are not current buy alerts/);
});
