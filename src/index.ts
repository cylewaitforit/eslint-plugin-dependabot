import type { ESLint } from "eslint";

import packageJson from "../package.json" with { type: "json" };
import { rules } from "./rules/all.js";

/**
 * ESLint plugin for Dependabot configuration files.
 * This plugin works with eslint-yaml to lint `.github/dependabot.{yml,yaml}` files.
 * @example
 * ```js
 * // eslint.config.mjs
 * import dependabot from "eslint-plugin-dependabot";
 * import { yaml } from "eslint-yaml";
 * import { defineConfig } from "eslint/config";
 *
 * export default defineConfig([
 *   {
 *     name: "dependabot config",
 *     files: ["**\/.github\/dependabot.{yml,yaml}"],
 *     language: "yaml/yaml",
 *     plugins: { dependabot, yaml },
 *     extends: [dependabot.configs.recommended],
 *   },
 * ]);
 * ```
 */
const plugin = {
	meta: {
		name: packageJson.name,
		version: packageJson.version,
	},
	// eslint-disable-next-line perfectionist/sort-objects -- meta should be at the top
	configs: {
		recommended: {
			name: "dependabot/recommended",
			rules: {
				"dependabot/require-config-file": "error",
				"dependabot/require-config-version": ["error", { version: 2 }],
				"dependabot/require-cooldown": "error",
			},
		},
	},
	rules,
} satisfies ESLint.Plugin;

export default plugin;
