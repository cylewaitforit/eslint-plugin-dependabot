import type { RuleDefinition } from "@eslint/core";

import { requireConfigVersionRule } from "./require-config-version.js";

/**
 * All rules exported by this plugin.
 * Rules are standard ESLint RuleDefinition objects that work with eslint-yaml's language plugin.
 */
export const rules = {
	"require-config-version": requireConfigVersionRule,
} as Record<string, RuleDefinition>;
