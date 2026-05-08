window.PORTFOLIO_DATA = {
  metadata: {
    portfolioName: "Chart Champ Portfolio",
    mode: "public-static-v1",
    sourceName: "Twelve Data API when configured; static sourced snapshot fallback",
    sourceTimestamp: "2026-05-08T10:10:00-07:00",
    sourceControlWorkbook: "discord-automation-control-center.xlsx",
    quoteProviderStatus: "Twelve Data adapter enabled when an API key is available",
    futureQuoteProvider: "Twelve Data",
    publicFooter: "For educational purposes only. Not financial advice."
  },
  portfolio: {
    referenceDate: "2026-04-01",
    displayNote: "Starter portfolio uses equal 25% allocations.",
    performance: {
      dayPct: 1.56,
      weekPct: 5.06,
      monthPct: 14.28,
      ytdPct: 17.66
    }
  },
  holdings: [
    {
      ticker: "SPY",
      name: "SPDR S&P 500 ETF Trust",
      assetClass: "US equity ETF",
      marketSegment: "Stocks",
      displayPublicly: true,
      allocationPct: 25,
      referencePrice: 655.24,
      latestPrice: 737.17,
      dayChangePct: 0.76,
      publicNote: "Broad US large-cap equity exposure.",
      dataSource: "Static sourced fallback"
    },
    {
      ticker: "QQQ",
      name: "Invesco QQQ Trust",
      assetClass: "US equity ETF",
      marketSegment: "Stocks",
      displayPublicly: true,
      allocationPct: 25,
      referencePrice: 584.31,
      latestPrice: 708.55,
      dayChangePct: 1.96,
      publicNote: "Large-cap technology and growth-oriented exposure.",
      dataSource: "Static sourced fallback"
    },
    {
      ticker: "NVDA",
      name: "NVIDIA Corp.",
      assetClass: "US stock",
      marketSegment: "Stocks",
      displayPublicly: true,
      allocationPct: 25,
      referencePrice: 175.75,
      latestPrice: 215.50,
      dayChangePct: 1.89,
      publicNote: "Semiconductor and AI infrastructure exposure.",
      dataSource: "Static sourced fallback"
    },
    {
      ticker: "AAPL",
      name: "Apple Inc.",
      assetClass: "US stock",
      marketSegment: "Stocks",
      displayPublicly: true,
      allocationPct: 25,
      referencePrice: 255.63,
      latestPrice: 292.10,
      dayChangePct: 1.62,
      publicNote: "Consumer technology and services exposure.",
      dataSource: "Static sourced fallback"
    }
  ],
  decisions: [
    {
      date: "2026-04-01",
      ticker: "SPY, QQQ, NVDA, AAPL",
      type: "Starter allocation",
      rationale: "Launched equal-weight sample portfolio for public dashboard testing.",
      displayPublicly: true
    },
    {
      date: "2026-05-08",
      ticker: "ALL",
      type: "Data layer update",
      rationale: "Prepared Twelve Data API integration with a sourced static fallback while the local API key is configured.",
      displayPublicly: true
    }
  ]
};
