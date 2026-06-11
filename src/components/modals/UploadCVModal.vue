<template>
  <BaseModal
    :is-open="isOpen"
    title="Tải lên CV"
    size="lg"
    @close="close"
  >
    <div class="space-y-6">
      <div
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
        @drop.prevent="onDrop"
        :class="[
          'border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer',
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        ]"
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".pdf,.doc,.docx"
          class="hidden"
          @change="handleFileSelect"
        />
        <Upload class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-700 mb-2">
          Kéo thả file CV vào đây
        </h3>
        <p class="text-gray-500 mb-4">hoặc nhấn để chọn file</p>
        <p class="text-sm text-gray-400">Hỗ trợ định dạng PDF, DOC, DOCX (tối đa 10MB)</p>
      </div>

      <div v-if="selectedFile" class="bg-blue-50 rounded-xl p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <FileText class="w-10 h-10 text-blue-600" />
            <div>
              <p class="font-medium text-gray-900">{{ selectedFile.name }}</p>
              <p class="text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
            </div>
          </div>
          <button @click="removeFile" class="p-2 hover:bg-blue-100 rounded-lg transition-colors">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Mô tả (tùy chọn)</label>
        <textarea
          v-model="description"
          rows="3"
          placeholder="Thêm mô tả ngắn về CV này..."
          class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        ></textarea>
      </div>
    </div>

    <template #footer>
      <button
        @click="close"
        class="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
      >
        Hủy
      </button>
      <button
        @click="uploadCV"
        :disabled="!selectedFile || isUploading"
        :class="[
          'px-5 py-2.5 text-white rounded-xl transition-colors font-medium flex items-center gap-2',
          selectedFile && !isUploading
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-400 cursor-not-allowed'
        ]"
      >
        <Loader2 v-if="isUploading" class="w-4 h-4 animate-spin" />
        <Upload v-else class="w-4 h-4" />
        {{ isUploading ? 'Đang tải lên...' : 'Tải lên' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseModal from '@/components/common/BaseModal.vue';
import { Upload, FileText, X, Loader2 } from 'lucide-vue-next';

interface Props {
  isOpen: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'upload', file: File, description: string): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const isDragging = ref(false);
const isUploading = ref(false);
const description = ref('');

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
  }
};

const onDragOver = () => {
  isDragging.value = true;
};

const onDragLeave = () => {
  isDragging.value = false;
};

const onDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    selectedFile.value = event.dataTransfer.files[0];
  }
};

const removeFile = () => {
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const close = () => emit('close');

const uploadCV = async () => {
  if (selectedFile.value) {
    isUploading.value = true;
    emit('upload', selectedFile.value, description.value);
    setTimeout(() => {
      isUploading.value = false;
      selectedFile.value = null;
      description.value = '';
      emit('close');
    }, 2000);
  }
};
</script>
