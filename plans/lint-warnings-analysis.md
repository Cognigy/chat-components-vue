# ESLint Warnings Analysis

**Date:** 2026-01-16
**Total Warnings:** 24
**Errors:** 0

This document analyzes the lint warnings from the upgraded ESLint configuration (eslint-plugin-vue 10 + typescript-eslint 8) to provide context for future remediation.

---

## Why Types Matter in a Library Context

**For a library, strict types ARE the contract.** They communicate to consumers:
- What data shapes are valid inputs
- What structure callbacks will receive
- What configuration options are available

```typescript
// Unclear contract - consumer has no guidance
customIcon?: any
onEmitAnalytics?: (event: string, data: any) => void

// Clear contract - consumer knows exactly what to provide
customIcon?: VNode | Component | string
onEmitAnalytics?: (event: string, data: AnalyticsEvent) => void
```

**Benefits of strict types for library consumers:**
- IDE autocompletion showing valid options
- Compile-time errors when passing wrong shapes
- Self-documenting API (reduces need to read docs)
- Catches breaking changes during upgrades

**When `any` is acceptable:**

| Pattern | Recommendation |
|---------|----------------|
| Plugin systems | `any` - user-defined components can return anything |
| Pass-through data | `any` - data flows untouched to external systems |
| Dynamic nested objects | `Record<string, any>` - allows property access |
| External library gaps | `any` with eslint-disable + comment explaining why |
| Volatile API responses | `any` with optional chaining for runtime safety |

---

## Summary by Category

| Category | Count | Priority |
|----------|-------|----------|
| `@typescript-eslint/no-explicit-any` in production code | 9 | High |
| `@typescript-eslint/no-explicit-any` in test code | 9 | Medium |
| `@typescript-eslint/no-unused-vars` in test code | 6 | Low |

### Production Code Classification

| Warning | Public Contract? | Verdict |
|---------|------------------|---------|
| `customIcon` prop | Yes | **Must type** - consumers need to know valid icon types |
| `onEmitAnalytics` callback | Yes | **Must type** - documents analytics event structure |
| Translation index signatures | Extensibility point | **Acceptable** - dynamic keys, use `Record<string, any>` |
| `MessageSender` data | Pass-through | **Acceptable** - flows to external system unchanged |
| `isOnlyEscapeSequence` param | Internal | **Should type** - define as `string` with early return for non-strings |
| DOMPurify hook | External lib | **Acceptable** - library types incomplete, add eslint-disable + comment |

---

## Category 1: Production Code `any` Types (High Priority)

These warnings indicate places where proper TypeScript types should be defined. They affect type safety, IDE autocompletion, and the library's public API contract.

### 1.1 ActionButton.vue (lines 30, 34)

**File:** `src/components/common/ActionButton.vue`

```typescript
// Line 30
customIcon?: any

// Line 34
onEmitAnalytics?: (event: string, data: any) => void
```

**Context:** Props interface for the ActionButton component.

**Recommended Fix:**
```typescript
// For customIcon - define a union type or use VNode
import type { VNode, Component } from 'vue'
customIcon?: VNode | Component | string

// For onEmitAnalytics - define an analytics data interface
interface AnalyticsEventData {
  [key: string]: string | number | boolean | null | undefined
}
onEmitAnalytics?: (event: string, data: AnalyticsEventData) => void
```

**Effort:** Medium - requires defining new types and updating all usages

---

### 1.2 ActionButtons.vue (lines 15, 19)

**File:** `src/components/common/ActionButtons.vue`

```typescript
// Line 15
customIcon?: any

// Line 19
onEmitAnalytics?: (event: string, data: any) => void
```

**Context:** Same pattern as ActionButton - this component passes these props through.

**Recommended Fix:** Same as ActionButton.vue - share types via the types/index.ts file.

**Effort:** Low (once ActionButton types are defined)

---

### 1.3 types/index.ts (lines 146, 148, 171)

**File:** `src/types/index.ts`

