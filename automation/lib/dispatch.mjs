import { resolve } from "node:path";
import { AUTOMATION_ROOT, findChannel, findJob, loadAutomationConfig } from "./config.mjs";
import { contentHash, normalizeDraft } from "./draft.mjs";
import { postDiscordWebhook, verifyWebhookBinding } from "./discord.mjs";
import { readWebhookFromKeychain } from "./keychain.mjs";
import {
  appendDispatchLog,
  deliveredKeys,
  loadDedupeLedger,
  recordDelivery
} from "./storage.mjs";
import { validateForDispatch } from "./validate.mjs";

function safeResult({ status, draft, jobId, hash, issues = [], messageId = null }) {
  return {
    status,
    jobId,
    channelId: draft.channelId,
    dedupeKey: draft.dedupeKey,
    contentHash: hash,
    reasonCodes: issues.map((entry) => entry.code || entry),
    discordMessageId: messageId
  };
}

export async function dispatchDraft({
  input,
  jobId,
  context,
  automationRoot = AUTOMATION_ROOT,
  runtimeDir = resolve(automationRoot, "runtime"),
  allowSend = false,
  deliveryEnabled = process.env.CHARTCHAMP_ENABLE_DELIVERY === "1",
  keychainReader = readWebhookFromKeychain,
  fetchImpl = fetch,
  now = () => new Date()
}) {
  const { channelRegistry, jobRegistry } = await loadAutomationConfig(automationRoot);
  const job = findJob(jobRegistry, jobId);
  if (!job) throw new Error(`Unknown ChartChamp job: ${jobId}`);
  const channel = findChannel(channelRegistry, job.channel);
  if (!channel) throw new Error(`Unknown ChartChamp channel: ${job.channel}`);

  const draft = normalizeDraft(input, { now });
  const hash = contentHash(draft.content);
  const ledger = await loadDedupeLedger(runtimeDir);
  const validation = validateForDispatch({
    draft,
    job,
    channel,
    defaults: jobRegistry.defaults,
    context,
    seenDedupeKeys: deliveredKeys(ledger),
    timezone: jobRegistry.timezone,
    now
  });

  const baseLog = {
    timestamp: now().toISOString(),
    generatedAt: draft.generatedAt,
    sourceTimestamp: draft.sourceTimestamp,
    jobId,
    channelId: draft.channelId,
    dedupeKey: draft.dedupeKey,
    contentHash: hash,
    discordMessageId: null
  };

  if (!validation.ok) {
    await appendDispatchLog(runtimeDir, {
      ...baseLog,
      result: "skipped",
      reasonCodes: validation.issues.map((entry) => entry.code)
    });
    return safeResult({ status: "skipped", draft, jobId, hash, issues: validation.issues });
  }

  if (draft.dryRun) {
    await appendDispatchLog(runtimeDir, { ...baseLog, result: "dry-run", reasonCodes: [] });
    return safeResult({ status: "dry-run", draft, jobId, hash });
  }

  if (!allowSend || !deliveryEnabled) {
    const issues = [{ code: "DELIVERY_LOCKED" }];
    await appendDispatchLog(runtimeDir, {
      ...baseLog,
      result: "blocked",
      reasonCodes: issues.map((entry) => entry.code)
    });
    return safeResult({ status: "blocked", draft, jobId, hash, issues });
  }

  try {
    const webhookUrl = await keychainReader({
      service: channelRegistry.keychainService,
      account: channel.keychainAccount
    });
    const binding = await verifyWebhookBinding(
      webhookUrl,
      {
        channelId: channel.channelId,
        guildId: channelRegistry.guildId,
        webhookName: channelRegistry.webhookName
      },
      { fetchImpl }
    );
    if (!binding.ok) {
      const issues = binding.issues.map((code) => ({ code }));
      await appendDispatchLog(runtimeDir, {
        ...baseLog,
        result: "webhook-mismatch",
        reasonCodes: binding.issues
      });
      return safeResult({ status: "webhook-mismatch", draft, jobId, hash, issues });
    }

    const delivery = await postDiscordWebhook(webhookUrl, draft.content, { fetchImpl });
    if (delivery.channelId && delivery.channelId !== channel.channelId) {
      throw new Error("Discord response channel id did not match the configured channel.");
    }
    const deliveredAt = now().toISOString();
    await recordDelivery(runtimeDir, draft.dedupeKey, {
      deliveredAt,
      jobId,
      channelId: channel.channelId,
      sourceTimestamp: draft.sourceTimestamp,
      contentHash: hash,
      discordMessageId: delivery.messageId
    });
    await appendDispatchLog(runtimeDir, {
      ...baseLog,
      timestamp: deliveredAt,
      result: "sent",
      discordMessageId: delivery.messageId,
      reasonCodes: []
    });
    return safeResult({
      status: "sent",
      draft,
      jobId,
      hash,
      messageId: delivery.messageId
    });
  } catch (error) {
    const issues = [{ code: "DELIVERY_ERROR" }];
    await appendDispatchLog(runtimeDir, {
      ...baseLog,
      result: "error",
      reasonCodes: ["DELIVERY_ERROR"],
      error: String(error.message || error).slice(0, 300)
    });
    return safeResult({ status: "error", draft, jobId, hash, issues });
  }
}
