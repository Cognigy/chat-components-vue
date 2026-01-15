<template>
  <div :class="['webchat-carousel-template-frame', $style.slideItem]">
    <!-- Top section with image and title overlay -->
    <div :class="[$style.top, hasExtraInfo && $style.hasExtraInfo]">
      <Typography
        variant="body-semibold"
        component="h4"
        :class="'webchat-carousel-template-title'"
        :id="titleId"
        v-html="titleHtml"
      />

      <!-- Image or broken image placeholder -->
      <span v-if="isImageBroken" :class="$style.brokenImage" />
      <img
        v-else
        :src="slide.image_url"
        :alt="slide.image_alt_text || ''"
        :class="$style.slideImage"
        @error="handleImageError"
      />
    </div>

    <!-- Bottom section with subtitle and buttons -->
    <div
      v-if="hasExtraInfo"
      :class="['webchat-carousel-template-content', $style.bottom]"
      :role="defaultActionUrl ? 'link' : undefined"
      :id="contentId"
      :aria-describedby="defaultActionUrl && slide.subtitle ? subtitleId : undefined"
      :aria-labelledby="defaultActionUrl && slide.title ? titleId : undefined"
      :aria-label="defaultActionUrl ? `${titleHtml}. ${opensInNewTabLabel}` : undefined"
      :tabindex="defaultActionUrl ? 0 : undefined"
      @click="handleClick"
      @keydown="handleKeyDown"
    >
      <!-- Subtitle -->
      <Typography
        v-if="slide.subtitle"
        variant="body-regular"
        :class="'webchat-carousel-template-subtitle'"
        :id="subtitleId"
        v-html="subtitleHtml"
      />

      <!-- Action buttons -->
      <ActionButtons
        v-if="slide.buttons && slide.buttons.length > 0"
        :payload="slide.buttons"
        :action="shouldBeDisabled ? undefined : action"
        :buttonClassName="buttonClassName"
        :buttonListItemClassName="$style.buttonListItem"
        :config="config"
        :dataMessageId="dataMessageId"
        :onEmitAnalytics="onEmitAnalytics"
        :templateTextId="slide.title ? titleId : undefined"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useCssModule } from 'vue'
import Typography from '../common/Typography.vue'
import ActionButtons from '../common/ActionButtons.vue'
import { useMessageContext } from '../../composables/useMessageContext'
import { useSanitize } from '../../composables/useSanitize'
import { getRandomId } from '../../utils/helpers'
import { sanitizeUrl } from '@braintree/sanitize-url'
import type { IWebchatAttachmentElement } from '../../types'

interface Props {
  slide: IWebchatAttachmentElement
  contentId: string
}

const props = defineProps<Props>()

const $style = useCssModule()

// Context and config
const { action, config, onEmitAnalytics } = useMessageContext()
const dataMessageId = (window as any).__TEST_MESSAGE_ID__ // For testing

// Sanitize HTML
const { processHTML } = useSanitize()
const titleHtml = computed(() => processHTML(props.slide.title || ''))
const subtitleHtml = computed(() => processHTML(props.slide.subtitle || ''))

// IDs for accessibility
const titleId = getRandomId('webchatCarouselTemplateTitle')
const subtitleId = getRandomId('webchatCarouselTemplateSubtitle')

// Image state
const isImageBroken = ref(false)
const handleImageError = () => {
  isImageBroken.value = true
}

// Check if card has extra info (subtitle or buttons)
const hasExtraInfo = computed(() => {
  return !!(props.slide.subtitle || (props.slide.buttons && props.slide.buttons.length > 0))
})

// Default action URL (clickable card)
const defaultActionUrl = computed(() => {
  return props.slide.default_action?.url
})

// Should buttons be disabled
const shouldBeDisabled = computed(() => {
  // TODO: Add conversation ended check when messageParams available
  return false
})

// Translations
const opensInNewTabLabel = computed(() => {
  return config?.settings?.customTranslations?.ariaLabels?.opensInNewTab || 'Opens in new tab'
})

// Button class name
const buttonClassName = computed(() => {
  return 'webchat-carousel-template-button'
})

// Handle card click (default action)
const handleClick = () => {
  if (!defaultActionUrl.value) return

  const url = config?.settings?.layout?.disableUrlButtonSanitization
    ? defaultActionUrl.value
    : sanitizeUrl(defaultActionUrl.value)

  // Prevent no-ops from sending you to a blank page
  if (url === 'about:blank') return

  window.open(url)
}

// Handle keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  if (defaultActionUrl.value && event.key === 'Enter') {
    handleClick()
  }
}
</script>

<style module>
.slideItem {
  position: relative;
  width: 206px;
  overflow: hidden;
}

.slideItem .top {
  position: relative;
  border-radius: var(--cc-bubble-border-radius, 15px);
}

.slideItem .bottom {
  border-bottom-left-radius: var(--cc-bubble-border-radius, 15px);
  border-bottom-right-radius: var(--cc-bubble-border-radius, 15px);
  border: 1px solid var(--cc-black-80, rgba(0, 0, 0, 0.8));
  background-color: var(--cc-white, #ffffff);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  cursor: pointer;
}

.slideItem .top img {
  aspect-ratio: 206/150;
  object-fit: cover;
  object-position: left;
  border-radius: var(--cc-bubble-border-radius, 15px);
  width: 100%;
  display: block;
  outline: none;
}

.slideItem .brokenImage {
  aspect-ratio: 206/150;
  width: 100%;
  display: block;
  outline: none;
  border-radius: var(--cc-bubble-border-radius, 15px);
  background-color: var(--cc-black-80, rgba(0, 0, 0, 0.8));
}

.slideItem .hasExtraInfo,
.slideItem .hasExtraInfo img,
.slideItem .brokenImage {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
}

.slideItem .top h4 {
  position: absolute;
  margin: 0px;
  margin-inline-start: 8px;
  bottom: 10px;
  color: var(--cc-white, #ffffff);
}

.slideItem .bottom p {
  padding: 0px;
  margin: 0px;
}

.slideItem .bottom .buttonListItem {
  width: 100%;
}
</style>
