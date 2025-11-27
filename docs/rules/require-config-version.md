# require-config-version

Require Dependabot configuration files to have a version property.

🛑 This rule _errors_ in the ✅ `recommended` config.

## Rule Details

This rule enforces that Dependabot configuration files (`dependabot.yaml` or `dependabot.yml`) include a `version` property at the root level.

The `version` property is required by Dependabot to properly parse and validate the configuration file.
Currently, Dependabot only supports version 2.

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

### ✅ Correct

<!-- eslint-skip -->

```yaml
# Version property is present
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: daily
```

## When Not To Use It

This rule should always be enabled for Dependabot configuration files, as the `version` property is required for the configuration to be valid.

## Further Reading

- [Dependabot configuration options](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
- [Dependabot version updates](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/about-dependabot-version-updates)
