import type { Rule } from "eslint";

import { requireConfigVersionRule } from "./require-config-version.js";

/**
 * All rules exported by this plugin.
 * Rules are standard ESLint Rule.RuleModule objects that work with eslint-yaml's language plugin.
 */
export const rules = {
	"require-config-version": requireConfigVersionRule,
} as Record<string, Rule.RuleModule>;
