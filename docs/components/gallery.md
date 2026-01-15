# Gallery Component

Displays a horizontal carousel of interactive cards with images, titles, subtitles, and action buttons.

## Import

```typescript
import { Gallery } from '@cognigy/chat-components-vue'
```

## Props

Gallery uses the message context and doesn't accept direct props. It reads gallery data from the message structure.

## Features

- ✅ Horizontal carousel with touch/swipe support
- ✅ Single card mode (no carousel for 1 item)
- ✅ Navigation arrows for multiple cards
- ✅ Pagination dots
- ✅ Each card has: image, title, subtitle, buttons
- ✅ Clickable cards with default_action URL
- ✅ Broken image fallback
- ✅ Responsive layout
- ✅ Custom translations support
- ✅ Full keyboard accessibility
- ✅ Touch-friendly controls
- ✅ Auto-focus first button

## Usage

### Basic Gallery

```vue
<template>
  <div class="chat">
    <MessageProvider :message="message" :config="config">
      <Gallery />
    </MessageProvider>
  </div>
</template>

<script setup lang="ts">
import { Gallery } from '@cognigy/chat-components-vue'
import { provideMessageContext } from '@cognigy/chat-components-vue'
import type { IMessage } from '@cognigy/chat-components-vue'

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
              template_type: 'generic',
              elements: [
                {
                  title: 'Product 1',
                  subtitle: 'High quality product',
                  image_url: 'https://example.com/product1.jpg',
                  image_alt_text: 'Product 1 image',
                  buttons: [
                    { title: 'Buy Now', type: 'postback', payload: 'buy_product_1' },
                    { title: 'Details', type: 'web_url', url: 'https://example.com/product1' },
                  ],
                },
                {
                  title: 'Product 2',
                  subtitle: 'Best seller',
                  image_url: 'https://example.com/product2.jpg',
                  image_alt_text: 'Product 2 image',
                  buttons: [
                    { title: 'Buy Now', type: 'postback', payload: 'buy_product_2' },
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
</script>
```

### Gallery with Clickable Cards

```vue
<script setup lang="ts">
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
              template_type: 'generic',
              elements: [
                {
                  title: 'Article Title',
                  subtitle: 'Read the full article',
                  image_url: 'https://example.com/article.jpg',
                  image_alt_text: 'Article thumbnail',
                  default_action: {
                    type: 'web_url',
                    url: 'https://example.com/article',
                  },
                  buttons: [
                    { title: 'Share', type: 'postback', payload: 'share_article' },
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
</script>
```

