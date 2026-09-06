import test from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import {
  exportPausedJobDefinitions,
  loadAutomationConfig
} from "../automation/lib/config.mjs";
import { resolve } from "node:path";
import { LEGACY_AUTOMATION_ROOT } from "./helpers/legacy-automation-fixture.mjs";

test("legacy fixture registry has the seven exact ChartChamp destinations", async () => {
  const { channelRegistry } = await loadAutomationConfig(LEGACY_AUTOMATION_ROOT);
  assert.equal(channelRegistry.guildId, "1178077469505486868");
  assert.equal(channelRegistry.webhookName, "ChartChamp Market Bot");
  assert.deepEqual(
    Object.fromEntries(channelRegistry.channels.map((channel) => [channel.key, channel.channelId])),
    {
      "public-portfolio": "1483112393109409903",
      "trending-tickers": "1495941558741106889",
      "market-briefs": "1495941654828548156",
      "market-scanners": "1495962636016160778",
      "economic-data": "1289312459378917386",
      "options-flow": "1493981552005353616",
      "insider-trades": "1209208579115057243"
    }
  );
  const marketBriefs = channelRegistry.channels.find((channel) => channel.key === "market-briefs");
  assert.equal(marketBriefs.notificationRoleName, "BRIEFS");
  assert.equal(marketBriefs.notificationRoleId, "1498152504817483927");
});

test("legacy fixture retains the historical opening scanner activation", async () => {
  const { jobRegistry } = await loadAutomationConfig(LEGACY_AUTOMATION_ROOT);
  assert.equal(jobRegistry.jobs.length, 8);
  assert.equal(jobRegistry.timezone, "America/Los_Angeles");
  assert.equal(jobRegistry.defaults.status, "PAUSED");
  assert.equal(jobRegistry.defaults.deliveryMode, "dry-run");
  assert.deepEqual(
    Object.fromEntries(jobRegistry.jobs.map((job) => [job.id, job.rrule])),
    {
      "trending-tickers-open": "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=6;BYMINUTE=45",
      "trending-tickers-close": "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=13;BYMINUTE=15",
      "market-briefs-daily": "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=7;BYMINUTE=0",
      "market-scanners-open": "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=7;BYMINUTE=20",
      "market-scanners-close": "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=13;BYMINUTE=30",
      "economic-data-mwf": "FREQ=WEEKLY;BYDAY=MO,WE,FR;BYHOUR=7;BYMINUTE=40",
      "options-flow-daily": "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=10;BYMINUTE=0",
      "insider-trades-weekly": "FREQ=WEEKLY;BYDAY=FR;BYHOUR=13;BYMINUTE=45"
    }
  );
  for (const job of jobRegistry.jobs) await access(resolve(LEGACY_AUTOMATION_ROOT, job.promptFile));
});

test("legacy fixture export preserves activation and paused-job guards", async () => {
  const definitions = await exportPausedJobDefinitions(LEGACY_AUTOMATION_ROOT);
  assert.equal(definitions.length, 8);
  const openingScanner = definitions.find(
    (definition) => definition.metadata.chartChampJobId === "market-scanners-open"
  );
  assert.equal(openingScanner.status, "ACTIVE");
  assert.equal(openingScanner.metadata.deliveryMode, "live");
  assert.match(openingScanner.prompt, /dryRun: false/);
  assert.match(openingScanner.prompt, /TRENDSPIDER_SESSION_CONFLICT/);
  assert.match(openingScanner.prompt, /<@&1498152387154542733>/);

  const marketBrief = definitions.find(
    (definition) => definition.metadata.chartChampJobId === "market-briefs-daily"
  );
  assert.equal(marketBrief.status, "PAUSED");
  assert.match(marketBrief.prompt, /<@&1498152504817483927>/);
  assert.match(marketBrief.prompt, /\*\*Macro & Rates\*\*/);
  assert.match(marketBrief.prompt, /no more than six bullets/);
  assert.match(marketBrief.prompt, /why it matters to the broader market/);
  assert.match(marketBrief.prompt, /TRENDSPIDER_SESSION_CONFLICT/);

  for (const definition of definitions.filter((entry) => entry !== openingScanner)) {
    assert.equal(definition.status, "PAUSED");
    assert.equal(definition.timezone, "America/Los_Angeles");
    assert.equal(definition.metadata.deliveryMode, "dry-run");
    assert.match(definition.prompt, /dryRun: true/);
    assert.match(definition.prompt, /Do not type into Discord/);
  }
});

test("legacy fixture schedule manifest covers all channels and locks scanner rotation", async () => {
  const { schedules } = await loadAutomationConfig(LEGACY_AUTOMATION_ROOT);
  assert.equal(schedules.deliverySchedules.length, 7);
  assert.deepEqual(
    schedules.deliverySchedules.find((entry) => entry.channel === "public-portfolio").times,
    ["06:35", "13:05"]
  );
  assert.deepEqual(
    schedules.deliverySchedules.find((entry) => entry.channel === "market-scanners").times,
    ["07:20"]
  );
  assert.deepEqual(schedules.scannerRotation.opening.everyRun, [
    "Weinstein Stage 2",
    "Minervini VCP Base Breakout",
    "Darvas Box Breakout"
  ]);
  assert.deepEqual(schedules.scannerRotation.closing.tuesdayThursday, [
    "Trend Template Perfect Score"
  ]);
  assert.deepEqual(schedules.scannerRotation.closing.mondayWednesdayFriday, ["CAN SLIM NYSE"]);
  assert.deepEqual(schedules.scannerRotation.closing.fridayOnly, ["Quality Compounder"]);
});

// Retirement is deliberate; fixture recovery must never revive the live registry.
test("production automation manifests remain retired", async () => {
  await assert.rejects(loadAutomationConfig(), { code: "ENOENT" });
});
