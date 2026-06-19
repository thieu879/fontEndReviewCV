<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Star, Check, X, Eye, MapPin, Briefcase, Trash2, RefreshCw,
  AlertCircle
} from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminHeader from '@/components/sidebar/AdminHeader.vue'
import AdminTable from '@/components/base/AdminTable.vue'
import AdminBadge from '@/components/base/AdminBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { adminJobsApi } from '@/api/adminService'

const { t } = useI18n()

interface Job {
  id: string
  title: string
  companyName: string
  location?: string
  salary?: string
  jobType?: string
  active: boolean
  featured: boolean
  viewCount: number
  source?: string
  createdAt?: string
  status?: string
}

const jobs = ref<Job[]>([])
const totalElements = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const selectedStatus = ref('')
const isLoading = ref(false)
const actionLoading = ref<string | null>(null)
const error = ref('')
const success = ref('')
const isModalOpen = ref(false)
const modalType = ref<'view' | 'delete'>('view')
const selectedJob = ref<Job | null>(null)

const statusOptions = computed(() => [
  { value: '', label: t('admin.jobs.allStatuses') },
  { value: 'ACTIVE', label: t('admin.jobs.statuses.ACTIVE') },
  { value: 'PENDING', label: t('admin.jobs.statuses.PENDING') },
  { value: 'FEATURED', label: t('admin.jobs.statuses.FEATURED') },
  { value: 'REJECTED', label: t('admin.jobs.statuses.REJECTED') }
])

const columns = computed(() => [
  { key: 'title', label: t('admin.jobs.titleCol') },
  { key: 'company', label: t('admin.jobs.company'), hideOn: 'sm' as const },
  { key: 'location', label: t('admin.jobs.location'), hideOn: 'md' as const },
  { key: 'type', label: t('admin.jobs.jobType'), hideOn: 'md' as const },
  { key: 'views', label: t('admin.jobs.views') },
  { key: 'status', label: t('admin.jobs.status') },
  { key: 'actions', label: t('admin.jobs.actions'), align: 'right' as const }
])

