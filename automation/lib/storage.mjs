import { appendFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export async function loadDedupeLedger(runtimeDir) {
  try {
    const parsed = JSON.parse(await readFile(resolve(runtimeDir, "dedupe.json"), "utf8"));
    return {
      version: 1,
      delivered: parsed.delivered && typeof parsed.delivered === "object" ? parsed.delivered : {}
    };
  } catch (error) {
    if (error.code === "ENOENT") return { version: 1, delivered: {} };
    throw error;
  }
}

export function deliveredKeys(ledger) {
  return new Set(Object.keys(ledger.delivered || {}));
}

export async function recordDelivery(runtimeDir, dedupeKey, record) {
  await mkdir(runtimeDir, { recursive: true });
  const ledger = await loadDedupeLedger(runtimeDir);
  ledger.delivered[dedupeKey] = record;
  const target = resolve(runtimeDir, "dedupe.json");
  const temporary = resolve(runtimeDir, `dedupe.${process.pid}.tmp`);
  await writeFile(temporary, `${JSON.stringify(ledger, null, 2)}\n`, { mode: 0o600 });
  await rename(temporary, target);
}

export async function appendDispatchLog(runtimeDir, entry) {
  await mkdir(runtimeDir, { recursive: true });
  await appendFile(resolve(runtimeDir, "dispatch-log.jsonl"), `${JSON.stringify(entry)}\n`, {
    mode: 0o600
  });
}
