import { readFile } from "node:fs/promises";

export const watchlistOrder = ["Crypto", "Stocks", "Commodities", "Bonds"];
export const fundamentalsScale = ["Very Strong", "Strong", "Moderate", "Weak", "Very Weak"];

export const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);

  const [header = [], ...body] = rows;
  return body.map((values, rowIndex) => {
    const record = { __rowNumber: rowIndex + 2 };
    header.forEach((name, columnIndex) => {
      record[name] = values[columnIndex] ?? "";
    });
    return record;
  });
};

export const readCsvRecords = async (path) => parseCsv(await readFile(path, "utf8"));

export const toTicker = (value) => String(value || "").trim().toUpperCase();

export const toId = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const splitSemicolonItems = (value) =>
  String(value || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

export const parseNumber = (value) => {
  const normalized = String(value || "").replace(/[$,%\s,]/g, "");
  if (!normalized) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
};

export const parseNumberList = (...values) =>
  values.map(parseNumber).filter((value) => value !== null);

export const parseNumbersFromText = (value) => {
  const text = String(value || "");
  const matches = text.includes("$")
    ? text.match(/\$-?\d[\d,]*(?:\.\d+)?/g) || []
    : text.match(/-?\d[\d,]*(?:\.\d+)?%?/g) || [];
  return matches.map(parseNumber).filter((number) => number !== null);
};

export const parseRecentUpdates = (value, ticker) => {
  const text = String(value || "").trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") return [parsed];
  } catch (error) {
    throw new Error(`Recent Updates JSON is invalid for ${ticker}: ${error.message}`);
  }

  return [];
};

export const parseTags = (value) => {
  const text = String(value || "").trim();
  if (!text) return [];

  const lower = text.toLowerCase();
  if (
    lower.startsWith("keep ") ||
    lower.startsWith("recent updates:") ||
    lower.includes("needs verification") ||
    lower.includes("fundamental note")
  ) {
    return [];
  }

  if (text.endsWith(".") || text.length > 90) return [];
  return splitSemicolonItems(text);
};

export const extractTrendSpiderSlug = (url) => {
  const match = String(url || "").match(/\/chart\/[^/]+\/([^/?#]+)/i);
  return match?.[1] || "";
};

export const normalizeChartImage = (chartImage, chartUrl, localExists) => {
  const image = String(chartImage || "").trim();
  if (/^https?:\/\//i.test(image)) return image;
  if (image && localExists(image)) return image;

  const slug = extractTrendSpiderSlug(chartUrl);
  if (slug) return `https://d2nbxczldlxikh.cloudfront.net/${slug}.png`;

  return image;
};
