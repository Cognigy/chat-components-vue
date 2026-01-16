import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatBubble from '../src/components/common/ChatBubble.vue'
import { MessageContextKey } from '../src/composables/useMessageContext'
import type { IMessage, ChatConfig } from '../src/types'

describe('ChatBubble', () => {
  const createWrapper = (message: IMessage, config?: ChatConfig) => {
    return mount(ChatBubble, {
      global: {
        provide: {
          [MessageContextKey as symbol]: {
            message,
            config: config || {},
          },
        },
      },
      slots: {
        default: '<p>Test content</p>',
      },
    })
  }

  it('renders slot content', () => {
    const message: IMessage = {
      text: 'Test',
      source: 'bot',
      timestamp: '1673456789000',
    }

    const wrapper = createWrapper(message)

    expect(wrapper.html()).toContain('Test content')
  })

  it('applies bubble class', () => {
    const message: IMessage = {
      text: 'Test',
      source: 'bot',
      timestamp: '1673456789000',
    }

    const wrapper = createWrapper(message)

    const classes = wrapper.classes()
    expect(classes.some((cls) => cls.includes('bubble'))).toBe(true)
    expect(classes).toContain('chat-bubble')
  })

  it('applies incoming direction for bot messages by default', () => {
    const message: IMessage = {
      text: 'Test',
      source: 'bot',
      timestamp: '1673456789000',
    }

    const wrapper = createWrapper(message)

    const classes = wrapper.classes()
    expect(classes.some((cls) => cls.includes('incoming'))).toBe(true)
  })

  it('applies outgoing direction for user messages by default', () => {
    const message: IMessage = {
      text: 'Test',
      source: 'user',
      timestamp: '1673456789000',
    }

    const wrapper = createWrapper(message)

    const classes = wrapper.classes()
    expect(classes.some((cls) => cls.includes('outgoing'))).toBe(true)
  })

  it('applies incoming direction for agent messages by default', () => {
    const message: IMessage = {
      text: 'Test',
      source: 'agent',
      timestamp: '1673456789000',
    }

    const wrapper = createWrapper(message)

    const classes = wrapper.classes()
    expect(classes.some((cls) => cls.includes('incoming'))).toBe(true)
  })

  it('applies custom direction mapping for user messages', () => {
    const message: IMessage = {
      text: 'Test',
      source: 'user',
      timestamp: '1673456789000',
    }

    const config: ChatConfig = {
      settings: {
        widgetSettings: {
          sourceDirectionMapping: {
            user: 'incoming',
          },
        },
      },
    }

    const wrapper = createWrapper(message, config)

    const classes = wrapper.classes()
    expect(classes.some((cls) => cls.includes('incoming'))).toBe(true)
  })

  it('applies custom direction mapping for bot messages', () => {
    const message: IMessage = {
      text: 'Test',
      source: 'bot',
      timestamp: '1673456789000',
    }

    const config: ChatConfig = {
      settings: {
        widgetSettings: {
          sourceDirectionMapping: {
            bot: 'outgoing',
          },
        },
      },
    }

    const wrapper = createWrapper(message, config)

    const classes = wrapper.classes()
    expect(classes.some((cls) => cls.includes('outgoing'))).toBe(true)
  })

  it('disables border for bot messages when configured', () => {
    const message: IMessage = {
      text: 'Test',
      source: 'bot',
      timestamp: '1673456789000',
    }

    const config: ChatConfig = {
      settings: {
        layout: {
          disableBotOutputBorder: true,
        },
      },
    }

    const wrapper = createWrapper(message, config)

    const classes = wrapper.classes()
    expect(classes.some((cls) => cls.includes('disableBorder'))).toBe(true)
  })

  it('does not disable border for user messages', () => {
    const message: IMessage = {
      text: 'Test',
      source: 'user',
      timestamp: '1673456789000',
    }

    const config: ChatConfig = {
      settings: {
        layout: {
          disableBotOutputBorder: true,
        },
      },
    }

    const wrapper = createWrapper(message, config)

    const classes = wrapper.classes()
    expect(classes.some((cls) => cls.includes('disableBorder'))).toBe(false)
  })

  it('applies max width for bot messages when configured', () => {
    const message: IMessage = {
      text: 'Test',
      source: 'bot',
      timestamp: '1673456789000',
    }

    const config: ChatConfig = {
      settings: {
        layout: {
          botOutputMaxWidthPercentage: 80,
        },
      },
    }

    const wrapper = createWrapper(message, config)

    const style = wrapper.attributes('style')
    expect(style).toContain('max-width: 80%')
  })

  it('does not apply max width for user messages', () => {
    const message: IMessage = {
      text: 'Test',
      source: 'user',
      timestamp: '1673456789000',
    }

    const config: ChatConfig = {
      settings: {
        layout: {
          botOutputMaxWidthPercentage: 80,
        },
      },
    }

    const wrapper = createWrapper(message, config)

    const style = wrapper.attributes('style')
    // Style should be undefined or empty for user messages
    expect(style === undefined || style === '').toBe(true)
  })

  it('applies max width for engagement messages', () => {
    const message: IMessage = {
      text: 'Test',
      source: 'engagement',
      timestamp: '1673456789000',
    }

    const config: ChatConfig = {
      settings: {
        layout: {
          botOutputMaxWidthPercentage: 70,
        },
      },
    }

    const wrapper = createWrapper(message, config)

    const style = wrapper.attributes('style')
    expect(style).toContain('max-width: 70%')
  })

  it('applies custom className prop', () => {
    const message: IMessage = {
      text: 'Test',
      source: 'bot',
      timestamp: '1673456789000',
    }

    const wrapper = mount(ChatBubble, {
      global: {
        provide: {
          [MessageContextKey as symbol]: {
            message,
            config: {},
          },
        },
      },
      props: {
        className: 'custom-bubble-class',
      },
      slots: {
        default: '<p>Test</p>',
      },
    })

    expect(wrapper.classes()).toContain('custom-bubble-class')
  })

  it('applies default styling when config is undefined', () => {
    const message: IMessage = {
      text: 'Test',
      source: 'bot',
      timestamp: '1673456789000',
    }

    const wrapper = mount(ChatBubble, {
      global: {
        provide: {
          [MessageContextKey as symbol]: {
            message,
            config: undefined,
          },
        },
      },
      slots: {
        default: '<p>Test</p>',
      },
    })

    // Should use default incoming direction for bot
    const classes = wrapper.classes()
    expect(classes.some((cls) => cls.includes('incoming'))).toBe(true)
    // Should not have border disabled (no config)
    expect(classes.some((cls) => cls.includes('disableBorder'))).toBe(false)
  })

  it('combines multiple configuration options', () => {
    const message: IMessage = {
      text: 'Test',
      source: 'bot',
      timestamp: '1673456789000',
    }

    const config: ChatConfig = {
      settings: {
        layout: {
          disableBotOutputBorder: true,
          botOutputMaxWidthPercentage: 90,
        },
        widgetSettings: {
          sourceDirectionMapping: {
            bot: 'outgoing',
          },
        },
      },
    }

    const wrapper = createWrapper(message, config)

    const classes = wrapper.classes()
    expect(classes.some((cls) => cls.includes('disableBorder'))).toBe(true)
    expect(classes.some((cls) => cls.includes('outgoing'))).toBe(true)

    const style = wrapper.attributes('style')
    expect(style).toContain('max-width: 90%')
  })
})
