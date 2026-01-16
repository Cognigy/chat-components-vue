---
description: Check and analyze npm package updates with npm-check-updates. Lists outdated dependencies, identifies major/minor/patch updates, and helps plan safe upgrades.
allowed-tools: Bash(npx ncu:*), Bash(npx npm-check-updates:*), Read, WebSearch
---

# NPM Check Updates

Check for available npm package updates in this project.

## Step 1: Run npm-check-updates

Run the following command to list all available updates:

```bash
npx ncu
```

## Step 2: Analyze the Results

After running ncu, analyze the output:

1. **Group updates by risk level:**
   - **Patch updates** (x.x.PATCH): Generally safe, bug fixes only
   - **Minor updates** (x.MINOR.x): New features, should be backwards compatible
   - **Major updates** (MAJOR.x.x): Breaking changes, require investigation

2. **For major updates**, research breaking changes:
   - Check the package's changelog or release notes
   - Search for migration guides
   - Identify if any project code needs updating

3. **Identify security-critical packages** that should be updated promptly

## Step 3: Provide Recommendations

Present findings in a clear format:

### Safe to Update (Patch/Minor)
- List packages with low risk

### Requires Investigation (Major)
- List packages with breaking changes
- Note key breaking changes from research

### Security Considerations
- Note any packages with known vulnerabilities

## Optional Arguments

If the user provides arguments, pass them to ncu:

- `$ARGUMENTS` - passed directly to ncu command
- `-u` or `--upgrade` - Update package.json (don't run without user confirmation)
- `-t newest` - Check for newest versions
- `-t greatest` - Check for greatest versions
- `--doctor` - Iteratively install and test updates
- `-f <package>` - Filter to specific package(s)

## Example Output Format

```
## NPM Update Analysis

### Current Status
- X packages can be updated
- Y major updates (require investigation)
- Z minor/patch updates (generally safe)

### Major Updates (Breaking Changes)
| Package | Current | Latest | Notes |
|---------|---------|--------|-------|
| vite    | 5.4.0   | 7.0.0  | Node.js 22.12+ required |

### Minor/Patch Updates (Safe)
| Package | Current | Latest | Type |
|---------|---------|--------|------|
| vue     | 3.5.0   | 3.5.5  | patch |

### Recommendations
1. ...
```