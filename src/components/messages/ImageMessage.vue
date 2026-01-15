<template>
  <div v-if="imageData.url" :class="$style.wrapper">
    <!-- Thumbnail -->
    <div
      ref="buttonRef"
      :class="imageClasses"
      :tabindex="isDownloadable ? 0 : -1"
      :role="isDownloadable ? 'button' : undefined"
      :aria-label="isDownloadable ? viewImageLabel : undefined"
      @click="handleExpand"
      @keydown="handleKeyDown"
    >
      <span v-if="isImageBroken" :class="$style.brokenImage" />
      <img
        v-else
        :src="imageData.url"
        :alt="imageData.altText || ''"
        @error="handleImageError"
      />
    </div>

    <!-- Download button -->
    <ActionButton
      v-if="imageData.button"
      :button="imageData.button"
      :action="action"
      :config="config"
      :on-emit-analytics="onEmitAnalytics"
      :custom-icon="DownloadIcon"
      :position="1"
      :total="1"
      :class-name="$style.downloadButtonWrapper"
      class="webchat-buttons-template-button"
    />

    <!-- Lightbox modal -->
    <Teleport to="body">
      <div
        v-if="showLightbox"
        role="dialog"
        :aria-label="lightboxLabel"
        :class="$style.lightboxWrapper"
      >
        <div :class="$style.lightboxContent" @click="handleClose">
          <img
            :class="$style.fullImage"
            :alt="imageData.altText"
            :src="imageData.url"
            data-testid="image-lightbox"
            @click.stop
            @touchmove.prevent="handleClose"
          />
        </div>

        <!-- Lightbox Header -->
        <div :class="$style.lightboxHeader">
          <div :class="$style.caption">{{ imageData.altText }}</div>
          <div :class="$style.iconsGroup">
            <button
              ref="downloadButtonRef"
              :class="$style.icon"
              :aria-label="downloadLabel"
              @click="handleDownload"
              @keydown="handleKeyDownload"
            >
              <DownloadIcon />
            </button>
            <button
              :class="$style.icon"
              :aria-label="closeLabel"
              @click="handleClose"
              @keydown="handleKeyClose"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, useCssModule } from 'vue'
import { useMessageContext } from '../../composables/useMessageContext'
import { getChannelPayload } from '../../utils/matcher'
import ActionButton from '../common/ActionButton.vue'
import { DownloadIcon, CloseIcon } from '../../assets/svg'
import type { IWebchatImageAttachment, IWebchatButton } from '../../types'

const { message, config, action, onEmitAnalytics } = useMessageContext()

const $style = useCssModule()

// State
const showLightbox = ref(false)
const isImageBroken = ref(false)
const buttonRef = ref<HTMLDivElement>()
const downloadButtonRef = ref<HTMLButtonElement>()

// Get image data from message payload
const payload = computed(() => getChannelPayload(message, config))
const imageData = computed(() => {
  const attachment = payload.value?.message?.attachment as IWebchatImageAttachment
  return {
    url: attachment?.payload?.url || '',
    altText: attachment?.payload?.altText,
    buttons: attachment?.payload?.buttons,
    button: attachment?.payload?.buttons?.[0],
  }
})

// Check if image is downloadable (has a web_url button)
const isDownloadable = computed(() => {
  const buttons = imageData.value.buttons as IWebchatButton[] | undefined
  return buttons?.some(button => 'type' in button && button.type === 'web_url') ?? false
})

// Dynamic aspect ratio setting
const isDynamicRatio = computed(() => !!config?.settings?.layout?.dynamicImageAspectRatio)

const imageClasses = computed(() => {
  return {
    [$style.fixedImage]: isDynamicRatio.value,
    [$style.flexImage]: !isDynamicRatio.value,
    [$style.webchatMediaTemplateImage]: true,
    [$style.downloadable]: isDownloadable.value,
  }
})

// Translations
const viewImageLabel = computed(() =>
  config?.settings?.customTranslations?.ariaLabels?.viewImageInFullsize || 'View full-size image'
)
const lightboxLabel = computed(() =>
  config?.settings?.customTranslations?.ariaLabels?.fullSizeImageViewerTitle || 'Full-size image viewer'
)
const downloadLabel = computed(() =>
  config?.settings?.customTranslations?.ariaLabels?.downloadFullsizeImage || 'Download full-size image'
)
const closeLabel = computed(() =>
  config?.settings?.customTranslations?.ariaLabels?.closeFullsizeImageModal || 'Close full-size image viewer'
)

