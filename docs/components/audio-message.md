# AudioMessage Component

Displays audio files with custom playback controls, progress bar, and optional transcript download.

## Import

```typescript
import { AudioMessage } from '@cognigy/chat-components-vue'
```

## Props

AudioMessage uses the message context and doesn't accept direct props. It reads audio data from the message structure.

## Features

- ✅ Native HTML5 audio playback
- ✅ Custom playback controls (play/pause)
- ✅ Interactive progress bar with seek
- ✅ Time remaining display
- ✅ Download transcript functionality
- ✅ Keyboard accessible
- ✅ Custom translations support
- ✅ Accessible ARIA labels
- ✅ Touch-friendly controls

## Usage

### Basic Audio Message

```vue
<template>
  <div class="chat">
    <MessageProvider :message="message" :config="config">
      <AudioMessage />
    </MessageProvider>
  </div>
</template>

<script setup lang="ts">
import { AudioMessage } from '@cognigy/chat-components-vue'
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
            type: 'audio',
            payload: {
              url: 'https://example.com/audio.mp3',
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
            type: 'audio',
            payload: {
              url: 'https://example.com/audio.mp3',
              altText: 'This is the full transcript of the audio content...',
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
            type: 'audio',
            payload: {
              url: string,      // Required: Audio file URL
              altText?: string, // Optional: Transcript text for download
            }
          }
        }
      }
    }
  }
}
```

## Supported Audio Formats

The component uses native HTML5 audio, which supports:

| Format | Chrome | Firefox | Safari | Edge |
|--------|--------|---------|--------|------|
| MP3 | ✅ | ✅ | ✅ | ✅ |
| WAV | ✅ | ✅ | ✅ | ✅ |
| OGG | ✅ | ✅ | ⚠️ | ⚠️ |
| M4A | ✅ | ⚠️ | ✅ | ✅ |
| AAC | ✅ | ⚠️ | ✅ | ✅ |

**Recommendation:** Use MP3 for best browser compatibility.

## Configuration

### Custom Translations

```typescript
const config: ChatConfig = {
  settings: {
    customTranslations: {
      ariaLabels: {
        playAudio: 'Play audio',
        pauseAudio: 'Pause audio',
        audioPlaybackProgress: 'Audio playback progress',
        audioTimeRemaining: '{time} remaining',
        downloadTranscript: 'Download transcript',
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
      enableAutoFocus: true,  // Auto-focus audio player on mount
    },
  },
}
```

## Controls

### Play/Pause Button

- Click to toggle playback
- Shows play icon (▶) when paused
- Shows pause icon (⏸) when playing
- Keyboard accessible

### Progress Bar

- Interactive range slider
- Shows current playback position
- Drag to seek to specific time
- Visual progress indicator
- Touch-friendly

**Behavior:**
- Seeking pauses playback temporarily
- Playback resumes after seek completes
- Progress updates in real-time during playback

### Time Display

- Shows time remaining (not elapsed)
- Format: `mm:ss` for under 1 hour
- Format: `hh:mm:ss` for 1 hour or more
- Updates continuously during playback

### Download Transcript

- Appears only when `altText` is provided
- Downloads as `audio-transcript.txt`
- Plain text format
- Uses data URL for download

## Keyboard Navigation

- `Tab`: Navigate to controls
- `Space` or `Click`: Play/pause
- Arrow keys on progress bar: Seek (when focused)
- `Tab` + `Enter`: Download transcript (when button focused)

## CSS Variables

```css
:root {
  /* Colors */
  --cc-white: #ffffff;
  --cc-black-80: rgba(0, 0, 0, 0.8);
  --cc-primary-color-focus: #1976d2;
  --cc-primary-color-opacity-10: rgba(25, 118, 210, 0.1);
  --cc-primary-color-opacity-20: rgba(25, 118, 210, 0.2);

  /* Border radius */
  --cc-bubble-border-radius: 15px;
}
```

## Accessibility

### ARIA Labels

**Play/Pause Button:**
```html
<button aria-label="Play audio">▶</button>
<button aria-label="Pause audio">⏸</button>
```

