<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  AlertCircle, Check, FileText, Eye, Trash2, RefreshCw
} from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminHeader from '@/components/sidebar/AdminHeader.vue'
import AdminTable from '@/components/base/AdminTable.vue'
import AdminBadge from '@/components/base/AdminBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { adminNotificationsApi } from '@/api/adminService'

const { t } = useI18n()

interface NotificationItem {
  id: string
  userId?: string
  username?: string
  title: string
  message: string
  type?: string
  isRead?: boolean
  createdAt: string
}

const notifications = ref<NotificationItem[]>([])
const totalElements = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const filterRead = ref<'all' | 'unread' | 'read'>('all')
const isLoading = ref(false)
const error = ref('')
const success = ref('')

const isComposeOpen = ref(false)
const composeForm = ref({
  title: '',
  message: '',
  type: 'INFO',
  sendTo: 'all' as 'all' | 'role' | 'users',
  role: 'USER',
  userIds: ''
})
const sending = ref(false)

const columns = computed(() => [
  { key: 'title', label: t('admin.notifications.titleField') },
  { key: 'message', label: t('admin.notifications.message'), hideOn: 'md' as const },
  { key: 'type', label: t('admin.notifications.type'), hideOn: 'sm' as const },
  { key: 'status', label: t('admin.notifications.titleField') === 'Tiêu đề' ? 'Trạng thái' : 'Status' },
  { key: 'time', label: 'Time' },
  { key: 'actions', label: t('admin.notifications.titleField') === 'Tiêu đề' ? 'Hành động' : 'Actions', align: 'right' as const }
])

const fetchNotifications = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await adminNotificationsApi.getAll({
      page: currentPage.value - 1,
      size: pageSize.value
    })
    if (response.data.success) {
      const data = response.data.data
      notifications.value = (data.content || []).map((n: any) => ({
        id: n.id,
        userId: n.userId,
        username: n.username || n.user?.username,
        title: n.title || '',
        message: n.message || '',
        type: n.type || 'INFO',
        isRead: Boolean(n.isRead),
        createdAt: n.createdAt
      }))
      totalElements.value = data.totalElements ?? notifications.value.length
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    isLoading.value = false
  }
}

const filteredItems = computed(() => {
  let list = notifications.value
  if (filterRead.value === 'unread') list = list.filter((n) => !n.isRead)
  else if (filterRead.value === 'read') list = list.filter((n) => n.isRead)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (n) =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.message || '').toLowerCase().includes(q),
    )
  }
  return list
})

const openCompose = () => {
  composeForm.value = { title: '', message: '', type: 'INFO', sendTo: 'all', role: 'USER', userIds: '' }
  isComposeOpen.value = true
}

const closeCompose = () => {
  isComposeOpen.value = false
}

