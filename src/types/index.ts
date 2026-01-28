/**
 * Type definitions for Vue chat components
 * These mirror the React version types but adapted for Vue
 */

import type { IMessage } from '@cognigy/socket-client'
import type { Component } from 'vue'

// =============================================================================
// Extended Socket Client Types
// =============================================================================

/**
 * Extended IMessage with optional runtime properties not in base interface.
 * The socket-client IMessage doesn't include 'id', but it may be present at runtime.
 */
export interface IMessageWithId extends IMessage {
  id?: string
}

/**
 * Type guard to check if a message has an id property
 */
export function hasMessageId(message: IMessage): message is IMessageWithId & { id: string } {
  return 'id' in message && typeof message.id === 'string'
}

/**
 * Get message ID with fallback to timestamp-based ID
 */
export function getMessageId(message: IMessage): string {
  if (hasMessageId(message)) {
    return message.id
  }
  return `message-${message.timestamp ?? Date.now()}`
}

/**
 * Adaptive card payload structure.
 * Used for type narrowing when accessing adaptive card data from message payloads.
 */
export interface IAdaptiveCardPayload {
  adaptiveCard: unknown
}

/**
 * Type guard to check if a payload contains an adaptive card
 */
export function isAdaptiveCardPayload(
  payload: unknown
): payload is IAdaptiveCardPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'adaptiveCard' in payload
  )
}

// =============================================================================
// Window Interface Extension (for testing)
// =============================================================================

declare global {
  interface Window {
    /** Test-only: Message ID for component testing */
    __TEST_MESSAGE_ID__?: string
  }
}

/**
 * Configuration for the chat components
 * Mirrors IWebchatConfig from React version
 */
export interface ChatConfig {
  active?: boolean
  URLToken?: string
  initialSessionId?: string
  settings?: ChatSettings
  isConfigLoaded?: boolean
  isTimedOut?: boolean
}

export interface ChatSettings {
  layout?: {
    title?: string
    logoUrl?: string
    botAvatarName?: string
    botLogoUrl?: string
    agentAvatarName?: string
    agentLogoUrl?: string
    disableHtmlContentSanitization?: boolean
    enableGenericHTMLStyling?: boolean
    disableBotOutputBorder?: boolean
    botOutputMaxWidthPercentage?: number
    disableUrlButtonSanitization?: boolean
    dynamicImageAspectRatio?: boolean
    showEngagementInChat?: boolean
  }
  colors?: {
    // Primary action colors
    primaryColor?: string
    primaryColorHover?: string
    primaryColorFocus?: string
    primaryColorDisabled?: string
    primaryContrastColor?: string
    secondaryColor?: string

    // Message bubble colors
    botMessageColor?: string
    botMessageContrastColor?: string
    userMessageColor?: string
    userMessageContrastColor?: string
    agentMessageColor?: string
    agentMessageContrastColor?: string

    // Message bubble borders
    borderBotMessage?: string
    borderUserMessage?: string
    borderAgentMessage?: string

    // Link color
    textLinkColor?: string

    // Adaptive Card colors
    adaptiveCardTextColor?: string
    adaptiveCardInputColor?: string
    adaptiveCardInputBackground?: string
    adaptiveCardInputBorder?: string
  }
  behavior?: {
    renderMarkdown?: boolean
    enableTypingIndicator?: boolean
    messageDelay?: number
    collateStreamedOutputs?: boolean
    focusInputAfterPostback?: boolean
    /**
     * Controls adaptive card interactivity.
     * - `true`: All cards are readonly (presentation only), regardless of submitted data
     * - `false`: Cards are interactive unless they have submitted data (smart default)
     * - `undefined`: Same as `false` (smart default)
     *
     * Use `true` for chat history/transcript displays where no interaction is needed.
     * Use `false` for interactive chat interfaces where users can submit card data.
     */
    adaptiveCardsReadonly?: boolean
  }
  widgetSettings?: {
    enableDefaultPreview?: boolean
    enableStrictMessengerSync?: boolean
    customAllowedHtmlTags?: string[]
    enableAutoFocus?: boolean
    disableRenderURLsAsLinks?: boolean
    disableTextInputSanitization?: boolean
    sourceDirectionMapping?: {
      user?: 'incoming' | 'outgoing'
      bot?: 'incoming' | 'outgoing'
      agent?: 'incoming' | 'outgoing'
    }
  }
  customTranslations?: {
    ariaLabels?: {
      messageHeader?: {
        user?: string
        bot?: string
        timestamp?: string
      }
      opensInNewTab?: string
      actionButtonPositionText?: string
      viewImageInFullsize?: string
      fullSizeImageViewerTitle?: string
      downloadFullsizeImage?: string
      closeFullsizeImageModal?: string
      playAudio?: string
      pauseAudio?: string
      audioPlaybackProgress?: string
      audioTimeRemaining?: string
      downloadTranscript?: string
      playVideo?: string
      slide?: string
      // Extensibility: consumers can add custom aria labels with any key
      [key: string]: any
    }
    // Extensibility: consumers can add custom translation sections
    [key: string]: any
  }
}

