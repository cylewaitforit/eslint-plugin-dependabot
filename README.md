<h1 align="center">ESLint Plugin Dependabot</h1>

<p align="center">Eslint Plugin to enforce Dependabot best practices</p>

<p align="center">
	<!-- prettier-ignore-start -->
	<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
	<a href="#contributors" target="_blank"><img alt="👪 All Contributors: 1" src="https://img.shields.io/badge/%F0%9F%91%AA_all_contributors-1-21bb42.svg" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
	<!-- prettier-ignore-end -->
	<a href="https://github.com/cylewaitforit/eslint-plugin-dependabot/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42" /></a>
	<a href="https://codecov.io/gh/cylewaitforit/eslint-plugin-dependabot" target="_blank"><img alt="🧪 Coverage" src="https://img.shields.io/codecov/c/github/cylewaitforit/eslint-plugin-dependabot?label=%F0%9F%A7%AA%20coverage" /></a>
	<a href="https://github.com/cylewaitforit/eslint-plugin-dependabot/blob/main/LICENSE.md" target="_blank"><img alt="📝 License: MIT" src="https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg" /></a>
	<a href="http://npmjs.com/package/eslint-plugin-dependabot" target="_blank"><img alt="📦 npm version" src="https://img.shields.io/npm/v/eslint-plugin-dependabot?color=21bb42&label=%F0%9F%93%A6%20npm" /></a>
	<img alt="💪 TypeScript: Strict" src="https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg" />
</p>

## Usage

### Installation

```shell
npm install eslint-plugin-dependabot eslint-yaml --save-dev
```

### Configuration

This plugin requires the `eslint-yaml` package to parse YAML files.
Add the plugin and language configuration to your `eslint.config.mjs`:

<!-- eslint-skip -->

```js
// eslint.config.mjs
import { defineConfig } from "eslint/config";
import dependabot from "eslint-plugin-dependabot";
import { yaml } from "eslint-yaml";

export default defineConfig([
	{
		files: ["**/.github/dependabot.{yml,yaml}"],
		language: "yaml/yaml",
		plugins: {
			dependabot,
			yaml,
		},
		...dependabot.configs.recommended,
	},
]);
```

### Rules

| Name                                               | Description                                                     | ✅  | 🔧  |
| :------------------------------------------------- | :-------------------------------------------------------------- | :-- | :-- |
| [require-cooldown](docs/rules/require-cooldown.md) | Require each package-ecosystem to have a cooldown configuration | ✅  | 🔧  |

## Development

See [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md), then [`.github/DEVELOPMENT.md`](./.github/DEVELOPMENT.md).
Thanks! 💖

## Contributors

<!-- spellchecker: disable -->
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://github.com/cylewaitforit"><img src="https://avatars.githubusercontent.com/u/54253392?v=4?s=100" width="100px;" alt="cylewaitforit"/><br /><sub><b>cylewaitforit</b></sub></a><br /><a href="https://github.com/cylewaitforit/eslint-plugin-dependabot/commits?author=cylewaitforit" title="Code">💻</a> <a href="#content-cylewaitforit" title="Content">🖋</a> <a href="https://github.com/cylewaitforit/eslint-plugin-dependabot/commits?author=cylewaitforit" title="Documentation">📖</a> <a href="#ideas-cylewaitforit" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-cylewaitforit" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-cylewaitforit" title="Maintenance">🚧</a> <a href="#projectManagement-cylewaitforit" title="Project Management">📆</a> <a href="#tool-cylewaitforit" title="Tools">🔧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- spellchecker: enable -->

<!-- You can remove this notice if you don't want it 🙂 no worries! -->

> 💝 This package was templated with [`create-typescript-app`](https://github.com/JoshuaKGoldberg/create-typescript-app) using the [Bingo framework](https://create.bingo).