## Message Data Structure

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
              template_type: 'generic',
              elements: [
                {
                  title: string,               // Required: Card title (overlay on image)
                  subtitle?: string,           // Optional: Card subtitle
                  image_url: string,           // Required: Card image URL
                  image_alt_text?: string,     // Optional: Image alt text for accessibility
                  buttons?: IWebchatButton[],  // Optional: Action buttons
                  default_action?: {           // Optional: Makes card clickable
                    type: 'web_url',
                    url: string
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
```

## Card Structure

Each gallery card consists of:

### Image Section (Top)
- **Image**: 206x150px aspect ratio
- **Title Overlay**: White text on image bottom
- **Broken Image Fallback**: Grey placeholder if image fails to load

### Content Section (Bottom)
- **Subtitle**: Optional description text
- **Action Buttons**: Optional buttons for interactions

## Configuration

### Custom Translations

```typescript
const config: ChatConfig = {
  settings: {
    customTranslations: {
      ariaLabels: {
        slide: 'Card',
        actionButtonPositionText: '{{position}} of {{total}}',
        opensInNewTab: 'Opens in new tab',
      },
    },
  },
}
```

### Auto-focus

```typescript
const config: ChatConfig = {
  settings: {
    widgetSettings: {
      enableAutoFocus: true,  // Auto-focus first button on mount
    },
  },
}
```

### URL Sanitization

```typescript
const config: ChatConfig = {
  settings: {
    layout: {
      disableUrlButtonSanitization: false,  // Enable URL sanitization (default)
    },
  },
}
```

## Carousel Behavior

### Single Card
- No carousel navigation
- No pagination dots
- Card displayed standalone
- Full-width within container

### Multiple Cards
- Horizontal carousel with Swiper
- Navigation arrows (left/right)
- Pagination dots at bottom
- Touch/swipe support
- Each slide is 206px wide
- 8px gap between slides
- Auto-height based on content

### Navigation Controls

**Arrow Buttons:**
- Semi-transparent black circles
- Left arrow: navigate previous
- Right arrow: navigate next
- Auto-hide when at start/end
- RTL support (arrows flip direction)

**Pagination Dots:**
- Small dots at carousel bottom
- Active dot is darker
- Clickable to jump to slide
- Hidden if only one dot

## Clickable Cards

Cards with `default_action` become clickable:
- Entire card acts as a link
- Opens URL in new tab
- Keyboard accessible (Tab + Enter)
- ARIA label includes "Opens in new tab"
- Cursor changes to pointer on hover

```typescript
{
  title: 'Click Me',
  default_action: {
    type: 'web_url',
    url: 'https://example.com'
  }
}
```

## CSS Variables

```css
:root {
  /* Colors */
  --cc-white: #ffffff;
  --cc-black-80: rgba(0, 0, 0, 0.8);
  --cc-black-50: rgba(0, 0, 0, 0.5);
  --cc-primary-color-focus: #1976d2;
  --cc-primary-color-opacity-10: rgba(25, 118, 210, 0.1);

  /* Border radius */
  --cc-bubble-border-radius: 15px;
}
```

## CSS Classes

The component applies these global CSS classes for custom styling:

```css
/* Container */
.webchat-carousel-template-root { }

/* Individual card */
.webchat-carousel-template-frame { }
.webchat-carousel-template-title { }
.webchat-carousel-template-subtitle { }
.webchat-carousel-template-content { }
.webchat-carousel-template-button { }

/* Swiper classes (from Swiper library) */
.swiper { }
.swiper-wrapper { }
.swiper-slide { }
.swiper-button-prev { }
.swiper-button-next { }
.swiper-pagination { }
.swiper-pagination-bullet { }
.swiper-pagination-bullet-active { }
```

## Accessibility

### ARIA Labels

**Cards:**
```html
<div
  role="link"
  aria-labelledby="title-id"
  aria-describedby="subtitle-id"
  aria-label="Card title. Opens in new tab"
>
```

**Slides:**
```html
<!-- Swiper automatically adds -->
aria-label="Slide 1 of 3"
```

**Buttons:**
- Each button has accessible label
- Linked to card title via `aria-describedby`

### Keyboard Navigation

**Carousel:**
- `Tab`: Navigate to navigation buttons
- `Arrow Keys`: Navigate between slides (when pagination focused)
- `Enter`: Activate focused button/card

**Cards:**
- `Tab`: Navigate to card/buttons
- `Enter`: Activate card default action
- `Tab`: Navigate to next button

### Screen Reader Support

- Carousel announces slide position
- Cards announce title and subtitle
- Buttons announce action type
- Navigation state announced
- Default action announced ("Opens in new tab")

## Best Practices

### ✅ Do

1. **Use consistent image sizes**
   ```typescript
   // All images should be ~206x150px or similar aspect ratio
   image_url: 'https://example.com/product-206x150.jpg'
   ```

2. **Provide alt text for images**
   ```typescript
   {
     image_url: 'product.jpg',
     image_alt_text: 'Red sneakers, size 10'
   }
   ```

3. **Keep titles concise**
   ```typescript
   // ✅ Good: Short, readable title
   title: 'Nike Air Max'

   // ❌ Bad: Too long, gets cut off
   title: 'Nike Air Max Premium Edition with Extra Cushioning and Support'
   ```

4. **Limit buttons per card**
   ```typescript
   // ✅ Good: 1-3 buttons
   buttons: [
     { title: 'Buy', type: 'postback', payload: 'buy' },
     { title: 'Details', type: 'web_url', url: '...' },
   ]
   ```

5. **Provide subtitle context**
   ```typescript
   {
     title: 'Product Name',
     subtitle: '$99.99 - Free Shipping'
   }
   ```

### ❌ Don't

1. **Don't use too many cards**
   ```typescript
   // ❌ Bad: 20+ cards overwhelming
   elements: [/* 20 cards */]

   // ✅ Good: 3-10 cards
   elements: [/* 5 cards */]
   ```

2. **Don't use inconsistent image ratios**
   ```typescript
   // ❌ Bad: Mixed aspect ratios
   elements: [
     { image_url: 'square.jpg' },      // 1:1
     { image_url: 'portrait.jpg' },    // 3:4
     { image_url: 'landscape.jpg' },   // 16:9
   ]
   ```

3. **Don't omit image alt text**
   ```typescript
   // ❌ Bad: Missing alt text
   { image_url: 'product.jpg' }

   // ✅ Good: Descriptive alt text
   { image_url: 'product.jpg', image_alt_text: 'Red running shoes' }
   ```

4. **Don't use default_action without context**
   ```typescript
   // ❌ Bad: No indication card is clickable
   {
     title: 'Article',
     default_action: { url: '...' }
   }

   // ✅ Good: Subtitle hints at clickability
   {
     title: 'Article Title',
     subtitle: 'Click to read more',
     default_action: { url: '...' }
   }
   ```

## Common Patterns

### Pattern: Product Catalog

```vue
<script setup lang="ts">
const productGallery: IMessage = {
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
                  title: 'Nike Air Max',
                  subtitle: '$129.99 - In Stock',
                  image_url: 'https://example.com/nike-air-max.jpg',
                  image_alt_text: 'Nike Air Max shoes',
                  buttons: [
                    { title: 'Add to Cart', type: 'postback', payload: 'add_nike_air_max' },
                    { title: 'View Details', type: 'web_url', url: 'https://example.com/products/nike-air-max' },
                  ],
                },
                {
                  title: 'Adidas Ultraboost',
                  subtitle: '$159.99 - Limited Stock',
                  image_url: 'https://example.com/adidas-ultraboost.jpg',
                  image_alt_text: 'Adidas Ultraboost shoes',
                  buttons: [
                    { title: 'Add to Cart', type: 'postback', payload: 'add_adidas_ultraboost' },
                    { title: 'View Details', type: 'web_url', url: 'https://example.com/products/adidas-ultraboost' },
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
</script>
```

### Pattern: Article/News Feed

```vue
<script setup lang="ts">
const newsGallery: IMessage = {
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
                  title: 'Breaking News',
                  subtitle: 'Important update on recent events',
                  image_url: 'https://example.com/news1.jpg',
                  image_alt_text: 'News headline image',
                  default_action: {
                    type: 'web_url',
                    url: 'https://example.com/news/article-1',
                  },
                  buttons: [
                    { title: 'Read More', type: 'web_url', url: 'https://example.com/news/article-1' },
                    { title: 'Share', type: 'postback', payload: 'share_article_1' },
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
</script>
```

### Pattern: Location/Places

```vue
<script setup lang="ts">
const placesGallery: IMessage = {
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
                  title: 'Coffee Shop Downtown',
                  subtitle: '123 Main St • Open until 8pm',
                  image_url: 'https://example.com/coffee-shop.jpg',
                  image_alt_text: 'Coffee shop storefront',
                  buttons: [
                    { title: 'Get Directions', type: 'web_url', url: 'https://maps.google.com/?q=Coffee+Shop' },
                    { title: 'Call', type: 'phone_number', payload: '+1-555-0123' },
                    { title: 'Book Table', type: 'postback', payload: 'book_coffee_shop' },
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
</script>
```

### Pattern: Events

```vue
<script setup lang="ts">
const eventsGallery: IMessage = {
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
                  title: 'Summer Music Festival',
                  subtitle: 'June 15-17 • Central Park',
                  image_url: 'https://example.com/music-festival.jpg',
                  image_alt_text: 'Music festival poster',
                  buttons: [
                    { title: 'Buy Tickets', type: 'web_url', url: 'https://tickets.example.com' },
                    { title: 'View Lineup', type: 'postback', payload: 'view_lineup' },
                    { title: 'Remind Me', type: 'postback', payload: 'remind_music_festival' },
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
</script>
```

## Error Handling

### Missing Elements

If no elements provided:
- Component renders nothing
- No error thrown
- Graceful degradation

### Empty Elements Array

If elements array is empty:
- Component renders nothing
- No carousel shown
- No error thrown

### Invalid Element Data

If element missing required fields:
- Card still attempts to render
- Missing image shows grey placeholder
- Missing title shows empty overlay
- Buttons filtered if invalid

### Broken Images

If image fails to load:
- Grey placeholder shown (206x150px)
- Matches card dimensions
- No broken image icon
- Alt text still accessible

### Missing Buttons

If no buttons provided:
- Card renders without button section
- Content section may be empty if no subtitle
- Image and title still display

## Troubleshooting

### Cards Not Showing

**Problem:** Gallery doesn't render

**Solutions:**
1. Check elements array exists and not empty:
   ```typescript
   payload: {
     template_type: 'generic',
     elements: [/* at least one card */]
   }
   ```

2. Verify attachment structure:
   ```typescript
   attachment: {
     type: 'template',
     payload: { /* ... */ }
   }
   ```

3. Check console for errors

### Carousel Not Swiping

**Problem:** Can't swipe between cards

**Solutions:**
1. Ensure multiple cards (single card has no carousel)
2. Check Swiper is loaded (should see navigation arrows)
3. Try on touch device or use arrow buttons
4. Check browser console for Swiper errors

### Images Not Loading

**Problem:** All cards show grey placeholders

**Solutions:**
1. Verify image URLs are accessible:
   ```bash
   curl -I https://example.com/image.jpg
   ```

2. Check CORS headers for cross-origin images
3. Test URLs in browser directly
4. Use HTTPS URLs when possible

### Navigation Arrows Not Working

**Problem:** Clicking arrows doesn't navigate

**Solutions:**
1. Ensure multiple cards (arrows hidden for single card)
2. Check Swiper navigation initialized
3. Verify button selectors are correct
4. Try keyboard navigation as alternative

### Cards Too Wide/Narrow

**Problem:** Card sizing issues

**Solutions:**
1. Cards are fixed at 206px width
2. Check container width allows cards
3. Verify CSS not overriding card width
4. Check responsive breakpoints

### Buttons Not Clickable

**Problem:** Card buttons don't respond

**Solutions:**
1. Verify action handler provided:
   ```typescript
   const action = (text, data) => {
     console.log('Action:', text, data)
   }
   ```

2. Check button data structure
3. Verify buttons not disabled
4. Check z-index/overlay issues

## Related Components

- [TextWithButtons](./text-with-buttons.md) - Simple button group
- [ActionButtons](./action-buttons.md) - Button group (used internally)
- [ActionButton](./action-button.md) - Individual buttons
- [Typography](./typography.md) - Text rendering (used internally)

## Related Composables

- [useMessageContext](../composables/use-message-context.md) - Access message context
- [useSanitize](../composables/use-sanitize.md) - HTML sanitization (used internally)

## Implementation Notes

- Uses Swiper library for carousel functionality
- Swiper modules: Navigation, Pagination, A11y
- Single card renders without Swiper (performance)
- Each card is a separate GalleryItem component
- Images have 206:150 aspect ratio
- Broken images show grey placeholder
- URL sanitization via @braintree/sanitize-url
- Auto-focus first button/card if enabled
- Navigation arrows positioned over image area
- Pagination dots at bottom of carousel

## Dependencies

This component requires:
- **swiper**: ^12.0.0 - Carousel functionality
- **@braintree/sanitize-url**: ^7.1.1 - URL sanitization

These are included in package.json.

## Testing

The component has comprehensive test coverage:

- ✅ Single card rendering (no carousel)
- ✅ Multiple cards rendering (with carousel)
- ✅ Correct number of slides
- ✅ Empty elements array handling
- ✅ CSS class application
- ✅ GalleryItem component rendering
- ✅ Slide data passing
- ✅ Unique content IDs generation
- ✅ Navigation buttons (show/hide)
- ✅ Arrow icons in navigation
- ✅ Swiper configuration (modules, spacing, slides per view)
- ✅ Navigation configuration
- ✅ Pagination configuration
- ✅ Accessibility labels (default and custom)
- ✅ Card content display (title, subtitle, buttons)
- ✅ Message source handling (bot, user, engagement)
- ✅ Edge cases (missing attachment, payload, elements, config)
- ✅ Large number of slides
- ✅ Slide dimensions

See `test/Gallery.spec.ts` for full test suite (31/31 tests passing).

## Security

### URL Validation

Image and default_action URLs are sanitized by default:
```typescript
import { sanitizeUrl } from '@braintree/sanitize-url'

// URLs sanitized to prevent javascript: and data: URIs
const safeUrl = sanitizeUrl(url)
```

### XSS Prevention

Title and subtitle are sanitized via useSanitize:
```typescript
// HTML is sanitized before rendering
const titleHtml = processHTML(title)
```

### Disable Sanitization (Use with caution)

```typescript
config: {
  settings: {
    layout: {
      disableUrlButtonSanitization: true,  // Not recommended
      disableHtmlContentSanitization: true  // Not recommended
    }
  }
}
```

## Performance

### Carousel Library

- Swiper adds ~45KB to bundle (minified + gzipped)
- Loads only required modules (Navigation, Pagination, A11y)
- Single card doesn't load Swiper (optimization)

### Images

- Images load asynchronously
- No preloading (saves bandwidth)
- Broken images handled gracefully
- Consider lazy loading for many cards

### Rendering

- Efficient component rendering
- No unnecessary re-renders
- Computed properties for derived state

## Browser Support

- Modern browsers (ES6+)
- Touch/swipe on mobile devices
- Mouse navigation on desktop
- Keyboard navigation (all browsers)
- RTL support (arrows flip direction)
- No IE11 support

## Known Limitations

1. **Fixed Card Width** - Cards are always 206px wide
2. **Image Aspect Ratio** - Images cropped to 206:150 ratio
3. **No Vertical Carousels** - Only horizontal scrolling
4. **No Infinite Loop** - Carousel doesn't loop back to start
5. **No Auto-play** - Cards don't auto-advance
6. **Limited Customization** - Swiper styling requires global CSS overrides

These limitations keep the component simple and maintainable. For advanced carousel features, consider extending the Swiper configuration or using a custom implementation.
