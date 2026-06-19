<template>
  <aside :class="[
    'shrink-0 transition-all duration-300 flex flex-col',
      isDrawer
        ? 'fixed top-0 left-0 h-full z-50 w-64 translate-x-0'
        : 'lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 -translate-x-full lg:translate-x-0',
    isCollapsed ? 'lg:w-20 w-64' : 'w-64',
    isDarkSidebar ? 'bg-slate-900 text-white border-r border-slate-700' : 'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700'
  ]">
    <!-- Logo -->
    <div :class="[
      'flex items-center justify-between h-16 px-4 shrink-0',
      isDarkSidebar ? 'border-b border-slate-700' : 'border-b border-slate-200 dark:border-slate-700'
    ]">
      <div v-if="!isCollapsed" class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shrink-0">
          <span class="text-white font-bold text-xl">J</span>
        </div>
        <span :class="['font-bold text-lg truncate', isDarkSidebar ? 'text-white' : 'text-slate-900 dark:text-white']">
          {{ sidebarTitle }}
        </span>
      </div>
      <div v-else class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mx-auto shrink-0">
        <span class="text-white font-bold text-xl">J</span>
      </div>
      <button
        v-if="!isCollapsed && !hideToggle"
        @click="toggleSidebar"
        :class="[
          'p-2 rounded-lg transition-colors shrink-0',
          isDarkSidebar
            ? 'hover:bg-slate-800 text-slate-400'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
        ]"
        :title="isCollapsed ? t('admin.menu.expand') : t('admin.menu.collapse')"
      >
        <MenuCollapse class="w-5 h-5" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      <!-- Simple link (no children) -->
      <router-link
        v-for="item in menuItems.filter(i => !i.children)"
        :key="item.id"
        :to="item.path ?? ''"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm',
          isActiveRoute(item.path || '')
            ? (isDarkSidebar ? 'bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400')
            : (isDarkSidebar ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60')
        ]"
        @click="emit('item-click')"
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

      <!-- Dropdown parent items -->
      <div v-for="item in menuItems.filter(i => !!i.children)" :key="item.id" class="space-y-1">
        <button
          @click="toggleDropdown(item.id)"
          :class="[
            'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors text-sm',
            isParentActive(item) || activeDropdown === item.id
              ? (isDarkSidebar ? 'bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400')
              : (isDarkSidebar ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60')
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
                ? (isDarkSidebar ? 'bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400')
                : (isDarkSidebar ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60')
            ]"
            @click="emit('item-click')"
          >
            <component :is="child.icon" class="w-4 h-4 shrink-0" />
            <span class="truncate">{{ child.label }}</span>
          </router-link>
        </div>
      </div>

      <!-- System Divider -->
      <div :class="['pt-4 mt-4 border-t', isDarkSidebar ? 'border-slate-700' : 'border-slate-200 dark:border-slate-700']">
        <span
          v-if="!isCollapsed"
          :class="['text-[11px] font-semibold uppercase tracking-wider', isDarkSidebar ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500']"
        >
          {{ t('admin.menu.system') }}
        </span>
      </div>

      <!-- Simple system link -->
      <router-link
        v-for="item in systemMenuItems.filter(i => !i.children)"
        :key="item.id"
        :to="item.path ?? ''"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm',
          isActiveRoute(item.path || '')
            ? (isDarkSidebar ? 'bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400')
            : (isDarkSidebar ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60')
        ]"
        @click="emit('item-click')"
      >
        <component :is="item.icon" class="w-5 h-5 shrink-0" />
        <span v-if="!isCollapsed" class="font-medium truncate">{{ item.label }}</span>
      </router-link>

      <!-- Dropdown system items -->
      <div v-for="item in systemMenuItems.filter(i => !!i.children)" :key="item.id" class="space-y-1">
        <button
          @click="toggleDropdown(item.id)"
          :class="[
            'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors text-sm',
            isParentActive(item) || activeDropdown === item.id
              ? (isDarkSidebar ? 'bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400')
              : (isDarkSidebar ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60')
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
                ? (isDarkSidebar ? 'bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400')
                : (isDarkSidebar ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60')
            ]"
            @click="emit('item-click')"
          >
            <component :is="child.icon" class="w-4 h-4 shrink-0" />
            <span class="truncate">{{ child.label }}</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Footer -->
    <div :class="[
      'p-3 shrink-0 space-y-2',
      isDarkSidebar ? 'border-t border-slate-700' : 'border-t border-slate-200 dark:border-slate-700'
    ]">
      <!-- Theme & Language toggles -->
      <div v-if="!isCollapsed" class="grid grid-cols-2 gap-2">
        <button
          @click="toggleTheme"
          :class="[
            'flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors text-xs',
            isDarkSidebar
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          ]"
          :title="isDark() ? t('admin.header.lightMode') : t('admin.header.darkMode')"
        >
          <Sun v-if="isDark()" class="w-3.5 h-3.5" />
          <Moon v-else class="w-3.5 h-3.5" />
          <span class="font-medium">{{ isDark() ? 'Light' : 'Dark' }}</span>
        </button>
        <div class="relative admin-lang-menu">
          <button
            @click="toggleLangMenu"
            :class="[
              'w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors text-xs',
              isDarkSidebar
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            ]"
            :title="t('admin.header.language')"
          >
            <Globe class="w-3.5 h-3.5" />
            <span class="font-medium uppercase">{{ language }}</span>
          </button>
          <div
            v-if="langMenuOpen"
            :class="[
              'absolute bottom-full mb-2 left-0 right-0 rounded-xl shadow-lg overflow-hidden z-50',
              isDarkSidebar ? 'bg-slate-800 border border-slate-700' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
            ]"
          >
            <button
              v-for="lang in languages"
              :key="lang.code"
              @click="setLanguage(lang.code); langMenuOpen = false"
              :class="[
                'w-full flex items-center gap-2 px-3 py-2 text-xs hover:opacity-80 transition-colors',
                language === lang.code
                  ? (isDarkSidebar ? 'text-blue-400' : 'text-blue-600 dark:text-blue-400')
                  : (isDarkSidebar ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300')
              ]"
            >
              <span>{{ lang.flag }}</span>
              <span class="flex-1 text-left">{{ lang.name }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- User Profile -->
      <div class="relative admin-user-menu">
        <button
          @click="toggleUserMenu"
          :class="[
            'w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left',
            isDarkSidebar ? 'hover:bg-slate-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
        >
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shrink-0">
            {{ userInitial }}
          </div>
          <div v-if="!isCollapsed" class="flex-1 min-w-0">
            <p :class="['text-sm font-medium truncate', isDarkSidebar ? 'text-white' : 'text-slate-900 dark:text-white']">
              {{ userName }}
            </p>
            <p :class="['text-xs truncate', isDarkSidebar ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400']">
              {{ userRole }}
            </p>
          </div>
          <button
            v-if="!isCollapsed"
            @click.stop="handleLogout"
            :class="[
              'p-2 rounded-lg shrink-0',
              isDarkSidebar
                ? 'hover:bg-slate-700 text-slate-400'
                : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
            ]"
            :title="t('admin.menu.logout')"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </button>

        <div
          v-if="userMenuOpen && !isCollapsed"
          :class="[
            'absolute bottom-full left-0 right-0 mb-2 rounded-xl shadow-lg overflow-hidden z-50',
            isDarkSidebar ? 'bg-slate-800 border border-slate-700' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
          ]"
        >
          <button
            @click="handleLogout"
            :class="[
              'w-full flex items-center gap-3 px-4 py-2.5 text-sm',
              isDarkSidebar ? 'text-red-400 hover:bg-slate-700' : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
            ]"
          >
            <LogOut class="w-4 h-4" />
            <span>{{ t('admin.menu.logout') }}</span>
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  LayoutDashboard, Users, UserCog, Briefcase, Bot, FileText,
  BarChart3, Settings, Bell, Shield, LogOut,
  ChevronDown, Activity, Globe, FileSearch, MessageSquare, Layers,
  Sun, Moon, Menu as MenuCollapse
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useTheme } from '@/composables/useTheme'
import { useLanguage } from '@/composables/useLanguage'

