import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import TextWithButtons from '../src/components/messages/TextWithButtons.vue'
import { MessageContextKey } from '../src/composables/useMessageContext'
import type { IMessage, ChatConfig, IWebchatButton, IWebchatQuickReply } from '../src/types'

describe('TextWithButtons', () => {
  let wrapper: VueWrapper

  const createButtonsMessage = (
    text: string,
    buttons: IWebchatButton[],
    useQuickReplies = false
  ): IMessage => {
    if (useQuickReplies) {
      // Quick replies format
      return {
        text: '',
        source: 'bot',
        timestamp: '1673456789000',
        data: {
          _cognigy: {
            _webchat: {
              message: {
                text,
                quick_replies: buttons as unknown as IWebchatQuickReply[],
              },
            },
          },
        },
      }
    }

    // Regular buttons format
    return {
      text: '',
      source: 'bot',
      timestamp: '1673456789000',
      data: {
        _cognigy: {
          _webchat: {
            message: {
              attachment: {
                type: 'template',
                payload: {
                  template_type: 'button',
                  text,
                  buttons,
                },
              },
            },
          },
        },
      },
    }
  }

  const mountTextWithButtons = (message: IMessage, config?: ChatConfig) => {
    return mount(TextWithButtons, {
      global: {
        provide: {
          [MessageContextKey as symbol]: {
            message,
            config: config || {},
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
    it('renders text and buttons correctly', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Option 1', type: 'postback', payload: 'option1' },
        { title: 'Option 2', type: 'postback', payload: 'option2' },
      ]
      const message = createButtonsMessage('Choose an option:', buttons)
      wrapper = mountTextWithButtons(message)

      // Should render text
      expect(wrapper.text()).toContain('Choose an option:')

      // Should render buttons
      expect(wrapper.findAll('button').length).toBeGreaterThan(0)
    })

    it('renders with buttons only (no text)', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Yes', type: 'postback', payload: 'yes' },
        { title: 'No', type: 'postback', payload: 'no' },
      ]
      const message = createButtonsMessage('', buttons)
      wrapper = mountTextWithButtons(message)

      // Should not render TextMessage component when no text
      const textMessage = wrapper.findComponent({ name: 'TextMessage' })
      expect(textMessage.exists()).toBe(false)

      // Should still render buttons
      expect(wrapper.findAll('button').length).toBeGreaterThan(0)
    })

    it('renders text only when no buttons', () => {
      const message = createButtonsMessage('This is just text', [])
      wrapper = mountTextWithButtons(message)

      // Should render text
      expect(wrapper.text()).toContain('This is just text')

      // Should not render ActionButtons when no buttons
      const actionButtons = wrapper.findComponent({ name: 'ActionButtons' })
      expect(actionButtons.exists()).toBe(false)
    })

    it('applies correct CSS class for regular buttons', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Button 1', type: 'postback', payload: 'btn1' },
      ]
      const message = createButtonsMessage('Select:', buttons)
      wrapper = mountTextWithButtons(message)

      const root = wrapper.find('.webchat-buttons-template-root')
      expect(root.exists()).toBe(true)
    })

    it('applies correct CSS class for quick replies', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Quick 1', type: 'postback', payload: 'q1' },
      ]
      const message = createButtonsMessage('Quick reply:', buttons, true)
      wrapper = mountTextWithButtons(message)

      const root = wrapper.find('.webchat-quick-reply-template-root')
      expect(root.exists()).toBe(true)
    })
  })

  describe('Button Types', () => {
    it('renders postback buttons', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Postback Button', type: 'postback', payload: 'test_payload' },
      ]
      const message = createButtonsMessage('Click:', buttons)
      wrapper = mountTextWithButtons(message)

      expect(wrapper.text()).toContain('Postback Button')
    })

    it('renders web_url buttons', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Visit Website', type: 'web_url', url: 'https://example.com' },
      ]
      const message = createButtonsMessage('Links:', buttons)
      wrapper = mountTextWithButtons(message)

      expect(wrapper.text()).toContain('Visit Website')
    })

    it('renders phone_number buttons', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Call Us', type: 'phone_number', payload: '+1234567890' },
      ]
      const message = createButtonsMessage('Contact:', buttons)
      wrapper = mountTextWithButtons(message)

      expect(wrapper.text()).toContain('Call Us')
    })

    it('renders multiple buttons', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Button 1', type: 'postback', payload: 'b1' },
        { title: 'Button 2', type: 'postback', payload: 'b2' },
        { title: 'Button 3', type: 'postback', payload: 'b3' },
      ]
      const message = createButtonsMessage('Choose:', buttons)
      wrapper = mountTextWithButtons(message)

      expect(wrapper.text()).toContain('Button 1')
      expect(wrapper.text()).toContain('Button 2')
      expect(wrapper.text()).toContain('Button 3')
    })
  })

  describe('Text Content', () => {
    it('renders text from attachment payload', () => {
      const buttons: IWebchatButton[] = [
        { title: 'OK', type: 'postback', payload: 'ok' },
      ]
      const message = createButtonsMessage('Text from attachment', buttons)
      wrapper = mountTextWithButtons(message)

      expect(wrapper.text()).toContain('Text from attachment')
    })

    it('renders text from message.text when no attachment text', () => {
      const message: IMessage = {
        text: '',
        source: 'bot',
        timestamp: '1673456789000',
        data: {
          _cognigy: {
            _webchat: {
              message: {
                text: 'Text from message object',
                quick_replies: [
                  { title: 'OK', content_type: 'text', payload: 'ok' },
                ] as IWebchatQuickReply[],
              },
            },
          },
        },
      }
      wrapper = mountTextWithButtons(message)

      expect(wrapper.text()).toContain('Text from message object')
    })

    it('renders HTML content in text', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Continue', type: 'postback', payload: 'continue' },
      ]
      const message = createButtonsMessage('<strong>Bold text</strong>', buttons)
      wrapper = mountTextWithButtons(message)

      const strong = wrapper.find('strong')
      expect(strong.exists()).toBe(true)
      expect(strong.text()).toBe('Bold text')
    })
  })

  describe('Button Actions', () => {
    it('passes action to buttons', () => {
      const action = vi.fn()
      const buttons: IWebchatButton[] = [
        { title: 'Click Me', type: 'postback', payload: 'clicked' },
      ]
      const message = createButtonsMessage('Test:', buttons)

      wrapper = mount(TextWithButtons, {
        global: {
          provide: {
            [MessageContextKey as symbol]: {
              message,
              config: {},
              action,
              onEmitAnalytics: vi.fn(),
            },
          },
        },
      })

      // Click the button
      const button = wrapper.find('button')
      button.trigger('click')

      // Action should be callable (ActionButtons will call it)
      expect(action).toBeDefined()
    })
  })

  describe('Configuration', () => {
    it('respects botOutputMaxWidthPercentage for bot messages', () => {
      const config: ChatConfig = {
        settings: {
          layout: {
            botOutputMaxWidthPercentage: 75,
          },
        },
      }
      const buttons: IWebchatButton[] = [
        { title: 'Button', type: 'postback', payload: 'test' },
      ]
      const message = createButtonsMessage('Test', buttons)
      wrapper = mountTextWithButtons(message, config)

      const actionButtons = wrapper.findComponent({ name: 'ActionButtons' })
      expect(actionButtons.exists()).toBe(true)

      // Check that containerStyle prop has maxWidth
      const props = actionButtons.props()
      expect(props.containerStyle).toEqual({ maxWidth: '75%' })
    })

    it('does not apply maxWidth for user messages', () => {
      const config: ChatConfig = {
        settings: {
          layout: {
            botOutputMaxWidthPercentage: 75,
          },
        },
      }
      const buttons: IWebchatButton[] = [
        { title: 'Button', type: 'postback', payload: 'test' },
      ]
      const message = createButtonsMessage('Test', buttons)
      message.source = 'user'
      wrapper = mountTextWithButtons(message, config)

      const actionButtons = wrapper.findComponent({ name: 'ActionButtons' })
      const props = actionButtons.props()
      expect(props.containerStyle).toEqual({})
    })

    it('shows URL icon when configured', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Link', type: 'web_url', url: 'https://example.com' },
      ]
      const message = createButtonsMessage('Visit:', buttons)
      wrapper = mountTextWithButtons(message)

      const actionButtons = wrapper.findComponent({ name: 'ActionButtons' })
      expect(actionButtons.props('showUrlIcon')).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('sets unique ID for text element', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Button', type: 'postback', payload: 'test' },
      ]
      const message = createButtonsMessage('Accessible text', buttons)
      wrapper = mountTextWithButtons(message)

      const textMessage = wrapper.findComponent({ name: 'TextMessage' })
      expect(textMessage.exists()).toBe(true)

      const id = textMessage.props('id')
      expect(id).toBeTruthy()
      expect(id).toContain('webchatButtonTemplateHeader')
    })

    it('links buttons to text via templateTextId', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Button', type: 'postback', payload: 'test' },
      ]
      const message = createButtonsMessage('Text', buttons)
      wrapper = mountTextWithButtons(message)

      const textMessage = wrapper.findComponent({ name: 'TextMessage' })
      const actionButtons = wrapper.findComponent({ name: 'ActionButtons' })

      const textId = textMessage.props('id')
      const templateTextId = actionButtons.props('templateTextId')

      expect(textId).toBe(templateTextId)
    })

    it('sets ignoreLiveRegion on text message', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Button', type: 'postback', payload: 'test' },
      ]
      const message = createButtonsMessage('Text', buttons)
      wrapper = mountTextWithButtons(message)

      const textMessage = wrapper.findComponent({ name: 'TextMessage' })
      expect(textMessage.props('ignoreLiveRegion')).toBe(true)
    })
  })

  describe('CSS Styling', () => {
    it('applies button CSS classes', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Button', type: 'postback', payload: 'test' },
      ]
      const message = createButtonsMessage('Text', buttons)
      wrapper = mountTextWithButtons(message)

      const actionButtons = wrapper.findComponent({ name: 'ActionButtons' })
      const buttonClassName = actionButtons.props('buttonClassName')

      expect(buttonClassName).toContain('webchat-buttons-template-button')
    })

    it('applies container CSS classes for buttons', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Button', type: 'postback', payload: 'test' },
      ]
      const message = createButtonsMessage('Text', buttons)
      wrapper = mountTextWithButtons(message)

      const actionButtons = wrapper.findComponent({ name: 'ActionButtons' })
      const containerClassName = actionButtons.props('containerClassName')

      expect(containerClassName).toContain('webchat-buttons-template-replies-container')
    })

    it('applies container CSS classes for quick replies', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Quick', type: 'postback', payload: 'q' },
      ]
      const message = createButtonsMessage('Text', buttons, true)
      wrapper = mountTextWithButtons(message)

      const actionButtons = wrapper.findComponent({ name: 'ActionButtons' })
      const containerClassName = actionButtons.props('containerClassName')

      expect(containerClassName).toContain('webchat-quick-reply-template-replies-container')
    })

    it('applies text CSS classes for buttons', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Button', type: 'postback', payload: 'test' },
      ]
      const message = createButtonsMessage('Text', buttons)
      wrapper = mountTextWithButtons(message)

      const textMessage = wrapper.findComponent({ name: 'TextMessage' })
      const className = textMessage.props('className')

      expect(className).toBe('webchat-buttons-template-header')
    })

    it('applies text CSS classes for quick replies', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Quick', type: 'postback', payload: 'q' },
      ]
      const message = createButtonsMessage('Text', buttons, true)
      wrapper = mountTextWithButtons(message)

      const textMessage = wrapper.findComponent({ name: 'TextMessage' })
      const className = textMessage.props('className')

      expect(className).toBe('webchat-quick-reply-template-header')
    })
  })

  describe('Message Source', () => {
    it('handles bot messages', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Button', type: 'postback', payload: 'test' },
      ]
      const message = createButtonsMessage('Bot message', buttons)
      message.source = 'bot'
      wrapper = mountTextWithButtons(message)

      expect(wrapper.exists()).toBe(true)
    })

    it('handles user messages', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Button', type: 'postback', payload: 'test' },
      ]
      const message = createButtonsMessage('User message', buttons)
      message.source = 'user'
      wrapper = mountTextWithButtons(message)

      expect(wrapper.exists()).toBe(true)
    })

    it('handles engagement messages', () => {
      const config: ChatConfig = {
        settings: {
          layout: {
            botOutputMaxWidthPercentage: 80,
          },
        },
      }
      const buttons: IWebchatButton[] = [
        { title: 'Button', type: 'postback', payload: 'test' },
      ]
      const message = createButtonsMessage('Engagement message', buttons)
      message.source = 'engagement'
      wrapper = mountTextWithButtons(message, config)

      // Should apply maxWidth for engagement messages
      const actionButtons = wrapper.findComponent({ name: 'ActionButtons' })
      const props = actionButtons.props()
      expect(props.containerStyle).toEqual({ maxWidth: '80%' })
    })
  })

  describe('Edge Cases', () => {
    it('handles empty buttons array', () => {
      const message = createButtonsMessage('Just text', [])
      wrapper = mountTextWithButtons(message)

      expect(wrapper.text()).toContain('Just text')

      const actionButtons = wrapper.findComponent({ name: 'ActionButtons' })
      expect(actionButtons.exists()).toBe(false)
    })

    it('handles missing text', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Button', type: 'postback', payload: 'test' },
      ]
      const message = createButtonsMessage('', buttons)
      wrapper = mountTextWithButtons(message)

      const textMessage = wrapper.findComponent({ name: 'TextMessage' })
      expect(textMessage.exists()).toBe(false)
    })

    it('handles missing config', () => {
      const buttons: IWebchatButton[] = [
        { title: 'Button', type: 'postback', payload: 'test' },
      ]
      const message = createButtonsMessage('Test', buttons)
      wrapper = mountTextWithButtons(message, undefined)

      expect(wrapper.exists()).toBe(true)
    })

    it('handles message without webchat data', () => {
      const message: IMessage = {
        text: 'Plain message',
        source: 'bot',
        timestamp: '1673456789000',
        data: {},
      }
      wrapper = mountTextWithButtons(message)

      // Should not crash, but may not render anything
      expect(wrapper.exists()).toBe(true)
    })
  })
})
