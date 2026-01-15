# useSanitize Composable

Provides HTML sanitization functionality using message context configuration.

## Import

```typescript
import { useSanitize } from '@cognigy/chat-components-vue'
```

## Returns

```typescript
{
  processHTML: (text: string) => string,
  isSanitizeEnabled: ComputedRef<boolean>
}
```

## Usage

### In a Component

```vue
<script setup lang="ts">
import { useSanitize } from '@cognigy/chat-components-vue'
import { useMessageContext } from '@cognigy/chat-components-vue'

const { processHTML, isSanitizeEnabled } = useSanitize()
const { message } = useMessageContext()

// Process HTML content
const cleanHTML = processHTML(message.text || '')
</script>

<template>
  <div v-html="cleanHTML" />
</template>
```

### With Custom Logic

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useSanitize } from '@cognigy/chat-components-vue'
import { useMessageContext } from '@cognigy/chat-components-vue'

const { processHTML, isSanitizeEnabled } = useSanitize()
const { message } = useMessageContext()

// Conditionally sanitize based on source
const content = computed(() => {
  const text = message.text || ''

  if (message.source === 'user' && !isSanitizeEnabled.value) {
    return text  // Skip sanitization for user messages
  }

  return processHTML(text)
})
</script>
```

## API

### processHTML(text: string): string

Processes HTML text through DOMPurify sanitization.

**Parameters:**
- `text`: String containing HTML content

**Returns:**
- Sanitized HTML string

**Behavior:**
- If sanitization is disabled in config: returns text unchanged
- If enabled: processes through `sanitizeHTMLWithConfig()`

**Example:**

```typescript
const { processHTML } = useSanitize()

// Safe HTML
const result1 = processHTML('<b>Bold</b> text')
// Result: '<b>Bold</b> text'

// Dangerous HTML
const result2 = processHTML('<script>alert("xss")</script>Hello')
// Result: 'Hello' (script tag removed)
```

### isSanitizeEnabled: ComputedRef<boolean>

Reactive boolean indicating if sanitization is enabled.

**Returns:**
- `true` if sanitization is enabled (default)
- `false` if `config.settings.layout.disableHtmlContentSanitization` is true

**Example:**

```vue
<script setup lang="ts">
const { isSanitizeEnabled } = useSanitize()
</script>

<template>
  <div v-if="isSanitizeEnabled">
    HTML is being sanitized
  </div>
</template>
```

## Configuration

### Disable Sanitization

```typescript
const config: ChatConfig = {
  settings: {
    layout: {
      disableHtmlContentSanitization: true,
    },
  },
}
```

**Warning:** Disabling sanitization can expose users to XSS attacks. Only disable if you completely trust the content source.

### Custom Allowed Tags

```typescript
const config: ChatConfig = {
  settings: {
    widgetSettings: {
      customAllowedHtmlTags: ['b', 'i', 'p', 'br', 'a'],
    },
  },
}
```

This restricts HTML to only the specified tags.

## Sanitization Rules

### Allowed by Default

**Text formatting:**
- `<b>`, `<strong>`, `<i>`, `<em>`, `<u>`, `<s>`, `<mark>`
- `<p>`, `<span>`, `<div>`, `<br>`

**Structure:**
- `<h1>` through `<h6>`
- `<ul>`, `<ol>`, `<li>`
- `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`

**Media:**
- `<img>` (with safe src)
- `<a>` (with safe href)
- `<video>`, `<audio>`
- `<svg>` and children

**And many more...**

See `src/utils/sanitize.ts` for complete list.

### Blocked by Default

**Scripts:**
- `<script>` tags
- JavaScript event handlers (`onclick`, `onerror`, etc.)
- `javascript:` URLs

**Dangerous protocols:**
- `data:` URLs (in certain contexts)
- `vbscript:`, `file:`, etc.

**Potentially dangerous:**
- `<iframe>` without proper sandbox
- `<object>`, `<embed>` (can be allowed via config)

## Security

### XSS Prevention

useSanitize prevents Cross-Site Scripting attacks:

```typescript
// ❌ Attack attempt
const malicious = '<img src="x" onerror="alert(\'xss\')" />'
const safe = processHTML(malicious)
// Result: '<img src="x">' (onerror removed)

// ❌ Script injection
const script = '<script>alert("xss")</script>Hello'
const safe = processHTML(script)
// Result: 'Hello' (script removed)
```

### HTML Entity Handling

```typescript
// Escaped HTML
const escaped = '&lt;b&gt;Not bold&lt;/b&gt;'
const result = processHTML(escaped)
// Result: '&lt;b&gt;Not bold&lt;/b&gt;' (entities preserved)
```

### URL Sanitization

```typescript
// Dangerous URLs removed
const dangerous = '<a href="javascript:alert(1)">Click</a>'
const safe = processHTML(dangerous)
// Result: '<a>Click</a>' (href removed)
```

## Common Patterns

### Pattern: Conditional Sanitization

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useSanitize } from '@cognigy/chat-components-vue'
import { useMessageContext } from '@cognigy/chat-components-vue'

const { processHTML } = useSanitize()
const { message, config } = useMessageContext()

const content = computed(() => {
  const text = message.text || ''

  // Skip sanitization for user input if configured
  if (
    message.source === 'user' &&
    config?.settings?.widgetSettings?.disableTextInputSanitization
  ) {
    return text
  }

  return processHTML(text)
})
</script>
```

