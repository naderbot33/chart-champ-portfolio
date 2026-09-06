# September 6, 2026 — dated closing-price refresh

## Published result

The user approved a portfolio refresh after the September 6 community cleanup.
The site now contains September 4 regular-session closing quotes, replacing
that day's 9:34 AM PT intraday snapshot. This is a manual, explicitly dated
historical-close publication, not a scheduled release or live Sunday pricing.

- Source: existing Yahoo Finance chart endpoint, `interval=1d`,
  `includePrePost=false`, `events=div,splits`.
- Retrieved: `2026-09-06T16:03:43.337Z`.
- Quote source times: `2026-09-04T20:00:00.000Z` through
  `2026-09-04T20:01:10.000Z` (1:00:00–1:01:10 PM Pacific).
- Coverage: all nine open holdings (AAPL, NFLX, PLTR, MSFT, META, BABA, TSM,
  NVO, TQQQ) plus SPY; zero failed/stale quotes. Each fresh series has 252
  distinct daily observations. The one-year query rolled off September 4,
  2025; the June 25, 2026 chart baseline was unaffected.
- ORCL's closed-position quote history was preserved. No shares, fills,
  pending orders, cash, cost basis, realized profit, or setup outcomes changed.
- The [NYSE calendar](https://www.nyse.com/trade/hours-calendars) lists the
  September 7 Labor Day closure. September 4 is the last completed regular
  session for this September 6 update.

## Data-quality fix

`scripts/update-quotes.mjs` previously labeled the snapshot using the retrieval
clock. It now derives the session from the oldest current holding's source
timestamp, so Friday-close quotes retrieved on Sunday remain labeled `close`.
The exported labeling function rejects missing/invalid source times, and
importing the module does not fetch quotes or write files.

New tests cover the Friday-close label, Eastern summer/winter time, intraday
labels, missing timestamps, and invalid timestamps. No new dependencies or
automated schedules were introduced.

## Verification

- `node scripts/update-quotes.mjs`: nine fresh open holdings, SPY available,
  closed ORCL series retained; successful exit.
- `node scripts/validate-portfolio-snapshot.mjs --strict --session close
  --log runtime/portfolio-sunday-close-check.json`: `snapshotValid: true`,
  `shouldProceed: false`, weekend `skipped`, no warnings. This accurately
  preserves the normal current-session guard; it was not used as permission
  to run a scheduled release.
- `node scripts/validate-portfolio-snapshot.mjs --strict --session close
  --now 2026-09-04T20:10:00.000Z --max-age-minutes 15
  --log runtime/portfolio-friday-close-validation.json`: historical
  as-of-close audit passed, no warnings. The supplied Friday audit clock is
  not a claim that validation occurred Friday or that quotes are live Sunday.
- Additional read-only checks passed: expected ticker coverage, positive
  prices, no stale records, close timestamps, unique history dates, each last
  history close equals the displayed quote, previous close equals the preceding
  daily observation, and exact JSON/JavaScript snapshot parity.
- `node --test tests/*.test.mjs`: 95 passed, 0 failed.
- `node scripts/build-site.mjs`: 125-file allowlisted public build; dated
  source timestamp retained. No private runtime or local portfolio-lab files.
- Firebase target readback: `projects/dailystockpick/sites/chartchamp` at
  `https://chartchamp.web.app`. Only that Hosting site was deployed.
- Manual deployment of the validated staged build completed successfully.
  All 125 remote file hashes matched at `2026-09-06T16:08:42.670Z`; public
  data files retained fail-safe cache headers and exact source/retrieval times.
- No new browser visual QA was performed for this data-only update. The Mac
  was locked; prior design-release visual QA is not a new test result.

## Subsequent same-day setup source recovery

Nine exact missing bodies were subsequently recovered from retained pre-send
drafts. Root independently normalized each body, restored its original role
prefix, and reproduced the full SHA-256 in both its reservation and successful
HTTP 200 delivery receipt. The message ID, channel, and permalink also matched.

- August 20: COIN (day), NDSN (swing), WMT (long term).
- August 21: BJ (day), ROST (swing), V (long term).
- August 24: STZ (day), CLF (swing), AXON (long term).

`data/discord-research-sync.js` now imports these original plans with exact buy,
stop, targets, technical/fundamental rationale, risk/reward, source body, source
link, and receipt hash. Three chart URLs actually present in the source bodies
were retained; no charts were invented for the other six. All nine are
`REVIEW_PENDING` / `UNKNOWN`, explicitly historical, and not portfolio holdings.
The exact recovery method and lack of fresh native Discord readback are retained.

The journal has 39 records: 38 need lifecycle follow-up, while the previously
resolved AMLX invalidation remains unchanged. Recovery of source text does not
establish a fill, stop, target hit, or win rate. Research dates stay September 4;
setup source verification has its own September 6 timestamp.

Additional verification: all 96 tests passed, including source hash reproduction,
verbatim field matching, idempotent identities, preserved portfolio data, and
no inferred trade-execution fields. All nine new static pages were checked for
their source links and unverified-outcome labels. The 134-file public build was
deployed only to chartchamp, and every remote file hash matched at
`2026-09-06T16:17:07.330Z`. Friday closing quote timestamps remained unchanged.

The source queue and full exact bodies are preserved in the Discord Automations
project at `research/2026-09-06-setup-source-readback-queue.md`.

## Remaining work and no-send boundary

Outcome follow-ups, Discord instruction edits, detailed archive/VIP checks,
and naturally arriving RSS delivery verification remain pending Mac unlock in the
Discord Automations project. No test, announcement, replay, or other Discord
message was sent. The combined announcement remains a separate draft.
