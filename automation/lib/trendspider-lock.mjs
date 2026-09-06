import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { AUTOMATION_ROOT } from "./config.mjs";

export const DEFAULT_TRENDSPIDER_LOCK_DIR = resolve(
  AUTOMATION_ROOT,
  "runtime",
  "trendspider-browser.lock"
);
export const DEFAULT_TRENDSPIDER_LEASE_MS = 45 * 60 * 1000;

async function lockAgeMs(lockDir, now) {
  try {
    const lease = JSON.parse(await readFile(resolve(lockDir, "lease.json"), "utf8"));
    const acquiredAt = Date.parse(lease.acquiredAt);
    if (Number.isFinite(acquiredAt)) return now.getTime() - acquiredAt;
  } catch {
    // A process can stop after mkdir and before lease.json is written. Fall back to mtime.
  }
  const details = await stat(lockDir);
  return now.getTime() - details.mtimeMs;
}

async function createLease(lockDir, token, now, leaseMs) {
  await mkdir(lockDir, { recursive: false });
  const lease = {
    token,
    acquiredAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + leaseMs).toISOString()
  };
  await writeFile(resolve(lockDir, "lease.json"), `${JSON.stringify(lease, null, 2)}\n`, {
    flag: "wx"
  });
  return { acquired: true, recovered: false, ...lease };
}

async function acquireTransitionGate(lockDir, retries = 0) {
  const gateDir = `${lockDir}.gate`;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      await mkdir(gateDir, { recursive: false });
      return gateDir;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      if (attempt < retries) await delay(10);
    }
  }
  return null;
}

export async function acquireTrendSpiderLock({
  lockDir = DEFAULT_TRENDSPIDER_LOCK_DIR,
  leaseMs = DEFAULT_TRENDSPIDER_LEASE_MS,
  now = () => new Date(),
  token = randomUUID()
} = {}) {
  const timestamp = now();
  const gateDir = await acquireTransitionGate(lockDir);
  if (!gateDir) {
    return { acquired: false, recovered: false, reason: "TRENDSPIDER_BUSY" };
  }

  try {
    let recovered = false;
    try {
      const ageMs = await lockAgeMs(lockDir, timestamp);
      if (ageMs <= leaseMs) {
        return { acquired: false, recovered: false, reason: "TRENDSPIDER_BUSY" };
      }
      await rm(lockDir, { recursive: true, force: true });
      recovered = true;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }

    const lease = await createLease(lockDir, token, timestamp, leaseMs);
    return { ...lease, recovered };
  } finally {
    await rm(gateDir, { recursive: true, force: true });
  }
}

export async function releaseTrendSpiderLock({
  lockDir = DEFAULT_TRENDSPIDER_LOCK_DIR,
  token
} = {}) {
  if (!token) return { released: false, reason: "LOCK_TOKEN_MISSING" };
  const gateDir = await acquireTransitionGate(lockDir, 20);
  if (!gateDir) return { released: false, reason: "LOCK_TRANSITION_BUSY" };
  try {
    const lease = JSON.parse(await readFile(resolve(lockDir, "lease.json"), "utf8"));
    if (lease.token !== token) return { released: false, reason: "LOCK_TOKEN_MISMATCH" };
    await rm(lockDir, { recursive: true, force: true });
    return { released: true };
  } catch (error) {
    if (error.code === "ENOENT") return { released: false, reason: "LOCK_NOT_FOUND" };
    throw error;
  } finally {
    await rm(gateDir, { recursive: true, force: true });
  }
}
