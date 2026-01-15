# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a Vue 3 implementation of the @cognigy/chat-components library.

**@cognigy/chat-components-vue** provides reusable chat message rendering components for Vue 3 applications, maintaining the same data-driven architecture as the original React version (@cognigy/chat-components) but using Vue 3 Composition API patterns.

### Key Features

- **Data-driven rendering**: Single `Message` component handles all message types
- **Plugin-based matching system**: Extensible message type routing
- **Context-based architecture**: Message context provided via Vue's provide/inject
- **Type-safe**: Full TypeScript support with strict mode
- **Comprehensive testing**: Vitest + Vue Test Utils with high coverage
- **Well-documented**: Complete API docs and usage examples

### Use Cases

- Chat history rendering
- Message transcript displays
- Interactive chat interfaces (with full features)
- Webchat implementations
- Agent desktop applications

## Component Porting Agent

This repository includes a specialized agent for porting React components to Vue 3.

### Usage

```bash
/port-component <path-to-react-component>
```

Example:
```bash
/port-component ../chat-components/src/messages/RatingMessage.tsx
```

The agent will automatically:
1. Read the React component from the specified path
2. Convert to Vue 3 using Composition API
3. Create comprehensive tests
4. Generate complete documentation
5. Update all tracking files

See `.claude/agents/port-component.md` for detailed documentation.

## ⚠️ CRITICAL: Component Development Procedure

**This procedure is MANDATORY for all component and composable development.**

### What is an Iteration?

An **iteration** is defined as all work completed after a single user prompt. This includes:
- The primary component/composable requested
- ALL dependencies created (supporting components, composables, utilities)
- ALL related work (tests, documentation, tracking updates)

### Mandatory Steps for Each Iteration

For EVERY component AND composable created in an iteration, you MUST complete ALL of these steps IN ORDER:

#### 1. Implementation
- Create the component/composable with full functionality
- Implement all required features
- Handle all edge cases and error states
- Include proper TypeScript types
- Follow Vue 3 Composition API best practices

#### 2. Testing
- Create comprehensive test file (*.spec.ts)
- Test happy paths AND error cases
- Aim for high coverage of critical functionality
- Verify all props/options work correctly
- Test edge cases (empty strings, null, undefined, malformed data)
- Ensure all tests pass before proceeding

**Minimum test coverage:**
- Components: 15+ tests covering props, rendering, events, edge cases
- Composables: 10+ tests covering API, config handling, edge cases

