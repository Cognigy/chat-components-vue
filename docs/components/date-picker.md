# DatePicker

**Presentation-only component** for displaying date picker messages in chat history. Shows the date picker button and selected date for rendering purposes.

> **Note**: This is a simplified presentation layer designed for chat history rendering, not an interactive date picker. For full interactive functionality with calendar UI, date selection, and validation, additional implementation with Flatpickr would be required.

## Import

```typescript
import { DatePicker } from '@cognigy/chat-components-vue'
```

## Features

- **Button Display**: Shows date picker trigger button with custom text
- **Selected Date**: Displays selected date when available
- **Event Name**: Optional label/title for the date picker
- **Disabled State**: Visual disabled state support
- **Configuration Props**: Supports all date picker configuration options for reference

## Use Case

This component is designed for **chat history rendering** where you need to show that a date picker interaction occurred, but don't need the full interactive functionality. Perfect for:

- Displaying conversation history
- Showing past date picker interactions
- Read-only chat transcripts
- Message previews

## Usage

### Basic Date Picker

```vue
<template>
  <DatePicker />
</template>

<script setup>
import { DatePicker, provideMessageContext } from '@cognigy/chat-components-vue'

const message = {
  text: '',
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _plugin: {
      type: 'date-picker',
      data: {
        openPickerButtonText: 'Pick date'
      }
    }
  }
}

provideMessageContext({
  message,
  config: {},
  action: (text, data) => console.log('Action:', text, data),
  onEmitAnalytics: (event) => console.log('Analytics:', event)
})
</script>
```

### Date Picker with Selected Date

```vue
<script setup>
const message = {
  text: '2024-03-15', // Selected date displayed
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _plugin: {
      type: 'date-picker',
      data: {
        openPickerButtonText: 'Select appointment date'
      }
    }
  }
}
</script>
```

### Date Picker with Event Name

```vue
<script setup>
const message = {
  text: '',
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _plugin: {
      type: 'date-picker',
      data: {
        openPickerButtonText: 'Choose date',
        eventName: 'Appointment Booking'
      }
    }
  }
}
</script>
```

### Date Picker with Default Date

```vue
<script setup>
const message = {
  text: '', // No selected date yet
  source: 'bot',
  timestamp: Date.now().toString(),
  data: {
    _plugin: {
      type: 'date-picker',
      data: {
        openPickerButtonText: 'Select date',
        defaultDate: '2024-01-15' // Shows as selected
      }
    }
  }
}
</script>
```

## Data Structure

### IDatePickerData

```typescript
interface IDatePickerData {
  // Button text (default: "Pick date")
  openPickerButtonText?: string

  // Submit button text (for reference, not used in presentation mode)
  submitButtonText?: string

  // Event name/label displayed below button
  eventName?: string

  // Date format (for reference)
  dateFormat?: string

  // Default date to display as selected
  defaultDate?: string

  // Min/max dates (for reference)
  minDate?: string
  maxDate?: string

  // Selection mode (for reference)
  mode?: 'single' | 'multiple' | 'range'

  // Time picker options (for reference)
  enableTime?: boolean
  time_24hr?: boolean
  noCalendar?: boolean

  // Additional options (for reference)
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
```

### Message Structure

```typescript
interface IMessage {
  // Selected date (if any)
  text?: string

  source: 'bot' | 'user' | 'agent'
  timestamp: string

  data: {
    _plugin: {
      type: 'date-picker'
      data: IDatePickerData
    }
  }
}
```

## Component Behavior

### Button Display

- Shows button with custom text or default "Pick date"
- Non-interactive (presentation only)
- Styled to match action buttons
- Can show disabled state

### Selected Date Display

Priority order for showing selected date:

1. **Message text**: If `message.text` has value
2. **Default date**: If `defaultDate` is provided in data
3. **None**: If neither available

Example:
```typescript
// Shows "2024-03-15"
message.text = '2024-03-15'

// Shows "2024-01-20" if message.text is empty
data.defaultDate = '2024-01-20'
```

