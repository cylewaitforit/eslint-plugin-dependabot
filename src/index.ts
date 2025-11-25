import type { RuleDefinition } from "@eslint/core";
import type { ESLint } from "eslint";

import packageJson from "../package.json" with { type: "json" };
import { requireConfigVersion } from "./rules/require-config-version.js";

const rules: Record<string, RuleDefinition> = {
	"require-config-version": requireConfigVersion as RuleDefinition,
};

const plugin = {
	configs: {
		recommended: {
			name: "dependabot/recommended",
			rules: {
				"dependabot/require-config-version": "error",
			},
		},
	},
	meta: {
		name: packageJson.name,
		version: packageJson.version,
	},
	rules,
} satisfies ESLint.Plugin;

export default plugin;
