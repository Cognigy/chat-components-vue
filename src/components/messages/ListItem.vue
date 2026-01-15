<template>
  <component
    :is="componentTag"
    :class="[isHeaderElement && $style.headerRoot, $style.listItemRoot]"
    :style="{ backgroundImage: isHeaderElement && element.image_url ? backgroundImage : undefined }"
    :data-testid="isHeaderElement ? 'header-image' : 'list-item'"
    :id="id"
  >
    <!-- Divider before item -->
    <div v-if="!isHeaderElement && dividerBefore" :class="$style.divider" />

    <!-- Item content wrapper -->
    <div
      :class="contentClasses"
      :role="defaultActionUrl ? 'link' : undefined"
      :aria-label="defaultActionUrl ? `${titleHtml}. ${opensInNewTabLabel}` : undefined"
      :aria-describedby="element.subtitle ? subtitleId : undefined"
      :tabindex="defaultActionUrl ? 0 : -1"
      :style="defaultActionUrl && !shouldBeDisabled ? { cursor: 'pointer' } : {}"
      @click="handleClick"
      @keydown="handleKeyDown"
    >
      <!-- Header element content -->
      <div
        v-if="isHeaderElement"
        :class="['webchat-list-template-header-content', $style.headerContent, button && $style.headerContentWithButton]"
      >
        <!-- Title and subtitle -->
        <Typography
          v-if="titleHtml"
          :variant="isHeaderElement ? 'h2-semibold' : 'title1-semibold'"
          :component="headingLevel"
          :class="[
            isHeaderElement ? 'webchat-list-template-header-title' : 'webchat-list-template-element-title',
            subtitleHtml ? $style.itemTitleWithSubtitle : $style.itemTitle
          ]"
          :id="isHeaderElement ? `listHeader-${id}` : `listItemHeader-${id}`"
          v-html="titleHtml"
        />

        <Typography
          v-if="subtitleHtml"
          variant="body-regular"
          :class="[
            isHeaderElement ? 'webchat-list-template-header-subtitle' : 'webchat-list-template-element-subtitle',
            $style.itemSubtitle
          ]"
          :id="subtitleId"
          v-html="subtitleHtml"
        />
      </div>

      <!-- Regular list item content -->
      <div
        v-else
        :class="['webchat-list-template-element-content', $style.listItemContent]"
      >
        <div :class="$style.listItemText">
          <!-- Title and subtitle -->
          <Typography
            v-if="titleHtml"
            variant="title1-semibold"
            :component="headingLevel"
            :class="[
              'webchat-list-template-element-title',
              subtitleHtml ? $style.itemTitleWithSubtitle : $style.itemTitle
            ]"
            :id="`listItemHeader-${id}`"
            v-html="titleHtml"
          />

          <Typography
            v-if="subtitleHtml"
            variant="body-regular"
            :class="['webchat-list-template-element-subtitle', $style.itemSubtitle]"
            :id="subtitleId"
            v-html="subtitleHtml"
          />
        </div>

        <!-- Image thumbnail for regular items -->
        <div
          v-if="element.image_url"
          :class="$style.listItemImage"
          :style="{ backgroundImage }"
          data-testid="regular-image"
        >
          <span role="img" :aria-label="element.image_alt_text || ''" />
        </div>
      </div>
    </div>

    <!-- Button for item -->
    <ActionButtons
      v-if="button"
      :payload="[button]"
      :action="shouldBeDisabled ? undefined : action"
      :buttonClassName="isHeaderElement ? 'webchat-list-template-header-button' : 'webchat-list-template-element-button'"
      :containerClassName="isHeaderElement ? $style.listHeaderButtonWrapper : $style.listItemButtonWrapper"
      :config="config"
      :dataMessageId="dataMessageId"
      :onEmitAnalytics="onEmitAnalytics"
      size="large"
    />

    <!-- Divider after item -->
    <div v-if="!isHeaderElement && dividerAfter" :class="$style.divider" />
  </component>
</template>

<script setup lang="ts">
import { computed, useCssModule } from 'vue'
import Typography from '../common/Typography.vue'
import ActionButtons from '../common/ActionButtons.vue'
import { useMessageContext } from '../../composables/useMessageContext'
import { useSanitize } from '../../composables/useSanitize'
import { getRandomId, getBackgroundImage } from '../../utils/helpers'
import { sanitizeUrl } from '@braintree/sanitize-url'
import type { IWebchatAttachmentElement } from '../../types'

