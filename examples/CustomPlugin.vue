<!--
  CustomPlugin.vue - Custom message type plugin example

  This example shows how to:
  - Create a custom message component
  - Register it as a plugin
  - Match messages based on data structure
-->

<template>
  <div :class="$style.container">
    <Message
      v-for="msg in messages"
      :key="msg.traceId"
      :message="msg"
      :config="chatConfig"
      :plugins="customPlugins"
      :action="handleAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, useCssModule, defineComponent, h } from 'vue'
import {
  Message,
  ChatBubble,
  ActionButtons,
  useMessageContext,
  type IMessage,
  type ChatConfig,
  type MessagePlugin,
  type IWebchatButton,
} from '@cognigy/chat-components-vue'

const $style = useCssModule()

// =============================================================================
// Custom Product Card Component
// =============================================================================

interface ProductData {
  name: string
  price: number
  image: string
  description: string
  buttons?: IWebchatButton[]
}

const ProductCard = defineComponent({
  name: 'ProductCard',
  setup() {
    const { message, action, config } = useMessageContext()

    // Extract product data from message
    const product = message.data?._cognigy?._webchat?.product as ProductData | undefined

    if (!product) {
      return () => h('div', 'Invalid product data')
    }

    const handleButtonClick = (button: IWebchatButton) => {
      action?.(button.payload || button.title, { productName: product.name }, { label: button.title })
    }

    return () =>
      h(
        ChatBubble,
        { source: message.source },
        {
          default: () =>
            h('div', { class: 'product-card' }, [
              h('img', {
                src: product.image,
                alt: product.name,
                style: { width: '100%', borderRadius: '8px', marginBottom: '12px' },
              }),
              h('h3', { style: { margin: '0 0 8px 0' } }, product.name),
              h(
                'p',
                { style: { color: '#1976d2', fontWeight: 'bold', margin: '0 0 8px 0' } },
                `$${product.price.toFixed(2)}`
              ),
              h('p', { style: { color: '#666', margin: '0 0 12px 0' } }, product.description),
              product.buttons &&
                h(ActionButtons, {
                  buttons: product.buttons,
                  config,
                  action: handleButtonClick,
                }),
            ]),
        }
      )
  },
})

// =============================================================================
// Custom Weather Card Component
// =============================================================================

interface WeatherData {
  location: string
  temperature: number
  condition: string
  icon: string
}

const WeatherCard = defineComponent({
  name: 'WeatherCard',
  setup() {
    const { message } = useMessageContext()

    const weather = message.data?._cognigy?._webchat?.weather as WeatherData | undefined

    if (!weather) {
      return () => h('div', 'Invalid weather data')
    }

    return () =>
      h(
        ChatBubble,
        { source: message.source },
        {
          default: () =>
            h(
              'div',
              {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '8px',
                },
              },
              [
                h('span', { style: { fontSize: '48px' } }, weather.icon),
                h('div', [
                  h('div', { style: { fontWeight: 'bold' } }, weather.location),
                  h('div', { style: { fontSize: '24px' } }, `${weather.temperature}°C`),
                  h('div', { style: { color: '#666' } }, weather.condition),
                ]),
              ]
            ),
        }
      )
  },
})

// =============================================================================
// Plugin Registration
// =============================================================================

const customPlugins: MessagePlugin[] = [
  {
    name: 'ProductCard',
    // Match messages that have product data
    match: (message) => !!message.data?._cognigy?._webchat?.product,
    component: ProductCard,
  },
  {
    name: 'WeatherCard',
    // Match messages that have weather data
    match: (message) => !!message.data?._cognigy?._webchat?.weather,
    component: WeatherCard,
  },
]

// =============================================================================
// Demo Data
// =============================================================================

const messages = ref<IMessage[]>([
  // Regular text message
  {
    text: 'Here are some products you might like:',
    source: 'bot',
    timestamp: '1',
    traceId: 'intro',
    data: {},
  },
  // Custom product message
  {
    text: null,
    source: 'bot',
    timestamp: '2',
    traceId: 'product-1',
    data: {
      _cognigy: {
        _webchat: {
          product: {
            name: 'Wireless Headphones',
            price: 149.99,
            image: 'https://picsum.photos/seed/headphones/300/200',
            description: 'Premium noise-canceling wireless headphones with 30-hour battery life.',
            buttons: [
              { type: 'postback', title: 'Add to Cart', payload: 'add_to_cart' },
              { type: 'postback', title: 'Learn More', payload: 'product_details' },
            ],
          },
        },
      },
    },
  },
  // Custom weather message
  {
    text: null,
    source: 'bot',
    timestamp: '3',
    traceId: 'weather-1',
    data: {
      _cognigy: {
        _webchat: {
          weather: {
            location: 'San Francisco, CA',
            temperature: 18,
            condition: 'Partly Cloudy',
            icon: '⛅',
          },
        },
      },
    },
  },
])

const chatConfig: ChatConfig = {
  settings: {
    layout: {
      botOutputMaxWidthPercentage: 80,
    },
  },
}

const handleAction = (text: string, data: Record<string, unknown> | null) => {
  console.log('Action:', text, data)
  alert(`Action: ${text}\nData: ${JSON.stringify(data)}`)
}
</script>

<style module>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
}
</style>
