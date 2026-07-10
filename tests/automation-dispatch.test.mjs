import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { dispatchDraft } from "../automation/lib/dispatch.mjs";

const NOW = new Date("2026-07-10T13:46:00.000Z");
const context = {
  chrome: { connected: true, extensionAvailable: true, signedIn: { yahoo: true } },
  market: { sessionDate: "2026-07-10" },
  source: { itemCount: 1, catalystsVerified: true }
};

function draft(overrides = {}) {
  return {
    channelId: "1495941558741106889",
    generatedAt: NOW.toISOString(),
    sourceTimestamp: "2026-07-10T13:42:00.000Z",
    content: "**Trending Tickers**\n• TEST — verified catalyst.",
    dedupeKey: "trending-tickers:2026-07-10:open",
    dryRun: true,
    ...overrides
  };
}

test("dry run writes a hash-only log without Keychain or network access", async () => {
  const runtimeDir = await mkdtemp(join(tmpdir(), "chartchamp-dry-"));
  let keychainCalls = 0;
  let fetchCalls = 0;
  const result = await dispatchDraft({
    input: draft(),
    jobId: "trending-tickers-open",
    context,
    runtimeDir,
    keychainReader: async () => {
      keychainCalls += 1;
      throw new Error("must not run");
    },
    fetchImpl: async () => {
      fetchCalls += 1;
      throw new Error("must not run");
    },
    now: () => NOW
  });
  assert.equal(result.status, "dry-run");
  assert.equal(keychainCalls, 0);
  assert.equal(fetchCalls, 0);
  const log = JSON.parse((await readFile(join(runtimeDir, "dispatch-log.jsonl"), "utf8")).trim());
  assert.equal(log.result, "dry-run");
  assert.equal(log.sourceTimestamp, draft().sourceTimestamp);
  assert.equal(log.contentHash.length, 64);
  assert.equal(log.discordMessageId, null);
  assert.equal("content" in log, false);
});

test("non-dry run remains locked unless both activation latches are present", async () => {
  const runtimeDir = await mkdtemp(join(tmpdir(), "chartchamp-lock-"));
  let externalCalls = 0;
  const result = await dispatchDraft({
    input: draft({ dryRun: false }),
    jobId: "trending-tickers-open",
    context,
    runtimeDir,
    allowSend: true,
    deliveryEnabled: false,
    keychainReader: async () => {
      externalCalls += 1;
    },
    fetchImpl: async () => {
      externalCalls += 1;
    },
    now: () => NOW
  });
  assert.equal(result.status, "blocked");
  assert.deepEqual(result.reasonCodes, ["DELIVERY_LOCKED"]);
  assert.equal(externalCalls, 0);
});

test("mocked live delivery verifies metadata, records message id, and deduplicates", async () => {
  const runtimeDir = await mkdtemp(join(tmpdir(), "chartchamp-live-"));
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, method: options.method });
    if (options.method === "GET") {
      return {
        ok: true,
        json: async () => ({
          id: "999",
          channel_id: "1495941558741106889",
          guild_id: "1178077469505486868",
          name: "ChartChamp Market Bot"
        })
      };
    }
    return {
      ok: true,
      json: async () => ({ id: "777", channel_id: "1495941558741106889" })
    };
  };
  const options = {
    input: draft({ dryRun: false }),
    jobId: "trending-tickers-open",
    context,
    runtimeDir,
    allowSend: true,
    deliveryEnabled: true,
    keychainReader: async () => "https://discord.com/api/webhooks/999/not-a-real-token",
    fetchImpl,
    now: () => NOW
  };
  const first = await dispatchDraft(options);
  assert.equal(first.status, "sent");
  assert.equal(first.discordMessageId, "777");
  assert.deepEqual(calls.map((call) => call.method), ["GET", "POST"]);

  const ledger = JSON.parse(await readFile(join(runtimeDir, "dedupe.json"), "utf8"));
  assert.equal(ledger.delivered[draft().dedupeKey].discordMessageId, "777");
  const second = await dispatchDraft(options);
  assert.equal(second.status, "skipped");
  assert.ok(second.reasonCodes.includes("DUPLICATE"));
  assert.equal(calls.length, 2);
});

test("metadata mismatch prevents the mocked POST", async () => {
  const runtimeDir = await mkdtemp(join(tmpdir(), "chartchamp-binding-"));
  const methods = [];
  const result = await dispatchDraft({
    input: draft({ dryRun: false, dedupeKey: "binding-check" }),
    jobId: "trending-tickers-open",
    context,
    runtimeDir,
    allowSend: true,
    deliveryEnabled: true,
    keychainReader: async () => "https://discord.com/api/webhooks/999/not-a-real-token",
    fetchImpl: async (_url, options) => {
      methods.push(options.method);
      return {
        ok: true,
        json: async () => ({
          id: "999",
          channel_id: "000000000000000000",
          guild_id: "1178077469505486868",
          name: "ChartChamp Market Bot"
        })
      };
    },
    now: () => NOW
  });
  assert.equal(result.status, "webhook-mismatch");
  assert.ok(result.reasonCodes.includes("WEBHOOK_CHANNEL_MISMATCH"));
  assert.deepEqual(methods, ["GET"]);
});
