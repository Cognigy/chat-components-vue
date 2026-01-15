# List

A vertical list message component that displays structured content with optional header element, thumbnail images, buttons, and clickable items.

## Import

```typescript
import { List } from '@cognigy/chat-components-vue'
```

## Features

- **Header Element**: Large background image header when `top_element_style` is set to `'large'` or `true`
- **Regular Items**: Vertical list of items with thumbnails, titles, subtitles, and buttons
- **Clickable Items**: Items can have `default_action` URL to make entire item clickable
- **Global Button**: Optional button displayed at bottom of list
- **Images**:
  - Header: 16:9 aspect ratio background image with dark overlay
  - Regular items: 86x102px thumbnail images
- **Dividers**: Visual separators between list items
- **Auto-focus**: Automatically focuses first focusable element on mount
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation

## Usage

### Basic List

```vue
<template>
  <List />
</template>

<script setup>
import { List, provideMessageContext } from '@cognigy/chat-components-vue'

const message = {
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
              template_type: 'list',
              elements: [
                {
                  title: 'Classic T-Shirt',
                  subtitle: '$25.00 - Available in 5 colors',
                  image_url: 'https://example.com/tshirt.jpg',
                  buttons: [
                    {
                      title: 'Buy Now',
                      type: 'postback',
                      payload: 'buy_tshirt'
                    }
                  ]
                },
                {
                  title: 'Denim Jeans',
                  subtitle: '$65.00 - Multiple sizes',
                  image_url: 'https://example.com/jeans.jpg',
                  buttons: [
                    {
                      title: 'View Details',
                      type: 'web_url',
                      url: 'https://example.com/jeans'
                    }
                  ]
                }
              ]
            }
          }
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

### List with Header Element

```vue
<template>
  <List />
</template>

<script setup>
const message = {
  // ... other message properties
  data: {
    _cognigy: {
      _webchat: {
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'list',
              top_element_style: 'large', // or true
              elements: [
                {
                  title: 'New Collection',
                  subtitle: 'Spring 2024 - Now Available',
                  image_url: 'https://example.com/collection-header.jpg',
                  buttons: [
                    {
                      title: 'Explore',
                      type: 'web_url',
                      url: 'https://example.com/collection'
                    }
                  ]
                },
                // Regular items follow...
                {
                  title: 'Item 1',
                  subtitle: 'Description',
                  image_url: 'https://example.com/item1.jpg'
                }
              ]
            }
          }
        }
      }
    }
  }
}
</script>
```

### List with Clickable Items

```vue
<script setup>
const message = {
  // ... other message properties
  data: {
    _cognigy: {
      _webchat: {
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'list',
              elements: [
                {
                  title: 'Product Name',
                  subtitle: 'Click to view details',
                  image_url: 'https://example.com/product.jpg',
                  default_action: {
                    url: 'https://example.com/product/123'
                  }
                }
              ]
            }
          }
        }
      }
    }
  }
}
</script>
```

### List with Global Button

```vue
<script setup>
const message = {
  // ... other message properties
  data: {
    _cognigy: {
      _webchat: {
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'list',
              elements: [
                { title: 'Item 1', subtitle: 'Description 1' },
                { title: 'Item 2', subtitle: 'Description 2' },
                { title: 'Item 3', subtitle: 'Description 3' }
              ],
              buttons: [
                {
                  title: 'View All Items',
                  type: 'web_url',
                  url: 'https://example.com/all'
                }
              ]
            }
          }
        }
      }
    }
  }
}
</script>
```

## Data Structure

### IWebchatTemplateAttachment (List)

```typescript
interface IWebchatTemplateAttachment {
  type: 'template'
  payload: {
    template_type: 'list'

    // List of items to display
    elements: IWebchatAttachmentElement[]

    // Whether first element should be rendered as large header
    // 'large' or true = header element with background image
    // 'compact' or false/undefined = all items as regular list items
    top_element_style?: 'large' | 'compact' | boolean

    // Global button displayed at bottom (only first button used)
    buttons?: IWebchatButton[]
  }
}
```

### IWebchatAttachmentElement

```typescript
interface IWebchatAttachmentElement {
  // Item title (required)
  title: string

  // Item subtitle/description (optional)
  subtitle?: string

  // Image URL for thumbnail or header background
  image_url?: string

  // Alt text for image (accessibility)
  image_alt_text?: string

  // Buttons for this item (only first button used)
  buttons?: IWebchatButton[]

