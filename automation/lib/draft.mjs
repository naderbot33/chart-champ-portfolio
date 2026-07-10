import { createHash } from "node:crypto";

export const DISCORD_CONTENT_LIMIT = 1900;
export const DRAFT_FIELDS = Object.freeze([
  "channelId",
  "generatedAt",
  "sourceTimestamp",
  "content",
  "dedupeKey",
  "dryRun"
]);

export function contentHash(content) {
  return createHash("sha256").update(String(content), "utf8").digest("hex");
}

export function createDedupeKey({ channelId, sourceTimestamp, content }) {
  return `${channelId}:${sourceTimestamp}:${contentHash(content).slice(0, 16)}`;
}

export function normalizeDraft(input, { now = () => new Date() } = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Draft input must be an object.");
  }

  const channelId = String(input.channelId ?? "").trim();
  const generatedAt = input.generatedAt || now().toISOString();
  const sourceTimestamp = String(input.sourceTimestamp ?? "").trim();
  const content = String(input.content ?? "").replace(/\r\n?/g, "\n").trim();
  const dedupeKey = String(
    input.dedupeKey || createDedupeKey({ channelId, sourceTimestamp, content })
  ).trim();
  const dryRun = input.dryRun !== false;

  return {
    channelId,
    generatedAt,
    sourceTimestamp,
    content,
    dedupeKey,
    dryRun
  };
}

export function discordCharacterCount(content) {
  return Array.from(String(content)).length;
}