### Event Name

Optional label displayed below the button:
- Shows if `eventName` is provided
- Styled in italic gray text
- Useful for identifying the purpose

## Configuration Reference

The following configuration options are stored in the data structure for reference but don't affect the presentation layer:

### Date Format

```typescript
{
  dateFormat: 'Y-m-d'        // Default ISO format
  dateFormat: 'm/d/Y'        // US format
  dateFormat: 'd.m.Y'        // European format
}
```

### Mode

```typescript
{
  mode: 'single'   // Single date selection
  mode: 'multiple' // Multiple dates
  mode: 'range'    // Date range
}
```

### Time Options

```typescript
{
  enableTime: true,    // Show time picker
  time_24hr: true,     // 24-hour format
  noCalendar: true     // Time-only picker
}
```

### Date Constraints

```typescript
{
  minDate: '2024-01-01',
  maxDate: '2024-12-31',
  enable_disable: ['2024-01-15', '2024-01-16'],
  wantDisable: true
}
```

## CSS Variables

```css
/* Button styling */
--cc-primary-color: #1976d2;        /* Button background */
--cc-white: #ffffff;                /* Button text */
--cc-button-border-radius: 8px;     /* Button corners */

/* Selected date */
--cc-bubble-border-radius: 15px;    /* Selected date corners */

/* Event name */
--cc-black-40: rgba(0, 0, 0, 0.4); /* Event name color */
```

## Global CSS Classes

For external styling:

```css
/* Button */
.webchat-date-picker-button { }

/* Selected date display */
.webchat-date-picker-selected { }

/* Event name */
.webchat-date-picker-event { }
```

## Accessibility

### Semantic HTML

- Uses `<button>` element for the date picker trigger
- Proper `type="button"` attribute
- Disabled state support

### Typography

- Selected date uses Typography component
- Event name uses Typography component with caption variant
- Proper semantic structure

## Best Practices

### For Presentation/Rendering

1. **Show Selected State**: Always pass selected date in `message.text` to show completed interactions
2. **Event Context**: Use `eventName` to provide context for the date picker
3. **Clear Labeling**: Use descriptive `openPickerButtonText`

Example:
```typescript
// Good - Clear context and selected state
{
  text: '2024-03-15 14:30',
  data: {
    _plugin: {
      type: 'date-picker',
      data: {
        openPickerButtonText: 'Select appointment',
        eventName: 'Doctor Appointment'
      }
    }
  }
}
```

### Configuration Storage

Store full configuration in data structure for:
- Historical reference
- Future interactive implementation
- API compatibility

## Common Patterns

### Appointment Booking

```typescript
const message = {
  text: '2024-03-15 10:00',
  data: {
    _plugin: {
      type: 'date-picker',
      data: {
        openPickerButtonText: 'Choose appointment time',
        eventName: 'Medical Appointment',
        enableTime: true,
        time_24hr: false,
        minuteIncrement: 15
      }
    }
  }
}
```

### Date-Only Selection

```typescript
const message = {
  text: '2024-12-25',
  data: {
    _plugin: {
      type: 'date-picker',
      data: {
        openPickerButtonText: 'Select date',
        eventName: 'Delivery Date',
        mode: 'single'
      }
    }
  }
}
```

### Date Range

```typescript
const message = {
  text: '2024-06-01 to 2024-06-15',
  data: {
    _plugin: {
      type: 'date-picker',
      data: {
        openPickerButtonText: 'Select date range',
        eventName: 'Vacation Dates',
        mode: 'range'
      }
    }
  }
}
```

## Troubleshooting

### Date picker not appearing

- Check `message.data._plugin.type === 'date-picker'`
- Verify plugin data structure
- Ensure MessageContext is provided

### Selected date not showing

- Check `message.text` is not empty
- Check `message.text` is not whitespace-only
- Verify `defaultDate` format if using that

### Button text not updating

