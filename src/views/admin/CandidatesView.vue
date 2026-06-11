<template>
  <AdminLayout>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white mb-2">Quản lý ứng viên</h1>
        <p class="text-slate-400">Xem và quản lý tất cả ứng viên trong hệ thống</p>
      </div>
      <BaseButton variant="primary" size="md" @click="exportCandidates">
        <Download class="w-5 h-5" />
        Xuất danh sách
      </BaseButton>
    </div>

    <!-- Filters -->
    <div class="bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-6">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="flex-1 min-w-[200px]">
          <BaseInput
            v-model="searchQuery"
            type="search"
            placeholder="Tìm kiếm ứng viên..."
            @update:model-value="filterCandidates"
          >
            <template #prefix>
              <Search class="w-4 h-4 text-slate-400" />
            </template>
          </BaseInput>
        </div>
        <select
          v-model="roleFilter"
          class="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          @change="filterCandidates"
        >
          <option value="">Tất cả vị trí</option>
          <option value="frontend">Frontend Developer</option>
          <option value="backend">Backend Developer</option>
          <option value="fullstack">Full-stack Developer</option>
          <option value="devops">DevOps Engineer</option>
        </select>
        <select
          v-model="scoreFilter"
          class="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          @change="filterCandidates"
        >
          <option value="">Tất cả điểm</option>
          <option value="80+">Trên 80%</option>
          <option value="60-80">60% - 80%</option>
          <option value="<60">Dưới 60%</option>
        </select>
        <BaseButton variant="ghost" size="md" @click="resetFilters">
          Đặt lại
        </BaseButton>
      </div>
    </div>

    <!-- Candidates Table -->
    <div class="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-700/50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Ứng viên</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Vị trí</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Kỹ năng</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Kinh nghiệm</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Điểm match</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Ngày nộp</th>
              <th class="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700">
            <tr v-for="candidate in filteredCandidates" :key="candidate.id" class="hover:bg-slate-700/30 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <BaseAvatar :name="candidate.name" size="md" gradient="blue" shape="rounded" />
                  <div>
                    <div class="text-white font-medium">{{ candidate.name }}</div>
                    <div class="text-slate-400 text-sm">{{ candidate.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="text-slate-300">{{ candidate.predictedRole }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <BaseBadge
                    v-for="skill in candidate.skills.slice(0, 2)"
                    :key="skill"
                    variant="default"
                    size="sm"
                  >{{ skill }}</BaseBadge>
                  <BaseBadge
                    v-if="candidate.skills.length > 2"
                    variant="default"
                    size="sm"
                  >+{{ candidate.skills.length - 2 }}</BaseBadge>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="text-slate-300">{{ candidate.experience }} năm</span>
              </td>
              <td class="px-6 py-4">
                <BaseScoreBar :score="candidate.aiMatchScore" size="sm" />
              </td>
              <td class="px-6 py-4">
                <span class="text-slate-400 text-sm">{{ formatDate(candidate.appliedAt) }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-1">
                  <BaseButton variant="ghost" size="sm" @click="viewDetails(candidate)" :title="'Xem chi tiết'">
                    <Eye class="w-4 h-4" />
                  </BaseButton>
                  <BaseButton variant="ghost" size="sm" @click="downloadCV(candidate)" :title="'Tải CV'">
                    <Download class="w-4 h-4" />
                  </BaseButton>
                  <BaseButton variant="ghost" size="sm" @click="deleteCandidate(candidate)" :title="'Xóa'">
                    <Trash2 class="w-4 h-4" />
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 bg-slate-700/30 border-t border-slate-700 flex items-center justify-between">
        <div class="text-slate-400 text-sm">
          Hiển thị <span class="text-white">{{ filteredCandidates.length }}</span> trong <span class="text-white">{{ candidates.length }}</span> kết quả
        </div>
        <BasePagination
          v-model:current-page="currentPage"
          :total-pages="totalPages"
        />
      </div>
    </div>

    <!-- Details Modal -->
    <CandidateDetailsModal
      :is-open="showDetails"
      :candidate="selectedCandidate"
      @close="showDetails = false"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import CandidateDetailsModal from '@/components/modals/CandidateDetailsModal.vue';
import { BaseAvatar, BaseBadge, BaseButton, BaseInput, BasePagination, BaseScoreBar } from '@/components/base';
import {
  Search,
  Download,
  Eye,
  Trash2,
} from 'lucide-vue-next';
import type { Candidate } from '@/types';
import type { CandidateProfileResponse } from '@/api/cvService';

const searchQuery = ref('');
const roleFilter = ref('');
const scoreFilter = ref('');
const showDetails = ref(false);
const selectedCandidate = ref<CandidateProfileResponse | null>(null);
const currentPage = ref(0);
const pageSize = ref(10);

const candidates: Candidate[] = [
  { id: '1', name: 'Nguyễn Văn A', email: 'nva@example.com', phone: '0901234567', location: 'TP. HCM', skills: ['React', 'TypeScript', 'Node.js'], experience: 5, education: 'Đại học', predictedRole: 'Frontend Developer', aiMatchScore: 95, appliedAt: '2024-01-15', summary: 'Senior Developer', strengths: ['Kinh nghiệm 5+ năm'], weaknesses: [] },
  { id: '2', name: 'Trần Thị B', email: 'ttb@example.com', phone: '0902345678', location: 'Hà Nội', skills: ['Python', 'Django', 'PostgreSQL'], experience: 3, education: 'Đại học', predictedRole: 'Backend Developer', aiMatchScore: 88, appliedAt: '2024-01-14', summary: 'Backend Developer', strengths: ['Python expert'], weaknesses: [] },
  { id: '3', name: 'Lê Văn C', email: 'lvc@example.com', phone: '0903456789', location: 'Đà Nẵng', skills: ['Vue.js', 'Nuxt', 'Tailwind'], experience: 4, education: 'Cao đẳng', predictedRole: 'Full-stack Developer', aiMatchScore: 82, appliedAt: '2024-01-13', summary: 'Full-stack Developer', strengths: ['Vue.js expert'], weaknesses: [] },
  { id: '4', name: 'Phạm Thị D', email: 'ptd@example.com', phone: '0904567890', location: 'TP. HCM', skills: ['AWS', 'Docker', 'Kubernetes'], experience: 6, education: 'Thạc sĩ', predictedRole: 'DevOps Engineer', aiMatchScore: 78, appliedAt: '2024-01-12', summary: 'DevOps Engineer', strengths: ['Cloud architecture'], weaknesses: [] },
  { id: '5', name: 'Hoàng Minh E', email: 'hme@example.com', phone: '0905678901', location: 'Hải Phòng', skills: ['Java', 'Spring Boot', 'MySQL'], experience: 4, education: 'Đại học', predictedRole: 'Backend Developer', aiMatchScore: 72, appliedAt: '2024-01-11', summary: 'Java Developer', strengths: ['Java expert'], weaknesses: [] },
  { id: '6', name: 'Vũ Thị F', email: 'vtf@example.com', phone: '0906789012', location: 'Cần Thơ', skills: ['React', 'Redux', 'GraphQL'], experience: 2, education: 'Cao đẳng', predictedRole: 'Frontend Developer', aiMatchScore: 68, appliedAt: '2024-01-10', summary: 'React Developer', strengths: ['Fast learner'], weaknesses: [] },
];

const allFiltered = computed(() => {
  return candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesRole = !roleFilter.value || candidate.predictedRole.toLowerCase().includes(roleFilter.value);
    const matchesScore = !scoreFilter.value || (
      scoreFilter.value === '80+' ? candidate.aiMatchScore >= 80 :
      scoreFilter.value === '60-80' ? candidate.aiMatchScore >= 60 && candidate.aiMatchScore < 80 :
      candidate.aiMatchScore < 60
    );
    return matchesSearch && matchesRole && matchesScore;
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(allFiltered.value.length / pageSize.value)));

const filteredCandidates = computed(() => {
  const start = currentPage.value * pageSize.value;
  return allFiltered.value.slice(start, start + pageSize.value);
});

const filterCandidates = () => {
  currentPage.value = 0;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN');
};

const resetFilters = () => {
  searchQuery.value = '';
  roleFilter.value = '';
  scoreFilter.value = '';
  currentPage.value = 0;
};

const viewDetails = (candidate: Candidate) => {
  selectedCandidate.value = candidate as unknown as CandidateProfileResponse;
  showDetails.value = true;
};

const downloadCV = (candidate: Candidate) => {
  console.log('Download CV:', candidate);
};

const deleteCandidate = (candidate: Candidate) => {
  console.log('Delete candidate:', candidate);
};

const exportCandidates = () => {
  console.log('Export candidates');
};
</script>
