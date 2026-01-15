<template>
  <div v-if="isDatePickerMessage" data-testid="datepicker-message" :class="$style.wrapper">
    <!-- Date picker button -->
    <button
      :class="['webchat-date-picker-button', $style.button]"
      :disabled="isDisabled"
      data-testid="datepicker-button"
      type="button"
    >
      {{ buttonText }}
    </button>

    <!-- Selected date display (if already selected) -->
    <div
      v-if="selectedDate"
      :class="['webchat-date-picker-selected', $style.selectedDate]"
      data-testid="datepicker-selected"
    >
      <Typography variant="body-regular" component="span">
        Selected: {{ selectedDate }}
      </Typography>
    </div>

    <!-- Event name/label (optional) -->
    <div
      v-if="eventName"
      :class="['webchat-date-picker-event', $style.eventName]"
      data-testid="datepicker-event"
    >
      <Typography variant="copy-medium" component="span" :class="$style.eventLabel">
        {{ eventName }}
      </Typography>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Typography from '../common/Typography.vue'
import { useMessageContext } from '../../composables/useMessageContext'
import type { IDatePickerData } from '../../types'

// Message context
const { message } = useMessageContext()

// Check if this is a date picker message
const isDatePickerMessage = computed(() => {
  return message?.data?._plugin?.type === 'date-picker'
})

// Get date picker data
const datePickerData = computed((): IDatePickerData | null => {
  if (!isDatePickerMessage.value) return null
  return (message.data?._plugin?.data as IDatePickerData) || null
})

// Button text
const buttonText = computed(() => {
  return datePickerData.value?.openPickerButtonText || 'Pick date'
})

// Event name/label
const eventName = computed(() => {
  return datePickerData.value?.eventName
})

// Check if button should be disabled (for presentation purposes)
// In a real implementation, this would check conversation state
const isDisabled = computed(() => {
  // Could be extended to check message.data.hasReply or other flags
  return false
})

// Get selected date if available (from message text or reply)
const selectedDate = computed(() => {
  // If message has text, assume it's the selected date
  if (message.text && message.text.trim()) {
    return message.text
  }

  // Could also check for default date
  if (datePickerData.value?.defaultDate) {
    return datePickerData.value.defaultDate
  }

  return null
})
</script>

<style module>
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.button {
  min-width: 120px;
  padding: 10px 16px;
  border: none;
  border-radius: var(--cc-button-border-radius, 8px);
  background-color: var(--cc-primary-color, #1976d2);
  color: var(--cc-white, #ffffff);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:hover:not(:disabled) {
  opacity: 0.9;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.selectedDate {
  padding: 8px 12px;
  background-color: var(--cc-primary-color, #1976d2);
  color: var(--cc-white, #ffffff);
  border-radius: var(--cc-bubble-border-radius, 15px);
}

.eventName {
  padding: 4px 8px;
}

.eventLabel {
  color: var(--cc-black-40, rgba(0, 0, 0, 0.4));
  font-style: italic;
}
</style>
