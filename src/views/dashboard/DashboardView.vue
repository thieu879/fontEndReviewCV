<template>
  <MainLayout>
    <!-- Page Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-1">{{ t('dashboard.welcome') }}, {{ userFirstName }}</h1>
        <p class="text-slate-500 dark:text-slate-400 text-sm">{{ t('dashboard.subtitle') }}</p>
      </div>
      <BaseButton variant="primary" @click="$router.push('/upload')">
        <FileText class="w-4 h-4" />
        {{ t('nav.upload') }}
      </BaseButton>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <Loader2 class="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      <span class="ml-3 text-slate-500 dark:text-slate-400">{{ t('common.loading') || 'Loading...' }}</span>
    </div>

    <template v-else>
      <!-- Stat Cards -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          v-for="stat in statsData"
          :key="stat.label"
          :title="stat.label"
          :value="stat.value"
          :change="stat.change?.toString() || ''"
          :change-type="stat.change !== null ? (stat.change >= 0 ? 'positive' : 'negative') : 'neutral'"
          :icon="stat.icon"
        />
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-5 gap-5">

        <!-- Recent Activity Table -->
        <div class="col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <h2 class="font-bold text-slate-900 dark:text-white">{{ t('dashboard.recentActivity') }}</h2>
            <router-link to="/analysis" class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">{{ t('common.viewAll') || 'View All' }}</router-link>
          </div>
          <div v-if="recentCandidates.length === 0" class="text-center py-10 text-slate-400 dark:text-slate-500">
            <FileText class="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{{ t('dashboard.noRecentActivity') || 'No recent activity' }}</p>
          </div>
          <table v-else class="w-full">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-800/50">
                <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{{ t('analysis.candidateName') }}</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{{ t('analysis.appliedFor') || 'Applied For' }}</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{{ t('analysis.score') }}</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{{ t('cv.status') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr
                v-for="c in recentCandidates"
                :key="c.id"
                class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                @click="$router.push(`/analysis?candidate=${c.id}`)"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <BaseAvatar :name="c.name" size="sm" />
                    <div>
                      <div class="text-sm font-semibold text-slate-900 dark:text-white">{{ c.name }}</div>
                      <div class="text-xs text-slate-500 dark:text-slate-400">{{ c.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{{ c.role }}</td>
                <td class="px-4 py-4">
                  <div v-if="c.status !== 'PROCESSING' && c.status !== 'PENDING'">
                    <BaseScoreBar :score="c.score" size="sm" />
                  </div>
                  <div v-else class="flex items-center gap-2">
                    <BaseProgress :value="33" size="sm" color="slate" />
                    <span class="text-slate-400 text-xs">···</span>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <BaseBadge
                    :variant="getStatusVariant(c.status)"
                    size="sm"
                  >{{ formatStatus(c.status) }}</BaseBadge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Upload Trend Chart -->
        <div class="col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h2 class="font-bold text-slate-900 dark:text-white mb-5">{{ t('dashboard.uploadTrend') || 'Upload Trend' }}</h2>
          <div class="flex items-end justify-between gap-2 h-40 mb-3">
            <div v-for="(bar, i) in uploadTrend" :key="i" class="flex-1 flex flex-col items-center gap-1">
              <div class="w-full rounded-t-md transition-all"
                :style="`height: ${bar.height || 5}%; background: ${bar.active ? '#2563eb' : '#bfdbfe'}`"></div>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span v-for="day in trendDays" :key="day"
              class="flex-1 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">{{ day }}</span>
          </div>
        </div>

      </div>
    </template>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import MainLayout from '@/layouts/MainLayout.vue';
import StatCard from '@/components/common/StatCard.vue';
import { BaseAvatar, BaseBadge, BaseButton, BaseProgress, BaseScoreBar } from '@/components/base';
import { useAuth } from '@/composables/useAuth';
import dashboardService from '@/api/dashboardService';
import {
  FileText, FolderOpen, CheckCircle2, RefreshCw, AlertCircle, Loader2
} from 'lucide-vue-next';

const { t } = useI18n();
const { user, checkAuth } = useAuth();

const isLoading = ref(false);
const dashboardData = ref<any>(null);

const trendDays = computed(() => ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);

const uploadTrend = computed(() => {
  if (!dashboardData.value?.uploadTrend) return [
    { height: 45, active: false }, { height: 55, active: false }, { height: 60, active: false },
    { height: 85, active: true }, { height: 70, active: false }, { height: 65, active: false }, { height: 50, active: false },
  ];
  return dashboardData.value.uploadTrend;
});

const recentCandidates = computed(() => {
  if (!dashboardData.value?.recentCandidates) return [];
  return dashboardData.value.recentCandidates;
});

const statsData = computed(() => [
  {
    label: t('dashboard.totalUploaded') || 'Total Uploaded',
    value: dashboardData.value?.totalUploaded ?? 0,
    change: dashboardData.value?.totalUploadedGrowth ?? null,
    badge: 'pill',
    icon: FolderOpen,
  },
  {
    label: t('dashboard.analyzed') || 'Analyzed',
    value: dashboardData.value?.analyzed ?? 0,
    change: dashboardData.value?.analyzedGrowth ?? null,
    badge: 'pill',
    icon: CheckCircle2,
  },
  {
    label: t('dashboard.processing') || 'Processing',
    value: dashboardData.value?.processing ?? 0,
    change: null,
    badge: 'active',
    icon: RefreshCw,
  },
  {
    label: t('dashboard.failed') || 'Failed',
    value: dashboardData.value?.failed ?? 0,
    change: null,
    badge: 'pill',
    icon: AlertCircle,
  }
]);

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'ANALYZED': return 'success';
    case 'PROCESSING': return 'info';
    case 'FAILED': return 'danger';
    default: return 'default';
  }
};

const formatStatus = (status: string) => {
  const map: Record<string, string> = {
    'ANALYZED': 'Analyzed',
    'PROCESSING': 'Processing',
    'PENDING': 'Pending',
    'FAILED': 'Failed',
  };
  return map[status] || status;
};

const fetchDashboard = async () => {
  isLoading.value = true;
  try {
    dashboardData.value = await dashboardService.getDashboard();
  } catch (error) {
    console.error('Failed to fetch dashboard:', error);
  } finally {
    isLoading.value = false;
  }
};

const userName = computed(() => {
  return user.value?.name || user.value?.username || user.value?.email || 'Guest';
});

const userFirstName = computed(() => {
  const name = userName.value;
  return name.split(' ')[0];
});

onMounted(async () => {
  await checkAuth();
  await fetchDashboard();
});
</script>
