import type { Rule } from "eslint";
import type { YAMLMap } from "yaml";

import { isMap, isNode, isScalar, isSeq } from "yaml";

import {
	createRootMapVisitor,
	findPairByKey,
	getScalarStringValue,
	yamlNodeToRuleNode,
} from "../utils/yaml.js";

/** Default cooldown days if not configured. */
const DEFAULT_COOLDOWN_DAYS = 7;

/** Options for the require-cooldown rule. */
interface RuleOptions {
	defaultDays?: number;
}

/**
 * Validates that a package-ecosystem entry has a valid cooldown configuration.
 * Reports an error if the cooldown is missing or invalid.
 */
function validateEcosystemCooldown(
	ecosystemMap: YAMLMap,
	context: Rule.RuleContext,
	defaultDays: number,
): void {
	const packageEcosystemPair = findPairByKey(ecosystemMap, "package-ecosystem");

	if (!packageEcosystemPair) {
		return;
	}

	const ecosystemName =
		getScalarStringValue(packageEcosystemPair.value) ?? "unknown";

	const cooldownPair = findPairByKey(ecosystemMap, "cooldown");

	if (!cooldownPair?.value) {
		const packageEcosystemValue = packageEcosystemPair.value;
		const packageEcosystemRange = isScalar(packageEcosystemValue)
			? packageEcosystemValue.range
			: undefined;
		context.report({
			data: {
				ecosystem: ecosystemName,
			},
			fix(fixer) {
				if (packageEcosystemRange) {
					let insertPosition = packageEcosystemRange[1];

					// If there's an inline comment, insert after it instead of before it
					if (
						isScalar(packageEcosystemValue) &&
						packageEcosystemValue.comment
					) {
						const sourceCode = context.sourceCode.getText();
						const newlineAfterValue = sourceCode.indexOf("\n", insertPosition);
						// If a newline is found, insert after it to preserve the inline comment
						// If no newline is found (edge case: last line), the comment will remain inline
						if (newlineAfterValue !== -1) {
							insertPosition = newlineAfterValue;
						}
					}

					return fixer.insertTextAfterRange(
						[insertPosition, insertPosition],
						`\n    cooldown:\n      default-days: ${String(defaultDays)}`,
					);
				}
				return null;
			},
			messageId: "missingCooldown",
			node: yamlNodeToRuleNode(packageEcosystemPair),
		});
		return;
	}

	const cooldownValue = cooldownPair.value;

	const hasValidDefaultDays =
		isMap(cooldownValue) &&
		findPairByKey(cooldownValue, "default-days")?.value !== undefined;

	if (!hasValidDefaultDays) {
		const cooldownRange = isNode(cooldownValue)
			? cooldownValue.range
			: undefined;
		const cooldownKeyRange = cooldownPair.key.range;
		context.report({
			data: {
				ecosystem: ecosystemName,
			},
			fix(fixer) {
				if (isMap(cooldownValue) && cooldownRange) {
					const insertPosition = cooldownRange[0];
					return fixer.insertTextBeforeRange(
						[insertPosition, insertPosition],
						`default-days: ${String(defaultDays)}\n      `,
					);
				}

				if (cooldownKeyRange && cooldownRange) {
					const keyEnd = cooldownKeyRange[1];
					const valueEnd = cooldownRange[1];
					return fixer.replaceTextRange(
						[keyEnd, valueEnd],
						`:\n      default-days: ${String(defaultDays)}`,
					);
				}

				return null;
			},
			messageId: "missingDefaultDays",
			node: yamlNodeToRuleNode(cooldownPair),
		});
	}
}

/**
 * Rule to require cooldown configuration for each package-ecosystem in Dependabot files.
 * Uses standard ESLint RuleDefinition and handles YAML nodes via runtime type checking.
 * This approach is compatible with both eslint-yaml and other ESLint configurations.
 */
export const requireCooldownRule = {
	meta: {
		docs: {
			description:
				"Require each package-ecosystem to have a cooldown configuration with default-days",
			recommended: true,
			url: "https://github.com/cylewaitforit/eslint-plugin-dependabot/blob/main/docs/rules/require-cooldown.md",
		},
		fixable: "code" as const,
		messages: {
			missingCooldown:
				"Package ecosystem '{{ ecosystem }}' is missing a cooldown configuration. Add a cooldown with at least default-days.",
			missingDefaultDays:
				"Package ecosystem '{{ ecosystem }}' has a cooldown configuration but is missing the required 'default-days' property.",
		},
		schema: [
			{
				additionalProperties: false,
				properties: {
					defaultDays: {
						default: DEFAULT_COOLDOWN_DAYS,
						description: "The default number of days for cooldown",
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
		const defaultDays = options.defaultDays ?? DEFAULT_COOLDOWN_DAYS;

		return createRootMapVisitor((rootMap) => {
			const updatesPair = findPairByKey(rootMap, "updates");

			if (!updatesPair) {
				return;
			}

			const updatesValue = updatesPair.value;
			if (!isSeq(updatesValue)) {
				return;
			}

			for (const item of updatesValue.items) {
				if (!isMap(item)) {
					continue;
				}

				validateEcosystemCooldown(item, context, defaultDays);
			}
		});
	},
} satisfies Rule.RuleModule;