#### 3. Documentation
- Create/update documentation file in `docs/components/` or `docs/composables/`
- Include:
  - Import statement
  - Props/API reference table
  - Usage examples (basic + advanced)
  - Configuration options
  - CSS variables (if applicable)
  - Accessibility notes
  - Security considerations (if applicable)
  - Best Practices (✅ Do / ❌ Don't)
  - Common patterns
  - Troubleshooting section
  - Related components/composables
  - Test count reference
- For message components: Add data structure documentation in `docs/data-structures/`

#### 4. Tracking Updates
Update ALL relevant tracking files:
- `README.md` - Update component status and counts
- `PROGRESS.md` - Update completion percentage, test counts, and metrics
- `docs/components/README.md` - Update component tracking table
- `docs/data-structures/README.md` - Add message type if applicable

#### 5. Verification
Before declaring the iteration complete:
- ✅ All tests pass (`npm test`)
- ✅ All files have proper exports in `src/index.ts`
- ✅ Documentation is complete and accurate
- ✅ Tracking files are updated
- ✅ No TODO comments remain
- ✅ Code follows project patterns and style

### Handling Dependencies

If implementing a component requires creating dependencies (like ChatBubble for TextMessage, or useSanitize for sanitization), you MUST:

1. Identify ALL dependencies upfront
2. Apply the full 5-step procedure to EACH dependency
3. Document the dependency relationship
4. Test the integration between components

**Example:** When creating TextMessage, you must also create:
- ChatBubble.vue (with tests + docs)
- useSanitize composable (with tests + docs)
- Any utility functions needed
- Update tracking for ALL components/composables

### Applies To

This procedure applies to:
- ✅ Vue components (.vue files)
- ✅ Composables (use*.ts files)
- ✅ Utility functions (if substantial)
- ✅ Supporting components (like ChatBubble)

### Consequences of Skipping Steps

Incomplete iterations create:
- ❌ Untested code that may break in production
- ❌ Undocumented APIs that confuse users
- ❌ Inaccurate tracking that misrepresents progress
- ❌ Technical debt that compounds over time
- ❌ Difficulty for other developers to understand or modify code

### Example Iteration Checklist

When user says: "Implement TextMessage component"

You must complete:
- [ ] TextMessage.vue implementation
- [ ] TextMessage.spec.ts (22+ tests)
- [ ] text-message.md documentation
- [ ] ChatBubble.vue implementation (dependency)
- [ ] ChatBubble.spec.ts (16+ tests)
- [ ] chat-bubble.md documentation
- [ ] useSanitize.ts implementation (dependency)
- [ ] useSanitize.spec.ts (19+ tests)
- [ ] use-sanitize.md documentation
- [ ] Update src/index.ts exports
- [ ] Update README.md tracking
- [ ] Update PROGRESS.md metrics
- [ ] Update docs/components/README.md
- [ ] Verify all tests pass

**Only after ALL checkboxes are complete is the iteration done.**

## Common Commands

### Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Run tests with UI
```

### Building
```bash
npm run build        # Build library (TypeScript + Vite)
npm run type-check   # TypeScript type checking
```

### Testing Locally in Another Project
```bash
# In this repo:
npm pack

# In your project:
npm install /path/to/cognigy-chat-components-vue-<version>.tgz
```

### Running Specific Tests
```bash
npm test -- ComponentName.spec.ts           # Run specific test file
npm test -- ComponentName.spec.ts -t "name" # Run specific test by name
```

## Architecture

### Message Rendering System

The library uses a **plugin-based matching system** to render different message types:

1. **Message Component** (`src/components/Message.vue`) - Main entry point that:
   - Receives an `IMessage` object from `@cognigy/socket-client`
   - Uses the `match()` function to find appropriate component(s)
   - Renders matched component(s) with proper context
   - Provides message context via Vue's provide/inject

2. **Matcher System** (`src/utils/matcher.ts`) - Central routing logic:
   - Defines `createDefaultMatchRules()` function returning array of match rules
   - Each rule has a `match` function and a `name` property
   - Rules are evaluated in order; first match wins (unless `passthrough: true`)
   - External plugins can be prepended via the `plugins` prop
   - Supported message types: Text, Image, Video, Audio, TextWithButtons, Gallery, List, File, DatePicker, AdaptiveCard, XAppSubmit, Webchat3Event

3. **Message Context** (`src/composables/useMessageContext.ts`) - Provides shared state:
   - `provideMessageContext()` provides message, config, action callbacks
   - Components access context via `useMessageContext()` composable
   - Passes through: `action`, `config`, `onEmitAnalytics`, message data

4. **Types** (`src/types/index.ts`) - Central type definitions for:
   - `IMessage` - Message structure from `@cognigy/socket-client`
   - `ChatConfig` - Configuration object with settings, theme, layout
   - `ChatTheme` - Theming configuration
   - `MessageSender` - Callback type for sending messages

### Key Utilities

- **`match()`** (`src/utils/matcher.ts`) - Matches message to appropriate component(s) based on data structure
- **`getChannelPayload()`** (`src/utils/matcher.ts`) - Determines whether to use `_webchat`, `_defaultPreview`, or `_plugin` payload
- **Sanitization** (`src/utils/sanitize.ts`) - HTML sanitization using DOMPurify with configurable allowed tags/attributes
- **Helper utilities** (`src/utils/helpers.ts`) - URL parsing, file handling, random IDs, etc.

### Component Structure

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

## Build System

- **Vite** - Builds ES module library bundle
- **vite-plugin-dts** - Generates TypeScript declaration files
- **Vue 3 SFC support** - Single File Component compilation
- Output: ES modules with TypeScript declarations

## Testing

- **Vitest** with jsdom environment
- **Vue Test Utils** (@vue/test-utils) for component testing
- Tests located in `test/*.spec.ts`
- Setup: `vitest.config.ts` and `test/setup.ts`
- CSS Modules support in tests

## Important Patterns

### Vue 3 Composition API

All components use `<script setup>` with Composition API:

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

### Creating Custom Message Plugins

External consumers can add custom message types by passing a `plugins` prop:

```vue
<template>
  <Message
    :message="message"
    :plugins="customPlugins"
    :action="handleAction"
  />
</template>

<script setup lang="ts">
import { Message } from '@cognigy/chat-components-vue'
import type { MessagePlugin } from '@cognigy/chat-components-vue'
import CustomComponent from './CustomComponent.vue'

const customPlugins: MessagePlugin[] = [
  {
    name: 'CustomMessage',
    match: (message, config) => message.data?.customType === true,
    component: CustomComponent,
    options: {
      passthrough: false,  // Stop matching after this plugin
    }
  }
]
</script>
```

### Message Context Pattern

Components access shared context via `useMessageContext()`:

```vue
<script setup lang="ts">
import { useMessageContext } from '../../composables/useMessageContext'

const { message, config, action, onEmitAnalytics } = useMessageContext()

// Use message data
const text = computed(() => message.text)

// Use config
const primaryColor = computed(() => config?.settings?.colors?.primaryColor)

// Call action
const handleClick = () => {
  action?.('Button clicked', { buttonId: 'btn-1' })
}

// Emit analytics
const trackEvent = () => {
  onEmitAnalytics?.('button_click', { location: 'message' })
}
</script>
```

### Security Considerations

- All HTML content goes through DOMPurify sanitization by default
- Sanitization can be disabled via `config.settings.layout.disableHtmlContentSanitization`
- Custom allowed HTML tags via `config.settings.widgetSettings.customAllowedHtmlTags`
- Use `useSanitize()` composable for consistent sanitization

## Documentation

### Documentation Structure (`docs/`)

```
docs/
├── data-structures/     # Message data structure reference
├── components/          # Component API documentation
└── composables/         # Composable API documentation
```

### Documentation Requirements

**IMPORTANT:** When working on components, follow this process:

1. **Before implementing:**
   - Read existing documentation for the component/pattern
   - Check data structure requirements in `docs/data-structures/`
   - Review similar components for patterns

2. **During implementation:**
   - Note any gotchas or non-obvious behavior
   - Track design decisions
   - Document error cases and fallbacks

3. **After implementing (REQUIRED):**
   - Update component documentation in `docs/components/`
   - Add/update data structure examples in `docs/data-structures/`
   - Add code examples showing typical usage
   - Document edge cases and error handling
   - Update tracking files (README, PROGRESS)

### Documentation Style

Documentation should be:
- ✅ **Practical** - Include working code examples
- ✅ **Complete** - Cover all props, events, data structures
- ✅ **Clear** - Explain "why", not just "what"
- ✅ **Maintainable** - Keep in sync with code changes
- ✅ **Future-proof** - Someone reading in 6 months should understand

### Data Structure Documentation

The `docs/data-structures/` directory is critical for backend integration. For each message type, document:

1. **Complete data structure** - Full TypeScript interface
2. **Required fields** - What MUST be present
3. **Optional fields** - What CAN be present
4. **Example payloads** - Real, working examples
5. **Matcher criteria** - What triggers this component
6. **Fallback behavior** - What happens if data is malformed
7. **Common mistakes** - Known integration issues

Example structure:
```markdown
# Message Type Name

## Data Structure
[Complete interface]

## Required Fields
[List with explanations]

## Matcher Rule
[What pattern triggers this]

## Examples
[Multiple real examples]

## Validation
[How to validate]

## Common Issues
[Known problems]
```

### Why This Matters

Good documentation:
- Helps backend developers format messages correctly
- Reduces integration issues and debugging time
- Makes onboarding new developers faster
- Prevents regression when refactoring
- Serves as a contract between frontend and backend

**If the documentation is outdated, it's worse than no documentation.**

## Coding Guidelines

### Core Principles

When writing or modifying code in this repository, follow these principles:

1. **Maintainability** - Code should be easy to understand and modify by others
2. **Performance** - Optimize for runtime performance, avoid unnecessary reactivity triggers
3. **Readability** - Code should be self-documenting; clarity over cleverness
4. **Simplicity** - Keep implementations straightforward and reliable
5. **DRY (Don't Repeat Yourself)** - Eliminate duplication in production code
   - **Exception: Tests are exempt from DRY** - Tests should be isolated and self-contained, even if repetitive

### Ranch vs. Skyscraper Code

**Prefer robust, simple "ranch-like" code over fancy, modern "skyscraper-like" implementations.**

❌ **Avoid (Skyscraper-like):**
- Over-engineered abstractions
- Clever one-liners that sacrifice clarity
- Unnecessary use of advanced patterns when simple solutions work
- Deeply nested reactive expressions
- Premature optimization or abstraction

✅ **Prefer (Ranch-like):**
- Straightforward, explicit code
- Simple functions that do one thing well
- Clear variable names that explain intent
- Flat, readable control flow
- Tried-and-true patterns over bleeding-edge techniques

### Vue 3 Specific Guidelines

#### 1. Composition API Usage

```vue
<script setup lang="ts">
// ✅ Good: Clear, explicit composition
import { ref, computed, watch, onMounted } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

watch(() => count.value, (newVal) => {
  console.log('Count changed:', newVal)
})

onMounted(() => {
  console.log('Component mounted')
})
</script>
```

```vue
<script setup lang="ts">
// ❌ Avoid: Overly complex reactive structures
const state = reactive({
  nested: {
    deeply: {
      complex: computed(() => /* ... */)
    }
  }
})
</script>
```

#### 2. Props and Reactivity

```typescript
// ✅ Good: Don't destructure props (breaks reactivity)
const props = defineProps<Props>()

