/**
 * Utility functions for working with YAML AST nodes in ESLint rules.
 */

import type { Rule } from "eslint";
import type { Node, Pair, Scalar, YAMLMap } from "yaml";

import { isMap, isScalar } from "yaml";

/**
 * Union of YAML AST types that can be reported to ESLint.
 * Both `Node` (Scalar, YAMLMap, YAMLSeq, Alias) and `Pair` have range information
 * that ESLint uses for error location reporting.
 */
type YAMLReportableNode = Node | Pair;

/**
 * Casts a YAML node to an ESLint Rule.Node for use in `context.report()`.
 * @remarks
 * This type assertion is used because eslint-yaml's language plugin uses
 * the `yaml` package's AST nodes directly. These nodes have `range` and
 * position information that ESLint's reporting mechanism expects.
 *
 * The type mismatch exists because:
 * 1. ESLint's `Rule.Node` is typed for JavaScript/TypeScript ESTree nodes
 * 2. eslint-yaml declares its node type as `yaml.Node` (see `YAMLLanguage`)
 * 3. There's no shared interface between them, despite structural compatibility
 *
 * The yaml package's nodes include `range: [number, number, number]` which ESLint
 * uses for error location reporting. This cast is validated by our test
 * suite which verifies errors are reported at correct locations.
 * @see https://github.com/43081j/eslint-yaml/blob/main/src/language.ts
 * @param node A YAML AST node (Pair, Scalar, YAMLMap, etc.)
 * @returns The same node typed as Rule.Node for ESLint's context.report()
 */
export function yamlNodeToRuleNode(node: YAMLReportableNode): Rule.Node {
	return node as unknown as Rule.Node;
}

/** A YAML pair with a scalar string key. */
export type ScalarKeyPair = Pair<Scalar<string>>;

/**
 * Type guard to check if a pair has a scalar string key matching the given name.
 */
function isScalarKeyPair(pair: Pair, keyName: string): pair is ScalarKeyPair {
	return isScalar(pair.key) && pair.key.value === keyName;
}

/**
 * Finds a pair in a YAML map by key name.
 * Returns the pair if found, undefined otherwise.
 * @param mapNode The YAML map to search
 * @param keyName The key name to find
 * @returns The pair with a scalar string key matching keyName, or undefined
 */
export function findPairByKey(
	mapNode: YAMLMap,
	keyName: string,
): ScalarKeyPair | undefined {
	return mapNode.items.find((item): item is ScalarKeyPair =>
		isScalarKeyPair(item, keyName),
	);
}

/**
 * Gets the string value from a scalar YAML node.
 * Returns the string value if the node is a scalar string, undefined otherwise.
 */
export function getScalarStringValue(node: unknown): string | undefined {
	if (isScalar(node) && typeof node.value === "string") {
		return node.value;
	}
	return undefined;
}

/**
 * Creates a Map visitor that only processes the root YAML map node once.
 * @remarks
 * eslint-yaml visits all Map nodes in the document, but Dependabot rules
 * typically only need to inspect the root document map. This utility ensures
 * the callback is only invoked for the first (root) Map node encountered.
 *
 * The Document selector is defined in visitorKeys but ESLint traversal
 * starts from the document's contents, so Document is not visited directly.
 * @param callback Function to call with the root YAMLMap node
 * @returns An object with a Map visitor suitable for use in a rule's create() return value
 */
export function createRootMapVisitor(callback: (rootMap: YAMLMap) => void): {
	Map: (node: Rule.Node) => void;
} {
	let hasCheckedRoot = false;

	return {
		Map(node: Rule.Node) {
			if (hasCheckedRoot) {
				return;
			}
			hasCheckedRoot = true;

			if (!isMap(node)) {
				return;
			}

			callback(node as unknown as YAMLMap);
		},
	};
}
