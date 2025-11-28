# require-config-version

Require Dependabot configuration files to have a version property.

🛑 This rule _errors_ in the ✅ `recommended` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

## Rule Details

This rule enforces that Dependabot configuration files (`dependabot.yaml` or `dependabot.yml`) include a `version` property at the root level with the configured value.

The `version` property is required by Dependabot to properly parse and validate the configuration file.
Currently, Dependabot supports version 2.

## Options

This rule accepts an options object with the following properties:

- `version` (number): The required version value. Defaults to `2`.

### Default Configuration

```json
{
	"dependabot/require-config-version": ["error", { "version": 2 }]
}
```

### Custom Configuration

To require a different version:

```json
{
	"dependabot/require-config-version": ["error", { "version": 3 }]
}
```

## Examples

### ❌ Incorrect

<!-- eslint-skip -->

```yaml
# Missing version property
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: daily
```

<!-- eslint-skip -->

```yaml
# Wrong version (when configured to require version 2)
version: 1
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: daily
```

### ✅ Correct

<!-- eslint-skip -->

```yaml
# Version property is present with correct value
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: daily
```

## Auto-fix Behavior

When the `--fix` option is used:

- If the `version` property is missing, it will be added at the start of the file with the configured value.
- If the `version` property has an incorrect value, it will be replaced with the configured value.

## When Not To Use It

This rule should always be enabled for Dependabot configuration files, as the `version` property is required for the configuration to be valid.

## Further Reading

- [Dependabot configuration options](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
- [Dependabot version updates](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/about-dependabot-version-updates)
