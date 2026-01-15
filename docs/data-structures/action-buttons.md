# Action Buttons Data Structure

Action Buttons can be used either as a standalone component or as part of message types like Text with Buttons.

## Component Type

**Component:** `ActionButtons.vue`

**Category:** Standalone Component (can also be used in message types)

## When to Use

Use ActionButtons for:
- Quick reply options
- Primary call-to-action buttons
- Navigation choices
- Contact options (phone, web, email)
- Form submissions
- xApp integrations (Cognigy-specific)

## Data Structure

### Basic Button Array

```typescript
const buttons: IWebchatButton[] = [
  {
    type: 'postback',
    title: 'Button Label',
    payload: 'button_payload'
  }
]
```

### Complete Button Definition

```typescript
interface IWebchatButton {
  type: 'postback' | 'web_url' | 'phone_number' | 'openXApp'
  title?: string                 // Button label (required for most types)
  payload?: string               // Action payload or phone number
  url?: string                   // URL for web_url type
  target?: '_blank' | '_self'    // Link target for web_url
  image_url?: string             // Optional button image
  imageUrl?: string              // Alternative image property
  image_alt_text?: string        // Image alt text
  imageAltText?: string          // Alternative alt text property
}
```

## Button Types

### 1. Postback Button

Triggers an action when clicked. Most common button type.

```json
{
  "type": "postback",
  "title": "Get Started",
  "payload": "get_started"
}
```

