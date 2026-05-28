(async function () {
  const baseData = window.PORTFOLIO_DATA;
  const livePrices = window.PORTFOLIO_LIVE_PRICES || null;
  const twelveDataConfig = window.TWELVE_DATA_CONFIG || {};
  const colors = ["#255e91", "#16745f", "#b67713", "#6b5b95", "#b54848"];
  const segmentColors = {
    Stocks: "#255e91",
    Crypto: "#16745f",
    Cash: "#66727f",
    Bonds: "#6b5b95",
    Commodities: "#b67713"
  };

  const formatPercent = (value) => {
    const prefix = value > 0 ? "+" : "";
    return `${prefix}${value.toFixed(2)}%`;
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2
    }).format(value);
  };

  const toLocalDate = (value) => {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(value);
  };

  const toDateKey = (date) => {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  };

  const formatDate = (value, options = {}) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      ...options
    }).format(toLocalDate(value));
  };

  const formatTimestamp = (value) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short"
    }).format(new Date(value));
  };

  const classifyChange = (value) => {
    if (value > 0) return "positive";
    if (value < 0) return "negative";
    return "neutral";
  };

  const pctChange = (latest, reference) => {
    if (!Number.isFinite(latest) || !Number.isFinite(reference) || reference === 0) return 0;
    return ((latest - reference) / reference) * 100;
  };

  const currentHoldingValue = (holding) => {
    if (holding.quoteEnabled === false && Number.isFinite(holding.marketValue)) {
      return holding.marketValue;
    }
    if (Number.isFinite(holding.shares) && Number.isFinite(holding.latestPrice)) {
      return holding.shares * holding.latestPrice;
    }
    if (Number.isFinite(holding.marketValue)) {
      return holding.marketValue;
    }
    return holding.latestPrice;
  };

  const displayHoldingValue = (holding) => {
    return formatMoney(currentHoldingValue(holding));
  };

  const parsePrice = (value) => Number.parseFloat(value);

  const getApiKey = () => {
    return (twelveDataConfig.apiKey || "").trim();
  };

  const findOnOrBefore = (rows, targetDate) => {
    const target = toDateKey(targetDate);
    return rows.find((row) => row.datetime <= target) || rows[rows.length - 1];
  };

  const findOnOrAfter = (rows, targetKey) => {
    return [...rows].reverse().find((row) => row.datetime >= targetKey) || rows[rows.length - 1];
  };

  const fetchTwelveDataRows = async (ticker, apiKey) => {
    const startYear = toLocalDate(baseData.portfolio.referenceDate).getFullYear();
    const params = new URLSearchParams({
      symbol: ticker,
      interval: "1day",
      start_date: `${startYear}-01-01`,
      order: "desc",
      adjust: "splits",
      dp: "2",
      apikey: apiKey
    });
    const response = await fetch(`https://api.twelvedata.com/time_series?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Twelve Data request failed for ${ticker}`);
    }
    const payload = await response.json();
    if (payload.status === "error" || !Array.isArray(payload.values)) {
      throw new Error(payload.message || `No Twelve Data values for ${ticker}`);
    }
    return payload.values.map((row) => ({
      datetime: row.datetime.slice(0, 10),
      close: parsePrice(row.close)
    }));
  };

  const tryLoadTwelveData = async () => {
    const apiKey = getApiKey();
    if (!twelveDataConfig.enabled || !apiKey) {
      return null;
    }

    const referenceKey = baseData.portfolio.referenceDate;
    const enriched = await Promise.all(
      baseData.holdings.map(async (holding) => {
        if (holding.quoteEnabled === false) {
          return {
            holding,
            rows: [
              {
                datetime: referenceKey,
                close: holding.latestPrice
              }
            ],
            latestDate: referenceKey,
            latestPrice: holding.latestPrice,
            referencePrice: holding.referencePrice,
            dayChangePct: 0
          };
        }
        const rows = await fetchTwelveDataRows(holding.ticker, apiKey);
        const latest = rows[0];
        const previous = rows[1] || latest;

        return {
          holding,
          rows,
          latestDate: latest.datetime,
          latestPrice: latest.close,
          referencePrice: holding.referencePrice,
          dayChangePct: pctChange(latest.close, previous.close)
        };
      })
    );

    const latestDate = enriched
      .map((item) => item.latestDate)
      .sort()
      .at(-1);
    const latestTimestamp = `${latestDate}T16:00:00-04:00`;
    return {
      holdings: enriched.map(({ holding, latestPrice, referencePrice, dayChangePct }) => ({
        ...holding,
        latestPrice,
        referencePrice,
        dayChangePct,
        marketValue: currentHoldingValue({ ...holding, latestPrice }),
        dataSource: "Twelve Data"
      })),
      performance: buildPerformance(enriched, latestTimestamp),
      timestamp: latestTimestamp
    };
  };

  const normalizeLiveHistory = (quote, fallbackDate) => {
    const sourceRows = Array.isArray(quote.history) ? quote.history : [];
    const rowsByDate = new Map();

    sourceRows.forEach((row) => {
      const datetime = String(row.datetime || "").slice(0, 10);
      const close = parsePrice(row.close);
      if (/^\d{4}-\d{2}-\d{2}$/.test(datetime) && Number.isFinite(close)) {
        rowsByDate.set(datetime, { datetime, close });
      }
    });

    const latestPrice = parsePrice(quote.latestPrice);
    const latestDate = String(quote.latestDate || "").slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(latestDate) && Number.isFinite(latestPrice)) {
      rowsByDate.set(latestDate, { datetime: latestDate, close: latestPrice });
    }

    if (rowsByDate.size === 0 && Number.isFinite(latestPrice)) {
      rowsByDate.set(fallbackDate, { datetime: fallbackDate, close: latestPrice });
    }

    return Array.from(rowsByDate.values()).sort((a, b) => b.datetime.localeCompare(a.datetime));
  };

  const tryLoadLiveSnapshot = () => {
    if (!livePrices?.prices) {
      return null;
    }

    const referenceKey = baseData.portfolio.referenceDate;
    const snapshotDate = String(livePrices.generatedAt || new Date().toISOString()).slice(0, 10);
    const enriched = baseData.holdings.map((holding) => {
      if (holding.quoteEnabled === false) {
        return {
          holding,
          rows: [
            {
              datetime: snapshotDate || referenceKey,
              close: holding.latestPrice
            }
          ],
          latestDate: snapshotDate || referenceKey,
          latestPrice: holding.latestPrice,
          referencePrice: holding.referencePrice,
          dayChangePct: 0
        };
      }

      const quote = livePrices.prices[holding.ticker];
      if (!quote) {
        throw new Error(`Live quote missing for ${holding.ticker}`);
      }

      const rows = normalizeLiveHistory(quote, referenceKey);
      const latest = rows[0];
      if (!latest) {
        throw new Error(`Live quote history missing for ${holding.ticker}`);
      }

      const previousClose = parsePrice(quote.previousClose);
      const previous = Number.isFinite(previousClose)
        ? { close: previousClose }
        : rows.find((row) => row.datetime < latest.datetime) || rows[1] || latest;
      return {
        holding,
        rows,
        latestDate: latest.datetime,
        latestPrice: latest.close,
        referencePrice: holding.referencePrice,
        dayChangePct: pctChange(latest.close, previous.close)
      };
    });

    const latestTimestamp = livePrices.generatedAt || `${snapshotDate || referenceKey}T16:00:00-04:00`;
    return {
      holdings: enriched.map(({ holding, latestPrice, referencePrice, dayChangePct }) => ({
        ...holding,
        latestPrice,
        referencePrice,
        dayChangePct,
        marketValue: currentHoldingValue({ ...holding, latestPrice }),
        dataSource: livePrices.provider || "Scheduled quote snapshot"
      })),
      performance: buildPerformance(enriched, latestTimestamp),
      timestamp: latestTimestamp
    };
  };

  const buildFallbackDataset = () => {
    const holdings = baseData.holdings.map((holding) => ({ ...holding }));
    return {
      holdings,
      performance: {
        dayPct: weightedFromHoldings(holdings, "dayChangePct"),
        weekPct: baseData.portfolio.performance.weekPct,
        monthPct: baseData.portfolio.performance.monthPct,
        ytdPct: weightedReturn(holdings)
      },
      timestamp: baseData.metadata.sourceTimestamp
    };
  };

  function weightedFromHoldings(holdings, field) {
    return holdings.reduce((sum, holding) => {
      return sum + holding[field] * (holding.allocationPct / 100);
    }, 0);
  }

  function weightedReturn(holdings) {
    return holdings.reduce((sum, holding) => {
      return sum + pctChange(holding.latestPrice, holding.referencePrice) * (holding.allocationPct / 100);
    }, 0);
  }

  function buildPerformance(enriched, latestTimestamp) {
    const latestDate = new Date(latestTimestamp);
    const weekDate = new Date(latestDate);
    weekDate.setDate(weekDate.getDate() - 7);
    const monthDate = new Date(latestDate);
    monthDate.setMonth(monthDate.getMonth() - 1);

    const periodReturn = (resolver) => {
      return enriched.reduce((sum, item) => {
        const latest = item.rows[0];
        const reference = resolver(item);
        return sum + pctChange(latest.close, reference.close) * (item.holding.allocationPct / 100);
      }, 0);
    };

    return {
      dayPct: enriched.reduce((sum, item) => {
        return sum + item.dayChangePct * (item.holding.allocationPct / 100);
      }, 0),
      weekPct: periodReturn((item) => findOnOrBefore(item.rows, weekDate)),
      monthPct: periodReturn((item) => findOnOrBefore(item.rows, monthDate)),
      ytdPct: periodReturn((item) => {
        return { close: item.holding.referencePrice };
      })
    };
  }

  const render = (dataset) => {
    const publicHoldings = dataset.holdings.filter((holding) => holding.displayPublicly);
    const publicDecisions = baseData.decisions.filter((decision) => decision.displayPublicly);

    const enrichedHoldings = publicHoldings.map((holding) => {
      const totalReturnPct = pctChange(holding.latestPrice, holding.referencePrice);
      return { ...holding, totalReturnPct };
    });

    const weightedTotalReturn = weightedReturn(enrichedHoldings);

    const portfolioReturnEl = document.getElementById("portfolio-return");
    portfolioReturnEl.textContent = formatPercent(weightedTotalReturn);
    portfolioReturnEl.className = `metric-value ${classifyChange(weightedTotalReturn)}`;

    const performanceItems = [
      ["Day", dataset.performance.dayPct],
      ["Week", dataset.performance.weekPct],
      ["Month", dataset.performance.monthPct],
      ["YTD", dataset.performance.ytdPct]
    ];
    const performanceMax = Math.max(...performanceItems.map(([, value]) => Math.abs(value)), 1);
    document.getElementById("period-performance-list").innerHTML = performanceItems
      .map(([label, value]) => {
        const width = Math.max((Math.abs(value) / performanceMax) * 100, 8);
        const tone = classifyChange(value);
        return `
          <div class="period-row ${tone}">
            <span class="period-label">${label}</span>
            <div class="period-track" aria-hidden="true">
              <span style="width:${width}%"></span>
            </div>
            <strong>${formatPercent(value)}</strong>
          </div>
        `;
      })
      .join("");

    document.getElementById("holdings-count").textContent = String(publicHoldings.length);
    document.getElementById("last-updated").textContent = formatTimestamp(dataset.timestamp);
    document.getElementById("portfolio-return-context").textContent = `Since ${formatDate(baseData.portfolio.referenceDate)}`;
    document.getElementById("portfolio-note").textContent = baseData.portfolio.displayNote;

    const holdingsBody = document.getElementById("holdings-body");
    const emptyState = document.getElementById("empty-state");
    const renderHoldings = (holdings) => {
      holdingsBody.innerHTML = holdings
        .map((holding) => {
          const dayClass = classifyChange(holding.dayChangePct);
          const returnClass = classifyChange(holding.totalReturnPct);

          return `
            <tr>
              <td>
                <div class="ticker-cell">
                  <strong>${holding.ticker}</strong>
                  <span>${holding.name}</span>
                </div>
              </td>
              <td><span class="tag">${holding.assetClass}</span></td>
              <td>${holding.allocationPct.toFixed(0)}%</td>
              <td>${displayHoldingValue(holding)}</td>
              <td class="${dayClass}">${formatPercent(holding.dayChangePct)}</td>
              <td class="${returnClass}">${formatPercent(holding.totalReturnPct)}</td>
              <td>${holding.publicNote}</td>
            </tr>
          `;
        })
        .join("");
      emptyState.hidden = holdings.length !== 0;
    };

    renderHoldings(enrichedHoldings);

    const searchInput = document.getElementById("ticker-search");
    searchInput.addEventListener("input", (event) => {
      const query = event.target.value.trim().toLowerCase();
      const filteredHoldings = enrichedHoldings.filter((holding) => {
        return `${holding.ticker} ${holding.name} ${holding.assetClass}`.toLowerCase().includes(query);
      });
      renderHoldings(filteredHoldings);
    });

    const allocationStops = [];
    let cursor = 0;
    enrichedHoldings.forEach((holding, index) => {
      const end = cursor + holding.allocationPct;
      allocationStops.push(`${colors[index % colors.length]} ${cursor}% ${end}%`);
      cursor = end;
    });
    document.getElementById("allocation-donut").style.background = `conic-gradient(${allocationStops.join(", ")})`;

    document.getElementById("allocation-list").innerHTML = enrichedHoldings
      .map((holding, index) => {
        return `
          <div class="allocation-row">
            <span class="swatch" style="background:${colors[index % colors.length]}"></span>
            <strong>${holding.ticker}</strong>
            <span>${holding.allocationPct.toFixed(0)}%</span>
          </div>
        `;
      })
      .join("");

    const segmentOrder = ["Stocks", "Cash", "Crypto", "Bonds", "Commodities"];
    const segmentTotals = segmentOrder.reduce((totals, segment) => ({ ...totals, [segment]: 0 }), {});
    enrichedHoldings.forEach((holding) => {
      const segment = segmentOrder.includes(holding.marketSegment) ? holding.marketSegment : "Stocks";
      segmentTotals[segment] += holding.allocationPct;
    });

    let segmentCursor = 0;
    const segmentStops = segmentOrder
      .filter((segment) => segmentTotals[segment] > 0)
      .map((segment) => {
        const end = segmentCursor + segmentTotals[segment];
        const stop = `${segmentColors[segment]} ${segmentCursor}% ${end}%`;
        segmentCursor = end;
        return stop;
      });
    document.getElementById("segment-donut").style.background =
      segmentStops.length > 0 ? `conic-gradient(${segmentStops.join(", ")})` : "#dbe2df";

    document.getElementById("segment-list").innerHTML = segmentOrder
      .map((segment) => {
        const isEmpty = segmentTotals[segment] === 0 ? " is-empty" : "";
        return `
          <div class="allocation-row${isEmpty}">
            <span class="swatch" style="background:${segmentColors[segment]}"></span>
            <strong>${segment}</strong>
            <span>${segmentTotals[segment].toFixed(0)}%</span>
          </div>
        `;
      })
      .join("");

    document.getElementById("decision-list").innerHTML = publicDecisions
      .map((decision) => {
        return `
          <article class="decision-item">
            <span class="decision-meta">${formatDate(decision.date)}</span>
            <div class="decision-copy">
              <strong>${decision.type}</strong>
              <span>${decision.rationale}</span>
              ${decision.details ? `<ul>${decision.details.map((detail) => `<li>${detail}</li>`).join("")}</ul>` : ""}
              ${decision.chartUrl ? `<a href="${decision.chartUrl}" target="_blank" rel="noopener noreferrer">View chart note</a>` : ""}
            </div>
            <span class="tag">${decision.ticker}</span>
          </article>
        `;
      })
      .join("");
  };

  let dataset = buildFallbackDataset();
  try {
    const liveDataset = tryLoadLiveSnapshot();
    if (liveDataset) {
      dataset = liveDataset;
    } else {
      const twelveDataDataset = await tryLoadTwelveData();
      if (twelveDataDataset) dataset = twelveDataDataset;
    }
  } catch (error) {
    console.warn("Using fallback portfolio snapshot:", error.message);
    try {
      const twelveDataDataset = await tryLoadTwelveData();
      if (twelveDataDataset) dataset = twelveDataDataset;
    } catch (apiError) {
      console.warn("Twelve Data portfolio refresh unavailable:", apiError.message);
    }
  }
  render(dataset);
})();
