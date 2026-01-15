# AdaptiveCard

**Presentation-only component** for displaying Microsoft Adaptive Cards in chat history. Shows a visual representation with card title, body text, and action count.

> **Note**: This is a simplified presentation layer designed for chat history rendering, not a fully interactive Adaptive Card renderer. For full interactive functionality with the Microsoft Adaptive Cards SDK, additional implementation would be required.

## Import

```typescript
import { AdaptiveCard } from '@cognigy/chat-components-vue'
```

## Features

- **Card Display**: Visual representation with icon, title, and body text
- **Title Extraction**: Automatically extracts title from card payload
- **Body Text**: Shows first 2 text blocks from card body
- **Action Count**: Displays number of actions available
- **Multi-location Support**: Reads from webchat, defaultPreview, or plugin locations
- **ChatBubble Wrapper**: Styled consistently with other messages

## Use Case

This component is designed for **chat history rendering** where you need to show that an Adaptive Card was sent, but don't need the full interactive functionality. Perfect for:

- Displaying conversation history
- Showing past Adaptive Card interactions
- Read-only chat transcripts
- Message previews

## Usage

### Basic Adaptive Card

```vue
<template>
  <AdaptiveCard />
</template>

<script setup>
import { AdaptiveCard, provideMessageContext } from '@cognigy/chat-components-vue'

const message = {
  text: '',
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _cognigy: {
      _webchat: {
        adaptiveCard: {
          type: 'AdaptiveCard',
          version: '1.5',
          body: [
            {
              type: 'TextBlock',
              text: 'Hello from Adaptive Card',
              size: 'large'
            },
            {
              type: 'TextBlock',
              text: 'This is a presentation-only view.'
            }
          ]
        }
      }
    }
  }
}

provideMessageContext({
  message,
  config: {},
  action: (text, data) => console.log('Action:', text, data),
  onEmitAnalytics: (event) => console.log('Analytics:', event)
})
</script>
```

### Card with Actions

```vue
<script setup>
const message = {
  text: '',
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _cognigy: {
      _webchat: {
        adaptiveCard: {
          type: 'AdaptiveCard',
          version: '1.5',
          body: [
            {
              type: 'TextBlock',
              text: 'Order Confirmation',
              size: 'large',
              weight: 'bolder'
            },
            {
              type: 'TextBlock',
              text: 'Your order has been placed successfully.'
            }
          ],
          actions: [
            {
              type: 'Action.OpenUrl',
              title: 'View Order',
              url: 'https://example.com/orders/123'
            },
            {
              type: 'Action.Submit',
              title: 'Track Package'
            }
          ]
        }
      }
    }
  }
}
</script>
```

### Card with Default Preview

```vue
<script setup>
const message = {
  text: '',
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _cognigy: {
      _defaultPreview: {
        adaptiveCard: {
          type: 'AdaptiveCard',
          body: [
            {
              type: 'TextBlock',
              text: 'Preview Version',
              size: 'large'
            }
          ]
        }
      },
      _webchat: {
        adaptiveCard: {
          type: 'AdaptiveCard',
          body: [
            {
              type: 'TextBlock',
              text: 'Full Version',
              size: 'large'
            }
          ]
        }
      }
    }
  }
}

const config = {
  settings: {
    widgetSettings: {
      enableDefaultPreview: true // Use preview version
    }
  }
}

provideMessageContext({ message, config, action: () => {}, onEmitAnalytics: () => {} })
</script>
```

### Plugin Location

```vue
<script setup>
const message = {
  text: '',
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _plugin: {
      payload: {
        type: 'AdaptiveCard',
        body: [
          {
            type: 'TextBlock',
            text: 'Plugin Card',
            size: 'large'
          }
        ]
      }
    }
  }
}
</script>
```

## Data Structure

### Adaptive Card Payload Locations

The component checks for Adaptive Card data in this priority order:

1. `message.data._cognigy._webchat.adaptiveCard`
2. `message.data._cognigy._defaultPreview.adaptiveCard` (if `enableDefaultPreview` is true)
3. `message.data._plugin.payload`

### Basic Adaptive Card Schema

```typescript
interface AdaptiveCardPayload {
  type: 'AdaptiveCard'
  version?: string

  // Card title (optional)
  title?: string

  // Body elements
  body?: Array<{
    type: string        // 'TextBlock', 'Image', etc.
    text?: string       // For TextBlock
    size?: string       // 'small', 'default', 'medium', 'large', 'extraLarge'
    weight?: string     // 'lighter', 'default', 'bolder'
    [key: string]: any  // Other element properties
  }>

  // Actions
  actions?: Array<{
    type: string        // 'Action.Submit', 'Action.OpenUrl', etc.
    title: string
    url?: string        // For Action.OpenUrl
    [key: string]: any  // Other action properties
  }>

  // Screen reader text
  speak?: string
}
```

## Component Behavior

### Title Extraction

Priority order for extracting card title:

