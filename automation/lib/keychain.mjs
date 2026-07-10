import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const DISCORD_HOSTS = new Set(["discord.com", "discordapp.com"]);

export function assertDiscordWebhookUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Keychain entry is not a valid URL.");
  }
  if (url.protocol !== "https:" || !DISCORD_HOSTS.has(url.hostname)) {
    throw new Error("Keychain entry is not an HTTPS Discord webhook URL.");
  }
  if (!/^\/api\/webhooks\/\d+\/[^/]+\/?$/.test(url.pathname)) {
    throw new Error("Keychain entry is not a Discord webhook endpoint.");
  }
  return url.toString();
}

export async function readWebhookFromKeychain({ service, account }) {
  const { stdout } = await execFileAsync(
    "/usr/bin/security",
    ["find-generic-password", "-s", service, "-a", account, "-w"],
    { encoding: "utf8", maxBuffer: 16 * 1024 }
  );
  return assertDiscordWebhookUrl(stdout.trim());
}
