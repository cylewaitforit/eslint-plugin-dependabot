import type { Rule } from "eslint";

interface YAMLMap {
	items?: YAMLPair[];
	range?: [number, number];
}

type YAMLNode = YAMLMap | YAMLScalar;

interface YAMLPair {
	key?: YAMLScalar;
	range?: [number, number];
	value?: YAMLNode;
}

interface YAMLScalar {
	range?: [number, number];
	value?: boolean | null | number | string;
}

export const requireCooldown: Rule.RuleModule = {
	create(context) {
		return {
			// Visit all Map nodes (YAML objects)

			Map(node: YAMLMap) {
				// Check if this Map is an update entry
				// It should have package-ecosystem but may be missing cooldown
				const packageEcosystemPair = node.items?.find(
					(item) => item.key?.value === "package-ecosystem",
				);

				// If this node doesn't have package-ecosystem, it's not an update entry
				if (!packageEcosystemPair) {
					return;
				}

				const ecosystemName =
					(
						packageEcosystemPair.value as undefined | YAMLScalar
					)?.value?.toString() ?? "unknown";

				// Check for cooldown
				const cooldownPair = node.items?.find(
					(item) => item.key?.value === "cooldown",
				);

				if (!cooldownPair?.value) {
					context.report({
						data: {
							ecosystem: ecosystemName,
						},
						fix(fixer) {
							// Insert cooldown right after package-ecosystem
							if (!packageEcosystemPair.range) {
								return null;
							}

							// Get the indentation by finding the column of package-ecosystem
							// We'll use the source code to determine proper indentation
							const indent = "    "; // Standard 4-space indent for YAML list items

							// Insert cooldown config right after package-ecosystem
							const cooldownText = `\n${indent}cooldown:\n${indent}  default-days: 7`;

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

				// Check if cooldown has default-days
				// YAMLNode is a union of YAMLMap | YAMLScalar, so this assertion is safe
				const cooldown = cooldownPair.value as YAMLMap | YAMLScalar;

				// If cooldown is not a map or doesn't have items, it's invalid
				// This type guard checks for YAMLMap by checking for the 'items' property
				if (!("items" in cooldown) || !cooldown.items) {
					context.report({
						data: {
							ecosystem: ecosystemName,
						},
						messageId: "missingDefaultDays",
						// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment -- ESLint node type is not fully typed for YAML
						node: cooldownPair as any,
					});
					return;
				}

				const defaultDaysPair = cooldown.items.find(
					(item) => item.key?.value === "default-days",
				);

				if (!defaultDaysPair?.value) {
					context.report({
						data: {
							ecosystem: ecosystemName,
						},
						fix(fixer) {
							// Check if there are existing items in cooldown
							if (cooldown.items && cooldown.items.length > 0) {
								// Insert after the last existing item in cooldown
								const lastItem = cooldown.items[cooldown.items.length - 1];
								if (!lastItem.range) {
									return null;
								}

								const indent = "      "; // 6 spaces for properties under cooldown
								const defaultDaysText = `\n${indent}default-days: 7`;

								return fixer.insertTextAfterRange(
									lastItem.range,
									defaultDaysText,
								);
							} else {
								// If cooldown is empty, insert after the cooldown key
								if (!cooldownPair.range) {
									return null;
								}

								const indent = "      "; // 6 spaces for properties under cooldown
								const defaultDaysText = `\n${indent}default-days: 7`;

								return fixer.insertTextAfterRange(
									cooldownPair.range,
									defaultDaysText,
								);
							}
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
