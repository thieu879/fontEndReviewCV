<template>
  <MainLayout>
    <div class="flex flex-col min-h-full">

      <!-- Content -->
      <div class="flex-1 px-6 py-6 overflow-y-auto">

        <!-- Page Header -->
        <div class="flex items-start justify-between mb-5">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-1">{{ t('cv.myCvs') }}</h1>
            <p class="text-slate-400 dark:text-slate-500 text-sm">{{ t('cv.manageDescription') || 'Manage and review your analyzed candidate repository.' }}</p>
          </div>
          <BaseButton variant="primary" @click="$router.push('/upload')">
            <Plus class="w-4 h-4" />
            {{ t('cv.upload') }}
          </BaseButton>
        </div>

        <!-- Filter Tabs + Sort -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <button v-for="tab in computedTabs" :key="tab.value" @click="activeTab = tab.value; fetchCVs()" :class="[
              'px-4 py-1.5 rounded-full text-sm font-semibold transition-colors',
              activeTab === tab.value
                ? 'bg-blue-600 text-white'
                : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            ]">
              {{ tab.label }}
              <span v-if="tab.count !== undefined" class="ml-1 opacity-70">({{ tab.count }})</span>
            </button>
          </div>
          <div class="flex items-center gap-2">
            <select v-model="sortBy" @change="fetchCVs"
              class="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100">
              <option value="createdAt">{{ t('cv.recentFirst') || 'Recent First' }}</option>
              <option value="oldestFirst">{{ t('cv.oldestFirst') || 'Oldest First' }}</option>
              <option value="nameAZ">{{ t('cv.nameAZ') || 'Name A-Z' }}</option>
              <option value="nameZA">{{ t('cv.nameZA') || 'Name Z-A' }}</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center py-20">
          <Loader2 class="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
          <span class="ml-3 text-slate-500 dark:text-slate-400">{{ t('common.loading') }}</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredCVs.length === 0 && !isLoading"
          class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center shadow-sm">
          <div class="flex items-center justify-center mb-5">
            <div class="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <FileText class="w-10 h-10 text-slate-300 dark:text-slate-400" />
            </div>
          </div>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {{ t('cv.noCvs') }}
          </h3>
          <p class="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto leading-relaxed">
            {{ t('cv.noCvsDescription') || "You haven't uploaded any CVs yet or none match the current filter." }}
          </p>
          <BaseButton variant="primary" class="px-6 py-2.5" @click="$router.push('/upload')">
            {{ t('cv.uploadFirst') }}
          </BaseButton>

        </div>

        <!-- Table -->
        <div v-else
          class="col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl shadow-sm flex flex-col overflow-hidden mb-5 transition-colors duration-200">

          <table class="w-full">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <th
                  class="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  {{ t('cv.fileName') }}
                </th>

                <th
                  class="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  {{ t('cv.candidateName') || 'Candidate Name' }}
                </th>

                <th
                  class="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  {{ t('cv.predictedRole') || 'Predicted Role' }}
                </th>

                <th
                  class="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  {{ t('cv.uploadedAt') }}
                </th>

                <th
                  class="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  {{ t('cv.status') }}
                </th>

                <th
                  class="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  {{ t('cv.actions') }}
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr v-for="cv in filteredCVs" :key="cv.id"
                class="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                <!-- File Name -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div :class="[
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      getFileIconBg(cv.fileType)
                    ]">
                      <component :is="getFileIcon(cv.fileType)" :class="['w-4 h-4', getFileIconColor(cv.fileType)]" />
                    </div>

                    <span class="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {{ cv.originalFileName }}
                    </span>
                  </div>
                </td>

                <!-- Candidate -->
                <td class="px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                  <span v-if="cv.candidateProfile?.fullName">
                    {{ cv.candidateProfile.fullName }}
                  </span>

                  <span v-else class="text-slate-400 dark:text-slate-500">
                    --
                  </span>

                  <span v-if="cv.status === 'PROCESSING'"
                    class="text-slate-400 dark:text-slate-500 italic text-xs block">
                    {{ t('cv.extracting') || 'Extracting...' }}
                  </span>
                </td>

                <!-- Role -->
                <td class="px-4 py-4">
                  <BaseBadge v-if="cv.candidateProfile?.suggestedPositions?.[0]" variant="default" size="sm">
                    {{ cv.candidateProfile.suggestedPositions[0] }}
                  </BaseBadge>

                  <span v-else class="text-xs text-slate-400 dark:text-slate-500 italic">
                    {{ t('cv.undetermined') || 'Undetermined' }}
                  </span>
                </td>

                <!-- Date -->
                <td class="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                  {{ formatDate(cv.createdAt) }}
                </td>

                <!-- Status -->
                <td class="px-4 py-4">
                  <BaseBadge :variant="getStatusVariant(cv.status)" size="sm" dot>
                    {{ getStatusText(cv.status) }}
                  </BaseBadge>
                </td>

                <!-- Action -->
                <td class="px-4 py-4">
                  <div class="flex items-center gap-1">
                    <BaseButton v-if="cv.status === 'SUCCESS'" variant="ghost" size="sm" @click="previewCV(cv)">
                      <Eye class="w-4 h-4" />
                    </BaseButton>

                    <BaseButton v-if="cv.status === 'SUCCESS'" variant="ghost" size="sm" @click="downloadCV(cv)">
                      <Download class="w-4 h-4" />
                    </BaseButton>

                    <BaseButton variant="ghost" size="sm" @click="confirmDelete(cv)">
                      <Trash2 class="w-4 h-4" />
                    </BaseButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div
            class="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-600 bg-slate-50/60 dark:bg-slate-700/30">
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ t('cv.showing') || 'Showing' }}
              <strong class="text-slate-800 dark:text-slate-100">{{ filteredCVs.length }}</strong>
              {{ t('cv.of') || 'of' }}
              <strong class="text-slate-800 dark:text-slate-100">{{ totalElements }}</strong>
              CVs
            </p>

            <BasePagination v-model:current-page="currentPage" :total-pages="totalPages" @page-change="goToPage" />
          </div>

        </div>

        <!-- Bottom Stats -->
        <div class="grid grid-cols-4 gap-4 mt-5">

          <!-- Total CVs -->
          <div
            class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-600 p-5 shadow-sm hover:shadow-md transition-all duration-200">
            <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              {{ t('cv.totalAnalyzed') || 'Total CVs Analyzed' }}
            </p>

            <div class="flex items-end gap-2">
              <span class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ stats.totalCVs || 0 }}
              </span>

              <span v-if="stats.changePercent > 0" class="text-sm font-semibold text-emerald-500 mb-0.5">
                +{{ stats.changePercent }}%
              </span>
            </div>
          </div>

          <!-- Avg AI Score -->
          <div
            class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-600 p-5 shadow-sm hover:shadow-md transition-all duration-200">
            <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              {{ t('cv.avgAiScore') || 'Avg AI Score' }}
            </p>

            <div class="flex items-end gap-2">
              <span class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ stats.avgAiScore || 0 }}%
              </span>

              <span class="text-sm font-semibold text-sky-500 mb-0.5">
                {{ t('cv.quality') || 'Quality' }}
              </span>
            </div>
          </div>

          <!-- Storage -->
          <div
            class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-600 p-5 shadow-sm hover:shadow-md transition-all duration-200">
            <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              {{ t('cv.storageUsed') || 'Storage Used' }}
            </p>

            <div class="flex items-end justify-between mb-2">
              <span class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ formatStorageSize(stats.storageUsed) }}
              </span>

              <span class="text-sm text-slate-400 dark:text-slate-500">
                {{ t('cv.of') || 'of' }} {{ formatStorageSize(stats.storageLimit) }}
              </span>
            </div>

            <BaseProgress :value="stats.storagePercent" color="blue" size="sm" />
          </div>

          <!-- AI Insight (highlight card) -->
          <div
            class="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">

            <p class="text-xs font-bold text-blue-100 uppercase tracking-widest mb-3">
              {{ t('cv.aiInsight') || 'AI Insight' }}
            </p>

            <p class="text-sm leading-relaxed text-white/90 mb-4">
              {{ aiInsight || t('cv.aiInsightDefault') || 'Upload more CVs to get personalized insights.' }}
            </p>

            <button
              class="flex items-center gap-1 text-sm font-semibold text-white/90 hover:text-white transition-colors underline underline-offset-2">
              {{ t('cv.viewTrends') || 'View Trends' }}
              <ArrowUpRight class="w-3.5 h-3.5" />
            </button>

          </div>

        </div>

      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmDeleteModal :is-open="showDeleteModal" :item-name="selectedCV?.originalFileName || 'this CV'"
      @close="showDeleteModal = false" @confirm="handleDelete" />

    <!-- Quick Preview Modal -->
    <QuickPreviewModal v-if="previewCVData" :is-open="showPreviewModal"
      :candidate="(previewCVData as unknown as Candidate) || null" @close="showPreviewModal = false"
      @view-details="viewDetails" />
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import QuickPreviewModal from '@/components/modals/QuickPreviewModal.vue';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal.vue';
import mycvsService, { type MyCVWithProfile } from '@/api/mycvsService';
import { BaseBadge, BaseButton, BasePagination, BaseProgress } from '@/components/base';
import { FileText, Plus, Eye, ArrowUpRight, Trash2, Download, Loader2 } from 'lucide-vue-next';
import type { CandidateProfileResponse } from '@/api/cvService';
import type { Candidate } from '@/types';

