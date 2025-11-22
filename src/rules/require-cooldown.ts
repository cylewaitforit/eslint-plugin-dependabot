import type { Rule } from "eslint";
import type { Pair, YAMLMap } from "yaml";

const requireCooldown = {
create(context) {
return {
// Visit all Map nodes (YAML objects)
Map(node: YAMLMap) {
// Check if this Map is an update entry
// It should have package-ecosystem but may be missing cooldown
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- items can be undefined in practice
const packageEcosystemPair = node.items?.find(
(item: Pair) =>
item.key &&
"value" in item.key &&
item.key.value === "package-ecosystem",
);

// If this node doesn't have package-ecosystem, it's not an update entry
if (!packageEcosystemPair) {
return;
}

const ecosystemValue = packageEcosystemPair.value;
const ecosystemName =
ecosystemValue && "value" in ecosystemValue
? String(ecosystemValue.value)
: "unknown";

// Check for cooldown
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- items can be undefined in practice
const cooldownPair = node.items?.find(
(item: Pair) =>
item.key && "value" in item.key && item.key.value === "cooldown",
);

if (!cooldownPair?.value) {
context.report({
data: {
ecosystem: ecosystemName,
},
messageId: "missingCooldown",
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment -- ESLint node type is not fully typed for YAML
node: node as any,
});
return;
}

const cooldownValue = cooldownPair.value;

// Check if cooldown is a scalar (e.g., cooldown: 5)
if (
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- runtime safety check
cooldownValue &&
"value" in cooldownValue &&
typeof cooldownValue.value === "number"
) {
// Scalar value - we need to convert it to a map with default-days
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

// Check if cooldown is a Map
if (
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- runtime safety check
!cooldownValue ||
!("items" in cooldownValue) ||
!cooldownValue.items
) {
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

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call -- YAML items type is not fully typed
const defaultDaysPair = cooldownValue.items.find(
(item: Pair) =>
item.key &&
"value" in item.key &&
item.key.value === "default-days",
);

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- YAML value types are not fully typed
if (!defaultDaysPair?.value) {
context.report({
data: {
ecosystem: ecosystemName,
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
