// eslint.config.mjs
import { defineConfig } from "eslint/config";
import nextPlugin from "eslint-plugin-next";

export default defineConfig([
  {
    ignores: [".next/", "node_modules/", "out/"],
  },
  {
    plugins: {
      next: nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
]);