**Progress Bar:**
```html
<input
  type="range"
  aria-label="Audio playback progress"
  aria-valuetext="2 minutes 5 seconds remaining"
/>
```

### Keyboard Support

- Full keyboard navigation
- Focus visible indicators
- Standard range input controls

### Screen Reader Support

- Play/pause state announced
- Time remaining announced
- Progress updates announced
- All controls labeled

## Best Practices

### ✅ Do

1. **Use appropriate audio format**
   ```typescript
   // For best compatibility, use MP3
   url: 'audio.mp3'
   ```

2. **Provide transcript for accessibility**
   ```typescript
   {
     url: 'audio.mp3',
     altText: 'Full transcript of audio content...'
   }
   ```

3. **Keep audio files reasonably sized**
   ```typescript
   // Optimize for web delivery
   // Recommended: 128kbps MP3
   ```

4. **Use descriptive transcripts**
   ```typescript
   altText: 'Speaker introduces topic, discusses key points, and concludes with call to action.'
   ```

### ❌ Don't

1. **Don't use very large audio files**
   ```typescript
   // ❌ Bad (50MB uncompressed WAV)
   url: 'huge-audio.wav'

   // ✅ Good (2MB compressed MP3)
   url: 'optimized-audio.mp3'
   ```

2. **Don't omit transcripts**
   ```typescript
   // ❌ Bad (no accessibility)
   { url: 'audio.mp3' }

   // ✅ Good (with transcript)
   { url: 'audio.mp3', altText: '...' }
   ```

3. **Don't use auto-play**
   ```typescript
   // Audio doesn't auto-play by default
   // This is intentional for better UX
   ```

## Common Patterns

### Pattern: Podcast Episode

```vue
<script setup lang="ts">
const podcastEpisode: IMessage = {
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _cognigy: {
      _webchat: {
        message: {
          attachment: {
            type: 'audio',
            payload: {
              url: 'https://cdn.example.com/podcast-ep-42.mp3',
              altText: `Episode 42: Getting Started with Vue

In this episode:
- Introduction to Vue 3 Composition API
- Best practices for component design
- Tips for state management

Hosted by: Jane Doe
Duration: 25 minutes`,
            },
          },
        },
      },
    },
  },
}
</script>
```

### Pattern: Voice Message

```vue
<script setup lang="ts">
const voiceMessage: IMessage = {
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _cognigy: {
      _webchat: {
        message: {
          attachment: {
            type: 'audio',
            payload: {
              url: 'https://example.com/voice-note-123.mp3',
              altText: 'Hi, this is John calling about your order. Please call me back at 555-0123.',
            },
          },
        },
      },
    },
  },
}
</script>
```

### Pattern: Audio Instructions

```vue
<script setup lang="ts">
const audioInstructions: IMessage = {
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _cognigy: {
      _webchat: {
        message: {
          attachment: {
            type: 'audio',
            payload: {
              url: 'https://example.com/instructions.mp3',
              altText: `Setup Instructions:
