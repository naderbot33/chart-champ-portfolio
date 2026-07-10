const REQUEST_TIMEOUT_MS = 15000;

function requestSignal() {
  return typeof AbortSignal.timeout === "function"
    ? AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    : undefined;
}

async function responseError(response, operation) {
  const detail = (await response.text()).slice(0, 300).replace(/https:\/\/\S+/g, "[redacted-url]");
  return new Error(`${operation} failed with HTTP ${response.status}${detail ? `: ${detail}` : ""}`);
}

export async function readWebhookMetadata(webhookUrl, { fetchImpl = fetch } = {}) {
  const response = await fetchImpl(webhookUrl, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal: requestSignal()
  });
  if (!response.ok) throw await responseError(response, "Webhook metadata check");
  const body = await response.json();
  return {
    id: body.id ? String(body.id) : null,
    channelId: body.channel_id ? String(body.channel_id) : null,
    guildId: body.guild_id ? String(body.guild_id) : null,
    name: body.name || null
  };
}

export async function verifyWebhookBinding(
  webhookUrl,
  { channelId, guildId, webhookName },
  { fetchImpl = fetch } = {}
) {
  const metadata = await readWebhookMetadata(webhookUrl, { fetchImpl });
  const issues = [];
  if (metadata.channelId !== channelId) issues.push("WEBHOOK_CHANNEL_MISMATCH");
  if (guildId && metadata.guildId !== guildId) issues.push("WEBHOOK_GUILD_MISMATCH");
  if (webhookName && metadata.name !== webhookName) issues.push("WEBHOOK_NAME_MISMATCH");
  return { ok: issues.length === 0, issues, metadata };
}

export async function postDiscordWebhook(webhookUrl, content, { fetchImpl = fetch } = {}) {
  const target = new URL(webhookUrl);
  target.searchParams.set("wait", "true");
  const response = await fetchImpl(target.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
    signal: requestSignal()
  });
  if (!response.ok) throw await responseError(response, "Discord delivery");
  const body = await response.json();
  if (!body.id) throw new Error("Discord delivery succeeded without a message id.");
  return { messageId: String(body.id), channelId: String(body.channel_id || "") };
}
