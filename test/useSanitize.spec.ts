import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { MessageContextKey } from '../src/composables/useMessageContext'
import { useSanitize } from '../src/composables/useSanitize'
import type { IMessage, ChatConfig } from '../src/types'

describe('useSanitize', () => {
  // Helper component to test the composable
  const TestComponent = defineComponent({
    setup() {
      const { processHTML, isSanitizeEnabled } = useSanitize()
      return { processHTML, isSanitizeEnabled }
    },
    template: '<div />',
  })

  const createWrapper = (message: IMessage, config?: ChatConfig) => {
    return mount(TestComponent, {
      global: {
        provide: {
          [MessageContextKey as symbol]: {
            message,
            config: config || {},
          },
        },
      },
    })
  }

  const basicMessage: IMessage = {
    text: 'Test',
    source: 'bot',
    timestamp: '1673456789000',
  }

  it('sanitizes HTML by default', () => {
    const wrapper = createWrapper(basicMessage)

    const result = wrapper.vm.processHTML('<b>Bold</b> text')

    expect(result).toContain('Bold')
    expect(result).toContain('text')
  })

  it('removes script tags', () => {
    const wrapper = createWrapper(basicMessage)

    const result = wrapper.vm.processHTML('<script>alert("xss")</script>Hello')

    expect(result).not.toContain('<script>')
    expect(result).not.toContain('alert')
    expect(result).toContain('Hello')
  })

  it('removes dangerous attributes', () => {
    const wrapper = createWrapper(basicMessage)

    const result = wrapper.vm.processHTML('<img src="x" onerror="alert(1)" />')

    expect(result).not.toContain('onerror')
    expect(result).toContain('<img')
  })

  it('allows safe HTML tags', () => {
    const wrapper = createWrapper(basicMessage)

    const html = '<p>Paragraph</p><b>Bold</b><i>Italic</i><a href="https://example.com">Link</a>'
    const result = wrapper.vm.processHTML(html)

    expect(result).toContain('<p>')
    expect(result).toContain('<b>')
    expect(result).toContain('<i>')
    expect(result).toContain('<a')
    expect(result).toContain('https://example.com')
  })

  it('disables sanitization when configured', () => {
    const config: ChatConfig = {
      settings: {
        layout: {
          disableHtmlContentSanitization: true,
        },
      },
    }

    const wrapper = createWrapper(basicMessage, config)

    const dangerousHTML = '<script>alert("xss")</script>Hello'
    const result = wrapper.vm.processHTML(dangerousHTML)

    // With sanitization disabled, dangerous HTML passes through
    expect(result).toBe(dangerousHTML)
  })

  it('isSanitizeEnabled returns true by default', () => {
    const wrapper = createWrapper(basicMessage)

    expect(wrapper.vm.isSanitizeEnabled).toBe(true)
  })

  it('isSanitizeEnabled returns false when disabled', () => {
    const config: ChatConfig = {
      settings: {
        layout: {
          disableHtmlContentSanitization: true,
        },
      },
    }

    const wrapper = createWrapper(basicMessage, config)

    expect(wrapper.vm.isSanitizeEnabled).toBe(false)
  })

  it('respects custom allowed HTML tags', () => {
    const config: ChatConfig = {
      settings: {
        widgetSettings: {
          customAllowedHtmlTags: ['b', 'i'],
        },
      },
    }

    const wrapper = createWrapper(basicMessage, config)

    const html = '<b>Bold</b><i>Italic</i><p>Paragraph</p>'
    const result = wrapper.vm.processHTML(html)

    expect(result).toContain('<b>')
    expect(result).toContain('<i>')
    // <p> should be removed as it's not in the allowed list
    expect(result).not.toContain('<p>')
    expect(result).toContain('Paragraph') // But text content remains
  })

  it('handles empty string', () => {
    const wrapper = createWrapper(basicMessage)

    const result = wrapper.vm.processHTML('')

    expect(result).toBe('')
  })

  it('handles plain text without HTML', () => {
    const wrapper = createWrapper(basicMessage)

    const result = wrapper.vm.processHTML('Plain text with no HTML')

    expect(result).toBe('Plain text with no HTML')
  })

  it('escapes HTML entities', () => {
    const wrapper = createWrapper(basicMessage)

    const result = wrapper.vm.processHTML('&lt;b&gt;Not bold&lt;/b&gt;')

    expect(result).toContain('&lt;')
    expect(result).toContain('&gt;')
  })

  it('handles malformed HTML', () => {
    const wrapper = createWrapper(basicMessage)

    const result = wrapper.vm.processHTML('<b>Unclosed bold')

    // DOMPurify should fix malformed HTML
    expect(result).toBeTruthy()
    expect(result).toContain('Unclosed bold')
  })

  it('removes javascript: URLs', () => {
    const wrapper = createWrapper(basicMessage)

    const result = wrapper.vm.processHTML('<a href="javascript:alert(1)">Click</a>')

    expect(result).not.toContain('javascript:')
    expect(result).toContain('Click')
  })

  it('allows data attributes', () => {
    const wrapper = createWrapper(basicMessage)

    const result = wrapper.vm.processHTML('<div data-id="123">Content</div>')

    expect(result).toContain('data-id')
    expect(result).toContain('Content')
  })

  it('handles nested HTML', () => {
    const wrapper = createWrapper(basicMessage)

    const html = '<div><p><b>Bold</b> in paragraph</p></div>'
    const result = wrapper.vm.processHTML(html)

    expect(result).toContain('<div>')
    expect(result).toContain('<p>')
    expect(result).toContain('<b>')
    expect(result).toContain('Bold')
  })

  it('removes style tags', () => {
    const wrapper = createWrapper(basicMessage)

    const result = wrapper.vm.processHTML('<style>body { color: red; }</style>Hello')

    expect(result).not.toContain('<style>')
    expect(result).toContain('Hello')
  })

  it('handles SVG safely', () => {
    const wrapper = createWrapper(basicMessage)

    const result = wrapper.vm.processHTML('<svg><circle r="10" /></svg>')

    // SVG should be allowed (though some elements may be stripped)
    expect(result).toContain('<svg')
    // Note: DOMPurify may strip certain SVG child elements for security
  })

  it('handles orphan closing tags', () => {
    const wrapper = createWrapper(basicMessage)

    const result = wrapper.vm.processHTML('</div>Text')

    // Should handle gracefully - DOMPurify will escape or remove
    expect(result).toBeTruthy()
    expect(result).toContain('Text')
  })

  it('preserves safe attributes', () => {
    const wrapper = createWrapper(basicMessage)

    const result = wrapper.vm.processHTML('<img src="image.jpg" alt="Description" width="100" />')

    expect(result).toContain('src=')
    expect(result).toContain('alt=')
    expect(result).toContain('width=')
  })
})
