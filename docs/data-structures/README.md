# Message Data Structures

This document describes the data structures expected by the chat components. These structures determine which component is rendered (via the matcher system).

## Core Message Structure

Every message must have this base structure:

```typescript
interface IMessage {
  text?: string | string[]           // Message text (or array for streaming)
  source: 'bot' | 'user' | 'agent'  // Message source
  timestamp?: string                 // Unix timestamp as string
  id?: string                        // Unique message ID
  data?: MessageData                 // Additional data (varies by type)
}
```

## Message Types

The following message types are supported. Click each for detailed structure:

### UI Components (Not Message Types)
- [Typing Indicator](./typing-indicator.md) - Animated typing indicator (application-controlled)
- [Chat Event](./chat-event.md) - Event notifications (application-controlled)
- [Typography](./typography.md) - Text styling component (used internally)
- [Action Buttons](./action-buttons.md) - Interactive button group (standalone or in messages)

### Basic Messages
- [Text Message](./text.md) - Simple text messages with optional HTML/Markdown

### Interactive Messages
- [Quick Replies](./quick-replies.md) - Text with button options
- [Text with Buttons](./text-with-buttons.md) - Text with action buttons
- [Action Buttons](./action-buttons.md) - Standalone buttons

### Rich Media
- [Image](./image.md) - Image display with optional lightbox
- [Video](./video.md) - Video player (YouTube, Vimeo, direct URLs)
- [Audio](./audio.md) - Audio player
- [Gallery](./gallery.md) - Horizontal scrolling carousel of cards
- [List](./list.md) - Vertical list of items

### Advanced
- [File Attachments](./file-attachments.md) - File downloads
- [Date Picker](./date-picker.md) - Interactive date/time picker
- [Adaptive Cards](./adaptive-cards.md) - Microsoft Adaptive Cards

## Data Path Convention

Most message types follow this pattern:

```typescript
{
  text?: string,
  source: 'bot',
  timestamp: '1234567890',
  data: {
    _cognigy: {
      _webchat: {
        message: {
          // Message-specific data here
        }
      }
    }
  }
}
```

### Alternative Paths

- `data._cognigy._facebook` - Facebook Messenger format
- `data._cognigy._defaultPreview` - Fallback/preview content
- `data._plugin` - Plugin-specific data (e.g., date-picker)
- `data.attachments` - File attachments

## Matcher Priority

The matcher checks message types in this order:

1. xApp Submit
2. Webchat3Event
3. Date Picker
4. Text with Buttons / Quick Replies
5. Image
6. Video
7. Audio
8. File
9. List
10. Gallery
11. Adaptive Card
12. Text (fallback)

**Important:** The first matching rule wins (unless `passthrough: true`).

## Configuration

Message behavior can be modified via the `config` prop:

```typescript
interface ChatConfig {
  settings?: {
    layout?: {
      botAvatarName?: string
      disableHtmlContentSanitization?: boolean
      // ... more options
    }
    colors?: {
      primaryColor?: string
      botMessageColor?: string
      // ... more options
    }
    behavior?: {
      renderMarkdown?: boolean
      enableTypingIndicator?: boolean
      // ... more options
    }
    widgetSettings?: {
      enableDefaultPreview?: boolean
      customAllowedHtmlTags?: string[]
      // ... more options
    }
  }
}
```

## Creating New Message Types

To support a new message type:

1. Define the data structure in this documentation
2. Add a match rule in `src/utils/matcher.ts`
3. Create the component in `src/components/messages/`
4. Update the matcher to use the new component
5. Document the data structure here
6. Add examples to component documentation

## Backend Integration

Your backend should return messages in one of these formats. The Vue components will automatically render the appropriate UI based on the data structure.

**Example: Backend decides to show a gallery**

```typescript
// Backend response
{
  message: {
    source: 'bot',
    timestamp: Date.now().toString(),
    data: {
      _cognigy: {
        _webchat: {
          message: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'generic',  // ← Triggers Gallery component
                elements: [
                  { title: 'Product 1', image_url: '...' },
                  { title: 'Product 2', image_url: '...' }
                ]
              }
            }
          }
        }
      }
    }
  }
}
```

Frontend just renders: `<Message :message="messageFromBackend" />`

No need to coordinate which component to use!

## Validation

When integrating with backend:

1. Validate message structure at API boundary
2. Log warnings for missing required fields
3. Provide fallbacks for malformed data
4. Test with all message types

See [Backend Integration Guide](../patterns/backend-integration.md) for details.
