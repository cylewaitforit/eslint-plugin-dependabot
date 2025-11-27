import type { Rule } from "eslint";
import type { Pair, YAMLMap } from "yaml";

import { isCollection, isScalar } from "yaml";

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
		return {
			/** Visits Map nodes under "updates:" to check for cooldown configuration in each package-ecosystem. */
			Map(node: Rule.Node) {
				if (
					typeof node !== "object" ||
					!("items" in node) ||
					!Array.isArray(node.items)
				) {
					return;
				}

				const yamlMapNode = node as unknown as YAMLMap;
				const packageEcosystemPair = yamlMapNode.items.find(
					(item) =>
						item.key &&
						isScalar(item.key) &&
						item.key.value === "package-ecosystem",
				);

				if (!packageEcosystemPair) {
					return;
				}

				const ecosystemValue = packageEcosystemPair.value;
				const ecosystemName = isScalar(ecosystemValue)
					? String(ecosystemValue.value)
					: "unknown";

				const cooldownPair = yamlMapNode.items.find(
					(item) =>
						item.key && isScalar(item.key) && item.key.value === "cooldown",
				);

				if (!cooldownPair?.value) {
					context.report({
						data: {
							ecosystem: ecosystemName,
						},
						messageId: "missingCooldown",
						node,
					});
					return;
				}

				const cooldownValue = cooldownPair.value;

				if (
					isScalar(cooldownValue) &&
					typeof cooldownValue.value === "number"
				) {
					context.report({
						data: {
							ecosystem: ecosystemName,
						},
						messageId: "missingDefaultDays",
						node,
					});
					return;
				}

				if (!isCollection(cooldownValue)) {
					context.report({
						data: {
							ecosystem: ecosystemName,
						},
						messageId: "missingDefaultDays",
						node,
					});
					return;
				}

				const defaultDaysPair = isCollection(cooldownValue)
					? (cooldownValue.items as Pair[]).find(
							(item) =>
								item.key &&
								isScalar(item.key) &&
								item.key.value === "default-days",
						)
					: undefined;

				if (!defaultDaysPair?.value) {
					context.report({
						data: {
							ecosystem: ecosystemName,
						},
						messageId: "missingDefaultDays",
						node,
					});
				}
			},
		};
	},
} satisfies Rule.RuleModule;
