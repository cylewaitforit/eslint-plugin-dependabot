import { yaml } from "eslint-yaml";
import fs from "fs";
import path from "path";
import { describe, it } from "vitest";

import { requireCooldownRule } from "../rules/require-cooldown.js";
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
		path.join(import.meta.dirname, "_fixtures_/require-cooldown", fixturePath),
		"utf8",
	);
}

describe("require-cooldown", () => {
	it("should validate cooldown configurations", () => {
		ruleTester.run("require-cooldown", requireCooldownRule, {
			valid: [
				{
					code: readFixture("valid-simple/dependabot.yaml"),
					filename: "dependabot.yaml",
					language: "yaml/yaml",
				},
				{
					code: readFixture("valid-with-all-options/dependabot.yaml"),
					filename: "dependabot.yaml",
					language: "yaml/yaml",
				},
				{
					code: readFixture("valid-multiple-ecosystems/dependabot.yaml"),
					filename: "dependabot.yaml",
					language: "yaml/yaml",
				},
				{
					code: readFixture("valid-with-comments/dependabot.yaml"),
					filename: "dependabot.yaml",
					language: "yaml/yaml",
				},
			],
			// eslint-disable-next-line perfectionist/sort-objects -- Valid cases should come before invalid for readability
			invalid: [
				{
					code: readFixture("invalid-no-cooldown/dependabot.yaml"),
					errors: [
						{
							messageId: "missingCooldown",
						},
					],
					filename: "dependabot.yaml",
					language: "yaml/yaml",
					output: readFixture("invalid-no-cooldown/output.yaml"),
				},
				{
					code: readFixture("invalid-missing-default-days/dependabot.yaml"),
					errors: [
						{
							messageId: "missingDefaultDays",
						},
					],
					filename: "dependabot.yaml",
					language: "yaml/yaml",
					output: readFixture("invalid-missing-default-days/output.yaml"),
				},
				{
					code: readFixture("invalid-one-missing-cooldown/dependabot.yaml"),
					errors: [
						{
							messageId: "missingCooldown",
						},
					],
					filename: "dependabot.yaml",
					language: "yaml/yaml",
					output: readFixture("invalid-one-missing-cooldown/output.yaml"),
				},
				{
					code: readFixture("invalid-empty-cooldown/dependabot.yaml"),
					errors: [
						{
							messageId: "missingDefaultDays",
						},
					],
					filename: "dependabot.yaml",
					language: "yaml/yaml",
					output: readFixture("invalid-empty-cooldown/output.yaml"),
				},
				{
					code: readFixture("invalid-cooldown-scalar/dependabot.yaml"),
					errors: [
						{
							messageId: "missingDefaultDays",
						},
					],
					filename: "dependabot.yaml",
					language: "yaml/yaml",
					output: readFixture("invalid-cooldown-scalar/output.yaml"),
				},
				{
					code: readFixture("invalid-with-inline-comment/dependabot.yaml"),
					errors: [
						{
							messageId: "missingCooldown",
						},
					],
					filename: "dependabot.yaml",
					language: "yaml/yaml",
					output: readFixture("invalid-with-inline-comment/output.yaml"),
				},
			],
		});
	});
});