/**
 * Theme configuration
 */
export interface ChatTheme {
  primaryColor?: string
  primaryColorHover?: string
  secondaryColor?: string
  backgroundBotMessage?: string
  backgroundUserMessage?: string
  textDark?: string
  textLight?: string
  fontFamily?: string
}

/**
 * Message sender callback type.
 * The data parameter uses Record<string, any> because it passes through
 * unchanged to @cognigy/socket-client - shape is determined by backend.
 */
export type MessageSender = (
  text?: string,
  data?: Record<string, any> | null,
  options?: Partial<SendMessageOptions>
) => void

export interface SendMessageOptions {
  label: string
  collate: boolean
}

// =============================================================================
// Component Prop Types
// =============================================================================

/**
 * Custom icon for action buttons.
 * Can be a Vue component or a string identifier.
 */
export type CustomIcon = Component | string

/**
 * Analytics event data passed to analytics callbacks.
 * Shape varies by event type, so we use Record<string, any> for flexibility.
 */
export type AnalyticsEventData = Record<string, any>

/**
 * Callback for emitting analytics events from components.
 */
export type AnalyticsEventCallback = (event: string, data?: AnalyticsEventData) => void

/**
 * Props for the Message component
 */
export interface MessageProps {
  message: IMessage
  action?: MessageSender
  config?: ChatConfig
  theme?: ChatTheme
  prevMessage?: IMessage
  disableHeader?: boolean
  plugins?: MessagePlugin[]
  onEmitAnalytics?: (event: string, payload?: unknown) => void
}

/**
 * Options for match rules and plugins
 */
export interface MatchRuleOptions {
  /** If true, continue matching after this rule (allows multiple components) */
  passthrough?: boolean
  /** Render component in fullscreen mode */
  fullscreen?: boolean
  /** Render component at full width */
  fullwidth?: boolean
}

/**
 * Internal match rule used by the matcher system.
 * These define which message types map to which internal components.
 * Components are resolved by name lookup in Message.vue.
 */
export interface MatchRule {
  /** Unique name identifying this rule (maps to component in Message.vue) */
  name: string
  /** Function to determine if this rule matches a message */
  match: (message: IMessage, config?: ChatConfig) => boolean
  /** Optional rule behavior settings */
  options?: MatchRuleOptions
}

/**
 * External message plugin for custom message types.
 * Users provide these to handle custom message formats.
 */
export interface MessagePlugin extends MatchRule {
  /** Vue component to render for matched messages (required for external plugins) */
  component: Component
}

/**
 * Union type for matcher results - can be internal rule or external plugin
 */
export type MatchResult = MatchRule | MessagePlugin

