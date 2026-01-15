# Component Porter Agent

Specialized agent for porting React chat components from @cognigy/chat-components to Vue 3.

## Purpose

This agent automates the conversion of React components to Vue 3, following established patterns and ensuring consistency across the codebase.

## Usage

```bash
/port-component <path-to-react-component> [component-name]
```

**Examples:**
```bash
# Using absolute path
/port-component /Users/dev/chat-components/src/messages/RatingMessage.tsx

# Using relative path (if React repo is adjacent)
/port-component ../chat-components/src/messages/RatingMessage.tsx

# With explicit component name
/port-component ../chat-components/src/messages/RatingMessage.tsx RatingMessage
```

## Context

This agent understands both:
1. **React patterns** from @cognigy/chat-components (original repository)
2. **Vue 3 patterns** from @cognigy/chat-components-vue (this repository)

---

## React Component Patterns (Source)

### React Hook Conversions

| React Hook | Vue 3 Equivalent | Notes |
|------------|------------------|-------|
| `useState(value)` | `ref(value)` | Access with `.value` in script |
| `useState({})` | `reactive({})` | For objects, no `.value` needed |
| `useEffect(() => {}, [])` | `onMounted(() => {})` | Run once on mount |
| `useEffect(() => {}, [dep])` | `watch(() => dep, () => {})` | Watch specific dependency |
| `useEffect(() => {})` | `watchEffect(() => {})` | Auto-track dependencies |
| `useMemo(() => val, [deps])` | `computed(() => val)` | Auto-memoized |
| `useCallback(fn, [deps])` | `fn` | Not needed, functions are stable |
| `useContext(Context)` | `inject(ContextKey)` | Use `useMessageContext()` |
| `useRef()` | `ref()` | For DOM: `ref<HTMLElement>()` |
| `useRef(value)` | `ref(value)` | Same as useState |

### React Component Patterns

| React Pattern | Vue 3 Pattern |
|---------------|---------------|
| `<Context.Provider value={val}>` | `provide(ContextKey, val)` |
| `className={styles.foo}` | `:class="$style.foo"` |
| `className={classnames('a', condition && 'b')}` | `:class="['a', condition && 'b']"` |
| `{condition && <div/>}` | `<div v-if="condition"/>` |
| `{condition ? <A/> : <B/>}` | `<A v-if="condition"/> <B v-else/>` |
| `{items.map(item => <div key={item.id}/>)}` | `<div v-for="item in items" :key="item.id"/>` |
| `<Fragment>` or `<>` | `<template>` |
| `onClick={handler}` | `@click="handler"` |
| `onChange={(e) => setVal(e.target.value)}` | `@input="val = $event.target.value"` or `v-model="val"` |
| `style={{ color: 'red' }}` | `:style="{ color: 'red' }"` |
| `dangerouslySetInnerHTML={{__html: html}}` | `v-html="sanitizedHtml"` |
| `{children}` | `<slot/>` or direct content |
| `disabled={condition}` | `:disabled="condition"` |
| `ref={myRef}` | `ref="myRef"` (template refs) |

### React Props Patterns

```typescript
// React
interface Props {
  required: string
  optional?: number
  callback?: (data: any) => void
}

const Component: FC<Props> = ({ required, optional = 0, callback }) => {
  // ...
}

// Vue 3
interface Props {
  required: string
  optional?: number
  callback?: (data: any) => void
}

const props = withDefaults(defineProps<Props>(), {
  optional: 0,
  callback: undefined,
})

// Access: props.required, props.optional
// DON'T destructure props (breaks reactivity)
```

### React Test Patterns (Jest/RTL → Vitest/VTU)

