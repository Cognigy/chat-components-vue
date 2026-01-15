# Porting Guide: React to Vue 3

This guide helps with porting components from the React version to Vue 3.

## Key Differences

### 1. Component Structure

**React (Functional Component):**
```tsx
import React, { FC } from 'react'

interface Props {
  message: IMessage
  action?: MessageSender
}

const MessageComponent: FC<Props> = ({ message, action }) => {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    // side effect
  }, [dependency])

  return <div>{message.text}</div>
}

export default MessageComponent
```

**Vue 3 (Composition API):**
```vue
<template>
  <div>{{ message.text }}</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { IMessage, MessageSender } from '../types'

interface Props {
  message: IMessage
  action?: MessageSender
}

const props = defineProps<Props>()

const state = ref(initialState)

watch(() => dependency, () => {
  // side effect
})
</script>
```

### 2. State Management

| React | Vue 3 |
|-------|-------|
| `useState` | `ref` or `reactive` |
| `useReducer` | `reactive` with methods |
| `useMemo` | `computed` |
| `useCallback` | Regular function (reactive by default) |
| `useEffect` | `watch` or `watchEffect` |
| `useRef` | `ref` with `.value` |

### 3. Context/Provide-Inject

**React Context:**
```tsx
const MessageContext = createContext<MessageContext>(null!)

export const MessageProvider: FC = ({ children, value }) => (
  <MessageContext.Provider value={value}>
    {children}
  </MessageContext.Provider>
)

export const useMessageContext = () => {
  return useContext(MessageContext)
}
```

**Vue Provide/Inject:**
```typescript
// Provider
import { provide } from 'vue'

const MessageContextKey = Symbol('MessageContext')

provide(MessageContextKey, contextValue)

// Consumer
import { inject } from 'vue'

const context = inject(MessageContextKey)
```

### 4. Props and Events

**React:**
```tsx
interface Props {
  message: IMessage
  onClick: (id: string) => void
}

<Component message={msg} onClick={handleClick} />

// In component:
props.onClick(id)
```

**Vue:**
```vue
<!-- Parent -->
<Component :message="msg" @click="handleClick" />

<!-- Child -->
<script setup lang="ts">
interface Props {
  message: IMessage
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: [id: string]
}>()

// Emit event:
emit('click', id)
</script>
```

### 5. Conditional Rendering

**React:**
```tsx
{condition && <Component />}
{condition ? <A /> : <B />}
```

**Vue:**
```vue
<Component v-if="condition" />
<A v-if="condition" />
<B v-else />
```

### 6. Lists

**React:**
```tsx
{items.map((item, index) => (
  <Item key={item.id} item={item} />
))}
```

**Vue:**
```vue
<Item
  v-for="(item, index) in items"
  :key="item.id"
  :item="item"
/>
```

### 7. Refs to DOM Elements

**React:**
```tsx
const elementRef = useRef<HTMLDivElement>(null)

<div ref={elementRef}>Content</div>

// Access: elementRef.current
```

**Vue:**
```vue
<script setup lang="ts">
const elementRef = ref<HTMLDivElement>()
</script>

<template>
  <div ref="elementRef">Content</div>
</template>

<!-- Access: elementRef.value -->
```

### 8. Lifecycle

| React | Vue 3 |
|-------|-------|
| `useEffect(() => { ... }, [])` (mount) | `onMounted(() => { ... })` |
| `useEffect(() => { return () => { ... } }, [])` (unmount) | `onUnmounted(() => { ... })` |
| `useEffect(() => { ... }, [dep])` (on change) | `watch(() => dep, () => { ... })` |

## Porting Checklist

When porting a component:

1. [ ] Create `.vue` file with same name
2. [ ] Port props interface to `defineProps<Props>()`
3. [ ] Convert `useState` to `ref` or `reactive`
4. [ ] Convert `useEffect` to `watch`, `watchEffect`, or lifecycle hooks
5. [ ] Convert `useMemo` to `computed`
6. [ ] Convert `useContext` to `inject`
7. [ ] Port JSX to Vue template
8. [ ] Update event handlers (callbacks → emit)
9. [ ] Test component in isolation
10. [ ] Update parent components to use new Vue component
11. [ ] Write tests

## Common Patterns

### Pattern: Memoized Values

**React:**
```tsx
const computedValue = useMemo(() => {
  return expensiveOperation(dependency)
}, [dependency])
```

**Vue:**
```typescript
const computedValue = computed(() => {
  return expensiveOperation(dependency.value)
})
```

### Pattern: Callback Props

**React:**
```tsx
const handleClick = useCallback((id: string) => {
  onAction(id)
}, [onAction])

<Child onClick={handleClick} />
```

**Vue:**
```vue
<!-- Parent -->
<script setup lang="ts">
const handleClick = (id: string) => {
  onAction(id)
}
</script>

<template>
  <Child @click="handleClick" />
</template>

<!-- Child -->
<script setup lang="ts">
const emit = defineEmits<{
  click: [id: string]
}>()
</script>
```

### Pattern: Conditional Classes

**React:**
```tsx
import classnames from 'classnames'

<div className={classnames('base', { active: isActive })} />
```

**Vue:**
```vue
<div :class="['base', { active: isActive }]" />
```

### Pattern: Dynamic Styles

**React:**
```tsx
<div style={{ color: primaryColor, fontSize: '16px' }} />
```

**Vue:**
```vue
<div :style="{ color: primaryColor, fontSize: '16px' }" />
```

## Error Handling

Maintain the same error handling principles:

**React:**
```tsx
try {
  result = processData(data)
} catch (error) {
  console.error('processData failed', { error, data })
  result = fallbackValue
}
```

**Vue (same approach):**
```typescript
try {
  result.value = processData(data.value)
} catch (error) {
  console.error('processData failed', { error, data: data.value })
  result.value = fallbackValue
}
```

## Testing

**React (React Testing Library):**
```tsx
import { render, screen } from '@testing-library/react'

test('renders message', () => {
  render(<Message message={testMessage} />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

**Vue (Vue Test Utils):**
```typescript
import { mount } from '@vue/test-utils'

test('renders message', () => {
  const wrapper = mount(Message, {
    props: { message: testMessage }
  })
  expect(wrapper.text()).toContain('Hello')
})
```

## Resources

- [Vue 3 Composition API Docs](https://vuejs.org/guide/extras/composition-api-faq.html)
- [React to Vue Guide](https://vuejs.org/guide/extras/react-to-vue.html)
- [Vue Test Utils](https://test-utils.vuejs.org/)

## Next Steps

Start with these components (in order of complexity):

1. TypingIndicator (simple, no props)
2. ChatEvent (simple, basic props)
3. Typography (moderate, style handling)
4. TextMessage (moderate, context usage)
5. ActionButtons (complex, multiple interactions)
6. Gallery (complex, multiple child components)
7. Message (most complex, uses matcher system)