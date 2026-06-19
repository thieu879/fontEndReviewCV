<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Ban, CheckCircle, Mail, MapPin,
  Download, AlertCircle, Check, Clock
} from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminHeader from '@/components/sidebar/AdminHeader.vue'
import AdminTable from '@/components/base/AdminTable.vue'
import AdminBadge from '@/components/base/AdminBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { adminCandidatesApi } from '@/api/adminService'

const { t } = useI18n()

interface Candidate {
  id: string
  fullName: string
  email: string
  location?: string
  skills?: string[]
  experience?: string | number
  cvStatus?: string
  matchScore?: number
  applications?: number
  lastActive?: string
  banned?: boolean
}

const searchQuery = ref('')
const isModalOpen = ref(false)
const selectedCandidate = ref<Candidate | null>(null)
const isLoading = ref(false)
const error = ref('')
const success = ref('')
const actionLoading = ref(false)

const candidates = ref<Candidate[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalElements = ref(0)

const columns = computed(() => [
  { key: 'name', label: t('admin.candidates.fullName') },
  { key: 'location', label: t('admin.candidates.location'), hideOn: 'sm' as const },
  { key: 'match', label: t('admin.candidates.matchScore') },
  { key: 'cv', label: t('admin.candidates.cvStatus'), hideOn: 'md' as const },
  { key: 'actions', label: t('admin.candidates.actions'), align: 'right' as const }
])

const fetchCandidates = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await adminCandidatesApi.getAll({
      page: currentPage.value - 1,
      size: pageSize.value,
      search: searchQuery.value || undefined
    })
    if (response.data.success) {
      const list = response.data.data.content || []
      candidates.value = list.map((c: any) => ({
        id: c.id,
        fullName: c.fullName || c.profile?.fullName || c.username || '—',
        email: c.email || '',
        location: c.location || c.profile?.location,
        skills: c.skills || [],
        experience: c.experience || c.profile?.experience,
        cvStatus: c.cvStatus || (c.cvAnalyzed ? 'ANALYZED' : 'UPLOADED'),
        matchScore: c.matchScore ?? 0,
        applications: c.applications ?? c.applicationCount ?? 0,
        lastActive: c.lastActive || c.lastLogin,
        banned: Boolean(c.banned || c.status === 'BANNED')
      }))
      totalElements.value = response.data.data.totalElements ?? list.length
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    isLoading.value = false
  }
}

const openViewModal = (c: Candidate) => {
  selectedCandidate.value = c
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedCandidate.value = null
}

const flash = (msg: string) => {
  success.value = msg
  setTimeout(() => (success.value = ''), 3000)
}

const handleBanToggle = async (c: Candidate) => {
  actionLoading.value = true
  try {
    if (c.banned) {
      await adminCandidatesApi.unban(c.id)
      flash(t('admin.candidates.unbanSuccess'))
    } else {
      await adminCandidatesApi.ban(c.id)
      flash(t('admin.candidates.banSuccess'))
    }
    fetchCandidates()
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    actionLoading.value = false
  }
}