| React Testing Library | Vue Test Utils |
|----------------------|----------------|
| `render(<Component/>)` | `mount(Component, { props })` |
| `screen.getByTestId('foo')` | `wrapper.find('[data-testid="foo"]')` |
| `screen.getByText('Hello')` | `wrapper.text()` includes check |
| `fireEvent.click(button)` | `await wrapper.trigger('click')` |
| `fireEvent.change(input, {target: {value: 'x'}})` | `await wrapper.setValue('x')` |
| `waitFor(() => expect())` | `await wrapper.vm.$nextTick()` |
| `expect(el).toBeInTheDocument()` | `expect(wrapper.find().exists()).toBe(true)` |
| `expect(el).toHaveClass('foo')` | `expect(wrapper.classes()).toContain('foo')` |
| `expect(el).toHaveAttribute('aria-label')` | `expect(wrapper.attributes('aria-label')).toBe(...)` |

---

## Vue 3 Component Patterns (Target)

### Project Structure

```
chat-components-vue/
├── src/
│   ├── components/
│   │   ├── Message.vue           # Main renderer
│   │   ├── common/               # Shared UI components
│   │   │   ├── ActionButton.vue
│   │   │   ├── ActionButtons.vue
│   │   │   ├── ChatBubble.vue
│   │   │   ├── ChatEvent.vue
│   │   │   ├── Typography.vue
│   │   │   └── TypingIndicator.vue
│   │   └── messages/             # Message type components
│   │       ├── TextMessage.vue
│   │       ├── ImageMessage.vue
│   │       ├── VideoMessage.vue
│   │       ├── AudioMessage.vue
│   │       ├── TextWithButtons.vue
│   │       ├── Gallery.vue
│   │       ├── List.vue
│   │       ├── FileMessage.vue
│   │       ├── DatePicker.vue
│   │       └── AdaptiveCard.vue
│   ├── composables/              # Vue composables (hooks)
│   │   ├── useMessageContext.ts
│   │   ├── useSanitize.ts
│   │   └── useImageContext.ts
│   ├── utils/
│   │   ├── matcher.ts           # Message type matching
│   │   ├── sanitize.ts          # HTML sanitization
│   │   └── helpers.ts           # Utility functions
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   ├── assets/
│   │   └── svg/                 # SVG icon components
│   └── index.ts                 # Public API exports
├── test/                        # Vitest + Vue Test Utils
├── docs/
│   ├── components/              # Component documentation
│   └── data-structures/         # Data format docs
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### Vue Component Template

```vue
<template>
  <div
    v-if="shouldRender"
    :class="[$style.wrapper, 'global-class-name']"
    data-testid="component-name"
  >
    <!-- Conditional rendering -->
    <div v-if="condition">Shown when true</div>
    <div v-else>Shown when false</div>

    <!-- List rendering -->
    <ChildComponent
      v-for="item in items"
      :key="item.id"
      :prop="item"
      @event="handleEvent"
    />

    <!-- Typography for text -->
    <Typography variant="body-regular" component="span">
      {{ displayText }}
    </Typography>

    <!-- Sanitized HTML -->
    <div v-html="sanitizedContent" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, watchEffect, onMounted, useCssModule } from 'vue'
import { useMessageContext } from '../../composables/useMessageContext'
import Typography from '../common/Typography.vue'
import ChildComponent from './ChildComponent.vue'

// CSS Modules
const $style = useCssModule()

// Props
interface Props {
  required: string
  optional?: number
  items?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  optional: 0,
  items: () => [],
})

// Context (replaces useContext)
const { message, config, action, onEmitAnalytics } = useMessageContext()

// State (replaces useState)
const localState = ref<string>('')
const complexState = reactive({
  count: 0,
  items: [] as string[],
})

// Computed (replaces useMemo)
const shouldRender = computed(() => {
  return props.required && localState.value !== ''
})

const displayText = computed(() => {
  return `${props.required}: ${localState.value}`
})

// Watchers (replaces useEffect)
watch(() => props.required, (newVal, oldVal) => {
  console.log('Props changed:', oldVal, '->', newVal)
})

watchEffect(() => {
  // Auto-tracks dependencies
  console.log('Auto-tracked:', localState.value)
})

// Lifecycle (replaces useEffect with empty deps)
onMounted(() => {
  console.log('Component mounted')
})

// Event handlers
const handleEvent = (data: any) => {
  localState.value = data
  action?.('Button clicked', data)
  onEmitAnalytics?.('event_name', { data })
}

