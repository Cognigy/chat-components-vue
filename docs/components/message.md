# Message

**Main message renderer component** that automatically displays the appropriate UI for any message type using a matcher system.

## Import

```typescript
import { Message } from '@cognigy/chat-components-vue'
```

## Features

- **Automatic Component Matching**: Uses matcher system to determine which component to render
- **Multi-type Support**: Handles all message types (text, images, videos, buttons, galleries, etc.)
- **Context Provision**: Provides message context to all child components
- **Accessibility**: Includes ARIA attributes and keyboard navigation support
- **Source-specific Styling**: Applies different styling for bot/user/agent messages
- **Flexible Configuration**: Supports custom plugins and configuration

## Usage

### Basic Text Message

```vue
<template>
  <Message
    :message="message"
    :action="handleAction"
    :config="config"
  />
</template>

<script setup lang="ts">
import { Message } from '@cognigy/chat-components-vue'
import type { IMessage, MessageSender } from '@cognigy/chat-components-vue'

const message: IMessage = {
  text: 'Hello from the chatbot!',
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {},
}

const config = {
  settings: {
    layout: {
      botAvatarName: 'Assistant',
    },
  },
}

const handleAction: MessageSender = (text, data) => {
  console.log('User action:', text, data)
}
</script>
```

### Image Message

```typescript
const imageMessage: IMessage = {
  text: '',
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _cognigy: {
      _webchat: {
        message: {
          attachment: {
            type: 'image',
            payload: {
              url: 'https://example.com/photo.jpg',
            },
          },
        },
      },
    },
  },
}
```

### Text with Buttons

```typescript
const buttonsMessage: IMessage = {
  text: 'Choose an option:',
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _cognigy: {
      _webchat: {
        message: {
          quick_replies: [
            {
              content_type: 'text',
              title: 'Option 1',
              payload: 'opt1',
            },
            {
              content_type: 'text',
              title: 'Option 2',
              payload: 'opt2',
            },
          ],
        },
      },
    },
  },
}
```

### Gallery

```typescript
const galleryMessage: IMessage = {
  text: '',
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _cognigy: {
      _webchat: {
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: [
                {
                  title: 'Product 1',
                  subtitle: 'Description of product 1',
                  image_url: 'https://example.com/product1.jpg',
                  buttons: [
                    {
                      type: 'postback',
                      title: 'View Details',
                      payload: 'product1',
                    },
                  ],
                },
                {
                  title: 'Product 2',
                  subtitle: 'Description of product 2',
                  image_url: 'https://example.com/product2.jpg',
                  buttons: [
                    {
                      type: 'postback',
                      title: 'View Details',
                      payload: 'product2',
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    },
  },
}
```

## Props

### message (required)

- Type: `IMessage`
- The message object to render
- Must include: `text`, `source`, `timestamp`
- Optional: `data` object containing message-specific data

```typescript
interface IMessage {
  text: string
  source: 'bot' | 'user' | 'agent'
  timestamp: string
  data?: Record<string, any>
}
```

### action

- Type: `MessageSender`
- Default: `undefined`
- Callback function for user actions (button clicks, etc.)

```typescript
type MessageSender = (
  text?: string,
  data?: Record<string, any> | null,
  options?: Partial<SendMessageOptions>
) => void
```

### config

- Type: `ChatConfig`
- Default: `undefined`
- Configuration object for chat behavior and appearance

```typescript
interface ChatConfig {
  active?: boolean
  URLToken?: string
  initialSessionId?: string
  settings?: ChatSettings
  isConfigLoaded?: boolean
  isTimedOut?: boolean
}
```

### theme

- Type: `ChatTheme`
- Default: `undefined`
- Theme configuration for colors and styling

```typescript
interface ChatTheme {
  primaryColor?: string
  primaryColorHover?: string
  secondaryColor?: string
  backgroundBotMessage?: string
  backgroundUserMessage?: string
  textDark?: string
  textLight?: string
  fontFamily?: string
}
```

### prevMessage

- Type: `IMessage`
- Default: `undefined`
- Previous message for context (used for collation/grouping)

### plugins

- Type: `MessagePlugin[]`
- Default: `undefined`
- Custom message plugins for extending matcher system

```typescript
interface MessagePlugin {
  name: string
  match: (message: IMessage, config?: ChatConfig) => boolean
  component: any
  options?: {
    passthrough?: boolean
  }
}
```

### onEmitAnalytics

- Type: `(event: string, payload?: unknown) => void`
- Default: `undefined`
- Callback for analytics events

### disableHeader

- Type: `boolean`
- Default: `false`
- Whether to disable message headers (currently not implemented in simplified version)

## Matcher System

The Message component uses a **matcher system** to determine which component to render based on the message structure:

### Built-in Message Types

1. **Text** - Simple text messages
2. **Image** - Image attachments
3. **Video** - Video attachments (direct, YouTube, Vimeo)
4. **Audio** - Audio attachments
5. **TextWithButtons** - Text with quick replies or buttons
6. **Gallery** - Horizontal carousel of cards
7. **List** - Vertical list with header
8. **File** - File attachments (documents, PDFs)
9. **DatePicker** - Date picker plugin
10. **AdaptiveCard** - Microsoft Adaptive Cards
11. **Webchat3Event** - Event messages
12. **XAppSubmit** - XApp submission messages

