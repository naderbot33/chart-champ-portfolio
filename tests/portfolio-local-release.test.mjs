import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import {
  assertDraftMatchesValidation,
  assertFirebaseSiteList,
  assertReleaseWindow,
  buildManifest,
  hasApprovedPortfolioBody,
  parseArguments,
  stageRelease,
  verifyRemoteRelease
} from "../scripts/portfolio-local-release.mjs";

const hash = (value) => createHash("sha256").update(value).digest("hex");

test("release timing accepts Monday 9:30 PT and rejects early, late, weekend, and holiday starts", () => {
  const scheduledFor = "2026-07-20T09:30:00-07:00";
  assert.deepEqual(
    assertReleaseWindow({ now: "2026-07-20T16:30:30Z", scheduledFor }),
    { sessionDate: "2026-07-20", latenessMinutes: 0.5 }
  );
  assert.throws(
    () => assertReleaseWindow({ now: "2026-07-20T16:29:59Z", scheduledFor }),
    /cannot start before/u
  );
  assert.throws(
    () => assertReleaseWindow({ now: "2026-07-20T16:51:00Z", scheduledFor }),
    /21 minutes late/u
  );
  assert.throws(
    () => assertReleaseWindow({
      now: "2026-07-19T16:30:00Z",
      scheduledFor: "2026-07-19T09:30:00-07:00"
    }),
    /not a U.S. equity session/u
  );
  assert.throws(
    () => assertReleaseWindow({
      now: "2026-07-03T16:30:00Z",
      scheduledFor: "2026-07-03T09:30:00-07:00"
    }),
    /not a U.S. equity session/u
  );
});

test("manual release timing accepts a fresh same-day catch-up without changing the scheduled slot", () => {
  assert.deepEqual(
    assertReleaseWindow({
      now: "2026-07-21T23:15:30Z",
      scheduledFor: "2026-07-21T16:15:00-07:00",
      manual: true
    }),
    {
      sessionDate: "2026-07-21",
      latenessMinutes: 0.5
    }
  );
  assert.throws(
    () => assertReleaseWindow({
      now: "2026-07-21T23:36:00Z",
      scheduledFor: "2026-07-21T16:15:00-07:00",
      manual: true
    }),
    /21 minutes late/u
  );
});

test("manual close catch-up permits same-day closing quotes without relaxing scheduled releases", () => {
  const manual = parseArguments([
    "--live-deploy",
    "--manual",
    "--scheduled-for", "2026-07-21T16:15:00-07:00",
    "--session", "close",
    "--max-age-minutes", "360"
  ]);
  assert.equal(manual.manual, true);
  assert.equal(manual.session, "close");
  assert.equal(manual.maxAgeMinutes, 360);
  const evening = parseArguments([
    "--live-deploy",
    "--manual",
    "--scheduled-for", "2026-07-21T20:20:00-07:00",
    "--session", "close",
    "--max-age-minutes", "480"
  ]);
  assert.equal(evening.maxAgeMinutes, 480);
  assert.throws(
    () => parseArguments([
      "--live-deploy",
      "--manual",
      "--scheduled-for", "2026-07-21T20:20:00-07:00",
      "--session", "close",
      "--max-age-minutes", "481"
    ]),
    /from 1 through 480/u
  );
  assert.throws(
    () => parseArguments([
      "--live-deploy",
      "--scheduled-for", "2026-07-21T09:30:00-07:00",
      "--session", "close"
    ]),
    /scheduled releases/u
  );
});

test("confirmed no-new-actions mode is restricted to manual releases", () => {
  const manual = parseArguments([
    "--live-deploy",
    "--manual",
    "--confirmed-no-new-actions",
    "--scheduled-for", "2026-07-23T13:30:00-07:00",
    "--session", "close",
    "--max-age-minutes", "360"
  ]);
  assert.equal(manual.confirmedNoNewActions, true);
  assert.throws(
    () => parseArguments([
      "--live-deploy",
      "--confirmed-no-new-actions",
      "--scheduled-for", "2026-07-23T09:30:00-07:00"
    ]),
    /requires --manual/u
  );
});

