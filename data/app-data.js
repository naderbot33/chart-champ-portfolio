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
 *   postedChartUrl  "https://www.tradingview.com/x/XXXX/" optional; the latest
 *               TradingView chart snapshot posted in a ChartChamp source channel.
 *   postedChartDate "2026-07-20" optional; date of that source-channel post.
 *   postedChartChannel "stocks" | "crypto" | "bonds" | "commodities" or
 *               one of the three AI setup-review channels
 *   analysisTimeframe "6 hours"             timeframe named in the source post
 *   chartReady  true | false                false = reserved placeholder, no chart
 *   assetClass  "Stock (ADR)"               free text
 *   sector      "China Internet / E-commerce"
 *   risk        one of meta.riskScale       drives the risk badge
 *   tags        ["China", "cloud", ...]
 *   summary     one neutral sentence
 *   levels.support / levels.resistance      [{ price, note }, ...]
 *   bullish / bearish                       ["factor", ...]
 *   aiAnalysis.rating                       "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell"
 *   aiAnalysis.why                          one short technical + fundamental rationale
 * Monthly price-momentum notes live in `research.monthlyUpdates[TICKER]` so
 * they stay separate from the source chart date and recommendation-style AI rating.
 *   fundamentals.rating                     one of meta.fundamentalsScale (or "N/A")
 *   fundamentals.rationale, fundamentals.metrics [{ label, value }, ...]
 *
 * ── UPDATE THE PORTFOLIO ───────────────────────────────────────────────────
 * Edit `portfolio.holdings`, record every filled buy/sell in the holding's
 * `transactions`, and add unfilled orders to `portfolio.pendingOrders`.
 * Use `portfolio.decisions` for the human-readable activity log.
 * Point a holding's `researchKey` at a ticker in research.tickers to link it.
 */
