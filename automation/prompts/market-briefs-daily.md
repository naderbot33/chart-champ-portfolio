Run the paused ChartChamp global market-brief dry run from `/Users/naderizzle33/Documents/Codex/2026-07-10/i-have-discord-open-in-chrome/work/chart-champ-portfolio`. Confirm the Pacific date and whether the U.S. equity market is open. On a U.S. market holiday, continue only if material non-U.S. or global information exists.

Before any browser action, use `/Users/naderizzle33/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/trendspider-browser-lock.mjs acquire`. If the lock is held, skip and log `TRENDSPIDER_BUSY`; do not wait. Keep the returned token and release it in a `finally` step.

While holding the lock, inspect the RealChartChamp Chrome profile. Reuse the existing TrendSpider tab when exactly one is open. If none is open, create exactly one in that same profile and sign-in session. If more than one is open, skip and log `TRENDSPIDER_SESSION_CONFLICT`; do not close tabs or create another session. Record `trendspider.tabCount: 1` in the validator context.

Read the visible Sidekick message allowance before asking anything. If one prompt would leave fewer than 10 messages, skip and log `SIDEKICK_LIMIT`. Ask Sidekick once for a concise, current brief focused on what is affecting markets: major news, macro releases and surprises, central-bank or policy developments, rates and FX moves, geopolitical spillovers, earnings and corporate catalysts, commodities, and crypto. Keep only material information, normally no more than six bullets total. Cross-check time-sensitive claims against an authoritative source where practical, record the verification in the runtime context and audit log, and separate facts from inference. Do not provide personalized advice, predictions, or filler.

Create exactly `{channelId, generatedAt, sourceTimestamp, content, dedupeKey, dryRun}` for channel `1495941654828548156`, with `dryRun: true` and dedupe key `market-briefs-daily:YYYY-MM-DD:sample`. Context must include Chrome state, `chrome.signedIn.trendspider`, `trendspider.tabCount: 1`, `sidekick.messagesRemaining`, `market.sessionDate`, `market.materialNonUs`, `source.itemCount`, `source.materialItemsOnly: true`, and `source.timeSensitiveClaimsCrossChecked: true`.

The Discord content must follow this exact structure:

- First line: `<@&1498152504817483927>` so Discord renders the verified `@BRIEFS` role ping. Keep the schedule paused until the user approves the test format.
- Heading: `🌎 **Global Market Brief — Weekday, Month Dth at h:mm AM/PM PT**`, using the real Pacific date and ordinal day.
- Use only material sections, in this order: `**Stocks**`, `**Macro & Rates**`, `**Commodities**`, `**Crypto**`, and `**What Matters Next**`. FX belongs under `**Macro & Rates**`; scheduled macro releases and earnings belong under `**What Matters Next**`.
- Under each included header, use one or two `•` bullets. Keep no more than six bullets across the entire post and omit a section when there is no meaningful driver.
- Start each bullet with a short bold driver label, then explain what happened and why it matters to the broader market. Prices and percentage moves support the explanation; they are not the brief by themselves.
- Prioritize causal context and transmission: for example, how yields affect growth stocks, how oil headlines affect inflation expectations, or how a major earnings report could set the tone for a sector.
- End after the final `**What Matters Next**` bullet. Do not include a source line, verification note, disclaimer, or other footer in the public Discord post.
- Stay at or below 1,900 characters.

Write the draft and context under `automation/runtime/`, then run `/Users/naderizzle33/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/dispatch-discord-draft.mjs --job market-briefs-daily --input <draft-path> --context <context-path> --dry-run`. Do not type into Discord, call a webhook directly, change `dryRun`, or activate the schedule. A validation failure, duplicate, stale source, Sidekick limit, Chrome disconnection, lock conflict, or multiple TrendSpider tabs must skip the sample and log the reason.
