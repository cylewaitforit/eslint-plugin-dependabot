import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { requireCooldown } from "./rules/require-cooldown.js";

interface PackageJson {
	version: string;
}

const packageJson: PackageJson = JSON.parse(
	readFileSync(
		fileURLToPath(new URL("../package.json", import.meta.url)),
		"utf8",
	),
) as PackageJson;

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
		version: packageJson.version,
	},
	rules: {
		"require-cooldown": requireCooldown,
	},
};

export default plugin;
