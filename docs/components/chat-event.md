# ChatEvent Component

Displays chat event notifications like "Conversation started", "Agent joined", etc.

## Import

```typescript
import { ChatEvent } from '@cognigy/chat-components-vue'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `''` | Event text to display |
| `className` | `string` | `''` | Additional CSS class names |
| `id` | `string` | `undefined` | Element ID for targeting |

## Usage

### Basic Usage

```vue
<template>
  <div class="chat-messages">
    <ChatEvent text="Conversation started" />

    <Message
      v-for="msg in messages"
      :key="msg.id"
      :message="msg"
    />

    <ChatEvent text="Agent John joined the chat" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChatEvent, Message } from '@cognigy/chat-components-vue'

const messages = ref([])
</script>
```

### Common Event Types

```vue
<template>
  <!-- Conversation lifecycle -->
  <ChatEvent text="Conversation started" />
  <ChatEvent text="Conversation ended" />

  <!-- Agent events -->
  <ChatEvent text="Agent joined the chat" />
  <ChatEvent text="Agent left the chat" />
  <ChatEvent text="Transferred to Agent Sarah" />

  <!-- System events -->
  <ChatEvent text="You were disconnected" />
  <ChatEvent text="Reconnecting..." />
  <ChatEvent text="Connected" />

  <!-- Custom events -->
  <ChatEvent text="Typing timeout" />
  <ChatEvent text="File uploaded successfully" />
</template>
```

### With Custom ID

```vue
<template>
  <ChatEvent
    id="conversation-start-event"
    text="Conversation started"
  />
</template>
```

### With Custom Styling

```vue
<template>
  <ChatEvent
    class-name="my-custom-event"
    text="Special event"
  />
</template>

<style>
.my-custom-event {
  margin-block-start: 20px;
}
</style>
```

## CSS Variables

The component uses CSS variables that can be customized:

```css
:root {
  --cc-black-80: rgba(0, 0, 0, 0.8);  /* Background color */
  --cc-black-20: rgba(0, 0, 0, 0.2);  /* Text color */
}
```

### Example: Custom Theme

```vue
<template>
  <ChatEvent class="info-event" text="Information" />
</template>

<style>
.info-event {
  --cc-black-80: #3b82f6;  /* Blue background */
  --cc-black-20: #ffffff;  /* White text */
}
</style>
```

## Accessibility

The component includes proper accessibility attributes:

- `role="status"` - Indicates a status message
- `aria-live="assertive"` - Announces immediately to screen readers
- Semantic structure for event context

**Screen Reader Behavior:**
- Events are announced immediately when they appear
- "assertive" priority interrupts current announcements
- Suitable for important system events

## Styling

### Default Appearance

The event displays as:
- Centered pill-shaped container
- Dark background with light text
- Maximum width of 250px
- 40px top margin
- Rounded corners (15px radius)

### Layout

```
┌─────────────────────────────┐
│                             │
│    ┌─────────────────┐      │
│    │   Event Text    │      │ ← Centered
│    └─────────────────┘      │
│                             │
└─────────────────────────────┘
       max-width: 250px
```

### Customization Options

1. **CSS Variables** - Override theme colors
2. **className prop** - Add custom classes
3. **Wrapper styling** - Style parent container

## Best Practices

### When to Use

✅ **Use ChatEvent for:**
- System notifications
- Conversation lifecycle events
- Agent status changes
- Connection status updates
- Important non-message content

❌ **Don't use ChatEvent for:**
- Regular chat messages (use Message component)
- Typing indicators (use TypingIndicator component)
- Errors (consider a dedicated Error component)
- Transient status (consider toast notifications)

### Event Text Guidelines

**Good event text:**
- ✅ Clear and concise
- ✅ Present tense or past tense
- ✅ Describes what happened
- ✅ No technical jargon

**Examples:**
- ✅ "Conversation started"
- ✅ "Agent joined"
- ✅ "You were disconnected"
- ❌ "WebSocket connection established"
- ❌ "Agent_123 entered room"

### Placement

```vue
<template>
  <div class="chat">
    <!-- At conversation start -->
    <ChatEvent text="Conversation started" />

    <!-- Between message groups -->
    <Message v-for="msg in beforeAgent" :key="msg.id" :message="msg" />

    <ChatEvent text="Agent Sarah joined" />

    <Message v-for="msg in withAgent" :key="msg.id" :message="msg" />

    <!-- At conversation end -->
    <ChatEvent text="Conversation ended" />
  </div>