// Expose for testing (optional)
defineExpose({
  localState,
  handleEvent,
})
</script>

<style module>
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background-color: var(--cc-white, #ffffff);
  border-radius: var(--cc-bubble-border-radius, 15px);
}

/* CSS variables from theme */
/* Available: --cc-primary-color, --cc-white, --cc-black-{10,20,40,80}, etc. */
</style>
```

### Vue Test Template

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import Component from '../src/components/messages/Component.vue'
import { MessageContextKey } from '../src/composables/useMessageContext'
import type { IMessage } from '../src/types'

describe('Component', () => {
  let wrapper: VueWrapper

  // Helper: Create test message
  const createMessage = (overrides: Partial<IMessage> = {}): IMessage => ({
    text: 'Test message',
    source: 'bot',
    timestamp: '1673456789000',
    data: {},
    ...overrides,
  })

  // Helper: Mount component with context
  const mountComponent = (message: IMessage, props = {}, config = {}) => {
    return mount(Component, {
      props,
      global: {
        provide: {
          [MessageContextKey as symbol]: {
            message,
            config,
            action: vi.fn(),
            onEmitAnalytics: vi.fn(),
          },
        },
      },
    })
  }

  afterEach(() => {
    wrapper?.unmount()
  })

  describe('Rendering', () => {
    it('renders component', () => {
      const message = createMessage()
      wrapper = mountComponent(message)

      expect(wrapper.find('[data-testid="component-name"]').exists()).toBe(true)
    })

    it('displays message text', () => {
      const message = createMessage({ text: 'Hello World' })
      wrapper = mountComponent(message)

      expect(wrapper.text()).toContain('Hello World')
    })

    it('does not render when condition not met', () => {
      const message = createMessage({ text: '' })
      wrapper = mountComponent(message)

      expect(wrapper.find('[data-testid="component-name"]').exists()).toBe(false)
    })
  })

  describe('Props', () => {
    it('accepts required prop', () => {
      const message = createMessage()
      wrapper = mountComponent(message, { required: 'test-value' })

      expect(wrapper.props('required')).toBe('test-value')
    })

    it('uses default for optional prop', () => {
      const message = createMessage()
      wrapper = mountComponent(message, { required: 'test' })

      expect(wrapper.props('optional')).toBe(0)
    })
  })

  describe('User Interaction', () => {
    it('handles button click', async () => {
      const action = vi.fn()
      const message = createMessage()

      wrapper = mount(Component, {
        props: { required: 'test' },
        global: {
          provide: {
            [MessageContextKey as symbol]: {
              message,
              config: {},
              action,
              onEmitAnalytics: vi.fn(),
            },
          },
        },
      })

      const button = wrapper.find('button')
      await button.trigger('click')

      expect(action).toHaveBeenCalledWith('Button clicked', expect.any(Object))
    })
  })

  describe('Edge Cases', () => {
    it('handles null/undefined props gracefully', () => {
      const message = createMessage()
      wrapper = mountComponent(message, {
        required: 'test',
        optional: undefined,
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('handles empty arrays', () => {
      const message = createMessage()
      wrapper = mountComponent(message, {
        required: 'test',
        items: [],
      })

      expect(wrapper.findAll('[data-testid="item"]').length).toBe(0)
    })
  })

  describe('Accessibility', () => {
    it('includes ARIA attributes', () => {
      const message = createMessage()
      wrapper = mountComponent(message)

      const element = wrapper.find('[data-testid="component-name"]')
      expect(element.attributes('role')).toBeDefined()
    })
  })
})
```

### Key Vue Patterns to Follow

1. **Use Existing Composables**:
   - `useMessageContext()` - Access message, config, action
   - `useSanitize()` - HTML sanitization
   - `useImageContext()` - Image context (for Gallery/List items)

2. **CSS Modules**:
   - Always import: `const $style = useCssModule()`
   - Use in template: `:class="$style.className"`
   - Global classes: Apply directly as strings