1. Connect the device to power
2. Press and hold the setup button for 3 seconds
3. Wait for the LED to turn blue
4. Follow the on-screen prompts`,
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

If audio URL is missing:
- Component renders nothing
- No error thrown
- Graceful degradation

### Invalid URL

If URL format is invalid:
- Audio element shows error
- User sees broken controls
- No component crash

### Network Errors

If audio fails to load:
- Browser shows error in console
- Controls remain visible but non-functional
- User can retry by refreshing

### Unsupported Format

If audio format not supported:
- Browser may show error
- Consider providing multiple formats

## Troubleshooting

### Audio Not Playing

**Problem:** Audio doesn't play when play button clicked

**Solutions:**
1. Check URL is accessible:
   ```typescript
   // Test URL in browser first
   url: 'https://example.com/audio.mp3'
   ```

2. Verify audio format is supported:
   ```typescript
   // Use MP3 for best compatibility
   url: 'audio.mp3' // Not 'audio.flac'
   ```

3. Check CORS headers if cross-origin

### Progress Bar Not Moving

**Problem:** Progress bar doesn't update during playback

**Solutions:**
1. Ensure audio has loaded:
   ```typescript
   // Audio must trigger 'loadedmetadata' event
   ```

2. Check audio duration is available

3. Verify no JavaScript errors

### Seek Not Working

**Problem:** Dragging progress bar doesn't seek

**Solutions:**
1. Ensure audio is loaded
2. Check duration is greater than 0
3. Verify `currentTime` property is writable

### Transcript Download Not Working

**Problem:** Download button doesn't work

**Solutions:**
1. Ensure altText is provided:
   ```typescript
   altText: 'Transcript text...'
   ```

2. Check browser allows downloads

3. Verify data URL is generated correctly

### Time Display Incorrect

**Problem:** Time remaining shows wrong value

**Solutions:**
1. Check audio duration is loaded correctly

2. Verify progress calculation:
   ```typescript
   // timeRemaining = duration * (1 - progress)
   ```

3. Ensure metadata loaded before calculating time

## Related Components

- [VideoMessage](./video-message.md) - Video playback
- [ImageMessage](./image-message.md) - Display images
- [Message](./message.md) - Main message router

## Related Composables

- [useMessageContext](../composables/use-message-context.md) - Access message context

## Implementation Notes

- Uses native HTML5 `<audio>` element (hidden)
- Custom UI controls for consistent styling
- Progress updates via `timeupdate` event
- Seek implemented via `currentTime` property
- Time calculated from `duration` and `progress`
- Download uses data URL technique

## Testing

The component has comprehensive test coverage:

- ✅ Audio element rendering
- ✅ Missing URL handling
- ✅ Play/pause toggle
- ✅ Play button click
- ✅ Pause button click
- ✅ Progress updates on timeupdate
- ✅ Progress reset on ended
- ✅ Progress bar rendering
- ✅ Seek functionality
- ✅ Pause on seek start
- ✅ Resume on seek end
- ✅ Time remaining display
- ✅ Time formatting (mm:ss)
- ✅ Time formatting with hours (hh:mm:ss)
- ✅ Download transcript button
- ✅ Transcript download functionality
- ✅ Accessibility labels
- ✅ Custom translations
- ✅ Audio element hidden
- ✅ Metadata loading

See `test/AudioMessage.spec.ts` for full test suite (30/30 tests passing).

## Security

### URL Validation

Audio URLs are not sanitized by default. Ensure:
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

For audio files from different origin:
```
Access-Control-Allow-Origin: *
```

## Performance

### Audio Loading

- Audio loads asynchronously
- No preload (saves bandwidth)
- Browser handles buffering

### Progress Updates

- Updates every ~100-250ms during playback
- Minimal performance impact
- Efficient event handling

### Memory

- Component properly unmounts
- Event listeners cleaned up
- No memory leaks

## Browser Support

- Modern browsers (ES6+)
- HTML5 audio support required
- Range input support required
- No IE11 support

### Audio Format Support

Use MP3 for widest compatibility. Consider providing multiple formats for better coverage:

```html
<audio>
  <source src="audio.mp3" type="audio/mpeg">
  <source src="audio.ogg" type="audio/ogg">
  Your browser does not support the audio element.
</audio>
```

## Advanced Customization

### Custom Progress Bar Styling

Override CSS variables for custom appearance:

```css
:root {
  --cc-primary-color-focus: #ff5722; /* Custom progress color */
  --cc-black-80: rgba(0, 0, 0, 0.6); /* Custom track color */
}
```

### Custom Time Format

The component formats time automatically, but you can customize the translation:

```typescript
config: {
  settings: {
    customTranslations: {
      ariaLabels: {
        audioTimeRemaining: 'Time left: {time}'
      }
    }
  }
}
```

## Known Limitations

1. **No playback speed control** - Use native browser controls if needed
2. **No volume control** - Users can use system/browser volume
3. **No playlist support** - Each audio message is independent
4. **No streaming** - Audio downloads fully (browser-dependent)
5. **No waveform visualization** - Only progress bar

These limitations keep the component simple and maintainable. For advanced audio features, consider a dedicated audio library.
