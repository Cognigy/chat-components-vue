/**
 * useCollation composable
 * Collates consecutive bot messages into single messages for streaming output
 *
 * When `collateStreamedOutputs` is enabled in config, consecutive bot messages
 * are grouped together so they appear as a single message with combined text.
 */

import { computed, type ComputedRef, toValue, type MaybeRefOrGetter } from 'vue'
import type { IMessage } from '@cognigy/socket-client'
import type { ChatConfig } from '../types'

/**
 * A message that may have been collated from multiple bot messages.
 * When collated, text becomes an array and collatedFrom contains the originals.
 */
export type CollatedMessage = IMessage & {
  /**
   * Original messages that were collated into this one (only present if collated)
   */
  collatedFrom?: IMessage[]
}

export interface UseCollationReturn {
  /**
   * Messages with consecutive bot messages collated
   */
  collatedMessages: ComputedRef<CollatedMessage[]>

  /**
   * Whether collation is currently enabled
   */
  isCollationEnabled: ComputedRef<boolean>

  /**
   * Original message count
   */
  originalCount: ComputedRef<number>

  /**
   * Collated message count
   */
  collatedCount: ComputedRef<number>
}

/**
 * Check if two messages can be collated together
 */
function canCollate(current: IMessage, previous: IMessage): boolean {
  // Must both be bot messages
  if (current.source !== 'bot' || previous.source !== 'bot') {
    return false
  }

  // Must both be simple text messages (no rich content)
  if (current.data?._cognigy?._webchat || previous.data?._cognigy?._webchat) {
    return false
  }

  // Must both have text
  if (!current.text || !previous.text) {
    return false
  }

  // Don't collate if either has attachments
  if (current.data?.attachments || previous.data?.attachments) {
    return false
  }

  // Don't collate plugin messages
  if (current.data?._plugin || previous.data?._plugin) {
    return false
  }

  return true
}

/**
 * Collate consecutive bot messages into combined messages
 *
 * @param messages - Array of messages (can be ref, getter, or plain value)
 * @param config - Chat configuration (can be ref, getter, or plain value)
 * @returns Reactive collated messages
 *
 * @example
 * ```ts
 * const { collatedMessages, isCollationEnabled } = useCollation(messages, config)
 *
 * // Use in template
 * <Message v-for="msg in collatedMessages" :key="msg.traceId" :message="msg" />
 * ```
 */
export function useCollation(
  messages: MaybeRefOrGetter<IMessage[]>,
  config?: MaybeRefOrGetter<ChatConfig | undefined>
): UseCollationReturn {
  const isCollationEnabled = computed(() => {
    const cfg = toValue(config)
    return cfg?.settings?.behavior?.collateStreamedOutputs === true
  })

  const collatedMessages = computed<CollatedMessage[]>(() => {
    const msgs = toValue(messages)
    const enabled = isCollationEnabled.value

    if (!enabled || !msgs || msgs.length === 0) {
      return msgs as CollatedMessage[]
    }

    const result: CollatedMessage[] = []

    for (let i = 0; i < msgs.length; i++) {
      const current = msgs[i]

      // Check if we can collate with the last message in result
      if (result.length > 0) {
        const lastCollated = result[result.length - 1]
        const lastOriginal = lastCollated.collatedFrom
          ? lastCollated.collatedFrom[lastCollated.collatedFrom.length - 1]
          : lastCollated

        if (canCollate(current, lastOriginal)) {
          // Collate: combine texts with newline separator
          const existingText = lastCollated.text ?? ''
          const currentText = current.text ?? ''

          const collatedFrom = lastCollated.collatedFrom
            ? [...lastCollated.collatedFrom, current]
            : [lastOriginal, current]

          // Update the last message with combined text (joined by newline)
          result[result.length - 1] = {
            ...lastCollated,
            text: existingText + '\n' + currentText,
            collatedFrom,
          }
          continue
        }
      }

      // Can't collate, add as new message
      result.push(current as CollatedMessage)
    }

    return result
  })

  const originalCount = computed(() => {
    const msgs = toValue(messages)
    return msgs?.length ?? 0
  })

  const collatedCount = computed(() => {
    return collatedMessages.value.length
  })

  return {
    collatedMessages,
    isCollationEnabled,
    originalCount,
    collatedCount,
  }
}
