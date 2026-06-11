<template>
  <div class="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
    <div class="flex items-center gap-4">
      <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
        {{ initials }}
      </div>
      <div>
        <p class="font-medium text-gray-900">{{ cv.fileName }}</p>
        <p class="text-sm text-gray-500">{{ formatDate(cv.uploadedAt) }}</p>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <span :class="['px-3 py-1 rounded-full text-xs font-medium', statusClass]">
        {{ statusText }}
      </span>

      <div class="flex items-center gap-2">
        <button
          v-if="cv.status === 'completed'"
          @click="$emit('view', cv)"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Xem"
        >
          <Eye class="w-4 h-4 text-gray-500" />
        </button>
        <button
          v-if="cv.status === 'completed'"
          @click="$emit('share', cv)"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Chia sẻ"
        >
          <Share2 class="w-4 h-4 text-gray-500" />
        </button>
        <button
          v-if="cv.status === 'completed'"
          @click="$emit('download', cv)"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Tải xuống"
        >
          <Download class="w-4 h-4 text-gray-500" />
        </button>
        <button
          @click="$emit('delete', cv)"
          class="p-2 hover:bg-red-50 rounded-lg transition-colors"
          title="Xóa"
        >
          <Trash2 class="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Eye, Share2, Download, Trash2 } from 'lucide-vue-next';
import { formatDate } from '@/utils';
import type { CV } from '@/types';

interface Props {
  cv: CV;
}

const props = defineProps<Props>();

defineEmits<{
  (e: 'view', cv: CV): void;
  (e: 'share', cv: CV): void;
  (e: 'download', cv: CV): void;
  (e: 'delete', cv: CV): void;
}>();

const initials = computed(() => {
  const name = props.cv.fileName.replace(/\.[^/.]+$/, '');
  return name.slice(0, 2).toUpperCase();
});

const statusClass = computed(() => {
  switch (props.cv.status) {
    case 'completed': return 'bg-green-100 text-green-700';
    case 'analyzing': return 'bg-blue-100 text-blue-700';
    case 'pending': return 'bg-yellow-100 text-yellow-700';
    case 'failed': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
});

const statusText = computed(() => {
  switch (props.cv.status) {
    case 'completed': return 'Hoàn thành';
    case 'analyzing': return 'Đang phân tích';
    case 'pending': return 'Đang chờ';
    case 'failed': return 'Thất bại';
    default: return 'Không xác định';
  }
});
</script>
