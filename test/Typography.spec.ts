import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Typography from '../src/components/common/Typography.vue'

describe('Typography', () => {
  it('renders with default variant (body-regular) as p tag', () => {
    const wrapper = mount(Typography, {
      slots: {
        default: 'Hello World',
      },
    })

    expect(wrapper.element.tagName).toBe('P')
    expect(wrapper.text()).toBe('Hello World')
  })

  it('renders different variants with correct HTML tags', () => {
    const variants: Array<[string, string]> = [
      ['h1-semibold', 'H1'],
      ['h2-regular', 'H2'],
      ['h2-semibold', 'H2'],
      ['title1-semibold', 'H3'],
      ['title1-regular', 'H4'],
      ['title2-semibold', 'H5'],
      ['title2-regular', 'H6'],
      ['body-regular', 'P'],
      ['body-semibold', 'P'],
      ['copy-medium', 'P'],
      ['cta-semibold', 'P'],
    ]

    variants.forEach(([variant, expectedTag]) => {
      const wrapper = mount(Typography, {
        props: {
          variant: variant as any,
        },
        slots: {
          default: 'Test',
        },
      })

      expect(wrapper.element.tagName).toBe(expectedTag)
    })
  })

  it('applies variant CSS class', () => {
    const wrapper = mount(Typography, {
      props: {
        variant: 'h1-semibold',
      },
      slots: {
        default: 'Heading',
      },
    })

    const classes = wrapper.classes()
    expect(classes.some((cls) => cls.includes('h1-semibold'))).toBe(true)
  })

  it('overrides HTML tag with component prop', () => {
    const wrapper = mount(Typography, {
      props: {
        variant: 'body-regular',
        component: 'span',
      },
      slots: {
        default: 'Span text',
      },
    })

    expect(wrapper.element.tagName).toBe('SPAN')
  })

  it('applies custom className', () => {
    const wrapper = mount(Typography, {
      props: {
        className: 'custom-class',
      },
      slots: {
        default: 'Text',
      },
    })

    expect(wrapper.classes()).toContain('custom-class')
  })

  it('applies custom inline styles', () => {
    const wrapper = mount(Typography, {
      props: {
        style: {
          fontSize: '20px',
          fontWeight: 'bold',
        },
      },
      slots: {
        default: 'Styled text',
      },
    })

    const element = wrapper.element as HTMLElement
    expect(element.style.fontSize).toBe('20px')
    expect(element.style.fontWeight).toBe('bold')
  })

  it('applies primary color from color mapping', () => {
    const wrapper = mount(Typography, {
      props: {
        color: 'primary',
      },
      slots: {
        default: 'Primary color',
      },
    })

    const element = wrapper.element as HTMLElement
    expect(element.style.color).toBe('var(--cc-primary-color)')
    expect(wrapper.classes()).toContain('primary')
  })

  it('applies secondary color from color mapping', () => {
    const wrapper = mount(Typography, {
      props: {
        color: 'secondary',
      },
      slots: {
        default: 'Secondary color',
      },
    })

    const element = wrapper.element as HTMLElement
    expect(element.style.color).toBe('var(--cc-secondary-color)')
    expect(wrapper.classes()).toContain('secondary')
  })

  it('applies custom color value', () => {
    const wrapper = mount(Typography, {
      props: {
        color: '#ff0000',
      },
      slots: {
        default: 'Red text',
      },
    })

    const element = wrapper.element as HTMLElement
    expect(element.style.color).toBe('rgb(255, 0, 0)')
  })

  it('applies id attribute', () => {
    const wrapper = mount(Typography, {
      props: {
        id: 'unique-id',
      },
      slots: {
        default: 'With ID',
      },
    })

    expect(wrapper.attributes('id')).toBe('unique-id')
  })

  it('applies aria-hidden attribute', () => {
    const wrapper = mount(Typography, {
      props: {
        ariaHidden: true,
      },
      slots: {
        default: 'Hidden from screen readers',
      },
    })

    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('applies tabIndex attribute', () => {
    const wrapper = mount(Typography, {
      props: {
        tabIndex: -1,
      },
      slots: {
        default: 'Not tabbable',
      },
    })

    expect(wrapper.attributes('tabindex')).toBe('-1')
  })

  it('renders without any props', () => {
    const wrapper = mount(Typography)

    expect(wrapper.element.tagName).toBe('P')
    expect(wrapper.classes().some((cls) => cls.includes('body-regular'))).toBe(true)
  })

  it('handles empty slot content', () => {
    const wrapper = mount(Typography, {
      slots: {
        default: '',
      },
    })

    expect(wrapper.text()).toBe('')
    expect(wrapper.element).toBeTruthy()
  })

  it('combines multiple props correctly', () => {
    const wrapper = mount(Typography, {
      props: {
        variant: 'title1-semibold',
        component: 'div',
        className: 'my-custom-class',
        color: 'primary',
        id: 'test-typography',
        ariaHidden: true,
        style: {
          marginTop: '10px',
        },
      },
      slots: {
        default: 'Complex typography',
      },
    })

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('my-custom-class')
    expect(wrapper.classes()).toContain('primary')
    expect(wrapper.attributes('id')).toBe('test-typography')
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    const element = wrapper.element as HTMLElement
    expect(element.style.marginTop).toBe('10px')
    expect(element.style.color).toBe('var(--cc-primary-color)')
  })

  it('renders nested content in slot', () => {
    const wrapper = mount(Typography, {
      slots: {
        default: '<strong>Bold</strong> and <em>italic</em>',
      },
    })

    expect(wrapper.html()).toContain('<strong>Bold</strong>')
    expect(wrapper.html()).toContain('<em>italic</em>')
  })
})
