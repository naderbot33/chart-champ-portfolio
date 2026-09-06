#!/usr/bin/env node
/*
 * Local, fail-closed ChartChamp portfolio release runner.
 *
 * The default mode is a no-write plan. --live-deploy is required before this
 * script will refresh quotes or deploy Firebase Hosting. Discord delivery is
 * intentionally out of scope: a verified site and no-send draft are the only
 * successful outputs.
 */
import { execFile as execFileCallback } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFile,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";
import { renderPublicPages } from "./render-public-pages.mjs";
import {
  dateInTimeZone,
  isUsEquitySessionDate
} from "../automation/lib/market-calendar.mjs";

const execFileDefault = promisify(execFileCallback);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TIME_ZONE = "America/Los_Angeles";
const EXPECTED_SLOT = "09:30";
const DEFAULT_BASE_URL = "https://chartchamp.web.app/";
const DEFAULT_FIREBASE_PROJECT = "dailystockpick";
const DEFAULT_FIREBASE_SITE = "chartchamp";
const FIREBASE_PACKAGE = "firebase-tools@15.24.0";
const MAX_LATE_MINUTES = 20;
const MAX_FUTURE_MINUTES = 5;
// A finalized same-day close remains authoritative until the U.S. market date
// rolls. The validator still requires every quote to be from the current date
// and timestamped at or after 3:55 PM Eastern.
const MANUAL_CLOSE_MAX_AGE_MINUTES = 480;

const ROOT_PUBLIC_FILES = [
  "index.html",
  "assets/app.js",
  "assets/styles.css",
  "assets/research-model.js",
  "assets/favicon.svg",
  "robots.txt",
  "sitemap.xml",
  "data/app-data.js",
  "data/trade-setup-reviews.js",
  "data/discord-research-sync.js",
  "data/live-prices.js",
  "data/live-prices.json"
];
const SITE_TEST_FILES = [
  "tests/portfolio-ledger.test.mjs",
  "tests/portfolio-local-release.test.mjs",
  "tests/portfolio-summary.test.mjs",
  "tests/research-data.test.mjs",
  "tests/research-intake-proposal.test.mjs",
  "tests/discord-research-sync.test.mjs",
  "tests/trade-setup-reviews.test.mjs"
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function zonedTime(date, timeZone = TIME_ZONE) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    })
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );
  return `${parts.hour}:${parts.minute}`;
}

export function parseArguments(argv) {
  const options = {
    liveDeploy: false,
    manual: false,
    scheduledFor: null,
    session: "open",
    maxAgeMinutes: 20,
    confirmedNoNewActions: false,
    baseUrl: DEFAULT_BASE_URL,
    firebaseProject: DEFAULT_FIREBASE_PROJECT,
    firebaseSite: DEFAULT_FIREBASE_SITE
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--live-deploy") options.liveDeploy = true;
    else if (argument === "--manual") options.manual = true;
    else if (argument === "--scheduled-for") options.scheduledFor = argv[++index];
    else if (argument === "--session") options.session = argv[++index];
    else if (argument === "--max-age-minutes") options.maxAgeMinutes = Number(argv[++index]);
    else if (argument === "--confirmed-no-new-actions") options.confirmedNoNewActions = true;
    else if (argument === "--base-url") options.baseUrl = argv[++index];
    else if (argument === "--firebase-project") options.firebaseProject = argv[++index];
    else if (argument === "--firebase-site") options.firebaseSite = argv[++index];
    else throw new Error(`Unknown argument: ${argument}`);
  }

  if (!options.scheduledFor) throw new Error("--scheduled-for is required");
  if (options.confirmedNoNewActions && !options.manual) {
    throw new Error("--confirmed-no-new-actions requires --manual");
  }
  if (!['open', 'close'].includes(options.session) || (!options.manual && options.session !== "open")) {
    throw new Error("--session must be open for scheduled releases; manual catch-ups may use close");
  }
  const maximumAge = options.manual && options.session === "close"
    ? MANUAL_CLOSE_MAX_AGE_MINUTES
    : 20;
  if (!Number.isFinite(options.maxAgeMinutes) || options.maxAgeMinutes <= 0 || options.maxAgeMinutes > maximumAge) {
    throw new Error(`--max-age-minutes must be from 1 through ${maximumAge}`);
  }
  if (options.firebaseProject !== DEFAULT_FIREBASE_PROJECT) {
    throw new Error(`--firebase-project must be ${DEFAULT_FIREBASE_PROJECT}`);
  }
  if (options.firebaseSite !== DEFAULT_FIREBASE_SITE) {
    throw new Error(`--firebase-site must be ${DEFAULT_FIREBASE_SITE}`);
  }
  const base = new URL(options.baseUrl);
  if (base.protocol !== "https:" || base.hostname !== "chartchamp.web.app" || base.pathname !== "/") {
    throw new Error("--base-url must be https://chartchamp.web.app/");
  }
  options.baseUrl = base.toString();
  return options;
}