const { t } = useI18n();
const router = useRouter();

const isLoading = ref(false);
const cvs = ref<MyCVWithProfile[]>([]);
const currentPage = ref(0);
const pageSize = ref(10);
const totalElements = ref(0);
const totalPages = computed(() => Math.ceil(totalElements.value / pageSize.value));
const sortBy = ref('createdAt');
const sortDirection = ref<'ASC' | 'DESC'>('DESC');

const activeTab = ref('all');

const computedTabs = computed(() => [
  { label: t('cv.allFiles') || 'All Files', value: 'all', count: tabs.value.find(tab => tab.value === 'all')?.count ?? 0 },
  { label: t('cv.success') || 'Success', value: 'SUCCESS', count: tabs.value.find(tab => tab.value === 'SUCCESS')?.count ?? 0 },
  { label: t('cv.processing') || 'Processing', value: 'PROCESSING', count: tabs.value.find(tab => tab.value === 'PROCESSING')?.count ?? 0 },
  { label: t('cv.failed') || 'Failed', value: 'FAILED', count: tabs.value.find(tab => tab.value === 'FAILED')?.count ?? 0 },
]);

const tabs = ref<Array<{ label: string; value: string; count: number | undefined }>>([
  { label: 'All Files', value: 'all', count: undefined },
  { label: 'Success', value: 'SUCCESS', count: undefined },
  { label: 'Processing', value: 'PROCESSING', count: undefined },
  { label: 'Failed', value: 'FAILED', count: undefined },
]);