```typescript
// Line 146 - Inside CustomTranslations.ariaLabels
[key: string]: any

// Line 148 - Inside CustomTranslations
[key: string]: any

// Line 171 - MessageSender data parameter
data?: Record<string, any> | null
```

**Context:** These are intentional escape hatches for:
1. Translations object allows arbitrary keys for different languages/contexts
2. MessageSender data can contain any payload from button actions

**Recommended Fix:**
```typescript
// For translations - keep as any, this is an extensibility point
[key: string]: any  // Acceptable: dynamic keys for i18n

// For MessageSender - this is pass-through data to external system
data?: Record<string, any> | null  // Acceptable: flows to socket-client unchanged
```

**Effort:** Low - these are acceptable uses of `any`

**Note:** These are legitimate uses of `any`:
- Translation keys are dynamic and consumer-defined
- MessageSender data passes through to @cognigy/socket-client unchanged

---

### 1.4 matcher.ts (line 43)

**File:** `src/utils/matcher.ts`

```typescript
function isOnlyEscapeSequence(text: any): boolean {
```

**Context:** Helper function that checks if text is whitespace-only. Uses `any` to handle potential non-string inputs defensively.

**Recommended Fix:**
```typescript
function isOnlyEscapeSequence(text: string | null | undefined): boolean {
  if (typeof text !== 'string') {
    return false
  }
  // ... rest of function
}
```

**Effort:** Low - define the actual expected input types

**Note:** Using `unknown` here would require the same `typeof` check anyway, but defining the actual expected types (`string | null | undefined`) is more honest about what the function handles.

---

### 1.5 sanitize.ts (line 88)

**File:** `src/utils/sanitize.ts`

```typescript
DOMPurify.addHook('beforeSanitizeElements', (node: any) => {
```

**Context:** DOMPurify hook callback. The library's types may not fully describe the node parameter.

**Recommended Fix:**
```typescript
// Option 1: Use Element type with type guard
DOMPurify.addHook('beforeSanitizeElements', (node: Element) => {
  if (node instanceof HTMLUnknownElement) {
    // ...
  }
})

// Option 2: Check DOMPurify types for proper callback signature
import type { DOMPurifyI } from 'dompurify'
// Use the correct type from the library
```

**Effort:** Low - verify DOMPurify types and use appropriate type

---

## Category 2: Test Code `any` Types (Medium Priority)

Test code uses `any` for convenience when mocking data. While not as critical as production code, these can be improved for better test maintainability.

### 2.1 ActionButtons.spec.ts (lines 101, 121, 207)

**File:** `test/ActionButtons.spec.ts`

```typescript
// Line 101 - Testing invalid button types
const invalidButtons: any = [...]

// Line 121 - Testing buttons without title
const buttonsWithInvalid: any = [...]

// Line 207 - Mock config object
const mockConfig: any = {...}
```

**Context:** Intentionally creating malformed data to test error handling.

**Recommended Fix:**
```typescript
// For invalid test data, cast at usage point instead
const invalidButtons = [
  ...mockButtons,
  { type: 'invalid_type', title: 'Invalid', payload: 'test' },
] as IWebchatButton[]

// For partial config, use Partial<ChatConfig>
const mockConfig: Partial<ChatConfig> = {...}
```

**Effort:** Low - but may require updating test assertions

---

### 2.2 AdaptiveCard.spec.ts (line 10)

**File:** `test/AdaptiveCard.spec.ts`

```typescript
const createAdaptiveCardMessage = (payload: any, location: ...): IMessage
```

**Context:** Factory function for test data allows any payload shape.

**Recommended Fix:**
```typescript
interface AdaptiveCardPayload {
  type: string
  version?: string
  body?: unknown[]
  actions?: unknown[]
  [key: string]: unknown
}

const createAdaptiveCardMessage = (
  payload: AdaptiveCardPayload,
  location: 'webchat' | 'defaultPreview' | 'plugin' = 'webchat'
): IMessage
```

