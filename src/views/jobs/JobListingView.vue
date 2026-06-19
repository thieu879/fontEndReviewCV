<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  Search,
  X,
  MapPin,
  Briefcase,
  Filter,
  SlidersHorizontal,
  TrendingUp,
  Sparkles,
  ChevronRight,
} from 'lucide-vue-next';
import MainLayout from '@/layouts/MainLayout.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseBadge from '@/components/base/BaseBadge.vue';
import BasePagination from '@/components/base/BasePagination.vue';
import BaseCheckbox from '@/components/base/BaseCheckbox.vue';
import JobCard from '@/components/jobs/JobCard.vue';
import JobListSkeleton from '@/components/jobs/JobListSkeleton.vue';
import JobEmptyState from '@/components/jobs/JobEmptyState.vue';
import { jobService, savedJobService } from '@/api/jobMatchingService';
import type { JobResponse } from '@/api/jobMatchingService';

const router = useRouter();
const { t } = useI18n();

const jobs = ref<JobResponse[]>([]);
const isLoading = ref(false);
const currentPage = ref(0);
const pageSize = 20;
const savedIds = ref<Set<string>>(new Set());

// Filters
const filters = reactive({
  q: '',
  location: '',
  jobType: '' as string,
  seniority: '' as string,
  minSalary: '' as string,
  remote: false,
});

const sortBy = ref<'createdAt' | 'salary' | 'title'>('createdAt');
const showFilters = ref(true);

// Sidebar skill chips
const popularSkills = [
  'JavaScript',
  'TypeScript',
  'React',
  'Vue.js',
  'Java',
  'Spring Boot',
  'Python',
  'Node.js',
  'AWS',
  'Docker',
  'Kubernetes',
  'SQL',
];
const activeSkills = ref<Set<string>>(new Set());

const jobTypes = [
  { value: '', label: 'All Types' },
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' },
];

const seniorities = [
  { value: '', label: 'All Levels' },
  { value: 'intern', label: 'Intern' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'manager', label: 'Manager' },
];

const isFirstLoad = ref(true);

function onFilterChanged() {
  // Filters are reactive; watcher already resets currentPage to 0.
}

async function fetchJobs() {
  isLoading.value = true;
  try {
    const list = await jobService.getAllJobsList();
    jobs.value = (list || []).filter((j) => j.active !== false);
    currentPage.value = 0;
  } catch (e) {
    console.error('Failed to fetch jobs:', e);
    jobs.value = [];
  } finally {
    isLoading.value = false;
    isFirstLoad.value = false;
  }
}

async function loadAuxiliaryState() {
  try {
    savedIds.value = await savedJobService.getSavedJobIds();
  } catch {
    /* ignore */
  }
}

function handlePageChange(page: number) {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleSkill(skill: string) {
  if (activeSkills.value.has(skill)) activeSkills.value.delete(skill);
  else activeSkills.value.add(skill);
  currentPage.value = 0;
}

function clearFilters() {
  filters.q = '';
  filters.location = '';
  filters.jobType = '';
  filters.seniority = '';
  filters.minSalary = '';
  filters.remote = false;
  activeSkills.value = new Set();
  currentPage.value = 0;
}

const filteredJobs = computed(() => {
  let list = jobs.value;
  if (filters.q) {
    const q = filters.q.toLowerCase();
    list = list.filter(
      (j) =>
        (j.title || '').toLowerCase().includes(q) ||
        (j.companyName || '').toLowerCase().includes(q) ||
        (j.skills || []).some((s) => (s || '').toLowerCase().includes(q)),
    );
  }
  if (filters.location) {
    const q = filters.location.toLowerCase();
    list = list.filter((j) => (j.location || '').toLowerCase().includes(q));
  }
  if (filters.jobType) {
    list = list.filter((j) => (j.jobType || '').toUpperCase() === filters.jobType.toUpperCase());
  }
  if (filters.seniority) {
    list = list.filter((j) => (j.seniority || '').toLowerCase() === filters.seniority.toLowerCase());
  }
  if (activeSkills.value.size) {
    list = list.filter((j) =>
      (j.skills || []).some((s) => activeSkills.value.has(s)),
    );
  }
  return list;
});

const paginatedJobs = computed(() => {
  const start = currentPage.value * pageSize;
  return filteredJobs.value.slice(start, start + pageSize);
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredJobs.value.length / pageSize)),
);

