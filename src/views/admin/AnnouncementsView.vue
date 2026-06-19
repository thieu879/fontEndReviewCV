<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Plus, Edit, Trash2, Bell,
  AlertCircle, Check,
  RefreshCw, Power
} from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminHeader from '@/components/sidebar/AdminHeader.vue'
import AdminTable from '@/components/base/AdminTable.vue'
import AdminBadge from '@/components/base/AdminBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { adminAnnouncementsApi } from '@/api/adminService'

const { t } = useI18n()

interface Announcement {
  id: string
  title: string
  content: string
  type: string
  priority: string
  isActive: boolean
  sendEmail: boolean
  sendPush: boolean
  scheduledAt?: string
  expiresAt?: string
  createdAt: string
  viewCount?: number
}

const searchQuery = ref('')
const announcements = ref<Announcement[]>([])
const totalElements = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const isLoading = ref(false)
const error = ref('')
const success = ref('')
const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const selected = ref<Announcement | null>(null)
const saving = ref(false)

const form = ref({
  title: '',
  content: '',
  type: 'INFO',
  priority: 'NORMAL',
  sendEmail: false,
  sendPush: false,
  scheduledAt: '',
  expiresAt: ''
})

const columns = computed(() => [
  { key: 'title', label: t('admin.announcements.titleField') },
  { key: 'type', label: t('admin.announcements.type'), hideOn: 'sm' as const },
  { key: 'priority', label: t('admin.announcements.priority') },
  { key: 'status', label: t('admin.announcements.isActive') },
  { key: 'views', label: t('admin.announcements.viewCount'), hideOn: 'md' as const },
  { key: 'created', label: t('admin.announcements.createdAt'), hideOn: 'sm' as const },
  { key: 'actions', label: t('admin.announcements.actions'), align: 'right' as const }
])

const fetchList = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const res = await adminAnnouncementsApi.getAll({
      page: currentPage.value - 1,
      size: pageSize.value
    })
    if (res.data.success) {
      const data = res.data.data
      announcements.value = (data.content || []).map((a: any) => ({
        id: a.id,
        title: a.title || '',
        content: a.content || '',
        type: a.type || 'INFO',
        priority: a.priority || 'NORMAL',
        isActive: Boolean(a.isActive),
        sendEmail: Boolean(a.sendEmail),
        sendPush: Boolean(a.sendPush),
        scheduledAt: a.scheduledAt,
        expiresAt: a.expiresAt,
        createdAt: a.createdAt,
        viewCount: a.viewCount ?? 0
      }))
      totalElements.value = data.totalElements ?? announcements.value.length
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    isLoading.value = false
  }
}

const flash = (msg: string) => {
  success.value = msg
  setTimeout(() => (success.value = ''), 3000)
}

const openCreate = () => {
  selected.value = null
  form.value = {
    title: '',
    content: '',
    type: 'INFO',
    priority: 'NORMAL',
    sendEmail: false,
    sendPush: false,
    scheduledAt: '',
    expiresAt: ''
  }
  modalType.value = 'create'
  isModalOpen.value = true
}

const openEdit = (a: Announcement) => {
  selected.value = a
  form.value = {
    title: a.title,
    content: a.content,
    type: a.type,
    priority: String(a.priority),
    sendEmail: a.sendEmail,
    sendPush: a.sendPush,
    scheduledAt: a.scheduledAt?.slice(0, 16) || '',
    expiresAt: a.expiresAt?.slice(0, 16) || ''
  }
  modalType.value = 'edit'
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selected.value = null
}

