# ActionButton Component

Individual button component for rendering postback buttons, web URLs, phone numbers, and xApp triggers. Used by ActionButtons container or can be used standalone.

## Import

```typescript
import { ActionButton } from '@cognigy/chat-components-vue'
import type { IWebchatButton } from '@cognigy/chat-components-vue'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `button` | `IWebchatButton` \| `IWebchatQuickReply` | **Required** | Button definition |
| `action` | `MessageSender` | `undefined` | Callback for button actions |
| `disabled` | `boolean` | `false` | Whether button is disabled |
| `total` | `number` | **Required** | Total number of buttons (for ARIA) |
| `position` | `number` | **Required** | Button position in group (for ARIA) |
| `customIcon` | `any` | `undefined` | Custom icon component |
| `showUrlIcon` | `boolean` | `false` | Show link icon on URL buttons |
| `config` | `ChatConfig` | `undefined` | Chat configuration |
| `dataMessageId` | `string` | `undefined` | Message ID for focus management |
| `onEmitAnalytics` | `function` | `undefined` | Analytics callback |
| `size` | `'small'` \| `'large'` | `'small'` | Button text size |
| `id` | `string` | `undefined` | Button ID |
| `className` | `string` | `''` | Additional CSS classes |
| `openXAppOverlay` | `function` | `undefined` | Callback for xApp overlay |

## Button Types

ActionButton supports 4 button types:

### 1. Postback Button (`<button>`)

```typescript
const button: IWebchatButton = {
  type: 'postback',
  title: 'Get Started',
  payload: 'get_started',
}
```

- Renders as `<button>` element
- Calls `action(payload, null, { label: title })`
- Sends payload to backend

### 2. Web URL Button (`<a>`)

```typescript
const button: IWebchatButton = {
  type: 'web_url',
  title: 'Visit Site',
  url: 'https://example.com',
  target: '_blank',  // or '_self'
}
```

- Renders as `<a>` element
- Opens URL in new or same tab
- URL is sanitized for security

### 3. Phone Number Button (`<a>`)

```typescript
const button: IWebchatButton = {
  type: 'phone_number',
  title: 'Call Us',  // Optional, defaults to "Call"
  payload: '+1-800-555-0123',
}
```

- Renders as `<a href="tel:...">`
- Opens phone dialer
- If no title, displays "Call"

### 4. XApp Button (`<button>`)

```typescript
const button: IWebchatButton = {
  type: 'openXApp',
  title: 'Open Form',
  payload: 'https://xapp.example.com/form',
}
```

- Calls `openXAppOverlay(payload)`
- Cognigy-specific xApp integration

## Usage

### Standalone Button

```vue
<template>
  <ActionButton
    :button="button"
    :action="handleAction"
    :position="1"
    :total="1"
  />
</template>

<script setup lang="ts">
import { ActionButton } from '@cognigy/chat-components-vue'
import type { IWebchatButton, MessageSender } from '@cognigy/chat-components-vue'

const button: IWebchatButton = {
  type: 'postback',
  title: 'Click Me',
  payload: 'button_clicked',
}

const handleAction: MessageSender = (text, data, options) => {
  console.log('Button clicked:', options?.label)
  // Send to backend
}
</script>
```

### In Button Group (via ActionButtons)

```vue
<template>
  <!-- ActionButtons handles individual ActionButton rendering -->
  <ActionButtons
    :payload="buttons"
    :action="handleAction"
  />
</template>
```

### With Button Image

```vue
<template>
  <ActionButton
    :button="button"
    :action="handleAction"
    :position="1"
    :total="1"
    size="large"
  />
</template>

<script setup lang="ts">
const button: IWebchatButton = {
  type: 'postback',
  title: 'Premium Plan',
  payload: 'select_premium',
  image_url: 'https://example.com/premium-icon.png',
  image_alt_text: 'Premium plan icon',
}
</script>
```

### With Analytics

```vue
<template>
  <ActionButton
    :button="button"
    :action="handleAction"
    :on-emit-analytics="trackClick"
    :position="1"
    :total="1"
  />
</template>

<script setup lang="ts">
const trackClick = (event: string, button: IWebchatButton) => {
  console.log('Analytics:', event, button.title)
  // Send to analytics service
}
</script>
```

## Features

- ✅ Dynamic rendering (`<button>` vs `<a>`)
- ✅ URL sanitization (@braintree/sanitize-url)
- ✅ Button images with alt text
- ✅ Accessibility (ARIA labels, position info)
- ✅ Keyboard navigation support
- ✅ Small/large size variants (Typography)
- ✅ Link icon for URLs (optional)
- ✅ Focus management after actions
- ✅ Disabled state support
- ✅ Analytics callback

## CSS Variables

```css
:root {
  --cc-primary-color: #1976d2;             /* Button background */
  --cc-primary-contrast-color: #ffffff;    /* Button text */
  --cc-primary-color-hover: #1565c0;       /* Hover state */
  --cc-primary-color-focus: #1976d2;       /* Focus outline */
  --cc-primary-color-disabled: #cccccc;    /* Disabled state */
}
```

## Accessibility

### ARIA Labels

For buttons in a group (total > 1):
```
aria-label="1 of 3: Button Title"
aria-label="2 of 3: Button Title"
```

For external links:
```
aria-label="Visit Site. Opens in new tab"
```

### Keyboard Support

- `Tab` / `Shift+Tab`: Navigate between buttons
- `Enter` / `Space`: Activate button
- Disabled buttons: `tabindex="-1"`

### Screen Reader Support

- Button position announced
- External link indicators
- Disabled state announced
- Phone number type clear

## Button Labels

### Default Labels

- Postback: Uses `button.title`
- Web URL: Uses `button.title`
- Phone: Uses `button.title` or "Call" if empty
- XApp: Uses `button.title`

### Label Sanitization

Button labels support HTML (sanitized):

```typescript
const button: IWebchatButton = {
  type: 'postback',
  title: '<b>Bold</b> Label',
  payload: 'test',
}
// Rendered: Bold Label (with HTML)
```

## Configuration

### Auto-focus

Handled by ActionButtons container, not individual buttons.

### Focus After Action

```typescript
const config: ChatConfig = {
  settings: {
    behavior: {
      focusInputAfterPostback: true,  // Focus input after button click
    },
  },
}
```

### URL Sanitization

```typescript
const config: ChatConfig = {
  settings: {
    layout: {
      disableUrlButtonSanitization: true,  // Not recommended
    },
  },
}
```

## Common Patterns

### Pattern: Disabled State

```vue
<template>
  <ActionButton
    :button="button"
    :action="undefined"  <!-- No action handler -->
    :disabled="true"
    :position="1"
    :total="1"
  />
