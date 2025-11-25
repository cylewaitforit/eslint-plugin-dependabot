import type { Pair, YAMLMap } from "yaml";

import { isCollection, isScalar } from "yaml";

import type {
	YAMLRuleContext,
	YAMLRuleDefinition,
	YAMLRuleVisitor,
} from "../types.js";

// ESLint rule definition using satisfies to ensure it conforms to YAML rule interface
// This avoids type conflicts between YAML rules and ESLint's standard RuleDefinition
const requireCooldown = {
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
	create(
		context: YAMLRuleContext<"missingCooldown" | "missingDefaultDays">,
	): YAMLRuleVisitor {
		return {
			// Visit all Map nodes (YAML objects)
			Map(node: YAMLMap) {
				// Check if this Map is an update entry
				// It should have package-ecosystem but may be missing cooldown

				const packageEcosystemPair = node.items.find(
					(item) =>
						item.key &&
						isScalar(item.key) &&
						item.key.value === "package-ecosystem",
				);

				// If this node doesn't have package-ecosystem, it's not an update entry
				if (!packageEcosystemPair) {
					return;
				}

				const ecosystemValue = packageEcosystemPair.value;
				const ecosystemName = isScalar(ecosystemValue)
					? String(ecosystemValue.value)
					: "unknown";

				// Check for cooldown

				const cooldownPair = node.items.find(
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

				// Check if cooldown is a scalar (e.g., cooldown: 5)
				if (
					isScalar(cooldownValue) &&
					typeof cooldownValue.value === "number"
				) {
					// Scalar value - we need to convert it to a map with default-days
					context.report({
						data: {
							ecosystem: ecosystemName,
						},
						messageId: "missingDefaultDays",
						node: cooldownPair,
					});
					return;
				}

				// Check if cooldown is a Map
				if (!isCollection(cooldownValue)) {
					context.report({
						data: {
							ecosystem: ecosystemName,
						},
						messageId: "missingDefaultDays",
						node: cooldownPair,
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
						node: cooldownPair,
					});
				}
			},
		};
	},
} satisfies YAMLRuleDefinition;

export { requireCooldown };