export function assertScheduledSession(scheduledFor) {
  const scheduled = scheduledFor instanceof Date ? scheduledFor : new Date(scheduledFor);
  if (!Number.isFinite(scheduled.getTime())) throw new Error("--scheduled-for must be ISO-8601");

  const sessionDate = dateInTimeZone(scheduled, TIME_ZONE);
  if (zonedTime(scheduled) !== EXPECTED_SLOT) {
    throw new Error(`Scheduled release must use the ${EXPECTED_SLOT} PT slot`);
  }
  if (!isUsEquitySessionDate(sessionDate)) {
    throw new Error(`${sessionDate} is not a U.S. equity session date`);
  }
  return { scheduled, sessionDate };
}

export function assertReleaseWindow({ now, scheduledFor, manual = false }) {
  const current = now instanceof Date ? now : new Date(now);
  if (!Number.isFinite(current.getTime())) throw new Error("Current time is invalid");
  const scheduled = scheduledFor instanceof Date ? scheduledFor : new Date(scheduledFor);
  if (!Number.isFinite(scheduled.getTime())) throw new Error("--scheduled-for must be ISO-8601");
  const sessionDate = dateInTimeZone(scheduled, TIME_ZONE);
  if (manual) {
    if (!isUsEquitySessionDate(sessionDate)) {
      throw new Error(`${sessionDate} is not a U.S. equity session date`);
    }
  } else {
    assertScheduledSession(scheduled);
  }

  const latenessMinutes = (current.getTime() - scheduled.getTime()) / 60000;
  if (dateInTimeZone(current, TIME_ZONE) !== sessionDate) {
    throw new Error("Current Pacific date does not match the scheduled release date");
  }
  if (latenessMinutes < 0) throw new Error("Release cannot start before its scheduled time");
  if (latenessMinutes > MAX_LATE_MINUTES) {
    throw new Error(`Release started ${Math.round(latenessMinutes)} minutes late (limit ${MAX_LATE_MINUTES})`);
  }
  return { sessionDate, latenessMinutes: Number(latenessMinutes.toFixed(1)) };
}

async function command(execFileImpl, file, args, { cwd = ROOT, timeout = 180_000 } = {}) {
  try {
    const result = await execFileImpl(file, args, {
      cwd,
      encoding: "utf8",
      windowsHide: true,
      timeout,
      maxBuffer: 8 * 1024 * 1024
    });
    return typeof result === "string" ? { stdout: result, stderr: "" } : result;
  } catch (error) {
    const detail = String(error?.stderr || error?.stdout || error?.message || "command failed").trim();
    throw new Error(`${file} ${args[0] || ""} failed: ${detail.slice(0, 1000)}`);
  }
}

function parseJsonOutput(stdout, label) {
  try {
    return JSON.parse(String(stdout || "").trim());
  } catch {
    throw new Error(`${label} did not return valid JSON`);
  }
}

export function assertFirebaseSiteList(payload, { project, site, baseUrl }) {
  const sites = payload?.result?.sites;
  const expectedName = `projects/${project}/sites/${site}`;
  const match = Array.isArray(sites) && sites.find((entry) => entry?.name === expectedName);
  if (payload?.status !== "success" || !match || match.defaultUrl !== baseUrl.replace(/\/$/u, "")) {
    throw new Error(`Firebase site ${expectedName} is unavailable or points to the wrong URL`);
  }
  return match;
}

