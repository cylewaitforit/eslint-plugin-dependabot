import type { Rule } from "eslint";
import type { Pair, Scalar, YAMLMap } from "yaml";

const requireCooldown = {
	create(context) {
		return {
			// Visit all Map nodes (YAML objects)
			Map(node: YAMLMap) {
				// Check if this Map is an update entry
				// It should have package-ecosystem but may be missing cooldown
				const packageEcosystemPair = node.items?.find(
					(item: Pair) => item.key && "value" in item.key && item.key.value === "package-ecosystem",
				);

				// If this node doesn't have package-ecosystem, it's not an update entry
				if (!packageEcosystemPair) {
					return;
				}

				const ecosystemValue = packageEcosystemPair.value;
				const ecosystemName =
					(ecosystemValue && "value" in ecosystemValue
						? ecosystemValue.value
						: "unknown"
					)?.toString() ?? "unknown";

				// Check for cooldown
				const cooldownPair = node.items?.find(
					(item: Pair) => item.key && "value" in item.key && item.key.value === "cooldown",
				);

				if (!cooldownPair || !cooldownPair.value) {
					context.report({
						data: {
							ecosystem: ecosystemName,
						},
						fix(fixer) {
							// Insert cooldown after package-ecosystem
							if (!packageEcosystemPair.range) {
								return null;
							}
							const indent = "    "; // 4 spaces for top-level properties
							const nestedIndent = "      "; // 6 spaces for nested properties
							const cooldownText = `\n${indent}cooldown:\n${nestedIndent}default-days: 7`;
							return fixer.insertTextAfterRange(
								packageEcosystemPair.range,
								cooldownText,
							);
						},
						messageId: "missingCooldown",
						// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment -- ESLint node type is not fully typed for YAML
						node: node as any,
					});
					return;
				}

				const cooldownValue = cooldownPair.value;

				// Check if cooldown is a scalar (e.g., cooldown: 5)
				if (cooldownValue && "value" in cooldownValue && typeof cooldownValue.value === "number") {
					// Scalar value - we need to convert it to a map with default-days
					const scalarValue = cooldownValue.value;
					context.report({
						data: {
							ecosystem: ecosystemName,
						},
						fix(fixer) {
							if (!cooldownValue.range) {
								return null;
							}
							const indent = "      "; // 6 spaces for nested properties
							const newCooldown = `\n${indent}default-days: ${scalarValue}`;
							return fixer.insertTextAfterRange(
								[cooldownValue.range[0] - 1, cooldownValue.range[0] - 1],
								newCooldown,
							);
						},
						messageId: "missingDefaultDays",
						// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment -- ESLint node type is not fully typed for YAML
						node: cooldownPair as any,
					});
					return;
				}

				// Check if cooldown is a Map
				if (!cooldownValue || !("items" in cooldownValue) || !cooldownValue.items) {
					context.report({
						data: {
							ecosystem: ecosystemName,
						},
						fix(fixer) {
							if (!cooldownPair.range) {
								return null;
							}
							const indent = "      "; // 6 spaces for nested properties
							const defaultDaysText = `\n${indent}default-days: 7`;
							return fixer.insertTextAfterRange(
								cooldownPair.range,
								defaultDaysText,
							);
						},
						messageId: "missingDefaultDays",
						// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment -- ESLint node type is not fully typed for YAML
						node: cooldownPair as any,
					});
					return;
				}

				const defaultDaysPair = cooldownValue.items.find(
					(item: Pair) => item.key && "value" in item.key && item.key.value === "default-days",
				);

				if (!defaultDaysPair || !defaultDaysPair.value) {
					context.report({
						data: {
							ecosystem: ecosystemName,
						},
						fix(fixer) {
							if (!cooldownPair.range) {
								return null;
							}
							const indent = "      "; // 6 spaces for nested properties
							const defaultDaysText = `\n${indent}default-days: 7`;
							return fixer.insertTextAfterRange(
								cooldownPair.range,
								defaultDaysText,
							);
						},
						messageId: "missingDefaultDays",
						// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment -- ESLint node type is not fully typed for YAML
						node: cooldownPair as any,
					});
				}
			},
		};
	},
	meta: {
		docs: {
			description:
				"Require each package-ecosystem to have a cooldown configuration with default-days",
			recommended: true,
		},
		fixable: "code",
		messages: {
			missingCooldown:
				"Package ecosystem '{{ ecosystem }}' is missing a cooldown configuration. Add a cooldown with at least default-days.",
			missingDefaultDays:
				"Package ecosystem '{{ ecosystem }}' has a cooldown configuration but is missing the required 'default-days' property.",
		},
		schema: [],
		type: "problem",
	},
} satisfies Rule.RuleModule;

export { requireCooldown };
