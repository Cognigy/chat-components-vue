<script setup lang="ts">
import { computed, useCssModule, CSSProperties } from 'vue'
import { useMessageContext } from '../../composables/useMessageContext'

interface Props {
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  className: '',
})

const styles = useCssModule()
const { message, config } = useMessageContext()

// Get direction mapping from config
const directionMapping = computed(() => config?.settings?.widgetSettings?.sourceDirectionMapping)
const disableBotOutputBorder = computed(() => config?.settings?.layout?.disableBotOutputBorder)
const botOutputMaxWidthPercentage = computed(() => config?.settings?.layout?.botOutputMaxWidthPercentage)

// Determine message type
const isUserMessage = computed(() => message.source === 'user')
const isBotMessage = computed(() => message.source === 'bot')
const isAgentMessage = computed(() => message.source === 'agent')
const isEngagementMessage = computed(() => message.source === 'engagement')

// Determine if border should be disabled
const disableBorder = computed(() =>
  (isBotMessage.value || isEngagementMessage.value) && disableBotOutputBorder.value
)

// Get message direction based on source
const userMessageDirection = computed(() => directionMapping.value?.user || 'outgoing')
const botMessageDirection = computed(() => directionMapping.value?.bot || 'incoming')
const agentMessageDirection = computed(() => directionMapping.value?.agent || 'incoming')

// Compute CSS classes
const bubbleClasses = computed(() => {
  const classes = [styles.bubble, 'chat-bubble']

  if (props.className) classes.push(props.className)
  if (isUserMessage.value) classes.push(styles[userMessageDirection.value])
  if (isBotMessage.value) classes.push(styles[botMessageDirection.value])
  if (isAgentMessage.value) classes.push(styles[agentMessageDirection.value])
  if (disableBorder.value) classes.push(styles.disableBorder)

  return classes
})

// Compute inline style
const bubbleStyle = computed((): CSSProperties => {
  if ((isBotMessage.value || isEngagementMessage.value) && botOutputMaxWidthPercentage.value) {
    return { maxWidth: `${botOutputMaxWidthPercentage.value}%` }
  }
  return {}
})
</script>

<template>
  <div :class="bubbleClasses" :style="bubbleStyle">
    <slot />
  </div>
</template>

<style module>
.bubble {
  border-radius: 15px;
  border: 1px solid var(--cc-border-bot-message);
  padding: 12px;
  max-width: 295px;
  width: max-content;
  box-sizing: border-box;
  margin-block-end: 12px;
  word-break: break-word;
  white-space: pre-wrap;
}

.bubble.disableBorder {
  border: none;
  background: none !important;
}

article:global(.bot) .bubble {
  background: var(--cc-background-bot-message);
  color: var(--cc-bot-message-contrast-color);
}

article:global(.agent) .bubble {
  background: var(--cc-background-agent-message);
  border-color: var(--cc-border-agent-message);
  color: var(--cc-agent-message-contrast-color);
}

article:global(.user) .bubble {
  background: var(--cc-background-user-message);
  border-color: var(--cc-border-user-message);
  color: var(--cc-user-message-contrast-color);
}

article:not(:global(.user)) .incoming,
article:global(.user) .incoming {
  margin-inline-start: none;
}

article:not(:global(.user)) .outgoing,
article:global(.user) .outgoing {
  margin-inline-start: auto;
}
</style>
