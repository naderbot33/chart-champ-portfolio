import { DRAFT_FIELDS, DISCORD_CONTENT_LIMIT, discordCharacterCount } from "./draft.mjs";
import { dateInTimeZone, isUsEquitySessionDate } from "./market-calendar.mjs";

const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

function issue(code, message) {
  return { code, message };
}

function parseTimestamp(value) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function validateDraftShape(draft, channel, issues) {
  const keys = Object.keys(draft).sort();
  const expected = [...DRAFT_FIELDS].sort();
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) {
    issues.push(issue("DRAFT_SHAPE", `Draft must contain exactly: ${DRAFT_FIELDS.join(", ")}.`));
  }
  if (!/^\d{17,20}$/.test(draft.channelId || "")) {
    issues.push(issue("CHANNEL_ID_INVALID", "channelId must be a Discord snowflake string."));
  }
  if (channel && draft.channelId !== channel.channelId) {
    issues.push(issue("CHANNEL_MISMATCH", `Draft targets ${draft.channelId}, expected ${channel.channelId}.`));
  }
  if (!draft.content || !draft.content.trim()) {
    issues.push(issue("MESSAGE_EMPTY", "Discord content cannot be empty."));
  }
  if (
    channel?.notificationRoleId &&
    !draft.content?.trimStart().startsWith(`<@&${channel.notificationRoleId}>`)
  ) {
    issues.push(
      issue(
        "ROLE_MENTION_MISSING",
        `Discord content must begin with the configured ${channel.key} notification role.`
      )
    );
  }
  if (
    draft.dryRun === false &&
    channel?.notificationRoleName &&
    !channel?.notificationRoleId
  ) {
    issues.push(
      issue(
        "ROLE_CONFIGURATION_MISSING",
        `Live delivery requires a verified role ID for @${channel.notificationRoleName}.`
      )
    );
  }
  const contentLimit = channel?.limits?.messageCharacters || DISCORD_CONTENT_LIMIT;
  const characterCount = discordCharacterCount(draft.content || "");
  if (characterCount > contentLimit) {
    issues.push(
      issue("MESSAGE_TOO_LONG", `Discord content has ${characterCount} characters; limit is ${contentLimit}.`)
    );
  }
  if (!draft.dedupeKey || typeof draft.dedupeKey !== "string") {
    issues.push(issue("DEDUPE_KEY_MISSING", "dedupeKey is required."));
  }
  if (typeof draft.dryRun !== "boolean") {
    issues.push(issue("DRY_RUN_INVALID", "dryRun must be a boolean."));
  }
}

function validateFreshness(draft, validation, defaults, now, issues) {
  const generatedAt = parseTimestamp(draft.generatedAt);
  const sourceTimestamp = parseTimestamp(draft.sourceTimestamp);
  if (generatedAt === null || sourceTimestamp === null) {
    issues.push(issue("TIMESTAMP_INVALID", "generatedAt and sourceTimestamp must be valid timestamps."));
    return;
  }
  const ageMs = generatedAt - sourceTimestamp;
  if (ageMs < -FUTURE_TOLERANCE_MS) {
    issues.push(issue("SOURCE_FROM_FUTURE", "sourceTimestamp is more than five minutes after generatedAt."));
  }
  const freshnessMinutes = validation.freshnessMinutes;
  if (Number.isFinite(freshnessMinutes) && ageMs > freshnessMinutes * 60 * 1000) {
    issues.push(
      issue("SOURCE_STALE", `Source is ${Math.floor(ageMs / 60000)} minutes old; limit is ${freshnessMinutes}.`)
    );
  }
  const currentAgeMs = now().getTime() - generatedAt;
  if (currentAgeMs < -FUTURE_TOLERANCE_MS) {
    issues.push(issue("DRAFT_FROM_FUTURE", "generatedAt is more than five minutes in the future."));
  }
  const draftFreshnessMinutes = defaults.draftFreshnessMinutes ?? 15;
  if (currentAgeMs > draftFreshnessMinutes * 60 * 1000) {
    issues.push(
      issue(
        "DRAFT_STALE",
        `Draft is ${Math.floor(currentAgeMs / 60000)} minutes old; limit is ${draftFreshnessMinutes}.`
      )
    );
  }
}

function validateChrome(validation, context, issues) {
  if (context.chrome?.connected !== true) {
    issues.push(issue("CHROME_DISCONNECTED", "Chrome control is not connected."));
  }
  if (context.chrome?.extensionAvailable !== true) {
    issues.push(issue("EXTENSION_UNAVAILABLE", "The Codex Chrome extension is not available."));
  }
  for (const site of validation.requiredSites || []) {
    if (context.chrome?.signedIn?.[site] !== true) {
      issues.push(issue("SITE_NOT_SIGNED_IN", `Required Chrome site is not signed in: ${site}.`));
    }
  }
}

