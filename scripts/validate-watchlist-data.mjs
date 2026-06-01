import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  fundamentalsScale,
  parseNumber,
  parseNumberList,
  parseNumbersFromText,
  parseRecentUpdates,
  readCsvRecords,
  toTicker,
  watchlistOrder
} from "./watchlist-csv-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const csvPath = path.join(rootDir, "watchlists", "data", "watchlist-tracker.csv");

const requiredText = (row, field) => String(row[field] || "").trim();

const hasLevel = (row, fields, notesField) => {
  return (
    parseNumberList(...fields.map((field) => row[field])).length > 0 ||
    parseNumbersFromText(row[notesField]).length > 0
  );
};

const main = async () => {
  const records = await readCsvRecords(csvPath);
  const errors = [];
  const warnings = [];
  const seen = new Map();

  for (const row of records) {
    const ticker = toTicker(row.Ticker);
    if (!ticker) continue;

    if (seen.has(ticker)) {
      errors.push(`Row ${row.__rowNumber}: duplicate ticker ${ticker}; first seen on row ${seen.get(ticker)}.`);
    }
    seen.set(ticker, row.__rowNumber);

    const watchlist = requiredText(row, "Watchlist");
    if (!watchlistOrder.includes(watchlist)) {
      warnings.push(`Row ${row.__rowNumber} ${ticker}: watchlist "${watchlist}" is outside the standard four lists.`);
    }

    if (/needs verification/i.test(row["Name/Source Notes"] || "")) {
      warnings.push(`Row ${row.__rowNumber} ${ticker}: name still needs verification.`);
    }

    const tagsFieldLooksLikeJson = /^\s*[\[{]/.test(String(row.Tags || ""));
    try {
      parseRecentUpdates(row["Recent Updates JSON"] || (tagsFieldLooksLikeJson ? row.Tags : ""), ticker);
    } catch (error) {
      errors.push(`Row ${row.__rowNumber}: ${error.message}`);
    }

    const status = String(row.Status || "").trim().toLowerCase();
    if (status !== "published") continue;

    const prefix = `Row ${row.__rowNumber} ${ticker}`;
    const requiredFields = ["Name", "Watchlist", "Asset Class", "Chart Link", "Current Price", "Weekly 7 EMA", "Weekly 200 EMA"];
    requiredFields.forEach((field) => {
      if (!requiredText(row, field)) errors.push(`${prefix}: missing ${field}.`);
    });

    ["Current Price", "Weekly 7 EMA", "Weekly 200 EMA"].forEach((field) => {
      if (requiredText(row, field) && parseNumber(row[field]) === null) {
        errors.push(`${prefix}: ${field} is not a valid number.`);
      }
    });

    if (!hasLevel(row, ["Support 1", "Support 2", "Support 3", "Support 4"], "Support Notes")) {
      errors.push(`${prefix}: published ticker needs at least one support level.`);
    }

    if (!hasLevel(row, ["Resistance 1", "Resistance 2", "Resistance 3", "Resistance 4"], "Resistance Notes")) {
      errors.push(`${prefix}: published ticker needs at least one resistance level.`);
    }

    const rating = requiredText(row, "Fundamentals Rating");
    if (!fundamentalsScale.includes(rating)) {
      errors.push(`${prefix}: Fundamentals Rating must be one of ${fundamentalsScale.join(", ")}.`);
    }

    ["Fundamentals Rationale", "Key Risks", "Key Catalysts", "Last Updated"].forEach((field) => {
      if (!requiredText(row, field)) errors.push(`${prefix}: missing ${field}.`);
    });
  }

  warnings.forEach((warning) => console.warn(`Warning: ${warning}`));

  if (errors.length) {
    errors.forEach((error) => console.error(`Error: ${error}`));
    process.exitCode = 1;
    return;
  }

  console.log(`Validated ${records.length} watchlist row(s); ${warnings.length} warning(s).`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
