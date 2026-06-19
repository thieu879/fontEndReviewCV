<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import {
  Users, Briefcase, FileText, Bot, TrendingUp, TrendingDown,
  CheckCircle, Activity, UserCheck, RefreshCw, Clock
} from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { adminDashboardApi, adminAuditApi, type DashboardStats } from '@/api/adminService'

const { t } = useI18n()
const { isDark } = useTheme()

const isLoading = ref(true)
const error = ref('')

const stats = ref<DashboardStats>({
  totalUsers: 0,
  totalCandidates: 0,
  totalRecruiters: 0,
  totalJobs: 0,
  totalApplications: 0,
  totalCvAnalyses: 0,
  activeJobs: 0,
  pendingApprovals: 0,
  userGrowthTrend: [],
  applicationTrend: [],
  jobPostingTrend: [],
  topRecruiters: [],
  mostViewedJobs: [],
  lastUpdated: ''
})

interface Activity {
  id: string
  message: string
  time: string
  icon: any
  type: string
}

const recentActivity = ref<Activity[]>([])

const formatNumber = (num: number | undefined) => {
  return new Intl.NumberFormat(isDark() ? 'en-US' : 'en-US').format(num ?? 0)
}

const formatRelativeTime = (iso: string) => {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(diff) || diff < 0) return ''
  const m = Math.floor(diff / 60000)
  if (m < 1) return t('candidateModal.justNow')
  if (m < 60) return t('candidateModal.minutesAgo', { n: m })
  const h = Math.floor(m / 60)
  if (h < 24) return t('candidateModal.hoursAgo', { n: h })
  return t('candidateModal.daysAgo', { n: Math.floor(h / 24) })
}

const activityIconFor = (action: string) => {
  const a = (action || '').toUpperCase()
  if (a.includes('LOGIN') || a.includes('REGISTER')) return UserCheck
  if (a.includes('APPROVE')) return CheckCircle
  if (a.includes('AI')) return Bot
  if (a.includes('APPLICATION')) return FileText
  return Activity
}

const fetchDashboard = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const [statsRes] = await Promise.all([
      adminDashboardApi.getStats(),
    ])

    if (statsRes?.data?.success) {
      stats.value = { ...stats.value, ...statsRes.data.data }
    }

    // Fetch activity feed from the dashboard service
    try {
      const activityRes = await adminDashboardApi.getActivityFeed(6)
      if (activityRes?.data?.success) {
        const feed: any[] = activityRes.data.data || []
        recentActivity.value = feed.map((item) => ({
          id: item.id || Math.random().toString(),
          message: item.description || item.type || 'Activity',
          time: formatRelativeTime(item.timestamp),
          icon: activityIconFor(item.type || ''),
          type: item.type || ''
        }))
      }
    } catch {
      // Activity feed is optional — fail silently
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    isLoading.value = false
  }
}

const refresh = () => fetchDashboard()

onMounted(fetchDashboard)
</script>

