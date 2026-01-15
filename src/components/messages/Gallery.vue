<template>
  <div v-if="elements.length > 0">
    <!-- Single card (no carousel) -->
    <div
      v-if="elements.length === 1"
      :class="['webchat-carousel-template-root', $style.wrapper]"
      data-testid="gallery-message"
    >
      <GalleryItem :slide="elements[0]" :contentId="`${carouselContentId}-0`" />
    </div>

    <!-- Multiple cards (carousel with Swiper) -->
    <Swiper
      v-else
      :modules="modules"
      :space-between="8"
      slides-per-view="auto"
      :navigation="{
        prevEl: '.gallery-button-prev',
        nextEl: '.gallery-button-next',
      }"
      :pagination="{ clickable: true }"
      :a11y="{ slideLabelMessage }"
      :class="['webchat-carousel-template-root', $style.wrapper]"
      data-testid="gallery-message"
    >
      <SwiperSlide
        v-for="(element, index) in elements"
        :key="index"
        style="width: 206px"
      >
        <GalleryItem :slide="element" :contentId="`${carouselContentId}-${index}`" />
      </SwiperSlide>

      <!-- Navigation buttons -->
      <button class="gallery-button-prev">
        <ArrowBackIcon />
      </button>
      <button class="gallery-button-next">
        <ArrowBackIcon />
      </button>
    </Swiper>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, useCssModule } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, A11y } from 'swiper/modules'
import GalleryItem from './GalleryItem.vue'
import { ArrowBackIcon } from '../../assets/svg'
import { useMessageContext } from '../../composables/useMessageContext'
import { getChannelPayload } from '../../utils/matcher'
import { getRandomId } from '../../utils/helpers'
import type { IWebchatTemplateAttachment } from '../../types'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/a11y'

const $style = useCssModule()

// Swiper modules
const modules = [Navigation, Pagination, A11y]

// Message context
const { message, config } = useMessageContext()

// Get gallery elements from message payload
const payload = computed(() => getChannelPayload(message, config))
const elements = computed(() => {
  const attachment = payload.value?.message?.attachment as IWebchatTemplateAttachment | undefined
  return attachment?.payload?.elements || []
})

// Generate unique ID for content
const carouselContentId = getRandomId('webchatCarouselContentButton')

// Slide label for accessibility
const slideLabelMessage = computed(() => {
  const slide = config?.settings?.customTranslations?.ariaLabels?.slide
  const actionButtonPositionText = config?.settings?.customTranslations?.ariaLabels?.actionButtonPositionText

  if (!slide || !actionButtonPositionText) {
    return 'Slide {{index}} of {{slidesLength}}'
  }

  // Replace {position} and {total} with {{index}} and {{slidesLength}} for Swiper
  const customSlidePosition = actionButtonPositionText
    .replace('{position}', '{{index}}')
    .replace('{total}', '{{slidesLength}}')

  return `${slide}: ${customSlidePosition}`
})

// Auto-focus first button/card on mount
onMounted(() => {
  if (!config?.settings?.widgetSettings?.enableAutoFocus) return

  const chatHistory = document.getElementById('webchatChatHistoryWrapperLiveLogPanel')
  if (!chatHistory?.contains(document.activeElement)) return

  setTimeout(() => {
    const firstCardContent = document.getElementById(`${carouselContentId}-0`)
    const firstButton = firstCardContent?.getElementsByTagName('button')?.[0]

    if (firstCardContent?.getAttribute('role') === 'link') {
      firstCardContent?.focus()
    } else if (firstButton) {
      firstButton?.focus()
    }
  }, 200)
})
</script>

<style module>
.slideItem {
  position: relative;
  width: 206px;
  overflow: hidden;
}

/*
** SWIPER MAIN
** The following styles are a porting from the original swiper/css and related modules.
** The idea is to integrate with modules CSS in order to increase the specificity
** and avoid conflicts on consumer apps
*/
:global(article) :global(.swiper).wrapper {
  margin-left: -20px;
  margin-right: -20px;
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 22px;
  padding-top: 0px;
  position: relative;
  overflow: hidden;
  list-style: none;
  /* Fix of Webkit flickering */
  z-index: 1;
  display: block;
}

:global(article) :global(.swiper).wrapper :global(.swiper-wrapper) {
  position: relative;
  width: 100%;
  z-index: 1;
  display: flex;
  transition-property: transform;
  transition-timing-function: initial;
  box-sizing: content-box;
}

