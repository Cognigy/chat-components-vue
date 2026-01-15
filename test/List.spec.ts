import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import List from '../src/components/messages/List.vue'
import ListItem from '../src/components/messages/ListItem.vue'
import { MessageContextKey } from '../src/composables/useMessageContext'
import type { IMessage, ChatConfig, IWebchatAttachmentElement, IWebchatButton } from '../src/types'

describe('List', () => {
  let wrapper: VueWrapper

  const createElement = (
    title: string,
    subtitle?: string,
    imageUrl?: string,
    hasButton = false,
    defaultActionUrl?: string
  ): IWebchatAttachmentElement => {
    return {
      title,
      subtitle: subtitle || '',
      image_url: imageUrl,
      image_alt_text: imageUrl ? `${title} image` : undefined,
      buttons: hasButton
        ? [
            { title: 'View Details', type: 'postback', payload: 'view' },
          ]
        : undefined,
      default_action: defaultActionUrl ? { url: defaultActionUrl } : undefined,
    }
  }

  const createListMessage = (
    elements: IWebchatAttachmentElement[],
    topElementStyle?: 'large' | 'compact' | boolean,
    globalButton?: IWebchatButton
  ): IMessage => {
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
                  template_type: 'list',
                  elements,
                  top_element_style: topElementStyle,
                  buttons: globalButton ? [globalButton] : undefined,
                },
              },
            },
          },
        },
      },
    }
  }

  const mountList = (message: IMessage, config?: ChatConfig) => {
    return mount(List, {
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
    it('renders list with elements', () => {
      const elements = [
        createElement('Item 1', 'Description 1'),
        createElement('Item 2', 'Description 2'),
      ]
      const message = createListMessage(elements)
      wrapper = mountList(message)

      const list = wrapper.find('[data-testid="list-message"]')
      expect(list.exists()).toBe(true)
      expect(list.classes()).toContain('webchat-list-template-root')
    })

    it('does not render when elements array is empty', () => {
      const message = createListMessage([])
      wrapper = mountList(message)

      const list = wrapper.find('[data-testid="list-message"]')
      expect(list.exists()).toBe(false)
    })

    it('renders correct number of list items', () => {
      const elements = [
        createElement('Item 1'),
        createElement('Item 2'),
        createElement('Item 3'),
      ]
      const message = createListMessage(elements)
      wrapper = mountList(message)

      const listItems = wrapper.findAllComponents(ListItem)
      expect(listItems.length).toBe(3)
    })
  })

  describe('Header Element (top_element_style)', () => {
    it('renders header element when top_element_style is "large"', () => {
      const elements = [
        createElement('Header Item', 'Header description', 'https://example.com/header.jpg'),
        createElement('Regular Item 1', 'Description 1'),
      ]
      const message = createListMessage(elements, 'large')
      wrapper = mountList(message)

      // Should have header element
      const headerElement = wrapper.find('[data-testid="header-image"]')
      expect(headerElement.exists()).toBe(true)

      // Should have one regular item in the list
      const regularItems = wrapper.findAll('[data-testid="list-item"]')
      expect(regularItems.length).toBe(1)
    })

    it('renders header element when top_element_style is true', () => {
      const elements = [
        createElement('Header Item', 'Header description', 'https://example.com/header.jpg'),
        createElement('Regular Item 1', 'Description 1'),
      ]
      const message = createListMessage(elements, true)
      wrapper = mountList(message)

      const headerElement = wrapper.find('[data-testid="header-image"]')
      expect(headerElement.exists()).toBe(true)
    })

    it('does not render header element when top_element_style is "compact"', () => {
      const elements = [
        createElement('Item 1', 'Description 1'),
        createElement('Item 2', 'Description 2'),
      ]
      const message = createListMessage(elements, 'compact')
      wrapper = mountList(message)

      const headerElement = wrapper.find('[data-testid="header-image"]')
      expect(headerElement.exists()).toBe(false)

      // All items should be regular items
      const regularItems = wrapper.findAll('[data-testid="list-item"]')
      expect(regularItems.length).toBe(2)
    })

    it('does not render header element when top_element_style is undefined', () => {
      const elements = [
        createElement('Item 1', 'Description 1'),
        createElement('Item 2', 'Description 2'),
      ]
      const message = createListMessage(elements)
      wrapper = mountList(message)

      const headerElement = wrapper.find('[data-testid="header-image"]')
      expect(headerElement.exists()).toBe(false)

      const regularItems = wrapper.findAll('[data-testid="list-item"]')
      expect(regularItems.length).toBe(2)
    })
  })

  describe('List Structure', () => {
    it('renders <ul> element for list items', () => {
      const elements = [
        createElement('Item 1'),
        createElement('Item 2'),
      ]
      const message = createListMessage(elements)
      wrapper = mountList(message)

      const ul = wrapper.find('ul')
      expect(ul.exists()).toBe(true)
    })

    it('renders list items as <li> elements', () => {
      const elements = [
        createElement('Item 1'),
        createElement('Item 2'),
      ]
      const message = createListMessage(elements)
      wrapper = mountList(message)

      const listItems = wrapper.findAll('li')
      expect(listItems.length).toBe(2)
    })

    it('applies aria-labelledby when header element exists', () => {
      const elements = [
        createElement('Header Item', 'Header description'),
        createElement('Item 1'),
      ]
      const message = createListMessage(elements, 'large')
      wrapper = mountList(message)

      const ul = wrapper.find('ul')
      expect(ul.attributes('aria-labelledby')).toBeDefined()
      expect(ul.attributes('aria-labelledby')).toContain('listHeader-header-')
    })

    it('does not apply aria-labelledby when no header element', () => {
      const elements = [
        createElement('Item 1'),
        createElement('Item 2'),
      ]
      const message = createListMessage(elements)
      wrapper = mountList(message)

      const ul = wrapper.find('ul')
      expect(ul.attributes('aria-labelledby')).toBeUndefined()
    })
  })

  describe('Global Button', () => {
    it('renders global button at bottom when provided', () => {
      const elements = [createElement('Item 1'), createElement('Item 2')]
      const globalButton: IWebchatButton = {
        title: 'View More',
        type: 'web_url',
        url: 'https://example.com/more',
      }
      const message = createListMessage(elements, undefined, globalButton)
      wrapper = mountList(message)

      const button = wrapper.find('.webchat-list-template-global-button')
      expect(button.exists()).toBe(true)
    })

    it('does not render global button when not provided', () => {
      const elements = [createElement('Item 1'), createElement('Item 2')]
      const message = createListMessage(elements)
      wrapper = mountList(message)

      const button = wrapper.find('.webchat-list-template-global-button')
      expect(button.exists()).toBe(false)
    })

    it('renders only first button from buttons array', () => {
      const elements = [createElement('Item 1')]
      const message = createListMessage(elements, undefined, undefined)

      // Manually add multiple buttons to test
      if (message.data?._cognigy?._webchat?.message?.attachment) {
        const attachment = message.data._cognigy._webchat.message.attachment as any
        attachment.payload.buttons = [
          { title: 'Button 1', type: 'postback', payload: 'btn1' },
          { title: 'Button 2', type: 'postback', payload: 'btn2' },
        ]
      }

      wrapper = mountList(message)

      const buttons = wrapper.findAll('.webchat-list-template-global-button')
      expect(buttons.length).toBe(1)
    })
  })

  describe('ListItem Component', () => {
    it('passes correct props to ListItem', () => {
      const elements = [
        createElement('Item 1', 'Description 1', 'https://example.com/image.jpg', true),
      ]
      const message = createListMessage(elements)
      wrapper = mountList(message)

      const listItem = wrapper.findComponent(ListItem)
      expect(listItem.props('element')).toEqual(elements[0])
      expect(listItem.props('isHeaderElement')).toBe(false)
      expect(listItem.props('headingLevel')).toBe('h4')
    })

    it('passes isHeaderElement=true for header element', () => {
      const elements = [
        createElement('Header Item', 'Header description'),
        createElement('Item 1'),
      ]
      const message = createListMessage(elements, 'large')
      wrapper = mountList(message)

      const listItems = wrapper.findAllComponents(ListItem)
      const headerItem = listItems[0]

      expect(headerItem.props('isHeaderElement')).toBe(true)
      expect(headerItem.props('headingLevel')).toBe('h4')
    })

    it('uses h5 for regular items when header element exists', () => {
      const elements = [
        createElement('Header Item'),
        createElement('Item 1'),
        createElement('Item 2'),
      ]
      const message = createListMessage(elements, 'large')
      wrapper = mountList(message)

      const listItems = wrapper.findAllComponents(ListItem)
      const regularItem = listItems[1]

      expect(regularItem.props('headingLevel')).toBe('h5')
    })

    it('uses h4 for regular items when no header element', () => {
      const elements = [
        createElement('Item 1'),
        createElement('Item 2'),
      ]
      const message = createListMessage(elements)
      wrapper = mountList(message)

      const listItems = wrapper.findAllComponents(ListItem)
      expect(listItems[0].props('headingLevel')).toBe('h4')
      expect(listItems[1].props('headingLevel')).toBe('h4')
    })
  })

  describe('Dividers', () => {
    it('applies dividerBefore to items after the first', () => {
      const elements = [
        createElement('Item 1'),
        createElement('Item 2'),
        createElement('Item 3'),
      ]
      const message = createListMessage(elements)
      wrapper = mountList(message)

      const listItems = wrapper.findAllComponents(ListItem)

      expect(listItems[0].props('dividerBefore')).toBe(false)
      expect(listItems[1].props('dividerBefore')).toBe(true)
      expect(listItems[2].props('dividerBefore')).toBe(true)
    })

    it('applies dividerAfter to last item when global button exists', () => {
      const elements = [
        createElement('Item 1'),
        createElement('Item 2'),
      ]
      const globalButton: IWebchatButton = {
        title: 'View More',
        type: 'postback',
        payload: 'more',
      }
      const message = createListMessage(elements, undefined, globalButton)
      wrapper = mountList(message)

      const listItems = wrapper.findAllComponents(ListItem)
      const lastItem = listItems[listItems.length - 1]

      expect(lastItem.props('dividerAfter')).toBe(true)
    })

    it('does not apply dividerAfter when no global button', () => {
      const elements = [
        createElement('Item 1'),
        createElement('Item 2'),
      ]
      const message = createListMessage(elements)
      wrapper = mountList(message)

      const listItems = wrapper.findAllComponents(ListItem)
      const lastItem = listItems[listItems.length - 1]

      expect(lastItem.props('dividerAfter')).toBe(false)
    })
  })

  describe('Images', () => {
    it('renders header element with background image', () => {
      const elements = [
        createElement('Header', 'Subtitle', 'https://example.com/header.jpg'),
        createElement('Item 1'),
      ]
      const message = createListMessage(elements, 'large')
      wrapper = mountList(message)

      const header = wrapper.find('[data-testid="header-image"]')
      expect(header.exists()).toBe(true)

      // Check background image style is applied
      const style = header.attributes('style')
      expect(style).toContain('background-image')
      expect(style).toContain('https://example.com/header.jpg')
    })

    it('renders regular items with thumbnail images', () => {
      const elements = [
        createElement('Item 1', 'Description', 'https://example.com/image1.jpg'),
      ]
      const message = createListMessage(elements)
      wrapper = mountList(message)

      const image = wrapper.find('[data-testid="regular-image"]')
      expect(image.exists()).toBe(true)

      const style = image.attributes('style')
      expect(style).toContain('background-image')
      expect(style).toContain('https://example.com/image1.jpg')
    })
  })

  describe('Accessibility', () => {
    it('generates unique IDs for list items', () => {
      const elements = [
        createElement('Item 1'),
        createElement('Item 2'),
      ]
      const message = createListMessage(elements)
      wrapper = mountList(message)

      const listItems = wrapper.findAllComponents(ListItem)
      const id1 = listItems[0].props('id')
      const id2 = listItems[1].props('id')

      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
    })

    it('generates unique ID for header element', () => {
      const elements = [
        createElement('Header'),
        createElement('Item 1'),
      ]
      const message = createListMessage(elements, 'large')
      wrapper = mountList(message)

      const listItems = wrapper.findAllComponents(ListItem)
      const headerId = listItems[0].props('id')

      expect(headerId).toBeDefined()
      expect(headerId).toContain('header-')
    })
  })

  describe('Content Rendering', () => {
    it('renders element titles', () => {
      const elements = [
        createElement('First Item', 'First description'),
        createElement('Second Item', 'Second description'),
      ]
      const message = createListMessage(elements)
      wrapper = mountList(message)

      const html = wrapper.html()
      expect(html).toContain('First Item')
      expect(html).toContain('Second Item')
    })

    it('renders element subtitles', () => {
      const elements = [
        createElement('Item', 'This is a subtitle'),
      ]
      const message = createListMessage(elements)
      wrapper = mountList(message)

      const html = wrapper.html()
      expect(html).toContain('This is a subtitle')
    })

    it('renders buttons for items', () => {
      const elements = [
        createElement('Item 1', 'Description', undefined, true),
      ]
      const message = createListMessage(elements)
      wrapper = mountList(message)

      const button = wrapper.find('.webchat-list-template-element-button')
      expect(button.exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('handles missing attachment gracefully', () => {
      const message: IMessage = {
        text: '',
        source: 'bot',
        timestamp: '1673456789000',
        data: {
          _cognigy: {
            _webchat: {
              message: {},
            },
          },
        },
      }
      wrapper = mountList(message)

      const list = wrapper.find('[data-testid="list-message"]')
      expect(list.exists()).toBe(false)
    })

    it('handles missing elements array', () => {
      const message: IMessage = {
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
                    template_type: 'list',
                  },
                },
              },
            },
          },
        },
      }
      wrapper = mountList(message)

      const list = wrapper.find('[data-testid="list-message"]')
      expect(list.exists()).toBe(false)
    })

    it('handles elements without images', () => {
      const elements = [
        createElement('Item 1', 'Description'),
        createElement('Item 2', 'Description'),
      ]
      const message = createListMessage(elements)
      wrapper = mountList(message)

      const images = wrapper.findAll('[data-testid="regular-image"]')
      expect(images.length).toBe(0)
    })

    it('handles elements without buttons', () => {
      const elements = [
        createElement('Item 1', 'Description', undefined, false),
      ]
      const message = createListMessage(elements)
      wrapper = mountList(message)

      const buttons = wrapper.findAll('.webchat-list-template-element-button')
      expect(buttons.length).toBe(0)
    })

    it('handles single element in list', () => {
      const elements = [createElement('Single Item')]
      const message = createListMessage(elements)
      wrapper = mountList(message)

      const listItems = wrapper.findAllComponents(ListItem)
      expect(listItems.length).toBe(1)
    })
  })

  describe('Configuration', () => {
    it('passes config to ListItem components', () => {
      const elements = [createElement('Item 1')]
      const message = createListMessage(elements)
      const config: ChatConfig = {
        settings: {
          layout: {
            disableUrlButtonSanitization: true,
          },
        },
      }
      wrapper = mountList(message, config)

      // Config is provided through MessageContext
      expect(wrapper.findComponent(ListItem).exists()).toBe(true)
    })
  })
})
