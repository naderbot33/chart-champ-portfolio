import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
const context = { window: {} };
for (const file of ["data/app-data.js", "data/trade-setup-reviews.js", "data/discord-research-sync.js", "assets/research-model.js"]) {
  runInNewContext(await readFile(new URL("../" + file, import.meta.url), "utf8"), context);
}
const model = context.window.ChartChampModel;
const reviews = context.window.TRADE_SETUP_REVIEWS.reviews;
const now = new Date("2026-09-06T07:00:00Z");

test("bulk review dates do not reorder setup publication history", () => {
  const ordered = model.newestSetups(reviews);
  assert.equal(ordered[0].date, "2026-09-03");
  assert.equal(ordered.filter(x => x.date === "2026-09-03").length, 3);
  for (let i = 1; i < ordered.length; i++) assert.ok(ordered[i - 1].date >= ordered[i].date);
});
test("unknown outcomes and overdue open ideas are never promoted to active or closed", () => {
  const original = JSON.stringify(reviews);
  assert.equal(model.setupState(reviews.find(x => x.ticker === "TGT"), now).group, "review");
  assert.equal(model.setupState(reviews.find(x => x.ticker === "AMLX"), now).group, "closed");
  for (const r of reviews.filter(x => x.outcome.type === "UNKNOWN")) assert.equal(model.setupState(r, now).group, "review");
  assert.equal(JSON.stringify(reviews), original);
});
test("a stale review or elapsed expiry asks for evidence without inventing execution", () => {
  const r = { horizon: "Day trade", statusCode: "WATCHING", statusLabel: "Watching", reviewedAt: "2026-09-06T06:00:00Z", outcome: { type: "NO_TRADE" } };
  assert.equal(model.setupState(r, now).group, "active");
  assert.equal(model.setupState({ ...r, expiresAt: "2026-09-05T20:00:00Z" }, now).group, "review");
});
test("chart-only imports keep partial coverage and missing provenance explicit", () => {
  const t = context.window.APP_DATA.research.tickers.find(x => x.ticker === "SNAP");
  const view = model.tickerView(t, now);
  assert.equal(view.coverage, "chart");
  assert.equal(view.sourceMessageUrl, null);
  assert.equal(view.chartPostedAt, "2026-09-04T08:23:00-07:00");
});
test("chart intervals follow the source timeframe", () => {
  for (const [source, expected] of [["12 Hours", "720"], ["6H", "360"], ["1W", "W"], ["5 minute", "5"], ["Daily", "D"]]) assert.equal(model.chartInterval(source), expected);
});
