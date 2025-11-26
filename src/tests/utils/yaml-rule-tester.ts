import { RuleTester } from "eslint";

/**
 * Minimal wrapper around ESLint's RuleTester to support language plugins.
 * @example
 * ```ts
 * const ruleTester = new YAMLRuleTester({
 *   plugins: { yaml },
 * });
 *
 * ruleTester.run("my-rule", rule, {
 *   valid: [{
 *     code: "version: 2",
 *     language: "yaml/yaml",
 *   }],
 *   invalid: [],
 * });
 * ```
 */
export class YAMLRuleTester extends RuleTester {
	/**
	 * Constructor that accepts any plugin type.
	 * ESLint's RuleTester types are strict, but language plugins may not match perfectly.
	 */
	constructor(options: Record<string, unknown>) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
		super(options as any);
	}
}
