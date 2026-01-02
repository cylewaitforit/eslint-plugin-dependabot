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

	// eslint-disable-next-line vitest/expect-expect -- RuleTester.run contains assertions
	it("should validate package-ecosystem configurations with npm", () => {
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

	// eslint-disable-next-line vitest/expect-expect -- RuleTester.run contains assertions
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

	// eslint-disable-next-line vitest/expect-expect -- RuleTester.run contains assertions
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

	// eslint-disable-next-line vitest/expect-expect -- RuleTester.run contains assertions
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

	// eslint-disable-next-line vitest/expect-expect -- RuleTester.run contains assertions
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
});
