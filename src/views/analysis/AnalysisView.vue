<template>
  <MainLayout>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">{{ t('analysis.title') }}</h1>
      <p class="text-slate-500 dark:text-slate-400">{{ t('analysis.subtitle') || 'View detailed CV analysis results by AI' }}</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <Loader2 class="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      <span class="ml-3 text-slate-500 dark:text-slate-400">{{ t('common.loading') }} {{ t('analysis.data') || 'analysis data...' }}</span>
    </div>

    <template v-else>
      <!-- Stats Overview -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <StatCard :title="t('analysis.totalCandidates') || 'Total Candidates'" :value="overview.totalCandidates || 0" :change="`+${overview.trends?.weeklyNew || 0} ${t('analysis.thisWeek') || 'this week'}`" change-type="positive" :icon="Users" />
        <StatCard :title="t('analysis.analyzed') || 'Analyzed'" :value="overview.analyzedCandidates || 0" :change="''" :icon="CheckCircle2" />
        <StatCard :title="t('analysis.avgAiScore') || 'Avg AI Score'" :value="`${(overview.averageAiScore || 0).toFixed(1)}%`" :change="''" :icon="TrendingUp" />
        <StatCard :title="t('analysis.highMatch') || 'High Match (80%+)'" :value="overview.highMatchCandidates || 0" :change="''" :icon="Star" />
      </div>

      <!-- Filter Section -->
      <div
        class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-6 transition-colors">

        <!-- Filter Header -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">

          <!-- Filters -->
          <div class="flex flex-wrap items-center gap-3">

            <div class="flex items-center gap-2">
              <Filter class="w-5 h-5 text-slate-400 dark:text-slate-500" />
              <span class="text-sm font-medium text-slate-700 dark:text-slate-200">
                {{ t('search.filters') }}:
              </span>
            </div>

            <!-- Role filter -->
            <select v-model="filters.targetRole" @change="applyFilters"
              class="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
              <option value="">
                {{ t('analysis.allPositions') || 'All Positions' }}
              </option>

              <option v-for="role in availableRoles" :key="role" :value="role">
                {{ role }}
              </option>
            </select>

            <!-- Score filter -->
            <select v-model="filters.minAiScore" @change="applyFilters"
              class="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
              <option value="">
                {{ t('analysis.allScores') || 'All Scores' }}
              </option>
              <option value="80">
                {{ t('analysis.above80') || 'Above 80%' }}
              </option>
              <option value="60">
                {{ t('analysis.60to80') || '60% - 80%' }}
              </option>
              <option value="0">
                {{ t('analysis.below60') || 'Below 60%' }}
              </option>
            </select>

          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">

            <button @click="clearFilters"
              class="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              {{ t('analysis.clearFilters') || 'Clear Filters' }}
            </button>

          </div>

        </div>

        <!-- Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

          <CandidateCard v-for="candidate in candidates" :key="candidate.id" :candidate="candidate"
            @click="(c) => openDetails(c)" @preview="(c) => openPreview(c)" />

        </div>

        <!-- Empty State -->
        <div v-if="candidates.length === 0" class="py-14 text-center">

          <div class="flex items-center justify-center mb-4">
            <div class="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <BarChart3 class="w-10 h-10 text-slate-300 dark:text-slate-500" />
            </div>
          </div>

          <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {{ t('search.noResults') }}
          </h3>

          <p class="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {{ t('analysis.noCandidatesMatch') || 'No candidates match the filters' }}
          </p>

        </div>

      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between">
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('search.showing') || 'Showing' }} {{ candidates.length }} / {{ totalElements }} {{ t('search.results') || 'results' }}</p>
        <BasePagination v-model:current-page="currentPage" :total-pages="totalPages" @page-change="goToPage" />
      </div>
    </template>

    <!-- Quick Preview Modal -->
    <QuickPreviewModal :is-open="showPreview" :candidate="selectedCandidate" @close="showPreview = false" @view-details="openDetails" />

    <!-- Candidate Details Modal -->
    <CandidateDetailsModal :is-open="showDetails" :candidate="detailsCandidate" @close="showDetails = false" />
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import MainLayout from '@/layouts/MainLayout.vue';
import CandidateCard from '@/components/cards/CandidateCard.vue';
import QuickPreviewModal from '@/components/modals/QuickPreviewModal.vue';
import CandidateDetailsModal from '@/components/modals/CandidateDetailsModal.vue';
import StatCard from '@/components/common/StatCard.vue';
import { BasePagination } from '@/components/base';
import analysisService from '@/api/analysisService';
import searchService from '@/api/searchService';
import { Filter, BarChart3, Loader2, Users, CheckCircle2, TrendingUp, Star } from 'lucide-vue-next';
import type { Candidate } from '@/types';
import type { CandidateProfileResponse } from '@/api/cvService';

