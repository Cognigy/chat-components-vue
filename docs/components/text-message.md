# TextMessage Component

Renders text messages with HTML sanitization, URL auto-linking, and optional Markdown support.

## Import

```typescript
import { TextMessage } from '@cognigy/chat-components-vue'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` \| `string[]` | `undefined` | Override message text content |
| `className` | `string` | `''` | Additional CSS classes for text element |
| `markdownClassName` | `string` | `''` | Additional CSS classes for markdown container |
| `id` | `string` | `undefined` | Element ID |
| `ignoreLiveRegion` | `boolean` | `false` | Skip live region announcements (accessibility) |

## Features

- ✅ HTML sanitization with DOMPurify
- ✅ Automatic URL→link conversion
- ✅ Markdown rendering (bot messages only)
- ✅ GFM tables support
- ✅ User input sanitization toggle
- ✅ Configurable allowed HTML tags
- ✅ ChatBubble wrapper with source-based styling

## Usage

### Basic Text Message

```vue
<template>
  <div class="chat">
    <MessageProvider :message="message" :config="config">
      <TextMessage />
    </MessageProvider>
  </div>
</template>

<script setup lang="ts">
import { TextMessage } from '@cognigy/chat-components-vue'
import { provideMessageContext } from '@cognigy/chat-components-vue'
import type { IMessage } from '@cognigy/chat-components-vue'

const message: IMessage = {
  text: 'Hello! How can I help you today?',
  source: 'bot',
  timestamp: Date.now().toString(),
}
</script>
```

### With Markdown Enabled

```vue
<template>
  <MessageProvider :message="message" :config="config">
    <TextMessage />
  </MessageProvider>
</template>

<script setup lang="ts">
const message: IMessage = {
  text: '# Welcome!\n\n**Bold** text and *italic* text.\n\n- List item 1\n- List item 2',
  source: 'bot',
  timestamp: Date.now().toString(),
}

const config: ChatConfig = {
  settings: {
    behavior: {
      renderMarkdown: true,
    },
  },
}
</script>
```

### With Auto URL Linking

```vue
<template>
  <MessageProvider :message="message" :config="config">
    <TextMessage />
  </MessageProvider>
</template>

<script setup lang="ts">
const message: IMessage = {
  text: 'Visit https://example.com for more information',
  source: 'bot',
  timestamp: Date.now().toString(),
}

// URLs are automatically converted to links by default
</script>
```

### Disable URL Linking

```vue
<template>
  <MessageProvider :message="message" :config="config">
    <TextMessage />
  </MessageProvider>
</template>

<script setup lang="ts">
const config: ChatConfig = {
  settings: {
    widgetSettings: {
      disableRenderURLsAsLinks: true,
    },
  },
}
</script>
```

### With Custom Content

```vue
<template>
  <MessageProvider :message="message" :config="config">
    <TextMessage content="Override message text" />
  </MessageProvider>
</template>
```

### With HTML Content

```vue
<template>
  <MessageProvider :message="message" :config="config">
    <TextMessage />
  </MessageProvider>
</template>

<script setup lang="ts">
const message: IMessage = {
  text: '<p>Paragraph with <b>bold</b> and <i>italic</i> text</p>',
  source: 'bot',
  timestamp: Date.now().toString(),
}

// HTML is sanitized by default to prevent XSS
</script>
```

## Configuration

### Markdown Rendering

```typescript
const config: ChatConfig = {
  settings: {
    behavior: {
      renderMarkdown: true,  // Enable markdown for bot messages
    },
  },
}
```

**Note:** Markdown is only rendered for `bot` and `engagement` source messages, never for `user` messages.

### HTML Sanitization

```typescript
// Disable sanitization (not recommended)
const config: ChatConfig = {
  settings: {
    layout: {
      disableHtmlContentSanitization: true,
    },
  },
}

// Custom allowed HTML tags
const config: ChatConfig = {
  settings: {
    widgetSettings: {
      customAllowedHtmlTags: ['b', 'i', 'p', 'br', 'a'],
    },
  },
}
```

