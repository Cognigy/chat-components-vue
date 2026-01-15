import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ActionButtons from '../src/components/common/ActionButtons.vue'
import ActionButton from '../src/components/common/ActionButton.vue'
import type { IWebchatButton } from '../src/types'

describe('ActionButtons', () => {
  const mockButtons: IWebchatButton[] = [
    {
      type: 'postback',
      title: 'Button 1',
      payload: 'payload1',
    },
    {
      type: 'postback',
      title: 'Button 2',
      payload: 'payload2',
    },
    {
      type: 'web_url',
      title: 'Link Button',
      url: 'https://example.com',
      target: '_blank',
    },
    {
      type: 'phone_number',
      title: 'Call Us',
      payload: '1234567890',
    },
  ]

  it('renders action buttons container', () => {
    const wrapper = mount(ActionButtons, {
      props: {
        payload: mockButtons,
      },
    })

    expect(wrapper.find('[data-testid="action-buttons"]').exists()).toBe(true)
  })

  it('renders correct number of buttons', () => {
    const wrapper = mount(ActionButtons, {
      props: {
        payload: mockButtons,
      },
    })

    const buttons = wrapper.findAllComponents(ActionButton)
    expect(buttons).toHaveLength(4)
  })

  it('renders as ul when multiple buttons', () => {
    const wrapper = mount(ActionButtons, {
      props: {
        payload: mockButtons,
      },
    })

    const container = wrapper.find('[data-testid="action-buttons"]')
    expect(container.element.tagName).toBe('UL')
  })

  it('renders as div when single button', () => {
    const wrapper = mount(ActionButtons, {
      props: {
        payload: [mockButtons[0]],
      },
    })

    const container = wrapper.find('[data-testid="action-buttons"]')
    expect(container.element.tagName).toBe('DIV')
  })

  it('renders li elements for multiple buttons', () => {
    const wrapper = mount(ActionButtons, {
      props: {
        payload: mockButtons,
      },
    })

    const listItems = wrapper.findAll('li')
    expect(listItems).toHaveLength(4)
  })

  it('applies aria-posinset and aria-setsize to list items', () => {
    const wrapper = mount(ActionButtons, {
      props: {
        payload: mockButtons,
      },
    })

    const listItems = wrapper.findAll('li')
    expect(listItems[0].attributes('aria-posinset')).toBe('1')
    expect(listItems[0].attributes('aria-setsize')).toBe('4')
    expect(listItems[3].attributes('aria-posinset')).toBe('4')
    expect(listItems[3].attributes('aria-setsize')).toBe('4')
  })

  it('filters out invalid button types', () => {
    const invalidButtons: any = [
      ...mockButtons,
      {
        type: 'invalid_type',
        title: 'Invalid',
        payload: 'test',
      },
    ]

    const wrapper = mount(ActionButtons, {
      props: {
        payload: invalidButtons,
      },
    })

    const buttons = wrapper.findAllComponents(ActionButton)
    expect(buttons).toHaveLength(4) // Should still be 4, not 5
  })

  it('filters out text content_type buttons without title', () => {
    const buttonsWithInvalid: any = [
      ...mockButtons,
      {
        content_type: 'text',
        payload: 'test',
        // No title
      },
    ]

    const wrapper = mount(ActionButtons, {
      props: {
        payload: buttonsWithInvalid,
      },
    })

    const buttons = wrapper.findAllComponents(ActionButton)
    expect(buttons).toHaveLength(4) // Should not include the invalid one
  })

  it('renders nothing when payload is empty', () => {
    const wrapper = mount(ActionButtons, {
      props: {
        payload: [],
      },
    })

    expect(wrapper.find('[data-testid="action-buttons"]').exists()).toBe(false)
  })

  it('passes action prop to buttons', () => {
    const mockAction = vi.fn()
    const wrapper = mount(ActionButtons, {
      props: {
        payload: mockButtons,
        action: mockAction,
      },
    })

    const buttons = wrapper.findAllComponents(ActionButton)
    expect(buttons[0].props('action')).toBe(mockAction)
  })

  it('disables buttons when action is undefined', () => {
    const wrapper = mount(ActionButtons, {
      props: {
        payload: mockButtons,
        // action is undefined
      },
    })

    const buttons = wrapper.findAllComponents(ActionButton)
    expect(buttons[0].props('disabled')).toBe(true)
  })

  it('applies custom class names', () => {
    const wrapper = mount(ActionButtons, {
      props: {
        payload: mockButtons,
        className: 'custom-container',
        buttonClassName: 'custom-button',
        buttonListItemClassName: 'custom-list-item',
      },
    })

    const container = wrapper.find('[data-testid="action-buttons"]')
    expect(container.classes()).toContain('custom-container')

    const listItems = wrapper.findAll('li')
    expect(listItems[0].classes()).toContain('custom-list-item')
  })

  it('applies container style', () => {
    const wrapper = mount(ActionButtons, {
      props: {
        payload: mockButtons,
        containerStyle: {
          maxWidth: '400px',
        },
      },
    })

    const container = wrapper.find('[data-testid="action-buttons"]')
    expect(container.attributes('style')).toContain('max-width: 400px')
  })

  it('passes config to buttons', () => {
    const mockConfig: any = {
      settings: {
        widgetSettings: {
          enableAutoFocus: true,
        },
      },
    }

    const wrapper = mount(ActionButtons, {
      props: {
        payload: mockButtons,
        config: mockConfig,
      },
    })

    const buttons = wrapper.findAllComponents(ActionButton)
    expect(buttons[0].props('config')).toStrictEqual(mockConfig)
  })

  it('passes size prop to buttons', () => {
    const wrapper = mount(ActionButtons, {
      props: {
        payload: mockButtons,
        size: 'large',
      },
    })

    const buttons = wrapper.findAllComponents(ActionButton)
    expect(buttons[0].props('size')).toBe('large')
  })

  it('generates unique IDs for buttons', () => {
    const wrapper = mount(ActionButtons, {
      props: {
        payload: mockButtons,
      },
    })

    const buttons = wrapper.findAllComponents(ActionButton)
    const ids = buttons.map((btn) => btn.props('id'))

    // Check all IDs are defined
    expect(ids.every((id) => id !== undefined)).toBe(true)

    // Check all IDs are unique
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})

describe('ActionButton', () => {
  it('renders as button for postback type', () => {
    const button: IWebchatButton = {
      type: 'postback',
      title: 'Click Me',
      payload: 'test_payload',
    }

    const wrapper = mount(ActionButton, {
      props: {
        button,
        position: 1,
        total: 1,
      },
    })

    expect(wrapper.element.tagName).toBe('BUTTON')
  })

  it('renders as anchor for web_url type', () => {
    const button: IWebchatButton = {
      type: 'web_url',
      title: 'Visit Site',
      url: 'https://example.com',
      target: '_blank',
    }

    const wrapper = mount(ActionButton, {
      props: {
        button,
        position: 1,
        total: 1,
      },
    })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('https://example.com')
    expect(wrapper.attributes('target')).toBe('_blank')
  })

  it('renders as anchor for phone_number type', () => {
    const button: IWebchatButton = {
      type: 'phone_number',
      title: 'Call',
      payload: '1234567890',
    }

    const wrapper = mount(ActionButton, {
      props: {
        button,
        position: 1,
        total: 1,
      },
    })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('tel:1234567890')
  })

  it('displays button title', () => {
    const button: IWebchatButton = {
      type: 'postback',
      title: 'My Button',
      payload: 'test',
    }

    const wrapper = mount(ActionButton, {
      props: {
        button,
        position: 1,
        total: 1,
      },
    })

    expect(wrapper.text()).toContain('My Button')
  })

  it('applies disabled state', () => {
    const button: IWebchatButton = {
      type: 'postback',
      title: 'Disabled Button',
      payload: 'test',
    }

    const wrapper = mount(ActionButton, {
      props: {
        button,
        position: 1,
        total: 1,
        disabled: true,
      },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.classes()).toContain('disabled')
  })

  it('calls action on postback button click', async () => {
    const mockAction = vi.fn()
    const button: IWebchatButton = {
      type: 'postback',
      title: 'Action Button',
      payload: 'my_payload',
    }

    const wrapper = mount(ActionButton, {
      props: {
        button,
        action: mockAction,
        position: 1,
        total: 1,
      },
    })

    await wrapper.trigger('click')

    expect(mockAction).toHaveBeenCalledWith('my_payload', null, { label: 'Action Button' })
  })

  it('does not call action when disabled', async () => {
    const mockAction = vi.fn()
    const button: IWebchatButton = {
      type: 'postback',
      title: 'Disabled',
      payload: 'test',
    }

    const wrapper = mount(ActionButton, {
      props: {
        button,
        action: mockAction,
        position: 1,
        total: 1,
        disabled: true,
      },
    })

    await wrapper.trigger('click')

    expect(mockAction).not.toHaveBeenCalled()
  })

  it('includes position in aria-label for multiple buttons', () => {
    const button: IWebchatButton = {
      type: 'postback',
      title: 'Button',
      payload: 'test',
    }

    const wrapper = mount(ActionButton, {
      props: {
        button,
        position: 2,
        total: 4,
      },
    })

    const ariaLabel = wrapper.attributes('aria-label')
    expect(ariaLabel).toContain('2 of 4')
    expect(ariaLabel).toContain('Button')
  })

  it('shows "Call" label for phone_number without title', () => {
    const button: IWebchatButton = {
      type: 'phone_number',
      payload: '1234567890',
      // No title
    }

    const wrapper = mount(ActionButton, {
      props: {
        button,
        position: 1,
        total: 1,
      },
    })

    expect(wrapper.text()).toContain('Call')
  })

  it('renders image when provided', () => {
    const button: IWebchatButton = {
      type: 'postback',
      title: 'Image Button',
      payload: 'test',
      image_url: 'https://example.com/image.jpg',
      image_alt_text: 'Button image',
    }

    const wrapper = mount(ActionButton, {
      props: {
        button,
        position: 1,
        total: 1,
      },
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/image.jpg')
    expect(img.attributes('alt')).toBe('Button image')
  })

  it('uses small typography variant by default', () => {
    const button: IWebchatButton = {
      type: 'postback',
      title: 'Button',
      payload: 'test',
    }

    const wrapper = mount(ActionButton, {
      props: {
        button,
        position: 1,
        total: 1,
      },
    })

    const typography = wrapper.findComponent({ name: 'Typography' })
    expect(typography.props('variant')).toBe('cta-semibold')
  })

  it('uses large typography variant when size is large', () => {
    const button: IWebchatButton = {
      type: 'postback',
      title: 'Button',
      payload: 'test',
    }

    const wrapper = mount(ActionButton, {
      props: {
        button,
        position: 1,
        total: 1,
        size: 'large',
      },
    })

    const typography = wrapper.findComponent({ name: 'Typography' })
    expect(typography.props('variant')).toBe('title1-semibold')
  })

  it('shows LinkIcon for web_url when showUrlIcon is true', () => {
    const button: IWebchatButton = {
      type: 'web_url',
      title: 'Link',
      url: 'https://example.com',
    }

    const wrapper = mount(ActionButton, {
      props: {
        button,
        position: 1,
        total: 1,
        showUrlIcon: true,
      },
    })

    const linkIcon = wrapper.findComponent({ name: 'LinkIcon' })
    expect(linkIcon.exists()).toBe(true)
  })

  it('sets tabindex to -1 when disabled', () => {
    const button: IWebchatButton = {
      type: 'postback',
      title: 'Button',
      payload: 'test',
    }

    const wrapper = mount(ActionButton, {
      props: {
        button,
        position: 1,
        total: 1,
        disabled: true,
      },
    })

    expect(wrapper.attributes('tabindex')).toBe('-1')
  })
})
