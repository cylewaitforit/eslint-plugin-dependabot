import type { Rule } from "eslint";
import type { YAMLMap } from "yaml";

import { isMap, isSeq } from "yaml";

import {
	createRootMapVisitor,
	findPairByKey,
	getScalarStringValue,
	yamlNodeToRuleNode,
} from "../utils/yaml.js";

/**
 * Validates that a package-ecosystem entry has a valid cooldown configuration.
 * Reports an error if the cooldown is missing or invalid.
 */
function validateEcosystemCooldown(
	ecosystemMap: YAMLMap,
	context: Rule.RuleContext,
): void {
	const packageEcosystemPair = findPairByKey(ecosystemMap, "package-ecosystem");

	if (!packageEcosystemPair) {
		return;
	}

	const ecosystemName =
		getScalarStringValue(packageEcosystemPair.value) ?? "unknown";

	const cooldownPair = findPairByKey(ecosystemMap, "cooldown");

	if (!cooldownPair?.value) {
		context.report({
			data: {
				ecosystem: ecosystemName,
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
		context.report({
			data: {
				ecosystem: ecosystemName,
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
		messages: {
			missingCooldown:
				"Package ecosystem '{{ ecosystem }}' is missing a cooldown configuration. Add a cooldown with at least default-days.",
			missingDefaultDays:
				"Package ecosystem '{{ ecosystem }}' has a cooldown configuration but is missing the required 'default-days' property.",
		},
		schema: [],
		type: "problem" as const,
	},
	// eslint-disable-next-line perfectionist/sort-objects -- meta should be at the top
	create(context: Rule.RuleContext) {
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

				validateEcosystemCooldown(item, context);
			}
		});
	},
} satisfies Rule.RuleModule;
