import assert from "node:assert/strict";
import test from "node:test";
import { sessionLabel } from "../scripts/update-quotes.mjs";

test("a Friday closing quote stays labeled close when retrieved on a weekend", () => {
  assert.equal(sessionLabel("2026-09-04T20:00:00.000Z"), "close");
});

test("session labels follow quote source time in New York, including DST", () => {
  assert.equal(sessionLabel("2026-09-04T16:34:00.000Z"), "intraday");
  assert.equal(sessionLabel("2026-09-04T13:45:00.000Z"), "morning");
  assert.equal(sessionLabel("2026-09-04T12:00:00.000Z"), "pre-market");
  assert.equal(sessionLabel("2026-12-04T21:00:00.000Z"), "close");
});

test("an invalid source time cannot silently become a current session label", () => {
  assert.throws(() => sessionLabel("not-a-date"), /source timestamp is invalid/u);
  assert.throws(() => sessionLabel(undefined), /source timestamp is invalid/u);
  assert.throws(() => sessionLabel(null), /source timestamp is invalid/u);
  assert.throws(() => sessionLabel(""), /source timestamp is invalid/u);
});
