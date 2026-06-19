<template>
  <MainLayout>
    <div class="min-h-full bg-slate-50/40 dark:bg-slate-900/40">
      <!-- Hero header -->
      <div class="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        <div class="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />
        <div class="relative max-w-screen-2xl mx-auto px-6 lg:px-10 py-8">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Sparkles class="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 class="text-2xl md:text-3xl font-bold text-white">{{ t('aiJobMatching.title') }}</h1>
              <p class="text-blue-100 text-sm mt-0.5">{{ t('aiJobMatching.subtitle') }}</p>
            </div>
          </div>

          <!-- Stats -->
          <div class="mt-6 flex flex-wrap gap-3">
            <div class="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center gap-2">
              <Briefcase class="w-4 h-4 text-white" />
              <span class="text-white text-sm font-semibold">{{ t('aiJobMatching.jobCount', { count: totalJobsAvailable }) }}</span>
            </div>
            <div v-if="matchResult" class="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center gap-2">
              <Target class="w-4 h-4 text-emerald-300" />
              <span class="text-white text-sm font-semibold">{{ t('aiJobMatching.matchedCount', { count: matchResult.matches.length }) }}</span>
            </div>
            <div v-if="topMatch" class="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center gap-2">
              <Trophy class="w-4 h-4 text-amber-300" />
              <span class="text-white text-sm font-semibold">{{ t('aiJobMatching.topMatchBadge', { score: Math.round(topMatch.matchScore) }) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="max-w-screen-2xl mx-auto px-6 lg:px-10 py-8">
        <!-- Error Banner -->
        <div
          v-if="pageError"
          class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3"
        >
          <AlertCircle class="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div class="flex-1">
            <p class="text-sm font-semibold text-red-700 dark:text-red-300">{{ pageError }}</p>
          </div>
          <button @click="pageError = ''" class="text-red-400 hover:text-red-600">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Step 1: Upload + Analysis -->
        <div v-if="!matchResult" class="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div class="lg:col-span-3">
            <CVUploadCard
              :file="selectedFile"
              :is-dragging="isDragging"
              :is-processing="isProcessing"
              :progress="processingProgress"
              :error="uploadError"
              @file-selected="onFileSelected"
              @file-cleared="onFileCleared"
              @submit="onAnalyze"
              @drag-over="isDragging = true"
              @drag-leave="isDragging = false"
              @invalid-file="onInvalidFile"
            />

            <!-- Tips -->
            <div class="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl">
              <h3 class="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Lightbulb class="w-4 h-4 text-amber-500" />
                {{ t('aiJobMatching.tipsTitle') }}
              </h3>
              <ul class="mt-3 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                <li class="flex items-start gap-2">
                  <CheckCircle2 class="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  {{ t('aiJobMatching.tip1') }}
                </li>
                <li class="flex items-start gap-2">
                  <CheckCircle2 class="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  {{ t('aiJobMatching.tip2') }}
                </li>
                <li class="flex items-start gap-2">
                  <CheckCircle2 class="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  {{ t('aiJobMatching.tip3') }}
                </li>
                <li class="flex items-start gap-2">
                  <CheckCircle2 class="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  {{ t('aiJobMatching.tip4') }}
                </li>
              </ul>
            </div>
          </div>

          <div class="lg:col-span-2">
            <AIAnalysisCard :analysis="analysis" />
          </div>
        </div>

        <!-- Step 2: Results -->
        <div v-else class="space-y-6">
          <!-- Back to upload -->
          <button
            @click="reset"
            class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft class="w-4 h-4" />
            {{ t('aiJobMatching.uploadAnother') }}
          </button>

          <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <!-- Left: CV Analysis + Advice -->
            <div class="lg:col-span-2 space-y-6">
              <AIAnalysisCard :analysis="matchResult.analysis" />

              <!-- Career Advice -->
              <div v-if="careerAdvice" class="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-5 shadow-sm">
                <div class="flex items-start gap-3 mb-3">
                  <div class="w-10 h-10 rounded-xl bg-white dark:bg-amber-900/40 flex items-center justify-center shadow-sm">
                    <Lightbulb class="w-5 h-5 text-amber-500" />
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {{ t('aiJobMatching.careerAdvice') }}
                    </h3>
                    <p class="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                      {{ t('aiJobMatching.currentMatch', { score: careerAdvice.currentMatchScore }) }}
                    </p>
                  </div>
                </div>
                <div class="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {{ careerAdvice.advice }}
                </div>
              </div>
            </div>

            <!-- Right: Match results -->
            <div class="lg:col-span-3 space-y-4">
              <div class="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Trophy class="w-5 h-5 text-amber-500" />
                    {{ t('aiJobMatching.matchedJobs') }}
                  </h2>
                  <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {{ t('aiJobMatching.matchedJobsSubtitle') }}
                  </p>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <button
                    v-for="filter in matchFilters"
                    :key="filter.level"
                    @click="activeFilter = activeFilter === filter.level ? null : filter.level"
                    :class="[
                      'px-3 py-1.5 rounded-full font-semibold border transition-all',
                      activeFilter === filter.level
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    ]"
                  >
                    {{ filter.label }} ({{ filter.count }})
                  </button>
                </div>
              </div>

              <div v-if="filteredMatches.length === 0" class="p-10 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
                <SearchX class="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p class="font-semibold text-slate-700 dark:text-slate-200">{{ t('aiJobMatching.noMatches') }}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ t('aiJobMatching.noMatchesDesc') }}</p>
              </div>

              <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MatchResultCard
                  v-for="match in filteredMatches"
                  :key="match.jobId"
                  :match="match"
                  :is-saved="savedJobIds.has(match.jobId)"
                  :is-saving="savingJobId === match.jobId"
                  @view="openJobDetail"
                  @save="onSaveJob"
                  @unsave="onUnsaveJob"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Job Detail Modal -->
      <BaseModal :is-open="isDetailOpen" :title="detailMatch?.job?.title || t('aiJobMatching.viewJob')" size="lg" @close="closeJobDetail">
        <div v-if="detailMatch?.job" class="space-y-5">
          <div class="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div class="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0">
              <img v-if="detailMatch.job.companyLogo" :src="detailMatch.job.companyLogo" :alt="detailMatch.job.companyName" class="w-full h-full object-contain" />
              <Building2 v-else class="w-6 h-6 text-slate-400" />
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-slate-900 dark:text-white">{{ detailMatch.job.companyName }}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ detailMatch.job.location }} • {{ detailMatch.job.jobType }}</p>
            </div>
            <MatchScoreBadge :score="detailMatch.matchScore" :label="matchLevelLabel(detailMatch.matchScore)" />
          </div>

          <div v-if="detailMatch.job.description" class="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-200" v-html="detailMatch.job.description" />
          <div v-else class="text-sm text-slate-500 italic">{{ t('aiJobMatching.noDescription') }}</div>

          <div v-if="detailMatch.job.requirements" class="space-y-2">
            <h4 class="font-bold text-slate-900 dark:text-white">{{ t('aiJobMatching.requirements') }}</h4>
            <div class="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-200" v-html="detailMatch.job.requirements" />
          </div>

          <div v-if="detailMatch.job.benefits" class="space-y-2">
            <h4 class="font-bold text-slate-900 dark:text-white">{{ t('aiJobMatching.benefits') }}</h4>
            <div class="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-200" v-html="detailMatch.job.benefits" />
          </div>

          <div v-if="detailMatch.job.skills?.length" class="space-y-2">
            <h4 class="font-bold text-slate-900 dark:text-white">{{ t('aiJobMatching.requiredSkills') }}</h4>
            <div class="flex flex-wrap gap-1.5">
              <SkillTag v-for="s in detailMatch.job.skills" :key="s" variant="default" size="sm">{{ s }}</SkillTag>
            </div>
          </div>
        </div>

        <template #footer>
          <button
            @click="closeJobDetail"
            class="px-5 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors"
          >
            {{ t('aiJobMatching.close') }}
          </button>
          <button
            v-if="detailMatch?.job"
            @click="applyFromDetail"
            class="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all inline-flex items-center gap-2"
          >
            <ExternalLink class="w-4 h-4" />
            {{ t('aiJobMatching.applyOn', { source: detailMatch.job.source || t('jobs.applyOnOriginal', 'Original Site') }) }}
          </button>
        </template>
      </BaseModal>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  Sparkles, Briefcase, Target, Trophy, AlertCircle, X, ArrowLeft,
  Lightbulb, CheckCircle2, SearchX, Building2, ExternalLink
} from 'lucide-vue-next';
import MainLayout from '@/layouts/MainLayout.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import CVUploadCard from '@/components/jobs/CVUploadCard.vue';
import AIAnalysisCard from '@/components/jobs/AIAnalysisCard.vue';
import MatchResultCard from '@/components/jobs/MatchResultCard.vue';
import MatchScoreBadge from '@/components/jobs/MatchScoreBadge.vue';
import SkillTag from '@/components/jobs/SkillTag.vue';
import {
  jobMatchingService,
  jobService,
  savedJobService,
  type JobMatchResult,
  type JobMatchResponse,
  type CvAnalysisResponse,
  type CareerAdviceResponse,
} from '@/api/jobMatchingService';

