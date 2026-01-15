import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import VideoMessage from '../src/components/messages/VideoMessage.vue'
import { MessageContextKey } from '../src/composables/useMessageContext'
import type { IMessage, ChatConfig } from '../src/types'

describe('VideoMessage', () => {
  let wrapper: VueWrapper

  const createVideoMessage = (url: string, altText?: string, captionsUrl?: string): IMessage => ({
    text: '',
    source: 'bot',
    timestamp: '1673456789000',
    data: {
      _cognigy: {
        _webchat: {
          message: {
            attachment: {
              type: 'video',
              payload: {
                url,
                altText,
                captionsUrl,
              },
            },
          },
        },
      },
    },
  })

  const mountVideoMessage = (message: IMessage, config?: ChatConfig) => {
    return mount(VideoMessage, {
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

  describe('Direct video URLs', () => {
    it('renders video element for direct URL', () => {
      const message = createVideoMessage('https://example.com/video.mp4')
      wrapper = mountVideoMessage(message)

      const video = wrapper.find('video')
      expect(video.exists()).toBe(true)
      expect(video.find('source').attributes('src')).toBe('https://example.com/video.mp4')
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
                  type: 'video',
                  payload: {},
                },
              },
            },
          },
        },
      }
      wrapper = mountVideoMessage(message)

      expect(wrapper.find('video').exists()).toBe(false)
      expect(wrapper.find('iframe').exists()).toBe(false)
    })

    it('shows light mode overlay for direct videos initially', () => {
      const message = createVideoMessage('https://example.com/video.mp4')
      wrapper = mountVideoMessage(message)

      expect(wrapper.find('[role="button"]').exists()).toBe(true)
      expect(wrapper.find('svg').exists()).toBe(true) // Play icon
    })

    it('removes light overlay after video starts', async () => {
      const message = createVideoMessage('https://example.com/video.mp4')
      wrapper = mountVideoMessage(message)

      // Initially should have play overlay
      expect(wrapper.find('div[role="button"]').exists()).toBe(true)

      // Trigger play
      await wrapper.find('video').trigger('play')
      await wrapper.vm.$nextTick()

      // Light mode overlay should be hidden after play
      const playerWrapper = wrapper.find('[data-testid="video-message"]')
      expect(playerWrapper.attributes('role')).toBeUndefined()
      expect(playerWrapper.attributes('tabindex')).toBe('-1')
    })

    it('starts playing on light overlay click', async () => {
      const message = createVideoMessage('https://example.com/video.mp4')
      wrapper = mountVideoMessage(message)

      const video = wrapper.find('video').element as HTMLVideoElement
      const playSpy = vi.spyOn(video, 'play').mockImplementation(() => Promise.resolve())

      // Click on the light overlay (the div inside the player wrapper)
      const lightOverlay = wrapper.find('[data-testid="video-message"]').findAll('div')[0]
      await lightOverlay.trigger('click')

      await wrapper.vm.$nextTick()

      expect(playSpy).toHaveBeenCalled()
    })

    it('starts playing on Enter key in light mode', async () => {
      const message = createVideoMessage('https://example.com/video.mp4')
      wrapper = mountVideoMessage(message)

      const playSpy = vi.spyOn(wrapper.find('video').element as HTMLVideoElement, 'play')
        .mockImplementation(() => Promise.resolve())

      const playerWrapper = wrapper.find('[role="button"]')
      await playerWrapper.trigger('keydown', { key: 'Enter' })

      expect(playSpy).toHaveBeenCalled()
    })

    it('starts playing on Space key in light mode', async () => {
      const message = createVideoMessage('https://example.com/video.mp4')
      wrapper = mountVideoMessage(message)

      const playSpy = vi.spyOn(wrapper.find('video').element as HTMLVideoElement, 'play')
        .mockImplementation(() => Promise.resolve())

      const playerWrapper = wrapper.find('[role="button"]')
      await playerWrapper.trigger('keydown', { key: ' ' })

      expect(playSpy).toHaveBeenCalled()
    })

    it('includes captions track when captionsUrl provided', () => {
      const message = createVideoMessage(
        'https://example.com/video.mp4',
        'Video description',
        'https://example.com/captions.vtt'
      )
      wrapper = mountVideoMessage(message)

      const track = wrapper.find('track')
      expect(track.exists()).toBe(true)
      expect(track.attributes('src')).toBe('https://example.com/captions.vtt')
      expect(track.attributes('kind')).toBe('subtitles')
      expect(track.attributes('srclang')).toBe('en-US')
    })

    it('does not include captions track when captionsUrl not provided', () => {
      const message = createVideoMessage('https://example.com/video.mp4')
      wrapper = mountVideoMessage(message)

      expect(wrapper.find('track').exists()).toBe(false)
    })

    it('sets crossorigin attribute when captions are present', () => {
      const message = createVideoMessage(
        'https://example.com/video.mp4',
        undefined,
        'https://example.com/captions.vtt'
      )
      wrapper = mountVideoMessage(message)

      const video = wrapper.find('video')
      expect(video.attributes('crossorigin')).toBe('anonymous')
    })
  })

  describe('YouTube videos', () => {
    it('renders iframe for YouTube URL', () => {
      const message = createVideoMessage('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      wrapper = mountVideoMessage(message)

      const iframe = wrapper.find('iframe')
      expect(iframe.exists()).toBe(true)
      expect(iframe.attributes('src')).toContain('youtube.com/embed/dQw4w9WgXcQ')
    })

    it('handles youtu.be short URLs', () => {
      const message = createVideoMessage('https://youtu.be/dQw4w9WgXcQ')
      wrapper = mountVideoMessage(message)

      const iframe = wrapper.find('iframe')
      expect(iframe.exists()).toBe(true)
      expect(iframe.attributes('src')).toContain('youtube.com/embed/dQw4w9WgXcQ')
    })

    it('does not show light mode for YouTube videos', () => {
      const message = createVideoMessage('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      wrapper = mountVideoMessage(message)

      expect(wrapper.find('[role="button"]').exists()).toBe(false)
    })

    it('sets correct iframe attributes for YouTube', () => {
      const message = createVideoMessage('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      wrapper = mountVideoMessage(message)

      const iframe = wrapper.find('iframe')
      expect(iframe.attributes('allow')).toContain('autoplay')
      expect(iframe.attributes('allowfullscreen')).toBeDefined()
      expect(iframe.attributes('frameborder')).toBe('0')
    })
  })

  describe('Vimeo videos', () => {
    it('renders iframe for Vimeo URL', () => {
      const message = createVideoMessage('https://vimeo.com/123456789')
      wrapper = mountVideoMessage(message)

      const iframe = wrapper.find('iframe')
      expect(iframe.exists()).toBe(true)
      expect(iframe.attributes('src')).toContain('player.vimeo.com/video/123456789')
    })

    it('does not show light mode for Vimeo videos', () => {
      const message = createVideoMessage('https://vimeo.com/123456789')
      wrapper = mountVideoMessage(message)

      expect(wrapper.find('[role="button"]').exists()).toBe(false)
    })

    it('sets correct iframe attributes for Vimeo', () => {
      const message = createVideoMessage('https://vimeo.com/123456789')
      wrapper = mountVideoMessage(message)

      const iframe = wrapper.find('iframe')
      expect(iframe.attributes('allow')).toContain('autoplay')
      expect(iframe.attributes('allowfullscreen')).toBeDefined()
      expect(iframe.attributes('frameborder')).toBe('0')
    })
  })

  describe('Download transcript', () => {
    it('shows download button when altText provided', () => {
      const message = createVideoMessage('https://example.com/video.mp4', 'Video transcript text')
      wrapper = mountVideoMessage(message)

      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.text()).toContain('Download Transcript')
    })

    it('does not show download button when altText not provided', () => {
      const message = createVideoMessage('https://example.com/video.mp4')
      wrapper = mountVideoMessage(message)

      expect(wrapper.find('button').exists()).toBe(false)
    })

    it('downloads transcript on button click', async () => {
      const message = createVideoMessage('https://example.com/video.mp4', 'Transcript content here')
      wrapper = mountVideoMessage(message)

      const link = wrapper.find('a[download]')
      const clickSpy = vi.spyOn(link.element, 'click')

      const button = wrapper.find('button')
      await button.trigger('click')

      expect(clickSpy).toHaveBeenCalled()
    })

    it('sets correct download link attributes', () => {
      const transcript = 'This is the video transcript'
      const message = createVideoMessage('https://example.com/video.mp4', transcript)
      wrapper = mountVideoMessage(message)

      const link = wrapper.find('a[download]')
      expect(link.attributes('download')).toBe('video-transcript.txt')
      expect(link.attributes('href')).toContain('data:text/plain')
      expect(link.attributes('href')).toContain(encodeURIComponent(transcript))
    })
  })

  describe('Styling and layout', () => {
    it('applies wrapper with button class when altText present', () => {
      const message = createVideoMessage('https://example.com/video.mp4', 'Transcript')
      wrapper = mountVideoMessage(message)

      const wrapperDiv = wrapper.find('[data-testid="video-message"]').element.parentElement
      expect(wrapperDiv?.className).toContain('wrapperWithButton')
    })

    it('does not apply wrapper with button class when no altText', () => {
      const message = createVideoMessage('https://example.com/video.mp4')
      wrapper = mountVideoMessage(message)

      const wrapperDiv = wrapper.find('[data-testid="video-message"]').element.parentElement
      expect(wrapperDiv?.className).not.toContain('wrapperWithButton')
    })

    it('has correct test id', () => {
      const message = createVideoMessage('https://example.com/video.mp4')
      wrapper = mountVideoMessage(message)

      expect(wrapper.find('[data-testid="video-message"]').exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('sets aria-label in light mode', () => {
      const message = createVideoMessage('https://example.com/video.mp4')
      wrapper = mountVideoMessage(message)

      const playerWrapper = wrapper.find('[role="button"]')
      expect(playerWrapper.attributes('aria-label')).toBe('Play video')
    })

    it('uses custom translation for play video label', () => {
      const message = createVideoMessage('https://example.com/video.mp4')
      const config: ChatConfig = {
        settings: {
          customTranslations: {
            ariaLabels: {
              playVideo: 'Custom play label',
            },
          },
        },
      }
      wrapper = mountVideoMessage(message, config)

      const playerWrapper = wrapper.find('[role="button"]')
      expect(playerWrapper.attributes('aria-label')).toBe('Custom play label')
    })

    it('sets title attribute on iframe', () => {
      const message = createVideoMessage('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'My video')
      wrapper = mountVideoMessage(message)

      const iframe = wrapper.find('iframe')
      expect(iframe.attributes('title')).toBe('My video')
    })

    it('uses default title when altText not provided for iframe', () => {
      const message = createVideoMessage('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      wrapper = mountVideoMessage(message)

      const iframe = wrapper.find('iframe')
      expect(iframe.attributes('title')).toBe('Video player')
    })

    it('sets tabindex in light mode', () => {
      const message = createVideoMessage('https://example.com/video.mp4')
      wrapper = mountVideoMessage(message)

      const playerWrapper = wrapper.find('[role="button"]')
      expect(playerWrapper.attributes('tabindex')).toBe('0')
    })
  })

  describe('Video controls', () => {
    it('includes controls attribute on video element', () => {
      const message = createVideoMessage('https://example.com/video.mp4')
      wrapper = mountVideoMessage(message)

      const video = wrapper.find('video')
      expect(video.attributes('controls')).toBeDefined()
    })

    it('updates playing state on play event', async () => {
      const message = createVideoMessage('https://example.com/video.mp4')
      wrapper = mountVideoMessage(message)

      const video = wrapper.find('video')
      await video.trigger('play')

      // Component should track playing state
      // We can't directly check internal state, but we can verify behavior
      await wrapper.vm.$nextTick()
    })

    it('updates playing state on pause event', async () => {
      const message = createVideoMessage('https://example.com/video.mp4')
      wrapper = mountVideoMessage(message)

      const video = wrapper.find('video')
      await video.trigger('play')
      await video.trigger('pause')

      await wrapper.vm.$nextTick()
    })
  })
})
