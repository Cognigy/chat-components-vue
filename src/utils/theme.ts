/**
 * Theme utilities for config-driven CSS variable injection
 */

import type { ChatSettings } from '../types'

/**
 * Maps config.settings.colors to CSS custom properties.
 * Returns an object suitable for use as an inline style that sets CSS variables.
 *
 * @param colors - The colors object from ChatSettings
 * @returns A record of CSS variable names to their values
 *
 * @example
 * ```typescript
 * const style = configColorsToCssVariables({
 *   primaryColor: '#0b3694',
 *   botMessageColor: '#f5f5f5',
 * })
 * // Returns: { '--cc-primary-color': '#0b3694', '--cc-background-bot-message': '#f5f5f5' }
 * ```
 */
export function configColorsToCssVariables(
  colors?: ChatSettings['colors']
): Record<string, string> {
  if (!colors) return {}

  const mapping: Record<string, string | undefined> = {
    // Primary action colors
    '--cc-primary-color': colors.primaryColor,
    '--cc-primary-color-hover': colors.primaryColorHover,
    '--cc-primary-color-focus': colors.primaryColorFocus,
    '--cc-primary-color-disabled': colors.primaryColorDisabled,
    '--cc-primary-contrast-color': colors.primaryContrastColor,
    '--cc-secondary-color': colors.secondaryColor,

    // Message bubble backgrounds
    '--cc-background-bot-message': colors.botMessageColor,
    '--cc-bot-message-contrast-color': colors.botMessageContrastColor,
    '--cc-background-user-message': colors.userMessageColor,
    '--cc-user-message-contrast-color': colors.userMessageContrastColor,
    '--cc-background-agent-message': colors.agentMessageColor,
    '--cc-agent-message-contrast-color': colors.agentMessageContrastColor,

    // Message bubble borders
    '--cc-border-bot-message': colors.borderBotMessage,
    '--cc-border-user-message': colors.borderUserMessage,
    '--cc-border-agent-message': colors.borderAgentMessage,

    // Link color
    '--cc-text-link-color': colors.textLinkColor,
  }

  // Filter out undefined values and return only defined CSS variables
  return Object.fromEntries(
    Object.entries(mapping).filter(([, value]) => value !== undefined)
  ) as Record<string, string>
}
