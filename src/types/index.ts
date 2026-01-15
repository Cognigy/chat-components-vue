/**
 * Type definitions for Vue chat components
 * These mirror the React version types but adapted for Vue
 */

import type { IMessage } from '@cognigy/socket-client'
import type { Component } from 'vue'

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
  }
  colors?: {
    primaryColor?: string
    secondaryColor?: string
    botMessageColor?: string
    userMessageColor?: string
    textLinkColor?: string
  }
  behavior?: {
    renderMarkdown?: boolean
    enableTypingIndicator?: boolean
    messageDelay?: number
    collateStreamedOutputs?: boolean
  }
  widgetSettings?: {
    enableDefaultPreview?: boolean
    enableStrictMessengerSync?: boolean
    customAllowedHtmlTags?: string[]
    enableAutoFocus?: boolean
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
 * Message sender callback type
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
 * Message plugin for custom message types
 */
export interface MessagePlugin {
  name?: string
  match: (message: IMessage, config?: ChatConfig) => boolean
  component: Component
  options?: MessagePluginOptions
}

export interface MessagePluginOptions {
  passthrough?: boolean
  fullscreen?: boolean
  fullwidth?: boolean
}

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