const router = useRouter();
const { t } = useI18n();

function matchLevelKey(score: number): 'excellent' | 'good' | 'potential' | 'low' {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'potential';
  return 'low';
}

function matchLevelLabel(score: number): string {
  const key = matchLevelKey(score);
  return t(`aiJobMatching.${key}Match`);
}

// State
const selectedFile = ref<File | null>(null);
const isDragging = ref(false);
const isProcessing = ref(false);
const processingProgress = ref(0);
const uploadError = ref('');
const pageError = ref('');

const analysis = ref<CvAnalysisResponse | null>(null);
const matchResult = ref<JobMatchResponse | null>(null);
const careerAdvice = ref<CareerAdviceResponse | null>(null);

const totalJobsAvailable = ref<number>(0);
const savedJobIds = ref<Set<string>>(new Set());
const savingJobId = ref<string | null>(null);
const activeFilter = ref<string | null>(null);

const isDetailOpen = ref(false);
const detailMatch = ref<JobMatchResult | null>(null);

// Computed
const topMatch = computed(() => matchResult.value?.matches?.[0]);

const matchFilters = computed(() => {
  if (!matchResult.value) return [];
  const matches = matchResult.value.matches;
  return [
    { level: 'EXCELLENT', label: t('aiJobMatching.excellent'), count: matches.filter(m => m.matchScore >= 90).length },
    { level: 'GOOD', label: t('aiJobMatching.good'), count: matches.filter(m => m.matchScore >= 70 && m.matchScore < 90).length },
    { level: 'POTENTIAL', label: t('aiJobMatching.potential'), count: matches.filter(m => m.matchScore >= 50 && m.matchScore < 70).length },
  ];
});

