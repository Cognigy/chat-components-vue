# Coding Philosophy Skill

## Core Principles

When writing or modifying code, follow these principles:

1. **Maintainability** - Code should be easy to understand and modify by others
2. **Performance** - Optimize for runtime performance where it matters
3. **Readability** - Code should be self-documenting; clarity over cleverness
4. **Simplicity** - Keep implementations straightforward and reliable
5. **DRY (Don't Repeat Yourself)** - Avoid code duplication in production code
   - **Exception: Tests are exempt from DRY** - Tests should be isolated and self-contained, even if repetitive

## Ranch vs. Skyscraper Code

**Prefer robust, simple "ranch-like" code over fancy, modern "skyscraper-like" implementations.**

### Why Ranch-Like Code?

Like a ranch house, good code should be:
- **Accessible** - Easy to enter and navigate
- **Maintainable** - Simple to repair and modify
- **Reliable** - Built on solid, proven foundations
- **Practical** - Focused on real needs, not impressive features

### Avoid (Skyscraper-like)

❌ **Over-engineered abstractions**
- Creating generic solutions for specific problems
- Building frameworks within applications
- Adding layers "for flexibility" without concrete needs

❌ **Clever one-liners that sacrifice clarity**
```javascript
// Bad: Clever but cryptic
const x = arr.reduce((a,b)=>a.concat(b.filter(c=>c.id===id).map(c=>({...c,v:c.v*2}))),[])[0]?.v??0

// Good: Clear and explicit
function getDoubledValue(arrays, id) {
  const item = arrays
    .flat()
    .find(item => item.id === id)

  return item ? item.value * 2 : 0
}
```

❌ **Unnecessary advanced patterns**
- Using design patterns when simple functions work
- Overusing functional programming concepts
- Applying "best practices" without understanding why

❌ **Deeply nested structures**
```javascript
// Bad: Deep nesting
const result = data?.level1?.level2?.level3?.value

// Good: Explicit checks with clear intent
function getValue(data) {
  if (!data?.level1?.level2) {
    return null
  }
  return data.level1.level2.level3?.value ?? null
}
```

❌ **Premature optimization or abstraction**
- Optimizing before measuring
- Creating utilities for one use case
- Building for hypothetical future needs

### Prefer (Ranch-like)

✅ **Straightforward, explicit code**
```javascript
// Good: Clear intent, easy to debug
function processUser(user) {
  if (!user) {
    console.error('processUser: user is required')
    return null
  }

  if (!user.email) {
    console.warn('processUser: user missing email', { userId: user.id })
    return null
  }

  return {
    id: user.id,
    email: user.email.toLowerCase(),
    name: user.name || 'Unknown'
  }
}
```

✅ **Simple functions that do one thing well**
```javascript
// Good: Single responsibility, clear purpose
function validateEmail(email) {
  if (!email) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function isEmailValid(email) {
  if (!email) return false
  const normalized = normalizeEmail(email)
  return validateEmail(normalized)
}
```

✅ **Clear variable names that explain intent**
```javascript
// Bad
const d = Date.now()
const u = users.filter(u => u.a)

// Good
const currentTimestamp = Date.now()
const activeUsers = users.filter(user => user.isActive)
```

✅ **Flat, readable control flow**
```javascript
// Good: Early returns keep code flat
function calculateDiscount(user, order) {
  if (!user) {
    return 0
  }

  if (!order.total) {
    return 0
  }

  if (!user.isPremium) {
    return 0
  }

  if (order.total < 100) {
    return order.total * 0.05
  }

  return order.total * 0.10
}
```

✅ **Tried-and-true patterns over bleeding-edge techniques**
- Use proven solutions that your team understands
- Adopt new patterns only when they solve real problems
- Value long-term maintainability over novelty

## Error Handling

**Make potential failure points visible and handle errors gracefully.**

### Key Principles

1. **Validate inputs early** - Check at function boundaries
2. **Fail visibly** - Log errors with context, don't silently swallow them
3. **Provide fallbacks** - Degrade gracefully rather than crashing
4. **Make errors actionable** - Include enough information to debug

### Examples

❌ **Avoid: Silent failures**
```javascript
function getUserData(userId) {
  const user = database.users[userId]
  return user.profile.settings.theme
}
```

✅ **Prefer: Explicit error handling**
```javascript
function getUserTheme(userId) {
  // Validate input
  if (!userId) {
    console.error('getUserTheme: userId is required')
    return 'default'
  }

  // Safe navigation with logging
  const user = database.users[userId]
  if (!user) {
    console.warn('getUserTheme: user not found', { userId })
    return 'default'
  }

  const theme = user.profile?.settings?.theme
  if (!theme) {
    console.info('getUserTheme: no theme set, using default', { userId })
    return 'default'
  }

  return theme
}
```

✅ **Prefer: Try-catch with context**
```javascript
function saveUserSettings(userId, settings) {
  try {
    // Validate inputs
    if (!userId) {
      throw new Error('userId is required')
    }
    if (!settings) {
      throw new Error('settings is required')
    }

    // Perform operation
    database.users[userId].settings = settings
    return { success: true }

  } catch (error) {
    console.error('saveUserSettings: failed to save', {
      error,
      userId,
      settingsKeys: settings ? Object.keys(settings) : []
    })

    // Return error state, don't throw
    return {
      success: false,
      error: error.message
    }
  }
}
```

### Error Logging Best Practices

Always include context:
```javascript
// Bad: Not helpful for debugging
console.error('Error')

// Good: Actionable information
console.error('Failed to fetch user data', {
  userId: userId,
  endpoint: '/api/users',
  statusCode: response.status,
  error: error.message
})
```

## Null Safety

### Guidelines

- Use optional chaining (`?.`) judiciously
- Validate data at boundaries (props, API responses, user input)
- Provide sensible defaults
- Don't hide errors with excessive `??` operators

### Examples

```javascript
// ✅ Good: Clear null handling at boundaries
function formatUserName(user) {
  if (!user) {
    console.warn('formatUserName: user is null/undefined')
    return 'Guest'
  }

  // Now we know user exists
  const firstName = user.firstName || ''
  const lastName = user.lastName || ''

  if (!firstName && !lastName) {
    return 'Anonymous User'
  }

  return `${firstName} ${lastName}`.trim()
}

// ✅ Good: Explicit checks with clear intent
function canUserEdit(user, document) {
  if (!user) return false
  if (!document) return false
  if (!user.permissions) return false

  return user.permissions.includes('edit') &&
         document.ownerId === user.id
}
```

## Comments and Documentation

### When to Comment

✅ **DO comment:**
- **Why** something is done (not obvious from code)
- Workarounds for bugs or limitations
- Complex algorithms or business logic
- Security considerations
- Performance optimizations

❌ **DON'T comment:**
- What the code does (should be self-evident)
- Obvious statements
- Commented-out code (delete it)
- TODO without context or owner

### Examples

```javascript
// ❌ Bad: States the obvious
// Loop through users
for (const user of users) {
  // Set active to true
  user.active = true
}

// ✅ Good: Explains why
// Mark all users as active to reset after maintenance window.
// This ensures notifications resume for everyone (TICKET-1234)
for (const user of users) {
  user.active = true
}

// ✅ Good: Explains workaround
// Using setTimeout to defer execution because the library
// doesn't properly handle immediate callbacks (Library Issue #456)
setTimeout(() => processCallback(), 0)

// ✅ Good: Security context
// Sanitize user input to prevent XSS attacks.
// See OWASP guidelines: https://...
const sanitized = DOMPurify.sanitize(userInput)
```

## Code Review Checklist

Before submitting code, verify:

### Readability
- ✅ Code is easy to read and understand
- ✅ No unnecessary complexity or cleverness
- ✅ Function names clearly describe what they do
- ✅ Variable names explain their purpose
- ✅ Comments explain "why", not "what"

### Error Handling
- ✅ Error cases are handled explicitly
- ✅ Errors are logged with sufficient context
- ✅ Null/undefined checks at boundaries
- ✅ No silent failures or swallowed errors
- ✅ Graceful degradation when possible

### Quality
- ✅ No duplicated code
- ✅ **Public API types define clear contracts** (props, callbacks, exports)
- ✅ `any` only used for acceptable cases (extensibility, pass-through, external lib gaps)
- ✅ Functions are focused (do one thing well)
- ✅ No magic numbers or strings (use constants)
- ✅ Performance-sensitive paths are optimized
- ✅ Code follows team conventions

### Testing
- ✅ **Tests verify behavior** (not just "exists" or "defined" checks)
- ✅ **No CSS class existence tests** (brittle, breaks on refactor)
- ✅ Tests cover config effects (settings change behavior)
- ✅ Tests cover interactions (actions called with correct payloads)
- ✅ Data-driven tests for repetitive cases (`it.each`)
- ✅ Tests are readable and self-contained

## When in Doubt

Follow these decision-making principles:

### 1. Choose clarity over cleverness
```javascript
// Clever but confusing
const result = items.reduce((a, b) => ({ ...a, [b.id]: b }), {})

// Clear and explicit
const result = {}
for (const item of items) {
  result[item.id] = item
}
```

### 2. Choose explicitness over implicitness
```javascript
// Implicit behavior
function save(data) {
  db.save(data)
  notify()
}

// Explicit behavior
function saveAndNotify(data) {
  const saveResult = db.save(data)
  if (saveResult.success) {
    notify('Data saved successfully')
  }
  return saveResult
}
```

### 3. Choose simplicity over abstraction
```javascript
// Over-abstracted
class DataProcessor {
  constructor(strategy) {
    this.strategy = strategy
  }
  process(data) {
    return this.strategy.execute(data)
  }
}

// Simple and direct
function processData(data) {
  return data.filter(item => item.isValid)
             .map(item => item.value)
}
```

### 4. Choose reliability over novelty
- Use proven patterns your team knows
- Adopt new techniques only when they solve real problems
- Value long-term maintainability over "cutting edge"

### Ask Yourself

Before writing complex code, ask:
- **Can this be done more simply?**
  - Often yes. Step back and think of the simplest approach.

- **Will someone else understand this in 6 months?**
  - If not, simplify or add explanatory comments.

- **What happens when this fails?**
  - Add error handling and logging.

- **Is this solving a real problem or a hypothetical one?**
  - Solve real problems. Don't build for "what if."

- **Is this optimization necessary?**
  - Measure first. Optimize only when proven needed.

## DRY Principle (Don't Repeat Yourself)

**Keep production code DRY, but allow tests to be repetitive.**

### In Production Code: Eliminate Duplication

Duplicated code is harder to maintain. When you need to fix a bug or change behavior, you must remember to update it in multiple places.

#### ❌ Bad: Repeated Logic
```javascript
// Bad: Same validation logic repeated
function createUser(data) {
  if (!data.email || !data.email.includes('@')) {
    throw new Error('Invalid email')
  }
  if (data.email.length > 255) {
    throw new Error('Email too long')
  }
  // create user...
}

function updateUser(id, data) {
  if (!data.email || !data.email.includes('@')) {
    throw new Error('Invalid email')
  }
  if (data.email.length > 255) {
    throw new Error('Email too long')
  }
  // update user...
}
```

#### ✅ Good: Extract Common Logic
```javascript
// Good: Validation logic in one place
function validateEmail(email) {
  if (!email || !email.includes('@')) {
    throw new Error('Invalid email')
  }
  if (email.length > 255) {
    throw new Error('Email too long')
  }
}

function createUser(data) {
  validateEmail(data.email)
  // create user...
}

function updateUser(id, data) {
  validateEmail(data.email)
  // update user...
}
```

#### When to Extract

Extract repeated code when:
- ✅ The same logic appears 3+ times
- ✅ The logic is complex or likely to change
- ✅ The abstraction has a clear, single purpose
- ✅ The extracted code makes the intent clearer

Don't extract when:
- ❌ It's only used twice and unlikely to change
- ❌ The abstraction would be forced or unclear
- ❌ It would make the code harder to understand
- ❌ The "duplication" is coincidental (same code, different purpose)

### In Tests: Repetition is OK

**Tests are exempt from DRY.** Tests should be:
- **Isolated** - Each test stands alone
- **Self-contained** - Everything needed is visible in the test
- **Readable** - Clear what's being tested without jumping between files

#### ✅ Good: Repetitive But Clear Tests
```javascript
// Good: Each test is self-contained and clear
describe('validateEmail', () => {
  it('rejects email without @', () => {
    expect(() => validateEmail('notanemail')).toThrow('Invalid email')
  })

  it('rejects empty email', () => {
    expect(() => validateEmail('')).toThrow('Invalid email')
  })

  it('rejects null email', () => {
    expect(() => validateEmail(null)).toThrow('Invalid email')
  })

  it('rejects email over 255 characters', () => {
    const longEmail = 'a'.repeat(250) + '@test.com'
    expect(() => validateEmail(longEmail)).toThrow('Email too long')
  })

  it('accepts valid email', () => {
    expect(() => validateEmail('user@example.com')).not.toThrow()
  })
})
```

#### ❌ Bad: Over-DRY Tests
```javascript
// Bad: Tests are DRY but hard to understand
describe('validateEmail', () => {
  const testCases = [
    { input: 'notanemail', error: 'Invalid email', desc: 'no @' },
    { input: '', error: 'Invalid email', desc: 'empty' },
    { input: null, error: 'Invalid email', desc: 'null' },
    { input: 'a'.repeat(250) + '@test.com', error: 'Email too long', desc: 'too long' },
  ]

  testCases.forEach(({ input, error, desc }) => {
    it(`rejects ${desc}`, () => {
      expect(() => validateEmail(input)).toThrow(error)
    })
  })

  it('accepts valid email', () => {
    expect(() => validateEmail('user@example.com')).not.toThrow()
  })
})
```

**Why the repetitive version is better:**
- Each test is immediately readable without referencing arrays
- Easy to add test-specific setup or assertions
- Changing one test doesn't risk affecting others
- Stack traces point to exact test, not generic loop
- Easy to run or skip individual tests

#### When Test Helpers Are OK

You can use helpers for complex setup that would obscure the test:

```javascript
// ✅ Good: Helper for complex setup
function createTestUser(overrides = {}) {
  return {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    createdAt: '2024-01-01',
    ...overrides
  }
}

describe('updateUser', () => {
  it('updates user email', () => {
    const user = createTestUser()
    const updated = updateUser(user.id, { email: 'new@example.com' })

    expect(updated.email).toBe('new@example.com')
  })

  it('updates user name', () => {
    const user = createTestUser()
    const updated = updateUser(user.id, { name: 'New Name' })

    expect(updated.name).toBe('New Name')
  })
})
```

**Guidelines for test helpers:**
- Use helpers for complex object creation
- Keep helpers simple and obvious
- Don't hide the actual test assertions in helpers
- Each test should still be readable on its own

### Summary: DRY in Practice

| Code Type | DRY? | Why |
|-----------|------|-----|
| Business logic | ✅ Yes | Maintainability, single source of truth |
| Utility functions | ✅ Yes | Reuse, consistency |
| Configuration | ✅ Yes | Single source, easy updates |
| Tests | ❌ No | Isolation, readability, debuggability |
| Test setup helpers | ⚠️ Maybe | Only for complex object creation |

**Golden Rule:** In production code, DRY prevents bugs. In tests, repetition prevents confusion.

## Anti-Patterns to Avoid

### 1. TypeScript Typing Philosophy

**Root types (`any`, `unknown`) indicate a design decision, not a solution.**

Neither `any` nor `unknown` should be common in a well-typed codebase. If you're reaching for root types frequently, something is wrong with your type design.

**The `any` vs `unknown` debate is a distraction:**

Some developers abolish `any` at all costs and enforce `unknown`. Others use `any` wherever they want to skip typing. Both miss the point:

- **The problem with `unknown` zealotry:** Narrowing requires knowing the types anyway (`if (typeof x === 'string')`). This is the same work as defining `x: string | number` upfront. You end up with either a union type or runtime checks that duplicate what a type definition would provide. `unknown` just adds ceremony.

- **The problem with `any` everywhere:** Defeats the purpose of TypeScript. Types exist to catch errors at compile time - `any` opts out of this.

**The real solution:**

**First ask: Can I define a proper type?**
- If YES → Define it (interface, union type, `Record<string, T>`)
- If NO (genuinely dynamic/volatile) → Use `any` consciously with optional chaining

**Decision tree:**
1. **Can I define the type?** → Define it
2. **Is this a public API?** → Must define it (this is your contract with consumers)
3. **Is data genuinely dynamic?** → Use `any` with optional chaining (`data?.id`)
4. **External library gap?** → Use `any` with explanatory comment

```typescript
// PUBLIC API: Must be typed (contract)
interface Props {
  customIcon?: Component | string
  onAnalytics?: (event: string, data: AnalyticsEvent) => void
}

// EXTENSIBILITY: any OK for dynamic keys
interface Translations {
  [key: string]: any  // i18n, user-defined keys
}

// PASS-THROUGH: any OK, flows unchanged
type MessageSender = (data?: Record<string, any>) => void
```

**When `any` is acceptable:** Extensibility points, pass-through data, external library gaps
**When `any` is NOT acceptable:** Public APIs, known shapes, convenience shortcuts
**Don't use `unknown` as "safer any"** - it's not, it just adds ceremony

### 2. Premature Abstraction
```javascript
// ❌ Bad: Abstraction for one use case
class StringUtils {
  static toLowerCase(str) {
    return str.toLowerCase()
  }
}

// ✅ Good: Use built-in methods directly
const lower = string.toLowerCase()
```

### 3. God Functions
```javascript
// ❌ Bad: Does too many things
function handleUserAction(action, user, data) {
  if (action === 'login') {
    // 50 lines of login logic
  } else if (action === 'logout') {
    // 30 lines of logout logic
  } else if (action === 'update') {
    // 40 lines of update logic
  }
  // ... more actions
}

// ✅ Good: Separate functions
function handleLogin(user) { /* ... */ }
function handleLogout(user) { /* ... */ }
function handleUpdate(user, data) { /* ... */ }

function handleUserAction(action, user, data) {
  const handlers = {
    login: () => handleLogin(user),
    logout: () => handleLogout(user),
    update: () => handleUpdate(user, data)
  }

  const handler = handlers[action]
  if (!handler) {
    console.error('Unknown action', { action })
    return
  }

  return handler()
}
```

### 4. Callback Hell / Deep Nesting
```javascript
// ❌ Bad: Deep nesting
getData((data) => {
  processData(data, (result) => {
    saveResult(result, (saved) => {
      notify(saved, (notified) => {
        // ...
      })
    })
  })
})

// ✅ Good: Flat with async/await
async function processAndSave() {
  const data = await getData()
  const result = await processData(data)
  const saved = await saveResult(result)
  await notify(saved)
}
```

### 5. Magic Values
```javascript
// ❌ Bad: Magic numbers and strings
if (user.status === 2) {
  // What does 2 mean?
}

// ✅ Good: Named constants
const USER_STATUS = {
  PENDING: 1,
  ACTIVE: 2,
  SUSPENDED: 3
}

if (user.status === USER_STATUS.ACTIVE) {
  // Clear intent
}
```

## Summary

Good code is like a well-built ranch:
- **Simple** - Easy to understand at a glance
- **Solid** - Built on reliable foundations
- **Maintainable** - Easy to modify and repair
- **Practical** - Solves real problems effectively

Bad code is like a skyscraper with structural issues:
- **Complex** - Difficult to understand
- **Fragile** - Small changes break things
- **Intimidating** - Developers afraid to modify it
- **Over-engineered** - Built for problems that don't exist

**Write code for the person who will maintain it in 6 months — that person might be you.**