3. **TypeScript Types**:
   - Import from `src/types/index.ts`
   - Common types: `IMessage`, `ChatConfig`, `MessageSender`, `IWebchatButton`

4. **Data Test IDs**:
   - Add `data-testid` to all major elements
   - Use kebab-case: `data-testid="component-name"`

5. **CSS Variables**:
   - Use existing theme variables
   - Format: `var(--cc-variable-name, fallback)`
   - Common: `--cc-primary-color`, `--cc-white`, `--cc-bubble-border-radius`

---

## Porting Procedure (5 Steps)

### Step 1: Analysis & Planning

**Read React source files:**
```bash
Read: <react-repo-path>/src/messages/ComponentName.tsx
Read: <react-repo-path>/test/ComponentName.spec.tsx (if exists)
```

**Analyze and document:**
- [ ] Component purpose and main features
- [ ] Props interface and types
- [ ] State management (what hooks are used)
- [ ] Context dependencies (useMessageContext, custom contexts)
- [ ] Child components and their usage
- [ ] Event handlers and callbacks
- [ ] Styling approach (CSS modules, inline styles)
- [ ] Test coverage (number of tests, what they cover)
- [ ] External dependencies (libraries, utilities)
- [ ] Special considerations (animations, refs, complex logic)

**Create implementation plan:**
- Determine if full or simplified version is needed
- Identify Vue equivalents for React patterns
- Note any Vue-specific improvements possible
- Plan test structure

### Step 2: Implementation

**Create component file:**
```bash
Write: src/components/messages/ComponentName.vue
```

**Conversion checklist:**
- [ ] **Template Section**:
  - Convert JSX to Vue template syntax
  - Replace `className` with `:class`
  - Replace `{condition && <div/>}` with `v-if`
  - Replace `.map()` with `v-for`
  - Add `data-testid` attributes
  - Use `Typography` component for text

- [ ] **Script Section**:
  - Import Vue functions and composables
  - Convert props to `defineProps<Props>()`
  - Convert state with `ref()` or `reactive()`
  - Convert effects to `watch()` or `watchEffect()`
  - Convert memoized values to `computed()`
  - Get context via `useMessageContext()`
  - Add `useCssModule()` for styles

- [ ] **Style Section**:
  - Convert to `<style module>`
  - Use CSS variables for theming
  - Keep global class names consistent
  - Ensure responsive design

- [ ] **Types**:
  - Import types from `src/types/index.ts`
  - Add new types if needed
  - Ensure full TypeScript coverage

### Step 3: Testing

**Create test file:**
```bash
Write: test/ComponentName.spec.ts
```

**Test structure:**
```typescript
describe('ComponentName', () => {
  describe('Rendering', () => {
    // Basic render, conditional render, content display
  })

  describe('Props', () => {
    // Required props, optional props, defaults, validation
  })

  describe('User Interaction', () => {
    // Clicks, inputs, events, callbacks
  })

  describe('Context', () => {
    // Message data, config, actions
  })

  describe('Edge Cases', () => {
    // Null/undefined, empty arrays, missing data
  })

  describe('Accessibility', () => {
    // ARIA attributes, keyboard navigation
  })

  describe('CSS Classes', () => {
    // Global classes, module classes
  })
})
```

**Run tests:**
```bash
npm test -- ComponentName.spec.ts
```

**Fix issues until all tests pass.**

**Aim for:**
- Equal or better coverage than React version
- 100% of features tested
- All edge cases covered
- Clear, descriptive test names

### Step 4: Documentation

**Create documentation:**
```bash
Write: docs/components/component-name.md
```

**Documentation sections:**

