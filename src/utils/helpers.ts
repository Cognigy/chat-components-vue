/**
 * Helper utilities
 */

import type {IWebchatButton, IWebchatQuickReply} from '../types'

// Pre-compiled regex patterns (compiled once at module load)
const TEMPLATE_PLACEHOLDER_REGEX = /{(\w+)}/g
const URL_MATCHER_REGEX =
  /(^|\s)(\b(https?):\/\/([-A-Z0-9+&@$#/%?=~_|!:,.;\p{L}]*[-A-Z0-9+&$@#/%=~_|\p{L}]))/giu
const CONTROL_CHARS_REGEX = /[\r\n\f]/g
const URL_SCHEME_REGEX = /^[a-zA-Z][a-zA-Z0-9+.-]*:/

/**
 * Gets the label for a button
 * Returns "Call" for phone_number buttons without title
 */
export function getWebchatButtonLabel(
  button: IWebchatButton | IWebchatQuickReply
): string | undefined {
  const { title } = button

  if (!title && 'type' in button && button.type === 'phone_number') {
    return 'Call'
  }

  return title
}

/**
 * Interpolates a template string with replacements
 * Example: interpolateString("{position} of {total}", { position: "1", total: "4" })
 * Returns: "1 of 4"
 */
export function interpolateString(
  template: string,
  replacements: Record<string, string>
): string {
  return template.replace(TEMPLATE_PLACEHOLDER_REGEX, (_, key) => {
    return key in replacements ? replacements[key] : ''
  })
}

/**
 * Generates a random ID with optional prefix
 */
export function getRandomId(prefix = ''): string {
  const id = window?.crypto?.randomUUID?.() || Date.now().toString()
  return prefix ? `${prefix}-${id}` : id.toString()
}

/**
 * Move focus to the visually hidden focus target
 * This prevents focus loss for keyboard users
 */
export function moveFocusToMessageFocusTarget(dataMessageId: string): void {
  setTimeout(() => {
    const focusElement = document.getElementById(`webchat-focus-target-${dataMessageId}`)
    if (focusElement) {
      focusElement.focus({ preventScroll: true })
    }
  }, 0)
}

/**
 * Helper function that replaces URLs in a string with HTML anchor elements
 * - Works with URLs starting with http/https, www., or just domain/subdomain
 * - Will only match URLs at the beginning or following whitespace
 * - Will not work with emails
 */
export function replaceUrlsWithHTMLanchorElem(text: string): string {
  return text.replace(URL_MATCHER_REGEX, (_, prefix, url) => {
    // Preserve leading whitespace, but keep it outside the anchor
    return `${prefix}<a href="${url}" target="_blank">${url}</a>`
  })
}

/**
 * Sanitizes a URL for use in CSS background-image property
 * Returns url("...") string or undefined if invalid
 */
export function getBackgroundImage(url: string): string | undefined {
  if (!url) return undefined

  // Remove control characters that could break CSS parsing
  let sanitized = url.replace(CONTROL_CHARS_REGEX, '')

  // If the string looks like an absolute URL (has a scheme), validate allowed protocols (http/https).
  if (URL_SCHEME_REGEX.test(sanitized)) {
    try {
      const parsed = new URL(sanitized)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return undefined
      }
      // Normalize absolute URLs
      sanitized = parsed.href
    } catch {
      // URL constructor failed (invalid absolute URL). Reject.
      return undefined
    }
  }

  // Escape characters that could terminate or escape the quoted url("...") context.
  sanitized = sanitized
    .replace(/\\/g, '\\\\') // Escape backslashes first
    .replace(/"/g, '\\"') // Escape double quotes
    .replace(/\)/g, '\\)') // Escape closing parenthesis

  return `url("${sanitized}")`
}

/**
 * File attachment helpers
 */

const ONE_MB = 1000000
const ONE_KB = 1000

/**
 * Extracts filename without extension
 * Example: "document.pdf" → "document."
 */
export function getFileName(fileNameWithExtension: string): string {
  const lastDotIndex = fileNameWithExtension.lastIndexOf('.')
  if (lastDotIndex > 0) {
    return fileNameWithExtension.slice(0, lastDotIndex + 1)
  }
  // Return full name if no extension
  return fileNameWithExtension
}

/**
 * Extracts file extension
 * Example: "document.pdf" → "pdf"
 */
export function getFileExtension(fileNameWithExtension: string): string | null {
  const lastDotIndex = fileNameWithExtension.lastIndexOf('.')
  if (lastDotIndex > 0 && lastDotIndex < fileNameWithExtension.length - 1) {
    return fileNameWithExtension.slice(lastDotIndex + 1)
  }
  return null
}

/**
 * Formats file size in MB or KB
 * Example: 1500000 → "1.50 MB"
 */
export function getSizeLabel(size: number): string {
  if (size > ONE_MB) {
    return `${(size / ONE_MB).toFixed(2)} MB`
  }

  return `${(size / ONE_KB).toFixed(2)} KB`
}

/**
 * Valid image MIME types for file attachments (Set for O(1) lookup)
 */
export const VALID_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
])

/**
 * Checks if attachment is a valid image type
 */
export function isImageAttachment(mimeType: string): boolean {
  return VALID_IMAGE_MIME_TYPES.has(mimeType)
}