const filteredMatches = computed(() => {
  if (!matchResult.value) return [];
  let list = matchResult.value.matches;
  if (activeFilter.value === 'EXCELLENT') list = list.filter(m => m.matchScore >= 90);
  else if (activeFilter.value === 'GOOD') list = list.filter(m => m.matchScore >= 70 && m.matchScore < 90);
  else if (activeFilter.value === 'POTENTIAL') list = list.filter(m => m.matchScore >= 50 && m.matchScore < 70);
  return list;
});

// Lifecycle
onMounted(async () => {
  // Restore AI analysis results from sessionStorage if present
  // (survives navigation to job detail and back)
  const stored = sessionStorage.getItem('ai-match-result');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.matchResult) {
        matchResult.value = parsed.matchResult;
        analysis.value = parsed.matchResult.analysis;
        careerAdvice.value = parsed.careerAdvice || null;
        selectedFile.value = parsed.fileName || null;
      }
    } catch {
      /* ignore corrupt storage */
    }
  }
  await Promise.all([loadJobCount(), loadSavedJobIds()]);
});

// Persist state to sessionStorage so it survives navigation
function persistState() {
  if (matchResult.value) {
    sessionStorage.setItem('ai-match-result', JSON.stringify({
      matchResult: matchResult.value,
      careerAdvice: careerAdvice.value,
      fileName: selectedFile.value?.name || null,
    }));
  } else {
    sessionStorage.removeItem('ai-match-result');
  }
}

