# ChatBubble Component

Wrapper component that provides consistent styling for message content based on message source (bot/user/agent).

## Import

```typescript
import { ChatBubble } from '@cognigy/chat-components-vue'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Additional CSS classes |

## Usage

ChatBubble is typically used internally by message components, but can be used directly:

### Basic Usage

```vue
<template>
  <MessageProvider :message="message" :config="config">
    <ChatBubble>
      <p>Message content goes here</p>
    </ChatBubble>
  </MessageProvider>
</template>

<script setup lang="ts">
import { ChatBubble, provideMessageContext } from '@cognigy/chat-components-vue'
import type { IMessage } from '@cognigy/chat-components-vue'

const message: IMessage = {
  text: 'Hello',
  source: 'bot',
  timestamp: Date.now().toString(),
}
</script>
```

### Used in Message Components

```vue
<!-- Inside TextMessage.vue -->
<template>
  <ChatBubble>
    <p v-html="processedContent" />
  </ChatBubble>
</template>
```

## Features

- ✅ Source-based styling (bot/user/agent/engagement)
- ✅ Direction mapping (incoming/outgoing)
- ✅ Optional border disabling
- ✅ Configurable max width
- ✅ Rounded corners
- ✅ Word wrapping
- ✅ CSS variable theming

## Styling Behavior

### By Message Source

**Bot Messages:**
- Background: `--cc-background-bot-message`
- Text color: `--cc-bot-message-contrast-color`
- Border: `--cc-border-bot-message`
- Direction: `incoming` (left-aligned, default)

**User Messages:**
- Background: `--cc-background-user-message`
- Text color: `--cc-user-message-contrast-color`
- Border: `--cc-border-user-message`
- Direction: `outgoing` (right-aligned, default)

**Agent Messages:**
- Background: `--cc-background-agent-message`
- Text color: `--cc-agent-message-contrast-color`
- Border: `--cc-border-agent-message`
- Direction: `incoming` (left-aligned, default)

**Engagement Messages:**
- Same styling as bot messages
- Affected by bot-specific configuration

## Configuration

### Direction Mapping

Override default message alignment:

```typescript
const config: ChatConfig = {
  settings: {
    widgetSettings: {
      sourceDirectionMapping: {
        user: 'incoming',    // Left-align user messages
        bot: 'outgoing',     // Right-align bot messages
        agent: 'outgoing',   // Right-align agent messages
      },
    },
  },
}
```

### Disable Bot Border

```typescript
const config: ChatConfig = {
  settings: {
    layout: {
      disableBotOutputBorder: true,  // Remove border and background for bot messages
    },
  },
}
```

### Max Width

```typescript
const config: ChatConfig = {
  settings: {
    layout: {
      botOutputMaxWidthPercentage: 80,  // Bot messages max 80% of container width
    },
  },
}
```

**Note:** Max width only affects bot and engagement messages, not user messages.

## CSS Variables

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
}
```

### Custom Theme Example

```vue
<template>
  <div class="custom-chat-theme">
    <MessageProvider :message="message" :config="config">
      <ChatBubble>
        <p>Themed message</p>
      </ChatBubble>
    </MessageProvider>
  </div>
</template>

<style>
.custom-chat-theme {
  --cc-background-bot-message: #e3f2fd;     /* Light blue */
  --cc-bot-message-contrast-color: #0d47a1; /* Dark blue text */
  --cc-border-bot-message: #90caf9;         /* Blue border */

  --cc-background-user-message: #e8f5e9;    /* Light green */
  --cc-user-message-contrast-color: #1b5e20;/* Dark green text */
  --cc-border-user-message: #81c784;        /* Green border */
}
</style>
```

## Default Styles

```css
.bubble {
  border-radius: 15px;
  border: 1px solid var(--cc-border-bot-message);
  padding: 12px;
  max-width: 295px;
  width: max-content;
  box-sizing: border-box;
  margin-block-end: 12px;
  word-break: break-word;
  white-space: pre-wrap;
}
```

## Direction Classes

### Incoming (Left-aligned)

Default for bot and agent messages.

```css
.incoming {
  margin-inline-start: none;  /* Left-aligned */
}
```

### Outgoing (Right-aligned)

Default for user messages.

```css
.outgoing {
  margin-inline-start: auto;  /* Right-aligned */
}
```

