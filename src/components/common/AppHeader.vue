<template>
  <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
    <div class="flex items-center gap-4">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          :placeholder="placeholder"
          v-model="searchQuery"
          @input="handleSearch"
          class="w-80 pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>
    </div>

    <div class="flex items-center gap-4">
      <button class="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
        <Bell class="w-5 h-5 text-gray-600" />
        <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      <div class="flex items-center gap-3 pl-4 border-l border-gray-200">
        <div class="text-right">
          <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
          <p class="text-xs text-gray-500">{{ displayRole }}</p>
        </div>
        <button class="relative">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
            {{ initials }}
          </div>
          <span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, Bell } from 'lucide-vue-next';
import { debounce, getRoleDisplayName } from '@/utils';

interface Props {
  placeholder?: string;
  userName?: string;
  userRole?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Tìm kiếm...',
  userName: 'Nguyễn Văn A',
  userRole: 'Người dùng'
});

const emit = defineEmits<{
  (e: 'search', query: string): void;
}>();

const searchQuery = ref('');

const initials = computed(() => {
  return props.userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

// Format role hiển thị (chuyển từ roleId hoặc roleName sang tiếng Việt)
const displayRole = computed(() => {
  return getRoleDisplayName(props.userRole);
});

const handleSearch = debounce(() => {
  emit('search', searchQuery.value);
}, 300);
</script>
