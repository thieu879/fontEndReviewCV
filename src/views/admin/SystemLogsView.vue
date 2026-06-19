<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Download, Eye, AlertCircle, RefreshCw
} from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminHeader from '@/components/sidebar/AdminHeader.vue'
import AdminTable from '@/components/base/AdminTable.vue'
import AdminBadge from '@/components/base/AdminBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { adminAuditApi } from '@/api/adminService'

const { t } = useI18n()

interface SystemLog {
  id: string
  timestamp: string
  level: string
  action: string
  user?: string
  details?: string
}

const searchQuery = ref('')
const levelFilter = ref('')
const logs = ref<SystemLog[]>([])
const totalElements = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const isLoading = ref(false)
const error = ref('')
const isModalOpen = ref(false)
const selected = ref<SystemLog | null>(null)

const columns = computed(() => [
  { key: 'time', label: t('admin.audit.timestamp') },
  { key: 'level', label: 'Level' },
  { key: 'action', label: t('admin.audit.action') },
  { key: 'user', label: t('admin.audit.actor'), hideOn: 'sm' as const },
  { key: 'details', label: t('admin.audit.details'), hideOn: 'md' as const },
  { key: 'actions', label: t('admin.audit.actions'), align: 'right' as const }
])

const fetchLogs = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const res = await adminAuditApi.getAll({
      page: currentPage.value - 1,
      size: pageSize.value
    })
    if (res.data.success) {
      const data = res.data.data
      logs.value = (data.content || []).map((l: any) => ({
        id: l.id,
        timestamp: l.createdAt,
        level: (l.level || l.action?.includes('FAIL') ? 'error' : 'info').toLowerCase(),
        action: l.action || '',
        user: l.actorUsername,
        details: l.userAgent || `${l.action || ''} on ${l.targetType || ''}`
      }))
      totalElements.value = data.totalElements ?? logs.value.length
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => { currentPage.value = 1; fetchLogs() }
const handlePageChange = (p: number) => { currentPage.value = p; fetchLogs() }

const filtered = computed(() => {
  let list = logs.value
  if (levelFilter.value) list = list.filter((l) => l.level === levelFilter.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (l) =>
        (l.action || '').toLowerCase().includes(q) ||
        (l.user || '').toLowerCase().includes(q) ||
        (l.details || '').toLowerCase().includes(q)
    )
  }
  return list
})

const levelVariant = (l: string) => {
  switch (l) {
    case 'error': return 'danger' as const
    case 'warning': return 'warning' as const
    case 'success': return 'success' as const
    default: return 'info' as const
  }
}

const formatTime = (iso: string) => {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

const openDetails = (l: SystemLog) => {
  selected.value = l
  isModalOpen.value = true
}

const closeDetails = () => { isModalOpen.value = false; selected.value = null }

onMounted(fetchLogs)
</script>

<template>
  <AdminLayout>
    <AdminHeader />

    <div class="p-4 md:p-6">
      <div class="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            System Logs
          </h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Track all system events and activities
          </p>
        </div>
        <BaseButton variant="secondary">
          <Download class="w-4 h-4 mr-2" />
          Export
        </BaseButton>
      </div>

      <div v-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl flex items-center gap-2">
        <AlertCircle class="w-5 h-5 text-red-500 shrink-0" />
        <span class="text-red-700 dark:text-red-400 text-sm">{{ error }}</span>
      </div>

      <AdminTable
        :items="filtered"
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
            v-model="levelFilter"
            @change="handleSearch"
            class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="">All levels</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
          <BaseButton variant="secondary" @click="fetchLogs">
            <RefreshCw class="w-4 h-4" />
          </BaseButton>
        </template>

        <template #rows="{ items }">
          <tr v-for="l in items" :key="l.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td class="px-4 py-3 text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {{ formatTime(l.timestamp) }}
            </td>
            <td class="px-4 py-3">
              <AdminBadge :variant="levelVariant(l.level)" :label="l.level.toUpperCase()" :dot="true" />
            </td>
            <td class="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
              {{ l.action }}
            </td>
            <td class="px-4 py-3 hidden md:table-cell text-sm text-slate-700 dark:text-slate-300">
              {{ l.user || 'system' }}
            </td>
            <td class="px-4 py-3 hidden lg:table-cell text-sm text-slate-500 dark:text-slate-400 truncate max-w-md">
              {{ l.details }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end">
                <button @click="openDetails(l)" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" :title="t('admin.audit.viewDetails')">
                  <Eye class="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </button>
              </div>
            </td>
          </tr>
        </template>
      </AdminTable>
    </div>

    <BaseModal :is-open="isModalOpen" title="Log Details" @close="closeDetails">
      <div v-if="selected" class="space-y-3">
        <dl class="grid grid-cols-2 gap-3">
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.audit.timestamp') }}</dt>
            <dd class="text-xs font-mono text-slate-900 dark:text-white">{{ formatTime(selected.timestamp) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">Level</dt>
            <dd><AdminBadge :variant="levelVariant(selected.level)" :label="selected.level.toUpperCase()" :dot="true" /></dd>
          </div>
          <div class="col-span-2">
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.audit.action') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white">{{ selected.action }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.audit.actor') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white">{{ selected.user || '—' }}</dd>
          </div>
        </dl>
        <div v-if="selected.details">
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Details</p>
          <div class="text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 p-3 rounded-lg max-h-40 overflow-y-auto font-mono whitespace-pre-wrap">
            {{ selected.details }}
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="closeDetails">{{ t('common.close') }}</BaseButton>
      </template>
    </BaseModal>
  </AdminLayout>
</template>
