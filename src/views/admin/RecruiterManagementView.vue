<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Building2, MapPin, Globe, Calendar, Check, X, Eye,
  Mail, AlertCircle, RefreshCw
} from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminHeader from '@/components/sidebar/AdminHeader.vue'
import AdminTable from '@/components/base/AdminTable.vue'
import AdminBadge from '@/components/base/AdminBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { adminRecruitersApi } from '@/api/adminService'

const { t } = useI18n()

interface Recruiter {
  id: string
  companyName: string
  email: string
  website?: string
  location?: string
  industry?: string
  verificationStatus: string
  activeJobs: number
  totalApplications: number
  responseRate: number
  joinedAt: string
}

const searchQuery = ref('')
const selectedStatus = ref('')
const isModalOpen = ref(false)
const modalType = ref<'view' | 'approve' | 'reject' | 'suspend'>('view')
const selectedRecruiter = ref<Recruiter | null>(null)
const isLoading = ref(false)
const error = ref('')
const success = ref('')
const actionLoading = ref<string | null>(null)

const recruiters = ref<Recruiter[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalElements = ref(0)

const statusOptions = computed(() => [
  { value: '', label: t('admin.recruiters.allStatuses') },
  { value: 'PENDING', label: t('admin.recruiters.statuses.PENDING') },
  { value: 'APPROVED', label: t('admin.recruiters.statuses.APPROVED') },
  { value: 'REJECTED', label: t('admin.recruiters.statuses.REJECTED') },
  { value: 'SUSPENDED', label: t('admin.recruiters.statuses.SUSPENDED') }
])

const columns = computed(() => [
  { key: 'company', label: t('admin.recruiters.companyName') },
  { key: 'status', label: t('admin.recruiters.verificationStatus') },
  { key: 'jobs', label: t('admin.recruiters.activeJobs') },
  { key: 'apps', label: t('admin.recruiters.totalApplications') },
  { key: 'rate', label: t('admin.recruiters.responseRate'), hideOn: 'sm' as const },
  { key: 'joined', label: t('admin.recruiters.joinedAt'), hideOn: 'md' as const },
  { key: 'actions', label: t('admin.recruiters.actions'), align: 'right' as const }
])

const fetchRecruiters = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await adminRecruitersApi.getAll({
      page: currentPage.value - 1,
      size: pageSize.value,
      search: searchQuery.value || undefined,
      status: selectedStatus.value || undefined
    })
    if (response.data.success) {
      const list = response.data.data.content || []
      recruiters.value = list.map((r: any) => ({
        id: r.id,
        companyName: r.companyName || r.fullName || '—',
        email: r.email || '',
        website: r.website,
        location: r.location,
        industry: r.industry,
        verificationStatus: (r.verificationStatus || r.status || 'PENDING').toUpperCase(),
        activeJobs: r.activeJobs ?? r.activeJobsCount ?? 0,
        totalApplications: r.totalApplications ?? 0,
        responseRate: r.responseRate ?? r.averageResponseRate ?? 0,
        joinedAt: r.joinedAt || r.createdAt
      }))
      totalElements.value = response.data.data.totalElements ?? list.length
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    isLoading.value = false
  }
}

const openViewModal = (r: Recruiter) => {
  selectedRecruiter.value = r
  modalType.value = 'view'
  isModalOpen.value = true
}

const openApproveModal = (r: Recruiter) => {
  selectedRecruiter.value = r
  modalType.value = 'approve'
  isModalOpen.value = true
}

const openRejectModal = (r: Recruiter) => {
  selectedRecruiter.value = r
  modalType.value = 'reject'
  isModalOpen.value = true
}

const openSuspendModal = (r: Recruiter) => {
  selectedRecruiter.value = r
  modalType.value = 'suspend'
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedRecruiter.value = null
  error.value = ''
}

const flash = (msg: string) => {
  success.value = msg
  setTimeout(() => (success.value = ''), 3000)
}

const handleAction = async () => {
  if (!selectedRecruiter.value) return
  error.value = ''
  actionLoading.value = selectedRecruiter.value.id
  try {
    const id = selectedRecruiter.value.id
    let res
    if (modalType.value === 'approve') res = await adminRecruitersApi.approve(id)
    else if (modalType.value === 'reject') res = await adminRecruitersApi.reject(id)
    else if (modalType.value === 'suspend') res = await adminRecruitersApi.suspend(id)
    if (res?.data?.success) {
      const key = modalType.value === 'approve'
        ? 'admin.recruiters.approveSuccess'
        : modalType.value === 'reject'
          ? 'admin.recruiters.rejectSuccess'
          : 'admin.recruiters.suspendSuccess'
      flash(t(key))
      closeModal()
      fetchRecruiters()
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    actionLoading.value = null
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchRecruiters()
}

const handlePageChange = (p: number) => {
  currentPage.value = p
  fetchRecruiters()
}

const statusVariant = (s: string) => {
  switch (s) {
    case 'APPROVED':
    case 'VERIFIED':
      return 'success' as const
    case 'PENDING':
      return 'warning' as const
    case 'REJECTED':
      return 'danger' as const
    case 'SUSPENDED':
      return 'neutral' as const
    default:
      return 'neutral' as const
  }
}

const formatDate = (iso?: string) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString()
  } catch {
    return '—'
  }
}

const modalTitle = computed(() => {
  switch (modalType.value) {
    case 'view': return t('admin.recruiters.title')
    case 'approve': return t('admin.recruiters.approve')
    case 'reject': return t('admin.recruiters.reject')
    case 'suspend': return t('admin.recruiters.suspend')
  }
})

