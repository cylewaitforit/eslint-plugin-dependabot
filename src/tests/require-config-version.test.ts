import { yaml } from "eslint-yaml";
import fs from "fs";
import path from "path";
import { describe, it } from "vitest";

import { requireConfigVersionRule } from "../rules/require-config-version.js";
import { YAMLRuleTester } from "./utils/yaml-rule-tester.js";

const ruleTester = new YAMLRuleTester({
	plugins: {
		yaml,
	},
});

/**
 * Helper function to read a fixture file.
 */
function readFixture(fixturePath: string): string {
	return fs.readFileSync(
		path.join(
			import.meta.dirname,
			"_fixtures_/require-config-version",
			fixturePath,
		),
		"utf8",
	);
}

describe("require-config-version", () => {
	// eslint-disable-next-line vitest/expect-expect -- RuleTester.run contains assertions
	it("should validate config version with default (version 2)", () => {
		ruleTester.run("require-config-version", requireConfigVersionRule, {
			valid: [
				{
					code: readFixture("valid-simple/dependabot.yaml"),
					filename: "dependabot.yaml",
					language: "yaml/yaml",
				},
				{
					code: readFixture("valid-version-string/dependabot.yaml"),
					filename: "dependabot.yaml",
					language: "yaml/yaml",
				},
			],
			// eslint-disable-next-line perfectionist/sort-objects -- Valid cases should come before invalid for readability
			invalid: [
				{
					code: readFixture("invalid-missing-version/dependabot.yaml"),
					errors: [
						{
							messageId: "missingVersion",
						},
					],
					filename: "dependabot.yaml",
					language: "yaml/yaml",
					output: readFixture("invalid-missing-version/output.yaml"),
				},
				{
					code: readFixture("invalid-wrong-version/dependabot.yaml"),
					errors: [
						{
							messageId: "incorrectVersion",
						},
					],
					filename: "dependabot.yaml",
					language: "yaml/yaml",
					output: readFixture("invalid-wrong-version/output.yaml"),
				},
			],
		});
	});

	// eslint-disable-next-line vitest/expect-expect -- RuleTester.run contains assertions
	it("should validate config version with custom version (version 3)", () => {
		ruleTester.run("require-config-version", requireConfigVersionRule, {
			valid: [
				{
					code: readFixture("valid-version-3/dependabot.yaml"),
					filename: "dependabot.yaml",
					language: "yaml/yaml",
					options: [{ version: 3 }],
				},
			],
			// eslint-disable-next-line perfectionist/sort-objects -- Valid cases should come before invalid for readability
			invalid: [
				{
					code: readFixture("valid-simple/dependabot.yaml"),
					errors: [
						{
							messageId: "incorrectVersion",
						},
					],
					filename: "dependabot.yaml",
					language: "yaml/yaml",
					options: [{ version: 3 }],
					output: readFixture("valid-simple/output-v3.yaml"),
				},
				{
					code: readFixture("invalid-missing-version-v3/dependabot.yaml"),
					errors: [
						{
							messageId: "missingVersion",
						},
					],
					filename: "dependabot.yaml",
					language: "yaml/yaml",
					options: [{ version: 3 }],
					output: readFixture("invalid-missing-version-v3/output.yaml"),
				},
			],
		});
	});
});