**Effort:** Medium - requires defining AdaptiveCard payload interface

---

### 2.3 ImageMessage.spec.ts (line 10)

**File:** `test/ImageMessage.spec.ts`

```typescript
const createImageMessage = (url: string, altText?: string, buttons?: any[]): IMessage
```

**Context:** Factory function accepts any array for buttons parameter.

**Recommended Fix:**
```typescript
const createImageMessage = (
  url: string,
  altText?: string,
  buttons?: (IWebchatButton | IWebchatQuickReply)[]
): IMessage
```

**Effort:** Low

---

### 2.4 List.spec.ts (line 259)

**File:** `test/List.spec.ts`

```typescript
const attachment = message.data._cognigy._webchat.message.attachment as any
```

**Context:** Type assertion to modify nested object for test setup.

**Recommended Fix:**
```typescript
// Define a type for the list attachment
interface IWebchatListAttachment {
  type: 'list'
  payload: {
    elements: ListElement[]
    buttons?: IWebchatButton[]
    // ... other fields
  }
}

const attachment = message.data._cognigy._webchat.message.attachment as IWebchatListAttachment
```

**Effort:** Medium - requires defining attachment interface

---

### 2.5 Message.spec.ts (lines 350, 387)

**File:** `test/Message.spec.ts`

```typescript
// Line 350
} as any)

// Line 387
} as any)
```

**Context:** Creating message objects with `id` field that isn't in the base IMessage type.

**Recommended Fix:**
```typescript
// Extend IMessage for test scenarios
interface IMessageWithId extends IMessage {
  id?: string
}

const message = createMessage({
  ...createMessage(),
  id: 'test-message-123',
}) as IMessageWithId
```

**Effort:** Low

---

### 2.6 Typography.spec.ts (line 35)

**File:** `test/Typography.spec.ts`

```typescript
variant: variant as any,
```

**Context:** Iterating over variant strings and casting to avoid type errors.

**Recommended Fix:**
```typescript
// Define variant type explicitly
type TypographyVariant = 'body-regular' | 'body-semibold' | 'title1-regular' | ...

const variants: [TypographyVariant, string][] = [
  ['body-regular', 'P'],
  // ...
]

variants.forEach(([variant, expectedTag]) => {
  // variant is now properly typed
})
```

**Effort:** Low

---

## Category 3: Unused Variables in Tests (Low Priority)

These are leftover imports that should be removed for cleanliness.

### 3.1 Unused `beforeEach` imports

**Files:**
- `test/TextMessage.spec.ts` (line 1)
- `test/TextWithButtons.spec.ts` (line 1)
- `test/VideoMessage.spec.ts` (line 1)

**Current:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
```

**Fix:**
```typescript
import { describe, it, expect } from 'vitest'
```

---

### 3.2 Unused `vi` import

**File:** `test/Message.spec.ts` (line 1)

**Current:**
```typescript
import { describe, it, expect, vi } from 'vitest'
```

**Fix:**
```typescript
import { describe, it, expect } from 'vitest'
```

---

### 3.3 Unused `h` import

**File:** `test/useSanitize.spec.ts` (line 3)

**Current:**
```typescript
import { defineComponent, h } from 'vue'
```

**Fix:**
```typescript
import { defineComponent } from 'vue'
```

---

### 3.4 Unused `imageContainer` variable

**File:** `test/ImageMessage.spec.ts` (line 177)

**Current:**
```typescript
const imageContainer = wrapper.find('img').element.parentElement!
await wrapper.trigger('click')
```

**Fix:** Remove the unused variable:
```typescript
await wrapper.trigger('click')
```

---

## Remediation Plan

### Phase 1: Quick Wins (Low Effort)
1. Remove unused imports from test files (6 warnings)
2. Change `any` to `unknown` in `matcher.ts` (1 warning)
3. Fix DOMPurify callback type in `sanitize.ts` (1 warning)

### Phase 2: Test Improvements (Medium Effort)
1. Create test helper types for mock data
2. Update test factories to use proper types
3. Use `Partial<T>` instead of `any` for partial objects

### Phase 3: Production Type Improvements (Higher Effort)
1. Define `AnalyticsEventData` interface
2. Define `CustomIcon` union type
3. Review upstream types from @cognigy/socket-client
4. Update `CustomTranslations` interface if possible

---

## Commands

```bash
# Run lint to see current warnings
npm run lint

