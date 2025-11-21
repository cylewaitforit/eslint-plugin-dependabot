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
		name: "eslint-plugin-dependabot",
		version: "0.0.0",
	},
	rules: {
		"require-cooldown": requireCooldown,
	},
};

export default plugin;