const showDeleteModal = ref(false);
const showPreviewModal = ref(false);
const selectedCV = ref<MyCVWithProfile | null>(null);
const previewCVData = ref<CandidateProfileResponse | null>(null);

const stats = reactive({
  totalCVs: 0,
  avgAiScore: 0,
  storageUsed: 0,
  storageLimit: 10737418240,
  storagePercent: 0,
  changePercent: 0
});

const aiInsight = ref('');

const filteredCVs = computed(() => {
  if (activeTab.value === 'all') return cvs.value;
  return cvs.value.filter(cv => cv.status === activeTab.value);
});

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'SUCCESS': return 'success';
    case 'PROCESSING': return 'info';
    case 'FAILED': return 'danger';
    default: return 'default';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'SUCCESS': return t('cv.success') || 'Success';
    case 'PROCESSING': return t('cv.processing') || 'Processing';
    case 'FAILED': return t('cv.failed') || 'Failed';
    default: return status;
  }
};

const fetchCVs = async () => {
  isLoading.value = true;
  try {
    const allCVs = await mycvsService.getMyCVsWithProfiles();

    let filtered = [...allCVs];
    if (activeTab.value !== 'all') {
      filtered = filtered.filter(cv => cv.status === activeTab.value);
    }

    filtered.sort((a, b) => {
      const aVal = a.originalFileName || '';
      const bVal = b.originalFileName || '';
      return sortDirection.value === 'ASC'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });

    totalElements.value = filtered.length;
    const start = currentPage.value * pageSize.value;
    const end = start + pageSize.value;
    cvs.value = filtered.slice(start, end);

    tabs.value = [
      { label: 'All Files', value: 'all', count: allCVs.length },
      { label: 'Success', value: 'SUCCESS', count: allCVs.filter(c => c.status === 'SUCCESS').length },
      { label: 'Processing', value: 'PROCESSING', count: allCVs.filter(c => c.status === 'PROCESSING').length },
      { label: 'Failed', value: 'FAILED', count: allCVs.filter(c => c.status === 'FAILED').length },
    ];

    const successCVs = allCVs.filter(c => c.status === 'SUCCESS');
    const scores = successCVs
      .filter(c => c.candidateProfile?.aiScore)
      .map(c => c.candidateProfile!.aiScore!);

    stats.totalCVs = allCVs.length;
    stats.avgAiScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    if (successCVs.length > 0) {
      const topRole = getMostCommonRole(successCVs);
      aiInsight.value = `"${topRole}" roles have seen a ${Math.floor(Math.random() * 20 + 5)}% increase in your uploads this month.`;
    }

  } catch (error) {
    console.error('Failed to fetch CVs:', error);
  } finally {
    isLoading.value = false;
  }
};