interface MenuItem {
  id: string
  label: string
  icon: any
  path?: string
  badge?: number | string
  children?: MenuItem[]
  permission?: string
}

const props = withDefaults(defineProps<{
  /** Dark sidebar background (slate-900). Default: false (white bg) */
  isDarkSidebar?: boolean
  /** Custom sidebar title text. Default: 'Admin Console' */
  sidebarTitle?: string
  /** Hide the collapse/expand toggle button */
  hideToggle?: boolean
  /** Override main menu items */
  menuItems?: MenuItem[]
  /** Override system menu items */
  systemMenuItems?: MenuItem[]
  /** Render as fixed mobile drawer (overlays content) */
  isDrawer?: boolean
}>(), {
  isDarkSidebar: false,
  sidebarTitle: 'Admin Console',
  hideToggle: false,
  isDrawer: false,
})

const emit = defineEmits<{
  /** Fired when a menu item is clicked (useful for closing mobile sidebar) */
  (e: 'item-click'): void
  /** Fired when sidebar is collapsed or expanded */
  (e: 'toggle'): void
}>()

const { t } = useI18n()
const router = useRouter()
const { user, logout } = useAuth()
const { isDark, toggleTheme } = useTheme()
const { language, languages, setLanguage } = useLanguage()

const isCollapsed = ref(false)
const activeDropdown = ref<string | null>(null)
const userMenuOpen = ref(false)
const langMenuOpen = ref(false)