const confirmLabel = computed(() => {
  switch (modalType.value) {
    case 'approve': return t('admin.recruiters.approve')
    case 'reject': return t('admin.recruiters.reject')
    case 'suspend': return t('admin.recruiters.suspend')
    default: return ''
  }
})

const confirmVariant = computed(() => {
  if (modalType.value === 'approve') return 'primary' as const
  if (modalType.value === 'reject') return 'danger' as const
  if (modalType.value === 'suspend') return 'secondary' as const
  return 'primary' as const
})

const confirmMessage = computed(() => {
  switch (modalType.value) {
    case 'approve': return t('admin.recruiters.approveConfirm')
    case 'reject': return t('admin.recruiters.rejectConfirm')
    case 'suspend': return t('admin.recruiters.suspendConfirm')
    default: return ''
  }
})

onMounted(fetchRecruiters)
</script>

<template>
  <AdminLayout>
    <AdminHeader />

    <div class="p-4 md:p-6">
      <div class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          {{ t('admin.recruiters.title') }}
        </h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          {{ t('admin.recruiters.subtitle') }}
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
        :items="recruiters"
        :columns="columns"
        :is-loading="isLoading"
        :search-placeholder="t('admin.recruiters.searchPlaceholder')"
        v-model:search-model-value="searchQuery"
        :total-elements="totalElements"
        :page="currentPage"
        :page-size="pageSize"
        :empty-title="t('admin.recruiters.noRecruiters')"
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
          <BaseButton variant="secondary" @click="fetchRecruiters">
            <RefreshCw class="w-4 h-4" />
          </BaseButton>
        </template>

        <template #rows="{ items }">
          <tr
            v-for="r in items"
            :key="r.id"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  <Building2 class="w-5 h-5" />
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-slate-900 dark:text-white truncate">{{ r.companyName }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                    <Mail class="w-3 h-3 shrink-0" />
                    {{ r.email }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <AdminBadge :variant="statusVariant(r.verificationStatus)" :label="t(`admin.recruiters.statuses.${r.verificationStatus}`, r.verificationStatus)" :dot="true" />
            </td>
            <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{{ r.activeJobs }}</td>
            <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{{ r.totalApplications }}</td>
            <td class="px-4 py-3 hidden md:table-cell text-sm text-slate-700 dark:text-slate-300">
              {{ Math.round(r.responseRate) }}%
            </td>
            <td class="px-4 py-3 hidden lg:table-cell text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {{ formatDate(r.joinedAt) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <button
                  @click="openViewModal(r)"
                  class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  :title="t('admin.recruiters.viewJobs')"
                >
                  <Eye class="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </button>
                <button
                  v-if="r.verificationStatus !== 'APPROVED'"
                  @click="openApproveModal(r)"
                  class="p-2 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-colors"
                  :title="t('admin.recruiters.approve')"
                >
                  <Check class="w-4 h-4 text-green-500" />
                </button>
                <button
                  v-if="r.verificationStatus !== 'REJECTED'"
                  @click="openRejectModal(r)"
                  class="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  :title="t('admin.recruiters.reject')"
                >
                  <X class="w-4 h-4 text-red-500" />
                </button>
                <button
                  v-if="r.verificationStatus === 'APPROVED'"
                  @click="openSuspendModal(r)"
                  class="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 rounded-lg transition-colors"
                  :title="t('admin.recruiters.suspend')"
                >
                  <AlertCircle class="w-4 h-4 text-yellow-500" />
                </button>
              </div>
            </td>
          </tr>
        </template>
      </AdminTable>
    </div>

    <BaseModal :is-open="isModalOpen" :title="modalTitle" @close="closeModal">
      <!-- View detail -->
      <div v-if="modalType === 'view' && selectedRecruiter" class="space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
            <Building2 class="w-7 h-7" />
          </div>
          <div>
            <h3 class="font-bold text-lg text-slate-900 dark:text-white">{{ selectedRecruiter.companyName }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ selectedRecruiter.email }}</p>
          </div>
        </div>
        <dl class="grid grid-cols-2 gap-3 mt-4">
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.recruiters.website') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white truncate flex items-center gap-1">
              <Globe class="w-3.5 h-3.5" />
              {{ selectedRecruiter.website || '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.recruiters.location') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white flex items-center gap-1">
              <MapPin class="w-3.5 h-3.5" />
              {{ selectedRecruiter.location || '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.recruiters.industry') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white">{{ selectedRecruiter.industry || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.recruiters.joinedAt') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white flex items-center gap-1">
              <Calendar class="w-3.5 h-3.5" />
              {{ formatDate(selectedRecruiter.joinedAt) }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.recruiters.activeJobs') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white">{{ selectedRecruiter.activeJobs }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.recruiters.responseRate') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white">{{ Math.round(selectedRecruiter.responseRate) }}%</dd>
          </div>
        </dl>
      </div>

      <!-- Approve / Reject / Suspend confirmation -->
      <div v-else-if="selectedRecruiter" class="text-center py-4">
        <p class="text-slate-700 dark:text-slate-300 mb-2 text-sm">{{ confirmMessage }}</p>
        <p class="font-semibold text-slate-900 dark:text-white">{{ selectedRecruiter.companyName }}</p>
      </div>

      <template #footer>
        <BaseButton variant="secondary" @click="closeModal">{{ t('common.cancel') }}</BaseButton>
        <BaseButton
          v-if="modalType !== 'view'"
          :variant="confirmVariant"
          @click="handleAction"
        >
          {{ confirmLabel }}
        </BaseButton>
      </template>
    </BaseModal>
  </AdminLayout>
</template>