const save = async () => {
  if (!form.value.title.trim() || !form.value.content.trim()) {
    error.value = t('validation.required')
    return
  }
  saving.value = true
  error.value = ''
  try {
    const payload: any = {
      title: form.value.title,
      content: form.value.content,
      type: form.value.type,
      priority: form.value.priority,
      sendEmail: form.value.sendEmail,
      sendPush: form.value.sendPush,
      scheduledAt: form.value.scheduledAt || null,
      expiresAt: form.value.expiresAt || null
    }
    const res = modalType.value === 'create'
      ? await adminAnnouncementsApi.create(payload)
      : await adminAnnouncementsApi.update(selected.value!.id, payload)
    if (res?.data?.success) {
      flash(t(modalType.value === 'create' ? 'admin.announcements.createSuccess' : 'admin.announcements.updateSuccess'))
      closeModal()
      fetchList()
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    saving.value = false
  }
}

const togglePublish = async (a: Announcement) => {
  try {
    await adminAnnouncementsApi.publish(a.id)
    flash(t(a.isActive ? 'admin.announcements.unpublishSuccess' : 'admin.announcements.publishSuccess'))
    fetchList()
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  }
}

const handleDelete = async (a: Announcement) => {
  if (!confirm(t('admin.announcements.deleteConfirm'))) return
  try {
    await adminAnnouncementsApi.delete(a.id)
    flash(t('admin.announcements.deleteSuccess'))
    fetchList()
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const handlePageChange = (p: number) => {
  currentPage.value = p
  fetchList()
}

const priorityVariant = (p: string) => {
  switch ((p || '').toUpperCase()) {
    case 'URGENT': return 'danger' as const
    case 'HIGH': return 'warning' as const
    case 'LOW': return 'neutral' as const
    default: return 'info' as const
  }
}

const formatDate = (iso?: string) => {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

const filtered = computed(() => {
  if (!searchQuery.value) return announcements.value
  const q = searchQuery.value.toLowerCase()
  return announcements.value.filter(
    (a) => (a.title || '').toLowerCase().includes(q) || (a.content || '').toLowerCase().includes(q)
  )
})

onMounted(fetchList)
</script>

<template>
  <AdminLayout>
    <AdminHeader />

    <div class="p-4 md:p-6">
      <div class="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {{ t('admin.announcements.title') }}
          </h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {{ t('admin.announcements.subtitle') }}
          </p>
        </div>
        <BaseButton variant="primary" @click="openCreate">
          <Plus class="w-4 h-4 mr-2" />
          {{ t('admin.announcements.createNew') }}
        </BaseButton>
      </div>

      <div v-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl flex items-center gap-2">
        <AlertCircle class="w-5 h-5 text-red-500 shrink-0" />
        <span class="text-red-700 dark:text-red-400 text-sm">{{ error }}</span>
      </div>
      <div v-if="success" class="mb-4 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-xl flex items-center gap-2">
        <Check class="w-5 h-5 text-green-500 shrink-0" />
        <span class="text-green-700 dark:text-green-400 text-sm">{{ success }}</span>
      </div>

      <AdminTable
        :items="filtered"
        :columns="columns"
        :is-loading="isLoading"
        :search-placeholder="t('admin.announcements.titleField')"
        v-model:search-model-value="searchQuery"
        :total-elements="totalElements"
        :page="currentPage"
        :page-size="pageSize"
        :empty-title="t('admin.announcements.noAnnouncements')"
        @search="handleSearch"
        @page-change="handlePageChange"
      >
        <template #toolbar>
          <BaseButton variant="secondary" @click="fetchList">
            <RefreshCw class="w-4 h-4" />
          </BaseButton>
        </template>

        <template #rows="{ items }">
          <tr v-for="a in items" :key="a.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <Bell class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-slate-900 dark:text-white truncate">{{ a.title }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                    {{ a.content }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 hidden md:table-cell">
              <AdminBadge :variant="'info'" :label="t(`admin.announcements.types.${a.type}`, a.type)" />
            </td>
            <td class="px-4 py-3">
              <AdminBadge :variant="priorityVariant(a.priority)" :label="t(`admin.announcements.priorities.${a.priority}`, a.priority)" />
            </td>
            <td class="px-4 py-3">
              <AdminBadge
                :variant="a.isActive ? 'success' : 'neutral'"
                :label="a.isActive ? t('admin.common.active') : t('admin.common.inactive')"
                :dot="true"
              />
            </td>
            <td class="px-4 py-3 hidden lg:table-cell text-sm text-slate-700 dark:text-slate-300">
              {{ a.viewCount ?? 0 }}
            </td>
            <td class="px-4 py-3 hidden md:table-cell text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {{ formatDate(a.createdAt) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <button @click="openEdit(a)" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" :title="t('common.edit')">
                  <Edit class="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </button>
                <button @click="togglePublish(a)" class="p-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors" :title="a.isActive ? t('admin.announcements.unpublish') : t('admin.announcements.publish')">
                  <Power class="w-4 h-4 text-blue-500" />
                </button>
                <button @click="handleDelete(a)" class="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors" :title="t('common.delete')">
                  <Trash2 class="w-4 h-4 text-red-500" />
                </button>
              </div>
            </td>
          </tr>
        </template>
      </AdminTable>
    </div>

    <BaseModal :is-open="isModalOpen" :title="modalType === 'create' ? t('admin.announcements.createNew') : t('admin.announcements.edit')" size="lg" @close="closeModal">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('admin.announcements.titleField') }}</label>
          <BaseInput v-model="form.title" type="text" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('admin.announcements.type') }}</label>
            <select v-model="form.type" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
              <option value="INFO">{{ t('admin.announcements.types.INFO') }}</option>
              <option value="MAINTENANCE">{{ t('admin.announcements.types.MAINTENANCE') }}</option>
              <option value="FEATURE">{{ t('admin.announcements.types.FEATURE') }}</option>
              <option value="POLICY">{{ t('admin.announcements.types.POLICY') }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('admin.announcements.priority') }}</label>
            <select v-model="form.priority" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
              <option value="LOW">{{ t('admin.announcements.priorities.LOW') }}</option>
              <option value="NORMAL">{{ t('admin.announcements.priorities.NORMAL') }}</option>
              <option value="HIGH">{{ t('admin.announcements.priorities.HIGH') }}</option>
              <option value="URGENT">{{ t('admin.announcements.priorities.URGENT') }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('admin.announcements.content') }}</label>
          <textarea v-model="form.content" rows="5" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('admin.announcements.scheduledAt') }}</label>
            <input v-model="form.scheduledAt" type="datetime-local" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('admin.announcements.expiresAt') }}</label>
            <input v-model="form.expiresAt" type="datetime-local" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
        </div>
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" v-model="form.sendEmail" class="rounded text-blue-600" />
            {{ t('admin.announcements.sendEmail') }}
          </label>
          <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" v-model="form.sendPush" class="rounded text-blue-600" />
            {{ t('admin.announcements.sendPush') }}
          </label>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="closeModal">{{ t('common.cancel') }}</BaseButton>
        <BaseButton variant="primary" @click="save" :disabled="saving">
          {{ t('common.save') }}
        </BaseButton>
      </template>
    </BaseModal>
  </AdminLayout>
</template>