- Verify `openPickerButtonText` is provided
- Check for typos in property name
- Ensure data structure is correct

## Testing

Example test cases:

```typescript
import { mount } from '@vue/test-utils'
import DatePicker from '@cognigy/chat-components-vue'

describe('DatePicker', () => {
  it('renders date picker button', () => {
    const wrapper = mount(DatePicker, {
      global: {
        provide: {
          [MessageContextKey]: {
            message: {
              data: {
                _plugin: {
                  type: 'date-picker',
                  data: {}
                }
              }
            }
          }
        }
      }
    })

    expect(wrapper.find('[data-testid="datepicker-button"]').exists()).toBe(true)
  })

  it('displays selected date', () => {
    // Test implementation
  })

  it('shows event name', () => {
    // Test implementation
  })
})
```

## Future Enhancements

For full interactive functionality, consider:

- [ ] Flatpickr integration for calendar UI
- [ ] Date range selection
- [ ] Time picker with increments
- [ ] Locale support with moment.js
- [ ] Date validation and constraints
- [ ] Custom date enable/disable logic
- [ ] Modal dialog for date selection
- [ ] Focus trapping and keyboard navigation
- [ ] Mobile-optimized date picker

## Related Components

- [ActionButton](./action-button.md) - For interactive buttons
- [Typography](./typography.md) - Text rendering
- [TextWithButtons](./text-with-buttons.md) - Alternative for simple selections

## Implementation Notes

### Design Decisions

1. **Presentation Focus**: Component designed for rendering, not interaction
2. **Simple Styling**: Uses standard button styling, no calendar UI
3. **Configuration Stored**: Full config kept for API compatibility
4. **Selected State**: Shows via message text or default date

### Differences from Full Implementation

**Simplified Version** (Current):
- Button display only
- Selected date shown
- No calendar UI
- No date selection logic
- ~100 lines of code

**Full Version** (Would require):
- Flatpickr library (~50KB)
- Moment.js for date manipulation (~70KB)
- Custom Flatpickr plugin (~300 lines)
- Modal dialog with focus trapping
- Complex date validation logic
- ~800+ lines of code

### When to Use Full Implementation

Consider full interactive implementation if:
- Users need to select dates within the application
- Real-time date validation is required
- Complex date constraints (weekends, holidays, etc.)
- Multi-language support needed
- Time picker functionality required

For chat history rendering and presentation, the simplified version is sufficient.

## Security

### XSS Prevention

- Event name and button text sanitized
- No HTML injection possible
- Selected date displayed as text only

### Input Validation

- Date format validation (if implementing interactivity)
- Min/max date constraints
- Disabled dates checking

## Performance

### Bundle Size

- DatePicker.vue: ~2KB
- Dependencies: Typography (~1KB)
- Total: ~3KB (gzipped)
- **No external libraries** (flatpickr, moment.js not needed for presentation)

### Rendering

- Minimal DOM elements
- No complex computations
- Fast component mounting

## Comparison: Presentation vs Full

| Feature | Presentation Mode | Full Interactive Mode |
|---------|------------------|----------------------|
| Button Display | ✅ | ✅ |
| Selected Date | ✅ | ✅ |
| Event Name | ✅ | ✅ |
| Calendar UI | ❌ | ✅ |
| Date Selection | ❌ | ✅ |
| Time Picker | ❌ | ✅ |
| Date Validation | ❌ | ✅ |
| Locale Support | ❌ | ✅ |
| Bundle Size | ~3KB | ~150KB+ |
| Use Case | Chat History | Interactive Selection |

## Migration Path

To upgrade to full interactive date picker:

1. Install dependencies:
```bash
npm install flatpickr moment
```

2. Import Flatpickr component:
```typescript
import Flatpickr from 'vue-flatpickr-component'
```

3. Add date selection logic
4. Implement modal dialog
5. Add focus trapping
6. Handle date validation

The current data structure is compatible with full implementation, so no API changes needed.
