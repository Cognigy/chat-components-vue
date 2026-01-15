<template>
  <ChatBubble
    v-if="hasAdaptiveCard"
    :class="['adaptivecard-wrapper', 'internal', $style.wrapper]"
    data-testid="adaptive-card-message"
  >
    <div :class="$style.card">
      <!-- Card icon/indicator -->
      <div :class="$style.icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          :width="24"
          :height="24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="9" x2="15" y2="9"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
      </div>

      <!-- Card content -->
      <div :class="$style.content">
        <Typography
          variant="title1-semibold"
          component="div"
          :class="$style.title"
        >
          {{ cardTitle }}
        </Typography>

        <Typography
          v-if="cardBody"
          variant="body-regular"
          component="div"
          :class="$style.body"
        >
          {{ cardBody }}
        </Typography>

        <div v-if="hasActions" :class="$style.actions">
          <Typography variant="copy-medium" component="span" :class="$style.actionsLabel">
            {{ actionsLabel }}
          </Typography>
        </div>
      </div>
    </div>
  </ChatBubble>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ChatBubble from '../common/ChatBubble.vue'
import Typography from '../common/Typography.vue'
import { useMessageContext } from '../../composables/useMessageContext'

// Message context
const { message, config } = useMessageContext()

// Check if this message has an adaptive card
const hasAdaptiveCard = computed(() => {
  const webchat = (message?.data?._cognigy?._webchat as any)?.adaptiveCard
  const defaultPreview = (message?.data?._cognigy?._defaultPreview as any)?.adaptiveCard
  const plugin = (message?.data?._plugin as any)?.payload

  return !!(webchat || defaultPreview || plugin)
})

// Get card payload
const cardPayload = computed(() => {
  const webchat = (message?.data?._cognigy?._webchat as any)?.adaptiveCard
  const defaultPreview = (message?.data?._cognigy?._defaultPreview as any)?.adaptiveCard
  const plugin = (message?.data?._plugin as any)?.payload
  const defaultPreviewEnabled = config?.settings?.widgetSettings?.enableDefaultPreview

  if (webchat && defaultPreview && !defaultPreviewEnabled) {
    return webchat
  }
  if (defaultPreview && defaultPreviewEnabled) {
    return defaultPreview
  }
  return plugin || webchat
})

// Extract card title
const cardTitle = computed(() => {
  if (!cardPayload.value) return 'Adaptive Card'

  // Try to get title from various locations
  if (cardPayload.value.title) {
    return cardPayload.value.title
  }

  // Try to get from body elements
  if (cardPayload.value.body && Array.isArray(cardPayload.value.body)) {
    const titleElement = cardPayload.value.body.find(
      (item: any) => item.type === 'TextBlock' && item.size === 'large'
    )
    if (titleElement?.text) {
      return titleElement.text
    }

    // Fallback to first TextBlock
    const firstText = cardPayload.value.body.find((item: any) => item.type === 'TextBlock')
    if (firstText?.text) {
      return firstText.text
    }
  }

  // Fallback to speak text or generic title
  if (cardPayload.value.speak) {
    return cardPayload.value.speak.substring(0, 50)
  }

  return 'Adaptive Card'
})

// Extract card body text
const cardBody = computed(() => {
  if (!cardPayload.value?.body || !Array.isArray(cardPayload.value.body)) {
    return null
  }

  // Get text from body elements (skip the title)
  const bodyTexts = cardPayload.value.body
    .filter((item: any) => item.type === 'TextBlock' && item.text !== cardTitle.value)
    .map((item: any) => item.text)
    .slice(0, 2) // Limit to first 2 text blocks

  return bodyTexts.length > 0 ? bodyTexts.join(' ') : null
})

// Check if card has actions
const hasActions = computed(() => {
  return cardPayload.value?.actions && Array.isArray(cardPayload.value.actions) && cardPayload.value.actions.length > 0
})

// Actions label
const actionsLabel = computed(() => {
  if (!hasActions.value) return ''

  const count = cardPayload.value.actions.length
  return count === 1 ? '1 action available' : `${count} actions available`
})
</script>

<style module>
.wrapper {
  max-width: 400px;
}

.card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background-color: var(--cc-white, #ffffff);
  border-radius: var(--cc-bubble-border-radius, 15px);
}

.icon {
  flex-shrink: 0;
  color: var(--cc-primary-color, #1976d2);
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.title {
  color: var(--cc-black-10, rgba(0, 0, 0, 0.1));
  margin: 0;
}

.body {
  color: var(--cc-black-20, rgba(0, 0, 0, 0.2));
  margin: 0;
  overflow-wrap: break-word;
}

.actions {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px solid var(--cc-black-80, rgba(0, 0, 0, 0.8));
}

.actionsLabel {
  color: var(--cc-black-40, rgba(0, 0, 0, 0.4));
  font-style: italic;
}
</style>
