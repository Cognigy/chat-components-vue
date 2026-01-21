import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useCollation } from '../src/composables/useCollation'
import type { IMessage } from '@cognigy/socket-client'
import type { ChatConfig } from '../src/types'

describe('useCollation', () => {
  const createMessage = (overrides: Partial<IMessage> = {}): IMessage => ({
    text: 'Test message',
    source: 'bot',
    timestamp: Date.now().toString(),
    traceId: `trace-${Math.random()}`,
    data: {},
    ...overrides,
  })

  describe('isCollationEnabled', () => {
    it('returns false when config is undefined', () => {
      const messages = ref<IMessage[]>([])
      const { isCollationEnabled } = useCollation(messages)

      expect(isCollationEnabled.value).toBe(false)
    })

    it('returns false when collateStreamedOutputs is not set', () => {
      const messages = ref<IMessage[]>([])
      const config: ChatConfig = { settings: {} }
      const { isCollationEnabled } = useCollation(messages, config)

      expect(isCollationEnabled.value).toBe(false)
    })

    it('returns true when collateStreamedOutputs is enabled', () => {
      const messages = ref<IMessage[]>([])
      const config: ChatConfig = {
        settings: {
          behavior: {
            collateStreamedOutputs: true,
          },
        },
      }
      const { isCollationEnabled } = useCollation(messages, config)

      expect(isCollationEnabled.value).toBe(true)
    })
  })

  describe('without collation enabled', () => {
    it('returns messages unchanged', () => {
      const messages = [
        createMessage({ text: 'First', traceId: '1' }),
        createMessage({ text: 'Second', traceId: '2' }),
        createMessage({ text: 'Third', traceId: '3' }),
      ]
      const { collatedMessages } = useCollation(messages)

      expect(collatedMessages.value).toHaveLength(3)
      expect(collatedMessages.value[0].text).toBe('First')
      expect(collatedMessages.value[1].text).toBe('Second')
      expect(collatedMessages.value[2].text).toBe('Third')
    })

    it('returns empty array for empty input', () => {
      const messages: IMessage[] = []
      const { collatedMessages, collatedCount } = useCollation(messages)

      expect(collatedMessages.value).toHaveLength(0)
      expect(collatedCount.value).toBe(0)
    })
  })

  describe('with collation enabled', () => {
    const collationConfig: ChatConfig = {
      settings: {
        behavior: {
          collateStreamedOutputs: true,
        },
      },
    }

    it('collates consecutive bot text messages', () => {
      const messages = [
        createMessage({ text: 'Hello', source: 'bot', traceId: '1' }),
        createMessage({ text: 'How are you?', source: 'bot', traceId: '2' }),
        createMessage({ text: 'I can help.', source: 'bot', traceId: '3' }),
      ]
      const { collatedMessages, originalCount, collatedCount } = useCollation(messages, collationConfig)

      expect(originalCount.value).toBe(3)
      expect(collatedCount.value).toBe(1)
      expect(collatedMessages.value[0].text).toBe('Hello\nHow are you?\nI can help.')
      expect(collatedMessages.value[0].collatedFrom).toHaveLength(3)
    })

    it('does not collate user messages', () => {
      const messages = [
        createMessage({ text: 'Hi', source: 'user', traceId: '1' }),
        createMessage({ text: 'Hello', source: 'user', traceId: '2' }),
      ]
      const { collatedMessages } = useCollation(messages, collationConfig)

      expect(collatedMessages.value).toHaveLength(2)
      expect(collatedMessages.value[0].collatedFrom).toBeUndefined()
    })

    it('does not collate mixed source messages', () => {
      const messages = [
        createMessage({ text: 'Bot message', source: 'bot', traceId: '1' }),
        createMessage({ text: 'User message', source: 'user', traceId: '2' }),
        createMessage({ text: 'Another bot', source: 'bot', traceId: '3' }),
      ]
      const { collatedMessages } = useCollation(messages, collationConfig)

      expect(collatedMessages.value).toHaveLength(3)
    })

    it('does not collate messages with webchat payload', () => {
      const messages = [
        createMessage({ text: 'Plain text', source: 'bot', traceId: '1' }),
        createMessage({
          text: 'With buttons',
          source: 'bot',
          traceId: '2',
          data: {
            _cognigy: {
              _webchat: {
                message: {
                  quick_replies: [{ content_type: 'text', title: 'A', payload: 'a' }],
                },
              },
            },
          },
        }),
      ]
      const { collatedMessages } = useCollation(messages, collationConfig)

      expect(collatedMessages.value).toHaveLength(2)
    })

    it('does not collate messages with attachments', () => {
      const messages = [
        createMessage({ text: 'Text', source: 'bot', traceId: '1' }),
        createMessage({
          text: 'With file',
          source: 'bot',
          traceId: '2',
          data: { attachments: [{ type: 'file', url: 'test.pdf' }] },
        }),
      ]
      const { collatedMessages } = useCollation(messages, collationConfig)

      expect(collatedMessages.value).toHaveLength(2)
    })

    it('does not collate plugin messages', () => {
      const messages = [
        createMessage({ text: 'Text', source: 'bot', traceId: '1' }),
        createMessage({
          text: 'Plugin',
          source: 'bot',
          traceId: '2',
          data: { _plugin: { type: 'date-picker' } },
        }),
      ]
      const { collatedMessages } = useCollation(messages, collationConfig)

      expect(collatedMessages.value).toHaveLength(2)
    })

    it('does not collate messages without text', () => {
      const messages = [
        createMessage({ text: 'Has text', source: 'bot', traceId: '1' }),
        createMessage({ text: null, source: 'bot', traceId: '2' }),
      ]
      const { collatedMessages } = useCollation(messages, collationConfig)

      expect(collatedMessages.value).toHaveLength(2)
    })

    it('handles complex conversation with multiple collation groups', () => {
      const messages = [
        createMessage({ text: 'Bot 1', source: 'bot', traceId: '1' }),
        createMessage({ text: 'Bot 2', source: 'bot', traceId: '2' }),
        createMessage({ text: 'User', source: 'user', traceId: '3' }),
        createMessage({ text: 'Bot 3', source: 'bot', traceId: '4' }),
        createMessage({ text: 'Bot 4', source: 'bot', traceId: '5' }),
        createMessage({ text: 'Bot 5', source: 'bot', traceId: '6' }),
      ]
      const { collatedMessages, collatedCount } = useCollation(messages, collationConfig)

      expect(collatedCount.value).toBe(3)
      expect(collatedMessages.value[0].text).toBe('Bot 1\nBot 2')
      expect(collatedMessages.value[1].text).toBe('User')
      expect(collatedMessages.value[2].text).toBe('Bot 3\nBot 4\nBot 5')
    })
  })

  describe('reactivity', () => {
    it('updates when messages ref changes', () => {
      const config: ChatConfig = {
        settings: { behavior: { collateStreamedOutputs: true } },
      }
      const messages = ref<IMessage[]>([
        createMessage({ text: 'First', source: 'bot', traceId: '1' }),
      ])
      const { collatedMessages, collatedCount } = useCollation(messages, config)

      expect(collatedCount.value).toBe(1)

      messages.value = [
        ...messages.value,
        createMessage({ text: 'Second', source: 'bot', traceId: '2' }),
      ]

      expect(collatedCount.value).toBe(1)
      expect(collatedMessages.value[0].text).toBe('First\nSecond')
    })

    it('updates when config ref changes', () => {
      const messages = [
        createMessage({ text: 'A', source: 'bot', traceId: '1' }),
        createMessage({ text: 'B', source: 'bot', traceId: '2' }),
      ]
      const config = ref<ChatConfig>({})
      const { collatedCount, isCollationEnabled } = useCollation(messages, config)

      expect(isCollationEnabled.value).toBe(false)
      expect(collatedCount.value).toBe(2)

      config.value = {
        settings: { behavior: { collateStreamedOutputs: true } },
      }

      expect(isCollationEnabled.value).toBe(true)
      expect(collatedCount.value).toBe(1)
    })
  })
})
