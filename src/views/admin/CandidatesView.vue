<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Download, Eye, Trash2, AlertCircle, Check, RefreshCw
} from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminHeader from '@/components/sidebar/AdminHeader.vue'
import AdminTable from '@/components/base/AdminTable.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import CandidateDetailsModal from '@/components/modals/CandidateDetailsModal.vue'
import { adminCandidatesApi } from '@/api/adminService'
import type { CandidateProfileResponse } from '@/api/cvService'

const { t } = useI18n()

interface Candidate {
  id: string
  name: string
  email: string
  location?: string
  skills: string[]
  experience: number
  education?: string
  predictedRole?: string
  aiMatchScore: number
  appliedAt: string
  summary?: string
}

const searchQuery = ref('')
const roleFilter = ref('')
const scoreFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalElements = ref(0)
const isLoading = ref(false)
const error = ref('')
const success = ref('')

const candidates = ref<Candidate[]>([])

const columns = computed(() => [
  { key: 'name', label: t('admin.candidates.fullName') },
  { key: 'role', label: 'Role' },
  { key: 'skills', label: t('admin.candidates.skills') },
  { key: 'experience', label: t('admin.candidates.experience') },
  { key: 'score', label: t('admin.candidates.matchScore') },
  { key: 'applied', label: 'Applied', hideOn: 'md' as const },
  { key: 'actions', label: t('admin.candidates.actions'), align: 'right' as const }
])

const fetchList = async () => {
  isLoading.value = true
  try {
    const res = await adminCandidatesApi.getAll({
      page: currentPage.value - 1,
      size: pageSize.value,
      search: searchQuery.value || undefined
    })
    if (res.data.success) {
      const list = res.data.data.content || []
      candidates.value = list.map((c: any) => ({
        id: c.id,
        name: c.fullName || c.profile?.fullName || c.username || '—',
        email: c.email || '',
        location: c.location || c.profile?.location,
        skills: c.skills || [],
        experience: c.experience || c.profile?.yearsOfExperience || 0,
        education: c.education,
        predictedRole: c.predictedRole || c.profile?.predictedRole,
        aiMatchScore: c.aiMatchScore ?? c.matchScore ?? 0,
        appliedAt: c.appliedAt || c.createdAt
      }))
      totalElements.value = res.data.data.totalElements ?? candidates.value.length
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

const filtered = computed(() => {
  let list = candidates.value
  if (roleFilter.value) {
    list = list.filter((c) => (c.predictedRole || '').toLowerCase().includes(roleFilter.value.toLowerCase()))
  }
  if (scoreFilter.value) {
    list = list.filter((c) => {
      if (scoreFilter.value === '80+') return c.aiMatchScore >= 80
      if (scoreFilter.value === '60-80') return c.aiMatchScore >= 60 && c.aiMatchScore < 80
      if (scoreFilter.value === '<60') return c.aiMatchScore < 60
      return true
    })
  }
  return list
})

const handleSearch = () => { currentPage.value = 1; fetchList() }
const handlePageChange = (p: number) => { currentPage.value = p; fetchList() }

const resetFilters = () => {
  searchQuery.value = ''
  roleFilter.value = ''
  scoreFilter.value = ''
  currentPage.value = 1
}

const formatDate = (iso?: string) => {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString() } catch { return iso }
}

const showDetails = ref(false)
const selectedCandidate = ref<CandidateProfileResponse | null>(null)

const viewDetails = (c: Candidate) => {
  selectedCandidate.value = { ...c, fullName: c.name } as unknown as CandidateProfileResponse
  showDetails.value = true
}

const exportCandidates = async () => {
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
  } catch {
    error.value = t('admin.common.error')
  }
}

onMounted(fetchList)
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
        <BaseButton variant="secondary" @click="exportCandidates">
          <Download class="w-4 h-4 mr-2" />
          {{ t('admin.candidates.export') }}
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
        :search-placeholder="t('admin.candidates.searchPlaceholder')"
        v-model:search-model-value="searchQuery"
        :total-elements="totalElements"
        :page="currentPage"
        :page-size="pageSize"
        :empty-title="t('admin.candidates.noCandidates')"
        @search="handleSearch"
        @page-change="handlePageChange"
      >
        <template #toolbar>
          <select v-model="roleFilter" @change="handleSearch" class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
            <option value="">All roles</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="fullstack">Full-stack</option>
            <option value="devops">DevOps</option>
          </select>
          <select v-model="scoreFilter" @change="handleSearch" class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
            <option value="">All scores</option>
            <option value="80+">80%+</option>
            <option value="60-80">60% - 80%</option>
            <option value="<60">&lt; 60%</option>
          </select>
          <BaseButton variant="secondary" @click="resetFilters">
            <RefreshCw class="w-4 h-4" />
          </BaseButton>
        </template>

        <template #rows="{ items }">
          <tr v-for="c in items" :key="c.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                  {{ (c.name || '?').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-slate-900 dark:text-white truncate">{{ c.name }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ c.email }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
              {{ c.predictedRole || '—' }}
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1 max-w-[200px]">
                <span
                  v-for="skill in c.skills.slice(0, 2)"
                  :key="skill"
                  class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs"
                >
                  {{ skill }}
                </span>
                <span
                  v-if="c.skills.length > 2"
                  class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs"
                >
                  +{{ c.skills.length - 2 }}
                </span>
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
              {{ c.experience }} năm
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="flex-1 max-w-[80px] h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    :style="{ width: `${Math.min(100, c.aiMatchScore)}%` }"
                  />
                </div>
                <span class="text-xs font-medium text-slate-700 dark:text-slate-300">{{ Math.round(c.aiMatchScore) }}%</span>
              </div>
            </td>
            <td class="px-4 py-3 hidden lg:table-cell text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {{ formatDate(c.appliedAt) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <button @click="viewDetails(c)" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" :title="t('admin.candidates.viewProfile')">
                  <Eye class="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </button>
                <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" :title="t('admin.candidates.export')">
                  <Download class="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </button>
                <button class="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors" :title="t('common.delete')">
                  <Trash2 class="w-4 h-4 text-red-500" />
                </button>
              </div>
            </td>
          </tr>
        </template>
      </AdminTable>
    </div>

    <CandidateDetailsModal
      :is-open="showDetails"
      :candidate="selectedCandidate"
      @close="showDetails = false"
    />
  </AdminLayout>
</template>
