import type { Rule } from "eslint";
import type { AST } from "yaml-eslint-parser";

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
	ecosystemMap: AST.YAMLMapping,
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

	if (!cooldownPair) {
		const packageEcosystemValue = packageEcosystemPair.value;
		const packageEcosystemRange =
			packageEcosystemValue !== null &&
			packageEcosystemValue.type === "YAMLScalar"
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
					const sourceCode = context.sourceCode.getText();
					const newlineAfterValue = sourceCode.indexOf("\n", insertPosition);
					if (newlineAfterValue !== -1) {
						const textBetween = sourceCode.slice(
							insertPosition,
							newlineAfterValue,
						);
						if (textBetween.trim().startsWith("#")) {
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
		cooldownValue !== null &&
		cooldownValue.type === "YAMLMapping" &&
		findPairByKey(cooldownValue as AST.YAMLMapping, "default-days")?.value !==
			undefined;

	if (!hasValidDefaultDays) {
		const cooldownKeyRange = cooldownPair.key.range;
		context.report({
			data: {
				ecosystem: ecosystemName,
			},
			fix(fixer) {
				// Case 1: cooldown is a mapping — insert default-days before existing keys
				if (cooldownValue !== null && cooldownValue.type === "YAMLMapping") {
					return fixer.insertTextBeforeRange(
						[cooldownValue.range[0], cooldownValue.range[0]],
						`default-days: ${String(defaultDays)}\n      `,
					);
				}

				// Case 2: cooldown value is null (e.g. `cooldown:` with nothing after)
				// — insert default-days on the next line after the colon
				if (cooldownValue === null) {
					return fixer.insertTextAfterRange(
						[cooldownPair.range[1], cooldownPair.range[1]],
						`\n      default-days: ${String(defaultDays)}`,
					);
				}

				// Case 3: cooldown is a scalar — replace 'cooldown: <value>' with the map form
				return fixer.replaceTextRange(
					[cooldownKeyRange[1], cooldownValue.range[1]],
					`:\n      default-days: ${String(defaultDays)}`,
				);
			},
			messageId: "missingDefaultDays",
			node: yamlNodeToRuleNode(cooldownPair),
		});
	}
}

/**
 * Rule to require cooldown configuration for each package-ecosystem in Dependabot files.
 * Uses standard ESLint RuleDefinition and handles YAML nodes via runtime type checking.
 * This approach is compatible with eslint-plugin-yml and other ESLint configurations.
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
			if (updatesValue?.type !== "YAMLSequence") {
				return;
			}

			for (const item of updatesValue.entries) {
				if (item?.type !== "YAMLMapping") {
					continue;
				}

				validateEcosystemCooldown(
					item as AST.YAMLMapping,
					context,
					defaultDays,
				);
			}
		});
	},
} satisfies Rule.RuleModule;
