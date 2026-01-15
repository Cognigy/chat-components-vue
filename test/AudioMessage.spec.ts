import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import AudioMessage from '../src/components/messages/AudioMessage.vue'
import { MessageContextKey } from '../src/composables/useMessageContext'
import type { IMessage, ChatConfig } from '../src/types'

describe('AudioMessage', () => {
  let wrapper: VueWrapper

  const createAudioMessage = (url: string, altText?: string): IMessage => ({
    text: '',
    source: 'bot',
    timestamp: '1673456789000',
    data: {
      _cognigy: {
        _webchat: {
          message: {
            attachment: {
              type: 'audio',
              payload: {
                url,
                altText,
              },
            },
          },
        },
      },
    },
  })

  const mountAudioMessage = (message: IMessage, config?: ChatConfig) => {
    return mount(AudioMessage, {
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
    it('renders audio element for direct URL', () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      const audio = wrapper.find('audio')
      expect(audio.exists()).toBe(true)
      expect(audio.attributes('src')).toBe('https://example.com/audio.mp3')
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
                  type: 'audio',
                  payload: {},
                },
              },
            },
          },
        },
      }
      wrapper = mountAudioMessage(message)

      expect(wrapper.find('audio').exists()).toBe(false)
      expect(wrapper.find('[data-testid="audio-message"]').exists()).toBe(false)
    })

    it('has correct test id', () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      expect(wrapper.find('[data-testid="audio-message"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="audio-controls"]').exists()).toBe(true)
    })

    it('renders play button initially', () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      const button = wrapper.find('button[aria-label="Play audio"]')
      expect(button.exists()).toBe(true)
    })
  })

  describe('Playback controls', () => {
    it('toggles to pause button when playing', async () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      const audio = wrapper.find('audio').element as HTMLAudioElement
      const playSpy = vi.spyOn(audio, 'play').mockImplementation(() => Promise.resolve())

      const playButton = wrapper.find('button')
      await playButton.trigger('click')

      expect(playSpy).toHaveBeenCalled()
    })

    it('shows pause button when audio is playing', async () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      const audio = wrapper.find('audio')
      await audio.trigger('play')

      await wrapper.vm.$nextTick()

      const pauseButton = wrapper.find('button[aria-label="Pause audio"]')
      expect(pauseButton.exists()).toBe(true)
    })

    it('pauses audio when pause button clicked', async () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      const audio = wrapper.find('audio').element as HTMLAudioElement
      const pauseSpy = vi.spyOn(audio, 'pause')

      // Trigger play first
      await wrapper.find('audio').trigger('play')
      await wrapper.vm.$nextTick()

      // Then click pause
      const button = wrapper.find('button')
      await button.trigger('click')

      expect(pauseSpy).toHaveBeenCalled()
    })

    it('updates progress on timeupdate', async () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      const audio = wrapper.find('audio').element as HTMLAudioElement

      // Mock duration and currentTime
      Object.defineProperty(audio, 'duration', { value: 100, writable: true })
      Object.defineProperty(audio, 'currentTime', { value: 50, writable: true })

      await wrapper.find('audio').trigger('loadedmetadata')
      await wrapper.find('audio').trigger('timeupdate')

      await wrapper.vm.$nextTick()

      const progressInput = wrapper.find('input[type="range"]').element as HTMLInputElement
      expect(parseFloat(progressInput.value)).toBeCloseTo(0.5, 1)
    })

    it('resets progress when audio ends', async () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      const audio = wrapper.find('audio')
      await audio.trigger('play')
      await audio.trigger('ended')

      await wrapper.vm.$nextTick()

      const progressInput = wrapper.find('input[type="range"]').element as HTMLInputElement
      expect(parseFloat(progressInput.value)).toBe(0)
    })
  })

  describe('Progress bar', () => {
    it('renders progress bar', () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      const progressBar = wrapper.find('input[type="range"]')
      expect(progressBar.exists()).toBe(true)
      expect(progressBar.attributes('min')).toBe('0')
      expect(progressBar.attributes('max')).toBe('0.999999')
    })

    it('seeks audio when progress bar changed', async () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      const audio = wrapper.find('audio').element as HTMLAudioElement
      Object.defineProperty(audio, 'duration', { value: 100, writable: true })

      await wrapper.find('audio').trigger('loadedmetadata')

      const progressBar = wrapper.find('input[type="range"]')
      await progressBar.setValue('0.5')

      await wrapper.vm.$nextTick()

      // CurrentTime should be set to 50 (0.5 * 100)
      expect(audio.currentTime).toBeCloseTo(50, 0)
    })

    it('pauses on seek start', async () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      const audio = wrapper.find('audio').element as HTMLAudioElement
      const pauseSpy = vi.spyOn(audio, 'pause')

      // Start playing
      await wrapper.find('audio').trigger('play')
      await wrapper.vm.$nextTick()

      // Start seeking
      const progressBar = wrapper.find('input[type="range"]')
      await progressBar.trigger('mousedown')

      expect(pauseSpy).toHaveBeenCalled()
    })

    it('resumes playback on seek end', async () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      const audio = wrapper.find('audio').element as HTMLAudioElement
      const playSpy = vi.spyOn(audio, 'play').mockImplementation(() => Promise.resolve())

      // Simulate seeking
      const progressBar = wrapper.find('input[type="range"]')
      await progressBar.trigger('mousedown')
      await progressBar.trigger('mouseup')

      expect(playSpy).toHaveBeenCalled()
    })
  })

  describe('Time display', () => {
    it('shows time remaining', async () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      const audio = wrapper.find('audio').element as HTMLAudioElement
      Object.defineProperty(audio, 'duration', { value: 125, writable: true })

      await wrapper.find('audio').trigger('loadedmetadata')
      await wrapper.vm.$nextTick()

      const timeDisplay = wrapper.find('time')
      expect(timeDisplay.exists()).toBe(true)
      expect(timeDisplay.text()).toMatch(/\d+:\d+/)
    })

    it('formats time correctly (mm:ss)', async () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      const audio = wrapper.find('audio').element as HTMLAudioElement
      Object.defineProperty(audio, 'duration', { value: 125, writable: true })
      Object.defineProperty(audio, 'currentTime', { value: 0, writable: true })

      await wrapper.find('audio').trigger('loadedmetadata')
      await wrapper.vm.$nextTick()

      const timeDisplay = wrapper.find('time')
      // 125 seconds = 2 minutes 5 seconds = 2:05
      expect(timeDisplay.text()).toBe('2:05')
    })

    it('formats time with hours when needed (hh:mm:ss)', async () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      const audio = wrapper.find('audio').element as HTMLAudioElement
      Object.defineProperty(audio, 'duration', { value: 3725, writable: true })

      await wrapper.find('audio').trigger('loadedmetadata')
      await wrapper.vm.$nextTick()

      const timeDisplay = wrapper.find('time')
      // 3725 seconds = 1 hour 2 minutes 5 seconds = 1:02:05
      expect(timeDisplay.text()).toBe('1:02:05')
    })
  })

  describe('Download transcript', () => {
    it('shows download button when altText provided', () => {
      const message = createAudioMessage('https://example.com/audio.mp3', 'Audio transcript text')
      wrapper = mountAudioMessage(message)

      const button = wrapper.find('[data-testid="download-transcript-button"]')
      expect(button.exists()).toBe(true)
    })

    it('does not show download button when altText not provided', () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      const button = wrapper.find('[data-testid="download-transcript-button"]')
      expect(button.exists()).toBe(false)
    })

    it('downloads transcript on button click', async () => {
      const message = createAudioMessage('https://example.com/audio.mp3', 'Transcript content here')
      wrapper = mountAudioMessage(message)

      const link = wrapper.find('a[download]')
      const clickSpy = vi.spyOn(link.element, 'click')

      const button = wrapper.find('[data-testid="download-transcript-button"]')
      await button.trigger('click')

      expect(clickSpy).toHaveBeenCalled()
    })

    it('sets correct download link attributes', () => {
      const transcript = 'This is the audio transcript'
      const message = createAudioMessage('https://example.com/audio.mp3', transcript)
      wrapper = mountAudioMessage(message)

      const link = wrapper.find('a[download]')
      expect(link.attributes('download')).toBe('audio-transcript.txt')
      expect(link.attributes('href')).toContain('data:text/plain')
      expect(link.attributes('href')).toContain(encodeURIComponent(transcript))
    })
  })

  describe('Accessibility', () => {
    it('sets aria-label for play button', () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      const button = wrapper.find('button')
      expect(button.attributes('aria-label')).toBe('Play audio')
    })

    it('sets aria-label for pause button when playing', async () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      await wrapper.find('audio').trigger('play')
      await wrapper.vm.$nextTick()

      const button = wrapper.find('button')
      expect(button.attributes('aria-label')).toBe('Pause audio')
    })

    it('sets aria-label for progress bar', () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      const progressBar = wrapper.find('input[type="range"]')
      expect(progressBar.attributes('aria-label')).toBe('Audio playback progress')
    })

    it('sets aria-valuetext for progress bar', () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      const progressBar = wrapper.find('input[type="range"]')
      expect(progressBar.attributes('aria-valuetext')).toContain('remaining')
    })

    it('uses custom translation for play audio label', () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      const config: ChatConfig = {
        settings: {
          customTranslations: {
            ariaLabels: {
              playAudio: 'Custom play label',
            },
          },
        },
      }
      wrapper = mountAudioMessage(message, config)

      const button = wrapper.find('button')
      expect(button.attributes('aria-label')).toBe('Custom play label')
    })

    it('uses custom translation for pause audio label', async () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      const config: ChatConfig = {
        settings: {
          customTranslations: {
            ariaLabels: {
              pauseAudio: 'Custom pause label',
            },
          },
        },
      }
      wrapper = mountAudioMessage(message, config)

      await wrapper.find('audio').trigger('play')
      await wrapper.vm.$nextTick()

      const button = wrapper.find('button')
      expect(button.attributes('aria-label')).toBe('Custom pause label')
    })

    it('uses custom translation for download transcript label', () => {
      const message = createAudioMessage('https://example.com/audio.mp3', 'Transcript')
      const config: ChatConfig = {
        settings: {
          customTranslations: {
            ariaLabels: {
              downloadTranscript: 'Custom download label',
            },
          },
        },
      }
      wrapper = mountAudioMessage(message, config)

      const button = wrapper.find('[data-testid="download-transcript-button"]')
      expect(button.attributes('aria-label')).toBe('Custom download label')
    })

    it('uses custom translation for audio playback progress', () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      const config: ChatConfig = {
        settings: {
          customTranslations: {
            ariaLabels: {
              audioPlaybackProgress: 'Custom progress label',
            },
          },
        },
      }
      wrapper = mountAudioMessage(message, config)

      const progressBar = wrapper.find('input[type="range"]')
      expect(progressBar.attributes('aria-label')).toBe('Custom progress label')
    })
  })

  describe('Audio element behavior', () => {
    it('hides audio element visually', () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      const audio = wrapper.find('audio')
      expect(audio.attributes('style')).toContain('display: none')
    })

    it('loads metadata on mount', async () => {
      const message = createAudioMessage('https://example.com/audio.mp3')
      wrapper = mountAudioMessage(message)

      const audio = wrapper.find('audio').element as HTMLAudioElement
      Object.defineProperty(audio, 'duration', { value: 100, writable: true })

      await wrapper.find('audio').trigger('loadedmetadata')
      await wrapper.vm.$nextTick()

      // Duration should be set
      const timeDisplay = wrapper.find('time')
      expect(timeDisplay.text()).toBeTruthy()
    })
  })
})
