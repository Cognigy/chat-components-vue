<script setup lang="ts">
import { computed, useCssModule } from 'vue'
import { sanitizeUrl } from '@braintree/sanitize-url'
import Typography from './Typography.vue'
import LinkIcon from './LinkIcon.vue'
import { sanitizeHTMLWithConfig } from '../../utils/sanitize'
import { getWebchatButtonLabel, interpolateString, moveFocusToMessageFocusTarget } from '../../utils/helpers'
import type { IWebchatButton, IWebchatQuickReply, ChatConfig, MessageSender, CustomIcon, AnalyticsEventCallback } from '../../types'

type NormalizedActionButton = {
  type?: string
  content_type?: string
  contentType?: string
  title?: string
  payload?: string
  url?: string
  target?: string
  image_url?: string
  imageUrl?: string
  image_alt_text?: string
  imageAltText?: string
}

interface Props {
  button: (IWebchatButton | IWebchatQuickReply) & NormalizedActionButton
  action?: MessageSender
  disabled?: boolean
  total: number
  position: number
  customIcon?: CustomIcon
  showUrlIcon?: boolean
  config?: ChatConfig
  dataMessageId?: string
  onEmitAnalytics?: AnalyticsEventCallback
  size?: 'small' | 'large'
  id?: string
  className?: string
  openXAppOverlay?: (url: string | undefined) => void
}

const props = withDefaults(defineProps<Props>(), {
  action: undefined,
  disabled: false,
  customIcon: undefined,
  showUrlIcon: false,
  config: undefined,
  dataMessageId: undefined,
  onEmitAnalytics: undefined,
  size: 'small',
  id: undefined,
  className: '',
  openXAppOverlay: undefined,
})

const styles = useCssModule()

// Determine button type
const buttonType = computed(() => {
  return props.button.type ?? props.button.content_type ?? props.button.contentType ?? null
})

// Get button image
const buttonImage = computed(() => {
  if ('image_url' in props.button) return props.button.image_url
  if ('imageUrl' in props.button) return props.button.imageUrl
  return null
})

// Get button image alt text
const buttonImageAltText = computed(() => {
  if ('image_alt_text' in props.button) return props.button.image_alt_text
  if ('imageAltText' in props.button) return props.button.imageAltText
  return ''
})

// Get button label
const buttonLabel = computed(() => {
  return getWebchatButtonLabel(props.button) || ''
})

// Sanitize button label HTML
const sanitizedLabel = computed(() => {
  const customAllowedHtmlTags = props.config?.settings?.widgetSettings?.customAllowedHtmlTags
  return props.config?.settings?.layout?.disableHtmlContentSanitization
    ? buttonLabel.value
    : sanitizeHTMLWithConfig(buttonLabel.value, customAllowedHtmlTags)
})

// Check if phone number button
const isPhoneNumber = computed(() => {
  return props.button.payload && (buttonType.value === 'phone_number' || buttonType.value === 'user_phone_number')
})

// Check if web URL button
const isWebURL = computed(() => {
  return 'type' in props.button && props.button.type === 'web_url'
})

// Check if opens in new tab
const isWebURLButtonTargetBlank = computed(() => {
  return isWebURL.value && props.button.target !== '_self'
})

// Get aria-label
const ariaLabel = computed(() => {
  const buttonTitle = props.button.title || ''
  const opensInNewTabLabel = props.config?.settings?.customTranslations?.ariaLabels?.opensInNewTab || 'Opens in new tab'

  const isURLInNewTab = isWebURL.value && isWebURLButtonTargetBlank.value
  const newTabURLButtonTitle = `${buttonTitle}. ${opensInNewTabLabel}`
  const buttonTitleWithTarget = isURLInNewTab ? newTabURLButtonTitle : props.button.title

  if (props.total > 1) {
    return (
      interpolateString(
        props.config?.settings?.customTranslations?.ariaLabels?.actionButtonPositionText ?? '{position} of {total}',
        {
          position: props.position.toString(),
          total: props.total.toString(),
        }
      ) +
      ': ' +
      buttonTitleWithTarget
    )
  } else if (props.total <= 1 && isURLInNewTab) {
    return newTabURLButtonTitle
  }

  return undefined
})

// Determine which component to render
const componentTag = computed(() => {
  const isURLComponent = isWebURL.value || isPhoneNumber.value
  if (!isURLComponent) return 'button'
  return 'a'
})

// Get href for anchor tags
const href = computed(() => {
  if (isPhoneNumber.value && props.button.payload) {
    return `tel:${props.button.payload}`
  }
  if (isWebURL.value && props.button.url) {
    return props.button.url
  }
  return undefined
})

// Get target for anchor tags
const target = computed(() => {
  if (isWebURL.value) {
    return props.button.target
  }
  return undefined
})