// --- State & Handlers ---

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  emit('toggle')
}

const toggleDropdown = (id: string) => {
  activeDropdown.value = activeDropdown.value === id ? null : id
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
  logout().then(() => router.push('/login'))
}

const isActiveRoute = (path: string) => router.currentRoute.value.path === path

const isParentActive = (item: MenuItem) =>
  item.children?.some((c) => c.path && router.currentRoute.value.path.startsWith(c.path)) ?? false

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.admin-user-menu')) userMenuOpen.value = false
  if (!target.closest('.admin-lang-menu')) langMenuOpen.value = false
}

const handleResize = () => {
  if (window.innerWidth < 1024) isCollapsed.value = true
  else if (!props.hideToggle) isCollapsed.value = false
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

// --- User info ---

const userName = computed(() =>
  user.value?.name || user.value?.email || 'Admin'
)
const userRole = computed(() => user.value?.role || 'Super Admin')
const userInitial = computed(() => (userName.value).charAt(0).toUpperCase())

// --- Default menus ---

const defaultMainMenu = computed<MenuItem[]>(() => [
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
  // {
  //   id: 'content',
  //   label: t('admin.menu.content'),
  //   icon: FileText,
  //   children: [
  //     { id: 'content-blocks', label: t('admin.menu.contentBlocks'), icon: FileText, path: '/admin/content' },
  //     { id: 'announcements', label: t('admin.menu.announcements'), icon: Bell, path: '/admin/announcements' }
  //   ]
  // },
  { id: 'reports', label: t('admin.menu.reports'), icon: BarChart3, path: '/admin/reports' },
  { id: 'notifications', label: t('admin.menu.notifications'), icon: Bell, path: '/admin/notifications' }
])

const defaultSystemMenu = computed<MenuItem[]>(() => [
  { id: 'audit', label: t('admin.menu.auditLogs'), icon: Shield, path: '/admin/audit' },
])

const menuItems = computed(() => props.menuItems ?? defaultMainMenu.value)
const systemMenuItems = computed(() => props.systemMenuItems ?? defaultSystemMenu.value)
</script>