### User Input Sanitization

```typescript
const config: ChatConfig = {
  settings: {
    widgetSettings: {
      disableTextInputSanitization: true,  // Disable sanitization for user messages
    },
  },
}
```

## CSS Variables

TextMessage uses ChatBubble which supports these CSS variables:

```css
:root {
  /* Bot messages */
  --cc-background-bot-message: #ffffff;
  --cc-bot-message-contrast-color: #000000;
  --cc-border-bot-message: #e0e0e0;

  /* User messages */
  --cc-background-user-message: #1976d2;
  --cc-user-message-contrast-color: #ffffff;
  --cc-border-user-message: #1976d2;

  /* Agent messages */
  --cc-background-agent-message: #f5f5f5;
  --cc-agent-message-contrast-color: #000000;
  --cc-border-agent-message: #cccccc;

  /* Markdown tables */
  --cc-black-80: rgba(0, 0, 0, 0.8);
  --cc-black-90: rgba(0, 0, 0, 0.9);

  /* Links */
  --cc-primary-color-focus: #1976d2;
}
```

## Markdown Support

When `renderMarkdown` is enabled, the following markdown features are supported:

### Headings

```markdown
# H1 Heading
## H2 Heading
### H3 Heading
```

### Text Formatting

```markdown
**Bold text**
*Italic text*
~~Strikethrough~~
`Inline code`
```

### Lists

```markdown
- Unordered item
- Another item

1. Ordered item
2. Another item
```

### Links

```markdown
[Link text](https://example.com)
```

All markdown links automatically open in a new tab with `target="_blank"`.

### Tables

```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
```

### Code Blocks

````markdown
```javascript
function hello() {
  console.log('Hello!');
}
```
````

### Inline HTML

Markdown can include HTML tags (subject to sanitization):

```markdown
Regular text with <b>bold HTML</b> and **bold markdown**.
```

## Security

### XSS Prevention

TextMessage automatically sanitizes HTML to prevent XSS attacks:

```typescript
// Dangerous content
const message: IMessage = {
  text: '<script>alert("xss")</script>Hello',
  source: 'bot',
}

// Output: "Hello" (script tag removed)
```

### URL Sanitization

Dangerous URL protocols are blocked:

```typescript
// Blocked URLs
'javascript:alert(1)'
'data:text/html,<script>alert(1)</script>'

// Allowed URLs
'https://example.com'
'http://example.com'
'mailto:user@example.com'
```

### Safe HTML Tags

By default, these HTML tags are allowed:
- Text: `p`, `span`, `div`, `br`
- Formatting: `b`, `strong`, `i`, `em`, `u`, `s`, `mark`
- Links: `a` (with safe hrefs)
- Lists: `ul`, `ol`, `li`
- Tables: `table`, `thead`, `tbody`, `tr`, `th`, `td`
- Media: `img` (with safe src)
- And many more...

## Accessibility

### Text Rendering

- Uses semantic HTML (`<p>` tags)
- Preserves whitespace with `pre-wrap`
- Supports word breaking for long words

### Links

- All links have `target="_blank"` for external sites
- Focus visible with 2px outline
- Keyboard navigable

### Markdown

- Heading hierarchy preserved
- Semantic HTML structure
- Table headers use `<th>` elements

## Best Practices

### ✅ Do

1. **Use markdown for rich bot messages**
   ```typescript
   const message: IMessage = {
     text: '**Welcome!** Check our [docs](https://docs.example.com)',
     source: 'bot',
   }
   ```

2. **Sanitize user input**
   ```typescript
   // Keep sanitization enabled for user messages (default)
   const config: ChatConfig = {
     settings: {
       widgetSettings: {
         disableTextInputSanitization: false,  // Default
       },
     },
   }
   ```

3. **Use simple HTML for formatting**
   ```typescript
   const text = '<p>Simple paragraph with <b>bold</b> text</p>'
   ```

### ❌ Don't

1. **Don't disable sanitization without good reason**
   ```typescript
   // ❌ Dangerous
   disableHtmlContentSanitization: true
   ```

