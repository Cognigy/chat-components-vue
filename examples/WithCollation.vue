<!--
  WithCollation.vue - Stream collation example

  This example shows how to:
  - Use the useCollation composable
  - Collate streamed bot messages into single messages
  - Toggle collation on/off
-->

<template>
  <div :class="$style.container">
    <div :class="$style.controls">
      <label>
        <input v-model="collationEnabled" type="checkbox" />
        Enable stream collation
      </label>
      <span :class="$style.stats">
        Original: {{ originalCount }} messages |
        Displayed: {{ collatedCount }} messages
      </span>
    </div>

    <div :class="$style.messageList">
      <Message
        v-for="msg in collatedMessages"
        :key="msg.traceId"
        :message="msg"
        :config="chatConfig"
      />
    </div>

    <div :class="$style.actions">
      <button @click="simulateStreamedResponse">
        Simulate Streamed Response
      </button>
      <button @click="resetMessages">Reset</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useCssModule } from 'vue'
import {
  Message,
  useCollation,
  type IMessage,
  type ChatConfig,
} from '@cognigy/chat-components-vue'

const $style = useCssModule()

// Raw messages from the backend
const messages = ref<IMessage[]>([
  {
    text: 'Hello! I can help you with your questions.',
    source: 'bot',
    timestamp: '1',
    traceId: 'msg-1',
    data: {},
  },
])

// Collation toggle
const collationEnabled = ref(true)

// Dynamic config based on collation toggle
const chatConfig = computed<ChatConfig>(() => ({
  settings: {
    layout: {
      botOutputMaxWidthPercentage: 80,
    },
    behavior: {
      collateStreamedOutputs: collationEnabled.value,
    },
  },
}))

// Use the collation composable
const { collatedMessages, originalCount, collatedCount } = useCollation(
  messages,
  chatConfig
)

// Simulate a streamed response (like GPT streaming)
const simulateStreamedResponse = () => {
  const baseTime = Date.now()
  const streamedParts = [
    'Let me think about that...',
    'Based on my analysis,',
    'I would recommend the following approach:',
    '1. First, identify the core problem',
    '2. Then, gather relevant information',
    '3. Finally, implement a solution',
  ]

  // Add a user message first
  messages.value.push({
    text: 'Can you help me solve a problem?',
    source: 'user',
    timestamp: (baseTime - 100).toString(),
    traceId: `user-${baseTime}`,
    data: {},
  })

  // Simulate streaming by adding parts with delays
  streamedParts.forEach((part, index) => {
    setTimeout(() => {
      messages.value.push({
        text: part,
        source: 'bot',
        timestamp: (baseTime + index * 100).toString(),
        traceId: `stream-${baseTime}-${index}`,
        data: {},
      })
    }, index * 500)
  })
}

// Reset to initial state
const resetMessages = () => {
  messages.value = [
    {
      text: 'Hello! I can help you with your questions.',
      source: 'bot',
      timestamp: '1',
      traceId: 'msg-1',
      data: {},
    },
  ]
}
</script>

<style module>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 16px;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.stats {
  font-size: 12px;
  color: #666;
}

.messageList {
  min-height: 300px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.actions button:first-child {
  background: #1976d2;
  color: white;
}

.actions button:last-child {
  background: #e0e0e0;
}
</style>
