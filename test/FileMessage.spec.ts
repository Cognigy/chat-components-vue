import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import FileMessage from '../src/components/messages/FileMessage.vue'
import { MessageContextKey } from '../src/composables/useMessageContext'
import type { IMessage, IUploadFileAttachmentData } from '../src/types'

describe('FileMessage', () => {
  let wrapper: VueWrapper

  const createFileAttachment = (
    fileName: string,
    mimeType: string,
    size: number,
    url = 'https://example.com/file'
  ): IUploadFileAttachmentData => {
    return {
      runtimeFileId: `file-${fileName}`,
      fileName,
      mimeType,
      size,
      url,
    }
  }

  const createFileMessage = (
    attachments: IUploadFileAttachmentData[],
    text?: string
  ): IMessage => {
    return {
      text: text || '',
      source: 'bot',
      timestamp: '1673456789000',
      data: {
        attachments,
      },
    }
  }

  const mountFileMessage = (message: IMessage) => {
    return mount(FileMessage, {
      global: {
        provide: {
          [MessageContextKey as symbol]: {
            message,
            config: {},
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
    it('renders single image attachment', () => {
      const attachments = [
        createFileAttachment('photo.jpg', 'image/jpeg', 2500000),
      ]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const images = wrapper.findAll('[data-testid="image-attachment"]')
      expect(images.length).toBe(1)
      expect(images[0].attributes('src')).toBe('https://example.com/file')
      expect(images[0].attributes('alt')).toContain('photo.jpg')
      expect(images[0].attributes('alt')).toContain('2.50 MB')
    })

    it('renders multiple image attachments', () => {
      const attachments = [
        createFileAttachment('photo1.jpg', 'image/jpeg', 1500000, 'https://example.com/photo1.jpg'),
        createFileAttachment('photo2.png', 'image/png', 2000000, 'https://example.com/photo2.png'),
        createFileAttachment('photo3.gif', 'image/gif', 500000, 'https://example.com/photo3.gif'),
      ]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const images = wrapper.findAll('[data-testid="image-attachment"]')
      expect(images.length).toBe(3)
    })

    it('renders single non-image file attachment', () => {
      const attachments = [
        createFileAttachment('document.pdf', 'application/pdf', 1500000),
      ]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const files = wrapper.findAll('[data-testid="file-attachment"]')
      expect(files.length).toBe(1)

      const html = wrapper.html()
      expect(html).toContain('document.')
      expect(html).toContain('pdf')
      expect(html).toContain('1.50 MB')
    })

    it('renders multiple non-image file attachments', () => {
      const attachments = [
        createFileAttachment('document.pdf', 'application/pdf', 1500000),
        createFileAttachment('spreadsheet.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 500000),
      ]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const files = wrapper.findAll('[data-testid="file-attachment"]')
      expect(files.length).toBe(2)
    })

    it('renders mixed image and non-image attachments', () => {
      const attachments = [
        createFileAttachment('photo.jpg', 'image/jpeg', 2000000),
        createFileAttachment('document.pdf', 'application/pdf', 1500000),
      ]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const images = wrapper.findAll('[data-testid="image-attachment"]')
      const files = wrapper.findAll('[data-testid="file-attachment"]')

      expect(images.length).toBe(1)
      expect(files.length).toBe(1)
    })

    it('does not render when no attachments', () => {
      const message = createFileMessage([])
      wrapper = mountFileMessage(message)

      expect(wrapper.html()).toBe('<!--v-if-->')
    })

    it('does not render when attachments is undefined', () => {
      const message: IMessage = {
        text: '',
        source: 'bot',
        timestamp: '1673456789000',
        data: {},
      }
      wrapper = mountFileMessage(message)

      expect(wrapper.html()).toBe('<!--v-if-->')
    })
  })

  describe('Image Sizing', () => {
    it('applies large image class for single image', () => {
      const attachments = [
        createFileAttachment('photo.jpg', 'image/jpeg', 2000000),
      ]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const image = wrapper.find('[data-testid="image-attachment"]')
      expect(image.classes()).not.toContain('smallImagePreview')
    })

    it('applies small image class for multiple images', () => {
      const attachments = [
        createFileAttachment('photo1.jpg', 'image/jpeg', 2000000),
        createFileAttachment('photo2.jpg', 'image/jpeg', 2000000),
      ]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const images = wrapper.findAll('[data-testid="image-attachment"]')
      images.forEach(image => {
        expect(image.classes()).toContain('smallImagePreview')
      })
    })

    it('applies small image class when mixed with non-image files', () => {
      const attachments = [
        createFileAttachment('photo.jpg', 'image/jpeg', 2000000),
        createFileAttachment('document.pdf', 'application/pdf', 1500000),
      ]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const image = wrapper.find('[data-testid="image-attachment"]')
      expect(image.classes()).toContain('smallImagePreview')
    })
  })

  describe('Image MIME Types', () => {
    it.each([
      ['image/jpeg', 'photo.jpg'],
      ['image/png', 'photo.png'],
      ['image/gif', 'animation.gif'],
      ['image/webp', 'photo.webp'],
    ])('renders %s as image attachment', (mimeType, fileName) => {
      const attachments = [createFileAttachment(fileName, mimeType, 1000000)]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const images = wrapper.findAll('[data-testid="image-attachment"]')
      expect(images.length).toBe(1)
    })

    it.each([
      ['application/pdf', 'document.pdf'],
      ['video/mp4', 'video.mp4'],
      ['text/plain', 'readme.txt'],
    ])('renders %s as file attachment (not image)', (mimeType, fileName) => {
      const attachments = [createFileAttachment(fileName, mimeType, 1000000)]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const images = wrapper.findAll('[data-testid="image-attachment"]')
      expect(images.length).toBe(0)

      const files = wrapper.findAll('[data-testid="file-attachment"]')
      expect(files.length).toBe(1)
    })
  })

  describe('File Links', () => {
    it('creates clickable links for images', () => {
      const attachments = [
        createFileAttachment('photo.jpg', 'image/jpeg', 1000000, 'https://example.com/download/photo.jpg'),
      ]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const link = wrapper.find('a')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe('https://example.com/download/photo.jpg')
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener noreferrer')
    })

    it('creates clickable links for non-image files', () => {
      const attachments = [
        createFileAttachment('document.pdf', 'application/pdf', 1000000, 'https://example.com/download/doc.pdf'),
      ]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const link = wrapper.find('a')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe('https://example.com/download/doc.pdf')
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener noreferrer')
    })
  })

  describe('File Name Parsing', () => {
    it('splits filename and extension correctly', () => {
      const attachments = [
        createFileAttachment('my-document.pdf', 'application/pdf', 1000000),
      ]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const html = wrapper.html()
      expect(html).toContain('my-document.')
      expect(html).toContain('pdf')
    })

    it('handles filenames with multiple dots', () => {
      const attachments = [
        createFileAttachment('my.long.file.name.pdf', 'application/pdf', 1000000),
      ]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const html = wrapper.html()
      expect(html).toContain('my.long.file.name.')
      expect(html).toContain('pdf')
    })

    it('handles filenames without extension', () => {
      const attachments = [
        createFileAttachment('README', 'text/plain', 5000),
      ]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const html = wrapper.html()
      expect(html).toContain('README')
    })
  })

  describe('File Size Formatting', () => {
    it('formats bytes to KB', () => {
      const attachments = [
        createFileAttachment('small.txt', 'text/plain', 5000),
      ]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const html = wrapper.html()
      expect(html).toContain('5.00 KB')
    })

    it('formats bytes to MB', () => {
      const attachments = [
        createFileAttachment('large.pdf', 'application/pdf', 2500000),
      ]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const html = wrapper.html()
      expect(html).toContain('2.50 MB')
    })

    it('displays file size in image alt text', () => {
      const attachments = [
        createFileAttachment('photo.jpg', 'image/jpeg', 3200000),
      ]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const image = wrapper.find('[data-testid="image-attachment"]')
      expect(image.attributes('alt')).toContain('3.20 MB')
    })
  })

  describe('Text Content', () => {
    it('renders text message below attachments', () => {
      const attachments = [
        createFileAttachment('photo.jpg', 'image/jpeg', 1000000),
      ]
      const message = createFileMessage(attachments, 'Here are the photos')
      wrapper = mountFileMessage(message)

      const textMessage = wrapper.findComponent({ name: 'TextMessage' })
      expect(textMessage.exists()).toBe(true)
      expect(textMessage.props('content')).toBe('Here are the photos')
    })

    it('does not render text message when no text', () => {
      const attachments = [
        createFileAttachment('photo.jpg', 'image/jpeg', 1000000),
      ]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const textMessage = wrapper.findComponent({ name: 'TextMessage' })
      expect(textMessage.exists()).toBe(false)
    })

    it('renders text with empty string correctly', () => {
      const attachments = [
        createFileAttachment('photo.jpg', 'image/jpeg', 1000000),
      ]
      const message = createFileMessage(attachments, '')
      wrapper = mountFileMessage(message)

      const textMessage = wrapper.findComponent({ name: 'TextMessage' })
      expect(textMessage.exists()).toBe(false)
    })
  })

  describe('Accessibility', () => {
    it('provides alt text for images', () => {
      const attachments = [
        createFileAttachment('vacation-photo.jpg', 'image/jpeg', 2000000),
      ]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const image = wrapper.find('[data-testid="image-attachment"]')
      expect(image.attributes('alt')).toBeDefined()
      expect(image.attributes('alt')).toContain('vacation-photo.jpg')
    })

    it('provides title attribute for images', () => {
      const attachments = [
        createFileAttachment('photo.jpg', 'image/jpeg', 1500000),
      ]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const image = wrapper.find('[data-testid="image-attachment"]')
      expect(image.attributes('title')).toBeDefined()
      expect(image.attributes('title')).toContain('photo.jpg')
      expect(image.attributes('title')).toContain('1.50 MB')
    })

  })

  describe('Edge Cases', () => {
    it.each([
      [999999999, '1000.00 MB', 'very large'],
      [100, '0.10 KB', 'very small'],
    ])('formats %s byte file size correctly (%s)', (size, expected) => {
      const attachments = [createFileAttachment('file.txt', 'text/plain', size)]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      expect(wrapper.html()).toContain(expected)
    })

    it('handles special characters in filenames', () => {
      const attachments = [
        createFileAttachment('my-file (2023).pdf', 'application/pdf', 1000000),
      ]
      const message = createFileMessage(attachments)
      wrapper = mountFileMessage(message)

      const html = wrapper.html()
      expect(html).toContain('my-file (2023).')
      expect(html).toContain('pdf')
    })
  })
})
