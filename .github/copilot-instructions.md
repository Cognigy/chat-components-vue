# GitHub Copilot Instructions

This file provides guidance to GitHub Copilot when working with code in this repository.

## Project Overview

**@cognigy/chat-components-vue** is a Vue 3 implementation of the @cognigy/chat-components library, providing reusable chat message rendering components.

### Key Features

- Data-driven rendering via single `Message` component
- Plugin-based message type routing
- Context-based architecture using Vue's provide/inject
- Full TypeScript support with strict mode
- Comprehensive test coverage

## Architecture

### Message Rendering System

1. **Message Component** (`src/components/Message.vue`) - Entry point that receives `IMessage` objects and routes to appropriate components
2. **Matcher System** (`src/utils/matcher.ts`) - Plugin-based routing with match rules evaluated in order
3. **Message Context** (`src/composables/useMessageContext.ts`) - Shared state via provide/inject

### Directory Structure

```
src/
├── components/
│   ├── Message.vue          # Main message renderer
│   ├── common/              # Shared UI components
│   └── messages/            # Message type components
├── composables/             # Vue composables
├── utils/                   # Utilities (matcher, sanitize, helpers)
└── types/                   # TypeScript types
```

## Coding Guidelines

### Core Principles

1. **Maintainability** - Code should be easy to understand and modify
2. **Performance** - Optimize for runtime, avoid unnecessary reactivity triggers
3. **Readability** - Self-documenting code; clarity over cleverness
4. **Simplicity** - Straightforward, reliable implementations
5. **DRY in Production** - Eliminate duplication in production code (tests exempt)

### Prefer Simple "Ranch-like" Code

Avoid:
- Over-engineered abstractions
- Clever one-liners that sacrifice clarity
- Deeply nested reactive expressions
- Premature optimization or abstraction

Prefer:
- Straightforward, explicit code
- Simple functions that do one thing well
- Clear variable names that explain intent
- Flat, readable control flow

### Vue 3 Composition API Patterns

#### Component Structure

```vue
<template>
  <div :class="$style.wrapper">
    <Typography variant="body-regular">{{ message.text }}</Typography>
  </div>
</template>

<script setup lang="ts">
import { computed, useCssModule } from 'vue'
import { useMessageContext } from '../../composables/useMessageContext'
import Typography from '../common/Typography.vue'

const $style = useCssModule()

interface Props {
  customProp?: string
}

const props = withDefaults(defineProps<Props>(), {
  customProp: 'default',
})

const { message, config, action } = useMessageContext()

const displayText = computed(() => {
  return message.text || props.customProp
})
</script>

<style module>
.wrapper {
  padding: 16px;
  background: var(--cc-white);
}
</style>
```

#### Critical: Never Destructure Props

```typescript
// CORRECT - maintains reactivity
const props = defineProps<Props>()
const displayValue = computed(() => props.value)

// WRONG - breaks reactivity
const { value } = defineProps<Props>()
```

#### CSS Modules Require Script Import

```vue
<script setup lang="ts">
import { useCssModule } from 'vue'
const $style = useCssModule()  // Required for :class="$style.xxx"
</script>

<style module>
.wrapper { /* ... */ }
</style>
```

### Error Handling

Always handle errors explicitly:

```typescript
// WRONG: Silent failure
function processMessage(msg) {
  const text = msg.data._cognigy._webchat.message.text
  return sanitize(text)
}

// CORRECT: Explicit error handling
function processMessage(message: IMessage) {
  if (!message) {
    console.error('processMessage: message is required')
    return null
  }

  const text = message.data?._cognigy?._webchat?.message?.text

  if (!text) {
    console.warn('processMessage: no text found in message', {
      messageId: message.traceId,  // Use traceId from IMessage
      source: message.source
    })
    return null
  }

  try {
    return sanitize(text)
  } catch (error) {
    console.error('processMessage: sanitization failed', { error })
    return text  // Fallback
  }
}
```

### TypeScript Typing Philosophy

**Root types (`any`, `unknown`) indicate a design decision, not a solution.**

Neither should be common. If you're reaching for root types frequently, something is wrong with your type design.

**The `any` vs `unknown` debate is a distraction:**
- `unknown` zealots miss that narrowing requires knowing types anyway
- Writing `if (typeof x === 'string')` is the same work as defining the type upfront
- Don't use `unknown` as "safer any" - it just adds ceremony without benefit

**Decision process:**
1. **Can I define a proper type?** → Define it (interface, union, `Record<string, T>`)
2. **Is this a public API?** → Must define it (this is your contract)
3. **Is data genuinely dynamic?** → Use `any` with optional chaining (`data?.id`)
4. **External library gap?** → Use `any` with explanatory comment

