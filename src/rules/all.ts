import type { RuleDefinition } from "@eslint/core";

import { requireConfigVersion } from "./require-config-version.js";

/**
 * All rules exported by this plugin.
 * YAML rules are cast to RuleDefinition for ESLint compatibility.
 * The actual type safety is maintained at the rule definition level with YAMLRuleDefinition.
 */
export const rules: Record<string, RuleDefinition> = {
	"require-config-version": requireConfigVersion as RuleDefinition,
};
