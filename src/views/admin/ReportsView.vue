<template>
  <AdminLayout>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white mb-2">Báo cáo & Phân tích</h1>
      <p class="text-slate-400">Theo dõi và phân tích hiệu suất hệ thống</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <Loader2 class="w-10 h-10 animate-spin text-blue-400" />
      <span class="ml-3 text-slate-400">Đang tải dữ liệu...</span>
    </div>

    <template v-else>
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng người dùng"
          :value="stats.totalUsers.toLocaleString()"
          :change="`+${formatGrowth(stats.userGrowthPercentage)}%`"
          change-type="positive"
          :icon="Users"
        />
        <StatCard
          title="Tổng CV"
          :value="stats.totalCVs.toLocaleString()"
          :change="`+${formatGrowth(stats.cvGrowthPercentage)}%`"
          change-type="positive"
          :icon="FileText"
        />
        <StatCard
          title="Phân tích hoàn thành"
          :value="stats.totalAnalyses.toLocaleString()"
          :change="`+${formatGrowth(stats.analysisGrowthPercentage)}%`"
          change-type="positive"
          :icon="BarChart3"
        />
        <StatCard
          title="Hoạt động hôm nay"
          :value="stats.activeToday.toLocaleString()"
          :change="'Live'"
          change-type="neutral"
          :icon="Zap"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Weekly Analysis Chart -->
        <div class="lg:col-span-2 bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-white">Phân tích theo tuần</h2>
            <select v-model="selectedPeriod" class="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
              <option value="year">12 tháng</option>
            </select>
          </div>
          <div class="h-64 flex items-end justify-between gap-2">
            <div v-for="(day, index) in weeklyData" :key="index" class="flex-1 flex flex-col items-center gap-2">
              <div class="w-full bg-blue-500/30 hover:bg-blue-500/50 rounded-t-lg transition-colors relative group cursor-pointer">
                <div
                  class="w-full bg-blue-500 rounded-t-lg transition-all"
                  :style="{ height: day.height + '%', minHeight: day.height > 0 ? '4px' : '0' }"
                ></div>
                <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {{ day.value }} CV
                </div>
              </div>
              <span class="text-xs text-slate-500">{{ day.label }}</span>
            </div>
          </div>
        </div>

        <!-- Skills Distribution -->
        <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 class="text-lg font-semibold text-white mb-6">Kỹ năng hot</h2>
          <div class="space-y-4">
            <div v-for="(skill, index) in topSkills" :key="skill.name" class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-300">{{ skill.name }}</span>
                <span class="text-white font-medium">{{ skill.count.toLocaleString() }}</span>
              </div>
              <BaseProgress :value="getSkillWidth(index)" color="purple" size="sm" />
            </div>
            <div v-if="topSkills.length === 0" class="text-center text-slate-500 py-8">
              <BarChart3 class="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p class="text-sm">Chưa có dữ liệu</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Activity -->
        <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-white">Hoạt động gần đây</h2>
            <button class="text-sm text-blue-400 hover:text-blue-300">Xem tất cả</button>
          </div>
          <div class="space-y-4">
            <div v-for="activity in recentActivities" :key="activity.id" class="flex items-start gap-4 p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700/70 transition-colors">
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', activity.bgColor]">
                <component :is="getIcon(activity.icon)" :class="['w-5 h-5', activity.iconColor]" />
              </div>
              <div class="flex-1">
                <p class="text-white font-medium">{{ activity.title }}</p>
                <p class="text-slate-400 text-sm">{{ activity.description }}</p>
              </div>
              <span class="text-slate-500 text-sm">{{ activity.time }}</span>
            </div>
            <div v-if="recentActivities.length === 0" class="text-center text-slate-500 py-8">
              <Activity class="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p class="text-sm">Chưa có hoạt động nào</p>
            </div>
          </div>
        </div>

        <!-- Top Candidates -->
        <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-white">Ứng viên nổi bật</h2>
            <router-link to="/search" class="text-sm text-blue-400 hover:text-blue-300">Xem tất cả</router-link>
          </div>
          <div class="space-y-4">
            <div
              v-for="(candidate, index) in topCandidates"
              :key="candidate.id"
              class="flex items-center gap-4 p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700/70 transition-colors cursor-pointer"
              @click="$router.push(`/analysis?candidate=${candidate.id}`)"
            >
              <div class="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-slate-300 font-bold text-sm">
                {{ index + 1 }}
              </div>
              <BaseAvatar :name="candidate.name" size="md" shape="rounded" />
              <div class="flex-1">
                <p class="text-white font-medium">{{ candidate.name }}</p>
                <p class="text-slate-400 text-sm">{{ candidate.role }}</p>
              </div>
              <div class="text-right">
                <div class="text-green-400 font-bold">{{ candidate.score }}%</div>
                <div class="text-slate-500 text-xs">Match</div>
              </div>
            </div>
            <div v-if="topCandidates.length === 0" class="text-center text-slate-500 py-8">
              <Users class="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p class="text-sm">Chưa có ứng viên</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import StatCard from '@/components/common/StatCard.vue';
