# ChartChamp delivery automation

This directory is the source of truth for seven ChartChamp destinations and eight browser-backed schedules. Every browser job is intentionally `PAUSED` and every prompt forces `dryRun: true` until the user approves the seven live-source samples.

## Safety model

- A draft contains exactly `channelId`, `generatedAt`, `sourceTimestamp`, `content`, `dedupeKey`, and `dryRun`.
- Validation runs before Keychain access or network delivery. It rejects stale sources/drafts, duplicate keys, closed-market runs, messages over 1,900 characters, missing source-verification flags, low Sidekick allowance, scanner warnings, and disconnected Chrome state.
- Dry runs append a hash-only audit record; they never read a webhook credential and never call Discord.
- Live delivery has two independent locks: the CLI must receive `--allow-send` and `CHARTCHAMP_ENABLE_DELIVERY` must equal `1`.
- A live attempt reads the channel-specific URL from macOS Keychain service `chartchamp-discord-webhook`, verifies read-only Discord webhook metadata against the configured guild/channel/name, and only then posts with `wait=true`.
- Logs never contain content or webhook URLs. Successful rows retain timestamp, source timestamp, content hash, result, and Discord message id. Duplicate state is written only after Discord returns a message id.
- Runtime drafts, contexts, logs, and dedupe state live in `automation/runtime/`, whose nested `.gitignore` keeps them out of source control.

## Configuration

- `channels.json`: exact ChartChamp guild/channel IDs, Keychain accounts, and content limits.
- `schedules.json`: all seven channel schedules and the scanner rotation in Pacific local time.
- `jobs.json`: eight paused Codex job definitions, RRULEs, models, and fail-closed validation policies.
- `prompts/`: complete source-gathering instructions for each job.

`node scripts/export-paused-automations.mjs` emits fully expanded paused definitions without creating jobs. `node scripts/verify-discord-webhooks.mjs` performs metadata-only binding checks after the webhooks and Keychain items have been created; it does not send a message.

For a no-send dispatch test:

```sh
node scripts/dispatch-discord-draft.mjs \
  --job trending-tickers-open \
  --input automation/runtime/drafts/trending-open.json \
  --context automation/runtime/contexts/trending-open.json \
  --dry-run
```

Do not add webhook URLs to files, shell history, logs, job prompts, or GitHub. Only the portfolio webhook is later mirrored to an encrypted GitHub secret for the portfolio workflow.
