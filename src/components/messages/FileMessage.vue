<template>
  <div v-if="hasAttachments">
    <div
      :class="['webchat-media-files-template-root', $style.filesWrapper]"
    >
      <!-- Image attachments -->
      <div
        v-if="images.length > 0"
        :class="['webchat-media-template-image-container', $style.filePreviewContainer]"
      >
        <a
          v-for="(attachment, index) in images"
          :key="index"
          :href="attachment.url"
          target="_blank"
          rel="noopener noreferrer"
          :style="{ textDecoration: 'none' }"
        >
          <img
            :src="attachment.url"
            :alt="`${attachment.fileName} (${getSizeLabel(attachment.size)})`"
            :title="`${attachment.fileName} (${getSizeLabel(attachment.size)})`"
            :class="[
              'webchat-media-template-image',
              attachments.length > 1 ? $style.smallImagePreview : $style.imagePreview
            ]"
            data-testid="image-attachment"
          />
        </a>
      </div>

      <!-- Non-image file attachments -->
      <div
        v-if="nonImages.length > 0"
        :class="['webchat-media-template-files-container', $style.filePreviewContainer]"
      >
        <a
          v-for="(attachment, index) in nonImages"
          :key="index"
          :href="attachment.url"
          target="_blank"
          rel="noopener noreferrer"
          :style="{ textDecoration: 'none' }"
        >
          <div
            :class="['webchat-media-template-file', $style.filePreview]"
            data-testid="file-attachment"
          >
            <div :class="$style.fileNameWrapper">
              <Typography
                component="span"
                variant="title2-regular"
                :class="$style.fileName"
              >
                {{ getFileName(attachment.fileName) }}
              </Typography>
              <Typography
                component="span"
                variant="title2-regular"
                :class="$style.fileExtension"
              >
                {{ getFileExtension(attachment.fileName) }}
              </Typography>
            </div>
            <Typography
              component="span"
              variant="title2-regular"
              :class="$style.fileSize"
            >
              {{ getSizeLabel(attachment.size) }}
            </Typography>
          </div>
        </a>
      </div>
    </div>

    <!-- Text content below files -->
    <TextMessage
      v-if="text"
      :content="text"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Typography from '../common/Typography.vue'
import TextMessage from './TextMessage.vue'
import { useMessageContext } from '../../composables/useMessageContext'
import { getFileName, getFileExtension, getSizeLabel, isImageAttachment } from '../../utils/helpers'
import type { IUploadFileAttachmentData } from '../../types'

// Message context
const { message } = useMessageContext()

// Get attachments and text from message
const attachments = computed(() => {
  return (message.data?.attachments as IUploadFileAttachmentData[]) || []
})

const text = computed(() => message.text)

const hasAttachments = computed(() => {
  return attachments.value && attachments.value.length > 0
})

// Sort attachments by file type, valid images first
const images = computed(() => {
  return attachments.value.filter(attachment => isImageAttachment(attachment.mimeType))
})

const nonImages = computed(() => {
  return attachments.value.filter(attachment => !isImageAttachment(attachment.mimeType))
})
</script>

<style module>
.filesWrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.filePreviewContainer {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
}

@keyframes webchatImagePreviewPopIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.imagePreview {
  border-radius: var(--cc-bubble-border-radius, 15px);
  max-height: 256px;
  max-width: 295px;
  object-fit: cover;
  object-position: center center;
  animation: webchatImagePreviewPopIn 0.2s ease-out;
  transform-origin: center;
}

.smallImagePreview {
  border-radius: var(--cc-bubble-border-radius, 15px);
  height: 128px;
  width: 128px;
  object-fit: cover;
  object-position: center center;
  animation: webchatImagePreviewPopIn 0.2s ease-out;
  transform-origin: center;
}

.filePreview {
  display: flex;
  gap: 12px;
  padding: 8px 12px;
  border-radius: var(--cc-bubble-border-radius, 15px);
  height: 33px;
  background-color: var(--cc-black-95, rgba(0, 0, 0, 0.95));
  max-width: 295px;
}

.filePreview .fileNameWrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  max-width: 200px;
  color: var(--cc-black-10, rgba(0, 0, 0, 0.1));
}

.filePreview .fileName {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.filePreview .fileExtension {
  max-width: 60px;
}

.filePreview .fileSize {
  color: var(--cc-black-40, rgba(0, 0, 0, 0.4));
}
</style>
