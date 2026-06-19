<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import { useLanguage } from '@/composables/useLanguage'
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Globe,
  Check
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { adminNotificationsApi } from '@/api/adminService'

const { t } = useI18n()
const { isDark, toggleTheme } = useTheme()
const { language, languages, setLanguage } = useLanguage()
const router = useRouter()

const searchQuery = ref('')
const notificationsOpen = ref(false)
const userMenuOpen = ref(false)
const languageMenuOpen = ref(false)

const unreadCount = ref(0)
const notifications = ref<Array<{ id: string; title: string; message: string; time: string; read: boolean }>>([])

const currentUser = ref({
  name: 'Admin User',
  email: 'admin@jobportal.com',
  avatar: null as string | null,
  role: 'Super Admin'
})

const toggleNotifications = () => {
  notificationsOpen.value = !notificationsOpen.value
  userMenuOpen.value = false
  languageMenuOpen.value = false
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
  notificationsOpen.value = false
  languageMenuOpen.value = false
}

const toggleLanguageMenu = () => {
  languageMenuOpen.value = !languageMenuOpen.value
  notificationsOpen.value = false
  userMenuOpen.value = false
}

const chooseLanguage = (code: 'vi' | 'en') => {
  setLanguage(code)
  languageMenuOpen.value = false
}

const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

const markAsRead = (id: string) => {
  const n = notifications.value.find((x) => x.id === id)
  if (n && !n.read) {
    n.read = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
    adminNotificationsApi.markAsRead(id).catch(() => {})
  }
}

const markAllAsRead = () => {
  notifications.value.forEach((n) => (n.read = true))
  unreadCount.value = 0
}

const formatRelativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return t('candidateModal.justNow')
  if (minutes < 60) return t('candidateModal.minutesAgo', { n: minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return t('candidateModal.hoursAgo', { n: hours })
  const days = Math.floor(hours / 24)
  return t('candidateModal.daysAgo', { n: days })
}

const loadNotifications = async () => {
  try {
    const res = await adminNotificationsApi.getAll({ page: 0, size: 10 })
    const data = res?.data?.data ?? res?.data
    const list = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : []
    notifications.value = list.map((n: any) => ({
      id: n.id,
      title: n.title ?? '',
      message: n.message ?? '',
      time: formatRelativeTime(n.createdAt ?? new Date().toISOString()),
      read: Boolean(n.isRead)
    }))
    unreadCount.value = notifications.value.filter((n) => !n.read).length
  } catch {
    /* ignore — header still renders */
  }
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.notification-container')) notificationsOpen.value = false
  if (!target.closest('.user-container')) userMenuOpen.value = false
  if (!target.closest('.language-container')) languageMenuOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  loadNotifications()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header
    class="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 transition-colors"
  >
    <div class="h-full px-4 md:px-6 flex items-center justify-between gap-3">
      <!-- Search -->
      <div class="flex-1 max-w-xl min-w-0">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="search"
            :placeholder="t('admin.header.searchPlaceholder')"
            class="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
          />
        </div>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-1.5">
        <!-- Language Switcher -->
        <div class="relative language-container">
          <button
            @click="toggleLanguageMenu"
            class="flex items-center gap-1.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            :title="t('admin.header.language')"
          >
            <Globe class="w-5 h-5" />
            <span class="hidden md:inline text-xs font-semibold uppercase tracking-wide">
              {{ language }}
            </span>
          </button>

          <div
            v-if="languageMenuOpen"
            class="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div class="px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {{ t('admin.header.language') }}
              </p>
            </div>
            <button
              v-for="lang in languages"
              :key="lang.code"
              @click="chooseLanguage(lang.code)"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              <span class="text-lg">{{ lang.flag }}</span>
              <span class="flex-1 text-left">{{ lang.name }}</span>
              <Check v-if="language === lang.code" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </button>
          </div>
        </div>

        <!-- Theme Toggle -->
        <button
          @click="toggleTheme"
          class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          :title="isDark() ? t('admin.header.lightMode') : t('admin.header.darkMode')"
        >
          <Sun v-if="isDark()" class="w-5 h-5" />
          <Moon v-else class="w-5 h-5" />
        </button>

        <!-- Notifications -->
        <div class="relative notification-container">
          <button
            @click="toggleNotifications"
            class="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            :title="t('admin.header.notifications')"
          >
            <Bell class="w-5 h-5" />
            <span
              v-if="unreadCount > 0"
              class="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>

          <div
            v-if="notificationsOpen"
            class="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 class="font-semibold text-slate-900 dark:text-white text-sm">
                {{ t('admin.header.notifications') }}
              </h3>
              <button
                v-if="unreadCount > 0"
                @click="markAllAsRead"
                class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {{ t('admin.header.markAllRead') }}
              </button>
            </div>
            <div class="max-h-80 overflow-y-auto">
              <div
                v-if="notifications.length === 0"
                class="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500"
              >
                {{ t('admin.header.noNotifications') }}
              </div>
              <div
                v-for="n in notifications"
                :key="n.id"
                :class="[
                  'px-4 py-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors',
                  !n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                ]"
                @click="markAsRead(n.id)"
              >
                <div class="flex items-start space-x-3">
                  <div :class="['w-2 h-2 rounded-full mt-2 shrink-0', n.read ? 'bg-slate-300 dark:bg-slate-600' : 'bg-blue-500']" />
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-sm text-slate-900 dark:text-white truncate">
                      {{ n.title }}
                    </p>
                    <p class="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {{ n.message }}
                    </p>
                    <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {{ n.time }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
              <router-link
                to="/admin/notifications"
                class="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                @click="notificationsOpen = false"
              >
                {{ t('admin.header.viewAllNotifications') }}
              </router-link>
            </div>
          </div>
        </div>

        <!-- User Menu -->
        <div class="relative user-container">
          <button
            @click="toggleUserMenu"
            class="flex items-center gap-2 p-1.5 pr-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {{ currentUser.name.charAt(0) }}
            </div>
            <div class="hidden md:block text-left min-w-0">
              <p class="text-sm font-medium text-slate-900 dark:text-white truncate">
                {{ currentUser.name }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                {{ currentUser.role }}
              </p>
            </div>
            <ChevronDown class="w-4 h-4 text-slate-400 hidden md:block shrink-0" />
          </button>

          <div
            v-if="userMenuOpen"
            class="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <p class="font-medium text-slate-900 dark:text-white truncate">
                {{ currentUser.name }}
              </p>
              <p class="text-sm text-slate-500 dark:text-slate-400 truncate">
                {{ currentUser.email }}
              </p>
            </div>
            <div class="py-1">
              <router-link
                to="/admin/profile"
                class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                @click="userMenuOpen = false"
              >
                <User class="w-4 h-4" />
                <span>{{ t('admin.header.profile') }}</span>
              </router-link>
              <router-link
                to="/admin/settings/general"
                class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                @click="userMenuOpen = false"
              >
                <Settings class="w-4 h-4" />
                <span>{{ t('admin.header.settings') }}</span>
              </router-link>
            </div>
            <div class="py-1 border-t border-slate-200 dark:border-slate-700">
              <button
                @click="handleLogout"
                class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut class="w-4 h-4" />
                <span>{{ t('admin.header.logout') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
