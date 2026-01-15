# TypingIndicator Component

Displays an animated typing indicator with three bouncing dots.

## Import

```typescript
import { TypingIndicator } from '@cognigy/chat-components-vue'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Additional CSS class names |
| `direction` | `'incoming' \| 'outgoing'` | `'incoming'` | Alignment direction |
| `disableBorder` | `boolean` | `false` | Remove border and background styling |

## Usage

### Basic Usage

```vue
<template>
  <div class="chat-messages">
    <Message
      v-for="msg in messages"
      :key="msg.id"
      :message="msg"
    />

    <!-- Show while bot is typing -->
    <TypingIndicator v-if="isBotTyping" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TypingIndicator } from '@cognigy/chat-components-vue'

const isBotTyping = ref(false)
</script>
```

### With Direction

```vue
<template>
  <!-- Incoming (left-aligned) -->
  <TypingIndicator direction="incoming" />

  <!-- Outgoing (right-aligned) -->
  <TypingIndicator direction="outgoing" />
</template>
```

### Without Border

```vue
<template>
  <TypingIndicator :disable-border="true" />
</template>
```

### Custom Styling

```vue
<template>
  <TypingIndicator class-name="my-custom-typing" />
</template>

<style>
.my-custom-typing {
  margin: 8px;
}
</style>
```

## CSS Variables

The component uses CSS variables that can be customized:

```css
:root {
  --cc-white: #ffffff;                /* Background color */
  --cc-black-80: rgba(0, 0, 0, 0.8);  /* Border color */
  --cc-black-40: rgba(0, 0, 0, 0.4);  /* Dot color */
  --webchat-message-margin-block: 24px;   /* Vertical margin */
  --webchat-message-margin-inline: 20px;  /* Horizontal margin */
}
```

## Accessibility

The component includes proper accessibility attributes:

- `role="status"` - Indicates dynamic content
- `aria-live="polite"` - Announces changes politely
- `aria-label="Bot is typing"` - Describes the indicator
- Respects `prefers-reduced-motion` - Disables animation if user prefers

## Animation

The three dots animate in sequence with a bouncing effect:
1. First dot bounces up and down
2. Second dot bounces (slightly delayed)
3. Third dot bounces (further delayed)

The animation loops infinitely and uses CSS keyframes for smooth performance.

**Animation respects user preferences:**
- If user has `prefers-reduced-motion` enabled, animation is disabled
- Dots remain static but component still renders

## Best Practices

### When to Show

✅ **Show the indicator:**
- After user sends a message
- While waiting for API response
- During bot processing time
- When streaming responses (optional)

❌ **Don't show the indicator:**
- When no action is pending
- After bot has already responded
- For user messages
- Continuously without purpose

### Example: Show During API Call

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TypingIndicator } from '@cognigy/chat-components-vue'

const messages = ref<IMessage[]>([])
const isBotTyping = ref(false)

async function sendMessage(text: string) {
  // Add user message
  messages.value.push({
    text,
    source: 'user',
    timestamp: Date.now().toString()
  })

  // Show typing indicator
  isBotTyping.value = true

  try {
    // Fetch bot response
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })

    const data = await response.json()

    // Add bot response
    messages.value.push(data.message)
  } catch (error) {
    console.error('Failed to send message:', error)
    // Show error message
    messages.value.push({
      text: 'Sorry, there was an error.',
      source: 'bot',
      timestamp: Date.now().toString()
    })
  } finally {
    // Hide typing indicator
    isBotTyping.value = false
  }
}
</script>

<template>
  <div class="chat">
    <Message
      v-for="msg in messages"
      :key="msg.id"
      :message="msg"
    />
    <TypingIndicator v-if="isBotTyping" />
  </div>
</template>
```

## Styling

### Default Appearance

The indicator has:
- White background with gray border
- 62px width, 44px height
- Rounded corners (15px radius)
- Three gray dots (6px diameter each)
- Centered alignment

### Customization Options

1. **CSS Variables** - Override theme colors
2. **className prop** - Add custom classes
3. **disableBorder prop** - Remove background/border
4. **direction prop** - Change alignment
5. **Global class** - `.webchat-typing-indicator` for external styling

### Example: Custom Theme

```vue
<template>
  <TypingIndicator class="custom-typing" />
</template>

<style>
.custom-typing {
  --cc-white: #f0f9ff;
  --cc-black-80: #3b82f6;
  --cc-black-40: #60a5fa;
}
</style>
```

## Related Components

- [Message](./message.md) - Main message renderer
- [ChatEvent](./chat-event.md) - Event indicators

## Troubleshooting

### Indicator Not Showing

Check that:
1. Component is imported correctly
2. Conditional (`v-if`) is properly set
3. Parent container has space for it

### Animation Not Working

Possible causes:
1. User has `prefers-reduced-motion` enabled (by design)
2. CSS modules not loading correctly
3. CSS variables overridden incorrectly

### Styling Issues

If custom styles aren't applying:
1. Check CSS specificity
2. Ensure CSS modules are enabled in Vite config
3. Use `!important` sparingly, prefer CSS variables
4. Verify class names are applied in browser devtools

## Implementation Notes

- Component is stateless and purely presentational
- Parent components control visibility via `v-if`
- Uses Vue's CSS modules for scoped styling
- No runtime dependencies beyond Vue
- Respects accessibility and performance best practices
- Animation uses CSS keyframes (GPU-accelerated)

## Testing

The component has comprehensive tests covering:
- ✅ Three dots render correctly
- ✅ Accessibility attributes present
- ✅ Custom className applied
- ✅ Direction prop works
- ✅ disableBorder prop works
- ✅ Global class applied
- ✅ Defaults work correctly
- ✅ Missing props handled gracefully

See `test/TypingIndicator.spec.ts` for full test suite.