const { t } = useI18n();

const isLoading = ref(true);
const candidates = ref<Candidate[]>([]);
const totalElements = ref(0);
const totalPages = computed(() => Math.ceil(totalElements.value / pageSize.value));
const currentPage = ref(0);
const pageSize = ref(20);
const availableRoles = ref<string[]>([]);

const overview = reactive({
  totalCandidates: 0, analyzedCandidates: 0, pendingCandidates: 0, failedCandidates: 0,
  averageAiScore: 0, highMatchCandidates: 0,
  trends: { weeklyNew: 0, monthlyNew: 0, topRole: '' }
});

const filters = reactive({ targetRole: '', minAiScore: '', searchKeyword: '', sortBy: 'aiScore', sortDirection: 'DESC' as 'ASC' | 'DESC' });

const showPreview = ref(false);
const showDetails = ref(false);
const selectedCandidate = ref<Candidate | null>(null);
const detailsCandidate = ref<CandidateProfileResponse | null>(null);

const fetchOverview = async () => {
  try {
    const data = await analysisService.getOverview();
    overview.totalCandidates = data.totalCandidates;
    overview.analyzedCandidates = data.analyzedCandidates;
    overview.pendingCandidates = data.pendingCandidates;
    overview.failedCandidates = data.failedCandidates;
    overview.averageAiScore = data.averageAiScore;
    overview.highMatchCandidates = data.highMatchCandidates;
    if (data.trends) (overview.trends as any) = data.trends;
  } catch (error) { console.error('Failed to fetch overview:', error); }
};

const fetchCandidates = async () => {
  isLoading.value = true;
  try {
    const requestFilters = {
      targetRole: filters.targetRole || undefined,
      searchKeyword: filters.searchKeyword || undefined,
      minAiScore: filters.minAiScore ? parseFloat(filters.minAiScore) : undefined,
      maxAiScore: filters.minAiScore === '60' ? 80 : undefined,
      sortBy: filters.sortBy, sortDirection: filters.sortDirection,
      page: currentPage.value, size: pageSize.value
    };
    const result = await analysisService.getAnalyzedCandidates(requestFilters);
    candidates.value = result.content.map(profileToCandidate);
    totalElements.value = result.totalElements;
  } catch (error) { console.error('Failed to fetch candidates:', error); }
  finally { isLoading.value = false; }
};

const fetchRoles = async () => { try { availableRoles.value = await searchService.getAllRoles(); } catch (error) { console.error('Failed to fetch roles:', error); } };

const profileToCandidate = (profile: CandidateProfileResponse): Candidate => ({
  id: profile.id, name: profile.fullName || 'Unknown', email: profile.email || '',
  phone: profile.phone || '', location: profile.address || 'Unknown',
  skills: profile.skills || [], experience: profile.totalExperienceYears || 0,
  education: profile.educations?.[0]?.schoolName || 'Unknown',
  predictedRole: profile.suggestedPositions?.[0] || 'Undetermined',
  aiMatchScore: profile.aiScore || 0, appliedAt: profile.createdAt || new Date().toISOString(),
  summary: profile.summary || '', avatar: profile.photoUrl, cvUrl: profile.cvDocumentId,
  strengths: [], weaknesses: []
});

const applyFilters = () => { currentPage.value = 0; fetchCandidates(); };
const clearFilters = () => { Object.assign(filters, { targetRole: '', minAiScore: '', searchKeyword: '' }); currentPage.value = 0; fetchCandidates(); };
const goToPage = (page: number) => { currentPage.value = page; fetchCandidates(); };

const candidateToProfile = (candidate: Candidate): CandidateProfileResponse => ({
  id: candidate.id, userId: '', cvDocumentId: candidate.cvUrl || '', fullName: candidate.name,
  email: candidate.email, phone: candidate.phone, address: candidate.location,
  photoUrl: candidate.avatar, skills: candidate.skills,
  totalExperienceYears: candidate.experience,
  educations: [], workExperiences: [], projects: [], certificates: [], languages: [],
  suggestedPositions: [candidate.predictedRole],
  aiScore: candidate.aiMatchScore, summary: candidate.summary || '',
  manuallyEdited: false, createdAt: candidate.appliedAt, updatedAt: candidate.appliedAt,
} as unknown as CandidateProfileResponse);

const openPreview = (candidate: Candidate) => { selectedCandidate.value = candidate; showPreview.value = true; };
const openDetails = (candidate: Candidate) => { detailsCandidate.value = candidateToProfile(candidate); showPreview.value = false; showDetails.value = true; };

onMounted(async () => { isLoading.value = true; await Promise.all([fetchOverview(), fetchCandidates(), fetchRoles()]); isLoading.value = false; });
</script>
