/**
 * Utility functions for working with YAML AST nodes in ESLint rules.
 */

import type { Rule } from "eslint";
import type { AST } from "yaml-eslint-parser";

/**
 * Union of YAML AST types that can be reported to ESLint.
 * Both `YAMLContent` nodes and `YAMLPair` have range information
 * that ESLint uses for error location reporting.
 */
type YAMLReportableNode = AST.YAMLContent | AST.YAMLPair;

/**
 * Casts a YAML node to an ESLint Rule.Node for use in `context.report()`.
 * @remarks
 * This type assertion is used because eslint-plugin-yml's language plugin uses
 * yaml-eslint-parser's AST nodes directly. These nodes have `range` and
 * position information that ESLint's reporting mechanism expects.
 *
 * The type mismatch exists because:
 * 1. ESLint's `Rule.Node` is typed for JavaScript/TypeScript ESTree nodes
 * 2. eslint-plugin-yml declares its node type as yaml-eslint-parser's AST nodes
 * 3. There's no shared interface between them, despite structural compatibility
 *
 * The yaml-eslint-parser nodes include `range: [number, number]` which ESLint
 * uses for error location reporting. This cast is validated by our test
 * suite which verifies errors are reported at correct locations.
 * @see https://github.com/ota-meshi/eslint-plugin-yml#languages
 * @param node A YAML AST node (YAMLPair, YAMLScalar, YAMLMapping, etc.)
 * @returns The same node typed as Rule.Node for ESLint's context.report()
 */
export function yamlNodeToRuleNode(node: YAMLReportableNode): Rule.Node {
	return node as unknown as Rule.Node;
}

/** A YAML pair with a scalar string key. */
export type ScalarKeyPair = AST.YAMLPair & {
	key: AST.YAMLScalar & { value: string };
};

/**
 * Type guard to check if a pair has a scalar string key matching the given name.
 */
function isScalarKeyPair(
	pair: AST.YAMLPair,
	keyName: string,
): pair is ScalarKeyPair {
	return (
		pair.key !== null &&
		pair.key.type === "YAMLScalar" &&
		typeof pair.key.value === "string" &&
		pair.key.value === keyName
	);
}

/**
 * Finds a pair in a YAML mapping by key name.
 * Returns the pair if found, undefined otherwise.
 * @param mappingNode The YAML mapping to search
 * @param keyName The key name to find
 * @returns The pair with a scalar string key matching keyName, or undefined
 */
export function findPairByKey(
	mappingNode: AST.YAMLMapping,
	keyName: string,
): ScalarKeyPair | undefined {
	return mappingNode.pairs.find((item): item is ScalarKeyPair =>
		isScalarKeyPair(item, keyName),
	);
}

/**
 * Gets the string value from a scalar YAML node.
 * Returns the string value if the node is a scalar string, undefined otherwise.
 */
export function getScalarStringValue(node: unknown): string | undefined {
	if (
		node !== null &&
		typeof node === "object" &&
		"type" in node &&
		node.type === "YAMLScalar" &&
		"value" in node &&
		typeof node.value === "string"
	) {
		return node.value;
	}
	return undefined;
}

/**
 * Creates a YAMLMapping visitor that only processes the root YAML mapping node once.
 * @remarks
 * eslint-plugin-yml visits all YAMLMapping nodes in the document, but Dependabot rules
 * typically only need to inspect the root document mapping. This utility ensures
 * the callback is only invoked for the first (root) YAMLMapping node encountered.
 * @param callback Function to call with the root YAMLMapping node
 * @returns An object with a YAMLMapping visitor suitable for use in a rule's create() return value
 */
export function createRootMapVisitor(
	callback: (rootMap: AST.YAMLMapping) => void,
): {
	YAMLMapping: (node: Rule.Node) => void;
} {
	let hasCheckedRoot = false;

	return {
		YAMLMapping(node: Rule.Node) {
			if (hasCheckedRoot) {
				return;
			}
			hasCheckedRoot = true;

			callback(node as unknown as AST.YAMLMapping);
		},
	};
}