  // Makes entire item clickable
  default_action?: {
    url: string
  }
}
```

## List Structure

### With Header Element (`top_element_style: 'large'` or `true`)

```
┌─────────────────────────────────┐
│ Header Element (div)            │
│ - 16:9 background image         │
│ - Title overlay (white text)    │
│ - Subtitle overlay              │
│ - Button (positioned at bottom) │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ <ul aria-labelledby="header">  │
│   ┌───────────────────────────┐ │
│   │ <li> Regular Item 1       │ │
│   │ - Thumbnail (86x102)      │ │
│   │ - Title + Subtitle        │ │
│   │ - Button                  │ │
│   └───────────────────────────┘ │
│   ─────────────────────────────  │ (divider)
│   ┌───────────────────────────┐ │
│   │ <li> Regular Item 2       │ │
│   └───────────────────────────┘ │
│ </ul>                           │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Global Button                   │
└─────────────────────────────────┘
```

### Without Header Element (default)

```
┌─────────────────────────────────┐
│ <ul>                            │
│   ┌───────────────────────────┐ │
│   │ <li> Item 1               │ │
│   │ - Thumbnail               │ │
│   │ - Title + Subtitle        │ │
│   │ - Button                  │ │
│   └───────────────────────────┘ │
│   ─────────────────────────────  │ (divider)
│   ┌───────────────────────────┐ │
│   │ <li> Item 2               │ │
│   └───────────────────────────┘ │
│ </ul>                           │
└─────────────────────────────────┘
```

## Component Behavior

### Header Element

- **When**: `top_element_style` is `'large'` or `true`
- **Element**: First item in `elements` array
- **Rendering**:
  - Rendered as `<div>` (not `<li>`)
  - Background image covers entire area (16:9 aspect ratio)
  - Dark overlay (40% black) for text readability
  - White text for title and subtitle
  - Button positioned absolutely at bottom
  - Remaining elements rendered as regular list items

### Regular List Items

- **Rendering**:
  - Rendered as `<li>` inside `<ul>`
  - Thumbnail image on right (86x102px)
  - Title and subtitle on left
  - Button below text content
  - Dividers between items

### Clickable Items

- **Trigger**: When element has `default_action.url`
- **Behavior**:
  - Entire item content wrapper becomes clickable
  - `role="link"` and keyboard support (Enter key)
  - Cursor changes to pointer
  - Opens URL in new window/tab
  - URL is sanitized (unless `disableUrlButtonSanitization` is true)
  - Won't navigate if URL is `about:blank`

### Buttons

- **Per-Item Button**: Only first button in element's `buttons` array is rendered
- **Global Button**: Only first button in payload's `buttons` array is rendered
- **Size**: All buttons use `size="large"`

### Dividers

- **Between Items**: Applied to all items except the first
- **Before Global Button**: Applied to last item if global button exists

### Auto-focus

- **When**: `config.settings.widgetSettings.enableAutoFocus` is true
- **Behavior**: Focuses first focusable element (button or link) after component mounts
- **Delay**: 200ms timeout to ensure DOM is ready
- **Condition**: Only if chat history contains current active element

## Configuration

### URL Sanitization

```typescript
const config = {
  settings: {
    layout: {
      disableUrlButtonSanitization: true // Disable URL sanitization
    }
  }
}
```

### Custom Translations

```typescript
const config = {
  settings: {
    customTranslations: {
      ariaLabels: {
        opensInNewTab: 'Opens in new tab' // Used for clickable items
      }
    }
  }
}
```

### Auto-focus

```typescript
const config = {
  settings: {
    widgetSettings: {
      enableAutoFocus: true // Enable auto-focus on mount
    }
  }
}
```

## CSS Variables

```css
/* List container */
--cc-bubble-border-radius: 15px;  /* Border radius for list */
--cc-black-80: rgba(0, 0, 0, 0.8); /* Border color */
--cc-white: #ffffff;               /* Background color */

/* Header element */
/* (Uses background image with 40% black overlay) */

/* Regular items */
--cc-black-20: rgba(0, 0, 0, 0.2); /* Text color for items */