```markdown
# ComponentName

One-sentence description of the component.

## Import

\`\`\`typescript
import { ComponentName } from '@cognigy/chat-components-vue'
\`\`\`

## Features

- Feature 1
- Feature 2
- Feature 3

## Usage

### Basic Example

\`\`\`vue
<template>
  <ComponentName :prop="value" />
</template>

<script setup lang="ts">
import { ComponentName } from '@cognigy/chat-components-vue'
</script>
\`\`\`

### Advanced Example

[More complex usage]

### [Other Use Cases]

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| prop1 | string | - | Required prop |
| prop2 | number | 0 | Optional prop |

## Events

[If component emits events]

## CSS Variables

\`\`\`css
--cc-variable-name: default-value;
\`\`\`

## Global CSS Classes

\`\`\`css
.global-class-name { }
\`\`\`

## Accessibility

- ARIA attributes
- Keyboard navigation
- Screen reader support

## Common Patterns

[2-3 real-world examples]

## Troubleshooting

### Issue 1

**Problem**: Description

**Solution**: How to fix

## Testing

[Example test]

## Related Components

- [Link](./other-component.md)

## Implementation Notes

- Design decisions
- Simplifications (if any)
- Performance considerations
```

### Step 5: Integration & Verification

**Update exports:**
```bash
Edit: src/index.ts
```

Add export:
```typescript
export { default as ComponentName } from './components/messages/ComponentName.vue'
```

**Update tracking files:**

1. **README.md** - Mark component complete:
```markdown
### Message Types
- [x] ComponentName.vue ✅
```

2. **PROGRESS.md** - Add to completed list and update metrics:
```markdown
- [x] **ComponentName.vue** ✅
  - Features: [list key features]
  - Dependencies: [list dependencies]
  - Tests: X/X passing
  - Documentation: Complete
  - Status: **Production ready**

### Test Coverage
- **ComponentName**: 100% (X/X tests passing)
- **Overall**: XXX/XXX tests passing
```

3. **docs/components/README.md** - Add to table:
```markdown
| ComponentName | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
```

**Run verification:**
```bash
# Full test suite
npm test

# Build check (may have pre-existing type errors - document if new)
npm run build
```

**Final checks:**
- [ ] All tests passing
- [ ] Component exported in src/index.ts
- [ ] Documentation complete
- [ ] Tracking files updated
- [ ] No new console errors
- [ ] No regressions in existing tests
- [ ] TypeScript compiles (or known issues documented)

---

## Special Considerations

### Simplified Components

For components used primarily in **chat history rendering** (not real-time interaction):

**When to simplify:**
- Component is rarely interactive in practice
- Full implementation requires heavy dependencies (>50KB)
- Presentation layer is sufficient for primary use case

**How to simplify:**
- Keep visual presentation
- Remove complex interactivity
- Remove heavy dependencies
- Document simplifications clearly

**Examples:**
- **DatePicker**: No Flatpickr library, simple button display
- **AdaptiveCard**: No Microsoft SDK, presentation-only display

**Documentation template for simplified components:**
```markdown
## Use Case

This component is designed for **chat history rendering** where you need to show
that a [ComponentName] was sent, but don't need the full interactive functionality.

## Implementation Notes

### Simplified Version

This is a **presentation-only** version focused on chat history rendering.
It does not include:
- [Feature 1]
- [Feature 2]

### Full Version (Would Require)

For full interactive implementation:
- Library X (~YKB)
- Additional implementation for Z
- ~N lines of code vs current ~M lines

### When to Use Full Implementation

Consider full interactive implementation if:
- Users need to interact in real-time
- [Specific requirement]
```

### External Dependencies

**Before adding a dependency:**
1. Check if already installed in package.json
2. Consider bundle size impact
3. Look for lighter alternatives
4. Evaluate if native solution possible

**If dependency needed:**
```bash
npm install library-name
npm install --save-dev @types/library-name
```

Document in PROGRESS.md under "Dependencies added".

### Missing Types

If React component uses types not in Vue repo:

**Add to `src/types/index.ts`:**
```typescript
export interface INewType {
  property: string
  // ...
}
```

**Export from `src/index.ts`:**
```typescript
export type { INewType } from './types'
```

---

## DRY Principle (Don't Repeat Yourself)

**Keep production code DRY, but allow tests to be repetitive.**

### In Production Code: Eliminate Duplication

