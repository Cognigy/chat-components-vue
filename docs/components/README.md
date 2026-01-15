# Component API Reference

Documentation for all Vue chat components.

## Core Components

### UI Components
- [TypingIndicator](./typing-indicator.md) ✅ - Animated typing indicator
- [ChatEvent](./chat-event.md) ✅ - Event notification display
- [Typography](./typography.md) ✅ - Text component with variants
- [ActionButtons](./action-buttons.md) ✅ - Interactive button group
- [ActionButton](./action-button.md) ✅ - Single action button (used by ActionButtons)
- [ChatBubble](./chat-bubble.md) ✅ - Message bubble wrapper

### Message Renderer
- [Message](./message.md) ✅ - Main message renderer (uses matcher system)

### Standalone Components
(All UI components can be used standalone)

## Message Type Components

These components are rendered automatically by the `Message` component based on data structure:

### Basic
- [TextMessage](./text-message.md) ✅ - Simple text with HTML/Markdown support

### Rich Media
- [ImageMessage](./image-message.md) ✅ - Image display with lightbox and download
- [VideoMessage](./video-message.md) ✅ - Video player (direct, YouTube, Vimeo)
- [AudioMessage](./audio-message.md) ✅ - Audio player with custom controls

### Interactive
- [TextWithButtons](./text-with-buttons.md) ✅ - Text with action buttons and Quick Replies
- [Gallery](./gallery.md) ✅ - Horizontal carousel of cards with images and buttons
- [List](./list.md) ✅ - Vertical list with header, items, and global button
- [FileMessage](./file-message.md) ✅ - File and image attachments with downloads
- [DatePicker](./date-picker.md) ✅ - Date picker presentation (simplified for rendering)

### Advanced
- [AdaptiveCard](./adaptive-card.md) ✅ - Microsoft Adaptive Cards (presentation-only)

## Documentation Status

✅ = Complete
🚧 = In Progress
❌ = Not Started

| Component | Status | Props | Events | Styling | Examples | Tests |
|-----------|--------|-------|--------|---------|----------|-------|
| TypingIndicator | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| ChatEvent | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| Typography | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| ActionButtons | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ActionButton | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| ChatBubble | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| TextMessage | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| ImageMessage | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| VideoMessage | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| AudioMessage | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| TextWithButtons | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| Gallery | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| List | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| FileMessage | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| DatePicker | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| AdaptiveCard | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| Message | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |

## General Patterns

All components follow these patterns:

### Props

- TypeScript interfaces for type safety
- Clear defaults using `withDefaults`
- Optional props clearly marked
- Validation at component boundary

### Events

- Typed events using `defineEmits`
- Descriptive event names
- Payload types documented

### Styling

- CSS Modules for scoped styles
- CSS variables for theming
- Global classes for external styling
- Responsive design

### Accessibility

- ARIA attributes where appropriate
- Keyboard navigation support
- Screen reader friendly
- Respects user preferences (motion, contrast)

### Error Handling

- Input validation
- Graceful fallbacks
- Clear error logging with context
- Never crash silently

## Usage Example

Basic pattern for all components:

```vue
<template>
  <div class="chat-app">
    <!-- Use components -->
    <Message
      v-for="msg in messages"
      :key="msg.id"
      :message="msg"
      @action="handleAction"
    />

    <TypingIndicator v-if="isTyping" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message, TypingIndicator } from '@cognigy/chat-components-vue'
import type { IMessage, MessageSender } from '@cognigy/chat-components-vue'

const messages = ref<IMessage[]>([])
const isTyping = ref(false)

const handleAction: MessageSender = (text, data) => {
  console.log('User action:', text, data)
}
</script>
```

## Contributing

When adding component documentation:

1. Create markdown file named `component-name.md`
2. Include all sections (see TypingIndicator for template)
3. Provide code examples for all use cases
4. Document all props, events, slots
5. Include accessibility information
6. Add troubleshooting section
7. Update this README with component status

### Documentation Template

```markdown
# ComponentName

Brief description

## Import
## Props
## Events (if applicable)
## Slots (if applicable)
## Usage
## CSS Variables
## Accessibility
## Best Practices
## Related Components
## Troubleshooting
## Implementation Notes
## Testing
```
