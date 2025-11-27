import type { ESLint } from "eslint";

import packageJson from "../package.json" with { type: "json" };
import { rules } from "./rules/all.js";

/**
 * ESLint plugin for Dependabot configuration files.
 * This plugin works with eslint-yaml to lint `.github/dependabot.{yml,yaml}` files.
 * @example
 * ```js
 * import dependabot from "eslint-plugin-dependabot";
 * import { yaml } from "eslint-yaml";
 *
 * export default [
 *   {
 *     files: ["**\/.github\/dependabot.{yml,yaml}"],
 *     language: "yaml/yaml",
 *     plugins: { dependabot, yaml },
 *     ...dependabot.configs.recommended,
 *   }
 * ];
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
				"dependabot/require-config-version": "error",
				"dependabot/require-cooldown": "error",
			},
		},
	},
	rules,
} satisfies ESLint.Plugin;

export default plugin;
