window.PORTFOLIO_DATA = {
  metadata: {
    portfolioName: "Chart Champ Portfolio",
    mode: "public-static-v1",
    sourceName: "Twelve Data API when configured; static sourced snapshot fallback",
    sourceTimestamp: "2026-05-22T09:00:00-07:00",
    sourceControlWorkbook: "discord-automation-control-center.xlsx",
    quoteProviderStatus: "Twelve Data adapter enabled when an API key is available",
    futureQuoteProvider: "Twelve Data",
    publicFooter: "For educational purposes only. Not financial advice."
  },
  portfolio: {
    referenceDate: "2026-05-22",
    startingValue: 10000,
    cashValue: 5000,
    investedValue: 5000,
    displayNote: "$10,000 portfolio with $5,000 cash and $5,000 allocated to SQQQ.",
    performance: {
      dayPct: 0,
      weekPct: 0,
      monthPct: 0,
      ytdPct: 0
    }
  },
  holdings: [
    {
      ticker: "CASH",
      name: "Unallocated cash",
      assetClass: "Cash",
      marketSegment: "Cash",
      displayPublicly: true,
      allocationPct: 50,
      referencePrice: 1,
      latestPrice: 1,
      dayChangePct: 0,
      shares: 5000,
      marketValue: 5000,
      quoteEnabled: false,
      publicNote: "Cash reserve for future portfolio updates.",
      dataSource: "Static sourced fallback"
    },
    {
      ticker: "SQQQ",
      name: "ProShares UltraPro Short QQQ",
      assetClass: "Leveraged inverse ETF",
      marketSegment: "Stocks",
      displayPublicly: true,
      allocationPct: 50,
      referencePrice: 40.86,
      latestPrice: 40.86,
      dayChangePct: 0,
      shares: 122.3691,
      marketValue: 5000,
      quoteEnabled: true,
      publicNote: "Short-term bearish market position opened May 22, 2026 at $40.86.",
      dataSource: "Static sourced fallback"
    }
  ],
  decisions: [
    {
      date: "2026-05-22",
      ticker: "SQQQ",
      type: "Trade opened",
      rationale: "Opened a $5,000 SQQQ position at $40.86 while keeping $5,000 in cash. The setup is based on a short-term bearish market view while SQQQ holds above the $40.70 support area.",
      chartUrl: "https://www.tradingview.com/x/Yq89Rv6E/",
      details: [
        "Entry: $40.86",
        "Support watched: $40.70",
        "Stop level: $39.63, about 3.0% below entry",
        "Target level 1: $45.25, about 10.7% above entry",
        "Target level 2: $52.53, about 28.6% above entry",
        "Context: bearish May-to-October seasonality during midterm election years and possible Fed chair transition headlines.",
        "Bias: bullish SQQQ / bearish market short-term while $40.70 holds."
      ],
      displayPublicly: true
    }
  ]
};
