# TextWithButtons Component

Displays text content with interactive buttons (including Quick Replies) for user actions.

## Import

```typescript
import { TextWithButtons } from '@cognigy/chat-components-vue'
```

## Props

TextWithButtons uses the message context and doesn't accept direct props. It reads data from the message structure.

## Features

- ✅ Text content with HTML/Markdown support
- ✅ Multiple button types (postback, web_url, phone_number)
- ✅ Quick Replies support
- ✅ Button filtering (invalid buttons excluded)
- ✅ URL icon display for web links
- ✅ Responsive button layout
- ✅ Custom translations support
- ✅ Accessible ARIA labels
- ✅ Touch-friendly buttons
- ✅ Max width configuration for bot messages

## Usage

### Basic Text with Buttons

```vue
<template>
  <div class="chat">
    <MessageProvider :message="message" :config="config">
      <TextWithButtons />
    </MessageProvider>
  </div>
</template>

<script setup lang="ts">
import { TextWithButtons } from '@cognigy/chat-components-vue'
import { provideMessageContext } from '@cognigy/chat-components-vue'
import type { IMessage, IWebchatButton } from '@cognigy/chat-components-vue'

const message: IMessage = {
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _cognigy: {
      _webchat: {
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text: 'What would you like to do?',
              buttons: [
                { title: 'View Products', type: 'postback', payload: 'view_products' },
                { title: 'Contact Support', type: 'postback', payload: 'contact_support' },
                { title: 'Visit Website', type: 'web_url', url: 'https://example.com' },
              ],
            },
          },
        },
      },
    },
  },
}
</script>
```

### Quick Replies

```vue
<script setup lang="ts">
const message: IMessage = {
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _cognigy: {
      _webchat: {
        message: {
          text: 'How can I help you today?',
          quick_replies: [
            { title: 'Yes', content_type: 'text', payload: 'yes' },
            { title: 'No', content_type: 'text', payload: 'no' },
            { title: 'Maybe', content_type: 'text', payload: 'maybe' },
          ],
        },
      },
    },
  },
}
</script>
```

## Message Data Structure

### Regular Buttons Format

```typescript
{
  source: 'bot',
  timestamp: '1234567890',
  data: {
    _cognigy: {
      _webchat: {
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text: string,              // Optional: Text content
              buttons: IWebchatButton[]  // Array of button objects
            }
          }
        }
      }
    }
  }
}
```

### Quick Replies Format

```typescript
{
  source: 'bot',
  timestamp: '1234567890',
  data: {
    _cognigy: {
      _webchat: {
        message: {
          text: string,                      // Optional: Text content
          quick_replies: IWebchatQuickReply[] // Array of quick reply objects
        }
      }
    }
  }
}
```

## Button Types

### Postback Button

Sends a payload back to the bot.

```typescript
{
  title: 'Click Me',
  type: 'postback',
  payload: 'button_clicked'
}
```

### Web URL Button

Opens a URL in a new tab or current tab.

```typescript
{
  title: 'Visit Website',
  type: 'web_url',
  url: 'https://example.com',
  target: '_blank' // Optional: '_blank' or '_self'
}
```

### Phone Number Button

Initiates a phone call.

```typescript
{
  title: 'Call Us',
  type: 'phone_number',
  payload: '+1-234-567-8900'
}
```

## Configuration

### Custom Translations

```typescript
const config: ChatConfig = {
  settings: {
    customTranslations: {
      ariaLabels: {
        // ActionButton translations apply here
      },
    },
  },
}
```

### Max Width for Bot Messages

```typescript
const config: ChatConfig = {
  settings: {
    layout: {
      botOutputMaxWidthPercentage: 75, // Buttons container max width
    },
  },
}
```

### Show URL Icon

URL icons are shown by default for `web_url` button types.

## Button Behavior

### Regular Buttons

- Always enabled
- Can be clicked multiple times
- Used for actions that don't require single selection

### Quick Replies

- Intended for single-use selections
- In full implementation, get disabled after user replies
- Visually similar to buttons but semantically different

**Note:** Quick Reply disabling requires conversation state tracking, which is not yet implemented in the Vue version.

## CSS Variables

```css
:root {
  /* Inherited from ActionButtons and TextMessage components */
  --cc-primary-color: #1976d2;
  --cc-primary-color-hover: #1565c0;
  --cc-white: #ffffff;
}
```

## CSS Classes

The component applies these global CSS classes for custom styling:

### Container Classes

```css
/* Regular buttons */
.webchat-buttons-template-root { }
.webchat-buttons-template-header { }
.webchat-buttons-template-replies-container { }
.webchat-buttons-template-button { }

/* Quick replies */
.webchat-quick-reply-template-root { }
.webchat-quick-reply-template-header { }
.webchat-quick-reply-template-replies-container { }
.webchat-quick-reply-template-button { }
```

## Accessibility

### ARIA Labels

