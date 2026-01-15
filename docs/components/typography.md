# Typography Component

Flexible text component with multiple typographic variants and semantic HTML rendering.

## Import

```typescript
import { Typography } from '@cognigy/chat-components-vue'
import type { TagVariant } from '@cognigy/chat-components-vue'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `TagVariant` | `'body-regular'` | Typography variant (see variants table below) |
| `component` | `string` | *variant default* | Override the HTML element to render |
| `className` | `string` | `''` | Additional CSS class names |
| `style` | `CSSProperties` | `undefined` | Inline styles |
| `color` | `string` | `undefined` | Text color ('primary', 'secondary', or CSS color value) |
| `id` | `string` | `undefined` | Element ID |
| `ariaHidden` | `boolean` | `undefined` | Hide from screen readers |
| `tabIndex` | `number` | `undefined` | Tab navigation order |

## Typography Variants

| Variant | Default Tag | Font Size | Weight | Line Height | Use Case |
|---------|-------------|-----------|--------|-------------|----------|
| `h1-semibold` | `h1` | 34px | 600 | 40.8px | Main page headings |
| `h2-regular` | `h2` | 18px | 400 | 23.4px | Section headings (regular) |
| `h2-semibold` | `h2` | 18px | 600 | 23.4px | Section headings (emphasized) |
| `title1-semibold` | `h3` | 16px | 600 | 22.4px | Subsection titles (emphasized) |
| `title1-regular` | `h4` | 16px | 400 | 22.4px | Subsection titles |
| `title2-semibold` | `h5` | 12px | 600 | 15.6px | Small headings (emphasized) |
| `title2-regular` | `h6` | 12px | 400 | 16.8px | Small headings |
| `body-regular` | `p` | 14px | 400 | 19.6px | **Default** - Body text |
| `body-semibold` | `p` | 14px | 600 | 18.2px | Emphasized body text |
| `copy-medium` | `p` | 12px | 500 | 16.8px | Small body text |
| `cta-semibold` | `p` | 14px | 600 | 18.2px | Call-to-action text |

## Usage

### Basic Usage

```vue
<template>
  <Typography>Simple body text</Typography>

  <Typography variant="h1-semibold">
    Main Heading
  </Typography>

  <Typography variant="title1-semibold">
    Section Title
  </Typography>
</template>

<script setup lang="ts">
import { Typography } from '@cognigy/chat-components-vue'
</script>
```

### With Custom Component

Override the HTML element while keeping the typography styles:

```vue
<template>
  <!-- Render as <span> with h2-semibold styles -->
  <Typography variant="h2-semibold" component="span">
    Inline heading
  </Typography>

  <!-- Render as <div> with body-regular styles -->
  <Typography variant="body-regular" component="div">
    Block text
  </Typography>
</template>
```

### With Colors

```vue
<template>
  <!-- Predefined theme colors -->
  <Typography color="primary">Primary color text</Typography>
  <Typography color="secondary">Secondary color text</Typography>

  <!-- Custom CSS colors -->
  <Typography color="#ff0000">Red text</Typography>
  <Typography color="rgb(0, 128, 0)">Green text</Typography>
  <Typography color="var(--my-custom-color)">Custom variable</Typography>
</template>
```

### With Custom Styling

```vue
<template>
  <Typography
    class-name="my-text"
    :style="{
      marginBottom: '20px',
      textAlign: 'center',
    }"
  >
    Styled text
  </Typography>
</template>

