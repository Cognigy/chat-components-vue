<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g>
      <circle cx="15" cy="15" r="15" fill="white" fill-opacity="90%" />
      <path d="M12.5 10L20 15L12.5 20V10Z" fill="#1A1A1A"/>
    </g>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  width?: string
  height?: string
}>(), {
  width: '30',
  height: '30',
})
</script>