```typescript
// ❌ Bad: Repeated validation logic
function createUser(data: UserData) {
  if (!data.email?.includes('@')) throw new Error('Invalid email')
  // create user...
}

function updateUser(id: string, data: UserData) {
  if (!data.email?.includes('@')) throw new Error('Invalid email')
  // update user...
}

// ✅ Good: Extracted common validation
function validateEmail(email: string) {
  if (!email?.includes('@')) throw new Error('Invalid email')
}

function createUser(data: UserData) {
  validateEmail(data.email)
  // create user...
}

function updateUser(id: string, data: UserData) {
  validateEmail(data.email)
  // update user...
}
```

### In Tests: Repetition is OK

**Tests are exempt from DRY.** Each test should be isolated and self-contained:

```typescript
// ✅ Good: Repetitive but clear and isolated
describe('Component', () => {
  it('renders with text', () => {
    const wrapper = mount(Component, {
      props: { text: 'Hello' }
    })
    expect(wrapper.text()).toContain('Hello')
  })

  it('renders with empty text', () => {
    const wrapper = mount(Component, {
      props: { text: '' }
    })
    expect(wrapper.find('[data-testid="empty"]').exists()).toBe(true)
  })

  it('renders with long text', () => {
    const wrapper = mount(Component, {
      props: { text: 'Very long text...' }
    })
    expect(wrapper.find('[data-testid="truncated"]').exists()).toBe(true)
  })
})

// ❌ Bad: Over-DRY tests (harder to understand and debug)
describe('Component', () => {
  const testCases = [
    { text: 'Hello', check: (w) => expect(w.text()).toContain('Hello') },
    { text: '', check: (w) => expect(w.find('[data-testid="empty"]').exists()).toBe(true) },
    { text: 'Very long...', check: (w) => expect(w.find('[data-testid="truncated"]').exists()).toBe(true) }
  ]

  testCases.forEach(({ text, check }) => {
    it(`handles ${text}`, () => {
      const wrapper = mount(Component, { props: { text } })
      check(wrapper)
    })
  })
})
```

**Why repetitive tests are better:**
- Each test is immediately readable
- Stack traces point to exact test
- Easy to run or skip individual tests
- No hidden logic in loops or helper functions

**Test helpers are OK for setup:**
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

// Use in tests
it('renders message', () => {
  const message = createTestMessage({ text: 'Hello' })
  // ... test logic
})
```

---

## Common Pitfalls & Solutions

### 1. CSS Modules Not Working

**Problem:**
```vue
<div :class="$style.wrapper">  <!-- Error: $style is not defined -->
```

**Solution:**
```vue
<script setup lang="ts">
import { useCssModule } from 'vue'

const $style = useCssModule()  // Must import explicitly
</script>
```

### 2. Props Destructuring Breaks Reactivity

**Problem:**
```typescript
const { prop1, prop2 } = defineProps<Props>()
// prop1 and prop2 are NOT reactive!
```

**Solution:**
```typescript
const props = defineProps<Props>()
// Access: props.prop1, props.prop2 (reactive)
```

### 3. Wrong Context Key in Tests

**Problem:**
```typescript
provide: {
  MessageContextKey: { ... }  // Wrong - string instead of symbol
}
```

**Solution:**
```typescript
import { MessageContextKey } from '../src/composables/useMessageContext'

provide: {
  [MessageContextKey as symbol]: { ... }  // Correct
}
```

### 4. Forgetting `.value` for Refs

**Problem:**
```vue
<script setup>
const count = ref(0)
console.log(count)  // Wrong: logs ref object
count++  // Wrong: doesn't work
</script>
```

**Solution:**
```vue
<script setup>
const count = ref(0)
console.log(count.value)  // Correct: logs number
count.value++  // Correct: increments
</script>

<template>
  <!-- No .value in template -->
  <div>{{ count }}</div>
