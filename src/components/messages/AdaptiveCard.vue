<template>
  <ChatBubble
      v-if="hasAdaptiveCard"
      :class="wrapperClasses"
      data-testid="adaptive-card-message"
  >
    <AdaptiveCardRenderer
        :payload="cardPayload"
        :host-config="adaptiveCardsHostConfig"
        :readonly="isReadonly"
        :input-data="submittedData"
    />
  </ChatBubble>
</template>

<script setup lang="ts">
/**
 * AdaptiveCard - Message component for rendering Microsoft Adaptive Cards
 *
 * This component wraps the AdaptiveCardRenderer in a ChatBubble and handles
 * payload extraction from the message context. It's designed for presentation-only
 * mode (display only, no interactivity).
 *
 * The actual card rendering is handled by the AdaptiveCardRenderer component
 * which uses Microsoft's adaptivecards library.
 */
import { computed, useCssModule } from 'vue'
import ChatBubble from '../common/ChatBubble.vue'
import AdaptiveCardRenderer from './AdaptiveCardRenderer.vue'
import { useMessageContext } from '../../composables/useMessageContext'
import type { HostConfig } from 'adaptivecards'
import type { IMessageDataExtended } from '../../types'

const styles = useCssModule()
const { message, config } = useMessageContext()

/**
 * Host configuration for Adaptive Cards styling
 * Matches the React version's configuration
 *
 * Note: foregroundColors are applied as inline styles by the adaptivecards library,
 * so we use actual color values here. For customization, consumers should use
 * the CSS variables (--cc-adaptive-card-text-color) which override via !important.
 */
const adaptiveCardsHostConfig: Partial<HostConfig> = {
  fontFamily: 'inherit',
  fontSizes: {
    small: 10,
    default: 14,
    medium: 16,
    large: 18,
    extraLarge: 34,
  },
  fontWeights: {
    lighter: 300,
    default: 400,
    bolder: 600,
  },
  lineHeights: {
    small: 12,
    default: 18.2,
    medium: 22.4,
    large: 23.4,
    extraLarge: 40.8,
  },
  containerStyles: {
    default: {
      backgroundColor: '#fff',
      foregroundColors: {
        // @ts-expect-error - adaptivecards types are incomplete
        default: {
          default: '#333333',
          subtle: '#666666',
        },
      },
    },
  },
}

/**
 * Type-safe access to extended message data
 */
const messageData = computed<IMessageDataExtended | undefined>(() => {
  return message?.data as IMessageDataExtended | undefined
})

/**
 * Check if this message has an adaptive card payload
 */
const hasAdaptiveCard = computed(() => {
  const data = messageData.value
  const webchat = data?._cognigy?._webchat?.adaptiveCard
  const defaultPreview = data?._cognigy?._defaultPreview?.adaptiveCard
  const plugin = data?._plugin?.payload

  return !!(webchat || defaultPreview || plugin)
})

/**
 * Extract the card payload from the message
 * Follows the same priority logic as the React version
 */
const cardPayload = computed(() => {
  const data = messageData.value
  const webchat = data?._cognigy?._webchat?.adaptiveCard
  const defaultPreview = data?._cognigy?._defaultPreview?.adaptiveCard
  const plugin = data?._plugin?.payload
  const defaultPreviewEnabled = config?.settings?.widgetSettings?.enableDefaultPreview

  // Priority: webchat over defaultPreview (unless defaultPreview is enabled)
  if (webchat && defaultPreview && !defaultPreviewEnabled) {
    return webchat
  }
  if (defaultPreview && defaultPreviewEnabled) {
    return defaultPreview
  }
  return plugin || webchat
})

/**
 * Compute wrapper classes
 */
const wrapperClasses = computed(() => [
  styles.adaptivecardWrapper,
  'adaptivecard-wrapper',
  'internal',
])

/**
 * Extract submitted data from the message
 * This data will be used to pre-fill input fields in the card
 * Checks multiple locations where Cognigy might store the submitted data
 */
const submittedData = computed<Record<string, unknown> | undefined>(() => {
  const data = messageData.value
  const webchatData = data?._cognigy?._webchat

  // Check various locations where submitted data might be stored
  // Priority: request.value > adaptiveCardData > data > formData
  const submittedValue =
    data?.request?.value ||
    webchatData?.adaptiveCardData ||
    webchatData?.data ||
    webchatData?.formData ||
    data?.adaptiveCardData ||
    data?.data ||
    data?.formData

  if (submittedValue && typeof submittedValue === 'object' && !Array.isArray(submittedValue)) {
    return submittedValue
  }

  return undefined
})

