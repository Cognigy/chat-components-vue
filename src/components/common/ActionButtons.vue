<script setup lang="ts">
import { computed, useCssModule, onMounted, CSSProperties } from 'vue'
import ActionButton from './ActionButton.vue'
import { getRandomId } from '../../utils/helpers'
import type { IWebchatButton, IWebchatQuickReply, ChatConfig, MessageSender } from '../../types'

type ButtonPayloadCompatibility = {
  contentType?: string
}

interface Props {
  payload: IWebchatButton[] | Array<IWebchatQuickReply & ButtonPayloadCompatibility>
  action?: MessageSender
  className?: string
  containerClassName?: string
  containerStyle?: CSSProperties
  buttonClassName?: string
  buttonListItemClassName?: string
  customIcon?: any
  showUrlIcon?: boolean
  config?: ChatConfig
  dataMessageId?: string
  onEmitAnalytics?: (event: string, data: any) => void
  size?: 'small' | 'large'
  templateTextId?: string
  openXAppOverlay?: (url: string | undefined) => void
}

const props = withDefaults(defineProps<Props>(), {
  action: undefined,
  className: '',
  containerClassName: '',
  containerStyle: undefined,
  buttonClassName: '',
  buttonListItemClassName: '',
  customIcon: undefined,
  showUrlIcon: false,
  config: undefined,
  dataMessageId: undefined,
  onEmitAnalytics: undefined,
  size: 'small',
  templateTextId: undefined,
  openXAppOverlay: undefined,
})

const styles = useCssModule()

// Generate unique ID for buttons
const webchatButtonTemplateButtonId = getRandomId('webchatButtonTemplateButton')

// Auto-focus first button on mount if enabled
onMounted(() => {
  if (!props.config?.settings?.widgetSettings?.enableAutoFocus) return

  const firstButton = document.getElementById(`${webchatButtonTemplateButtonId}-0`)
  const chatHistory = document.getElementById('webchatChatHistoryWrapperLiveLogPanel')

  if (!chatHistory?.contains(document.activeElement)) return

  setTimeout(() => {
    firstButton?.focus()
  }, 200)
})

// Filter valid buttons
const buttons = computed(() => {
  if (!props.payload || props.payload?.length === 0) return []

  return props.payload.filter((button: Props['payload'][number]) => {
    // Filter by type
    if ('type' in button && !['postback', 'web_url', 'phone_number', 'openXApp'].includes(button.type)) {
      return false
    }

    // Filter text content_type buttons without title
    if ('content_type' in button && button.content_type === 'text' && !button.title) {
      return false
    }

    return true
  })
})

// Determine container component type
const componentTag = computed(() => {
  return buttons.value.length > 1 ? 'ul' : 'div'
})

// Container classes
const containerClasses = computed(() => {
  const classes = [props.className, styles.buttons, props.containerClassName]
  return classes.filter(Boolean).join(' ')
})
</script>

<template>
  <component
    :is="componentTag"
    v-if="buttons.length > 0"
    :class="containerClasses"
    :style="containerStyle || {}"
    :aria-labelledby="templateTextId"
    data-testid="action-buttons"
  >
    <template v-if="buttons.length > 1">
      <li
        v-for="(button, index) in buttons"
        :key="`${webchatButtonTemplateButtonId}-${index}`"
        :class="buttonListItemClassName"
        :aria-posinset="index + 1"
        :aria-setsize="buttons.length"
      >
        <ActionButton
          :id="`${webchatButtonTemplateButtonId}-${index}`"
          :button="button"
          :action="action"
          :disabled="action === undefined"
          :position="index + 1"
          :total="buttons.length"
          :custom-icon="customIcon"
          :show-url-icon="showUrlIcon"
          :config="config"
          :on-emit-analytics="onEmitAnalytics"
          :size="size"
          :data-message-id="dataMessageId"
          :class-name="buttonClassName"
          :open-x-app-overlay="openXAppOverlay"
        />
      </li>
    </template>

    <template v-else>
      <ActionButton
        v-for="(button, index) in buttons"
        :id="`${webchatButtonTemplateButtonId}-${index}`"
        :key="`${webchatButtonTemplateButtonId}-${index}`"
        :button="button"
        :action="action"
        :disabled="action === undefined"
        :position="index + 1"
        :total="buttons.length"
        :custom-icon="customIcon"
        :show-url-icon="showUrlIcon"
        :config="config"
        :on-emit-analytics="onEmitAnalytics"
        :size="size"
        :data-message-id="dataMessageId"
        :class-name="buttonClassName"
        :open-x-app-overlay="openXAppOverlay"
      />
    </template>
  </component>
</template>

<style module>
.buttons {
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 295px;
}

ul.buttons {
  list-style: none;
  padding-inline-start: 0;
  margin-block: 0;
}

ul.buttons li {
  list-style: none;
}
</style>