<template>
  <AdminLayout>
    <div class="p-4 md:p-6">
      <!-- Header -->
      <div class="flex items-start justify-between mb-6 gap-3">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {{ t('admin.dashboard.title') }}
          </h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {{ t('admin.dashboard.subtitle') }}
          </p>
        </div>
        <button
          @click="refresh"
          class="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
          :disabled="isLoading"
        >
          <RefreshCw :class="['w-4 h-4', isLoading ? 'animate-spin' : '']" />
          <span class="hidden sm:inline">{{ t('admin.common.refresh') }}</span>
        </button>
      </div>

      <!-- Error -->
      <div
        v-if="error"
        class="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl"
      >
        <p class="text-red-700 dark:text-red-400 text-sm">{{ error }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="i in 4"
            :key="i"
            class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 animate-pulse"
          >
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
            </div>
            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-3"></div>
            <div class="h-7 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
          </div>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div v-else class="space-y-6">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users class="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div class="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                <TrendingUp class="w-3.5 h-3.5" />
              </div>
            </div>
            <h3 class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {{ t('admin.dashboard.stats.totalUsers') }}
            </h3>
            <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {{ formatNumber(stats.totalUsers) }}
            </p>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Briefcase class="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div class="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                <TrendingUp class="w-3.5 h-3.5" />
              </div>
            </div>
            <h3 class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {{ t('admin.dashboard.stats.totalJobs') }}
            </h3>
            <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {{ formatNumber(stats.totalJobs) }}
            </p>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <FileText class="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div class="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                <TrendingDown class="w-3.5 h-3.5" />
              </div>
            </div>
            <h3 class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {{ t('admin.dashboard.stats.totalApplications') }}
            </h3>
            <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {{ formatNumber(stats.totalApplications) }}
            </p>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Bot class="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div class="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                <TrendingUp class="w-3.5 h-3.5" />
              </div>
            </div>
            <h3 class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {{ t('admin.dashboard.stats.aiAnalyses') }}
            </h3>
            <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {{ formatNumber(stats.totalCvAnalyses) }}
            </p>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
            <h3 class="font-semibold text-slate-900 dark:text-white mb-6">
              {{ t('admin.dashboard.userGrowth') }}
            </h3>
            <div v-if="stats.userGrowthTrend?.length" class="h-64 flex items-end justify-between gap-1">
              <div
                v-for="(d, idx) in stats.userGrowthTrend"
                :key="idx"
                class="flex-1 flex flex-col items-center group"
              >
                <div class="w-full bg-blue-500/20 dark:bg-blue-400/20 rounded-t-lg relative">
                  <div
                    class="w-full bg-gradient-to-t from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-400 rounded-t-lg transition-all hover:opacity-90"
                    :style="{ height: `${Math.max(8, (d.count / Math.max(...stats.userGrowthTrend!.map(x => x.count), 1)) * 220)}px` }"
                  >
                    <div class="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                      {{ formatNumber(d.count) }}
                    </div>
                  </div>
                </div>
                <span class="text-[10px] text-slate-500 dark:text-slate-400 mt-2 truncate w-full text-center">
                  {{ d.date }}
                </span>
              </div>
            </div>
            <div v-else class="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
              {{ t('admin.dashboard.noDataChart') }}
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
            <h3 class="font-semibold text-slate-900 dark:text-white mb-6">
              {{ t('admin.dashboard.applicationTrend') }}
            </h3>
            <div v-if="stats.applicationTrend?.length" class="h-64 flex items-end justify-between gap-1">
              <div
                v-for="(d, idx) in stats.applicationTrend"
                :key="idx"
                class="flex-1 flex flex-col items-center group"
              >
                <div class="w-full bg-purple-500/20 dark:bg-purple-400/20 rounded-t-lg relative">
                  <div
                    class="w-full bg-gradient-to-t from-purple-600 to-purple-500 dark:from-purple-500 dark:to-purple-400 rounded-t-lg transition-all hover:opacity-90"
                    :style="{ height: `${Math.max(8, (d.count / Math.max(...stats.applicationTrend!.map(x => x.count), 1)) * 220)}px` }"
                  >
                    <div class="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                      {{ formatNumber(d.count) }}
                    </div>
                  </div>
                </div>
                <span class="text-[10px] text-slate-500 dark:text-slate-400 mt-2 truncate w-full text-center">
                  {{ d.date }}
                </span>
              </div>
            </div>
            <div v-else class="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
              {{ t('admin.dashboard.noDataChart') }}
            </div>
          </div>
        </div>

        <!-- Bottom Row -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
            <h3 class="font-semibold text-slate-900 dark:text-white mb-4">
              {{ t('admin.dashboard.recentActivity') }}
            </h3>
            <div v-if="recentActivity.length" class="space-y-2">
              <div
                v-for="a in recentActivity"
                :key="a.id"
                class="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <component :is="a.icon" class="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-slate-900 dark:text-white truncate">{{ a.message }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock class="w-3 h-3" />
                    {{ a.time }}
                  </p>
                </div>
              </div>
            </div>
            <div v-else class="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              {{ t('admin.dashboard.noDataList') }}
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-slate-900 dark:text-white">
                {{ t('admin.dashboard.topRecruiters') }}
              </h3>
            </div>
            <div v-if="stats.topRecruiters?.length" class="space-y-2">
              <div
                v-for="(r, idx) in stats.topRecruiters.slice(0, 5)"
                :key="r.id"
                class="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span class="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {{ idx + 1 }}
                </span>
                <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                  {{ (r.companyName ?? '?').charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {{ r.companyName }}
                  </p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">
                    {{ r.activeJobsCount }} {{ t('admin.dashboard.stats.totalJobs').toLowerCase() }}
                  </p>
                </div>
                <span class="text-xs font-medium text-green-600 dark:text-green-400">
                  {{ Math.round(r.averageResponseRate ?? 0) }}%
                </span>
              </div>
            </div>
            <div v-else class="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              {{ t('admin.dashboard.noDataList') }}
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-slate-900 dark:text-white">
                {{ t('admin.dashboard.mostViewedJobs') }}
              </h3>
            </div>
            <div v-if="stats.mostViewedJobs?.length" class="space-y-2">
              <div
                v-for="job in stats.mostViewedJobs.slice(0, 5)"
                :key="job.id"
                class="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <p class="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {{ job.title }}
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {{ job.companyName }}
                </p>
                <div class="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{{ formatNumber(job.viewCount) }} views</span>
                  <span>•</span>
                  <span>{{ job.applicationCount }} apps</span>
                </div>
              </div>
            </div>
            <div v-else class="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              {{ t('admin.dashboard.noDataList') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
