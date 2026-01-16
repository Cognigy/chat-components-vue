import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TextMessage from '../src/components/messages/TextMessage.vue'
import ChatBubble from '../src/components/common/ChatBubble.vue'
import { MessageContextKey } from '../src/composables/useMessageContext'
import type { IMessage, ChatConfig, MessageSender } from '../src/types'

describe('TextMessage', () => {
  const createWrapper = (message: IMessage, config?: ChatConfig, action?: MessageSender) => {
    return mount(TextMessage, {
      global: {
        provide: {
          [MessageContextKey as symbol]: {
            message,
            config: config || {},
            action,
          },
        },
      },
    })
  }

  const basicMessage: IMessage = {
    text: 'Hello World',
    source: 'bot',
    timestamp: '1673456789000',
  }

  it('renders text message', () => {
    const wrapper = createWrapper(basicMessage)

    expect(wrapper.text()).toContain('Hello World')
  })

  it('renders within ChatBubble', () => {
    const wrapper = createWrapper(basicMessage)

    const chatBubble = wrapper.findComponent(ChatBubble)
    expect(chatBubble.exists()).toBe(true)
  })

  it('displays message text as paragraph by default', () => {
    const wrapper = createWrapper(basicMessage)

    const paragraph = wrapper.find('p')
    expect(paragraph.exists()).toBe(true)
    expect(paragraph.text()).toContain('Hello World')
  })

  it('handles HTML content with sanitization', () => {
    const message: IMessage = {
      text: '<b>Bold</b> text',
      source: 'bot',
      timestamp: '1673456789000',
    }

    const wrapper = createWrapper(message)

    expect(wrapper.html()).toContain('Bold')
  })

  it('sanitizes dangerous HTML by default', () => {
    const message: IMessage = {
      text: '<script>alert("xss")</script>Hello',
      source: 'bot',
      timestamp: '1673456789000',
    }

    const wrapper = createWrapper(message)

    // Script tag should be removed
    expect(wrapper.html()).not.toContain('<script>')
    expect(wrapper.text()).toContain('Hello')
  })

  it('converts URLs to links', () => {
    const message: IMessage = {
      text: 'Visit https://example.com for more',
      source: 'bot',
      timestamp: '1673456789000',
    }

    const wrapper = createWrapper(message)

    expect(wrapper.html()).toContain('<a')
    expect(wrapper.html()).toContain('https://example.com')
    expect(wrapper.html()).toContain('target="_blank"')
  })

  it('disables URL linking when configured', () => {
    const message: IMessage = {
      text: 'Visit https://example.com',
      source: 'bot',
      timestamp: '1673456789000',
    }

    const config: ChatConfig = {
      settings: {
        widgetSettings: {
          disableRenderURLsAsLinks: true,
        },
      },
    }

    const wrapper = createWrapper(message, config)

    // Should still contain the URL text but not as a link
    expect(wrapper.text()).toContain('https://example.com')
    // But the link count should be zero or minimal
    const links = wrapper.findAll('a')
    expect(links.length).toBe(0)
  })

  it('renders markdown when enabled', () => {
    const message: IMessage = {
      text: '# Heading\n\n**Bold** text',
      source: 'bot',
      timestamp: '1673456789000',
    }

    const config: ChatConfig = {
      settings: {
        behavior: {
          renderMarkdown: true,
        },
      },
    }

    const wrapper = createWrapper(message, config)

    // Should render markdown as HTML
    expect(wrapper.html()).toContain('Heading')
    expect(wrapper.html()).toContain('Bold')
    // Should not have a <p> tag directly, markdown will be in a div
    const div = wrapper.find('div')
    expect(div.exists()).toBe(true)
  })

  it('does not render markdown for user messages', () => {
    const message: IMessage = {
      text: '**This is not bold**',
      source: 'user',
      timestamp: '1673456789000',
    }

    const config: ChatConfig = {
      settings: {
        behavior: {
          renderMarkdown: true,
        },
      },
    }

    const wrapper = createWrapper(message, config)

    // User messages should not render markdown
    expect(wrapper.text()).toContain('**This is not bold**')
  })

  it('renders markdown for bot messages only', () => {
    const message: IMessage = {
      text: '**Bold**',
      source: 'bot',
      timestamp: '1673456789000',
    }

    const config: ChatConfig = {
      settings: {
        behavior: {
          renderMarkdown: true,
        },
      },
    }

    const wrapper = createWrapper(message, config)

    // Bot message with markdown enabled
    expect(wrapper.html()).toContain('Bold')
  })

  it('applies custom className', async () => {
    const wrapper = createWrapper(basicMessage, undefined, undefined)
    await wrapper.setProps({ className: 'custom-text-class' })

    expect(wrapper.find('p').classes()).toContain('custom-text-class')
  })

  it('applies custom id', async () => {
    const wrapper = createWrapper(basicMessage, undefined, undefined)
    await wrapper.setProps({ id: 'custom-message-id' })

    expect(wrapper.find('p').attributes('id')).toBe('custom-message-id')
  })

  it('uses prop content over message text', async () => {
    const wrapper = createWrapper(basicMessage, undefined, undefined)
    await wrapper.setProps({ content: 'Override text' })

    expect(wrapper.text()).toContain('Override text')
    expect(wrapper.text()).not.toContain('Hello World')
  })

  it('handles array content', async () => {
    const wrapper = createWrapper(basicMessage, undefined, undefined)
    await wrapper.setProps({ content: ['Hello', ' ', 'World'] })

    expect(wrapper.text()).toContain('Hello World')
  })

  it('disables sanitization for user input when configured', () => {
    const message: IMessage = {
      text: '<b>User input</b>',
      source: 'user',
      timestamp: '1673456789000',
    }

    const config: ChatConfig = {
      settings: {
        widgetSettings: {
          disableTextInputSanitization: true,
        },
      },
    }

    const wrapper = createWrapper(message, config)

    // With sanitization disabled for user, HTML should pass through
    expect(wrapper.html()).toContain('<b>User input</b>')
  })

  it('renders empty text without crashing', () => {
    const message: IMessage = {
      text: '',
      source: 'bot',
      timestamp: '1673456789000',
    }

    const wrapper = createWrapper(message)

    // Component renders with empty paragraph
    const paragraph = wrapper.find('p')
    expect(paragraph.exists()).toBe(true)
    expect(paragraph.text()).toBe('')
  })

  it('renders markdown tables correctly', () => {
    const message: IMessage = {
      text: '| Header |\n|--------|\n| Cell   |',
      source: 'bot',
      timestamp: '1673456789000',
    }

    const config: ChatConfig = {
      settings: {
        behavior: {
          renderMarkdown: true,
        },
      },
    }

    const wrapper = createWrapper(message, config)

    expect(wrapper.html()).toContain('<table')
    expect(wrapper.html()).toContain('<th')
    expect(wrapper.html()).toContain('<td')
    expect(wrapper.html()).toContain('Header')
    expect(wrapper.html()).toContain('Cell')
  })

  it('renders markdown links with target blank', () => {
    const message: IMessage = {
      text: '[Link](https://example.com)',
      source: 'bot',
      timestamp: '1673456789000',
    }

    const config: ChatConfig = {
      settings: {
        behavior: {
          renderMarkdown: true,
        },
      },
    }

    const wrapper = createWrapper(message, config)

    expect(wrapper.html()).toContain('target="_blank"')
    expect(wrapper.html()).toContain('rel="noreferrer"')
    expect(wrapper.html()).toContain('https://example.com')
  })

  it('preserves line breaks in plain text', () => {
    const message: IMessage = {
      text: 'Line 1\nLine 2\nLine 3',
      source: 'bot',
      timestamp: '1673456789000',
    }

    const wrapper = createWrapper(message)

    const paragraph = wrapper.find('p')
    expect(paragraph.element.innerHTML).toContain('Line 1\nLine 2\nLine 3')
  })

  it('safely renders HTML entities in text', () => {
    const message: IMessage = {
      text: 'Compare: 5 < 10 & 10 > 5',
      source: 'bot',
      timestamp: '1673456789000',
    }

    const wrapper = createWrapper(message)

    // Text content should be preserved (entities may be escaped in HTML)
    expect(wrapper.text()).toContain('Compare')
    expect(wrapper.text()).toContain('5')
    expect(wrapper.text()).toContain('10')
  })

  it('applies markdown className when rendering markdown', async () => {
    const message: IMessage = {
      text: '**Bold**',
      source: 'bot',
      timestamp: '1673456789000',
    }

    const config: ChatConfig = {
      settings: {
        behavior: {
          renderMarkdown: true,
        },
      },
    }

    const wrapper = createWrapper(message, config)
    await wrapper.setProps({ markdownClassName: 'custom-markdown' })

    // Find the markdown content div (inside ChatBubble)
    const markdownDiv = wrapper.find('.custom-markdown')
    expect(markdownDiv.exists()).toBe(true)
  })
})
