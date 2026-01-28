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
  /**
   * When true, disables all inputs and buttons after rendering
   * Useful for displaying submitted cards in chat history
   */
  readonly?: boolean
  /**
   * Data to pre-fill into input fields
   * Keys should match input element IDs in the card
   * Used to show submitted values in chat history
   */
  inputData?: Record<string, unknown>
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
})

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
 * Apply input data to card payload by setting values on input elements
 * Recursively walks the card structure to find inputs and set their values
 */
function applyInputData(
  cardPayload: Record<string, unknown>,
  inputData: Record<string, unknown>
): Record<string, unknown> {
  if (!inputData || Object.keys(inputData).length === 0) {
    return cardPayload
  }

  // Deep clone to avoid mutating original
  const payload = JSON.parse(JSON.stringify(cardPayload))

  function processElement(element: Record<string, unknown>): void {
    // Check if this is an input element with an id
    const type = element.type as string | undefined
    const id = element.id as string | undefined

    if (type?.startsWith('Input.') && id && id in inputData) {
      // Set the value for this input
      const value = inputData[id]

      if (type === 'Input.Toggle') {
        // Toggle inputs use valueOn/valueOff, set value to match
        const isToggleOn = value === true || value === 'true' || value === element.valueOn

        if (isToggleOn) {
          element.value = element.valueOn ?? 'true'
        } else {
          element.value = element.valueOff ?? 'false'
        }
      } else if (type === 'Input.ChoiceSet' && Array.isArray(value)) {
        // Multi-select choice sets use comma-separated values
        element.value = value.join(',')
      } else {
        element.value = value
      }
    }

    // Recursively process child elements
    if (Array.isArray(element.body)) {
      element.body.forEach((child: Record<string, unknown>) => processElement(child))
    }
    if (Array.isArray(element.items)) {
      element.items.forEach((child: Record<string, unknown>) => processElement(child))
    }
    if (Array.isArray(element.columns)) {
      element.columns.forEach((col: Record<string, unknown>) => {
        if (Array.isArray(col.items)) {
          col.items.forEach((child: Record<string, unknown>) => processElement(child))
        }
      })
    }
    if (Array.isArray(element.actions)) {
      element.actions.forEach((action: Record<string, unknown>) => {
        if (action.card) {
          processElement(action.card as Record<string, unknown>)
        }
      })
    }
  }

  processElement(payload)
  return payload
}

/**
 * Disable all interactive elements in the rendered card
 * Used for displaying submitted cards in chat history
 */
function disableInteractiveElements(container: HTMLElement): void {
  const interactiveElements = container.querySelectorAll(
    'input, textarea, select, button'
  )
  interactiveElements.forEach((el) => {
    el.setAttribute('disabled', 'true')
    el.setAttribute('aria-disabled', 'true')
  })

  // Add a class to the container for additional styling hooks
  container.classList.add('ac-readonly')
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
    // Apply input data to payload if provided
    const payloadToRender = props.inputData
      ? applyInputData(props.payload, props.inputData)
      : props.payload

    // Parse and render the card
    cardInstance.parse(payloadToRender)
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

      // Disable all interactive elements when in readonly mode
      if (props.readonly) {
        disableInteractiveElements(targetRef.value)
      }
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

// Re-render when payload, hostConfig, or inputData changes
watch(
  () => [props.payload, props.hostConfig, props.inputData],
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
