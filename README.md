# @cognigy/chat-components-vue

Vue 3 version of `@cognigy/chat-components`.

## 🤖 Automated Component Porting

This repository includes a specialized Claude Code agent that automatically ports React components from the original @cognigy/chat-components repository to Vue 3.

### Quick Start

```bash
# In Claude Code, use the port-component agent:
/port-component <path-to-react-component>
```

**Example:**
```bash
# If React repo is in an adjacent directory:
/port-component ../chat-components/src/messages/RatingMessage.tsx

# Or with absolute path:
/port-component /Users/dev/chat-components/src/messages/RatingMessage.tsx
```

### What the Agent Does

The agent automatically:
1. ✅ Reads the React component and its tests
2. ✅ Converts to Vue 3 using Composition API
3. ✅ Creates comprehensive tests (Vitest + Vue Test Utils)
4. ✅ Generates complete documentation
5. ✅ Updates all tracking files (README, PROGRESS, docs)
6. ✅ Verifies all tests pass

### Agent Features

- **Automatic conversion**: React hooks → Vue composables, JSX → Vue templates, CSS modules → Vue CSS modules
- **Pattern matching**: Understands both React and Vue patterns
- **Comprehensive testing**: Generates tests with equal or better coverage than React version
- **Full documentation**: Creates complete API docs with examples
- **Quality checks**: Ensures all tests pass before completion

### When to Use the Agent

Use the port-component agent when:
- A new component is added to the React repository
- An existing React component is significantly updated
- You need to port multiple components efficiently
- You want consistent Vue 3 patterns across components

### Manual Porting Alternative

If you prefer to port components manually, follow the guidelines in:
- `CLAUDE.md` - Core development procedures
- `.claude/agents/port-component.md` - Detailed conversion patterns

### Agent Documentation

See `.claude/agents/port-component.md` for:
- Complete React → Vue conversion tables
- Vue 3 component templates
- Testing patterns
- Common pitfalls and solutions
- Quality checklists

## Project Structure

This is a Vue 3 port of the React-based chat components library. It maintains the same data-driven architecture and matcher system, but uses Vue 3 composition API patterns.

```
vue-version/
├── src/
│   ├── components/          # Vue components
│   │   ├── Message.vue      # Main message renderer
│   │   ├── messages/        # Message type components
│   │   │   ├── TextMessage.vue
│   │   │   ├── Gallery.vue
│   │   │   ├── ImageMessage.vue
│   │   │   └── [other types]/
│   │   └── common/          # Shared UI components
│   │       ├── ActionButtons.vue
│   │       ├── TypingIndicator.vue
│   │       ├── ChatEvent.vue
│   │       └── Typography.vue
│   ├── composables/         # Vue composables (hooks)
│   │   ├── useMessageContext.ts
│   │   ├── useSanitize.ts
│   │   └── useCollation.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/               # Utilities
│   │   ├── matcher.ts       # Message type matching system
│   │   ├── sanitize.ts
│   │   └── helpers.ts
│   └── index.ts             # Public API exports
├── test/                    # Tests
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Architecture

### Data-Driven Rendering (Same as React Version)

The Vue version maintains the same data-driven architecture:
- Single `Message.vue` component handles all message types
- Matcher system determines which component to render based on data structure
- Backend sends message data → Frontend renders appropriate UI

### Key Differences from React Version

1. **Composition API** instead of React hooks
2. **Provide/Inject** instead of React Context
3. **Vue directives** instead of JSX patterns
4. **Reactive refs** instead of useState
5. **Computed properties** instead of useMemo
6. **Watchers** for side effects instead of useEffect

### Matcher System

The matcher system works identically to the React version:

```typescript
// Same match rules as React version
const matchRules = [
  {
    name: 'Gallery',
    match: (msg) => msg.data?._cognigy?._webchat?.message?.attachment?.payload?.template_type === 'generic',
    component: Gallery
  },
  // ... more rules
]
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm run test

# Build library
npm run build
```

## Migration Status

This is a work in progress. Component parity tracking:

### Core Components
- [x] Message.vue ✅ (main renderer)
- [x] ActionButtons.vue ✅
- [x] Typography.vue ✅
- [x] TypingIndicator.vue ✅
- [x] ChatEvent.vue ✅
- [x] ChatBubble.vue ✅

### Message Types
- [x] TextMessage.vue ✅
- [x] ImageMessage.vue ✅
- [x] VideoMessage.vue ✅
- [x] AudioMessage.vue ✅
- [x] TextWithButtons.vue ✅
- [x] Gallery.vue ✅
- [x] List.vue ✅
- [x] FileMessage.vue ✅
- [x] DatePicker.vue ✅
- [x] AdaptiveCard.vue ✅

### Composables
- [x] useMessageContext ✅
- [x] useSanitize ✅
- [ ] useCollation
- [ ] useChannelPayload

### Utilities
- [x] matcher.ts ✅
- [x] sanitize.ts ✅
- [x] helpers.ts ✅

## Usage

Once complete, usage will be similar to React version:

```vue
<template>
  <Message
    :message="message"
    :action="handleAction"
    :config="config"
  />
</template>

<script setup lang="ts">
import { Message } from '@cognigy/chat-components-vue'

const message = {
  text: "Hello!",
  source: "bot",
  timestamp: Date.now().toString()
}

const handleAction = (text: string, data: any) => {
  console.log('Action:', text, data)
}
</script>
```

## Contributing

### Porting Components from React

**Option 1: Automated (Recommended)**

Use the port-component agent in Claude Code:

```bash
/port-component <path-to-react-component>
```

The agent will handle the entire conversion process automatically.

**Option 2: Manual Porting**

When porting components manually:

1. Maintain the same data structures and prop interfaces
2. Use Vue 3 Composition API patterns
3. Follow the coding guidelines in CLAUDE.md
4. Ensure error handling is explicit and visible
5. Keep code simple and maintainable ("ranch-like")
6. Write comprehensive tests for each component
7. Create complete documentation
8. Update all tracking files

See `.claude/agents/port-component.md` for detailed conversion patterns and examples.

### Development Guidelines

- Follow the **5-step procedure** for all components (Implementation → Testing → Documentation → Tracking → Verification)
- Use established patterns from existing components
- Prioritize clarity and maintainability over cleverness
- Ensure all tests pass before marking work complete
- Keep documentation in sync with code changes

See `CLAUDE.md` for complete development guidelines.