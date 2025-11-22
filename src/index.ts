import type { ESLint } from "eslint";

import packageJson from "../package.json" with { type: "json" };
import { requireCooldown } from "./rules/require-cooldown.js";

const plugin = {
	configs: {
		recommended: {
			rules: {
				"dependabot/require-cooldown": "error",
			},
		},
	},
	meta: {
		name: packageJson.name,
		version: packageJson.version,
	},
	rules: {
		"require-cooldown": requireCooldown,
	},
} satisfies ESLint.Plugin;

export default plugin;