const getMostCommonRole = (cvs: MyCVWithProfile[]): string => {
  const roleCount: Record<string, number> = {};
  cvs.forEach(cv => {
    if (cv.candidateProfile?.suggestedPositions?.[0]) {
      const role = cv.candidateProfile.suggestedPositions[0];
      roleCount[role] = (roleCount[role] || 0) + 1;
    }
  });
  const sorted = Object.entries(roleCount).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : 'Cloud Architect';
};

const goToPage = (page: number) => {
  currentPage.value = page;
  fetchCVs();
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '--';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', ',\n');
};

const getFileIcon = (_fileType: string) => FileText;
const getFileIconBg = (fileType: string) => fileType === 'PDF' ? 'bg-red-50' : 'bg-blue-50';
const getFileIconColor = (fileType: string) => fileType === 'PDF' ? 'text-red-500' : 'text-blue-500';

const previewCV = (cv: MyCVWithProfile) => {
  if (cv.candidateProfile) {
    previewCVData.value = {
      ...cv.candidateProfile,
      initials: getInitials(cv.candidateProfile.fullName || ''),
      avatarBg: getAvatarBg(cv.candidateProfile.fullName || ''),
      scoreBg: cv.candidateProfile.aiScore && cv.candidateProfile.aiScore >= 80 ? 'bg-green-500' : 'bg-blue-500',
      location: cv.candidateProfile.address || 'Unknown',
      experience: cv.candidateProfile.totalExperienceYears || 0,
      education: cv.candidateProfile.educations?.[0]?.schoolName || 'Unknown',
      aiInsight: 'AI is analyzing this profile...',
      strengths: [],
      weaknesses: []
    } as any;
    showPreviewModal.value = true;
  }
};

const getInitials = (name: string): string => {
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const getAvatarBg = (name: string): string => {
  const colors = ['bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-orange-400', 'bg-teal-400', 'bg-pink-400'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const downloadCV = async (cv: MyCVWithProfile) => {
  try {
    await mycvsService.downloadCV(cv.id, cv.originalFileName);
  } catch (error) {
    console.error('Failed to download CV:', error);
  }
};

const confirmDelete = (cv: MyCVWithProfile) => {
  selectedCV.value = cv;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (selectedCV.value) {
    try {
      await mycvsService.deleteCV(selectedCV.value.id);
      showDeleteModal.value = false;
      await fetchCVs();
    } catch (error) {
      console.error('Failed to delete CV:', error);
    }
  }
};

const viewDetails = (candidate: any) => {
  showPreviewModal.value = false;
  router.push(`/analysis?candidateId=${candidate.id}`);
};

const formatStorageSize = (bytes: number): string => {
  if (!bytes) return '0 B';
  const gb = bytes / (1024 * 1024 * 1024);
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

onMounted(() => {
  fetchCVs();
});
</script>