<style>
.my-text {
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
</style>
```

### With Accessibility Attributes

```vue
<template>
  <!-- Decorative text hidden from screen readers -->
  <Typography :aria-hidden="true">
    ✨ Decorative icon
  </Typography>

  <!-- Text with ID for referencing -->
  <Typography id="description-text" variant="body-regular">
    This description can be referenced by aria-describedby
  </Typography>

  <!-- Focusable text -->
  <Typography :tab-index="0">
    Keyboard navigable text
  </Typography>
</template>
```

### Message Component Usage

Typography is commonly used within message components:

```vue
<template>
  <div class="message-card">
    <Typography variant="title1-semibold" class-name="message-title">
      {{ message.title }}
    </Typography>

    <Typography variant="body-regular" class-name="message-body">
      {{ message.text }}
    </Typography>

    <Typography variant="copy-medium" color="secondary">
      {{ formatTimestamp(message.timestamp) }}
    </Typography>
  </div>
</template>

<script setup lang="ts">
import { Typography } from '@cognigy/chat-components-vue'
import type { IMessage } from '@cognigy/chat-components-vue'

interface Props {
  message: IMessage
}

defineProps<Props>()

const formatTimestamp = (ts: string) => {
  return new Date(parseInt(ts)).toLocaleTimeString()
}
</script>
```

## CSS Variables

The component uses CSS custom properties for theming:

```css
:root {
  --cc-primary-color: #1976d2;    /* Primary brand color */
  --cc-secondary-color: #757575;  /* Secondary/muted color */
}
```

### Example: Custom Theme

```vue
<template>
  <div class="custom-theme">
    <Typography color="primary">Uses custom primary</Typography>
    <Typography color="secondary">Uses custom secondary</Typography>
  </div>
</template>

<style>
.custom-theme {
  --cc-primary-color: #9c27b0;    /* Purple */
  --cc-secondary-color: #424242;  /* Dark gray */
}
</style>
```

## Accessibility

### Semantic HTML

Typography automatically maps variants to appropriate semantic HTML elements:

- `h1-semibold` → `<h1>` - Page title
- `h2-*` → `<h2>` - Major sections
- `title1-*` → `<h3>` / `<h4>` - Subsections
- `title2-*` → `<h5>` / `<h6>` - Minor sections
- `body-*`, `copy-*`, `cta-*` → `<p>` - Text content

This provides proper document structure for screen readers.

### Overriding Semantics

Use the `component` prop when semantics don't match visual style:

```vue
<template>
  <!-- Visually styled as h2, but semantically h3 -->
  <Typography variant="h2-semibold" component="h3">
    Nested Section
  </Typography>

  <!-- Body text in a list item -->
  <li>
    <Typography variant="body-regular" component="span">
      List content
    </Typography>
  </li>
</template>
```

### Screen Reader Control

```vue
<template>
  <!-- Hide decorative elements -->
  <Typography :aria-hidden="true">•</Typography>

  <!-- Provide context -->
  <Typography id="error-message" variant="body-semibold" color="#d32f2f">
    Error: Invalid input
  </Typography>
</template>
```

## Best Practices

### ✅ Do

1. **Use semantic variants** - Choose variants that match content hierarchy
   ```vue
   <Typography variant="h1-semibold">Page Title</Typography>
   <Typography variant="h2-semibold">Section</Typography>
   <Typography variant="body-regular">Content</Typography>
   ```

2. **Override component for semantics** - Maintain document structure
   ```vue
   <!-- Correct heading level, styled as larger -->
   <Typography variant="h2-semibold" component="h4">
     Nested Heading
   </Typography>
   ```

3. **Use theme colors** - Maintain consistency
   ```vue
   <Typography color="primary">Themed</Typography>
   <Typography color="secondary">Muted</Typography>
   ```

4. **Leverage type safety** - Use TypeScript
   ```typescript
   import type { TagVariant } from '@cognigy/chat-components-vue'

   const variant: TagVariant = 'h1-semibold' // Type-safe
   ```

### ❌ Don't

1. **Skip heading levels** - Breaks accessibility
   ```vue
   <!-- ❌ Bad: h1 → h3 skips h2 -->
   <Typography variant="h1-semibold">Title</Typography>
   <Typography variant="title1-semibold">Subtitle</Typography>
   ```

2. **Use multiple h1s** - One per page
   ```vue
   <!-- ❌ Bad: Multiple h1 elements -->
   <Typography variant="h1-semibold">First</Typography>
   <Typography variant="h1-semibold">Second</Typography>
   ```

3. **Style for semantics** - Use `component` prop
   ```vue
   <!-- ❌ Bad: Wrong semantic element -->
   <Typography variant="body-regular" style="font-size: 34px">

   <!-- ✅ Good: Correct semantic element -->
   <Typography variant="h1-semibold" component="h2">
   ```

## Common Patterns

### Pattern: Text Hierarchy

```vue
<template>
  <article>
    <Typography variant="h1-semibold" component="h1">
      Article Title
    </Typography>

    <Typography variant="h2-regular" component="h2">
      Introduction
    </Typography>

    <Typography variant="body-regular">
      Lorem ipsum dolor sit amet...
    </Typography>

    <Typography variant="h2-regular" component="h2">
      Main Content
    </Typography>

    <Typography variant="title1-semibold" component="h3">
      Subsection
    </Typography>

    <Typography variant="body-regular">
      More content...
    </Typography>
  </article>
</template>
```

### Pattern: Message Metadata

```vue
<template>
  <div class="message">
    <Typography variant="title2-semibold" color="secondary">
      {{ senderName }}
    </Typography>

    <Typography variant="body-regular">
      {{ messageText }}
    </Typography>

    <Typography variant="copy-medium" color="secondary">
      {{ timestamp }}
    </Typography>
  </div>
</template>
```

### Pattern: Button Text

```vue
<template>
  <button class="action-button">
    <Typography variant="cta-semibold" component="span">
      Send Message
    </Typography>
  </button>
</template>
```

### Pattern: Dynamic Variant

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { Typography } from '@cognigy/chat-components-vue'
import type { TagVariant } from '@cognigy/chat-components-vue'

interface Props {
  level: number
  text: string
}

const props = defineProps<Props>()

const variant = computed((): TagVariant => {
  switch (props.level) {
    case 1: return 'h1-semibold'
    case 2: return 'h2-semibold'
    case 3: return 'title1-semibold'
    default: return 'body-regular'
  }
})
</script>

<template>
  <Typography :variant="variant">
    {{ text }}
  </Typography>
</template>
```

## Related Components

- [Message](./message.md) - Uses Typography internally for text rendering
- [ChatEvent](./chat-event.md) - Uses Typography styles for event text
- [ActionButtons](./action-buttons.md) - Uses Typography for button labels

## Troubleshooting

### Font Not Loading

**Problem:** Figtree font not displaying

**Solution:** Ensure Figtree font is loaded in your application:

```css
/* In your global styles */
@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600&display=swap');

/* Or use a local font */
@font-face {
  font-family: 'Figtree';
  src: url('/fonts/Figtree-Regular.woff2') format('woff2');
  font-weight: 400;
}
```

### Styles Not Applying

**Problem:** Typography styles not visible

**Solutions:**
1. Check CSS modules are working: `console.log(styles)` in component
2. Verify no conflicting global styles
3. Ensure variant name is spelled correctly
4. Use browser devtools to inspect applied classes

### Wrong HTML Element

**Problem:** Wrong semantic element rendered

**Solution:** Use `component` prop to override:

```vue
<!-- Render as h2 instead of default h3 -->
<Typography variant="title1-semibold" component="h2">
  Section Title
</Typography>
```

### Color Not Working

**Problem:** Color prop not applying

**Solutions:**

1. Check CSS variable is defined:
   ```css
   :root {
     --cc-primary-color: #1976d2;
   }
   ```

2. Use custom color directly:
   ```vue
   <Typography color="#ff0000">Red</Typography>
   ```

3. Ensure no conflicting inline styles

### TypeScript Errors

**Problem:** Type errors with variant

**Solution:** Import and use `TagVariant` type:

```typescript
import type { TagVariant } from '@cognigy/chat-components-vue'

const myVariant: TagVariant = 'h1-semibold' // Type-safe
```

## Implementation Notes

- Component uses `<component :is>` for dynamic element rendering
- All 11 typography variants are CSS module classes
- Color precedence: theme colors → custom CSS values
- Styles are merged: variant styles + custom styles + color
- `useAttrs()` passes through additional HTML attributes
- Font family uses Figtree with system font fallback

## Testing

The component has comprehensive test coverage:

- ✅ Default variant renders correctly (body-regular → `<p>`)
- ✅ All 11 variants render with correct HTML tags
- ✅ Variant CSS classes applied
- ✅ Component prop overrides default tag
- ✅ Custom className applied
- ✅ Inline styles applied
- ✅ Primary/secondary color mapping
- ✅ Custom color values
- ✅ ID attribute
- ✅ Accessibility attributes (aria-hidden, tabIndex)
- ✅ Props combination
- ✅ Slot content rendering
- ✅ Nested HTML in slots

See `test/Typography.spec.ts` for full test suite (16/16 tests passing).

## Type Definitions

```typescript
export type TagVariant =
  | 'h1-semibold'
  | 'h2-regular'
  | 'h2-semibold'
  | 'title1-semibold'
  | 'title1-regular'
  | 'title2-semibold'
  | 'title2-regular'
  | 'body-regular'
  | 'body-semibold'
  | 'copy-medium'
  | 'cta-semibold'

interface TypographyProps {
  variant?: TagVariant
  component?: string
  className?: string
  style?: CSSProperties
  color?: string
  id?: string
  ariaHidden?: boolean
  tabIndex?: number
}
```

## Notes for Backend Developers

Typography is a **presentation component** - it doesn't use the matcher system or expect specific data structures. It's used internally by other components to render text with consistent styling.

When building message type components, use Typography for text content to ensure consistent typography across all message types.