function validateMarket(draft, validation, context, timezone, issues) {
  if (!validation.marketDependent) return;
  let sessionDate = context.market?.sessionDate;
  try {
    const generatedDate = dateInTimeZone(draft.generatedAt, timezone);
    sessionDate ||= generatedDate;
    if (sessionDate !== generatedDate) {
      issues.push(
        issue(
          "MARKET_DATE_MISMATCH",
          `market.sessionDate is ${sessionDate}, but generatedAt is ${generatedDate} in ${timezone}.`
        )
      );
    }
    const open = isUsEquitySessionDate(sessionDate, {
      additionalClosedDates: context.market?.additionalClosedDates,
      forcedOpenDates: context.market?.forcedOpenDates
    });
    if (!open && !(validation.allowClosedMarketWhenMaterial && context.market?.materialNonUs === true)) {
      issues.push(issue("MARKET_CLOSED", `${sessionDate} is not a U.S. equity session.`));
    }
  } catch (error) {
    issues.push(issue("MARKET_DATE_INVALID", error.message));
  }
}

function validateSource(validation, context, issues) {
  const source = context.source || {};
  for (const [field, maximum] of Object.entries(validation.sourceMaximums || {})) {
    const value = source[field];
    if (!Number.isInteger(value) || value < 0) {
      issues.push(issue("SOURCE_COUNT_MISSING", `source.${field} must be a non-negative integer.`));
    } else if (value > maximum) {
      issues.push(issue("SOURCE_LIMIT", `source.${field} is ${value}; maximum is ${maximum}.`));
    }
  }
  for (const flag of validation.requiredSourceFlags || []) {
    if (source[flag] !== true) {
      issues.push(issue("SOURCE_FLAG_MISSING", `Required source flag is not true: ${flag}.`));
    }
  }
}

function validateSidekick(validation, defaults, context, issues) {
  if (!validation.requiresSidekick) return;
  const remaining = context.sidekick?.messagesRemaining;
  if (!Number.isInteger(remaining) || remaining < 0) {
    issues.push(issue("SIDEKICK_STATE_MISSING", "Sidekick messagesRemaining must be read from the UI."));
    return;
  }
  const estimated = validation.estimatedSidekickMessages || 1;
  const minimum = defaults.sidekickMinimumRemainingAfterRun;
  if (remaining - estimated < minimum) {
    issues.push(
      issue(
        "SIDEKICK_LIMIT",
        `Skipping: ${remaining} Sidekick messages remain and the ${estimated}-message run must preserve ${minimum}.`
      )
    );
  }
}

function validateTrendSpiderSession(validation, context, issues) {
  if (!validation.requiresTrendSpiderSession) return;
  if (context.trendspider?.tabCount !== 1) {
    issues.push(
      issue(
        "TRENDSPIDER_SESSION_CONFLICT",
        "Exactly one TrendSpider Chrome tab must be active for this dispatch."
      )
    );
  }
}

function validateScanner(validation, context, issues) {
  if (!validation.requiresScannerSafety) return;
  if (context.scanner?.unsavedChangesWarning !== false) {
    issues.push(issue("SCANNER_WARNING", "Scanner has an unsaved-changes warning or its warning state is unknown."));
  }
  if (context.scanner?.savedOrSubscribedOnly !== true) {
    issues.push(issue("SCANNER_SOURCE_UNSAFE", "Scanner run was not confirmed as saved/subscribed-only."));
  }
  if (!Array.isArray(context.scanner?.scannersRun) || context.scanner.scannersRun.length === 0) {
    issues.push(issue("SCANNER_RUNS_MISSING", "The scanners actually run must be recorded."));
  }
  if (context.scanner?.trendspiderTabCount !== 1) {
    issues.push(
      issue(
        "TRENDSPIDER_SESSION_CONFLICT",
        "Exactly one TrendSpider Chrome tab must be active for a scanner dispatch."
      )
    );
  }
}

export function validateForDispatch({
  draft,
  job,
  channel,
  defaults = { sidekickMinimumRemainingAfterRun: 10 },
  context = {},
  seenDedupeKeys = new Set(),
  timezone = "America/Los_Angeles",
  now = () => new Date()
}) {
  const issues = [];
  const validation = job.validation || {};
  validateDraftShape(draft, channel, issues);
  validateFreshness(draft, validation, defaults, now, issues);
  if (seenDedupeKeys.has(draft.dedupeKey)) {
    issues.push(issue("DUPLICATE", `dedupeKey has already been delivered: ${draft.dedupeKey}.`));
  }
  validateChrome(validation, context, issues);
  validateMarket(draft, validation, context, timezone, issues);
  validateSource(validation, context, issues);
  validateSidekick(validation, defaults, context, issues);
  validateTrendSpiderSession(validation, context, issues);
  validateScanner(validation, context, issues);
  return { ok: issues.length === 0, issues };
}
