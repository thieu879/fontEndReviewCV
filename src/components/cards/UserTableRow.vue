<template>
  <div class="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
      {{ initials }}
    </div>
    <div class="flex-1 min-w-0">
      <p class="font-semibold text-gray-900 truncate">{{ user.name }}</p>
      <p class="text-sm text-gray-500 truncate">{{ user.email }}</p>
    </div>
    <span :class="['px-3 py-1 rounded-full text-xs font-medium', roleClass]">
      {{ roleText }}
    </span>
    <p class="text-sm text-gray-500">{{ formatDate(user.createdAt) }}</p>
    <div class="flex items-center gap-2">
      <button
        v-if="user.role !== 'admin'"
        @click="$emit('edit', user)"
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Pencil class="w-4 h-4 text-gray-500" />
      </button>
      <button
        v-if="user.role !== 'admin'"
        @click="$emit('delete', user)"
        class="p-2 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 class="w-4 h-4 text-red-500" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Pencil, Trash2 } from 'lucide-vue-next';
import { formatDate } from '@/utils';
import type { User } from '@/types';

interface Props {
  user: User;
}

const props = defineProps<Props>();

defineEmits<{
  (e: 'edit', user: User): void;
  (e: 'delete', user: User): void;
}>();

const initials = computed(() => {
  return props.user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const roleClass = computed(() => {
  switch (props.user.role) {
    case 'admin': return 'bg-purple-100 text-purple-700';
    case 'recruiter': return 'bg-blue-100 text-blue-700';
    default: return 'bg-gray-100 text-gray-700';
  }
});

const roleText = computed(() => {
  switch (props.user.role) {
    case 'admin': return 'Quản trị';
    case 'recruiter': return 'Tuyển dụng';
    default: return 'Người dùng';
  }
});
</script>
