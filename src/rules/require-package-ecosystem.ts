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
    schedule:
      interval: weekly
  `;

/** Default github-actions ecosystem configuration template for auto-fix */
const GITHUB_ACTIONS_ECOSYSTEM_TEMPLATE = `# Enable version updates for GitHub Actions
  - package-ecosystem: "github-actions"
    # Look for workflow files in the \`.github/workflows\` directory
    directory: "/"
    schedule:
      interval: weekly
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
 * Checks for npm ecosystem when package.json exists at repo root.
 * Checks for github-actions ecosystem when .github/workflows directory exists.
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
			missingGithubActionsEcosystem:
				"Missing github-actions package-ecosystem configuration. A .github/workflows directory exists in the repository, but no github-actions ecosystem is configured in the updates array.",
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

			// Define ecosystems to check
			const ecosystemsToCheck: {
				checkExists: () => boolean;
				messageId: "missingGithubActionsEcosystem" | "missingNpmEcosystem";
				name: string;
				template: string;
			}[] = [
				{
					checkExists: () =>
						fs.existsSync(path.join(directoryToCheck, "package.json")),
					messageId: "missingNpmEcosystem",
					name: "npm",
					template: NPM_ECOSYSTEM_TEMPLATE,
				},
				{
					checkExists: () =>
						fs.existsSync(path.join(directoryToCheck, ".github/workflows")),
					messageId: "missingGithubActionsEcosystem",
					name: "github-actions",
					template: GITHUB_ACTIONS_ECOSYSTEM_TEMPLATE,
				},
			];

			// Filter out disabled ecosystems
			const activeEcosystems = ecosystemsToCheck.filter(
				(eco) => !disabledEcosystems.includes(eco.name),
			);

			// Check which ecosystems should be configured
			const missingEcosystems = activeEcosystems.filter((eco) =>
				eco.checkExists(),
			);

			if (missingEcosystems.length === 0) {
				return;
			}

			const updatesPair = findPairByKey(rootMap, "updates");

			if (!updatesPair) {
				// If no updates array exists, report the first missing ecosystem
				const firstMissing = missingEcosystems[0];
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

						// Add all missing ecosystems
						const allTemplates = missingEcosystems
							.map((eco) => eco.template)
							.join("");

						return fixer.insertTextAfterRange(
							[versionRange[1], versionRange[1]],
							`\nupdates:\n  ${allTemplates}`,
						);
					},
					messageId: firstMissing.messageId,
					node: yamlNodeToRuleNode(rootMap),
				});
				return;
			}

			const updatesArray = updatesPair.value;
			if (!isSeq(updatesArray)) {
				return;
			}

			// Get list of existing ecosystems
			const existingEcosystems = updatesArray.items
				.filter(isMap)
				.map((item) => {
					const ecosystemPair = findPairByKey(item, "package-ecosystem");
					return ecosystemPair
						? getScalarStringValue(ecosystemPair.value)
						: null;
				})
				.filter((name): name is string => name !== null);

			// Check each missing ecosystem
			for (const ecosystem of missingEcosystems) {
				if (!existingEcosystems.includes(ecosystem.name)) {
					const updatesRange = updatesArray.range;

					context.report({
						fix(fixer) {
							if (!updatesRange) {
								return null;
							}

							return fixer.insertTextBeforeRange(
								[updatesRange[0], updatesRange[0]],
								ecosystem.template,
							);
						},
						messageId: ecosystem.messageId,
						node: yamlNodeToRuleNode(updatesPair),
					});
				}
			}
		});
	},
} satisfies Rule.RuleModule;
