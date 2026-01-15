# Getting Started with Vue 3 Version

This directory contains the Vue 3 port of @cognigy/chat-components.

## What's Been Set Up

### ✅ Project Infrastructure

1. **Package Configuration** (`package.json`)
   - Vue 3 as peer dependency
   - DOMPurify for sanitization
   - Vite for building
   - Vitest for testing
   - TypeScript support

2. **Build Configuration** (`vite.config.ts`)
   - Library mode for building npm package
   - TypeScript declaration generation
   - Vue plugin configured

3. **Directory Structure**
```
vue-version/
├── src/
│   ├── components/          # Vue components (to be created)
│   ├── composables/         # Vue composables (hooks equivalent)
│   │   └── useMessageContext.ts ✅ Created
│   ├── types/               # TypeScript definitions
│   │   └── index.ts ✅ Created
│   └── utils/               # Utilities
│       ├── matcher.ts ✅ Created (core matching logic)
│       └── sanitize.ts ✅ Created (HTML sanitization)
├── test/                    # Tests (to be created)
├── package.json ✅
├── vite.config.ts ✅
├── tsconfig.json ✅
├── README.md ✅
├── PORTING_GUIDE.md ✅
└── GETTING_STARTED.md ✅ (this file)
```

### ✅ Core Utilities (Ported)

1. **Matcher System** (`src/utils/matcher.ts`)
   - Same matching rules as React version
   - `match()` function to determine component type
   - `getChannelPayload()` helper
   - All match rules defined (ready for components)

2. **Sanitization** (`src/utils/sanitize.ts`)
   - DOMPurify integration
   - Same allowed tags/attributes as React version
   - Error handling for sanitization failures

3. **Message Context** (`src/composables/useMessageContext.ts`)
   - Vue provide/inject pattern
   - Type-safe context access
   - Equivalent to React's useContext

4. **Types** (`src/types/index.ts`)
   - All core types defined
   - `ChatConfig`, `MessageProps`, `MessagePlugin`, etc.
   - Compatible with React version data structures

## Next Steps

### Phase 1: Core Components (Start Here)

Create these components in order of complexity:

1. **TypingIndicator.vue** (Simplest)
   - No props, just animation
   - Good first component to learn pattern

2. **ChatEvent.vue** (Simple)
   - Basic props (text, className)
   - No state, no context

3. **Typography.vue** (Moderate)
   - Variant system
   - Style handling
   - Ref forwarding

4. **TextMessage.vue** (Moderate)
   - Uses message context
   - HTML sanitization
   - Markdown support

### Phase 2: Interactive Components

5. **ActionButtons.vue** (Complex)
   - Multiple button types
   - Event emissions
   - Accessibility

6. **TextWithButtons.vue** (Complex)
   - Combines text + buttons
   - Quick replies support

### Phase 3: Rich Media Components

7. **ImageMessage.vue**
8. **VideoMessage.vue**
9. **AudioMessage.vue**
10. **Gallery.vue**
11. **List.vue**

### Phase 4: Advanced Components

12. **DatePicker.vue**
13. **AdaptiveCard.vue**
14. **Message.vue** (Main renderer - uses all above)

## Installation

```bash
cd vue-version
npm install
```

## Development Workflow

### 1. Create a Component

Example: `src/components/common/TypingIndicator.vue`

```vue
<template>
  <div class="typing-indicator">
    <span></span>
    <span></span>
    <span></span>
  </div>
</template>

<script setup lang="ts">
// Component logic
</script>

<style scoped>
.typing-indicator {
  /* Styles */
}
</style>
```

### 2. Export from Index

Add to `src/index.ts`:

```typescript
export { default as TypingIndicator } from './components/common/TypingIndicator.vue'
```

### 3. Write Tests

Create `test/TypingIndicator.spec.ts`:

```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import TypingIndicator from '../src/components/common/TypingIndicator.vue'

describe('TypingIndicator', () => {
  it('renders correctly', () => {
    const wrapper = mount(TypingIndicator)
    expect(wrapper.find('.typing-indicator').exists()).toBe(true)
  })
})
```

### 4. Test Locally

```bash
npm run test        # Run tests
npm run dev         # Start dev server
npm run build       # Build library
```

## Coding Guidelines

Follow the guidelines in root `CLAUDE.md`:

1. ✅ **Keep it simple** - "Ranch-like" code over "Skyscraper-like"
2. ✅ **Explicit error handling** - Make failures visible
3. ✅ **Clear variable names** - Self-documenting code
4. ✅ **Validate inputs** - Check at boundaries
5. ✅ **Log with context** - Actionable error messages

### Example: Good Error Handling

```typescript
function processMessage(message: IMessage | undefined) {
  // Validate input
  if (!message) {
    console.error('processMessage: message is required')
    return null
  }

  // Safe access with clear logging
  const text = message.data?._cognigy?._webchat?.message?.text

  if (!text) {
    console.warn('processMessage: no text found', {
      messageId: message.id,
      source: message.source
    })
    return null
  }

  try {
    return sanitize(text)
  } catch (error) {
    console.error('processMessage: sanitization failed', {
      error,
      messageId: message.id,
      textLength: text.length
    })
    return text // Fallback
  }
}
```

## Reference Documentation

- **PORTING_GUIDE.md** - React to Vue conversion patterns
- **README.md** - Project overview and architecture
- **Root USER_GUIDE.md** - Component API reference (React version, but data structures are the same)
- **Root CLAUDE.md** - Coding guidelines and architecture

## Tips

1. **Start Small** - Port simplest components first
2. **Copy Styles** - CSS can often be reused from React version
3. **Keep Data Structures** - Same props/data as React version
4. **Test Early** - Write tests as you go
5. **Reference React** - Look at React version when unsure
6. **Use Composition API** - No Options API, use `<script setup>`
7. **Type Everything** - Use TypeScript strictly

## Questions?

- Check **PORTING_GUIDE.md** for React-to-Vue patterns
- Look at React component in `../src/` for reference
- Follow error handling patterns in **CLAUDE.md**
- Keep the same data-driven architecture

## Success Criteria

A component is "done" when:

- ✅ Renders same UI as React version
- ✅ Accepts same props/data structures
- ✅ Has explicit error handling
- ✅ Has tests (happy path + error cases)
- ✅ Is documented
- ✅ Follows coding guidelines

Let's build robust, simple, maintainable components! 🏗️