import type { Rule } from "eslint";
import type { AST } from "yaml-eslint-parser";

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
 * This approach is compatible with eslint-plugin-yml and other ESLint configurations.
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
				context.report({
					data: {
						version: String(requiredVersion),
					},
					fix(fixer) {
						return fixer.insertTextBeforeRange(
							[rootMap.range[0], rootMap.range[0]],
							`version: ${String(requiredVersion)}\n`,
						);
					},
					messageId: "missingVersion",
					node: yamlNodeToRuleNode(rootMap),
				});
				return;
			}

			const versionValue = versionPair.value;
			if (versionValue !== null && versionValue.type === "YAMLScalar") {
				const versionScalar = versionValue as AST.YAMLScalar;
				const actualValue = versionScalar.value;
				const actualNum =
					typeof actualValue === "number"
						? actualValue
						: typeof actualValue === "string"
							? parseInt(actualValue, 10)
							: NaN;

				if (actualNum !== requiredVersion) {
					context.report({
						data: {
							actual: String(actualValue),
							expected: String(requiredVersion),
						},
						fix(fixer) {
							return fixer.replaceTextRange(
								[versionScalar.range[0], versionScalar.range[1]],
								String(requiredVersion),
							);
						},
						messageId: "incorrectVersion",
						node: yamlNodeToRuleNode(versionPair),
					});
				}
			}
		});
	},
} satisfies Rule.RuleModule;
