import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import DatePicker from '../src/components/messages/DatePicker.vue'
import { MessageContextKey } from '../src/composables/useMessageContext'
import type { IMessage, IDatePickerData } from '../src/types'

describe('DatePicker', () => {
  let wrapper: VueWrapper

  const createDatePickerMessage = (data: Partial<IDatePickerData>, text?: string): IMessage => {
    return {
      text: text || '',
      source: 'bot',
      timestamp: '1673456789000',
      data: {
        _plugin: {
          type: 'date-picker',
          data: data as IDatePickerData,
        },
      },
    }
  }

  const mountDatePicker = (message: IMessage) => {
    return mount(DatePicker, {
      global: {
        provide: {
          [MessageContextKey as symbol]: {
            message,
            config: {},
            action: vi.fn(),
            onEmitAnalytics: vi.fn(),
          },
        },
      },
    })
  }

  afterEach(() => {
    wrapper?.unmount()
  })

  describe('Rendering', () => {
    it('renders date picker button', () => {
      const message = createDatePickerMessage({})
      wrapper = mountDatePicker(message)

      const button = wrapper.find('[data-testid="datepicker-button"]')
      expect(button.exists()).toBe(true)
    })

    it('renders with default button text', () => {
      const message = createDatePickerMessage({})
      wrapper = mountDatePicker(message)

      const button = wrapper.find('[data-testid="datepicker-button"]')
      expect(button.text()).toBe('Pick date')
    })

    it('renders with custom button text', () => {
      const message = createDatePickerMessage({
        openPickerButtonText: 'Select a date',
      })
      wrapper = mountDatePicker(message)

      const button = wrapper.find('[data-testid="datepicker-button"]')
      expect(button.text()).toBe('Select a date')
    })

    it('does not render when not a date-picker message', () => {
      const message: IMessage = {
        text: 'Regular message',
        source: 'bot',
        timestamp: '1673456789000',
        data: {},
      }
      wrapper = mountDatePicker(message)

      const datepicker = wrapper.find('[data-testid="datepicker-message"]')
      expect(datepicker.exists()).toBe(false)
    })

    it('does not render when plugin type is different', () => {
      const message: IMessage = {
        text: '',
        source: 'bot',
        timestamp: '1673456789000',
        data: {
          _plugin: {
            type: 'other-plugin',
            data: {},
          },
        },
      }
      wrapper = mountDatePicker(message)

      const datepicker = wrapper.find('[data-testid="datepicker-message"]')
      expect(datepicker.exists()).toBe(false)
    })
  })

  describe('Event Name', () => {
    it('renders event name when provided', () => {
      const message = createDatePickerMessage({
        eventName: 'Appointment Booking',
      })
      wrapper = mountDatePicker(message)

      const eventName = wrapper.find('[data-testid="datepicker-event"]')
      expect(eventName.exists()).toBe(true)
      expect(eventName.text()).toBe('Appointment Booking')
    })

    it('does not render event name when not provided', () => {
      const message = createDatePickerMessage({})
      wrapper = mountDatePicker(message)

      const eventName = wrapper.find('[data-testid="datepicker-event"]')
      expect(eventName.exists()).toBe(false)
    })

    it('renders event name with custom label', () => {
      const message = createDatePickerMessage({
        eventName: 'Meeting Scheduler',
      })
      wrapper = mountDatePicker(message)

      const eventName = wrapper.find('[data-testid="datepicker-event"]')
      expect(eventName.text()).toContain('Meeting Scheduler')
    })
  })

  describe('Selected Date', () => {
    it('displays selected date from message text', () => {
      const message = createDatePickerMessage({}, '2024-01-15')
      wrapper = mountDatePicker(message)

      const selectedDate = wrapper.find('[data-testid="datepicker-selected"]')
      expect(selectedDate.exists()).toBe(true)
      expect(selectedDate.text()).toContain('2024-01-15')
    })

    it('displays default date when provided and no text', () => {
      const message = createDatePickerMessage({
        defaultDate: '2024-03-20',
      })
      wrapper = mountDatePicker(message)

      const selectedDate = wrapper.find('[data-testid="datepicker-selected"]')
      expect(selectedDate.exists()).toBe(true)
      expect(selectedDate.text()).toContain('2024-03-20')
    })

    it('does not display selected date when not available', () => {
      const message = createDatePickerMessage({})
      wrapper = mountDatePicker(message)

      const selectedDate = wrapper.find('[data-testid="datepicker-selected"]')
      expect(selectedDate.exists()).toBe(false)
    })

    it('prefers message text over default date', () => {
      const message = createDatePickerMessage(
        {
          defaultDate: '2024-03-20',
        },
        '2024-01-15'
      )
      wrapper = mountDatePicker(message)

      const selectedDate = wrapper.find('[data-testid="datepicker-selected"]')
      expect(selectedDate.text()).toContain('2024-01-15')
      expect(selectedDate.text()).not.toContain('2024-03-20')
    })
  })

  describe('Configuration Options', () => {
    it('handles mode configuration', () => {
      const message = createDatePickerMessage({
        mode: 'range',
        openPickerButtonText: 'Select date range',
      })
      wrapper = mountDatePicker(message)

      const button = wrapper.find('[data-testid="datepicker-button"]')
      expect(button.text()).toBe('Select date range')
    })

    it('handles time configuration', () => {
      const message = createDatePickerMessage({
        enableTime: true,
        time_24hr: true,
        openPickerButtonText: 'Select date and time',
      })
      wrapper = mountDatePicker(message)

      expect(wrapper.find('[data-testid="datepicker-button"]').exists()).toBe(true)
    })

    it('handles no calendar mode', () => {
      const message = createDatePickerMessage({
        noCalendar: true,
        openPickerButtonText: 'Select time',
      })
      wrapper = mountDatePicker(message)

      const button = wrapper.find('[data-testid="datepicker-button"]')
      expect(button.text()).toBe('Select time')
    })

    it('handles week numbers', () => {
      const message = createDatePickerMessage({
        weekNumbers: true,
      })
      wrapper = mountDatePicker(message)

      expect(wrapper.find('[data-testid="datepicker-button"]').exists()).toBe(true)
    })

    it('handles locale configuration', () => {
      const message = createDatePickerMessage({
        locale: 'de',
        openPickerButtonText: 'Datum wählen',
      })
      wrapper = mountDatePicker(message)

      const button = wrapper.find('[data-testid="datepicker-button"]')
      expect(button.text()).toBe('Datum wählen')
    })
  })

  describe('Date Constraints', () => {
    it('handles min date configuration', () => {
      const message = createDatePickerMessage({
        minDate: '2024-01-01',
      })
      wrapper = mountDatePicker(message)

      expect(wrapper.find('[data-testid="datepicker-button"]').exists()).toBe(true)
    })

    it('handles max date configuration', () => {
      const message = createDatePickerMessage({
        maxDate: '2024-12-31',
      })
      wrapper = mountDatePicker(message)

      expect(wrapper.find('[data-testid="datepicker-button"]').exists()).toBe(true)
    })

    it('handles enable/disable dates', () => {
      const message = createDatePickerMessage({
        enable_disable: ['2024-01-15', '2024-01-16'],
        wantDisable: true,
      })
      wrapper = mountDatePicker(message)

      expect(wrapper.find('[data-testid="datepicker-button"]').exists()).toBe(true)
    })
  })

  describe('Time Configuration', () => {
    it('handles default hour and minute', () => {
      const message = createDatePickerMessage({
        enableTime: true,
        defaultHour: 14,
        defaultMinute: 30,
      })
      wrapper = mountDatePicker(message)

      expect(wrapper.find('[data-testid="datepicker-button"]').exists()).toBe(true)
    })

    it('handles hour increment', () => {
      const message = createDatePickerMessage({
        enableTime: true,
        hourIncrement: 2,
      })
      wrapper = mountDatePicker(message)

      expect(wrapper.find('[data-testid="datepicker-button"]').exists()).toBe(true)
    })

    it('handles minute increment', () => {
      const message = createDatePickerMessage({
        enableTime: true,
        minuteIncrement: 15,
      })
      wrapper = mountDatePicker(message)

      expect(wrapper.find('[data-testid="datepicker-button"]').exists()).toBe(true)
    })
  })

  describe('CSS Classes', () => {
    it('applies correct global CSS classes', () => {
      const message = createDatePickerMessage({})
      wrapper = mountDatePicker(message)

      const button = wrapper.find('.webchat-date-picker-button')
      expect(button.exists()).toBe(true)
    })

    it('applies CSS class to selected date', () => {
      const message = createDatePickerMessage({}, '2024-01-15')
      wrapper = mountDatePicker(message)

      const selectedDate = wrapper.find('.webchat-date-picker-selected')
      expect(selectedDate.exists()).toBe(true)
    })

    it('applies CSS class to event name', () => {
      const message = createDatePickerMessage({
        eventName: 'Meeting',
      })
      wrapper = mountDatePicker(message)

      const eventName = wrapper.find('.webchat-date-picker-event')
      expect(eventName.exists()).toBe(true)
    })
  })

  describe('Components', () => {
    it('uses Typography component for selected date', () => {
      const message = createDatePickerMessage({}, '2024-01-15')
      wrapper = mountDatePicker(message)

      const typography = wrapper.findAllComponents({ name: 'Typography' })
      expect(typography.length).toBeGreaterThan(0)
    })

    it('uses Typography component for event name', () => {
      const message = createDatePickerMessage({
        eventName: 'Meeting',
      })
      wrapper = mountDatePicker(message)

      const typography = wrapper.findAllComponents({ name: 'Typography' })
      expect(typography.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('handles missing plugin data', () => {
      const message: IMessage = {
        text: '',
        source: 'bot',
        timestamp: '1673456789000',
        data: {
          _plugin: {
            type: 'date-picker',
          },
        },
      }
      wrapper = mountDatePicker(message)

      const button = wrapper.find('[data-testid="datepicker-button"]')
      expect(button.text()).toBe('Pick date')
    })

    it('handles empty data object', () => {
      const message: IMessage = {
        text: '',
        source: 'bot',
        timestamp: '1673456789000',
        data: {
          _plugin: {
            type: 'date-picker',
            data: {},
          },
        },
      }
      wrapper = mountDatePicker(message)

      expect(wrapper.find('[data-testid="datepicker-button"]').exists()).toBe(true)
    })

    it('handles whitespace-only message text', () => {
      const message = createDatePickerMessage({}, '   ')
      wrapper = mountDatePicker(message)

      const selectedDate = wrapper.find('[data-testid="datepicker-selected"]')
      expect(selectedDate.exists()).toBe(false)
    })
  })

  describe('Accessibility', () => {
    it('renders semantic button element', () => {
      const message = createDatePickerMessage({})
      wrapper = mountDatePicker(message)

      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })

    it('button has proper type attribute', () => {
      const message = createDatePickerMessage({})
      wrapper = mountDatePicker(message)

      const button = wrapper.find('button')
      expect(button.attributes('type')).toBe('button')
    })
  })
})
