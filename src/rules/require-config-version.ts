import type { RuleDefinition } from "@eslint/core";
import type { Rule } from "eslint";
import type { YAMLMap } from "yaml";

import { isScalar } from "yaml";

/**
 * Rule to require a version property in Dependabot configuration files.
 * Uses standard ESLint RuleDefinition and handles YAML nodes via runtime type checking.
 * This approach is compatible with both eslint-yaml and other ESLint configurations.
 */
export const requireConfigVersionRule = {
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
	create(context: Rule.RuleContext) {
		let hasCheckedRoot = false;

		return {
			/** Visits Map nodes to check for version property at the root level. */
			Map(node: Rule.Node) {
				if (hasCheckedRoot) {
					return;
				}
				hasCheckedRoot = true;

				if (
					typeof node !== "object" ||
					!("items" in node) ||
					!Array.isArray(node.items)
				) {
					return;
				}

				const yamlMapNode = node as unknown as YAMLMap;
				const versionPair = yamlMapNode.items.find(
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
} satisfies RuleDefinition;
