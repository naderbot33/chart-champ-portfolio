(function () {
  const source = window.WATCHLIST_DATA;
  const neutralBandPct = source.metadata.neutralBandPct;
  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2
  });

  const state = {
    query: "",
    activeTicker: null
  };

  const elements = {
    lastUpdated: document.getElementById("last-updated"),
    resultCount: document.getElementById("result-count"),
    search: document.getElementById("ticker-search"),
    resultsPanel: document.getElementById("search-results-panel"),
    results: document.getElementById("watchlist-results"),
    empty: document.getElementById("empty-state"),
    detailPanel: document.getElementById("detail-panel"),
    detailListName: document.getElementById("detail-list-name"),
    detailHeading: document.getElementById("detail-heading"),
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
  const displayTicker = (recordOrTicker) =>
    String(typeof recordOrTicker === "object" ? recordOrTicker.ticker : recordOrTicker)
      .trim()
      .toUpperCase();

  const buildRecords = () => {
    const byTicker = new Map();

    source.lists.forEach((list) => {
      unique(list.tickers).forEach((ticker) => {
        const symbol = displayTicker(ticker);
        const existing = byTicker.get(symbol);
        const override = source.overrides[symbol] || {};
        const base = {
          ticker: symbol,
          name: source.names[symbol] || symbol,
          lists: [list.label],
          listIds: [list.id],
          assetClass: list.assetClass,
          chartStatus: source.metadata.defaultChartStatus,
          chartUrl: "",
          chartImageUrl: "",
          chartCapturedAt: "",
          updatedAt: null,
          currentPrice: null,
          weekly7Ema: null,
          weekly200Ema: null,
          valueFormat: "currency",
          support: [],
          resistance: [],
          supportNotes: "",
          resistanceNotes: "",
          fundamentalsRating: "Pending",
          fundamentalsRationale: "Pending.",
          risks: "Pending.",
          catalysts: "Pending.",
          tags: []
        };

        if (existing) {
          existing.lists = unique([...existing.lists, list.label]);
          existing.listIds = unique([...existing.listIds, list.id]);
          existing.tags = unique([...existing.tags, ...(override.tags || [])]);
          byTicker.set(symbol, { ...existing, ...override, ticker: symbol });
          return;
        }

        byTicker.set(symbol, {
          ...base,
          ...override,
          ticker: symbol,
          name: override.name || base.name,
          tags: unique([...(base.tags || []), ...(override.tags || [])])
        });
      });
    });

    return Array.from(byTicker.values()).sort((a, b) => a.ticker.localeCompare(b.ticker));
  };

  const hasCompletedText = (value) => {
    const text = String(value || "").trim().toLowerCase();
    return text && !text.startsWith("awaiting") && !text.endsWith("pending.");
  };

  const readyForPage = (record) => {
    if (record.chartStatus === "published") return true;

    const hasChart = Boolean(record.chartUrl || record.chartImageUrl);
    const hasLevels = record.support.length > 0 && record.resistance.length > 0;
    const hasEmaValues = [record.currentPrice, record.weekly7Ema, record.weekly200Ema].every(
      Number.isFinite
    );
    const hasFundamentals =
      record.fundamentalsRating !== "Pending" && hasCompletedText(record.fundamentalsRationale);

    return hasChart && hasLevels && hasEmaValues && hasFundamentals;
  };

  const universeRecords = buildRecords();
  const records = universeRecords.filter(readyForPage);

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

  const normalizeSearch = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  const combinedSearch = (record) =>
    normalizeSearch([
      record.ticker,
      record.name,
      record.assetClass,
      record.lists.join(" "),
      record.fundamentalsRating,
      record.tags.join(" ")
    ].join(" "));

  const rankMatch = (record, query) => {
    const ticker = normalizeSearch(record.ticker);
    const name = normalizeSearch(record.name);
    const combined = combinedSearch(record);

    if (ticker === query) return 0;
    if (name === query) return 1;
    if (ticker.startsWith(query)) return 2;
    if (name.startsWith(query)) return 3;
    if (ticker.includes(query)) return 4;
    if (name.includes(query)) return 5;
    if (combined.includes(query)) return 6;
    return null;
  };

  const filteredRecords = () => {
    const query = normalizeSearch(state.query);
    if (!query) return [];

    return records
      .map((record) => ({ record, rank: rankMatch(record, query) }))
      .filter((item) => item.rank !== null)
      .sort((a, b) => a.rank - b.rank || a.record.ticker.localeCompare(b.record.ticker))
      .map((item) => item.record);
  };

  const normalizeExactTickerQuery = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed || trimmed.includes(" ")) return value;

    const upper = trimmed.toUpperCase();
    return records.some((record) => record.ticker === upper) ? upper : value;
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

  const renderBadge = (stateInfo) =>
    `<span class="trend-badge ${stateInfo.tone}">${escapeHtml(stateInfo.label)}</span>`;

  const ratingTone = (rating) =>
    String(rating || "Pending")
      .toLowerCase()
      .replaceAll(" ", "-");

  const renderRatingBadge = (rating) =>
    `<span class="rating-badge ${ratingTone(rating)}">${escapeHtml(rating || "Pending")}</span>`;

  const renderResults = (visible) => {
    const hasQuery = Boolean(normalizeSearch(state.query));
    elements.resultsPanel.hidden = !hasQuery;
    elements.resultCount.textContent = `${visible.length} result${visible.length === 1 ? "" : "s"}`;
    elements.empty.hidden = !hasQuery || visible.length > 0;
    elements.empty.textContent = records.length
      ? "No published ticker notes match that search."
      : "No published ticker notes yet.";

    elements.results.innerHTML = visible
      .map((record) => {
        const trend = trendSummary(record);
        const symbol = displayTicker(record);
        const active = symbol === state.activeTicker ? " selected" : "";
        return `
          <button class="result-card${active}" type="button" data-ticker="${escapeHtml(symbol)}">
            <span class="result-symbol">${escapeHtml(symbol)}</span>
            <span class="result-name">${escapeHtml(record.name)}</span>
            <span class="result-meta">${escapeHtml(record.lists.join(", "))}</span>
            <span class="result-badges">
              ${renderBadge(trend)}
              ${renderRatingBadge(record.fundamentalsRating)}
            </span>
          </button>
        `;
      })
      .join("");
  };

  const formatLevel = (value, record) => {
    if (typeof value === "string") return value;
    if (!Number.isFinite(value)) return "Pending";
    if (record.valueFormat === "percent") return `${formatter.format(value)}%`;
    if (record.valueFormat === "plain") return formatter.format(value);
    return formatPrice(value);
  };

  const renderLevels = (levels, record) => {
    return levels.length
      ? levels.map((level) => `<span class="level-chip">${escapeHtml(formatLevel(level, record))}</span>`).join("")
      : '<span class="muted-text">Pending</span>';
  };

  const renderChart = (record) => {
    const chartLink = record.chartImageUrl || record.chartUrl;
    const looksLikeImage = /\.(png|jpe?g|webp|gif)(\?|#|$)/i.test(chartLink || "");

    if (record.chartImageUrl || looksLikeImage) {
      return `
        <figure class="chart-media">
          <img src="${escapeHtml(chartLink)}" alt="${escapeHtml(record.ticker)} chart">
          ${record.chartUrl ? `<figcaption><a href="${escapeHtml(record.chartUrl)}" target="_blank" rel="noopener">Open chart</a></figcaption>` : ""}
        </figure>
      `;
    }

    if (record.chartUrl) {
      return `
        <div class="chart-link-panel">
          <span>Chart link available</span>
          <a href="${escapeHtml(record.chartUrl)}" target="_blank" rel="noopener">Open chart</a>
        </div>
      `;
    }

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
        return `<span class="chart-level ${kind}" style="top:${pct}%"><b>${escapeHtml(formatLevel(level, record))}</b></span>`;
      })
      .join("");

    const priceMarker = Number.isFinite(record.currentPrice)
      ? `<span class="price-marker">${escapeHtml(formatLevel(record.currentPrice, record))}</span>`
      : '<span class="chart-empty">Chart pending</span>';

    return `
      <div class="chart-grid">
        ${lines}
        <span class="chart-line"></span>
        ${priceMarker}
      </div>
    `;
  };

  const renderEmaCard = (label, value, stateInfo, record = {}) => {
    const diffText = Number.isFinite(stateInfo.diff)
      ? `${stateInfo.diff > 0 ? "+" : ""}${stateInfo.diff.toFixed(1)}% vs EMA`
      : "Value pending";
    return `
      <div class="ema-card">
        <span class="detail-label">${label}</span>
        <strong>${formatLevel(value, record)}</strong>
        ${renderBadge(stateInfo)}
        <span class="muted-text">${diffText}</span>
      </div>
    `;
  };

  const sentenceItems = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);

    const text = String(value || "").trim();
    if (!text) return ["Pending."];

    const separator = text.includes(";") ? ";" : ",";
    const parts = text
      .split(separator)
      .map((item) => item.trim())
      .filter(Boolean);

    return parts.length > 1 ? parts : [text];
  };

  const renderAnalysisList = (value) =>
    `<ul class="analysis-list">${sentenceItems(value)
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("")}</ul>`;

  const renderAnalysis = (record) => {
    const items = [
      ["Fundamentals", record.fundamentalsRationale],
      ["Key Risks", record.risks],
      ["Catalysts", record.catalysts]
    ];

    return items
      .map(
        ([label, text]) => `
          <article class="analysis-block">
            <span class="detail-label">${label}</span>
            ${label === "Fundamentals" ? renderRatingBadge(record.fundamentalsRating) : ""}
            ${renderAnalysisList(text)}
          </article>
        `
      )
      .join("");
  };

  const renderDetail = (record) => {
    if (!record) {
      state.activeTicker = null;
      elements.detailPanel.hidden = true;
      elements.detailListName.textContent = "Watchlist";
      elements.detailHeading.textContent = "No Ticker Selected";
      elements.chartPreview.innerHTML = '<div class="chart-grid"><span class="chart-empty">Awaiting published notes</span></div>';
      elements.supportList.innerHTML = '<span class="muted-text">Pending</span>';
      elements.resistanceList.innerHTML = '<span class="muted-text">Pending</span>';
      elements.emaGrid.innerHTML = [
        renderEmaCard("Weekly 7 EMA Trend", null, { label: "Pending", tone: "pending", diff: null }),
        renderEmaCard("Weekly 200 EMA Trend", null, { label: "Pending", tone: "pending", diff: null })
      ].join("");
      elements.analysisStack.innerHTML = `
        <article class="analysis-block">
          <span class="detail-label">Notes</span>
          <p>Published ticker notes will appear here after a chart link, levels, weekly EMA values, fundamentals rating, risks, and catalysts are added.</p>
        </article>
      `;
      return;
    }

    const selected = record;
    state.activeTicker = displayTicker(selected);
    elements.detailPanel.hidden = false;
    const fast = emaState(selected.currentPrice, selected.weekly7Ema);
    const slow = emaState(selected.currentPrice, selected.weekly200Ema);

    elements.detailListName.textContent = selected.lists.join(", ");
    elements.detailHeading.textContent = `${displayTicker(selected)} - ${selected.name}`;
    elements.chartPreview.innerHTML = renderChart(selected);
    elements.supportList.innerHTML = renderLevels(selected.support, selected);
    elements.resistanceList.innerHTML = renderLevels(selected.resistance, selected);
    elements.emaGrid.innerHTML = [
      renderEmaCard("Weekly 7 EMA Trend", selected.weekly7Ema, fast, selected),
      renderEmaCard("Weekly 200 EMA Trend", selected.weekly200Ema, slow, selected)
    ].join("");
    elements.analysisStack.innerHTML = renderAnalysis(selected);
  };

  const renderMetrics = () => {
    elements.lastUpdated.textContent = `Last updated ${formatDate(source.metadata.updatedAt)}`;
  };

  const rerender = () => {
    const visible = filteredRecords();
    const activeInResults = visible.find((record) => record.ticker === state.activeTicker);
    const nextActive = activeInResults || visible[0] || null;
    state.activeTicker = nextActive?.ticker || null;

    renderResults(visible);
    renderDetail(nextActive);
  };

  const bindEvents = () => {
    elements.search.addEventListener("input", (event) => {
      const normalized = normalizeExactTickerQuery(event.target.value);
      if (normalized !== event.target.value) {
        event.target.value = normalized;
      }
      state.query = normalized;
      rerender();
    });

    elements.search.addEventListener("search", (event) => {
      state.query = normalizeExactTickerQuery(event.target.value);
      rerender();
    });

    elements.search.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      const firstMatch = filteredRecords()[0];
      if (!firstMatch) return;
      state.activeTicker = firstMatch.ticker;
      rerender();
    });

    elements.results.addEventListener("click", (event) => {
      const button = event.target.closest("[data-ticker]");
      if (!button) return;
      state.activeTicker = button.dataset.ticker;
      renderResults(filteredRecords());
      renderDetail(records.find((record) => record.ticker === state.activeTicker));
    });
  };

  renderMetrics();
  bindEvents();
  rerender();
})();
