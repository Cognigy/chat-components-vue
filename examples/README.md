# Examples

This directory contains example Vue components demonstrating how to use @cognigy/chat-components-vue.

## Examples

| Example | Description |
|---------|-------------|
| [BasicChat.vue](./BasicChat.vue) | Basic chat integration with message rendering |
| [CustomPlugin.vue](./CustomPlugin.vue) | Creating custom message type plugins |
| [WithCollation.vue](./WithCollation.vue) | Using stream collation for bot messages |
| [Theming.vue](./Theming.vue) | Customizing styles with CSS variables |

## Usage

These examples are meant to be copied and adapted for your project. They demonstrate common patterns and best practices.

### Basic Setup

1. Install the package:
   ```bash
   npm install @cognigy/chat-components-vue
   ```

2. Import styles in your app entry:
   ```typescript
   import '@cognigy/chat-components-vue/style.css'
   ```

3. Use the components:
   ```vue
   <script setup>
   import { Message } from '@cognigy/chat-components-vue'
   </script>
   ```

## Running Examples

These are standalone Vue SFCs. To run them:

1. Copy the example into your Vue project
2. Import and use in your app
3. Adapt to your needs

Or use them as reference for your own implementation.
