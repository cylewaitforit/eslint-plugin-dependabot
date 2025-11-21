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

describe("require-cooldown", () => {
	// eslint-disable-next-line vitest/expect-expect -- RuleTester.run contains assertions
	it("should pass valid cases", () => {
		ruleTester.run("require-cooldown", requireCooldown, {
			valid: [
				{
					code: fs.readFileSync(
						path.join(
							import.meta.dirname,
							"_fixtures_/require-cooldown/valid-simple/dependabot.yaml",
						),
						"utf8",
					),
					filename: "dependabot.yaml",
					// @ts-expect-error -- ESLint types don't include language option yet
					language: "yaml/yaml",
				},
				{
					code: fs.readFileSync(
						path.join(
							import.meta.dirname,
							"_fixtures_/require-cooldown/valid-with-all-options/dependabot.yaml",
						),
						"utf8",
					),
					filename: "dependabot.yaml",
					// @ts-expect-error -- ESLint types don't include language option yet
					language: "yaml/yaml",
				},
				{
					code: fs.readFileSync(
						path.join(
							import.meta.dirname,
							"_fixtures_/require-cooldown/valid-multiple-ecosystems/dependabot.yaml",
						),
						"utf8",
					),
					filename: "dependabot.yaml",
					// @ts-expect-error -- ESLint types don't include language option yet
					language: "yaml/yaml",
				},
			],
			// eslint-disable-next-line perfectionist/sort-objects -- Valid cases should come before invalid for readability
			invalid: [
				{
					code: fs.readFileSync(
						path.join(
							import.meta.dirname,
							"_fixtures_/require-cooldown/invalid-no-cooldown/dependabot.yaml",
						),
						"utf8",
					),
					errors: [
						{
							messageId: "missingCooldown",
						},
					],
					filename: "dependabot.yaml",
					// @ts-expect-error -- ESLint types don't include language option yet
					language: "yaml/yaml",
				},
				{
					code: fs.readFileSync(
						path.join(
							import.meta.dirname,
							"_fixtures_/require-cooldown/invalid-missing-default-days/dependabot.yaml",
						),
						"utf8",
					),
					errors: [
						{
							messageId: "missingDefaultDays",
						},
					],
					filename: "dependabot.yaml",
					// @ts-expect-error -- ESLint types don't include language option yet
					language: "yaml/yaml",
				},
				{
					code: fs.readFileSync(
						path.join(
							import.meta.dirname,
							"_fixtures_/require-cooldown/invalid-one-missing-cooldown/dependabot.yaml",
						),
						"utf8",
					),
					errors: [
						{
							messageId: "missingCooldown",
						},
					],
					filename: "dependabot.yaml",
					// @ts-expect-error -- ESLint types don't include language option yet
					language: "yaml/yaml",
				},
				{
					code: fs.readFileSync(
						path.join(
							import.meta.dirname,
							"_fixtures_/require-cooldown/invalid-empty-cooldown/dependabot.yaml",
						),
						"utf8",
					),
					errors: [
						{
							messageId: "missingDefaultDays",
						},
					],
					filename: "dependabot.yaml",
					// @ts-expect-error -- ESLint types don't include language option yet
					language: "yaml/yaml",
				},
				{
					code: fs.readFileSync(
						path.join(
							import.meta.dirname,
							"_fixtures_/require-cooldown/invalid-cooldown-scalar/dependabot.yaml",
						),
						"utf8",
					),
					errors: [
						{
							messageId: "missingDefaultDays",
						},
					],
					filename: "dependabot.yaml",
					// @ts-expect-error -- ESLint types don't include language option yet
					language: "yaml/yaml",
				},
			],
		});
	});
});
