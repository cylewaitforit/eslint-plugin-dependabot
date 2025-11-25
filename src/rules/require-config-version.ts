import type { YAMLMap } from "yaml";

import { isScalar } from "yaml";

import type {
	YAMLRuleContext,
	YAMLRuleDefinition,
	YAMLRuleVisitor,
} from "../types.js";

/**
 * ESLint rule definition using satisfies to ensure it conforms to YAML rule interface.
 * This avoids type conflicts between YAML rules and ESLint's standard RuleDefinition.
 */
const requireConfigVersion = {
	meta: {
		docs: {
			description:
				"Require Dependabot configuration files to have a version property",
			recommended: true,
		},
		messages: {
			missingVersion:
				"Dependabot configuration is missing a 'version' property. Add 'version: 2' at the root of the file.",
		},
		schema: [],
		type: "problem" as const,
	},
	// eslint-disable-next-line perfectionist/sort-objects -- meta should be at the top
	create(context: YAMLRuleContext<"missingVersion">): YAMLRuleVisitor {
		let hasCheckedRoot = false;

		return {
			/** Visits Map nodes to check for version property at the root level. */
			Map(node: YAMLMap) {
				if (hasCheckedRoot) {
					return;
				}
				hasCheckedRoot = true;

				const versionPair = node.items.find(
					(item) =>
						item.key && isScalar(item.key) && item.key.value === "version",
				);

				if (!versionPair) {
					context.report({
						messageId: "missingVersion",
						node,
					});
				}
			},
		};
	},
} satisfies YAMLRuleDefinition;

export { requireConfigVersion };
