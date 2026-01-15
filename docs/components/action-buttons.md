# ActionButtons Component

Renders a group of interactive buttons for user actions including postback buttons, web URLs, phone numbers, and xApp triggers.

## Import

```typescript
import { ActionButtons, ActionButton } from '@cognigy/chat-components-vue'
import type { IWebchatButton, IWebchatQuickReply } from '@cognigy/chat-components-vue'
```

## Components

This module exports two components:

- `ActionButtons` - Container that renders multiple buttons
- `ActionButton` - Individual button component (can be used standalone)

## ActionButtons Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `payload` | `IWebchatButton[]` \| `IWebchatQuickReply[]` | **Required** | Array of button definitions |
| `action` | `MessageSender` | `undefined` | Callback for button actions |
| `className` | `string` | `''` | Additional CSS classes for container |
| `containerClassName` | `string` | `''` | Additional CSS classes for button container |
| `containerStyle` | `CSSProperties` | `undefined` | Inline styles for container |
| `buttonClassName` | `string` | `''` | CSS classes applied to all buttons |
| `buttonListItemClassName` | `string` | `''` | CSS classes for list items (when multiple) |
| `customIcon` | `any` | `undefined` | Custom icon component |
| `showUrlIcon` | `boolean` | `false` | Show arrow icon on URL buttons |
| `config` | `ChatConfig` | `undefined` | Chat configuration |
| `dataMessageId` | `string` | `undefined` | Message ID for focus management |
| `onEmitAnalytics` | `function` | `undefined` | Analytics callback |
| `size` | `'small'` \| `'large'` | `'small'` | Button size |
| `templateTextId` | `string` | `undefined` | ID for aria-labelledby |
| `openXAppOverlay` | `function` | `undefined` | Callback for xApp overlay |

## ActionButton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `button` | `IWebchatButton` \| `IWebchatQuickReply` | **Required** | Button definition |
| `action` | `MessageSender` | `undefined` | Callback for button actions |
| `disabled` | `boolean` | `false` | Whether button is disabled |
| `total` | `number` | **Required** | Total number of buttons (for ARIA) |
| `position` | `number` | **Required** | Button position (for ARIA) |
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

### Postback Button

Triggers an action callback with payload.

```typescript
{
  type: 'postback',
  title: 'Get Started',
  payload: 'get_started_payload'
}
```

### Web URL Button

Opens a URL in the same or new tab.

```typescript
{
  type: 'web_url',
  title: 'Visit Website',
  url: 'https://example.com',
  target: '_blank' // or '_self'
}
```

### Phone Number Button

Creates a phone call link.

```typescript
{
  type: 'phone_number',
  title: 'Call Us',
  payload: '+1234567890'
}
```

### XApp Button

Opens an xApp overlay (Cognigy-specific).

```typescript
{
  type: 'openXApp',
  title: 'Open App',
  payload: 'xapp_url'
}
```

## Usage

### Basic Usage

```vue
<template>
  <ActionButtons :payload="buttons" :action="handleAction" />
</template>

<script setup lang="ts">
import { ActionButtons } from '@cognigy/chat-components-vue'
import type { IWebchatButton, MessageSender } from '@cognigy/chat-components-vue'

const buttons: IWebchatButton[] = [
  {
    type: 'postback',
    title: 'Option 1',
    payload: 'option_1',
  },
  {
    type: 'postback',
    title: 'Option 2',
    payload: 'option_2',
  },
]

const handleAction: MessageSender = (text, data, options) => {
  console.log('Button clicked:', text, options?.label)
  // Send message to backend
}
</script>
```

### With URLs and Phone Numbers

```vue
<template>
  <ActionButtons :payload="buttons" :action="handleAction" show-url-icon />
</template>

<script setup lang="ts">
const buttons: IWebchatButton[] = [
  {
    type: 'web_url',
    title: 'Visit Our Site',
    url: 'https://example.com',
    target: '_blank',
  },
  {
    type: 'phone_number',
    title: 'Call Support',
    payload: '+1-800-555-0123',
  },
  {
    type: 'postback',
    title: 'Continue',
    payload: 'continue',
  },
]
</script>
```

### With Buttons featuring Images