</template>
```

## Integration Example

### With Connection Status

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChatEvent } from '@cognigy/chat-components-vue'

const isConnected = ref(true)
const connectionEvent = ref<string | null>(null)

watch(isConnected, (connected) => {
  if (connected) {
    connectionEvent.value = 'Connected'
    // Clear after showing
    setTimeout(() => {
      connectionEvent.value = null
    }, 3000)
  } else {
    connectionEvent.value = 'You were disconnected'
  }
})
</script>

<template>
  <div class="chat">
    <ChatEvent v-if="connectionEvent" :text="connectionEvent" />
    <!-- Messages -->
  </div>
</template>
```

### With Agent Transfer

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ChatEvent, Message } from '@cognigy/chat-components-vue'

interface ChatMessage {
  id: string
  text: string
  source: 'bot' | 'user' | 'agent'
  timestamp: string
}

interface AgentEvent {
  type: 'joined' | 'left'
  agentName: string
}

const messages = ref<(ChatMessage | AgentEvent)[]>([])

function handleAgentJoin(agentName: string) {
  messages.value.push({
    type: 'joined',
    agentName
  } as AgentEvent)
}

function isAgentEvent(item: any): item is AgentEvent {
  return 'type' in item && 'agentName' in item
}
</script>

<template>
  <div class="chat">
    <template v-for="(item, index) in messages" :key="index">
      <ChatEvent
        v-if="isAgentEvent(item)"
        :text="`Agent ${item.agentName} ${item.type === 'joined' ? 'joined' : 'left'} the chat`"
      />
      <Message v-else :message="item" />
    </template>
  </div>
</template>
```

## Related Components

- [TypingIndicator](./typing-indicator.md) - Typing status indicator
- [Message](./message.md) - Main message renderer
- [Typography](./typography.md) - Text styling (used internally)

## Troubleshooting

### Event Not Visible

Check that:
1. `text` prop is provided and not empty
2. Parent container has space
3. CSS variables aren't overridden incorrectly
4. Component is actually rendered (check with Vue devtools)

### Accessibility Not Working

Possible causes:
1. Screen reader not detecting - check `aria-live` attribute in DOM
2. Multiple events announced - consider debouncing rapid events
3. Events not announced - verify `role="status"` is present

### Styling Issues

If styles aren't applying:
1. Check CSS modules are working
2. Verify CSS variables have valid values
3. Check for conflicting global styles
4. Use browser devtools to inspect applied styles

### Text Overflow

If text is cut off:
```vue
<template>
  <ChatEvent class="wide-event" text="Long event text here" />
</template>

<style>
.wide-event {
  max-width: 400px; /* Override default 250px */
}
</style>
```

## Implementation Notes

- Component is stateless and purely presentational
- Text styling matches Typography "title2-semibold" variant
- Uses CSS modules for scoped styling
- Self-contained (doesn't require Typography component)
- Respects user preferences (uses system fonts as fallback)

## Testing

The component has comprehensive tests covering:
- ✅ Text rendering
- ✅ Accessibility attributes
- ✅ Custom className applied
- ✅ Custom ID applied
- ✅ Renders without text
- ✅ Handles empty text
- ✅ Renders with minimal props
- ✅ Has correct layout styles
- ✅ Handles undefined props gracefully

See `test/ChatEvent.spec.ts` for full test suite (9/9 tests passing).

## Notes for Backend Developers

ChatEvent is **not** a message type - it's a UI component that frontend developers insert based on application state. You don't need to send special "event" messages from the backend.

However, if your backend wants to trigger events:

```typescript
// Backend can send a special message type
{
  type: 'system_event',
  event: 'agent_joined',
  data: { agentName: 'Sarah' }
}

// Frontend handles it
function handleMessage(message: any) {
  if (message.type === 'system_event') {
    // Show ChatEvent
    showEvent(`Agent ${message.data.agentName} joined`)
  } else {
    // Show regular message
    addMessage(message)
  }
}
```

This is application-specific logic, not part of the component library.
