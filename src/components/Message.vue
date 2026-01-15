<template>
  <article
    v-if="matchedComponents.length > 0"
    :class="rootClasses"
    :data-message-id="dataMessageId"
  >
    <component
      v-for="(matchedComponent, index) in matchedComponents"
      :key="index"
      :is="matchedComponent"
    />

    <!-- Visually hidden focusable target for better keyboard navigation -->
    <div
      :id="`webchat-focus-target-${dataMessageId}`"
      :tabindex="-1"
      :class="$style.srOnly"
      aria-hidden="true"
    />
  </article>
</template>

<script setup lang="ts">
import { computed, useCssModule } from 'vue'
import { match } from '../utils/matcher'
import { provideMessageContext } from '../composables/useMessageContext'
import type { MessageProps } from '../types'

const $style = useCssModule()

// Import all message type components
import TextMessage from './messages/TextMessage.vue'
import ImageMessage from './messages/ImageMessage.vue'
import VideoMessage from './messages/VideoMessage.vue'
import AudioMessage from './messages/AudioMessage.vue'
import TextWithButtons from './messages/TextWithButtons.vue'
import Gallery from './messages/Gallery.vue'
import List from './messages/List.vue'
import FileMessage from './messages/FileMessage.vue'
import DatePicker from './messages/DatePicker.vue'
import AdaptiveCard from './messages/AdaptiveCard.vue'

const props = withDefaults(defineProps<MessageProps>(), {
  action: undefined,
  config: undefined,
  theme: undefined,
  prevMessage: undefined,
  plugins: undefined,
  onEmitAnalytics: undefined,
  disableHeader: false,
})

// Generate a unique message ID for accessibility
const dataMessageId = computed(() => {
  return (props.message as any).id || `message-${props.message.timestamp}`
})

// Provide message context for child components
provideMessageContext({
  message: props.message,
  config: props.config || {},
  action: props.action || (() => {}),
  onEmitAnalytics: props.onEmitAnalytics || (() => {}),
})

// Component map for matching (using names from matcher.ts)
const componentMap: Record<string, any> = {
  'Text': TextMessage,
  'Image': ImageMessage,
  'Video': VideoMessage,
  'Audio': AudioMessage,
  'TextWithButtons': TextWithButtons,
  'Gallery': Gallery,
  'List': List,
  'File': FileMessage,
  'DatePicker': DatePicker,
  'AdaptiveCard': AdaptiveCard,
}

// Match message to appropriate components
const matchedComponents = computed(() => {
  const matched = match(props.message, props.config, props.plugins)

  if (!Array.isArray(matched) || matched.length < 1) {
    return []
  }

  // Map matched plugin names to actual Vue components
  return matched
    .map(plugin => plugin.name ? componentMap[plugin.name] : null)
    .filter(Boolean)
})

// Root element classes
const rootClasses = computed(() => {
  return [
    'webchat-message-row',
    props.message.source,
    $style.message,
    props.message.source === 'bot' && $style.bot,
    props.message.source === 'user' && $style.user,
    props.message.source === 'agent' && $style.agent,
  ].filter(Boolean)
})
</script>

<style module>
.message {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.message.bot {
  align-items: flex-start;
}

.message.user {
  align-items: flex-end;
}

.message.agent {
  align-items: flex-start;
}

/* Screen reader only */
.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