// CSS classes
const buttonClasses = computed(() => {
  const classes = [styles.button]
  if (isWebURL.value) classes.push(styles.url)
  if (props.className) classes.push(props.className)
  if (props.disabled) {
    classes.push(styles.disabled)
    classes.push('disabled')
  }
  if (isPhoneNumber.value) classes.push('phone-number-or-url-anchor')
  if (isWebURL.value) classes.push('phone-number-or-url-anchor')
  return classes
})

// Handle button click
const handleClick = (event: MouseEvent) => {
  event.stopPropagation()
  props.onEmitAnalytics?.('action', props.button)

  if (isPhoneNumber.value) {
    if (props.disabled) {
      event.preventDefault()
    }
    return
  }

  if (isWebURL.value) {
    const url = props.config?.settings?.layout?.disableUrlButtonSanitization
      ? props.button.url
      : sanitizeUrl(props.button.url)

    // Prevent no-ops from sending you to a blank page
    if (url === 'about:blank') return

    window.open(url, isWebURLButtonTargetBlank.value ? '_blank' : '_self')
  }

  if (props.disabled) return

  event.preventDefault()

  if (isWebURL.value) {
    return
  }

  if (buttonType.value === 'openXApp') {
    props.openXAppOverlay?.(props.button.payload)
    return
  }

  props.action?.(props.button.payload, null, { label: props.button.title })

  focusHandling()
}

// Focus handling after action
const focusHandling = () => {
  // Focus the input after postback button click, if focusInputAfterPostback is true
  if (props.config?.settings?.behavior?.focusInputAfterPostback) {
    const textMessageInput = document.getElementById('webchatInputMessageInputInTextMode')
    textMessageInput?.focus?.()
    return
  }

  // Focus the visually hidden focus target after postback
  if (props.dataMessageId) {
    moveFocusToMessageFocusTarget(props.dataMessageId)
  }
}

// Render icon
const showIcon = computed(() => {
  if (props.customIcon) return true
  if (isWebURL.value && props.showUrlIcon) return true
  return false
})
</script>

<template>
  <component
    :is="componentTag"
    :id="id"
    :href="href"
    :target="target"
    :class="buttonClasses"
    :aria-label="ariaLabel"
    :aria-disabled="disabled"
    :disabled="componentTag === 'button' ? disabled : undefined"
    :tabindex="disabled ? -1 : 0"
    @click="handleClick"
  >
    <div v-if="buttonImage" :class="styles.buttonImageContainer">
      <img
        :src="buttonImage"
        :alt="buttonImageAltText"
        :class="[
          'webchat-template-button-image',
          styles.buttonImage,
          disabled && styles.imageDisabled
        ]"
      />
    </div>

    <Typography
      :variant="size === 'large' ? 'title1-semibold' : 'cta-semibold'"
      component="span"
      :class="buttonImage && styles.buttonLabelWithImage"
      v-html="sanitizedLabel"
    />

    <slot v-if="customIcon" name="icon" />
    <LinkIcon v-else-if="showIcon && isWebURL && showUrlIcon" />
  </component>
</template>

<style module>
button.button,
a.button {
  border-radius: 19px;
  padding: 8px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;
  background: var(--cc-primary-color);
  color: var(--cc-primary-contrast-color);
  border: none;
  outline: none;
  position: relative;
}

a.button:global(.phone-number-or-url-anchor) {
  background: var(--cc-primary-color);
}

button.button svg,
a.button svg,
button.button path,
a.button svg path {
  fill: var(--cc-primary-contrast-color);
  width: 12px;
}

button.button:hover,
a.button:hover,
button.button:focus,
a.button:focus {
  background: var(--cc-primary-color-hover);
}

/* Explicitly increase the specificity of the :focus-visible selector */
[data-cognigy-webchat-root] button.button:focus-visible,
[data-cognigy-webchat-root] a.button:focus-visible,
[data-cognigy-webchat-root] a.button:global(.phone-number-or-url-anchor):focus-visible {
  outline: 2px solid var(--cc-primary-color-focus);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px var(--cc-primary-contrast-color);
}

button.button:disabled,
button.button:disabled:hover,
button.button:disabled:focus,
a.button.disabled,
a.button.disabled:hover,
a.button.disabled:focus {
  background: var(--cc-primary-color-disabled);
  cursor: default;
  pointer-events: none;
}

.buttonLabelWithImage {
  margin-left: 40px;
}

.buttonImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-top-left-radius: 19px;
  border-bottom-left-radius: 19px;
}

.buttonImage.imageDisabled {
  opacity: 0.6;
}

.buttonImageContainer {
  display: flex;
  position: absolute;
  left: 0;
  width: 40px;
  height: 100%;
  border-right: 2px solid var(--cc-primary-contrast-color);
}
</style>
