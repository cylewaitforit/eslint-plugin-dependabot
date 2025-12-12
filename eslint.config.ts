import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import eslint from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
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
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
	{
		ignores: [
			"**/*.snap",
			"**/_fixtures_/",
			"coverage",
			"lib",
			"node_modules",
			"pnpm-lock.yaml",
		],
	},
	{ linterOptions: { reportUnusedDisableDirectives: "error" } },
	eslintPlugin.configs.recommended,
	{
		files: ["src/rules/**/*.ts"],
		name: "eslint-plugin rules",
		rules: {
			"eslint-plugin/require-meta-docs-description": "error",
			"eslint-plugin/require-meta-docs-url": "error",
			"eslint-plugin/require-meta-schema": "error",
		},
	},
	eslint.configs.recommended,
	comments.recommended,
	jsdoc.configs["flat/contents-typescript-error"],
	jsdoc.configs["flat/logical-typescript-error"],
	jsdoc.configs["flat/stylistic-typescript-error"],
	jsonc.configs["flat/recommended-with-json"],
	markdown.configs.recommended,
	n.configs["flat/recommended"],
	packageJson.configs.recommended,
	perfectionist.configs["recommended-natural"],
	regexp.configs["flat/recommended"],
	...configs.json,
	...configs.yaml,
	{
		files: ["**/*.{js,ts}"],
		name: "tsdoc tags",
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
		},
	},
	{
		extends: [
			tseslint.configs.strictTypeChecked,
			tseslint.configs.stylisticTypeChecked,
		],
		files: ["**/*.{js,ts}"],
		ignores: ["**/*.md/**"],
		languageOptions: {
			parserOptions: {
				projectService: { allowDefaultProject: ["*.config.*s"] },
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
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
		extends: [tseslint.configs.disableTypeChecked],
		files: ["**/*.md/*.{js,ts}"],
		rules: {
			"n/no-missing-import": "off",
			"n/no-unpublished-import": "off",
		},
	},
	{
		extends: [vitest.configs.recommended],
		files: ["**/*.test.*"],
		rules: { "@typescript-eslint/no-unsafe-assignment": "off" },
	},
	{
		extends: [yml.configs["flat/standard"], yml.configs["flat/prettier"]],
		files: ["**/*.{yml,yaml}"],
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
		files: ["*.config.{js,ts}", "**/*.config.{js,ts}"],
		rules: {
			"@typescript-eslint/no-unsafe-member-access": "off",
			"n/no-unsupported-features/node-builtins": "off",
		},
	},
]);