/**
 * Determine if the card should be rendered in readonly mode
 *
 * Logic:
 * - If config.settings.behavior.adaptiveCardsReadonly is true → always readonly
 * - If config.settings.behavior.adaptiveCardsReadonly is false/undefined → smart default:
 *   - Readonly if submitted data exists (card was already submitted)
 *   - Interactive if no submitted data (card awaiting user input)
 */
const isReadonly = computed(() => {
  const configReadonly = config?.settings?.behavior?.adaptiveCardsReadonly

  // Config override: force readonly mode for presentation-only use cases
  if (configReadonly === true) {
    return true
  }

  // Smart default: readonly if card has submitted data (it's history)
  // Interactive if no submitted data (awaiting user input)
  return submittedData.value !== undefined
})
</script>

<style module>
/* Main wrapper styles - match React version */
.adaptivecardWrapper {
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  padding: 16px !important;
}

.adaptivecardWrapper > *:focus {
  outline: 1px solid var(--cc-primary-color-focus, #0b3694);
  border-color: var(--cc-primary-color-focus, #0b3694);
}

/* Button styles */
.adaptivecardWrapper :global(button) {
  appearance: none;
  background: var(--cc-primary-color, #0b3694);
  border-radius: 10px;
  border: none;
  color: var(--cc-primary-contrast-color, white);
  cursor: pointer;
  font-size: 14px !important;
  font-weight: 600;
  line-height: 160% !important;
  min-width: 100%;
  padding-block: 11px;
  width: 100%;
}

.adaptivecardWrapper :global(button:hover) {
  background: var(--cc-primary-color-hover, #092d7a);
}

.adaptivecardWrapper :global(button:focus-visible) {
  outline: 2px solid var(--cc-primary-color-focus, #0b3694);
  outline-offset: 2px;
}

.adaptivecardWrapper :global(button:disabled) {
  background: var(--cc-primary-color-disabled, #999);
}

/* Text styles - use CSS variable for customizable font color */
.adaptivecardWrapper :global(.ac-textRun) {
  color: var(--cc-adaptive-card-text-color, #333) !important;
  font-size: 12px !important;
  line-height: 140%;
}

/* Container styles */
.adaptivecardWrapper :global(.ac-container) {
  border-radius: 15px;
}

/* Input styles - use CSS variables for customizable colors */
.adaptivecardWrapper :global(input),
.adaptivecardWrapper :global(textarea),
.adaptivecardWrapper :global(select) {
  align-self: stretch;
  background-position: right 12px center;
  background-repeat: no-repeat;
  background: var(--cc-adaptive-card-input-background, #fff);
  border-radius: 10px;
  border: 1px solid var(--cc-adaptive-card-input-border, #ccc);
  color: var(--cc-adaptive-card-input-color, #333) !important;
  font-size: 14px !important;
  gap: 10px;
  line-height: 140%;
  padding: 8px 12px 8px 12px;
  resize: none;
}

@media screen and (max-width: 575px) {
  .adaptivecardWrapper :global(input),
  .adaptivecardWrapper :global(textarea),
  .adaptivecardWrapper :global(select) {
    font-size: 16px !important;
  }
}

.adaptivecardWrapper :global(textarea) {
  min-height: 98px;
}

:global(.ac-horizontal-separator) {
  height: 16px !important;
}

.adaptivecardWrapper :global(textarea::-webkit-scrollbar) {
  width: 27px;
}

.adaptivecardWrapper :global(textarea::-webkit-scrollbar-track) {
  background: transparent;
}

.adaptivecardWrapper :global(textarea::-webkit-scrollbar-thumb) {
  background-color: var(--cc-black-80, rgba(0, 0, 0, 0.8));
  border-radius: 10px;
  border: 12px solid var(--cc-white, #fff);
  border-block: none;
}

.adaptivecardWrapper :global(input:focus),
.adaptivecardWrapper :global(textarea:focus),
.adaptivecardWrapper :global(select:focus) {
  outline: 1px solid var(--cc-primary-color-focus, #0b3694);
  border-color: var(--cc-primary-color-focus, #0b3694);
}

.adaptivecardWrapper :global(input:focus-visible),
.adaptivecardWrapper :global(textarea:focus-visible),
.adaptivecardWrapper :global(select:focus-visible) {
  outline: 2px solid var(--cc-primary-color-focus, #0b3694);
  border-color: var(--cc-primary-color-focus, #0b3694);
}

/* Action set styles */
.adaptivecardWrapper :global(.ac-actionSet) {
  flex-wrap: wrap;
  gap: 8px;
}

/* Card container styles */
.adaptivecardWrapper > * {
  background-color: white;
  border-radius: 15px;
  box-shadow: none;
  padding: 0;
  border: 1px solid var(--cc-black-80, #ccc);
  margin: -17px;
}

/* Checkbox styles */
.adaptivecardWrapper :global([type='checkbox']) {
  appearance: none;
  background-color: var(--cc-white, #fff);
  border: 1px solid var(--cc-black-60, #666);
  border-radius: 1px;
  width: 16px;
  height: 16px;
}

.adaptivecardWrapper :global([type='checkbox']:checked) {
  background-color: var(--cc-primary-color, #0b3694);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12.5172 4.4569C12.8172 4.74256 12.8288 5.2173 12.5431 5.51724L7.19089 11.1371C6.69828 11.6543 5.87315 11.6543 5.38054 11.1371L3.4569 9.11724C3.17123 8.8173 3.18281 8.34256 3.48276 8.0569C3.78271 7.77123 4.25744 7.78281 4.5431 8.08276L6.28572 9.9125L11.4569 4.48276C11.7426 4.18281 12.2173 4.17123 12.5172 4.4569Z' fill='white'/%3E%3C/svg%3E");
  background-position: -1px -1px;
}

.adaptivecardWrapper :global([type='checkbox']:active) {
  background-color: var(--cc-primary-color-hover, #092d7a);
  border-color: var(--cc-primary-color-hover, #092d7a);
}

.adaptivecardWrapper :global([type='checkbox']:checked:hover) {
  background-color: var(--cc-primary-color-hover, #092d7a);
  border-color: var(--cc-primary-color-hover, #092d7a);
}

.adaptivecardWrapper :global(input:invalid) {
  border-color: red;
}

/* Date/Time picker icons */
.adaptivecardWrapper :global([type='date']::-webkit-calendar-picker-indicator),
.adaptivecardWrapper :global([type='time']::-webkit-calendar-picker-indicator) {
  background: none;
}

.adaptivecardWrapper :global([type='date']),
.adaptivecardWrapper :global([type='time']) {
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.adaptivecardWrapper :global([type='date']) {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M3 0.75C3 0.335786 3.33579 0 3.75 0C4.16421 0 4.5 0.335786 4.5 0.75V3H11V0.75C11 0.335786 11.3358 0 11.75 0C12.1642 0 12.5 0.335786 12.5 0.75V3H14C15.1046 3 16 3.89543 16 5V14C16 15.1046 15.1046 16 14 16H2C0.895431 16 0 15.1046 0 14V5C0 3.89543 0.895431 3 2 3H3V0.75ZM1.5 6H14.5V14C14.5 14.2761 14.2761 14.5 14 14.5H2C1.72386 14.5 1.5 14.2761 1.5 14V6Z' fill='%232455E6'/%3E%3C/svg%3E");
}

.adaptivecardWrapper :global([type='time']) {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 11.5899 4.41015 14.5 8 14.5ZM8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z' fill='%232455E6'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M11.0303 12.0303C10.7374 12.3232 10.2626 12.3232 9.96967 12.0303L7.25 9.31066L7.25 4C7.25 3.58579 7.58578 3.25 8 3.25C8.41421 3.25 8.75 3.58579 8.75 4L8.75 8.68934L11.0303 10.9697C11.3232 11.2626 11.3232 11.7374 11.0303 12.0303Z' fill='%232455E6'/%3E%3C/svg%3E");
}

/* Select dropdown styles */
.adaptivecardWrapper :global(select) {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M1.34923 4.24022C1.76855 3.8808 2.39985 3.92936 2.75927 4.34869L8.00002 10.4629L13.2408 4.34869C13.6002 3.92936 14.2315 3.8808 14.6508 4.24022C15.0701 4.59965 15.1187 5.23095 14.7593 5.65027L9.51853 11.7645C8.72034 12.6957 7.2797 12.6957 6.4815 11.7645L1.24076 5.65027C0.881339 5.23095 0.929901 4.59965 1.34923 4.24022Z' fill='%232455E6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.adaptivecardWrapper :global(select::-ms-expand) {
  display: none;
}

.adaptivecardWrapper :global(select option) {
  color: var(--cc-adaptive-card-input-color, #333);
  border-bottom: 1px solid var(--cc-black-80, #ccc);
}

/* Readonly/disabled state styles */
.adaptivecardWrapper :global(.ac-readonly) input:disabled,
.adaptivecardWrapper :global(.ac-readonly) textarea:disabled,
.adaptivecardWrapper :global(.ac-readonly) select:disabled {
  background-color: var(--cc-black-95, #f5f5f5);
  cursor: not-allowed;
  opacity: 0.8;
}

.adaptivecardWrapper :global(.ac-readonly) button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.adaptivecardWrapper :global(.ac-readonly) [type='checkbox']:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
