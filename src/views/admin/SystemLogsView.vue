<template>
  <AdminLayout>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white mb-2">Nhật ký hệ thống</h1>
      <p class="text-slate-400">Theo dõi các hoạt động và sự kiện trong hệ thống</p>
    </div>

    <div class="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      <div class="p-4 border-b border-slate-700">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <BaseInput
              v-model="searchQuery"
              type="search"
              placeholder="Tìm kiếm..."
              class="w-64"
            />
            <select v-model="levelFilter" class="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tất cả cấp độ</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <select v-model="dateFilter" class="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="today">Hôm nay</option>
              <option value="7days">7 ngày gần nhất</option>
              <option value="30days">30 ngày gần nhất</option>
              <option value="all">Tất cả</option>
            </select>
          </div>
          <BaseButton variant="secondary" size="sm">
            <Download class="w-4 h-4" />
            Xuất log
          </BaseButton>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-700 bg-slate-700/50">
              <th class="text-left py-3 px-4 text-sm font-medium text-slate-400">Thời gian</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-slate-400">Cấp độ</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-slate-400">Hành động</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-slate-400">Người dùng</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-slate-400">Chi tiết</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-slate-400">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="log in filteredLogs"
              :key="log.id"
              class="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
            >
              <td class="py-3 px-4 text-sm text-slate-400 font-mono">{{ log.timestamp }}</td>
              <td class="py-3 px-4">
                <BaseBadge :variant="getLogVariant(log.level)" size="sm" class="uppercase">{{ log.level }}</BaseBadge>
              </td>
              <td class="py-3 px-4 text-sm text-white font-medium">{{ log.action }}</td>
              <td class="py-3 px-4 text-sm text-slate-300">{{ log.user }}</td>
              <td class="py-3 px-4 text-sm text-slate-400 max-w-xs truncate">{{ log.details }}</td>
              <td class="py-3 px-4">
                <BaseButton variant="ghost" size="sm" @click="viewDetails(log)" title="Xem chi tiết">
                  <Eye class="w-4 h-4" />
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredLogs.length === 0" class="p-12 text-center">
        <FileText class="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-slate-300 mb-2">Không có log</h3>
        <p class="text-slate-500">Không tìm thấy log nào phù hợp với bộ lọc</p>
      </div>

      <div class="p-4 border-t border-slate-700 flex items-center justify-between">
        <p class="text-sm text-slate-400">Hiển thị 1-{{ filteredLogs.length }} của {{ filteredLogs.length }} logs</p>
        <BasePagination
          v-model:current-page="currentPage"
          :total-pages="totalPages"
        />
      </div>
    </div>

    <!-- Log Details Modal -->
    <BaseModal
      :is-open="showDetailsModal"
      title="Chi tiết log"
      size="md"
      @close="showDetailsModal = false"
    >
      <div v-if="selectedLog" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500 mb-1">Thời gian</p>
            <p class="font-mono text-gray-900">{{ selectedLog.timestamp }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">Cấp độ</p>
            <BaseBadge :variant="getLogVariant(selectedLog.level)" size="sm" class="uppercase">{{ selectedLog.level }}</BaseBadge>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">Hành động</p>
            <p class="text-gray-900">{{ selectedLog.action }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">Người dùng</p>
            <p class="text-gray-900">{{ selectedLog.user }}</p>
          </div>
        </div>
        <div>
          <p class="text-sm text-gray-500 mb-2">Chi tiết</p>
          <div class="bg-gray-100 rounded-lg p-4 font-mono text-sm text-gray-700 whitespace-pre-wrap">
            {{ selectedLog.details }}
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="primary" @click="showDetailsModal = false">
          Đóng
        </BaseButton>
      </template>
    </BaseModal>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import { BaseBadge, BaseButton, BaseInput, BasePagination } from '@/components/base';
import { Download, Eye, FileText } from 'lucide-vue-next';
import type { LogEntry } from '@/types';

const searchQuery = ref('');
const levelFilter = ref('');
const dateFilter = ref('7days');
const showDetailsModal = ref(false);
const selectedLog = ref<LogEntry | null>(null);
const currentPage = ref(0);
const totalPages = computed(() => 1);

const logs = ref<(LogEntry & { levelClass?: string })[]>([
  { id: '1', timestamp: '2024-01-15 10:30:00', level: 'info', action: 'User Login', user: 'admin@cvanalyzer.com', details: 'Successful login from IP 192.168.1.1 using Chrome on Windows' },
  { id: '2', timestamp: '2024-01-15 10:25:00', level: 'info', action: 'CV Upload', user: 'user@example.com', details: 'File uploaded: resume_john_doe.pdf (2.3MB)' },
  { id: '3', timestamp: '2024-01-15 10:20:00', level: 'info', action: 'Analysis Complete', user: 'system', details: 'AI analysis completed for CV #1234. Match score: 85%' },
  { id: '4', timestamp: '2024-01-15 10:15:00', level: 'warning', action: 'Rate Limit', user: 'api_user', details: 'API rate limit reached: 100 requests/minute exceeded' },
  { id: '5', timestamp: '2024-01-15 10:10:00', level: 'error', action: 'Analysis Failed', user: 'system', details: 'Failed to process CV #1235: Invalid file format or corrupted file' },
  { id: '6', timestamp: '2024-01-15 10:05:00', level: 'info', action: 'User Created', user: 'admin@cvanalyzer.com', details: 'New user created: jane.doe@example.com with role recruiter' },
  { id: '7', timestamp: '2024-01-15 10:00:00', level: 'info', action: 'Password Changed', user: 'user@example.com', details: 'User successfully changed their password' },
  { id: '8', timestamp: '2024-01-15 09:55:00', level: 'warning', action: 'Failed Login', user: 'unknown', details: 'Failed login attempt from IP 192.168.1.100. User not found.' },
]);

const getLogVariant = (level: string) => {
  switch (level) {
    case 'info': return 'info';
    case 'warning': return 'warning';
    case 'error': return 'danger';
    default: return 'default';
  }
};

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          log.user.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesLevel = !levelFilter.value || log.level === levelFilter.value;
    return matchesSearch && matchesLevel;
  });
});

const viewDetails = (log: LogEntry) => {
  selectedLog.value = log;
  showDetailsModal.value = true;
};
</script>