window.APP_DATA = {
  meta: {
    appName: "Chart Champ",
    tagline: "Portfolio holdings and community ticker research.",
    updatedAt: "2026-08-19",
    complianceFooter: "For educational purposes only. Not financial advice.",
    aiAnalysisScale: ["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"],
    monthlyMomentumScale: ["Positive", "Mixed", "Negative"],
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
      "A $10,000 educational portfolio opened May 22, 2026. Holdings use the dated market snapshot shown below; portfolio decisions have their own source dates.",
    realizedPnl: 796.8264705896,
    holdings: [
      {
        ticker: "CASH",
        name: "Cash reserve",
        assetClass: "Cash",
        marketSegment: "Cash",
        researchKey: null,
        entryPrice: 1,
        latestPrice: 1,
        shares: 1600.4360982556,
        costBasis: 1600.4360982556,
        marketValue: 1600.4360982556,
        dayChangePct: 0,
        note: "Cash reserve after the Aug 4 profit-taking and the $869 rotation from TQQQ into NVO."
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
        shares: 2.358672846843,
        costBasis: 648.5878594249,
        marketValue: 1000,
        dayChangePct: 0,
        realizedPnl: 48.5878594249,
        transactions: [
          { date: "2026-06-25", type: "buy", shares: 3.636628118409, price: 274.98, amount: 1000 },
          { date: "2026-07-10", type: "sell", shares: 1.277955271565, price: 313, amount: 400 }
        ],
        note: "Core long opened Jun 25; sold $400 at $313 on Jul 10 and kept the balance."
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
        transactions: [
          { date: "2026-06-25", type: "buy", shares: 14.042971492768, price: 71.21, amount: 1000 }
        ],
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
        latestPrice: 161,
        shares: 3.049725942574,
        costBasis: 327.7540470484,
        marketValue: 327.7540470484,
        dayChangePct: 0,
        realizedPnl: 227.7540470484,
        transactions: [
          { date: "2026-06-25", type: "buy", shares: 9.304922303899, price: 107.47, amount: 1000 },
          { date: "2026-07-10", type: "sell", shares: 3.149606299213, price: 127, amount: 400 },
          { date: "2026-08-04", type: "sell", shares: 3.105590062112, price: 161, amount: 500 }
        ],
        note: "Core long opened Jun 25; trimmed $400 at $127 on Jul 10 and $500 at $161 on Aug 4."
      },
      {
        ticker: "MSFT",
        name: "Microsoft",
        assetClass: "Stock",
        marketSegment: "Stocks",
        researchKey: "MSFT",
        entryDate: "2026-06-25",
        entryPrice: 352.82,
        latestPrice: 494.50,
        shares: 1.418735161088,
        costBasis: 500.5581395350,
        marketValue: 500.5581395350,
        dayChangePct: 0,
        realizedPnl: 200.5581395350,
        transactions: [
          { date: "2026-06-25", type: "buy", shares: 2.834306445213, price: 352.82, amount: 1000 },
          { date: "2026-08-04", type: "sell", shares: 1.415571284125, price: 494.50, amount: 700 }
        ],
        note: "Core long opened Jun 25; trimmed $700 at $494.50 on Aug 4 and kept the balance."
      },
      {
        ticker: "META",
        name: "Meta Platforms",
        assetClass: "Stock",
        marketSegment: "Stocks",
        researchKey: "META",
        entryDate: "2026-06-25",
        entryPrice: 586.5505382864,
        latestPrice: 543.40,
        shares: 4.567273081561,
        costBasis: 2678.9364844905,
        marketValue: 2678.9364844905,
        dayChangePct: 0,
        realizedPnl: 78.9364844904,
        transactions: [
          { date: "2026-06-25", type: "buy", shares: 1.840264998160, price: 543.40, amount: 1000 },
          { date: "2026-07-14", type: "sell", shares: 0.590841949778, price: 677, amount: 400 },
          { date: "2026-07-23", type: "buy", shares: 3.317850033179, price: 602.80, amount: 2000 }
        ],
        note: "Core long opened Jun 25, trimmed Jul 14, and added $2,000 at $602.80 on Jul 23; average open cost is $586.55."
      },
      {
        ticker: "BABA",
        name: "Alibaba Group",
        assetClass: "Stock",
        marketSegment: "Stocks",
        researchKey: "BABA",
        entryDate: "2026-06-29",
        entryPrice: 96.50,
        latestPrice: 129,
        shares: 2.895106879646,
        costBasis: 279.3778138858,
        marketValue: 279.3778138858,
        dayChangePct: 0,
        realizedPnl: 179.3778138858,
        transactions: [
          { date: "2026-06-29", type: "buy", shares: 10.362694300518, price: 96.50, amount: 1000 },
          { date: "2026-07-10", type: "sell", shares: 4.366812227074, price: 114.50, amount: 500 },
          { date: "2026-08-04", type: "sell", shares: 3.100775193798, price: 129, amount: 400 }
        ],
        note: "Added Jun 29; trimmed $500 at $114.50 on Jul 10 and $400 at $129 on Aug 4."
      },
      {
        ticker: "ORCL",
        name: "Oracle",
        assetClass: "Stock",
        marketSegment: "Stocks",
        researchKey: "ORCL",
        entryDate: "2026-07-02",
        entryPrice: 140.45,
        latestPrice: 137,
        shares: 0,
        costBasis: 0,
        marketValue: 0,
        dayChangePct: 0,
        realizedPnl: -24.5639017444,
        closed: true,
        transactions: [
          { date: "2026-07-02", type: "buy", shares: 7.119971520114, price: 140.45, amount: 1000 },
          { date: "2026-07-13", type: "sell", shares: 7.119971520114, price: 137, amount: 975.4360982556 }
        ],
        note: "Closed Jul 13 when the $137 stop triggered; realized loss $24.56."
      },
      {
        ticker: "TSM",
        name: "Taiwan Semiconductor",
        assetClass: "Stock (ADR)",
        marketSegment: "Stocks",
        researchKey: "TSM",
        entryDate: "2026-07-10",
        entryPrice: 432,
        latestPrice: 432,
        shares: 2.314814814815,
        costBasis: 1000,
        marketValue: 1000,
        dayChangePct: 0,
        transactions: [
          { date: "2026-07-10", type: "buy", shares: 2.314814814815, price: 432, amount: 1000 }
        ],
        note: "Opened Jul 10 at $432; preferred support area was $428, but the entry was missed."
      },
      {
        ticker: "NVO",
        name: "Novo Nordisk",
        assetClass: "Stock (ADR)",
        marketSegment: "Stocks",
        researchKey: "NVO",
        entryDate: "2026-07-16",
        entryPrice: 47.9846258233,
        latestPrice: 44.43,
        shares: 38.949975495963,
        costBasis: 1869,
        marketValue: 1869,
        dayChangePct: 0,
        transactions: [
          { date: "2026-07-16", type: "buy", shares: 19.391118867559, price: 51.57, amount: 1000 },
          { date: "2026-08-04", type: "buy", shares: 19.558856628404, price: 44.43, amount: 869 }
        ],
        note: "Opened Jul 16 with $1,000 at $51.57 and added $869 at $44.43 on Aug 4; average open cost is $47.98."
      },
      {
        ticker: "TQQQ",
        name: "ProShares UltraPro QQQ",
        assetClass: "Leveraged ETF",
        marketSegment: "Stocks",
        researchKey: "TQQQ",
        entryDate: "2026-07-23",
        entryPrice: 67.04,
        latestPrice: 74.42,
        shares: 13.308114975380,
        costBasis: 892.1760279495,
        marketValue: 892.1760279495,
        dayChangePct: 0,
        realizedPnl: 86.1760279495,
        transactions: [
          { date: "2026-07-23", type: "buy", shares: 24.98508353222, price: 67.04, amount: 1675 },
          { date: "2026-08-04", type: "sell", shares: 11.676968556840, price: 74.42, amount: 869 }
        ],
        note: "Opened Jul 23 with $1,675 at $67.04; trimmed $869 at $74.42 on Aug 4 and kept the balance."
      }
    ],
    pendingOrders: [],
    decisions: [
      {
        date: "2026-08-04",
        ticker: "TQQQ / NVO",
        action: "Rotated capital",
        status: "Filled",
        summary:
          "Rotated $869 from TQQQ into NVO, trimming TQQQ at $74.42 and adding NVO at $44.43.",
        details: [
          "TQQQ — sold 11.676969 shares @ $74.42 for $869; realized +$86.18",
          "NVO — bought 19.558857 shares @ $44.43 for $869",
          "NVO open shares: 38.949975 at a $47.98 average cost"
        ]
      },
      {
        date: "2026-08-04",
        ticker: "PLTR / MSFT / BABA",
        action: "Took partial profits",
        status: "Filled",
        summary:
          "Trimmed PLTR, MSFT, and BABA for $1,600 of proceeds, realizing $467.58 and rebuilding the cash reserve.",
        details: [
          "PLTR — sold 3.105590 shares @ $161 for $500; realized +$166.24",
          "MSFT — sold 1.415571 shares @ $494.50 for $700; realized +$200.56",
          "BABA — sold 3.100775 shares @ $129 for $400; realized +$100.78",
          "Cash after all Aug 4 fills: $1,600.44"
        ]
      },
      {
        date: "2026-07-23",
        ticker: "META",
        action: "Added",
        status: "Open",
        summary:
          "Added $2,000 of Meta at $602.80, bringing the open META position to 4.567273 shares at a $586.55 average cost.",
        details: [
          "META — $2,000 @ $602.80",
          "Shares added: 3.317850",
          "Open shares: 4.567273",
          "The planned cash was fully deployed; a $0.44 rounding residual remains"
        ]
      },
      {
        date: "2026-07-23",
        ticker: "TQQQ",
        action: "Opened",
        status: "Open",
        summary:
          "Opened a $1,675 TQQQ position at $67.04, adding 24.985084 shares.",
        details: [
          "TQQQ — $1,675 @ $67.04",
          "Shares added: 24.985084",
          "Leveraged ETF with a 3x daily-reset objective"
        ]
      },
      {
        date: "2026-07-16",
        ticker: "NVO",
        action: "Opened",
        status: "Open",
        summary:
          "Bought $1,000 of Novo Nordisk at $51.57 after canceling the earlier HD idea.",
        details: [
          "NVO — $1,000 @ $51.57",
          "Shares added: 19.391119",
          "HD idea canceled; no HD position was opened"
        ]
      },
      {
        date: "2026-07-14",
        ticker: "META",
        action: "Took partial profits",
        status: "Filled",
        summary:
          "The existing $400 META limit sell filled at $677; the remaining position stays open.",
        details: [
          "META — sold 0.590842 shares @ $677 for $400",
          "Shares remaining: 1.249423",
          "Realized profit: +$78.94"
        ]
      },
      {
        date: "2026-07-13",
        ticker: "ORCL",
        action: "Stopped out",
        status: "Closed",
        summary:
          "Closed the full Oracle position when the $137 stop triggered.",
        details: [
          "ORCL — sold 7.119972 shares @ $137",
          "Proceeds: $975.44",
          "Realized loss: −$24.56"
        ]
      },
      {
        date: "2026-07-10",
        ticker: "TSM",
        action: "Opened",
        status: "Open",
        summary:
          "Bought $1,000 of Taiwan Semiconductor at $432 while it tested a key support area. The preferred entry was $428, but that price was missed.",
        details: [
          "TSM — $1,000 @ $432",
          "Shares added: 2.314815",
          "Key support area: $428"
        ],
        levels: {
          entry: "$432",
          stop: "Not specified",
          target1: "Not specified"
        }
      },
      {
        date: "2026-07-10",
        ticker: "BABA / AAPL / PLTR",
        action: "Took partial profits",
        status: "Filled",
        summary:
          "Trimmed three profitable positions to fund new buys. Filled proceeds totaled $1,300 and realized profit totaled $188.70.",
        details: [
          "BABA — sold $500 @ $114.50; 5.995882 shares remain; realized +$78.60",
          "AAPL — sold $400 @ $313; 2.358673 shares remain; realized +$48.59",
          "PLTR — sold $400 @ $127; 6.155316 shares remain; realized +$61.51",
          "Cash after all filled Jul 10 trades: $3,300"
        ]
      },
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
      "Search a ticker for the latest chart, independent AI Analysis, bullish and bearish cases, fundamentals, key levels, and live bar-replay.",
    disclaimer:
      "Community research and AI Analysis labels are educational snapshots, not personalized recommendations. Levels and views can change.",
    monthlyUpdates: {
      BABA: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Positive",
        julyReturnPct: 27.4, lastClose: 122.25, shortWindow: "5 sessions", shortReturnPct: 9.0,
        versusSma20Pct: 7.8, versusSma50Pct: 7.2, rsi14: 64,
        summary: "BABA gained 27.4% in July and finished above both moving averages. Strength accelerated late in the month, leaving positive momentum into August without an extreme RSI reading.",
        watch: "Confirmation: hold above SMA20; risk: profit-taking after July's sharp advance.",
        sourceSymbol: "BABA"
      },
      AAPL: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Mixed",
        julyReturnPct: 6.8, lastClose: 308.91, shortWindow: "5 sessions", shortReturnPct: -7.2,
        versusSma20Pct: -4.8, versusSma50Pct: -0.2, rsi14: 43,
        summary: "AAPL gained 6.8% in July, but a 7.2% late-month slide left it below SMA20 and near SMA50. The monthly gain remains intact, while momentum entering August has weakened.",
        watch: "Confirmation: reclaim SMA20; risk: a sustained break below SMA50.",
        sourceSymbol: "AAPL"
      },
      NFLX: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Mixed",
        julyReturnPct: 0.4, lastClose: 71.71, shortWindow: "5 sessions", shortReturnPct: 2.3,
        versusSma20Pct: -0.8, versusSma50Pct: -7.0, rsi14: 45,
        summary: "NFLX was nearly flat in July and improved 2.3% late in the month, but it remains below both averages and 7.0% under SMA50. August starts with stabilization, not a confirmed reversal.",
        watch: "Confirmation: reclaim SMA20, then SMA50; risk: renewed weakness below recent support.",
        sourceSymbol: "NFLX"
      },
      PLTR: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: 5.5, lastClose: 123.06, shortWindow: "5 sessions", shortReturnPct: 0.1,
        versusSma20Pct: -4.6, versusSma50Pct: -5.9, rsi14: 44,
        summary: "PLTR gained 5.5% in July, yet ended below SMA20 and SMA50 with flat late-month performance. The positive monthly result masks deteriorating momentum heading into August.",
        watch: "Confirmation: reclaim both averages; risk: further downside if the July gain unwinds.",
        sourceSymbol: "PLTR"
      },
      MSFT: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Positive",
        julyReturnPct: 24.6, lastClose: 464.72, shortWindow: "5 sessions", shortReturnPct: 21.8,
        versusSma20Pct: 17.1, versusSma50Pct: 16.4, rsi14: 75,
        summary: "MSFT surged 24.6% in July and closed far above both averages after a powerful late-month move. Momentum is strongly positive into August, but RSI 75 signals an extended setup.",
        watch: "Confirmation: orderly consolidation above SMA20; risk: sharp mean reversion from overbought conditions.",
        sourceSymbol: "MSFT"
      },
      META: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: -1.2, lastClose: 556.71, shortWindow: "5 sessions", shortReturnPct: -6.5,
        versusSma20Pct: -10.3, versusSma50Pct: -7.6, rsi14: 38,
        summary: "META slipped 1.2% in July, with weakness accelerating late in the month. Its close well below both averages and RSI 38 point to negative momentum entering August.",
        watch: "Confirmation: stabilize and reclaim SMA20; risk: continued selling below July support.",
        sourceSymbol: "META"
      },
      ORCL: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Mixed",
        julyReturnPct: -11.4, lastClose: 129.87, shortWindow: "5 sessions", shortReturnPct: 12.9,
        versusSma20Pct: 0.8, versusSma50Pct: -21.3, rsi14: 44,
        summary: "ORCL lost 11.4% in July but rebounded 12.9% late and edged above SMA20. The recovery improves near-term momentum, though the 21.3% gap below SMA50 keeps August's outlook mixed.",
        watch: "Confirmation: build above SMA20; risk: the rebound fails before repairing the longer trend.",
        sourceSymbol: "ORCL"
      },
      TSM: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: -15.4, lastClose: 404.25, shortWindow: "5 sessions", shortReturnPct: 0.2,
        versusSma20Pct: -2.6, versusSma50Pct: -5.0, rsi14: 46,
        summary: "TSM fell 15.4% in July and finished below both averages despite stabilizing late. Momentum remains negative into August until price can repair the short- and medium-term trend.",
        watch: "Confirmation: reclaim SMA20 and SMA50; risk: stabilization gives way to another decline.",
        sourceSymbol: "TSM"
      },
      CRCL: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: -0.03, lastClose: 62.61, shortWindow: "5 sessions", shortReturnPct: 0.4,
        versusSma20Pct: -2.6, versusSma50Pct: -19.3, rsi14: 43,
        summary: "CRCL was effectively flat in July, but finished below SMA20 and 19.3% under SMA50. Flat late-month trading has not repaired the weak trend heading into August.",
        watch: "Confirmation: reclaim SMA20; risk: another lower low while price remains far below SMA50.",
        sourceSymbol: "CRCL"
      },
      VIX: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: -2.8, lastClose: 15.99, shortWindow: "5 sessions", shortReturnPct: -13.9,
        versusSma20Pct: -7.2, versusSma50Pct: -8.0, rsi14: 45,
        summary: "VIX fell 2.8% in July and dropped sharply late, ending below both averages. Its price momentum is negative into August, which indicates easing equity-market stress rather than a bearish equity signal.",
        watch: "Watch for a reversal above both averages; VIX is a non-investable volatility index.",
        sourceSymbol: "^VIX",
        sourceNote: "Non-investable volatility index; falling VIX can mean easing equity stress."
      },
      IWM: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Mixed",
        julyReturnPct: -3.1, lastClose: 291.2, shortWindow: "5 sessions", shortReturnPct: 0.0,
        versusSma20Pct: -0.9, versusSma50Pct: -0.4, rsi14: 47,
        summary: "IWM fell 3.1% in July and ended nearly unchanged late in the month, just below both averages. Momentum entering August is neutral-to-soft and needs a directional break.",
        watch: "Confirmation: reclaim both averages; risk: renewed weakness below July support.",
        sourceSymbol: "IWM"
      },
      QQQ: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: -6.6, lastClose: 687.99, shortWindow: "5 sessions", shortReturnPct: 0.5,
        versusSma20Pct: -1.9, versusSma50Pct: -3.8, rsi14: 45,
        summary: "QQQ lost 6.6% in July and remained below SMA20 and SMA50 despite modest late-month stabilization. Momentum is negative heading into August until those averages are recovered.",
        watch: "Confirmation: reclaim SMA20, then SMA50; risk: another leg lower from below-trend positioning.",
        sourceSymbol: "QQQ"
      },
      BTC: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Mixed",
        julyReturnPct: 7.3, lastClose: 62813.75, shortWindow: "7 days", shortReturnPct: -2.0,
        versusSma20Pct: -2.5, versusSma50Pct: -0.9, rsi14: 44,
        summary: "BTC gained 7.3% in July, but softened over the final seven calendar days and closed below both averages. The monthly advance remains, while momentum entering August is mixed.",
        watch: "Confirmation: reclaim SMA20 and SMA50; risk: continued weakness below both trend measures.",
        sourceSymbol: "BTC-USD",
        sourceNote: "UTC 24/7 month boundary."
      },
      ETH: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Mixed",
        julyReturnPct: 18.5, lastClose: 1860.35, shortWindow: "7 days", shortReturnPct: 0.0,
        versusSma20Pct: -1.2, versusSma50Pct: 4.9, rsi14: 51,
        summary: "ETH gained 18.5% in July and remained above SMA50, but finished flat over seven days and slightly below SMA20. The broader advance is intact while August's near-term momentum is mixed.",
        watch: "Confirmation: reclaim SMA20; risk: a break below SMA50 would weaken the broader advance.",
        sourceSymbol: "ETH-USD",
        sourceNote: "UTC 24/7 month boundary."
      },
      NVO: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: -1.8, lastClose: 47.08, shortWindow: "5 sessions", shortReturnPct: -3.5,
        versusSma20Pct: -5.1, versusSma50Pct: 0.5, rsi14: 43,
        summary: "NVO slipped 1.8% in July and weakened late, closing below SMA20 but near SMA50. Momentum entering August is negative short term, with the medium-term trend still at a decision point.",
        watch: "Confirmation: reclaim SMA20; risk: a sustained break below SMA50.",
        sourceSymbol: "NVO"
      },
      SYM: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Mixed",
        julyReturnPct: -4.2, lastClose: 43.05, shortWindow: "5 sessions", shortReturnPct: 7.2,
        versusSma20Pct: 2.1, versusSma50Pct: -1.6, rsi14: 52,
        summary: "SYM fell 4.2% in July but rallied 7.2% late and moved above SMA20. The rebound improves near-term momentum, while its position below SMA50 keeps the August outlook mixed.",
        watch: "Confirmation: reclaim SMA50; risk: a reversal back below SMA20.",
        sourceSymbol: "SYM"
      },
      SOFI: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: -9.0, lastClose: 16.31, shortWindow: "5 sessions", shortReturnPct: -0.9,
        versusSma20Pct: -6.0, versusSma50Pct: -5.1, rsi14: 44,
        summary: "SOFI lost 9.0% in July and ended below both averages without a meaningful late-month rebound. Momentum remains negative heading into August.",
        watch: "Confirmation: reclaim SMA20 and SMA50; risk: further weakness below July support.",
        sourceSymbol: "SOFI"
      },
      GOLD: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Mixed",
        julyReturnPct: 0.7, lastClose: 4049.1, shortWindow: "5 sessions", shortReturnPct: -0.5,
        versusSma20Pct: -0.4, versusSma50Pct: -3.6, rsi14: 46,
        summary: "The COMEX gold futures proxy gained 0.7% in July but ended slightly below SMA20 and 3.6% below SMA50. Momentum entering August is mixed-to-soft.",
        watch: "Confirmation: reclaim both averages; risk: futures roll effects can differ from spot gold.",
        sourceSymbol: "GC=F",
        sourceNote: "COMEX gold futures proxy; may differ from spot gold."
      },
      SLV: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: -2.1, lastClose: 52.36, shortWindow: "5 sessions", shortReturnPct: -0.4,
        versusSma20Pct: -0.7, versusSma50Pct: -9.7, rsi14: 44,
        summary: "SLV fell 2.1% in July and remained below both averages, including 9.7% below SMA50. August begins with negative momentum despite relatively calm late-month trading.",
        watch: "Confirmation: reclaim SMA20; risk: continued underperformance while well below SMA50.",
        sourceSymbol: "SLV"
      },
      REXR: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Positive",
        julyReturnPct: 12.7, lastClose: 37.77, shortWindow: "5 sessions", shortReturnPct: -3.2,
        versusSma20Pct: 3.6, versusSma50Pct: 7.0, rsi14: 59,
        summary: "REXR gained 12.7% in July and finished above both averages. A late pullback cooled the move, but the trend remains positive heading into August.",
        watch: "Confirmation: hold above SMA20; risk: the late pullback deepens toward SMA50.",
        sourceSymbol: "REXR"
      },
      WM: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: 1.6, lastClose: 226.55, shortWindow: "5 sessions", shortReturnPct: -5.1,
        versusSma20Pct: -3.6, versusSma50Pct: 0.5, rsi14: 43,
        summary: "WM gained 1.6% in July, but a 5.1% late-month decline pushed it below SMA20 and back toward SMA50. Momentum entering August is negative short term.",
        watch: "Confirmation: reclaim SMA20; risk: a sustained break below SMA50.",
        sourceSymbol: "WM"
      },
      NVAX: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: -22.3, lastClose: 7.32, shortWindow: "5 sessions", shortReturnPct: -1.9,
        versusSma20Pct: -11.4, versusSma50Pct: -18.5, rsi14: 30,
        summary: "NVAX fell 22.3% in July and closed deeply below both averages with RSI 30. Momentum is firmly negative into August, although the oversold reading can produce sharp countertrend moves.",
        watch: "Confirmation: stabilize, then reclaim SMA20; risk: oversold conditions persist without a base.",
        sourceSymbol: "NVAX"
      },
      O: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Mixed",
        julyReturnPct: 3.1, lastClose: 63.87, shortWindow: "5 sessions", shortReturnPct: -2.6,
        versusSma20Pct: -1.0, versusSma50Pct: 1.8, rsi14: 49,
        summary: "O gained 3.1% in July and remained above SMA50, but a late pullback left it below SMA20. The broader trend is constructive while near-term August momentum is mixed.",
        watch: "Confirmation: reclaim SMA20; risk: a break below SMA50 weakens the broader setup.",
        sourceSymbol: "O"
      },
      SOUN: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: -5.3, lastClose: 6.13, shortWindow: "5 sessions", shortReturnPct: -0.5,
        versusSma20Pct: -4.4, versusSma50Pct: -12.6, rsi14: 43,
        summary: "SOUN fell 5.3% in July and ended below both averages, including 12.6% below SMA50. Momentum remains negative heading into August.",
        watch: "Confirmation: reclaim SMA20; risk: continued weakness while the medium-term trend declines.",
        sourceSymbol: "SOUN"
      },
      SMCI: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: -3.2, lastClose: 28.4, shortWindow: "5 sessions", shortReturnPct: -5.6,
        versusSma20Pct: 3.2, versusSma50Pct: -12.3, rsi14: 49,
        summary: "SMCI fell 3.2% in July and 5.6% late in the month. It remains above SMA20 but well below SMA50, leaving fragile and negatively tilted momentum into August.",
        watch: "Confirmation: hold SMA20 and reclaim SMA50; risk: another break below the short-term trend.",
        sourceSymbol: "SMCI"
      },
      TSLA: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: -26.0, lastClose: 311.21, shortWindow: "5 sessions", shortReturnPct: -0.6,
        versusSma20Pct: -14.5, versusSma50Pct: -20.4, rsi14: 32,
        summary: "TSLA lost 26.0% in July and finished far below both averages with RSI 32. Momentum remains strongly negative into August, though the depressed reading raises rebound volatility.",
        watch: "Confirmation: stabilize, then reclaim SMA20; risk: further downside before trend repair.",
        sourceSymbol: "TSLA"
      },
      TQQQ: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: -20.2, lastClose: 64.62, shortWindow: "5 sessions", shortReturnPct: 1.0,
        versusSma20Pct: -6.7, versusSma50Pct: -13.8, rsi14: 43,
        summary: "TQQQ lost 20.2% in July and ended below both averages. Leveraged Nasdaq momentum is negative into August; its 3x daily-reset structure can magnify reversals and compounding effects.",
        watch: "Confirmation: reclaim SMA20; risk: volatility and compounding from 3x daily-reset exposure.",
        sourceSymbol: "TQQQ",
        sourceNote: "3x daily-reset ETF; compounding can magnify reversals."
      },
      SQQQ: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Positive",
        julyReturnPct: 20.4, lastClose: 43.73, shortWindow: "5 sessions", shortReturnPct: -2.4,
        versusSma20Pct: 4.5, versusSma50Pct: 8.1, rsi14: 53,
        summary: "SQQQ gained 20.4% in July and stayed above both averages despite a late pullback. Positive SQQQ momentum signals weaker Nasdaq conditions; daily reset raises reversal risk.",
        watch: "Confirmation: hold SMA20; risk: a Nasdaq rebound and inverse-ETF daily-reset compounding.",
        sourceSymbol: "SQQQ",
        sourceNote: "-3x inverse daily-reset ETF; positive price momentum reflects Nasdaq weakness."
      },
      AMZN: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Positive",
        julyReturnPct: 13.9, lastClose: 271.58, shortWindow: "5 sessions", shortReturnPct: 17.0,
        versusSma20Pct: 11.4, versusSma50Pct: 10.1, rsi14: 68,
        summary: "AMZN gained 13.9% in July and accelerated sharply late, finishing well above both averages. Momentum is positive entering August, although RSI 68 shows the move is becoming extended.",
        watch: "Confirmation: consolidate above SMA20; risk: mean reversion after the late-month surge.",
        sourceSymbol: "AMZN"
      },
      PYPL: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Positive",
        julyReturnPct: 32.5, lastClose: 57.21, shortWindow: "5 sessions", shortReturnPct: 1.9,
        versusSma20Pct: 8.1, versusSma50Pct: 21.6, rsi14: 72,
        summary: "PYPL surged 32.5% in July and finished well above both averages. Momentum is strongly positive into August, but RSI 72 and the distance above SMA50 indicate a stretched setup.",
        watch: "Confirmation: hold gains above SMA20; risk: sharp mean reversion from overbought conditions.",
        sourceSymbol: "PYPL"
      },
      MGNX: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: -20.1, lastClose: 3.69, shortWindow: "5 sessions", shortReturnPct: -0.3,
        versusSma20Pct: -12.6, versusSma50Pct: -13.6, rsi14: 40,
        summary: "MGNX fell 20.1% in July and finished more than 12% below both averages. Flat late-month performance has not repaired the negative momentum entering August.",
        watch: "Confirmation: form a base and reclaim SMA20; risk: continued weakness below both averages.",
        sourceSymbol: "MGNX"
      },
      HD: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Mixed",
        julyReturnPct: -5.9, lastClose: 331.96, shortWindow: "5 sessions", shortReturnPct: -0.3,
        versusSma20Pct: -1.7, versusSma50Pct: 0.3, rsi14: 47,
        summary: "HD fell 5.9% in July and ended below SMA20 but almost exactly at SMA50. Momentum entering August is mixed, with the medium-term average acting as the key decision area.",
        watch: "Confirmation: reclaim SMA20; risk: a sustained break below SMA50.",
        sourceSymbol: "HD"
      },
      MSTR: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Mixed",
        julyReturnPct: 7.3, lastClose: 93.28, shortWindow: "5 sessions", shortReturnPct: 1.8,
        versusSma20Pct: -2.9, versusSma50Pct: -17.2, rsi14: 43,
        summary: "MSTR gained 7.3% in July, but remained below SMA20 and 17.2% under SMA50. The monthly gain contrasts with a damaged medium-term trend, leaving August momentum mixed.",
        watch: "Confirmation: reclaim SMA20; risk: persistent weakness while far below SMA50.",
        sourceSymbol: "MSTR"
      },
      IBM: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: -20.5, lastClose: 223.65, shortWindow: "5 sessions", shortReturnPct: 4.4,
        versusSma20Pct: -6.9, versusSma50Pct: -14.1, rsi14: 41,
        summary: "IBM lost 20.5% in July despite a 4.4% late rebound. It remains well below both averages with RSI 41, so momentum entering August is still negative.",
        watch: "Confirmation: reclaim SMA20; risk: the rebound fails within the damaged trend.",
        sourceSymbol: "IBM"
      },
      TEM: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: -24.3, lastClose: 43.87, shortWindow: "5 sessions", shortReturnPct: 2.8,
        versusSma20Pct: -14.3, versusSma50Pct: -14.0, rsi14: 38,
        summary: "TEM fell 24.3% in July and remains about 14% below both averages despite a modest late rebound. Momentum is negative into August and the trend has not yet stabilized.",
        watch: "Confirmation: build a base and reclaim SMA20; risk: another lower low.",
        sourceSymbol: "TEM"
      },
      LINK: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Mixed",
        julyReturnPct: 13.5, lastClose: 8.16, shortWindow: "7 days", shortReturnPct: -2.1,
        versusSma20Pct: -2.6, versusSma50Pct: 1.8, rsi14: 47,
        summary: "LINK gained 13.5% in July and remained above SMA50, but weakened over the final seven days and closed below SMA20. August momentum is mixed after the strong monthly advance.",
        watch: "Confirmation: reclaim SMA20; risk: a break below SMA50 erases the broader improvement.",
        sourceSymbol: "LINK-USD",
        sourceNote: "UTC 24/7 month boundary."
      },
      SPY: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Mixed",
        julyReturnPct: 0.03, lastClose: 747.03, shortWindow: "5 sessions", shortReturnPct: 1.1,
        versusSma20Pct: 0.2, versusSma50Pct: 0.3, rsi14: 53,
        summary: "SPY was effectively flat in July and finished only slightly above SMA20 and SMA50. A modest late gain gives August a mild positive tilt, but directional momentum remains limited.",
        watch: "Confirmation: expand above the July range; risk: losing both tightly grouped averages.",
        sourceSymbol: "SPY"
      },
      HOOD: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: -13.7, lastClose: 86.56, shortWindow: "5 sessions", shortReturnPct: -8.8,
        versusSma20Pct: -16.5, versusSma50Pct: -10.4, rsi14: 36,
        summary: "HOOD fell 13.7% in July and declined another 8.8% late, ending deeply below both averages. RSI 36 confirms negative momentum heading into August.",
        watch: "Confirmation: stabilize and reclaim SMA20; risk: continued downside without a base.",
        sourceSymbol: "HOOD"
      },
      AMD: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: -18.0, lastClose: 476.15, shortWindow: "5 sessions", shortReturnPct: -8.8,
        versusSma20Pct: -7.6, versusSma50Pct: -7.0, rsi14: 45,
        summary: "AMD lost 18.0% in July and weakened sharply late, finishing roughly 7% below both averages. Momentum remains negative entering August.",
        watch: "Confirmation: reclaim SMA20 and SMA50; risk: another decline from below-trend positioning.",
        sourceSymbol: "AMD"
      },
      HHH: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: -10.6, lastClose: 63.92, shortWindow: "5 sessions", shortReturnPct: -3.0,
        versusSma20Pct: -7.7, versusSma50Pct: -5.7, rsi14: 32,
        summary: "HHH fell 10.6% in July and ended below both averages with RSI 32. Momentum is negative into August, while the depressed RSI leaves room for volatile countertrend rebounds.",
        watch: "Confirmation: stabilize and reclaim SMA20; risk: oversold weakness persists.",
        sourceSymbol: "HHH"
      },
      MON: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Mixed",
        julyReturnPct: 13.0, lastClose: 0.0207, shortWindow: "7 days", shortReturnPct: -5.3,
        versusSma20Pct: -5.0, versusSma50Pct: -3.2, rsi14: 45,
        summary: "MON gained 13.0% in July, but fell 5.3% over the final seven days and ended below both averages. The monthly advance is intact while momentum into August has turned soft.",
        watch: "Confirmation: reclaim SMA20 and SMA50; risk: the late reversal erases July's advance.",
        sourceSymbol: "MON-USD",
        sourceNote: "UTC 24/7 month boundary."
      },
      CBRS: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Mixed",
        julyReturnPct: -10.1, lastClose: 198.71, shortWindow: "5 sessions", shortReturnPct: -0.2,
        versusSma20Pct: 2.5, versusSma50Pct: -6.6, rsi14: 49,
        summary: "CBRS fell 10.1% in July but stabilized above SMA20 while remaining below SMA50. August momentum is mixed, and the shorter 54-bar history warrants added caution.",
        watch: "Confirmation: hold SMA20 and reclaim SMA50; risk: limited history and renewed weakness.",
        sourceSymbol: "CBRS",
        sourceNote: "Limited 54-session history for the 50-day comparison."
      },
      ADBE: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Positive",
        julyReturnPct: 22.1, lastClose: 250.41, shortWindow: "5 sessions", shortReturnPct: 11.2,
        versusSma20Pct: 8.4, versusSma50Pct: 9.7, rsi14: 60,
        summary: "ADBE gained 22.1% in July and accelerated late, closing firmly above both averages. RSI 60 supports positive momentum into August without signaling an extreme condition.",
        watch: "Confirmation: hold above SMA20; risk: profit-taking after July's strong advance.",
        sourceSymbol: "ADBE"
      },
      AXP: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Mixed",
        julyReturnPct: -0.6, lastClose: 336.25, shortWindow: "5 sessions", shortReturnPct: 3.1,
        versusSma20Pct: -2.8, versusSma50Pct: 0.8, rsi14: 47,
        summary: "AXP was nearly flat in July and gained 3.1% late, but ended below SMA20 while holding near SMA50. Momentum entering August is mixed with tentative stabilization.",
        watch: "Confirmation: reclaim SMA20; risk: losing SMA50 after the incomplete rebound.",
        sourceSymbol: "AXP"
      },
      GOOGL: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Mixed",
        julyReturnPct: -0.3, lastClose: 356.13, shortWindow: "5 sessions", shortReturnPct: 11.4,
        versusSma20Pct: 2.3, versusSma50Pct: -0.7, rsi14: 54,
        summary: "GOOGL was nearly flat in July but rallied 11.4% late and moved above SMA20. Its position just below SMA50 keeps the August outlook mixed, though near-term momentum has improved.",
        watch: "Confirmation: reclaim SMA50; risk: the late rebound reverses below SMA20.",
        sourceSymbol: "GOOGL"
      },
      XRP: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: 2.1, lastClose: 1.06, shortWindow: "7 days", shortReturnPct: -2.8,
        versusSma20Pct: -3.1, versusSma50Pct: -4.2, rsi14: 41,
        summary: "XRP gained 2.1% in July, but weakened over the final seven days and closed below both averages with RSI 41. Momentum heading into August is negative.",
        watch: "Confirmation: reclaim SMA20 and SMA50; risk: the modest July gain fully reverses.",
        sourceSymbol: "XRP-USD",
        sourceNote: "UTC 24/7 month boundary."
      },
      COIN: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Negative",
        julyReturnPct: 0.05, lastClose: 146.26, shortWindow: "5 sessions", shortReturnPct: -7.6,
        versusSma20Pct: -9.7, versusSma50Pct: -11.0, rsi14: 40,
        summary: "COIN was effectively flat in July, but fell 7.6% late and ended well below both averages. The flat monthly return masks negative momentum entering August.",
        watch: "Confirmation: reclaim SMA20; risk: continued weakness below both trend measures.",
        sourceSymbol: "COIN"
      },
      USOIL: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Positive",
        julyReturnPct: 21.8, lastClose: 84.67, shortWindow: "5 sessions", shortReturnPct: -5.2,
        versusSma20Pct: 5.5, versusSma50Pct: 3.0, rsi14: 55,
        summary: "The NYMEX WTI futures proxy gained 21.8% in July and remained above both averages despite a late pullback. Momentum is positive into August, but near-term strength has cooled.",
        watch: "Confirmation: hold SMA20; risk: deeper pullback or futures roll effects versus spot oil.",
        sourceSymbol: "CL=F",
        sourceNote: "NYMEX WTI futures proxy; contract rolls may differ from spot oil."
      },
      BULL: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Mixed",
        julyReturnPct: 8.3, lastClose: 7.06, shortWindow: "5 sessions", shortReturnPct: -5.7,
        versusSma20Pct: -5.2, versusSma50Pct: 2.7, rsi14: 46,
        summary: "BULL gained 8.3% in July and remained above SMA50, but a 5.7% late decline pushed it below SMA20. August momentum is mixed after the monthly advance lost strength.",
        watch: "Confirmation: reclaim SMA20; risk: a break below SMA50 reverses the broader improvement.",
        sourceSymbol: "BULL"
      },
      SNAP: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Mixed",
        julyReturnPct: 5.6, lastClose: 4.69, shortWindow: "5 sessions", shortReturnPct: 7.8,
        versusSma20Pct: 1.4, versusSma50Pct: -6.3, rsi14: 49,
        summary: "SNAP gained 5.6% in July and rallied 7.8% late, moving above SMA20. The rebound improves near-term momentum, but its position below SMA50 keeps August's outlook mixed.",
        watch: "Confirmation: reclaim SMA50; risk: the rebound fails back below SMA20.",
        sourceSymbol: "SNAP"
      },
      CLF: {
        period: "July 2026", asOf: "2026-07-31", momentum: "Positive",
        julyReturnPct: 22.7, lastClose: 11.52, shortWindow: "5 sessions", shortReturnPct: -3.4,
        versusSma20Pct: 12.3, versusSma50Pct: 1.2, rsi14: 58,
        summary: "CLF gained 22.7% in July and remained above both averages despite a late pullback. Momentum is positive into August, though its 12.3% distance above SMA20 leaves room for consolidation.",
        watch: "Confirmation: hold above SMA20; risk: a deeper retracement after July's sharp advance.",
        sourceSymbol: "CLF"
      }
    },
    tickers: [
      {
        ticker: "TGT",
        name: "Target Corporation",
        tvSymbol: "NYSE:TGT",
        postedChartUrl: "https://www.tradingview.com/x/W1isJICm/",
        postedChartDate: "2026-08-19",
        postedChartChannel: "ai-day-trading",
        analysisTimeframe: "Intraday / 5-minute",
        chartReady: true,
        assetClass: "Stock",
        sector: "Consumer Defensive / Discount Retail",
        risk: "Elevated",
        tags: ["retail", "earnings", "gap reversal", "triggered setup", "time-limited"],
        summary:
          "A retailer catalyst reversal whose breakout-and-retest sequence triggered, but finished the session between its stop and targets without a defined closing-bell exit.",
        levels: {
          support: [
            { price: "$160.00", note: "Retest area that held after the qualifying breakout" },
            { price: "$158.50", note: "Planned stop after entry" },
            { price: "$156.90", note: "Session VWAP cited at the original review time" }
          ],
          resistance: [
            { price: "$160.50", note: "Completed five-minute breakout and entry level" },
            { price: "$163.50", note: "Take-profit level 1" },
            { price: "$166.50", note: "Take-profit level 2" }
          ]
        },
        bullish: [
          "TGT reversed an earnings gap-down from $146.21, reclaimed the prior $152.48 close, and held above session VWAP near $156.90 at review time",
          "The later $160.50 breakout and $160.00 retest completed the setup's confirmation sequence",
          "Q2 net sales rose 5.3%, comparable sales grew 3.8%, and traffic increased 3.6%"
        ],
        bearish: [
          "Neither the $163.50 first target nor the $158.50 stop traded after the trigger, leaving the setup unresolved at the close",
          "The original day-trade plan omitted a closing-bell exit rule",
          "Reported $4.11 EPS included $1.65 from a one-time tariff refund, leaving margin follow-through as a risk"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "The setup triggered, but it ended between its stop and targets; a missing closing-bell rule prevents a defensible closed result."
        },
        fundamentals: {
          rating: "Moderate",
          rationale:
            "Sales, comparable growth, traffic, and the higher outlook were constructive, while the one-time EPS benefit and margin follow-through limit conviction.",
          metrics: [
            { label: "Q2 net sales", value: "+5.3% YoY" },
            { label: "Comparable sales", value: "+3.8%" },
            { label: "Traffic", value: "+3.6%" },
            { label: "Setup outcome", value: "Triggered · unresolved at close" }
          ]
        }
      },
      {
        ticker: "MRVL",
        name: "Marvell Technology",
        tvSymbol: "NASDAQ:MRVL",
        postedChartUrl: "https://www.tradingview.com/x/BVJy2Tzh/",
        postedChartDate: "2026-08-19",
        postedChartChannel: "ai-swing-trading",
        analysisTimeframe: "Daily / swing",
        chartReady: true,
        assetClass: "Stock",
        sector: "Technology / Semiconductors",
        risk: "High",
        tags: ["semiconductors", "custom silicon", "Google", "catalyst gap", "watch only"],
        summary:
          "A high-volatility semiconductor catalyst gap reviewed as a conditional swing setup that requires a completed base before breakout confirmation.",
        levels: {
          support: [
            { price: "$228–$234", note: "Required completed daily-base zone before entry" },
            { price: "$222", note: "Cancellation level and planned daily-close stop" }
          ],
          resistance: [
            { price: "$240.50", note: "Required later daily-close trigger after the base" },
            { price: "$277.50", note: "Take-profit level 1" },
            { price: "$314.50", note: "Take-profit level 2" }
          ]
        },
        bullish: [
          "The Aug. 19 catalyst gap followed disclosure of an expanded Google custom-silicon agreement",
          "Q1 revenue rose 28% to a record $2.418B",
          "Operating cash flow reached $638.8M"
        ],
        bearish: [
          "RSI near 70 and ATR near $17.43 showed enough extension and volatility to require a base instead of a chase",
          "The Google-linked warrant can dilute shareholders",
          "Most warrant vesting depends on discretionary Google purchase volume rather than guaranteed revenue"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "Growth and the Google agreement are constructive, but the setup needs a $228–$234 daily close before any later break above $240.50."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "Record revenue growth and operating cash flow support the business, balanced against warrant dilution and purchase-volume uncertainty in the Google agreement.",
          metrics: [
            { label: "Q1 revenue", value: "$2.418B · +28% YoY" },
            { label: "Operating cash flow", value: "$638.8M" },
            { label: "Partner", value: "Expanded Google custom silicon" },
            { label: "Warrant capacity", value: "Up to 58.97M shares" }
          ]
        }
      },
      {
        ticker: "MRK",
        name: "Merck & Co.",
        tvSymbol: "NYSE:MRK",
        postedChartUrl: "https://www.tradingview.com/x/Qbwhst7e/",
        postedChartDate: "2026-08-19",
        postedChartChannel: "ai-long-term-investing",
        analysisTimeframe: "Daily / long-term",
        chartReady: true,
        assetClass: "Stock",
        sector: "Healthcare / Pharmaceuticals",
        risk: "Moderate",
        tags: ["pharmaceuticals", "oncology", "KEYTRUDA", "breakout", "watch only"],
        summary:
          "A profitable pharmaceutical leader reviewed as a patient pullback-and-reclaim idea after a catalyst gap, not as a filled portfolio position.",
        levels: {
          support: [
            { price: "$136–$140", note: "Required pullback zone before a qualifying entry" },
            { price: "$128", note: "Planned stop after a confirmed entry" }
          ],
          resistance: [
            { price: "$140", note: "Required bullish daily-close reclaim after the pullback" },
            { price: "$164", note: "Take-profit level 1" },
            { price: "$176", note: "Take-profit level 2" }
          ]
        },
        bullish: [
          "The catalyst gap cleared the prior $137.98 high on heavy volume",
          "Price was above rising 20-, 50-, and 200-day averages near $132, $127, and $115 at review time",
          "Q2 sales rose 5% to $16.6B while WINREVAIR sales rose 75% to $588M"
        ],
        bearish: [
          "Daily RSI near 82 showed the first move was extended and required a pullback rather than a chase",
          "Regulatory uncertainty remains a material risk",
          "KEYTRUDA-family concentration remains significant despite pipeline diversification"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "The trend and operating results are constructive, but RSI near 82 argues for a $136–$140 pullback and confirmed reclaim before entry."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "Sales growth, higher guidance, and WINREVAIR momentum support the franchise, balanced against regulatory uncertainty and KEYTRUDA concentration.",
          metrics: [
            { label: "Q2 sales", value: "$16.6B · +5% YoY" },
            { label: "KEYTRUDA family", value: "$8.4B · +5% YoY" },
            { label: "WINREVAIR", value: "$588M · +75% YoY" },
            { label: "2026 outlook", value: "Sales guidance raised" }
          ]
        }
      },
      {
        ticker: "AMGN",
        name: "Amgen",
        tvSymbol: "NASDAQ:AMGN",
        postedChartUrl: "https://www.tradingview.com/x/mLCkJ9rZ/",
        postedChartDate: "2026-08-18",
        postedChartChannel: "ai-long-term-investing",
        analysisTimeframe: "Daily and weekly",
        chartReady: true,
        assetClass: "Stock",
        sector: "Healthcare / Biotechnology",
        risk: "Moderate",
        tags: ["biotechnology", "cash flow", "breakout", "watch only"],
        summary:
          "A profitable biotechnology leader with a strong trend, reviewed as a patient pullback-and-reclaim idea rather than a portfolio position.",
        levels: {
          support: [
            { price: "$414–$420", note: "Required pullback zone before a qualifying entry" },
            { price: "$378", note: "Planned weekly-closing invalidation after entry" }
          ],
          resistance: [
            { price: "$422", note: "Reclaim level required after the pullback" },
            { price: "$510", note: "Take-profit level 1" },
            { price: "$554", note: "Take-profit level 2" }
          ]
        },
        bullish: [
          "Price broke above the prior $421.79 high and remains above rising 20-, 50-, and 200-day averages",
          "Q2 revenue rose 10% to $10.1B and free cash flow reached $3.5B",
          "Full-year guidance calls for $38.2B–$39.4B of revenue"
        ],
        bearish: [
          "Daily and weekly RSI readings above 70 show the chart is extended",
          "The required $414–$420 pullback had not occurred at the review time, so no entry was recognized",
          "Prolia biosimilar pressure and $57.3B of debt remain material risks"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "The long-term trend and cash generation are constructive, but the setup remains watch-only until a pullback into $414–$420 and a $422 reclaim."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "Revenue growth, product sales, and free cash flow support the franchise, balanced against biosimilar pressure and a leveraged balance sheet.",
          metrics: [
            { label: "Q2 revenue", value: "$10.1B · +10% YoY" },
            { label: "Q2 free cash flow", value: "$3.5B" },
            { label: "FY revenue guide", value: "$38.2B–$39.4B" },
            { label: "Debt", value: "$57.3B" }
          ]
        }
      },
      {
        ticker: "HAE",
        name: "Haemonetics Corporation",
        tvSymbol: "NYSE:HAE",
        postedChartUrl: "https://www.tradingview.com/x/v2fBNkrd/",
        postedChartDate: "2026-08-18",
        postedChartChannel: "ai-swing-trading",
        analysisTimeframe: "Daily / swing",
        chartReady: true,
        assetClass: "Stock",
        sector: "Healthcare / Medical Devices",
        risk: "Elevated",
        tags: ["medical devices", "catalyst gap", "relative strength", "watch only"],
        summary:
          "A medical-technology catalyst gap reviewed as a conditional swing setup that still needs a base and daily-close confirmation.",
        levels: {
          support: [
            { price: "$100", note: "Base must hold above this area before entry" },
            { price: "$99.50", note: "Planned stop after a confirmed entry" },
            { price: "$92.25", note: "Prior breakout level" }
          ],
          resistance: [
            { price: "$107.50", note: "Required daily-close trigger after a two-session base" },
            { price: "$119.50", note: "Take-profit level 1" },
            { price: "$131.50", note: "Take-profit level 2" }
          ]
        },
        bullish: [
          "The catalyst gap cleared $92.25 resistance above rising major moving averages",
          "Fiscal-Q1 revenue rose 5.6%, organic revenue grew 5.9%, and free cash flow reached $39.1M",
          "Management raised fiscal-2027 guidance"
        ],
        bearish: [
          "RSI near 84 made the first-day move too extended to chase",
          "A two-session base above $100 and daily close above $107.50 had not yet formed",
          "The CSL agreement is nonexclusive, has no minimum purchases, and did not change guidance"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "The catalyst and trend are constructive, but the setup remains watch-only until HAE bases above $100 and closes above $107.50."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "Organic growth, free cash flow, and higher guidance support the business, while the new supply agreement should not be treated as guaranteed revenue.",
          metrics: [
            { label: "Fiscal-Q1 revenue", value: "+5.6% YoY" },
            { label: "Organic revenue", value: "+5.9% YoY" },
            { label: "Free cash flow", value: "$39.1M" },
            { label: "Setup status", value: "Watching · not triggered" }
          ]
        }
      },
      {
        ticker: "BABA",
        name: "Alibaba Group",
        tvSymbol: "NYSE:BABA",
        chartUrl: "https://www.tradingview.com/chart/5JLhvnvV/",
        postedChartUrl: "https://www.tradingview.com/x/hBAtF6dp/",
        postedChartDate: "2026-07-31",
        postedChartChannel: "stocks",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Stock (ADR)",
        sector: "China Internet / E-commerce",
        risk: "High",
        tags: ["China", "e-commerce", "cloud", "AI", "ADR"],
        summary:
          "China's e-commerce and cloud leader — a value-and-AI story that carries China and ADR risk.",
        levels: {
          support: [
            { price: "$120", note: "Reclaimed level that now needs to hold" },
            { price: "$109.99", note: "Fallback support if the breakout fails" }
          ],
          resistance: [
            { price: "$130–$138", note: "Recent-high zone after a confirmed $120 hold" }
          ]
        },
        bullish: [
          "Holding above $120 would strengthen the rebound and put the $130–$138 recent-high zone in focus",
          "Dominant China e-commerce franchise (Taobao, Tmall) with a vast user base",
          "Alibaba Cloud re-accelerating on AI demand — the key growth driver",
          "Large net-cash balance sheet funds sizable buybacks"
        ],
        bearish: [
          "A move back below $120 would weaken the breakout and refocus $109.99 support",
          "China regulatory, macro, and consumer-demand uncertainty",
          "Intense domestic competition (PDD, Douyin/ByteDance, JD)",
          "U.S.–China tension plus ADR and VIE-structure risk"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "The $120 reclaim improves the setup, but it still needs confirmation; cloud growth and net cash are balanced by China risk."
        },
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
        postedChartUrl: "https://www.tradingview.com/x/tUSWgWAf/",
        postedChartDate: "2026-07-13",
        postedChartChannel: "stocks",
        analysisTimeframe: "6 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Consumer Tech / Devices & Services",
        risk: "Moderate",
        tags: ["mega-cap", "devices", "services", "buybacks"],
        summary:
          "The iPhone-and-services cash machine — steady compounding, watched for its next AI move.",
        levels: {
          support: [
            { price: "$317.00", note: "Breakout area that needs to hold" },
            { price: "$309–$310", note: "Blue-trendline support" }
          ],
          resistance: [
            { price: "$323.00", note: "Recent all-time-high area" }
          ]
        },
        bullish: [
          "Holding $317 and clearing $323 would confirm continuation into price discovery",
          "Services revenue grows the margin-rich recurring layer",
          "Massive free cash flow funds relentless buybacks",
          "Ecosystem lock-in across devices, payments, and content"
        ],
        bearish: [
          "A rejection below $317 would make the breakout look failed and refocus $309–$310",
          "Hardware growth has matured; iPhone cycles are lumpier",
          "China exposure on both demand and supply chains",
          "Regulatory pressure on App Store economics"
        ],
        aiAnalysis: {
          rating: "Buy",
          why: "Price cleared $323 and elite cash generation supports upside; slower growth and a premium valuation cap conviction."
        },
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
        postedChartUrl: "https://www.tradingview.com/x/aBXhwO89/",
        postedChartDate: "2026-07-27",
        postedChartChannel: "stocks",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Streaming / Media",
        risk: "Elevated",
        tags: ["streaming", "ads", "subscription"],
        summary:
          "The streaming leader monetizing a huge subscriber base with ads and live events.",
        levels: {
          support: [
            { price: "$70", note: "Key level bulls are attempting to hold as support" },
            { price: "$66.16", note: "Fallback support if $70 fails" }
          ],
          resistance: [
            { price: "$74.90", note: "First resistance while $70 holds" },
            { price: "$82.01", note: "Next target after a confirmed breakout" }
          ]
        },
        bullish: [
          "Holding $70 as support would put $74.90 and then $82.01 in view",
          "Ad tier and paid sharing open new monetization layers",
          "Consistently positive and growing free cash flow",
          "Live events and games extend engagement"
        ],
        bearish: [
          "Losing $70 without a reclaim would refocus $66.16 support",
          "Streaming competition keeps content spend elevated",
          "Ad business must scale to justify expectations",
          "Price hikes test churn in a squeezed consumer"
        ],
        aiAnalysis: {
          rating: "Buy",
          why: "Q2 revenue rose 13% with a 33% margin; a confirmed $70 support flip favors $74.90 and $82.01."
        },
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
        postedChartUrl: "https://www.tradingview.com/x/pbK050Ku/",
        postedChartDate: "2026-08-07",
        postedChartChannel: "stocks",
        analysisTimeframe: "6 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Software / AI Platforms",
        risk: "Very High",
        tags: ["AI", "software", "government", "high beta"],
        summary:
          "AIP-driven commercial growth on top of a sticky government franchise — priced for a lot of it.",
        levels: {
          support: [
            { price: "$164", note: "Breakout level that needs to hold" }
          ],
          resistance: [
            { price: "$189.61–$199.17", note: "Next target zone" }
          ]
        },
        bullish: [
          "Holding $164 as support would keep the $189.61–$199.17 target zone in view",
          "Strong U.S. commercial growth driven by AIP adoption",
          "Government contracts provide a recurring, sticky base",
          "GAAP profitable with high gross margins"
        ],
        bearish: [
          "Falling back below $164 would weaken the breakout and raise failed-move risk",
          "Among the richest valuations in software",
          "Stock-based compensation dilutes shareholders",
          "Deal-driven revenue can be lumpy quarter to quarter"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "Growth and margins are strong, but the breakout must hold $164 before the $189.61–$199.17 target zone is actionable."
        },
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
        postedChartUrl: "https://www.tradingview.com/x/yWFjVaXr/",
        postedChartDate: "2026-07-21",
        postedChartChannel: "stocks",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Software / Cloud",
        risk: "Moderate",
        tags: ["mega-cap", "cloud", "AI", "enterprise"],
        summary:
          "The enterprise default — Azure and Copilot put it at the center of the AI build-out.",
        levels: {
          support: [
            { price: "Recent range", note: "Qualitative pullback area named after a rejection" }
          ],
          resistance: [
            { price: "$398.60", note: "Immediate decision resistance" },
            { price: "$448.76", note: "Next resistance after a confirmed breakout" }
          ]
        },
        bullish: [
          "Breaking above $398.60 and holding it as support would put $448.76 in view",
          "Azure growth with deep AI integration across the stack",
          "Copilot monetizes AI inside an entrenched office suite",
          "Diversified enterprise moat across cloud, OS, gaming, and LinkedIn"
        ],
        bearish: [
          "Another rejection at $398.60 would refocus the recent range",
          "Heavy AI capex pressures near-term free cash flow",
          "AI monetization pace may lag the spend",
          "Antitrust and regulatory attention persists across markets"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "Very strong fundamentals, but $398.60 remains resistance after rejection; confirm the break before targeting $448.76."
        },
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
        postedChartUrl: "https://www.tradingview.com/x/pXB3nxGw/",
        postedChartDate: "2026-07-27",
        postedChartChannel: "stocks",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Internet / Advertising",
        risk: "Moderate",
        tags: ["mega-cap", "ads", "AI"],
        summary:
          "A highly profitable ad engine reinvesting aggressively into AI.",
        levels: {
          support: [
            { price: "$544.12", note: "Next major support after the breakdown" }
          ],
          resistance: [
            { price: "$606.21", note: "Lost support and immediate reclaim level" },
            { price: "$677.06", note: "Upside resistance after a confirmed reclaim" }
          ]
        },
        bullish: [
          "Reclaiming $606.21 and holding it as support would preserve another potential move toward $677.06",
          "Massive, highly profitable advertising engine",
          "AI is measurably improving engagement and ad targeting",
          "Large free cash flow funds buybacks and the AI build-out"
        ],
        bearish: [
          "Repeated rejection at $606.21 keeps $544.12 support exposed",
          "Reality Labs continues to post large losses",
          "Ongoing regulatory and antitrust overhang",
          "Heavy AI capex pressures near-term free cash flow"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "Revenue grew 33% with a 41% margin, but repeated $606.21 rejection makes confirmation preferable."
        },
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
        postedChartUrl: "https://www.tradingview.com/x/SEGmrJR7/",
        postedChartDate: "2026-07-23",
        postedChartChannel: "stocks",
        analysisTimeframe: "1 week",
        chartReady: true,
        assetClass: "Stock",
        sector: "Software / Cloud Infrastructure",
        risk: "Elevated",
        tags: ["cloud", "AI infrastructure", "database", "enterprise"],
        summary:
          "The legacy database giant turned AI-infrastructure player, with OCI booking huge backlog.",
        levels: {
          support: [
            { price: "$123", note: "Short-term support where the selloff began to stall" }
          ],
          resistance: [
            { price: "$141", note: "Lost trendline support and key reclaim level" }
          ]
        },
        bullish: [
          "Reclaiming $141 and holding it as support would begin to repair the breakdown",
          "OCI rides AI training demand with major customer wins",
          "Very large contracted backlog (RPO) underpins growth",
          "Sticky database and enterprise-app installed base"
        ],
        bearish: [
          "Rejection near $141 or a break below $123 would keep downside pressure in control",
          "AI data-center build-out requires heavy capex and debt",
          "Competition from larger, better-capitalized clouds",
          "Backlog conversion timing is uncertain"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "OCI growth is strong, but price is below $123 support; leverage, heavy capex and $141 resistance favor waiting."
        },
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
      },
      {
        ticker: "TSM",
        name: "Taiwan Semiconductor",
        tvSymbol: "NYSE:TSM",
        postedChartUrl: "https://www.tradingview.com/x/jgTWIthz/",
        postedChartDate: "2026-07-13",
        postedChartChannel: "stocks",
        analysisTimeframe: "6 hours",
        chartReady: true,
        assetClass: "Stock (ADR)",
        sector: "Semiconductors / Foundry",
        risk: "Elevated",
        tags: ["semiconductors", "foundry", "AI infrastructure", "Taiwan"],
        summary:
          "The leading semiconductor foundry — central to advanced-chip demand, with cyclical and geopolitical risk.",
        levels: {
          support: [
            { price: "$429", note: "Lower-channel support in the latest chart" }
          ],
          resistance: [
            { price: "$457.58", note: "First resistance area" },
            { price: "$478.98", note: "Next resistance after a stronger breakout" }
          ]
        },
        bullish: [
          "Holding $429 keeps the lower-channel rebound intact toward $457.58 and $478.98",
          "Leadership in advanced chip manufacturing supports long-term AI and high-performance computing demand",
          "Scale and process expertise create a difficult-to-replicate competitive position",
          "Advanced-process demand supports long-term foundry utilization"
        ],
        bearish: [
          "A clean break below $429 and the blue channel would weaken the rebound structure",
          "Semiconductor demand and capital spending remain cyclical",
          "Large fabrication investments require sustained utilization and execution",
          "Taiwan-related geopolitical risk can drive volatility independent of execution"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "Advanced-chip leadership is strong, but price is below $429 support; wait for a reclaim before $457.58 and $478.98."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "Industry-leading manufacturing scale and advanced-process leadership support the long-term case. Cyclicality, capital intensity, and Taiwan geopolitical exposure keep the risk above moderate.",
          metrics: [
            { label: "Revenue driver", value: "Advanced-chip demand" },
            { label: "Margins", value: "Strong for a foundry" },
            { label: "Capital intensity", value: "High" },
            { label: "Primary risk", value: "Cycle and geopolitics" }
          ]
        }
      },
      {
        ticker: "CRCL",
        name: "Circle Internet Group",
        tvSymbol: "NYSE:CRCL",
        postedChartUrl: "https://www.tradingview.com/x/vWqYXYsP/",
        postedChartDate: "2026-07-27",
        postedChartChannel: "stocks",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Fintech / Stablecoin Infrastructure",
        risk: "High",
        tags: ["stablecoins", "payments", "blockchain", "rates"],
        summary:
          "The operator behind USDC and EURC, with reserve income funding a broader payments and blockchain-infrastructure build-out.",
        levels: {
          support: [
            { price: "$64.00", note: "Immediate support under pressure in the latest chart" },
            { price: "$49.62", note: "Next named support if $64 fails" }
          ],
          resistance: [
            { price: "$70–$71", note: "First rebound target while $64 holds" }
          ]
        },
        bullish: [
          "Defending $64 with stronger momentum would put $70–$71 in view",
          "USDC scale expands the network and reserve-income base",
          "Payments, developer tools, and Arc create diversification optionality",
          "A regulated operating posture may help with institutional adoption"
        ],
        bearish: [
          "Repeated tests at $64 raise breakdown risk toward $49.62",
          "Reserve income remains highly sensitive to rates and USDC circulation",
          "Distribution economics depend materially on partners including Coinbase",
          "Regulatory, redemption, cybersecurity, and new-product execution risks remain high"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "Revenue rose 20%, but operating income halved and the rebound near $64 is weak; support must hold."
        },
        fundamentals: {
          rating: "Moderate",
          rationale:
            "Rapid network growth and current profitability are offset by concentrated reserve income, partner dependence, and evolving regulatory and technology risk.",
          metrics: [
            { label: "Revenue driver", value: "Reserve income dominant" },
            { label: "Network assets", value: "USDC and EURC" },
            { label: "Diversification", value: "Early" },
            { label: "Primary sensitivity", value: "Rates and circulation" }
          ]
        }
      },
      {
        ticker: "VIX",
        name: "Cboe Volatility Index",
        tvSymbol: "TVC:VIX",
        postedChartUrl: "https://www.tradingview.com/x/xRql2ppN/",
        postedChartDate: "2026-07-31",
        postedChartChannel: "stocks",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Index",
        sector: "Equity Volatility",
        risk: "Very High",
        tags: ["volatility", "SPX options", "hedging", "mean reversion"],
        summary:
          "A non-investable spot benchmark for expected 30-day S&P 500 volatility; tradable derivatives can behave very differently from spot VIX.",
        levels: {
          support: [
            { price: "$13.97", note: "Preferred observation level for a confirmed rebound" }
          ],
          resistance: [
            { price: "Recent local highs", note: "The post did not name a numeric upside level" }
          ]
        },
        bullish: [
          "A pullback toward $13.97 followed by a strong rebound could support a mean-reversion move",
          "It is a transparent, forward-looking volatility benchmark",
          "VIX derivatives can provide tactical portfolio-hedging tools",
          "The implied-versus-realized volatility gap supports distinct analytical strategies"
        ],
        bearish: [
          "A break below $13.97 would weaken the chart's lower-support thesis",
          "Spot VIX cannot be purchased or held directly",
          "Mean reversion makes VIX derivatives unsuitable as conventional buy-and-hold assets",
          "Term structure, roll yield, basis, leverage, and expiration can dominate returns"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "There is no active setup until $13.97 is tested and holds; spot VIX is non-investable and strongly mean-reverting."
        },
        fundamentals: {
          rating: "Moderate",
          rationale:
            "VIX is a useful and transparent risk benchmark, but any tradable exposure is complex, path-dependent, and materially different from the spot index.",
          metrics: [
            { label: "Horizon", value: "Constant 30-day" },
            { label: "Inputs", value: "SPX option prices" },
            { label: "Construction", value: "Variance interpolation" },
            { label: "Key behavior", value: "Mean reversion" }
          ]
        }
      },
      {
        ticker: "IWM",
        name: "iShares Russell 2000 ETF",
        tvSymbol: "AMEX:IWM",
        postedChartUrl: "https://www.tradingview.com/x/KT5HFVgq/",
        postedChartDate: "2026-07-22",
        postedChartChannel: "stocks",
        analysisTimeframe: "6 hours",
        chartReady: true,
        assetClass: "ETF",
        sector: "Broad U.S. Small-Cap Equity",
        risk: "Elevated",
        tags: ["Russell 2000", "small cap", "index ETF", "diversified"],
        summary:
          "A passive ETF seeking to track the Russell 2000 Index through broad exposure to U.S. small-cap equities.",
        levels: {
          support: [
            { price: "$292.66", note: "Key support under the current consolidation" },
            { price: "$279.12", note: "Next Fib support after a confirmed breakdown" }
          ],
          resistance: [
            { price: "Recent highs", note: "First upside area named in the latest post" },
            { price: "$309.91", note: "Next resistance after a continuation" }
          ]
        },
        bullish: [
          "Holding $292.66 would preserve the bullish structure toward recent highs and then $309.91",
          "About 1,970 holdings spread company-specific risk across the U.S. small-cap universe",
          "A 0.19% expense ratio and narrow recent bid-ask spread support efficient access",
          "Exposure spans all major equity sectors, reducing dependence on one small-cap industry"
        ],
        bearish: [
          "Losing $292.66 without a reclaim would expose the next Fib support around $279.12",
          "A 1.27 three-year beta and 19.98% three-year standard deviation indicate elevated volatility",
          "Health care and financials together create meaningful sector-cycle exposure",
          "The benchmark-tracking mandate offers no discretionary defense during broad small-cap drawdowns"
        ],
        aiAnalysis: {
          rating: "Buy",
          why: "Broad small-cap exposure and a hold above $292.66 favor recent highs and $309.91, with elevated cyclical risk."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "Broad diversification, low stated costs, and strong trading liquidity support the structure, while above-market beta and small-cap cyclicality keep risk elevated.",
          metrics: [
            { label: "Holdings", value: "1,970" },
            { label: "Expense ratio", value: "0.19%" },
            { label: "3-year beta", value: "1.27" },
            { label: "3-year volatility", value: "19.98%" }
          ]
        }
      },
      {
        ticker: "QQQ",
        name: "Invesco QQQ ETF",
        tvSymbol: "NASDAQ:QQQ",
        postedChartUrl: "https://www.tradingview.com/x/11TuD6Yn/",
        postedChartDate: "2026-08-07",
        postedChartChannel: "stocks",
        analysisTimeframe: "6 hours",
        chartReady: true,
        assetClass: "ETF",
        sector: "Nasdaq-100 / Large Growth",
        risk: "Elevated",
        tags: ["ETF", "Nasdaq-100", "large growth", "technology"],
        summary:
          "A liquid Nasdaq-100 ETF offering concentrated exposure to large nonfinancial growth companies.",
        levels: {
          support: [
            { price: "$711", note: "Dip-buying area named in the preceding update" },
            { price: "$705.23", note: "Nearest marked support in the latest chart" },
            { price: "$696.08", note: "Next marked support below $705.23" },
            { price: "$687.28", note: "Deeper chart support" },
            { price: "$667.11", note: "Major lower support" },
            { price: "$640.31", note: "Lowest marked support in the latest chart" }
          ],
          resistance: [
            { price: "$722", note: "Immediate breakout decision level" },
            { price: "$745.88", note: "Next marked resistance after a confirmed breakout" }
          ]
        },
        bullish: [
          "Holding the $711–$705.23 area and clearing $722 would put $745.88 in view",
          "One vehicle provides exposure to 100 large Nasdaq-listed companies",
          "Long operating history and active trading support liquidity",
          "Periodic rebalancing and reconstitution refresh the index exposure"
        ],
        bearish: [
          "Rejection at $722 followed by a break below $705.23 would refocus $696.08 and deeper chart supports",
          "Mega-cap and growth-sector concentration can amplify drawdowns",
          "Rate and valuation changes can pressure long-duration growth assets",
          "QQQ is not a broad-market fund and excludes financial companies"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "QQQ is pressing $722 resistance; holding $711–$705.23 is constructive, while a breakout would open $745.88."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "QQQ offers efficient access to established large-growth companies, balanced against meaningful mega-cap and sector concentration.",
          metrics: [
            { label: "Mandate", value: "Tracks Nasdaq-100" },
            { label: "Coverage", value: "100 nonfinancial companies" },
            { label: "Refresh", value: "Quarterly / annual" },
            { label: "Primary risk", value: "Growth concentration" }
          ]
        }
      },
      {
        ticker: "BTC",
        name: "Bitcoin",
        tvSymbol: "BITSTAMP:BTCUSD",
        postedChartUrl: "https://www.tradingview.com/x/ncwziUG7/",
        postedChartDate: "2026-08-07",
        postedChartChannel: "crypto",
        analysisTimeframe: "6 hours",
        chartReady: true,
        assetClass: "Digital asset",
        sector: "Cryptocurrency / Monetary Network",
        risk: "Very High",
        tags: ["Bitcoin", "proof-of-work", "fixed supply", "macro liquidity"],
        summary:
          "A decentralized proof-of-work monetary network whose thesis rests on verifiable scarcity and sustained network demand, not cash flow.",
        levels: {
          support: [
            { price: "$60,029", note: "Major marked support in the latest chart" }
          ],
          resistance: [
            { price: "$65,552", note: "Immediate breakout decision level" },
            { price: "$68,959", note: "Next marked resistance after a confirmed breakout" }
          ]
        },
        bullish: [
          "Clearing $65,552 would strengthen momentum toward the next marked level at $68,959",
          "Programmatic scarcity caps supply at 21 million BTC",
          "Independent nodes validate the monetary rules without a central operator",
          "Proof-of-work and confirmations make historical rewrites progressively harder"
        ],
        bearish: [
          "Repeated rejection at $65,552 would keep BTC rangebound, while losing $60,029 would materially weaken the structure",
          "There is no issuer, earnings stream, or contractual cash flow",
          "Volatility, custody, irreversibility, and congestion can create sharp losses",
          "Energy use and policy changes remain material external risks"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "BTC is testing $65,552 resistance; a breakout favors $68,959, while $60,029 remains the major downside level."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "Bitcoin has a durable scarcity and settlement design, but value depends on adoption and demand while volatility, custody, and policy risk remain extreme.",
          metrics: [
            { label: "Maximum supply", value: "21 million BTC" },
            { label: "Issuance reset", value: "Every 210,000 blocks" },
            { label: "Block cadence", value: "About 10 minutes" },
            { label: "Security model", value: "Proof-of-work" }
          ]
        }
      },
      {
        ticker: "ETH",
        name: "Ether",
        tvSymbol: "COINBASE:ETHUSD",
        postedChartUrl: "https://www.tradingview.com/x/VcwfiLXP/",
        postedChartDate: "2026-08-07",
        postedChartChannel: "crypto",
        analysisTimeframe: "6 hours",
        chartReady: true,
        assetClass: "Digital asset",
        sector: "Blockchain Infrastructure",
        risk: "Very High",
        tags: ["Ethereum", "proof-of-stake", "smart contracts", "layer 2"],
        summary:
          "The native asset of Ethereum, used for transaction fees, proof-of-stake security, and programmable applications.",
        levels: {
          support: [
            { price: "$1,834.15", note: "Nearest marked support in the latest chart" },
            { price: "$1,509.61", note: "Deeper marked support" }
          ],
          resistance: [
            { price: "$1,939.94", note: "Immediate breakout decision level" },
            { price: "$2,151.43", note: "Next marked resistance after a confirmed breakout" }
          ]
        },
        bullish: [
          "Breaking and holding $1,939.94 would put $2,151.43 in view",
          "ETH is required for gas and deposited by validators to secure consensus",
          "The protocol burns each transaction's base fee",
          "Rollups and blob data provide a scaling path while settling to Ethereum"
        ],
        bearish: [
          "Losing $1,834.15 would increase the risk of a deeper pullback toward $1,509.61",
          "Crypto-market volatility and custody risk remain very high",
          "Congestion, smart-contract exploits, and compromised keys can produce losses",
          "Staking providers and rollup sequencers can introduce concentration risk"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "ETH is pressing $1,939.94 resistance; a breakout favors $2,151.43, while $1,834.15 is the nearest support."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "Ethereum combines broad smart-contract utility with native staking and fee demand, while complexity, competition, and crypto-market risk remain substantial.",
          metrics: [
            { label: "Validator deposit", value: "32 ETH" },
            { label: "Slot cadence", value: "12 seconds" },
            { label: "Epoch length", value: "32 slots" },
            { label: "Fee mechanism", value: "Base fee burned" }
          ]
        }
      },
      {
        ticker: "NVO",
        name: "Novo Nordisk",
        tvSymbol: "NYSE:NVO",
        postedChartUrl: "https://www.tradingview.com/x/t2mdZUYE/",
        postedChartDate: "2026-07-31",
        postedChartChannel: "stocks",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Stock (ADR)",
        sector: "Pharmaceuticals / Metabolic Care",
        risk: "Elevated",
        tags: ["pharmaceuticals", "diabetes", "obesity", "GLP-1"],
        summary:
          "A global diabetes and obesity-care leader with deep GLP-1 scale, high profitability, and increasing competitive and pricing pressure.",
        levels: {
          support: [
            { price: "Low-$40s", note: "First pullback area after continued rejection" },
            { price: "$36–$37", note: "Stronger support beneath the rebound" }
          ],
          resistance: [
            { price: "$48.79", note: "Key reclaim level after the failed breakout" },
            { price: "$58.77", note: "Upside target after a confirmed reclaim" }
          ]
        },
        bullish: [
          "Reclaiming $48.79 would put $58.77 back in focus",
          "Leading GLP-1 scale supports exposure to large underpenetrated chronic-disease markets",
          "Profitability and cash generation remain substantial",
          "Oral, higher-dose, and next-generation programs broaden the pipeline"
        ],
        bearish: [
          "Continued rejection at $48.79 would expose the low-$40s and then $36–$37 support",
          "Competition, compounders, payer negotiations, and reform can pressure pricing and access",
          "Semaglutide creates product and active-ingredient concentration",
          "Manufacturing, clinical, regulatory, patent, litigation, and currency risks remain material"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "The GLP-1 franchise remains strong, but the rebound stalled at $48.79; a reclaim is needed before $58.77 comes back into view."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "Therapeutic leadership, global scale, and profitability support the case, while pricing, competition, manufacturing execution, and product concentration keep risk elevated.",
          metrics: [
            { label: "Revenue driver", value: "Diabetes and obesity" },
            { label: "Margins", value: "High; pricing pressure" },
            { label: "Market position", value: "Leading GLP-1 scale" },
            { label: "Pipeline", value: "Oral and next generation" }
          ]
        }
      },
      {
        ticker: "SYM",
        name: "Symbotic",
        tvSymbol: "NASDAQ:SYM",
        postedChartUrl: "https://www.tradingview.com/x/2G9dyk2h/",
        postedChartDate: "2026-07-23",
        postedChartChannel: "stocks",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Industrials / Warehouse Automation",
        risk: "High",
        tags: ["warehouse automation", "AI robotics", "systems deployment", "backlog concentration"],
        summary:
          "An AI-enabled warehouse-automation platform scaling robotic systems for large distribution customers, with strong growth and liquidity offset by concentrated backlog and execution risk.",
        levels: {
          support: [
            { price: "$31.62", note: "0.786 Fibonacci support" }
          ],
          resistance: [
            { price: "$43.69", note: "0.618 Fibonacci reclaim level" },
            { price: "$52.16", note: "Next Fibonacci resistance after a confirmed reclaim" }
          ]
        },
        bullish: [
          "Reclaiming $43.69 would improve the setup toward $52.16 resistance",
          "Revenue grew 23% year over year in fiscal Q2 2026",
          "Seventy systems were in deployment at the end of the quarter",
          "A substantial cash balance supports continued deployment and product investment"
        ],
        bearish: [
          "Continued weakness would keep $31.62 as the next major support area",
          "Walmart and Exol represent the vast majority of the company's backlog",
          "Deployment timing, contract execution, and project mix can produce uneven margins",
          "A material weakness over cost and revenue-recognition timing remained unremediated"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "23% growth, profit and liquidity help, but concentration and controls risk remain; $43.69 must be reclaimed above $31.62 support."
        },
        fundamentals: {
          rating: "Moderate",
          rationale:
            "Revenue, deployment scale, cash, and adjusted profitability are improving, while concentrated backlog, execution risk, stock compensation, and an open internal-control weakness temper the outlook.",
          metrics: [
            { label: "Fiscal Q2 revenue", value: "$676.5M; +23% YoY" },
            { label: "Profitability", value: "$9.4M GAAP net income" },
            { label: "Adjusted EBITDA", value: "$77.8M" },
            { label: "Scale and liquidity", value: "70 systems; $2.0B cash" }
          ]
        }
      },
      {
        ticker: "SOFI",
        name: "SoFi Technologies",
        tvSymbol: "NASDAQ:SOFI",
        postedChartUrl: "https://www.tradingview.com/x/jPEjEsBv/",
        postedChartDate: "2026-07-23",
        postedChartChannel: "stocks",
        analysisTimeframe: "1 week",
        chartReady: true,
        assetClass: "Stock",
        sector: "Financials / Fintech and Digital Banking",
        risk: "Elevated",
        tags: ["digital banking", "consumer lending", "deposits", "Galileo platform"],
        summary:
          "A digital financial-services platform combining consumer lending and banking products with Galileo enterprise infrastructure.",
        levels: {
          support: [
            { price: "$14.89", note: "Lower boundary of the current weekly range" },
            { price: "$13.55", note: "Next key support below the range" }
          ],
          resistance: [
            { price: "$20", note: "Upper boundary of the current weekly range" },
            { price: "$24.68", note: "Next major resistance after a confirmed breakout" }
          ]
        },
        bullish: [
          "A confirmed break above $20 would improve the setup toward $24.68 resistance",
          "First-quarter 2026 revenue grew 43% year over year",
          "Members and products grew 35% and 39% year over year, respectively",
          "Deposit growth supports a broader, lower-cost funding base"
        ],
        bearish: [
          "Losing $14.89 would refocus $13.55 as the next key support",
          "Consumer-credit performance and interest-rate sensitivity can pressure results",
          "Financial-services regulation and funding conditions remain material risks",
          "Technology Platform accounts declined after a large client completed its transition off the platform"
        ],
        aiAnalysis: {
          rating: "Buy",
          why: "43% growth and positive earnings support the setup; holding $14.89 favors $20, then $24.68, with credit and rate risk."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "Revenue, profitability, members, products, and deposits are growing rapidly, while credit exposure, rate sensitivity, regulation, and enterprise-client retention keep risk elevated.",
          metrics: [
            { label: "Q1 net revenue", value: "$1.10B; +43% YoY" },
            { label: "Profitability", value: "$166.7M net income" },
            { label: "Members and products", value: "14.7M and 22.2M" },
            { label: "Deposits and NIM", value: "$40.24B; 5.94%" }
          ]
        }
      },
      {
        ticker: "GOLD",
        name: "Spot Gold",
        tvSymbol: "TVC:GOLD",
        postedChartUrl: "https://www.tradingview.com/x/wg6zO99O/",
        postedChartDate: "2026-08-07",
        postedChartChannel: "commodities",
        analysisTimeframe: "6 hours",
        chartReady: true,
        assetClass: "Commodity",
        sector: "Precious Metals / Monetary Metal",
        risk: "Moderate",
        tags: ["gold", "real rates", "US dollar", "central banks"],
        summary:
          "A physical monetary and industrial commodity with no issuer or cash flow, supported by diverse investment, reserve, jewelry, and technology demand.",
        levels: {
          support: [
            { price: "$4,270.88", note: "Nearest marked support in the latest chart" },
            { price: "$3,995.81", note: "Secondary marked support" },
            { price: "$3,893.94", note: "Deepest marked support in the latest chart" }
          ],
          resistance: [
            { price: "$4,376.60", note: "Immediate breakout decision level" },
            { price: "$4,544.42", note: "Next marked resistance" },
            { price: "$4,765.67", note: "Higher marked resistance" },
            { price: "$4,890.03", note: "Highest marked resistance in the latest chart" }
          ]
        },
        bullish: [
          "Holding $4,270.88 and clearing $4,376.60 would put $4,544.42 in view",
          "Physical gold carries no issuer or credit exposure",
          "Deep global markets and diverse demand can support portfolio diversification",
          "Economic uncertainty and defensive flows can increase investment demand"
        ],
        bearish: [
          "A confirmed break below $4,270.88 would expose $3,995.81 and then $3,893.94",
          "Gold pays no dividend, coupon, or operating cash flow",
          "Higher real rates or a stronger competing currency can weaken demand",
          "Positioning, central-bank activity, mine supply, and recycling can amplify moves"
        ],
        aiAnalysis: {
          rating: "Buy",
          why: "Gold is testing $4,376.60 resistance above $4,270.88 support; a breakout would favor $4,544.42."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "Gold's liquidity, no-credit-risk structure, and diverse demand support its strategic role, while returns rely entirely on price and can lag for long periods.",
          metrics: [
            { label: "Economic expansion", value: "Demand driver" },
            { label: "Risk and uncertainty", value: "Demand driver" },
            { label: "Opportunity cost", value: "Rates and currencies" },
            { label: "Momentum", value: "Flows and positioning" }
          ]
        }
      },
      {
        ticker: "SLV",
        name: "iShares Silver Trust",
        tvSymbol: "AMEX:SLV",
        postedChartUrl: "https://www.tradingview.com/x/j5ykPx5F/",
        postedChartDate: "2026-08-07",
        postedChartChannel: "commodities",
        analysisTimeframe: "1 week",
        chartReady: true,
        assetClass: "Commodity trust",
        sector: "Precious Metals / Silver",
        risk: "High",
        tags: ["silver", "physical bullion", "industrial metals", "solar"],
        summary:
          "A passive, physically backed trust intended to reflect silver-bullion performance before expenses and liabilities.",
        levels: {
          support: [
            { price: "$49.44–$50.00", note: "Primary support zone in the latest chart" }
          ],
          resistance: [
            { price: "$58.50", note: "Key resistance in the latest chart" }
          ]
        },
        bullish: [
          "Holding the $49.44–$50 zone would preserve a rebound attempt toward $58.50",
          "Physical backing provides direct silver-price exposure",
          "Exchange trading avoids direct bullion handling and storage arrangements",
          "Industrial uses create demand alongside precious-metals investment flows"
        ],
        bearish: [
          "A confirmed break below $49.44 would invalidate the latest support zone",
          "The trust is concentrated in a volatile commodity and does not hedge declines",
          "Fees reduce the silver represented by each share over time",
          "Premium or discount, custody, and no-income risks remain"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "Physical backing and industrial demand help, but fee drag, no income and volatility favor waiting above $49.44–$50 support."
        },
        fundamentals: {
          rating: "Moderate",
          rationale:
            "SLV provides convenient, physically backed silver exposure, balanced against commodity volatility, structural fee drag, no income, and trust-specific risks.",
          metrics: [
            { label: "Structure", value: "Physical silver trust" },
            { label: "Income", value: "None" },
            { label: "NAV reference", value: "LBMA Silver Price" },
            { label: "Industrial driver", value: "Electrification demand" }
          ]
        }
      },
      {
        ticker: "REXR",
        name: "Rexford Industrial Realty",
        tvSymbol: "NYSE:REXR",
        postedChartUrl: "https://www.tradingview.com/x/fjDKlLP6/",
        postedChartDate: "2026-07-16",
        postedChartChannel: "stocks",
        analysisTimeframe: "6 hours",
        chartReady: true,
        assetClass: "Stock (REIT)",
        sector: "Industrial Real Estate",
        risk: "Elevated",
        tags: ["industrial REIT", "Southern California", "infill logistics", "rent growth"],
        summary:
          "A Southern California-focused industrial REIT that acquires, repositions, develops, and leases infill properties.",
        levels: {
          support: [
            { price: "$32.15", note: "Support below the recent range" }
          ],
          resistance: [
            { price: "$43.00", note: "Blue-trendline breakout level" },
            { price: "$53.00", note: "Next major resistance after a confirmed breakout" }
          ]
        },
        bullish: [
          "Breaking above $43 and holding it as support would put $53 in view",
          "Scarce infill land creates meaningful barriers to new industrial supply",
          "A broad tenant roster limits dependence on any one customer",
          "Repositioning and development can create value beyond passive rent collection"
        ],
        bearish: [
          "A rejection at $43 would refocus the recent range and $32.15 support",
          "The portfolio is concentrated entirely in Southern California",
          "Industrial demand, leasing, construction, and entitlement cycles can pressure results",
          "Interest rates, refinancing, environmental obligations, and REIT requirements remain material"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "High-barrier assets support value, but concentration risk remains; $43 must break before $53, while $32.15 is key support."
        },
        fundamentals: {
          rating: "Moderate",
          rationale:
            "High-barrier infill assets and value-add operations support the case, while geographic and property-type concentration keep risk elevated.",
          metrics: [
            { label: "Portfolio scale", value: "419 properties" },
            { label: "Rentable area", value: "About 51.2M sq ft" },
            { label: "Tenant breadth", value: "1,558 leases" },
            { label: "Operating drivers", value: "Occupancy and spreads" }
          ]
        }
      },
      {
        ticker: "WM",
        name: "Waste Management",
        tvSymbol: "NYSE:WM",
        postedChartUrl: "https://www.tradingview.com/x/POkgWQDs/",
        postedChartDate: "2026-07-16",
        postedChartChannel: "stocks",
        analysisTimeframe: "6 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Environmental & Waste Services",
        risk: "Moderate",
        tags: ["waste collection", "landfills", "recycling", "renewable energy"],
        summary:
          "An integrated North American waste, recycling, renewable-energy, and healthcare-waste services company.",
        levels: {
          support: [
            { price: "Recent range", note: "The latest post did not name a numeric pullback level" }
          ],
          resistance: [
            { price: "$242.50", note: "Immediate breakout decision level" },
            { price: "$255.00", note: "Blue-trendline resistance after a confirmed hold" }
          ]
        },
        bullish: [
          "Holding above $242.50 would confirm the breakout attempt toward the $255 trendline",
          "Collection routes, transfer stations, and landfills form a difficult-to-replicate network",
          "Recurring municipal and commercial demand supports durable service revenue",
          "Recycling, renewable energy, and healthcare solutions broaden the earnings base"
        ],
        bearish: [
          "Another rejection at $242.50 would return focus to the recent range",
          "Landfill closure, remediation, PFAS, and environmental compliance require long-term spending",
          "Stericycle integration adds systems, retention, and synergy execution risk",
          "Commodity prices, fuel, labor, equipment, and weaker volumes can pressure margins"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "Very strong recurring economics support the business, but $242.50 remains the breakout gate before $255."
        },
        fundamentals: {
          rating: "Very Strong",
          rationale:
            "A dense integrated network and recurring essential-service demand support strong economics, balanced against environmental liabilities and acquisition integration risk.",
          metrics: [
            { label: "Solid-waste landfills", value: "253" },
            { label: "Recycling facilities", value: "113" },
            { label: "Organics facilities", value: "49" },
            { label: "Core drivers", value: "Price, density, volume" }
          ]
        }
      },
      {
        ticker: "NVAX",
        name: "Novavax",
        tvSymbol: "NASDAQ:NVAX",
        postedChartUrl: "https://www.tradingview.com/x/dP4csqXH/",
        postedChartDate: "2026-08-07",
        postedChartChannel: "stocks",
        analysisTimeframe: "6 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Biotechnology / Vaccines",
        risk: "Very High",
        tags: ["vaccines", "Matrix-M", "adjuvant", "licensing"],
        summary:
          "A vaccine biotechnology company shifting toward partner-led monetization of its protein-nanoparticle and Matrix-M platform.",
        levels: {
          support: [
            { price: "$6.60", note: "Lower boundary of the current weekly range" },
            { price: "$3.61", note: "Next major support after a breakdown" }
          ],
          resistance: [
            { price: "$11.52", note: "Upper boundary of the current weekly range" },
            { price: "$23.08", note: "Next major level after a confirmed breakout" }
          ]
        },
        bullish: [
          "Breaking above $11.52 and holding it as support would put $23.08 in view",
          "Commercial products validate parts of the vaccine and adjuvant platform",
          "Licensing agreements create milestone and royalty optionality",
          "A partner-led model can extend reach with less internal infrastructure"
        ],
        bearish: [
          "Losing $6.60 would break the range and expose $3.61 support",
          "Loss history, debt, and uneven partner-linked revenue create funding risk",
          "Clinical, regulatory, manufacturing, and safety setbacks can erase expected economics",
          "Larger competitors and concentrated partner relationships limit execution control"
        ],
        aiAnalysis: {
          rating: "Sell",
          why: "Uneven revenue, funding needs and binary clinical risk outweigh partnership upside; $6.60 support sits beneath $11.52 resistance."
        },
        fundamentals: {
          rating: "Weak",
          rationale:
            "Platform validation and partnership optionality are offset by uneven revenue, funding needs, product concentration, and high clinical and counterparty risk.",
          metrics: [
            { label: "Revenue transition", value: "Partner-led" },
            { label: "Platform", value: "Matrix-M adjuvant" },
            { label: "Commercial model", value: "Milestones and royalties" },
            { label: "Primary watch", value: "Liquidity and execution" }
          ]
        }
      },
      {
        ticker: "O",
        name: "Realty Income",
        tvSymbol: "NYSE:O",
        postedChartUrl: "https://www.tradingview.com/x/1DhfHEx1/",
        postedChartDate: "2026-07-16",
        postedChartChannel: "stocks",
        analysisTimeframe: "1 week",
        chartReady: true,
        assetClass: "Stock (REIT)",
        sector: "Diversified Net-Lease Real Estate",
        risk: "Elevated",
        tags: ["net lease", "monthly dividend", "income", "REIT"],
        summary:
          "A diversified net-lease REIT owning predominantly single-tenant commercial properties across the United States and Europe.",
        levels: {
          support: [
            { price: "$64.68", note: "Breakout level that needs to hold as support" }
          ],
          resistance: [
            { price: "$69.93", note: "First upside level" },
            { price: "$75.07", note: "Next resistance after a stronger continuation" }
          ]
        },
        bullish: [
          "Holding above $64.68 would preserve the breakout toward $69.93 and $75.07",
          "Property, client, industry, and geographic diversification reduce single-asset exposure",
          "Net leases shift many property operating expenses to clients",
          "High occupancy and long lease terms support contractual rent visibility"
        ],
        bearish: [
          "Falling back below $64.68 would weaken the breakout and reopen the prior range",
          "Higher rates can raise funding costs and pressure income-oriented valuations",
          "Client bankruptcies or store closures can interrupt rent and complicate re-leasing",
          "Acquisitions and international expansion add underwriting, currency, tax, and execution risk"
        ],
        aiAnalysis: {
          rating: "Buy",
          why: "High occupancy and lease visibility align with $64.68 breakout support; holding it favors $69.93 then $75.07 despite rate sensitivity."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "Scale, diversification, high occupancy, and contractual rent visibility support the business, while rate sensitivity and tenant credit keep risk elevated.",
          metrics: [
            { label: "Portfolio scale", value: "15,511 properties" },
            { label: "Client breadth", value: "1,761 clients" },
            { label: "Occupancy", value: "98.9%" },
            { label: "Lease visibility", value: "About 8.8 years" }
          ]
        }
      },
      {
        ticker: "SOUN",
        name: "SoundHound AI",
        tvSymbol: "NASDAQ:SOUN",
        postedChartUrl: "https://www.tradingview.com/x/UFENV5Wu/",
        postedChartDate: "2026-08-07",
        postedChartChannel: "stocks",
        analysisTimeframe: "6 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Application Software / Conversational AI",
        risk: "Very High",
        tags: ["voice AI", "agentic AI", "automotive", "restaurants"],
        summary:
          "A voice and agentic-AI software provider serving automotive, restaurant, customer-service, and enterprise use cases.",
        levels: {
          support: [
            { price: "$5.80–$6.41", note: "Support zone currently under pressure" }
          ],
          resistance: [
            { price: "$8.99–$10.18", note: "Primary resistance zone in the latest chart" },
            { price: "$22.12", note: "Higher marked resistance" }
          ]
        },
        bullish: [
          "Holding $5.80–$6.41 and clearing $8.99–$10.18 would improve the structure toward $22.12",
          "Multiple revenue formats support hosted, usage-based, services, and licensing economics",
          "Automotive, restaurant, and enterprise products broaden the addressable market",
          "Acquired platforms can create cross-selling opportunities across the product stack"
        ],
        bearish: [
          "Breaking below $5.80 would invalidate the support zone, while rejection at $8.99–$10.18 would keep the rebound capped",
          "Material losses and negative operating cash flow create funding and dilution risk",
          "Acquisitions add integration, amortization, and contingent-payment complexity",
          "Competition, long sales cycles, privacy, cybersecurity, hallucination, and AI rules remain significant"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "SOUN is above $5.80–$6.41 support but still below $8.99–$10.18 resistance; losses keep risk very high."
        },
        fundamentals: {
          rating: "Weak",
          rationale:
            "Broad conversational-AI use cases and differentiated technology are offset by losses, cash burn, acquisition complexity, dilution, and intense competition.",
          metrics: [
            { label: "Revenue model", value: "Hosted, services, licensing" },
            { label: "Adoption breadth", value: "Auto, restaurants, enterprise" },
            { label: "Unit economics", value: "Gross margin and inference" },
            { label: "Funding health", value: "Cash burn and dilution" }
          ]
        }
      },
      {
        ticker: "SMCI",
        name: "Super Micro Computer",
        tvSymbol: "NASDAQ:SMCI",
        postedChartUrl: "https://www.tradingview.com/x/OPYPASZx/",
        postedChartDate: "2026-07-22",
        postedChartChannel: "stocks",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Technology / AI Servers and Data Center Infrastructure",
        risk: "Very High",
        tags: ["AI infrastructure", "GPU servers", "rack-scale systems", "liquid cooling"],
        summary:
          "A global manufacturer of application-optimized servers, AI systems, storage, networking, software, and support services.",
        levels: {
          support: [
            { price: "Recent range", note: "The latest post did not name a numeric downside level" }
          ],
          resistance: [
            { price: "$35.61", note: "First breakout decision level" },
            { price: "$49.20", note: "Next major resistance near the blue trendline" }
          ]
        },
        bullish: [
          "Breaking above $35.61 and holding it as support would put the $49.20 trendline in view",
          "Q3 fiscal 2026 net sales more than doubled from the prior-year quarter",
          "AI GPU-related sales grew sharply during the first nine months of fiscal 2026",
          "Its building-block platform integrates compute, storage, networking, liquid cooling, software, and services"
        ],
        bearish: [
          "A rejection at $35.61 would refocus the recent range",
          "Gross margins remain thin and sensitive to mix, ramp costs, tariffs, and inventory write-downs",
          "Working-capital demands and debt make balance-sheet execution important",
          "Customer concentration and unresolved compliance matters add material risk"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "Rapid growth and profit are offset by 9.9% margin, heavy debt and compliance risk; confirm a break above $35.61."
        },
        fundamentals: {
          rating: "Moderate",
          rationale:
            "Rapid AI-infrastructure growth and continued profitability are offset by thin margins, substantial working-capital demands, leverage, customer concentration, and unresolved compliance risk.",
          metrics: [
            { label: "Q3 net sales", value: "$10.2 billion" },
            { label: "Q3 gross margin", value: "9.9%" },
            { label: "Q3 net income", value: "$483 million" },
            { label: "Cash / debt and notes", value: "$1.3B / $8.8B" }
          ]
        }
      },
      {
        ticker: "TSLA",
        name: "Tesla",
        tvSymbol: "NASDAQ:TSLA",
        postedChartUrl: "https://www.tradingview.com/x/vCG36Dbx/",
        postedChartDate: "2026-07-27",
        postedChartChannel: "stocks",
        analysisTimeframe: "6 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Automotive / EV and Energy",
        risk: "High",
        tags: ["electric vehicles", "energy storage", "autonomy", "robotics"],
        summary:
          "An electric-vehicle and energy company investing heavily in autonomy, AI-enabled services, charging, and robotics.",
        levels: {
          support: [
            { price: "$299–$300", note: "Key support zone after the sharp selloff" }
          ],
          resistance: [
            { price: "$336.84", note: "First rebound target while support holds" }
          ]
        },
        bullish: [
          "Defending $299–$300 would preserve a rebound attempt toward $336.84",
          "Vertical integration spans vehicles, software, direct sales, service, and charging",
          "Manufacturing scale and liquidity support long-duration investment",
          "Energy storage, autonomy, ride-hailing, and robotics provide optionality beyond vehicles"
        ],
        bearish: [
          "Breaking below $299 without a reclaim would extend downside pressure",
          "Competition, pricing pressure, demand cycles, and product mix can compress margins",
          "Autonomy depends on safety, regulation, consumer acceptance, and liability management",
          "Very high capital spending, tariffs, supply chains, and governance controversies add risk"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "Q2 deliveries reached 480,126 and energy deployments 13.5 GWh, but the $299–$300 support test keeps risk elevated."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "Manufacturing scale, liquidity, and multiple long-term growth options support the case, while valuation-sensitive execution, regulation, and capital intensity keep risk high.",
          metrics: [
            { label: "Vehicle engine", value: "Deliveries and pricing" },
            { label: "Core profitability", value: "Automotive gross margin" },
            { label: "Diversification", value: "Energy storage" },
            { label: "Investment capacity", value: "Cash flow versus capex" }
          ]
        }
      },
      {
        ticker: "TQQQ",
        name: "ProShares UltraPro QQQ",
        tvSymbol: "NASDAQ:TQQQ",
        postedChartUrl: "https://www.tradingview.com/x/mVZ50peU/",
        postedChartDate: "2026-07-22",
        postedChartChannel: "stocks",
        analysisTimeframe: "6 hours",
        chartReady: true,
        assetClass: "Leveraged ETF",
        sector: "Nasdaq-100 / Large-Cap Growth",
        risk: "Very High",
        tags: ["3x leverage", "Nasdaq-100", "daily reset", "derivatives"],
        summary:
          "A leveraged ETF targeting three times the Nasdaq-100's return for one trading day, not three times its long-term return.",
        levels: {
          support: [
            { price: "$68.61", note: "Key support under the latest bounce" },
            { price: "$67.35", note: "Next support after a confirmed breakdown" }
          ],
          resistance: [
            { price: "$71.52", note: "Immediate breakout decision level" },
            { price: "$77.32", note: "Next resistance after a confirmed hold" }
          ]
        },
        bullish: [
          "Reclaiming $71.52 and holding it as support would put $77.32 in view",
          "The fund packages transparent +3x daily Nasdaq-100 exposure in one instrument",
          "Its daily rebalancing aligns with the stated one-day objective",
          "Multiple instruments and collateral are used to construct the target exposure"
        ],
        bearish: [
          "Losing $68.61 would expose $67.35 and weaken the current rebound",
          "Three-times leverage magnifies daily losses and can produce near-total loss",
          "Path dependency and volatility can make multi-day returns diverge sharply from +3x",
          "Derivatives add counterparty, financing, liquidity, and tracking risk"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "Price is below $67.35 support, and +3x daily reset adds compounding risk; wait for a reclaim before a bullish view."
        },
        fundamentals: {
          rating: "Moderate",
          rationale:
            "TQQQ efficiently delivers its stated one-day leveraged exposure, but daily reset, compounding, derivatives, and concentration make it unsuitable as a conventional long-term holding.",
          metrics: [
            { label: "Daily target", value: "+3x" },
            { label: "Benchmark", value: "Nasdaq-100" },
            { label: "Objective horizon", value: "One trading day" },
            { label: "Main drivers", value: "Direction and volatility" }
          ]
        }
      },
      {
        ticker: "SQQQ",
        name: "ProShares UltraPro Short QQQ",
        tvSymbol: "NASDAQ:SQQQ",
        postedChartUrl: "https://www.tradingview.com/x/qKaWIM1J/",
        postedChartDate: "2026-07-31",
        postedChartChannel: "stocks",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Inverse leveraged ETF",
        sector: "Nasdaq-100 Inverse Exposure",
        risk: "Very High",
        tags: ["-3x inverse", "Nasdaq-100", "daily reset", "hedging"],
        summary:
          "An inverse leveraged ETF targeting three times the opposite of the Nasdaq-100's return for one trading day.",
        levels: {
          support: [
            { price: "$40.68", note: "First support after another rejection" },
            { price: "$36.46–$35.79", note: "Lower support zone if $40.68 fails" }
          ],
          resistance: [
            { price: "$45.63", note: "Immediate reclaim level" },
            { price: "$50", note: "Recent spike high after a confirmed reclaim" }
          ]
        },
        bullish: [
          "Reclaiming $45.63 would put the recent spike near $50 back in view",
          "The fund packages -3x daily Nasdaq-100 exposure in one instrument",
          "It provides defined short-term inverse exposure without shorting each constituent",
          "Its benchmark and daily rebalancing objective are explicit"
        ],
        bearish: [
          "Another rejection at $45.63 would refocus $40.68; losing it would expose $36.46–$35.79",
          "Nasdaq-100 gains are magnified against the fund and can produce total-loss risk",
          "Daily compounding and volatility can cause severe multi-day decay or divergence",
          "Derivatives, financing, tracking, market gaps, and persistent equity gains are structural risks"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "SQQQ is below $45.63 resistance, and its -3x daily reset makes any bullish thesis tactical rather than durable."
        },
        fundamentals: {
          rating: "Moderate",
          rationale:
            "SQQQ delivers a clear one-day inverse objective, but leverage, daily reset, compounding, derivative exposure, and long-run equity drift make risk extremely high.",
          metrics: [
            { label: "Daily target", value: "-3x" },
            { label: "Benchmark", value: "Nasdaq-100" },
            { label: "Objective horizon", value: "One trading day" },
            { label: "Main drivers", value: "Inverse direction and volatility" }
          ]
        }
      },
      {
        ticker: "AMZN",
        name: "Amazon",
        tvSymbol: "NASDAQ:AMZN",
        postedChartUrl: "https://www.tradingview.com/x/OG3oejFv/",
        postedChartDate: "2026-07-31",
        postedChartChannel: "stocks",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Consumer Internet / Cloud Infrastructure",
        risk: "Elevated",
        tags: ["e-commerce", "AWS", "cloud", "advertising", "Prime"],
        summary:
          "A diversified platform spanning retail, third-party services, subscriptions, advertising, logistics, and AWS cloud infrastructure.",
        levels: {
          support: [
            { price: "$249.74", note: "First support if momentum fades" },
            { price: "$239.10", note: "Next support after a deeper pullback" }
          ],
          resistance: [
            { price: "$274.95", note: "Immediate breakout decision level" }
          ]
        },
        bullish: [
          "Breaking above $274.95 and holding it as support would put new highs in focus",
          "Retail, Prime, fulfillment, and third-party sellers reinforce a broad commerce ecosystem",
          "AWS provides a recurring enterprise infrastructure and AI-services engine",
          "Advertising monetizes high-intent traffic without requiring owned inventory"
        ],
        bearish: [
          "Losing $249.74 would weaken momentum and expose $239.10 support",
          "Competition spans retail, cloud, advertising, logistics, devices, media, and AI",
          "Data-center, AI, and fulfillment investment can materially reduce free cash flow",
          "Antitrust, labor, privacy, tax, platform, cybersecurity, and operational risks remain"
        ],
        aiAnalysis: {
          rating: "Buy",
          why: "AWS growth and the earnings gap improve the setup; $274.95 is confirmation, while $249.74 is the first risk line."
        },
        fundamentals: {
          rating: "Very Strong",
          rationale:
            "Multiple scaled businesses, AWS economics, advertising, and cash generation support a strong franchise, balanced against capital intensity and regulatory exposure.",
          metrics: [
            { label: "Q2 sales", value: "$200.6B; +20%" },
            { label: "AWS growth", value: "+37%" },
            { label: "Commerce mix", value: "Sellers, ads, subscriptions" },
            { label: "Q2 operating income", value: "$27.5B" }
          ]
        }
      },
      {
        ticker: "PYPL",
        name: "PayPal",
        tvSymbol: "NASDAQ:PYPL",
        postedChartUrl: "https://www.tradingview.com/x/FWeROzFw/",
        postedChartDate: "2026-07-28",
        postedChartChannel: "stocks",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Financial Technology / Payments",
        risk: "Elevated",
        tags: ["digital payments", "checkout", "Venmo", "Braintree"],
        summary:
          "A global payments platform spanning branded checkout, Venmo, merchant processing, payouts, credit, and value-added services.",
        levels: {
          support: [
            { price: "$56.50", note: "Breakout and retest support" }
          ],
          resistance: [
            { price: "$68.29", note: "First upside target while the breakout holds" },
            { price: "$76.96", note: "Next target after a confirmed continuation" }
          ]
        },
        bullish: [
          "Holding above $56.50 would keep $68.29 and then $76.96 in view",
          "A broad consumer and merchant network supports multiple payment use cases",
          "PayPal, Venmo, merchant processing, and value-added services diversify the platform",
          "Scale in fraud, risk, and routing supports global transaction processing"
        ],
        bearish: [
          "Falling below $56.50 and failing to reclaim it would return price to the prior range",
          "Wallets, networks, banks, processors, device platforms, and fintechs pressure pricing",
          "Funding costs, network rules, merchant mix, fraud, chargebacks, and credit losses affect economics",
          "Payments, AML, sanctions, privacy, consumer-protection, and digital-asset rules add compliance risk"
        ],
        aiAnalysis: {
          rating: "Buy",
          why: "Cash generation and the $56.50 breakout favor $68.29, but the setup weakens quickly if support fails."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "A scaled two-sided payments network and cash-generative model support the business, while competition, funding economics, fraud, credit, and regulation keep risk elevated.",
          metrics: [
            { label: "Payment activity", value: "Volume and transactions" },
            { label: "Unit economics", value: "Expense rate and funding" },
            { label: "Risk quality", value: "Transaction and credit losses" },
            { label: "Cash conversion", value: "Operating cash flow" }
          ]
        }
      },
      {
        ticker: "MGNX",
        name: "MacroGenics",
        tvSymbol: "NASDAQ:MGNX",
        postedChartUrl: "https://www.tradingview.com/x/S46rVSmz/",
        postedChartDate: "2026-07-15",
        postedChartChannel: "stocks",
        analysisTimeframe: "1 week",
        chartReady: true,
        assetClass: "Stock",
        sector: "Biotechnology / Oncology",
        risk: "Very High",
        tags: ["antibody-drug conjugates", "oncology", "clinical-stage", "partnerships"],
        summary:
          "A clinical-stage oncology biotechnology company developing antibody-drug conjugates and multi-specific antibodies, with partnered-product economics.",
        levels: {
          support: [
            { price: "$4.22", note: "Midrange trendline and primary decision support" }
          ],
          resistance: [
            { price: "$18.00", note: "Major upside resistance in the latest weekly chart" }
          ]
        },
        bullish: [
          "Holding $4.22 would preserve the long-range path toward $18 resistance",
          "Three proprietary clinical candidates provide more than one route to value creation",
          "Partnerships can contribute expertise, milestones, royalties, and non-dilutive funding",
          "The completed manufacturing divestiture reduced fixed infrastructure and added capital"
        ],
        bearish: [
          "A sustained loss of $4.22 would invalidate the current weekly support thesis",
          "No proprietary clinical candidate is approved, leaving outcomes highly trial-dependent",
          "Losses and irregular collaboration revenue create financing and dilution risk",
          "Third-party manufacturing adds capacity, quality, and regulatory dependencies"
        ],
        aiAnalysis: {
          rating: "Sell",
          why: "Price is below $4.22 support; an unapproved, loss-making pipeline and binary trials outweigh distant $18 resistance."
        },
        fundamentals: {
          rating: "Weak",
          rationale:
            "Multiple oncology programs and partnered economics offer upside, but an unapproved pipeline, operating losses, binary clinical outcomes, and outsourced manufacturing keep fundamental risk very high.",
          metrics: [
            { label: "Development stage", value: "Clinical stage" },
            { label: "Core pipeline", value: "Three proprietary programs" },
            { label: "Revenue model", value: "Milestones and royalties" },
            { label: "Funding posture", value: "Runway and cash use" }
          ]
        }
      },
      {
        ticker: "HD",
        name: "Home Depot",
        tvSymbol: "NYSE:HD",
        postedChartUrl: "https://www.tradingview.com/x/Yq0VwGkd/",
        postedChartDate: "2026-07-27",
        postedChartChannel: "stocks",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Consumer Discretionary / Home Improvement Retail",
        risk: "Moderate",
        tags: ["home improvement", "retail", "professional contractors", "housing"],
        summary:
          "A scaled home-improvement retailer and specialty building-products distributor serving consumers and professional customers.",
        levels: {
          support: [
            { price: "$310", note: "Rising blue-trendline support after a rejection" }
          ],
          resistance: [
            { price: "$337.81", note: "Immediate breakout decision level" },
            { price: "$350–$355", note: "Recent-high target after a confirmed breakout" }
          ]
        },
        bullish: [
          "Breaking above $337.81 and holding it as support would put $350–$355 in view",
          "Brand, purchasing scale, assortment, stores, and fulfillment support a durable position",
          "Repair and maintenance demand provides a recurring base beneath cyclical projects",
          "SRS and GMS broaden professional-customer distribution and complex-project exposure"
        ],
        bearish: [
          "Another rejection at $337.81 would refocus trendline support near $310",
          "Mortgage rates, affordability, and low housing turnover can defer large projects",
          "SRS and GMS introduce integration, leverage, goodwill, and margin-mix risk",
          "Tariffs, supplier disruption, labor, shrink, cybersecurity, and weather can pressure margins"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "Sales grew 4.8%, but earnings fell and price remains capped at $337.81; wait for a clean breakout."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "Scale, brand, professional-customer reach, and recurring repair demand support the franchise, while housing cyclicality and acquisition integration keep risk moderate.",
          metrics: [
            { label: "Core sales engine", value: "Transactions and ticket" },
            { label: "Customer mix", value: "DIY and Pro" },
            { label: "Margin drivers", value: "Mix, shrink, supply chain" },
            { label: "Capital efficiency", value: "Inventory and ROIC" }
          ]
        }
      },
      {
        ticker: "MSTR",
        name: "Strategy",
        tvSymbol: "NASDAQ:MSTR",
        postedChartUrl: "https://www.tradingview.com/x/eEX9jb70/",
        postedChartDate: "2026-08-07",
        postedChartChannel: "crypto",
        analysisTimeframe: "6 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Bitcoin Treasury / Enterprise Software",
        risk: "Very High",
        tags: ["bitcoin treasury", "digital assets", "enterprise analytics", "capital markets"],
        summary:
          "A Bitcoin-treasury company whose common equity combines concentrated digital-asset exposure with enterprise analytics and an actively financed capital structure.",
        levels: {
          support: [
            { price: "$88.24–$100.61", note: "Support and reclaim zone in the latest chart" }
          ],
          resistance: [
            { price: "$197.27", note: "Next major marked resistance above the support zone" }
          ]
        },
        bullish: [
          "Holding above the $88.24–$100.61 zone would preserve the recovery toward $197.27",
          "A large Bitcoin treasury provides concentrated participation in digital-asset appreciation",
          "Multiple capital-raising channels can expand the treasury when market access is favorable",
          "Enterprise software adds subscription, support, and services revenue"
        ],
        bearish: [
          "A clean break below $88.24 would invalidate the support zone and materially weaken the recovery",
          "Bitcoin concentration can create extreme balance-sheet and equity volatility",
          "Debt, preferred obligations, dilution, and capital-market premiums complicate valuation",
          "Custody, cyber, regulatory, tax, accounting, and software-transition risks remain"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "MSTR is holding above $88.24–$100.61, but Bitcoin dependence, leverage and dilution keep risk very high below $197.27."
        },
        fundamentals: {
          rating: "Moderate",
          rationale:
            "A large Bitcoin treasury and flexible financing create asymmetric exposure, but concentration, leverage, dilution, and capital-market dependence make the common equity structurally high risk.",
          metrics: [
            { label: "Treasury efficiency", value: "BTC per diluted share" },
            { label: "Balance-sheet cover", value: "Assets versus obligations" },
            { label: "Financing burden", value: "Interest and preferreds" },
            { label: "Software engine", value: "Recurring revenue and cash" }
          ]
        }
      },
      {
        ticker: "IBM",
        name: "International Business Machines",
        tvSymbol: "NYSE:IBM",
        postedChartUrl: "https://www.tradingview.com/x/mQ7dqfjW/",
        postedChartDate: "2026-07-15",
        postedChartChannel: "stocks",
        analysisTimeframe: "1 week",
        chartReady: true,
        assetClass: "Stock",
        sector: "Technology / Enterprise Software and Services",
        risk: "Moderate",
        tags: ["hybrid cloud", "enterprise AI", "software", "consulting", "mainframe"],
        summary:
          "An enterprise technology company centered on hybrid-cloud and automation software, consulting, mission-critical infrastructure, and financing.",
        levels: {
          support: [
            { price: "$203–$214", note: "Primary weekly support zone" },
            { price: "$202.00", note: "Next decision level below the support zone" }
          ],
          resistance: [
            { price: "Relief-bounce zone", note: "The latest post did not name a numeric upside level" }
          ]
        },
        bullish: [
          "Holding the $203–$214 zone would preserve the potential for a relief bounce",
          "Software subscriptions, maintenance, and transaction processing support recurring revenue",
          "Red Hat strengthens IBM's position across hybrid and multi-cloud environments",
          "Mission-critical IBM Z workloads and free cash flow support durable reinvestment"
        ],
        bearish: [
          "A sustained break below $202 would invalidate the current weekly support structure",
          "Hyperscalers, software vendors, consultants, and changing AI platforms intensify competition",
          "Consulting demand and utilization can weaken when enterprise budgets tighten",
          "Mainframe cycles, acquisitions, debt, currency, and cybersecurity add execution risk"
        ],
        aiAnalysis: {
          rating: "Buy",
          why: "Recurring software and cash flow align with $203–$214 support; a sustained relief bounce improves the setup despite AI competition."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "Recurring software, embedded infrastructure, Red Hat, and free cash flow support the franchise, balanced against consulting cyclicality and rapid cloud and AI competition.",
          metrics: [
            { label: "Recurring engine", value: "Software ARR and mix" },
            { label: "Demand indicator", value: "Consulting signings" },
            { label: "Infrastructure cycle", value: "IBM Z adoption" },
            { label: "Capital capacity", value: "Free cash flow" }
          ]
        }
      },
      {
        ticker: "TEM",
        name: "Tempus AI",
        tvSymbol: "NASDAQ:TEM",
        postedChartUrl: "https://www.tradingview.com/x/uIp5kG8V/",
        postedChartDate: "2026-07-14",
        postedChartChannel: "stocks",
        analysisTimeframe: "6 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Healthcare Technology / Precision Diagnostics",
        risk: "High",
        tags: ["healthcare AI", "genomics", "diagnostics", "clinical data", "drug development"],
        summary:
          "A precision-medicine platform combining diagnostics with clinical-data licensing, analytics, and AI tools for care and drug development.",
        levels: {
          support: [
            { price: "Prior range", note: "The latest post did not name a numeric support" }
          ],
          resistance: [
            { price: "$58.30", note: "Immediate resistance and reclaim level" },
            { price: "$77.23", note: "Next upside resistance after a confirmed reclaim" }
          ]
        },
        bullish: [
          "Reclaiming $58.30 as support would put $77.23 back in view",
          "Diagnostics and data businesses can reinforce one another as the dataset grows",
          "A difficult-to-replicate multimodal dataset supports analytics and AI development",
          "Pharma relationships and Ambry hereditary testing broaden the platform"
        ],
        bearish: [
          "Another rejection at $58.30 would return attention to the prior range",
          "GAAP losses and cash use keep financing and operating-leverage risk elevated",
          "Reimbursement, privacy, cyber, AI, and healthcare rules can constrain adoption",
          "Ambry integration, debt, goodwill, stock compensation, and renewals add complexity"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "Clinical-data value is offset by losses, reimbursement and integration risk; $58.30 must be reclaimed before $77.23."
        },
        fundamentals: {
          rating: "Moderate",
          rationale:
            "A differentiated clinical-data and diagnostics platform offers durable strategic value, but losses, reimbursement exposure, sensitive-data obligations, and acquisition integration keep risk high.",
          metrics: [
            { label: "Diagnostics engine", value: "Tests and reimbursement" },
            { label: "Business mix", value: "Revenue and gross margin" },
            { label: "Data durability", value: "Renewals and commitments" },
            { label: "Funding health", value: "Loss, cash, and debt" }
          ]
        }
      },
      {
        ticker: "LINK",
        name: "Chainlink",
        tvSymbol: "COINBASE:LINKUSD",
        postedChartUrl: "https://www.tradingview.com/x/WFMEVUPd/",
        postedChartDate: "2026-07-27",
        postedChartChannel: "crypto",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Digital asset",
        sector: "Blockchain Infrastructure / Oracle Network",
        risk: "Very High",
        tags: ["oracles", "cross-chain", "DeFi", "tokenization", "staking"],
        summary:
          "The capped-supply utility and staking token used across Chainlink's oracle, cross-chain messaging, automation, and smart-contract services.",
        levels: {
          support: [
            { price: "$8.60", note: "Key level bulls are attempting to hold as support" },
            { price: "$7.00", note: "Fallback support if $8.60 fails" }
          ],
          resistance: [
            { price: "$9.63", note: "First resistance while $8.60 holds" },
            { price: "$10.79", note: "Next target after a confirmed breakout" }
          ]
        },
        bullish: [
          "Holding $8.60 as support would put $9.63 and then $10.79 in view",
          "The network connects blockchains with external data, systems, and cross-chain messaging",
          "Data Feeds, CCIP, automation, randomness, and streams diversify service demand",
          "LINK supports payments, node compensation, staking, and network security"
        ],
        bearish: [
          "Losing $8.60 without a reclaim would refocus the $7 support area",
          "LINK does not represent an equity or contractual claim on protocol revenue",
          "Oracle, node, smart-contract, bridge, governance, and competition risks remain",
          "Volatility, custody, exchange, manipulation, and regulatory risks are substantial"
        ],
        aiAnalysis: {
          rating: "Buy",
          why: "Institutional integrations broaden usage; holding $8.60 favors $9.63–$10.79, but a failure risks $7."
        },
        fundamentals: {
          rating: "Moderate",
          rationale:
            "Broad oracle and cross-chain utility supports network relevance, but token value capture, adoption, technical security, competition, and regulatory treatment remain uncertain.",
          metrics: [
            { label: "Service demand", value: "Paid network usage" },
            { label: "Token economics", value: "Fees and LINK reserve" },
            { label: "Security", value: "Staking participation" },
            { label: "Adoption", value: "Networks and integrations" }
          ]
        }
      },
      {
        ticker: "SPY",
        name: "State Street SPDR S&P 500 ETF Trust",
        tvSymbol: "AMEX:SPY",
        postedChartUrl: "https://www.tradingview.com/x/50186jRc/",
        postedChartDate: "2026-07-14",
        postedChartChannel: "stocks",
        analysisTimeframe: "6 hours",
        chartReady: true,
        assetClass: "ETF",
        sector: "Broad U.S. Large-Cap Equity",
        risk: "Moderate",
        tags: ["S&P 500", "large cap", "index ETF", "diversified", "passive"],
        summary:
          "A passive unit investment trust designed to track the float-adjusted, market-cap-weighted S&P 500 Index before expenses.",
        levels: {
          support: [
            { price: "$750.00", note: "Primary support that needs to hold" },
            { price: "$723.00", note: "Deeper support after a confirmed breakdown" }
          ],
          resistance: [
            { price: "$760.00", note: "Immediate resistance in the latest chart" }
          ]
        },
        bullish: [
          "Holding $750 would preserve the attempt to clear $760 resistance",
          "Exposure spans all 11 GICS sectors through a transparent index methodology",
          "Scale, trading liquidity, and a low expense ratio support efficient broad-market access",
          "Passive rules and in-kind creation and redemption help limit manager and tax friction"
        ],
        bearish: [
          "A sustained loss of $750 would expose $723 as the next chart support",
          "Broad equity drawdowns directly affect the fund despite sector diversification",
          "Market-cap weighting can create meaningful mega-cap and sector concentration",
          "Tracking, tax, premium-discount, spread, and stressed-liquidity risks remain"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "Diversification and liquidity remain strong, but price is below $750 support; wait for a reclaim or support near $723."
        },
        fundamentals: {
          rating: "Very Strong",
          rationale:
            "Broad S&P 500 diversification, transparent rules, deep liquidity, and low costs make the structure strong, while market drawdowns and concentration remain unavoidable equity risks.",
          metrics: [
            { label: "Benchmark fit", value: "Tracking difference" },
            { label: "Fund cost", value: "Expense ratio" },
            { label: "Concentration", value: "Top holdings and sectors" },
            { label: "Trading quality", value: "Spread and premium" }
          ]
        }
      },
      {
        ticker: "HOOD",
        name: "Robinhood Markets",
        tvSymbol: "NASDAQ:HOOD",
        postedChartUrl: "https://www.tradingview.com/x/n02G51ho/",
        postedChartDate: "2026-08-07",
        postedChartChannel: "stocks",
        analysisTimeframe: "6 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Fintech / Brokerage and Digital Financial Services",
        risk: "High",
        tags: ["brokerage", "crypto", "options", "net interest", "subscriptions"],
        summary:
          "A technology-driven financial platform spanning retail brokerage, options, crypto, advisory, subscriptions, cash, credit, and new market access.",
        levels: {
          support: [
            { price: "$65.57", note: "Major marked support in the latest chart" }
          ],
          resistance: [
            { price: "$95.61", note: "Immediate breakout decision level" },
            { price: "$118.76", note: "Next marked resistance" },
            { price: "$154.85", note: "Higher marked resistance" }
          ]
        },
        bullish: [
          "Clearing $95.61 would improve the structure toward $118.76 and then $154.85",
          "Funded-customer and platform-asset scale supports multiple monetization channels",
          "Transactions, net interest, subscriptions, and other services diversify revenue",
          "Gold, retirement, advisory, card, international, and Bitstamp expansion add optionality"
        ],
        bearish: [
          "Rejection at $95.61 would keep the rebound capped, while losing $65.57 would materially weaken the chart",
          "Trading volumes, product mix, rates, cash balances, margin lending, and credit drive volatility",
          "Brokerage, options, crypto, lending, and international products face extensive regulation",
          "Cybersecurity, outages, custody, fraud, acquisitions, and credit losses add operational risk"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "HOOD must clear $95.61 before $118.76 comes into view; $65.57 is the major chart support beneath the rebound."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "Customer and asset scale, diversified monetization, and operating leverage support the model, while market sensitivity, regulation, technology, custody, and credit keep risk high.",
          metrics: [
            { label: "Platform scale", value: "Customers and assets" },
            { label: "Engagement", value: "ARPU and Gold subs" },
            { label: "Revenue quality", value: "Transaction and recurring mix" },
            { label: "Risk capacity", value: "Losses, capital, liquidity" }
          ]
        }
      },
      {
        ticker: "AMD",
        name: "Advanced Micro Devices",
        tvSymbol: "NASDAQ:AMD",
        postedChartUrl: "https://www.tradingview.com/x/YCKBLo8j/",
        postedChartDate: "2026-07-27",
        postedChartChannel: "stocks",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Technology / Semiconductors",
        risk: "Elevated",
        tags: ["semiconductors", "AI accelerators", "data center", "CPUs", "GPUs"],
        summary:
          "A fabless semiconductor designer spanning data-center CPUs and AI accelerators, client and gaming processors, GPUs, and adaptive computing.",
        levels: {
          support: [
            { price: "Recent range / local lows", note: "The latest post did not name a numeric downside level" }
          ],
          resistance: [
            { price: "$528.50", note: "Key level rejected in the latest twelve-hour chart" }
          ]
        },
        bullish: [
          "Reclaiming $528.50 and holding it as support would restore upside momentum",
          "EPYC CPUs and Instinct accelerators provide exposure to data-center and AI demand",
          "Ryzen, Radeon, semi-custom, FPGA, and embedded products diversify the business",
          "Chiplets, advanced packaging, and performance-per-watt roadmaps support competitiveness"
        ],
        bearish: [
          "Remaining below $528.50 keeps the short-term setup under pressure",
          "Nvidia, Intel, Arm vendors, custom silicon, and software ecosystems intensify competition",
          "Reliance on TSMC and third parties creates wafer, packaging, assembly, and geopolitical risk",
          "Export controls, rapid product cycles, concentration, and cyclical end markets add volatility"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "Revenue grew 38% and data-center sales 57%, but rejection below $528.50 keeps the setup pressured."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "A broad compute portfolio and strong data-center roadmap support growth, balanced against intense competition, foundry dependence, export controls, and fast product cycles.",
          metrics: [
            { label: "Business mix", value: "Data center, client, embedded" },
            { label: "Roadmap", value: "EPYC, Instinct, Ryzen" },
            { label: "Economics", value: "Gross margin and mix" },
            { label: "Investment capacity", value: "R&D and supply" }
          ]
        }
      },
      {
        ticker: "HHH",
        name: "Howard Hughes Holdings",
        tvSymbol: "NYSE:HHH",
        postedChartUrl: "https://www.tradingview.com/x/U1wjzCfc/",
        postedChartDate: "2026-07-13",
        postedChartChannel: "stocks",
        analysisTimeframe: "1 day",
        chartReady: true,
        assetClass: "Stock",
        sector: "Diversified Holdings / Real Estate and Insurance",
        risk: "Elevated",
        tags: ["master-planned communities", "real estate", "specialty insurance", "capital allocation"],
        summary:
          "A diversified holding company combining master-planned-community development and income-producing real estate with specialty insurance and reinsurance.",
        levels: {
          support: [
            { price: "$61.41", note: "Primary support in the latest daily chart" }
          ],
          resistance: [
            { price: "$85.36", note: "First major resistance" },
            { price: "$100.49", note: "Higher resistance after a confirmed breakout" }
          ]
        },
        bullish: [
          "Holding $61.41 would preserve the path toward $85.36 and then $100.49 resistance",
          "Large entitled communities provide long-duration land inventory and staged monetization",
          "Operating properties add recurring NOI beside land sales and condominium cash flows",
          "Vantage introduces underwriting earnings, insurance float, and a second operating platform"
        ],
        bearish: [
          "A sustained loss of $61.41 would invalidate the current daily support structure",
          "Vantage adds underwriting, reserving, catastrophe, regulatory, and integration risk",
          "Rates, housing demand, construction, permitting, climate, and timing affect real estate",
          "Debt, preferred equity, dilution, related-party financing, and fees add complexity"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "Land and recurring property income offer upside, but leverage and governance risks remain; $61.41 must hold before $85.36."
        },
        fundamentals: {
          rating: "Moderate",
          rationale:
            "Long-duration land, recurring property income, and a new insurance platform offer multiple value drivers, but leverage, development cyclicality, underwriting, and governance keep risk elevated.",
          metrics: [
            { label: "Land economics", value: "Acres, price, and EBT" },
            { label: "Property engine", value: "NOI and occupancy" },
            { label: "Development", value: "Presales and margins" },
            { label: "Insurance", value: "Combined ratio and reserves" }
          ]
        }
      },
      {
        ticker: "MON",
        name: "Monad",
        tvSymbol: "COINBASE:MONUSD",
        postedChartUrl: "https://www.tradingview.com/x/8249uTFD/",
        postedChartDate: "2026-07-22",
        postedChartChannel: "crypto",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Digital asset",
        sector: "Layer-1 Blockchain / Smart-Contract Platform",
        risk: "Very High",
        tags: ["layer 1", "EVM compatible", "staking", "smart contracts"],
        summary:
          "The native token of Monad, an EVM-compatible Layer-1 network, used to pay transaction fees and stake for network security.",
        levels: {
          support: [
            { price: "$0.01814", note: "Major support below the recent range" }
          ],
          resistance: [
            { price: "$0.025", note: "Immediate breakout decision level" },
            { price: "$0.03016", note: "Next resistance after a confirmed hold" }
          ]
        },
        bullish: [
          "Breaking above $0.025 and holding it as support would put $0.03016 in view",
          "MON has direct protocol utility for transaction fees and validator staking",
          "EVM bytecode and Ethereum RPC compatibility can reduce migration friction",
          "Base transaction fees are burned, linking network usage to a supply offset"
        ],
        bearish: [
          "Another rejection at $0.025 would refocus the recent range and $0.01814 support",
          "MON is not an equity or contractual claim on protocol revenue",
          "Block rewards and scheduled team and investor unlocks expand circulating supply",
          "Adoption, protocol, validator, custody, liquidity, volatility, and regulatory risks are substantial"
        ],
        aiAnalysis: {
          rating: "Sell",
          why: "Live utility is outweighed by limited history, unlocks and inflation; $0.025 must break, while $0.01814 remains major support."
        },
        fundamentals: {
          rating: "Weak",
          rationale:
            "Live-network utility, EVM compatibility, staking, and fee burn provide a real protocol foundation, but limited history, uncertain adoption, concentrated stewardship, unlocks, and inflation keep the profile weak.",
          metrics: [
            { label: "Network utility", value: "Gas and staking" },
            { label: "Initial supply", value: "100B MON" },
            { label: "Launch circulation", value: "About 10.8B MON" },
            { label: "Base issuance", value: "About 2B MON annually" }
          ]
        }
      },
      {
        ticker: "CBRS",
        name: "Cerebras Systems",
        tvSymbol: "NASDAQ:CBRS",
        postedChartUrl: "https://www.tradingview.com/x/RjlRkw7D/",
        postedChartDate: "2026-07-27",
        postedChartChannel: "stocks",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "AI Infrastructure / Semiconductors",
        risk: "Very High",
        tags: ["wafer-scale computing", "AI inference", "semiconductors", "cloud infrastructure"],
        summary:
          "A designer of wafer-scale AI processors, integrated computing systems, and software, delivering training and inference through on-premises systems and cloud capacity.",
        levels: {
          support: [
            { price: "$181", note: "Key support after the failed hold above $198" }
          ],
          resistance: [
            { price: "$198", note: "Required reclaim level to restore momentum" }
          ]
        },
        bullish: [
          "Defending $181 would preserve a rebound attempt toward $198",
          "A vertically integrated wafer-scale chip, system, compiler, and cloud stack differentiates the platform",
          "Contracted inference demand supports significant deployment visibility",
          "Cloud, on-premises systems, and partner marketplaces broaden customer access"
        ],
        bearish: [
          "Breaking below $181 without a reclaim could accelerate downside pressure",
          "Revenue and receivables remain concentrated among a small number of customers",
          "Rapid data-center, power, manufacturing, and financing execution is capital intensive",
          "Sole-source wafer supply, losses, competition, export controls, warrants, and dilution add risk"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "Revenue nearly doubled, but losses, customer concentration and a failed $198 breakout make $181 support decisive."
        },
        fundamentals: {
          rating: "Moderate",
          rationale:
            "Differentiated wafer-scale technology, rapid growth, broader distribution, and contracted demand support the business, but losses, concentration, sole-source manufacturing, capital needs, and dilution keep risk very high.",
          metrics: [
            { label: "Revenue engine", value: "Systems and cloud capacity" },
            { label: "Demand visibility", value: "Contracted compute" },
            { label: "Customer quality", value: "Concentration and renewals" },
            { label: "Deployment capacity", value: "Power, capex, and supply" }
          ]
        }
      },
      {
        ticker: "ADBE",
        name: "Adobe",
        tvSymbol: "NASDAQ:ADBE",
        postedChartUrl: "https://www.tradingview.com/x/3rklRZiH/",
        postedChartDate: "2026-07-09",
        postedChartChannel: "stocks",
        analysisTimeframe: "1 week",
        chartReady: true,
        assetClass: "Stock",
        sector: "Software / Creative and Digital Experience",
        risk: "Moderate",
        tags: ["creative software", "documents", "digital experience", "generative AI"],
        summary:
          "A subscription software company spanning creative production, document productivity, digital marketing, and customer-experience workflows, with generative AI integrated across the portfolio.",
        levels: {
          support: [
            { price: "$206.87", note: "Primary weekly rebound support" }
          ],
          resistance: [
            { price: "$259.14", note: "First major resistance for the rebound" }
          ]
        },
        bullish: [
          "Holding $206.87 would preserve the weekly rebound toward $259.14 resistance",
          "Creative Cloud, Acrobat, and Experience Cloud anchor established workflows",
          "Subscription revenue, ARR, and remaining obligations provide recurring visibility",
          "Firefly, Acrobat AI Assistant, and GenStudio embed AI within existing products"
        ],
        bearish: [
          "A sustained loss of $206.87 would weaken the rebound and refocus the recent lows",
          "Generative and agentic AI can reshape workflows and intensify pricing pressure",
          "AI inference, hosting, data-center, and partner costs may pressure margins",
          "Intellectual-property, privacy, authenticity, cybersecurity, and AI rules add exposure"
        ],
        aiAnalysis: {
          rating: "Buy",
          why: "Recurring software and cash flow support a rebound from $206.87 toward $259.14, with AI competition the main risk."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "Entrenched creative, document, and marketing workflows, recurring subscriptions, and strong cash generation support the franchise, while rapid AI competition and evolving cost and legal demands remain key risks.",
          metrics: [
            { label: "Recurring base", value: "ARR and RPO" },
            { label: "Revenue quality", value: "Subscription mix" },
            { label: "AI monetization", value: "Usage and conversion" },
            { label: "Cash generation", value: "Operating cash flow" }
          ]
        }
      },
      {
        ticker: "AXP",
        name: "American Express",
        tvSymbol: "NYSE:AXP",
        postedChartUrl: "https://www.tradingview.com/x/DcTSBbDi/",
        postedChartDate: "2026-07-24",
        postedChartChannel: "stocks",
        analysisTimeframe: "6 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Financial Services / Payments and Card Lending",
        risk: "Moderate",
        tags: ["payments", "premium cards", "merchant network", "consumer credit"],
        summary:
          "An integrated payments and lending company that issues cards, acquires merchants, operates a global network, and earns merchant, membership, service, and interest revenue.",
        levels: {
          support: [
            { price: "$289.47", note: "Major support below the failed $327 level" }
          ],
          resistance: [
            { price: "$327", note: "Key reclaim level and former support" }
          ]
        },
        bullish: [
          "Reclaiming $327 and holding it as support would reopen the prior range",
          "The integrated issuing, acquiring, and network model provides broad transaction visibility",
          "A premium membership brand and differentiated benefits support spending and retention",
          "Merchant revenue, card fees, interest, and network services diversify earnings"
        ],
        bearish: [
          "Remaining below $327 would keep downside pressure active, with major support around $289.47",
          "Spending, funding costs, delinquencies, and credit losses remain economically sensitive",
          "Rewards, lounges, benefits, and cobrand agreements can become more expensive",
          "Network competition, regulation, fraud, cybersecurity, and third-party outages add risk"
        ],
        aiAnalysis: {
          rating: "Buy",
          why: "Strong network economics and a reclaim above $327 favor continuation; $289.47 remains the major downside support."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "The premium brand, integrated network, membership economics, and diversified revenue support durable profitability, balanced against cyclical spending, credit, benefit costs, competition, and regulation.",
          metrics: [
            { label: "Spend engine", value: "Billed business" },
            { label: "Membership base", value: "Cards and fee per card" },
            { label: "Credit quality", value: "Delinquencies and write-offs" },
            { label: "Merchant economics", value: "Discount rate and acceptance" }
          ]
        }
      },
      {
        ticker: "GOOGL",
        name: "Alphabet",
        tvSymbol: "NASDAQ:GOOGL",
        postedChartUrl: "https://www.tradingview.com/x/uj9JUUtu/",
        postedChartDate: "2026-07-23",
        postedChartChannel: "stocks",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Internet / Advertising and Cloud",
        risk: "Moderate",
        tags: ["search", "advertising", "cloud", "AI"],
        summary:
          "A technology holding company whose Google Search, YouTube, subscription, platform, and device businesses fund a growing cloud and AI platform plus longer-duration projects.",
        levels: {
          support: [
            { price: "$295.88", note: "First key support target below the breakdown" },
            { price: "$269.69", note: "Next support after a break below $295.88" }
          ],
          resistance: [
            { price: "$329.28", note: "Broken support and immediate reclaim level" },
            { price: "$347.52", note: "Next resistance after a confirmed reclaim" }
          ]
        },
        bullish: [
          "Reclaiming $329.28 would preserve a rebound attempt toward $347.52",
          "Search, YouTube, Android, Chrome, and Maps provide distribution and advertiser reach",
          "Subscriptions, platforms, devices, Google Cloud, and Workspace diversify the business",
          "Large operating cash flow supports infrastructure, research, acquisitions, and returns"
        ],
        bearish: [
          "Remaining below $329.28 would keep $295.88 in focus, with $269.69 next after another break",
          "Antitrust remedies, privacy rules, and digital-market laws can change products or practices",
          "AI competitors and new discovery interfaces could disrupt search and advertising",
          "Data-center costs, acquisitions, cybersecurity, content claims, and Other Bets add risk"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "Very strong ads, cloud and cash flow offset the broken $329.28 level; $295.88 then $269.69 are downside supports."
        },
        fundamentals: {
          rating: "Very Strong",
          rationale:
            "A highly profitable advertising franchise, expanding cloud platform, broad distribution, and exceptional cash capacity support very strong fundamentals; AI disruption, infrastructure intensity, acquisitions, and regulatory remedies remain key risks.",
          metrics: [
            { label: "Core ad engine", value: "Search and YouTube growth" },
            { label: "Cloud engine", value: "Revenue and operating margin" },
            { label: "Investment load", value: "Capex and depreciation" },
            { label: "Financial capacity", value: "Cash flow and liquidity" }
          ]
        }
      },
      {
        ticker: "XRP",
        name: "XRP",
        tvSymbol: "COINBASE:XRPUSD",
        postedChartUrl: "https://www.tradingview.com/x/YvUJjGkO/",
        postedChartDate: "2026-07-21",
        postedChartChannel: "crypto",
        analysisTimeframe: "1 week",
        chartReady: true,
        assetClass: "Digital asset",
        sector: "Blockchain Payments / Settlement",
        risk: "Very High",
        tags: ["XRP Ledger", "payments", "settlement", "consensus"],
        summary:
          "The native digital asset of the XRP Ledger, used for transaction costs and value transfer on a public consensus network.",
        levels: {
          support: [
            { price: "$1.095", note: "0.786 Fibonacci support in the weekly chart" }
          ],
          resistance: [
            { price: "$1.65", note: "Next Fibonacci resistance after a sustained rebound" }
          ]
        },
        bullish: [
          "Holding $1.095 would preserve the weekly rebound toward $1.65 resistance",
          "XRP is native to an open ledger designed for rapid value transfer",
          "Validator consensus advances the ledger without proof-of-work mining",
          "Built-in exchange and payment features support multiple settlement use cases"
        ],
        bearish: [
          "A confirmed break below $1.095 would weaken the weekly rebound structure",
          "The asset has no issuer earnings, dividend, or contractual cash flow",
          "Adoption, liquidity, custody, regulation, and token concentration affect value",
          "Protocol, validator, bridge, exchange, and wallet risks can create losses"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "Fast settlement and mature utility support the network, but no cash-flow claim and very high volatility favor patience above $1.095."
        },
        fundamentals: {
          rating: "Moderate",
          rationale:
            "A mature public ledger, rapid settlement, and native payment utility support the network thesis, while value still depends on adoption and market demand and carries very high crypto risk.",
          metrics: [
            { label: "Network role", value: "Native fees and settlement" },
            { label: "Consensus cadence", value: "About 4–6 seconds" },
            { label: "Initial supply", value: "100 billion XRP" },
            { label: "Cash-flow claim", value: "None" }
          ]
        }
      },
      {
        ticker: "COIN",
        name: "Coinbase Global",
        tvSymbol: "NASDAQ:COIN",
        postedChartUrl: "https://www.tradingview.com/x/asF1Pfhw/",
        postedChartDate: "2026-07-31",
        postedChartChannel: "crypto",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Financial Technology / Crypto Infrastructure",
        risk: "High",
        tags: ["crypto exchange", "custody", "stablecoins", "onchain infrastructure"],
        summary:
          "A crypto and financial platform earning transaction, subscription, services, stablecoin, custody, and infrastructure revenue.",
        levels: {
          support: [
            { price: "$137.50", note: "Long-term trendline test" },
            { price: "$114.19", note: "Next support after a confirmed trendline break" }
          ],
          resistance: [
            { price: "$159–$175", note: "Recent range after a confirmed trendline hold" }
          ]
        },
        bullish: [
          "Holding $137.50 could support a rebound toward the recent $159–$175 range",
          "Transaction and subscription-and-services revenue provide multiple monetization engines",
          "Custody, stablecoin, derivatives, and developer infrastructure broaden the platform",
          "Operating cash generation supports continued product and compliance investment"
        ],
        bearish: [
          "A clean break below the $137.50 trendline would put $114.19 support in focus",
          "Trading activity and asset prices can make revenue and earnings highly cyclical",
          "Regulatory classification, licensing, sanctions, and jurisdictional rules remain material",
          "Custody, cybersecurity, counterparty, acquisition, and capital-intensity risks persist"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "The Q2 miss and $137.50 trendline test offset platform scale; a hold favors $159–$175, while a break exposes $114.19."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "Scale, diversified monetization, infrastructure breadth, and positive cash generation support the franchise, balanced against crypto cyclicality, regulatory uncertainty, and operational risk.",
          metrics: [
            { label: "2025 net revenue", value: "$6.9 billion" },
            { label: "Transaction revenue", value: "$4.1 billion" },
            { label: "Subscription and services", value: "$2.8 billion" },
            { label: "Operating cash flow", value: "$2.4 billion" }
          ]
        }
      },
      {
        ticker: "USOIL",
        name: "WTI Crude Oil",
        tvSymbol: "TVC:USOIL",
        postedChartUrl: "https://www.tradingview.com/x/NrDsE96k/",
        postedChartDate: "2026-08-06",
        postedChartChannel: "commodities",
        analysisTimeframe: "3 hours",
        chartReady: true,
        assetClass: "Commodity",
        sector: "Energy / Crude Oil",
        risk: "High",
        tags: ["WTI", "energy", "inventories", "geopolitics"],
        summary:
          "A benchmark crude-oil market driven by global supply and demand, inventories, refining, transportation, policy, and geopolitical disruptions.",
        levels: {
          support: [
            { price: "$77.02", note: "Immediate support and prior breakout level" },
            { price: "$62.87", note: "Secondary marked support" },
            { price: "$55.39", note: "Deepest marked support in the latest chart" }
          ],
          resistance: [
            { price: "$107.45", note: "First key resistance target" },
            { price: "$122.98", note: "Next target after a confirmed break above $107.45" }
          ]
        },
        bullish: [
          "Holding above $77.02 would keep $107.45 in focus, followed by $122.98 after a confirmed breakout",
          "Supply disruptions or stronger consumption can tighten the physical balance",
          "Inventory draws can signal demand exceeding current supply",
          "Production restraint and geopolitical risk can increase the scarcity premium"
        ],
        bearish: [
          "A confirmed move below $77.02 would weaken the breakout and refocus $62.87",
          "Higher production or weaker global demand can rebuild inventories and pressure price",
          "Policy shifts, ceasefires, transport normalization, and a stronger dollar can reverse risk premiums",
          "Futures term structure, leverage, roll yield, and contract mechanics complicate investable exposure"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "Supply and inventory signals are mixed, while $107.45 remains distant resistance; futures mechanics keep risk high."
        },
        fundamentals: {
          rating: "Moderate",
          rationale:
            "Deep physical demand and transparent supply-and-inventory data support its benchmark role, while cyclicality, geopolitics, policy, and futures mechanics keep price risk high.",
          metrics: [
            { label: "Supply monitor", value: "Production, imports, and exports" },
            { label: "Balance monitor", value: "Commercial inventories" },
            { label: "Demand monitor", value: "Refinery inputs and products" },
            { label: "External drivers", value: "OPEC+, geopolitics, and USD" }
          ]
        }
      },
      {
        ticker: "BULL",
        name: "Webull Corporation",
        tvSymbol: "NASDAQ:BULL",
        postedChartUrl: "https://www.tradingview.com/x/GT7hHRc4/",
        postedChartDate: "2026-07-27",
        postedChartChannel: "stocks",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Financial Technology / Online Brokerage",
        risk: "High",
        tags: ["brokerage", "trading platform", "market data", "fintech"],
        summary:
          "A technology-driven financial-services company operating a global trading platform across brokerage, wealth, market-data, community, and education products.",
        levels: {
          support: [
            { price: "$7.52", note: "Key support beneath the current rally" }
          ],
          resistance: [
            { price: "$9", note: "Blue-trendline target while $7.52 holds" }
          ]
        },
        bullish: [
          "Holding $7.52 as support would put the blue trendline near $9 in view",
          "A multi-market footprint broadens the addressable customer base",
          "Brokerage, wealth distribution, market data, community, and education diversify engagement",
          "Licensing across multiple jurisdictions supports international expansion"
        ],
        bearish: [
          "Losing $7.52 without a reclaim would weaken the breakout",
          "Trading activity, market levels, rates, and customer balances can make revenue cyclical",
          "Broker-dealer, privacy, anti-money-laundering, and cross-border rules raise compliance costs",
          "Competition, outages, cybersecurity, execution quality, and international expansion add risk"
        ],
        aiAnalysis: {
          rating: "Buy",
          why: "Revenue grew 46% and profitability returned; holding $7.52 as support opens a plausible move toward $9."
        },
        fundamentals: {
          rating: "Moderate",
          rationale:
            "A broad international footprint and large registered-user base support platform scale, while activity sensitivity, regulation, competition, and expansion execution keep risk high.",
          metrics: [
            { label: "Operating footprint", value: "16 markets" },
            { label: "Licensed footprint", value: "35 markets" },
            { label: "Registered users", value: "27 million+" },
            { label: "Service breadth", value: "Trading, wealth, data, community" }
          ]
        }
      },
      {
        ticker: "SNAP",
        name: "Snap Inc.",
        tvSymbol: "NYSE:SNAP",
        postedChartUrl: "https://www.tradingview.com/x/NZ529F5T/",
        postedChartDate: "2026-08-05",
        postedChartChannel: "stocks",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Internet / Social Media and Advertising",
        risk: "High",
        tags: ["social media", "advertising", "AR", "subscriptions"],
        summary:
          "A camera-centered social and messaging platform monetized mainly through advertising, with subscriptions and augmented-reality products adding diversification.",
        levels: {
          support: [
            { price: "$4.81–$5.38", note: "Primary pullback support zone in the latest chart" },
            { price: "$3.82", note: "Deeper marked support" }
          ],
          resistance: [
            { price: "$7.07", note: "Next marked resistance above the support zone" }
          ]
        },
        bullish: [
          "Holding the $4.81–$5.38 zone would preserve the recovery toward $7.07",
          "Q1 2026 revenue grew 12% year over year while global daily active users grew 5% to 483 million",
          "Subscription-led other revenue expanded sharply and provides some diversification beyond advertising",
          "Positive operating cash flow and substantial liquid resources support continued product and augmented-reality investment"
        ],
        bearish: [
          "A confirmed break below $4.81 would weaken the setup and refocus deeper support at $3.82",
          "Advertising still supplied 87% of 2025 revenue, leaving results exposed to advertiser budgets and measurement changes",
          "The company remained GAAP loss-making in Q1 2026 and carried $3.5 billion of debt",
          "User engagement, platform competition, privacy rules, and product execution can pressure growth and monetization"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "SNAP is testing $4.81–$5.38 support below $7.07 resistance; revenue growth helps, but losses and debt persist."
        },
        fundamentals: {
          rating: "Moderate",
          rationale:
            "Growing users, faster revenue growth, expanding subscription revenue, and positive cash generation are balanced by continued GAAP losses, advertising concentration, debt, and intense platform competition.",
          metrics: [
            { label: "Q1 2026 revenue", value: "$1.529B (+12% YoY)" },
            { label: "Global daily active users", value: "483M (+5% YoY)" },
            { label: "Net loss / operating cash flow", value: "$89.0M / $326.8M" },
            { label: "Cash and securities / debt", value: "$2.8B / $3.5B" }
          ]
        }
      },
      {
        ticker: "CLF",
        name: "Cleveland-Cliffs",
        tvSymbol: "NYSE:CLF",
        postedChartUrl: "https://www.tradingview.com/x/2hkeNf6m/",
        postedChartDate: "2026-07-23",
        postedChartChannel: "stocks",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Materials / Integrated Steel",
        risk: "High",
        tags: ["steel", "automotive", "iron ore", "vertical integration"],
        summary:
          "A vertically integrated North American steel producer focused on value-added sheet products, especially automotive steel.",
        levels: {
          support: [
            {
              price: "Recent range",
              note: "The latest 12-hour post did not name a numeric lower support level"
            }
          ],
          resistance: [
            { price: "$11.32", note: "First reclaim and breakout decision level" },
            { price: "$14.49", note: "Next resistance after a confirmed breakout" },
            { price: "$15.08", note: "Upper resistance in the latest chart" }
          ]
        },
        bullish: [
          "A confirmed reclaim of $11.32 would put $14.49 and then $15.08 in view",
          "Vertical integration from iron ore and scrap through steelmaking and finishing provides greater control over inputs and production",
          "Its established automotive-grade franchise and fixed-price contracts provide differentiated customer relationships and some pricing stability",
          "Q1 2026 adjusted EBITDA returned to $95 million as shipments improved from the prior quarter"
        ],
        bearish: [
          "Rejection at $11.32 would keep the 12-hour structure capped; the latest post did not define a numeric lower support",
          "Q1 2026 still produced a $229 million GAAP net loss and $325 million of operating cash use",
          "Long-term debt was $7.763 billion at quarter-end, making leverage and refinancing costs important",
          "Steel prices, automotive demand, energy and raw-material costs, tariffs, and capital intensity can make results highly cyclical"
        ],
        aiAnalysis: {
          rating: "Sell",
          why: "Price reclaimed $11.32, but a $229M loss, $325M operating cash use and $7.763B debt outweigh the setup."
        },
        fundamentals: {
          rating: "Weak",
          rationale:
            "Scale, vertical integration, automotive positioning, and liquidity are meaningful strengths, but current profitability and cash flow remain weak and leverage is substantial; recovery depends heavily on steel pricing, demand, and cost execution.",
          metrics: [
            { label: "Q1 2026 revenue", value: "$4.922B" },
            { label: "Steel shipments", value: "4.108M net tons" },
            { label: "Net loss / operating cash use", value: "$229M / $325M" },
            { label: "Liquidity / long-term debt", value: "$3.1B / $7.763B" }
          ]
        }
      },
      {
        ticker: "CLOV",
        name: "Clover Health Investments",
        tvSymbol: "NASDAQ:CLOV",
        postedChartUrl: "https://www.tradingview.com/x/po7a6W5Z/",
        postedChartDate: "2026-08-06",
        postedChartChannel: "stocks",
        analysisTimeframe: "1 week",
        chartReady: true,
        assetClass: "Stock",
        sector: "Health Insurance / Healthcare Technology",
        risk: "Very High",
        tags: ["Medicare Advantage", "healthcare technology", "insurance", "small cap"],
        summary:
          "A Medicare Advantage insurer using software and data to support physician decision-making, with medical-cost and policy risk at the center of the story.",
        levels: {
          support: [
            { price: "$3.81", note: "Local support in the latest weekly chart" }
          ],
          resistance: [
            { price: "$6.46", note: "Next key target in the latest weekly chart" }
          ]
        },
        bullish: [
          "Holding $3.81 as support keeps the $6.46 target in view",
          "A recurring Medicare Advantage premium base can support operating scale",
          "Clover Assistant and physician-enablement software provide a differentiated data layer"
        ],
        bearish: [
          "Losing $3.81 would weaken the weekly setup and increase downside risk",
          "Medical-cost trends, Star ratings, and Medicare policy can pressure margins and growth",
          "Small-cap liquidity, execution, and profitability risk remain elevated"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "The rebound is constructive above $3.81, but high volatility and healthcare execution risk argue for confirmation toward $6.46."
        },
        fundamentals: {
          rating: "Moderate",
          rationale:
            "Clover combines Medicare Advantage coverage with a physician-enablement software platform, while medical-cost, policy, scale, and profitability risks remain high.",
          metrics: [
            { label: "Core business", value: "Medicare Advantage" },
            { label: "Technology layer", value: "Clover Assistant" },
            { label: "Primary operating risk", value: "Medical-cost trend" },
            { label: "Policy exposure", value: "CMS and Star ratings" }
          ]
        }
      },
      {
        ticker: "MU",
        name: "Micron Technology",
        tvSymbol: "NASDAQ:MU",
        postedChartUrl: "https://www.tradingview.com/x/a6Hg1LWL/",
        postedChartDate: "2026-08-06",
        postedChartChannel: "stocks",
        analysisTimeframe: "12 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Semiconductors / Memory",
        risk: "High",
        tags: ["memory", "semiconductors", "AI infrastructure", "data center"],
        summary:
          "A memory and storage semiconductor manufacturer leveraged to data-center, AI, client, mobile, and industrial demand.",
        levels: {
          support: [
            { price: "$862", note: "Current support in the latest 12-hour chart" }
          ],
          resistance: [
            { price: "$955.41", note: "Breakout decision level in the latest 12-hour chart" }
          ]
        },
        bullish: [
          "Holding $862 and clearing $955.41 would strengthen the current momentum",
          "AI and data-center memory demand can support a favorable product mix",
          "Scale and technology breadth provide operating leverage when memory pricing cooperates"
        ],
        bearish: [
          "Losing $862 would weaken the setup and increase the risk of a deeper pullback",
          "Memory pricing is cyclical and the business is capital intensive",
          "Geopolitical, supply-chain, execution, and customer-concentration risks remain material"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "The chart is constructive above $862, but the $955.41 resistance and cyclical memory economics call for confirmation."
        },
        fundamentals: {
          rating: "Moderate",
          rationale:
            "Micron supplies DRAM, NAND, and other memory and storage products into data-center, AI, mobile, and industrial markets; cycle, capex, and pricing risk remain important.",
          metrics: [
            { label: "Product families", value: "DRAM, NAND, NOR" },
            { label: "Growth exposure", value: "AI and data center" },
            { label: "Primary cycle", value: "Memory pricing" },
            { label: "Operating risk", value: "Capex and supply balance" }
          ]
        }
      },
      {
        ticker: "BMNR",
        name: "BitMine Immersion Technologies",
        tvSymbol: "NYSE:BMNR",
        postedChartUrl: "https://www.tradingview.com/x/ccnp6Ed4/",
        postedChartDate: "2026-08-05",
        postedChartChannel: "crypto",
        analysisTimeframe: "6 hours",
        chartReady: true,
        assetClass: "Stock",
        sector: "Ethereum Treasury / Digital Assets",
        risk: "Very High",
        tags: ["Ethereum treasury", "digital assets", "staking", "capital markets"],
        summary:
          "An Ethereum-treasury company using capital-markets activity and protocol-level strategies to increase its exposure to ETH.",
        levels: {
          support: [
            { price: "$12.86", note: "Recent low and key support in the latest chart" }
          ],
          resistance: [
            { price: "$17.62", note: "Immediate reclaim decision level" },
            { price: "$160.85", note: "Highest marked resistance in the latest chart" }
          ]
        },
        bullish: [
          "Reclaiming and holding $17.62 would improve the six-hour structure after the $12.86 low",
          "ETH as the primary treasury reserve asset provides concentrated participation in Ethereum upside",
          "Staking and other protocol-level activity may supplement simple treasury exposure",
          "Capital-markets access can expand the treasury when financing conditions are favorable"
        ],
        bearish: [
          "Failure at $17.62 would leave $12.86 exposed to another test",
          "Concentrated ETH exposure can create extreme balance-sheet and equity volatility",
          "Equity issuance and other financing can dilute shareholders even when the treasury grows",
          "Custody, staking, decentralized-finance, regulatory, and execution risks remain material"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "BMNR must reclaim $17.62 after the $12.86 low; concentrated ETH exposure and financing risk keep volatility extreme."
        },
        fundamentals: {
          rating: "Weak",
          rationale:
            "The Ethereum-treasury strategy offers direct upside participation, but concentration, financing, dilution, custody, and protocol risks make the equity highly speculative.",
          metrics: [
            { label: "Primary reserve asset", value: "ETH" },
            { label: "Strategy", value: "Accumulation, staking, and DeFi" },
            { label: "Core value driver", value: "ETH exposure per share" },
            { label: "Primary risk", value: "Crypto volatility and dilution" }
          ]
        }
      },
      {
        ticker: "TLT",
        name: "iShares 20+ Year Treasury Bond ETF",
        tvSymbol: "NASDAQ:TLT",
        postedChartUrl: "https://www.tradingview.com/x/72VIBXi6/",
        postedChartDate: "2026-08-07",
        postedChartChannel: "bonds",
        analysisTimeframe: "1 week",
        chartReady: true,
        assetClass: "ETF",
        sector: "Long-Duration U.S. Treasuries",
        risk: "High",
        tags: ["Treasuries", "long duration", "interest rates", "fixed income"],
        summary:
          "An ETF tracking U.S. Treasury bonds with remaining maturities greater than 20 years, providing targeted long-duration government-debt exposure.",
        levels: {
          support: [
            { price: "$80.30–$82.47", note: "Long-term support zone in the latest weekly chart" }
          ],
          resistance: [
            { price: "$96.88", note: "Major marked resistance in the latest weekly chart" }
          ]
        },
        bullish: [
          "Holding $80.30–$82.47 would preserve a long-term rebound path toward $96.88",
          "Falling long-term Treasury yields would generally support the price of this long-duration fund",
          "U.S. Treasury exposure minimizes underlying corporate-credit risk",
          "Monthly distributions and active trading support income access and liquidity"
        ],
        bearish: [
          "A weekly break below $80.30 would invalidate the highlighted support zone",
          "Rising long-term yields can produce sharp price declines because duration is high",
          "Persistent inflation or higher real-rate expectations can keep long bonds under pressure",
          "The fund has no equity-growth engine and remains exposed to tracking and fee drag"
        ],
        aiAnalysis: {
          rating: "Hold",
          why: "TLT is testing $80.30–$82.47 long-term support; duration offers upside if yields fall, but a break below $80.30 would weaken the setup."
        },
        fundamentals: {
          rating: "Strong",
          rationale:
            "TLT offers liquid, low-cost access to long U.S. Treasuries with minimal credit risk, balanced against substantial interest-rate and duration volatility.",
          metrics: [
            { label: "Benchmark", value: "ICE US Treasury 20+ Year Bond Index" },
            { label: "Maturity exposure", value: "Greater than 20 years" },
            { label: "Expense ratio", value: "0.15%" },
            { label: "Distribution frequency", value: "Monthly" }
          ]
        }
      }
    ]
  }
};
