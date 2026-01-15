# Typography

Typography is **not a message type** - it's a foundational UI component used internally by other components for text rendering.

## Component Type

**Component:** `Typography.vue`

**Category:** UI Component / Building Block (not data-driven)

## Purpose

Typography provides consistent text styling across all chat components. It's used internally by message components to ensure uniform typography throughout the chat interface.

## Not a Message Type

**Important:** Typography does **not** use the matcher system. It's not rendered based on message data structures. Instead, it's used as a building block within other components.

```vue
<!-- ❌ Wrong: You don't render Typography directly for messages -->
const message = {
  text: "Hello",
  variant: "h1-semibold"  // This won't work
}

<!-- ✅ Correct: Other components use Typography internally -->
// Inside TextMessage.vue
<Typography variant="body-regular">
  {{ message.text }}
</Typography>
```

## Usage in Components

### Internal Usage Pattern

Typography is typically used inside message type components:

```vue
<!-- Inside a message component like TextWithButtons.vue -->
<template>
  <div class="message-container">
    <!-- Title -->
    <Typography variant="title1-semibold">
      {{ message.data?.title }}
    </Typography>

    <!-- Body text -->
    <Typography variant="body-regular">
      {{ message.text }}
    </Typography>

    <!-- Metadata -->
    <Typography variant="copy-medium" color="secondary">
      {{ formatTime(message.timestamp) }}
    </Typography>
  </div>
</template>
```

### Component Integration

Message type components use Typography for consistent text rendering:

**TextMessage.vue:**
```vue
<Typography variant="body-regular" class-name="message-text">
  {{ sanitizedText }}
</Typography>
```

**Gallery.vue card title:**
```vue
<Typography variant="title1-semibold">
  {{ card.title }}
</Typography>
```

**List.vue item:**
```vue
<Typography variant="body-semibold">
  {{ item.title }}
</Typography>
<Typography variant="copy-medium" color="secondary">
  {{ item.subtitle }}
</Typography>
```

## Why Typography Exists

### Problem It Solves

Without Typography:
- ❌ Inconsistent font sizes across components
- ❌ Duplicate CSS in every component
- ❌ Hard to maintain typography system
- ❌ No semantic HTML guidance

With Typography:
- ✅ Single source of truth for typography
- ✅ Consistent styling everywhere
- ✅ Easy to update typography globally
- ✅ Semantic HTML by default

### Design System Integration

Typography implements your design system's typography scale:

```typescript
// Your design system defines:
// - Heading levels: h1, h2, h3, h4, h5, h6
// - Body text: body, copy
// - UI text: CTA

// Typography component provides these as variants:
'h1-semibold'      // Main headings
'h2-semibold'      // Section headings
'body-regular'     // Body text
'copy-medium'      // Small text
'cta-semibold'     // Buttons/CTAs
```

## Backend Integration

### You Don't Need to Do Anything

Typography is transparent to backend developers. You don't need to:
- ❌ Send typography data in messages
- ❌ Specify variants in data structures
- ❌ Configure typography settings

The frontend components handle all typography automatically.

### Example: Backend Sends Simple Data

**Backend sends:**
```json
{
  "text": "Hello, how can I help?",
  "source": "bot",
  "timestamp": "1673456789000"
}
```

**Frontend automatically renders with Typography:**
```vue
<!-- TextMessage.vue uses Typography internally -->
<Typography variant="body-regular">
  Hello, how can I help?
</Typography>
```

You just send the data - the frontend handles presentation.

## When You Might See Typography

### In Component Documentation

When reading component documentation, you'll see Typography mentioned:

**TextMessage Component:**
> "Uses Typography with variant `body-regular` for message text"

This tells you that message text will be styled consistently, but you don't need to configure it.

### In Example Code

Documentation examples may show Typography usage:

```vue
<!-- Example showing internal structure -->
<template>
  <div class="gallery-card">
    <Typography variant="title1-semibold">
      {{ card.title }}
    </Typography>
  </div>
</template>
```

This is showing how the component is built, not what you need to send from the backend.

## Customization (Frontend)

If your frontend team wants to customize typography, they can override CSS variables:

```css
:root {
  /* Custom primary color for links/highlights */
  --cc-primary-color: #9c27b0;

  /* Custom secondary color for muted text */
  --cc-secondary-color: #757575;
}
```

Or override the Figtree font:

```css
/* Use a custom font family */
.custom-theme [class*="body-"] {
  font-family: 'CustomFont', sans-serif;
}
```

**As a backend developer, you don't need to worry about this.**

## Summary

**Key Points:**
- ✅ Typography is a UI building block, not a message type
- ✅ Used internally by message components
- ✅ Not part of the matcher system
- ✅ Backend doesn't need to configure or send typography data
- ✅ Provides consistent text styling across all components
- ✅ Transparent to backend development

**Backend Developers:**
Just send message data as documented. The frontend components will use Typography internally to ensure consistent, beautiful text rendering.

## Related

- [Typography Component](../components/typography.md) - Component API documentation
- [TypingIndicator](./typing-indicator.md) - Another UI component (not a message type)
- [ChatEvent](./chat-event.md) - Another UI component (not a message type)
- [Data Structures](./README.md) - Overview of message types (Typography is not one)
