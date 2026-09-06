import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const AUTOMATION_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

export async function loadAutomationConfig(root = AUTOMATION_ROOT) {
  const [channelRegistry, jobRegistry, schedules] = await Promise.all([
    readJson(resolve(root, "channels.json")),
    readJson(resolve(root, "jobs.json")),
    readJson(resolve(root, "schedules.json"))
  ]);

  return { channelRegistry, jobRegistry, schedules };
}

export function findChannel(channelRegistry, keyOrId) {
  return channelRegistry.channels.find(
    (channel) => channel.key === keyOrId || channel.channelId === String(keyOrId)
  );
}

export function findJob(jobRegistry, jobId) {
  return jobRegistry.jobs.find((job) => job.id === jobId);
}

export async function loadJobPrompt(job, root = AUTOMATION_ROOT) {
  return readFile(resolve(root, job.promptFile), "utf8");
}

export async function exportPausedJobDefinitions(root = AUTOMATION_ROOT) {
  const { jobRegistry } = await loadAutomationConfig(root);
  return Promise.all(
    jobRegistry.jobs.map(async (job) => ({
      kind: jobRegistry.defaults.kind,
      name: job.name,
      prompt: (await loadJobPrompt(job, root)).trim(),
      rrule: job.rrule,
      timezone: jobRegistry.timezone,
      status: job.status || jobRegistry.defaults.status,
      executionEnvironment: jobRegistry.defaults.executionEnvironment,
      model: job.model,
      reasoningEffort: job.reasoningEffort,
      metadata: {
        chartChampJobId: job.id,
        channel: job.channel,
        deliveryMode: job.deliveryMode || jobRegistry.defaults.deliveryMode
      }
    }))
  );
}