const displayValue = computed(() => props.value)

// ❌ Avoid: Destructuring breaks reactivity
const { value } = defineProps<Props>()
```

#### 3. CSS Modules

```vue
<template>
  <div :class="$style.wrapper">
    Content
  </div>
</template>

<script setup lang="ts">
import { useCssModule } from 'vue'

// ✅ Required: Import CSS module in script
const $style = useCssModule()
</script>

<style module>
.wrapper {
  padding: 16px;
}
</style>
```

#### 4. Template Syntax

```vue
<template>
  <!-- ✅ Good: Clear conditional rendering -->
  <div v-if="shouldShow">Content</div>
  <div v-else>Fallback</div>

  <!-- ✅ Good: List rendering with keys -->
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>

  <!-- ❌ Avoid: Complex expressions in template -->
  <div>{{ complexCalculation(data?.nested?.prop ?? defaultValue) }}</div>

  <!-- ✅ Better: Use computed property -->
  <div>{{ displayValue }}</div>
</template>
```

### Error Handling

**Make potential failure points visible and handle errors gracefully.**

#### Key Principles:

1. **Validate inputs early** - Check for null/undefined at function boundaries
2. **Fail visibly** - Log errors with context, don't silently swallow them
3. **Provide fallbacks** - Degrade gracefully rather than crashing
4. **Make errors actionable** - Include enough information to debug

#### ❌ Avoid: Silent failures
```typescript
function processMessage(msg) {
  const text = msg.data._cognigy._webchat.message.text
  return sanitize(text)
}
```

#### ✅ Prefer: Explicit error handling
```typescript
function processMessage(message: IMessage) {
  // Validate input
  if (!message) {
    console.error('processMessage: message is required')
    return null
  }

  // Safe navigation with clear fallback
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
    console.error('processMessage: sanitization failed', {
      error,
      textLength: text.length
    })
    // Return unsanitized text as fallback (or empty string if safer)
    return text
  }
}
```

### TypeScript Usage

```typescript
// ✅ Good: Clear types with validation
interface MessageData {
  text: string
  source: 'bot' | 'user' | 'agent'
  timestamp: string
}

