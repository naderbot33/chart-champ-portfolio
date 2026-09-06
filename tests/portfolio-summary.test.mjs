import assert from "node:assert/strict";
import test from "node:test";
import {
  buildContent,
  parseArguments,
  recentDecisionSummary
} from "../scripts/portfolio-summary.mjs";

const now = new Date("2026-07-23T20:30:00.000Z");
const portfolio = {
  realizedPnl: 243.07,
  decisions: [
    { date: "2026-07-23", summary: "Opened TQQQ." },
    { date: "2026-07-23", summary: "Added META." }
  ]
};
const metrics = {
  currentValue: 10_500,
  totalReturn: 500,
  totalReturnPct: 5,
  dayReturn: -100,
  dayReturnPct: -0.94,
  contributor: { ticker: "BABA", contribution: 180 },
  detractor: { ticker: "NVO", contribution: -60 },
  sourceTimestamp: "2026-07-23T20:00:00.000Z"
};

test("portfolio summary keeps same-day decisions by default", () => {
  assert.equal(recentDecisionSummary(portfolio, now), "Opened TQQQ. Added META.");
  assert.match(buildContent(metrics, portfolio, now), /RECENT DECISIONS\*\* — Opened TQQQ\. Added META\./u);
});

test("confirmed no-new-actions mode suppresses already published same-day decisions", () => {
  const expected = "No portfolio actions were taken since the last update.";
  assert.equal(recentDecisionSummary(portfolio, now, true), expected);
  assert.match(buildContent(metrics, portfolio, now, true), new RegExp(expected.replaceAll(".", "\\."), "u"));
});

test("portfolio summary CLI records the explicit decision mode", () => {
  assert.equal(parseArguments([]).confirmedNoNewActions, false);
  assert.equal(parseArguments(["--confirmed-no-new-actions"]).confirmedNoNewActions, true);
});
