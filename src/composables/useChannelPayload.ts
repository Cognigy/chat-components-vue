/**
 * useChannelPayload composable
 * Reactive wrapper for extracting the correct channel payload from a message
 *
 * The payload is determined by checking (in order):
 * 1. _defaultPreview (if enableDefaultPreview is true)
 * 2. _facebook (if strictMessengerSync is enabled and syncWebchatWithFacebook is true)
 * 3. _webchat (default)
 * 4. _facebook (fallback)
 */

import { computed, type ComputedRef, toValue, type MaybeRefOrGetter } from 'vue'
import type { IMessage } from '@cognigy/socket-client'
import type { ChatConfig, IWebchatChannelPayload } from '../types'
import { getChannelPayload } from '../utils/matcher'

export interface UseChannelPayloadReturn {
  /**
   * The resolved channel payload (_webchat, _defaultPreview, or _facebook)
   */
  payload: ComputedRef<IWebchatChannelPayload | undefined>

  /**
   * Whether the message has any channel payload
   */
  hasPayload: ComputedRef<boolean>

  /**
   * The message content from the payload
   */
  message: ComputedRef<IWebchatChannelPayload['message'] | undefined>

  /**
   * Quick check for quick replies
   */
  hasQuickReplies: ComputedRef<boolean>

  /**
   * Quick check for attachment
   */
  hasAttachment: ComputedRef<boolean>

  /**
   * The attachment type if present
   */
  attachmentType: ComputedRef<string | undefined>
}

/**
 * Reactive composable for accessing channel-specific payload from a message
 *
 * @param message - The message (can be ref, getter, or plain value)
 * @param config - Optional chat config (can be ref, getter, or plain value)
 * @returns Reactive payload accessors
 *
 * @example
 * ```ts
 * const { payload, hasQuickReplies, attachmentType } = useChannelPayload(message, config)
 *
 * // In template or computed
 * if (hasQuickReplies.value) {
 *   // Render quick reply buttons
 * }
 * ```
 */
export function useChannelPayload(
  message: MaybeRefOrGetter<IMessage>,
  config?: MaybeRefOrGetter<ChatConfig | undefined>
): UseChannelPayloadReturn {
  const payload = computed(() => {
    const msg = toValue(message)
    const cfg = toValue(config)
    return getChannelPayload(msg, cfg)
  })

  const hasPayload = computed(() => payload.value !== undefined)

  const message_ = computed(() => payload.value?.message)

  const hasQuickReplies = computed(() => {
    const quickReplies = message_.value?.quick_replies
    return Array.isArray(quickReplies) && quickReplies.length > 0
  })

  const hasAttachment = computed(() => {
    return message_.value?.attachment !== undefined
  })

  const attachmentType = computed(() => {
    return message_.value?.attachment?.type
  })

  return {
    payload,
    hasPayload,
    message: message_,
    hasQuickReplies,
    hasAttachment,
    attachmentType,
  }
}