</template>
```

### 5. Watch Not Firing on Mount

**Problem:**
```typescript
watch(() => props.value, () => {
  console.log('Changed')
})
// Doesn't run on mount, only on changes
```

**Solution:**
```typescript
watch(() => props.value, () => {
  console.log('Changed')
}, { immediate: true })  // Run on mount too
```

### 6. Test Data Structure Not Matching Matcher

**Problem:**
```typescript
const message = {
  data: {
    _cognigy: {
      attachment: { ... }  // Wrong location
    }
  }
}
// Component doesn't render
```

**Solution:**
```typescript
// Check matcher.ts for correct structure
const message = {
  data: {
    _cognigy: {
      _webchat: {
        message: {
          attachment: { ... }  // Correct location
        }
      }
    }
  }
}
```

### 7. Component Name Mismatch in Matcher

**Problem:**
```typescript
// In matcher.ts: name: 'Image'
// In Message.vue: componentMap['ImageMessage']
// Component not found!
```

**Solution:**
```typescript
// Match the name from matcher.ts exactly
componentMap = {
  'Image': ImageMessage,  // Correct
}
```

---

## Quality Checklist

Use this checklist before marking component complete:

### Implementation
- [ ] All React features ported
- [ ] Props match (with Vue conventions)
- [ ] State management converted correctly
- [ ] Effects/watchers work as expected
- [ ] Context integration working
- [ ] Event handlers implemented
- [ ] Styling matches React version
- [ ] TypeScript types complete
- [ ] No console warnings/errors

### Testing
- [ ] Test file created
- [ ] All rendering scenarios tested
- [ ] Props tested (required, optional, defaults)
- [ ] User interactions tested
- [ ] Context integration tested
- [ ] Edge cases covered
- [ ] Accessibility tested
- [ ] All tests passing
- [ ] Coverage equal to or better than React

### Documentation
- [ ] Documentation file created
- [ ] Import section complete
- [ ] Features listed
- [ ] Usage examples (basic + advanced)
- [ ] Props table complete
- [ ] Events documented (if any)
- [ ] CSS variables listed
- [ ] Global CSS classes listed
- [ ] Accessibility section complete
- [ ] Common patterns included
- [ ] Troubleshooting section complete
- [ ] Testing example included
- [ ] Related components linked
- [ ] Implementation notes included

### Integration
- [ ] Component exported in src/index.ts
- [ ] Types exported (if new types added)
- [ ] README.md updated
- [ ] PROGRESS.md updated
- [ ] docs/components/README.md updated
- [ ] Full test suite passes (npm test)
- [ ] No regressions in existing tests

### Code Quality
- [ ] Follows established Vue patterns
- [ ] Uses existing composables
- [ ] Code is readable and maintainable
- [ ] No code duplication in production code (DRY)
- [ ] **No `as any` type assertions** (use proper types or type guards)
- [ ] Tests are self-contained (repetition OK for clarity)
- [ ] Comments where needed
- [ ] TypeScript strict mode compliance
- [ ] Performance considerations addressed

---

## Agent Workflow

When invoked with `/port-component <path>`:

### 1. Initialization
```
Component Porter Agent activated.

React component: <provided-path>
Vue target: src/components/messages/<ComponentName>.vue
Tests: test/<ComponentName>.spec.ts
Docs: docs/components/<component-name>.md

Confirming paths...
```

### 2. Analysis Phase
```
Reading React component...
✓ Found: <path>/ComponentName.tsx
✓ Found tests: <path>/ComponentName.spec.tsx

Analyzing component:
- Purpose: [Description]
- Props: [List]
- Hooks: [List]
- Dependencies: [List]
- Features: [List]
- Test coverage: N tests

Creating implementation plan...
```

### 3. Todo List Creation
```
Creating todo list:
- [ ] Analyze React component
- [ ] Implement Vue component
- [ ] Create comprehensive tests
- [ ] Run and fix tests
- [ ] Create documentation
- [ ] Update exports in src/index.ts
- [ ] Update tracking files
- [ ] Final verification
```

### 4. Execution with Progress Updates
```
Starting implementation...

[1/8] Analyzing React component... ✓
[2/8] Implementing Vue component... ✓
[3/8] Creating tests... ✓
[4/8] Running tests...
  - Tests: 18/18 passing ✓
[5/8] Creating documentation... ✓
[6/8] Updating exports... ✓
[7/8] Updating tracking files... ✓
[8/8] Final verification...
  - Full test suite: 446/446 passing ✓
  - Build: Success ✓
