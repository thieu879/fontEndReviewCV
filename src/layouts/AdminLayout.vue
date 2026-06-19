<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import { useLanguage } from '@/composables/useLanguage'
import {
  LayoutDashboard,
  Users,
  UserCog,
  Briefcase,
  Bot,
  FileText,
  BarChart3,
  Settings,
  Bell,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Activity,
  Globe,
  FileSearch,
  MessageSquare,
  Layers,
  Sun,
  Moon
} from 'lucide-vue-next'

const router = useRouter()
const { t } = useI18n()
const { isDark, toggleTheme } = useTheme()
const { language, languages, setLanguage } = useLanguage()

const isCollapsed = ref(false)
const isMobileOpen = ref(false)
const activeDropdown = ref<string | null>(null)
const langMenuOpen = ref(false)

interface MenuItem {
  id: string
  label: string
  icon: any
  path?: string
  badge?: number | string
  children?: MenuItem[]
  permission?: string
}

const mainMenu = computed<MenuItem[]>(() => [
  { id: 'dashboard', label: t('admin.menu.dashboard'), icon: LayoutDashboard, path: '/admin' },
  { id: 'users', label: t('admin.menu.users'), icon: Users, path: '/admin/users' },
  { id: 'jobs', label: t('admin.menu.jobs'), icon: FileText, path: '/admin/jobs' },
  {
    id: 'scraping',
    label: t('admin.menu.scraping'),
    icon: Globe,
    children: [
      { id: 'scraping-sources', label: t('admin.menu.scrapingSources'), icon: Globe, path: '/admin/scraping/sources' },
      { id: 'scraping-logs', label: t('admin.menu.scrapingLogs'), icon: FileSearch, path: '/admin/scraping/logs' }
    ]
  },
  {
    id: 'ai',
    label: t('admin.menu.ai'),
    icon: Bot,
    children: [
      { id: 'ai-config', label: t('admin.menu.aiConfig'), icon: Settings, path: '/admin/ai/config' },
      { id: 'ai-usage', label: t('admin.menu.aiUsage'), icon: Activity, path: '/admin/ai/usage' }
    ]
  },
  { id: 'applications', label: t('admin.menu.applications'), icon: Layers, path: '/admin/applications' },
  {
    id: 'content',
    label: t('admin.menu.content'),
    icon: FileText,
    children: [
      { id: 'content-blocks', label: t('admin.menu.contentBlocks'), icon: FileText, path: '/admin/content' },
      { id: 'announcements', label: t('admin.menu.announcements'), icon: Bell, path: '/admin/announcements' }
    ]
  },
  { id: 'reports', label: t('admin.menu.reports'), icon: BarChart3, path: '/admin/reports' },
  { id: 'notifications', label: t('admin.menu.notifications'), icon: Bell, path: '/admin/notifications' }
])

const systemMenu = computed<MenuItem[]>(() => [
  { id: 'audit', label: t('admin.menu.auditLogs'), icon: Shield, path: '/admin/audit' },
])

const currentUser = ref({
  name: 'Admin User',
  email: 'admin@jobportal.com',
  avatar: null as string | null,
  role: 'Super Admin'
})

const userMenuOpen = ref(false)

const toggleDropdown = (id: string) => {
  activeDropdown.value = activeDropdown.value === id ? null : id
}

const toggleMobileMenu = () => {
  isMobileOpen.value = !isMobileOpen.value
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
  langMenuOpen.value = false
}

const toggleLangMenu = () => {
  langMenuOpen.value = !langMenuOpen.value
  userMenuOpen.value = false
}

const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

const isActiveRoute = (path: string) => router.currentRoute.value.path === path

const isParentActive = (item: MenuItem) =>
  item.children?.some((c) => c.path && router.currentRoute.value.path.startsWith(c.path)) ?? false

