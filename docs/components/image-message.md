# ImageMessage Component

Displays images with optional lightbox for fullscreen viewing and download functionality.

## Import

```typescript
import { ImageMessage } from '@cognigy/chat-components-vue'
```

## Props

ImageMessage uses the message context and doesn't accept direct props. It reads image data from the message structure.

## Features

- ✅ Image display with alt text
- ✅ Fullscreen lightbox viewer
- ✅ Download button for images
- ✅ Keyboard navigation (Enter, Space, Escape)
- ✅ Focus management
- ✅ Broken image fallback
- ✅ Dynamic aspect ratio option
- ✅ Custom translations support
- ✅ Accessible ARIA labels

## Usage

### Basic Image Message

```vue
<template>
  <div class="chat">
    <MessageProvider :message="message" :config="config">
      <ImageMessage />
    </MessageProvider>
  </div>
</template>

<script setup lang="ts">
import { ImageMessage } from '@cognigy/chat-components-vue'
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
            type: 'image',
            payload: {
              url: 'https://example.com/image.jpg',
              altText: 'A beautiful landscape',
            },
          },
        },
      },
    },
  },
}
</script>
```

### Image with Download Button

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
            type: 'image',
            payload: {
              url: 'https://example.com/product.jpg',
              altText: 'Product image',
              buttons: [
                {
                  type: 'web_url',
                  url: 'https://example.com/product.jpg',
                  title: 'Download',
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

### With Dynamic Aspect Ratio

```vue
<script setup lang="ts">
const config: ChatConfig = {
  settings: {
    layout: {
      dynamicImageAspectRatio: true, // Preserve original aspect ratio
    },
  },
}
</script>
```

## Message Data Structure

### Basic Image

```typescript
{
  source: 'bot',
  timestamp: '1234567890',
  data: {
    _cognigy: {
      _webchat: {
        message: {
          attachment: {
            type: 'image',
            payload: {
              url: string,         // Required: Image URL
              altText?: string,    // Optional: Alt text for accessibility
            }
          }
        }
      }
    }
  }
}
```

### Image with Download Button

```typescript
{
  source: 'bot',
  timestamp: '1234567890',
  data: {
    _cognigy: {
      _webchat: {
        message: {
          attachment: {
            type: 'image',
            payload: {
              url: string,
              altText?: string,
              buttons: [
                {
                  type: 'web_url',
                  url: string,
                  title: string
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

## Configuration

### Dynamic Aspect Ratio

```typescript
const config: ChatConfig = {
  settings: {
    layout: {
      dynamicImageAspectRatio: true, // Default: false (uses 16:9 ratio)
    },
  },
}
```

**Behavior:**
- `false` (default): Images use 16:9 aspect ratio with object-fit cover
- `true`: Images preserve their original aspect ratio

### Custom Translations

```typescript
const config: ChatConfig = {
  settings: {
    customTranslations: {
      ariaLabels: {
        viewImageInFullsize: 'View full-size image',
        fullSizeImageViewerTitle: 'Full-size image viewer',
        downloadFullsizeImage: 'Download full-size image',
        closeFullsizeImageModal: 'Close full-size image viewer',
      },
    },
  },
}
```

## Behavior

### Downloadable vs Non-Downloadable

**Downloadable** (has web_url button):
- Image is clickable
- Cursor changes to pointer
- Opens lightbox on click
- Shows download button below image
- Keyboard accessible (Tab, Enter, Space)

**Non-Downloadable** (no buttons):
- Image is display-only
- No hover effects
- No lightbox functionality
- No keyboard interaction

### Lightbox

The lightbox provides fullscreen image viewing:

**Features:**
- Fullscreen overlay with dark backdrop
- Download button in header
- Close button in header
- Image caption display
- Click backdrop to close
- Click image itself does nothing (prevents accidental close)
- Escape key to close
- Focus trap for accessibility

**Focus Management:**
- Opening lightbox focuses download button
- Closing lightbox returns focus to thumbnail

### Keyboard Navigation

**Thumbnail (when downloadable):**
- `Tab`: Focus the image
- `Enter` or `Space`: Open lightbox

**Lightbox:**
- `Tab`: Navigate between download and close buttons
- `Enter`: Activate focused button
- `Escape`: Close lightbox

## CSS Variables

```css
:root {
  /* Colors */
  --cc-white: #ffffff;
  --cc-black-10: #1a1a1a;
  --cc-black-80: rgba(0, 0, 0, 0.8);
  --cc-black-95: #f5f5f5;
  --cc-primary-color-focus: #1976d2;

  /* Border radius */
  --cc-bubble-border-radius: 15px;
}
```

## Accessibility

### ARIA Labels

Images are announced to screen readers with proper labels:

**Thumbnail:**
```html
<div role="button" aria-label="View full-size image" tabindex="0">
  <img src="..." alt="Image description" />
</div>
```

**Lightbox:**
```html
<div role="dialog" aria-label="Full-size image viewer">
  <!-- Lightbox content -->
</div>
```

### Keyboard Support

- Full keyboard navigation support
- Focus visible indicators
- Focus trap in lightbox
- Logical tab order

### Screen Reader Support

- Image alt text announced
- Button purposes clear
- Lightbox state announced
- Action results communicated

## Best Practices

### ✅ Do

1. **Always provide alt text**
   ```typescript
   {
     url: 'image.jpg',
     altText: 'Descriptive text about the image'
   }
   ```

2. **Use appropriate image formats**
   ```typescript
   // Prefer: WebP, JPEG, PNG
   url: 'https://example.com/image.webp'
   ```

3. **Optimize image sizes**
   ```typescript
   // Use appropriately sized images (not 4K for thumbnails)
   url: 'https://example.com/image-800w.jpg'
   ```

4. **Include download button for important images**
   ```typescript
   buttons: [{
     type: 'web_url',
     url: imageUrl,
     title: 'Download'
   }]
   ```

### ❌ Don't

1. **Don't omit alt text**
   ```typescript
   // ❌ Bad
   { url: 'image.jpg' }

   // ✅ Good
   { url: 'image.jpg', altText: 'Sunset over mountains' }
   ```

2. **Don't use generic alt text**
   ```typescript
   // ❌ Bad
   altText: 'Image'

   // ✅ Good
   altText: 'Red bicycle leaning against brick wall'
   ```

3. **Don't use data URLs for large images**
   ```typescript
   // ❌ Bad (bloats message size)
   url: 'data:image/png;base64,iVBORw0...'

   // ✅ Good
   url: 'https://cdn.example.com/image.jpg'
   ```

4. **Don't assume images will load**
   ```typescript
   // Always provide alt text as fallback
   // Component handles broken images gracefully
   ```

## Common Patterns

### Pattern: Product Image with Download

```vue
<script setup lang="ts">
const productImage: IMessage = {
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _cognigy: {
      _webchat: {
        message: {
          attachment: {
            type: 'image',
            payload: {
              url: 'https://shop.example.com/product-123.jpg',
              altText: 'Blue wireless headphones with case',
              buttons: [
                {
                  type: 'web_url',
                  url: 'https://shop.example.com/product-123.jpg',
                  title: 'Download Product Image',
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

### Pattern: Informational Image (No Download)

```vue
<script setup lang="ts">
const infoImage: IMessage = {
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _cognigy: {
      _webchat: {
        message: {
          attachment: {
            type: 'image',
            payload: {
              url: 'https://example.com/infographic.jpg',
              altText: 'Steps to reset your password: 1. Click forgot password 2. Check email 3. Enter new password',
            },
          },
        },
      },
    },
  },
}
</script>
```

### Pattern: Multiple Images in Sequence

```vue
<template>
  <div class="chat">
    <MessageProvider
      v-for="img in images"
      :key="img.timestamp"
      :message="img"
      :config="config"
    >
      <ImageMessage />
    </MessageProvider>
  </div>
</template>

<script setup lang="ts">
const images = [
  createImageMessage('image1.jpg', 'First step'),
  createImageMessage('image2.jpg', 'Second step'),
  createImageMessage('image3.jpg', 'Final result'),
]
</script>
```

## Error Handling

### Broken Images

If an image fails to load:
- Component shows a gray placeholder
- Alt text is still available to screen readers
- No error thrown

```vue
<!-- Broken image shows placeholder -->
<span class="brokenImage" />
```

### Missing URL

If image URL is missing:
- Component renders nothing
- No error thrown
- Graceful degradation

### Invalid Button Configuration

If buttons array exists but has invalid data:
- Image still displays
- Download functionality disabled
- Component continues working

## Troubleshooting

### Image Not Displaying

**Problem:** Image doesn't appear

**Solutions:**
1. Verify URL is accessible:
   ```typescript
   // Check URL in browser first
   url: 'https://example.com/image.jpg'
   ```

2. Check CORS headers on image server

3. Verify message structure:
   ```typescript
   data._cognigy._webchat.message.attachment.payload.url
   ```

### Lightbox Not Opening

**Problem:** Clicking image doesn't open lightbox

**Solutions:**
1. Ensure image has web_url button:
   ```typescript
   buttons: [{ type: 'web_url', url: '...', title: 'Download' }]
   ```

2. Check `isDownloadable` computed property

3. Verify click handler is attached

### Download Not Working

**Problem:** Download button doesn't work

**Solutions:**
1. Check `window.open` is not blocked:
   ```javascript
   // Browser may block popups
   window.open(url, '_blank')
   ```

2. Verify button has correct type:
   ```typescript
   type: 'web_url' // Required for download
   ```

### Focus Not Returning

**Problem:** Focus lost after closing lightbox

**Solutions:**
1. Component should handle this automatically
2. Check that `buttonRef` is properly set
3. Verify `nextTick()` is used for timing

### Aspect Ratio Issues

**Problem:** Images stretched or cropped incorrectly

**Solutions:**
1. Enable dynamic aspect ratio:
   ```typescript
   config.settings.layout.dynamicImageAspectRatio = true
   ```

2. Or accept default 16:9 ratio with object-fit

3. Ensure images are properly sized before upload

## Related Components

- [ActionButton](./action-button.md) - Used for download button
- [Message](./message.md) - Main message router
- [Gallery](./gallery.md) - Multiple images in carousel

## Related Composables

- [useMessageContext](../composables/use-message-context.md) - Access message context
- [useImageContext](../composables/use-image-context.md) - Internal image context

## Implementation Notes

- Uses `Teleport` for lightbox portal
- Images use 16:9 aspect ratio by default
- Lightbox has z-index 5000
- Focus management with `nextTick()`
- Escape listener added/removed on mount/unmount
- Broken image detection via error event

## Testing

The component has comprehensive test coverage:

- ✅ Basic rendering with URL
- ✅ Alt text support
- ✅ Missing URL handling
- ✅ Broken image fallback
- ✅ Downloadable vs non-downloadable
- ✅ Download button rendering
- ✅ Lightbox open/close
- ✅ Keyboard navigation (Enter, Space, Escape)
- ✅ Focus management
- ✅ Download functionality
- ✅ Backdrop click handling
- ✅ Image click (no close)
- ✅ Dynamic aspect ratio
- ✅ Custom translations
- ✅ Caption display

See `test/ImageMessage.spec.ts` for full test suite (25/25 tests passing).

## Security

### URL Validation

Image URLs are not sanitized by default. Ensure:
- URLs come from trusted sources
- Use HTTPS when possible
- Validate URLs on backend

### XSS Prevention

Alt text and captions are not rendered as HTML:
```vue
<!-- Safe: rendered as text -->
<img :alt="altText" />
<div>{{ altText }}</div>
```

### CORS

Images must allow cross-origin loading:
```
Access-Control-Allow-Origin: *
```

Or be served from same domain.

## Performance

### Image Loading

- Images load asynchronously
- No lazy loading (loads immediately)
- Consider adding loading="lazy" if needed

### Lightbox

- Lightbox uses fixed positioning
- Minimal re-renders
- Event listeners properly cleaned up

### Memory

- Component properly unmounts
- Event listeners removed
- No memory leaks

## Browser Support

- Modern browsers (ES6+)
- CSS Grid and Flexbox required
- Teleport API (Vue 3)
- No IE11 support
