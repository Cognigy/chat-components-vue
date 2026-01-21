# @cognigy/chat-components-vue Documentation

Comprehensive documentation for the Vue 3 version of @cognigy/chat-components.

## Documentation Structure

```
docs/
├── components/          # Component API documentation
├── composables/         # Composable API documentation
├── data-structures/     # Message data structure reference
├── porting process/     # React → Vue porting guides
└── release process/     # Release and publishing info
```

## Quick Links

| Documentation | Description |
|---------------|-------------|
| [Component API](./components/README.md) | Props, events, and usage for all components |
| [Data Structures](./data-structures/README.md) | Message formats for backend integration |
| [Consumer Guide](./CONSUMER_GUIDE.md) | Installation and CI/CD setup |
| [Release Process](./release%20process%20comparison/RELEASE_PROCESS.md) | How releases are published |

## Architecture

### Data-Driven Rendering

The library uses a data-driven architecture where a single `Message` component handles all message types:

```
Backend sends message data → Matcher determines type → Appropriate component renders
```

1. **Message Component** - Main entry point that receives `IMessage` objects
2. **Matcher System** - Routes messages to correct renderer based on data structure
3. **Message Context** - Provides shared state via Vue's provide/inject

### Matcher System

The matcher evaluates rules in order to determine which component renders:

```typescript
const matchRules = [
  {
    name: 'Gallery',
    match: (msg) => msg.data?._cognigy?._webchat?.message?.attachment?.payload?.template_type === 'generic',
    component: Gallery
  },
  {
    name: 'TextMessage',
    match: (msg) => !!msg.text,
    component: TextMessage
  },
  // ... more rules
]
```

### Key Differences from React Version

| React | Vue 3 |
|-------|-------|
| React hooks | Composition API |
| React Context | provide/inject |
| JSX | Vue templates |
| useState | ref/reactive |
| useMemo | computed |
| useEffect | watch/watchEffect |

## Project Structure

```
src/
├── index.ts                 # Public API exports
├── components/
│   ├── Message.vue          # Main message renderer
│   ├── common/              # Shared UI components
│   │   ├── ActionButton.vue
│   │   ├── ActionButtons.vue
│   │   ├── ChatBubble.vue
│   │   ├── ChatEvent.vue
│   │   ├── Typography.vue
│   │   └── TypingIndicator.vue
│   └── messages/            # Message type components
│       ├── TextMessage.vue
│       ├── ImageMessage.vue
│       ├── VideoMessage.vue
│       ├── AudioMessage.vue
│       ├── TextWithButtons.vue
│       ├── Gallery.vue
│       ├── List.vue
│       ├── FileMessage.vue
│       ├── DatePicker.vue
│       └── AdaptiveCard.vue
├── composables/             # Vue composables
│   ├── useMessageContext.ts
│   ├── useSanitize.ts
│   └── useImageContext.ts
├── utils/
│   ├── matcher.ts           # Message type matching
│   ├── sanitize.ts          # HTML sanitization
│   └── helpers.ts           # Utility functions
├── types/
│   └── index.ts             # TypeScript types
└── assets/
    └── svg/                 # SVG icon components
```

## Development

### Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build library
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run type-check   # TypeScript checking
npm run lint         # Run ESLint
```

### Running Specific Tests

```bash
npm test -- ComponentName.spec.ts           # Run specific test file
npm test -- ComponentName.spec.ts -t "name" # Run specific test by name
```

### Testing Locally

```bash
# Build and pack
npm run build && npm pack

# In consuming project
npm install /path/to/cognigy-chat-components-vue-0.x.x.tgz
```

## Migration Status

### Core Components

| Component | Status |
|-----------|--------|
| Message.vue | ✅ |
| ActionButtons.vue | ✅ |
| Typography.vue | ✅ |
| TypingIndicator.vue | ✅ |
| ChatEvent.vue | ✅ |
| ChatBubble.vue | ✅ |

### Message Types

| Component | Status |
|-----------|--------|
| TextMessage.vue | ✅ |
| ImageMessage.vue | ✅ |
| VideoMessage.vue | ✅ |
| AudioMessage.vue | ✅ |
| TextWithButtons.vue | ✅ |
| Gallery.vue | ✅ |
| List.vue | ✅ |
| FileMessage.vue | ✅ |
| DatePicker.vue | ✅ |
| AdaptiveCard.vue | ✅ |

### Composables

| Composable | Status |
|------------|--------|
| useMessageContext | ✅ |
| useSanitize | ✅ |
| useImageContext | ✅ |
| useChannelPayload | ✅ |
| useCollation | ✅ |

### Utilities

| Utility | Status |
|---------|--------|
| matcher.ts | ✅ |
| sanitize.ts | ✅ |
| helpers.ts | ✅ |

## Automated Component Porting

This repository includes a Claude Code agent for porting React components to Vue 3.

### Usage

```bash
/port-component <path-to-react-component>
```

**Example:**
```bash
/port-component ../chat-components/src/messages/RatingMessage.tsx
```

### What the Agent Does

1. Reads the React component and its tests
2. Converts to Vue 3 using Composition API
3. Creates comprehensive tests (Vitest + Vue Test Utils)
4. Generates documentation
5. Updates tracking files
6. Verifies all tests pass

### Agent Documentation

See `.claude/agents/port-component.md` for:
- React → Vue conversion patterns
- Vue 3 component templates
- Testing patterns
- Common pitfalls

## Contributing

### Development Guidelines

1. Follow the **5-step procedure** for components:
   - Implementation
   - Testing (15+ tests for components)
   - Documentation
   - Tracking updates
   - Verification

2. Use established patterns from existing components

3. Ensure all tests pass before completion

4. Keep documentation in sync with code

See `CLAUDE.md` in the project root for complete guidelines.

### Porting from React

**Option 1: Automated (Recommended)**
```bash
/port-component <path-to-react-component>
```

**Option 2: Manual**
1. Maintain same data structures and interfaces
2. Use Vue 3 Composition API
3. Follow patterns in existing components
4. Write comprehensive tests
5. Create documentation
