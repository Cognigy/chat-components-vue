/**
 * HTML sanitization composable
 * Uses message context for config
 */

import { computed } from 'vue'
import { useMessageContext } from './useMessageContext'
import { sanitizeHTMLWithConfig } from '../utils/sanitize'

export function useSanitize() {
  const { config } = useMessageContext()

  const isSanitizeEnabled = computed(() => !config?.settings?.layout?.disableHtmlContentSanitization)
  const customAllowedHtmlTags = computed(() => config?.settings?.widgetSettings?.customAllowedHtmlTags)

  const processHTML = (text: string): string => {
    if (!isSanitizeEnabled.value) return text
    return sanitizeHTMLWithConfig(text, customAllowedHtmlTags.value)
  }

  return {
    processHTML,
    isSanitizeEnabled,
  }
}
