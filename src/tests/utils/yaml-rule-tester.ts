import type { RuleTester as RuleTesterType } from "eslint";

import { RuleTester as ESLintRuleTester } from "eslint";

import type { YAMLRuleDefinition } from "../../types.js";

/**
 * Options for YAMLRuleTester constructor.
 * Extends ESLint RuleTester options to accept any plugin type,
 * since eslint-yaml plugin types are incompatible with @eslint/core types.
 */
interface YAMLRuleTesterOptions {
	env?: Record<string, unknown>;
	globals?: Record<string, unknown>;
	parserOptions?: Record<string, unknown>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- plugin types are incompatible between packages
	plugins?: Record<string, any>;
}

/**
 * Extended RuleTester that properly types language plugin support.
 * ESLint's RuleTester types don't fully support language plugins yet,
 * so we extend it to provide proper typing for YAML test cases.
 */
export class YAMLRuleTester extends ESLintRuleTester {
	/**
	 * Constructor that accepts plugin types without requiring `as any` cast.
	 */
	constructor(options: YAMLRuleTesterOptions) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument -- ESLint types don't fully support language plugins
		super(options as any);
	}

	/**
	 * Override the run method to support language option in test cases.
	 * This allows us to specify `language: "yaml/yaml"` without TypeScript errors.
	 */
	run(
		name: string,
		rule: YAMLRuleDefinition,
		tests: {
			invalid: (Parameters<RuleTesterType["run"]>[2]["invalid"][number] & {
				language?: string;
			})[];
			valid: (Parameters<RuleTesterType["run"]>[2]["valid"][number] & {
				language?: string;
			})[];
		},
	): void;
	run(
		name: string,
		rule: Parameters<RuleTesterType["run"]>[1],
		tests: Parameters<RuleTesterType["run"]>[2],
	): void;
	run(
		name: string,
		rule: Parameters<RuleTesterType["run"]>[1] | YAMLRuleDefinition,
		tests: Parameters<RuleTesterType["run"]>[2],
	): void {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument -- ESLint types don't fully support language plugins
		super.run(name, rule as any, tests as any);
	}
}
