import type { Rule } from "eslint";
import type { YAMLMap } from "yaml";

import { isMap, isSeq } from "yaml";

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
		// Find the position to insert cooldown after package-ecosystem
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- YAML node range is compatible with ESLint range
		const packageEcosystemRange = packageEcosystemPair.value?.range;
		context.report({
			data: {
				ecosystem: ecosystemName,
			},
			fix(fixer) {
				if (packageEcosystemRange) {
					// Insert cooldown after the package-ecosystem line
					// We need to find the end of the line and insert after it
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- YAML node range is a tuple
					const insertPosition = packageEcosystemRange[1] as number;
					return fixer.insertTextAfterRange(
						[insertPosition, insertPosition] as [number, number],
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
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- YAML node range is compatible with ESLint range
		const cooldownRange = cooldownValue.range;
		const cooldownKeyRange = cooldownPair.key.range;
		context.report({
			data: {
				ecosystem: ecosystemName,
			},
			fix(fixer) {
				if (isMap(cooldownValue) && cooldownRange) {
					// If cooldown is a map but doesn't have default-days, add it
					// Insert at the beginning of the cooldown map content
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- YAML node range is a tuple
					const insertPosition = cooldownRange[0] as number;
					return fixer.insertTextBeforeRange(
						[insertPosition, insertPosition] as [number, number],
						`default-days: ${String(defaultDays)}\n      `,
					);
				}

				if (cooldownKeyRange && cooldownRange) {
					// If cooldown is not a map (scalar or empty), replace the value
					// The range for empty scalar is [n, n, n], for non-empty it's [start, end, end]
					// We want to replace whatever is there (including space) with our map structure

					const keyEnd = cooldownKeyRange[1];
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- YAML node range is a tuple
					const valueEnd = cooldownRange[1];
					// Replace from after "cooldown" key to end of value
					return fixer.replaceTextRange(
						[keyEnd, valueEnd] as [number, number],
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
