<script setup lang="ts">
import { computed, useCssModule } from 'vue'
import { useMessageContext } from '../../composables/useMessageContext'
import { useSanitize } from '../../composables/useSanitize'
import ChatBubble from '../common/ChatBubble.vue'
import { replaceUrlsWithHTMLanchorElem } from '../../utils/helpers'
import MarkdownIt from 'markdown-it'

interface Props {
  content?: string | string[]
  className?: string
  markdownClassName?: string
  id?: string
  ignoreLiveRegion?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  content: undefined,
  className: '',
  markdownClassName: '',
  id: undefined,
  ignoreLiveRegion: false,
})

const styles = useCssModule()
const { message, config } = useMessageContext()
const { processHTML } = useSanitize()

// Initialize markdown-it with HTML support and GFM tables
const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
})

// Get text content
const text = computed(() => message?.text)
const source = computed(() => message?.source)

// Use prop content or message text
const content = computed(() => {
  const contentValue = props.content || text.value || ''
  return Array.isArray(contentValue) ? contentValue.join('') : contentValue
})

// Determine if markdown should be rendered
const renderMarkdown = computed(() => {
  return config?.settings?.behavior?.renderMarkdown &&
    (source.value === 'bot' || source.value === 'engagement')
})

// Optionally transform URL strings into clickable links
const enhancedURLsText = computed(() => {
  if (config?.settings?.widgetSettings?.disableRenderURLsAsLinks) {
    return content.value
  }
  return replaceUrlsWithHTMLanchorElem(content.value)
})

// Determine if sanitization should be ignored
const ignoreSanitization = computed(() => {
  return source.value === 'user' && config?.settings?.widgetSettings?.disableTextInputSanitization
})

// Process content: sanitize HTML if needed
const processedContent = computed(() => {
  if (ignoreSanitization.value) {
    return enhancedURLsText.value
  }
  return processHTML(enhancedURLsText.value)
})

// Render markdown if enabled
const markdownContent = computed(() => {
  if (!renderMarkdown.value) return ''

  // Render markdown to HTML
  let html = md.render(processedContent.value || content.value)

  // Make all links open in new tab
  html = html.replace(/<a /g, '<a target="_blank" rel="noreferrer" ')

  return html
})

// Compute CSS classes
const textClasses = computed(() => {
  const classes = [props.className]
  if (!renderMarkdown.value) {
    classes.push(styles.text)
  }
  return classes.filter(Boolean)
})

const markdownClasses = computed(() => {
  const classes = [styles.markdown, props.markdownClassName]
  return classes.filter(Boolean)
})
</script>

<template>
  <ChatBubble>
    <div
      v-if="renderMarkdown"
      :class="markdownClasses"
      v-html="markdownContent"
    />
    <p
      v-else
      :id="id"
      :class="textClasses"
      v-html="processedContent"
    />
  </ChatBubble>
</template>

<style module>
.text {
  white-space: pre-wrap;
  overflow-wrap: break-word;
  display: inline;
}

.text a:focus-visible {
  outline: 2px solid var(--cc-primary-color-focus);
  outline-offset: 2px;
}

.text img {
  max-width: 100%;
}

.markdown {
  display: inline;
  white-space: normal;
}

.markdown > p:only-child {
  margin: 0;
}

.markdown *:first-child {
  margin-top: 0;
}

.markdown *:last-child {
  margin-bottom: 0;
}

.markdown p:last-child {
  display: inline;
}

.markdown table {
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 4px;
  margin-top: 4px;
}

.markdown th {
  text-align: left;
  border-top-width: 1px;
  border-bottom-width: 1px;
  border-left-width: 1px;
  border-right-width: 0px;
  background-color: var(--cc-black-90);
  border-style: solid;
  border-color: var(--cc-black-80);
  padding: 4px 12px;
}

.markdown th:first-child {
  border-top-left-radius: 6px;
}

.markdown th:last-child {
  border-top-right-radius: 6px;
  border-right-width: 1px;
}

.markdown td {
  border-style: solid;
  border-bottom-width: 1px;
  border-left-width: 1px;
  border-top-width: 0px;
  border-right-width: 0px;
  border-color: var(--cc-black-80);
  padding: 4px 12px;
}

.markdown td:last-child {
  border-right-width: 1px;
}

.markdown tbody tr:last-child td:first-child {
  border-bottom-left-radius: 6px;
}

.markdown tbody tr:last-child td:last-child {
  border-bottom-right-radius: 6px;
}
</style>
