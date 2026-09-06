import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { loadAutomationConfig, findChannel, findJob } from "../automation/lib/config.mjs";
import { LEGACY_AUTOMATION_ROOT } from "./helpers/legacy-automation-fixture.mjs";
import { normalizeDraft } from "../automation/lib/draft.mjs";
import { validateForDispatch } from "../automation/lib/validate.mjs";

const NOW = new Date("2026-07-10T13:46:00.000Z");

async function fixture(jobId = "trending-tickers-open") {
  const { channelRegistry, jobRegistry } = await loadAutomationConfig(LEGACY_AUTOMATION_ROOT);
  const job = findJob(jobRegistry, jobId);
  const channel = findChannel(channelRegistry, job.channel);
  const draft = normalizeDraft({
    channelId: channel.channelId,
    generatedAt: NOW.toISOString(),
    sourceTimestamp: "2026-07-10T13:42:00.000Z",
    content: "**Trending Tickers — Opening Check**\n• TEST — verified catalyst.",
    dedupeKey: `${jobId}:2026-07-10`,
    dryRun: true
  });
  const context = {
    chrome: { connected: true, extensionAvailable: true, signedIn: { yahoo: true } },
    market: { sessionDate: "2026-07-10", materialNonUs: false },
    source: { itemCount: 1, catalystsVerified: true }
  };
  return { channelRegistry, jobRegistry, job, channel, draft, context };
}

function codes(report) {
  return report.issues.map((entry) => entry.code);
}

test("a fresh, verified draft passes every gate", async () => {
  const value = await fixture();
  const report = validateForDispatch({
    ...value,
    defaults: value.jobRegistry.defaults,
    now: () => NOW
  });
  assert.deepEqual(report, { ok: true, issues: [] });
});

test("freshness, duplicate, message length, and source limit fail closed", async () => {
  const base = await fixture();
  const staleDraft = { ...base.draft, sourceTimestamp: "2026-07-10T12:00:00.000Z" };
  let report = validateForDispatch({
    ...base,
    draft: staleDraft,
    defaults: base.jobRegistry.defaults,
    now: () => NOW
  });
  assert.ok(codes(report).includes("SOURCE_STALE"));

  report = validateForDispatch({
    ...base,
    defaults: base.jobRegistry.defaults,
    seenDedupeKeys: new Set([base.draft.dedupeKey]),
    now: () => NOW
  });
  assert.ok(codes(report).includes("DUPLICATE"));

  report = validateForDispatch({
    ...base,
    draft: { ...base.draft, content: "x".repeat(1901) },
    defaults: base.jobRegistry.defaults,
    now: () => NOW
  });
  assert.ok(codes(report).includes("MESSAGE_TOO_LONG"));

  report = validateForDispatch({
    ...base,
    context: { ...base.context, source: { itemCount: 5, catalystsVerified: true } },
    defaults: base.jobRegistry.defaults,
    now: () => NOW
  });
  assert.ok(codes(report).includes("SOURCE_LIMIT"));
});

test("Chrome and source verification failures are explicit", async () => {
  const base = await fixture();
  const report = validateForDispatch({
    ...base,
    context: {
      ...base.context,
      chrome: { connected: false, extensionAvailable: false, signedIn: { yahoo: false } },
      source: { itemCount: 1, catalystsVerified: false }
    },
    defaults: base.jobRegistry.defaults,
    now: () => NOW
  });
  assert.ok(codes(report).includes("CHROME_DISCONNECTED"));
  assert.ok(codes(report).includes("EXTENSION_UNAVAILABLE"));
  assert.ok(codes(report).includes("SITE_NOT_SIGNED_IN"));
  assert.ok(codes(report).includes("SOURCE_FLAG_MISSING"));
});

test("closed market skips market jobs but permits a material global brief", async () => {
  const trending = await fixture();
  trending.draft.generatedAt = "2026-07-03T14:00:00.000Z";
  trending.draft.sourceTimestamp = "2026-07-03T13:55:00.000Z";
  trending.context.market.sessionDate = "2026-07-03";
  let report = validateForDispatch({
    ...trending,
    defaults: trending.jobRegistry.defaults,
    now: () => new Date(trending.draft.generatedAt)
  });
  assert.ok(codes(report).includes("MARKET_CLOSED"));

  const brief = await fixture("market-briefs-daily");
  brief.draft.generatedAt = "2026-07-03T14:00:00.000Z";
  brief.draft.sourceTimestamp = "2026-07-03T13:55:00.000Z";
  brief.draft.content = "<@&1498152504817483927>\n\n🌎 **Global Market Brief — Friday, July 3rd at 7:00 AM PT**\n\n**Stocks:** Material global context.";
  brief.context = {
    chrome: { connected: true, extensionAvailable: true, signedIn: { trendspider: true } },
    trendspider: { tabCount: 1 },
    market: { sessionDate: "2026-07-03", materialNonUs: true },
    source: {
      itemCount: 2,
      materialItemsOnly: true,
      timeSensitiveClaimsCrossChecked: true
    },
    sidekick: { messagesRemaining: 490 }
  };
  report = validateForDispatch({
    ...brief,
    defaults: brief.jobRegistry.defaults,
    now: () => new Date(brief.draft.generatedAt)
  });
  assert.equal(report.ok, true);
});