/**
 * Type guard to check if a match result is an external plugin with a component
 */
export function isMessagePlugin(rule: MatchResult): rule is MessagePlugin {
  return 'component' in rule && isValidComponent(rule.component)
}

/**
 * Check if a value is a valid Vue component (not null/undefined/empty)
 */
export function isValidComponent(component: unknown): component is Component {
  if (!component) return false
  if (typeof component === 'function') return true
  if (typeof component === 'object' && Object.keys(component).length > 0) return true
  return false
}

/** @deprecated Use MatchRuleOptions instead */
export type MessagePluginOptions = MatchRuleOptions

/**
 * Context provided to message components
 */
export interface MessageContext {
  message: IMessage
  config?: ChatConfig
  theme?: ChatTheme
  action?: MessageSender
  onEmitAnalytics?: (event: string, payload?: unknown) => void
}

/**
 * DatePicker plugin data interface
 */
export interface IDatePickerData {
  openPickerButtonText?: string
  submitButtonText?: string
  eventName?: string
  dateFormat?: string
  defaultDate?: string
  minDate?: string
  maxDate?: string
  mode?: 'single' | 'multiple' | 'range'
  enableTime?: boolean
  time_24hr?: boolean
  noCalendar?: boolean
  weekNumbers?: boolean
  locale?: string
  enable_disable?: string[]
  function_enable_disable?: string
  wantDisable?: boolean
  defaultHour?: number
  defaultMinute?: number
  hourIncrement?: number
  minuteIncrement?: number
}

/**
 * Export types from @cognigy/socket-client for convenience
 */
export type { IMessage } from '@cognigy/socket-client'
export type {
  IWebchatButton,
  IWebchatQuickReply,
  IWebchatTemplateAttachment,
  IWebchatAttachmentElement,
  IWebchatAudioAttachment,
  IWebchatImageAttachment,
  IWebchatVideoAttachment,
  IUploadFileAttachmentData,
} from '@cognigy/socket-client'

// =============================================================================
// Webchat Channel Payload Types
// =============================================================================

// Import the types we need for the interface
import type {
  IWebchatQuickReply as QuickReply,
  IWebchatTemplateAttachment as TemplateAttachment,
  IWebchatAudioAttachment as AudioAttachment,
  IWebchatImageAttachment as ImageAttachment,
  IWebchatVideoAttachment as VideoAttachment,
} from '@cognigy/socket-client'

/**
 * Webchat channel payload structure
 * This is the shape of _webchat, _facebook, or _defaultPreview in message.data._cognigy
 */
export interface IWebchatChannelPayload {
  message?: {
    text?: string
    quick_replies?: QuickReply[]
    attachment?: TemplateAttachment | AudioAttachment | ImageAttachment | VideoAttachment
  }
  adaptiveCard?: Record<string, unknown>
  /** Submitted adaptive card data */
  adaptiveCardData?: Record<string, unknown>
  data?: Record<string, unknown>
  formData?: Record<string, unknown>
}

/**
 * Cognigy message data structure
 * Shape of message.data._cognigy
 */
export interface ICognigyData {
  _webchat?: IWebchatChannelPayload
  _defaultPreview?: IWebchatChannelPayload
  _facebook?: IWebchatChannelPayload
}

/**
 * Plugin payload structure for custom message types
 */
export interface IPluginPayload {
  type?: string
  payload?: Record<string, unknown>
}

/**
 * Extended message data with Cognigy-specific fields
 * Use this when accessing message.data with Cognigy payload structures
 */
export interface IMessageDataExtended {
  _cognigy?: ICognigyData
  _plugin?: IPluginPayload
  /** Adaptive card submission request data */
  request?: {
    value?: Record<string, unknown>
  }
  /** Direct adaptive card data fields (fallback locations) */
  adaptiveCardData?: Record<string, unknown>
  data?: Record<string, unknown>
  formData?: Record<string, unknown>
}