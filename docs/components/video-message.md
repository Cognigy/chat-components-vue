# VideoMessage Component

Displays videos from multiple sources (direct URLs, YouTube, Vimeo) with optional captions and transcript download.

## Import

```typescript
import { VideoMessage } from '@cognigy/chat-components-vue'
```

## Props

VideoMessage uses the message context and doesn't accept direct props. It reads video data from the message structure.

## Features

- ✅ Multiple video sources (MP4, WebM, YouTube, Vimeo)
- ✅ Native HTML5 video player for direct URLs
- ✅ YouTube and Vimeo embed support
- ✅ Closed captions/subtitles support
- ✅ Download transcript functionality
- ✅ Light mode with play button overlay
- ✅ Keyboard navigation
- ✅ Responsive 16:9 aspect ratio
- ✅ Custom translations support
- ✅ Accessible ARIA labels

## Usage

### Basic Video Message (Direct URL)

```vue
<template>
  <div class="chat">
    <MessageProvider :message="message" :config="config">
      <VideoMessage />
    </MessageProvider>
  </div>
</template>

<script setup lang="ts">
import { VideoMessage } from '@cognigy/chat-components-vue'
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
            type: 'video',
            payload: {
              url: 'https://example.com/video.mp4',
            },
          },
        },
      },
    },
  },
}
</script>
```

### YouTube Video

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
            type: 'video',
            payload: {
              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            },
          },
        },
      },
    },
  },
}
</script>
```

### Vimeo Video

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
            type: 'video',
            payload: {
              url: 'https://vimeo.com/123456789',
            },
          },
        },
      },
    },
  },
}
</script>
```

### With Captions/Subtitles

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
            type: 'video',
            payload: {
              url: 'https://example.com/video.mp4',
              captionsUrl: 'https://example.com/captions.vtt',
            },
          },
        },
      },
    },
  },
}
</script>
```

### With Downloadable Transcript

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
            type: 'video',
            payload: {
              url: 'https://example.com/video.mp4',
              altText: 'This is the full transcript of the video content...',
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
            type: 'video',
            payload: {
              url: string,           // Required: Video URL (MP4, WebM, YouTube, Vimeo)
              altText?: string,      // Optional: Transcript text for download
              captionsUrl?: string,  // Optional: WebVTT captions file URL
            }
          }
        }
      }
    }
  }
}
```

## Supported Video Sources

### Direct Video URLs

Supported formats:
- MP4 (`.mp4`)
- WebM (`.webm`)
- Ogg (`.ogg`)

Example:
```typescript
url: 'https://example.com/video.mp4'
```

### YouTube

Supported URL formats:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

Example:
```typescript
url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
```

### Vimeo

Supported URL format:
- `https://vimeo.com/VIDEO_ID`

Example:
```typescript
url: 'https://vimeo.com/123456789'
```

## Configuration

### Custom Translations

```typescript
const config: ChatConfig = {
  settings: {
    customTranslations: {
      ariaLabels: {
        playVideo: 'Play video',  // Label for play button in light mode
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
      enableAutoFocus: true,  // Auto-focus video player on mount
    },
  },
}
```

## Behavior

### Light Mode (Direct Videos Only)

For direct video URLs, the component shows a play button overlay before the video starts:

**Features:**
- Custom play icon overlay
- Clickable to start video
- Keyboard accessible (Enter/Space)
- Removed after video starts playing

