<template>
  <AdminLayout>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white mb-2">Tổng quan Admin</h1>
      <p class="text-slate-400">Quản lý hệ thống CV Analyzer</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <Loader2 class="w-10 h-10 animate-spin text-blue-400" />
      <span class="ml-3 text-slate-400">Đang tải dữ liệu...</span>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          :title="'Tổng người dùng'"
          :value="stats.totalUsers.toLocaleString()"
          :change="stats.userGrowth >= 0 ? `+${stats.userGrowth}%` : `${stats.userGrowth}%`"
          :change-type="stats.userGrowth >= 0 ? 'positive' : 'negative'"
          :icon="Users"
        />
        <StatCard
          :title="'CV đã phân tích'"
          :value="stats.totalCVs.toLocaleString()"
          :change="`+${stats.cvGrowth}%`"
          change-type="positive"
          :icon="FileText"
        />
        <StatCard
          :title="'Phân tích hoàn thành'"
          :value="stats.totalAnalyses.toLocaleString()"
          :change="`+${stats.analysisGrowth}%`"
          change-type="positive"
          :icon="UserCheck"
        />
        <StatCard
          :title="'Hoạt động hôm nay'"
          :value="stats.activeToday.toLocaleString()"
          :change="'Người dùng online'"
          change-type="neutral"
          :icon="Activity"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Activity Feed -->
        <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-white">Hoạt động hệ thống</h2>
            <select v-model="selectedPeriod" class="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>7 ngày gần nhất</option>
              <option>30 ngày gần nhất</option>
            </select>
          </div>
          <div class="space-y-4">
            <div v-for="activity in recentActivities" :key="activity.id" class="flex items-start gap-4 p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700/70 transition-colors">
              <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', activity.bgColor]">
                <component :is="getIcon(activity.icon)" :class="['w-5 h-5', activity.iconColor]" />
              </div>
              <div class="flex-1">
                <p class="font-medium text-white">{{ activity.title }}</p>
                <p class="text-sm text-slate-400">{{ activity.description }}</p>
              </div>
              <span class="text-sm text-slate-500">{{ activity.time }}</span>
            </div>
            <div v-if="recentActivities.length === 0" class="text-center text-slate-500 py-8">
              <Activity class="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p class="text-sm">Chưa có hoạt động nào</p>
            </div>
          </div>
        </div>

        <!-- Active Users -->
        <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-white">Người dùng hoạt động</h2>
            <router-link to="/admin/users" class="text-sm text-blue-400 hover:text-blue-300">Quản lý</router-link>
          </div>
          <div class="space-y-3">
            <div v-for="user in activeUsers" :key="user.id" class="flex items-center gap-4 p-3 bg-slate-700/50 rounded-xl hover:bg-slate-700/70 transition-colors">
              <BaseAvatar :name="user.name" size="md" shape="rounded" />
              <div class="flex-1">
                <p class="font-medium text-white">{{ user.name }}</p>
                <p class="text-sm text-slate-400">{{ user.email }}</p>
              </div>
              <BaseBadge variant="success" size="sm">{{ user.activity }}</BaseBadge>
            </div>
            <div v-if="activeUsers.length === 0" class="text-center text-slate-500 py-8">
              <Users class="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p class="text-sm">Chưa có người dùng</p>
            </div>
          </div>
        </div>
      </div>

      <!-- System Logs -->
      <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-white">Nhật ký hệ thống gần đây</h2>
          <router-link to="/admin/logs" class="text-sm text-blue-400 hover:text-blue-300">Xem tất cả</router-link>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-700">
                <th class="text-left py-3 px-4 text-sm font-medium text-slate-400">Thời gian</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-slate-400">Hành động</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-slate-400">Người dùng</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-slate-400">Chi tiết</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-slate-400">Cấp độ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in recentLogs" :key="log.id" class="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td class="py-3 px-4 text-sm text-slate-400">{{ log.time }}</td>
                <td class="py-3 px-4 text-sm text-white">{{ log.action }}</td>
                <td class="py-3 px-4 text-sm text-slate-300">{{ log.user }}</td>
                <td class="py-3 px-4 text-sm text-slate-400">{{ log.details }}</td>
                <td class="py-3 px-4">
                  <BaseBadge :variant="getLogVariant(log.level)" size="sm">{{ log.level }}</BaseBadge>
                </td>
              </tr>
              <tr v-if="recentLogs.length === 0">
                <td colspan="5" class="py-8 text-center text-slate-500">Chưa có nhật ký nào</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import StatCard from '@/components/common/StatCard.vue';
import { BaseAvatar, BaseBadge } from '@/components/base';
import dashboardService, { type AdminDashboardResponse } from '@/api/dashboardService';
import {
  Users, FileText, UserCheck, Activity, Loader2,
  Upload, LogIn, AlertTriangle, CheckCircle, UserPlus, AlertCircle, LogOut, Trash2
} from 'lucide-vue-next';

const isLoading = ref(false);
const selectedPeriod = ref('7 ngày gần nhất');
const adminData = ref<AdminDashboardResponse | null>(null);

const stats = computed(() => ({
  totalUsers: adminData.value?.totalUsers ?? 0,
  totalCVs: adminData.value?.totalCVs ?? 0,
  totalAnalyses: adminData.value?.totalAnalyses ?? 0,
  activeToday: adminData.value?.activeToday ?? 0,
  userGrowth: adminData.value?.userGrowthPercentage ?? 0,
  cvGrowth: adminData.value?.cvGrowthPercentage ?? 0,
  analysisGrowth: adminData.value?.analysisGrowthPercentage ?? 0,
}));

const recentActivities = computed(() => {
  return (adminData.value?.recentActivities ?? []).map((a: any) => ({
    ...a,
    bgColor: a.bgColor || 'bg-slate-500/20',
    iconColor: a.iconColor || 'text-slate-400',
    icon: a.icon || 'Activity'
  }));
});

const activeUsers = computed(() => {
  return (adminData.value?.activeUsers ?? []).map((u: any) => ({
    ...u,
    initials: u.initials || getInitials(u.name)
  }));
});

const recentLogs = computed(() => adminData.value?.recentLogs ?? []);

const getLogVariant = (level: string) => {
  switch (level) {
    case 'info': return 'info';
    case 'warning': return 'warning';
    case 'error': return 'danger';
    default: return 'default';
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

const getIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    Upload, CheckCircle, UserPlus, AlertCircle, LogIn, LogOut, Trash2, AlertTriangle, Activity, FileText, UserCheck
  };
  return iconMap[iconName] || Activity;
};

const fetchAdminDashboard = async () => {
  isLoading.value = true;
  try {
    adminData.value = await dashboardService.getAdminDashboard();
  } catch (error) {
    console.error('Failed to fetch admin dashboard:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchAdminDashboard();
});
</script>
