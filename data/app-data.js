/*
 * Chart Champ — app data
 * -----------------------
 * Single source of truth for the public app. Everything here is STATIC and
 * easy to hand-edit. The live chart on each ready ticker is pulled from
 * TradingView at view time; nothing else calls an external API.
 *
 * Educational community notes only. Not financial advice.
 *
 * ── ADD A RESEARCH TICKER (one at a time) ──────────────────────────────────
 * Copy the BABA object in `research.tickers` and edit it. Fields:
 *   ticker      "BABA"                      shown big
 *   name        "Alibaba Group"
 *   tvSymbol    "NYSE:BABA"                 EXCHANGE:SYMBOL for the embedded chart
 *   chartUrl    "https://www.tradingview.com/chart/XXXX/"  optional; the "Open Bar
 *               Replay" button opens this exact chart/layout (your drawings). If
 *               omitted, the button opens a generic chart for tvSymbol.
 *   chartReady  true | false                false = reserved placeholder, no chart
 *   assetClass  "Stock (ADR)"               free text
 *   sector      "China Internet / E-commerce"
 *   risk        one of meta.riskScale       drives the risk badge
 *   tags        ["China", "cloud", ...]
 *   summary     one neutral sentence
 *   levels.support / levels.resistance      [{ price, note }, ...]
 *   bullish / bearish                       ["factor", ...]
 *   fundamentals.rating                     one of meta.fundamentalsScale (or "N/A")
 *   fundamentals.rationale, fundamentals.metrics [{ label, value }, ...]
 *
 * ── UPDATE THE PORTFOLIO ───────────────────────────────────────────────────
 * Edit `portfolio.holdings` (set each `latestPrice` to refresh P/L) and add to
 * `portfolio.decisions` (status "Open"/"Closed", optional `details` + `levels`).
 * Point a holding's `researchKey` at a ticker in research.tickers to link it.
 */