:global(article) :global(.swiper).wrapper :global(.swiper-android .swiper-slide),
:global(article) :global(.swiper).wrapper :global(.swiper-ios .swiper-slide),
:global(article) :global(.swiper).wrapper :global(.swiper-wrapper) {
  transform: translate3d(0px, 0, 0);
}

:global(article) :global(.swiper).wrapper :global(.swiper-horizontal) {
  touch-action: pan-y;
}

:global(article) :global(.swiper).wrapper :global(.swiper-slide) {
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  position: relative;
  transition-property: transform;
  display: block;
}

:global(article) :global(.swiper).wrapper :global(.swiper-slide-invisible-blank) {
  visibility: hidden;
}

/*
** SWIPER NAVIGATION (Buttons)
*/
:global(article) :global(.swiper).wrapper :global(.gallery-button-prev),
:global(article) :global(.swiper).wrapper :global(.gallery-button-next) {
  position: absolute;
  top: calc(150px / 2 - 8px);
  z-index: 10;
  cursor: pointer;
  width: 30px;
  height: 30px;
  background-color: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:global(article) :global(.swiper).wrapper :global(.gallery-button-prev) {
  left: 20px;
}

:global(article) :global(.swiper).wrapper :global(.gallery-button-next) {
  right: 20px;
  transform: rotate(180deg);
}

:global(article) :global(.swiper).wrapper :global(.gallery-button-prev:dir(rtl)) {
  left: unset;
  right: 20px;
  transform: rotate(180deg);
}

:global(article) :global(.swiper).wrapper :global(.gallery-button-next:dir(rtl)) {
  right: unset;
  left: 20px;
  transform: rotate(0deg);
}

:global(article) :global(.swiper).wrapper :global(.swiper-button-disabled) {
  opacity: 0;
}

/*
** SWIPER PAGINATION (Dots)
*/
:global(article) :global(.swiper).wrapper :global(.swiper-pagination) {
  position: absolute;
  text-align: center;
  transition: 300ms opacity;
  transform: translate3d(0, 0, 0);
  z-index: 10;
}

:global(article) :global(.swiper).wrapper :global(.swiper-pagination.swiper-pagination-hidden) {
  opacity: 0;
}

:global(article) :global(.swiper).wrapper :global(.swiper-pagination-disabled > .swiper-pagination),
:global(article) :global(.swiper).wrapper :global(.swiper-pagination.swiper-pagination-disabled) {
  display: none !important;
}

:global(article) :global(.swiper).wrapper :global(.swiper-horizontal > .swiper-pagination-bullets),
:global(article) :global(.swiper).wrapper :global(.swiper-pagination-bullets.swiper-pagination-horizontal) {
  bottom: 4px;
  left: 0;
  width: 100%;
}

:global(article) :global(.swiper).wrapper :global(.swiper-pagination-bullet) {
  width: 6px;
  height: 6px;
  display: inline-block;
  border-radius: 50%;
  background: var(--cc-black-50, rgba(0, 0, 0, 0.5));
  opacity: 1;
}

:global(article) :global(.swiper).wrapper :global(.swiper-pagination-bullet):focus {
  background-color: var(--cc-primary-color-focus, #1976d2);
  box-shadow: 0 0 0 4px var(--cc-primary-color-opacity-10, rgba(25, 118, 210, 0.1));
  outline: none;
}

:global(article) :global(.swiper).wrapper :global(.swiper-pagination-bullet):focus-visible {
  outline: 2px solid var(--cc-primary-color-focus, #1976d2);
  outline-offset: 2px;
}

:global(article) :global(.swiper).wrapper :global(button.swiper-pagination-bullet) {
  border: none;
  margin: 0;
  padding: 0;
  box-shadow: none;
  -webkit-appearance: none;
  appearance: none;
}

:global(article) :global(.swiper).wrapper :global(.swiper-pagination-clickable .swiper-pagination-bullet) {
  cursor: pointer;
}

:global(article) :global(.swiper).wrapper :global(.swiper-pagination-bullet:only-child) {
  display: none !important;
}

:global(article) :global(.swiper).wrapper :global(.swiper-pagination-bullet-active) {
  opacity: 1;
  background-color: black;
}

:global(article) :global(.swiper).wrapper :global(.swiper-horizontal > .swiper-pagination-bullets .swiper-pagination-bullet),
:global(article) :global(.swiper).wrapper :global(.swiper-pagination-horizontal.swiper-pagination-bullets .swiper-pagination-bullet) {
  margin: 0 4px;
}
</style>
