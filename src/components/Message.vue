<template>
  <article
    v-if="matchedComponents.length > 0"
    :class="rootClasses"
    :style="cssVariableStyle"
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
import { computed, reactive, useCssModule, type Component } from 'vue'
import { match } from '../utils/matcher'
import { configColorsToCssVariables } from '../utils/theme'
import { provideMessageContext } from '../composables/useMessageContext'
import { getMessageId, isMessagePlugin } from '../types'
import type { MessageProps, MessageContext } from '../types'

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
const dataMessageId = computed(() => getMessageId(props.message))

// Provide message context for child components
// Using reactive with getters to maintain reactivity when props change
const messageContext = reactive<MessageContext>({
  get message() { return props.message },
  get config() { return props.config },
  get action() { return props.action },
  get onEmitAnalytics() { return props.onEmitAnalytics },
})

provideMessageContext(messageContext)

// Component map for internal match rules (maps rule names to Vue components)
const componentMap: Record<string, Component> = {
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

  // Resolve components from match results
  return matched
    .map(rule => {
      // External plugins (MessagePlugin) provide their own component
      if (isMessagePlugin(rule)) {
        return rule.component
      }
      // Internal rules (MatchRule) use name lookup in componentMap
      return componentMap[rule.name] ?? null
    })
    .filter((c): c is Component => c !== null)
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

// CSS variable injection from config colors
const cssVariableStyle = computed(() => {
  return configColorsToCssVariables(props.config?.settings?.colors)
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
