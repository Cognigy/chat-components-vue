# Consumer Guide: Installing @cognigy/chat-components-vue

## Installation

```bash
npm install @cognigy/chat-components-vue
```

## Setup

Import styles in your app entry point:

```typescript
import '@cognigy/chat-components-vue/style.css'
```

## Usage

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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message, type IMessage, type ChatConfig } from '@cognigy/chat-components-vue'

const messages = ref<IMessage[]>([])

const chatConfig: ChatConfig = {
  settings: {
    layout: {
      botOutputMaxWidthPercentage: 80,
    },
  },
}

const handleAction = (text: string, data: Record<string, any> | null) => {
  console.log('Action:', text, data)
}
</script>
```

## GitHub Actions CI/CD

No special configuration needed. Standard npm install works:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - run: npm ci

      - run: npm run build
```

## Dockerfile

If your Dockerfile runs `npm install`, it works without any special configuration:

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

## Updating

```bash
# Update to latest
npm update @cognigy/chat-components-vue

# Or specify version
npm install @cognigy/chat-components-vue@^0.2.0
```

## Troubleshooting

### Package not found

```
npm ERR! 404 '@cognigy/chat-components-vue' is not in the npm registry
```

The package may not be published yet. Check https://www.npmjs.com/package/@cognigy/chat-components-vue

### Peer dependency warning

```
npm WARN @cognigy/chat-components-vue requires vue@^3.4.0
```

Ensure your project has Vue 3.4+ installed:

```bash
npm install vue@^3.5
```
