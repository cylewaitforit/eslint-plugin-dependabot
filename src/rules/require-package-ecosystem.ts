import type { Rule } from "eslint";

import fs from "node:fs";
import path from "node:path";
import { isMap, isScalar, isSeq } from "yaml";

import {
	createRootMapVisitor,
	findPairByKey,
	getScalarStringValue,
	yamlNodeToRuleNode,
} from "../utils/yaml.js";

/** Default npm ecosystem configuration template for auto-fix */
const NPM_ECOSYSTEM_TEMPLATE = `# Enable version updates for npm
  - package-ecosystem: "npm"
    # Look for \`package.json\` and \`lock\` files in the \`root\` directory
    directory: "/"`;

/** Options for the require-package-ecosystem rule. */
interface RuleOptions {
	/** The directory to check for package files. Defaults to cwd. Used primarily for testing. */
	checkDirectory?: string;
	/** Array of package ecosystems to disable the rule for. */
	disabledEcosystems?: string[];
}

/**
 * Rule to require package-ecosystem configurations based on project files.
 * Currently checks for npm ecosystem when package.json exists at repo root.
 */
export const requirePackageEcosystemRule = {
	meta: {
		docs: {
			description:
				"Require package-ecosystem configurations based on files in the repository",
			recommended: false,
			url: "https://github.com/cylewaitforit/eslint-plugin-dependabot/blob/main/docs/rules/require-package-ecosystem.md",
		},
		fixable: "code" as const,
		messages: {
			missingNpmEcosystem:
				"Missing npm package-ecosystem configuration. A package.json file exists at the repository root, but no npm ecosystem is configured in the updates array.",
		},
		schema: [
			{
				additionalProperties: false,
				properties: {
					checkDirectory: {
						description:
							"The directory to check for package files. Defaults to the current working directory.",
						type: "string",
					},
					disabledEcosystems: {
						description:
							"Array of package ecosystems to disable the rule for. For example, ['npm'] will disable checking for npm ecosystem.",
						items: {
							type: "string",
						},
						type: "array",
					},
				},
				type: "object",
			},
		],
		type: "problem" as const,
	},
	// eslint-disable-next-line perfectionist/sort-objects -- meta should be at the top
	create(context: Rule.RuleContext) {
		const options = (context.options[0] ?? {}) as RuleOptions;

		return createRootMapVisitor((rootMap) => {
			// Get the directory to check - either from options or from cwd
			const checkDir = options.checkDirectory ?? context.cwd;

			// Check if npm is in the disabled ecosystems list
			const disabledEcosystems = options.disabledEcosystems ?? [];
			if (disabledEcosystems.includes("npm")) {
				return;
			}

			// Check if package.json exists at the check directory
			const packageJsonPath = path.join(checkDir, "package.json");
			const hasPackageJson = fs.existsSync(packageJsonPath);

			// If no package.json, no need to check for npm ecosystem
			if (!hasPackageJson) {
				return;
			}

			// Find the updates array
			const updatesPair = findPairByKey(rootMap, "updates");

			if (!updatesPair) {
				// If there's no updates array at all, report an error on the root
				context.report({
					fix(fixer) {
						const rootRange = rootMap.range;
						if (rootRange) {
							// Add updates array after version
							const versionPair = findPairByKey(rootMap, "version");
							if (versionPair?.value && isScalar(versionPair.value)) {
								const versionRange = versionPair.value.range;
								if (versionRange) {
									return fixer.insertTextAfterRange(
										[versionRange[1], versionRange[1]],
										`\nupdates:\n  ${NPM_ECOSYSTEM_TEMPLATE}`,
									);
								}
							}
						}
						return null;
					},
					messageId: "missingNpmEcosystem",
					node: yamlNodeToRuleNode(rootMap),
				});
				return;
			}

			const updatesValue = updatesPair.value;
			if (!isSeq(updatesValue)) {
				return;
			}

			// Check if npm ecosystem already exists
			let hasNpmEcosystem = false;
			for (const item of updatesValue.items) {
				if (!isMap(item)) {
					continue;
				}

				const packageEcosystemPair = findPairByKey(item, "package-ecosystem");
				if (!packageEcosystemPair) {
					continue;
				}

				const ecosystemName = getScalarStringValue(packageEcosystemPair.value);
				if (ecosystemName === "npm") {
					hasNpmEcosystem = true;
					break;
				}
			}

			// If npm ecosystem is missing, report error
			if (!hasNpmEcosystem) {
				// Find the first item in the updates array to insert before it
				const firstItem = updatesValue.items[0];
				const updatesRange = updatesValue.range;

				context.report({
					fix(fixer) {
						if (firstItem && isMap(firstItem) && firstItem.range) {
							// The range[0] points to the first character after '- '
							// We need to insert before the '- ', so go back 2 positions
							// However, we need to account for any whitespace/indentation
							// The safest approach is to insert right at range[0] - 2 (before the '-')
							const insertPosition = firstItem.range[0] - 2;
							return fixer.insertTextBeforeRange(
								[insertPosition, insertPosition],
								`${NPM_ECOSYSTEM_TEMPLATE}\n  `,
							);
						} else if (updatesRange) {
							// If no items exist yet, insert at the beginning
							const insertPosition = updatesRange[0];
							return fixer.insertTextAfterRange(
								[insertPosition, insertPosition],
								`\n  ${NPM_ECOSYSTEM_TEMPLATE}`,
							);
						}
						return null;
					},
					messageId: "missingNpmEcosystem",
					node: yamlNodeToRuleNode(updatesPair),
				});
			}
		});
	},
} satisfies Rule.RuleModule;
