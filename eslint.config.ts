import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import eslint from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import dependabot from "eslint-plugin-dependabot";
import eslintPlugin from "eslint-plugin-eslint-plugin";
import jsdoc from "eslint-plugin-jsdoc";
import jsonc from "eslint-plugin-jsonc";
import markdown from "eslint-plugin-markdown";
import n from "eslint-plugin-n";
import packageJson from "eslint-plugin-package-json";
import perfectionist from "eslint-plugin-perfectionist";
import { configs } from "eslint-plugin-pnpm";
import * as regexp from "eslint-plugin-regexp";
import yml from "eslint-plugin-yml";
import { yaml } from "eslint-yaml";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
	globalIgnores(
		[
			"**/*.snap",
			"**/_fixtures_/",
			"coverage",
			"lib",
			"node_modules",
			"pnpm-lock.yaml",
		],
		"Global Ignores",
	),
	{
		linterOptions: { reportUnusedDisableDirectives: "error" },
		name: "Global Linter Options",
	},
	{
		extends: [
			comments.recommended,
			eslint.configs.recommended,
			eslintPlugin.configs.recommended,
			jsdoc.configs["flat/contents-typescript-error"],
			jsdoc.configs["flat/logical-typescript-error"],
			jsdoc.configs["flat/stylistic-typescript-error"],
			n.configs["flat/recommended"],
			perfectionist.configs["recommended-natural"],
			regexp.configs["flat/recommended"],
			tseslint.configs.strictTypeChecked,
			tseslint.configs.stylisticTypeChecked,
		],
		files: ["**/*.{js,ts}"],
		languageOptions: {
			parserOptions: {
				projectService: { allowDefaultProject: ["*.config.*s"] },
				tsconfigRootDir: import.meta.dirname,
			},
		},
		name: "JavaScript and TypeScript files",
		rules: {
			// See: https://tsdoc.org/ and https://github.com/microsoft/tsdoc/blob/main/tsdoc/src/details/StandardTags.ts
			"jsdoc/check-tag-names": [
				"error",
				{
					definedTags: [
						"alpha",
						"beta",
						"decorator",
						"defaultValue",
						"eventProperty",
						"experimental",
						"label",
						"packageDocumentation",
						"privateRemarks",
						"remarks",
						"sealed",
						"typeParam",
						"virtual",
					],
				},
			],

			// Stylistic concerns that don't interfere with Prettier
			"logical-assignment-operators": [
				"error",
				"always",
				{ enforceForIfStatements: true },
			],
			"no-useless-rename": "error",
			"object-shorthand": "error",
			"operator-assignment": "error",
		},
		settings: {
			perfectionist: { partitionByComment: true, type: "natural" },
			vitest: { typecheck: true },
		},
	},
	{
		extends: [jsonc.configs["flat/recommended-with-json"]],
		files: ["**/*.json"],
		name: "JSON files",
	},
	{
		extends: [markdown.configs.recommended],
		files: ["**/*.md"],
		name: "Markdown files",
	},
	{
		extends: [tseslint.configs.disableTypeChecked],
		files: ["**/*.md/*.{js,ts}"],
		name: "Markdown code blocks",
		rules: {
			"n/no-missing-import": "off",
			"n/no-unpublished-import": "off",
		},
	},
	{
		files: ["src/rules/**/*.ts"],
		name: "ESLint Plugin Rule Files",
		rules: {
			"eslint-plugin/require-meta-docs-description": "error",
			"eslint-plugin/require-meta-docs-url": "error",
			"eslint-plugin/require-meta-schema": "error",
		},
	},
	{
		extends: [vitest.configs.recommended],
		files: ["**/*.test.*"],
		name: "Test files",
		rules: { "@typescript-eslint/no-unsafe-assignment": "off" },
	},
	{
		extends: [yml.configs["flat/standard"], yml.configs["flat/prettier"]],
		files: ["**/*.{yml,yaml}"],
		name: "YAML files",
		rules: {
			"yml/file-extension": "error",
			"yml/sort-keys": [
				"error",
				{ order: { type: "asc" }, pathPattern: "^.*$" },
			],
			"yml/sort-sequence-values": [
				"error",
				{ order: { type: "asc" }, pathPattern: "^.*$" },
			],
		},
	},
	{
		files: [".github/workflows/**/*.{yml,yaml}"],
		name: "GitHub Actions workflow files",
		rules: {
			"yml/sort-keys": [
				"error",
				{
					order: [
						"name",
						"on",
						"permissions",
						"env",
						"concurrency",
						"jobs",
						"asc",
					],
					pathPattern: "^$",
				},
				{
					order: { type: "asc" },
					pathPattern: "^jobs.*",
				},
			],
		},
	},
	{
		extends: [packageJson.configs.recommended, ...configs.json],
		files: ["package.json", "**/package.json"],
		name: "Package.json files",
	},
	{
		extends: [...configs.yaml],
		files: ["pnpm-workspace.yaml"],
		name: "Pnpm workspace YAML rules",
	},

	{
		files: ["*.config.{js,ts}", "**/*.config.{js,ts}"],
		name: "Configuration files",
		rules: {
			"@typescript-eslint/no-unsafe-member-access": "off",
			"n/no-unsupported-features/node-builtins": "off",
		},
	},
	{
		extends: [dependabot.configs.recommended],
		files: ["**/.github/dependabot.{yml,yaml}"],
		language: "yaml/yaml",
		name: "Dependabot config",
		plugins: {
			dependabot,
			yaml,
		},
	},
]);
