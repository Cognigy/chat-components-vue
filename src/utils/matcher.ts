/**
 * Message matcher system
 * Determines which component to render based on message data structure
 *
 * This is the core of the data-driven architecture.
 * The same matching rules as the React version.
 */

import type { IMessage } from '@cognigy/socket-client'
import type { ChatConfig, MessagePlugin } from '@/types'

// Message type components will be imported here as they're created
// For now, we'll use component references

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
 * Check if text is only escape sequences
 */
function isOnlyEscapeSequence(text: any): boolean {
  if (typeof text !== 'string') {
    return false
  }

  const trimmed = text.trim()
  return trimmed === '' || /^[\n\t\r\v\f\s]*$/.test(trimmed)
}

/**
 * Default match rules
 * These mirror the React version's defaultConfig
 */
export function createDefaultMatchRules(): MessagePlugin[] {
  return [
    // xApp submit
    {
      name: 'XAppSubmit',
      match: (message) => {
        return message?.data?._plugin?.type === 'x-app-submit'
      },
      component: {} as any, // Will be replaced with actual component
    },

    // Webchat3Event
    {
      name: 'Webchat3Event',
      match: (message) => {
        return !!message?.data?._cognigy?._webchat3?.type
      },
      component: {} as any,
    },

    // Date picker
    {
      name: 'DatePicker',
      match: (message) => {
        return message?.data?._plugin?.type === 'date-picker'
      },
      component: {} as any,
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
      component: {} as any,
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
      component: {} as any,
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
      component: {} as any,
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
      component: {} as any,
    },

    // File
    {
      name: 'File',
      match: (message) => {
        return !!message?.data?.attachments
      },
      component: {} as any,
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
      component: {} as any,
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
      component: {} as any,
    },

    // Adaptive Card
    {
      name: 'AdaptiveCard',
      match: (message, config) => {
        const _webchat = (message?.data?._cognigy?._webchat as any)?.adaptiveCard
        const _defaultPreview = (message?.data?._cognigy?._defaultPreview as any)?.adaptiveCard
        const _plugin = message?.data?._plugin?.type === 'adaptivecards'
        const defaultPreviewEnabled = config?.settings?.widgetSettings?.enableDefaultPreview

        if (message.data?._cognigy?._defaultPreview?.message && defaultPreviewEnabled) {
          return false
        }

        if (
          (_defaultPreview && defaultPreviewEnabled) ||
          (_webchat && _defaultPreview && !defaultPreviewEnabled) ||
          _webchat ||
          _plugin
        ) {
          return true
        }

        return false
      },
      component: {} as any,
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
      component: {} as any,
    },
  ]
}

/**
 * Match a message to component(s)
 * @param message - The message to match
 * @param config - Optional configuration
 * @param externalPlugins - Custom plugins to check first
 * @returns Array of matched plugins
 */
export function match(
  message: IMessage,
  config?: ChatConfig,
  externalPlugins: MessagePlugin[] = []
): MessagePlugin[] {
  // Combine external plugins with default rules
  // External plugins are checked first
  const allRules = [...externalPlugins, ...createDefaultMatchRules()]

  const matchedPlugins: MessagePlugin[] = []

  for (const plugin of allRules) {
    try {
      if (plugin.match(message, config)) {
        matchedPlugins.push(plugin)

        // Stop matching unless passthrough is enabled
        if (!plugin.options?.passthrough) {
          break
        }
      }
    } catch (error) {
      console.error('Matcher: Error in match function', {
        pluginName: plugin.name,
        error,
        messageId: message.traceId,
      })
    }
  }

  return matchedPlugins
}