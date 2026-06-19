<template>
  <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
    <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
          <UploadCloud class="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ title }}</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ subtitle }}</p>
        </div>
      </div>
    </div>

    <div class="p-6 space-y-5">
      <!-- Drop Zone -->
      <div
        v-if="!file"
        @dragover.prevent="$emit('drag-over')"
        @dragleave="$emit('drag-leave')"
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
        :class="[
          'rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700/30'
        ]"
      >
        <div class="flex flex-col items-center gap-3">
          <div class="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <UploadCloud class="w-7 h-7 text-blue-500" />
          </div>
          <div>
            <p class="text-base font-semibold text-slate-900 dark:text-white">
              {{ dropTitle }}
            </p>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {{ dropSubtitle }}
            </p>
          </div>
          <div class="flex items-center gap-2 mt-2">
            <span class="px-2.5 py-1 text-[10px] font-bold uppercase bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300 rounded-md">PDF</span>
            <span class="px-2.5 py-1 text-[10px] font-bold uppercase bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded-md">DOCX</span>
            <span class="text-xs text-slate-400">• Max 10MB</span>
          </div>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          class="hidden"
          @change="handleFileSelect"
        />
      </div>

      <!-- File Selected -->
      <div v-else class="space-y-4">
        <div class="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
          <div class="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-600">
            <FileText class="w-5 h-5 text-blue-500" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ file.name }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {{ formattedSize }} • {{ fileExtension }}
            </p>
          </div>
          <button
            v-if="!isProcessing"
            @click="clearFile"
            class="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            title="Remove"
          >
            <X class="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <!-- Upload Progress -->
        <div v-if="isProcessing" class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Loader2 class="w-4 h-4 animate-spin text-blue-500" />
              {{ progressLabel }}
            </span>
            <span class="text-blue-600 dark:text-blue-400 font-bold">{{ progress }}%</span>
          </div>
          <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
              :style="{ width: progress + '%' }"
            />
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
          <AlertCircle class="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        v-if="file"
        :disabled="isProcessing"
        @click="$emit('submit', file)"
        class="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles v-if="!isProcessing" class="w-4 h-4" />
        <Loader2 v-else class="w-4 h-4 animate-spin" />
        <span>{{ submitLabel }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { UploadCloud, FileText, X, Loader2, AlertCircle, Sparkles } from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  title?: string;
  subtitle?: string;
  dropTitle?: string;
  dropSubtitle?: string;
  submitLabel?: string;
  progressLabel?: string;
  isDragging?: boolean;
  isProcessing?: boolean;
  progress?: number;
  error?: string;
  file?: File | null;
}>(), {
  title: 'Upload your CV',
  subtitle: 'PDF or DOCX, max 10MB',
  dropTitle: 'Drag & drop your CV here',
  dropSubtitle: 'or click to browse files',
  submitLabel: 'Analyze with AI',
  progressLabel: 'Analyzing with AI...',
  isDragging: false,
  isProcessing: false,
  progress: 0,
  error: '',
  file: null,
});

const emit = defineEmits<{
  (e: 'file-selected', file: File): void;
  (e: 'file-cleared'): void;
  (e: 'submit', file: File): void;
  (e: 'drag-over'): void;
  (e: 'drag-leave'): void;
  (e: 'invalid-file', message: string): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const fileExtension = computed(() => {
  if (!props.file) return '';
  const name = props.file.name;
  const lastDot = name.lastIndexOf('.');
  return lastDot >= 0 ? name.substring(lastDot + 1).toUpperCase() : '';
});

const formattedSize = computed(() => {
  if (!props.file) return '';
  const bytes = props.file.size;
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
});

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_SIZE = 10 * 1024 * 1024;

const triggerFileInput = () => fileInput.value?.click();

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const f = target.files?.[0];
  if (!f) return;
  if (validate(f)) emit('file-selected', f);
  if (fileInput.value) fileInput.value.value = '';
};

const handleDrop = (e: DragEvent) => {
  const f = e.dataTransfer?.files?.[0];
  if (!f) return;
  if (validate(f)) emit('file-selected', f);
};

const validate = (f: File): boolean => {
  const extension = f.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['pdf', 'doc', 'docx'];
  if (!ALLOWED_TYPES.includes(f.type) && !allowedExtensions.includes(extension || '')) {
    emit('invalid-file', 'Only PDF or Word (.doc, .docx) files are accepted');
    return false;
  }
  if (f.size > MAX_SIZE) {
    emit('invalid-file', 'File must not exceed 10MB');
    return false;
  }
  if (f.size === 0) {
    emit('invalid-file', 'File is empty');
    return false;
  }
  return true;
};

const clearFile = () => emit('file-cleared');
</script>
