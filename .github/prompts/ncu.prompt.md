# NPM Check Updates Analysis

You are helping analyze npm package updates for safety and planning upgrades.

## Your Task

When the user asks about package updates or runs `npx ncu`, help them:

1. **Categorize updates by risk level**
2. **Research breaking changes for major updates**
3. **Provide actionable recommendations**

## Risk Categories

### Patch Updates (x.x.PATCH)
- **Risk**: Low
- **Contains**: Bug fixes, security patches
- **Action**: Generally safe to update immediately

### Minor Updates (x.MINOR.x)
- **Risk**: Low-Medium
- **Contains**: New features, backwards-compatible changes
- **Action**: Usually safe, review changelog for deprecations

### Major Updates (MAJOR.x.x)
- **Risk**: High
- **Contains**: Breaking changes, API modifications
- **Action**: Research before updating, check migration guides

## Analysis Process

1. **Run npm-check-updates**:
   ```bash
   npx ncu
   ```

2. **Group packages by update type**:
   - Count patch, minor, and major updates
   - Identify security-critical packages

3. **Research major updates**:
   - Check package changelog/release notes
   - Look for migration guides
   - Identify code changes needed

4. **Provide recommendations**:
   - Prioritize security updates
   - Suggest safe batch updates
   - Flag risky updates needing investigation

## Output Format

```markdown
## NPM Update Analysis

### Summary
- **Total packages**: X can be updated
- **Major updates**: Y (require investigation)
- **Minor updates**: Z (generally safe)
- **Patch updates**: W (safe)

### Major Updates (Breaking Changes)

| Package | Current | Latest | Key Changes |
|---------|---------|--------|-------------|
| vite | 5.4.0 | 7.0.0 | Node.js 22.12+ required, new config format |

### Minor/Patch Updates (Safe)

| Package | Current | Latest | Type |
|---------|---------|--------|------|
| vue | 3.5.0 | 3.5.5 | patch |
| vitest | 4.0.0 | 4.1.0 | minor |

### Recommendations

1. **Update immediately**: [list security-critical patches]
2. **Safe to batch update**: [list minor/patch updates]
3. **Investigate first**: [list major updates with notes]

### Commands

```bash
# Update all safe packages (minor/patch)
npx ncu -u --target minor && npm install

# Update specific package
npx ncu -u -f "package-name" && npm install

# Interactive update
npx ncu -i
```
```

## Common Packages in This Project

### Build Tools
- **vite**: Build tool - major updates often change config
- **vue-tsc**: TypeScript checking - tied to Vue/TS versions
- **typescript**: Check compatibility with Vue and libraries

### Testing
- **vitest**: Test runner - usually safe minor updates
- **@vue/test-utils**: Tied to Vue version

### Vue Ecosystem
- **vue**: Core framework - minor updates usually safe
- **@vitejs/plugin-vue**: Should match Vite version

### Dependencies
- **dompurify**: Security-critical, prioritize updates
- **markdown-it**: Usually safe to update
- **swiper**: Check for API changes in major updates

## ncu Command Options

```bash
npx ncu                    # List all updates
npx ncu -u                 # Update package.json
npx ncu -t minor           # Only show minor/patch updates
npx ncu -t newest          # Show newest versions
npx ncu -f "vite"          # Filter specific package
npx ncu --doctor           # Test updates iteratively
npx ncu -i                 # Interactive mode
```

## Safety Checklist Before Major Updates

- [ ] Read the changelog for breaking changes
- [ ] Check if migration guide exists
- [ ] Verify Node.js version compatibility
- [ ] Check peer dependency requirements
- [ ] Run tests after updating
- [ ] Verify build succeeds