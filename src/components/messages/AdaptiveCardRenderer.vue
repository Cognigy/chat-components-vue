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
import { ref, shallowRef, watch, onMounted, onBeforeUnmount } from 'vue'
import { AdaptiveCard as MSAdaptiveCard, HostConfig } from 'adaptivecards'
import MarkdownIt from 'markdown-it'
import { sanitizeHTMLWithConfig } from '../../utils/sanitize'

/**
 * Shared MarkdownIt instance at module scope.
 *
 * Why this is safe to share across component instances:
 * - MarkdownIt's render() method is a pure function (input → output, no side effects)
 * - No internal state is mutated during rendering
 * - Configuration is set at construction time and doesn't change
 * - This pattern is recommended by MarkdownIt documentation for performance
 *
 * Creating a new instance per component would be wasteful since there's no
 * per-instance state to isolate.
 */
const md = new MarkdownIt()

/**
 * Set up Markdown processing for Adaptive Cards (module-level, runs once)
 *
 * This sets a static callback on MSAdaptiveCard that processes markdown text.
 * We intentionally do this at module scope to:
 * 1. Avoid race conditions from multiple components setting the callback
 * 2. Ensure consistent markdown processing across all card instances
 *
 * Note: We use sanitizeHTML directly (not via useSanitize composable) because
 * this runs at module scope without component context. For adaptive cards,
 * sanitization is always applied for security - config overrides don't apply.
 */
MSAdaptiveCard.onProcessMarkdown = (text, result) => {
  try {
    const html = md.render(text)
    // Use default sanitization (no custom allowed tags for adaptive card content)
    result.outputHtml = sanitizeHTMLWithConfig(html)
    result.didProcess = true
  } catch (error) {
    console.error('AdaptiveCardRenderer: Markdown processing failed', { error })
    result.outputHtml = text
    result.didProcess = true
  }
}

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

// Component-scoped card instance - using shallowRef for proper instance isolation
// Each component gets its own MSAdaptiveCard instance to prevent conflicts
const cardInstance = shallowRef<MSAdaptiveCard | null>(null)

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
        element.value = value === true || value === 'true' || value === element.valueOn
          ? element.valueOn ?? 'true'
          : element.valueOff ?? 'false'
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
  if (!cardInstance.value) {
    cardInstance.value = new MSAdaptiveCard()
  }

  // Apply host config if provided
  if (props.hostConfig) {
    cardInstance.value.hostConfig = new HostConfig(props.hostConfig)
  }

  try {
    // Apply input data to payload if provided
    const payloadToRender = props.inputData
      ? applyInputData(props.payload, props.inputData)
      : props.payload

    // Parse and render the card
    cardInstance.value.parse(payloadToRender)
    const renderedCard = cardInstance.value.render()

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

// Render on mount (markdown processing is set up at module scope)
onMounted(() => {
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
  cardInstance.value = null
})
</script>
