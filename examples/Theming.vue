<!--
  Theming.vue - CSS customization example

  This example shows how to:
  - Override CSS variables for theming
  - Create dark/light themes
  - Customize specific components
-->

<template>
  <div :class="[$style.container, isDarkMode && $style.dark]">
    <div :class="$style.controls">
      <label>
        <input v-model="isDarkMode" type="checkbox" />
        Dark Mode
      </label>

      <div :class="$style.colorPicker">
        <label>
          Primary Color:
          <input v-model="primaryColor" type="color" />
        </label>
      </div>
    </div>

    <div
      :class="$style.chatArea"
      :style="customStyles"
    >
      <Message
        v-for="msg in messages"
        :key="msg.traceId"
        :message="msg"
        :config="chatConfig"
        :action="handleAction"
      />
    </div>

    <div :class="$style.cssVariables">
      <h4>Available CSS Variables</h4>
      <pre>{{ cssVariablesDoc }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useCssModule } from 'vue'
import {
  Message,
  type IMessage,
  type ChatConfig,
} from '@cognigy/chat-components-vue'

const $style = useCssModule()

// Theme state
const isDarkMode = ref(false)
const primaryColor = ref('#1976d2')

// Custom CSS variables based on theme
const customStyles = computed(() => ({
  '--cc-primary-color': primaryColor.value,
  '--cc-primary-color-hover': adjustColor(primaryColor.value, -20),
  '--cc-background-bot': isDarkMode.value ? '#2d2d2d' : '#f5f5f5',
  '--cc-background-user': primaryColor.value,
  '--cc-text-dark': isDarkMode.value ? '#ffffff' : '#1a1a1a',
  '--cc-text-light': isDarkMode.value ? '#e0e0e0' : '#666666',
  '--cc-border-color': isDarkMode.value ? '#444444' : '#e0e0e0',
}))

// Simple color adjustment helper
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

// Sample messages
const messages = ref<IMessage[]>([
  {
    text: 'Welcome! This example demonstrates theming capabilities.',
    source: 'bot',
    timestamp: '1',
    traceId: 'msg-1',
    data: {},
  },
  {
    text: 'Thanks! I love the customization options.',
    source: 'user',
    timestamp: '2',
    traceId: 'msg-2',
    data: {},
  },
  {
    text: 'You can customize colors, fonts, and more using CSS variables.',
    source: 'bot',
    timestamp: '3',
    traceId: 'msg-3',
    data: {
      _cognigy: {
        _webchat: {
          message: {
            text: 'Try clicking a button:',
            quick_replies: [
              { content_type: 'text', title: 'Primary', payload: 'primary' },
              { content_type: 'text', title: 'Secondary', payload: 'secondary' },
            ],
          },
        },
      },
    },
  },
])

const chatConfig: ChatConfig = {
  settings: {
    layout: {
      botOutputMaxWidthPercentage: 80,
    },
  },
}

const handleAction = (text: string) => {
  console.log('Action:', text)
}

// Documentation for CSS variables
const cssVariablesDoc = `
/* Primary theme colors */
--cc-primary-color: #1976d2;
--cc-primary-color-hover: #1565c0;
--cc-secondary-color: #424242;

/* Message backgrounds */
--cc-background-bot: #f5f5f5;
--cc-background-user: #1976d2;

/* Text colors */
--cc-text-dark: #1a1a1a;
--cc-text-light: #666666;
--cc-text-on-primary: #ffffff;

/* Typography */
--cc-font-family: 'Figtree', sans-serif;
--cc-font-size-base: 14px;
--cc-line-height: 1.5;

/* Spacing */
--cc-spacing-xs: 4px;
--cc-spacing-sm: 8px;
--cc-spacing-md: 16px;
--cc-spacing-lg: 24px;

/* Border radius */
--cc-border-radius: 8px;
--cc-border-radius-lg: 16px;

/* Shadows */
--cc-shadow: 0 2px 4px rgba(0,0,0,0.1);
`.trim()
</script>

<style module>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
}

.container.dark {
  background: #1a1a1a;
  color: #ffffff;
  min-height: 100vh;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(128, 128, 128, 0.1);
  border-radius: 8px;
  margin-bottom: 16px;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.colorPicker {
  display: flex;
  align-items: center;
  gap: 8px;
}

.colorPicker input[type="color"] {
  width: 40px;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chatArea {
  padding: 16px;
  border: 1px solid var(--cc-border-color, #e0e0e0);
  border-radius: 8px;
  margin-bottom: 16px;
  background: var(--cc-background, transparent);
}

.cssVariables {
  padding: 16px;
  background: rgba(128, 128, 128, 0.1);
  border-radius: 8px;
}

.cssVariables h4 {
  margin: 0 0 12px 0;
}

.cssVariables pre {
  margin: 0;
  padding: 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}

.dark .cssVariables pre {
  background: rgba(255, 255, 255, 0.05);
}
</style>