</template>
```

### Pattern: Button with Icon

```vue
<template>
  <ActionButton
    :button="button"
    :action="handleAction"
    :show-url-icon="true"  <!-- Show link icon for URLs -->
    :position="1"
    :total="1"
  />
</template>

<script setup lang="ts">
const button: IWebchatButton = {
  type: 'web_url',
  title: 'Documentation',
  url: 'https://docs.example.com',
  target: '_blank',
}
</script>
```

### Pattern: Large Button

```vue
<template>
  <ActionButton
    :button="button"
    :action="handleAction"
    size="large"  <!-- Uses title1-semibold instead of cta-semibold -->
    :position="1"
    :total="1"
  />
</template>
```

### Pattern: Custom Focus Management

```vue
<template>
  <ActionButton
    :button="button"
    :action="handleAction"
    :data-message-id="messageId"
    :position="1"
    :total="1"
  />
</template>

<script setup lang="ts">
// After action, focus moves to message focus target
const messageId = 'msg-123'
</script>
```

## Security

### URL Sanitization

Dangerous URLs are blocked:

```typescript
// ❌ Blocked
'javascript:alert(1)'
'data:text/html,<script>...'

// ✅ Allowed
'https://example.com'
'http://example.com'
'tel:+1234567890'
'mailto:user@example.com'
```

### HTML Sanitization

Button labels are sanitized to prevent XSS:

```typescript
const button: IWebchatButton = {
  title: '<script>alert("xss")</script>Safe',  // Script removed
}
```

## Best Practices

### ✅ Do

1. **Provide clear button labels**
   ```typescript
   { title: 'Get Started', payload: 'start' }
   ```

2. **Use appropriate types**
   ```typescript
   { type: 'web_url', url: 'https://...' }  // For external links
   { type: 'postback', payload: '...' }      // For actions
   ```

3. **Include ARIA info**
   ```typescript
   <ActionButton :position="1" :total="3" ... />
   ```

### ❌ Don't

1. **Don't skip position/total**
   ```typescript
   // ❌ Bad
   <ActionButton :button="btn" :action="action" />

   // ✅ Good
   <ActionButton :button="btn" :action="action" :position="1" :total="1" />
   ```

2. **Don't use without action handler**
   ```typescript
   // ❌ Button will be disabled
   <ActionButton :button="btn" />

   // ✅ Provide action
   <ActionButton :button="btn" :action="handleAction" />
   ```

## Troubleshooting

### Button Not Clickable

**Problem:** Button appears but doesn't respond

**Solutions:**
1. Provide `action` prop for postback buttons
2. Check button is not `disabled`
3. Verify `payload` is defined for postback buttons

### URL Not Opening

**Problem:** Web URL button doesn't open link

**Solutions:**
1. Check URL has protocol: `https://example.com` not `example.com`
2. Verify URL isn't blocked by sanitization
3. Check `url` property is set for `web_url` type

### Icon Not Showing

**Problem:** Link icon doesn't appear

**Solutions:**
1. Set `show-url-icon="true"`
2. Verify button type is `web_url`
3. Check LinkIcon component is available

## Related Components

- [ActionButtons](./action-buttons.md) - Container for multiple ActionButtons
- [Typography](./typography.md) - Used for button label text

## Implementation Notes

- Uses `<component :is>` for dynamic rendering
- URL sanitization with `@braintree/sanitize-url`
- Typography variant: `cta-semibold` (small) or `title1-semibold` (large)
- Button images: 40px width, positioned absolutely left
- Focus management with `moveFocusToMessageFocusTarget()`

## Testing

Comprehensive tests in ActionButtons.spec.ts cover:

- ✅ Renders as button for postback
- ✅ Renders as anchor for web_url
- ✅ Renders as anchor for phone_number
- ✅ Displays button title
- ✅ Applies disabled state
- ✅ Calls action on click
- ✅ Does not call action when disabled
- ✅ Position in aria-label
- ✅ "Call" label for phone without title
- ✅ Renders button images
- ✅ Typography variant by size
- ✅ Shows LinkIcon for URLs
- ✅ Sets tabindex when disabled

See `test/ActionButtons.spec.ts` for full test suite.