export function assertDraftMatchesValidation(draft, validation) {
  const draftSource = Date.parse(draft?.sourceTimestamp);
  const oldestSource = Date.parse(validation?.sourceTimestamp);
  const newestSource = Date.parse(
    validation?.newestSourceTimestamp || validation?.sourceTimestamp
  );
  if (
    draft?.dryRun !== true ||
    !Number.isFinite(draftSource) ||
    !Number.isFinite(oldestSource) ||
    !Number.isFinite(newestSource) ||
    draftSource < oldestSource ||
    draftSource > newestSource
  ) {
    throw new Error("No-send draft does not match the validated quote snapshot");
  }
  return draft;
}

async function copyRootFile(root, publicDir, relativePath) {
  const source = resolve(root, relativePath);
  const destination = resolve(publicDir, relativePath);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

function watchlistFilter(source) {
  return !["README.md", ".DS_Store"].includes(source.split(sep).at(-1));
}

async function listFiles(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await listFiles(absolute));
    else if (entry.isFile()) output.push(absolute);
  }
  return output;
}

export async function stageRelease({ root = ROOT, stageParent } = {}) {
  const parent = stageParent || resolve(root, "runtime");
  await mkdir(parent, { recursive: true });
  const stageRoot = await mkdtemp(join(parent, "portfolio-release-"));
  const publicDir = join(stageRoot, "public");
  await mkdir(publicDir, { recursive: true });

  for (const file of ROOT_PUBLIC_FILES) await copyRootFile(root, publicDir, file);
  await renderPublicPages(publicDir);

  const sourceFirebase = JSON.parse(await readFile(resolve(root, "firebase.json"), "utf8"));
  const stagedFirebase = {
    hosting: {
      ...sourceFirebase.hosting,
      site: DEFAULT_FIREBASE_SITE,
      public: "public",
      ignore: []
    }
  };
  const configPath = join(stageRoot, "firebase.json");
  await writeFile(configPath, `${JSON.stringify(stagedFirebase, null, 2)}\n`, "utf8");

  const stagedFiles = (await listFiles(publicDir))
    .map((file) => relative(publicDir, file).split(sep).join("/"))
    .sort();
  if (stagedFiles.some((file) => /portfolio-lab/iu.test(file))) {
    throw new Error("Local portfolio-lab files entered the Firebase release stage");
  }
  return { stageRoot, publicDir, configPath, files: stagedFiles };
}

export async function buildManifest(publicDir) {
  const files = [];
  for (const absolute of await listFiles(publicDir)) {
    const relativePath = relative(publicDir, absolute).split(sep).join("/");
    const content = await readFile(absolute);
    files.push({
      relativePath,
      remotePath: relativePath === "index.html" ? "/" : `/${relativePath}`,
      sha256: sha256(content),
      bytes: content.length
    });
  }
  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  const snapshot = JSON.parse(await readFile(join(publicDir, "data", "live-prices.json"), "utf8"));
  if (!Number.isFinite(Date.parse(snapshot.sourceTimestamp))) {
    throw new Error("Local release snapshot has no valid sourceTimestamp");
  }
  return {
    files,
    sourceTimestamp: snapshot.sourceTimestamp,
    generatedAt: snapshot.generatedAt,
    session: snapshot.session
  };
}

async function fetchRemoteFile({ fetchImpl, baseUrl, file, nonce }) {
  const url = new URL(file.remotePath, baseUrl);
  url.searchParams.set("chartchamp_release", nonce);
  const response = await fetchImpl(url, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    signal: AbortSignal.timeout(15_000)
  });
  if (!response.ok) throw new Error(`${file.remotePath} returned HTTP ${response.status}`);
  const content = Buffer.from(await response.arrayBuffer());
  if (sha256(content) !== file.sha256) throw new Error(`${file.remotePath} hash does not match the staged release`);
  if (file.remotePath.startsWith("/data/")) {
    const cacheControl = response.headers.get("cache-control") || "";
    if (!/(?:no-cache|no-store|max-age=0)/iu.test(cacheControl)) {
      throw new Error(`${file.remotePath} is missing a fail-safe cache policy`);
    }
  }
  return content;
}

