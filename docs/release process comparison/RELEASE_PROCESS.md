# Release and Publishing Process

This document describes how `@cognigy/chat-components-vue` is released and published to npm.

## Overview

This repo uses a **fully automated** release process:

1. **Developer** creates a PR and merges to `main`
2. **GitHub Actions** automatically bumps version, creates tag, and publishes to npm

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Developer      │────▶│  PR merged      │────▶│  auto-version   │
│  merges PR      │     │  to main        │     │  workflow runs  │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                        ┌────────────────────────────────┼────────────────────────────────┐
                        │                                │                                │
                        ▼                                ▼                                ▼
               ┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
               │  Version bump   │              │  GitHub Release │              │  Publish to     │
               │  + Git tag      │              │  created        │              │  npm            │
               └─────────────────┘              └─────────────────┘              └─────────────────┘
```

## Version Bump Rules

| PR Source | Version Bump | Example |
|-----------|--------------|---------|
| Regular PR | **Minor** | 0.1.0 → 0.2.0 |
| Dependabot PR | **Patch** | 0.1.0 → 0.1.1 |

Detection is based on commit author (`dependabot[bot]`) or message containing "Bump" or "dependabot".

## What the Workflow Does

When a PR is merged to `main`, `auto-version.yml` automatically:

1. **Bumps version** in `package.json`
2. **Updates CHANGELOG.md** with new version entry
3. **Commits** changes with `[skip ci]` to prevent loops
4. **Creates git tag** (e.g., `v0.2.0`)
5. **Creates GitHub Release** with auto-generated notes
6. **Publishes to npm**

## No Manual Steps Required

Unlike traditional release processes, developers don't need to:
- ❌ Run `npm version`
- ❌ Create PRs for version bumps
- ❌ Push tags manually
- ❌ Trigger publish workflows

Just merge your PR - everything else is automated.

## CI/CD Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `test.yml` | PR to `main` | Lint, type-check, test, build |
| `auto-version.yml` | Push to `main` | Version bump + release + publish |

## Required Secrets

| Secret | Required | Purpose |
|--------|----------|---------|
| `GITHUB_TOKEN` | Built-in | Create releases, commit version bumps |
| `COGNIGY_NPM_AUTH_CONFIG` | **Yes** | npm authentication (org-wide secret) |

The `COGNIGY_NPM_AUTH_CONFIG` secret should already be available as an organization secret. It contains the npm auth token configuration that gets appended to `.npmrc`.

## Consumer Installation

```bash
npm install @cognigy/chat-components-vue
```

No special configuration needed.

## Package Configuration

### Published Files

```json
{
  "files": [
    "dist/**",
    "src/**"
  ]
}
```

### Entry Points

```json
{
  "main": "./dist/chat-components-vue.js",
  "module": "./dist/chat-components-vue.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/chat-components-vue.js",
      "default": "./dist/chat-components-vue.js"
    },
    "./style.css": "./dist/chat-components-vue.css"
  }
}
```

## Local Testing Before Release

To test changes locally before merging:

```bash
# In this repo
npm ci && npm run build && npm pack

# In consuming repo
npm install ../chat-components-vue/cognigy-chat-components-vue-0.1.0.tgz
```

Or test publishing with a dry run:

```bash
npm publish --dry-run
```

## Troubleshooting

### Workflow Didn't Run

- Check that the merge was to `main` branch
- Verify the commit message doesn't contain `[skip ci]`
- Check paths-ignore in workflow (`.md` files don't trigger)

### npm Publish Failed

- Verify `NPM_TOKEN` secret is configured
- Check that the token has publish access to `@cognigy` scope
- Ensure the version doesn't already exist on npm
- Run `npm run build` locally to verify build succeeds

### Version Not Bumping

The workflow skips if:
- Commit message contains `[skip ci]`
- Commit message contains `chore: bump version`
- Only `.md`, `plans/`, or workflow files changed

---

## Comparison: Automated vs Manual Release

This repo uses an **automated** approach. For reference, here's how it compares to the manual approach used by `@cognigy/chat-components` (React):

| Aspect | Vue (Automated) | React (Manual) |
|--------|-----------------|----------------|
| **Registry** | npm | npm |
| **Version Bump** | Automatic on merge | Manual `npm version` |
| **Tag Creation** | Automatic | Manual `git push --tags` |
| **Release Trigger** | Push to main | Tag push (`v*`) |
| **Workflows** | Single `auto-version.yml` | `release.yml` + `publish.yml` |
| **Developer Steps** | Merge PR | Version → PR → Merge → Push tags |

### Automated Workflow (This Repo)

```
Developer merges PR
        ↓
auto-version.yml runs automatically
        ↓
Version bumped → Tag created → Release created → Published to npm
```

**Pros:**
- Zero manual steps after PR merge
- Consistent versioning (no human error)
- Dependabot PRs auto-patch

**Cons:**
- Less control over version numbers
- Every merge bumps version (may be too frequent)

### Manual Workflow (React Repo)

```
Developer runs: npm version patch
        ↓
Developer creates PR with version bump
        ↓
Developer merges PR
        ↓
Developer runs: git push --tags
        ↓
release.yml creates GitHub Release
        ↓
publish.yml publishes to npm
```

**Pros:**
- Full control over when/what version
- Can batch multiple PRs into one release
- Explicit decision to release

**Cons:**
- More manual steps
- Easy to forget to push tags
- Version bump PRs add noise

### When to Use Which

| Use Case | Recommended Approach |
|----------|---------------------|
| Internal packages with frequent updates | **Automated** |
| Public packages with careful versioning | **Manual** |
| Small team, fast iteration | **Automated** |
| Large team, release coordination needed | **Manual** |
| Dependabot-heavy repos | **Automated** (auto-patches) |