interface Props {
  element: IWebchatAttachmentElement
  isHeaderElement?: boolean
  headingLevel?: 'h4' | 'h5'
  id: string
  dividerBefore?: boolean
  dividerAfter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isHeaderElement: false,
  headingLevel: 'h4',
  dividerBefore: false,
  dividerAfter: false,
})

const $style = useCssModule()

// Context
const { action, config, onEmitAnalytics } = useMessageContext()
const dataMessageId = (window as any).__TEST_MESSAGE_ID__ // For testing

// Sanitize HTML
const { processHTML } = useSanitize()
const titleHtml = computed(() => processHTML(props.element.title || ''))
const subtitleHtml = computed(() => processHTML(props.element.subtitle || ''))

// IDs for accessibility
const subtitleId = getRandomId('webchatListTemplateHeaderSubtitle')

// Background image
const backgroundImage = computed(() => {
  if (!props.element.image_url) return undefined
  return getBackgroundImage(props.element.image_url)
})

// Button (only first button is used)
const button = computed(() => {
  return props.element.buttons?.[0]
})

// Default action URL (clickable item)
const defaultActionUrl = computed(() => {
  return props.element.default_action?.url
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

// Component tag (div for header, li for regular items)
const componentTag = computed(() => {
  return props.isHeaderElement ? 'div' : 'li'
})

// Content classes
const contentClasses = computed(() => {
  return props.isHeaderElement
    ? ['webchat-list-template-header', $style.headerContentWrapper]
    : ['webchat-list-template-element', $style.listItemWrapper]
})

// Handle item click (default action)
const handleClick = () => {
  if (shouldBeDisabled.value || !defaultActionUrl.value) return

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
.listItemRoot {
  list-style: none;
}

.divider {
  border-top: 1px solid var(--cc-black-80, rgba(0, 0, 0, 0.8));
}

/* Header element styles */
.headerRoot {
  aspect-ratio: 16/9;
  background-size: cover;
  background-position: center center;
  position: relative;
  display: flex;
  flex-direction: column;
  border-top-right-radius: var(--cc-bubble-border-radius, 15px);
  border-top-left-radius: var(--cc-bubble-border-radius, 15px);
}

.headerRoot::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: hsla(0, 0%, 0%, 0.4); /* image overlay */
  border-radius: inherit;
}

.headerRoot:focus {
  opacity: 0.6;
}

.headerContentWrapper {
  border-radius: inherit;
  position: relative;
  flex-grow: 1;
  align-content: flex-end;
}

.headerContentWrapper:focus-visible {
  outline: 2px solid var(--cc-primary-color-focus, #1976d2);
  box-shadow: inset 0 0 0 2px var(--cc-white, #ffffff);
}

.headerContent {
  padding: 16px 16px 12px 16px;
  color: var(--cc-white, #ffffff);
}

.headerContent > * {
  color: var(--cc-white, #ffffff);
}

.headerContentWithButton {
  padding-bottom: 72px; /* 12px headerContent bottom padding + 44px button height + 16px button bottom padding */
}

/* Title and subtitle styles */
.itemTitle {
  margin-top: 0px;
  margin-bottom: 0px;
}

.itemTitleWithSubtitle {
  margin-top: 0px;
  margin-bottom: 8px;
}

.itemSubtitle {
  margin-top: 0px;
  margin-bottom: 0px;
}

/* Regular list item styles */
.listItemWrapper {
  position: relative;
  display: flex;
}

.listItemWrapper:focus {
  outline: none;
}

.listItemWrapper:focus-visible {
  outline: 2px solid var(--cc-primary-color-focus, #1976d2);
  outline-offset: -10px;
}

.listItemContent {
  padding: 16px 16px 12px 16px;
  overflow-wrap: break-word;
  display: flex;
  -webkit-box-pack: justify;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  width: 100%;
  color: var(--cc-black-20, rgba(0, 0, 0, 0.2));
}

.listItemText {
  width: 100%;
}

.listItemText > * {
  color: var(--cc-black-20, rgba(0, 0, 0, 0.2));
}

.listItemImage {
  background-size: cover;
  background-position: center center;
  border-radius: 10px;
  width: 86px;
  height: 102px;
  flex-shrink: 0;
}

/* Button container styles */
.listHeaderButtonWrapper {
  position: absolute;
  bottom: 16px;
  right: 16px;
  left: 16px;
}

.listItemButtonWrapper {
  padding: 0 16px 16px 16px;
}
</style>