### Match Priority

Matchers are evaluated in order, and the first matching rule wins (unless `passthrough: true`).

### Custom Plugins

You can extend the matcher with custom plugins:

```vue
<template>
  <Message
    :message="message"
    :plugins="customPlugins"
  />
</template>

<script setup lang="ts">
import { Message } from '@cognigy/chat-components-vue'
import CustomMessageComponent from './CustomMessageComponent.vue'

const customPlugins = [
  {
    name: 'CustomMessage',
    match: (message) => {
      return message.data?._custom?.type === 'special'
    },
    component: CustomMessageComponent,
    options: {
      passthrough: false, // Stop matching after this rule
    },
  },
]
</script>
```

## Message Context

The Message component automatically provides context to all child components using `provideMessageContext`:

```typescript
{
  message: IMessage,
  config: ChatConfig,
  action: MessageSender,
  onEmitAnalytics: (event: string, payload?: unknown) => void
}
```

Child components can access this context using `useMessageContext()`.

## CSS Variables

```css
/* Applied via child components - Message itself has minimal styling */

/* Example overrides for child components */
--cc-primary-color: #1976d2;
--cc-white: #ffffff;
--cc-black-10: rgba(0, 0, 0, 0.1);
--cc-bubble-border-radius: 15px;
```

## Global CSS Classes

```css
/* Message wrapper */
.webchat-message-row {
  /* Base message row styles */
}

/* Source-specific classes */
.webchat-message-row.bot {
  /* Bot message alignment (left) */
}

.webchat-message-row.user {
  /* User message alignment (right) */
}

.webchat-message-row.agent {
  /* Agent message alignment (left) */
}
```

## Accessibility

### ARIA Attributes

- Each message has a unique `data-message-id` for identification
- Hidden focusable target for keyboard navigation
- Source-specific classes for screen reader context

### Keyboard Navigation

```html
<!-- Hidden focusable target -->
<div
  id="webchat-focus-target-{messageId}"
  tabindex="-1"
  class="sr-only"
  aria-hidden="true"
/>
```

Usage:
```javascript
// Programmatically focus a message
const target = document.getElementById('webchat-focus-target-message-123')
target?.focus()
```

## Common Patterns

### Chat History Rendering

```vue
<template>
  <div class="chat-history">
    <Message
      v-for="message in messages"
      :key="message.timestamp"
      :message="message"
      :prev-message="getPrevMessage(index)"
      :action="handleAction"
      :config="chatConfig"
      @emit-analytics="trackEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@cognigy/chat-components-vue'
import type { IMessage } from '@cognigy/chat-components-vue'

const messages = ref<IMessage[]>([])

const getPrevMessage = (index: number) => {
  return index > 0 ? messages.value[index - 1] : undefined
}

const handleAction = (text?: string, data?: any) => {
  console.log('Action:', text, data)
  // Send to backend, update UI, etc.
}

const chatConfig = {
  settings: {
    layout: {
      botAvatarName: 'Assistant',
    },
  },
}

const trackEvent = (event: string, payload?: unknown) => {
  console.log('Analytics:', event, payload)
}
</script>
```

### Handling Different Sources

```vue
<template>
  <div class="chat-container">
    <Message
      v-for="message in messages"
      :key="message.timestamp"
      :message="message"
      :class="getMessageClass(message)"
    />
  </div>
</template>

<script setup lang="ts">
import { Message } from '@cognigy/chat-components-vue'
import type { IMessage } from '@cognigy/chat-components-vue'

const getMessageClass = (message: IMessage) => {
  return {
    'bot-message': message.source === 'bot',
    'user-message': message.source === 'user',
    'agent-message': message.source === 'agent',
  }
}
</script>

<style scoped>
.bot-message {
  align-self: flex-start;
}

.user-message {
  align-self: flex-end;
}
</style>
```

## Troubleshooting

### Message not rendering

**Problem**: Message component renders nothing

**Solutions**:
1. Check that message has required properties (`text`, `source`, `timestamp`)
2. Verify message data structure matches expected format for message type
3. Check browser console for matcher errors
4. Ensure message type is supported by built-in matchers or custom plugins

```javascript
// Debug: Check what matcher returns
import { match } from '@cognigy/chat-components-vue'

const matched = match(message, config)
console.log('Matched components:', matched)
```

### Wrong component rendered

**Problem**: Message renders unexpected component

**Solutions**:
1. Check message data structure - might match wrong rule
2. Review matcher priority - first match wins
3. Use custom plugins with specific match conditions
4. Check for `passthrough` option in plugins

### Action callback not firing

**Problem**: Button clicks don't trigger action callback

**Solutions**:
1. Ensure `action` prop is provided
2. Check that action is a function
3. Verify button data structure includes `payload` or `url`
4. Check browser console for errors

### Styling not applied

**Problem**: Custom styles don't affect message

