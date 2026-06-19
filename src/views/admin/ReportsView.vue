<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  BarChart3, Download, FileText, Users, Briefcase, Bot,
  Building2, UserCheck, DollarSign, AlertCircle, Check, Calendar
} from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminHeader from '@/components/sidebar/AdminHeader.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { adminReportsApi } from '@/api/adminService'

const { t } = useI18n()

const fromDate = ref('')
const toDate = ref('')
const isLoading = ref<string | null>(null)
const error = ref('')
const success = ref('')

interface ReportType {
  key: string
  icon: any
  color: string
  descriptionKey: string
}

const reports: ReportType[] = [
  { key: 'users', icon: Users, color: 'blue', descriptionKey: 'admin.reports.descriptions.users' },
  { key: 'jobs', icon: Briefcase, color: 'green', descriptionKey: 'admin.reports.descriptions.jobs' },
  { key: 'applications', icon: FileText, color: 'purple', descriptionKey: 'admin.reports.descriptions.applications' },
  { key: 'recruiters', icon: Building2, color: 'orange', descriptionKey: 'admin.reports.descriptions.recruiters' },
  { key: 'candidates', icon: UserCheck, color: 'cyan', descriptionKey: 'admin.reports.descriptions.candidates' },
  { key: 'ai', icon: Bot, color: 'indigo', descriptionKey: 'admin.reports.descriptions.ai' },
  { key: 'revenue', icon: DollarSign, color: 'emerald', descriptionKey: 'admin.reports.descriptions.revenue' }
]

const colorClasses = (color: string, type: 'bg' | 'text' | 'border') => {
  const map: Record<string, Record<string, string>> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
    cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' },
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' }
  }
  return map[color]?.[type] || ''
}

const flash = (msg: string) => {
  success.value = msg
  setTimeout(() => (success.value = ''), 3000)
}

const params = computed(() => ({
  startDate: fromDate.value || undefined,
  endDate: toDate.value || undefined
}))

const generate = async (type: string) => {
  isLoading.value = type
  error.value = ''
  try {
    await adminReportsApi.getReport(type, params.value)
    flash(t('admin.reports.generateSuccess'))
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    isLoading.value = null
  }
}

const exportFile = async (type: string, format: 'excel' | 'pdf') => {
  isLoading.value = `${type}-${format}`
  try {
    const res = format === 'excel'
      ? await adminReportsApi.exportExcel(type, params.value)
      : await adminReportsApi.exportPdf(type, params.value)
    const blob = new Blob([res.data], { type: format === 'excel' ? 'application/vnd.ms-excel' : 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}-report-${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`
    a.click()
    window.URL.revokeObjectURL(url)
    flash(t('admin.reports.exportSuccess'))
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    isLoading.value = null
  }
}
</script>

<template>
  <AdminLayout>
    <AdminHeader />

    <div class="p-4 md:p-6">
      <div class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          {{ t('admin.reports.title') }}
        </h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          {{ t('admin.reports.subtitle') }}
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

      <!-- Date range -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-6 transition-colors">
        <h3 class="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Calendar class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          {{ t('admin.reports.dateRange') }}
        </h3>
        <div class="grid md:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">{{ t('admin.reports.from') }}</label>
            <input
              v-model="fromDate"
              type="date"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">{{ t('admin.reports.to') }}</label>
            <input
              v-model="toDate"
              type="date"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- Reports grid -->
      <h3 class="font-semibold text-slate-900 dark:text-white mb-4">{{ t('admin.reports.available') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="r in reports"
          :key="r.key"
          :class="['bg-white dark:bg-slate-900 rounded-2xl p-6 border transition-colors', colorClasses(r.color, 'border')]"
        >
          <div class="flex items-start gap-3 mb-4">
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center shrink-0', colorClasses(r.color, 'bg')]">
              <component :is="r.icon" :class="['w-6 h-6', colorClasses(r.color, 'text')]" />
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-slate-900 dark:text-white">
                {{ t(`admin.reports.types.${r.key}`) }}
              </h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {{ t(r.descriptionKey) }}
              </p>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-1.5">
            <BaseButton
              variant="primary"
              size="sm"
              :disabled="isLoading === r.key"
              @click="generate(r.key)"
            >
              <BarChart3 class="w-3.5 h-3.5" />
            </BaseButton>
            <BaseButton
              variant="secondary"
              size="sm"
              :disabled="isLoading === `${r.key}-excel`"
              @click="exportFile(r.key, 'excel')"
            >
              <Download class="w-3.5 h-3.5" />
              <span class="hidden lg:inline ml-1 text-xs">XLS</span>
            </BaseButton>
            <BaseButton
              variant="secondary"
              size="sm"
              :disabled="isLoading === `${r.key}-pdf`"
              @click="exportFile(r.key, 'pdf')"
            >
              <Download class="w-3.5 h-3.5" />
              <span class="hidden lg:inline ml-1 text-xs">PDF</span>
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
