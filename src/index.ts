import type { ESLint } from "eslint";

import type { YAMLRuleDefinition } from "./types.js";

import packageJson from "../package.json" with { type: "json" };
import { requireConfigVersion } from "./rules/require-config-version.js";

/**
 * Plugin type that allows YAML rule definitions in the rules object.
 */
type YAMLPlugin = Omit<ESLint.Plugin, "rules"> & {
	rules: Record<string, YAMLRuleDefinition>;
};

const plugin = {
	meta: {
		name: packageJson.name,
		version: packageJson.version,
	},
	// eslint-disable-next-line perfectionist/sort-objects -- metadata should be at the top
	configs: {
		recommended: {
			name: "dependabot/recommended",
			rules: {
				"dependabot/require-config-version": "error",
			},
		},
	},
	rules: {
		"require-config-version": requireConfigVersion,
	},
} satisfies YAMLPlugin;

export default plugin;
