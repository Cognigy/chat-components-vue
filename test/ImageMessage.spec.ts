import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import ImageMessage from '../src/components/messages/ImageMessage.vue'
import { MessageContextKey } from '../src/composables/useMessageContext'
import type { IMessage, ChatConfig } from '../src/types'

describe('ImageMessage', () => {
  let wrapper: VueWrapper

  const createImageMessage = (url: string, altText?: string, buttons?: any[]): IMessage => ({
    text: '',
    source: 'bot',
    timestamp: '1673456789000',
    data: {
      _cognigy: {
        _webchat: {
          message: {
            attachment: {
              type: 'image',
              payload: {
                url,
                altText,
                buttons,
              },
            },
          },
        },
      },
    },
  })

  const mountImageMessage = (message: IMessage, config?: ChatConfig) => {
    return mount(ImageMessage, {
      global: {
        provide: {
          [MessageContextKey as symbol]: {
            message,
            config: config || {},
            action: vi.fn(),
            onEmitAnalytics: vi.fn(),
          },
        },
        stubs: {
          Teleport: true,
        },
      },
    })
  }

  beforeEach(() => {
    // Mock window.open
    vi.stubGlobal('open', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    wrapper?.unmount()
  })

  it('renders image with URL', () => {
    const message = createImageMessage('https://example.com/image.jpg', 'Test image')
    wrapper = mountImageMessage(message)

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/image.jpg')
    expect(img.attributes('alt')).toBe('Test image')
  })

  it('does not render when URL is missing', () => {
    const message: IMessage = {
      text: '',
      source: 'bot',
      timestamp: '1673456789000',
      data: {
        _cognigy: {
          _webchat: {
            message: {
              attachment: {
                type: 'image',
                payload: {},
              },
            },
          },
        },
      },
    }
    wrapper = mountImageMessage(message)

    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('renders with alt text', () => {
    const message = createImageMessage('https://example.com/image.jpg', 'Descriptive alt text')
    wrapper = mountImageMessage(message)

    const img = wrapper.find('img')
    expect(img.attributes('alt')).toBe('Descriptive alt text')
  })

  it('renders without alt text', () => {
    const message = createImageMessage('https://example.com/image.jpg')
    wrapper = mountImageMessage(message)

    const img = wrapper.find('img')
    expect(img.attributes('alt')).toBe('')
  })

  it('handles broken image', async () => {
    const message = createImageMessage('https://example.com/broken.jpg', 'Broken image')
    wrapper = mountImageMessage(message)

    const img = wrapper.find('img')
    await img.trigger('error')

    // Broken image span should appear
    expect(wrapper.find('span').exists()).toBe(true)
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('renders as downloadable when web_url button present', () => {
    const message = createImageMessage('https://example.com/image.jpg', 'Image', [
      { type: 'web_url', url: 'https://example.com/download', title: 'Download' },
    ])
    wrapper = mountImageMessage(message)

    const imageContainer = wrapper.find('[role="button"]')
    expect(imageContainer.exists()).toBe(true)
    expect(imageContainer.attributes('tabindex')).toBe('0')
  })

  it('renders as non-downloadable when no web_url button', () => {
    const message = createImageMessage('https://example.com/image.jpg', 'Image')
    wrapper = mountImageMessage(message)

    const imageContainers = wrapper.findAll('[role="button"]')
    // Should not have role="button" on image container when not downloadable
    expect(imageContainers.length).toBe(0)
  })

  it('shows download button when button provided', () => {
    const message = createImageMessage('https://example.com/image.jpg', 'Image', [
      { type: 'web_url', url: 'https://example.com/download', title: 'Download' },
    ])
    wrapper = mountImageMessage(message)

    // ActionButton component should be rendered
    expect(wrapper.findComponent({ name: 'ActionButton' }).exists()).toBe(true)
  })

  it('does not show download button when no button provided', () => {
    const message = createImageMessage('https://example.com/image.jpg', 'Image')
    wrapper = mountImageMessage(message)

    // ActionButton component should not be rendered
    expect(wrapper.findComponent({ name: 'ActionButton' }).exists()).toBe(false)
  })

  it('opens lightbox on click when downloadable', async () => {
    const message = createImageMessage('https://example.com/image.jpg', 'Image', [
      { type: 'web_url', url: 'https://example.com/download', title: 'Download' },
    ])
    wrapper = mountImageMessage(message)

    const imageContainer = wrapper.find('[role="button"]')
    await imageContainer.trigger('click')

    // Lightbox should be shown (check for dialog role)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
  })

  it('does not open lightbox when not downloadable', async () => {
    const message = createImageMessage('https://example.com/image.jpg', 'Image')
    wrapper = mountImageMessage(message)

    await wrapper.trigger('click')

    // Lightbox should not be shown
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('opens lightbox on Enter key', async () => {
    const message = createImageMessage('https://example.com/image.jpg', 'Image', [
      { type: 'web_url', url: 'https://example.com/download', title: 'Download' },
    ])
    wrapper = mountImageMessage(message)

    const imageContainer = wrapper.find('[role="button"]')
    await imageContainer.trigger('keydown', { key: 'Enter' })

    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
  })

  it('opens lightbox on Space key', async () => {
    const message = createImageMessage('https://example.com/image.jpg', 'Image', [
      { type: 'web_url', url: 'https://example.com/download', title: 'Download' },
    ])
    wrapper = mountImageMessage(message)

    const imageContainer = wrapper.find('[role="button"]')
    await imageContainer.trigger('keydown', { key: ' ' })

    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
  })

  it('closes lightbox on close button click', async () => {
    const message = createImageMessage('https://example.com/image.jpg', 'Image', [
      { type: 'web_url', url: 'https://example.com/download', title: 'Download' },
    ])
    wrapper = mountImageMessage(message)

    // Open lightbox
    const imageContainer = wrapper.find('[role="button"]')
    await imageContainer.trigger('click')
    await wrapper.vm.$nextTick()

    // Find and click close button (second button in iconsGroup)
    const buttons = wrapper.findAll('button')
    const closeButton = buttons[buttons.length - 1]
    await closeButton.trigger('click')

    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('closes lightbox on backdrop click', async () => {
    const message = createImageMessage('https://example.com/image.jpg', 'Image', [
      { type: 'web_url', url: 'https://example.com/download', title: 'Download' },
    ])
    wrapper = mountImageMessage(message)

    // Open lightbox
    await wrapper.find('[role="button"]').trigger('click')
    await wrapper.vm.$nextTick()

    // Click on lightbox content (backdrop)
    const lightboxContent = wrapper.find('[role="dialog"]').find('div')
    await lightboxContent.trigger('click')

    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('does not close lightbox on image click', async () => {
    const message = createImageMessage('https://example.com/image.jpg', 'Image', [
      { type: 'web_url', url: 'https://example.com/download', title: 'Download' },
    ])
    wrapper = mountImageMessage(message)

    // Open lightbox
    await wrapper.find('[role="button"]').trigger('click')
    await wrapper.vm.$nextTick()

    // Click on the image itself
    const lightboxImage = wrapper.find('[data-testid="image-lightbox"]')
    await lightboxImage.trigger('click')

    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
  })

  it('downloads image on download button click', async () => {
    const message = createImageMessage('https://example.com/image.jpg', 'Image', [
      { type: 'web_url', url: 'https://example.com/download', title: 'Download' },
    ])
    wrapper = mountImageMessage(message)

    // Open lightbox
    await wrapper.find('[role="button"]').trigger('click')
    await wrapper.vm.$nextTick()

    // Click download button (first button in iconsGroup)
    const buttons = wrapper.findAll('button')
    const downloadButton = buttons[buttons.length - 2] // Second to last button
    await downloadButton.trigger('click')

    expect(window.open).toHaveBeenCalledWith('https://example.com/image.jpg', '_blank')
  })

  it('uses dynamic aspect ratio when configured', () => {
    const message = createImageMessage('https://example.com/image.jpg', 'Image')
    const config: ChatConfig = {
      settings: {
        layout: {
          dynamicImageAspectRatio: true,
        },
      },
    }
    wrapper = mountImageMessage(message, config)

    const imageContainer = wrapper.find('img').element.parentElement!
    expect(imageContainer.className).toContain('fixedImage')
  })

  it('uses fixed aspect ratio by default', () => {
    const message = createImageMessage('https://example.com/image.jpg', 'Image')
    wrapper = mountImageMessage(message)

    const imageContainer = wrapper.find('img').element.parentElement!
    expect(imageContainer.className).toContain('flexImage')
  })

  it('uses custom translation for view image label', () => {
    const message = createImageMessage('https://example.com/image.jpg', 'Image', [
      { type: 'web_url', url: 'https://example.com/download', title: 'Download' },
    ])
    const config: ChatConfig = {
      settings: {
        customTranslations: {
          ariaLabels: {
            viewImageInFullsize: 'Custom view label',
          },
        },
      },
    }
    wrapper = mountImageMessage(message, config)

    const imageContainer = wrapper.find('[role="button"]')
    expect(imageContainer.attributes('aria-label')).toBe('Custom view label')
  })

  it('uses custom translation for lightbox title', async () => {
    const message = createImageMessage('https://example.com/image.jpg', 'Image', [
      { type: 'web_url', url: 'https://example.com/download', title: 'Download' },
    ])
    const config: ChatConfig = {
      settings: {
        customTranslations: {
          ariaLabels: {
            fullSizeImageViewerTitle: 'Custom lightbox title',
          },
        },
      },
    }
    wrapper = mountImageMessage(message, config)

    // Open lightbox
    await wrapper.find('[role="button"]').trigger('click')
    await wrapper.vm.$nextTick()

    const dialog = wrapper.find('[role="dialog"]')
    expect(dialog.attributes('aria-label')).toBe('Custom lightbox title')
  })

  it('uses custom translation for download button', async () => {
    const message = createImageMessage('https://example.com/image.jpg', 'Image', [
      { type: 'web_url', url: 'https://example.com/download', title: 'Download' },
    ])
    const config: ChatConfig = {
      settings: {
        customTranslations: {
          ariaLabels: {
            downloadFullsizeImage: 'Custom download label',
          },
        },
      },
    }
    wrapper = mountImageMessage(message, config)

    // Open lightbox
    await wrapper.find('[role="button"]').trigger('click')
    await wrapper.vm.$nextTick()

    const buttons = wrapper.findAll('button')
    const downloadButton = buttons[buttons.length - 2]
    expect(downloadButton.attributes('aria-label')).toBe('Custom download label')
  })

  it('uses custom translation for close button', async () => {
    const message = createImageMessage('https://example.com/image.jpg', 'Image', [
      { type: 'web_url', url: 'https://example.com/download', title: 'Download' },
    ])
    const config: ChatConfig = {
      settings: {
        customTranslations: {
          ariaLabels: {
            closeFullsizeImageModal: 'Custom close label',
          },
        },
      },
    }
    wrapper = mountImageMessage(message, config)

    // Open lightbox
    await wrapper.find('[role="button"]').trigger('click')
    await wrapper.vm.$nextTick()

    const buttons = wrapper.findAll('button')
    const closeButton = buttons[buttons.length - 1]
    expect(closeButton.attributes('aria-label')).toBe('Custom close label')
  })

  it('displays caption in lightbox', async () => {
    const message = createImageMessage('https://example.com/image.jpg', 'My Image Caption', [
      { type: 'web_url', url: 'https://example.com/download', title: 'Download' },
    ])
    wrapper = mountImageMessage(message)

    // Open lightbox
    await wrapper.find('[role="button"]').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('My Image Caption')
  })

  it('handles missing caption gracefully', async () => {
    const message = createImageMessage('https://example.com/image.jpg', undefined, [
      { type: 'web_url', url: 'https://example.com/download', title: 'Download' },
    ])
    wrapper = mountImageMessage(message)

    // Open lightbox
    await wrapper.find('[role="button"]').trigger('click')
    await wrapper.vm.$nextTick()

    // Should not crash, caption should be empty
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
  })
})
