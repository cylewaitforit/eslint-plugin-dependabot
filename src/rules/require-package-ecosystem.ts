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
    # Look for \`package.json\` and lock files in the root directory
    directory: "/"
  `;

/** Options for the require-package-ecosystem rule. */
interface RuleOptions {
	/**
	 * The directory to check for package files. Defaults to cwd.
	 * @internal
	 */
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
			recommended: true,
			url: "https://github.com/cylewaitforit/eslint-plugin-dependabot/blob/main/docs/rules/require-package-ecosystem.md",
		},
		fixable: "code" as const,
		messages: {
			missingNpmEcosystem:
				"Missing npm package-ecosystem configuration. A package.json file exists at the repository root, but no npm ecosystem is configured in the updates array.",
		},
		schema: [
			{
				properties: {
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
			const directoryToCheck = options.checkDirectory ?? context.cwd;
			const disabledEcosystems = options.disabledEcosystems ?? [];

			if (disabledEcosystems.includes("npm")) {
				return;
			}

			const packageJsonPath = path.join(directoryToCheck, "package.json");
			const hasPackageJson = fs.existsSync(packageJsonPath);

			if (!hasPackageJson) {
				return;
			}

			const updatesPair = findPairByKey(rootMap, "updates");

			if (!updatesPair) {
				context.report({
					fix(fixer) {
						const rootRange = rootMap.range;
						if (!rootRange) {
							return null;
						}

						const versionPair = findPairByKey(rootMap, "version");
						if (!versionPair?.value || !isScalar(versionPair.value)) {
							return null;
						}

						const versionRange = versionPair.value.range;
						if (!versionRange) {
							return null;
						}

						return fixer.insertTextAfterRange(
							[versionRange[1], versionRange[1]],
							`\nupdates:\n  ${NPM_ECOSYSTEM_TEMPLATE}`,
						);
					},
					messageId: "missingNpmEcosystem",
					node: yamlNodeToRuleNode(rootMap),
				});
				return;
			}

			const updatesArray = updatesPair.value;
			if (!isSeq(updatesArray)) {
				return;
			}

			const hasNpmEcosystem = updatesArray.items.some((item) => {
				if (!isMap(item)) {
					return false;
				}

				const ecosystemPair = findPairByKey(item, "package-ecosystem");
				if (!ecosystemPair) {
					return false;
				}

				const ecosystemName = getScalarStringValue(ecosystemPair.value);
				return ecosystemName === "npm";
			});

			if (!hasNpmEcosystem) {
				const updatesRange = updatesArray.range;

				context.report({
					fix(fixer) {
						if (!updatesRange) {
							return null;
						}

						return fixer.insertTextBeforeRange(
							[updatesRange[0], updatesRange[0]],
							NPM_ECOSYSTEM_TEMPLATE,
						);
					},
					messageId: "missingNpmEcosystem",
					node: yamlNodeToRuleNode(updatesPair),
				});
			}
		});
	},
} satisfies Rule.RuleModule;
