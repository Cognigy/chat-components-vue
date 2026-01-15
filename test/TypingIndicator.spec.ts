import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TypingIndicator from '../src/components/common/TypingIndicator.vue'

describe('TypingIndicator', () => {
  it('renders three dots', () => {
    const wrapper = mount(TypingIndicator)

    const dots = wrapper.findAll('[class*="dot"]')
    expect(dots).toHaveLength(3)
  })

  it('has proper accessibility attributes', () => {
    const wrapper = mount(TypingIndicator)

    const indicator = wrapper.find('[role="status"]')
    expect(indicator.exists()).toBe(true)
    expect(indicator.attributes('aria-live')).toBe('polite')
    expect(indicator.attributes('aria-label')).toBe('Bot is typing')
  })

  it('applies custom className', () => {
    const customClass = 'my-custom-class'
    const wrapper = mount(TypingIndicator, {
      props: { className: customClass }
    })

    expect(wrapper.classes()).toContain(customClass)
  })

  it('applies direction class', () => {
    const wrapper = mount(TypingIndicator, {
      props: { direction: 'outgoing' }
    })

    // Check that outgoing class is applied
    const html = wrapper.html()
    expect(html).toContain('outgoing')
  })

  it('applies disableBorder class when prop is true', () => {
    const wrapper = mount(TypingIndicator, {
      props: { disableBorder: true }
    })

    // Check that disableBorder class is applied
    const html = wrapper.html()
    expect(html).toContain('disableBorder')
  })

  it('applies global webchat class for external styling', () => {
    const wrapper = mount(TypingIndicator)

    expect(wrapper.classes()).toContain('webchat-typing-indicator')
  })

  it('defaults to incoming direction', () => {
    const wrapper = mount(TypingIndicator)

    const html = wrapper.html()
    expect(html).toContain('incoming')
  })

  it('handles missing optional props gracefully', () => {
    // Should not throw when no props provided
    expect(() => {
      mount(TypingIndicator)
    }).not.toThrow()
  })
})
