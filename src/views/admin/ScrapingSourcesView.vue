<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Plus, Globe, Edit, Trash2, Power, Play, RefreshCw,
  AlertCircle, Check
} from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminHeader from '@/components/sidebar/AdminHeader.vue'
import AdminTable from '@/components/base/AdminTable.vue'
import AdminBadge from '@/components/base/AdminBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { adminScrapingApi } from '@/api/adminService'

const { t } = useI18n()

interface ScrapingSource {
  id: string
  name: string
  url: string
  sourceType: string
  isEnabled: boolean
  cronExpression: string
  maxPages: number
  successCount: number
  failureCount: number
  lastStatusCode?: number
  lastRunAt?: string
  nextRunAt?: string
  lastError?: string
  priority: number
}

const searchQuery = ref('')
const sources = ref<ScrapingSource[]>([])
const totalElements = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const isLoading = ref(false)
const error = ref('')
const success = ref('')
const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const selected = ref<ScrapingSource | null>(null)
const saving = ref(false)
const runningId = ref<string | null>(null)

const form = ref({
  name: '',
  url: '',
  sourceType: 'REST_API',
  isEnabled: true,
  cronExpression: '0 0 */6 * * *',
  maxPages: 5,
  priority: 1
})

const columns = computed(() => [
  { key: 'name', label: t('admin.scraping.name') },
  { key: 'url', label: 'URL', hideOn: 'md' as const },
  { key: 'type', label: t('admin.scraping.sourceType') },
  { key: 'status', label: t('admin.scraping.isEnabled') },
  { key: 'cron', label: t('admin.scraping.cronExpression'), hideOn: 'sm' as const },
  { key: 'stats', label: 'Stats' },
  { key: 'actions', label: t('admin.scraping.actions'), align: 'right' as const }
])

const fetchList = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const res = await adminScrapingApi.getSources({
      page: currentPage.value - 1,
      size: pageSize.value
    })
    if (res.data.success) {
      const data = res.data.data
      sources.value = (data.content || []).map((s: any) => ({
        id: s.id,
        name: s.name || '',
        url: s.url || '',
        sourceType: s.sourceType || 'REST_API',
        isEnabled: Boolean(s.isEnabled),
        cronExpression: s.cronExpression || '',
        maxPages: s.maxPages ?? 5,
        successCount: s.successCount ?? 0,
        failureCount: s.failureCount ?? 0,
        lastStatusCode: s.lastStatusCode,
        lastRunAt: s.lastRunAt,
        nextRunAt: s.nextRunAt,
        lastError: s.lastError,
        priority: s.priority ?? 0
      }))
      totalElements.value = data.totalElements ?? sources.value.length
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
  form.value = { name: '', url: '', sourceType: 'REST_API', isEnabled: true, cronExpression: '0 0 */6 * * *', maxPages: 5, priority: 1 }
  modalType.value = 'create'
  isModalOpen.value = true
}

const openEdit = (s: ScrapingSource) => {
  selected.value = s
  form.value = {
    name: s.name,
    url: s.url,
    sourceType: s.sourceType,
    isEnabled: s.isEnabled,
    cronExpression: s.cronExpression,
    maxPages: s.maxPages,
    priority: s.priority
  }
  modalType.value = 'edit'
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selected.value = null
}

