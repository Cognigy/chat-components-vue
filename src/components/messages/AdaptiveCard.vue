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
import { isAdaptiveCardPayload } from '../../types'

/**
 * Simplified adaptive card structure for our rendering needs.
 * The full IAdaptiveCard type from 'adaptivecards' package is complex,
 * but we only need a subset for display purposes.
 */
interface AdaptiveCardData {
  title?: string
  body?: unknown[]
  actions?: unknown[]
  speak?: string
}

/**
 * Adaptive card sources from different payload locations
 */
interface AdaptiveCardSources {
  webchat: AdaptiveCardData | undefined
  defaultPreview: AdaptiveCardData | undefined
  plugin: AdaptiveCardData | undefined
}

/**
 * Extract adaptive card from various message payload locations.
 *
 * Note on types: The socket-client types have limitations:
 * - _defaultPreview is typed as `any`
 * - _plugin.data is `any` for adaptivecards type
 * We use runtime type guards to safely access these properties.
 */
function getAdaptiveCardSources(message: ReturnType<typeof useMessageContext>['message']): AdaptiveCardSources {
  const cognigyData = message?.data?._cognigy
  const pluginData = message?.data?._plugin

  // _webchat can be IWebchatMessage | IAdaptiveCardMessage - use type guard
  const webchatPayload = cognigyData?._webchat
  const webchat = isAdaptiveCardPayload(webchatPayload)
    ? (webchatPayload.adaptiveCard as AdaptiveCardData)
    : undefined

  // _defaultPreview is typed as `any` in socket-client (upstream limitation)
  // We safely check for adaptiveCard property
  const defaultPreviewPayload = cognigyData?._defaultPreview
  const defaultPreview = isAdaptiveCardPayload(defaultPreviewPayload)
    ? (defaultPreviewPayload.adaptiveCard as AdaptiveCardData)
    : undefined

  // Plugin data can come in two formats:
  // 1. Typed format: { type: 'adaptivecards', data: cardData }
  // 2. Legacy format: { payload: cardData }
  let plugin: AdaptiveCardData | undefined
  if (pluginData) {
    if (pluginData.type === 'adaptivecards' && 'data' in pluginData) {
      plugin = pluginData.data as AdaptiveCardData
    } else if ('payload' in pluginData) {
      plugin = (pluginData as { payload?: unknown }).payload as AdaptiveCardData
    }
  }

  return { webchat, defaultPreview, plugin }
}

// Message context
const { message, config } = useMessageContext()

// Get all adaptive card sources
const cardSources = computed(() => getAdaptiveCardSources(message))

// Check if this message has an adaptive card
const hasAdaptiveCard = computed(() => {
  const { webchat, defaultPreview, plugin } = cardSources.value
  return !!(webchat || defaultPreview || plugin)
})

// Get card payload based on configuration
const cardPayload = computed((): AdaptiveCardData | undefined => {
  const { webchat, defaultPreview, plugin } = cardSources.value
  const defaultPreviewEnabled = config?.settings?.widgetSettings?.enableDefaultPreview

  if (webchat && defaultPreview && !defaultPreviewEnabled) {
    return webchat
  }
  if (defaultPreview && defaultPreviewEnabled) {
    return defaultPreview
  }
  return plugin || webchat
})

/**
 * Adaptive card body element (simplified type for our use case)
 */
interface AdaptiveCardElement {
  type: string
  text?: string
  size?: string
}

/**
 * Check if an item is a TextBlock element
 */
function isTextBlock(item: unknown): item is AdaptiveCardElement & { type: 'TextBlock'; text: string } {
  return (
    typeof item === 'object' &&
    item !== null &&
    (item as AdaptiveCardElement).type === 'TextBlock' &&
    typeof (item as AdaptiveCardElement).text === 'string'
  )
}

// Extract card title
const cardTitle = computed(() => {
  const card = cardPayload.value
  if (!card) return 'Adaptive Card'

  // Try to get title from card property (custom extension)
  if ('title' in card && typeof card.title === 'string') {
    return card.title
  }

  // Try to get from body elements
  const body = card.body
  if (body && Array.isArray(body)) {
    // Look for large text block (likely a title)
    const titleElement = body.find(
      (item): item is AdaptiveCardElement =>
        isTextBlock(item) && item.size === 'large'
    )
    if (titleElement?.text) {
      return titleElement.text
    }

    // Fallback to first TextBlock
    const firstText = body.find(isTextBlock)
    if (firstText?.text) {
      return firstText.text
    }
  }

  // Fallback to speak text or generic title
  if (card.speak) {
    return card.speak.substring(0, 50)
  }

  return 'Adaptive Card'
})

// Extract card body text
const cardBody = computed(() => {
  const body = cardPayload.value?.body
  if (!body || !Array.isArray(body)) {
    return null
  }

  // Get text from body elements (skip the title)
  const titleText = cardTitle.value
  const bodyTexts = body
    .filter((item): item is AdaptiveCardElement & { text: string } =>
      isTextBlock(item) && item.text !== titleText
    )
    .map(item => item.text)
    .slice(0, 2) // Limit to first 2 text blocks

  return bodyTexts.length > 0 ? bodyTexts.join(' ') : null
})

// Check if card has actions
const hasActions = computed(() => {
  return cardPayload.value?.actions && Array.isArray(cardPayload.value.actions) && cardPayload.value.actions.length > 0
})

// Actions label
const actionsLabel = computed(() => {
  const actions = cardPayload.value?.actions
  if (!actions || !Array.isArray(actions) || actions.length === 0) return ''

  const count = actions.length
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
