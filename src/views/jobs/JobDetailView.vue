<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Banknote,
  Briefcase,
  Clock,
  Globe,
  Calendar,
  ExternalLink,
  Share2,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Send,
  Star,
  BarChart3,
  Award,
  Loader2,
} from 'lucide-vue-next';
import MainLayout from '@/layouts/MainLayout.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseBadge from '@/components/base/BaseBadge.vue';
import MatchScoreBadge from '@/components/jobs/MatchScoreBadge.vue';
import { jobService, savedJobService } from '@/api/jobMatchingService';
import type { JobResponse } from '@/api/jobMatchingService';
import type { JobMatchResult } from '@/api/jobMatchingService';

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();

const jobId = computed(() => route.params.id as string);
const job = ref<JobResponse | null>(null);
const isLoading = ref(true);
const isSaved = ref(false);
const activeTab = ref('overview');
const aiMatchResult = ref<JobMatchResult | null>(null);
const aiAnalyzing = ref(false);
const aiError = ref('');

const tabs = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'description', label: 'Description', icon: FileText_ },
  { key: 'requirements', label: 'Requirements', icon: AlertCircle },
  { key: 'benefits', label: 'Benefits', icon: Award },
  { key: 'skills', label: 'Skills', icon: Star },
];

// Inline FileText icon to avoid import issues
function FileText_(_props: any) {
  return { render: () => null };
}

const companyInitials = computed(() => {
  const name = job.value?.companyName || '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
});

const companyColor = computed(() => {
  const name = job.value?.companyName || '?';
  const colors = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-rose-600',
    'from-sky-500 to-cyan-600',
    'from-amber-500 to-orange-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  return colors[Math.abs(hash) % colors.length];
});

const postedDate = computed(() => {
  if (!job.value?.createdAt) return '';
  const date = new Date(job.value.createdAt);
  if (Number.isNaN(date.getTime())) return '';
  const diff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 1) return locale.value === 'vi' ? 'Hôm nay' : 'Today';
  if (diff < 2) return locale.value === 'vi' ? 'Hôm qua' : 'Yesterday';
  if (diff < 30) return `${Math.floor(diff)} ${locale.value === 'vi' ? 'ngày trước' : 'days ago'}`;
  return date.toLocaleDateString(locale.value === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'medium' });
});

const salaryDisplay = computed(() => {
  if (job.value?.salary?.trim()) return job.value.salary;
  if (job.value?.salaryMin || job.value?.salaryMax) {
    const c = job.value.currency || 'USD';
    return `${job.value.salaryMin || '?'} - ${job.value.salaryMax || '?'} ${c}`;
  }
  return '';
});

const htmlDescription = computed(() => {
  if (!job.value?.description) return '';
  return job.value.description;
});

const htmlRequirements = computed(() => {
  if (!job.value?.requirements) return '';
  return job.value.requirements;
});

const htmlBenefits = computed(() => {
  if (!job.value?.benefits) return '';
  return job.value.benefits;
});

async function loadJob() {
  isLoading.value = true;
  try {
    job.value = await jobService.getJobById(jobId.value);
    await loadSaved();
  } catch (e) {
    console.error('Failed to load job:', e);
  } finally {
    isLoading.value = false;
  }
}

async function loadSaved() {
  try {
    isSaved.value = await savedJobService.isSaved(jobId.value);
  } catch {
    /* ignore */
  }
}

async function toggleSave() {
  try {
    if (isSaved.value) {
      await savedJobService.unsaveJob(jobId.value);
      isSaved.value = false;
    } else {
      await savedJobService.saveJobById(jobId.value);
      isSaved.value = true;
    }
  } catch (e) {
    console.error('Save toggle failed:', e);
  }
}

function share() {
  if (navigator.share) {
    navigator.share({
      title: job.value?.title,
      text: `${job.value?.title} at ${job.value?.companyName}`,
      url: window.location.href,
    });
  } else {
    navigator.clipboard.writeText(window.location.href);
  }
}

function applyOriginal() {
  if (job.value?.sourceUrl) {
    window.open(job.value.sourceUrl, '_blank', 'noopener,noreferrer');
  }
}