const save = async () => {
  if (!form.value.name.trim() || !form.value.url.trim()) {
    error.value = t('validation.required')
    return
  }
  saving.value = true
  error.value = ''
  try {
    const payload: any = { ...form.value }
    const res = modalType.value === 'create'
      ? await adminScrapingApi.createSource(payload)
      : await adminScrapingApi.updateSource(selected.value!.id, payload)
    if (res?.data?.success) {
      flash(t(modalType.value === 'create' ? 'admin.scraping.createSuccess' : 'admin.scraping.updateSuccess'))
      closeModal()
      fetchList()
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    saving.value = false
  }
}

const handleToggle = async (s: ScrapingSource) => {
  try {
    if (s.isEnabled) {
      await adminScrapingApi.disableSource(s.id)
      flash(t('admin.scraping.disableSuccess'))
    } else {
      await adminScrapingApi.enableSource(s.id)
      flash(t('admin.scraping.enableSuccess'))
    }
    fetchList()
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  }
}

const handleRun = async (s: ScrapingSource) => {
  runningId.value = s.id
  try {
    await adminScrapingApi.runSource(s.id)
    flash(t('admin.scraping.runSuccess'))
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    runningId.value = null
  }
}

const handleRunAll = async () => {
  try {
    await adminScrapingApi.runAll()
    flash(t('admin.scraping.runAllSuccess'))
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  }
}

const handleDelete = async (s: ScrapingSource) => {
  if (!confirm(t('admin.scraping.deleteConfirm'))) return
  try {
    await adminScrapingApi.deleteSource(s.id)
    flash(t('admin.scraping.deleteSuccess'))
    fetchList()
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  }
}

const handleSearch = () => { currentPage.value = 1 }
const handlePageChange = (p: number) => { currentPage.value = p; fetchList() }

const filtered = computed(() => {
  if (!searchQuery.value) return sources.value
  const q = searchQuery.value.toLowerCase()
  return sources.value.filter((s) => (s.name || '').toLowerCase().includes(q) || (s.url || '').toLowerCase().includes(q))
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
            {{ t('admin.scraping.sourcesTitle') }}
          </h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {{ t('admin.scraping.sourcesSubtitle') }}
          </p>
        </div>
        <div class="flex gap-2">
          <BaseButton variant="secondary" @click="handleRunAll">
            <Play class="w-4 h-4 mr-2" />
            {{ t('admin.scraping.runAll') }}
          </BaseButton>
          <BaseButton variant="primary" @click="openCreate">
            <Plus class="w-4 h-4 mr-2" />
            {{ t('admin.scraping.createSource') }}
          </BaseButton>
        </div>
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
        :search-placeholder="t('admin.scraping.name')"
        v-model:search-model-value="searchQuery"
        :total-elements="totalElements"
        :page="currentPage"
        :page-size="pageSize"
        :empty-title="t('admin.scraping.noSources')"
        @search="handleSearch"
        @page-change="handlePageChange"
      >
        <template #toolbar>
          <BaseButton variant="secondary" @click="fetchList">
            <RefreshCw class="w-4 h-4" />
          </BaseButton>
        </template>

        <template #rows="{ items }">
          <tr v-for="s in items" :key="s.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <Globe class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-slate-900 dark:text-white truncate">{{ s.name }}</p>
                  <p v-if="s.lastError" class="text-xs text-red-500 truncate">{{ s.lastError }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 hidden lg:table-cell">
              <code class="text-xs font-mono text-slate-700 dark:text-slate-300 truncate max-w-xs inline-block align-middle">
                {{ s.url }}
              </code>
            </td>
            <td class="px-4 py-3">
              <AdminBadge :variant="'info'" :label="t(`admin.scraping.types.${s.sourceType}`, s.sourceType)" />
            </td>
            <td class="px-4 py-3">
              <AdminBadge
                :variant="s.isEnabled ? 'success' : 'neutral'"
                :label="s.isEnabled ? t('admin.common.enabled') : t('admin.common.disabled')"
                :dot="true"
              />
            </td>
            <td class="px-4 py-3 hidden md:table-cell">
              <code class="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                {{ s.cronExpression }}
              </code>
            </td>
            <td class="px-4 py-3 text-xs">
              <span class="text-green-600 dark:text-green-400 font-medium">{{ s.successCount }}✓</span>
              <span class="mx-1 text-slate-300">/</span>
              <span class="text-red-500 font-medium">{{ s.failureCount }}✗</span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <button
                  @click="handleRun(s)"
                  :disabled="runningId === s.id"
                  class="p-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors disabled:opacity-50"
                  :title="t('admin.scraping.runNow')"
                >
                  <Play class="w-4 h-4 text-blue-500" />
                </button>
                <button @click="openEdit(s)" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" :title="t('common.edit')">
                  <Edit class="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </button>
                <button @click="handleToggle(s)" class="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 rounded-lg transition-colors" :title="s.isEnabled ? t('admin.scraping.disable') : t('admin.scraping.enable')">
                  <Power class="w-4 h-4 text-yellow-500" />
                </button>
                <button @click="handleDelete(s)" class="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors" :title="t('admin.scraping.delete')">
                  <Trash2 class="w-4 h-4 text-red-500" />
                </button>
              </div>
            </td>
          </tr>
        </template>
      </AdminTable>
    </div>

    <BaseModal :is-open="isModalOpen" :title="modalType === 'create' ? t('admin.scraping.createSource') : t('admin.scraping.editSource')" size="lg" @close="closeModal">
      <div class="space-y-4">
        <div class="grid md:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('admin.scraping.name') }}</label>
            <BaseInput v-model="form.name" type="text" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('admin.scraping.sourceType') }}</label>
            <select v-model="form.sourceType" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
              <option value="REST_API">{{ t('admin.scraping.types.REST_API') }}</option>
              <option value="HTML_SCRAPER">{{ t('admin.scraping.types.HTML_SCRAPER') }}</option>
              <option value="HEADLESS_BROWSER">{{ t('admin.scraping.types.HEADLESS_BROWSER') }}</option>
              <option value="VIETNAMWORKS">{{ t('admin.scraping.types.VIETNAMWORKS') }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL</label>
          <BaseInput v-model="form.url" type="text" placeholder="https://..." />
        </div>
        <div class="grid md:grid-cols-3 gap-3">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('admin.scraping.cronExpression') }}</label>
            <input v-model="form.cronExpression" type="text" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm" placeholder="0 0 */6 * * *" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('admin.scraping.maxPages') }}</label>
            <input v-model.number="form.maxPages" type="number" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('admin.scraping.priority') }}</label>
            <input v-model.number="form.priority" type="number" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
        </div>
        <label class="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" v-model="form.isEnabled" class="rounded text-blue-600" />
          <span class="text-sm text-slate-700 dark:text-slate-300">{{ t('admin.scraping.isEnabled') }}</span>
        </label>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="closeModal">{{ t('common.cancel') }}</BaseButton>
        <BaseButton variant="primary" @click="save" :disabled="saving">{{ t('common.save') }}</BaseButton>
      </template>
    </BaseModal>
  </AdminLayout>
</template>
