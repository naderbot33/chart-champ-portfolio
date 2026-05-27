(function () {
  const source = window.WATCHLIST_DATA;
  const neutralBandPct = source.metadata.neutralBandPct;
  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2
  });

  const state = {
    query: "",
    filter: "all",
    activeTicker: null
  };

  const elements = {
    coverageCount: document.getElementById("coverage-count"),
    lastUpdated: document.getElementById("last-updated"),
    tickerCount: document.getElementById("ticker-count"),
    reviewedCount: document.getElementById("reviewed-count"),
    pendingCount: document.getElementById("pending-count"),
    emaBandNote: document.getElementById("ema-band-note"),
    resultCount: document.getElementById("result-count"),
    search: document.getElementById("ticker-search"),
    filters: document.getElementById("filter-group"),
    body: document.getElementById("watchlist-body"),
    empty: document.getElementById("empty-state"),
    detailListName: document.getElementById("detail-list-name"),
    detailHeading: document.getElementById("detail-heading"),
    detailStatus: document.getElementById("detail-status"),
    chartPreview: document.getElementById("chart-preview"),
    supportList: document.getElementById("support-list"),
    resistanceList: document.getElementById("resistance-list"),
    emaGrid: document.getElementById("ema-grid"),
    analysisStack: document.getElementById("analysis-stack")
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const formatDate = (value) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(value));

  const formatPrice = (value) => {
    if (!Number.isFinite(value)) return "Pending";
    return `$${formatter.format(value)}`;
  };

  const unique = (items) => Array.from(new Set(items));

  const buildRecords = () => {
    const byTicker = new Map();

    source.lists.forEach((list) => {
      unique(list.tickers).forEach((ticker) => {
        const existing = byTicker.get(ticker);
        const override = source.overrides[ticker] || {};
        const base = {
          ticker,
          name: source.names[ticker] || ticker,
          lists: [list.label],
          listIds: [list.id],
          assetClass: list.assetClass,
          chartStatus: source.metadata.defaultChartStatus,
          updatedAt: null,
          currentPrice: null,
          weekly7Ema: null,
          weekly200Ema: null,
          support: [],
          resistance: [],
          shortTerm: "Awaiting chart review.",
          longTerm: "Awaiting chart review.",
          fundamentals: "Awaiting fundamental summary.",
          risk: "Risk note pending.",
          tags: []
        };

        if (existing) {
          existing.lists = unique([...existing.lists, list.label]);
          existing.listIds = unique([...existing.listIds, list.id]);
          existing.tags = unique([...existing.tags, ...(override.tags || [])]);
          byTicker.set(ticker, { ...existing, ...override });
          return;
        }

        byTicker.set(ticker, {
          ...base,
          ...override,
          name: override.name || base.name,
          tags: unique([...(base.tags || []), ...(override.tags || [])])
        });
      });
    });

    return Array.from(byTicker.values()).sort((a, b) => a.ticker.localeCompare(b.ticker));
  };

  const records = buildRecords();

  const emaState = (price, ema) => {
    if (!Number.isFinite(price) || !Number.isFinite(ema) || ema === 0) {
      return { label: "Pending", tone: "pending", diff: null };
    }

    const diff = ((price - ema) / ema) * 100;
    if (Math.abs(diff) <= neutralBandPct) {
      return { label: "Neutral", tone: "neutral", diff };
    }
    if (diff > 0) {
      return { label: "Bullish", tone: "bullish", diff };
    }
    return { label: "Bearish", tone: "bearish", diff };
  };

  const reviewed = (record) =>
    record.chartStatus === "reviewed" ||
    [record.currentPrice, record.weekly7Ema, record.weekly200Ema].some(Number.isFinite) ||
    record.support.length > 0 ||
    record.resistance.length > 0;

  const statusLabel = (record) => (reviewed(record) ? "Reviewed" : "Needs chart");

  const statusTone = (record) => (reviewed(record) ? "reviewed" : "pending");

  const combinedSearch = (record) =>
    [
      record.ticker,
      record.name,
      record.assetClass,
      record.lists.join(" "),
      record.tags.join(" ")
    ]
      .join(" ")
      .toLowerCase();

  const matchesFilter = (record) => {
    if (state.filter === "all") return true;
    if (state.filter === "reviewed") return reviewed(record);
    if (state.filter === "needs-chart") return !reviewed(record);
    return record.listIds.includes(state.filter);
  };

  const filteredRecords = () => {
    const query = state.query.trim().toLowerCase();
    return records.filter((record) => {
      const searchMatch = !query || combinedSearch(record).includes(query);
      return searchMatch && matchesFilter(record);
    });
  };

  const trendSummary = (record) => {
    const fast = emaState(record.currentPrice, record.weekly7Ema);
    const slow = emaState(record.currentPrice, record.weekly200Ema);
    if (fast.tone === "pending" && slow.tone === "pending") return fast;
    if (fast.tone === slow.tone) return fast;
    if (fast.tone === "bullish" && slow.tone !== "bearish") return fast;
    if (fast.tone === "bearish" && slow.tone !== "bullish") return fast;
    return { label: "Mixed", tone: "neutral", diff: null };
  };

  const levelCount = (record) => record.support.length + record.resistance.length;

  const renderBadge = (stateInfo) =>
    `<span class="trend-badge ${stateInfo.tone}">${escapeHtml(stateInfo.label)}</span>`;

  const renderTable = () => {
    const visible = filteredRecords();
    elements.resultCount.textContent = `${visible.length} result${visible.length === 1 ? "" : "s"}`;
    elements.empty.hidden = visible.length > 0;

    elements.body.innerHTML = visible
      .map((record) => {
        const trend = trendSummary(record);
        const active = record.ticker === state.activeTicker ? " selected" : "";
        return `
          <tr class="${active}">
            <td>
              <button class="ticker-button" type="button" data-ticker="${escapeHtml(record.ticker)}">
                ${escapeHtml(record.ticker)}
              </button>
            </td>
            <td>${escapeHtml(record.name)}</td>
            <td>${escapeHtml(record.lists.join(", "))}</td>
            <td>${renderBadge(trend)}</td>
            <td>${levelCount(record) || "Pending"}</td>
            <td><span class="status-chip ${statusTone(record)}">${statusLabel(record)}</span></td>
          </tr>
        `;
      })
      .join("");
  };

  const renderLevels = (levels) => {
    if (!levels.length) return '<span class="muted-text">Pending</span>';
    return levels
      .map((level) => `<span class="level-chip">${formatPrice(level)}</span>`)
      .join("");
  };

  const renderChart = (record) => {
    const supportLines = record.support.slice(0, 4);
    const resistanceLines = record.resistance.slice(0, 4);
    const allLevels = [...supportLines, ...resistanceLines].filter(Number.isFinite);
    const min = Math.min(...allLevels, record.currentPrice || Infinity);
    const max = Math.max(...allLevels, record.currentPrice || -Infinity);
    const hasScale = Number.isFinite(min) && Number.isFinite(max) && max > min;

    const lines = allLevels
      .map((level) => {
        const pct = hasScale ? 92 - ((level - min) / (max - min)) * 72 : 50;
        const kind = resistanceLines.includes(level) ? "resistance" : "support";
        return `<span class="chart-level ${kind}" style="top:${pct}%"><b>${formatPrice(level)}</b></span>`;
      })
      .join("");

    const priceMarker = Number.isFinite(record.currentPrice)
      ? `<span class="price-marker">${formatPrice(record.currentPrice)}</span>`
      : '<span class="chart-empty">Chart pending</span>';

    return `
      <div class="chart-grid">
        ${lines}
        <span class="chart-line"></span>
        ${priceMarker}
      </div>
    `;
  };

  const renderEmaCard = (label, value, stateInfo) => {
    const diffText = Number.isFinite(stateInfo.diff)
      ? `${stateInfo.diff > 0 ? "+" : ""}${stateInfo.diff.toFixed(1)}% vs EMA`
      : "Value pending";
    return `
      <div class="ema-card">
        <span class="detail-label">${label}</span>
        <strong>${formatPrice(value)}</strong>
        ${renderBadge(stateInfo)}
        <span class="muted-text">${diffText}</span>
      </div>
    `;
  };

  const renderAnalysis = (record) => {
    const items = [
      ["Short Term", record.shortTerm],
      ["Long Term", record.longTerm],
      ["Fundamentals", record.fundamentals],
      ["Risk Notes", record.risk]
    ];

    return items
      .map(
        ([label, text]) => `
          <article class="analysis-block">
            <span class="detail-label">${label}</span>
            <p>${escapeHtml(text)}</p>
          </article>
        `
      )
      .join("");
  };

  const renderDetail = (record) => {
    const selected = record || records[0];
    state.activeTicker = selected.ticker;
    const fast = emaState(selected.currentPrice, selected.weekly7Ema);
    const slow = emaState(selected.currentPrice, selected.weekly200Ema);

    elements.detailListName.textContent = selected.lists.join(", ");
    elements.detailHeading.textContent = `${selected.ticker} - ${selected.name}`;
    elements.detailStatus.textContent = statusLabel(selected);
    elements.detailStatus.className = `status-chip ${statusTone(selected)}`;
    elements.chartPreview.innerHTML = renderChart(selected);
    elements.supportList.innerHTML = renderLevels(selected.support);
    elements.resistanceList.innerHTML = renderLevels(selected.resistance);
    elements.emaGrid.innerHTML = [
      renderEmaCard("Weekly 7 EMA", selected.weekly7Ema, fast),
      renderEmaCard("Weekly 200 EMA", selected.weekly200Ema, slow)
    ].join("");
    elements.analysisStack.innerHTML = renderAnalysis(selected);
  };

  const renderMetrics = () => {
    const reviewedCount = records.filter(reviewed).length;
    const pendingCount = records.length - reviewedCount;

    elements.coverageCount.textContent = `${records.length} tickers`;
    elements.lastUpdated.textContent = `Last updated ${formatDate(source.metadata.updatedAt)}`;
    elements.tickerCount.textContent = records.length;
    elements.reviewedCount.textContent = reviewedCount;
    elements.pendingCount.textContent = pendingCount;
    elements.emaBandNote.textContent = `Neutral within ${neutralBandPct}% of the EMA`;
  };

  const rerender = () => {
    renderTable();
    const active = records.find((record) => record.ticker === state.activeTicker);
    renderDetail(active || filteredRecords()[0] || records[0]);
  };

  const bindEvents = () => {
    elements.search.addEventListener("input", (event) => {
      state.query = event.target.value;
      const firstMatch = filteredRecords()[0];
      if (firstMatch) state.activeTicker = firstMatch.ticker;
      rerender();
    });

    elements.filters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      state.filter = button.dataset.filter;
      elements.filters.querySelectorAll(".filter-button").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      const firstMatch = filteredRecords()[0];
      if (firstMatch) state.activeTicker = firstMatch.ticker;
      rerender();
    });

    elements.body.addEventListener("click", (event) => {
      const button = event.target.closest("[data-ticker]");
      if (!button) return;
      state.activeTicker = button.dataset.ticker;
      renderTable();
      renderDetail(records.find((record) => record.ticker === state.activeTicker));
    });
  };

  renderMetrics();
  bindEvents();
  state.activeTicker = records[0]?.ticker || null;
  rerender();
})();
