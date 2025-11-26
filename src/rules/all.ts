import type { RuleDefinition } from "@eslint/core";

import { requireConfigVersionRule } from "./require-config-version.js";

/**
 * All rules exported by this plugin.
 * YAML rules are cast to RuleDefinition for ESLint compatibility at the rule export level.
 * This is because we're a rule plugin extending eslint-yaml (a language plugin).
 * The actual type safety is maintained at the rule definition level with YAMLRuleDefinition.
 */
export const rules: Record<string, RuleDefinition> = {
	"require-config-version": requireConfigVersionRule,
};