**Solutions**:
1. Use global CSS classes (`.webchat-message-row`, etc.)
2. Set CSS variables for child components
3. Check CSS specificity - may need `!important`
4. Verify classes are not being overridden by CSS modules

## Testing

### Basic Rendering Test

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Message from '@cognigy/chat-components-vue'
import type { IMessage } from '@cognigy/chat-components-vue'

describe('Message', () => {
  it('renders text message', () => {
    const message: IMessage = {
      text: 'Hello world',
      source: 'bot',
      timestamp: '1673456789000',
      data: {},
    }

    const wrapper = mount(Message, {
      props: { message },
    })

    expect(wrapper.text()).toContain('Hello world')
  })

  it('renders with correct source class', () => {
    const message: IMessage = {
      text: 'Test',
      source: 'user',
      timestamp: '1673456789000',
      data: {},
    }

    const wrapper = mount(Message, {
      props: { message },
    })

    expect(wrapper.find('.user').exists()).toBe(true)
  })
})
```

### Testing with Actions

```typescript
it('calls action callback on button click', async () => {
  const action = vi.fn()
  const message: IMessage = {
    text: 'Choose:',
    source: 'bot',
    timestamp: '1673456789000',
    data: {
      _cognigy: {
        _webchat: {
          message: {
            quick_replies: [
              {
                content_type: 'text',
                title: 'Yes',
                payload: 'yes',
              },
            ],
          },
        },
      },
    },
  }

  const wrapper = mount(Message, {
    props: { message, action },
  })

  const button = wrapper.find('button')
  await button.trigger('click')

  expect(action).toHaveBeenCalled()
})
```

## Implementation Notes

### Simplified Version

This is a **simplified version** focused on chat history rendering. It does not include:

- Message collation (grouping consecutive messages)
- Message headers with avatars and timestamps
- Fullscreen mode
- Animation states
- Live region updates

These features can be added later if needed for interactive chat applications.

### Matcher Integration

The Message component relies on the matcher system (`src/utils/matcher.ts`) which:
- Evaluates message structure against match rules
- Returns matched components in priority order
- Supports custom plugins for extensibility

### Context Provision

Uses Vue's `provide/inject` pattern to pass message context to all child components without prop drilling.

## Related Components

- [TextMessage](./text-message.md) - Text rendering
- [ImageMessage](./image-message.md) - Image display
- [VideoMessage](./video-message.md) - Video player
- [AudioMessage](./audio-message.md) - Audio player
- [TextWithButtons](./text-with-buttons.md) - Interactive buttons
- [Gallery](./gallery.md) - Card carousel
- [List](./list.md) - Vertical list
- [FileMessage](./file-message.md) - File attachments
- [DatePicker](./date-picker.md) - Date selection
- [AdaptiveCard](./adaptive-card.md) - Adaptive Cards

## Best Practices

1. **Always provide required props**: `message` is required, `action` and `config` are highly recommended
2. **Use TypeScript types**: Import `IMessage`, `MessageSender`, etc. for type safety
3. **Handle actions**: Provide `action` callback to handle user interactions
4. **Configure appropriately**: Use `config` prop for bot names, colors, behavior
5. **Test message types**: Ensure your data structures match expected formats
6. **Use prevMessage**: Pass previous message for context (useful for collation/grouping)
7. **Emit analytics**: Use `onEmitAnalytics` to track user interactions
8. **Custom plugins**: Extend matcher with custom plugins for special message types

## Future Enhancements

Potential additions for full chat application:

- [ ] Message collation (grouping consecutive messages from same source)
- [ ] Message headers with avatars and timestamps
- [ ] Fullscreen mode for galleries and media
- [ ] Animation states for typing indicators and message entry
- [ ] Live region updates for screen readers
- [ ] Message editing and deletion
- [ ] Read receipts and delivery status
- [ ] Message reactions
- [ ] Thread/reply support

## Security

### XSS Prevention

- All text content is sanitized through child components
- HTML rendering uses DOMPurify
- URL validation in buttons and links
- No `v-html` without sanitization

### Data Validation

- Message structure is validated by matcher
- Malformed messages are safely ignored
- No execution of arbitrary code from message data

## Performance

### Bundle Size

- Message.vue: ~3KB
- Dependencies: All message type components + matcher
- Total: ~50KB (gzipped) including all message types

### Rendering

- Lightweight matching logic
- Lazy component rendering (only matched components load)
- Efficient context provision
- Minimal re-renders

## Comparison with React Version

| Feature | Vue Version | React Version |
|---------|-------------|---------------|
| Matcher System | ✅ | ✅ |
| Message Types | ✅ (10 types) | ✅ (10+ types) |
| Custom Plugins | ✅ | ✅ |
| Context Provision | ✅ (provide/inject) | ✅ (Context API) |
| Collation | ❌ (simplified) | ✅ |
| Message Headers | ❌ (simplified) | ✅ |
| Fullscreen Mode | ❌ (simplified) | ✅ |
| Animation States | ❌ (simplified) | ✅ |
| Bundle Size | ~50KB | ~70KB |

The Vue version is **simplified** for chat history rendering. Full features can be added incrementally as needed.
