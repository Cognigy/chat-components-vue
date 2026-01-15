<template>
  <div :class="`webchat-${classType}-template-root`">
    <!-- Text content -->
    <TextMessage
      v-if="text"
      :content="text"
      :className="`webchat-${classType}-template-header`"
      :id="webchatButtonTemplateTextId"
      ignoreLiveRegion
    />

    <!-- Buttons -->
    <ActionButtons
      v-if="buttons.length > 0"
      :payload="buttons as any"
      :action="modifiedAction"
      :buttonClassName="buttonClassName"
      :containerClassName="containerClassName"
      :containerStyle="containerStyle"
      :config="config"
      :onEmitAnalytics="onEmitAnalytics"
      :templateTextId="webchatButtonTemplateTextId"
      showUrlIcon
    />
  </div>
</template>

<script setup lang="ts">
import { computed, useCssModule } from 'vue'
import TextMessage from './TextMessage.vue'
import ActionButtons from '../common/ActionButtons.vue'
import { useMessageContext } from '../../composables/useMessageContext'
import { getChannelPayload } from '../../utils/matcher'
import { getRandomId } from '../../utils/helpers'
import type { IWebchatTemplateAttachment, IWebchatButton, IWebchatQuickReply } from '../../types'

// Message context
const { message, config, action, onEmitAnalytics } = useMessageContext()

const $style = useCssModule()

// Get payload data
const payload = computed(() => getChannelPayload(message, config))

// Get attachment data
const attachment = computed(() => payload.value?.message?.attachment as IWebchatTemplateAttachment | undefined)

// Get text content
const text = computed(() => {
  return attachment.value?.payload?.text || payload.value?.message?.text || ''
})

// Get buttons (either from buttons or quick_replies)
const buttons = computed(() => {
  const payloadButtons = attachment.value?.payload?.buttons
  const quickReplies = payload.value?.message?.quick_replies
  return (payloadButtons || quickReplies || []) as (IWebchatButton | IWebchatQuickReply)[]
})

// Determine if this is quick replies
const isQuickReplies = computed(() => {
  return payload.value?.message?.quick_replies && payload.value.message.quick_replies.length > 0
})

// Determine class type
const classType = computed(() => {
  return isQuickReplies.value ? 'quick-reply' : 'buttons'
})

// For quick replies, disable if there's already a reply
// Note: In the React version, this uses messageParams.hasReply
// For now, we'll just pass the action as-is since we don't have messageParams in Vue yet
const modifiedAction = computed(() => {
  // TODO: Implement disabling for quick replies when there's a user reply
  // This would require tracking conversation state
  return action
})

// Generate unique ID for accessibility
const webchatButtonTemplateTextId = getRandomId('webchatButtonTemplateHeader')

// Get bot output max width
const botOutputMaxWidthPercentage = config?.settings?.layout?.botOutputMaxWidthPercentage
const isBotMessage = message.source === 'bot'
const isEngagementMessage = message.source === 'engagement'

// Container style for max width
const containerStyle = computed(() => {
  if ((isBotMessage || isEngagementMessage) && botOutputMaxWidthPercentage) {
    return { maxWidth: `${botOutputMaxWidthPercentage}%` }
  }
  return {}
})

// Button class name
const buttonClassName = computed(() => {
  return `${$style.button} webchat-${classType.value}-template-button`
})

// Container class name
const containerClassName = computed(() => {
  return `${$style.buttons} webchat-${classType.value}-template-replies-container`
})
</script>

<style module>
.buttons {
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 10px;
  max-width: 295px;
}

.button {
  /* Button styles are inherited from ActionButton component */
}
</style>
