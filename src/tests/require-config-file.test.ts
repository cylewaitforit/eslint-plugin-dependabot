import { RuleTester } from "eslint";
import fs from "fs";
import path from "path";
import { afterEach, beforeEach, describe, it } from "vitest";

import { requireConfigFileRule } from "../rules/require-config-file.js";

const ruleTester = new RuleTester();

describe("require-config-file", () => {
	let tempDir: string;

	beforeEach(() => {
		// Create a temporary directory for each test
		tempDir = path.join(
			import.meta.dirname,
			`_fixtures_/require-config-file-temp-${String(Date.now())}`,
		);
		fs.mkdirSync(tempDir, { recursive: true });
	});

	afterEach(() => {
		// Clean up temporary directory after each test
		if (fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { force: true, recursive: true });
		}
	});

	// eslint-disable-next-line vitest/expect-expect -- RuleTester.run contains assertions
	it("should report error when dependabot config file is missing", () => {
		const packageJsonPath = path.join(tempDir, "package.json");
		fs.writeFileSync(packageJsonPath, '{"name": "test"}', "utf-8");

		ruleTester.run("require-config-file", requireConfigFileRule, {
			valid: [],
			// eslint-disable-next-line perfectionist/sort-objects -- Valid cases should come before invalid for readability
			invalid: [
				{
					code: "var x = 1;",
					errors: [
						{
							messageId: "missingConfigFile",
						},
					],
					filename: packageJsonPath,
				},
			],
		});
	});

	// eslint-disable-next-line vitest/expect-expect -- RuleTester.run contains assertions
	it("should not report error when dependabot.yaml exists", () => {
		const packageJsonPath = path.join(tempDir, "package.json");
		const githubDir = path.join(tempDir, ".github");
		const dependabotPath = path.join(githubDir, "dependabot.yaml");

		fs.mkdirSync(githubDir, { recursive: true });
		fs.writeFileSync(packageJsonPath, '{"name": "test"}', "utf-8");
		fs.writeFileSync(dependabotPath, "version: 2\n", "utf-8");

		ruleTester.run("require-config-file", requireConfigFileRule, {
			valid: [
				{
					code: "var x = 1;",
					filename: packageJsonPath,
				},
			],
			// eslint-disable-next-line perfectionist/sort-objects -- Valid cases should come before invalid for readability
			invalid: [],
		});
	});

	// eslint-disable-next-line vitest/expect-expect -- RuleTester.run contains assertions
	it("should not report error when dependabot.yml exists", () => {
		const packageJsonPath = path.join(tempDir, "package.json");
		const githubDir = path.join(tempDir, ".github");
		const dependabotPath = path.join(githubDir, "dependabot.yml");

		fs.mkdirSync(githubDir, { recursive: true });
		fs.writeFileSync(packageJsonPath, '{"name": "test"}', "utf-8");
		fs.writeFileSync(dependabotPath, "version: 2\n", "utf-8");

		ruleTester.run("require-config-file", requireConfigFileRule, {
			valid: [
				{
					code: "var x = 1;",
					filename: packageJsonPath,
				},
			],
			// eslint-disable-next-line perfectionist/sort-objects -- Valid cases should come before invalid for readability
			invalid: [],
		});
	});
});