# Run lint with auto-fix for fixable issues
npm run lint -- --fix

# Check specific file
npx eslint src/utils/matcher.ts
```

---

## Decision Framework: Root Types as Design Decisions

**Root types (`any`, `unknown`) indicate a design decision, not a solution.**

Neither `any` nor `unknown` should be common in your codebase. If you're reaching for root types frequently, something is wrong with your type design.

The `any` vs `unknown` debate is a **distraction** from the real question:

> **"Can I define a proper type for this?"**

If yes → define it (interface, union, `Record<string, T>`).
If no → use `any` consciously with optional chaining for runtime safety.

Don't use `unknown` as "safer any" - it's not. It just adds ceremony without benefit.

### Decision Process

Before using any root type, ask:

1. **Can I define a proper type?** → Define it (interface, union, `Record<string, T>`)
2. **Is this a public API?** → Must define it (this is your contract with consumers)
3. **Is data genuinely dynamic/volatile?** → Use `any` with optional chaining (`data?.id`)
4. **External library gap?** → Use `any` with a comment explaining why

### When is `any` Acceptable?

| Category | Acceptable? | Reason |
|----------|-------------|--------|
| Public props, callbacks, exports | **No** | This is your contract - must be typed |
| Plugin/extension points | **Yes** | User-defined, dynamic keys |
| Pass-through data | **Yes** | Flows to external system unchanged |
| External library gaps | **Yes** | Add comment explaining why |
| Volatile API responses | **Yes** | Use optional chaining for runtime safety |

### When is `any` NOT Acceptable?

| Category | Why Not |
|----------|---------|
| Convenience shortcuts | Hides design issues |
| Known shapes | Should be an interface |
| Public API boundaries | Consumers need the contract |
| "I don't want to figure out the type" | Technical debt |

### Why Not `unknown`?

Despite appearing in many style guides as "safer than `any`", `unknown` is impractical in real code:

```typescript
// Problem 1: Pass-through breaks
function passThrough(age: unknown) {
  saveAge(age)  // ❌ Error: 'unknown' not assignable to 'number'
}

// Problem 2: "Narrowing" is just `as` with extra steps
function process(data: unknown) {
  if (typeof data === 'object' && data && 'id' in data) {
    return (data as { id: string }).id  // Still using `as` anyway!
  }
}

// Problem 3: Record<string, unknown> is useless
const config: Record<string, unknown> = getConfig()
const timeout = config.timeout  // Type is `unknown` - can't use it
const timeout = config.timeout as number  // Back to casting

// Problem 4: The absurd double-cast
const id = params.id as unknown as string  // TypeScript bureaucracy
```

**Pragmatic approach:**
- `any` is not evil - it's honest about what you know
- Optional chaining (`data?.id`) provides *actual* runtime safety
- `Record<string, any>` works for dynamic nested structures
- Define interfaces when you know the shape - that's the real win

---

## Notes

- The `@typescript-eslint/no-explicit-any` rule is **disabled** - remaining uses are acceptable per this analysis
- **Root types (`any`, `unknown`) indicate a design decision, not a solution** - neither should be common
- **Public API types must always be strictly defined** - this is the library contract
- Define proper types when you can - that's where TypeScript provides real value
- Use `any` consciously for genuinely dynamic/pass-through data with optional chaining (`?.`)
- `unknown` is impractical - narrowing requires knowing types anyway (same work as defining them upfront)
- Test code has more flexibility, but typed tests catch more regressions