export async function verifyRemoteRelease({
  manifest,
  baseUrl = DEFAULT_BASE_URL,
  fetchImpl = globalThis.fetch,
  now = new Date(),
  maxAgeMinutes = 20,
  attempts = 7,
  wait = (milliseconds) => new Promise((resolveWait) => setTimeout(resolveWait, milliseconds))
}) {
  const current = now instanceof Date ? now : new Date(now);
  const source = new Date(manifest.sourceTimestamp);
  const ageMinutes = (current.getTime() - source.getTime()) / 60000;
  if (ageMinutes < -MAX_FUTURE_MINUTES || ageMinutes > maxAgeMinutes) {
    throw new Error(`Release source is ${Math.round(ageMinutes)} minutes old (limit ${maxAgeMinutes})`);
  }

  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const nonce = `${current.getTime()}-${attempt}`;
      const results = await Promise.all(
        manifest.files.map((file) => fetchRemoteFile({ fetchImpl, baseUrl, file, nonce }))
      );
      const jsonIndex = manifest.files.findIndex((file) => file.relativePath === "data/live-prices.json");
      const remoteSnapshot = JSON.parse(results[jsonIndex].toString("utf8"));
      if (remoteSnapshot.sourceTimestamp !== manifest.sourceTimestamp) {
        throw new Error("Deployed sourceTimestamp does not match the staged release");
      }
      if (remoteSnapshot.generatedAt !== manifest.generatedAt) {
        throw new Error("Deployed generatedAt does not match the staged release");
      }
      return {
        verifiedAt: current.toISOString(),
        sourceTimestamp: manifest.sourceTimestamp,
        ageMinutes: Number(ageMinutes.toFixed(1)),
        fileCount: manifest.files.length
      };
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await wait(500 * (2 ** (attempt - 1)));
    }
  }
  throw new Error(`Remote release verification failed: ${lastError?.message || "unknown error"}`);
}

export function hasApprovedPortfolioBody(content) {
  const lines = String(content || "").replace(/\r\n?/gu, "\n").trim().split("\n");
  const requiredLabels = [
    "- **VALUE** — ",
    "- **TOTAL RETURN** — ",
    "- **TODAY** — ",
    "- **REALIZED P/L** — ",
    "- **RECENT DECISIONS** — ",
    "- **TOP CONTRIBUTOR** — ",
    "- **TOP DETRACTOR** — ",
    "- **PORTFOLIO** — https://chartchamp.web.app/"
  ];
  return /^\*\*📊 PUBLIC PORTFOLIO — \S.*\*\*$/u.test(lines[0] || "")
    && lines[1] === ""
    && requiredLabels.every((prefix) => lines.some((line) => line.startsWith(prefix)));
}