onMounted(loadJob);
</script>

<template>
  <MainLayout>
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 -m-6">
      <!-- Loading skeleton -->
      <div v-if="isLoading" class="max-w-7xl mx-auto px-6 py-8 animate-pulse">
        <div class="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
        <div class="grid lg:grid-cols-[1fr_340px] gap-8">
          <div class="space-y-4">
            <div class="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
            <div class="h-40 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
          </div>
          <div class="h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
        </div>
      </div>

      <template v-else-if="job">
        <!-- Back nav -->
        <div class="max-w-7xl mx-auto px-6 pt-6">
          <button
            type="button"
            class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            @click="router.back()"
          >
            <ArrowLeft class="w-4 h-4" />
            {{ t('common.back', 'Back') }}
          </button>
        </div>

        <div class="max-w-7xl mx-auto px-6 py-6 grid lg:grid-cols-[1fr_340px] gap-8">
          <!-- Main content -->
          <main>
            <!-- Job header card -->
            <div
              class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
            >
              <!-- Gradient header band -->
              <div class="h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
              <div class="p-6">
                <div class="flex items-start gap-4">
                  <!-- Company logo -->
                  <div
                    class="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl shadow-lg"
                    :class="companyColor"
                  >
                    <img
                      v-if="job && job.companyLogo"
                      :src="job.companyLogo"
                      :alt="job.companyName"
                      class="w-full h-full rounded-2xl object-cover"
                      @error="(($event.target as HTMLImageElement).style.display = 'none')"
                    />
                    <span v-else>{{ companyInitials }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h1 class="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                      {{ job.title }}
                    </h1>
                    <div class="mt-1.5 flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Building2 class="w-4 h-4" />
                      <span class="font-semibold">{{ job.companyName }}</span>
                    </div>
                  </div>
                </div>

                <!-- Meta badges -->
                <div class="mt-5 flex flex-wrap gap-2">
                  <BaseBadge variant="primary" size="sm" v-if="job.location">
                    <MapPin class="w-3 h-3 mr-1" />{{ job.location }}
                  </BaseBadge>
                  <BaseBadge variant="success" size="sm" v-if="salaryDisplay">
                    <Banknote class="w-3 h-3 mr-1" />{{ salaryDisplay }}
                  </BaseBadge>
                  <BaseBadge variant="info" size="sm" v-if="job.jobType">
                    <Briefcase class="w-3 h-3 mr-1" />{{ job.jobType?.replace(/_/g, ' ') }}
                  </BaseBadge>
                  <BaseBadge variant="warning" size="sm" v-if="job.seniority">
                    <Clock class="w-3 h-3 mr-1" />{{ job.seniority }}
                  </BaseBadge>
                  <BaseBadge variant="default" size="sm" v-if="postedDate">
                    <Calendar class="w-3 h-3 mr-1" />{{ postedDate }}
                  </BaseBadge>
                  <BaseBadge variant="default" size="sm" v-if="job.source">
                    <Globe class="w-3 h-3 mr-1" />{{ job.source }}
                  </BaseBadge>
                </div>
              </div>
            </div>

            <!-- Tabs -->
            <div class="mt-4">
              <div class="flex items-center gap-1 overflow-x-auto pb-1">
                <button
                  v-for="tab in tabs"
                  :key="tab.key"
                  type="button"
                  :class="[
                    'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors',
                    activeTab === tab.key
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
                  ]"
                  @click="activeTab = tab.key"
                >
                  {{ t(`jobs.detail.tabs.${tab.key}`, tab.label) }}
                </button>
              </div>
            </div>

            <!-- Tab content -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mt-4 p-6">
              <!-- Overview -->
              <div v-if="activeTab === 'overview'" class="space-y-6">
                <div>
                  <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-3">
                    {{ t('jobs.detail.overview.title', 'Job Overview') }}
                  </h3>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div v-if="job.experienceLevel">
                      <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        {{ t('jobs.detail.overview.experience', 'Experience') }}
                      </p>
                      <p class="text-sm font-semibold text-slate-900 dark:text-white">
                        {{ job.experienceLevel?.replace(/_/g, ' ') }}
                      </p>
                    </div>
                    <div v-if="job.jobType">
                      <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        {{ t('jobs.detail.overview.jobType', 'Job Type') }}
                      </p>
                      <p class="text-sm font-semibold text-slate-900 dark:text-white">
                        {{ job.jobType?.replace(/_/g, ' ') }}
                      </p>
                    </div>
                    <div v-if="job.seniority">
                      <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        {{ t('jobs.detail.overview.seniority', 'Seniority') }}
                      </p>
                      <p class="text-sm font-semibold text-slate-900 dark:text-white">
                        {{ job.seniority }}
                      </p>
                    </div>
                    <div v-if="job.industry">
                      <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        {{ t('jobs.detail.overview.industry', 'Industry') }}
                      </p>
                      <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ job.industry }}</p>
                    </div>
                    <div v-if="job.englishLevel">
                      <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        {{ t('jobs.detail.overview.english', 'English Level') }}
                      </p>
                      <p class="text-sm font-semibold text-slate-900 dark:text-white capitalize">
                        {{ job.englishLevel }}
                      </p>
                    </div>
                    <div v-if="job.source">
                      <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        {{ t('jobs.detail.overview.source', 'Source') }}
                      </p>
                      <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ job.source }}</p>
                    </div>
                  </div>
                </div>

                <!-- Description preview -->
                <div v-if="job.description">
                  <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-3">
                    {{ t('jobs.detail.overview.description', 'Description') }}
                  </h3>
                  <div
                    class="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 line-clamp-6 [&_ul]:list-disc [&_ol]:list-decimal"
                    v-html="htmlDescription"
                  ></div>
                  <button
                    type="button"
                    class="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    @click="activeTab = 'description'"
                  >
                    {{ t('jobs.detail.overview.viewMore', 'View full description') }} →
                  </button>
                </div>

                <!-- Skills preview -->
                <div v-if="(job.skills || []).length">
                  <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-3">
                    {{ t('jobs.detail.overview.keySkills', 'Key Skills') }}
                  </h3>
                  <div class="flex flex-wrap gap-2">
                    <BaseBadge
                      v-for="skill in job.skills?.slice(0, 10)"
                      :key="skill"
                      variant="primary"
                      size="sm"
                    >
                      {{ skill }}
                    </BaseBadge>
                    <BaseBadge
                      v-if="(job.skills || []).length > 10"
                      variant="default"
                      size="sm"
                    >
                      +{{ (job.skills || []).length - 10 }}
                    </BaseBadge>
                  </div>
                </div>
              </div>

              <!-- Description tab -->
              <div v-else-if="activeTab === 'description'">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  {{ t('jobs.detail.description.title', 'Job Description') }}
                </h3>
                <div
                  v-if="job.description"
                  class="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 [&_ul]:list-disc [&_ol]:list-decimal"
                  v-html="htmlDescription"
                ></div>
                <div v-else class="text-slate-500 dark:text-slate-400">
                  {{ t('jobs.noDescription', 'No description available.') }}
                </div>
              </div>

              <!-- Requirements tab -->
              <div v-else-if="activeTab === 'requirements'">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  {{ t('jobs.detail.requirements.title', 'Requirements') }}
                </h3>
                <div
                  v-if="job.requirements"
                  class="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 [&_ul]:list-disc [&_ol]:list-decimal"
                  v-html="htmlRequirements"
                ></div>
                <div v-else class="text-slate-500 dark:text-slate-400">
                  {{ t('jobs.noRequirements', 'No requirements listed.') }}
                </div>
              </div>

              <!-- Benefits tab -->
              <div v-else-if="activeTab === 'benefits'">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  {{ t('jobs.detail.benefits.title', 'Benefits') }}
                </h3>
                <div
                  v-if="job.benefits"
                  class="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 [&_ul]:list-disc [&_ol]:list-decimal"
                  v-html="htmlBenefits"
                ></div>
                <div v-else class="text-slate-500 dark:text-slate-400">
                  {{ t('jobs.noBenefits', 'No benefits listed.') }}
                </div>
              </div>

              <!-- Skills tab -->
              <div v-else-if="activeTab === 'skills'">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  {{ t('jobs.detail.skills.title', 'Required Skills') }}
                </h3>
                <div v-if="(job.skills || []).length" class="flex flex-wrap gap-2">
                  <BaseBadge
                    v-for="skill in job.skills"
                    :key="skill"
                    variant="primary"
                    size="md"
                    class="py-1.5 px-3"
                  >
                    {{ skill }}
                  </BaseBadge>
                </div>
                <div v-if="(job.technologies || []).length" class="mt-6">
                  <h4 class="text-base font-semibold text-slate-900 dark:text-white mb-3">
                    {{ t('jobs.detail.skills.technologies', 'Technologies') }}
                  </h4>
                  <div class="flex flex-wrap gap-2">
                    <BaseBadge
                      v-for="tech in job.technologies"
                      :key="tech"
                      variant="info"
                      size="md"
                      class="py-1.5 px-3"
                    >
                      {{ tech }}
                    </BaseBadge>
                  </div>
                </div>
                <div v-if="(job.certifications || []).length" class="mt-6">
                  <h4 class="text-base font-semibold text-slate-900 dark:text-white mb-3">
                    {{ t('jobs.detail.skills.certifications', 'Certifications') }}
                  </h4>
                  <div class="flex flex-wrap gap-2">
                    <BaseBadge
                      v-for="cert in job.certifications"
                      :key="cert"
                      variant="warning"
                      size="md"
                      class="py-1.5 px-3"
                    >
                      <Award class="w-3 h-3 mr-1" />{{ cert }}
                    </BaseBadge>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <!-- Sticky sidebar -->
          <aside class="space-y-4">
            <!-- Apply card -->
            <div
              class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4 sticky top-20"
            >
              <!-- Company info -->
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold shadow"
                  :class="companyColor"
                >
                  <img
                    v-if="job && job.companyLogo"
                    :src="job.companyLogo"
                    :alt="job.companyName"
                    class="w-full h-full rounded-xl object-cover"
                    @error="(($event.target as HTMLImageElement).style.display = 'none')"
                  />
                  <span v-else class="text-lg">{{ companyInitials }}</span>
                </div>
                <div class="min-w-0">
                  <p class="font-semibold text-slate-900 dark:text-white truncate">{{ job.companyName }}</p>
                  <p v-if="job.location" class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin class="w-3 h-3" />{{ job.location }}
                  </p>
                </div>
              </div>

              <!-- Salary -->
              <div v-if="salaryDisplay" class="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                <Banknote class="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span class="font-semibold text-emerald-800 dark:text-emerald-300">{{ salaryDisplay }}</span>
              </div>

              <!-- Apply button -->
              <BaseButton
                variant="primary"
                size="lg"
                full-width
                @click="router.push({ name: 'JobApply', params: { id: job.id } })"
              >
                <Send class="w-4 h-4 mr-2" />
                {{ t('jobs.applyNow', 'Apply Now') }}
              </BaseButton>

              <!-- Apply on original site -->
              <button
                v-if="job.sourceUrl"
                type="button"
                class="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-500/50"
                @click="applyOriginal"
              >
                <ExternalLink class="w-4 h-4" />
                {{ t('jobs.applyOnOriginal', 'Apply on') }} {{ job.source || 'Original Site' }}
              </button>

              <!-- Divider -->
              <div class="border-t border-slate-100 dark:border-slate-700"></div>

              <!-- Save + Share -->
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  :class="
                    isSaved
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30'
                      : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  "
                  @click="toggleSave"
                >
                  <BookmarkCheck v-if="isSaved" class="w-4 h-4" />
                  <Bookmark v-else class="w-4 h-4" />
                  {{ isSaved ? t('jobs.saved', 'Saved') : t('jobs.save', 'Save') }}
                </button>
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  @click="share"
                >
                  <Share2 class="w-4 h-4" />
                  {{ t('jobs.share', 'Share') }}
                </button>
              </div>
            </div>

            <!-- AI Match card -->
            <div
              class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 rounded-2xl border border-blue-100 dark:border-slate-700 p-5"
            >
              <div class="flex items-center gap-2 mb-3">
                <Sparkles class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 class="font-bold text-slate-900 dark:text-white">
                  {{ t('jobs.aiMatch.title', 'AI Match Score') }}
                </h3>
              </div>
              <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {{ t('jobs.aiMatch.desc', 'See how well your CV matches this job requirements.') }}
              </p>

              <div v-if="aiAnalyzing" class="flex items-center justify-center py-4">
                <Loader2 class="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>

              <div v-else-if="aiMatchResult" class="space-y-3">
                <MatchScoreBadge :score="aiMatchResult.matchScore" :level="aiMatchResult.level" />
                <div v-if="aiMatchResult.matchedSkills?.length" class="space-y-1.5">
                  <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                    {{ t('jobs.aiMatch.matchedSkills', 'Matched Skills') }}
                  </p>
                  <div class="flex flex-wrap gap-1">
                    <BaseBadge
                      v-for="skill in aiMatchResult.matchedSkills.slice(0, 5)"
                      :key="skill"
                      variant="success"
                      size="sm"
                    >
                      <CheckCircle2 class="w-3 h-3 mr-0.5" />{{ skill }}
                    </BaseBadge>
                  </div>
                </div>
                <div v-if="aiMatchResult.missingSkills?.length" class="space-y-1.5">
                  <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                    {{ t('jobs.aiMatch.missingSkills', 'Skill Gaps') }}
                  </p>
                  <div class="flex flex-wrap gap-1">
                    <BaseBadge
                      v-for="skill in aiMatchResult.missingSkills.slice(0, 5)"
                      :key="skill"
                      variant="warning"
                      size="sm"
                    >
                      <AlertCircle class="w-3 h-3 mr-0.5" />{{ skill }}
                    </BaseBadge>
                  </div>
                </div>
              </div>

              <div v-else class="space-y-3">
                <p v-if="aiError" class="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 p-2 rounded-lg">
                  {{ aiError }}
                </p>
                <BaseButton variant="outline" size="md" full-width @click="router.push({ name: 'AIJobMatching' })">
                  <Sparkles class="w-4 h-4 mr-2" />
                  {{ t('jobs.aiMatch.run', 'Run AI Analysis') }}
                </BaseButton>
              </div>
            </div>

            <!-- Education & Languages -->
            <div
              v-if="(job.education || []).length || (job.languages || []).length"
              class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-3"
            >
              <h3 class="font-bold text-slate-900 dark:text-white text-sm">
                {{ t('jobs.detail.qualifications', 'Qualifications') }}
              </h3>
              <div v-if="(job.education || []).length">
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {{ t('jobs.detail.education', 'Education') }}
                </p>
                <div class="flex flex-wrap gap-1">
                  <BaseBadge v-for="edu in job.education" :key="edu" variant="default" size="sm">
                    {{ edu }}
                  </BaseBadge>
                </div>
              </div>
              <div v-if="(job.languages || []).length">
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {{ t('jobs.detail.languages', 'Languages') }}
                </p>
                <div class="flex flex-wrap gap-1">
                  <BaseBadge v-for="lang in job.languages" :key="lang" variant="info" size="sm">
                    {{ lang }}
                  </BaseBadge>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </template>

      <!-- Job not found -->
      <div v-else class="max-w-7xl mx-auto px-6 py-20 text-center">
        <AlertCircle class="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {{ t('jobs.notFound', 'Job not found') }}
        </h2>
        <p class="text-slate-600 dark:text-slate-400 mb-6">
          {{ t('jobs.notFoundDesc', 'This job may have been removed or is no longer active.') }}
        </p>
        <BaseButton variant="primary" @click="router.push({ name: 'JobListing' })">
          <ChevronRight class="w-4 h-4 mr-1" />
          {{ t('jobs.browseJobs', 'Browse all jobs') }}
        </BaseButton>
      </div>
    </div>
  </MainLayout>
</template>