function isValidMessage(msg: unknown): msg is MessageData {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    'text' in msg &&
    'source' in msg &&
    'timestamp' in msg
  )
}

// ✅ Good: Explicit props with defaults
interface Props {
  required: string
  optional?: number
}

const props = withDefaults(defineProps<Props>(), {
  optional: 0,
})
```

### Avoiding `as any` (Antipattern)

**`as any` is an antipattern that bypasses TypeScript's type safety.** It should be avoided and corrected when found.

#### Why `as any` is Problematic

1. **Disables type checking** - Errors that TypeScript would catch are silently ignored
2. **Spreads through codebase** - Once you have `any`, it infects other types
3. **Hides design issues** - Often indicates missing interfaces or improper types
4. **Makes refactoring dangerous** - No compiler help when changing code

#### How to Fix `as any`

**1. Create proper interfaces:**
```typescript
// ❌ Bad
const data = response.data as any
const name = data.user.name

// ✅ Good
interface ApiResponse {
  user: {
    name: string
    email: string
  }
}
const data = response.data as ApiResponse
const name = data.user.name
```

**2. Use type guards:**
```typescript
// ❌ Bad
function process(input: unknown) {
  return (input as any).value
}

// ✅ Good
interface HasValue {
  value: string
}

function hasValue(input: unknown): input is HasValue {
  return typeof input === 'object' && input !== null && 'value' in input
}