**Backend sends:**
```json
{
  "text": "What would you like to do?",
  "source": "bot",
  "data": {
    "_cognigy": {
      "_webchat": {
        "message": {
          "attachment": {
            "type": "template",
            "payload": {
              "template_type": "button",
              "text": "What would you like to do?",
              "buttons": [
                {
                  "type": "postback",
                  "title": "View Products",
                  "payload": "view_products"
                },
                {
                  "type": "postback",
                  "title": "Contact Support",
                  "payload": "contact_support"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

**Frontend behavior:**
- Renders as `<button>`
- Calls `action(payload, null, { label: title })`
- Sends payload to backend

### 2. Web URL Button

Opens a link when clicked.

```json
{
  "type": "web_url",
  "title": "Visit Website",
  "url": "https://example.com",
  "target": "_blank"
}
```

**Backend example:**
```json
{
  "text": "Learn more about our products:",
  "source": "bot",
  "data": {
    "_cognigy": {
      "_webchat": {
        "message": {
          "attachment": {
            "type": "template",
            "payload": {
              "template_type": "button",
              "text": "Learn more about our products:",
              "buttons": [
                {
                  "type": "web_url",
                  "title": "Documentation",
                  "url": "https://docs.example.com",
                  "target": "_blank"
                },
                {
                  "type": "web_url",
                  "title": "Pricing",
                  "url": "https://example.com/pricing",
                  "target": "_self"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

**Frontend behavior:**
- Renders as `<a href="...">`
- Opens URL in new tab (`_blank`) or same tab (`_self`)
- URL is sanitized for security
- Shows external link icon if `showUrlIcon` enabled

**Important:** URLs must use `http://` or `https://` protocol. Other protocols (e.g., `javascript:`, `data:`) are blocked for security.

### 3. Phone Number Button

Creates a clickable phone link.

```json
{
  "type": "phone_number",
  "title": "Call Support",
  "payload": "+1-800-555-0123"
}
```

**Backend example:**
```json
{
  "text": "Need immediate help?",
  "source": "bot",
  "data": {
    "_cognigy": {
      "_webchat": {
        "message": {
          "attachment": {
            "type": "template",
            "payload": {
              "template_type": "button",
              "text": "Need immediate help?",
              "buttons": [
                {
                  "type": "phone_number",
                  "title": "Call Sales",
                  "payload": "+1-800-SALES-00"
                },
                {
                  "type": "phone_number",
                  "title": "Call Support",
                  "payload": "+1-800-HELP-00"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

**Frontend behavior:**
- Renders as `<a href="tel:...">`
- Opens phone dialer on mobile
- Desktop may open default phone app
- If no title, defaults to "Call"

**Phone number format:** Use international format with country code recommended (e.g., `+1-800-555-0123`)

### 4. XApp Button (Cognigy-Specific)

Opens an xApp overlay.

```json
{
  "type": "openXApp",
  "title": "Fill Form",
  "payload": "https://xapp.example.com/form"
}
```

**Backend example:**
```json
{
  "text": "Please complete this form:",
  "source": "bot",
  "data": {
    "_cognigy": {
      "_webchat": {
        "message": {
          "attachment": {
            "type": "template",
            "payload": {
              "template_type": "button",
              "text": "Please complete this form:",
              "buttons": [
                {
                  "type": "openXApp",
                  "title": "Open Form",
                  "payload": "https://xapp-form.cognigy.ai/submit"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

**Frontend behavior:**
- Calls `openXAppOverlay(payload)`
- Opens xApp in overlay/modal
- Specific to Cognigy Webchat integration

## Button Images

Buttons can include images for visual enhancement:

```json
{
  "type": "postback",
  "title": "Premium Plan",
  "payload": "select_premium",
  "image_url": "https://example.com/icons/premium.png",
  "image_alt_text": "Premium plan icon"
}
```

**Backend example with images:**
```json
{
  "text": "Choose your subscription:",
  "source": "bot",
  "data": {
    "_cognigy": {
      "_webchat": {
        "message": {
          "attachment": {
            "type": "template",
            "payload": {
              "template_type": "button",
              "text": "Choose your subscription:",
              "buttons": [
                {
                  "type": "postback",
                  "title": "Basic",
                  "payload": "plan_basic",
                  "image_url": "https://cdn.example.com/basic.png",
                  "image_alt_text": "Basic plan"
                },
                {
                  "type": "postback",
                  "title": "Pro",
                  "payload": "plan_pro",
                  "image_url": "https://cdn.example.com/pro.png",
                  "image_alt_text": "Pro plan"
                },
                {
                  "type": "postback",
                  "title": "Enterprise",
                  "payload": "plan_enterprise",
                  "image_url": "https://cdn.example.com/enterprise.png",
                  "image_alt_text": "Enterprise plan"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

**Frontend behavior:**
- Image appears on left side of button
- 40px width reserved for image
- Button text offset with left margin
- Image has rounded corners matching button

## Quick Replies

Quick replies are a special case of ActionButtons using the `content_type` field:

```json
{
  "content_type": "text",
  "title": "Yes",
  "payload": "yes"
}
```

**Backend example:**
```json
{
  "text": "Do you want to continue?",
  "source": "bot",
  "data": {
    "_cognigy": {
      "_webchat": {
        "quick_replies": [
          {
            "content_type": "text",
            "title": "Yes",
            "payload": "yes"
          },
          {
            "content_type": "text",
            "title": "No",
            "payload": "no"
          }
        ]
      }
    }
  }
}
```

## Validation Rules

The frontend automatically filters out invalid buttons:

### Valid Buttons ✅

```json
// Postback with title and payload
{ "type": "postback", "title": "Click", "payload": "click" }

// Web URL with title, url, and target
{ "type": "web_url", "title": "Link", "url": "https://...", "target": "_blank" }

// Phone with title and payload
{ "type": "phone_number", "title": "Call", "payload": "+1234567890" }

// Phone without title (defaults to "Call")
{ "type": "phone_number", "payload": "+1234567890" }
```

### Invalid Buttons (Filtered Out) ❌

```json
// Unknown type
{ "type": "unknown_type", "title": "Test", "payload": "test" }

// Text content_type without title
{ "content_type": "text", "payload": "test" }

// Missing required fields
{ "type": "postback" }  // No title or payload
{ "type": "web_url", "title": "Link" }  // No url
```

## Complete Examples

### Example 1: Simple Yes/No Choice

```json
{
  "text": "Would you like to subscribe to our newsletter?",
  "source": "bot",
  "timestamp": "1673456789000",
  "data": {
    "_cognigy": {
      "_webchat": {
        "message": {
          "attachment": {
            "type": "template",
            "payload": {
              "template_type": "button",
              "text": "Would you like to subscribe to our newsletter?",
              "buttons": [
                {
                  "type": "postback",
                  "title": "Yes, Subscribe",
                  "payload": "subscribe_yes"
                },
                {
                  "type": "postback",
                  "title": "No Thanks",
                  "payload": "subscribe_no"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

### Example 2: Mixed Button Types

```json
{
  "text": "How would you like to get in touch?",
  "source": "bot",
  "timestamp": "1673456789000",
  "data": {
    "_cognigy": {
      "_webchat": {
        "message": {
          "attachment": {
            "type": "template",
            "payload": {
              "template_type": "button",
              "text": "How would you like to get in touch?",
              "buttons": [
                {
                  "type": "postback",
                  "title": "Chat with Agent",
                  "payload": "start_live_chat"
                },
                {
                  "type": "phone_number",
                  "title": "Call Us",
                  "payload": "+1-800-555-0123"
                },
                {
                  "type": "web_url",
                  "title": "Email Support",
                  "url": "mailto:support@example.com",
                  "target": "_self"
                },
                {
                  "type": "web_url",
                  "title": "Help Center",
                  "url": "https://help.example.com",
                  "target": "_blank"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

### Example 3: Product Selection with Images

```json
{
  "text": "Which product are you interested in?",
  "source": "bot",
  "timestamp": "1673456789000",
  "data": {
    "_cognigy": {
      "_webchat": {
        "message": {
          "attachment": {
            "type": "template",
            "payload": {
              "template_type": "button",
              "text": "Which product are you interested in?",
              "buttons": [
                {
                  "type": "postback",
                  "title": "Product A",
                  "payload": "product_a",
                  "image_url": "https://cdn.example.com/product-a.jpg",
                  "image_alt_text": "Product A"
                },
                {
                  "type": "postback",
                  "title": "Product B",
                  "payload": "product_b",
                  "image_url": "https://cdn.example.com/product-b.jpg",
                  "image_alt_text": "Product B"
                },
                {
                  "type": "postback",
                  "title": "Product C",
                  "payload": "product_c",
                  "image_url": "https://cdn.example.com/product-c.jpg",
                  "image_alt_text": "Product C"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

## Best Practices for Backend

### ✅ Do

1. **Provide clear, actionable button labels**
   ```json
   { "title": "Get Started", "payload": "start" }    // ✅ Clear
   { "title": "View Pricing", "payload": "pricing" } // ✅ Specific
   ```

2. **Use appropriate button types**
   ```json
   // ✅ Phone number for calls
   { "type": "phone_number", "title": "Call", "payload": "+1..." }

   // ✅ Web URL for external links
   { "type": "web_url", "title": "Learn More", "url": "https://..." }

   // ✅ Postback for chat actions
   { "type": "postback", "title": "Continue", "payload": "continue" }
   ```

3. **Limit button count to 2-4 buttons**
   ```json
   // ✅ Good: 3 clear options
   ["Option A", "Option B", "Option C"]

   // ❌ Too many: Overwhelming
   ["Opt 1", "Opt 2", "Opt 3", "Opt 4", "Opt 5", "Opt 6"]
   ```

4. **Include full URL protocol**
   ```json
   { "url": "https://example.com" }  // ✅
   { "url": "http://example.com" }   // ✅
   { "url": "example.com" }          // ❌ Missing protocol
   ```

### ❌ Don't

1. **Don't use vague labels**
   ```json
   { "title": "Click here" }    // ❌ Not descriptive
   { "title": "OK" }            // ❌ Unclear
   { "title": "Submit" }        // ❌ Submit what?
   ```

2. **Don't send invalid button types**
   ```json
   { "type": "custom_type" }    // ❌ Not supported
   { "type": "video" }          // ❌ Not supported
   ```

3. **Don't forget required fields**
   ```json
   { "type": "postback" }                    // ❌ Missing title, payload
   { "type": "web_url", "title": "Link" }    // ❌ Missing url
   { "type": "phone_number", "title": "Call" }  // ❌ Missing payload
   ```

4. **Don't use dangerous URLs**
   ```json
   { "url": "javascript:alert(1)" }  // ❌ Blocked
   { "url": "data:text/html,..." }   // ❌ Blocked
   ```

## Frontend Handling

The frontend processes buttons as follows:

1. **Validation:** Filters invalid button types and missing required fields
2. **Rendering:** Determines `<button>` vs `<a>` based on type
3. **Sanitization:** Sanitizes URLs for security
4. **Accessibility:** Adds ARIA labels, position info, keyboard support
5. **Action:** Calls action handler or opens URL/phone link

## Related

- [ActionButtons Component](../components/action-buttons.md) - Component API documentation
- [Text with Buttons](./text-with-buttons.md) - Message type using ActionButtons
- [Quick Replies](./quick-replies.md) - Alternative button format

## Summary

**Key Points for Backend Developers:**
- ✅ Send button arrays with `type`, `title`, and `payload`/`url`
- ✅ Use `"postback"` for chat actions
- ✅ Use `"web_url"` for external links (include `https://`)
- ✅ Use `"phone_number"` for phone calls
- ✅ Limit to 2-4 buttons per message
- ✅ Provide clear, actionable button labels
- ✅ Frontend automatically handles rendering, security, and accessibility