async function loadJobCount() {
  try {
    totalJobsAvailable.value = await jobService.countActiveJobs();
  } catch (e) {
    console.warn('Could not load job count', e);
  }
}

async function loadSavedJobIds() {
  try {
    savedJobIds.value = await savedJobService.getSavedJobIds();
  } catch (e) {
    console.warn('Could not load saved job ids', e);
  }
}

function onFileSelected(file: File) {
  selectedFile.value = file;
  uploadError.value = '';
  pageError.value = '';
  analysis.value = null;
  matchResult.value = null;
  careerAdvice.value = null;
  sessionStorage.removeItem('ai-match-result');
}

function onFileCleared() {
  selectedFile.value = null;
  uploadError.value = '';
  analysis.value = null;
  matchResult.value = null;
  careerAdvice.value = null;
  processingProgress.value = 0;
  sessionStorage.removeItem('ai-match-result');
}

function onInvalidFile(message: string) {
  uploadError.value = message;
}

async function onAnalyze(file: File) {
  if (!file) return;
  isProcessing.value = true;
  uploadError.value = '';
  pageError.value = '';
  processingProgress.value = 5;

  // Simulated smooth progress while we wait for AI
  const progressTimer = setInterval(() => {
    if (processingProgress.value < 85) {
      processingProgress.value = Math.min(85, processingProgress.value + 5);
    }
  }, 800);

  try {
    const result = await jobMatchingService.matchCvWithJobs(file);
    processingProgress.value = 92;
    matchResult.value = result;
    analysis.value = result.analysis;
    persistState();

    // Generate reasons for top matches (don't block UI)
    generateReasonsForTopMatches(result.matches);

    // Generate career advice in background
    generateCareerAdvice(file);

    processingProgress.value = 100;
  } catch (err: any) {
    console.error('AI matching error', err);
    const msg = err?.response?.data?.message || err?.message || t('aiJobMatching.errorGeneric');
    uploadError.value = msg;
    pageError.value = msg;
  } finally {
    clearInterval(progressTimer);
    isProcessing.value = false;
  }
}

async function generateCareerAdvice(file: File) {
  try {
    careerAdvice.value = await jobMatchingService.getCareerAdvice(file);
    persistState();
  } catch (e) {
    console.warn('Could not generate career advice', e);
  }
}

async function generateReasonsForTopMatches(matches: JobMatchResult[]) {
  // Reasons are generated server-side in scoreJob. This is a placeholder for
  // any future per-match LLM enhancement.
  return matches;
}

async function onSaveJob(match: JobMatchResult) {
  if (!match.jobId) return;
  savingJobId.value = match.jobId;
  try {
    await savedJobService.saveJobById(match.jobId);
    savedJobIds.value = new Set([...savedJobIds.value, match.jobId]);
  } catch (e: any) {
    pageError.value = e?.response?.data?.message || t('aiJobMatching.errorGeneric');
  } finally {
    savingJobId.value = null;
  }
}

async function onUnsaveJob(match: JobMatchResult) {
  if (!match.jobId) return;
  savingJobId.value = match.jobId;
  try {
    await savedJobService.unsaveJob(match.jobId);
    const next = new Set(savedJobIds.value);
    next.delete(match.jobId);
    savedJobIds.value = next;
  } catch (e: any) {
    pageError.value = e?.response?.data?.message || t('aiJobMatching.errorGeneric');
  } finally {
    savingJobId.value = null;
  }
}

function openJobDetail(match: JobMatchResult) {
  detailMatch.value = match;
  isDetailOpen.value = true;
}

function closeJobDetail() {
  isDetailOpen.value = false;
  detailMatch.value = null;
}

function applyFromDetail() {
  if (!detailMatch.value?.job) return;
  router.push({ name: 'JobDetail', params: { id: detailMatch.value.job.id } });
}

function reset() {
  selectedFile.value = null;
  uploadError.value = '';
  pageError.value = '';
  analysis.value = null;
  matchResult.value = null;
  careerAdvice.value = null;
  processingProgress.value = 0;
  activeFilter.value = null;
  sessionStorage.removeItem('ai-match-result');
}
</script>
