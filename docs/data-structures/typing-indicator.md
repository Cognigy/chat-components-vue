# Typing Indicator

The typing indicator is a UI component, not a message type. It displays an animated "..." to indicate that the bot or agent is typing.

## Component

**Component:** `TypingIndicator.vue`

**Props:** None

## Usage

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
import { Message, TypingIndicator } from '@cognigy/chat-components-vue'

const messages = ref([])
const isBotTyping = ref(false)

async function sendMessage(text: string) {
  // Add user message
  messages.value.push({ text, source: 'user', timestamp: Date.now().toString() })

  // Show typing indicator
  isBotTyping.value = true

  // Fetch bot response
  const response = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ text }) })
  const data = await response.json()

  // Hide typing indicator
  isBotTyping.value = false

  // Add bot response
  messages.value.push(data.message)
}
</script>
```

## Styling

The typing indicator uses CSS animations for the bouncing dots effect. It can be styled via CSS variables:

```css
.typing-indicator {
  --dot-color: #94a3b8;
  --dot-size: 8px;
  --animation-duration: 1.4s;
}
```

## Accessibility

The typing indicator includes appropriate ARIA attributes:
- `role="status"`
- `aria-live="polite"`
- `aria-label="Bot is typing"`

## When to Show

Show the typing indicator:
- ✅ After user sends a message, before bot responds
- ✅ When waiting for API response
- ✅ During streaming responses (optional)

Don't show the typing indicator:
- ❌ When no action is pending
- ❌ For user messages
- ❌ After bot has responded

## Implementation Notes

The typing indicator is stateless and purely presentational. Parent components control when it's displayed via `v-if`.

## Related

- [Text Message](./text.md) - Often follows typing indicator
- [Message Component](../components/message.md) - Main message renderer
