import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { createHash } from "node:crypto";

const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const BASE = "https://chartchamp.web.app";
function page(title, description, path, content, openPath) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)} | ChartChamp</title><meta name="description" content="${escape(description.slice(0, 200))}"><link rel="canonical" href="${BASE}${path}"><meta property="og:title" content="${escape(title)} | ChartChamp"><meta property="og:description" content="${escape(description.slice(0, 200))}"><meta property="og:type" content="article"><meta property="og:url" content="${BASE}${path}"><meta name="twitter:card" content="summary"><link rel="icon" href="/assets/favicon.svg"><link rel="stylesheet" href="/assets/styles.css?v=20260906-refresh"></head><body><main class="page-shell"><header class="app-bar"><a class="text-link" href="/">ChartChamp</a><a class="text-link" href="${openPath}">Open interactive view ↗</a><a class="discord-link" href="https://discord.com/channels/1178077469505486868">Discord ↗</a></header><article class="dashboard-band"><h1>${escape(title)}</h1>${content}</article><p class="disclaimer-note">Dated educational commentary. Levels are from the original post. No current trade instruction or execution is implied.</p></main></body></html>`;
}
function link(url, label) {
  return /^https:\/\/(?:www\.)?(?:tradingview\.com|discord\.com)\//.test(url || "") ? `<p><a class="text-link" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)} ↗</a></p>` : "";
}
export async function renderPublicPages(publicDir) {
  const context = { window: {} };
  for (const file of ["data/app-data.js", "data/trade-setup-reviews.js", "data/discord-research-sync.js", "assets/research-model.js"]) {
    runInNewContext(await readFile(join(publicDir, file), "utf8"), context, { timeout: 1000 });
  }
  const { APP_DATA: data, TRADE_SETUP_REVIEWS: journal, ChartChampModel: model } = context.window;
  if (!data?.research?.tickers || !model) return;
  const urls = [BASE + "/"];
  await mkdir(join(publicDir, "research"), { recursive: true });
  await mkdir(join(publicDir, "setups"), { recursive: true });
  const records = [];
  for (const t of data.research.tickers) {
    if (!/^[A-Z0-9.-]+$/.test(t.ticker)) throw new Error("Unsafe ticker route");
    const view = model.tickerView(t);
    records.push({ ...view, sourceTextSha256: t.sourceText ? createHash("sha256").update(t.sourceText).digest("hex") : null, hashScope: t.sourceText ? "retained-transcription" : null });
    const path = `/research/${t.ticker}`;
    const levels = Object.entries(t.levels || {}).map(([kind, list]) => `<h2>${escape(kind === "support" ? "Support" : "Resistance / targets")}</h2><ul>${list.map(l => `<li><strong>${escape(l.price)}</strong> — ${escape(l.note)}</li>`).join("") || "<li>No level stated.</li>"}</ul>`).join("");
    const content = `<p class="section-note">${escape(t.name)} · Posted ${escape(t.postedChartDate)} · ${escape(view.coverageLabel)}</p><p>${escape(t.sourceText || t.summary)}</p>${t.sourceCaveat ? `<p class="disclaimer-note">${escape(t.sourceCaveat)}</p>` : ""}${levels}${link(t.postedChartUrl, "Original chart")}${link(t.sourceMessageUrl, "Original Discord post")}`;
    await writeFile(join(publicDir, "research", `${t.ticker}.html`), page(`${t.ticker} research`, t.sourceText || t.summary || "Dated ChartChamp research", path, content, `/#research/${t.ticker}`));
    urls.push(BASE + path);
  }
  for (const review of journal?.reviews || []) {
    if (!/^[a-zA-Z0-9_-]+$/.test(review.id)) throw new Error("Unsafe setup route");
    const path = `/setups/${review.id}`;
    const setup = review.setup || {};
    const content = `<p class="section-note">${escape(review.horizon)} · Posted ${escape(review.date)} · Review dated ${escape(String(review.reviewedAt || review.date).slice(0, 10))}</p><p>${escape(model.setupState(review).label)}</p><h2>Original entry plan</h2><p>${escape(setup.entryCondition)}</p><p><strong>Stop:</strong> ${escape(setup.plannedStopAfterEntry)}</p>${(setup.takeProfitLevels || []).map((level, i) => `<p><strong>Take profit level ${i + 1}:</strong> ${escape(level)}</p>`).join("")}<h2>Dated outcome review</h2><p>${escape(review.outcome?.summary)}</p><h2>Review note</h2><p>${escape(review.lesson)}</p>${link(review.sourceMessageUrl, "Original Discord setup")}${link(review.chartUrl, "Original chart")}`;
    await writeFile(join(publicDir, "setups", `${review.id}.html`), page(`${review.ticker} ${review.horizon}`, setup.entryCondition || "Dated conditional setup", path, content, `/#setups/${review.id}`));
    urls.push(BASE + path);
  }
  await writeFile(join(publicDir, "data/research-records.json"), JSON.stringify({ schemaVersion: 1, contentAsOf: data.meta.updatedAt, records }, null, 2) + "\n");
  await writeFile(join(publicDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${escape(url)}</loc></url>`).join("")}</urlset>\n`);
}
