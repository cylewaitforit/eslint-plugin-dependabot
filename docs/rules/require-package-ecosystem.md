# Require package-ecosystem configurations based on files in the repository (`dependabot/require-package-ecosystem`)

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Require package-ecosystem configurations based on files in the repository.

## Rule Details

This rule enforces that your Dependabot configuration includes package-ecosystem entries for package managers detected in your repository.

Currently, this rule checks for the `npm` package ecosystem.
If a `package.json` file exists at the root of your repository, the rule will require an npm package-ecosystem entry in the `updates` array.

This helps ensure that Dependabot is configured to monitor all package managers used in your project.

### Examples

Examples of **incorrect** code for this rule:

```yaml
# package.json exists in the repository root
# eslint-disable yml/plain-scalar, yml/sort-keys -- Example code
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

Examples of **correct** code for this rule:

```yaml
# package.json exists in the repository root
# eslint-disable yml/plain-scalar, yml/sort-keys -- Example code
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: daily
```

```yaml
# package.json exists, along with other ecosystems
# eslint-disable yml/plain-scalar, yml/sort-keys -- Example code
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

```yaml
# No package.json in the repository root - rule does not apply
# eslint-disable yml/plain-scalar, yml/sort-keys -- Example code
version: 2
updates:
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: daily
```

## When Not To Use It

If you intentionally do not want Dependabot to manage dependencies for a package manager present in your repository, you can disable this rule.

## Options

This rule accepts an options object with the following properties:

- `checkDirectory` (string): The directory to check for package files.
  Defaults to the current working directory.
  This option is primarily used for testing purposes.

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

## Further Reading

- [Dependabot configuration options](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
- [About Dependabot version updates](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/about-dependabot-version-updates)
