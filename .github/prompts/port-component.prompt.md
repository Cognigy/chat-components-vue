# Port React Component to Vue 3

You are helping port a React component from @cognigy/chat-components to Vue 3 for @cognigy/chat-components-vue.

## Your Task

When given a React component file path or code, convert it to a Vue 3 component following the patterns established in this codebase.

## React to Vue 3 Conversion Reference

### Hook Conversions

| React | Vue 3 |
|-------|-------|
| `useState(value)` | `ref(value)` |
| `useState({})` | `reactive({})` |
| `useEffect(() => {}, [])` | `onMounted(() => {})` |
| `useEffect(() => {}, [dep])` | `watch(() => dep, () => {})` |
| `useEffect(() => {})` | `watchEffect(() => {})` |
| `useMemo(() => val, [deps])` | `computed(() => val)` |
| `useCallback(fn, [deps])` | Just use `fn` directly |
| `useContext(Context)` | `inject(ContextKey)` or `useMessageContext()` |
| `useRef()` | `ref()` or `ref<HTMLElement>()` for DOM |

### Template Conversions

| React | Vue 3 |
|-------|-------|
| `className={styles.foo}` | `:class="$style.foo"` |
| `className={classnames('a', cond && 'b')}` | `:class="['a', cond && 'b']"` |
| `{condition && <div/>}` | `<div v-if="condition"/>` |
| `{cond ? <A/> : <B/>}` | `<A v-if="cond"/> <B v-else/>` |
| `{items.map(i => <div key={i.id}/>)}` | `<div v-for="i in items" :key="i.id"/>` |
| `onClick={handler}` | `@click="handler"` |
| `dangerouslySetInnerHTML={{__html: x}}` | `v-html="sanitizedX"` |
| `{children}` | `<slot/>` |

### Props Pattern

```typescript
// React
const Component: FC<Props> = ({ required, optional = 0 }) => {}

// Vue 3
const props = withDefaults(defineProps<Props>(), {
  optional: 0,
})
// Access: props.required, props.optional
// NEVER destructure props (breaks reactivity)
```

## Vue 3 Component Template

```vue
<template>
  <div :class="$style.wrapper" data-testid="component-name">
    <Typography variant="body-regular">{{ displayText }}</Typography>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useCssModule } from 'vue'
import { useMessageContext } from '../../composables/useMessageContext'
import Typography from '../common/Typography.vue'

const $style = useCssModule()

interface Props {
  required: string
  optional?: number
}

const props = withDefaults(defineProps<Props>(), {
  optional: 0,
})

const { message, config, action, onEmitAnalytics } = useMessageContext()

const displayText = computed(() => props.required)
</script>

<style module>
.wrapper {
  padding: 16px;
  background-color: var(--cc-white, #ffffff);
  border-radius: var(--cc-bubble-border-radius, 15px);
}
</style>
```

## Test Template

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Component from '../src/components/messages/Component.vue'
import { MessageContextKey } from '../src/composables/useMessageContext'

describe('Component', () => {
  const createMessage = (overrides = {}) => ({
    text: 'Test',
    source: 'bot' as const,
    timestamp: '123',
    data: {},
    ...overrides,
  })

  const mountComponent = (message = createMessage(), config = {}) => {
    return mount(Component, {
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

  it('renders message text', () => {
    const wrapper = mountComponent(createMessage({ text: 'Hello' }))
    expect(wrapper.text()).toContain('Hello')
  })
})
```

## Key Patterns in This Codebase

1. **CSS Modules**: Always use `const $style = useCssModule()` and `:class="$style.xxx"`
2. **Context**: Use `useMessageContext()` for message, config, action
3. **Sanitization**: Use `useSanitize()` or `sanitizeHTMLWithConfig()` for HTML
4. **Typography**: Use `<Typography variant="body-regular">` for text
5. **Test IDs**: Add `data-testid="component-name"` to root element
6. **CSS Variables**: Use `var(--cc-primary-color, fallback)` format

## Available Composables

- `useMessageContext()` - Access message, config, action, onEmitAnalytics
- `useSanitize()` - HTML sanitization
- `useImageContext()` - Image context for galleries
- `useChannelPayload()` - Get webchat payload from message

## Project Structure

- Components: `src/components/messages/ComponentName.vue`
- Tests: `test/ComponentName.spec.ts`
- Docs: `docs/components/component-name.md`
- Types: `src/types/index.ts`

## Deliverables

When porting a component, create:

1. **Vue component** at `src/components/messages/ComponentName.vue`
2. **Test file** at `test/ComponentName.spec.ts`
3. **Documentation** at `docs/components/component-name.md`
4. **Export** in `src/index.ts`

## Common Pitfalls

- **Don't destructure props** - breaks reactivity
- **Don't forget `useCssModule()`** - required for `$style`
- **Use `[MessageContextKey as symbol]`** in test providers
- **Access refs with `.value`** in script (not in template)