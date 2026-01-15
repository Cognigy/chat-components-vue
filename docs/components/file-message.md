# FileMessage

Displays file attachments with support for images and documents. Automatically separates images (displayed as thumbnails) from other files (displayed as download cards).

## Import

```typescript
import { FileMessage } from '@cognigy/chat-components-vue'
```

## Features

- **Image Attachments**: JPEG, PNG, GIF, WebP displayed as clickable thumbnails
- **Document Attachments**: PDF, Office docs, etc. displayed as download cards
- **Automatic Sorting**: Images and documents separated automatically
- **Responsive Sizing**:
  - Single image: Up to 295x256px
  - Multiple images: 128x128px grid
- **File Information**: Filename, extension, and size displayed
- **Download Links**: All attachments are clickable for download
- **Text Support**: Optional text message displayed below attachments
- **Animation**: Smooth pop-in animation for images

## Usage

### Single Image

```vue
<template>
  <FileMessage />
</template>

<script setup>
import { FileMessage, provideMessageContext } from '@cognigy/chat-components-vue'

const message = {
  text: 'Here is your photo',
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    attachments: [
      {
        runtimeFileId: 'file-123',
        fileName: 'vacation-photo.jpg',
        mimeType: 'image/jpeg',
        size: 2500000,  // 2.5 MB
        url: 'https://example.com/files/vacation-photo.jpg'
      }
    ]
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

### Multiple Images

```vue
<script setup>
const message = {
  text: 'Photo gallery',
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    attachments: [
      {
        runtimeFileId: 'photo-1',
        fileName: 'photo1.jpg',
        mimeType: 'image/jpeg',
        size: 1500000,
        url: 'https://example.com/photo1.jpg'
      },
      {
        runtimeFileId: 'photo-2',
        fileName: 'photo2.png',
        mimeType: 'image/png',
        size: 2000000,
        url: 'https://example.com/photo2.png'
      },
      {
        runtimeFileId: 'photo-3',
        fileName: 'photo3.jpg',
        mimeType: 'image/jpeg',
        size: 1800000,
        url: 'https://example.com/photo3.jpg'
      }
    ]
  }
}
</script>
```

### Document Files

```vue
<script setup>
const message = {
  text: 'Here are your documents',
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    attachments: [
      {
        runtimeFileId: 'doc-1',
        fileName: 'report.pdf',
        mimeType: 'application/pdf',
        size: 1500000,
        url: 'https://example.com/files/report.pdf'
      },
      {
        runtimeFileId: 'doc-2',
        fileName: 'data.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 500000,
        url: 'https://example.com/files/data.xlsx'
      }
    ]
  }
}
</script>
```

### Mixed Attachments

```vue
<script setup>
const message = {
  text: 'Project files',
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    attachments: [
      {
        runtimeFileId: 'image-1',
        fileName: 'screenshot.png',
        mimeType: 'image/png',
        size: 800000,
        url: 'https://example.com/screenshot.png'
      },
      {
        runtimeFileId: 'doc-1',
        fileName: 'specifications.pdf',
        mimeType: 'application/pdf',
        size: 2000000,
        url: 'https://example.com/specs.pdf'
      },
      {
        runtimeFileId: 'doc-2',
        fileName: 'budget.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 300000,
        url: 'https://example.com/budget.xlsx'
      }
    ]
  }
}
</script>
```

## Data Structure

### IUploadFileAttachmentData

```typescript
interface IUploadFileAttachmentData {
  // Unique identifier for the file in the runtime
  runtimeFileId: string

  // Original filename with extension
  fileName: string

  // MIME type of the file
  mimeType: string

  // File size in bytes
  size: number

  // URL to download/view the file
  url: string

  // Optional status from virus scanning
  status?: 'infected' | 'scanned'
}
```

### Message Structure

```typescript
interface IMessage {
  text?: string  // Optional text to display below attachments
  source: 'bot' | 'user' | 'agent'
  timestamp: string
  data: {
    attachments: IUploadFileAttachmentData[]
  }
}
```

## Image Support

### Valid Image MIME Types

```typescript
const VALID_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
]
```

### Image Sizing

- **Single Image**:
  - Max width: 295px
  - Max height: 256px
  - Object-fit: cover
  - Aspect ratio: Preserved

- **Multiple Images**:
  - Fixed size: 128x128px
  - Object-fit: cover
  - Grid layout with 8px gap

### Image Animation

```css
@keyframes webchatImagePreviewPopIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

Duration: 0.2s ease-out

## Document Files

### Display Format

```
┌──────────────────────────────┐
│ filename.     ext │ 1.50 MB  │
└──────────────────────────────┘
```

