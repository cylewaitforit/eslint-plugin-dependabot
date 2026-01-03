import type { Rule } from "eslint";

import { requireConfigVersionRule } from "./require-config-version.js";
import { requireCooldownRule } from "./require-cooldown.js";
import { requirePackageEcosystemRule } from "./require-package-ecosystem.js";

/**
 * All rules exported by this plugin.
 * Rules are standard ESLint Rule.RuleModule objects that work with eslint-yaml's language plugin.
 */
export const rules = {
	"require-config-version": requireConfigVersionRule,
	"require-cooldown": requireCooldownRule,
	"require-package-ecosystem": requirePackageEcosystemRule,
} as Record<string, Rule.RuleModule>;
