# Chat Event

Chat events are **not message types** - they are UI components used to display system notifications and status changes.

## Component Type

**Component:** `ChatEvent.vue`

**Category:** UI Component (not data-driven)

## When to Use

Use `ChatEvent` for:
- Conversation lifecycle events ("Conversation started", "Conversation ended")
- Agent status changes ("Agent joined", "Agent left")
- Connection status ("Connected", "Disconnected", "Reconnecting...")
- System notifications
- Transfer notifications

## Usage

Unlike message types which are rendered automatically based on data structure, ChatEvent is explicitly rendered by your application based on state.

### Example: Conversation Lifecycle

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ChatEvent, Message } from '@cognigy/chat-components-vue'

const messages = ref([])
const showConversationStart = ref(false)

onMounted(() => {
  // Show conversation started event
  showConversationStart.value = true
})
</script>

<template>
  <div class="chat-messages">
    <ChatEvent v-if="showConversationStart" text="Conversation started" />

    <Message
      v-for="msg in messages"
      :key="msg.id"
      :message="msg"
    />
  </div>
</template>
```

### Example: Connection Status

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChatEvent } from '@cognigy/chat-components-vue'

const isConnected = ref(navigator.onLine)

// Watch connection status
watch(isConnected, (connected) => {
  // Application logic determines when to show events
})
</script>

<template>
  <ChatEvent v-if="!isConnected" text="You were disconnected" />
  <ChatEvent v-if="isConnected && wasDisconnected" text="Reconnected" />
</template>
```

## Not a Message Type

**Important:** ChatEvent does **not** use the matcher system. It's rendered explicitly by your application.

```vue
<!-- ❌ Wrong: Trying to send as a message -->
const eventMessage = {
  text: "Agent joined",
  source: "system"
}
// This won't automatically show as ChatEvent

<!-- ✅ Correct: Render explicitly -->
<ChatEvent text="Agent joined" />
```

## Backend Integration

### Option 1: Frontend-Only Events

Frontend determines when to show events based on application state:

```typescript
// Frontend code
const websocket = new WebSocket(url)

websocket.onopen = () => {
  showEvent('Connected')
}

websocket.onclose = () => {
  showEvent('You were disconnected')
}
```

### Option 2: Backend-Triggered Events

Backend can send special event indicators:

**Backend Response:**
```json
{
  "type": "system_event",
  "event": "agent_joined",
  "data": {
    "agentName": "Sarah",
    "agentId": "agent_123"
  }
}
```

**Frontend Handling:**
```typescript
function handleWebSocketMessage(data: any) {
  if (data.type === 'system_event') {
    // Show ChatEvent based on event type
    switch (data.event) {
      case 'agent_joined':
        showEvent(`Agent ${data.data.agentName} joined the chat`)
        break
      case 'agent_left':
        showEvent(`Agent ${data.data.agentName} left the chat`)
        break
      case 'transferred':
        showEvent(`Transferred to ${data.data.agentName}`)
        break
    }
  } else if (data.type === 'message') {
    // Regular message - render with Message component
    addMessage(data.message)
  }
}
```

## Event Types Reference

### Conversation Events
```typescript
"Conversation started"
"Conversation ended"
"Conversation transferred"
```

### Agent Events
```typescript
"Agent [Name] joined the chat"
"Agent [Name] left the chat"
"Transferred to Agent [Name]"
"Transferred to [Department]"
```

### Connection Events
```typescript
"Connected"
"Disconnected"
"Reconnecting..."
"You were disconnected"
"Connection restored"
```

### System Events
```typescript
"Typing timeout"
"File uploaded successfully"
"File upload failed"
"Chat archived"
```

## Validation

Since ChatEvent is application-controlled:

```typescript
// Validate event text before showing
function showEvent(text: string) {
  if (!text || text.trim() === '') {
    console.warn('showEvent: empty event text')
    return
  }

  if (text.length > 100) {
    console.warn('showEvent: text too long', { length: text.length })
    // Truncate or show error
  }

  // Show event
  currentEvent.value = text
}
```

## State Management

### Simple Approach: Reactive Variable

```typescript
const currentEvent = ref<string | null>(null)

function showEvent(text: string) {
  currentEvent.value = text

  // Auto-hide after 3 seconds (optional)
  setTimeout(() => {
    currentEvent.value = null
  }, 3000)
}
```

```vue
<template>
  <ChatEvent v-if="currentEvent" :text="currentEvent" />
</template>
```

### Advanced: Event Queue

```typescript
interface Event {
  id: string
  text: string
  timestamp: number
}

const events = ref<Event[]>([])

function addEvent(text: string) {
  events.value.push({
    id: Date.now().toString(),
    text,
    timestamp: Date.now()
  })
}
```

```vue
<template>
  <ChatEvent
    v-for="event in events"
    :key="event.id"
    :text="event.text"
  />
</template>
```

## Common Patterns

### Pattern: Mixed Messages and Events

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface ChatItem {
  id: string
  type: 'message' | 'event'
  content: any
  timestamp: number
}

const chatItems = ref<ChatItem[]>([])

function addMessage(message: IMessage) {
  chatItems.value.push({
    id: message.id!,
    type: 'message',
    content: message,
    timestamp: Date.now()
  })
}

function addEvent(text: string) {
  chatItems.value.push({
    id: Date.now().toString(),
    type: 'event',
    content: { text },
    timestamp: Date.now()
  })
}
</script>

<template>
  <div class="chat">
    <template v-for="item in chatItems" :key="item.id">
      <ChatEvent v-if="item.type === 'event'" :text="item.content.text" />
      <Message v-else :message="item.content" />
    </template>
  </div>
</template>
```

### Pattern: Temporary Events

```typescript
function showTemporaryEvent(text: string, duration = 3000) {
  const eventId = Date.now().toString()

  activeEvents.value.push({ id: eventId, text })

  setTimeout(() => {
    activeEvents.value = activeEvents.value.filter(e => e.id !== eventId)
  }, duration)
}
```

## Best Practices

1. **Keep text concise** - Events should be short and clear
2. **Don't overuse** - Too many events clutter the interface
3. **Consider timing** - Auto-hide temporary events
4. **Be consistent** - Use similar phrasing for similar events
5. **Think accessibility** - Events use `aria-live="assertive"`

## Related

- [TypingIndicator](./typing-indicator.md) - Another UI component (not a message type)
- [ChatEvent Component](../components/chat-event.md) - Component API documentation
- [Backend Integration](../patterns/backend-integration.md) - How to integrate with backend

## Summary

**Key Points:**
- ✅ ChatEvent is a UI component, not a message type
- ✅ Rendered explicitly by application logic
- ✅ Not driven by matcher system
- ✅ Backend can trigger events, but frontend controls rendering
- ✅ Use for system notifications and status changes
