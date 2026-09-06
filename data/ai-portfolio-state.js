/*
 * Mutable AI portfolio state.
 *
 * Keep this file separate from app-data.js so confirmed alert events can update
 * the AI ledgers without rewriting the community portfolio or Research data.
 */
window.AI_PORTFOLIO_STATE = {
  schemaVersion: 1,
  portfolios: {
    dayTradingAgent: {
      id: "day-trading-agent",
      label: "Day Trading Agent",
      referenceDate: "2026-08-02",
      startingValue: 10000,
      benchmarkTicker: "SPY",
      chartStartDate: "2026-08-03",
      disclaimer:
        "Educational AI portfolio for community discussion. No live orders are placed; this ledger records decisions and filled paper trades only.",
      displayNote:
        "A separate $10,000 day-trading ledger. No position is filled yet; the agent is waiting for an intraday trigger and will keep the balance in cash between trades.",
      realizedPnl: 0,
      holdings: [
        {
          ticker: "CASH",
          name: "Unallocated cash",
          assetClass: "Cash",
          marketSegment: "Cash",
          researchKey: null,
          entryPrice: 1,
          latestPrice: 1,
          shares: 10000,
          costBasis: 10000,
          marketValue: 10000,
          dayChangePct: 0,
          note: "No day-trade trigger has filled; the full $10,000 remains available."
        }
      ],
      pendingOrders: [],
      decisions: [
        {
          date: "2026-08-02",
          ticker: "USO",
          action: "Watching",
          status: "Planned",
          summary:
            "USO is a conditional intraday long only if continuation appears inside the $127–$130 zone; no overnight position is planned.",
          details: [
            "Entry: $127–$130 with intraday confirmation",
            "Invalidation: below $124",
            "Target: $137",
            "No fill on Sunday; wait for the next liquid session"
          ],
          levels: { entry: "$127–$130", stop: "$124", target1: "$137" }
        }
      ]
    },

    swingTradingAgent: {
      id: "swing-trading-agent",
      label: "Swing Trading Agent",
      referenceDate: "2026-08-02",
      startingValue: 10000,
      benchmarkTicker: "SPY",
      chartStartDate: "2026-08-03",
      disclaimer:
        "Educational AI portfolio for community discussion. No live orders are placed; this ledger records decisions and filled paper trades only.",
      displayNote:
        "A separate $10,000 swing-trading ledger. The agent is selective: capital stays in cash until a pullback or retest gives a defined risk point.",
      realizedPnl: 0,
      holdings: [
        {
          ticker: "CASH",
          name: "Unallocated cash",
          assetClass: "Cash",
          marketSegment: "Cash",
          researchKey: null,
          entryPrice: 1,
          latestPrice: 1,
          shares: 10000,
          costBasis: 10000,
          marketValue: 10000,
          dayChangePct: 0,
          note: "No swing entry has filled; the full $10,000 remains available."
        }
      ],
      pendingOrders: [],
      decisions: [
        {
          date: "2026-08-02",
          ticker: "ETH/USDT",
          action: "Watching",
          status: "Planned",
          summary:
            "ETH has relative strength, but the swing long is conditional on a pullback into $1,840–$1,880 and a confirming 4-hour close.",
          details: [
            "Entry: $1,840–$1,880 on a pullback",
            "Invalidation: 4-hour close below $1,820",
            "Target: $2,050–$2,100",
            "No fill above the planned entry zone"
          ],
          levels: { entry: "$1,840–$1,880", stop: "$1,820", target1: "$2,050–$2,100" }
        }
      ]
    },

    longTermInvestingAgent: {
      id: "long-term-investing-agent",
      label: "Long Term Investing Agent",
      referenceDate: "2026-08-02",
      startingValue: 10000,
      benchmarkTicker: "SPY",
      chartStartDate: "2026-08-03",
      disclaimer:
        "Educational AI portfolio for community discussion. No live orders are placed; this ledger records decisions and filled paper trades only.",
      displayNote:
        "A separate $10,000 long-term ledger. The first position is CPER, entered from a preplanned pullback zone with risk capped below $50.",
      realizedPnl: 0,
      holdings: [
        {
          ticker: "CASH",
          name: "Unallocated cash",
          assetClass: "Cash",
          marketSegment: "Cash",
          researchKey: null,
          entryPrice: 1,
          latestPrice: 1,
          shares: 8904.92,
          costBasis: 8904.92,
          marketValue: 8904.92,
          dayChangePct: 0,
          note: "Cash remaining after the Aug 3 CPER entry."
        },
        {
          ticker: "CPER",
          name: "United States Copper Index Fund",
          assetClass: "Commodity ETF",
          marketSegment: "Commodities",
          researchKey: null,
          entryDate: "2026-08-03",
          entryPrice: 39.11,
          latestPrice: 39.11,
          shares: 28,
          costBasis: 1095.08,
          marketValue: 1095.08,
          dayChangePct: 0,
          transactions: [
            { date: "2026-08-03", type: "buy", shares: 28, price: 39.11, amount: 1095.08 }
          ],
          note: "Entered from the planned $38.40–$39.20 pullback zone. Hard stop $37.40; scale-out targets $42 and $43."
        }
      ],
      pendingOrders: [],
      decisions: [
        {
          date: "2026-08-03",
          ticker: "CPER",
          action: "Bought",
          status: "Filled",
          summary:
            "Bought 28 CPER shares at $39.11 after price entered the preplanned pullback zone while the daily trend remained above rising short- and medium-term averages.",
          details: [
            "Position: 28 shares at $39.11 ($1,095.08)",
            "Hard stop: $37.40; thesis invalidation: daily close below $37.50",
            "Targets: trim 14 shares at $42 and 14 shares at $43",
            "Maximum planned risk: $47.88; remaining cash: $8,904.92"
          ],
          levels: { entry: "$39.11", stop: "$37.40", target1: "$42", target2: "$43" }
        },
        {
          date: "2026-08-02",
          ticker: "MAS",
          action: "Watching",
          status: "Planned",
          summary:
            "MAS is a conditional long near the rising 200-day average; the setup needs support to hold after the recent gap-down before any allocation.",
          details: [
            "Entry: $68.50–$71.50",
            "Invalidation: daily close below $66",
            "Target: $85–$90",
            "No fill; quality and valuation still need confirmation"
          ],
          levels: { entry: "$68.50–$71.50", stop: "$66", target1: "$85–$90" }
        },
        {
          date: "2026-08-02",
          ticker: "CPER",
          action: "Watching",
          status: "Planned",
          summary:
            "CPER remains a possible diversified commodity sleeve, but thin liquidity and roll costs make a patient entry more important than chasing strength.",
          details: [
            "Entry: $38.40–$39.20",
            "Invalidation: daily close below $37.50",
            "Target: $42–$43",
            "No fill; wait for the support zone"
          ],
          levels: { entry: "$38.40–$39.20", stop: "$37.50", target1: "$42–$43" }
        }
      ]
    }
  }
};
