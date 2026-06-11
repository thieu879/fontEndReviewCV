<template>
  <div class="min-h-screen bg-slate-900">
    <AdminSidebar />
    <div class="transition-all duration-300 ml-64">
      <!-- Header -->
      <header class="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
        <h1 class="text-lg font-semibold text-white">{{ pageTitle }}</h1>
        <div class="flex items-center gap-3">
          <!-- Search -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Tìm kiếm..."
              class="w-64 pl-9 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
          </div>

          <!-- Notifications -->
          <button class="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <Bell class="w-5 h-5 text-slate-400" />
          </button>

          <!-- Theme toggle -->
          <button @click="toggleTheme" class="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            :title="theme === 'dark' ? 'Chuyển sáng' : 'Chuyển tối'">
            <Sun v-if="theme === 'dark'" class="w-5 h-5 text-slate-400" />
            <Moon v-else class="w-5 h-5 text-slate-400" />
          </button>

          <!-- User -->
          <router-link to="/profile" class="flex items-center gap-3 ml-2 hover:opacity-80 transition-opacity">
            <div class="text-right">
              <div class="text-sm font-semibold text-white">{{ userName }}</div>
              <div class="text-xs text-slate-400">Quản trị viên</div>
            </div>
            <BaseAvatar :name="userName" :src="userAvatar" size="sm" />
          </router-link>
        </div>
      </header>

      <!-- Main content -->
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Search, Bell, Sun, Moon } from 'lucide-vue-next';
import { useTheme } from '@/composables/useTheme';
import { useAuth } from '@/composables/useAuth';
import AdminSidebar from '@/components/sidebar/AdminSidebar.vue';
import BaseAvatar from '@/components/base/BaseAvatar.vue';

const route = useRoute();
const { theme, toggleTheme } = useTheme();
const { user } = useAuth();

const userName = computed(() => user.value?.name || user.value?.email || 'Admin');
const userAvatar = computed(() => user.value?.avatar || null);

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    '/admin': 'Tổng quan',
    '/admin/users': 'Quản lý người dùng',
    '/admin/candidates': 'Quản lý ứng viên',
    '/admin/reports': 'Báo cáo & Phân tích',
    '/admin/logs': 'Nhật ký hệ thống',
  };
  return map[route.path] || 'Admin Console';
});
</script>