/* Focus states */
--cc-primary-color-focus: #1976d2; /* Focus outline color */
```

## Accessibility

### Semantic HTML

- **List Structure**: Proper `<ul>` and `<li>` elements
- **Headings**:
  - `<h4>` for item titles when no header element
  - `<h4>` for header title, `<h5>` for regular items when header exists
- **Links**: `role="link"` for clickable items with `default_action`

### ARIA Attributes

- **List Labeling**: `aria-labelledby` on `<ul>` references header element ID
- **Link Description**: `aria-label` on clickable items includes title and "Opens in new tab"
- **Subtitle Association**: `aria-describedby` references subtitle ID
- **Images**: `role="img"` with `aria-label` for thumbnail images

### Keyboard Navigation

- **Focusable Elements**: Buttons and clickable items are keyboard accessible
- **Tab Order**: Natural tab order through buttons and links
- **Enter Key**: Activates clickable items
- **Focus Visible**: Clear focus indicators on all interactive elements

### Screen Readers

- **Structure**: Proper nesting and relationships announced
- **Images**: Alternative text provided via `aria-label`
- **Actions**: Button purposes and link destinations clear
- **Context**: List relationships and item count understood

## Global CSS Classes

For external styling:

```css
/* List container */
.webchat-list-template-root { }

/* Header element */
.webchat-list-template-header { }
.webchat-list-template-header-content { }
.webchat-list-template-header-title { }
.webchat-list-template-header-subtitle { }
.webchat-list-template-header-button { }

/* Regular list items */
.webchat-list-template-element { }
.webchat-list-template-element-content { }
.webchat-list-template-element-title { }
.webchat-list-template-element-subtitle { }
.webchat-list-template-element-button { }

/* Global button */
.webchat-list-template-global-button { }
```

## Best Practices

### Content Guidelines

1. **Limit Items**: Keep list to 2-4 items for best UX
2. **Concise Text**: Keep titles under 80 characters, subtitles under 80 characters
3. **Image Quality**: Use high-quality images (header: 295x166, thumbnails: 86x102)
4. **Consistent Styling**: Use similar image styles across items

### Performance

1. **Image Optimization**: Compress images before use
2. **Lazy Loading**: Consider lazy loading images for long lists
3. **URL Sanitization**: Enable unless you control all URLs

### Accessibility

1. **Alt Text**: Always provide meaningful `image_alt_text`
2. **Descriptive Titles**: Make titles descriptive enough to stand alone
3. **Action Clarity**: Button text should clearly indicate action
4. **Clickable Items**: Make it clear when items are clickable

### User Experience

1. **Header Usage**: Use header for featured/promotional content
2. **Clickable vs Buttons**: Choose one primary action per item
3. **Global Button**: Use for "View All" or "More" actions
4. **Visual Hierarchy**: Most important item should be header or first

## Common Patterns

### Product List

```typescript
{
  template_type: 'list',
  top_element_style: 'large',
  elements: [
    {
      title: 'Featured: Summer Sale',
      subtitle: 'Up to 50% off select items',
      image_url: 'https://example.com/sale-banner.jpg',
      buttons: [
        { title: 'Shop Sale', type: 'web_url', url: 'https://example.com/sale' }
      ]
    },
    {
      title: 'Product 1',
      subtitle: '$29.99',
      image_url: 'https://example.com/product1.jpg',
      default_action: { url: 'https://example.com/product/1' }
    },
    {
      title: 'Product 2',
      subtitle: '$39.99',
      image_url: 'https://example.com/product2.jpg',
      default_action: { url: 'https://example.com/product/2' }
    }
  ],
  buttons: [
    { title: 'View All Products', type: 'web_url', url: 'https://example.com/products' }
  ]
}
```

### Search Results

```typescript
{
  template_type: 'list',
  elements: [
    {
      title: 'Result 1',
      subtitle: 'Brief description of result 1',
      image_url: 'https://example.com/result1.jpg',
      buttons: [
        { title: 'View', type: 'postback', payload: 'view_result_1' }
      ]
    },
    {
      title: 'Result 2',
      subtitle: 'Brief description of result 2',
      image_url: 'https://example.com/result2.jpg',
      buttons: [
        { title: 'View', type: 'postback', payload: 'view_result_2' }
      ]
    }
  ],
  buttons: [
    { title: 'See More Results', type: 'postback', payload: 'more_results' }
  ]
}
```

### Location List

```typescript
{
  template_type: 'list',
  elements: [
    {
      title: 'Store Downtown',
      subtitle: '123 Main St - Open until 9 PM',
      image_url: 'https://example.com/store-downtown.jpg',
      default_action: { url: 'https://maps.google.com/?q=123+Main+St' }
    },
    {
      title: 'Store Midtown',
      subtitle: '456 Park Ave - Open 24/7',
      image_url: 'https://example.com/store-midtown.jpg',
      default_action: { url: 'https://maps.google.com/?q=456+Park+Ave' }
    }
  ]
}
```

## Error Handling

### Missing Data

```typescript
// Handles missing elements array
if (!elements || elements.length === 0) {
  // List not rendered
}