import { BaseAvatar, BaseProgress } from '@/components/base';
import dashboardService, { type AdminDashboardResponse } from '@/api/dashboardService';
import analysisService from '@/api/analysisService';
import {
  Users, FileText, BarChart3, Zap, Activity,
  Upload, CheckCircle, UserPlus, AlertCircle, LogIn, LogOut, Trash2, AlertTriangle
} from 'lucide-vue-next';

const isLoading = ref(false);
const selectedPeriod = ref('week');
const adminData = ref<AdminDashboardResponse | null>(null);
const topCandidates = ref<any[]>([]);

const stats = computed(() => ({
  totalUsers: adminData.value?.totalUsers ?? 0,
  totalCVs: adminData.value?.totalCVs ?? 0,
  totalAnalyses: adminData.value?.totalAnalyses ?? 0,
  activeToday: adminData.value?.activeToday ?? 0,
  userGrowthPercentage: adminData.value?.userGrowthPercentage ?? 0,
  cvGrowthPercentage: adminData.value?.cvGrowthPercentage ?? 0,
  analysisGrowthPercentage: adminData.value?.analysisGrowthPercentage ?? 0,
}));

const weeklyData = computed(() => {
  if (!adminData.value?.weeklyAnalysisTrend) {
    return [
      { label: 'T2', value: 245, height: 60 }, { label: 'T3', value: 312, height: 75 },
      { label: 'T4', value: 289, height: 70 }, { label: 'T5', value: 356, height: 85 },
      { label: 'T6', value: 420, height: 100 }, { label: 'T7', value: 198, height: 48 },
      { label: 'CN', value: 156, height: 38 }
    ];
  }
  return adminData.value.weeklyAnalysisTrend;
});

const topSkills = computed(() => {
  if (!adminData.value?.skillsDistribution) return [];
  const dist = adminData.value.skillsDistribution as Record<string, number>;
  return Object.entries(dist)
    .map(([name, count]) => ({ name, count: count as number }))
    .slice(0, 5);
});

const recentActivities = computed(() => {
  return (adminData.value?.recentActivities ?? []).map((a: any) => ({
    ...a,
    bgColor: a.bgColor || 'bg-slate-500/20',
    iconColor: a.iconColor || 'text-slate-400',
    icon: a.icon || 'Activity'
  }));
});

const getSkillWidth = (index: number) => {
  if (topSkills.value.length === 0) return 0;
  const max = topSkills.value[0]?.count || 1;
  return Math.round((topSkills.value[index]?.count / max) * 100);
};

const formatGrowth = (value: number) => {
  return value > 0 ? value.toFixed(1) : '0';
};

const getIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    Upload, CheckCircle, UserPlus, AlertCircle, LogIn, LogOut, Trash2, AlertTriangle, Activity, BarChart3
  };
  return iconMap[iconName] || Activity;
};

const fetchAdminData = async () => {
  isLoading.value = true;
  try {
    adminData.value = await dashboardService.getAdminDashboard();
  } catch (error) {
    console.error('Failed to fetch admin dashboard:', error);
  } finally {
    isLoading.value = false;
  }
};

const fetchTopCandidates = async () => {
  try {
    const candidates = await analysisService.getTopCandidates(10, 0);
    topCandidates.value = candidates.map((c: any) => ({
      id: c.id,
      name: c.fullName || 'Unknown',
      initials: getInitials(c.fullName || 'Unknown'),
      role: c.suggestedPositions?.[0] || 'Undetermined',
      score: Math.round(c.aiScore || 0),
    }));
  } catch (error) {
    console.error('Failed to fetch top candidates:', error);
  }
};

const getInitials = (name: string) => {
  if (!name || name === 'Unknown') return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

watch(selectedPeriod, () => {
  // Có thể gọi API khác tùy period
});

onMounted(async () => {
  await Promise.all([fetchAdminData(), fetchTopCandidates()]);
});
</script>
