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
 * Check if two messages can be collated together.
 * Both must be bot messages with text, no rich content, attachments, or plugins.
 */
function canCollate(current: IMessage, previous: IMessage): boolean {
  return (
    current.source === 'bot' &&
    previous.source === 'bot' &&
    Boolean(current.text) &&
    Boolean(previous.text) &&
    !current.data?._cognigy?._webchat &&
    !previous.data?._cognigy?._webchat &&
    !current.data?.attachments &&
    !previous.data?.attachments &&
    !current.data?._plugin &&
    !previous.data?._plugin
  )
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

    for (const current of msgs) {
      const lastIndex = result.length - 1
      const lastCollated = result[lastIndex]

      if (lastCollated) {
        const existingCollatedFrom = lastCollated.collatedFrom
        const lastOriginal = existingCollatedFrom
          ? existingCollatedFrom[existingCollatedFrom.length - 1]
          : lastCollated

        if (canCollate(current, lastOriginal)) {
          // Collate: create new object with combined text (avoid mutating existing)
          const collatedFrom = existingCollatedFrom
            ? [...existingCollatedFrom, current]
            : [lastOriginal, current]

          result[lastIndex] = {
            ...lastCollated,
            text: (lastCollated.text ?? '') + '\n' + (current.text ?? ''),
            collatedFrom,
          }
          continue
        }
      }

      // Can't collate, add as new message (shallow copy to avoid mutating original)
      result.push({ ...current })
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