1. **payload.title**: If title property exists
2. **Large TextBlock**: First TextBlock with `size: 'large'`
3. **First TextBlock**: First TextBlock in body array
4. **Speak Text**: First 50 characters of speak property
5. **Fallback**: Generic "Adaptive Card" text

Example:
```typescript
// Method 1: Direct title
{ title: 'Card Title', body: [] }

// Method 2: Large TextBlock
{
  body: [
    { type: 'TextBlock', text: 'Large Title', size: 'large' },
    { type: 'TextBlock', text: 'Body text' }
  ]
}

// Method 3: First TextBlock
{
  body: [
    { type: 'TextBlock', text: 'First Text' },
    { type: 'TextBlock', text: 'Second Text' }
  ]
}
```

### Body Text Extraction

- Extracts text from TextBlock elements in body array
- Skips the element used as title
- Limits to first 2 text blocks
- Joins multiple blocks with space

### Action Count

- Displays "1 action available" for single action
- Displays "N actions available" for multiple actions
- Hidden when no actions present

### Payload Location Priority

When both webchat and defaultPreview exist:
- Uses **webchat** if `enableDefaultPreview` is false
- Uses **defaultPreview** if `enableDefaultPreview` is true
- Falls back to **plugin** if neither available

## CSS Variables

```css
/* Card background */
--cc-white: #ffffff;

/* Icon color */
--cc-primary-color: #1976d2;

/* Text colors */
--cc-black-10: rgba(0, 0, 0, 0.1);  /* Title */
--cc-black-20: rgba(0, 0, 0, 0.2);  /* Body text */
--cc-black-40: rgba(0, 0, 0, 0.4);  /* Actions label */
--cc-black-80: rgba(0, 0, 0, 0.8);  /* Border */

/* Border radius */
--cc-bubble-border-radius: 15px;
```

## Global CSS Classes

For external styling:

```css
/* Card wrapper */
.adaptivecard-wrapper { }

/* Internal marker */
.internal { }
```

## Accessibility

### Semantic HTML

- Uses ChatBubble wrapper for consistent styling
- Typography components for text content
- SVG icon with proper viewBox

### Visual Hierarchy

- Icon provides visual indicator
- Title in semibold typography
- Body text in regular weight
- Actions separator line

## Best Practices

### For Presentation/Rendering

1. **Include Title**: Always include title or large TextBlock for clear identification
2. **Limit Body Text**: Keep body concise (2-3 text blocks)
3. **Action Context**: Use action count to indicate interactivity was available

Example:
```typescript
// Good - Clear structure
{
  type: 'AdaptiveCard',
  body: [
    {
      type: 'TextBlock',
      text: 'Order #12345',
      size: 'large'
    },
    {
      type: 'TextBlock',
      text: 'Status: Shipped'
    }
  ],
  actions: [
    {
      type: 'Action.OpenUrl',
      title: 'Track Package',
      url: 'https://example.com/track/12345'
    }
  ]
}
```

### Configuration Storage

Store full Adaptive Card payload for:
- Historical reference
- Future interactive implementation
- Microsoft Adaptive Cards SDK compatibility

## Common Patterns

### Order Confirmation

```typescript
const adaptiveCard = {
  type: 'AdaptiveCard',
  version: '1.5',
  body: [
    {
      type: 'TextBlock',
      text: 'Order Confirmed',
      size: 'large',
      weight: 'bolder'
    },
    {
      type: 'TextBlock',
      text: 'Order #12345 has been placed successfully.'
    },
    {
      type: 'TextBlock',
      text: 'Estimated delivery: 3-5 business days'
    }
  ],
  actions: [
    {
      type: 'Action.OpenUrl',
      title: 'View Order Details',
      url: 'https://example.com/orders/12345'
    }
  ]
}
```

### Event Invitation

```typescript
const adaptiveCard = {
  type: 'AdaptiveCard',
  version: '1.5',
  body: [
    {
      type: 'TextBlock',
      text: 'Meeting Invitation',
      size: 'large'
    },
    {
      type: 'TextBlock',
      text: 'Team Standup - Tomorrow at 10:00 AM'
    }
  ],
  actions: [
    {
      type: 'Action.Submit',
      title: 'Accept',
      data: { response: 'accept' }
    },
    {
      type: 'Action.Submit',
      title: 'Decline',
      data: { response: 'decline' }
    }
  ]
}
```

### Product Card

```typescript
const adaptiveCard = {
  type: 'AdaptiveCard',
  version: '1.5',
  body: [
    {
      type: 'TextBlock',
      text: 'Premium Headphones',
      size: 'large',
      weight: 'bolder'
    },
    {
      type: 'TextBlock',
      text: 'Noise-cancelling wireless headphones with 30-hour battery life.'
    },
    {
      type: 'TextBlock',
      text: '$299.99',
      size: 'medium',
      weight: 'bolder'
    }
  ],
  actions: [
    {
      type: 'Action.OpenUrl',
      title: 'View Product',
      url: 'https://example.com/products/headphones'
    },
    {
      type: 'Action.Submit',
      title: 'Add to Cart',
      data: { productId: 'HP-001' }
    }
  ]
}
```

## Troubleshooting

