(function (root) {
  "use strict";
  var DAY = 86400000;
  function age(value, now) {
    var time = Date.parse(value || "");
    return Number.isFinite(time) ? Math.max(0, ((now || new Date()).getTime() - time) / DAY) : Infinity;
  }
  function horizon(review) {
    return /day/i.test(review.horizon) ? "day" : /swing/i.test(review.horizon) ? "swing" : "long";
  }
  function setupState(review, now) {
    var code = review.statusCode;
    if (code === "EXPIRED_NO_TRADE") return { group: "expired", label: "Expired · no entry", note: "Expiry is recorded in the source review." };
    if (["COMPLETED", "INVALIDATED_BEFORE_ENTRY", "STOPPED", "TP2"].indexOf(code) >= 0) {
      return { group: "closed", label: review.statusLabel, note: "See the dated outcome and evidence below." };
    }
    if (!review.outcome || review.outcome.type === "UNKNOWN" || code === "REVIEW_PENDING") {
      return { group: "review", label: "Outcome unverified", note: "The original plan is preserved. Entry and exit sequence still need follow-up." };
    }
    var maxAge = horizon(review) === "day" ? 1 : horizon(review) === "swing" ? 7 : 14;
    if (age(review.reviewedAt || review.date, now) > maxAge ||
        (review.expiresAt && Date.parse(review.expiresAt) < (now || new Date()).getTime())) {
      return { group: "review", label: "Review overdue", note: "Last known status: " + review.statusLabel + ". This historical status is not a current signal; no later outcome is assumed." };
    }
    return { group: "active", label: review.statusLabel, note: "Conditional plan. Follow the confirmation and invalidation rules." };
  }
  function newestSetups(reviews) {
    return reviews.slice().sort(function (a, b) {
      return String(b.sourcePostedAt || b.date || "").localeCompare(String(a.sourcePostedAt || a.date || "")) || String(b.id).localeCompare(String(a.id));
    });
  }
  function tickerView(t, now) {
    var channel = String(t.postedChartChannel || "stocks");
    var market = /crypto|commodities|bonds/.test(channel) ? channel : "stocks";
    var hasCases = !!((t.bullish || []).length && (t.bearish || []).length);
    return {
      schemaVersion: 1, ticker: t.ticker, market: market,
      chartPostedAt: t.sourcePostedAt || t.postedChartDate || null,
      chartReviewedAt: t.sourceReviewDate || null,
      quoteAsOf: null,
      verificationState: t.sourceText ? "retained-chart-commentary" : "dated-research",
      fundamentalsAsOf: t.fundamentals && (t.fundamentals.asOf || (!t.sourceText ? t.postedChartDate : null)),
      sourceMessageUrl: t.sourceMessageUrl || null, sourceSha256: t.sourceSha256 || null,
      coverage: hasCases ? "thesis" : "chart",
      coverageLabel: hasCases ? "Dated research note" : "Chart update · partial research",
      stale: age(t.sourcePostedAt || t.postedChartDate, now) > 14
    };
  }
  function chartInterval(value) {
    var v = String(value || "").toLowerCase().trim();
    var match = v.match(/(\d+)\s*(?:hours?|hrs?|h)\b/);
    if (match) return String(Number(match[1]) * 60);
    match = v.match(/(\d+)\s*(?:minutes?|mins?|m)\b/);
    if (match) return match[1];
    if (/week|\d+w\b/.test(v)) return "W";
    if (/month/.test(v)) return "M";
    return "D";
  }
  root.ChartChampModel = { age: age, horizon: horizon, setupState: setupState, newestSetups: newestSetups, tickerView: tickerView, chartInterval: chartInterval };
})(typeof window === "undefined" ? globalThis : window);