function process(input: unknown) {
  if (hasValue(input)) {
    return input.value  // Type-safe!
  }
  return null
}
```

**3. Use `unknown` with narrowing:**
```typescript
// ❌ Bad
function handleEvent(event: any) {
  console.log(event.target.value)
}

// ✅ Good
function handleEvent(event: unknown) {
  if (event && typeof event === 'object' && 'target' in event) {
    const target = event.target
    if (target && typeof target === 'object' && 'value' in target) {
      console.log(target.value)
    }
  }
}
```

**4. Extend incomplete external types:**
```typescript
// When external library types are incomplete
// ❌ Bad
const id = (message as any).id

// ✅ Good
interface IMessageWithId extends IMessage {
  id?: string
}

function getMessageId(message: IMessage): string {
  if ('id' in message && typeof (message as IMessageWithId).id === 'string') {
    return (message as IMessageWithId).id!
  }
  return `message-${message.timestamp}`
}
```

#### Acceptable Uses of Type Assertions

Type assertions (`as Type`) are different from `as any` and are acceptable when:
- You have more information than TypeScript can infer
- You're narrowing from a broader type to a specific one
- The assertion is to a **specific type**, not `any`

```typescript
// ✅ Acceptable: Specific type assertion with validation
const element = document.getElementById('app') as HTMLDivElement

// ✅ Acceptable: Narrowing after type guard
if (isAdaptiveCardPayload(payload)) {
  const card = payload.adaptiveCard as AdaptiveCardData
}

// ❌ Not acceptable: Bypassing type system
const data = response as any
```

#### When You Find `as any`

1. **Investigate why** it was added - often reveals a missing type
2. **Create proper types** for the data structure
3. **Add type guards** for runtime validation
4. **Document upstream issues** if external types are incomplete

### Performance

```vue
<script setup lang="ts">
// ✅ Good: Memoize expensive calculations
const expensiveValue = computed(() => {
  // Expensive calculation here
  return items.value.filter(/* ... */).map(/* ... */)
})

// ✅ Good: Watch specific dependencies
watch(() => props.userId, (newId) => {
  fetchUserData(newId)
})

// ❌ Avoid: Watching entire reactive object
watch(state, () => {
  // Runs on ANY state change
})
</script>
```

### Testing

```typescript
// ✅ Good: Clear test with error case
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Component from '../src/components/Component.vue'
import { MessageContextKey } from '../src/composables/useMessageContext'

describe('Component', () => {
  const createMessage = (overrides = {}) => ({
    text: 'Test',
    source: 'bot' as const,
    timestamp: '123',
    data: {},
    ...overrides,
  })

  it('renders with message', () => {
    const message = createMessage()
    const wrapper = mount(Component, {
      global: {
        provide: {
          [MessageContextKey as symbol]: {
            message,
            config: {},
            action: vi.fn(),
            onEmitAnalytics: vi.fn(),
          },
        },
      },
    })

    expect(wrapper.text()).toContain('Test')
  })

  it('handles missing text gracefully', () => {
    const message = createMessage({ text: '' })
    const wrapper = mount(Component, {
      global: {
        provide: {
          [MessageContextKey as symbol]: {
            message,
            config: {},
            action: vi.fn(),
            onEmitAnalytics: vi.fn(),
          },
        },
      },
    })

    expect(wrapper.find('[data-testid="fallback"]').exists()).toBe(true)
  })
})
```

### DRY Principle (Don't Repeat Yourself)

**Keep production code DRY, but allow tests to be repetitive.**

#### In Production Code: Eliminate Duplication

```typescript
// ❌ Bad: Repeated validation logic
function createUser(data) {
  if (!data.email?.includes('@')) throw new Error('Invalid email')
  // create user...
}

function updateUser(id, data) {
  if (!data.email?.includes('@')) throw new Error('Invalid email')
  // update user...
}