```vue
<template>
  <ActionButtons :payload="buttons" :action="handleAction" size="large" />
</template>

<script setup lang="ts">
const buttons: IWebchatButton[] = [
  {
    type: 'postback',
    title: 'Premium Plan',
    payload: 'premium',
    image_url: 'https://example.com/premium-icon.png',
    image_alt_text: 'Premium plan icon',
  },
  {
    type: 'postback',
    title: 'Basic Plan',
    payload: 'basic',
    image_url: 'https://example.com/basic-icon.png',
    image_alt_text: 'Basic plan icon',
  },
]
</script>
```

### With Custom Styling

```vue
<template>
  <ActionButtons
    :payload="buttons"
    :action="handleAction"
    class-name="my-buttons-wrapper"
    button-class-name="my-custom-button"
    :container-style="{ maxWidth: '400px' }"
  />
</template>

<style>
.my-buttons-wrapper {
  padding: 20px;
  background: #f5f5f5;
}

.my-custom-button {
  border-radius: 8px;
  font-weight: bold;
}
</style>
```

### With Analytics

```vue
<template>
  <ActionButtons
    :payload="buttons"
    :action="handleAction"
    :on-emit-analytics="trackButtonClick"
  />
</template>

<script setup lang="ts">
const trackButtonClick = (event: string, button: IWebchatButton) => {
  console.log('Analytics:', event, button.title, button.payload)
  // Send to analytics service
}
</script>
```

### Single ActionButton

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
  title: 'Submit',
  payload: 'submit_form',
}
</script>
```

## CSS Variables

ActionButtons uses the following CSS custom properties:

```css
:root {
  --cc-primary-color: #1976d2;             /* Button background */
  --cc-primary-contrast-color: #ffffff;    /* Button text color */
  --cc-primary-color-hover: #1565c0;       /* Hover state */
  --cc-primary-color-focus: #1976d2;       /* Focus outline */
  --cc-primary-color-disabled: #cccccc;    /* Disabled state */
}
```

### Example: Custom Button Theme

```vue
<template>
  <div class="custom-theme">
    <ActionButtons :payload="buttons" :action="handleAction" />
  </div>
</template>

<style>
.custom-theme {
  --cc-primary-color: #9c27b0;           /* Purple background */
  --cc-primary-contrast-color: #ffffff;  /* White text */
  --cc-primary-color-hover: #7b1fa2;     /* Darker purple hover */
  --cc-primary-color-disabled: #e1bee7;  /* Light purple disabled */
}
</style>
```

## Accessibility

### Semantic HTML

- Multiple buttons render as `<ul>` with `<li>` items
- Single button renders as `<div>`
- Buttons use proper ARIA attributes

### ARIA Attributes

```html
<!-- Multiple buttons -->
<ul aria-labelledby="message-text-id">
  <li aria-posinset="1" aria-setsize="3">
    <button aria-label="1 of 3: Option 1">Option 1</button>
  </li>
  <li aria-posinset="2" aria-setsize="3">
    <button aria-label="2 of 3: Option 2">Option 2</button>
  </li>
  <li aria-posinset="3" aria-setsize="3">
    <button aria-label="3 of 3: Option 3">Option 3</button>
  </li>
</ul>
```

### Keyboard Navigation

- All buttons are keyboard accessible
- `Tab` / `Shift+Tab` to navigate
- `Enter` / `Space` to activate
- Disabled buttons have `tabindex="-1"`
- Auto-focus first button (if `enableAutoFocus` config)

### Screen Reader Support

- Position announced: "1 of 3: Option 1"
- External links: "Opens in new tab"
- Phone numbers: Clear "Call" label
- Disabled state announced

## Button Filtering

ActionButtons automatically filters out invalid buttons:

```typescript
// These buttons will be filtered out:
{
  type: 'invalid_type',  // ❌ Invalid type
  title: 'Test',
  payload: 'test'
}

{
  content_type: 'text',  // ❌ text content_type without title
  payload: 'test'
  // Missing title
}

// These buttons will render:
{
  type: 'postback',      // ✅ Valid type
  title: 'Click Me',
  payload: 'test'
}
```

## Focus Management

### Auto-focus First Button

```typescript
const config = {
  settings: {
    widgetSettings: {
      enableAutoFocus: true,  // Auto-focus first button after render
    },
  },
}
```

### Focus After Postback

```typescript
const config = {
  settings: {
    behavior: {
      focusInputAfterPostback: true,  // Focus input after button click
    },
  },
}
```

## URL Sanitization

By default, URLs are sanitized to prevent security issues:

```typescript
// Malicious URL blocked
{ type: 'web_url', url: 'javascript:alert(1)' }  // → Blocked

