import type { ESLint } from "eslint";

import packageJson from "../package.json" with { type: "json" };
import { requireCooldown } from "./rules/require-cooldown.js";

const plugin = {
	meta: {
		name: packageJson.name,
		version: packageJson.version,
	},
	// eslint-disable-next-line perfectionist/sort-objects -- metadata should be at the top
	configs: {
		recommended: {
			rules: {
				"dependabot/require-cooldown": "error",
			},
		},
	},
	rules: {
		"require-cooldown": requireCooldown,
	},
} satisfies ESLint.Plugin;

export default plugin;
