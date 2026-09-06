import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, stat, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import {
  buildResearchIntakeProposal,
  canonicalTradingViewSnapshot,
  runResearchIntakeCli
} from "../scripts/research-intake-proposal.mjs";

const existing = [
  {
    ticker: "AAPL",
    postedChartDate: "2026-07-20",
    postedChartChannel: "stocks",
    postedChartUrl: "https://www.tradingview.com/x/ExistingA1/"
  },
  {
    ticker: "MSFT",
    postedChartDate: "2026-07-22",
    postedChartChannel: "stocks",
    postedChartUrl: "https://www.tradingview.com/x/ExistingM1/"
  },
  {
    ticker: "SAME",
    postedChartDate: "2026-07-22",
    postedChartChannel: "stocks",
    postedChartUrl: "https://www.tradingview.com/x/ExistingS1/"
  }
];

function candidate(ticker, date, id, channel = "stocks", overrides = {}) {
  return {
    ticker,
    postedChartDate: date,
    postedChartChannel: channel,
    postedChartUrl: `https://www.tradingview.com/x/${id}/`,
    analysisTimeframe: "6 hours",
    levels: {
      support: [{ price: "$100", note: "Decision support" }],
      resistance: [{ price: "$110", note: "Immediate resistance" }]
    },
    ...overrides
  };
}

function report(candidates, researchTickers = existing) {
  return buildResearchIntakeProposal({
    snapshot: { schemaVersion: 1, candidates },
    researchTickers,
    cutoffDate: "2026-07-20"
  });
}

test("fresh posts produce review-only add and update proposals across allowed channels", () => {
  const result = report([
    candidate("AAPL", "2026-07-21", "FreshA1"),
    candidate("NEWC", "2026-07-24", "FreshN1", "crypto"),
    candidate("BOND", "2026-07-23", "FreshB1", "bonds"),
    candidate("GOLD2", "2026-07-22", "FreshG1", "commodities")
  ]);

  assert.equal(result.mode, "review-only");
  assert.equal(result.approvalRequired, true);
  assert.deepEqual(result.summary, { scanned: 4, proposed: 4, add: 3, update: 1, rejected: 0 });
  assert.deepEqual(result.proposals.map((item) => item.ticker), ["NEWC", "BOND", "GOLD2", "AAPL"]);
  assert.equal(result.proposals.find((item) => item.ticker === "AAPL").action, "update");
  const added = result.proposals.find((item) => item.ticker === "NEWC");
  assert.equal(added.action, "add");
  assert.equal(added.readyToApply, false);
  assert.ok(added.missingForPublication.includes("fundamentals"));
});

test("invalid, stale, current, and reused candidates are rejected with stable codes", () => {
  const result = report([
    candidate("AAPL", "2026-07-20", "AtCutoff"),
    candidate("MSFT", "2026-07-21", "OlderThanCurrent"),
    candidate("SAME", "2026-07-22", "SameDayCurrent"),
    candidate("NEWC", "2026-07-23", "ExistingA1"),
    candidate("BAD", "2026-07-23", "BadChannel", "#stocks"),
    candidate("EVIL", "2026-07-23", "Unused", "stocks", {
      postedChartUrl: "https://tradingview.com.evil.test/x/Unused/"
    }),
    candidate("DATE", "2026-02-30", "BadDate")
  ]);

  assert.equal(result.summary.proposed, 0);
  assert.deepEqual(result.rejected.map((item) => item.code), [
    "NOT_AFTER_CUTOFF",
    "OLDER_THAN_EXISTING",
    "SAME_DAY_ORDER_UNPROVEN",
    "DUPLICATE_EXISTING_URL",
    "INVALID_CHANNEL",
    "INVALID_CHART_URL",
    "INVALID_POST_DATE"
  ]);
});

test("duplicate URLs, same-day ties, and superseded ticker posts fail closed", () => {
  const result = report([
    candidate("DUP1", "2026-07-23", "SameUrl"),
    candidate("DUP2", "2026-07-24", "SameUrl", "crypto", {
      postedChartUrl: "https://tradingview.com/x/SameUrl"
    }),
    candidate("TIE", "2026-07-24", "TieOne"),
    candidate("TIE", "2026-07-24", "TieTwo"),
    candidate("TIE", "2026-07-23", "TieOld"),
    candidate("WIN", "2026-07-21", "WinOld"),
    candidate("WIN", "2026-07-22", "WinNew")
  ]);

  assert.deepEqual(result.proposals.map((item) => item.ticker), ["WIN"]);
  assert.equal(result.proposals[0].source.postedChartUrl, "https://www.tradingview.com/x/WinNew/");
  assert.deepEqual(result.rejected.map((item) => item.code), [
    "DUPLICATE_CANDIDATE_URL",
    "DUPLICATE_CANDIDATE_URL",
    "AMBIGUOUS_LATEST_CANDIDATE",
    "AMBIGUOUS_LATEST_CANDIDATE",
    "SUPERSEDED_BY_NEWER_CANDIDATE",
    "SUPERSEDED_BY_NEWER_CANDIDATE"
  ]);
});

test("a rejected newest post blocks older fallback and duplicate URLs override other field errors", () => {
  const result = report([
    candidate("AAPL", "2026-07-23", "ExistingA1"),
    candidate("AAPL", "2026-07-22", "FallbackMustNotRun"),
    candidate("TIE", "2026-07-24", "ExistingM1"),
    candidate("TIE", "2026-07-24", "TieFresh"),
    candidate("BAD", "2026-07-25", "CrossFieldDuplicate", "#stocks"),
    candidate("GOOD", "2026-07-25", "CrossFieldDuplicate")
  ]);

  assert.equal(result.summary.proposed, 0);
  assert.deepEqual(result.rejected.map((item) => item.code), [
    "DUPLICATE_EXISTING_URL",
    "SUPERSEDED_BY_NEWER_CANDIDATE",
    "AMBIGUOUS_LATEST_CANDIDATE",
    "AMBIGUOUS_LATEST_CANDIDATE",
    "DUPLICATE_CANDIDATE_URL",
    "DUPLICATE_CANDIDATE_URL"
  ]);
});

