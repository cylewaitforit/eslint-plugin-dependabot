import { yaml } from "eslint-yaml";
import fs from "fs";
import path from "path";
import { describe, it } from "vitest";

import { requirePackageEcosystemRule } from "../rules/require-package-ecosystem.js";
import { YAMLRuleTester } from "./utils/yaml-rule-tester.js";

/**
 * Helper function to read a fixture file.
 */
function readFixture(fixturePath: string): string {
	return fs.readFileSync(
		path.join(
			import.meta.dirname,
			"_fixtures_/require-package-ecosystem",
			fixturePath,
		),
		"utf8",
	);
}

/**
 * Helper function to get the fixture directory path for cwd.
 */
function getFixtureCwd(fixtureName: string): string {
	return path.join(
		import.meta.dirname,
		"_fixtures_/require-package-ecosystem",
		fixtureName,
	);
}

describe("require-package-ecosystem", () => {
	const ruleTester = new YAMLRuleTester({
		plugins: {
			yaml,
		},
	});

	it("should pass when npm ecosystem is configured and package.json exists", () => {
		ruleTester.run("require-package-ecosystem", requirePackageEcosystemRule, {
			invalid: [],
			valid: [
				{
					code: readFixture("valid-with-npm/dependabot.yaml"),
					filename: "dependabot.yaml",
					language: "yaml/yaml",
					options: [{ checkDirectory: getFixtureCwd("valid-with-npm") }],
				},
			],
		});
	});

	it("should validate no error when package.json does not exist", () => {
		ruleTester.run("require-package-ecosystem", requirePackageEcosystemRule, {
			invalid: [],
			valid: [
				{
					code: readFixture("valid-no-package-json/dependabot.yaml"),
					filename: "dependabot.yaml",
					language: "yaml/yaml",
					options: [{ checkDirectory: getFixtureCwd("valid-no-package-json") }],
				},
			],
		});
	});

	it("should error when npm ecosystem is missing", () => {
		ruleTester.run("require-package-ecosystem", requirePackageEcosystemRule, {
			invalid: [
				{
					code: readFixture("invalid-missing-npm/dependabot.yaml"),
					errors: [
						{
							messageId: "missingNpmEcosystem",
						},
					],
					filename: "dependabot.yaml",
					language: "yaml/yaml",
					options: [{ checkDirectory: getFixtureCwd("invalid-missing-npm") }],
					output: readFixture("invalid-missing-npm/output.yaml"),
				},
			],
			valid: [],
		});
	});

	it("should error when updates array is missing", () => {
		ruleTester.run("require-package-ecosystem", requirePackageEcosystemRule, {
			invalid: [
				{
					code: readFixture("invalid-no-updates/dependabot.yaml"),
					errors: [
						{
							messageId: "missingNpmEcosystem",
						},
					],
					filename: "dependabot.yaml",
					language: "yaml/yaml",
					options: [{ checkDirectory: getFixtureCwd("invalid-no-updates") }],
					output: readFixture("invalid-no-updates/output.yaml"),
				},
			],
			valid: [],
		});
	});

	it("should not error when npm is in disabledEcosystems", () => {
		ruleTester.run("require-package-ecosystem", requirePackageEcosystemRule, {
			invalid: [],
			valid: [
				{
					code: readFixture("invalid-missing-npm/dependabot.yaml"),
					filename: "dependabot.yaml",
					language: "yaml/yaml",
					options: [
						{
							checkDirectory: getFixtureCwd("invalid-missing-npm"),
							disabledEcosystems: ["npm"],
						},
					],
				},
			],
		});
	});

	it("should pass when github-actions ecosystem is configured and workflows exist", () => {
		ruleTester.run("require-package-ecosystem", requirePackageEcosystemRule, {
			invalid: [],
			valid: [
				{
					code: readFixture("valid-with-github-actions/dependabot.yaml"),
					filename: "dependabot.yaml",
					language: "yaml/yaml",
					options: [
						{ checkDirectory: getFixtureCwd("valid-with-github-actions") },
					],
				},
			],
		});
	});

	it("should validate no error when .github/workflows directory does not exist", () => {
		ruleTester.run("require-package-ecosystem", requirePackageEcosystemRule, {
			invalid: [],
			valid: [
				{
					code: readFixture("valid-no-workflows-directory/dependabot.yaml"),
					filename: "dependabot.yaml",
					language: "yaml/yaml",
					options: [
						{ checkDirectory: getFixtureCwd("valid-no-workflows-directory") },
					],
				},
			],
		});
	});

	it("should error when github-actions ecosystem is missing", () => {
		ruleTester.run("require-package-ecosystem", requirePackageEcosystemRule, {
			invalid: [
				{
					code: readFixture("invalid-missing-github-actions/dependabot.yaml"),
					errors: [
						{
							messageId: "missingGithubActionsEcosystem",
						},
					],
					filename: "dependabot.yaml",
					language: "yaml/yaml",
					options: [
						{
							checkDirectory: getFixtureCwd("invalid-missing-github-actions"),
						},
					],
					output: readFixture("invalid-missing-github-actions/output.yaml"),
				},
			],
			valid: [],
		});
	});

	it("should not error when github-actions is in disabledEcosystems", () => {
		ruleTester.run("require-package-ecosystem", requirePackageEcosystemRule, {
			invalid: [],
			valid: [
				{
					code: readFixture("invalid-missing-github-actions/dependabot.yaml"),
					filename: "dependabot.yaml",
					language: "yaml/yaml",
					options: [
						{
							checkDirectory: getFixtureCwd("invalid-missing-github-actions"),
							disabledEcosystems: ["github-actions"],
						},
					],
				},
			],
		});
	});
});
