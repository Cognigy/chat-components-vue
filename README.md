# @cognigy/chat-components-vue

[![npm version](https://img.shields.io/npm/v/@cognigy/chat-components-vue.svg)](https://www.npmjs.com/package/@cognigy/chat-components-vue)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22.12.0-brightgreen.svg)](https://nodejs.org/)
[![Vue 3](https://img.shields.io/badge/vue-3.x-42b883.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

Vue 3 chat message components for building conversational interfaces. A Vue port of [@cognigy/chat-components](https://github.com/Cognigy/chat-components).

## Features

- **Data-driven rendering** - Single `Message` component handles all message types automatically
- **Rich message types** - Text, images, video, audio, galleries, lists, buttons, and more
- **Plugin system** - Extend with custom message types
- **TypeScript** - Full type safety with exported types
- **Accessible** - ARIA attributes and keyboard navigation
- **Themeable** - CSS variables for customization

## Installation

```bash
npm install @cognigy/chat-components-vue
```

## Quick Start

```vue
<template>
  <div class="chat-container">
    <Message
      v-for="msg in messages"
      :key="msg.traceId"
      :message="msg"
      :config="chatConfig"
      :action="handleAction"
    />
    <TypingIndicator v-if="isTyping" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Message,
  TypingIndicator,
  type IMessage,
  type ChatConfig
} from '@cognigy/chat-components-vue'

// Import styles
import '@cognigy/chat-components-vue/style.css'

const messages = ref<IMessage[]>([])
const isTyping = ref(false)

const chatConfig: ChatConfig = {
  settings: {
    layout: {
      botOutputMaxWidthPercentage: 80,
    },
  },
}

const handleAction = (text: string, data: Record<string, any> | null) => {
  console.log('User action:', text, data)
}
</script>
```

## Components

### Message Renderer

| Component | Description |
|-----------|-------------|
| [Message](./docs/components/message.md) | Main renderer - automatically routes to correct message type |

### Message Types

| Component | Description |
|-----------|-------------|
| [TextMessage](./docs/components/text-message.md) | Plain text with HTML/Markdown support |
| [ImageMessage](./docs/components/image-message.md) | Images with lightbox |
| [VideoMessage](./docs/components/video-message.md) | Video player (direct, YouTube, Vimeo) |
| [AudioMessage](./docs/components/audio-message.md) | Audio player |
| [TextWithButtons](./docs/components/text-with-buttons.md) | Text with action buttons or quick replies |
| [Gallery](./docs/components/gallery.md) | Horizontal carousel of cards |
| [List](./docs/components/list.md) | Vertical list with items and actions |
| [FileMessage](./docs/components/file-message.md) | File attachments with download |
| [DatePicker](./docs/components/date-picker.md) | Date selection display |
| [AdaptiveCard](./docs/components/adaptive-card.md) | Microsoft Adaptive Cards |

### UI Components

| Component | Description |
|-----------|-------------|
| [TypingIndicator](./docs/components/typing-indicator.md) | Animated typing dots |
| [ChatBubble](./docs/components/chat-bubble.md) | Message bubble wrapper |
| [ActionButtons](./docs/components/action-buttons.md) | Button group for actions |
| [ChatEvent](./docs/components/chat-event.md) | System event notifications |
| [Typography](./docs/components/typography.md) | Text with style variants |

## Custom Message Types

Extend with your own message types using plugins:

```vue
<script setup lang="ts">
import { Message, type MessagePlugin } from '@cognigy/chat-components-vue'
import CustomCard from './CustomCard.vue'

const plugins: MessagePlugin[] = [
  {
    name: 'CustomCard',
    match: (message) => message.data?.customType === 'card',
    component: CustomCard,
  }
]
</script>

<template>
  <Message :message="msg" :plugins="plugins" :action="handleAction" />
</template>
```

## Documentation

- [Component API Reference](./docs/components/README.md) - Props, events, and usage
- [Message Data Structures](./docs/data-structures/README.md) - Backend integration guide
- [Consumer Guide](./docs/CONSUMER_GUIDE.md) - Installation and CI/CD setup

## Requirements

- Vue 3.4+
- Node.js 22.12+

## License

MIT
