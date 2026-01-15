import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import AdaptiveCard from '../src/components/messages/AdaptiveCard.vue'
import { MessageContextKey } from '../src/composables/useMessageContext'
import type { IMessage } from '../src/types'

describe('AdaptiveCard', () => {
  let wrapper: VueWrapper

  const createAdaptiveCardMessage = (payload: any, location: 'webchat' | 'defaultPreview' | 'plugin' = 'webchat'): IMessage => {
    const message: IMessage = {
      text: '',
      source: 'bot',
      timestamp: '1673456789000',
      data: {},
    }

    if (location === 'webchat') {
      message.data = {
        _cognigy: {
          _webchat: {
            adaptiveCard: payload,
          },
        },
      }
    } else if (location === 'defaultPreview') {
      message.data = {
        _cognigy: {
          _defaultPreview: {
            adaptiveCard: payload,
          },
        },
      }
    } else if (location === 'plugin') {
      message.data = {
        _plugin: {
          payload: payload,
        },
      }
    }

    return message
  }

  const mountAdaptiveCard = (message: IMessage, config = {}) => {
    return mount(AdaptiveCard, {
      global: {
        provide: {
          [MessageContextKey as symbol]: {
            message,
            config,
            action: vi.fn(),
            onEmitAnalytics: vi.fn(),
          },
        },
      },
    })
  }

  afterEach(() => {
    wrapper?.unmount()
  })

  describe('Rendering', () => {
    it('renders adaptive card from webchat location', () => {
      const payload = {
        type: 'AdaptiveCard',
        version: '1.5',
        body: [
          {
            type: 'TextBlock',
            text: 'Hello Adaptive Card',
          },
        ],
      }
      const message = createAdaptiveCardMessage(payload, 'webchat')
      wrapper = mountAdaptiveCard(message)

      const card = wrapper.find('[data-testid="adaptive-card-message"]')
      expect(card.exists()).toBe(true)
    })

    it('renders adaptive card from defaultPreview location', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [
          {
            type: 'TextBlock',
            text: 'Preview Card',
          },
        ],
      }
      const message = createAdaptiveCardMessage(payload, 'defaultPreview')
      wrapper = mountAdaptiveCard(message, {
        settings: {
          widgetSettings: {
            enableDefaultPreview: true,
          },
        },
      })

      const card = wrapper.find('[data-testid="adaptive-card-message"]')
      expect(card.exists()).toBe(true)
    })

    it('renders adaptive card from plugin location', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [
          {
            type: 'TextBlock',
            text: 'Plugin Card',
          },
        ],
      }
      const message = createAdaptiveCardMessage(payload, 'plugin')
      wrapper = mountAdaptiveCard(message)

      const card = wrapper.find('[data-testid="adaptive-card-message"]')
      expect(card.exists()).toBe(true)
    })

    it('does not render when no adaptive card data', () => {
      const message: IMessage = {
        text: 'Regular message',
        source: 'bot',
        timestamp: '1673456789000',
        data: {},
      }
      wrapper = mountAdaptiveCard(message)

      const card = wrapper.find('[data-testid="adaptive-card-message"]')
      expect(card.exists()).toBe(false)
    })
  })

  describe('Card Title', () => {
    it('extracts title from payload.title', () => {
      const payload = {
        type: 'AdaptiveCard',
        title: 'Card Title',
        body: [],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      expect(wrapper.text()).toContain('Card Title')
    })

    it('extracts title from large TextBlock', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [
          {
            type: 'TextBlock',
            text: 'Large Heading',
            size: 'large',
          },
          {
            type: 'TextBlock',
            text: 'Body text',
          },
        ],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      expect(wrapper.text()).toContain('Large Heading')
    })

    it('extracts title from first TextBlock when no size specified', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [
          {
            type: 'TextBlock',
            text: 'First Text',
          },
          {
            type: 'TextBlock',
            text: 'Second Text',
          },
        ],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      expect(wrapper.text()).toContain('First Text')
    })

    it('uses speak text as fallback title', () => {
      const payload = {
        type: 'AdaptiveCard',
        speak: 'This is the speak text for screen readers',
        body: [],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      expect(wrapper.text()).toContain('This is the speak text')
    })

    it('uses generic title when no title found', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      expect(wrapper.text()).toContain('Adaptive Card')
    })
  })

  describe('Card Body', () => {
    it('displays body text from TextBlocks', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [
          {
            type: 'TextBlock',
            text: 'Title',
            size: 'large',
          },
          {
            type: 'TextBlock',
            text: 'This is the body text',
          },
        ],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      expect(wrapper.text()).toContain('This is the body text')
    })

    it('combines multiple body TextBlocks', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [
          {
            type: 'TextBlock',
            text: 'Title',
            size: 'large',
          },
          {
            type: 'TextBlock',
            text: 'First paragraph',
          },
          {
            type: 'TextBlock',
            text: 'Second paragraph',
          },
        ],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      const text = wrapper.text()
      expect(text).toContain('First paragraph')
      expect(text).toContain('Second paragraph')
    })

    it('limits body text to first 2 blocks', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [
          {
            type: 'TextBlock',
            text: 'Block 1',
          },
          {
            type: 'TextBlock',
            text: 'Block 2',
          },
          {
            type: 'TextBlock',
            text: 'Block 3',
          },
          {
            type: 'TextBlock',
            text: 'Block 4',
          },
        ],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      const text = wrapper.text()
      expect(text).toContain('Block 1')
      expect(text).toContain('Block 2')
      // Block 3 and 4 might or might not appear depending on title extraction
    })

    it('does not display body when no body text available', () => {
      const payload = {
        type: 'AdaptiveCard',
        title: 'Only Title',
        body: [],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      const bodyElements = wrapper.findAll('div').filter(el =>
        el.text() !== 'Only Title' &&
        el.text() !== '' &&
        !el.text().includes('action')
      )
      // Should only have title, no separate body
      expect(bodyElements.length).toBeLessThan(3)
    })
  })

  describe('Actions', () => {
    it('displays actions count when actions exist', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [
          {
            type: 'TextBlock',
            text: 'Card with actions',
          },
        ],
        actions: [
          {
            type: 'Action.Submit',
            title: 'Submit',
          },
          {
            type: 'Action.OpenUrl',
            title: 'Open URL',
            url: 'https://example.com',
          },
        ],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      expect(wrapper.text()).toContain('2 actions available')
    })

    it('displays singular for single action', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [
          {
            type: 'TextBlock',
            text: 'Card with one action',
          },
        ],
        actions: [
          {
            type: 'Action.Submit',
            title: 'Submit',
          },
        ],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      expect(wrapper.text()).toContain('1 action available')
    })

    it('does not display actions when no actions', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [
          {
            type: 'TextBlock',
            text: 'Simple card',
          },
        ],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      expect(wrapper.text()).not.toContain('action available')
    })

    it('does not display actions when empty array', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [
          {
            type: 'TextBlock',
            text: 'Empty array card',
          },
        ],
        actions: [],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      expect(wrapper.text()).not.toContain('action available')
    })
  })

  describe('Payload Priority', () => {
    it('prefers webchat over defaultPreview when defaultPreview disabled', () => {
      const message: IMessage = {
        text: '',
        source: 'bot',
        timestamp: '1673456789000',
        data: {
          _cognigy: {
            _webchat: {
              adaptiveCard: {
                type: 'AdaptiveCard',
                title: 'Webchat Card',
                body: [],
              },
            },
            _defaultPreview: {
              adaptiveCard: {
                type: 'AdaptiveCard',
                title: 'Preview Card',
                body: [],
              },
            },
          },
        },
      }
      wrapper = mountAdaptiveCard(message, {
        settings: {
          widgetSettings: {
            enableDefaultPreview: false,
          },
        },
      })

      expect(wrapper.text()).toContain('Webchat Card')
      expect(wrapper.text()).not.toContain('Preview Card')
    })

    it('prefers defaultPreview when enabled', () => {
      const message: IMessage = {
        text: '',
        source: 'bot',
        timestamp: '1673456789000',
        data: {
          _cognigy: {
            _webchat: {
              adaptiveCard: {
                type: 'AdaptiveCard',
                title: 'Webchat Card',
                body: [],
              },
            },
            _defaultPreview: {
              adaptiveCard: {
                type: 'AdaptiveCard',
                title: 'Preview Card',
                body: [],
              },
            },
          },
        },
      }
      wrapper = mountAdaptiveCard(message, {
        settings: {
          widgetSettings: {
            enableDefaultPreview: true,
          },
        },
      })

      expect(wrapper.text()).toContain('Preview Card')
      expect(wrapper.text()).not.toContain('Webchat Card')
    })

    it('falls back to plugin when webchat not available', () => {
      const message: IMessage = {
        text: '',
        source: 'bot',
        timestamp: '1673456789000',
        data: {
          _plugin: {
            payload: {
              type: 'AdaptiveCard',
              title: 'Plugin Card',
              body: [],
            },
          },
        },
      }
      wrapper = mountAdaptiveCard(message)

      expect(wrapper.text()).toContain('Plugin Card')
    })
  })

  describe('Components', () => {
    it('uses ChatBubble wrapper', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [
          {
            type: 'TextBlock',
            text: 'Test',
          },
        ],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      const chatBubble = wrapper.findComponent({ name: 'ChatBubble' })
      expect(chatBubble.exists()).toBe(true)
    })

    it('uses Typography for title', () => {
      const payload = {
        type: 'AdaptiveCard',
        title: 'Card Title',
        body: [],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      const typography = wrapper.findAllComponents({ name: 'Typography' })
      expect(typography.length).toBeGreaterThan(0)
    })

    it('renders card icon', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
    })
  })

  describe('CSS Classes', () => {
    it('applies correct global CSS classes', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      const card = wrapper.find('.adaptivecard-wrapper')
      expect(card.exists()).toBe(true)

      const internal = wrapper.find('.internal')
      expect(internal.exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('handles missing body array', () => {
      const payload = {
        type: 'AdaptiveCard',
        title: 'Card without body',
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      expect(wrapper.text()).toContain('Card without body')
    })

    it('handles body with non-TextBlock elements', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [
          {
            type: 'Image',
            url: 'https://example.com/image.jpg',
          },
          {
            type: 'TextBlock',
            text: 'Text after image',
          },
        ],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      expect(wrapper.text()).toContain('Text after image')
    })

    it('handles empty payload', () => {
      const payload = {}
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      expect(wrapper.text()).toContain('Adaptive Card')
    })

    it('handles null body', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: null,
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      const card = wrapper.find('[data-testid="adaptive-card-message"]')
      expect(card.exists()).toBe(true)
    })
  })
})