const fetchJobs = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const params: any = {
      page: currentPage.value - 1,
      size: pageSize.value,
      search: searchQuery.value || undefined
    }
    if (selectedStatus.value) {
      params.status = selectedStatus.value
    }
    const response = await adminJobsApi.getAll(params)
    if (response.data.success) {
      const list = response.data.data.content || []
      jobs.value = list.map((j: any) => ({
        id: j.id,
        title: j.title || '—',
        companyName: j.companyName || j.company || '—',
        location: j.location,
        salary: j.salary,
        jobType: j.jobType,
        active: j.active !== false,
        featured: Boolean(j.featured),
        viewCount: j.viewCount ?? j.views ?? 0,
        source: j.source,
        createdAt: j.createdAt || j.postedAt,
        status: j.status || (j.active ? 'ACTIVE' : 'INACTIVE')
      }))
      totalElements.value = response.data.data.totalElements ?? list.length
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

const handleAction = async (job: Job, type: 'approve' | 'reject' | 'feature' | 'unfeature') => {
  actionLoading.value = job.id
  try {
    let res
    if (type === 'approve') res = await adminJobsApi.approve(job.id)
    else if (type === 'reject') res = await adminJobsApi.reject(job.id)
    else if (type === 'feature') res = await adminJobsApi.feature(job.id)
    const msgKey =
      type === 'approve' ? 'admin.jobs.approveSuccess'
        : type === 'reject' ? 'admin.jobs.rejectSuccess'
          : 'admin.jobs.featureSuccess'
    if (res?.data?.success) flash(t(msgKey))
    fetchJobs()
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    actionLoading.value = null
  }
}

const openDeleteModal = (job: Job) => {
  selectedJob.value = job
  modalType.value = 'delete'
  isModalOpen.value = true
}

const openViewModal = (job: Job) => {
  selectedJob.value = job
  modalType.value = 'view'
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedJob.value = null
}

const handleDelete = async () => {
  if (!selectedJob.value) return
  actionLoading.value = selectedJob.value.id
  try {
    const res = await adminJobsApi.delete(selectedJob.value.id)
    if (res?.data?.success) {
      flash(t('admin.jobs.deleteSuccess'))
      closeModal()
      fetchJobs()
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    actionLoading.value = null
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchJobs()
}

const handlePageChange = (p: number) => {
  currentPage.value = p
  fetchJobs()
}

const statusVariant = (job: Job) => {
  if (job.featured) return 'primary' as const
  if (!job.active) return 'neutral' as const
  return 'success' as const
}

const statusLabel = (job: Job) => {
  if (job.featured) return t('admin.jobs.statuses.FEATURED')
  return job.active ? t('admin.jobs.statuses.ACTIVE') : t('admin.jobs.statuses.PENDING')
}

const formatDate = (iso?: string) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString()
  } catch {
    return '—'
  }
}

onMounted(fetchJobs)
</script>

<template>
  <AdminLayout>
    <AdminHeader />

    <div class="p-4 md:p-6">
      <div class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          {{ t('admin.jobs.title') }}
        </h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          {{ t('admin.jobs.subtitle') }}
        </p>
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
        :items="jobs"
        :columns="columns"
        :is-loading="isLoading"
        :search-placeholder="t('admin.jobs.searchPlaceholder')"
        v-model:search-model-value="searchQuery"
        :total-elements="totalElements"
        :page="currentPage"
        :page-size="pageSize"
        :empty-title="t('admin.jobs.noJobs')"
        @search="handleSearch"
        @page-change="handlePageChange"
      >
        <template #toolbar>
          <select
            v-model="selectedStatus"
            @change="handleSearch"
            class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
          <BaseButton variant="secondary" @click="fetchJobs">
            <RefreshCw class="w-4 h-4" />
          </BaseButton>
        </template>

        <template #rows="{ items }">
          <tr
            v-for="job in items"
            :key="job.id"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shrink-0">
                  <Briefcase class="w-5 h-5" />
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-slate-900 dark:text-white truncate flex items-center gap-1">
                    {{ job.title }}
                    <Star v-if="job.featured" class="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0" />
                  </p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {{ formatDate(job.createdAt) }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 hidden md:table-cell text-sm text-slate-700 dark:text-slate-300">
              {{ job.companyName }}
            </td>
            <td class="px-4 py-3 hidden lg:table-cell text-sm text-slate-700 dark:text-slate-300">
              <span v-if="job.location" class="flex items-center gap-1">
                <MapPin class="w-3.5 h-3.5" />
                {{ job.location }}
              </span>
              <span v-else class="text-slate-400 dark:text-slate-500">—</span>
            </td>
            <td class="px-4 py-3 hidden lg:table-cell text-sm text-slate-700 dark:text-slate-300">
              {{ job.jobType || '—' }}
            </td>
            <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
              {{ job.viewCount }}
            </td>
            <td class="px-4 py-3">
              <AdminBadge :variant="statusVariant(job)" :label="statusLabel(job)" :dot="true" />
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <button
                  @click="openViewModal(job)"
                  class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  :title="t('admin.jobs.viewDetail')"
                >
                  <Eye class="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </button>
                <button
                  v-if="!job.active"
                  @click="handleAction(job, 'approve')"
                  :disabled="actionLoading === job.id"
                  class="p-2 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-colors disabled:opacity-50"
                  :title="t('admin.jobs.approve')"
                >
                  <Check class="w-4 h-4 text-green-500" />
                </button>
                <button
                  v-else-if="!job.featured"
                  @click="handleAction(job, 'feature')"
                  :disabled="actionLoading === job.id"
                  class="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 rounded-lg transition-colors disabled:opacity-50"
                  :title="t('admin.jobs.feature')"
                >
                  <Star class="w-4 h-4 text-yellow-500" />
                </button>
                <button
                  v-if="job.active && !job.featured"
                  @click="handleAction(job, 'reject')"
                  :disabled="actionLoading === job.id"
                  class="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
                  :title="t('admin.jobs.reject')"
                >
                  <X class="w-4 h-4 text-red-500" />
                </button>
                <button
                  @click="openDeleteModal(job)"
                  class="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  :title="t('admin.jobs.delete')"
                >
                  <Trash2 class="w-4 h-4 text-red-500" />
                </button>
              </div>
            </td>
          </tr>
        </template>
      </AdminTable>
    </div>

    <BaseModal :is-open="isModalOpen" :title="modalType === 'view' ? t('admin.jobs.viewDetail') : t('admin.jobs.delete')" @close="closeModal">
      <div v-if="modalType === 'view' && selectedJob" class="space-y-4">
        <div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ selectedJob.title }}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ selectedJob.companyName }}</p>
        </div>
        <dl class="grid grid-cols-2 gap-3">
          <div v-if="selectedJob.location">
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.jobs.location') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white">{{ selectedJob.location }}</dd>
          </div>
          <div v-if="selectedJob.salary">
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.jobs.salary') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white">{{ selectedJob.salary }}</dd>
          </div>
          <div v-if="selectedJob.jobType">
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.jobs.jobType') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white">{{ selectedJob.jobType }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.jobs.views') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white">{{ selectedJob.viewCount }}</dd>
          </div>
        </dl>
      </div>
      <div v-else-if="selectedJob" class="text-center py-4">
        <div class="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <Trash2 class="w-7 h-7 text-red-500" />
        </div>
        <p class="text-slate-700 dark:text-slate-300 mb-2 text-sm">{{ t('admin.jobs.deleteConfirm') }}</p>
        <p class="font-semibold text-slate-900 dark:text-white">{{ selectedJob.title }}</p>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="closeModal">{{ t('common.cancel') }}</BaseButton>
        <BaseButton v-if="modalType === 'delete'" variant="danger" @click="handleDelete">
          {{ t('common.delete') }}
        </BaseButton>
      </template>
    </BaseModal>
  </AdminLayout>
</template>
