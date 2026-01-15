<template>
  <div
    :id="id"
    :class="eventClasses"
    role="status"
    aria-live="assertive"
  >
    <div :class="styles.eventPillTextWrapper">
      <div :class="styles.eventText">
        {{ text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useCssModule } from 'vue'

/**
 * ChatEvent - Display chat event notifications
 *
 * Used for system messages like "Conversation started", "Agent joined", etc.
 * These are informational messages that are not part of the conversation flow.
 */

interface Props {
  /** Event text to display */
  text?: string
  /** Additional CSS class names */
  className?: string
  /** Element ID */
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  className: '',
  id: undefined,
})

// Access CSS module classes
const styles = useCssModule()

/**
 * Compute combined class names
 */
const eventClasses = computed(() => {
  const classes = [styles.eventPill]

  if (props.className) {
    classes.push(props.className)
  }

  return classes
})
</script>

<style module>
.eventPill {
  display: flex;
  max-width: 250px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-inline: auto;
  margin-block-start: 40px;
}

.eventPillTextWrapper {
  border-radius: 15px;
  background: var(--cc-black-80, rgba(0, 0, 0, 0.8));
  color: var(--cc-black-20, rgba(0, 0, 0, 0.2));
  padding: 8px 12px;
}

.eventText {
  /* Typography variant: title2-semibold equivalent */
  font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  margin: 0;
}
</style>
