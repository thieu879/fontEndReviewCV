<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  AlertCircle, Check, RefreshCw
} from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminHeader from '@/components/sidebar/AdminHeader.vue'
import AdminTable from '@/components/base/AdminTable.vue'
import AdminBadge from '@/components/base/AdminBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import axios from '@/api/axios'

const { t } = useI18n()

interface ApplicationItem {
  id: string
  candidateName?: string
  candidateEmail?: string
  jobTitle?: string
  companyName?: string
  appliedAt?: string
  status?: string
  cvUrl?: string
  coverLetter?: string
}

const searchQuery = ref('')
const items = ref<ApplicationItem[]>([])
const totalElements = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const isLoading = ref(false)
const error = ref('')
const success = ref('')
const isModalOpen = ref(false)
const selected = ref<ApplicationItem | null>(null)

const statusFilter = ref('')

const statusOptions = computed(() => [
  { value: '', label: t('admin.common.all') },
  { value: 'APPLIED', label: t('admin.applications.statuses.APPLIED') },
  { value: 'REVIEWING', label: t('admin.applications.statuses.REVIEWING') },
  { value: 'INTERVIEW', label: t('admin.applications.statuses.INTERVIEW') },
  { value: 'ACCEPTED', label: t('admin.applications.statuses.ACCEPTED') },
  { value: 'REJECTED', label: t('admin.applications.statuses.REJECTED') },
  { value: 'WITHDRAWN', label: t('admin.applications.statuses.WITHDRAWN') }
])

const columns = computed(() => [
  { key: 'candidate', label: t('admin.applications.candidate') },
  { key: 'job', label: t('admin.applications.job'), hideOn: 'sm' as const },
  { key: 'company', label: t('admin.applications.company'), hideOn: 'md' as const },
  { key: 'status', label: t('admin.applications.status') },
  { key: 'applied', label: t('admin.applications.appliedAt'), hideOn: 'lg' as const },
  { key: 'actions', label: t('admin.applications.actions'), align: 'right' as const }
])

const fetchList = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const res = await axios.get('/admin/applications', {
      params: {
        page: currentPage.value - 1,
        size: pageSize.value,
        status: statusFilter.value || undefined
      }
    })
    if (res.data.success) {
      const data = res.data.data
      items.value = (data.content || []).map((a: any) => ({
        id: a.id,
        candidateName: a.candidateName || a.candidate?.fullName || a.candidate?.username || '—',
        candidateEmail: a.candidateEmail || a.candidate?.email,
        jobTitle: a.jobTitle || a.job?.title || '—',
        companyName: a.companyName || a.job?.companyName,
        appliedAt: a.appliedAt || a.createdAt,
        status: a.status || 'APPLIED',
        cvUrl: a.cvUrl || a.candidate?.cvUrl,
        coverLetter: a.coverLetter
      }))
      totalElements.value = data.totalElements ?? items.value.length
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

const openView = (a: ApplicationItem) => {
  selected.value = a
  isModalOpen.value = true
}
const closeView = () => { isModalOpen.value = false; selected.value = null }

const handleStatus = async (a: ApplicationItem, status: string) => {
  try {
    await axios.put(`/admin/applications/${a.id}/status`, { status })
    flash(t('admin.applications.statusUpdated'))
    fetchList()
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  }
}

const handleWithdraw = async (a: ApplicationItem) => {
  if (!confirm(t('admin.applications.withdrawConfirm'))) return
  try {
    await axios.delete(`/admin/applications/${a.id}`)
    flash(t('admin.applications.statusUpdated'))
    fetchList()
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  }
}

const handleSearch = () => { currentPage.value = 1; fetchList() }
const handlePageChange = (p: number) => { currentPage.value = p; fetchList() }

const filtered = computed(() => {
  if (!searchQuery.value) return items.value
  const q = searchQuery.value.toLowerCase()
  return items.value.filter(
    (a) =>
      (a.candidateName || '').toLowerCase().includes(q) ||
      (a.jobTitle || '').toLowerCase().includes(q) ||
      (a.companyName || '').toLowerCase().includes(q)
  )
})

const statusVariant = (s?: string) => {
  switch ((s || '').toUpperCase()) {
    case 'APPLIED': return 'info' as const
    case 'REVIEWING': return 'warning' as const
    case 'INTERVIEW': return 'primary' as const
    case 'ACCEPTED': return 'success' as const
    case 'REJECTED': return 'danger' as const
    case 'WITHDRAWN': return 'neutral' as const
    default: return 'neutral' as const
  }
}

const formatDate = (iso?: string) => {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString() } catch { return iso }
}