test("market brief sample locks format and uses the verified BRIEFS role ID", async () => {
  const [draft, context] = await Promise.all([
    readFile(new URL("../automation/samples/market-briefs-format.json", import.meta.url), "utf8").then(
      JSON.parse
    ),
    readFile(
      new URL("../automation/samples/market-briefs-format-context.json", import.meta.url),
      "utf8"
    ).then(JSON.parse)
  ]);
  const { channelRegistry, jobRegistry } = await loadAutomationConfig(LEGACY_AUTOMATION_ROOT);
  const job = findJob(jobRegistry, "market-briefs-daily");
  const channel = findChannel(channelRegistry, job.channel);
  let report = validateForDispatch({
    draft,
    context,
    job,
    channel,
    defaults: jobRegistry.defaults,
    now: () => new Date(draft.generatedAt)
  });
  assert.deepEqual(report, { ok: true, issues: [] });
  assert.ok(
    draft.content.startsWith(
      "<@&1498152504817483927>\n\n🌎 **Global Market Brief — Friday, July 10th"
    )
  );
  assert.match(draft.content, /\*\*Stocks\*\*\n•/);
  assert.match(draft.content, /\*\*Macro & Rates\*\*/);
  assert.match(draft.content, /\*\*What Matters Next\*\*/);
  assert.doesNotMatch(draft.content, /Source:|Educational market context only/i);

  report = validateForDispatch({
    draft: { ...draft, dryRun: false },
    context,
    job,
    channel,
    defaults: jobRegistry.defaults,
    now: () => new Date(draft.generatedAt)
  });
  assert.deepEqual(report, { ok: true, issues: [] });

  report = validateForDispatch({
    draft: { ...draft, dryRun: false },
    context,
    job,
    channel: { ...channel, notificationRoleId: undefined },
    defaults: jobRegistry.defaults,
    now: () => new Date(draft.generatedAt)
  });
  assert.ok(codes(report).includes("ROLE_CONFIGURATION_MISSING"));

  report = validateForDispatch({
    draft,
    context: { ...context, trendspider: { tabCount: 2 } },
    job,
    channel,
    defaults: jobRegistry.defaults,
    now: () => new Date(draft.generatedAt)
  });
  assert.ok(codes(report).includes("TRENDSPIDER_SESSION_CONFLICT"));
});

test("Sidekick allowance and scanner warning gates fail closed", async () => {
  const base = await fixture("market-scanners-open");
  base.context = {
    chrome: { connected: true, extensionAvailable: true, signedIn: { trendspider: true } },
    market: { sessionDate: "2026-07-10" },
    source: { itemCount: 3, actualScannerResults: true },
    sidekick: { messagesRemaining: 10 },
    scanner: {
      unsavedChangesWarning: true,
      savedOrSubscribedOnly: false,
      scannersRun: ["Weinstein Stage 2"],
      trendspiderTabCount: 2
    }
  };
  const report = validateForDispatch({
    ...base,
    defaults: base.jobRegistry.defaults,
    now: () => NOW
  });
  assert.ok(codes(report).includes("SIDEKICK_LIMIT"));
  assert.ok(codes(report).includes("SCANNER_WARNING"));
  assert.ok(codes(report).includes("SCANNER_SOURCE_UNSAFE"));
  assert.ok(codes(report).includes("ROLE_MENTION_MISSING"));
  assert.ok(codes(report).includes("TRENDSPIDER_SESSION_CONFLICT"));
});

test("an old generated draft is rejected even when its source matches", async () => {
  const base = await fixture();
  base.draft.generatedAt = "2026-07-10T13:00:00.000Z";
  base.draft.sourceTimestamp = "2026-07-10T12:59:00.000Z";
  const report = validateForDispatch({
    ...base,
    defaults: base.jobRegistry.defaults,
    now: () => NOW
  });
  assert.ok(codes(report).includes("DRAFT_STALE"));
});

test("market context cannot claim a different Pacific session date", async () => {
  const base = await fixture();
  base.context.market.sessionDate = "2026-07-09";
  const report = validateForDispatch({
    ...base,
    defaults: base.jobRegistry.defaults,
    now: () => NOW
  });
  assert.ok(codes(report).includes("MARKET_DATE_MISMATCH"));
});