**Text Content:**
- Uses semantic HTML for text rendering
- Proper heading structure when needed
- Screen reader accessible

**Buttons:**
- Each button has accessible label from `title`
- Focus visible indicators
- Keyboard navigable (Tab, Enter, Space)
- Linked to text via `aria-describedby`

### Keyboard Navigation

- `Tab`: Navigate between buttons
- `Enter` or `Space`: Activate button
- Focus visible on keyboard navigation

### Screen Reader Support

- Text content announced first
- Button titles announced clearly
- Button types indicated (link, button, phone)
- Action feedback provided

## Best Practices

### ✅ Do

1. **Provide clear button labels**
   ```typescript
   buttons: [
     { title: 'View Products', type: 'postback', payload: 'view_products' },
     { title: 'Contact Support', type: 'postback', payload: 'contact' },
   ]
   ```

2. **Limit button count for better UX**
   ```typescript
   // Good: 2-4 buttons
   buttons: [
     { title: 'Yes', type: 'postback', payload: 'yes' },
     { title: 'No', type: 'postback', payload: 'no' },
   ]
   ```

3. **Use descriptive payloads**
   ```typescript
   { title: 'Book Appointment', type: 'postback', payload: 'book_appointment_flow' }
   ```

4. **Provide text context**
   ```typescript
   {
     text: 'Would you like to continue?',
     buttons: [...]
   }
   ```

### ❌ Don't

1. **Don't use too many buttons**
   ```typescript
   // ❌ Bad: 10+ buttons overwhelming
   buttons: [/* 10+ button objects */]

   // ✅ Good: 2-4 buttons
   buttons: [/* 3 button objects */]
   ```

2. **Don't use unclear labels**
   ```typescript
   // ❌ Bad
   { title: 'Click', type: 'postback', payload: 'x' }

   // ✅ Good
   { title: 'View Details', type: 'postback', payload: 'view_details' }
   ```

3. **Don't omit button types**
   ```typescript
   // ❌ Bad: Missing required type
   { title: 'Button' }

   // ✅ Good
   { title: 'Button', type: 'postback', payload: 'action' }
   ```

## Common Patterns

### Pattern: Yes/No Choice

```vue
<script setup lang="ts">
const confirmMessage: IMessage = {
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _cognigy: {
      _webchat: {
        message: {
          text: 'Would you like to proceed with your order?',
          quick_replies: [
            { title: 'Yes, Continue', content_type: 'text', payload: 'confirm_order' },
            { title: 'No, Cancel', content_type: 'text', payload: 'cancel_order' },
          ],
        },
      },
    },
  },
}
</script>
```

### Pattern: Multiple Choice

```vue
<script setup lang="ts">
const categoryMessage: IMessage = {
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _cognigy: {
      _webchat: {
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text: 'What are you interested in?',
              buttons: [
                { title: 'Electronics', type: 'postback', payload: 'cat_electronics' },
                { title: 'Clothing', type: 'postback', payload: 'cat_clothing' },
                { title: 'Home & Garden', type: 'postback', payload: 'cat_home' },
                { title: 'Sports', type: 'postback', payload: 'cat_sports' },
              ],
            },
          },
        },
      },
    },
  },
}
</script>
```

### Pattern: Mixed Actions

```vue
<script setup lang="ts">
const helpMessage: IMessage = {
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _cognigy: {
      _webchat: {
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text: 'How can we help you?',
              buttons: [
                { title: 'Chat with Agent', type: 'postback', payload: 'start_live_chat' },
                { title: 'Call Us', type: 'phone_number', payload: '+1-800-123-4567' },
                { title: 'Help Center', type: 'web_url', url: 'https://help.example.com', target: '_blank' },
              ],
            },
          },
        },
      },
    },
  },
}
</script>
```

### Pattern: Buttons Without Text

```vue
<script setup lang="ts">
const buttonsOnly: IMessage = {
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _cognigy: {
      _webchat: {
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              buttons: [
                { title: 'Option A', type: 'postback', payload: 'a' },
                { title: 'Option B', type: 'postback', payload: 'b' },
              ],
            },
          },
        },
      },
    },
  },
}
</script>
```

## Error Handling

### Missing Buttons

If no buttons provided:
- Text content still renders
- ActionButtons component not rendered
- No error thrown

### Invalid Button Types

Buttons with unsupported types are filtered out:
- Only `postback`, `web_url`, `phone_number` types supported
- Invalid buttons silently excluded
- Component continues rendering valid buttons

### Missing Text

If no text content:
- Only buttons render
- TextMessage component not rendered
- Layout adjusts automatically

### Malformed Data

If message data structure invalid:
- Component gracefully handles missing fields
- Returns empty or partial render
- No component crash

## Troubleshooting

### Buttons Not Showing

**Problem:** Buttons don't appear

**Solutions:**
1. Check button data structure:
   ```typescript
   // Verify buttons array exists and has valid items
   console.log(message.data?._cognigy?._webchat?.message?.attachment?.payload?.buttons)
   ```

