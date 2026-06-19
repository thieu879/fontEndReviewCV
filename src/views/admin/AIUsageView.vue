<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  DollarSign, Activity, AlertCircle, RefreshCw
} from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminHeader from '@/components/sidebar/AdminHeader.vue'
import AdminTable from '@/components/base/AdminTable.vue'
import AdminBadge from '@/components/base/AdminBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { adminAIApi } from '@/api/adminService'

const { t } = useI18n()

interface AIUsage {
  id: string
  userId?: string
  username?: string
  operation: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
  processingTimeMs: number
  isSuccess: boolean
  createdAt: string
}

const logs = ref<AIUsage[]>([])
const totalElements = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const isLoading = ref(false)
const error = ref('')
const searchQuery = ref('')

const totalCost = ref(0)
const totalTokens = ref(0)
const successRate = ref(0)

const columns = computed(() => [
  { key: 'user', label: t('admin.ai.usage.user') },
  { key: 'op', label: t('admin.ai.usage.operation'), hideOn: 'sm' as const },
  { key: 'model', label: t('admin.ai.usage.model'), hideOn: 'md' as const },
  { key: 'tokens', label: t('admin.ai.usage.tokens') },
  { key: 'cost', label: t('admin.ai.usage.cost') },
  { key: 'duration', label: t('admin.ai.usage.duration'), hideOn: 'sm' as const },
  { key: 'status', label: t('admin.ai.usage.status') },
  { key: 'time', label: t('admin.ai.usage.timestamp'), hideOn: 'lg' as const }
])

const fetchLogs = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const res = await adminAIApi.getUsageLogs({
      page: currentPage.value - 1,
      size: pageSize.value
    })
    if (res.data.success) {
      const data = res.data.data
      logs.value = (data.content || []).map((u: any) => ({
        id: u.id,
        userId: u.userId,
        username: u.username || u.user?.username,
        operation: u.operation || '',
        model: u.model || 'gpt-4',
        promptTokens: u.promptTokens ?? 0,
        completionTokens: u.completionTokens ?? 0,
        totalTokens: u.totalTokens ?? 0,
        cost: u.cost ?? 0,
        processingTimeMs: u.processingTimeMs ?? 0,
        isSuccess: u.isSuccess !== false,
        createdAt: u.createdAt
      }))
      totalElements.value = data.totalElements ?? logs.value.length
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    isLoading.value = false
  }
}

const fetchStats = async () => {
  try {
    const res = await adminAIApi.getUsageStats()
    if (res.data.success && res.data.data) {
      totalCost.value = res.data.data.totalCost ?? 0
      totalTokens.value = res.data.data.totalTokens ?? 0
      successRate.value = res.data.data.successRate ?? 0
    }
  } catch {
    // ignore
  }
}

const handleSearch = () => { currentPage.value = 1 }
const handlePageChange = (p: number) => { currentPage.value = p; fetchLogs() }

const filtered = computed(() => {
  if (!searchQuery.value) return logs.value
  const q = searchQuery.value.toLowerCase()
  return logs.value.filter((l) =>
    (l.username || '').toLowerCase().includes(q) ||
    (l.operation || '').toLowerCase().includes(q) ||
    (l.model || '').toLowerCase().includes(q)
  )
})

const formatCurrency = (n: number) => `$${n.toFixed(4)}`
const formatDuration = (ms: number) => ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
const formatTime = (iso: string) => {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

onMounted(() => {
  fetchLogs()
  fetchStats()
})
</script>

<template>
  <AdminLayout>
    <AdminHeader />

    <div class="p-4 md:p-6">
      <div class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          {{ t('admin.ai.usageTitle') }}
        </h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          {{ t('admin.ai.usageSubtitle') }}
        </p>
      </div>

      <!-- Stats cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 transition-colors">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {{ t('admin.ai.usage.totalCost') }}
              </p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {{ formatCurrency(totalCost) }}
              </p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <DollarSign class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 transition-colors">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {{ t('admin.ai.usage.totalTokens') }}
              </p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {{ totalTokens.toLocaleString() }}
              </p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Zap class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 transition-colors">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {{ t('admin.ai.usage.successRate') }}
              </p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {{ successRate.toFixed(1) }}%
              </p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Activity class="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl flex items-center gap-2">
        <AlertCircle class="w-5 h-5 text-red-500 shrink-0" />
        <span class="text-red-700 dark:text-red-400 text-sm">{{ error }}</span>
      </div>

      <AdminTable
        :items="filtered"
        :columns="columns"
        :is-loading="isLoading"
        :search-placeholder="t('admin.ai.usage.user')"
        v-model:search-model-value="searchQuery"
        :total-elements="totalElements"
        :page="currentPage"
        :page-size="pageSize"
        :empty-title="t('admin.ai.usage.noUsage')"
        @search="handleSearch"
        @page-change="handlePageChange"
      >
        <template #toolbar>
          <BaseButton variant="secondary" @click="fetchLogs">
            <RefreshCw class="w-4 h-4" />
          </BaseButton>
        </template>

        <template #rows="{ items }">
          <tr v-for="u in items" :key="u.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td class="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
              {{ u.username || '—' }}
            </td>
            <td class="px-4 py-3 hidden md:table-cell">
              <code class="text-xs font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                {{ u.operation }}
              </code>
            </td>
            <td class="px-4 py-3 hidden lg:table-cell text-sm text-slate-700 dark:text-slate-300">
              {{ u.model }}
            </td>
            <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
              {{ u.totalTokens.toLocaleString() }}
            </td>
            <td class="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
              {{ formatCurrency(u.cost) }}
            </td>
            <td class="px-4 py-3 hidden md:table-cell text-sm text-slate-700 dark:text-slate-300">
              {{ formatDuration(u.processingTimeMs) }}
            </td>
            <td class="px-4 py-3">
              <AdminBadge
                :variant="u.isSuccess ? 'success' : 'danger'"
                :label="u.isSuccess ? t('admin.common.success') : t('admin.common.error')"
                :dot="true"
              />
            </td>
            <td class="px-4 py-3 hidden lg:table-cell text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {{ formatTime(u.createdAt) }}
            </td>
          </tr>
        </template>
      </AdminTable>
    </div>
  </AdminLayout>
</template>
