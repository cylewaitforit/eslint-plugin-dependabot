import type { Rule } from "eslint";

import fs from "node:fs";
import path from "node:path";

/**
 * Finds the .github directory by traversing up from the current file.
 */
function findGithubDirectory(sourceFile: string): string | undefined {
	let current = path.dirname(sourceFile);
	const root = path.parse(current).root;

	while (current !== root) {
		const githubDir = path.join(current, ".github");
		if (fs.existsSync(githubDir) && fs.statSync(githubDir).isDirectory()) {
			return githubDir;
		}

		// Also check if we find package.json (likely root of project)
		const packageJson = path.join(current, "package.json");
		if (fs.existsSync(packageJson)) {
			// Return the .github path even if it doesn't exist yet
			return path.join(current, ".github");
		}

		const parent = path.dirname(current);
		if (parent === current) {
			break;
		}
		current = parent;
	}

	return undefined;
}

/**
 * Checks if a dependabot config file exists in the .github directory.
 */
function dependabotConfigExists(githubDir: string): boolean {
	const yamlPath = path.join(githubDir, "dependabot.yaml");
	const ymlPath = path.join(githubDir, "dependabot.yml");

	return fs.existsSync(yamlPath) || fs.existsSync(ymlPath);
}

/**
 * Creates a minimal dependabot.yaml file with version: 2.
 */
function createDependabotConfig(githubDir: string): void {
	// Ensure .github directory exists
	if (!fs.existsSync(githubDir)) {
		fs.mkdirSync(githubDir, { recursive: true });
	}

	const configPath = path.join(githubDir, "dependabot.yaml");
	fs.writeFileSync(configPath, "version: 2\n", "utf-8");
}

/**
 * Rule to require a Dependabot configuration file exists.
 * Checks if .github/dependabot.yml or .github/dependabot.yaml exists in the project.
 * If not, provides a fix to create the file with minimal valid content.
 */
export const requireConfigFileRule = {
	meta: {
		docs: {
			description:
				"Require a Dependabot configuration file exists in the project",
			recommended: true,
			url: "https://github.com/cylewaitforit/eslint-plugin-dependabot/blob/main/docs/rules/require-config-file.md",
		},
		fixable: "code" as const,
		messages: {
			missingConfigFile:
				"Dependabot configuration file (.github/dependabot.yaml or .github/dependabot.yml) is missing. Run with --fix to create it.",
		},
		schema: [],
		type: "problem" as const,
	},
	// eslint-disable-next-line perfectionist/sort-objects -- meta should be at the top
	create(context: Rule.RuleContext) {
		return {
			Program(node: Rule.Node) {
				const sourceFile = context.filename;

				// Only check for package.json files to avoid running on every file
				if (!sourceFile.endsWith("package.json")) {
					return;
				}

				const githubDir = findGithubDirectory(sourceFile);

				if (!githubDir) {
					// Can't determine project root, skip this file
					return;
				}

				if (dependabotConfigExists(githubDir)) {
					// Config file exists, no error
					return;
				}

				context.report({
					fix() {
						createDependabotConfig(githubDir);
						// Return null because we created the file outside of the normal fix mechanism
						return null;
					},
					messageId: "missingConfigFile",
					node,
				});
			},
		};
	},
} satisfies Rule.RuleModule;
