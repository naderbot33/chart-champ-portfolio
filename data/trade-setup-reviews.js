/*
 * Chart Champ — AI trade setup review journal
 *
 * These are educational setup reviews, not portfolio holdings, orders, fills,
 * or performance records. Keep this dataset isolated from portfolio math.
 */
window.TRADE_SETUP_REVIEWS = {
  schemaVersion: 1,
  updatedAt: "2026-08-19T20:27:00-07:00",
  reviews: [
    {
      id: "2026-08-19-tgt-day",
      date: "2026-08-19",
      reviewedAt: "2026-08-19T20:22:51-07:00",
      ticker: "TGT",
      horizon: "Day trade",
      direction: "Long",
      statusCode: "TRIGGERED",
      statusLabel: "Triggered — unresolved at close",
      setup: {
        entryCondition:
          "Buy at $160.50 only after a new completed five-minute close above it and a subsequent retest of $160.00 that holds before 10:30 AM PT; maximum entry $160.75.",
        entryZone: "$160.50 after confirmation; maximum $160.75",
        preEntryInvalidation: "$158.50 trades first, or no confirmation by 10:30 AM PT",
        plannedStopAfterEntry: "$158.50",
        takeProfitLevels: ["$163.50", "$166.50"]
      },
      rationale: {
        technicals:
          "TGT reversed an earnings gap-down from $146.21, reclaimed the prior $152.48 close, and held above session VWAP near $156.90. The setup required a fresh $160.50 close and $160.00 retest instead of chasing the reversal.",
        fundamentals:
          "Q2 net sales rose 5.3%, comparable sales grew 3.8%, traffic increased 3.6%, and Target raised its 2026 sales-growth outlook to about 5%. The $4.11 EPS included $1.65 from a one-time tariff refund, leaving margin follow-through as a risk."
      },
      outcome: {
        type: "OPEN_TRADE",
        summary:
          "The post-publication confirmation sequence completed and price subsequently traded back through the $160.50 entry. After the trigger, neither the $158.50 stop nor the $163.50 first target traded before the regular close. Because the original plan did not define a closing-bell exit, this review does not invent a closed result or P/L.",
        sequence: [
          "The setup was posted at 7:17 AM PT while TGT remained below the trigger.",
          "The 7:45 AM five-minute bar closed near $160.52, above the required $160.50 level.",
          "The 7:50 AM bar retested $160.00 without breaking it, and the 8:00 AM bar traded back through $160.50.",
          "After the trigger, the session traded between approximately $158.80 and $161.98 and closed near $159.00; neither stated exit level was reached."
        ]
      },
      lesson:
        "Every day-trade plan needs an explicit time-based exit. Without one, a valid trigger can finish the session between the stop and targets with no defensible closed outcome.",
      chartUrl: "https://www.tradingview.com/x/W1isJICm/"
    },
    {
      id: "2026-08-19-mrvl-swing",
      date: "2026-08-19",
      reviewedAt: "2026-08-19T20:22:51-07:00",
      ticker: "MRVL",
      horizon: "Swing trade",
      direction: "Long",
      statusCode: "WATCHING",
      statusLabel: "Watching — not triggered",
      setup: {
        entryCondition:
          "Buy at $240.50 only after one complete daily close inside $228–$234, followed by a later daily close above $240.50; do not chase above $242.",
        entryZone: "$228–$234 daily-close base, then $240.50 breakout",
        preEntryInvalidation: "A daily close at or below $222 before confirmation",
        plannedStopAfterEntry: "$222 daily close",
        takeProfitLevels: ["$277.50", "$314.50"]
      },
      rationale: {
        technicals:
          "MRVL was above its rising 20- and 200-day averages near $205 and $143 but below its 50-day average near $236. RSI near 70 and ATR near $17.43 supported waiting for a completed base instead of chasing the catalyst gap.",
        fundamentals:
          "Marvell disclosed an expanded Google custom-silicon agreement. Q1 revenue rose 28% to a record $2.418B and operating cash flow reached $638.8M. The warrant can dilute shareholders, and most vesting depends on discretionary Google purchases."
      },
      outcome: {
        type: "NO_TRADE",
        summary:
          "MRVL had not produced the required first daily close inside $228–$234 by the August 19 close, so the setup remained watch-only with no entry or portfolio result.",
        sequence: [
          "Price traded intraday as low as approximately $228.10, entering the proposed base zone.",
          "The session closed near $237.27, outside the required $228–$234 daily-close range.",
          "A later daily close above $240.50 cannot trigger the setup until the base-close condition occurs first."
        ]
      },
      lesson:
        "Touching a base zone intraday is not the same as closing there. Timeframe-specific confirmation prevents a volatile gap from being mistaken for a completed setup.",
      chartUrl: "https://www.tradingview.com/x/BVJy2Tzh/"
    },
    {
      id: "2026-08-19-mrk-long-term",
      date: "2026-08-19",
      reviewedAt: "2026-08-19T20:22:51-07:00",
      ticker: "MRK",
      horizon: "Long-term idea",
      direction: "Long",
      statusCode: "WATCHING",
      statusLabel: "Watching — not triggered",
      setup: {
        entryCondition:
          "Buy at $140 only after a pullback into $136–$140 and a bullish daily close back above $140; do not chase above $144.",
        entryZone: "$136–$140 pullback, then $140 reclaim",
        preEntryInvalidation: "No qualifying pullback/reclaim sequence; do not chase above $144",
        plannedStopAfterEntry: "$128",
        takeProfitLevels: ["$164", "$176"]
      },
      rationale: {
        technicals:
          "The catalyst gap cleared the prior $137.98 high on heavy volume, with price above rising 20-, 50-, and 200-day averages near $132, $127, and $115. Daily RSI near 82 showed extension, making the pullback-and-reclaim requirement important.",
        fundamentals:
          "Q2 sales rose 5% to $16.6B; KEYTRUDA-family sales grew 5% to $8.4B and WINREVAIR grew 75% to $588M. Merck raised its 2026 sales outlook, while regulatory uncertainty and KEYTRUDA concentration remain risks."
      },
      outcome: {
        type: "NO_TRADE",
        summary:
          "MRK never entered the required $136–$140 pullback zone on August 19, so no reclaim sequence existed and the idea remained watch-only.",
        sequence: [
          "MRK traded no lower than approximately $144.90 during the session.",
          "The stock therefore stayed above the required pullback zone and closed near $152.20.",
          "No entry, stop, target, or portfolio result was recorded."
        ]
      },
      lesson:
        "A strong catalyst can improve the long-term thesis while making the immediate entry less attractive. Waiting for the planned pullback keeps risk defined.",
      chartUrl: "https://www.tradingview.com/x/Qbwhst7e/"
    },
    {
      id: "2026-08-18-amlx-day",
      date: "2026-08-18",
      reviewedAt: "2026-08-18T08:56:00-07:00",
      ticker: "AMLX",
      horizon: "Day trade",
      direction: "Long",
      statusCode: "INVALIDATED_BEFORE_ENTRY",
      statusLabel: "Invalidated before entry",
      setup: {
        entryCondition: "Buy at $31.30 only after a five-minute close above it and a successful retest.",
        entryZone: "$31.30–$31.35",
        preEntryInvalidation: "$30.65 trades before confirmation",
        plannedStopAfterEntry: "$30.65",
        takeProfitLevels: ["$31.95", "$32.60"]
      },
      rationale: {
        technicals:
          "The catalyst gap cleared the prior $24.60 high on exceptional volume, but the breakout confirmation repeatedly failed before the invalidation level broke.",
        fundamentals:
          "Phase 3 LUCIDITY met its primary and secondary endpoints and an NDA is planned, but AMLX remains a clinical-stage biotech with binary approval risk."
      },
      outcome: {
        type: "NO_TRADE",
        summary:
          "The planned $30.65 cancellation level was breached before the entry sequence completed. AMLX later rallied above the original trigger area, but the original setup remained cancelled and no position was opened.",
        sequence: [
          "The required five-minute close and successful retest above $31.30 never completed.",
          "Price then traded below $30.65, reaching $30.50 during the initial review window.",
          "A later rally did not retroactively create an entry, stop-out, or portfolio result."
        ]
      },
      lesson:
        "Event order matters. A strict confirmation rule can miss a later rally, but invalidation before entry means the correct result is no trade—not a stopped-out loss.",
      chartUrl: "https://www.tradingview.com/x/GL0Who3F/"
    },
    {
      id: "2026-08-18-hae-swing",
      date: "2026-08-18",
      reviewedAt: "2026-08-18T08:56:00-07:00",
      ticker: "HAE",
      horizon: "Swing trade",
      direction: "Long",
      statusCode: "WATCHING",
      statusLabel: "Watching — not triggered",
      setup: {
        entryCondition:
          "Buy at $107.50 only after at least a two-session base above $100 and a daily close above $107.50.",
        entryZone: "$107.50 after confirmation",
        preEntryInvalidation: "Base fails below $100 before confirmation",
        plannedStopAfterEntry: "$99.50",
        takeProfitLevels: ["$119.50", "$131.50"]
      },
      rationale: {
        technicals:
          "The gap cleared $92.25 resistance above rising major averages, but RSI near 84 made the first-day move too extended to chase.",
        fundamentals:
          "Fiscal-Q1 revenue and free cash flow grew and guidance increased; the new CSL agreement adds opportunity but has no minimum-purchase commitment."
      },
      outcome: {
        type: "NO_TRADE",
        summary:
          "The setup remained watch-only because the required two completed sessions above $100 and daily-close trigger above $107.50 did not yet exist.",
        sequence: [
          "The first catalyst-gap session held above $100.",
          "A two-session base could not be confirmed on the same day.",
          "No entry, stop, target, or portfolio result was recorded."
        ]
      },
      lesson:
        "A strong catalyst is not enough by itself. Waiting for a base turns an emotional gap chase into a setup with a testable invalidation point.",
      chartUrl: "https://www.tradingview.com/x/v2fBNkrd/"
    },
    {
      id: "2026-08-18-amgn-long-term",
      date: "2026-08-18",
      reviewedAt: "2026-08-18T08:56:00-07:00",
      ticker: "AMGN",
      horizon: "Long-term idea",
      direction: "Long",
      statusCode: "WATCHING",
      statusLabel: "Watching — not triggered",
      setup: {
        entryCondition:
          "Buy at $422 only after a pullback into $414–$420 and a subsequent daily close back above $422.",
        entryZone: "$414–$420 pullback, then $422 reclaim",
        preEntryInvalidation: "No qualifying pullback/reclaim sequence",
        plannedStopAfterEntry: "$378 weekly close",
        takeProfitLevels: ["$510", "$554"]
      },
      rationale: {
        technicals:
          "AMGN broke the prior $421.79 high above rising 20-, 50-, and 200-day averages, while elevated daily and weekly RSI readings argued for patience.",
        fundamentals:
          "Q2 revenue rose 10% to $10.1B and free cash flow reached $3.5B; Prolia biosimilar pressure and $57.3B of debt remain the main risks."
      },
      outcome: {
        type: "NO_TRADE",
        summary:
          "The qualifying $414–$420 pullback had not occurred at the review time, so the idea remained watch-only with no position or portfolio result.",
        sequence: [
          "Price remained above the required pullback zone.",
          "The pullback-then-reclaim sequence was therefore incomplete.",
          "No entry, stop, target, or portfolio result was recorded."
        ]
      },
      lesson:
        "Business quality does not justify chasing an extended chart. A patient entry can improve both downside definition and the reward-to-risk profile.",
      chartUrl: "https://www.tradingview.com/x/mLCkJ9rZ/"
    }
  ]
};