const sendNotification = async () => {
  if (!composeForm.value.title.trim() || !composeForm.value.message.trim()) {
    error.value = t('validation.required')
    return
  }
  sending.value = true
  error.value = ''
  try {
    const payload: any = {
      title: composeForm.value.title,
      message: composeForm.value.message,
      type: composeForm.value.type
    }
    let res
    if (composeForm.value.sendTo === 'all') {
      res = await adminNotificationsApi.sendBulk({ userIds: [], ...payload })
    } else if (composeForm.value.sendTo === 'role') {
      res = await adminNotificationsApi.sendToRole(composeForm.value.role, payload)
    } else {
      const ids = composeForm.value.userIds.split(',').map((s) => s.trim()).filter(Boolean)
      res = await adminNotificationsApi.sendBulk({ userIds: ids, ...payload })
    }
    if (res?.data?.success) {
      success.value = t('admin.notifications.sendSuccess')
      setTimeout(() => (success.value = ''), 3000)
      closeCompose()
      fetchNotifications()
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    sending.value = false
  }
}

const handleMarkRead = async (n: NotificationItem) => {
  try {
    await adminNotificationsApi.markAsRead(n.id)
    n.isRead = true
  } catch {
    /* ignore */
  }
}

const handleDelete = async (n: NotificationItem) => {
  if (!confirm(t('admin.notifications.deleteConfirm'))) return
  try {
    await adminNotificationsApi.delete(n.id)
    fetchNotifications()
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const handlePageChange = (p: number) => {
  currentPage.value = p
  fetchNotifications()
}

const typeVariant = (type?: string) => {
  switch ((type || '').toUpperCase()) {
    case 'SUCCESS': return 'success' as const
    case 'WARNING': return 'warning' as const
    case 'ERROR': return 'danger' as const
    case 'ANNOUNCEMENT': return 'primary' as const
    default: return 'info' as const
  }
}

const formatTime = (iso: string) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

onMounted(fetchNotifications)
</script>

<template>
  <AdminLayout>
    <AdminHeader />

    <div class="p-4 md:p-6">
      <div class="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {{ t('admin.notifications.title') }}
          </h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {{ t('admin.notifications.subtitle') }}
          </p>
        </div>
        <BaseButton variant="primary" @click="openCompose">
          <FileText class="w-4 h-4 mr-2" />
          {{ t('admin.notifications.sendNew') }}
        </BaseButton>
      </div>

      <div
        v-if="error"
        class="mb-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl flex items-center gap-2"
      >
        <AlertCircle class="w-5 h-5 text-red-500 shrink-0" />
        <span class="text-red-700 dark:text-red-400 text-sm">{{ error }}</span>
      </div>
      <div
        v-if="success"
        class="mb-4 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-xl flex items-center gap-2"
      >
        <Check class="w-5 h-5 text-green-500 shrink-0" />
        <span class="text-green-700 dark:text-green-400 text-sm">{{ success }}</span>
      </div>

      <AdminTable
        :items="filteredItems"
        :columns="columns"
        :is-loading="isLoading"
        :search-placeholder="t('admin.notifications.searchPlaceholder')"
        v-model:search-model-value="searchQuery"
        :total-elements="totalElements"
        :page="currentPage"
        :page-size="pageSize"
        :empty-title="t('admin.notifications.noNotifications')"
        @search="handleSearch"
        @page-change="handlePageChange"
      >
        <template #toolbar>
          <div class="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 text-xs">
            <button
              v-for="opt in [
                { v: 'all', l: t('admin.notifications.all') },
                { v: 'unread', l: t('admin.notifications.unread') },
                { v: 'read', l: t('admin.notifications.read') }
              ]"
              :key="opt.v"
              @click="filterRead = opt.v as any"
              :class="[
                'px-3 py-1.5 rounded-md font-medium transition-colors',
                filterRead === opt.v
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              ]"
            >
              {{ opt.l }}
            </button>
          </div>
          <BaseButton variant="secondary" @click="fetchNotifications">
            <RefreshCw class="w-4 h-4" />
          </BaseButton>
        </template>

        <template #rows="{ items }">
          <tr
            v-for="n in items"
            :key="n.id"
            :class="[
              'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors',
              !n.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
            ]"
          >
            <td class="px-4 py-3">
              <p class="font-medium text-slate-900 dark:text-white truncate">
                {{ n.title }}
              </p>
              <p v-if="n.username" class="text-xs text-slate-500 dark:text-slate-400">
                @{{ n.username }}
              </p>
            </td>
            <td class="px-4 py-3 hidden lg:table-cell text-sm text-slate-700 dark:text-slate-300 max-w-md truncate">
              {{ n.message }}
            </td>
            <td class="px-4 py-3 hidden md:table-cell">
              <AdminBadge :variant="typeVariant(n.type)" :label="t(`admin.notifications.types.${n.type ?? 'INFO'}`, n.type || 'INFO')" />
            </td>
            <td class="px-4 py-3">
              <span v-if="n.isRead" class="text-xs text-slate-400 dark:text-slate-500">
                {{ t('admin.notifications.read') }}
              </span>
              <span v-else class="text-xs font-medium text-blue-600 dark:text-blue-400">
                {{ t('admin.notifications.unread') }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {{ formatTime(n.createdAt) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <button
                  v-if="!n.isRead"
                  @click="handleMarkRead(n)"
                  class="p-2 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-colors"
                  :title="t('admin.notifications.markAsRead')"
                >
                  <Check class="w-4 h-4 text-green-500" />
                </button>
                <button
                  @click="handleDelete(n)"
                  class="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  :title="t('common.delete')"
                >
                  <Eye class="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </td>
          </tr>
        </template>
      </AdminTable>
    </div>

    <!-- Compose Modal -->
    <BaseModal :is-open="isComposeOpen" :title="t('admin.notifications.compose')" size="lg" @close="closeCompose">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {{ t('admin.notifications.titleField') }}
          </label>
          <input
            v-model="composeForm.title"
            type="text"
            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {{ t('admin.notifications.type') }}
          </label>
          <select
            v-model="composeForm.type"
            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="INFO">{{ t('admin.notifications.types.INFO') }}</option>
            <option value="SUCCESS">{{ t('admin.notifications.types.SUCCESS') }}</option>
            <option value="WARNING">{{ t('admin.notifications.types.WARNING') }}</option>
            <option value="ERROR">{{ t('admin.notifications.types.ERROR') }}</option>
            <option value="ANNOUNCEMENT">{{ t('admin.notifications.types.ANNOUNCEMENT') }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {{ t('admin.notifications.sendTo') }}
          </label>
          <select
            v-model="composeForm.sendTo"
            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{{ t('admin.notifications.sendToAll') }}</option>
            <option value="role">{{ t('admin.notifications.sendToRole') }}</option>
            <option value="users">{{ t('admin.notifications.sendToUsers') }}</option>
          </select>
        </div>

        <div v-if="composeForm.sendTo === 'role'">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {{ t('admin.notifications.selectRole') }}
          </label>
          <select
            v-model="composeForm.role"
            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USER">{{ t('admin.users.roles.USER') }}</option>
            <option value="RECRUITER">{{ t('admin.users.roles.RECRUITER') }}</option>
            <option value="CANDIDATE">{{ t('admin.users.roles.CANDIDATE') }}</option>
            <option value="ADMIN">{{ t('admin.users.roles.ADMIN') }}</option>
          </select>
        </div>

        <div v-if="composeForm.sendTo === 'users'">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {{ t('admin.notifications.selectUsers') }}
          </label>
          <textarea
            v-model="composeForm.userIds"
            rows="2"
            placeholder="user-id-1, user-id-2, ..."
            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {{ t('admin.notifications.message') }}
          </label>
          <textarea
            v-model="composeForm.message"
            rows="4"
            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="closeCompose">{{ t('common.cancel') }}</BaseButton>
        <BaseButton variant="primary" @click="sendNotification" :disabled="sending">
          {{ sending ? t('admin.notifications.sending') : t('admin.notifications.send') }}
        </BaseButton>
      </template>
    </BaseModal>
  </AdminLayout>
</template>