// Handles missing images
if (!element.image_url) {
  // No image displayed
}

// Handles missing buttons
if (!element.buttons || element.buttons.length === 0) {
  // No button rendered
}
```

### Invalid URLs

```typescript
// URL sanitization (default)
const sanitized = sanitizeUrl(url)
if (sanitized === 'about:blank') {
  // No navigation occurs
}

// Invalid protocol in background image
const backgroundImage = getBackgroundImage(url)
// Returns undefined if protocol is not http/https
```

## Troubleshooting

### List not appearing

- Check that `elements` array exists and has items
- Verify message structure matches `IWebchatTemplateAttachment`
- Ensure `template_type` is `'list'`

### Header element not showing

- Check `top_element_style` is `'large'` or `true`
- Verify first element has `image_url`
- Check that `elements` array has at least one item

### Images not displaying

- Verify `image_url` is accessible
- Check image URL uses `http://` or `https://` protocol
- Verify URL doesn't contain control characters

### Buttons not working

- Ensure buttons are in correct format (`IWebchatButton`)
- Check that `action` function is provided in MessageContext
- Verify button `type` is valid (`'postback'`, `'web_url'`, etc.)

### Clickable items not working

- Check `default_action.url` is present
- Verify URL is not `about:blank` after sanitization
- Ensure item wrapper is not inside another clickable element

### Focus not working

- Check `enableAutoFocus` is enabled in config
- Verify items have focusable elements (buttons or links)
- Check that chat history wrapper exists in DOM

## Testing

Example test cases:

```typescript
import { mount } from '@vue/test-utils'
import List from '@cognigy/chat-components-vue'

describe('List', () => {
  it('renders list with elements', () => {
    const wrapper = mount(List, {
      global: {
        provide: {
          [MessageContextKey]: {
            message: {
              // ... message with list elements
            },
            config: {},
            action: vi.fn(),
            onEmitAnalytics: vi.fn()
          }
        }
      }
    })

    expect(wrapper.find('[data-testid="list-message"]').exists()).toBe(true)
  })

  it('renders header element when top_element_style is large', () => {
    // Test header element rendering
  })

  it('renders correct number of list items', () => {
    // Test item count
  })

  it('applies dividers between items', () => {
    // Test divider props
  })
})
```

## Security

### URL Sanitization

- **Default**: All URLs sanitized with `@braintree/sanitize-url`
- **Prevents**: XSS attacks via `javascript:` URLs
- **Override**: Use `disableUrlButtonSanitization: true` only if you control all URLs

### Background Images

- **Validation**: `getBackgroundImage` validates protocol (http/https only)
- **Escaping**: Special characters escaped to prevent CSS injection
- **Rejection**: Invalid URLs return `undefined`, no image displayed

### HTML Content

- **Title/Subtitle**: Sanitized with DOMPurify
- **Allowed Tags**: Only safe HTML tags permitted
- **Link targets**: External links open in new window

## Performance

### Optimization

- **Image Loading**: Browser native lazy loading for images
- **CSS Modules**: Scoped styles prevent global pollution
- **Component Splitting**: ListItem is separate component for reusability

### Bundle Size

- **List.vue**: ~3KB
- **ListItem.vue**: ~4KB
- **Dependencies**: ActionButtons (~2KB)
- **Total**: ~9KB (gzipped)

## Related Components

- [ActionButtons](./action-buttons.md) - Renders item and global buttons
- [Typography](./typography.md) - Renders titles and subtitles
- [Gallery](./gallery.md) - Horizontal carousel alternative
- [TextWithButtons](./text-with-buttons.md) - Simpler button layout

## Implementation Notes

### Design Decisions

1. **Single Button**: Only first button per item rendered (matches React implementation)
2. **Dynamic Component**: Uses `:is` to render header as `<div>`, items as `<li>`
3. **Background Images**: CSS `background-image` for header, inline elements for thumbnails
4. **Direct ActionButtons**: No wrapper components needed (simpler than React)

### Differences from React

- No `PrimaryButton`/`SecondaryButton` components (uses ActionButtons directly)
- Background image sanitization in helper function
- CSS modules instead of CSS-in-JS
- Composition API instead of hooks

### Future Enhancements

- [ ] Multiple buttons per item (currently only first)
- [ ] Horizontal scrolling variant
- [ ] Expanded item view
- [ ] Drag to reorder