- **Filename**: Truncated with ellipsis if too long (max 200px)
- **Extension**: Displayed separately (max 60px)
- **Size**: Formatted as MB or KB

### File Size Formatting

```typescript
// Size > 1 MB: Display in MB
1500000 bytes → "1.50 MB"

// Size ≤ 1 MB: Display in KB
5000 bytes → "5.00 KB"
```

## Helper Functions

### getFileName

Extracts filename without extension:

```typescript
getFileName('document.pdf')     // → 'document.'
getFileName('my.file.name.txt') // → 'my.file.name.'
getFileName('README')           // → 'README'
```

### getFileExtension

Extracts file extension:

```typescript
getFileExtension('document.pdf')     // → 'pdf'
getFileExtension('my.file.name.txt') // → 'txt'
getFileExtension('README')           // → null
```

### getSizeLabel

Formats file size:

```typescript
getSizeLabel(2500000)  // → '2.50 MB'
getSizeLabel(5000)     // → '5.00 KB'
```

### isImageAttachment

Checks if MIME type is a supported image:

```typescript
isImageAttachment('image/jpeg')      // → true
isImageAttachment('image/png')       // → true
isImageAttachment('application/pdf') // → false
```

## Component Behavior

### Attachment Separation

1. **On Mount**: Attachments are automatically sorted
2. **Images First**: Valid image MIME types are separated
3. **Documents Second**: Non-image files are grouped separately
4. **Display Order**: Images displayed before documents

### Download Links

All attachments are wrapped in `<a>` tags:

```html
<a
  href="file-url"
  target="_blank"
  rel="noopener noreferrer"
>
  <!-- Image or file card -->
</a>
```

- Opens in new tab/window
- Uses `noopener noreferrer` for security

### Text Content

If message has `text` property:

1. Attachments displayed first
2. Text message rendered below using `TextMessage` component
3. Text supports HTML/Markdown (via TextMessage)

## CSS Variables

```css
/* Border radius for images and file cards */
--cc-bubble-border-radius: 15px;

/* File card background */
--cc-black-95: rgba(0, 0, 0, 0.95);

/* File name text color */
--cc-black-10: rgba(0, 0, 0, 0.1);

/* File size text color */
--cc-black-40: rgba(0, 0, 0, 0.4);
```

## Accessibility

### Images

- **Alt Text**: Includes filename and size: `"vacation-photo.jpg (2.50 MB)"`
- **Title Attribute**: Same as alt text for tooltip
- **Clickable**: Entire image is clickable link
- **Link Purpose**: Opens in new tab (rel="noopener noreferrer")

### Documents

- **Semantic HTML**: Uses proper `<a>` links
- **Text Labels**: Filename and size visible
- **Keyboard Navigation**: Links are keyboard accessible
- **Visual Hierarchy**: Clear separation of name, extension, size

### Screen Readers

```html
<!-- Image -->
<a href="...">
  <img
    alt="vacation-photo.jpg (2.50 MB)"
    title="vacation-photo.jpg (2.50 MB)"
  />
</a>

<!-- Document -->
<a href="...">
  <div>
    <span>document.</span>
    <span>pdf</span>
    <span>1.50 MB</span>
  </div>
</a>
```

## Global CSS Classes

For external styling:

```css
/* Root container */
.webchat-media-files-template-root { }

/* Image container */
.webchat-media-template-image-container { }

/* Individual images */
.webchat-media-template-image { }

/* Files container */
.webchat-media-template-files-container { }

/* Individual file cards */
.webchat-media-template-file { }
```

## Best Practices

### File Uploads

1. **Validate MIME Types**: Check file types before upload
2. **Size Limits**: Enforce reasonable size limits (e.g., 10MB)
3. **Virus Scanning**: Use `status` field to indicate scanned files
4. **URL Security**: Ensure URLs are from trusted domains

### Image Optimization

1. **Compress Images**: Optimize before uploading
2. **Responsive Images**: Consider serving different sizes
3. **Lazy Loading**: Browser native lazy loading applied
4. **Format Selection**: Use WebP when possible for best compression

### User Experience

1. **Loading States**: Show progress while uploading
2. **Error Handling**: Handle failed downloads gracefully
3. **File Preview**: Provide preview before sending
4. **Batch Uploads**: Support multiple files at once

### Performance

1. **Thumbnail Generation**: Generate thumbnails server-side
2. **CDN**: Serve files from CDN for faster delivery
3. **Caching**: Use appropriate cache headers
4. **Compression**: Enable gzip/brotli for downloads

## Common Patterns

### Upload Confirmation