test("Firebase preflight requires the exact project, site, and public URL", () => {
  const payload = {
    status: "success",
    result: {
      sites: [{
        name: "projects/dailystockpick/sites/chartchamp",
        defaultUrl: "https://chartchamp.web.app"
      }]
    }
  };
  assert.equal(
    assertFirebaseSiteList(payload, {
      project: "dailystockpick",
      site: "chartchamp",
      baseUrl: "https://chartchamp.web.app/"
    }).defaultUrl,
    "https://chartchamp.web.app"
  );
  assert.throws(
    () => assertFirebaseSiteList(payload, {
      project: "dailystockpick",
      site: "wrong-site",
      baseUrl: "https://chartchamp.web.app/"
    }),
    /unavailable or points to the wrong URL/u
  );
});

test("a community draft may use any quote timestamp inside the validated multi-portfolio range", () => {
  const validation = {
    sourceTimestamp: "2026-08-03T13:49:35.000Z",
    newestSourceTimestamp: "2026-08-03T13:49:51.000Z"
  };
  const draft = {
    dryRun: true,
    sourceTimestamp: "2026-08-03T13:49:47.000Z"
  };

  assert.equal(assertDraftMatchesValidation(draft, validation), draft);
  assert.throws(
    () => assertDraftMatchesValidation(
      { ...draft, sourceTimestamp: "2026-08-03T13:49:52.000Z" },
      validation
    ),
    /does not match the validated quote snapshot/u
  );
  assert.throws(
    () => assertDraftMatchesValidation({ ...draft, dryRun: false }, validation),
    /does not match the validated quote snapshot/u
  );
});

async function fixtureRepo() {
  const root = await mkdtemp(join(process.env.TMPDIR || "/tmp", "chartchamp-release-test-"));
  const files = {
    "index.html": "<script src=\"data/app-data.js\"></script>",
    "assets/app.js": "window.APP_READY = true;\n",
    "assets/styles.css": "body { color: #111; }\n",
    "data/app-data.js": "window.APP_DATA = { portfolio: {} };\n",
    "data/trade-setup-reviews.js": "window.TRADE_SETUP_REVIEWS = { schemaVersion: 1, reviews: [] };\n",
    "data/discord-research-sync.js": "window.DISCORD_RESEARCH_SYNC = {};\n",
    "data/live-prices.js": "window.LIVE_PRICES = {};\n",
    "data/live-prices.json": JSON.stringify({
      generatedAt: "2026-07-20T16:30:10.000Z",
      sourceTimestamp: "2026-07-20T16:30:00.000Z",
      session: "intraday"
    }),
    "data/portfolio-data.js": "window.PORTFOLIO_DATA = {};\n",
    "assets/research-model.js": "window.ChartChampModel = {};\n",
    "assets/favicon.svg": "<svg/>\n",
    "robots.txt": "User-agent: *\n",
    "sitemap.xml": "<urlset/>\n",
    "watchlists/index.html": "watchlists",
    "watchlists/assets/app.js": "window.WATCHLIST = true;\n",
    "watchlists/README.md": "not public",
    "portfolio-lab.html": "local only",
    "assets/portfolio-lab.js": "local only"
  };
  for (const [file, content] of Object.entries(files)) {
    const path = join(root, file);
    await mkdir(join(path, ".."), { recursive: true });
    await writeFile(path, content, "utf8");
  }
  await writeFile(join(root, "firebase.json"), JSON.stringify({
    hosting: {
      site: "chartchamp",
      public: ".",
      cleanUrls: true,
      headers: []
    }
  }), "utf8");
  return root;
}

test("isolated Firebase stage excludes local portfolio-lab and non-public documentation", async () => {
  const root = await fixtureRepo();
  const stageParent = await mkdtemp(join(process.env.TMPDIR || "/tmp", "chartchamp-stage-parent-"));
  const staged = await stageRelease({ root, stageParent });
  assert.ok(staged.files.includes("index.html"));
  assert.ok(staged.files.includes("data/trade-setup-reviews.js"));
  assert.ok(staged.files.includes("data/discord-research-sync.js"));
  assert.ok(!staged.files.includes("data/ai-portfolio-state.js"));
  assert.ok(!staged.files.includes("watchlists/index.html"));
  assert.ok(!staged.files.includes("data/portfolio-data.js"));
  assert.ok(!staged.files.includes("watchlists/data/watchlist-tracker.csv"));
  assert.ok(!staged.files.some((file) => /portfolio-lab/iu.test(file)));
  assert.ok(!staged.files.includes("watchlists/README.md"));
  const config = JSON.parse(await readFile(staged.configPath, "utf8"));
  assert.equal(config.hosting.public, "public");
  assert.equal(config.hosting.site, "chartchamp");
});

