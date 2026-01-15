/**
 * Message context composable
 * Provides message context to child components using Vue's provide/inject
 */

import { inject, provide, type InjectionKey } from 'vue'
import type { MessageContext } from '../types'

// Injection key for message context
export const MessageContextKey: InjectionKey<MessageContext> = Symbol('MessageContext')

/**
 * Provide message context to child components
 * @param context - Message context to provide
 */
export function provideMessageContext(context: MessageContext) {
  provide(MessageContextKey, context)
}

/**
 * Use message context in a child component
 * @returns Message context or throws error if not provided
 */
export function useMessageContext(): MessageContext {
  const context = inject(MessageContextKey)

  if (!context) {
    console.error('useMessageContext: Context not provided. Make sure component is wrapped in MessageProvider.')
    throw new Error('useMessageContext must be used within a message context provider')
  }

  return context
}

/**
 * Use message context with optional fallback
 * @returns Message context or undefined if not provided
 */
export function useMessageContextOptional(): MessageContext | undefined {
  return inject(MessageContextKey, undefined)
}