// Valid URLs allowed
{ type: 'web_url', url: 'https://example.com' }  // → Allowed
{ type: 'web_url', url: 'http://example.com' }   // → Allowed

// Disable sanitization (not recommended)
const config = {
  settings: {
    layout: {
      disableUrlButtonSanitization: true,
    },
  },
}
```

## Best Practices

### ✅ Do

1. **Provide clear button labels**
   ```typescript
   { title: 'Get Started', payload: 'start' }  // Clear
   { title: 'OK', payload: 'confirm' }         // Clear
   ```

2. **Use appropriate button types**
   ```typescript
   { type: 'web_url', url: 'https://...' }     // For external links
   { type: 'postback', payload: '...' }        // For actions
   { type: 'phone_number', payload: '+1...' }  // For calls
   ```

3. **Limit button count**
   ```typescript
   // Good: 2-4 buttons
   const buttons = [button1, button2, button3]

   // Avoid: Too many buttons
   const buttons = [btn1, btn2, btn3, btn4, btn5, btn6]  // Overwhelming
   ```

4. **Handle button clicks**
   ```typescript
   const handleAction: MessageSender = async (text, data, options) => {
     // Send to backend
     await sendMessage(text, data)

     // Update UI
     addMessage(text)
   }
   ```

### ❌ Don't

1. **Don't use unclear labels**
   ```typescript
   { title: 'Click here', payload: 'test' }  // ❌ Vague
   { title: '>>>>', payload: 'next' }        // ❌ Non-descriptive
   ```

2. **Don't forget action handler**
   ```vue
   <!-- ❌ Buttons will be disabled without action -->
   <ActionButtons :payload="buttons" />

   <!-- ✅ Provide action handler -->
   <ActionButtons :payload="buttons" :action="handleAction" />
   ```

3. **Don't mix incompatible types**
   ```typescript
   // ❌ Confusing mix
   [
     { type: 'postback', title: 'Learn More' },
     { type: 'phone_number', title: 'Learn More' },  // Same label, different action
   ]
   ```

## Common Patterns

### Pattern: Quick Replies

```vue
<template>
  <div class="message">
    <Typography variant="body-regular">
      {{ message.text }}
    </Typography>

    <ActionButtons
      :payload="message.quickReplies"
      :action="handleQuickReply"
      size="small"
    />
  </div>
</template>

<script setup lang="ts">
const handleQuickReply: MessageSender = (text) => {
  // Quick reply sends the text as user message
  sendUserMessage(text)
}
</script>
```

### Pattern: Primary Action with Secondary Links

```vue
<template>
  <ActionButtons :payload="buttons" :action="handleAction" show-url-icon />
</template>

<script setup lang="ts">
const buttons: IWebchatButton[] = [
  {
    type: 'postback',
    title: 'Get Started',    // Primary CTA
    payload: 'start',
  },
  {
    type: 'web_url',
    title: 'Learn More',     // Secondary link
    url: 'https://docs.example.com',
    target: '_blank',
  },
]
</script>
```

### Pattern: Contact Options

```vue
<template>
  <ActionButtons :payload="contactButtons" :action="handleAction" size="large" />
</template>