export async function runLocalRelease(options, {
  clock = () => new Date(),
  execFileImpl = execFileDefault,
  fetchImpl = globalThis.fetch,
  stageParent,
  wait
} = {}) {
  const start = clock();
  const timing = options.liveDeploy
    ? assertReleaseWindow({ now: start, scheduledFor: options.scheduledFor, manual: options.manual })
    : { ...assertScheduledSession(options.scheduledFor), latenessMinutes: null };
  const plan = {
    outcome: options.liveDeploy ? "pending" : "plan",
    liveDeploy: options.liveDeploy,
    sessionDate: timing.sessionDate,
    slot: options.manual ? zonedTime(new Date(options.scheduledFor)) : EXPECTED_SLOT,
    baseUrl: options.baseUrl,
    firebaseProject: options.firebaseProject,
    firebaseSite: options.firebaseSite,
    stages: [
      "tests",
      "firebase-site-preflight",
      "quote-refresh",
      "snapshot-validation",
      "no-send-draft",
      "isolated-staging",
      "firebase-deploy",
      "remote-hash-and-timestamp-verification"
    ],
    discordDelivery: "not attempted"
  };
  if (!options.liveDeploy) return plan;

  // Discord automation manifests were intentionally removed when scheduled
  // posting was retired. A portfolio release therefore runs the site-specific
  // suite instead of stale automation tests that cannot protect this deploy.
  await command(execFileImpl, process.execPath, ["--test", ...SITE_TEST_FILES], {
    timeout: 180_000
  });

  const siteResult = await command(execFileImpl, "npx", [
    "--yes",
    FIREBASE_PACKAGE,
    "hosting:sites:list",
    "--project",
    options.firebaseProject,
    "--json"
  ]);
  assertFirebaseSiteList(parseJsonOutput(siteResult.stdout, "Firebase site preflight"), {
    project: options.firebaseProject,
    site: options.firebaseSite,
    baseUrl: options.baseUrl
  });

  await command(execFileImpl, process.execPath, ["scripts/update-quotes.mjs"]);
  const refreshedAt = clock();
  const validationResult = await command(execFileImpl, process.execPath, [
    "scripts/validate-portfolio-snapshot.mjs",
    "--strict",
    "--session",
    options.session,
    "--max-age-minutes",
    String(options.maxAgeMinutes),
    "--now",
    refreshedAt.toISOString()
  ]);
  const validation = parseJsonOutput(validationResult.stdout, "Portfolio snapshot validation");
  if (validation.status !== "ready" || validation.shouldProceed !== true || validation.snapshotValid !== true) {
    throw new Error(`Portfolio snapshot is not ready: ${validation.reason || validation.status || "unknown"}`);
  }

  const draftArguments = [
    "scripts/portfolio-summary.mjs",
    "--dry-run",
    "--session",
    options.session,
    "--max-age-minutes",
    String(options.maxAgeMinutes),
    "--now",
    refreshedAt.toISOString()
  ];
  if (options.confirmedNoNewActions) draftArguments.push("--confirmed-no-new-actions");
  const draftResult = await command(execFileImpl, process.execPath, draftArguments);
  const draft = parseJsonOutput(draftResult.stdout, "Portfolio no-send draft");
  assertDraftMatchesValidation(draft, validation);
  const expectedDecisionSummaryMode = options.confirmedNoNewActions ? "confirmed-none" : "same-day";
  if (draft.decisionSummaryMode !== expectedDecisionSummaryMode) {
    throw new Error("No-send draft does not match the requested decision summary mode");
  }

  const staged = await stageRelease({ root: ROOT, stageParent });
  const manifest = await buildManifest(staged.publicDir);
  if (manifest.sourceTimestamp !== validation.sourceTimestamp) {
    throw new Error("Staged site does not match the validated quote snapshot");
  }

  await command(execFileImpl, "npx", [
    "--yes",
    FIREBASE_PACKAGE,
    "deploy",
    "--config",
    staged.configPath,
    "--only",
    "hosting",
    "--project",
    options.firebaseProject,
    "--non-interactive"
  ], { timeout: 300_000 });

  const verification = await verifyRemoteRelease({
    manifest,
    baseUrl: options.baseUrl,
    fetchImpl,
    now: clock(),
    maxAgeMinutes: options.maxAgeMinutes,
    ...(wait ? { wait } : {})
  });

  return {
    ...plan,
    outcome: "site-verified",
    sourceTimestamp: manifest.sourceTimestamp,
    decisionSummaryMode: draft.decisionSummaryMode,
    verification,
    stagedFileCount: manifest.files.length,
    draft: {
      path: "runtime/portfolio-draft.json",
      content: draft.content,
      approvedFormat: hasApprovedPortfolioBody(draft.content)
    },
    discordReady: hasApprovedPortfolioBody(draft.content),
    discordDelivery: "not attempted"
  };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const result = await runLocalRelease(options);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.outcome === "site-verified" && result.discordReady !== true) {
    process.stderr.write("Site verified, but the generated Discord body still requires the approved PUBLIC PORTFOLIO formatter.\n");
    process.exitCode = 2;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main().catch((error) => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  });
}
