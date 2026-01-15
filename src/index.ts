/**
 * Main entry point for @cognigy/chat-components-vue
 * Exports all public components, composables, and utilities
 */

// Main Component
export { default as Message } from './components/Message.vue'

// Common Components
export { default as TypingIndicator } from './components/common/TypingIndicator.vue'
export { default as ChatEvent } from './components/common/ChatEvent.vue'
export { default as Typography } from './components/common/Typography.vue'
export { default as ActionButtons } from './components/common/ActionButtons.vue'
export { default as ActionButton } from './components/common/ActionButton.vue'
export { default as ChatBubble } from './components/common/ChatBubble.vue'

// Message Types
export { default as TextMessage } from './components/messages/TextMessage.vue'
export { default as ImageMessage } from './components/messages/ImageMessage.vue'
export { default as VideoMessage } from './components/messages/VideoMessage.vue'
export { default as AudioMessage } from './components/messages/AudioMessage.vue'
export { default as TextWithButtons } from './components/messages/TextWithButtons.vue'
export { default as Gallery } from './components/messages/Gallery.vue'
export { default as List } from './components/messages/List.vue'
export { default as FileMessage } from './components/messages/FileMessage.vue'
export { default as DatePicker } from './components/messages/DatePicker.vue'
export { default as AdaptiveCard } from './components/messages/AdaptiveCard.vue'

// Components to be exported as they are created:
// export { default as Message } from './components/Message.vue'

// Composables
export { useMessageContext, useMessageContextOptional, provideMessageContext, MessageContextKey } from './composables/useMessageContext'
export { useSanitize } from './composables/useSanitize'
export { useImageContext, provideImageContext, ImageContextKey } from './composables/useImageContext'

// SVG Icons
export { DownloadIcon, CloseIcon, VideoPlayIcon, AudioPlayIcon, AudioPauseIcon, ArrowBackIcon, LinkIcon } from './assets/svg'

// Utilities
export { match, getChannelPayload } from './utils/matcher'
export { sanitizeHTMLWithConfig, sanitizeContent } from './utils/sanitize'
export { getWebchatButtonLabel, interpolateString, getRandomId, moveFocusToMessageFocusTarget, replaceUrlsWithHTMLanchorElem, getBackgroundImage, getFileName, getFileExtension, getSizeLabel, isImageAttachment, VALID_IMAGE_MIME_TYPES } from './utils/helpers'

// Types
export type {
  ChatConfig,
  ChatSettings,
  ChatTheme,
  MessageProps,
  MessageSender,
  MessagePlugin,
  MessagePluginOptions,
  MessageContext,
  IMessage,
  IWebchatButton,
  IWebchatQuickReply,
  IWebchatTemplateAttachment,
  IWebchatAttachmentElement,
  IWebchatAudioAttachment,
  IWebchatImageAttachment,
  IWebchatVideoAttachment,
  IUploadFileAttachmentData,
  IDatePickerData,
} from './types'

export type { TagVariant } from './components/common/Typography.vue'