window.APP_DATA = {
  meta: {
    appName: "Chart Champ",
    tagline: "Portfolio holdings and community ticker research.",
    updatedAt: "2026-07-09",
    complianceFooter: "For educational purposes only. Not financial advice.",
    fundamentalsScale: ["Very Strong", "Strong", "Moderate", "Weak", "Very Weak"],
    riskScale: ["Low", "Moderate", "Elevated", "High", "Very High"]
  },

  portfolio: {
    referenceDate: "2026-05-22",
    startingValue: 10000,
    benchmarkTicker: "SPY",
    chartStartDate: "2026-06-25",
    disclaimer:
      "Illustrative educational portfolio for community discussion. Holdings and decisions are examples, not a recommendation to buy or sell.",
    displayNote:
      "A $10,000 educational portfolio opened May 22, 2026 — now a seven-position long book with $3,000 held in cash. Quotes refresh twice each weekday around U.S. market hours; the exact snapshot time is shown with the positions.",
    holdings: [
      {
        ticker: "CASH",
        name: "Cash reserve",
        assetClass: "Cash",
        marketSegment: "Cash",
        researchKey: null,
        entryPrice: 1,
        latestPrice: 1,
        shares: 3000,
        costBasis: 3000,
        marketValue: 3000,
        dayChangePct: 0,
        note: "Dry powder for adds and new positions."
      },
      {
        ticker: "AAPL",
        name: "Apple",
        assetClass: "Stock",
        marketSegment: "Stocks",
        researchKey: "AAPL",
        entryDate: "2026-06-25",
        entryPrice: 274.98,
        latestPrice: 274.98,
        shares: 3.636628,
        costBasis: 1000,
        marketValue: 1000,
        dayChangePct: 0,
        note: "Core long opened Jun 25, 2026 at $274.98."
      },
      {
        ticker: "NFLX",
        name: "Netflix",
        assetClass: "Stock",
        marketSegment: "Stocks",
        researchKey: "NFLX",
        entryDate: "2026-06-25",
        entryPrice: 71.21,
        latestPrice: 71.21,
        shares: 14.042971,
        costBasis: 1000,
        marketValue: 1000,
        dayChangePct: 0,
        note: "Core long opened Jun 25, 2026 at $71.21."
      },
      {
        ticker: "PLTR",
        name: "Palantir",
        assetClass: "Stock",
        marketSegment: "Stocks",
        researchKey: "PLTR",
        entryDate: "2026-06-25",
        entryPrice: 107.47,
        latestPrice: 107.47,
        shares: 9.304922,
        costBasis: 1000,
        marketValue: 1000,
        dayChangePct: 0,
        note: "Core long opened Jun 25, 2026 at $107.47."
      },
      {
        ticker: "MSFT",
        name: "Microsoft",
        assetClass: "Stock",
        marketSegment: "Stocks",
        researchKey: "MSFT",
        entryDate: "2026-06-25",
        entryPrice: 352.82,
        latestPrice: 352.82,
        shares: 2.834306,
        costBasis: 1000,
        marketValue: 1000,
        dayChangePct: 0,
        note: "Core long opened Jun 25, 2026 at $352.82."
      },
      {
        ticker: "META",
        name: "Meta Platforms",
        assetClass: "Stock",
        marketSegment: "Stocks",
        researchKey: "META",
        entryDate: "2026-06-25",
        entryPrice: 543.40,
        latestPrice: 543.40,
        shares: 1.840265,
        costBasis: 1000,
        marketValue: 1000,
        dayChangePct: 0,
        note: "Core long opened Jun 25, 2026 at $543.40."
      },
      {
        ticker: "BABA",
        name: "Alibaba Group",
        assetClass: "Stock",
        marketSegment: "Stocks",
        researchKey: "BABA",
        entryDate: "2026-06-29",
        entryPrice: 96.50,
        latestPrice: 96.50,
        shares: 10.362694,
        costBasis: 1000,
        marketValue: 1000,
        dayChangePct: 0,
        note: "Added Jun 29, 2026 at $96.50."
      },
      {
        ticker: "ORCL",
        name: "Oracle",
        assetClass: "Stock",
        marketSegment: "Stocks",
        researchKey: "ORCL",
        entryDate: "2026-07-02",
        entryPrice: 140.45,
        latestPrice: 140.45,
        shares: 7.119972,
        costBasis: 1000,
        marketValue: 1000,
        dayChangePct: 0,
        note: "Added Jul 2, 2026 at $140.45."
      }
    ],
    decisions: [
      {
        date: "2026-07-02",
        ticker: "ORCL",
        action: "Opened",
        status: "Open",
        summary:
          "Added a seventh core long — $1,000 of Oracle at $140.45. Cash reserve now $3,000.",
        details: [
          "ORCL — $1,000 @ $140.45"
        ]
      },
      {
        date: "2026-06-29",
        ticker: "BABA",
        action: "Opened",
        status: "Open",
        summary:
          "Added $1,000 of Alibaba at $96.50 as the sixth position in the long book.",
        details: [
          "BABA — $1,000 @ $96.50"
        ]
      },
      {
        date: "2026-06-25",
        ticker: "Long book",
        action: "Opened",
        status: "Open",
        summary:
          "Started building a long portfolio — five core positions at $1,000 each.",
        details: [
          "AAPL — $1,000 @ $274.98",
          "NFLX — $1,000 @ $71.21",
          "PLTR — $1,000 @ $107.47",
          "MSFT — $1,000 @ $352.82",
          "META — $1,000 @ $543.40"
        ]
      },
      {
        date: "2026-05-22",
        ticker: "SQQQ",
        action: "Closed",
        status: "Closed",
        summary:
          "Opened a $5,000 SQQQ swing at $40.86 on a short-term pullback view, then closed it at breakeven — no net gain or loss. The capital returned to cash and was redeployed into the long book.",
        details: [
          "Entry: $40.86",
          "Exit: breakeven",
          "Net result: $0 (0.0%)"
        ]
      }
    ]
  },

  research: {
    intro:
      "Search a ticker for the community read — the bullish case, the bearish case, fundamentals, the levels we're watching, and a live chart with bar-replay.",
    disclaimer:
      "Community research notes for educational discussion — our read on a ticker, not a recommendation to buy or sell. Levels and views can change.",
    tickers: [
      {
        ticker: "BABA",
        name: "Alibaba Group",
        tvSymbol: "NYSE:BABA",
        chartUrl: "https://www.tradingview.com/chart/5JLhvnvV/",
        chartReady: true,
        assetClass: "Stock (ADR)",
        sector: "China Internet / E-commerce",
        risk: "High",
        tags: ["China", "e-commerce", "cloud", "AI", "ADR"],
        summary:
          "China's e-commerce and cloud leader — a value-and-AI story that carries China and ADR risk.",
        levels: {
          support: [
            { price: "$109.99", note: "Nearest support below price" },
            { price: "$90.51", note: "Prior consolidation" },
            { price: "$79.46", note: "Deeper support shelf" },
            { price: "$66.64", note: "Major support" },
            { price: "$57.79", note: "2024 base" }
          ],
          resistance: [
            { price: "$120.00", note: "Nearest overhead" },
            { price: "$150.08", note: "Prior-range resistance" },
            { price: "$180.92–$189.38", note: "Major resistance zone" }
          ]
        },
        bullish: [
          "Dominant China e-commerce franchise (Taobao, Tmall) with a vast user base",
          "Alibaba Cloud re-accelerating on AI demand — the key growth driver",
          "Large net-cash balance sheet funding sizable buybacks",
          "Low valuation versus global internet peers, with sum-of-the-parts optionality"
        ],
        bearish: [
          "China regulatory, macro, and consumer-demand uncertainty",
          "U.S.–China tension and ADR audit / delisting overhang",
          "Intense domestic competition (PDD, Douyin/ByteDance, JD)",
          "RMB currency risk and the VIE / governance structure"
        ],
        fundamentals: {
          rating: "Moderate",
          rationale:
            "Strong cash generation, net cash, and a cheap multiple are offset by slower growth and a persistent China / regulatory discount. The balance sheet isn't the worry — the geopolitical and competitive backdrop is.",
          metrics: [
            { label: "Revenue trend", value: "Steady; cloud re-accelerating" },
            { label: "Margins", value: "Solid / improving" },
            { label: "Balance sheet", value: "Large net cash" },
            { label: "Valuation", value: "Low vs global peers" }
          ]
        }
      },
      {
        ticker: "AAPL",
        name: "Apple",
        tvSymbol: "NASDAQ:AAPL",
        chartReady: true,
        assetClass: "Stock",
        sector: "Consumer Tech / Devices & Services",
        risk: "Moderate",
        tags: ["mega-cap", "devices", "services", "buybacks"],
        summary:
          "The iPhone-and-services cash machine — steady compounding, watched for its next AI move.",
        levels: {
          support: [
            { price: "$280.99", note: "First support below price" },
            { price: "$243.94", note: "Support with rising trendline confluence" },
            { price: "$199.26", note: "Major support" }
          ],
          resistance: [
            { price: "$317.00", note: "Overhead level at rising resistance trendline" }
          ]
        },
        bullish: [
          "Enormous, loyal installed base with high switching costs",
          "Services revenue grows the margin-rich recurring layer",
          "Massive free cash flow funds relentless buybacks",
          "Ecosystem lock-in across devices, payments, and content"
        ],
        bearish: [
          "Hardware growth has matured; iPhone cycles are lumpier",
          "Perceived to be behind big-tech peers on AI",
          "China exposure on both demand and supply chains",
          "Regulatory pressure on App Store economics"
        ],
        fundamentals: {
          rating: "Strong",
          rationale:
            "Elite cash generation and balance-sheet strength with slower top-line growth — the debate is growth re-acceleration and AI positioning, not quality.",
          metrics: [
            { label: "Revenue trend", value: "Slow, steady" },
            { label: "Margins", value: "High; services-led" },
            { label: "Balance sheet", value: "Fortress / net cash" },
            { label: "Valuation", value: "Premium vs growth" }
          ]
        }
      },
      {
        ticker: "NFLX",
        name: "Netflix",
        tvSymbol: "NASDAQ:NFLX",
        chartReady: true,
        assetClass: "Stock",
        sector: "Streaming / Media",
        risk: "Elevated",
        tags: ["streaming", "ads", "subscription"],
        summary:
          "The streaming leader monetizing a huge subscriber base with ads and live events.",
        levels: {
          support: [
            { price: "$70.06", note: "First support below price" }
          ],
          resistance: [
            { price: "$74.90", note: "Immediate overhead at price" },
            { price: "$82.01", note: "Next resistance" },
            { price: "$100.24", note: "Round-number resistance" },
            { price: "$106.59", note: "Prior-range level" },
            { price: "$127.02", note: "Major overhead" }
          ]
        },
        bullish: [
          "Category leader with unmatched global content scale",
          "Ad tier and paid sharing open new monetization layers",
          "Consistently positive and growing free cash flow",
          "Live events and games extend engagement"
        ],
        bearish: [
          "Streaming competition keeps content spend elevated",
          "Subscriber growth in mature markets is slowing",
          "Ad business must scale to justify expectations",
          "Price hikes test churn in a squeezed consumer"
        ],
        fundamentals: {
          rating: "Strong",
          rationale:
            "Profitable, cash-generative, and the clear category leader; the question is how much growth the ad tier and pricing can add from here.",
          metrics: [
            { label: "Revenue trend", value: "Solid growth" },
            { label: "Margins", value: "Expanding" },
            { label: "Balance sheet", value: "Manageable debt" },
            { label: "Valuation", value: "Growth premium" }
          ]
        }
      },
      {
        ticker: "PLTR",
        name: "Palantir",
        tvSymbol: "NASDAQ:PLTR",
        chartReady: true,
        assetClass: "Stock",
        sector: "Software / AI Platforms",
        risk: "Very High",
        tags: ["AI", "software", "government", "high beta"],
        summary:
          "AIP-driven commercial growth on top of a sticky government franchise — priced for a lot of it.",
        levels: {
          support: [
            { price: "$124.84", note: "Nearest support below price" },
            { price: "$105.56", note: "Prior breakout shelf" },
            { price: "$65.90", note: "Major support" }
          ],
          resistance: [
            { price: "$136.03", note: "Immediate overhead" },
            { price: "$148.01", note: "Next resistance" },
            { price: "$164.09", note: "Prior high area" },
            { price: "$189.61–$199.17", note: "Major resistance zone" }
          ]
        },
        bullish: [
          "Strong U.S. commercial growth driven by AIP adoption",
          "Government contracts provide a recurring, sticky base",
          "GAAP profitable with high gross margins",
          "Effective land-and-expand model in large enterprises"
        ],
        bearish: [
          "Among the richest valuations in software",
          "Stock-based compensation dilutes shareholders",
          "Deal-driven revenue can be lumpy quarter to quarter",
          "High retail ownership amplifies volatility both ways"
        ],
        fundamentals: {
          rating: "Moderate",
          rationale:
            "Genuinely strong growth and profitability; the valuation does the heavy lifting on risk, so execution has little room to slip.",
          metrics: [
            { label: "Revenue trend", value: "Accelerating" },
            { label: "Margins", value: "High" },
            { label: "Balance sheet", value: "Net cash" },
            { label: "Valuation", value: "Very premium" }
          ]
        }
      },
      {
        ticker: "MSFT",
        name: "Microsoft",
        tvSymbol: "NASDAQ:MSFT",
        chartReady: true,
        assetClass: "Stock",
        sector: "Software / Cloud",
        risk: "Moderate",
        tags: ["mega-cap", "cloud", "AI", "enterprise"],
        summary:
          "The enterprise default — Azure and Copilot put it at the center of the AI build-out.",
        levels: {
          support: [
            { price: "$344.27–$356.20", note: "Support zone below price" }
          ],
          resistance: [
            { price: "$398.60", note: "Nearest overhead" },
            { price: "$448.76–$470.56", note: "Major resistance zone" },
            { price: "$554.30", note: "Upper resistance" }
          ]
        },
        bullish: [
          "Azure growth with deep AI integration across the stack",
          "Copilot monetizes AI inside an entrenched office suite",
          "Diversified enterprise moat: cloud, OS, gaming, LinkedIn",
          "Elite margins and a fortress balance sheet"
        ],
        bearish: [
          "Heavy AI capex pressures near-term free cash flow",
          "AI monetization pace may lag the spend",
          "Cloud competition from AWS and Google persists",
          "Antitrust and regulatory attention across markets"
        ],
        fundamentals: {
          rating: "Very Strong",
          rationale:
            "Best-in-class enterprise franchise with durable growth and margins; the main tension is how fast AI spend converts into revenue.",
          metrics: [
            { label: "Revenue trend", value: "Durable growth" },
            { label: "Margins", value: "Elite" },
            { label: "Balance sheet", value: "Fortress" },
            { label: "Valuation", value: "Full but supported" }
          ]
        }
      },
      {
        ticker: "META",
        name: "Meta Platforms",
        tvSymbol: "NASDAQ:META",
        chartReady: true,
        assetClass: "Stock",
        sector: "Internet / Advertising",
        risk: "Moderate",
        tags: ["mega-cap", "ads", "AI"],
        summary:
          "A highly profitable ad engine reinvesting aggressively into AI.",
        levels: {
          support: [
            { price: "$606.21", note: "Nearest support below price" },
            { price: "$544.12", note: "Support with rising trendline confluence" }
          ],
          resistance: [
            { price: "$677.06", note: "Nearest overhead" },
            { price: "$741.60", note: "Next resistance" },
            { price: "$791.41", note: "Upper resistance" }
          ]
        },
        bullish: [
          "Massive, highly profitable advertising engine",
          "AI is measurably improving engagement and ad targeting",
          "Cost discipline restored margins after 2022",
          "Large free cash flow funds buybacks and the AI build-out"
        ],
        bearish: [
          "Reality Labs continues to post large losses",
          "Ongoing regulatory and antitrust overhang",
          "Ad spend is sensitive to the macro cycle",
          "Heavy AI capex pressures near-term free cash flow"
        ],
        fundamentals: {
          rating: "Strong",
          rationale:
            "Excellent core economics and cash generation; the open question is the size and payoff timing of AI and metaverse spending.",
          metrics: [
            { label: "Revenue trend", value: "Solid growth" },
            { label: "Margins", value: "High" },
            { label: "Balance sheet", value: "Net cash" },
            { label: "Valuation", value: "Reasonable vs peers" }
          ]
        }
      },
      {
        ticker: "ORCL",
        name: "Oracle",
        tvSymbol: "NYSE:ORCL",
        chartReady: true,
        assetClass: "Stock",
        sector: "Software / Cloud Infrastructure",
        risk: "Elevated",
        tags: ["cloud", "AI infrastructure", "database", "enterprise"],
        summary:
          "The legacy database giant turned AI-infrastructure player, with OCI booking huge backlog.",
        levels: {
          support: [],
          resistance: [
            { price: "$198.10", note: "Nearest overhead" },
            { price: "$249.29", note: "Next resistance" },
            { price: "$322.24", note: "Upper resistance" }
          ]
        },
        bullish: [
          "OCI rides AI training demand with major customer wins",
          "Very large contracted backlog (RPO) underpins growth",
          "Sticky database and enterprise-app installed base",
          "Multi-cloud deals with the hyperscalers expand reach"
        ],
        bearish: [
          "AI data-center build-out requires heavy capex and debt",
          "Backlog conversion timing is uncertain",
          "Competition from larger, better-capitalized clouds",
          "Valuation has re-rated sharply on AI expectations"
        ],
        fundamentals: {
          rating: "Strong",
          rationale:
            "A credible AI-infrastructure growth story on top of a sticky enterprise base; leverage and capex intensity are the watch items.",
          metrics: [
            { label: "Revenue trend", value: "Accelerating (OCI)" },
            { label: "Margins", value: "Solid; capex heavy" },
            { label: "Balance sheet", value: "Leveraged" },
            { label: "Valuation", value: "Re-rated / elevated" }
          ]
        }
      }
    ]
  }
};
