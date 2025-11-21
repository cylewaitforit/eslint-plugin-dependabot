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
			invalid: [
				{
					code: fs.readFileSync(
						path.join(
							import.meta.dirname,
							"fixtures/require-cooldown/invalid-no-cooldown.yaml",
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
							"fixtures/require-cooldown/invalid-missing-default-days.yaml",
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
							"fixtures/require-cooldown/invalid-one-missing-cooldown.yaml",
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
							"fixtures/require-cooldown/invalid-empty-cooldown.yaml",
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
			valid: [
				{
					code: fs.readFileSync(
						path.join(
							import.meta.dirname,
							"fixtures/require-cooldown/valid-simple.yaml",
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
							"fixtures/require-cooldown/valid-with-all-options.yaml",
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
							"fixtures/require-cooldown/valid-multiple-ecosystems.yaml",
						),
						"utf8",
					),
					filename: "dependabot.yaml",
					// @ts-expect-error -- ESLint types don't include language option yet
					language: "yaml/yaml",
				},
			],
		});
	});
});