const handleResize = () => {
  if (window.innerWidth < 1024) isCollapsed.value = true
  else isCollapsed.value = false
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.admin-user-menu')) userMenuOpen.value = false
  if (!target.closest('.admin-lang-menu')) langMenuOpen.value = false
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
    <!-- Mobile Header -->
    <header
      class="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 z-50 flex items-center px-4 transition-colors"
    >
      <button
        @click="toggleMobileMenu"
        class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
      >
        <Menu v-if="!isMobileOpen" class="w-6 h-6" />
        <X v-else class="w-6 h-6" />
      </button>
      <span class="ml-4 font-semibold text-lg text-slate-900 dark:text-white">
        {{ t('admin.title') }}
      </span>
    </header>

    <!-- Sidebar Overlay (Mobile) -->
    <div
      v-if="isMobileOpen"
      class="lg:hidden fixed inset-0 bg-black/50 z-40"
      @click="toggleMobileMenu"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 z-50 transition-all duration-300 flex flex-col',
        isCollapsed ? 'w-20' : 'w-72',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shrink-0">
            <span class="text-white font-bold text-xl">J</span>
          </div>
          <span v-if="!isCollapsed" class="font-bold text-lg text-slate-900 dark:text-white truncate">
            {{ t('admin.title') }}
          </span>
        </div>
        <button
          @click="isCollapsed = !isCollapsed"
          class="hidden lg:block p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0"
          :title="isCollapsed ? t('admin.menu.expand') : t('admin.menu.collapse')"
        >
          <Menu class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <template v-for="item in mainMenu" :key="item.id">
          <div v-if="item.children" class="space-y-1">
            <button
              @click="toggleDropdown(item.id)"
              :class="[
                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors text-sm',
                isParentActive(item) || activeDropdown === item.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              ]"
            >
              <div class="flex items-center gap-3 min-w-0">
                <component :is="item.icon" class="w-5 h-5 shrink-0" />
                <span v-if="!isCollapsed" class="font-medium truncate">{{ item.label }}</span>
              </div>
              <ChevronDown
                v-if="!isCollapsed"
                :class="['w-4 h-4 shrink-0 transition-transform', activeDropdown === item.id || isParentActive(item) ? 'rotate-180' : '']"
              />
            </button>
            <div
              v-if="(activeDropdown === item.id || isParentActive(item)) && !isCollapsed"
              class="ml-8 space-y-1"
            >
              <router-link
                v-for="child in item.children"
                :key="child.id"
                :to="child.path ?? ''"
                :class="[
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActiveRoute(child.path || '')
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                ]"
                @click="isMobileOpen = false"
              >
                <component :is="child.icon" class="w-4 h-4 shrink-0" />
                <span class="truncate">{{ child.label }}</span>
              </router-link>
            </div>
          </div>
          <router-link
            v-else
            :to="item.path ?? ''"
            :class="[
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm',
              isActiveRoute(item.path || '')
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            ]"
            @click="isMobileOpen = false"
          >
            <component :is="item.icon" class="w-5 h-5 shrink-0" />
            <span v-if="!isCollapsed" class="font-medium truncate">{{ item.label }}</span>
            <span
              v-if="item.badge && !isCollapsed"
              class="ml-auto px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-full"
            >
              {{ item.badge }}
            </span>
          </router-link>
        </template>

        <!-- System Menu Divider -->
        <div class="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
          <span
            v-if="!isCollapsed"
            class="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
          >
            {{ t('admin.menu.system') }}
          </span>
        </div>

        <template v-for="item in systemMenu" :key="item.id">
          <div v-if="item.children" class="space-y-1">
            <button
              @click="toggleDropdown(item.id)"
              :class="[
                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors text-sm',
                isParentActive(item) || activeDropdown === item.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              ]"
            >
              <div class="flex items-center gap-3 min-w-0">
                <component :is="item.icon" class="w-5 h-5 shrink-0" />
                <span v-if="!isCollapsed" class="font-medium truncate">{{ item.label }}</span>
              </div>
              <ChevronDown
                v-if="!isCollapsed"
                :class="['w-4 h-4 shrink-0 transition-transform', activeDropdown === item.id || isParentActive(item) ? 'rotate-180' : '']"
              />
            </button>
            <div
              v-if="(activeDropdown === item.id || isParentActive(item)) && !isCollapsed"
              class="ml-8 space-y-1"
            >
              <router-link
                v-for="child in item.children"
                :key="child.id"
                :to="child.path ?? ''"
                :class="[
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActiveRoute(child.path || '')
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                ]"
                @click="isMobileOpen = false"
              >
                <component :is="child.icon" class="w-4 h-4 shrink-0" />
                <span class="truncate">{{ child.label }}</span>
              </router-link>
            </div>
          </div>
          <router-link
            v-else
            :to="item.path ?? ''"
            :class="[
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm',
              isActiveRoute(item.path || '')
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            ]"
            @click="isMobileOpen = false"
          >
            <component :is="item.icon" class="w-5 h-5 shrink-0" />
            <span v-if="!isCollapsed" class="font-medium truncate">{{ item.label }}</span>
          </router-link>
        </template>
      </nav>

      <!-- User Profile -->
      <div class="p-3 border-t border-slate-200 dark:border-slate-700 shrink-0 space-y-2">
        <!-- Theme & Language quick toggles -->
        <div v-if="!isCollapsed" class="grid grid-cols-2 gap-2">
          <button
            @click="toggleTheme"
            class="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs"
            :title="isDark() ? t('admin.header.lightMode') : t('admin.header.darkMode')"
          >
            <Sun v-if="isDark()" class="w-3.5 h-3.5" />
            <Moon v-else class="w-3.5 h-3.5" />
            <span class="font-medium">{{ isDark() ? 'Light' : 'Dark' }}</span>
          </button>
          <div class="relative admin-lang-menu">
            <button
              @click="toggleLangMenu"
              class="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs"
              :title="t('admin.header.language')"
            >
              <Globe class="w-3.5 h-3.5" />
              <span class="font-medium uppercase">{{ language }}</span>
            </button>
            <div
              v-if="langMenuOpen"
              class="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <button
                v-for="lang in languages"
                :key="lang.code"
                @click="setLanguage(lang.code); langMenuOpen = false"
                :class="[
                  'w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors',
                  language === lang.code
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-300'
                ]"
              >
                <span>{{ lang.flag }}</span>
                <span class="flex-1 text-left">{{ lang.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="relative admin-user-menu">
          <button
            @click="toggleUserMenu"
            class="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shrink-0">
              {{ currentUser.name.charAt(0) }}
            </div>
            <div v-if="!isCollapsed" class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-900 dark:text-white truncate">
                {{ currentUser.name }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                {{ currentUser.role }}
              </p>
            </div>
            <button
              v-if="!isCollapsed"
              @click.stop="handleLogout"
              class="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 shrink-0"
              :title="t('admin.menu.logout')"
            >
              <LogOut class="w-4 h-4" />
            </button>
          </button>

          <div
            v-if="userMenuOpen && !isCollapsed"
            class="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <button
              @click="handleLogout"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut class="w-4 h-4" />
              <span>{{ t('admin.menu.logout') }}</span>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main
      :class="[
        'min-h-screen transition-all duration-300 pt-16 lg:pt-0',
        isCollapsed ? 'lg:ml-20' : 'lg:ml-72'
      ]"
    >
      <slot />
    </main>
  </div>
</template>
