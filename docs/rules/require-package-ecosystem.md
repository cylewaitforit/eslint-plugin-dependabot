# Require package-ecosystem configurations based on files in the repository (`dependabot/require-package-ecosystem`)

💼 This rule is enabled in the ✅ `recommended` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Require package-ecosystem configurations based on files in the repository.

## Rule Details

This rule enforces that your Dependabot configuration includes package-ecosystem entries for package managers detected in your repository.

This rule checks for:

- The `npm` package ecosystem: If a `package.json` file exists at the root of your repository, the rule will require an npm package-ecosystem entry in the `updates` array.
- The `github-actions` package ecosystem: If a `.github/workflows` directory exists in your repository, the rule will require a github-actions package-ecosystem entry in the `updates` array.

This helps ensure that Dependabot is configured to monitor all package managers and ecosystems used in your project.

### Examples

Examples of **incorrect** code for this rule:

<!-- eslint-skip -->

```yaml
# package.json exists in the repository root
version: 2
updates:
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: daily
```

```yaml
# package.json exists in the repository root, but no updates array

version: 2
```

<!-- eslint-skip -->

```yaml
# .github/workflows directory exists in the repository
version: 2
updates:
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: daily
```

Examples of **correct** code for this rule:

<!-- eslint-skip -->

```yaml
# package.json exists in the repository root
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: daily
```

<!-- eslint-skip -->

```yaml
# package.json exists, along with other ecosystems
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: daily
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: daily
```

<!-- eslint-skip -->

```yaml
# No package.json in the repository root - rule does not apply
version: 2
updates:
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: daily
```

<!-- eslint-skip -->

```yaml
# .github/workflows directory exists
version: 2
updates:
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: daily
```

<!-- eslint-skip -->

```yaml
# Both package.json and .github/workflows exist
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: daily
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: daily
```

## When Not To Use It

If you intentionally do not want Dependabot to manage dependencies for a package manager present in your repository, you can disable this rule.

## Options

This rule accepts an options object with the following properties:

- `disabledEcosystems` (string[]): Array of package ecosystems to disable the rule for.
  For example, `["npm"]` will disable checking for npm ecosystem even if `package.json` exists.
  Similarly, `["github-actions"]` will disable checking for github-actions ecosystem even if `.github/workflows` exists.
  This is useful if you want to manage specific ecosystems manually.

### Default Configuration

```js
export default [
	{
		rules: {
			"dependabot/require-package-ecosystem": "error",
		},
	},
];
```

### Custom Configuration

To disable the rule for specific ecosystems:

```js
export default [
	{
		rules: {
			"dependabot/require-package-ecosystem": [
				"error",
				{
					disabledEcosystems: ["npm", "github-actions"],
				},
			],
		},
	},
];
```

## Further Reading

- [Dependabot configuration options](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
- [About Dependabot version updates](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/about-dependabot-version-updates)