## Common Patterns

### Pattern: Custom Bubble Styling

```vue
<template>
  <MessageProvider :message="message" :config="config">
    <ChatBubble class-name="special-message">
      <p>Important announcement</p>
    </ChatBubble>
  </MessageProvider>
</template>

<style>
.special-message {
  background: #fff3cd !important;
  border-color: #ffc107 !important;
  color: #856404 !important;
}
</style>
```

### Pattern: Borderless Bot Messages

```vue
<script setup lang="ts">
const config: ChatConfig = {
  settings: {
    layout: {
      disableBotOutputBorder: true,
    },
  },
}
</script>
```

Result: Bot messages appear without border or background, seamlessly blending with the chat background.

### Pattern: Wide Bot Messages

```vue
<script setup lang="ts">
const config: ChatConfig = {
  settings: {
    layout: {
      botOutputMaxWidthPercentage: 90,  // Allow bot messages to be wider
    },
  },
}
</script>
```

## Accessibility

- Semantic HTML container (`<div>`)
- Maintains reading order through direction mapping
- Color contrast follows CSS variable configuration
- Word wrapping prevents horizontal scroll

## Best Practices

### ✅ Do

1. **Use consistent theming**
   ```css
   /* Define all related colors together */
   :root {
     --cc-background-bot-message: #f5f5f5;
     --cc-bot-message-contrast-color: #000000;
     --cc-border-bot-message: #e0e0e0;
   }
   ```

2. **Test color contrast**
   - Ensure text color has sufficient contrast with background
   - WCAG AA standard: 4.5:1 for normal text

3. **Use for all message content**
   - Wrap all message content in ChatBubble for consistency

### ❌ Don't

1. **Don't hardcode colors**
   ```css
   /* ❌ Bad */
   .bubble {
     background: #ffffff;
   }

   /* ✅ Good */
   .bubble {
     background: var(--cc-background-bot-message);
   }
   ```

2. **Don't override max-width without testing**
   - Very wide messages can reduce readability

3. **Don't skip ChatBubble**
   - Use it for consistent message styling

## Troubleshooting

### Messages Not Aligned Correctly

**Problem:** Messages appear on wrong side

**Solution:** Check direction mapping:
```typescript
config.settings.widgetSettings.sourceDirectionMapping = {
  user: 'outgoing',   // Right
  bot: 'incoming',    // Left
  agent: 'incoming',  // Left
}
```

### Border Not Hiding

**Problem:** `disableBotOutputBorder` not working

**Solutions:**
1. Check message source is `bot` or `engagement`:
   ```typescript
   message.source = 'bot'  // or 'engagement'
   ```

2. Verify config structure:
   ```typescript
   config.settings.layout.disableBotOutputBorder = true
   ```

### Custom Colors Not Applying

**Problem:** CSS variables not working

**Solutions:**
1. Define variables in parent scope:
   ```css
   .chat-container {
     --cc-background-bot-message: #custom;
   }
   ```

2. Check CSS specificity:
   ```css
   /* May need higher specificity */
   article.bot .bubble {
     background: var(--cc-background-bot-message);
   }
   ```

### Max Width Not Working

**Problem:** Bot messages not respecting max width

**Solutions:**
1. Check message source is `bot` or `engagement`
2. Verify percentage value:
   ```typescript
   botOutputMaxWidthPercentage: 80  // Not '80%', just number
   ```

## Related Components

- [TextMessage](./text-message.md) - Uses ChatBubble internally
- [Message](./message.md) - Main message router
- All message type components use ChatBubble

## Implementation Notes

- Uses Vue's `useCssModule()` for scoped styles
- Direction classes use logical properties (`margin-inline-start`)
- Border disable uses `!important` to override theme
- Max width applies via inline style for dynamic values

## Testing

The component has comprehensive test coverage:

- ✅ Renders slot content
- ✅ Applies bubble classes
- ✅ Direction mapping (incoming/outgoing)
- ✅ Source-based styling (bot/user/agent/engagement)
- ✅ Custom direction mapping
- ✅ Border disable for bot messages
- ✅ Max width configuration
- ✅ Custom className prop
- ✅ Missing config handling
- ✅ Multiple configuration combinations

See `test/ChatBubble.spec.ts` for full test suite (16/16 tests passing).