async function handleSave(job: JobResponse) {
  const isSaved = savedIds.value.has(job.id);
  try {
    if (isSaved) {
      await savedJobService.unsaveJob(job.id);
      savedIds.value.delete(job.id);
    } else {
      await savedJobService.saveJobById(job.id);
      savedIds.value.add(job.id);
    }
    // Force re-trigger reactivity
    savedIds.value = new Set(savedIds.value);
  } catch (e) {
    console.error('Save toggle failed:', e);
  }
}

function handleView(job: JobResponse) {
  if (!job?.id) {
    console.warn('JobListingView.handleView: missing job id', job);
    return;
  }
  router.push({ name: 'JobDetail', params: { id: job.id } });
}

function handleApply(job: JobResponse) {
  if (!job?.id) {
    console.warn('JobListingView.handleApply: missing job id', job);
    return;
  }
  router.push({ name: 'JobDetail', params: { id: job.id } });
}

watch(
  () => [filters.q, filters.location, filters.jobType, filters.seniority, filters.remote],
  () => {
    currentPage.value = 0;
  },
);

onMounted(async () => {
  await Promise.all([fetchJobs(), loadAuxiliaryState()]);
});
</script>

<template>
  <MainLayout>
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 -m-6">
      <!-- Hero Header -->
      <div
        class="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-6 py-10"
      >
        <div class="absolute inset-0 opacity-10">
          <div class="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>
        <div class="relative max-w-7xl mx-auto">
          <div class="flex items-center gap-2 text-white/80 text-sm mb-2">
            <Sparkles class="w-4 h-4" />
            <span>{{ t('jobs.heroTagline', 'AI-powered job search') }}</span>
          </div>
          <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
            {{ t('jobs.heroTitle', 'Find your next opportunity') }}
          </h1>
          <p class="text-white/80 max-w-2xl">
            {{ t('jobs.heroSubtitle', 'Browse thousands of curated jobs and let our AI match you with the perfect role.') }}
          </p>

          <!-- Search bar -->
          <div class="mt-6 max-w-3xl">
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-2 flex items-center gap-2">
              <div class="flex-1 flex items-center gap-2 px-3">
                <Search class="w-5 h-5 text-slate-400" />
                <input
                  v-model="filters.q"
                  type="text"
                  :placeholder="t('jobs.searchPlaceholder', 'Search by job title, company, or skill...')"
                  class="flex-1 py-2 bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400"
                />
                <button
                  v-if="filters.q"
                  type="button"
                  class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                  @click="filters.q = ''; onFilterChanged()"
                >
                  <X class="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <BaseButton variant="primary" size="md" @click="onFilterChanged">
                <Search class="w-4 h-4 mr-1" />
                {{ t('common.search', 'Search') }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <!-- Filters sidebar -->
        <aside
          v-if="showFilters"
          class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 h-fit lg:sticky lg:top-20 space-y-5"
        >
          <div class="flex items-center justify-between">
            <h2 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal class="w-4 h-4" />
              {{ t('jobs.filters', 'Filters') }}
            </h2>
            <button
              class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              @click="clearFilters"
            >
              {{ t('common.reset', 'Reset') }}
            </button>
          </div>

          <!-- Location -->
          <div>
            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
              {{ t('jobs.location', 'Location') }}
            </label>
            <BaseInput
              v-model="filters.location"
              type="text"
              :placeholder="t('jobs.locationPlaceholder', 'e.g. Ho Chi Minh')"
              @update:model-value="onFilterChanged"
            >
              <template #prefix>
                <MapPin class="w-4 h-4 text-slate-400" />
              </template>
            </BaseInput>
          </div>

          <!-- Job type -->
          <div>
            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
              {{ t('jobs.jobType', 'Job Type') }}
            </label>
            <div class="space-y-1.5">
              <button
                v-for="jt in jobTypes"
                :key="jt.value"
                type="button"
                :class="[
                  'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  filters.jobType === jt.value
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50',
                ]"
                @click="filters.jobType = jt.value; onFilterChanged()"
              >
                {{ t(`jobs.jobTypes.${jt.value || 'all'}`, jt.label) }}
              </button>
            </div>
          </div>

          <!-- Seniority -->
          <div>
            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
              {{ t('jobs.seniority', 'Seniority') }}
            </label>
            <div class="space-y-1.5">
              <button
                v-for="s in seniorities"
                :key="s.value"
                type="button"
                :class="[
                  'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  filters.seniority === s.value
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50',
                ]"
                @click="filters.seniority = s.value; onFilterChanged()"
              >
                {{ s.label }}
              </button>
            </div>
          </div>

          <!-- Popular skills -->
          <div>
            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
              {{ t('jobs.popularSkills', 'Popular Skills') }}
            </label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="skill in popularSkills"
                :key="skill"
                type="button"
                :class="[
                  'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                  activeSkills.has(skill)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700',
                ]"
                @click="toggleSkill(skill)"
              >
                {{ skill }}
              </button>
            </div>
          </div>

          <!-- Remote -->
          <div class="pt-2 border-t border-slate-100 dark:border-slate-700">
            <BaseCheckbox v-model="filters.remote" @update:model-value="onFilterChanged">
              <span class="text-sm text-slate-700 dark:text-slate-300">
                {{ t('jobs.remoteOnly', 'Remote only') }}
              </span>
            </BaseCheckbox>
          </div>
        </aside>

        <!-- Results -->
        <main>
          <!-- Toolbar -->
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase class="w-5 h-5 text-blue-600" />
                {{ t('jobs.resultsTitle', 'Available Jobs') }}
                <BaseBadge variant="primary" size="sm" class="ml-1">
                  {{ filteredJobs.length }}
                </BaseBadge>
              </h2>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {{ t('jobs.resultsSubtitle', 'Updated in real time') }}
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors lg:hidden"
                @click="showFilters = !showFilters"
              >
                <Filter class="w-4 h-4" />
              </button>
              <select
                v-model="sortBy"
                class="text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-300"
                @change="fetchJobs"
              >
                <option value="createdAt">{{ t('jobs.sortNewest', 'Newest first') }}</option>
                <option value="title">{{ t('jobs.sortTitle', 'Title A-Z') }}</option>
                <option value="salary">{{ t('jobs.sortSalary', 'Highest salary') }}</option>
              </select>
            </div>
          </div>

          <!-- Loading skeleton -->
          <JobListSkeleton v-if="isLoading" :count="4" />

          <!-- Empty state -->
          <JobEmptyState
            v-else-if="!isLoading && filteredJobs.length === 0"
            variant="no-results"
            @action="router.push({ name: 'AIJobMatching' })"
          />

          <!-- Job list -->
          <div v-else class="space-y-4">
            <JobCard
              v-for="job in paginatedJobs"
              :key="job.id"
              :job="job"
              :is-saved="savedIds.has(job.id)"
              @save="handleSave"
              @view="handleView"
              @apply="handleApply"
            />
          </div>

          <!-- Pagination -->
          <div v-if="!isLoading && filteredJobs.length > pageSize" class="mt-8 flex justify-center">
            <BasePagination
              :current-page="currentPage"
              :total-pages="totalPages"
              @page-change="handlePageChange"
            />
          </div>

          <!-- View more prompt -->
          <div
            v-if="!isLoading && filteredJobs.length"
            class="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 rounded-2xl p-6 text-center"
          >
            <TrendingUp class="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <h3 class="font-semibold text-slate-900 dark:text-white mb-1">
              {{ t('jobs.aiSuggestTitle', 'Want better matches?') }}
            </h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {{ t('jobs.aiSuggestDesc', 'Upload your CV and let our AI find jobs tailored to your skills.') }}
            </p>
            <BaseButton variant="primary" size="md" @click="router.push({ name: 'AIJobMatching' })">
              <Sparkles class="w-4 h-4 mr-1" />
              {{ t('jobs.tryAI', 'Try AI Job Matching') }}
              <ChevronRight class="w-4 h-4 ml-1" />
            </BaseButton>
          </div>
        </main>
      </div>
    </div>
  </MainLayout>
</template>
