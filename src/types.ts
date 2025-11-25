/**
 * Types for YAML rules in ESLint.
 * Based on eslint-yaml and @eslint/core's type patterns
 */

import type { RulesMeta, RuleVisitor } from "@eslint/core";
import type {
	Alias,
	CST,
	Document,
	Node,
	Pair,
	Scalar,
	YAMLMap,
	YAMLSeq,
} from "yaml";

/**
 * Root node representing the entire YAML document structure.
 */
export interface Root {
	contents: Document[];
	tokens: CST.Token[];
	type: "root";
}

/**
 * All possible YAML node types.
 */
export type NodeLike = Document | Node | Pair;

/**
 * YAML Rule visitor with handlers for each YAML node type.
 * Extends RuleVisitor to be compatible with ESLint's plugin system.
 */
export interface YAMLRuleVisitor extends RuleVisitor {
	Alias?(node: Alias, parent?: NodeLike): void;
	Document?(node: Document, parent?: NodeLike): void;
	Map?(node: YAMLMap, parent?: NodeLike): void;
	Pair?(node: Pair, parent?: NodeLike): void;
	Root?(node: Root): void;
	Scalar?(node: Scalar, parent?: NodeLike): void;
	Seq?(node: YAMLSeq, parent?: NodeLike): void;
}

/**
 * Rule context object passed to rule create function.
 * This is the minimal interface needed for YAML rules.
 */
export interface YAMLRuleContext<MessageIds extends string = string> {
	/**
	 * The rule options passed from the configuration.
	 */
	options: unknown[];

	/**
	 * Reports a violation found by the rule.
	 * @param violation The violation report with node, messageId, and optional data.
	 */
	report: (violation: {
		/**
		 * The YAML node where the violation occurred.
		 */
		node: NodeLike;

		/**
		 * The message ID for the violation.
		 */
		messageId: MessageIds;

		/**
		 * Data to interpolate into the message.
		 */
		data?: Record<string, string>;
	}) => void;

	/**
	 * The source code information.
	 */
	sourceCode: {
		/**
		 * The parsed YAML document.
		 */
		ast: Document;

		/**
		 * The original source text.
		 */
		text: string;
	};
}

/**
 * Rule definition for YAML rules.
 * Creates a type-safe pattern similar to @eslint/core's CustomRuleDefinitionType
 * but adapted for YAML rules which don't require full SourceCode interface.
 */
export interface YAMLRuleDefinition<
	MessageIds extends string = string,
	RuleOptions extends unknown[] = unknown[],
> {
	/**
	 * The meta information for the rule.
	 */
	meta?: RulesMeta<MessageIds, RuleOptions, Record<string, unknown>>;

	/**
	 * Creates the visitor that ESLint uses to apply the rule during traversal.
	 * @param context The rule context.
	 * @returns The rule visitor.
	 */
	create(context: YAMLRuleContext<MessageIds>): YAMLRuleVisitor;
}
