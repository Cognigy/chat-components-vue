<template>
  <div v-if="audioData.url" :class="[$style.wrapper, 'webchat-media-template-audio']" data-testid="audio-message">
    <!-- Hidden audio element -->
    <audio
      ref="audioRef"
      :src="audioData.url"
      @play="handlePlay"
      @pause="handlePause"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
      @ended="handleEnded"
      style="display: none"
    />

    <!-- Custom controls -->
    <div :class="$style.audioWrapper" data-testid="audio-controls">
      <div :class="$style.controls">
        <!-- Time remaining -->
        <div class="duration">
          <time>{{ formattedTime }}</time>
        </div>

        <!-- Progress bar -->
        <div :class="$style.progressBar">
          <input
            type="range"
            min="0"
            max="0.999999"
            step="any"
            :value="progress"
            :aria-valuetext="audioTimeValueText"
            :aria-label="audioPlaybackProgressLabel"
            :style="progressBarStyle"
            @mousedown="handleSeekStart"
            @touchstart="handleSeekStart"
            @input="handleSeekChange"
            @mouseup="handleSeekEnd"
            @touchend="handleSeekEnd"
          />
        </div>

        <!-- Play/pause button -->
        <div class="buttons">
          <button
            :class="$style.playButton"
            :aria-label="playing ? pauseAudioLabel : playAudioLabel"
            @click="togglePlayPause"
          >
            <AudioPauseIcon v-if="playing" />
            <AudioPlayIcon v-else />
          </button>
        </div>
      </div>

      <!-- Download transcript button -->
      <button
        v-if="audioData.altText"
        :class="$style.downloadButton"
        :aria-label="downloadTranscriptLabel"
        data-testid="download-transcript-button"
        @click="downloadTranscript"
      >
        <DownloadIcon />
      </button>
      <a
        v-if="audioData.altText"
        ref="downloadLinkRef"
        :href="transcriptDataUrl"
        download="audio-transcript.txt"
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
import { interpolateString } from '../../utils/helpers'
import { DownloadIcon, AudioPlayIcon, AudioPauseIcon } from '../../assets/svg'
import type { IWebchatAudioAttachment } from '../../types'

const { message, config } = useMessageContext()

const $style = useCssModule()

// Refs
const audioRef = ref<HTMLAudioElement>()
const downloadLinkRef = ref<HTMLAnchorElement>()

// State
const playing = ref(false)
const progress = ref(0)
const duration = ref(0)
const currentTime = ref(0)

// Get audio data from message payload
const payload = computed(() => getChannelPayload(message, config))
const audioData = computed(() => {
  const attachment = payload.value?.message?.attachment as IWebchatAudioAttachment
  return {
    url: attachment?.payload?.url || '',
    altText: attachment?.payload?.altText,
  }
})

// Format time display (time remaining)
const formattedTime = computed(() => {
  const padString = (num: number) => {
    return ('0' + num).toString().slice(-2)
  }

  const seconds = duration.value * (1 - Math.min(1, progress.value))
  const date = new Date(seconds * 1000)
  const hh = date.getUTCHours()
  const mm = date.getUTCMinutes()
  const ss = padString(date.getUTCSeconds())

  if (hh) {
    return `${hh}:${padString(mm)}:${ss}`
  }
  return `${mm}:${ss}`
})

// Convert formatted time to readable text for screen readers
const timeToText = (time: string) => {
  let timeStr = time
  if (timeStr.length < 6) {
    timeStr = `00:${timeStr}`
  }
  const [hours, minutes, seconds] = timeStr.split(':').map(Number)
  const hoursText = hours ? `${hours} hours ` : ''
  const minutesText = minutes ? `${minutes} minutes ` : ''
  const secondsText = `${seconds} seconds`
  return `${hoursText}${minutesText}${secondsText}`
}

// Progress bar style (linear gradient)
const progressBarStyle = computed(() => ({
  background: `linear-gradient(to right, var(--cc-primary-color-focus) ${
    progress.value * 100
  }%, var(--cc-black-80) ${progress.value * 100}%)`,
}))