### Card not appearing

- Check message data structure
- Verify Adaptive Card exists in one of the three locations
- Ensure payload is not null or undefined

### Title not showing correctly

- Check if `title` property exists
- Verify TextBlock elements have `text` property
- Ensure body array is not empty

### Body text not displaying

- Verify body array exists and is not null
- Check TextBlock elements have `text` property
- Ensure elements are not all used as title

### Actions not showing

- Verify `actions` array exists and is not empty
- Check array has at least one action object

## Testing

Example test cases:

```typescript
import { mount } from '@vue/test-utils'
import AdaptiveCard from '@cognigy/chat-components-vue'

describe('AdaptiveCard', () => {
  it('renders adaptive card', () => {
    const wrapper = mount(AdaptiveCard, {
      global: {
        provide: {
          [MessageContextKey]: {
            message: {
              data: {
                _cognigy: {
                  _webchat: {
                    adaptiveCard: {
                      type: 'AdaptiveCard',
                      body: [
                        { type: 'TextBlock', text: 'Test Card' }
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    expect(wrapper.find('[data-testid="adaptive-card-message"]').exists()).toBe(true)
  })

  it('extracts title correctly', () => {
    // Test implementation
  })

  it('displays action count', () => {
    // Test implementation
  })
})
```

## Future Enhancements

For full interactive Adaptive Card functionality, consider:

- [ ] Microsoft Adaptive Cards SDK integration
- [ ] Interactive actions (Submit, OpenUrl, etc.)
- [ ] Input elements (TextInput, DateInput, ChoiceSet)
- [ ] Image rendering
- [ ] Column sets and containers
- [ ] Adaptive Card Designer integration
- [ ] Markdown rendering in TextBlocks
- [ ] Custom styling and theming
- [ ] Validation and error handling

## Related Components

- [ChatBubble](./chat-bubble.md) - Wrapper component
- [Typography](./typography.md) - Text rendering
- [DatePicker](./date-picker.md) - Similar presentation-only approach

## Implementation Notes

### Design Decisions

1. **Presentation Focus**: Shows card was present without full interactivity
2. **Simple Extraction**: Basic title/body extraction logic
3. **Visual Indicator**: Icon shows it's an Adaptive Card
4. **Action Count**: Indicates interactivity was available

### Differences from Full Implementation

**Simplified Version** (Current):
- Visual representation only
- Title and body text extraction
- Action count display
- ~150 lines of code
- No external dependencies

**Full Version** (Would require):
- Microsoft Adaptive Cards SDK (~100KB+)
- Remarkable for markdown (~20KB)
- Full element rendering (Images, Inputs, etc.)
- Action execution logic
- Validation and error handling
- ~500+ lines of code

### When to Use Full Implementation

Consider full interactive implementation if:
- Users need to interact with cards in real-time
- Input collection is required
- Action submission is needed
- Images and rich media must be displayed
- Full Adaptive Card specification compliance required

For chat history rendering and presentation, the simplified version is sufficient.

## Security

### XSS Prevention

- All text content rendered through Typography component
- No HTML injection possible
- Card payload stored but not executed

### Content Validation

- Handles missing/null properties gracefully
- No execution of arbitrary code
- Safe extraction of display text only

## Performance

### Bundle Size

- AdaptiveCard.vue: ~2KB
- Dependencies: ChatBubble (~2KB), Typography (~1KB)
- Total: ~5KB (gzipped)
- **No external libraries** (Microsoft SDK not needed)

### Rendering

- Minimal DOM elements
- Simple text extraction
- Fast component mounting

## Comparison: Presentation vs Full

| Feature | Presentation Mode | Full Interactive Mode |
|---------|------------------|----------------------|
| Visual Display | ✅ | ✅ |
| Title Extraction | ✅ | ✅ |
| Body Text | ✅ (Limited) | ✅ (Full) |
| Action Count | ✅ | ✅ |
| Interactive Actions | ❌ | ✅ |
| Input Elements | ❌ | ✅ |
| Images | ❌ | ✅ |
| Markdown Rendering | ❌ | ✅ |
| Bundle Size | ~5KB | ~150KB+ |
| Use Case | Chat History | Interactive Cards |

## Migration Path

To upgrade to full interactive Adaptive Cards:

1. Install dependencies:
```bash
npm install adaptivecards remarkable
```

2. Import SDK:
```typescript
import { AdaptiveCard as MSAdaptiveCard, HostConfig } from 'adaptivecards'
import { Remarkable } from 'remarkable'
```

3. Implement card rendering logic
4. Add action execution handlers
5. Configure host config
6. Handle markdown processing

The current data structure is compatible with the full SDK, so no API changes needed.

## Adaptive Cards Resources

- [Microsoft Adaptive Cards Documentation](https://adaptivecards.io/)
- [Schema Explorer](https://adaptivecards.io/explorer/)
- [Designer Tool](https://adaptivecards.io/designer/)
- [Samples](https://adaptivecards.io/samples/)
- [SDK Documentation](https://docs.microsoft.com/en-us/adaptive-cards/)
