<script setup lang="ts">
import { computed, useCssModule, useAttrs, CSSProperties } from 'vue'

export type TagVariant =
  | 'h1-semibold'
  | 'h2-regular'
  | 'h2-semibold'
  | 'title1-semibold'
  | 'title1-regular'
  | 'title2-semibold'
  | 'title2-regular'
  | 'body-regular'
  | 'body-semibold'
  | 'copy-medium'
  | 'cta-semibold'

type ColorVariant = 'primary' | 'secondary'

interface Props {
  variant?: TagVariant
  component?: string
  className?: string
  style?: CSSProperties
  color?: string
  id?: string
  ariaHidden?: boolean
  tabIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'body-regular',
  component: undefined,
  className: '',
  style: undefined,
  color: undefined,
  id: undefined,
  ariaHidden: undefined,
  tabIndex: undefined,
})

const attrs = useAttrs()
const styles = useCssModule()

// Mapping between variants and default HTML tags
const variantsMapping: Record<TagVariant, string> = {
  'h1-semibold': 'h1',
  'h2-regular': 'h2',
  'h2-semibold': 'h2',
  'title1-semibold': 'h3',
  'title1-regular': 'h4',
  'title2-semibold': 'h5',
  'title2-regular': 'h6',
  'body-semibold': 'p',
  'body-regular': 'p',
  'copy-medium': 'p',
  'cta-semibold': 'p',
}

// Color mapping for predefined colors
const colorsMapping: Record<ColorVariant, string> = {
  primary: 'var(--cc-primary-color)',
  secondary: 'var(--cc-secondary-color)',
}

// Determine which HTML element to render
const componentTag = computed(() => {
  return props.component ?? variantsMapping[props.variant]
})

// Compute the color value
const typographyColor = computed(() => {
  if (!props.color) return undefined
  return colorsMapping[props.color as ColorVariant] ?? props.color
})

// Compute CSS classes
const componentClasses = computed(() => {
  const classes = [styles[props.variant]]
  if (props.className) classes.push(props.className)
  if (props.color) classes.push(props.color)
  return classes.filter(Boolean).join(' ')
})

// Compute merged styles
const componentStyle = computed(() => {
  const mergedStyle: CSSProperties = { ...props.style }
  if (typographyColor.value) {
    mergedStyle.color = typographyColor.value
  }
  return mergedStyle
})
</script>

<template>
  <component
    :is="componentTag"
    :id="id"
    :class="componentClasses"
    :style="componentStyle"
    :aria-hidden="ariaHidden"
    :tabIndex="tabIndex"
    v-bind="attrs"
  >
    <slot />
  </component>
</template>

<style module>
.h1-semibold {
  font-family: Figtree;
  font-size: 2.125rem; /* 34px */
  font-style: normal;
  font-weight: 600;
  line-height: 2.55rem; /* 40.8px */
}

.h2-regular {
  font-family: Figtree;
  font-size: 1.125rem; /* 18px */
  font-style: normal;
  font-weight: 400;
  line-height: 1.4625rem; /* 23.4px */
}

.h2-semibold {
  font-family: Figtree;
  font-size: 1.125rem; /* 18px */
  font-style: normal;
  font-weight: 600;
  line-height: 1.4625rem; /* 23.4px */
}

.title1-regular {
  font-family: Figtree;
  font-size: 1rem; /* 16px */
  font-style: normal;
  font-weight: 400;
  line-height: 1.4rem; /* 22.4px */
}

.title1-semibold {
  font-family: Figtree;
  font-size: 1rem; /* 16px */
  font-style: normal;
  font-weight: 600;
  line-height: 1.4rem; /* 22.4px */
}

.title2-regular {
  font-family: Figtree;
  font-size: 0.75rem; /* 12px */
  font-style: normal;
  font-weight: 400;
  line-height: 1.05rem; /* 16.8px */
}

.title2-semibold {
  font-family: Figtree;
  font-size: 0.75rem; /* 12px */
  font-style: normal;
  font-weight: 600;
  line-height: 0.975rem; /* 15.6px */
}

.body-regular {
  font-family: Figtree;
  font-size: 0.875rem; /* 14px */
  font-style: normal;
  font-weight: 400;
  line-height: 1.225rem; /* 19.6px */
}

.body-semibold {
  font-family: Figtree;
  font-size: 0.875rem; /* 14px */
  font-style: normal;
  font-weight: 600;
  line-height: 1.1375rem; /* 18.2px */
}

.copy-medium {
  font-family: Figtree;
  font-size: 0.75rem; /* 12px */
  font-style: normal;
  font-weight: 500;
  line-height: 1.05rem; /* 16.8px */
}

.cta-semibold {
  font-family: Figtree;
  font-size: 0.875rem; /* 14px */
  font-style: normal;
  font-weight: 600;
  line-height: 1.1375rem; /* 18.2px */
}
</style>