```typescript
// PUBLIC API: Must be typed (contract with consumers)
customIcon?: Component | string
onAnalytics?: (event: string, data: AnalyticsEvent) => void

// EXTENSIBILITY: any OK for dynamic keys
[key: string]: any  // i18n, user-defined

// PASS-THROUGH: any OK, flows to external unchanged
data?: Record<string, any> | null
```

**When `any` is acceptable:** Extensibility points, pass-through data, external library gaps
**When `any` is NOT acceptable:** Public APIs, known shapes, convenience shortcuts

### Testing

- Use Vitest with Vue Test Utils
- **Write meaningful tests that verify behavior**, not just that code runs
- Tests can be repetitive for clarity (exempt from DRY)

#### What Makes a Meaningful Test

A test should answer: **"What behavior can users expect with these inputs?"**

**✅ Test these:**
- Security (XSS prevention, sanitization)
- Configuration effects (does setting X change behavior Y?)
- User interactions (click handlers invoke correct actions)
- Accessibility (ARIA attributes present and correct)
- Business logic (message routing, data formatting)

**❌ Avoid these patterns:**
```typescript
// Bad: Just checks "exists" - proves nothing
expect(wrapper.exists()).toBe(true)

// Bad: CSS class names - brittle, breaks on refactor
expect(wrapper.find('.webchat-media-template').exists()).toBe(true)

// Bad: Prop is "defined" - meaningless
expect(action).toBeDefined()

// Bad: Repetitive identical tests for same logic
it('renders JPEG', () => { /* same test */ })
it('renders PNG', () => { /* same test */ })
```

**✅ Better patterns:**
```typescript
// Good: Verifies actual behavior
expect(wrapper.find('p').text()).toBe('Expected text')

// Good: Tests interaction result
await wrapper.find('button').trigger('click')
expect(action).toHaveBeenCalledWith('payload', null, { label: 'Button' })

// Good: Data-driven for repetitive cases
it.each([['image/jpeg'], ['image/png']])('renders %s as image', (mime) => {
  const wrapper = mountWithMime(mime)
  expect(wrapper.find('[data-testid="image"]').exists()).toBe(true)
})
```

#### Test Template

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { MessageContextKey } from '../src/composables/useMessageContext'

describe('Component', () => {
  const mountComponent = (message, config = {}) => {
    return mount(Component, {
      global: {
        provide: {
          [MessageContextKey as symbol]: {
            message: { text: 'Test', source: 'bot', timestamp: '123', data: {}, ...message },
            config,
            action: vi.fn(),
            onEmitAnalytics: vi.fn(),
          },
        },
      },
    })
  }

  it('renders message text in paragraph element', () => {
    const wrapper = mountComponent({ text: 'Hello' })
    expect(wrapper.find('p').text()).toContain('Hello')
  })

  it('applies max width from config', () => {
    const config = { settings: { layout: { botOutputMaxWidthPercentage: 80 } } }
    const wrapper = mountComponent({}, config)
    expect(wrapper.find('.chat-bubble').attributes('style')).toContain('max-width: 80%')
  })
})
```

### Vue Reactivity - Avoid False Optimization Suggestions

**Vue's `computed` properties are already memoized.** Do not suggest additional memoization, caching, or shallow comparison for computed properties - Vue handles this automatically.

```typescript
// This is ALREADY optimized - Vue caches the result
const cssVariableStyle = computed(() => {
  return configColorsToCssVariables(props.config?.settings?.colors)
})

// Do NOT suggest adding:
// - Manual memoization (useMemo-like patterns)
// - Shallow comparison wrappers
// - Caching layers for computed properties
```

**When to suggest optimization:**
- Only for genuinely expensive operations (>10ms): complex algorithms, large data transformations
- Never for simple object mapping, property access, or filtering small arrays

**When NOT to suggest optimization:**
- Simple computed properties (object creation, filtering, mapping)
- Operations that take microseconds
- Code where "optimization" overhead exceeds the operation cost

### Security

- All HTML content goes through DOMPurify sanitization
- Use `useSanitize()` composable for consistent sanitization
- Never trust user input

## Code Review Checklist

- Code is easy to read and understand
- No unnecessary complexity or cleverness
- No code duplication in production code
- **Public API types define clear contracts** (props, callbacks, exports)
- `any` only used for acceptable cases (extensibility, pass-through, external lib gaps)
- Error cases handled explicitly with logging
- Null/undefined checks at boundaries
- TypeScript types are accurate
- **Tests verify behavior** (not just "exists" or "defined" checks)
- **No CSS class existence tests** (brittle)
- No silent failures
- Props not destructured (maintains reactivity)
- CSS modules imported with `useCssModule()`
- Template expressions are simple

## Common Commands

```bash
npm run dev          # Start dev server
npm run test         # Run tests
npm run test:watch   # Watch mode
npm run build        # Build library
npm run type-check   # TypeScript check
```
