# require-cooldown

Require each package-ecosystem to have a cooldown configuration.

🛑 This rule _errors_ in the ✅ `recommended` config.

## Rule Details

This rule enforces that each `package-ecosystem` entry in your Dependabot configuration has a `cooldown` section with at least a `default-days` property set.

The cooldown feature helps control when Dependabot attempts to update dependencies by setting a minimum package age before updates are attempted. This can be useful to:

- Avoid updating to packages that were just published and might have bugs
- Reduce noise from frequent updates
- Give the community time to discover issues in new releases

See [GitHub's documentation on cooldown periods](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/optimizing-pr-creation-version-updates#setting-up-a-cooldown-period-for-dependency-updates) for more information.

## Examples

### ❌ Incorrect

```yaml
# Missing cooldown configuration
updates:
  - directory: /
    package-ecosystem: npm
    schedule:
      interval: daily
version: 2
```

```yaml
# Cooldown exists but missing default-days
updates:
  - cooldown:
      semver-major-days: 30
    directory: /
    package-ecosystem: npm
    schedule:
      interval: daily
version: 2
```

```yaml
# Invalid cooldown value (scalar instead of object)
updates:
  - cooldown: 5
    directory: /
    package-ecosystem: npm
    schedule:
      interval: daily
version: 2
```

### ✅ Correct

```yaml
# Minimal valid configuration
updates:
  - cooldown:
      default-days: 5
    directory: /
    package-ecosystem: npm
    schedule:
      interval: daily
version: 2
```

```yaml
# Configuration with multiple cooldown options
updates:
  - cooldown:
      default-days: 5
      semver-major-days: 30
      semver-minor-days: 7
      semver-patch-days: 3
    directory: /
    package-ecosystem: npm
    schedule:
      interval: daily
version: 2
```

```yaml
# Multiple ecosystems, each with cooldown
updates:
  - cooldown:
      default-days: 5
    directory: /
    package-ecosystem: npm
    schedule:
      interval: daily
  - cooldown:
      default-days: 3
    directory: /
    package-ecosystem: pip
    schedule:
      interval: weekly
version: 2
```

## When Not To Use It

If you want Dependabot to always update to the latest versions immediately regardless of package age, you can disable this rule. However, this is generally not recommended as it may lead to instability from newly-published packages.

## Further Reading

- [Dependabot cooldown configuration](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/optimizing-pr-creation-version-updates#setting-up-a-cooldown-period-for-dependency-updates)
- [Dependabot version updates](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/about-dependabot-version-updates)
