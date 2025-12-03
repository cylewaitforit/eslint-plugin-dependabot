import type { Rule } from "eslint";

import { isScalar } from "yaml";

import {
	createRootMapVisitor,
	findPairByKey,
	yamlNodeToRuleNode,
} from "../utils/yaml.js";

/** Default version value if not configured. */
const DEFAULT_VERSION = 2;

/** Options for the require-config-version rule. */
interface RuleOptions {
	version?: number;
}

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
		fixable: "code" as const,
		messages: {
			incorrectVersion:
				"Dependabot configuration has incorrect version. Expected 'version: {{ expected }}' but found 'version: {{ actual }}'.",
			missingVersion:
				"Dependabot configuration is missing a 'version' property. Add 'version: {{ version }}' at the root of the file.",
		},
		schema: [
			{
				additionalProperties: false,
				properties: {
					version: {
						default: DEFAULT_VERSION,
						description: "The required version value",
						type: "number",
					},
				},
				type: "object",
			},
		],
		type: "problem" as const,
	},
	// eslint-disable-next-line perfectionist/sort-objects -- meta should be at the top
	create(context: Rule.RuleContext) {
		const options = (context.options[0] ?? {}) as RuleOptions;
		const requiredVersion = options.version ?? DEFAULT_VERSION;

		return createRootMapVisitor((rootMap) => {
			const versionPair = findPairByKey(rootMap, "version");

			if (!versionPair) {
				const rootRange = rootMap.range;
				context.report({
					data: {
						version: String(requiredVersion),
					},
					fix(fixer) {
						if (rootRange) {
							return fixer.insertTextBeforeRange(
								[rootRange[0], rootRange[0]],
								`version: ${String(requiredVersion)}\n`,
							);
						}
						return null;
					},
					messageId: "missingVersion",
					node: yamlNodeToRuleNode(rootMap),
				});
				return;
			}

			const versionValue = versionPair.value;
			if (isScalar(versionValue)) {
				const actualValue = versionValue.value;
				const actualNum =
					typeof actualValue === "number"
						? actualValue
						: typeof actualValue === "string"
							? parseInt(actualValue, 10)
							: NaN;

				if (actualNum !== requiredVersion) {
					const versionRange = versionValue.range;
					context.report({
						data: {
							actual: String(actualValue),
							expected: String(requiredVersion),
						},
						fix(fixer) {
							if (versionRange) {
								return fixer.replaceTextRange(
									[versionRange[0], versionRange[1]],
									String(requiredVersion),
								);
							}
							return null;
						},
						messageId: "incorrectVersion",
						node: yamlNodeToRuleNode(versionPair),
					});
				}
			}
		});
	},
} satisfies Rule.RuleModule;
