/**
 * HTML sanitization utilities
 * Uses DOMPurify to sanitize HTML content
 */

import DOMPurify from 'dompurify'

/**
 * Default allowed HTML tags
 * Same as React version
 */
export const allowedHtmlTags = [
  'a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio',
  'b', 'bdi', 'bdo', 'big', 'blockquote', 'br', 'button',
  'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup',
  'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt',
  'em', 'embed',
  'fieldset', 'figcaption', 'figure', 'footer', 'form',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr',
  'i', 'iframe', 'img', 'input', 'ins',
  'kbd',
  'label', 'legend', 'li', 'link',
  'main', 'map', 'mark', 'meta', 'meter',
  'nav',
  'ol', 'optgroup', 'option', 'output',
  'p', 'param', 'picture', 'pre', 'progress',
  'q',
  'rp', 'rt', 'ruby',
  's', 'samp', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'svg',
  'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track',
  'u', 'ul',
  'var', 'video',
  'wbr',
]

/**
 * Default allowed HTML attributes
 */
export const allowedHtmlAttributes = [
  'accept', 'accept-charset', 'accesskey', 'action', 'align', 'alt', 'autocomplete', 'autofocus', 'autoplay',
  'bgcolor', 'border',
  'charset', 'checked', 'cite', 'class', 'color', 'cols', 'colspan', 'content', 'contenteditable', 'controls', 'coords',
  'data', 'data-*', 'datetime', 'default', 'dir', 'dirname', 'disabled', 'download', 'draggable', 'dropzone',
  'enctype',
  'for', 'form', 'formaction',
  'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'http-equiv',
  'id', 'ismap',
  'kind',
  'label', 'lang', 'list', 'loop', 'low',
  'max', 'maxlength', 'media', 'method', 'min', 'multiple', 'muted',
  'name', 'novalidate',
  'open', 'optimum',
  'pattern', 'placeholder', 'poster', 'preload',
  'readonly', 'rel', 'required', 'reversed', 'rows', 'rowspan',
  'sandbox', 'scope', 'selected', 'shape', 'size', 'sizes', 'span', 'spellcheck', 'src', 'srcdoc', 'srclang', 'srcset', 'start', 'step', 'style',
  'tabindex', 'target', 'title', 'translate', 'type',
  'usemap',
  'value',
  'width', 'wrap',
]

/**
 * Sanitize HTML with custom configuration
 * @param text - HTML text to sanitize
 * @param customAllowedHtmlTags - Optional custom allowed tags
 * @returns Sanitized HTML string
 */
export function sanitizeHTMLWithConfig(
  text: string,
  customAllowedHtmlTags?: string[]
): string {
  if (!text) {
    return ''
  }

  // Handle orphan closing tags (from streaming LLMs)
  if (text.startsWith('</')) {
    return text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  // Configure DOMPurify
  const config = {
    ALLOWED_TAGS: customAllowedHtmlTags || allowedHtmlTags,
    ALLOWED_ATTR: allowedHtmlAttributes,
  }

  // Add hook for unknown elements
  // Note: DOMPurify's hook callback types don't fully describe the node parameter
  DOMPurify.addHook('beforeSanitizeElements', (node: any) => {
    if (node instanceof HTMLUnknownElement) {
      const unClosedTag = `<${node.tagName.toLowerCase()}>${node.innerHTML}`
      const closedTag = `<${node.tagName.toLowerCase()}>${node.innerHTML}</${node.tagName.toLowerCase()}>`
      node.replaceWith(unClosedTag === text ? unClosedTag : closedTag)
    }
  })

  try {
    const sanitized = DOMPurify.sanitize(text, config).toString()
    return sanitized
  } catch (error) {
    console.error('sanitizeHTMLWithConfig: Sanitization failed', {
      error,
      textLength: text.length,
    })
    // Return escaped text as fallback
    return text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  } finally {
    DOMPurify.removeAllHooks()
  }
}

/**
 * Sanitize content if sanitization is enabled
 * @param content - Content to sanitize
 * @param isSanitizeEnabled - Whether sanitization is enabled
 * @param customAllowedHtmlTags - Custom allowed tags
 * @returns Sanitized or raw content
 */
export function sanitizeContent(
  content: string | undefined,
  isSanitizeEnabled: boolean,
  customAllowedHtmlTags?: string[]
): string {
  if (!content) {
    return ''
  }

  if (!isSanitizeEnabled) {
    return content
  }

  return sanitizeHTMLWithConfig(content, customAllowedHtmlTags)
}