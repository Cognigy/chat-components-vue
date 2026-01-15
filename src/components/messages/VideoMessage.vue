<template>
  <div v-if="videoData.url" :class="wrapperClasses">
    <div
      ref="playerWrapperRef"
      :class="[$style.playerWrapper, 'webchat-media-template-video']"
      :role="showLightMode ? 'button' : undefined"
      :tabindex="showLightMode ? 0 : -1"
      :aria-label="showLightMode ? playVideoLabel : undefined"
      data-testid="video-message"
      @keydown="handleKeyDown"
    >
      <!-- Light mode overlay with play button -->
      <div
        v-if="showLightMode"
        :class="$style.lightOverlay"
        @click="startPlaying"
      >
        <VideoPlayIcon width="35" height="35" />
      </div>

      <!-- YouTube embed -->
      <iframe
        v-if="videoType === 'youtube'"
        ref="videoRef"
        :class="$style.player"
        :src="youtubeEmbedUrl"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        :title="videoData.altText || 'Video player'"
      />

      <!-- Vimeo embed -->
      <iframe
        v-else-if="videoType === 'vimeo'"
        ref="videoRef"
        :class="$style.player"
        :src="vimeoEmbedUrl"
        frameborder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen
        :title="videoData.altText || 'Video player'"
      />

      <!-- Direct video file -->
      <video
        v-else
        ref="videoRef"
        :class="$style.player"
        controls
        :crossorigin="videoData.captionsUrl ? 'anonymous' : undefined"
        @play="handlePlay"
        @pause="handlePause"
      >
        <source :src="videoData.url" />
        <track
          v-if="videoData.captionsUrl"
          kind="subtitles"
          :src="videoData.captionsUrl"
          srclang="en-US"
          label="English"
          default
        />
        Your browser does not support the video tag.
      </video>
    </div>

    <!-- Download transcript button -->
    <div v-if="videoData.altText" :class="$style.downloadButtonWrapper">
      <button
        :class="[$style.downloadButton, 'webchat-buttons-template-button-video']"
        @click="downloadTranscript"
      >
        <DownloadIcon :class="$style.downloadIcon" />
        Download Transcript
      </button>
      <a
        ref="downloadLinkRef"
        :href="transcriptDataUrl"
        download="video-transcript.txt"
        style="display: none"
        aria-hidden="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, useCssModule } from 'vue'
import { useMessageContext } from '../../composables/useMessageContext'
import { getChannelPayload } from '../../utils/matcher'
import { DownloadIcon, VideoPlayIcon } from '../../assets/svg'
import type { IWebchatVideoAttachment } from '../../types'

const { message, config } = useMessageContext()

const $style = useCssModule()

// Refs
const playerWrapperRef = ref<HTMLDivElement>()
const videoRef = ref<HTMLVideoElement | HTMLIFrameElement>()
const downloadLinkRef = ref<HTMLAnchorElement>()

// State
const playing = ref(false)
const hasStarted = ref(false)

// Get video data from message payload
const payload = computed(() => getChannelPayload(message, config))
const videoData = computed(() => {
  const attachment = payload.value?.message?.attachment as IWebchatVideoAttachment
  return {
    url: attachment?.payload?.url || '',
    altText: attachment?.payload?.altText,
    captionsUrl: attachment?.payload?.captionsUrl,
  }
})

// Detect video type (YouTube, Vimeo, or direct)
const videoType = computed(() => {
  const url = videoData.value.url
  if (!url) return 'direct'

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube'
  }
  if (url.includes('vimeo.com')) {
    return 'vimeo'
  }
  return 'direct'
})

// Extract YouTube video ID
const youtubeVideoId = computed(() => {
  const url = videoData.value.url
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[7].length === 11 ? match[7] : null
})

// YouTube embed URL
const youtubeEmbedUrl = computed(() => {
  if (!youtubeVideoId.value) return ''
  return `https://www.youtube.com/embed/${youtubeVideoId.value}?enablejsapi=1`
})