### Pattern: Sanitize Before Rendering

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSanitize } from '@cognigy/chat-components-vue'

const { processHTML } = useSanitize()
const rawHTML = ref('<div><script>alert("xss")</script>Safe content</div>')
const cleanHTML = ref('')

onMounted(() => {
  cleanHTML.value = processHTML(rawHTML.value)
})
</script>

<template>
  <div v-html="cleanHTML" />
</template>
```

### Pattern: Custom Sanitization Logic

```vue
<script setup lang="ts">
import { useSanitize } from '@cognigy/chat-components-vue'

const { processHTML, isSanitizeEnabled } = useSanitize()

function sanitizeUserInput(input: string): string {
  // Always sanitize user input, even if globally disabled
  if (!isSanitizeEnabled.value) {
    // Manually call sanitize function
    return sanitizeHTMLWithConfig(input, undefined)
  }

  return processHTML(input)
}
</script>
```

## Best Practices

### ✅ Do

1. **Always sanitize untrusted content**
   ```typescript
   const clean = processHTML(untrustedHTML)
   ```

2. **Use for user-generated content**
   ```typescript
   if (message.source === 'user') {
     content = processHTML(message.text)
   }
   ```

3. **Check sanitization status**
   ```typescript
   if (!isSanitizeEnabled.value) {
     console.warn('Sanitization is disabled!')
   }
   ```

4. **Trust the defaults**
   - Default allowed tags are carefully chosen for safety

### ❌ Don't

1. **Don't disable sanitization without good reason**
   ```typescript
   // ❌ Dangerous
   disableHtmlContentSanitization: true
   ```

2. **Don't assume all HTML is safe**
   ```typescript
   // ❌ Don't skip sanitization for "trusted" sources
   if (message.source === 'bot') {
     return message.text  // Still sanitize!
   }
   ```

3. **Don't manually manipulate DOM**
   ```typescript
   // ❌ Bypass sanitization
   element.innerHTML = untrustedHTML

   // ✅ Use v-html with sanitized content
   <div v-html="processHTML(content)" />
   ```

## Troubleshooting

### Content Being Stripped

**Problem:** Valid HTML tags are being removed

**Solutions:**

1. **Add tags to allowed list:**
   ```typescript
   customAllowedHtmlTags: ['existing', 'newtag']
   ```

2. **Check tag is in default list:**
   - See `src/utils/sanitize.ts` for allowed tags

3. **Verify attributes are safe:**
   - Dangerous attributes are always removed

### Sanitization Not Working

**Problem:** Dangerous content passes through

**Solutions:**

1. **Check sanitization is enabled:**
   ```typescript
   if (!isSanitizeEnabled.value) {
     console.warn('Sanitization disabled!')
   }
   ```

2. **Verify config structure:**
   ```typescript
   config.settings.layout.disableHtmlContentSanitization = false
   ```

3. **Ensure using processHTML:**
   ```typescript
   const clean = processHTML(text)  // Not just `text`
   ```

### Custom Tags Not Working

**Problem:** Custom allowed tags still being removed

**Solution:** Ensure tags are in the config array:

```typescript
const config: ChatConfig = {
  settings: {
    widgetSettings: {
      customAllowedHtmlTags: ['b', 'i', 'custom-tag'],  // Add your tag
    },
  },
}
```

**Note:** `customAllowedHtmlTags` replaces the default list, so include all needed tags.

## Related

- [sanitizeHTMLWithConfig](../utils/sanitize.md) - Underlying sanitization function
- [TextMessage](../components/text-message.md) - Uses useSanitize for content
- [useMessageContext](./use-message-context.md) - Provides config to useSanitize

## Implementation Notes

- Uses DOMPurify for sanitization
- Config read from message context
- Reactive to config changes
- Memoized sanitization status
- No side effects

## Testing

The composable has comprehensive test coverage:

- ✅ Sanitizes HTML by default
- ✅ Removes script tags
- ✅ Removes dangerous attributes
- ✅ Allows safe HTML tags
- ✅ Disables sanitization when configured
- ✅ isSanitizeEnabled reflects config
- ✅ Respects custom allowed HTML tags
- ✅ Handles empty strings
- ✅ Handles plain text
- ✅ Escapes HTML entities
- ✅ Handles malformed HTML
- ✅ Removes javascript: URLs
- ✅ Allows data attributes
- ✅ Handles nested HTML
- ✅ Removes style tags
- ✅ Handles SVG safely
- ✅ Handles orphan closing tags
- ✅ Preserves safe attributes

See `test/useSanitize.spec.ts` for full test suite (19/19 tests passing).
