import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import AdaptiveCard from '../src/components/messages/AdaptiveCard.vue'
import AdaptiveCardRenderer from '../src/components/messages/AdaptiveCardRenderer.vue'
import { MessageContextKey } from '../src/composables/useMessageContext'
import type { IMessage } from '../src/types'

// Define mock functions at module scope so they can be directly asserted
const mockParse = vi.fn()
const mockRender = vi.fn(() => {
  const div = document.createElement('div')
  div.className = 'ac-adaptiveCard'
  div.innerHTML = '<span class="ac-textRun">Rendered Card</span>'
  return div
})

// Mock the adaptivecards library
vi.mock('adaptivecards', () => {
  class MockAdaptiveCard {
    hostConfig: any = null
    parse = mockParse
    render = mockRender
  }

  class MockHostConfig {
    constructor(config: any) {
      Object.assign(this, config)
    }
  }

  return {
    AdaptiveCard: MockAdaptiveCard,
    HostConfig: MockHostConfig,
  }
})

describe('AdaptiveCard', () => {
  let wrapper: VueWrapper

  const createAdaptiveCardMessage = (
      payload: any,
      location: 'webchat' | 'defaultPreview' | 'plugin' = 'webchat'
  ): IMessage => {
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

    it('renders AdaptiveCardRenderer component', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [{ type: 'TextBlock', text: 'Test' }],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      const renderer = wrapper.findComponent(AdaptiveCardRenderer)
      expect(renderer.exists()).toBe(true)
    })

    it('passes payload to AdaptiveCardRenderer', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [{ type: 'TextBlock', text: 'Test' }],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      const renderer = wrapper.findComponent(AdaptiveCardRenderer)
      expect(renderer.props('payload')).toEqual(payload)
    })

    it('passes hostConfig to AdaptiveCardRenderer', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [{ type: 'TextBlock', text: 'Test' }],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      const renderer = wrapper.findComponent(AdaptiveCardRenderer)
      expect(renderer.props('hostConfig')).toBeDefined()
      expect(renderer.props('hostConfig')).toHaveProperty('fontFamily', 'inherit')
    })
  })

  describe('Payload Priority', () => {
    it('prefers webchat over defaultPreview when defaultPreview disabled', () => {
      const webchatPayload = {
        type: 'AdaptiveCard',
        body: [{ type: 'TextBlock', text: 'Webchat' }],
      }
      const previewPayload = {
        type: 'AdaptiveCard',
        body: [{ type: 'TextBlock', text: 'Preview' }],
      }
      const message: IMessage = {
        text: '',
        source: 'bot',
        timestamp: '1673456789000',
        data: {
          _cognigy: {
            _webchat: { adaptiveCard: webchatPayload },
            _defaultPreview: { adaptiveCard: previewPayload },
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

      const renderer = wrapper.findComponent(AdaptiveCardRenderer)
      expect(renderer.props('payload')).toEqual(webchatPayload)
    })

    it('prefers defaultPreview when enabled', () => {
      const webchatPayload = {
        type: 'AdaptiveCard',
        body: [{ type: 'TextBlock', text: 'Webchat' }],
      }
      const previewPayload = {
        type: 'AdaptiveCard',
        body: [{ type: 'TextBlock', text: 'Preview' }],
      }
      const message: IMessage = {
        text: '',
        source: 'bot',
        timestamp: '1673456789000',
        data: {
          _cognigy: {
            _webchat: { adaptiveCard: webchatPayload },
            _defaultPreview: { adaptiveCard: previewPayload },
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

      const renderer = wrapper.findComponent(AdaptiveCardRenderer)
      expect(renderer.props('payload')).toEqual(previewPayload)
    })

    it('falls back to plugin when webchat not available', () => {
      const pluginPayload = {
        type: 'AdaptiveCard',
        body: [{ type: 'TextBlock', text: 'Plugin' }],
      }
      const message: IMessage = {
        text: '',
        source: 'bot',
        timestamp: '1673456789000',
        data: {
          _plugin: { payload: pluginPayload },
        },
      }
      wrapper = mountAdaptiveCard(message)

      const renderer = wrapper.findComponent(AdaptiveCardRenderer)
      expect(renderer.props('payload')).toEqual(pluginPayload)
    })

    it('prefers plugin over webchat when both exist (matches React behavior)', () => {
      const webchatPayload = {
        type: 'AdaptiveCard',
        body: [{ type: 'TextBlock', text: 'Webchat' }],
      }
      const pluginPayload = {
        type: 'AdaptiveCard',
        body: [{ type: 'TextBlock', text: 'Plugin' }],
      }
      const message: IMessage = {
        text: '',
        source: 'bot',
        timestamp: '1673456789000',
        data: {
          _cognigy: {
            _webchat: { adaptiveCard: webchatPayload },
          },
          _plugin: { payload: pluginPayload },
        },
      }
      wrapper = mountAdaptiveCard(message)

      const renderer = wrapper.findComponent(AdaptiveCardRenderer)
      // Plugin takes priority over webchat (matches React: return _plugin || _webchat)
      expect(renderer.props('payload')).toEqual(pluginPayload)
    })
  })

  describe('Components', () => {
    it('uses ChatBubble wrapper', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [{ type: 'TextBlock', text: 'Test' }],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      const chatBubble = wrapper.findComponent({ name: 'ChatBubble' })
      expect(chatBubble.exists()).toBe(true)
    })
  })

  describe('CSS Classes', () => {
    it('applies adaptivecard-wrapper class', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      const card = wrapper.find('.adaptivecard-wrapper')
      expect(card.exists()).toBe(true)
    })

    it('applies internal class', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      const internal = wrapper.find('.internal')
      expect(internal.exists()).toBe(true)
    })
  })

  describe('Host Configuration', () => {
    it('passes font configuration', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [{ type: 'TextBlock', text: 'Test' }],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      const renderer = wrapper.findComponent(AdaptiveCardRenderer)
      const hostConfig = renderer.props('hostConfig')

      expect(hostConfig.fontSizes).toEqual({
        small: 10,
        default: 14,
        medium: 16,
        large: 18,
        extraLarge: 34,
      })
    })

    it('passes font weights configuration', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [{ type: 'TextBlock', text: 'Test' }],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      const renderer = wrapper.findComponent(AdaptiveCardRenderer)
      const hostConfig = renderer.props('hostConfig')

      expect(hostConfig.fontWeights).toEqual({
        lighter: 300,
        default: 400,
        bolder: 600,
      })
    })

    it('passes line heights configuration', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [{ type: 'TextBlock', text: 'Test' }],
      }
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      const renderer = wrapper.findComponent(AdaptiveCardRenderer)
      const hostConfig = renderer.props('hostConfig')

      expect(hostConfig.lineHeights).toEqual({
        small: 12,
        default: 18.2,
        medium: 22.4,
        large: 23.4,
        extraLarge: 40.8,
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles empty payload', () => {
      const payload = {}
      const message = createAdaptiveCardMessage(payload)
      wrapper = mountAdaptiveCard(message)

      const card = wrapper.find('[data-testid="adaptive-card-message"]')
      expect(card.exists()).toBe(true)
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

    it('handles undefined _cognigy gracefully', () => {
      const message: IMessage = {
        text: '',
        source: 'bot',
        timestamp: '1673456789000',
        data: {
          _cognigy: undefined,
        },
      }
      wrapper = mountAdaptiveCard(message)

      const card = wrapper.find('[data-testid="adaptive-card-message"]')
      expect(card.exists()).toBe(false)
    })

    it('handles missing data gracefully', () => {
      const message: IMessage = {
        text: '',
        source: 'bot',
        timestamp: '1673456789000',
        data: undefined as any,
      }
      wrapper = mountAdaptiveCard(message)

      const card = wrapper.find('[data-testid="adaptive-card-message"]')
      expect(card.exists()).toBe(false)
    })
  })
})

describe('AdaptiveCardRenderer', () => {
  let wrapper: VueWrapper

  const mountRenderer = (payload: any, hostConfig?: any, config = {}) => {
    return mount(AdaptiveCardRenderer, {
      props: {
        payload,
        hostConfig,
      },
      global: {
        provide: {
          [MessageContextKey as symbol]: {
            message: { text: '', source: 'bot', timestamp: '123', data: {} },
            config,
            action: vi.fn(),
            onEmitAnalytics: vi.fn(),
          },
        },
      },
    })
  }

  beforeEach(() => {
    mockParse.mockClear()
    mockRender.mockClear()
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  describe('Rendering', () => {
    it('renders the target div', () => {
      const payload = { type: 'AdaptiveCard', body: [] }
      wrapper = mountRenderer(payload)

      const target = wrapper.find('[data-testid="adaptive-card-renderer"]')
      expect(target.exists()).toBe(true)
    })

    it('calls adaptivecards parse with payload', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [{ type: 'TextBlock', text: 'Test' }],
      }
      wrapper = mountRenderer(payload)

      expect(mockParse).toHaveBeenCalledWith(payload)
    })

    it('calls adaptivecards render', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [{ type: 'TextBlock', text: 'Test' }],
      }
      wrapper = mountRenderer(payload)

      expect(mockRender).toHaveBeenCalled()
    })
  })

  describe('Props', () => {
    it('accepts payload prop', () => {
      const payload = {
        type: 'AdaptiveCard',
        body: [{ type: 'TextBlock', text: 'Test' }],
      }
      wrapper = mountRenderer(payload)

      expect(wrapper.props('payload')).toEqual(payload)
    })

    it('accepts hostConfig prop', () => {
      const payload = { type: 'AdaptiveCard', body: [] }
      const hostConfig = { fontFamily: 'Arial' }
      wrapper = mountRenderer(payload, hostConfig)

      expect(wrapper.props('hostConfig')).toEqual(hostConfig)
    })

    it('handles undefined payload', () => {
      wrapper = mountRenderer(undefined)

      const target = wrapper.find('[data-testid="adaptive-card-renderer"]')
      expect(target.exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty payload object', () => {
      wrapper = mountRenderer({})

      const target = wrapper.find('[data-testid="adaptive-card-renderer"]')
      expect(target.exists()).toBe(true)
    })

    it('handles complex card payload', () => {
      const complexPayload = {
        type: 'AdaptiveCard',
        version: '1.5',
        body: [
          {
            type: 'Container',
            items: [
              { type: 'TextBlock', text: 'Header', weight: 'bolder' },
              { type: 'TextBlock', text: 'Subtitle', isSubtle: true },
            ],
          },
          {
            type: 'ColumnSet',
            columns: [
              {
                type: 'Column',
                width: 'auto',
                items: [{ type: 'Image', url: 'https://example.com/img.png' }],
              },
              {
                type: 'Column',
                width: 'stretch',
                items: [{ type: 'TextBlock', text: 'Description' }],
              },
            ],
          },
        ],
        actions: [
          { type: 'Action.Submit', title: 'Submit' },
          { type: 'Action.OpenUrl', title: 'Learn More', url: 'https://example.com' },
        ],
      }

      wrapper = mountRenderer(complexPayload)

      const target = wrapper.find('[data-testid="adaptive-card-renderer"]')
      expect(target.exists()).toBe(true)
    })
  })
})
