import { describe, it, expect } from 'vitest'
import { configColorsToCssVariables } from '../src/utils/theme'

describe('configColorsToCssVariables', () => {
  describe('basic functionality', () => {
    it('returns empty object when colors is undefined', () => {
      const result = configColorsToCssVariables(undefined)
      expect(result).toEqual({})
    })

    it('returns empty object when colors is empty object', () => {
      const result = configColorsToCssVariables({})
      expect(result).toEqual({})
    })

    it('maps primaryColor to --cc-primary-color', () => {
      const result = configColorsToCssVariables({
        primaryColor: '#0b3694',
      })
      expect(result['--cc-primary-color']).toBe('#0b3694')
    })

    it('filters out undefined values', () => {
      const result = configColorsToCssVariables({
        primaryColor: '#0b3694',
        secondaryColor: undefined,
      })
      expect(Object.keys(result)).toHaveLength(1)
      expect(result['--cc-primary-color']).toBe('#0b3694')
      expect(result['--cc-secondary-color']).toBeUndefined()
    })
  })

  describe('primary action color mappings', () => {
    it('maps primaryColorHover to --cc-primary-color-hover', () => {
      const result = configColorsToCssVariables({
        primaryColorHover: '#092d7a',
      })
      expect(result['--cc-primary-color-hover']).toBe('#092d7a')
    })

    it('maps primaryColorFocus to --cc-primary-color-focus', () => {
      const result = configColorsToCssVariables({
        primaryColorFocus: '#0a3080',
      })
      expect(result['--cc-primary-color-focus']).toBe('#0a3080')
    })

    it('maps primaryColorDisabled to --cc-primary-color-disabled', () => {
      const result = configColorsToCssVariables({
        primaryColorDisabled: '#cccccc',
      })
      expect(result['--cc-primary-color-disabled']).toBe('#cccccc')
    })

    it('maps primaryContrastColor to --cc-primary-contrast-color', () => {
      const result = configColorsToCssVariables({
        primaryContrastColor: '#ffffff',
      })
      expect(result['--cc-primary-contrast-color']).toBe('#ffffff')
    })

    it('maps secondaryColor to --cc-secondary-color', () => {
      const result = configColorsToCssVariables({
        secondaryColor: '#6c757d',
      })
      expect(result['--cc-secondary-color']).toBe('#6c757d')
    })
  })

  describe('message bubble color mappings', () => {
    it('maps botMessageColor to --cc-background-bot-message', () => {
      const result = configColorsToCssVariables({
        botMessageColor: '#f5f5f5',
      })
      expect(result['--cc-background-bot-message']).toBe('#f5f5f5')
    })

    it('maps botMessageContrastColor to --cc-bot-message-contrast-color', () => {
      const result = configColorsToCssVariables({
        botMessageContrastColor: '#212121',
      })
      expect(result['--cc-bot-message-contrast-color']).toBe('#212121')
    })

    it('maps userMessageColor to --cc-background-user-message', () => {
      const result = configColorsToCssVariables({
        userMessageColor: '#0070E0',
      })
      expect(result['--cc-background-user-message']).toBe('#0070E0')
    })

    it('maps userMessageContrastColor to --cc-user-message-contrast-color', () => {
      const result = configColorsToCssVariables({
        userMessageContrastColor: '#ffffff',
      })
      expect(result['--cc-user-message-contrast-color']).toBe('#ffffff')
    })

    it('maps agentMessageColor to --cc-background-agent-message', () => {
      const result = configColorsToCssVariables({
        agentMessageColor: '#e8f4e8',
      })
      expect(result['--cc-background-agent-message']).toBe('#e8f4e8')
    })

    it('maps agentMessageContrastColor to --cc-agent-message-contrast-color', () => {
      const result = configColorsToCssVariables({
        agentMessageContrastColor: '#1a1a1a',
      })
      expect(result['--cc-agent-message-contrast-color']).toBe('#1a1a1a')
    })
  })

  describe('message border color mappings', () => {
    it('maps borderBotMessage to --cc-border-bot-message', () => {
      const result = configColorsToCssVariables({
        borderBotMessage: '#e0e0e0',
      })
      expect(result['--cc-border-bot-message']).toBe('#e0e0e0')
    })

    it('maps borderUserMessage to --cc-border-user-message', () => {
      const result = configColorsToCssVariables({
        borderUserMessage: '#0060c0',
      })
      expect(result['--cc-border-user-message']).toBe('#0060c0')
    })

    it('maps borderAgentMessage to --cc-border-agent-message', () => {
      const result = configColorsToCssVariables({
        borderAgentMessage: '#c0e0c0',
      })
      expect(result['--cc-border-agent-message']).toBe('#c0e0c0')
    })
  })

  describe('link color mapping', () => {
    it('maps textLinkColor to --cc-text-link-color', () => {
      const result = configColorsToCssVariables({
        textLinkColor: '#0066cc',
      })
      expect(result['--cc-text-link-color']).toBe('#0066cc')
    })
  })

  describe('complete config scenarios', () => {
    it('maps all colors correctly when all are provided', () => {
      const result = configColorsToCssVariables({
        primaryColor: '#0b3694',
        primaryColorHover: '#092d7a',
        primaryColorFocus: '#0a3080',
        primaryColorDisabled: '#cccccc',
        primaryContrastColor: '#ffffff',
        secondaryColor: '#6c757d',
        botMessageColor: '#f5f5f5',
        botMessageContrastColor: '#212121',
        userMessageColor: '#0070E0',
        userMessageContrastColor: '#ffffff',
        agentMessageColor: '#e8f4e8',
        agentMessageContrastColor: '#1a1a1a',
        borderBotMessage: '#e0e0e0',
        borderUserMessage: '#0060c0',
        borderAgentMessage: '#c0e0c0',
        textLinkColor: '#0066cc',
      })

      expect(Object.keys(result)).toHaveLength(16)
      expect(result['--cc-primary-color']).toBe('#0b3694')
      expect(result['--cc-primary-color-hover']).toBe('#092d7a')
      expect(result['--cc-primary-color-focus']).toBe('#0a3080')
      expect(result['--cc-primary-color-disabled']).toBe('#cccccc')
      expect(result['--cc-primary-contrast-color']).toBe('#ffffff')
      expect(result['--cc-secondary-color']).toBe('#6c757d')
      expect(result['--cc-background-bot-message']).toBe('#f5f5f5')
      expect(result['--cc-bot-message-contrast-color']).toBe('#212121')
      expect(result['--cc-background-user-message']).toBe('#0070E0')
      expect(result['--cc-user-message-contrast-color']).toBe('#ffffff')
      expect(result['--cc-background-agent-message']).toBe('#e8f4e8')
      expect(result['--cc-agent-message-contrast-color']).toBe('#1a1a1a')
      expect(result['--cc-border-bot-message']).toBe('#e0e0e0')
      expect(result['--cc-border-user-message']).toBe('#0060c0')
      expect(result['--cc-border-agent-message']).toBe('#c0e0c0')
      expect(result['--cc-text-link-color']).toBe('#0066cc')
    })

    it('handles typical consumer configuration', () => {
      const result = configColorsToCssVariables({
        primaryColor: '#0b3694',
        primaryColorHover: '#092d7a',
        primaryContrastColor: '#ffffff',
        botMessageColor: '#f5f5f5',
        botMessageContrastColor: '#212121',
        userMessageColor: '#0070E0',
        userMessageContrastColor: '#ffffff',
        borderBotMessage: '#e0e0e0',
      })

      expect(Object.keys(result)).toHaveLength(8)
      expect(result['--cc-primary-color']).toBe('#0b3694')
      expect(result['--cc-background-bot-message']).toBe('#f5f5f5')
    })
  })

  describe('color value formats', () => {
    it('accepts hex colors', () => {
      const result = configColorsToCssVariables({
        primaryColor: '#ff0000',
      })
      expect(result['--cc-primary-color']).toBe('#ff0000')
    })

    it('accepts short hex colors', () => {
      const result = configColorsToCssVariables({
        primaryColor: '#f00',
      })
      expect(result['--cc-primary-color']).toBe('#f00')
    })

    it('accepts rgb colors', () => {
      const result = configColorsToCssVariables({
        primaryColor: 'rgb(255, 0, 0)',
      })
      expect(result['--cc-primary-color']).toBe('rgb(255, 0, 0)')
    })

    it('accepts rgba colors', () => {
      const result = configColorsToCssVariables({
        primaryColor: 'rgba(255, 0, 0, 0.5)',
      })
      expect(result['--cc-primary-color']).toBe('rgba(255, 0, 0, 0.5)')
    })

    it('accepts hsl colors', () => {
      const result = configColorsToCssVariables({
        primaryColor: 'hsl(0, 100%, 50%)',
      })
      expect(result['--cc-primary-color']).toBe('hsl(0, 100%, 50%)')
    })

    it('accepts named colors', () => {
      const result = configColorsToCssVariables({
        primaryColor: 'red',
      })
      expect(result['--cc-primary-color']).toBe('red')
    })
  })
})