const handleExport = async () => {
  try {
    const res = await adminCandidatesApi.export()
    const blob = new Blob([res.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `candidates-${Date.now()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    flash(t('admin.candidates.exportSuccess'))
  } catch (err) {
    error.value = t('admin.common.error')
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchCandidates()
}

const handlePageChange = (p: number) => {
  currentPage.value = p
  fetchCandidates()
}

const cvStatusVariant = (s?: string) => {
  switch ((s || '').toUpperCase()) {
    case 'ANALYZED': return 'success' as const
    case 'PENDING': return 'warning' as const
    case 'UPLOADED': return 'info' as const
    default: return 'neutral' as const
  }
}

onMounted(fetchCandidates)
</script>

<template>
  <AdminLayout>
    <AdminHeader />

    <div class="p-4 md:p-6">
      <div class="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {{ t('admin.candidates.title') }}
          </h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {{ t('admin.candidates.subtitle') }}
          </p>
        </div>
        <BaseButton variant="secondary" @click="handleExport">
          <Download class="w-4 h-4 mr-2" />
          {{ t('admin.candidates.export') }}
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
        :items="candidates"
        :columns="columns"
        :is-loading="isLoading"
        :search-placeholder="t('admin.candidates.searchPlaceholder')"
        v-model:search-model-value="searchQuery"
        :total-elements="totalElements"
        :page="currentPage"
        :page-size="pageSize"
        :empty-title="t('admin.candidates.noCandidates')"
        @search="handleSearch"
        @page-change="handlePageChange"
      >
        <template #rows="{ items }">
          <tr
            v-for="c in items"
            :key="c.id"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {{ (c.fullName || '?').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-slate-900 dark:text-white truncate">{{ c.fullName }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                    <Mail class="w-3 h-3 shrink-0" />
                    {{ c.email }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 hidden md:table-cell text-sm text-slate-700 dark:text-slate-300">
              <span v-if="c.location" class="flex items-center gap-1">
                <MapPin class="w-3.5 h-3.5" />
                {{ c.location }}
              </span>
              <span v-else class="text-slate-400 dark:text-slate-500">—</span>
            </td>
            <td class="px-4 py-3">
              <span
                v-if="c.matchScore && c.matchScore > 0"
                class="text-sm font-semibold text-green-600 dark:text-green-400"
              >
                {{ Math.round(c.matchScore) }}%
              </span>
              <span v-else class="text-sm text-slate-400 dark:text-slate-500">—</span>
            </td>
            <td class="px-4 py-3 hidden lg:table-cell">
              <AdminBadge :variant="cvStatusVariant(c.cvStatus)" :label="c.cvStatus || '—'" :dot="true" />
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <button
                  @click="openViewModal(c)"
                  class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  :title="t('admin.candidates.viewProfile')"
                >
                  <Eye class="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </button>
                <button
                  v-if="!c.banned"
                  @click="handleBanToggle(c)"
                  :disabled="actionLoading"
                  class="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
                  :title="t('admin.candidates.ban')"
                >
                  <Ban class="w-4 h-4 text-red-500" />
                </button>
                <button
                  v-else
                  @click="handleBanToggle(c)"
                  :disabled="actionLoading"
                  class="p-2 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-colors disabled:opacity-50"
                  :title="t('admin.candidates.unban')"
                >
                  <CheckCircle class="w-4 h-4 text-green-500" />
                </button>
              </div>
            </td>
          </tr>
        </template>
      </AdminTable>
    </div>

    <BaseModal :is-open="isModalOpen" :title="t('admin.candidates.viewProfile')" @close="closeModal">
      <div v-if="selectedCandidate" class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
            {{ selectedCandidate.fullName.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h3 class="font-bold text-lg text-slate-900 dark:text-white">{{ selectedCandidate.fullName }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ selectedCandidate.email }}</p>
          </div>
        </div>
        <dl class="grid grid-cols-2 gap-3">
          <div v-if="selectedCandidate.location">
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.candidates.location') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white">{{ selectedCandidate.location }}</dd>
          </div>
          <div v-if="selectedCandidate.experience">
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.candidates.experience') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white">{{ selectedCandidate.experience }}</dd>
          </div>
          <div v-if="selectedCandidate.applications !== undefined">
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.candidates.applications') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white">{{ selectedCandidate.applications }}</dd>
          </div>
          <div v-if="selectedCandidate.lastActive">
            <dt class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.candidates.lastActive') }}</dt>
            <dd class="text-sm text-slate-900 dark:text-white flex items-center gap-1">
              <Clock class="w-3.5 h-3.5" />
              {{ selectedCandidate.lastActive }}
            </dd>
          </div>
        </dl>
        <div v-if="selectedCandidate.skills?.length">
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">{{ t('admin.candidates.skills') }}</p>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="s in selectedCandidate.skills"
              :key="s"
              class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs"
            >
              {{ s }}
            </span>
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="closeModal">{{ t('common.close') }}</BaseButton>
      </template>
    </BaseModal>
  </AdminLayout>
</template>
