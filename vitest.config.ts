import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults, coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths({ configNames: ["tsconfig.test.json"] })],
  test: {
    globals: true,
    exclude: [...configDefaults.exclude, "build/**/*"],
    coverage: {
      provider: "v8",
      exclude: [...coverageConfigDefaults.exclude, "build/**/*"],
    },
  },
});
