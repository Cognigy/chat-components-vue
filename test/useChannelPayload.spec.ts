import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useChannelPayload } from '../src/composables/useChannelPayload'
import type { IMessage } from '@cognigy/socket-client'
import type { ChatConfig } from '../src/types'

describe('useChannelPayload', () => {
  const createMessage = (overrides: Partial<IMessage> = {}): IMessage => ({
    text: 'Test message',
    source: 'bot',
    timestamp: '123456',
    traceId: 'trace-1',
    data: {},
    ...overrides,
  })

  describe('payload extraction', () => {
    it('returns undefined for message without _cognigy data', () => {
      const message = createMessage()
      const { payload, hasPayload } = useChannelPayload(message)

      expect(payload.value).toBeUndefined()
      expect(hasPayload.value).toBe(false)
    })

    it('extracts _webchat payload by default', () => {
      const webchatPayload = {
        message: {
          text: 'Webchat text',
          quick_replies: [{ content_type: 'text' as const, title: 'Option', payload: 'opt' }],
        },
      }
      const message = createMessage({
        data: {
          _cognigy: {
            _webchat: webchatPayload,
          },
        },
      })

      const { payload, hasPayload } = useChannelPayload(message)

      expect(hasPayload.value).toBe(true)
      expect(payload.value).toEqual(webchatPayload)
    })

    it('extracts _defaultPreview when enabled in config', () => {
      const defaultPreviewPayload = {
        message: { text: 'Preview text' },
      }
      const message = createMessage({
        data: {
          _cognigy: {
            _webchat: { message: { text: 'Webchat text' } },
            _defaultPreview: defaultPreviewPayload,
          },
        },
      })
      const config: ChatConfig = {
        settings: {
          widgetSettings: {
            enableDefaultPreview: true,
          },
        },
      }

      const { payload } = useChannelPayload(message, config)

      expect(payload.value).toEqual(defaultPreviewPayload)
    })

    it('falls back to _facebook when _webchat is not present', () => {
      const facebookPayload = {
        message: { text: 'Facebook text' },
      }
      const message = createMessage({
        data: {
          _cognigy: {
            _facebook: facebookPayload,
          },
        },
      })

      const { payload } = useChannelPayload(message)

      expect(payload.value).toEqual(facebookPayload)
    })
  })

  describe('message accessor', () => {
    it('returns the message property from payload', () => {
      const messageContent = {
        text: 'Hello',
        quick_replies: [{ content_type: 'text' as const, title: 'Hi', payload: 'hi' }],
      }
      const message = createMessage({
        data: {
          _cognigy: {
            _webchat: { message: messageContent },
          },
        },
      })

      const { message: msg } = useChannelPayload(message)

      expect(msg.value).toEqual(messageContent)
    })

    it('returns undefined when no payload', () => {
      const message = createMessage()
      const { message: msg } = useChannelPayload(message)

      expect(msg.value).toBeUndefined()
    })
  })

  describe('quick replies detection', () => {
    it('detects quick replies', () => {
      const message = createMessage({
        data: {
          _cognigy: {
            _webchat: {
              message: {
                quick_replies: [
                  { content_type: 'text' as const, title: 'A', payload: 'a' },
                  { content_type: 'text' as const, title: 'B', payload: 'b' },
                ],
              },
            },
          },
        },
      })

      const { hasQuickReplies } = useChannelPayload(message)

      expect(hasQuickReplies.value).toBe(true)
    })

    it('returns false for empty quick replies', () => {
      const message = createMessage({
        data: {
          _cognigy: {
            _webchat: {
              message: {
                quick_replies: [],
              },
            },
          },
        },
      })

      const { hasQuickReplies } = useChannelPayload(message)

      expect(hasQuickReplies.value).toBe(false)
    })

    it('returns false when no quick replies', () => {
      const message = createMessage({
        data: {
          _cognigy: {
            _webchat: {
              message: { text: 'No buttons' },
            },
          },
        },
      })

      const { hasQuickReplies } = useChannelPayload(message)

      expect(hasQuickReplies.value).toBe(false)
    })
  })

  describe('attachment detection', () => {
    it('detects image attachment', () => {
      const message = createMessage({
        data: {
          _cognigy: {
            _webchat: {
              message: {
                attachment: {
                  type: 'image',
                  payload: { url: 'https://example.com/image.jpg' },
                },
              },
            },
          },
        },
      })

      const { hasAttachment, attachmentType } = useChannelPayload(message)

      expect(hasAttachment.value).toBe(true)
      expect(attachmentType.value).toBe('image')
    })

    it('detects video attachment', () => {
      const message = createMessage({
        data: {
          _cognigy: {
            _webchat: {
              message: {
                attachment: {
                  type: 'video',
                  payload: { url: 'https://example.com/video.mp4' },
                },
              },
            },
          },
        },
      })

      const { hasAttachment, attachmentType } = useChannelPayload(message)

      expect(hasAttachment.value).toBe(true)
      expect(attachmentType.value).toBe('video')
    })

    it('returns false when no attachment', () => {
      const message = createMessage({
        data: {
          _cognigy: {
            _webchat: {
              message: { text: 'No attachment' },
            },
          },
        },
      })

      const { hasAttachment, attachmentType } = useChannelPayload(message)

      expect(hasAttachment.value).toBe(false)
      expect(attachmentType.value).toBeUndefined()
    })
  })

  describe('reactivity', () => {
    it('updates when message ref changes', () => {
      const message = ref(createMessage())
      const { hasPayload } = useChannelPayload(message)

      expect(hasPayload.value).toBe(false)

      message.value = createMessage({
        data: {
          _cognigy: {
            _webchat: { message: { text: 'Updated' } },
          },
        },
      })

      expect(hasPayload.value).toBe(true)
    })

    it('updates when config ref changes', () => {
      const message = createMessage({
        data: {
          _cognigy: {
            _webchat: { message: { text: 'Webchat' } },
            _defaultPreview: { message: { text: 'Preview' } },
          },
        },
      })
      const config = ref<ChatConfig>({})
      const { payload } = useChannelPayload(message, config)

      expect(payload.value?.message?.text).toBe('Webchat')

      config.value = {
        settings: {
          widgetSettings: {
            enableDefaultPreview: true,
          },
        },
      }

      expect(payload.value?.message?.text).toBe('Preview')
    })
  })
})
