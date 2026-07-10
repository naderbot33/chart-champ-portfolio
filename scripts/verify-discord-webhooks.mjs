#!/usr/bin/env node
import { loadAutomationConfig } from "../automation/lib/config.mjs";
import { verifyWebhookBinding } from "../automation/lib/discord.mjs";
import { readWebhookFromKeychain } from "../automation/lib/keychain.mjs";

const { channelRegistry } = await loadAutomationConfig();
const results = [];

for (const channel of channelRegistry.channels) {
  try {
    const webhookUrl = await readWebhookFromKeychain({
      service: channelRegistry.keychainService,
      account: channel.keychainAccount
    });
    const check = await verifyWebhookBinding(webhookUrl, {
      channelId: channel.channelId,
      guildId: channelRegistry.guildId,
      webhookName: channelRegistry.webhookName
    });
    results.push({
      channel: channel.key,
      channelId: channel.channelId,
      ok: check.ok,
      issues: check.issues,
      webhookId: check.metadata.id
    });
  } catch (error) {
    results.push({
      channel: channel.key,
      channelId: channel.channelId,
      ok: false,
      issues: ["WEBHOOK_METADATA_ERROR"],
      error: String(error.message || error).slice(0, 200)
    });
  }
}

process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
if (results.some((result) => !result.ok)) process.exitCode = 1;