test("TradingView normalization permits only undecorated snapshot links", () => {
  assert.equal(
    canonicalTradingViewSnapshot("https://tradingview.com/x/AbC123"),
    "https://www.tradingview.com/x/AbC123/"
  );
  for (const value of [
    "http://www.tradingview.com/x/AbC123/",
    "https://www.tradingview.com/chart/AbC123/",
    "https://www.tradingview.com/x/AbC123/extra",
    "https://www.tradingview.com/x/AbC123/?ref=discord",
    "https://www.tradingview.com/x/AbC123/#note",
    "https://www.tradingview.com:443/x/AbC123/",
    "https://www.tradingview.com/x/AbC123/?",
    "https://www.tradingview.com/x/AbC123/#",
    "https://www.tradingview.com/x/Ab\nC123/",
    "https://www.tradingview。com/x/AbC123/",
    "https://user@www.tradingview.com/x/AbC123/",
    "https://www.tradingview.com:444/x/AbC123/"
  ]) assert.equal(canonicalTradingViewSnapshot(value), null, value);
});

test("empty input is a valid no-change report while malformed top-level input fails", () => {
  const empty = report([]);
  assert.deepEqual(empty.summary, { scanned: 0, proposed: 0, add: 0, update: 0, rejected: 0 });
  assert.deepEqual(empty.proposals, []);
  assert.deepEqual(empty.rejected, []);
  assert.throws(
    () => buildResearchIntakeProposal({
      snapshot: { schemaVersion: 1 },
      researchTickers: existing,
      cutoffDate: "2026-07-20"
    }),
    /candidates array/u
  );
});

test("CLI confines files to runtime, writes once with private mode, and leaves app data unchanged", async () => {
  const root = await mkdtemp("/tmp/chartchamp-research-intake-");
  await mkdir(join(root, "data"), { recursive: true });
  await mkdir(join(root, "runtime"), { recursive: true });
  const appDataPath = join(root, "data", "app-data.js");
  const inputPath = join(root, "runtime", "posts.json");
  const outputPath = join(root, "runtime", "proposal.json");
  const outsideDir = join(root, "outside");
  const outsideInput = join(outsideDir, "outside.json");
  await mkdir(outsideDir, { recursive: true });
  await writeFile(appDataPath, `window.APP_DATA = ${JSON.stringify({ research: { tickers: existing } })};\n`);
  await writeFile(inputPath, JSON.stringify({
    schemaVersion: 1,
    candidates: [candidate("AAPL", "2026-07-21", "CliFresh")]
  }));
  await writeFile(outsideInput, "outside sentinel\n");
  await symlink(outsideInput, join(root, "runtime", "input-link.json"));
  await symlink(outsideDir, join(root, "runtime", "escape"));
  const before = createHash("sha256").update(await readFile(appDataPath)).digest("hex");
  const outsideBefore = createHash("sha256").update(await readFile(outsideInput)).digest("hex");
  let output = "";
  const result = await runResearchIntakeCli([
    "--input", "runtime/posts.json",
    "--after", "2026-07-20",
    "--output", "runtime/proposal.json"
  ], { root, stdout: { write: (value) => { output += value; } } });

  assert.equal(result.outcome, "report-written");
  assert.deepEqual(JSON.parse(output), result.report);
  assert.deepEqual(JSON.parse(await readFile(outputPath, "utf8")), result.report);
  assert.equal((await stat(outputPath)).mode & 0o777, 0o600);
  const after = createHash("sha256").update(await readFile(appDataPath)).digest("hex");
  assert.equal(after, before);
  assert.equal(
    createHash("sha256").update(await readFile(outsideInput)).digest("hex"),
    outsideBefore
  );
  assert.deepEqual(
    (await readdir(join(root, "runtime"))).sort(),
    ["escape", "input-link.json", "posts.json", "proposal.json"]
  );
  await assert.rejects(
    runResearchIntakeCli([
      "--input", "runtime/posts.json",
      "--after", "2026-07-20",
      "--output", "runtime/proposal.json"
    ], { root, stdout: { write: () => undefined } }),
    /EEXIST/u
  );
  await assert.rejects(
    runResearchIntakeCli([
      "--input", "../outside.json",
      "--after", "2026-07-20"
    ], { root, stdout: { write: () => undefined } }),
    /direct JSON child of runtime/u
  );
  await assert.rejects(
    runResearchIntakeCli([
      "--input", "runtime/input-link.json",
      "--after", "2026-07-20"
    ], { root, stdout: { write: () => undefined } }),
    /not a symbolic link/u
  );
  await assert.rejects(
    runResearchIntakeCli([
      "--input", "runtime/posts.json",
      "--after", "2026-07-20",
      "--output", "runtime/escape/proposal.json"
    ], { root, stdout: { write: () => undefined } }),
    /direct JSON child of runtime/u
  );
});

test("proposal script has no Discord, Firebase, browser, network, or process-launch capability", async () => {
  const source = await readFile(new URL("../scripts/research-intake-proposal.mjs", import.meta.url), "utf8");
  const imports = [...source.matchAll(/^import .*$/gmu)].map((match) => match[0]).join("\n");
  assert.doesNotMatch(source, /\bfetch\s*\(/u);
  assert.doesNotMatch(source, /node:(?:http|https|child_process)/u);
  assert.doesNotMatch(imports, /discord|firebase|webhook|browser-client/iu);
});