// Handlers
const handleExpand = () => {
  if (isDownloadable.value) {
    showLightbox.value = true
    // Focus the download button after lightbox opens
    nextTick(() => {
      downloadButtonRef.value?.focus()
    })
  }
}

const handleClose = () => {
  showLightbox.value = false
  // Restore focus to thumbnail button
  nextTick(() => {
    buttonRef.value?.focus()
  })
}

const handleDownload = () => {
  window.open(imageData.value.url, '_blank')
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleExpand()
  }
}

const handleKeyDownload = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleDownload()
  }
}

const handleKeyClose = (event: KeyboardEvent) => {
  if (event.key === 'Tab' || event.shiftKey) {
    downloadButtonRef.value?.focus()
    event.preventDefault()
  }
  if (event.key === 'Enter') {
    handleClose()
  }
}

const handleImageError = () => {
  isImageBroken.value = true
}

// Escape key listener for lightbox
const handleEscape = (event: KeyboardEvent) => {
  if (event.code === 'Escape' && showLightbox.value) {
    handleClose()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape)
})
</script>

<style module>
.wrapper {
  position: relative;
  border-radius: var(--cc-bubble-border-radius, 15px);
  max-width: 295px;
  width: 100%;
  outline: none;
}

.wrapper .fixedImage,
.wrapper .flexImage {
  border-top-left-radius: var(--cc-bubble-border-radius, 15px);
  border-top-right-radius: var(--cc-bubble-border-radius, 15px);
}

.wrapper .fixedImage:focus-visible,
.wrapper .flexImage:focus-visible {
  outline: 2px solid var(--cc-primary-color-focus, #1976d2);
}

.wrapper img {
  border-radius: var(--cc-bubble-border-radius, 15px);
  width: 100%;
  display: block;
  outline: none;
}

.downloadable {
  background-color: var(--cc-white, #ffffff);
  cursor: pointer;
  border: 1px solid var(--cc-black-80, rgba(0, 0, 0, 0.8));
}

.downloadable img {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
}

.downloadable img:hover,
.downloadable img:focus {
  opacity: 0.8;
}

.flexImage img {
  aspect-ratio: 16/9;
  object-fit: cover;
  object-position: left;
}

.fixedImage img {
  height: auto;
}

.webchatMediaTemplateImage {
  /* Base class for image containers */
}

.downloadButtonWrapper {
  padding: 16px;
}

.brokenImage {
  aspect-ratio: 16/9;
  width: 100%;
  display: block;
  outline: none;
  border-radius: var(--cc-bubble-border-radius, 15px);
  background-color: var(--cc-black-80, rgba(0, 0, 0, 0.8));
}

/* Lightbox styles */
.lightboxWrapper {
  position: fixed;
  z-index: 5000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  touch-action: none;
  overflow: hidden;
}

.lightboxContent {
  position: relative;
  height: 100%;
  width: 100%;
}

.fullImage {
  position: absolute;
  top: 50%;
  left: 50%;
  max-width: 100%;
  max-height: 100%;
  height: auto;
  transform: translate3d(-50%, -50%, 0);
  overflow: hidden;
}

/* Lightbox Header */
.lightboxHeader {
  position: absolute;
  top: 0;
  height: 56px;
  width: 100%;
  background-color: var(--cc-white, #ffffff);
  overflow: hidden;
  display: flex;
  justify-content: space-between;
}

.caption {
  display: flex;
  align-items: center;
  margin-left: 15px;
  color: var(--cc-black-10, #1a1a1a);
  font-weight: 700;
  font-size: 16px;
}

.iconsGroup {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background-color: transparent;
  border: none;
  outline: none;
  margin: 0;
  transition: background-color 0.1s ease-out, color 0.1s ease-out, fill 0.1s ease-out;
  color: var(--cc-black-10, #1a1a1a);
  border-radius: 50%;
  cursor: pointer;
  width: 40px;
  height: 40px;
}

.icon:hover,
.icon:focus {
  background-color: var(--cc-black-95, #f5f5f5);
  opacity: 0.85;
}

.icon:focus-visible {
  border: 2px solid var(--cc-primary-color-focus, #1976d2);
}

.icon svg {
  fill: var(--cc-black-10, #1a1a1a);
}
</style>