**Not available for:**
- YouTube videos (uses YouTube's native player)
- Vimeo videos (uses Vimeo's native player)

### Video Player

**Direct URLs:**
- Native HTML5 `<video>` element
- Built-in browser controls
- Support for keyboard shortcuts
- Captions via `<track>` element

**YouTube/Vimeo:**
- Embedded iframe player
- Platform-specific controls
- Platform-native features (quality selection, speed control, etc.)

### Captions/Subtitles

For direct video URLs, captions can be added via `captionsUrl`:

**Requirements:**
- WebVTT format (`.vtt` file)
- Accessible URL
- CORS headers if cross-origin

**Example VTT file:**
```vtt
WEBVTT

00:00:00.000 --> 00:00:05.000
Welcome to our tutorial.

00:00:05.000 --> 00:00:10.000
Today we'll learn about Vue components.
```

### Transcript Download

When `altText` is provided:
- Download button appears below video
- Downloads as `video-transcript.txt`
- Plain text format
- Uses data URL for download

## Keyboard Navigation

### Light Mode (Direct Videos)

- `Tab`: Focus the play button
- `Enter` or `Space`: Start playing video

### Video Playing

- Standard video controls via browser/platform
- `Tab`: Navigate between controls
- `Space`: Play/pause
- Arrow keys: Seek forward/backward
- `F`: Fullscreen (browser-dependent)

## CSS Variables

```css
:root {
  /* Colors */
  --cc-white: #ffffff;
  --cc-black-10: #1a1a1a;
  --cc-black-80: rgba(0, 0, 0, 0.8);
  --cc-primary-color: #1976d2;
  --cc-primary-color-hover: #1565c0;
  --cc-primary-color-focus: #1976d2;
  --cc-primary-contrast-color: #ffffff;

  /* Border radius */
  --cc-bubble-border-radius: 15px;
}
```

## Accessibility

### ARIA Labels

**Light Mode:**
```html
<div role="button" aria-label="Play video" tabindex="0">
  <!-- Video content -->
</div>
```

**Iframe:**
```html
<iframe title="Video title" ...>
  <!-- Embedded player -->
</iframe>
```

### Keyboard Support

- Full keyboard navigation
- Focus visible indicators
- Standard video controls

### Screen Reader Support

- Play button announced in light mode
- Video title/description announced
- Captions available for direct videos
- Standard player controls accessible

### Captions

- Added via `<track>` element for direct videos
- Language specified (en-US by default)
- User can enable/disable via player controls
- YouTube/Vimeo use platform captions

## Best Practices

### ✅ Do

1. **Provide captions when possible**
   ```typescript
   {
     url: 'video.mp4',
     captionsUrl: 'captions.vtt'
   }
   ```

2. **Include transcript for accessibility**
   ```typescript
   {
     url: 'video.mp4',
     altText: 'Full transcript of video content...'
   }
   ```

3. **Use appropriate video format**
   ```typescript
   // For best compatibility, use MP4 with H.264 codec
   url: 'video.mp4'
   ```

4. **Keep videos short and focused**
   ```typescript
   // Aim for 2-3 minutes max for chat context
   ```

5. **Optimize video size**
   ```typescript
   // Use compressed videos suitable for web
   // Recommended: 720p, reasonable bitrate
   ```

### ❌ Don't

1. **Don't use very large video files**
   ```typescript
   // ❌ Bad (100MB 4K video)
   url: 'huge-4k-video.mp4'

   // ✅ Good (5MB 720p video)
   url: 'optimized-720p.mp4'
   ```

2. **Don't omit captions for accessibility**
   ```typescript
   // ❌ Bad (no captions)
   { url: 'video.mp4' }

   // ✅ Good (with captions)
   { url: 'video.mp4', captionsUrl: 'captions.vtt' }
   ```

3. **Don't use auto-play**
   ```typescript
   // Videos don't auto-play by default
   // This is intentional for better UX
   ```

4. **Don't assume format support**
   ```typescript
   // Not all browsers support all formats
   // MP4 (H.264) has best compatibility
   ```

## Common Patterns

### Pattern: Tutorial Video with Transcript

```vue
<script setup lang="ts">
const tutorialVideo: IMessage = {
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _cognigy: {
      _webchat: {
        message: {
          attachment: {
            type: 'video',
            payload: {
              url: 'https://cdn.example.com/tutorial-01.mp4',
              captionsUrl: 'https://cdn.example.com/tutorial-01-captions.vtt',
              altText: `Welcome to Tutorial 1: Getting Started

In this tutorial, you'll learn:
- How to set up your account
- Basic navigation
- Creating your first project

Let's get started!`,
            },
          },
        },
      },
    },
  },
}
</script>
```

### Pattern: YouTube Product Demo

```vue
<script setup lang="ts">
const productDemo: IMessage = {
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _cognigy: {
      _webchat: {
        message: {
          attachment: {
            type: 'video',
            payload: {
              url: 'https://www.youtube.com/watch?v=PRODUCT_VIDEO_ID',
              altText: 'Watch our product demo to see all features in action.',
            },
          },
        },
      },
    },
  },
}
</script>
```

### Pattern: Vimeo Explainer Video

```vue
<script setup lang="ts">
const explainerVideo: IMessage = {
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _cognigy: {
      _webchat: {
        message: {
          attachment: {
            type: 'video',
            payload: {
              url: 'https://vimeo.com/123456789',
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

### Missing URL

If video URL is missing:
- Component renders nothing
- No error thrown
- Graceful degradation

### Invalid URL

If URL format is invalid:
- Direct videos: Video element shows error
- YouTube/Vimeo: Iframe shows platform error

### Network Errors

If video fails to load:
- Browser/platform shows error message
- User can retry
- No component crash

### Unsupported Format

If video format not supported:
- Browser shows fallback message
- Consider providing multiple formats

## Troubleshooting

### Video Not Playing

**Problem:** Video doesn't play when clicked

**Solutions:**
1. Check URL is accessible:
   ```typescript
   // Test URL in browser first
   url: 'https://example.com/video.mp4'
   ```

2. Verify video format is supported:
   ```typescript
   // Use MP4 for best compatibility
   url: 'video.mp4' // Not 'video.avi'
   ```

3. Check CORS headers if cross-origin

### Captions Not Showing

**Problem:** Subtitles don't appear

**Solutions:**
1. Verify VTT file format:
   ```vtt
   WEBVTT

   00:00:00.000 --> 00:00:05.000
   Caption text here
   ```

2. Check captions URL is accessible

3. Ensure CORS headers are set:
   ```
   Access-Control-Allow-Origin: *
   ```

4. Enable captions in video player controls

### YouTube Embed Not Working

**Problem:** YouTube video doesn't load

**Solutions:**
1. Check video ID is correct:
   ```typescript
   // Extract ID from full URL
   // From: https://www.youtube.com/watch?v=dQw4w9WgXcQ
   // ID: dQw4w9WgXcQ
   ```

2. Verify video is not private/restricted

3. Check video is embeddable (not disabled by owner)

### Transcript Download Not Working

**Problem:** Download button doesn't work

**Solutions:**
1. Ensure altText is provided:
   ```typescript
   altText: 'Video transcript text...'
   ```

2. Check browser allows downloads

3. Verify download link is generated correctly

### Video Quality Issues

**Problem:** Video appears pixelated or choppy

**Solutions:**
1. Use appropriate resolution (720p recommended)

2. Optimize video compression:
   ```bash
   # Use ffmpeg or similar tool
   ffmpeg -i input.mp4 -vcodec h264 -acodec aac output.mp4
   ```

3. Consider adaptive streaming for longer videos

### Auto-focus Not Working

**Problem:** Video doesn't auto-focus on mount

**Solutions:**
1. Enable in config:
   ```typescript
   config.settings.widgetSettings.enableAutoFocus = true
   ```

2. Ensure chat history element exists:
   ```html
   <div id="webchatChatHistoryWrapperLiveLogPanel">
     <!-- Chat content -->
   </div>
   ```

## Related Components

- [ImageMessage](./image-message.md) - Display images
- [AudioMessage](./audio-message.md) - Audio playback
- [Message](./message.md) - Main message router

## Related Composables

- [useMessageContext](../composables/use-message-context.md) - Access message context

## Implementation Notes

- Direct videos use native HTML5 `<video>` element
- YouTube videos use YouTube embed iframe
- Vimeo videos use Vimeo embed iframe
- Light mode only for direct videos
- Captions only for direct videos
- 16:9 aspect ratio enforced
- CORS required for captions from different origin

## Testing

The component has comprehensive test coverage:

- ✅ Direct video URL rendering
- ✅ Missing URL handling
- ✅ Light mode overlay display
- ✅ Light overlay removal after play
- ✅ Play on overlay click
- ✅ Play on Enter/Space key
- ✅ Captions track inclusion
- ✅ Crossorigin attribute
- ✅ YouTube iframe rendering
- ✅ YouTube URL parsing (full and short)
- ✅ Vimeo iframe rendering
- ✅ Vimeo URL parsing
- ✅ No light mode for YouTube/Vimeo
- ✅ Download transcript button
- ✅ Transcript download functionality
- ✅ Proper styling with/without transcript
- ✅ Accessibility labels
- ✅ Custom translations
- ✅ Video controls
- ✅ Play/pause events

See `test/VideoMessage.spec.ts` for full test suite (32/32 tests passing).

## Security

### URL Validation

Video URLs are not sanitized by default. Ensure:
- URLs come from trusted sources
- Use HTTPS when possible
- Validate URLs on backend

### XSS Prevention

AltText (transcript) is treated as plain text:
```vue
<!-- Safe: Not rendered as HTML -->
<a :href="`data:text/plain;...${encodeURIComponent(altText)}`" />
```

### CORS

For captions from different origin:
```
Access-Control-Allow-Origin: *
```

### iframe Security

YouTube and Vimeo iframes use standard security attributes:
- `frameborder="0"`
- Sandboxed with specific permissions
- Only allows necessary features

## Performance

### Video Loading

- Videos load asynchronously
- No preload (saves bandwidth)
- Platform players handle buffering

### Light Mode

- Minimal overhead
- Only for direct videos
- Removed after play starts

### Memory

- Component properly unmounts
- Event listeners cleaned up
- No memory leaks

## Browser Support

- Modern browsers (ES6+)
- HTML5 video support required for direct URLs
- iframe support for YouTube/Vimeo
- No IE11 support

### Video Format Support

| Format | Chrome | Firefox | Safari | Edge |
|--------|--------|---------|--------|------|
| MP4 (H.264) | ✅ | ✅ | ✅ | ✅ |
| WebM | ✅ | ✅ | ⚠️ | ✅ |
| Ogg | ✅ | ✅ | ❌ | ⚠️ |

**Recommendation:** Use MP4 with H.264 codec for best compatibility.