```

### 5. Completion Report
```
✅ ComponentName.vue complete!

Summary:
- Implementation: src/components/messages/ComponentName.vue
- Tests: 18/18 passing
- Documentation: docs/components/component-name.md
- Total tests: 446/446 passing

Changes:
- Added ComponentName.vue
- Added ComponentName.spec.ts (18 tests)
- Added component-name.md documentation
- Updated src/index.ts
- Updated README.md
- Updated PROGRESS.md
- Updated docs/components/README.md

Ready for review!
```

---

## Error Handling

### Missing React File
```
❌ Error: Cannot find React component at path: <path>

Please verify:
1. Path is correct
2. File exists
3. You have read permissions

Example correct paths:
- Absolute: /Users/dev/chat-components/src/messages/Component.tsx
- Relative: ../chat-components/src/messages/Component.tsx
```

### Test Failures
```
⚠️  Tests failing: 2/18

Debugging and fixing tests...
[Shows test output and fixes]

✓ All tests now passing: 18/18
```

### Type Errors
```
⚠️  TypeScript errors detected

Adding missing types to src/types/index.ts...
✓ Type errors resolved
```

### Build Errors
```
⚠️  Build errors detected

Note: Some errors may be pre-existing.
New errors introduced: [list]

[Fixes or documents new errors]
```

---

## Success Criteria

A successful port means:

✅ **Functionality**
- Matches React version exactly
- All features work as expected
- No regressions introduced

✅ **Tests**
- Equal or better coverage than React
- All tests passing
- Edge cases covered

✅ **Documentation**
- Comprehensive and clear
- Includes practical examples
- Covers all features

✅ **Integration**
- Exports correct
- Tracking files updated
- No build errors (or documented)

✅ **Code Quality**
- Follows Vue 3 best practices
- Uses established patterns
- TypeScript strict mode compliant
- Maintainable and readable

---

## Examples

### Example 1: Simple Component

**React (RatingStars.tsx):**
```tsx
const RatingStars: FC<{ rating: number }> = ({ rating }) => {
  const [hover, setHover] = useState<number | null>(null)

  return (
    <div className={styles.stars}>
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          className={star <= (hover ?? rating) ? styles.filled : styles.empty}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(null)}
        >
          ★
        </span>
      ))}
    </div>
  )
}
```

**Vue (RatingStars.vue):**
```vue
<template>
  <div :class="$style.stars">
    <span
      v-for="star in 5"
      :key="star"
      :class="star <= (hover ?? rating) ? $style.filled : $style.empty"
      @mouseenter="hover = star"
      @mouseleave="hover = null"
    >
      ★
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, useCssModule } from 'vue'

const $style = useCssModule()

interface Props {
  rating: number
}

defineProps<Props>()

const hover = ref<number | null>(null)
</script>

<style module>
.stars { display: flex; gap: 4px; }
.filled { color: gold; }
.empty { color: gray; }
</style>
```

### Example 2: Component with Context

**React:**
```tsx
const MessageText: FC = () => {
  const { message, config } = useMessageContext()
  const sanitized = useMemo(
    () => sanitizeHTML(message.text),
    [message.text]
  )

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
}
```

**Vue:**
```vue
<template>
  <div v-html="sanitizedText" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMessageContext } from '../../composables/useMessageContext'
import { sanitizeHTMLWithConfig } from '../../utils/sanitize'

const { message, config } = useMessageContext()

const sanitizedText = computed(() => {
  return sanitizeHTMLWithConfig(message.text, config)
})
</script>
```

---

## Notes

- This agent is designed for **one-way porting** (React → Vue)
- Does not handle updates back to React repository
- Focus is on **chat history rendering** use cases
- Simplified versions are acceptable when documented
- Performance and maintainability over feature completeness
- TypeScript strict mode is the goal (document if not possible)

---

**Agent Version**: 1.0.0
**Last Updated**: 2026-01-15
**Maintained by**: @cognigy/chat-components-vue team
