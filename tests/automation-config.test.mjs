import test from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import {
  AUTOMATION_ROOT,
  exportPausedJobDefinitions,
  loadAutomationConfig
} from "../automation/lib/config.mjs";
import { resolve } from "node:path";

test("registry has the seven exact ChartChamp destinations", async () => {
  const { channelRegistry } = await loadAutomationConfig();
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
});

test("all eight browser definitions are paused dry runs with Pacific RRULEs", async () => {
  const { jobRegistry } = await loadAutomationConfig();
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
  for (const job of jobRegistry.jobs) await access(resolve(AUTOMATION_ROOT, job.promptFile));
});

test("expanded job definitions remain paused and force no-send prompts", async () => {
  const definitions = await exportPausedJobDefinitions();
  assert.equal(definitions.length, 8);
  for (const definition of definitions) {
    assert.equal(definition.status, "PAUSED");
    assert.equal(definition.timezone, "America/Los_Angeles");
    assert.equal(definition.metadata.deliveryMode, "dry-run");
    assert.match(definition.prompt, /dryRun: true/);
    assert.match(definition.prompt, /Do not type into Discord/);
  }
});

test("schedule manifest covers all channels and locks scanner rotation", async () => {
  const { schedules } = await loadAutomationConfig();
  assert.equal(schedules.deliverySchedules.length, 7);
  assert.deepEqual(
    schedules.deliverySchedules.find((entry) => entry.channel === "public-portfolio").times,
    ["06:35", "13:05"]
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
