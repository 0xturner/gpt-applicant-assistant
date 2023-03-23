import { defineConfig } from "vitest/config";

import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  test: {
    environment: "edge-runtime",
  },
});