2. **Don't use markdown for user messages**
   ```typescript
   // ❌ Markdown won't render for user messages anyway
   const message: IMessage = {
     text: '**This won't be bold**',
     source: 'user',  // Markdown ignored
   }
   ```

3. **Don't embed scripts or dangerous content**
   ```typescript
   // ❌ Will be removed by sanitizer
   const text = '<script>alert("xss")</script>'
   ```

## Common Patterns

### Pattern: Multi-line Messages

```vue
<script setup lang="ts">
const message: IMessage = {
  text: 'Line 1\nLine 2\nLine 3',
  source: 'bot',
  timestamp: Date.now().toString(),
}
</script>
```

### Pattern: Rich Formatted Response

```vue
<script setup lang="ts">
const message: IMessage = {
  text: `
# Welcome to Support

**We're here to help!**

Please choose an option:
- Account issues
- Technical support
- Billing questions

Visit our [Help Center](https://help.example.com) for more.
  `.trim(),
  source: 'bot',
  timestamp: Date.now().toString(),
}

const config: ChatConfig = {
  settings: {
    behavior: {
      renderMarkdown: true,
    },
  },
}
</script>
```

### Pattern: Mixed HTML and Text

```vue
<script setup lang="ts">
const message: IMessage = {
  text: 'Your order <b>#12345</b> has been shipped! Track it at https://track.example.com/12345',
  source: 'bot',
  timestamp: Date.now().toString(),
}
</script>
```

## Troubleshooting

### Markdown Not Rendering

**Problem:** Markdown appears as plain text

**Solutions:**
1. Enable markdown in config:
   ```typescript
   config.settings.behavior.renderMarkdown = true
   ```

2. Check message source is `bot` or `engagement`:
   ```typescript
   message.source = 'bot'  // Markdown only for bot messages
   ```

### HTML Being Stripped

**Problem:** HTML tags are removed

**Causes:**
- Tag not in allowed list
- Dangerous attributes present
- Malformed HTML

**Solutions:**
1. Add to allowed tags:
   ```typescript
   customAllowedHtmlTags: ['existing', 'newtag']
   ```

2. Use markdown instead:
   ```typescript
   text: '**Bold** instead of <b>Bold</b>'
   ```

### URLs Not Clickable

**Problem:** URLs appear as plain text

**Solutions:**
1. Check URL linking is enabled:
   ```typescript
   config.settings.widgetSettings.disableRenderURLsAsLinks = false
   ```

2. Ensure URLs have protocol:
   ```typescript
   'https://example.com'  // ✅ Works
   'example.com'          // ❌ Doesn't match
   ```

### Line Breaks Not Working

**Problem:** \n not creating new lines

**Solution:** Use `white-space: pre-wrap` CSS (default) or use markdown:
```typescript
text: 'Line 1\n\nLine 2'  // \n\n creates paragraph break in markdown
```

## Related Components

- [ChatBubble](./chat-bubble.md) - Wrapper component used internally
- [Message](./message.md) - Main message router
- [TextWithButtons](../data-structures/text-with-buttons.md) - Text with action buttons

## Related Composables

- [useSanitize](../composables/use-sanitize.md) - HTML sanitization composable
- [useMessageContext](../composables/use-message-context.md) - Access message context

## Implementation Notes

- Uses `markdown-it` for markdown rendering
- Uses DOMPurify for HTML sanitization
- Automatically adds `target="_blank"` to links
- Preserves line breaks with `pre-wrap`
- Tables styled with rounded corners and borders

## Testing

The component has comprehensive test coverage:

- ✅ Basic text rendering
- ✅ HTML sanitization (XSS prevention)
- ✅ URL auto-linking
- ✅ Markdown rendering
- ✅ User vs bot message handling
- ✅ Configuration options
- ✅ Custom content override
- ✅ Array content handling
- ✅ Empty/whitespace handling
- ✅ Special characters
- ✅ Nested HTML
- ✅ Markdown tables
- ✅ Markdown links

See `test/TextMessage.spec.ts` for full test suite (22/22 tests passing).