test("remote verification requires exact hashes, no-cache data, and matching timestamps", async () => {
  const root = await fixtureRepo();
  const stageParent = await mkdtemp(join(process.env.TMPDIR || "/tmp", "chartchamp-manifest-parent-"));
  const staged = await stageRelease({ root, stageParent });
  const manifest = await buildManifest(staged.publicDir);
  const bodies = new Map();
  for (const file of manifest.files) {
    bodies.set(file.remotePath, await readFile(join(staged.publicDir, file.relativePath)));
  }
  const fetchImpl = async (url) => {
    const path = new URL(url).pathname;
    return new Response(bodies.get(path), {
      status: 200,
      headers: { "cache-control": path.startsWith("/data/") ? "no-cache, max-age=0" : "max-age=3600" }
    });
  };
  const result = await verifyRemoteRelease({
    manifest,
    fetchImpl,
    now: "2026-07-20T16:31:00Z",
    attempts: 1,
    wait: async () => undefined
  });
  assert.equal(result.fileCount, manifest.files.length);
  assert.equal(result.ageMinutes, 1);

  const badFetch = async (url) => {
    const path = new URL(url).pathname;
    const content = path === "/data/live-prices.json" ? Buffer.from("{}") : bodies.get(path);
    return new Response(content, {
      status: 200,
      headers: { "cache-control": path.startsWith("/data/") ? "no-cache" : "max-age=3600" }
    });
  };
  await assert.rejects(
    verifyRemoteRelease({
      manifest,
      fetchImpl: badFetch,
      now: "2026-07-20T16:31:00Z",
      attempts: 1,
      wait: async () => undefined
    }),
    /hash does not match/u
  );
});

test("remote verification tolerates a transient stale Firebase edge response", async () => {
  const root = await fixtureRepo();
  const stageParent = await mkdtemp(join(process.env.TMPDIR || "/tmp", "chartchamp-propagation-parent-"));
  const staged = await stageRelease({ root, stageParent });
  const manifest = await buildManifest(staged.publicDir);
  const bodies = new Map();
  for (const file of manifest.files) {
    bodies.set(file.remotePath, await readFile(join(staged.publicDir, file.relativePath)));
  }

  const waits = [];
  const fetchImpl = async (url) => {
    const parsed = new URL(url);
    const path = parsed.pathname;
    const attempt = Number(parsed.searchParams.get("chartchamp_release")?.split("-").at(-1));
    const stale = path === "/data/live-prices.json" && attempt < 5;
    return new Response(stale ? Buffer.from("{}") : bodies.get(path), {
      status: 200,
      headers: { "cache-control": path.startsWith("/data/") ? "no-cache, max-age=0" : "max-age=3600" }
    });
  };

  const result = await verifyRemoteRelease({
    manifest,
    fetchImpl,
    now: "2026-07-20T16:31:00Z",
    wait: async (milliseconds) => waits.push(milliseconds)
  });

  assert.equal(result.fileCount, manifest.files.length);
  assert.deepEqual(waits, [500, 1000, 2000, 4000]);
});

test("approved Discord body check rejects the legacy formatter and accepts the reviewed contract", () => {
  assert.equal(hasApprovedPortfolioBody("📊 **ChartChamp Portfolio — Market Open**\n**Value:** $10,000.00"), false);
  const approved = [
    "**📊 PUBLIC PORTFOLIO — July 20, 2026 · 9:30 AM PT**",
    "",
    "- **VALUE** — $10,000.00.",
    "- **TOTAL RETURN** — +$0.00 (+0.00%).",
    "- **TODAY** — +$0.00 (+0.00%).",
    "- **REALIZED P/L** — +$0.00.",
    "- **RECENT DECISIONS** — No new filled trades.",
    "- **TOP CONTRIBUTOR** — None.",
    "- **TOP DETRACTOR** — None.",
    "- **PORTFOLIO** — https://chartchamp.web.app/"
  ].join("\n");
  assert.equal(hasApprovedPortfolioBody(approved), true);
  assert.equal(hash(approved).length, 64);
});
