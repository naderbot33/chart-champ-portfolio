import { fileURLToPath } from "node:url";

// Explicit test dependency; never a fallback for production configuration.
export const LEGACY_AUTOMATION_ROOT = fileURLToPath(
  new URL("../fixtures/legacy-automation/", import.meta.url)
);
