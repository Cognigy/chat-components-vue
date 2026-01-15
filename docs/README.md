# Vue Chat Components Documentation

This directory contains comprehensive documentation for the Vue 3 version of @cognigy/chat-components.

## Documentation Structure

- **data-structures/** - Message data structure reference for all message types
- **components/** - Individual component documentation
- **patterns/** - Common patterns and best practices
- **api/** - API reference and type definitions

## Quick Links

- [Message Data Structures](./data-structures/README.md) - **START HERE** if integrating with backend
- [Component API Reference](./components/README.md) - Component props and usage
- [Common Patterns](./patterns/README.md) - Reusable patterns and solutions

## For Developers

**Before implementing a component:**
1. Read the data structure documentation for that message type
2. Check if similar patterns exist in patterns/
3. Review the React component in `../../src/` for reference

**After implementing a component:**
1. Update the component documentation in components/
2. Add data structure examples if new patterns are introduced
3. Document any gotchas or important patterns

## For Integrators

If you're integrating these components into your application:
1. Start with [Message Data Structures](./data-structures/README.md)
2. Understand the data-driven rendering model
3. Review component examples in [Component API](./components/README.md)

## Maintenance

This documentation should be updated whenever:
- A new component is added
- A new message type is supported
- Data structure requirements change
- New patterns emerge
- Edge cases or gotchas are discovered

**Keep this documentation in sync with the code!**