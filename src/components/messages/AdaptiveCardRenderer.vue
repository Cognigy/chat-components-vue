<template>
  <div ref="targetRef" data-testid="adaptive-card-renderer" />
</template>

<script setup lang="ts">
/**
 * AdaptiveCardRenderer - Inner component that uses Microsoft's adaptivecards library
 *
 * This component handles the actual rendering of Adaptive Cards using the
 * Microsoft adaptivecards library. It's designed for presentation-only mode
 * (no action handling).
 *
 * Inspired by Microsoft's adaptivecards-react package:
 * https://github.com/microsoft/AdaptiveCards/blob/5b66a52e0e0cee5074a42dcbe688d608e0327ae4/source/nodejs/adaptivecards-react/src/adaptive-card.tsx
 */
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { AdaptiveCard as MSAdaptiveCard, HostConfig } from 'adaptivecards'
import MarkdownIt from 'markdown-it'
import { useSanitize } from '../../composables/useSanitize'

interface Props {
  /**
   * The Adaptive Card payload to render
   */
  payload?: Record<string, unknown>
  /**
   * Host configuration for styling the card
   */
  hostConfig?: Partial<HostConfig>
}

const props = defineProps<Props>()

const targetRef = ref<HTMLDivElement | null>(null)

// Singleton markdown instance (following adaptivecards documentation pattern)
const md = new MarkdownIt()

// Card instance ref - we reuse the same instance
let cardInstance: MSAdaptiveCard | null = null

// Get sanitization from context
const { processHTML } = useSanitize()

/**
 * Set up Markdown processing for Adaptive Cards
 * Uses markdown-it + DOMPurify sanitization
 */
function setupMarkdownProcessing(): void {
  MSAdaptiveCard.onProcessMarkdown = (text, result) => {
    try {
      const html = md.render(text)
      const sanitizedHtml = processHTML(html)
      result.outputHtml = sanitizedHtml
      result.didProcess = true
    } catch (error) {
      console.error('AdaptiveCardRenderer: Markdown processing failed', { error })
      result.outputHtml = text
      result.didProcess = true
    }
  }
}

/**
 * Render the adaptive card
 */
function renderCard(): void {
  if (!targetRef.value || !props.payload) {
    return
  }

  // Create card instance if needed
  if (!cardInstance) {
    cardInstance = new MSAdaptiveCard()
  }

  // Apply host config if provided
  if (props.hostConfig) {
    cardInstance.hostConfig = new HostConfig(props.hostConfig)
  }

  try {
    // Parse and render the card
    cardInstance.parse(props.payload)
    const renderedCard = cardInstance.render()

    if (renderedCard && targetRef.value) {
      // Clear previous content and append new
      targetRef.value.innerHTML = ''
      targetRef.value.appendChild(renderedCard)

      // Accessibility: Add aria-level to heading elements without it
      const headings = targetRef.value.querySelectorAll("[role='heading']")
      headings.forEach((heading) => {
        if (heading.getAttribute('aria-level') === null) {
          heading.setAttribute('aria-level', '4')
        }
      })
    }
  } catch (error) {
    console.error('AdaptiveCardRenderer: Unable to render Adaptive Card', {
      error,
      payload: props.payload,
    })
  }
}

// Set up markdown processing on mount
onMounted(() => {
  setupMarkdownProcessing()
  renderCard()
})

// Re-render when payload or hostConfig changes
watch(
  () => [props.payload, props.hostConfig],
  () => {
    renderCard()
  },
  { deep: true }
)

// Cleanup on unmount
onBeforeUnmount(() => {
  cardInstance = null
})
</script>