onMounted(fetchList)
</script>

<template>
  <AdminLayout>
    <AdminHeader />

    <div class="p-4 md:p-6">
      <div class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          {{ t('admin.applications.title') }}
        </h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          {{ t('admin.applications.subtitle') }}
        </p>
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
        :search-placeholder="t('admin.applications.searchPlaceholder')"
        v-model:search-model-value="searchQuery"
        :total-elements="totalElements"
        :page="currentPage"
        :page-size="pageSize"
        :empty-title="t('admin.applications.noApplications')"
        @search="handleSearch"
        @page-change="handlePageChange"
      >
        <template #toolbar>
          <select
            v-model="statusFilter"
            @change="fetchList"
            class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
          <BaseButton variant="secondary" @click="fetchList">
            <RefreshCw class="w-4 h-4" />
          </BaseButton>
        </template>

        <template #rows="{ items }">
          <tr v-for="a in items" :key="a.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                  {{ (a.candidateName || '?').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-slate-900 dark:text-white truncate">{{ a.candidateName }}</p>
                  <p v-if="a.candidateEmail" class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ a.candidateEmail }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 hidden md:table-cell text-sm text-slate-700 dark:text-slate-300">
              <span class="flex items-center gap-1 truncate">
                <Briefcase class="w-3.5 h-3.5 shrink-0" />
                <span class="truncate">{{ a.jobTitle }}</span>
              </span>
            </td>
            <td class="px-4 py-3 hidden lg:table-cell text-sm text-slate-700 dark:text-slate-300">
              <span class="flex items-center gap-1 truncate">
                <Building2 class="w-3.5 h-3.5 shrink-0" />
                <span class="truncate">{{ a.companyName || '—' }}</span>
              </span>
            </td>
            <td class="px-4 py-3">
              <AdminBadge :variant="statusVariant(a.status)" :label="t(`admin.applications.statuses.${a.status ?? 'APPLIED'}`, a.status || 'APPLIED')" :dot="true" />
            </td>
            <td class="px-4 py-3 hidden lg:table-cell text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {{ formatDate(a.appliedAt) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <button @click="openView(a)" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" :title="t('common.viewAll')">
                  <Eye class="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </button>
                <select
                  :value="a.status"
                  @change="(e) => handleStatus(a, (e.target as HTMLSelectElement).value)"
                  class="text-xs px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option v-for="s in statusOptions.filter(x => x.value)" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
                <button @click="handleWithdraw(a)" class="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors" :title="t('admin.applications.withdraw')">
                  <Trash2 class="w-4 h-4 text-red-500" />
                </button>
              </div>
            </td>
          </tr>
        </template>
      </AdminTable>
    </div>

    <BaseModal :is-open="isModalOpen" :title="t('admin.applications.title')" @close="closeView">
      <div v-if="selected" class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.applications.candidate') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white">{{ selected.candidateName }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.applications.job') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white">{{ selected.jobTitle }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.applications.company') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white">{{ selected.companyName || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.applications.appliedAt') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white">{{ formatDate(selected.appliedAt) }}</dd>
          </div>
        </div>
        <div v-if="selected.coverLetter">
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Cover Letter</p>
          <div class="text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 p-3 rounded-lg max-h-32 overflow-y-auto whitespace-pre-wrap">
            {{ selected.coverLetter }}
          </div>
        </div>
        <a
          v-if="selected.cvUrl"
          :href="selected.cvUrl"
          target="_blank"
          class="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          <Download class="w-4 h-4" />
          {{ t('admin.applications.viewCv') }}
        </a>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="closeView">{{ t('common.close') }}</BaseButton>
      </template>
    </BaseModal>
  </AdminLayout>
</template>
