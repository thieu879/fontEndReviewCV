<template>
  <div class="min-h-screen bg-[var(--bg-secondary)]">
    <Sidebar />
    <div class="transition-all duration-300 ease-in-out" :class="sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'">
      <!-- Header -->
      <header class="h-16 flex items-center px-6 gap-5 sticky top-0 z-30 backdrop-blur-md" :class="[
        'bg-[var(--header-bg)]/95 border-b',
        'border-[var(--header-border)]',
        'shadow-sm'
      ]">
        <!-- Page title area -->
        <div class="flex-1">
          <h2 class="text-[15px] font-semibold text-[var(--text-primary)] leading-tight">{{ pageTitle }}</h2>
          <p class="text-xs text-[var(--text-muted)] mt-0.5">{{ pageSubtitle }}</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <!-- Quick search trigger -->
          <button
            class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all"
            @click="showSearch = true">
            <Search class="w-4 h-4" />
            <span class="hidden sm:inline font-medium">Search</span>
            <kbd
              class="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono bg-[var(--bg-tertiary)] rounded border border-[var(--border-primary)] text-[var(--text-muted)]">
              <span class="text-[10px]">Ctrl</span>
              <span>K</span>
            </kbd>
          </button>

          <!-- Notifications -->
          <button
            class="relative w-9 h-9 flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all"
            :title="t('header.notifications')">
            <Bell class="w-[18px] h-[18px]" />
            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[var(--header-bg)]" />
          </button>

          <!-- Theme toggle -->
          <button @click="toggleTheme"
            class="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all"
            :title="theme === 'dark' ? t('header.lightMode') : t('header.darkMode')">
            <Sun v-if="theme === 'dark'" class="w-[18px] h-[18px]" />
            <Moon v-else class="w-[18px] h-[18px]" />
          </button>

          <!-- Divider -->
          <div class="w-px h-6 bg-[var(--border-primary)] mx-1" />

          <!-- User profile -->
          <router-link to="/profile"
            class="flex items-center gap-3 pl-1 pr-3 py-1.5 rounded-xl hover:bg-[var(--bg-hover)] transition-all group">
            <BaseAvatar :name="userName" :src="userAvatar" size="sm" status="online" />
            <div class="hidden sm:block text-right">
              <p
                class="text-[13px] font-semibold text-[var(--text-primary)] leading-tight group-hover:text-blue-500 transition-colors">
                {{ userName }}</p>
              <p class="text-[11px] text-[var(--header-text-sub)] leading-tight">{{ userRoleText }}</p>
            </div>
            <ChevronDown class="w-4 h-4 text-[var(--text-muted)] hidden sm:block" />
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
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Bell, Search, Sun, Moon, ChevronDown } from 'lucide-vue-next';
import { useAuth } from '@/composables/useAuth';
import { useTheme } from '@/composables/useTheme';
import { useI18n } from 'vue-i18n';
import Sidebar from '@/components/sidebar/Sidebar.vue';
import BaseAvatar from '@/components/base/BaseAvatar.vue';
import { ROLE_DISPLAY } from '@/constants';

const route = useRoute();
const { t } = useI18n();
const { user, checkAuth } = useAuth();
const { theme, toggleTheme } = useTheme();

const showSearch = ref(false);

// Detect sidebar collapsed state by watching localStorage
const sidebarCollapsed = computed(() => {
  // Sync with sidebar's collapsed state — since it's a child component,
  // we use a simple approach: the sidebar toggles a class on a known element
  const sidebar = document.querySelector('aside');
  if (!sidebar) return false;
  return sidebar.classList.contains('w-[72px]') || sidebar.classList.contains('w-20');
});

const userName = computed(() => {
  return user.value?.name || user.value?.username || user.value?.email || 'Guest';
});

const userRoleText = computed(() => {
  const role = user.value?.role || '';
  return ROLE_DISPLAY[role as keyof typeof ROLE_DISPLAY] || 'User';
});

const userAvatar = computed(() => {
  return user.value?.avatar || null;
});

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    '/dashboard': t('nav.dashboard'),
    '/upload': t('nav.upload'),
    '/mycvs': t('nav.myCvs'),
    '/analysis': t('nav.analysis'),
    '/search': t('nav.search'),
    '/shortlist': t('nav.shortlist'),
    '/profile': t('nav.profile'),
    '/settings': t('nav.settings'),
  };
  return map[route.path] || 'Dashboard';
});

const pageSubtitle = computed(() => {
  const now = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  return now.charAt(0).toUpperCase() + now.slice(1);
});

onMounted(async () => {
  await checkAuth();
});
</script>