// Transcript data URL for download
const transcriptDataUrl = computed(() => {
  const text = audioData.value.altText || ''
  return `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
})

// Translations
const audioPlaybackProgressLabel = computed(() =>
  config?.settings?.customTranslations?.ariaLabels?.audioPlaybackProgress || 'Audio playback progress'
)
const playAudioLabel = computed(() =>
  config?.settings?.customTranslations?.ariaLabels?.playAudio || 'Play audio'
)
const pauseAudioLabel = computed(() =>
  config?.settings?.customTranslations?.ariaLabels?.pauseAudio || 'Pause audio'
)
const downloadTranscriptLabel = computed(() =>
  config?.settings?.customTranslations?.ariaLabels?.downloadTranscript || 'Download transcript'
)
const audioTimeRemainingLabel = computed(() =>
  config?.settings?.customTranslations?.ariaLabels?.audioTimeRemaining ?? '{time} remaining'
)

// Audio time value text for ARIA
const audioTimeValueText = computed(() =>
  interpolateString(audioTimeRemainingLabel.value, {
    time: timeToText(formattedTime.value),
  })
)

// Handlers
const handlePlay = () => {
  playing.value = true
}

const handlePause = () => {
  playing.value = false
}

const handleTimeUpdate = () => {
  if (audioRef.value && duration.value > 0) {
    currentTime.value = audioRef.value.currentTime
    progress.value = currentTime.value / duration.value
  }
}

const handleLoadedMetadata = () => {
  if (audioRef.value) {
    duration.value = audioRef.value.duration
  }
}

const handleEnded = () => {
  playing.value = false
  progress.value = 0
  if (audioRef.value) {
    audioRef.value.currentTime = 0
  }
}

const togglePlayPause = () => {
  if (audioRef.value) {
    if (playing.value) {
      audioRef.value.pause()
    } else {
      audioRef.value.play()
    }
  }
}

const handleSeekStart = () => {
  if (audioRef.value && playing.value) {
    audioRef.value.pause()
  }
}

const handleSeekChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newProgress = parseFloat(target.value)
  progress.value = newProgress

  if (audioRef.value && duration.value > 0) {
    audioRef.value.currentTime = newProgress * duration.value
  }
}

const handleSeekEnd = () => {
  if (audioRef.value && !playing.value) {
    audioRef.value.play()
  }
}

const downloadTranscript = () => {
  downloadLinkRef.value?.click()
}

// Auto-focus audio on mount if configured
onMounted(() => {
  if (!config?.settings?.widgetSettings?.enableAutoFocus) return

  const chatHistory = document.getElementById('webchatChatHistoryWrapperLiveLogPanel')
  if (!chatHistory?.contains(document.activeElement)) return

  setTimeout(() => {
    audioRef.value?.focus()
  }, 100)
})
</script>

<style module>
.wrapper {
  border-radius: var(--cc-bubble-border-radius, 15px);
  max-width: 295px;
  position: relative;
  display: flex;
}

.audioWrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  width: 100%;
  gap: 10px;
  background-color: var(--cc-white, #ffffff);
  border-radius: var(--cc-bubble-border-radius, 15px);
  border: 1px solid var(--cc-black-80, rgba(0, 0, 0, 0.8));
  padding: 0px 12px;
}

.audioWrapper .controls {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}

.audioWrapper .downloadButton {
  background-color: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  width: 30px;
  height: 30px;
}

.audioWrapper .downloadButton:hover :deep(svg path) {
  fill-opacity: 0.85;
}

.audioWrapper .downloadButton:focus-visible {
  outline: 2px solid var(--cc-primary-color-focus, #1976d2);
  outline-offset: 2px;
}

button.playButton {
  all: unset;
  outline: revert;
  line-height: 0;
  display: block;
  cursor: pointer;
}

button.playButton:hover,
button.playButton:focus {
  outline: none;
}

button.playButton:focus-visible {
  outline: 2px solid var(--cc-primary-color-focus, #1976d2);
  outline-offset: 2px;
}

button.playButton:focus :deep(svg circle),
button.playButton:hover :deep(svg circle) {
  fill-opacity: 0.85;
}

/* Custom range input */
.progressBar {
  display: flex;
  width: 100%;
}

.progressBar input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  cursor: pointer;
  outline: none;
  border-radius: var(--cc-bubble-border-radius, 15px);
  height: 3px;
  background: var(--cc-black-80, rgba(0, 0, 0, 0.8));
}

/* Thumb: Webkit */
.progressBar input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 13px;
  width: 13px;
  background-color: var(--cc-primary-color-focus, #1976d2);
  border-radius: 50%;
  border: none;
  transition: 0.2s ease-in-out;
}

/* Thumb: Firefox */
.progressBar input[type="range"]::-moz-range-thumb {
  height: 13px;
  width: 13px;
  background-color: var(--cc-primary-color-focus, #1976d2);
  border-radius: 50%;
  border: none;
  transition: 0.2s ease-in-out;
}

/* Hover, active & focus Thumb: Webkit */
.progressBar input[type="range"]::-webkit-slider-thumb:hover {
  box-shadow: 0 0 0 7px var(--cc-primary-color-opacity-10, rgba(25, 118, 210, 0.1));
}

.progressBar input[type="range"]:active::-webkit-slider-thumb {
  box-shadow: 0 0 0 9px var(--cc-primary-color-opacity-20, rgba(25, 118, 210, 0.2));
}

.progressBar input[type="range"]:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 9px var(--cc-primary-color-opacity-20, rgba(25, 118, 210, 0.2));
}

/* Hover, active & focus Thumb: Firefox */
.progressBar input[type="range"]::-moz-range-thumb:hover {
  box-shadow: 0 0 0 7px var(--cc-primary-color-opacity-10, rgba(25, 118, 210, 0.1));
}

.progressBar input[type="range"]:active::-moz-range-thumb {
  box-shadow: 0 0 0 9px var(--cc-primary-color-opacity-20, rgba(25, 118, 210, 0.2));
}

.progressBar input[type="range"]:focus::-moz-range-thumb {
  box-shadow: 0 0 0 9px var(--cc-primary-color-opacity-20, rgba(25, 118, 210, 0.2));
}
</style>
