import { describe, it, expect, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import Gallery from '../src/components/messages/Gallery.vue'
import { MessageContextKey } from '../src/composables/useMessageContext'
import type { IMessage, ChatConfig, IWebchatAttachmentElement } from '../src/types'

describe('Gallery', () => {
  let wrapper: VueWrapper

  const createElement = (
    title: string,
    subtitle?: string,
    hasButtons = false
  ): IWebchatAttachmentElement => {
    return {
      title,
      subtitle: subtitle || '',
      image_url: `https://example.com/${title.toLowerCase().replace(/\s/g, '-')}.jpg`,
      image_alt_text: `${title} image`,
      buttons: hasButtons
        ? [
            { title: 'Buy Now', type: 'postback', payload: 'buy' },
            { title: 'Learn More', type: 'web_url', url: 'https://example.com' },
          ]
        : undefined,
      default_action: undefined,
    }
  }

  const createGalleryMessage = (elements: IWebchatAttachmentElement[]): IMessage => {
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
                  template_type: 'generic',
                  elements,
                },
              },
            },
          },
        },
      },
    }
  }

  const mountGallery = (message: IMessage, config?: ChatConfig) => {
    return mount(Gallery, {
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
    it('renders single card without carousel', () => {
      const elements = [createElement('Product 1', 'Description 1')]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      const gallery = wrapper.find('[data-testid="gallery-message"]')
      expect(gallery.exists()).toBe(true)

      // Should not have Swiper classes for single item
      expect(gallery.classes()).not.toContain('swiper')
    })

    it('renders multiple cards with carousel', () => {
      const elements = [
        createElement('Product 1', 'Description 1'),
        createElement('Product 2', 'Description 2'),
        createElement('Product 3', 'Description 3'),
      ]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      const gallery = wrapper.find('[data-testid="gallery-message"]')
      expect(gallery.exists()).toBe(true)

      // Should have Swiper component
      const swiper = wrapper.findComponent({ name: 'Swiper' })
      expect(swiper.exists()).toBe(true)
    })

    it('renders correct number of slides', () => {
      const elements = [
        createElement('Product 1'),
        createElement('Product 2'),
        createElement('Product 3'),
      ]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      const slides = wrapper.findAllComponents({ name: 'SwiperSlide' })
      expect(slides.length).toBe(3)
    })

    it('does not render when elements array is empty', () => {
      const message = createGalleryMessage([])
      wrapper = mountGallery(message)

      const gallery = wrapper.find('[data-testid="gallery-message"]')
      expect(gallery.exists()).toBe(false)
    })

    it('applies correct CSS class', () => {
      const elements = [createElement('Product 1')]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      const gallery = wrapper.find('.webchat-carousel-template-root')
      expect(gallery.exists()).toBe(true)
    })
  })

  describe('Gallery Items', () => {
    it('renders GalleryItem components', () => {
      const elements = [
        createElement('Product 1', 'Description 1'),
        createElement('Product 2', 'Description 2'),
      ]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      const items = wrapper.findAllComponents({ name: 'GalleryItem' })
      expect(items.length).toBe(2)
    })

    it('passes correct slide data to GalleryItem', () => {
      const elements = [createElement('Product 1', 'Description 1')]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      const item = wrapper.findComponent({ name: 'GalleryItem' })
      expect(item.exists()).toBe(true)

      const props = item.props()
      expect(props.slide.title).toBe('Product 1')
      expect(props.slide.subtitle).toBe('Description 1')
    })

    it('generates unique content IDs for each item', () => {
      const elements = [
        createElement('Product 1'),
        createElement('Product 2'),
        createElement('Product 3'),
      ]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      const items = wrapper.findAllComponents({ name: 'GalleryItem' })
      const contentIds = items.map((item) => item.props('contentId'))

      // All IDs should be unique
      const uniqueIds = new Set(contentIds)
      expect(uniqueIds.size).toBe(3)

      // IDs should have correct format
      contentIds.forEach((id: string, index: number) => {
        expect(id).toContain('webchatCarouselContentButton')
        expect(id).toContain(`-${index}`)
      })
    })
  })

  describe('Navigation Controls', () => {
    it('shows navigation buttons for multiple slides', () => {
      const elements = [
        createElement('Product 1'),
        createElement('Product 2'),
        createElement('Product 3'),
      ]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      const prevButton = wrapper.find('.gallery-button-prev')
      const nextButton = wrapper.find('.gallery-button-next')

      expect(prevButton.exists()).toBe(true)
      expect(nextButton.exists()).toBe(true)
    })

    it('does not show navigation buttons for single slide', () => {
      const elements = [createElement('Product 1')]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      const prevButton = wrapper.find('.gallery-button-prev')
      const nextButton = wrapper.find('.gallery-button-next')

      expect(prevButton.exists()).toBe(false)
      expect(nextButton.exists()).toBe(false)
    })

    it('renders arrow icons in navigation buttons', () => {
      const elements = [createElement('Product 1'), createElement('Product 2')]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      const prevButton = wrapper.find('.gallery-button-prev')
      const nextButton = wrapper.find('.gallery-button-next')

      const prevIcon = prevButton.findComponent({ name: 'ArrowBackIcon' })
      const nextIcon = nextButton.findComponent({ name: 'ArrowBackIcon' })

      expect(prevIcon.exists()).toBe(true)
      expect(nextIcon.exists()).toBe(true)
    })
  })

  describe('Swiper Configuration', () => {
    it('configures Swiper with correct modules', () => {
      const elements = [createElement('Product 1'), createElement('Product 2')]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      const swiper = wrapper.findComponent({ name: 'Swiper' })
      const modules = swiper.props('modules')

      expect(modules).toBeDefined()
      expect(Array.isArray(modules)).toBe(true)
      expect(modules.length).toBe(3) // Navigation, Pagination, A11y
    })

    it('sets correct space between slides', () => {
      const elements = [createElement('Product 1'), createElement('Product 2')]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      const swiper = wrapper.findComponent({ name: 'Swiper' })
      expect(swiper.props('spaceBetween')).toBe(8)
    })

    it('sets slides per view to auto', () => {
      const elements = [createElement('Product 1'), createElement('Product 2')]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      const swiper = wrapper.findComponent({ name: 'Swiper' })
      expect(swiper.props('slidesPerView')).toBe('auto')
    })

    it('configures navigation with correct selectors', () => {
      const elements = [createElement('Product 1'), createElement('Product 2')]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      const swiper = wrapper.findComponent({ name: 'Swiper' })
      const navigation = swiper.props('navigation')

      expect(navigation).toEqual({
        prevEl: '.gallery-button-prev',
        nextEl: '.gallery-button-next',
      })
    })

    it('enables pagination', () => {
      const elements = [createElement('Product 1'), createElement('Product 2')]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      const swiper = wrapper.findComponent({ name: 'Swiper' })
      const pagination = swiper.props('pagination')

      expect(pagination).toEqual({ clickable: true })
    })
  })

  describe('Accessibility', () => {
    it('sets correct accessibility label for slides', () => {
      const elements = [createElement('Product 1'), createElement('Product 2')]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      const swiper = wrapper.findComponent({ name: 'Swiper' })
      const a11y = swiper.props('a11y')

      expect(a11y).toBeDefined()
      expect(a11y.slideLabelMessage).toContain('Slide')
    })

    it('uses custom slide label from config', () => {
      const config: ChatConfig = {
        settings: {
          customTranslations: {
            ariaLabels: {
              slide: 'Card',
              actionButtonPositionText: '{{position}} of {{total}}',
            },
          },
        },
      }

      const elements = [createElement('Product 1'), createElement('Product 2')]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message, config)

      const swiper = wrapper.findComponent({ name: 'Swiper' })
      const a11y = swiper.props('a11y')

      // The component converts {{position}} and {{total}} to Swiper's {{index}} and {{slidesLength}}
      expect(a11y.slideLabelMessage).toContain('Card')
      expect(a11y.slideLabelMessage).toContain('{{index}}')
      expect(a11y.slideLabelMessage).toContain('{{slidesLength}}')
    })

    it('uses default slide label when not in config', () => {
      const elements = [createElement('Product 1'), createElement('Product 2')]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      const swiper = wrapper.findComponent({ name: 'Swiper' })
      const a11y = swiper.props('a11y')

      expect(a11y.slideLabelMessage).toBe('Slide {{index}} of {{slidesLength}}')
    })
  })

  describe('Card Content', () => {
    it('displays card with title and subtitle', () => {
      const elements = [createElement('Product Title', 'Product Subtitle')]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      expect(wrapper.text()).toContain('Product Title')
      expect(wrapper.text()).toContain('Product Subtitle')
    })

    it('displays card with buttons', () => {
      const elements = [createElement('Product 1', 'Description', true)]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      expect(wrapper.text()).toContain('Buy Now')
      expect(wrapper.text()).toContain('Learn More')
    })

    it('displays card without subtitle', () => {
      const elements = [createElement('Product Title')]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      expect(wrapper.text()).toContain('Product Title')
    })
  })

  describe('Message Source', () => {
    it('handles bot messages', () => {
      const elements = [createElement('Product 1')]
      const message = createGalleryMessage(elements)
      message.source = 'bot'
      wrapper = mountGallery(message)

      expect(wrapper.exists()).toBe(true)
    })

    it('handles user messages', () => {
      const elements = [createElement('Product 1')]
      const message = createGalleryMessage(elements)
      message.source = 'user'
      wrapper = mountGallery(message)

      expect(wrapper.exists()).toBe(true)
    })

    it('handles engagement messages', () => {
      const elements = [createElement('Product 1')]
      const message = createGalleryMessage(elements)
      message.source = 'engagement'
      wrapper = mountGallery(message)

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('handles missing attachment', () => {
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
      wrapper = mountGallery(message)

      const gallery = wrapper.find('[data-testid="gallery-message"]')
      expect(gallery.exists()).toBe(false)
    })

    it('handles missing payload', () => {
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
                  payload: {},
                },
              },
            },
          },
        },
      }
      wrapper = mountGallery(message)

      const gallery = wrapper.find('[data-testid="gallery-message"]')
      expect(gallery.exists()).toBe(false)
    })

    it('handles undefined elements', () => {
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
                    template_type: 'generic',
                    elements: undefined,
                  },
                },
              },
            },
          },
        },
      }
      wrapper = mountGallery(message)

      const gallery = wrapper.find('[data-testid="gallery-message"]')
      expect(gallery.exists()).toBe(false)
    })

    it('handles missing config', () => {
      const elements = [createElement('Product 1')]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message, undefined)

      expect(wrapper.exists()).toBe(true)
    })

    it('handles large number of slides', () => {
      const elements = Array.from({ length: 10 }, (_, i) =>
        createElement(`Product ${i + 1}`, `Description ${i + 1}`)
      )
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      const slides = wrapper.findAllComponents({ name: 'SwiperSlide' })
      expect(slides.length).toBe(10)
    })
  })

  describe('Slide Dimensions', () => {
    it('sets correct width for slides', () => {
      const elements = [createElement('Product 1'), createElement('Product 2')]
      const message = createGalleryMessage(elements)
      wrapper = mountGallery(message)

      const slides = wrapper.findAllComponents({ name: 'SwiperSlide' })
      slides.forEach((slide) => {
        expect(slide.attributes('style')).toContain('width: 206px')
      })
    })
  })
})