2. Verify button types:
   ```typescript
   // Ensure type is one of: 'postback', 'web_url', 'phone_number'
   buttons: [
     { title: 'Valid', type: 'postback', payload: 'x' } // ✅
     { title: 'Invalid', type: 'custom', payload: 'x' } // ❌ Filtered out
   ]
   ```

3. Check for empty array:
   ```typescript
   // Must have at least one button
   buttons: [] // Won't render
   ```

### Button Clicks Not Working

**Problem:** Clicking buttons doesn't trigger action

**Solutions:**
1. Ensure action handler provided:
   ```typescript
   const action: MessageSender = (text, data) => {
     console.log('Action:', text, data)
   }
   ```

2. Check button payload:
   ```typescript
   // Postback buttons need payload
   { title: 'Click', type: 'postback', payload: 'my_action' }
   ```

3. Verify button type:
   ```typescript
   // web_url opens URL instead of calling action
   { title: 'Link', type: 'web_url', url: 'https://...' }
   ```

### Text Not Rendering

**Problem:** Text content doesn't show

**Solutions:**
1. Check text location:
   ```typescript
   // Text can be in attachment.payload.text OR message.text
   attachment: {
     payload: {
       text: 'Text here' // For button template
     }
   }
   // OR
   message: {
     text: 'Text here' // For quick replies
   }
   ```

2. Verify data structure:
   ```typescript
   // Ensure _cognigy._webchat.message exists
   data: {
     _cognigy: {
       _webchat: {
         message: { /* ... */ }
       }
     }
   }
   ```

### Styling Issues

**Problem:** Buttons or text don't match design

**Solutions:**
1. Override global CSS classes:
   ```css
   .webchat-buttons-template-button {
     /* Custom button styles */
   }
   ```

2. Use configuration:
   ```typescript
   config: {
     settings: {
       layout: {
         botOutputMaxWidthPercentage: 80
       }
     }
   }
   ```

3. Check CSS module styles are loaded

## Related Components

- [TextMessage](./text-message.md) - Text rendering (used internally)
- [ActionButtons](./action-buttons.md) - Button group (used internally)
- [ActionButton](./action-button.md) - Individual buttons

## Related Composables

- [useMessageContext](../composables/use-message-context.md) - Access message context

## Implementation Notes

- Combines button template and quick reply message types
- Uses TextMessage for text content rendering
- Uses ActionButtons for button group rendering
- Applies different CSS classes for buttons vs quick replies
- URL icon automatically shown for web_url buttons
- Max width applied to bot and engagement messages
- Button filtering happens in ActionButtons component

## Testing

The component has comprehensive test coverage:

- ✅ Text and buttons rendering
- ✅ Buttons only (no text)
- ✅ Text only (no buttons)
- ✅ CSS class application (buttons vs quick-reply)
- ✅ Button types (postback, web_url, phone_number)
- ✅ Multiple buttons rendering
- ✅ Text from different locations
- ✅ HTML content in text
- ✅ Button action handling
- ✅ Bot output max width configuration
- ✅ URL icon display
- ✅ Accessibility (IDs, ARIA labels)
- ✅ CSS styling classes
- ✅ Message source handling (bot, user, engagement)
- ✅ Edge cases (empty arrays, missing data)

See `test/TextWithButtons.spec.ts` for full test suite (31/31 tests passing).

## Security

### XSS Prevention

Text content is sanitized by TextMessage component:
```vue
<!-- Text is sanitized before rendering -->
<TextMessage :content="text" />
```

### Button Payloads

Button payloads and URLs are not sanitized. Ensure:
- Payloads come from trusted backend
- URLs are validated before setting
- User input not directly used in button config

### URL Validation

For web_url buttons:
```typescript
// Backend should validate URLs
{
  title: 'Safe Link',
  type: 'web_url',
  url: 'https://trusted-domain.com' // Validate this
}
```

## Performance

### Rendering

- Text and buttons render efficiently
- No unnecessary re-renders
- Computed properties for derived state

### Button Count

- Reasonable button count (2-6) performs well
- Excessive buttons (10+) may impact layout
- ActionButtons uses efficient filtering

### Memory

- Component properly unmounts
- No memory leaks
- Event handlers cleaned up automatically

## Browser Support

- Modern browsers (ES6+)
- No IE11 support
- Touch and mouse event support
- Responsive layout with flexbox

## Known Limitations

1. **Quick Reply Disabling** - Quick replies don't auto-disable after user reply (requires conversation state tracking)
2. **Button Animations** - No built-in button press animations
3. **Icon Customization** - URL icon not customizable per button
4. **Button Groups** - No visual grouping or separators
5. **Tooltips** - No built-in tooltip support for buttons

These limitations keep the component simple and maintainable. For advanced features, consider extending ActionButton or using custom plugins.