<script setup lang="ts">
const contactButtons: IWebchatButton[] = [
  {
    type: 'phone_number',
    title: 'Call Sales',
    payload: '+1-800-SALES-00',
  },
  {
    type: 'phone_number',
    title: 'Call Support',
    payload: '+1-800-HELP-00',
  },
  {
    type: 'web_url',
    title: 'Email Us',
    url: 'mailto:contact@example.com',
  },
]
</script>
```

## Troubleshooting

### Buttons Not Clickable

**Problem:** Buttons appear but don't respond to clicks

**Solutions:**
1. Ensure `action` prop is provided:
   ```vue
   <ActionButtons :payload="buttons" :action="handleAction" />
   ```

2. Check button payload is defined:
   ```typescript
   { type: 'postback', title: 'Click', payload: 'test' }  // ✅
   { type: 'postback', title: 'Click' }  // ❌ No payload
   ```

### Buttons Appear Disabled

**Problem:** Buttons are grayed out

**Causes:**
- No `action` prop provided (buttons auto-disable)
- Explicitly disabled: `:disabled="true"`
- Invalid button configuration

### URL Buttons Not Opening

**Problem:** Web URL buttons don't open links

**Solutions:**
1. Check URL is valid:
   ```typescript
   { type: 'web_url', url: 'https://example.com' }  // ✅
   { type: 'web_url', url: 'example.com' }  // ❌ Missing protocol
   ```

2. Check URL isn't blocked by sanitization:
   ```typescript
   { type: 'web_url', url: 'javascript:alert(1)' }  // ❌ Blocked
   ```

### Buttons Not Showing

**Problem:** No buttons render

**Causes:**
1. Empty payload: `payload={[]}`
2. All buttons filtered out (invalid types)
3. Missing required button properties

**Debug:**
```typescript
console.log('Payload:', buttons)
console.log('Valid buttons:', buttons.filter(b =>
  ['postback', 'web_url', 'phone_number', 'openXApp'].includes(b.type)
))
```

### Styling Not Applying

**Problem:** Custom styles don't work

**Solutions:**
1. Use correct prop names:
   ```vue
   <ActionButtons
     class-name="container"      <!-- Outer wrapper -->
     container-class-name="buttons"  <!-- Button container -->
     button-class-name="btn"     <!-- Individual buttons -->
   />
   ```

2. Override CSS variables:
   ```css
   .my-chat {
     --cc-primary-color: #custom;
   }
   ```

3. Check CSS specificity:
   ```css
   /* May need !important or higher specificity */
   [data-cognigy-webchat-root] .my-button {
     background: red;
   }
   ```

## Related Components

- [Typography](./typography.md) - Used internally for button labels
- [Message](./message.md) - Container that may include ActionButtons
- [TextWithButtons](../data-structures/text-with-buttons.md) - Message type that uses ActionButtons

## Implementation Notes

### Component Structure

- `ActionButtons` is a container component
- `ActionButton` is the individual button component
- Dynamic component rendering (`<button>` vs `<a>`)
- Auto-filters invalid buttons
- Generates unique IDs for accessibility

### Button Rendering Logic

1. Filter valid buttons from payload
2. Determine container type (`<ul>` vs `<div>`)
3. Generate unique IDs for each button
4. Render buttons with proper ARIA attributes
5. Apply focus management if configured

### URL Security

- Uses `@braintree/sanitize-url` for URL sanitization
- Blocks `javascript:`, `data:`, and other dangerous protocols
- Prevents XSS attacks via malicious URLs

## Testing

The component has comprehensive test coverage:

**ActionButtons:**
- ✅ Renders container with testid
- ✅ Renders correct number of buttons
- ✅ Uses `<ul>` for multiple, `<div>` for single
- ✅ Applies ARIA attributes
- ✅ Filters invalid button types
- ✅ Passes props to child buttons
- ✅ Auto-disables without action
- ✅ Generates unique IDs

**ActionButton:**
- ✅ Renders as `<button>` for postback
- ✅ Renders as `<a>` for URL/phone
- ✅ Displays button title
- ✅ Handles disabled state
- ✅ Calls action on click
- ✅ Shows position in ARIA label
- ✅ Renders images
- ✅ Typography variant based on size
- ✅ Shows LinkIcon for URLs

See `test/ActionButtons.spec.ts` for full test suite (30/30 tests passing).

## Notes for Backend Developers

ActionButtons expects an array of button objects. Each button needs:

**Minimum required:**
```json
{
  "type": "postback",
  "title": "Button Label",
  "payload": "button_payload"
}
```

**Button types supported:**
- `"postback"` - Sends payload to action handler
- `"web_url"` - Opens URL (needs `url` field)
- `"phone_number"` - Creates phone link (needs `payload` with phone number)
- `"openXApp"` - Opens xApp overlay (Cognigy-specific)

**Optional fields:**
- `target`: `"_blank"` or `"_self"` (for web_url)
- `image_url`: Button image URL
- `image_alt_text`: Alt text for button image

See [Data Structures documentation](../data-structures/action-buttons.md) for complete examples.
