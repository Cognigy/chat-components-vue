<!--
  BasicChat.vue - Basic chat integration example

  This example shows how to:
  - Render messages with the Message component
  - Handle user actions (button clicks, quick replies)
  - Show typing indicator
  - Configure layout and behavior
-->

<template>
  <div :class="$style.chatContainer">
    <div :class="$style.messageList">
      <Message
        v-for="msg in messages"
        :key="msg.traceId"
        :message="msg"
        :config="chatConfig"
        :action="handleAction"
        :on-emit-analytics="handleAnalytics"
      />

      <TypingIndicator v-if="isTyping" />
    </div>

    <div :class="$style.inputArea">
      <input
        v-model="inputText"
        type="text"
        placeholder="Type a message..."
        @keyup.enter="sendMessage"
      >
      <button @click="sendMessage">
        Send
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useCssModule } from 'vue'
import {
  Message,
  TypingIndicator,
  type IMessage,
  type ChatConfig,
} from '@cognigy/chat-components-vue'

// Don't forget to import styles in your app entry point:
// import '@cognigy/chat-components-vue/style.css'

const $style = useCssModule()

// State
const messages = ref<IMessage[]>([
  {
    text: 'Hello! How can I help you today?',
    source: 'bot',
    timestamp: Date.now().toString(),
    traceId: 'welcome-1',
    data: {},
  },
])
const isTyping = ref(false)
const inputText = ref('')

// Configuration
const chatConfig: ChatConfig = {
  settings: {
    layout: {
      botOutputMaxWidthPercentage: 80,
      disableHtmlContentSanitization: false,
    },
    behavior: {
      renderMarkdown: true,
      enableTypingIndicator: true,
    },
    colors: {
      primaryColor: '#1976d2',
    },
  },
}

// Handle button clicks, quick replies, postbacks
const handleAction = (
  text: string,
  data: Record<string, unknown> | null,
  options?: { label?: string }
) => {
  console.log('User action:', { text, data, label: options?.label })

  // Add user message to the list
  const userMessage: IMessage = {
    text: options?.label || text,
    source: 'user',
    timestamp: Date.now().toString(),
    traceId: `user-${Date.now()}`,
    data: data || {},
  }
  messages.value.push(userMessage)

  // Simulate bot response
  simulateBotResponse(text)
}

// Handle analytics events
const handleAnalytics = (event: string, payload?: unknown) => {
  console.log('Analytics event:', event, payload)
}

// Send text message
const sendMessage = () => {
  if (!inputText.value.trim()) return

  const userMessage: IMessage = {
    text: inputText.value,
    source: 'user',
    timestamp: Date.now().toString(),
    traceId: `user-${Date.now()}`,
    data: {},
  }
  messages.value.push(userMessage)

  simulateBotResponse(inputText.value)
  inputText.value = ''
}

// Simulate a bot response (replace with actual backend integration)
const simulateBotResponse = (userInput: string) => {
  isTyping.value = true

  setTimeout(() => {
    isTyping.value = false

    const botMessage: IMessage = {
      text: `You said: "${userInput}". This is a simulated response.`,
      source: 'bot',
      timestamp: Date.now().toString(),
      traceId: `bot-${Date.now()}`,
      data: {
        _cognigy: {
          _webchat: {
            message: {
              text: `You said: "${userInput}"`,
              quick_replies: [
                { content_type: 'text', title: 'Tell me more', payload: 'more' },
                { content_type: 'text', title: 'Start over', payload: 'restart' },
              ],
            },
          },
        },
      },
    }
    messages.value.push(botMessage)
  }, 1500)
}
</script>

<style module>
.chatContainer {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.messageList {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.inputArea {
  display: flex;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
}

.inputArea input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.inputArea button {
  padding: 8px 16px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.inputArea button:hover {
  background: #1565c0;
}
</style>
