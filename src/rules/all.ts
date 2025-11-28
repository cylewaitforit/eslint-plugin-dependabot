import type { Rule } from "eslint";

import { requireConfigVersionRule } from "./require-config-version.js";
import { requireCooldownRule } from "./require-cooldown.js";

/**
 * All rules exported by this plugin.
 * Rules are standard ESLint Rule.RuleModule objects that work with eslint-yaml's language plugin.
 */
export const rules = {
	"require-config-version": requireConfigVersionRule,
	"require-cooldown": requireCooldownRule,
} as Record<string, Rule.RuleModule>;
