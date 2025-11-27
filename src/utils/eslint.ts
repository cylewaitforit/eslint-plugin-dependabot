/**
 * Utility functions for bridging YAML AST nodes with ESLint's type system.
 */

import type { Rule } from "eslint";
import type { Node, Pair } from "yaml";

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
 * @param node A YAML AST node (Pair, Scalar, YAMLMap, etc.)
 * @returns The same node typed as Rule.Node for ESLint's context.report()
 */
export function yamlNodeToRuleNode(node: YAMLReportableNode): Rule.Node {
	return node as Rule.Node;
}
