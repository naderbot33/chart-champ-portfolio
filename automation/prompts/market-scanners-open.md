Run the live ChartChamp opening market-scanners update from `/Users/naderizzle33/Documents/Codex/2026-07-10/i-have-discord-open-in-chrome/work/chart-champ-portfolio`. Confirm today is a U.S. equity session. Use only saved or subscribed scanners and stop immediately if an unsaved-changes warning appears. Never edit or save a scanner definition.

Before any browser action, use the bundled Node runtime at `/Users/naderizzle33/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node` to acquire `scripts/trendspider-browser-lock.mjs`. If the lock is held, skip and log `TRENDSPIDER_BUSY`; do not wait. Keep the returned token and release it in a `finally` step. The lease expires after 45 minutes so an abandoned run can recover safely.

While holding the lock, inspect the current Chrome profile. Reuse the existing TrendSpider tab when exactly one is open. If none is open, create exactly one TrendSpider tab in the same Chrome profile and sign-in session. If more than one is open, skip and log `TRENDSPIDER_SESSION_CONFLICT`; do not close tabs, open another profile, or continue. Record `scanner.trendspiderTabCount: 1` in the validator context.

Run Weinstein Stage 2, Minervini VCP Base Breakout, and Darvas Box Breakout. On Monday, Wednesday, and Friday also run Turtle Long Entry. Capture the actual result set and timestamp from every scanner. Then check the visible Sidekick allowance; if one prompt would leave fewer than 10 messages, skip and log `SIDEKICK_LIMIT`. Use one Sidekick prompt to analyze only the actual results. Select at most five bullish standouts based on observable setup evidence, liquidity, trend, and nearby invalidation risk. Scanner matches are not predictions; do not give buy or sell instructions. Keep the Discord content at or below 1,900 characters.

Create exactly `{channelId, generatedAt, sourceTimestamp, content, dedupeKey, dryRun}` for channel `1495962636016160778`, with `dryRun: false` and dedupe key `market-scanners-open:YYYY-MM-DD:open`. Context must include Chrome state, `chrome.signedIn.trendspider`, `sidekick.messagesRemaining`, market date, `scanner.unsavedChangesWarning: false`, `scanner.savedOrSubscribedOnly: true`, `scanner.trendspiderTabCount: 1`, the scanners actually run, `source.itemCount`, and `source.actualScannerResults: true`.

The content must follow this exact structure:

- First line: `<@&1498152387154542733>` so the configured `@SCANNERS` role is notified.
- Heading: `📡 **Bullish Scanner Standouts at Market Open — Weekday, Month Dth at h:mm AM/PM PT**`, using the real Pacific date and ordinal day.
- Next line: `**Scanners run:**` followed by the scanners actually run, separated by ` · `.
- If there is no cross-scan overlap, say so in one concise sentence.
- Up to five single-paragraph standouts formatted as `**TICKER $price (+0.00%)** — Scanner name. Concise setup evidence. **Support:** level(s). **Resistance:** level(s). One concrete risk caveat.`
- Use a true minus sign for negative changes, stay under 1,900 characters, and never give buy or sell instructions.

Write the draft and context under `automation/runtime/`, then run `CHARTCHAMP_ENABLE_DELIVERY=1 /Users/naderizzle33/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/dispatch-discord-draft.mjs --job market-scanners-open --input <draft-path> --context <context-path> --allow-send`. Never type the post into Discord or call the webhook directly. A validation failure, duplicate, stale source, market holiday, Sidekick limit, scanner warning, Chrome disconnection, lock conflict, or multiple TrendSpider tabs must skip delivery and log the reason.
