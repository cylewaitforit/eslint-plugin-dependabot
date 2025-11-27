import type { Rule } from "eslint";

import { createRootMapVisitor, findPairByKey } from "../utils/yaml.js";

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
			url: "https://github.com/cylewaitforit/eslint-plugin-dependabot/blob/main/docs/rules/require-config-version.md",
		},
		messages: {
			missingVersion:
				"Dependabot configuration is missing a 'version' property. Add 'version: 2' at the root of the file.",
		},
		schema: [],
		type: "problem" as const,
	},

	create(context: Rule.RuleContext) {
		return createRootMapVisitor((rootMap) => {
			const versionPair = findPairByKey(rootMap, "version");

			if (!versionPair) {
				context.report({
					messageId: "missingVersion",
					node: rootMap,
				});
			}
		});
	},
} satisfies Rule.RuleModule;
