<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  AlertCircle, RefreshCw, Clock, Globe
} from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminHeader from '@/components/sidebar/AdminHeader.vue'
import AdminTable from '@/components/base/AdminTable.vue'
import AdminBadge from '@/components/base/AdminBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { adminScrapingApi } from '@/api/adminService'

const { t } = useI18n()

interface ScrapeLog {
  id: string
  sourceId?: string
  sourceName?: string
  status: string
  startedAt?: string
  finishedAt?: string
  duration?: number
  itemsScraped?: number
  errorMessage?: string
}

const searchQuery = ref('')
const logs = ref<ScrapeLog[]>([])
const totalElements = ref(0)
const currentPage = ref(1)
const pageSize = ref(15)
const isLoading = ref(false)
const error = ref('')
const statusFilter = ref('')

const statusOptions = computed(() => [
  { value: '', label: t('admin.common.all') },
  { value: 'SUCCESS', label: t('admin.scraping.logs.statuses.SUCCESS') },
  { value: 'FAILED', label: t('admin.scraping.logs.statuses.FAILED') },
  { value: 'RUNNING', label: t('admin.scraping.logs.statuses.RUNNING') },
  { value: 'PARTIAL', label: t('admin.scraping.logs.statuses.PARTIAL') }
])

const columns = computed(() => [
  { key: 'source', label: t('admin.scraping.logs.source') },
  { key: 'status', label: t('admin.scraping.logs.status') },
  { key: 'started', label: t('admin.scraping.logs.startedAt') },
  { key: 'duration', label: t('admin.scraping.logs.duration'), hideOn: 'sm' as const },
  { key: 'items', label: t('admin.scraping.logs.itemsScraped') },
  { key: 'error', label: t('admin.scraping.logs.errorMessage'), hideOn: 'md' as const }
])

const fetchLogs = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const res = await adminScrapingApi.getLogs({
      page: currentPage.value - 1,
      size: pageSize.value,
      status: statusFilter.value || undefined
    })
    if (res.data.success) {
      const data = res.data.data
      logs.value = (data.content || []).map((l: any) => ({
        id: l.id,
        sourceId: l.sourceId,
        sourceName: l.sourceName || l.source?.name || '—',
        status: l.status || 'SUCCESS',
        startedAt: l.startedAt || l.createdAt,
        finishedAt: l.finishedAt,
        duration: l.duration ?? l.durationMs,
        itemsScraped: l.itemsScraped ?? l.itemsCount ?? 0,
        errorMessage: l.errorMessage || l.error
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
  if (!searchQuery.value) return logs.value
  const q = searchQuery.value.toLowerCase()
  return logs.value.filter((l) => (l.sourceName || '').toLowerCase().includes(q))
})

const statusVariant = (s: string) => {
  switch ((s || '').toUpperCase()) {
    case 'SUCCESS': return 'success' as const
    case 'FAILED': return 'danger' as const
    case 'RUNNING': return 'info' as const
    case 'PARTIAL': return 'warning' as const
    default: return 'neutral' as const
  }
}

const formatDuration = (ms?: number) => {
  if (!ms || ms < 0) return '—'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

const formatTime = (iso?: string) => {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

onMounted(fetchLogs)
</script>

<template>
  <AdminLayout>
    <AdminHeader />

    <div class="p-4 md:p-6">
      <div class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          {{ t('admin.scraping.logsTitle') }}
        </h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          {{ t('admin.scraping.logsSubtitle') }}
        </p>
      </div>

      <div v-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl flex items-center gap-2">
        <AlertCircle class="w-5 h-5 text-red-500 shrink-0" />
        <span class="text-red-700 dark:text-red-400 text-sm">{{ error }}</span>
      </div>

      <AdminTable
        :items="filtered"
        :columns="columns"
        :is-loading="isLoading"
        :search-placeholder="t('admin.scraping.logs.source')"
        v-model:search-model-value="searchQuery"
        :total-elements="totalElements"
        :page="currentPage"
        :page-size="pageSize"
        :empty-title="t('admin.scraping.logs.noLogs')"
        @search="handleSearch"
        @page-change="handlePageChange"
      >
        <template #toolbar>
          <select
            v-model="statusFilter"
            @change="fetchLogs"
            class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
          <BaseButton variant="secondary" @click="fetchLogs">
            <RefreshCw class="w-4 h-4" />
          </BaseButton>
        </template>

        <template #rows="{ items }">
          <tr v-for="l in items" :key="l.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <Globe class="w-4 h-4 text-slate-400 shrink-0" />
                <span class="text-sm font-medium text-slate-900 dark:text-white truncate">{{ l.sourceName }}</span>
              </div>
            </td>
            <td class="px-4 py-3">
              <AdminBadge :variant="statusVariant(l.status)" :label="t(`admin.scraping.logs.statuses.${l.status}`, l.status)" :dot="true" />
            </td>
            <td class="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {{ formatTime(l.startedAt) }}
            </td>
            <td class="px-4 py-3 hidden md:table-cell text-sm text-slate-700 dark:text-slate-300">
              <span class="flex items-center gap-1">
                <Clock class="w-3.5 h-3.5" />
                {{ formatDuration(l.duration) }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
              {{ l.itemsScraped ?? 0 }}
            </td>
            <td class="px-4 py-3 hidden lg:table-cell">
              <p v-if="l.errorMessage" class="text-xs text-red-500 truncate max-w-xs">
                {{ l.errorMessage }}
              </p>
              <span v-else class="text-xs text-slate-400 dark:text-slate-500">—</span>
            </td>
          </tr>
        </template>
      </AdminTable>
    </div>
  </AdminLayout>
</template>
