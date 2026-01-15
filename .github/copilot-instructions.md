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
      messageId: (message as any).id,
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

### TypeScript

- Use strict types with clear interfaces
- Validate at boundaries
- Explicit props with defaults via `withDefaults`

### Testing

- Use Vitest with Vue Test Utils
- Test happy paths AND error cases
- Test edge cases (empty strings, null, undefined, malformed data)
- Tests can be repetitive for clarity (exempt from DRY)

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { MessageContextKey } from '../src/composables/useMessageContext'

describe('Component', () => {
  it('renders with message', () => {
    const wrapper = mount(Component, {
      global: {
        provide: {
          [MessageContextKey as symbol]: {
            message: { text: 'Test', source: 'bot', timestamp: '123', data: {} },
            config: {},
            action: vi.fn(),
            onEmitAnalytics: vi.fn(),
          },
        },
      },
    })
    expect(wrapper.text()).toContain('Test')
  })
})
```

### Security

- All HTML content goes through DOMPurify sanitization
- Use `useSanitize()` composable for consistent sanitization
- Never trust user input

## Code Review Checklist

- Code is easy to read and understand
- No unnecessary complexity or cleverness
- No code duplication in production code
- Error cases handled explicitly with logging
- Null/undefined checks at boundaries
- TypeScript types are accurate
- Tests cover happy path and error cases
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
