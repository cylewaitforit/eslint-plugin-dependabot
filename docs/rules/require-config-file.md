# Require a Dependabot configuration file exists in the project (`dependabot/require-config-file`)

💼 This rule is enabled in the ✅ `recommended` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Require a Dependabot configuration file exists in the project.

## Rule Details

This rule checks whether a `.github/dependabot.yml` or `.github/dependabot.yaml` file exists in your project. If neither file exists, the rule will report an error and can automatically create a minimal configuration file when using the `--fix` option.

This ensures that projects using this plugin have a valid Dependabot configuration file set up.

## Examples

### ❌ Incorrect

A project without a `.github/dependabot.yml` or `.github/dependabot.yaml` file will fail this rule.

### ✅ Correct

A project with either `.github/dependabot.yml` or `.github/dependabot.yaml` will pass this rule.

Example minimal configuration:

```yaml
version: 2
```

## When Not To Use It

If you don't want to enforce the presence of a Dependabot configuration file in your project, you can disable this rule.

## Further Reading

- [Dependabot configuration reference](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
