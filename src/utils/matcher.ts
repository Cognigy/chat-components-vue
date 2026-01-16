/**
 * Message matcher system
 * Determines which component to render based on message data structure
 *
 * This is the core of the data-driven architecture.
 * The same matching rules as the React version.
 */

import type { IMessage } from '@cognigy/socket-client'
import type { ChatConfig, MatchRule, MessagePlugin, MatchResult } from '../types'
import { isAdaptiveCardPayload } from '../types'

/**
 * Check if message has channel payload
 */
export function getChannelPayload(message: IMessage, config?: ChatConfig) {
  if (!message?.data?._cognigy) {
    return undefined
  }

  const { _facebook, _webchat, _defaultPreview } = message.data._cognigy

  // Check default preview first
  const defaultPreviewEnabled = config?.settings?.widgetSettings?.enableDefaultPreview
  if (defaultPreviewEnabled && _defaultPreview) {
    return _defaultPreview
  }

  // Check messenger sync
  const strictMessengerSync = config?.settings?.widgetSettings?.enableStrictMessengerSync
  const shouldSyncWithFacebook = message.data._cognigy.syncWebchatWithFacebook
  if (strictMessengerSync && shouldSyncWithFacebook && _facebook) {
    return _facebook
  }

  // Return webchat or facebook as fallback
  return _webchat || _facebook
}

/**
 * Check if text is only escape sequences (whitespace, newlines, etc.)
 */
function isOnlyEscapeSequence(text: string | null | undefined): boolean {
  if (typeof text !== 'string') {
    return false
  }

  const trimmed = text.trim()
  return trimmed === '' || /^[\n\t\r\v\f\s]*$/.test(trimmed)
}

/**
 * Default match rules for internal message types.
 * These rules map message data structures to component names.
 * Components are resolved by name lookup in Message.vue.
 */
export function createDefaultMatchRules(): MatchRule[] {
  return [
    // xApp submit
    {
      name: 'XAppSubmit',
      match: (message) => {
        return message?.data?._plugin?.type === 'x-app-submit'
      },
    },

    // Webchat3Event
    {
      name: 'Webchat3Event',
      match: (message) => {
        return !!message?.data?._cognigy?._webchat3?.type
      },
    },

    // Date picker
    {
      name: 'DatePicker',
      match: (message) => {
        return message?.data?._plugin?.type === 'date-picker'
      },
    },

    // Text with buttons / Quick Replies
    {
      name: 'TextWithButtons',
      match: (message, config) => {
        const channelConfig = getChannelPayload(message, config)
        if (!channelConfig) {
          return false
        }

        const hasQuickReplies =
          channelConfig.message?.quick_replies &&
          channelConfig.message.quick_replies.length > 0

        const isButtonTemplate =
          channelConfig.message?.attachment?.payload?.template_type === 'button'

        const hasMessengerText = !!channelConfig.message?.text

        const isDefaultPreviewEnabled = config?.settings?.widgetSettings?.enableDefaultPreview
        const hasDefaultPreview = !!message?.data?._cognigy?._defaultPreview
        const shouldSkip = isDefaultPreviewEnabled && !hasDefaultPreview && message.text

        return !shouldSkip && (hasQuickReplies || isButtonTemplate || hasMessengerText)
      },
    },

    // Image
    {
      name: 'Image',
      match: (message, config) => {
        const channelConfig = getChannelPayload(message, config)
        if (!channelConfig) {
          return false
        }

        return channelConfig.message?.attachment?.type === 'image'
      },
    },

    // Video
    {
      name: 'Video',
      match: (message, config) => {
        const channelConfig = getChannelPayload(message, config)
        if (!channelConfig) {
          return false
        }

        return channelConfig.message?.attachment?.type === 'video'
      },
    },

    // Audio
    {
      name: 'Audio',
      match: (message, config) => {
        const channelConfig = getChannelPayload(message, config)
        if (!channelConfig) {
          return false
        }

        return channelConfig.message?.attachment?.type === 'audio'
      },
    },

    // File
    {
      name: 'File',
      match: (message) => {
        return !!message?.data?.attachments
      },
    },

    // List
    {
      name: 'List',
      match: (message, config) => {
        const channelConfig = getChannelPayload(message, config)
        if (!channelConfig) {
          return false
        }

        return channelConfig.message?.attachment?.payload?.template_type === 'list'
      },
    },

    // Gallery
    {
      name: 'Gallery',
      match: (message, config) => {
        const channelConfig = getChannelPayload(message, config)
        if (!channelConfig) {
          return false
        }

        return channelConfig.message?.attachment?.payload?.template_type === 'generic'
      },
    },

    // Adaptive Card
    {
      name: 'AdaptiveCard',
      match: (message, config) => {
        const webchatPayload = message?.data?._cognigy?._webchat
        const defaultPreviewPayload = message?.data?._cognigy?._defaultPreview
        const hasWebchatAdaptiveCard = isAdaptiveCardPayload(webchatPayload)
        const hasDefaultPreviewAdaptiveCard = isAdaptiveCardPayload(defaultPreviewPayload)
        const isPluginAdaptiveCard = message?.data?._plugin?.type === 'adaptivecards'
        const defaultPreviewEnabled = config?.settings?.widgetSettings?.enableDefaultPreview

        // Skip if default preview has a message and is enabled
        if (defaultPreviewPayload?.message && defaultPreviewEnabled) {
          return false
        }

        return (
          (hasDefaultPreviewAdaptiveCard && defaultPreviewEnabled) ||
          (hasWebchatAdaptiveCard && hasDefaultPreviewAdaptiveCard && !defaultPreviewEnabled) ||
          hasWebchatAdaptiveCard ||
          isPluginAdaptiveCard
        )
      },
    },

    // Text message (fallback)
    {
      name: 'Text',
      match: (message, config) => {
        // Don't render engagement messages unless configured
        if (
          message?.source === 'engagement' &&
          !config?.settings?.layout?.showEngagementInChat
        ) {
          return false
        }

        // Don't render if has file attachments
        if (message?.data?.attachments) {
          return false
        }

        // Handle message arrays (from streaming mode)
        if (Array.isArray(message?.text)) {
          return message.text.length > 0
        }

        // Handle messages with only escape sequences
        if (
          isOnlyEscapeSequence(message.text) &&
          !config?.settings?.behavior?.collateStreamedOutputs
        ) {
          return false
        }

        return message?.text !== null &&
               message?.text !== undefined &&
               message?.text !== ''
      },
    },
  ]
}

/**
 * Match a message to component(s)
 * @param message - The message to match
 * @param config - Optional configuration
 * @param externalPlugins - Custom plugins to check first (these provide their own components)
 * @returns Array of matched rules/plugins
 */
export function match(
  message: IMessage,
  config?: ChatConfig,
  externalPlugins: MessagePlugin[] = []
): MatchResult[] {
  // Combine external plugins with default rules
  // External plugins are checked first
  const allRules: MatchResult[] = [...externalPlugins, ...createDefaultMatchRules()]

  const matchedRules: MatchResult[] = []

  for (const rule of allRules) {
    try {
      if (rule.match(message, config)) {
        matchedRules.push(rule)

        // Stop matching unless passthrough is enabled
        if (!rule.options?.passthrough) {
          break
        }
      }
    } catch (error) {
      console.error('Matcher: Error in match function', {
        ruleName: rule.name,
        error,
        messageId: message.traceId,
      })
    }
  }

  return matchedRules
}