// Extract Vimeo video ID
const vimeoVideoId = computed(() => {
  const url = videoData.value.url
  const regExp = /vimeo.com\/(\d+)/
  const match = url.match(regExp)
  return match ? match[1] : null
})

// Vimeo embed URL
const vimeoEmbedUrl = computed(() => {
  if (!vimeoVideoId.value) return ''
  return `https://player.vimeo.com/video/${vimeoVideoId.value}`
})

// Show light mode (preview) only for direct videos before they start
const showLightMode = computed(() => {
  if (videoType.value !== 'direct') return false
  return !hasStarted.value
})

// Wrapper classes
const wrapperClasses = computed(() => {
  return {
    [$style.wrapper]: true,
    [$style.wrapperWithButton]: !!videoData.value.altText,
  }
})

// Transcript data URL for download
const transcriptDataUrl = computed(() => {
  const text = videoData.value.altText || ''
  return `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
})

// Translations
const playVideoLabel = computed(() =>
  config?.settings?.customTranslations?.ariaLabels?.playVideo || 'Play video'
)

// Handlers
const startPlaying = () => {
  hasStarted.value = true
  if (videoRef.value && 'play' in videoRef.value) {
    (videoRef.value as HTMLVideoElement).play()
  }
}

const handlePlay = () => {
  playing.value = true
  hasStarted.value = true
}

const handlePause = () => {
  playing.value = false
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (showLightMode.value && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    event.stopPropagation()
    startPlaying()
  }
}

const downloadTranscript = () => {
  downloadLinkRef.value?.click()
}

// Auto-focus video on mount if configured
onMounted(() => {
  if (!config?.settings?.widgetSettings?.enableAutoFocus) return

  const chatHistory = document.getElementById('webchatChatHistoryWrapperLiveLogPanel')
  if (!chatHistory?.contains(document.activeElement)) return

  setTimeout(() => {
    if (videoRef.value && 'focus' in videoRef.value) {
      (videoRef.value as HTMLVideoElement).focus()
    }
  }, 100)
})
</script>

<style module>
.wrapper {
  border-radius: var(--cc-bubble-border-radius, 15px);
  max-width: 295px;
  position: relative;
}

.player {
  aspect-ratio: 16/9;
  max-width: 295px;
  object-fit: cover;
  object-position: left;
  overflow: hidden;
  border-radius: var(--cc-bubble-border-radius, 15px);
  width: 100%;
  display: block;
}

.player video {
  max-width: 295px;
  object-fit: cover;
  object-position: left;
  overflow: hidden;
}

.wrapperWithButton {
  border: 1px solid var(--cc-black-80, rgba(0, 0, 0, 0.8));
}

.wrapperWithButton .player {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
}

.downloadButtonWrapper {
  padding: 16px;
  background-color: var(--cc-white, #ffffff);
  border-bottom-left-radius: var(--cc-bubble-border-radius, 15px);
  border-bottom-right-radius: var(--cc-bubble-border-radius, 15px);
}

.downloadButton {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  background-color: var(--cc-primary-color, #1976d2);
  color: var(--cc-primary-contrast-color, #ffffff);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.downloadButton:hover {
  background-color: var(--cc-primary-color-hover, #1565c0);
}

.downloadButton:focus-visible {
  outline: 2px solid var(--cc-primary-color-focus, #1976d2);
  outline-offset: 2px;
}

.downloadIcon {
  width: 12px;
  height: 12px;
}

.downloadIcon :deep(path) {
  fill: var(--cc-primary-contrast-color, #ffffff);
}

.playerWrapper {
  position: relative;
}

.playerWrapper:focus .player,
.player:focus-within {
  outline: 2px solid var(--cc-primary-color-focus, #1976d2);
}

.playerWrapper:focus,
.player video:focus {
  outline: none;
}

/* Light mode overlay */
.lightOverlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--cc-black-10, #1a1a1a);
  border-radius: var(--cc-bubble-border-radius, 15px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
}

.lightOverlay:hover,
.lightOverlay:focus {
  opacity: 0.85;
}

.lightOverlay:hover svg circle,
.lightOverlay:focus svg circle {
  fill-opacity: 1;
}
</style>
