<template>
  <aside :class="[
    'fixed left-0 top-0 h-full z-40 flex flex-col',
    'transition-all duration-300 ease-in-out',
    'bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]',
    isCollapsed ? 'w-[72px]' : 'w-[260px]'
  ]">
    <!-- Logo area -->
    <div class="flex items-center justify-between h-16 px-4 shrink-0" :class="isCollapsed ? 'justify-center px-3' : ''">
      <router-link to="/home" class="flex items-center gap-3 hover:opacity-80 transition-opacity rounded-xl"
        :class="isCollapsed ? 'justify-center' : ''">
        <!-- Logo mark -->
        <div
          class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
          <FileText class="w-4.5 h-4.5 text-white" />
        </div>
        <div v-if="!isCollapsed" class="min-w-0">
          <p class="font-bold text-[15px] text-[var(--text-primary)] leading-tight">CV Analyzer</p>
          <p class="text-[11px] text-[var(--sidebar-text)] font-medium">AI Powered</p>
        </div>
      </router-link>

      <button v-if="!isCollapsed" @click="toggleSidebar"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text-hover)] transition-all"
        :title="t('sidebar.collapse')">
        <ChevronLeft class="w-4 h-4" />
      </button>
      <button v-else @click="toggleSidebar"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text-hover)] transition-all"
        :title="t('sidebar.expand')">
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>

    <!-- User section -->
    <div class="mx-3 p-3 rounded-xl shrink-0" :class="[
      isCollapsed ? 'flex justify-center' : '',
      isCollapsed ? '' : 'bg-[var(--bg-tertiary)]'
    ]">
      <div v-if="!isCollapsed" class="flex items-center gap-3">
        <BaseAvatar :name="userName" :src="userAvatar" size="md" status="online" class="shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-[var(--text-primary)] truncate leading-tight">{{ userName }}</p>
          <p class="text-xs text-[var(--sidebar-text)] font-medium truncate mt-0.5">{{ userRole }}</p>
        </div>
      </div>
      <BaseAvatar v-else :name="userName" :src="userAvatar" size="md" status="online" />
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-2 overflow-y-auto no-scrollbar">
      <!-- Section label -->
      <div v-if="!isCollapsed" class="px-3 mb-2 mt-1">
        <p class="text-[10px] font-bold uppercase tracking-wider text-[var(--sidebar-text)] opacity-60">Menu</p>
      </div>

      <!-- Nav items -->
      <div class="space-y-0.5">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path"
          :title="isCollapsed ? item.label : undefined" :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative',
            isCollapsed ? 'justify-center w-full' : '',
            isActive(item.path)
              ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-text-active)]'
              : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text-hover)]'
          ]">
          <!-- Active indicator dot -->
          <span v-if="isActive(item.path)"
            class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-500 rounded-r-full" />

          <component :is="item.icon" :class="[
            'w-5 h-5 shrink-0 transition-colors',
            isActive(item.path) ? 'text-[var(--sidebar-icon-active)]' : 'text-[var(--sidebar-icon)] group-hover:text-[var(--sidebar-text-hover)]'
          ]" />
          <span v-if="!isCollapsed" class="truncate flex-1">{{ item.label }}</span>

          <!-- Active badge -->
          <span v-if="isActive(item.path) && !isCollapsed"
            class="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
        </router-link>
      </div>
    </nav>

    <!-- Bottom section -->
    <div class="shrink-0 px-3 py-3 border-t border-[var(--sidebar-border)] space-y-0.5">
      <!-- Language toggle -->
      <button :class="[
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group w-full',
        isCollapsed ? 'justify-center' : '',
        'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text-hover)]'
      ]" :title="isCollapsed ? (language === 'vi' ? 'Tiếng Việt' : 'English') : undefined" @click="toggleLanguage">
        <Globe :class="['w-5 h-5 shrink-0 text-[var(--sidebar-icon)] group-hover:text-[var(--sidebar-text-hover)]']" />
        <span v-if="!isCollapsed" class="truncate flex-1 text-left">{{ language === 'vi' ? 'Tiếng Việt' : 'English'
          }}</span>
      </button>

      <!-- Divider -->
      <div class="border-t border-[var(--sidebar-border)] my-1" />

      <!-- Logout -->
      <button :class="[
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group w-full',
        isCollapsed ? 'justify-center' : '',
        'text-red-400/70 hover:text-red-400 hover:bg-red-500/8'
      ]" :title="isCollapsed ? t('nav.logout') : undefined" @click="handleLogout">
        <LogOut class="w-5 h-5 shrink-0" />
        <span v-if="!isCollapsed" class="truncate flex-1 text-left">{{ t('nav.logout') }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  LayoutDashboard, Upload, FileText, BarChart3,
  Search, User, Settings, LogOut, ChevronLeft, ChevronRight,
  Globe, Bookmark
} from 'lucide-vue-next';
import { useAuth } from '@/composables/useAuth';
import { useLanguage } from '@/composables/useLanguage';
import { useI18n } from 'vue-i18n';
import { getRoleDisplayName } from '@/utils';
import { authService } from '@/api/authService';
import { store, setCredentials } from '@/store';
import { CloudinaryUrl } from '@/utils/imageUrlUtils';
import BaseAvatar from '@/components/base/BaseAvatar.vue';

const route = useRoute();
const { t } = useI18n();
const { user, checkAuth, logout } = useAuth();
const { language, toggleLanguage } = useLanguage();
const isCollapsed = ref(false);

const toggleSidebar = () => { isCollapsed.value = !isCollapsed.value; };

const navItems = computed(() => [
  { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
  { path: '/upload', label: t('nav.upload'), icon: Upload },
  { path: '/mycvs', label: t('nav.myCvs'), icon: FileText },
  { path: '/analysis', label: t('nav.analysis'), icon: BarChart3 },
  { path: '/search', label: t('nav.search'), icon: Search },
  { path: '/shortlist', label: t('nav.shortlist') || 'Shortlist', icon: Bookmark },
  { path: '/profile', label: t('nav.profile'), icon: User },
  { path: '/settings', label: t('nav.settings'), icon: Settings },
]);

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/');
};

const userName = computed(() => {
  return user.value?.name || user.value?.username || user.value?.email || 'Guest';
});

const userRole = computed(() => {
  if (!user.value) return '';
  return getRoleDisplayName(user.value.role || '');
});

const userAvatar = computed(() => {
  const avatar = user.value?.avatar || null;
  if (!avatar) return null;
  if (CloudinaryUrl.isCloudinary(avatar)) return CloudinaryUrl.thumbnail(avatar, 80);
  return avatar;
});

const handleLogout = async () => { await logout(); };

onMounted(async () => {
  await checkAuth();
  try {
    const response = await authService.getCurrentUser();
    if (response?.success && response.data) {
      const userData = response.data;
      const primaryRole = userData.primaryRole?.replace('ROLE_', '').toLowerCase() || 'user';
      store.dispatch(setCredentials({
        user: {
          id: userData.id,
          name: userData.profile?.fullName || userData.username || '',
          email: userData.email,
          avatar: userData.profile?.avatarUrl || undefined,
          role: primaryRole,
          roleNames: userData.roleNames,
          createdAt: userData.createdAt
        },
        token: store.getState().auth.token || ''
      }));
    }
  } catch (error) {
    console.error('Failed to fetch current user:', error);
  }
});
</script>
