<template>
  <div
    v-if="elements.length > 0"
    :class="['webchat-list-template-root', $style.wrapper]"
    :id="listTemplateId"
    data-testid="list-message"
  >
    <!-- Header element (first element if top_element_style is large) -->
    <ListItem
      v-if="headerElement"
      :element="headerElement"
      isHeaderElement
      headingLevel="h4"
      :id="`header-${listTemplateId}`"
    />

    <!-- Regular list items -->
    <ul
      :aria-labelledby="headerElement ? `listHeader-header-${listTemplateId}` : undefined"
      :class="$style.list"
    >
      <ListItem
        v-for="(element, index) in regularElements"
        :key="index"
        :element="element"
        :headingLevel="headerElement ? 'h5' : 'h4'"
        :id="`${listTemplateId}-${index}`"
        :dividerBefore="index > 0"
        :dividerAfter="Boolean(globalButton && index === regularElements.length - 1)"
      />
    </ul>

    <!-- Global button at bottom -->
    <ActionButtons
      v-if="globalButton"
      :payload="[globalButton]"
      :action="shouldBeDisabled ? undefined : action"
      buttonClassName="webchat-list-template-global-button"
      :containerClassName="$style.mainButtonWrapper"
      :config="config"
      :dataMessageId="dataMessageId"
      :onEmitAnalytics="onEmitAnalytics"
      size="large"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, useCssModule } from 'vue'
import ListItem from './ListItem.vue'
import ActionButtons from '../common/ActionButtons.vue'
import { useMessageContext } from '../../composables/useMessageContext'
import { getChannelPayload } from '../../utils/matcher'
import { getRandomId } from '../../utils/helpers'
import type { IWebchatTemplateAttachment, IWebchatAttachmentElement } from '../../types'

const $style = useCssModule()

// Message context
const { message, config, action, onEmitAnalytics } = useMessageContext()
const dataMessageId = (window as any).__TEST_MESSAGE_ID__ // For testing

// Get list data from message payload
const payload = computed(() => getChannelPayload(message, config))
const attachment = computed(() => payload.value?.message?.attachment as IWebchatTemplateAttachment | undefined)

// Extract list elements and configuration
const elements = computed(() => {
  return attachment.value?.payload?.elements || []
})

const topElementStyle = computed(() => {
  return attachment.value?.payload?.top_element_style
})

const showTopElementLarge = computed(() => {
  return topElementStyle.value === 'large' || topElementStyle.value === true
})

// Split elements into header and regular items
const headerElement = computed(() => {
  return showTopElementLarge.value ? elements.value[0] : null
})

const regularElements = computed(() => {
  return showTopElementLarge.value ? elements.value.slice(1) : elements.value
})

// Global button (first button in buttons array)
const globalButton = computed(() => {
  const buttons = attachment.value?.payload?.buttons
  return buttons?.[0]
})

// Should buttons be disabled
const shouldBeDisabled = computed(() => {
  // TODO: Add conversation ended check when messageParams available
  return false
})

// Generate unique ID for list
const listTemplateId = getRandomId('webchatListTemplateRoot')

// Auto-focus first focusable element on mount
onMounted(() => {
  if (!config?.settings?.widgetSettings?.enableAutoFocus) return

  const chatHistory = document.getElementById('webchatChatHistoryWrapperLiveLogPanel')
  if (!chatHistory?.contains(document.activeElement)) return

  setTimeout(() => {
    const listTemplateRoot = document.getElementById(listTemplateId)
    // Get the first focusable element within the list and add focus
    const focusable = listTemplateRoot?.querySelectorAll(
      'button, [href], [tabindex]:not([tabindex="-1"])'
    )
    const firstFocusable = focusable?.[0] as HTMLElement
    firstFocusable?.focus()
  }, 200)
})
</script>

<style module>
.wrapper {
  max-width: 295px;
  border-radius: var(--cc-bubble-border-radius, 15px);
  border: 1px solid var(--cc-black-80, rgba(0, 0, 0, 0.8));
  background-color: var(--cc-white, #ffffff);
}

.wrapper .listItemRoot {
  border-top-right-radius: var(--cc-bubble-border-radius, 15px);
  border-top-left-radius: var(--cc-bubble-border-radius, 15px);
}

.list {
  list-style: none;
  padding-inline-start: 0;
  margin-block: 0;
}

.list .listItemRoot {
  list-style: none;
}

.mainButtonWrapper {
  padding: 16px;
}
</style>