```vue
<script setup>
const message = {
  text: 'Your files have been uploaded successfully!',
  source: 'bot',
  data: {
    attachments: uploadedFiles.map(file => ({
      runtimeFileId: file.id,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      url: file.downloadUrl
    }))
  }
}
</script>
```

### Receipt/Invoice

```vue
<script setup>
const message = {
  text: 'Thank you for your purchase. Here is your receipt:',
  source: 'bot',
  data: {
    attachments: [
      {
        runtimeFileId: 'receipt-001',
        fileName: 'Receipt-2024-01-14.pdf',
        mimeType: 'application/pdf',
        size: 450000,
        url: 'https://example.com/receipts/receipt-001.pdf'
      }
    ]
  }
}
</script>
```

### Photo Gallery

```vue
<script setup>
const message = {
  text: 'Product images:',
  source: 'bot',
  data: {
    attachments: productImages.map((img, index) => ({
      runtimeFileId: `product-img-${index}`,
      fileName: `product-${index + 1}.jpg`,
      mimeType: 'image/jpeg',
      size: img.size,
      url: img.url
    }))
  }
}
</script>
```

## Error Handling

### Missing Attachments

```typescript
// Component handles gracefully - renders nothing
if (!attachments || attachments.length === 0) {
  return null
}
```

### Invalid URLs

```typescript
// Browser handles invalid URLs
// Shows broken image or failed download
```

### Large Files

```typescript
// File size formatted correctly regardless of size
getSizeLabel(999999999) // → "1000.00 MB"
```

## Troubleshooting

### Images not displaying

- Check MIME type is in VALID_IMAGE_MIME_TYPES
- Verify URL is accessible
- Check CORS headers if cross-origin
- Inspect network tab for 404/403 errors

### File cards not showing

- Verify attachments array exists
- Check message.data.attachments structure
- Ensure each attachment has required fields

### Text not appearing

- Check message.text is defined and not empty string
- Verify TextMessage component is imported
- Check console for TextMessage errors

### Download not working

- Verify URL is valid and accessible
- Check server allows direct downloads
- Inspect Content-Disposition headers
- Test URL directly in browser

## Testing

Example test cases:

```typescript
import { mount } from '@vue/test-utils'
import FileMessage from '@cognigy/chat-components-vue'

describe('FileMessage', () => {
  it('renders single image', () => {
    const wrapper = mount(FileMessage, {
      global: {
        provide: {
          [MessageContextKey]: {
            message: {
              data: {
                attachments: [{
                  runtimeFileId: 'img-1',
                  fileName: 'photo.jpg',
                  mimeType: 'image/jpeg',
                  size: 1000000,
                  url: 'https://example.com/photo.jpg'
                }]
              }
            }
          }
        }
      }
    })

    const images = wrapper.findAll('[data-testid="image-attachment"]')
    expect(images.length).toBe(1)
  })

  it('separates images from documents', () => {
    // Test implementation
  })

  it('formats file sizes correctly', () => {
    // Test implementation
  })
})
```

## Security

### URL Validation

- All URLs opened with `target="_blank"` and `rel="noopener noreferrer"`
- Prevents window.opener access
- Mitigates tabnabbing attacks

### MIME Type Validation

```typescript
// Only specific MIME types treated as images
const VALID_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
]
```

### File Status

```typescript
interface IUploadFileAttachmentData {
  status?: 'infected' | 'scanned'
  // Display warning if status is 'infected'
}
```

## Performance

### Bundle Size

- FileMessage.vue: ~2KB
- Helper functions: ~1KB
- Dependencies: Typography (~1KB), TextMessage (~3KB)
- Total: ~7KB (gzipped)

### Rendering

- Images lazy-loaded by browser
- Animation GPU-accelerated (transform, opacity)
- No runtime performance issues with dozens of files

### Memory

- Component cleans up on unmount
- No memory leaks with image references
- Attachment data not duplicated

## Related Components

- [TextMessage](./text-message.md) - Renders text below attachments
- [Typography](./typography.md) - Used for file information
- [ImageMessage](./image-message.md) - Alternative for single images with lightbox

## Implementation Notes

### Design Decisions

1. **Automatic Sorting**: Images always appear before documents
2. **No Lightbox**: Images open in new tab (simpler than ImageMessage)
3. **Fixed Sizing**: Consistent grid layout for multiple files
4. **Separate Components**: TextMessage used for text content

### Differences from React

- No live region announcement (yet)
- CSS modules instead of CSS-in-JS
- Composition API instead of hooks
- Direct helper functions instead of module imports

### Future Enhancements

- [ ] Lightbox view for images
- [ ] File type icons for documents
- [ ] Upload progress indicators
- [ ] Drag and drop support
- [ ] File preview for more types
- [ ] Inline PDF viewer
