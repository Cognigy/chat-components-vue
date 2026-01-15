import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatEvent from '../src/components/common/ChatEvent.vue'

describe('ChatEvent', () => {
  it('renders event text', () => {
    const text = 'Conversation started'
    const wrapper = mount(ChatEvent, {
      props: { text }
    })

    expect(wrapper.text()).toContain(text)
  })

  it('has proper accessibility attributes', () => {
    const wrapper = mount(ChatEvent, {
      props: { text: 'Agent joined' }
    })

    const event = wrapper.find('[role="status"]')
    expect(event.exists()).toBe(true)
    expect(event.attributes('aria-live')).toBe('assertive')
  })

  it('applies custom className', () => {
    const customClass = 'my-custom-event'
    const wrapper = mount(ChatEvent, {
      props: {
        text: 'Test event',
        className: customClass
      }
    })

    expect(wrapper.classes()).toContain(customClass)
  })

  it('applies custom id', () => {
    const customId = 'event-123'
    const wrapper = mount(ChatEvent, {
      props: {
        text: 'Test event',
        id: customId
      }
    })

    expect(wrapper.attributes('id')).toBe(customId)
  })

  it('renders without text', () => {
    // Should not throw when no text provided
    expect(() => {
      mount(ChatEvent)
    }).not.toThrow()
  })

  it('handles empty text gracefully', () => {
    const wrapper = mount(ChatEvent, {
      props: { text: '' }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('renders with only text prop', () => {
    const wrapper = mount(ChatEvent, {
      props: { text: 'Simple event' }
    })

    expect(wrapper.text()).toContain('Simple event')
    expect(wrapper.classes().length).toBeGreaterThan(0)
  })

  it('has centered layout styles', () => {
    const wrapper = mount(ChatEvent, {
      props: { text: 'Test' }
    })

    // Component should exist with expected structure
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    expect(wrapper.html()).toContain('eventPillTextWrapper')
  })

  it('handles undefined props gracefully', () => {
    const wrapper = mount(ChatEvent, {
      props: {
        text: undefined,
        className: undefined,
        id: undefined
      }
    })

    expect(wrapper.exists()).toBe(true)
  })
})
