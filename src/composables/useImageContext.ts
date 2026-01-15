import { inject, provide, InjectionKey, ComputedRef } from 'vue'
import type { IWebchatButton } from '../types'

export interface ImageContext {
  onExpand: () => void
  onClose: () => void
  url: string
  altText?: string
  button?: IWebchatButton
  isDownloadable: ComputedRef<boolean>
}

export const ImageContextKey: InjectionKey<ImageContext> = Symbol('ImageContext')

export function provideImageContext(context: ImageContext) {
  provide(ImageContextKey, context)
}

export function useImageContext() {
  const context = inject(ImageContextKey)

  if (!context) {
    throw new Error('useImageContext must be used within an ImageMessage component')
  }

  return context
}
