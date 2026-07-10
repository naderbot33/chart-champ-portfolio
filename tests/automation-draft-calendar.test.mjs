import test from "node:test";
import assert from "node:assert/strict";
import {
  DRAFT_FIELDS,
  createDedupeKey,
  discordCharacterCount,
  normalizeDraft
} from "../automation/lib/draft.mjs";
import {
  dateInTimeZone,
  isUsEquitySessionDate,
  usEquityHolidays
} from "../automation/lib/market-calendar.mjs";

test("draft normalization returns exactly the locked schema and defaults safe", () => {
  const draft = normalizeDraft(
    {
      channelId: 1495941558741106889n,
      sourceTimestamp: "2026-07-10T13:40:00.000Z",
      content: "Line one\r\nLine two"
    },
    { now: () => new Date("2026-07-10T13:45:00.000Z") }
  );
  assert.deepEqual(Object.keys(draft), DRAFT_FIELDS);
  assert.equal(draft.channelId, "1495941558741106889");
  assert.equal(draft.generatedAt, "2026-07-10T13:45:00.000Z");
  assert.equal(draft.content, "Line one\nLine two");
  assert.equal(draft.dryRun, true);
  assert.equal(
    draft.dedupeKey,
    createDedupeKey({
      channelId: draft.channelId,
      sourceTimestamp: draft.sourceTimestamp,
      content: draft.content
    })
  );
});

test("Discord character counter handles Unicode code points", () => {
  assert.equal(discordCharacterCount("A📈B"), 3);
});

test("market calendar recognizes weekends, observed holidays, and normal sessions", () => {
  assert.equal(isUsEquitySessionDate("2026-07-11"), false);
  assert.equal(isUsEquitySessionDate("2026-07-03"), false);
  assert.equal(isUsEquitySessionDate("2026-07-10"), true);
  assert.equal(usEquityHolidays(2026).has("2026-11-26"), true);
  assert.equal(isUsEquitySessionDate("2026-07-10", { additionalClosedDates: ["2026-07-10"] }), false);
  assert.equal(isUsEquitySessionDate("2026-07-11", { forcedOpenDates: ["2026-07-11"] }), true);
});

test("Pacific date conversion is DST-aware", () => {
  assert.equal(dateInTimeZone("2026-07-10T06:30:00.000Z"), "2026-07-09");
  assert.equal(dateInTimeZone("2026-01-10T07:30:00.000Z"), "2026-01-09");
});
