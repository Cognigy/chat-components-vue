<template>
  <div
    :class="indicatorClasses"
    role="status"
    aria-live="polite"
    aria-label="Bot is typing"
  >
    <div :class="styles.dot"></div>
    <div :class="styles.dot"></div>
    <div :class="styles.dot"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, useCssModule } from 'vue'

/**
 * TypingIndicator - Animated typing indicator
 *
 * Displays three bouncing dots to indicate that bot or agent is typing.
 * Purely presentational - parent components control visibility via v-if.
 */

type SourceDirection = 'incoming' | 'outgoing'

interface Props {
  /** Additional CSS class names */
  className?: string
  /** Direction of the indicator (incoming: left-aligned, outgoing: right-aligned) */
  direction?: SourceDirection
  /** Remove border styling */
  disableBorder?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  className: '',
  direction: 'incoming',
  disableBorder: false,
})

// Access CSS module classes
const styles = useCssModule()

/**
 * Compute combined class names
 */
const indicatorClasses = computed(() => {
  const classes = [
    styles.typingIndicator,
    'webchat-typing-indicator', // Global class for external styling
  ]

  if (props.className) {
    classes.push(props.className)
  }

  if (props.direction) {
    classes.push(styles[props.direction])
  }

  if (props.disableBorder) {
    classes.push(styles.disableBorder)
  }

  return classes
})
</script>

<style module>
.typingIndicator {
  align-items: center;
  background-color: var(--cc-white, #ffffff);
  border-radius: 15px;
  border: 1px solid var(--cc-black-80, rgba(0, 0, 0, 0.8));
  box-sizing: border-box;
  display: flex;
  gap: 6px;
  height: 44px;
  justify-content: center;
  padding-block: 10px;
  padding-inline: 10px;
  width: 62px;
  margin-block: var(--webchat-message-margin-block, 24px);
  margin-inline: var(--webchat-message-margin-inline, 20px);
}

.typingIndicator.disableBorder {
  border: none;
  background: none !important;
}

.incoming {
  margin-inline-start: none;
}

.outgoing {
  margin-inline-start: auto;
}

.dot {
  background: var(--cc-black-40, rgba(0, 0, 0, 0.4));
  border-radius: 999px;
  width: 6px;
  height: 6px;
}

.dot:nth-child(1),
.dot:nth-child(2),
.dot:nth-child(3) {
  animation-duration: 1.2s;
  animation-timing-function: ease-in-out;
  animation-fill-mode: both;
  animation-iteration-count: infinite;
  animation-delay: -1000ms;
}

.dot:nth-child(1) {
  animation-name: dot1;
}

.dot:nth-child(2) {
  animation-name: dot2;
}

.dot:nth-child(3) {
  animation-name: dot3;
}

/* Respect user's motion preferences */
@media (prefers-reduced-motion) {
  .dot {
    animation: none !important;
  }
}

/* Animation keyframes for sequential bouncing effect */
@keyframes dot1 {
  0% {
    transform: translateY(0);
  }
  10% {
    transform: translateY(-3px);
  }
  20% {
    transform: translateY(-6px);
  }
  30% {
    transform: translateY(-3px);
  }
  40% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(0);
  }
}

@keyframes dot2 {
  0% {
    transform: translateY(0);
  }
  10% {
    transform: translateY(0);
  }
  20% {
    transform: translateY(-3px);
  }
  30% {
    transform: translateY(-6px);
  }
  40% {
    transform: translateY(-3px);
  }
  50% {
    transform: translateY(0);
  }
}

@keyframes dot3 {
  0% {
    transform: translateY(0);
  }
  10% {
    transform: translateY(0);
  }
  20% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-3px);
  }
  40% {
    transform: translateY(-6px);
  }
  50% {
    transform: translateY(-3px);
  }
  65% {
    transform: translateY(0);
  }
}
</style>
