# require-cooldown

Require each package-ecosystem to have a cooldown configuration.

🛑 This rule _errors_ in the ✅ `recommended` config.

## Rule Details

This rule enforces that each `package-ecosystem` entry in your Dependabot configuration has a `cooldown` section with at least a `default-days` property set.

The cooldown feature helps control when Dependabot attempts to update dependencies by setting a minimum package age before updates are attempted.
This can be useful to:

- Avoid updating to packages that were just published and might have bugs
- Reduce noise from frequent updates
- Give the community time to discover issues in new releases

See [GitHub's documentation on cooldown periods](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/optimizing-pr-creation-version-updates#setting-up-a-cooldown-period-for-dependency-updates) for more information.

## Examples

### ❌ Incorrect

<!-- eslint-skip -->

```yaml
# Missing cooldown configuration
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: daily
```

<!-- eslint-skip -->

```yaml
# Cooldown exists but missing default-days
version: 2
updates:
  - package-ecosystem: npm
    cooldown:
      semver-major-days: 30
    directory: /
    schedule:
      interval: daily
```

<!-- eslint-skip -->

```yaml
# Invalid cooldown value (scalar instead of object)
version: 2
updates:
  - package-ecosystem: npm
    cooldown: 5
    directory: /
    schedule:
      interval: daily
```

### ✅ Correct

<!-- eslint-skip -->

```yaml
# Minimal valid configuration
version: 2
updates:
  - package-ecosystem: npm
    cooldown:
      default-days: 5
    directory: /
    schedule:
      interval: daily
```

<!-- eslint-skip -->

```yaml
# Configuration with multiple cooldown options
version: 2
updates:
  - package-ecosystem: npm
    cooldown:
      default-days: 5
      semver-major-days: 30
      semver-minor-days: 7
      semver-patch-days: 3
    directory: /
    schedule:
      interval: daily
```

<!-- eslint-skip -->

```yaml
# Multiple ecosystems, each with cooldown
version: 2
updates:
  - package-ecosystem: npm
    cooldown:
      default-days: 5
    directory: /
    schedule:
      interval: daily
  - package-ecosystem: pip
    cooldown:
      default-days: 3
    directory: /
    schedule:
      interval: weekly
```

## When Not To Use It

If you want Dependabot to always update to the latest versions immediately regardless of package age, you can disable this rule.
However, this is generally not recommended as it may lead to instability from newly-published packages.

## Further Reading

- [Dependabot cooldown configuration](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/optimizing-pr-creation-version-updates#setting-up-a-cooldown-period-for-dependency-updates)
- [Dependabot version updates](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/about-dependabot-version-updates)
