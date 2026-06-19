<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Activity, AlertCircle, RefreshCw
} from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminHeader from '@/components/sidebar/AdminHeader.vue'
import AdminTable from '@/components/base/AdminTable.vue'
import AdminBadge from '@/components/base/AdminBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { adminAuditApi } from '@/api/adminService'

const { t } = useI18n()

interface AuditLog {
  id: string
  actorUsername?: string
  actorUserId?: string
  action: string
  targetId?: string
  targetType?: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
  isSuccess?: boolean
  oldData?: any
  newData?: any
}

const searchQuery = ref('')
const selectedAction = ref('')
const isLoading = ref(false)
const error = ref('')
const logs = ref<AuditLog[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalElements = ref(0)
const isModalOpen = ref(false)
const selectedLog = ref<AuditLog | null>(null)

const actionOptions = computed(() => [
  { value: '', label: t('admin.audit.allActions') },
  { value: 'LOGIN', label: t('admin.audit.actions.LOGIN') },
  { value: 'LOGOUT', label: t('admin.audit.actions.LOGOUT') },
  { value: 'CREATE', label: t('admin.audit.actions.CREATE') },
  { value: 'UPDATE', label: t('admin.audit.actions.UPDATE') },
  { value: 'DELETE', label: t('admin.audit.actions.DELETE') },
  { value: 'LOCK_USER', label: t('admin.audit.actions.LOCK_USER') },
  { value: 'UNLOCK_USER', label: t('admin.audit.actions.UNLOCK_USER') },
  { value: 'RESET_PASSWORD', label: t('admin.audit.actions.RESET_PASSWORD') }
])

const columns = computed(() => [
  { key: 'actor', label: t('admin.audit.actor') },
  { key: 'action', label: t('admin.audit.action') },
  { key: 'target', label: t('admin.audit.target'), hideOn: 'md' as const },
  { key: 'ip', label: t('admin.audit.ipAddress'), hideOn: 'sm' as const },
  { key: 'time', label: t('admin.audit.timestamp') },
  { key: 'status', label: t('admin.audit.details'), align: 'right' as const }
])

const fetchLogs = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await adminAuditApi.getAll({
      page: currentPage.value - 1,
      size: pageSize.value,
      action: selectedAction.value || undefined
    })
    if (response.data.success) {
      const data = response.data.data
      logs.value = (data.content || []).map((l: any) => ({
        id: l.id,
        actorUsername: l.actorUsername,
        action: l.action,
        targetId: l.targetId,
        targetType: l.targetType,
        ipAddress: l.ipAddress,
        userAgent: l.userAgent,
        createdAt: l.createdAt,
        isSuccess: l.isSuccess ?? true,
        oldData: l.oldData,
        newData: l.newData
      }))
      totalElements.value = data.totalElements ?? logs.value.length
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchLogs()
}

const handlePageChange = (p: number) => {
  currentPage.value = p
  fetchLogs()
}

const openViewModal = (l: AuditLog) => {
  selectedLog.value = l
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedLog.value = null
}

const formatTime = (iso: string) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

const statusVariant = (l: AuditLog) => {
  return (l.isSuccess ? 'success' : 'danger') as 'success' | 'danger'
}

const filteredLogs = computed(() => {
  if (!searchQuery.value) return logs.value
  const q = searchQuery.value.toLowerCase()
  return logs.value.filter(
    (l) =>
      (l.actorUsername ?? '').toLowerCase().includes(q) ||
      (l.action ?? '').toLowerCase().includes(q) ||
      (l.targetId ?? '').toLowerCase().includes(q),
  )
})

onMounted(fetchLogs)
</script>

<template>
  <AdminLayout>
    <AdminHeader />

    <div class="p-4 md:p-6">
      <div class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          {{ t('admin.audit.title') }}
        </h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          {{ t('admin.audit.subtitle') }}
        </p>
      </div>

      <div
        v-if="error"
        class="mb-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl flex items-center gap-2"
      >
        <AlertCircle class="w-5 h-5 text-red-500 shrink-0" />
        <span class="text-red-700 dark:text-red-400 text-sm">{{ error }}</span>
      </div>

      <AdminTable
        :items="filteredLogs"
        :columns="columns"
        :is-loading="isLoading"
        :search-placeholder="t('admin.audit.searchPlaceholder')"
        v-model:search-model-value="searchQuery"
        :total-elements="totalElements"
        :page="currentPage"
        :page-size="pageSize"
        :empty-title="t('admin.audit.noLogs')"
        @search="handleSearch"
        @page-change="handlePageChange"
      >
        <template #toolbar>
          <select
            v-model="selectedAction"
            @change="handleSearch"
            class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option v-for="a in actionOptions" :key="a.value" :value="a.value">{{ a.label }}</option>
          </select>
          <BaseButton variant="secondary" @click="fetchLogs">
            <RefreshCw class="w-4 h-4" />
          </BaseButton>
        </template>

        <template #rows="{ items }">
          <tr
            v-for="l in items"
            :key="l.id"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <Activity class="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
                <span class="text-sm font-medium text-slate-900 dark:text-white">
                  {{ l.actorUsername || '—' }}
                </span>
              </div>
            </td>
            <td class="px-4 py-3">
              <code class="text-xs font-mono px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                {{ l.action }}
              </code>
            </td>
            <td class="px-4 py-3 hidden lg:table-cell text-sm text-slate-700 dark:text-slate-300">
              {{ l.targetType }}: {{ l.targetId || '—' }}
            </td>
            <td class="px-4 py-3 hidden md:table-cell text-xs text-slate-500 dark:text-slate-400 font-mono">
              {{ l.ipAddress || '—' }}
            </td>
            <td class="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {{ formatTime(l.createdAt) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-2">
                <AdminBadge :variant="statusVariant(l)" :label="l.isSuccess ? t('admin.common.success') : t('admin.common.error')" :dot="true" />
                <button
                  @click="openViewModal(l)"
                  class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  :title="t('admin.audit.viewDetails')"
                >
                  <Eye class="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </button>
              </div>
            </td>
          </tr>
        </template>
      </AdminTable>
    </div>

    <BaseModal :is-open="isModalOpen" :title="t('admin.audit.details')" @close="closeModal">
      <div v-if="selectedLog" class="space-y-3">
        <dl class="grid grid-cols-2 gap-3">
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.audit.username') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white">{{ selectedLog.actorUsername || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.audit.action') }}</dt>
            <dd><code class="text-xs font-mono px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">{{ selectedLog.action }}</code></dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.audit.targetType') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white">{{ selectedLog.targetType || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.audit.target') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white">{{ selectedLog.targetId || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.audit.ipAddress') }}</dt>
            <dd class="text-xs font-mono text-slate-900 dark:text-white">{{ selectedLog.ipAddress || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.audit.timestamp') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white">{{ formatTime(selectedLog.createdAt) }}</dd>
          </div>
        </dl>
        <div v-if="selectedLog.userAgent">
          <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.audit.userAgent') }}</dt>
          <dd class="text-xs font-mono text-slate-900 dark:text-white break-all">{{ selectedLog.userAgent }}</dd>
        </div>
        <div v-if="selectedLog.oldData || selectedLog.newData" class="grid md:grid-cols-2 gap-3">
          <div v-if="selectedLog.oldData">
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Old data</p>
            <pre class="text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 rounded overflow-auto">{{ JSON.stringify(selectedLog.oldData, null, 2) }}</pre>
          </div>
          <div v-if="selectedLog.newData">
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">New data</p>
            <pre class="text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 rounded overflow-auto">{{ JSON.stringify(selectedLog.newData, null, 2) }}</pre>
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="closeModal">{{ t('common.close') }}</BaseButton>
      </template>
    </BaseModal>
  </AdminLayout>
</template>
