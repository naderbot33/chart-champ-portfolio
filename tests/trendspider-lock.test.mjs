import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  acquireTrendSpiderLock,
  releaseTrendSpiderLock
} from "../automation/lib/trendspider-lock.mjs";

test("TrendSpider lock is exclusive and token-protected", async () => {
  const root = await mkdtemp(join(tmpdir(), "trendspider-lock-"));
  const lockDir = join(root, "lock");
  const now = () => new Date("2026-07-10T14:00:00.000Z");
  const first = await acquireTrendSpiderLock({ lockDir, now, token: "first" });
  const second = await acquireTrendSpiderLock({ lockDir, now, token: "second" });
  assert.equal(first.acquired, true);
  assert.deepEqual(second, {
    acquired: false,
    recovered: false,
    reason: "TRENDSPIDER_BUSY"
  });
  assert.deepEqual(await releaseTrendSpiderLock({ lockDir, token: "wrong" }), {
    released: false,
    reason: "LOCK_TOKEN_MISMATCH"
  });
  assert.deepEqual(await releaseTrendSpiderLock({ lockDir, token: "first" }), {
    released: true
  });
});

test("TrendSpider lock recovers an expired lease", async () => {
  const root = await mkdtemp(join(tmpdir(), "trendspider-stale-lock-"));
  const lockDir = join(root, "lock");
  await acquireTrendSpiderLock({
    lockDir,
    now: () => new Date("2026-07-10T13:00:00.000Z"),
    token: "stale",
    leaseMs: 60_000
  });
  const recovered = await acquireTrendSpiderLock({
    lockDir,
    now: () => new Date("2026-07-10T13:02:00.000Z"),
    token: "fresh",
    leaseMs: 60_000
  });
  assert.equal(recovered.acquired, true);
  assert.equal(recovered.recovered, true);
  assert.equal(recovered.token, "fresh");
  assert.deepEqual(await releaseTrendSpiderLock({ lockDir, token: "fresh" }), {
    released: true
  });
});

test("only one contender can recover the same expired lease", async () => {
  const root = await mkdtemp(join(tmpdir(), "trendspider-race-lock-"));
  const lockDir = join(root, "lock");
  await acquireTrendSpiderLock({
    lockDir,
    now: () => new Date("2026-07-10T13:00:00.000Z"),
    token: "stale",
    leaseMs: 60_000
  });
  const now = () => new Date("2026-07-10T13:02:00.000Z");
  const results = await Promise.all([
    acquireTrendSpiderLock({ lockDir, now, token: "contender-a", leaseMs: 60_000 }),
    acquireTrendSpiderLock({ lockDir, now, token: "contender-b", leaseMs: 60_000 })
  ]);
  assert.equal(results.filter((result) => result.acquired).length, 1);
  assert.equal(results.filter((result) => !result.acquired).length, 1);
  const winner = results.find((result) => result.acquired);
  assert.deepEqual(await releaseTrendSpiderLock({ lockDir, token: winner.token }), {
    released: true
  });
});
