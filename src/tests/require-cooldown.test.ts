import { RuleTester } from "eslint";
import { yaml } from "eslint-yaml";
import fs from "fs";
import path from "path";
import { describe, it } from "vitest";

import { requireCooldown } from "../rules/require-cooldown.js";

const ruleTester = new RuleTester({
	plugins: {
		// @ts-expect-error -- ESLint types don't fully support language plugins yet
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
	// eslint-disable-next-line vitest/expect-expect -- RuleTester.run contains assertions
	it("should pass valid cases", () => {
		ruleTester.run("require-cooldown", requireCooldown, {
			valid: [
				{
					code: readFixture("valid-simple/dependabot.yaml"),
					filename: "dependabot.yaml",
					// @ts-expect-error -- ESLint types don't include language option yet
					language: "yaml/yaml",
				},
				{
					code: readFixture("valid-with-all-options/dependabot.yaml"),
					filename: "dependabot.yaml",
					// @ts-expect-error -- ESLint types don't include language option yet
					language: "yaml/yaml",
				},
				{
					code: readFixture("valid-multiple-ecosystems/dependabot.yaml"),
					filename: "dependabot.yaml",
					// @ts-expect-error -- ESLint types don't include language option yet
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
					// @ts-expect-error -- ESLint types don't include language option yet
					language: "yaml/yaml",
					output: readFixture("invalid-no-cooldown/dependabot.fixed.yaml"),
				},
				{
					code: readFixture("invalid-missing-default-days/dependabot.yaml"),
					errors: [
						{
							messageId: "missingDefaultDays",
						},
					],
					filename: "dependabot.yaml",
					// @ts-expect-error -- ESLint types don't include language option yet
					language: "yaml/yaml",
					output: readFixture(
						"invalid-missing-default-days/dependabot.fixed.yaml",
					),
				},
				{
					code: readFixture("invalid-one-missing-cooldown/dependabot.yaml"),
					errors: [
						{
							messageId: "missingCooldown",
						},
					],
					filename: "dependabot.yaml",
					// @ts-expect-error -- ESLint types don't include language option yet
					language: "yaml/yaml",
					output: readFixture(
						"invalid-one-missing-cooldown/dependabot.fixed.yaml",
					),
				},
				{
					code: readFixture("invalid-empty-cooldown/dependabot.yaml"),
					errors: [
						{
							messageId: "missingDefaultDays",
						},
					],
					filename: "dependabot.yaml",
					// @ts-expect-error -- ESLint types don't include language option yet
					language: "yaml/yaml",
					output: readFixture("invalid-empty-cooldown/dependabot.fixed.yaml"),
				},
				{
					code: readFixture("invalid-cooldown-scalar/dependabot.yaml"),
					errors: [
						{
							messageId: "missingDefaultDays",
						},
					],
					filename: "dependabot.yaml",
					// @ts-expect-error -- ESLint types don't include language option yet
					language: "yaml/yaml",
					output: readFixture("invalid-cooldown-scalar/dependabot.fixed.yaml"),
				},
			],
		});
	});
});
