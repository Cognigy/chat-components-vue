# Claude Configuration Files

This directory contains reusable Claude configurations and skills.

## Files

### 1. `skills/coding-philosophy.md`
**Comprehensive coding philosophy skill** (15KB)

A detailed skill that can be invoked in Claude Code to apply consistent coding standards.

**Usage in Claude Code:**
```
Please follow the coding-philosophy skill when writing this code.
```

Or reference it when reviewing code:
```
Review this code according to the coding-philosophy skill.
```

### 2. `agents/port-component.md`
**Component porting agent** (30KB)

Specialized agent for porting React components to Vue 3. See main README for usage.

### 3. `custom-instructions.txt`
**Condensed version for account-wide settings** (2KB)

A shorter version of the coding philosophy that fits in Claude's custom instructions.

## How to Use These Across Different Claude Instances

### Option 1: Claude Code (Project-Level)

These files are automatically available in Claude Code when you're in this project directory.

**Invoke the skill:**
```bash
# In Claude Code
Please write this function following the coding-philosophy skill
```

**Invoke the agent:**
```bash
# In Claude Code
/port-component ../react-repo/src/Component.tsx
```

### Option 2: Claude Code (Global Skill)

To make the coding philosophy available across **all your Claude Code projects**:

1. Copy the skill to your global skills directory:
```bash
# On macOS/Linux
mkdir -p ~/.config/claude-code/skills
cp .claude/skills/coding-philosophy.md ~/.config/claude-code/skills/

# On Windows
mkdir %APPDATA%\claude-code\skills
copy .claude\skills\coding-philosophy.md %APPDATA%\claude-code\skills\
```

2. Now you can reference it in any project:
```bash
Apply the coding-philosophy skill when implementing this feature
```

### Option 3: Claude.ai Web (Account Custom Instructions)

To apply these principles across **all your Claude conversations**:

1. Go to [claude.ai](https://claude.ai)
2. Click your profile → Settings → Custom Instructions
3. Copy the contents of `.claude/custom-instructions.txt`
4. Paste into the Custom Instructions field
5. Save

Now every conversation with Claude will follow these coding principles.

### Option 4: Claude Desktop/API (Per-Conversation)

Include at the start of your conversation:

```
Please follow these coding principles throughout our session:
[paste custom-instructions.txt content]
```

Or reference the skill file:
```
Please review the coding philosophy in .claude/skills/coding-philosophy.md
and apply those principles to all code you write in this conversation.
```

### Option 5: Copy to Other Repositories

To use in another project:

```bash
# Copy the entire .claude directory
cp -r /path/to/vue-version/.claude /path/to/other-project/

# Or copy specific files
cp /path/to/vue-version/.claude/skills/coding-philosophy.md /path/to/other-project/.claude/skills/
```

## File Comparison

| File | Size | Use Case | Where to Use |
|------|------|----------|--------------|
| `skills/coding-philosophy.md` | 15KB | Detailed reference with examples | Claude Code (local or global) |
| `custom-instructions.txt` | 2KB | Concise principles | claude.ai account settings |
| `agents/port-component.md` | 30KB | React→Vue porting | Claude Code (this project) |

## When to Use Each

### Use the Full Skill (`coding-philosophy.md`) when:
- Working on a complex codebase
- Need detailed examples and anti-patterns
- Want comprehensive error handling guidance
- Reviewing code for quality issues

### Use Custom Instructions (`custom-instructions.txt`) when:
- Want consistent behavior across all Claude conversations
- Need concise reminders of key principles
- Setting account-wide preferences
- Have limited character count (API/settings)

### Use the Port Agent (`port-component.md`) when:
- Porting React components to Vue 3
- Need automated conversion with tests and docs
- Working in this specific project

## Customization

Feel free to modify these files to match your team's standards:

1. **Add language-specific patterns**
   - Python examples for Python projects
   - Go patterns for Go projects

2. **Add team conventions**
   - Naming conventions
   - File organization
   - Git commit styles

3. **Remove sections**
   - If certain anti-patterns don't apply to your work
   - If you have different error handling preferences

4. **Extend with domain knowledge**
   - Security requirements for your industry
   - Performance constraints for your use case
   - Compliance requirements

## Examples

### Example 1: Applying the Skill Globally

```bash
# Make skill available globally
mkdir -p ~/.config/claude-code/skills
cp .claude/skills/coding-philosophy.md ~/.config/claude-code/skills/

# In any project, Claude Code will recognize:
"Please refactor this code following coding-philosophy principles"
```

### Example 2: Using in Code Review

```bash
# In Claude Code
"Review this pull request against the coding-philosophy skill and identify:
1. Ranch vs. skyscraper issues
2. Error handling problems
3. Clarity improvements"
```

### Example 3: Teaching the Principles

```bash
# In Claude Code
"Explain why this code violates the coding-philosophy skill:
[paste code]

Then rewrite it following the principles."
```

## Benefits

Using these configurations consistently across your projects provides:

1. **Consistent code style** across all Claude-assisted development
2. **Better maintainability** through enforced simplicity
3. **Fewer bugs** through explicit error handling
4. **Easier onboarding** - new developers see clear patterns
5. **Better reviews** - objective criteria for code quality

## Contributing

When you discover new anti-patterns or better examples:

1. Update `skills/coding-philosophy.md` with detailed examples
2. Update `custom-instructions.txt` if it's a core principle
3. Share with your team
4. Consider contributing back to the original repository

## License

These configuration files are provided as-is for use in your projects. Modify freely to match your team's needs.