// ✅ Good: Extracted common validation
function validateEmail(email) {
  if (!email?.includes('@')) throw new Error('Invalid email')
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

#### In Tests: Repetition is OK for Clarity

**Tests are exempt from DRY.** Each test should be isolated and self-contained:

```typescript
// ✅ Good: Repetitive but clear - each test is self-contained
describe('validateEmail', () => {
  it('rejects email without @', () => {
    expect(() => validateEmail('notanemail')).toThrow('Invalid email')
  })

  it('rejects empty email', () => {
    expect(() => validateEmail('')).toThrow('Invalid email')
  })

  it('accepts valid email', () => {
    expect(() => validateEmail('user@test.com')).not.toThrow()
  })
})

// ❌ Bad: Over-DRY tests are harder to understand
describe('validateEmail', () => {
  const cases = [
    { input: 'notanemail', shouldThrow: true },
    { input: '', shouldThrow: true },
    { input: 'user@test.com', shouldThrow: false }
  ]

  cases.forEach(({ input, shouldThrow }) => {
    it(`handles ${input}`, () => {
      const fn = () => validateEmail(input)
      shouldThrow ? expect(fn).toThrow() : expect(fn).not.toThrow()
    })
  })
})
```

**Why repetitive tests are better:**
- Each test is immediately readable
- Stack traces point to exact test
- Easy to run or skip individual tests
- Changes to one test don't affect others

**Test helpers are OK for complex setup:**
```typescript
// ✅ Good: Helper for complex object creation
function createTestMessage(overrides = {}) {
  return {
    text: 'Test',
    source: 'bot' as const,
    timestamp: '123',
    data: {},
    ...overrides
  }
}
```

### Code Review Checklist

Before submitting code, verify:

- ✅ Code is easy to read and understand
- ✅ No unnecessary complexity or cleverness
- ✅ No code duplication in production code (DRY)
- ✅ Tests are self-contained (repetition OK)
- ✅ Error cases are handled explicitly
- ✅ Errors are logged with sufficient context
- ✅ Null/undefined checks at boundaries
- ✅ TypeScript types are accurate and helpful
- ✅ **No `as any` type assertions** (use proper types or type guards)
- ✅ Performance-sensitive paths are optimized
- ✅ Tests cover happy path and error cases
- ✅ No silent failures or swallowed errors
- ✅ Function names clearly describe what they do
- ✅ Comments explain "why", not "what"
- ✅ Props not destructured (maintains reactivity)
- ✅ CSS modules imported in script with `useCssModule()`
- ✅ Template expressions are simple
- ✅ Component follows established patterns

### When in Doubt

1. **Choose clarity over cleverness**
2. **Choose explicitness over implicitness**
3. **Choose simplicity over abstraction**
4. **Choose reliability over novelty**

If you're considering a complex solution, ask:
- Can this be done more simply?
- Will someone else understand this in 6 months?
- What happens when this fails?
- Is this solving a real problem or a hypothetical one?

## Common Pitfalls

### 1. CSS Modules Not Working

**Problem:**
```vue
<div :class="$style.wrapper">  <!-- Error: $style is not defined -->
```

**Solution:**
```vue
<script setup lang="ts">
import { useCssModule } from 'vue'
const $style = useCssModule()
</script>
```

### 2. Props Destructuring Breaks Reactivity

**Problem:**
```typescript
const { value } = defineProps<Props>()
// value is NOT reactive!
```

**Solution:**
```typescript
const props = defineProps<Props>()
// props.value is reactive
```

### 3. Context Key Type in Tests

**Problem:**
```typescript
provide: {
  MessageContextKey: { ... }  // Wrong - string instead of symbol
}
```

**Solution:**
```typescript
provide: {
  [MessageContextKey as symbol]: { ... }  // Correct
}
```

### 4. Forgetting .value for Refs

**Problem:**
```typescript
const count = ref(0)
console.log(count)  // Logs ref object
count++  // Doesn't work
```

**Solution:**
```typescript
const count = ref(0)
console.log(count.value)  // Logs number
count.value++  // Works

// In template: no .value needed
<template>{{ count }}</template>
```

## Release Process

1. Update version: `npm version patch` or `npm version minor`
2. Create PR with version bump
3. After merge: `git push --tags`
4. CI/CD will publish to npm registry

## Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Vitest](https://vitest.dev/)
- [TypeScript with Vue](https://vuejs.org/guide/typescript/overview.html)
