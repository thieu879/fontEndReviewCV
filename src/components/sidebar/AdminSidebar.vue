<template>
  <aside :class="[
    'fixed left-0 top-0 h-full bg-slate-900 text-white z-40 transition-all duration-300',
    isCollapsed ? 'w-20' : 'w-64'
  ]">
    <!-- Logo -->
    <div class="flex items-center justify-between h-16 px-4 border-b border-slate-700">
      <div v-if="!isCollapsed" class="flex items-center gap-3 min-w-0">
        <Shield class="w-8 h-8 text-blue-400 shrink-0" />
        <div class="min-w-0">
          <h1 class="font-bold text-base text-white">Admin Console</h1>
          <p class="text-xs text-slate-400">CV Analyzer</p>
        </div>
      </div>
      <Shield v-else class="w-8 h-8 text-blue-400 mx-auto shrink-0" />
      <button v-if="!isCollapsed" @click="toggleSidebar"
        class="p-1.5 hover:bg-slate-800 rounded-lg transition-colors shrink-0">
        <ChevronLeft class="w-4 h-4 text-slate-400" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="p-4 space-y-1">
      <div v-if="!isCollapsed" class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
        Quản lý
      </div>
      <router-link v-for="item in navItems" :key="item.path" :to="item.path" :class="[
        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm',
        isActive(item.path)
          ? 'bg-blue-600 text-white'
          : 'text-slate-300 hover:bg-slate-800'
      ]" :title="isCollapsed ? item.label : undefined">
        <component :is="item.icon" class="w-5 h-5 shrink-0" />
        <span v-if="!isCollapsed" class="truncate">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Footer -->
    <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 space-y-2">
      <div v-if="!isCollapsed" class="flex items-center gap-3 px-3 py-2">
        <BaseAvatar :name="userName" :src="userAvatar" size="sm" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-white truncate">{{ userName }}</p>
          <p class="text-xs text-slate-400 truncate">{{ userEmail }}</p>
        </div>
      </div>
      <button v-if="isCollapsed" @click="toggleSidebar"
        class="w-full p-2 hover:bg-slate-800 rounded-lg transition-colors flex justify-center">
        <ChevronRight class="w-4 h-4 text-slate-400" />
      </button>
      <button v-else @click="handleLogout"
        class="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-slate-800 rounded-lg transition-all text-sm">
        <LogOut class="w-4 h-4 shrink-0" />
        <span>Đăng xuất</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ChevronLeft, ChevronRight, LogOut,
  Users, ClipboardList, LayoutDashboard, Shield, BarChart3, UserCog
} from 'lucide-vue-next';
import { useAuth } from '@/composables/useAuth';
import BaseAvatar from '@/components/base/BaseAvatar.vue';

const route = useRoute();
const router = useRouter();
const { user, logout } = useAuth();
const isCollapsed = ref(false);

const toggleSidebar = () => { isCollapsed.value = !isCollapsed.value; };

const navItems = [
  { path: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Người dùng', icon: UserCog },
  { path: '/admin/candidates', label: 'Ứng viên', icon: Users },
  { path: '/admin/reports', label: 'Báo cáo', icon: BarChart3 },
  { path: '/admin/logs', label: 'Nhật ký', icon: ClipboardList },
];

const isActive = (path: string) => {
  if (path === '/admin') return route.path === '/admin';
  return route.path.startsWith(path);
};

const userName = computed(() => user.value?.name || user.value?.email || 'Admin');
const userEmail = computed(() => user.value?.email || '');
const userAvatar = computed(() => user.value?.avatar || null);

const handleLogout = async () => {
  await logout();
  router.push('/login');
};
</script>
