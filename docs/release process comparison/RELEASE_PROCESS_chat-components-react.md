# Release and Publishing Process

This document describes how the `@cognigy/chat-components` package is released and published to npm.

## Overview

The release process follows a tag-based workflow with automated GitHub Actions:

1. **Developer** bumps version and creates a git tag
2. **GitHub Actions** creates a GitHub Release when the tag is pushed
3. **GitHub Actions** publishes to npm when the release is created

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  npm version    │────▶│  git push       │────▶│  release.yml    │
│  (creates tag)  │     │  --tags         │     │  (creates       │
│                 │     │                 │     │   GH Release)   │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │  publish.yml    │
                                                │  (publishes     │
                                                │   to npm)       │
                                                └─────────────────┘
```

## Step-by-Step Release Process

### 1. Version Bump

Use npm's built-in versioning commands:

```bash
# For patch releases (0.66.0 → 0.66.1)
npm version patch

# For minor releases (0.66.0 → 0.67.0)
npm version minor

# For major releases (0.66.0 → 1.0.0)
npm version major
```

This command:
- Updates the `version` field in `package.json`
- Creates a git commit with message `<version>`
- Creates a git tag `v<version>`

### 2. Create Pull Request

Create a PR with the version bump commit and merge it to `main`.

### 3. Push Tags

After the PR is merged, push the tags to trigger the release workflow:

```bash
git push --tags
```

### 4. Automated Release Creation

When a tag matching `v*` is pushed, the **Release workflow** (`.github/workflows/release.yml`) runs:

```yaml
on:
  push:
    tags:
      - "v*"
```

This workflow uses the `ergebnis/.github/actions/github/release/create` action to create a GitHub Release.

### 5. Automated npm Publishing

When the GitHub Release is published, the **Publish workflow** (`.github/workflows/publish.yml`) runs:

```yaml
on:
  release:
    types: [published]
```

This workflow:

1. **Build Job**:
   - Checks out the code
   - Installs dependencies (`npm ci`)
   - Runs tests (`npm test`)
   - Validates package version consistency

2. **Publish Job** (runs after build succeeds):
   - Checks out the code
   - Installs dependencies
   - Builds the package (`npm run build`)
   - Publishes to npm (`npm publish`)

## Build Process

The build command (`npm run build`) executes:

```bash
tsc && vite build && node scripts/postbuild-secure-patch.mjs
```

### Build Steps

1. **TypeScript Compilation** (`tsc`)
   - Type-checks the codebase
   - Generates declaration files

2. **Vite Build** (`vite build`)
   - Bundles the library as ES module
   - Generates `dist/chat-components.js`
   - Injects CSS into the JavaScript bundle
   - Externalizes `react` and `react-dom` as peer dependencies
   - Generates TypeScript declaration files via `vite-plugin-dts`

3. **Security Patching** (`postbuild-secure-patch.mjs`)
   - Applies targeted string replacements to address CodeQL findings
   - Patches include:
     - Promoting single-occurrence sanitization to global replacements
     - Fixing overly large regex character class ranges
     - Escaping dots in hostname regex patterns

### Build Configuration

Key settings from `vite.config.ts`:

| Setting | Value | Description |
|---------|-------|-------------|
| Target | `es2020` | ECMAScript target version |
| Sourcemap | `hidden` | Generates sourcemaps but doesn't reference them |
| Minify | `false` | Output is not minified |
| Format | `es` | ES module output |
| Entry | `src/index.ts` | Library entry point |

## CI/CD Workflows

### Workflows Overview

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `test.yml` | Push/PR to `main` | Runs build and tests |
| `lint.yml` | Push/PR to `main`, weekly | ESLint analysis with SARIF upload |
| `format.yml` | PR to `main` | Prettier formatting check |
| `release.yml` | Tag push (`v*`) | Creates GitHub Release |
| `publish.yml` | Release published | Publishes to npm |

### Required Secrets

| Secret | Used By | Purpose |
|--------|---------|---------|
| `RELEASE_ACTION_TOKEN` | release.yml | GitHub token for creating releases |
| `npm_token` | publish.yml | npm authentication token for publishing |

## Package Configuration

### Published Files

From `package.json`:

```json
{
  "files": [
    "dist/**",
    "src/**"
  ]
}
```

The published package includes:
- `dist/` - Built JavaScript bundle and type declarations
- `src/` - Source TypeScript files

### Entry Points

```json
{
  "main": "./dist/chat-components.js",
  "module": "./dist/chat-components.js",
  "types": "./dist/index.d.ts",
  "exports": {
    "import": "./dist/chat-components.js",
    "require": "./dist/chat-components.js"
  }
}
```

### Peer Dependencies

```json
{
  "peerDependencies": {
    "react": "^19.x || ^18.3.0",
    "react-dom": "^19.x || ^18.3.0"
  }
}
```

## Local Testing Before Release

To test the package locally before publishing (e.g., in Webchat v3):

```bash
# In chat-components repo
npm ci && npm pack

# In consuming repo (e.g., Webchat)
npm i ../chat-components/cognigy-chat-components-<VERSION>.tgz
```

## Prepack Hook

The `prepack` script ensures the package is built before packing:

```json
{
  "scripts": {
    "prepack": "npm run build"
  }
}
```

This runs automatically before `npm pack` or `npm publish`.

## Version Validation

The publish workflow uses `technote-space/package-version-check-action` to validate that the package version matches the git tag, preventing version mismatches.

## Troubleshooting

### Release Not Created

- Verify the tag matches the pattern `v*` (e.g., `v0.66.0`)
- Check that `RELEASE_ACTION_TOKEN` secret is configured

### Publish Failed

- Verify tests pass locally (`npm test`)
- Check that `npm_token` secret is valid and not expired
- Ensure the version doesn't already exist on npm

### Build Failed

- Run `npm run build` locally to identify issues
- Check for TypeScript errors
- Verify all dependencies are installed