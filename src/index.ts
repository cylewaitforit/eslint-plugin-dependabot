import type { ESLint } from "eslint";

import packageJson from "../package.json" with { type: "json" };
import { rules } from "./rules/all.js";

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
			},
		},
	},
	rules,
} satisfies ESLint.Plugin;

export default plugin;
