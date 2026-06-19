<script setup lang="ts">
import { computed } from 'vue';
import {
  MapPin,
  Banknote,
  Briefcase,
  Clock,
  Building2,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-vue-next';
import type { JobResponse } from '@/api/jobMatchingService';
import BaseBadge from '@/components/base/BaseBadge.vue';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import MatchScoreBadge from '@/components/jobs/MatchScoreBadge.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  job: JobResponse | null;
  matchScore?: number | null;
  matchLevel?: string;
  matchLabel?: string;
  isSaved?: boolean;
  isApplied?: boolean;
  showAiScore?: boolean;
}>();

const emit = defineEmits<{
  (e: 'save', job: JobResponse): void;
  (e: 'view', job: JobResponse): void;
  (e: 'apply', job: JobResponse): void;
}>();

const openSource = () => {
  if (props.job && props.job.sourceUrl) {
    window.open(props.job.sourceUrl, '_blank', 'noopener,noreferrer')
  }
}

const { t, locale } = useI18n();

function isCloudinaryUrl(url?: string | null): boolean {
  return !!url && url.includes('res.cloudinary.com');
}

const shouldUseCrossOrigin = computed(() => isCloudinaryUrl(props.job?.companyLogo));

const companyInitials = computed(() => {
  const name = props.job?.companyName || '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
});

const companyColor = computed(() => {
  const name = props.job?.companyName || '?';
  const colors = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-rose-600',
    'from-sky-500 to-cyan-600',
    'from-amber-500 to-orange-600',
    'from-fuchsia-500 to-violet-600',
    'from-lime-500 to-green-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  return colors[Math.abs(hash) % colors.length];
});

const jobTypeLabel = computed(() => {
  const v = props.job?.jobType?.toLowerCase();
  if (!v) return '';
  return v
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
});

const seniorityLabel = computed(() => {
  const v = props.job?.seniority?.toLowerCase();
  if (!v) return '';
  return v.charAt(0).toUpperCase() + v.slice(1);
});

const experienceLabel = computed(() => {
  const v = props.job?.experienceLevel?.toLowerCase();
  if (!v) return '';
  return v
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
});

const salaryDisplay = computed(() => {
  const job = props.job;
  if (!job) return '';
  if (job.salary && job.salary.trim()) return job.salary;
  if (job.salaryMin || job.salaryMax) {
    const currency = job.currency || 'USD';
    return `${job.salaryMin || '?'} - ${job.salaryMax || '?'} ${currency}`;
  }
  return '';
});

const descriptionSnippet = computed(() => {
  const text = (props.job?.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return t('jobs.noDescription', 'No description available');
  return text.length > 200 ? text.slice(0, 200) + '…' : text;
});

const skillsDisplay = computed(() => (props.job?.skills || []).slice(0, 5));
const hasMoreSkills = computed(() => (props.job?.skills || []).length > 5);

const postedDate = computed(() => {
  if (!props.job?.createdAt) return '';
  const date = new Date(props.job.createdAt);
  if (Number.isNaN(date.getTime())) return '';
  const diff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 1) return locale.value === 'vi' ? 'Hôm nay' : 'Today';
  if (diff < 2) return locale.value === 'vi' ? 'Hôm qua' : 'Yesterday';
  if (diff < 30) return `${Math.floor(diff)} ${locale.value === 'vi' ? 'ngày trước' : 'days ago'}`;
  return date.toLocaleDateString(locale.value === 'vi' ? 'vi-VN' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
});
</script>

<template>
  <article v-if="job"
    class="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
    @click="emit('view', job)">
    <!-- AI Match ribbon -->
    <div v-if="showAiScore && matchScore != null"
      class="absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-semibold uppercase tracking-wider text-white flex items-center gap-1"
      :class="{
        'bg-emerald-500': matchScore >= 90,
        'bg-blue-500': matchScore >= 70 && matchScore < 90,
        'bg-orange-500': matchScore >= 50 && matchScore < 70,
        'bg-slate-500': matchScore < 50,
      }">
      <Sparkles class="w-3 h-3" />
      AI {{ Math.round(matchScore) }}%
    </div>

    <div class="p-5">
      <!-- Top: company + actions -->
      <div class="flex items-start gap-4">
        <!-- Logo -->
        <div
          class="w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shadow-md"
          :class="companyColor">
          <img v-if="job && job.companyLogo" :src="job.companyLogo" :alt="job.companyName"
            class="w-full h-full rounded-xl object-cover" :crossorigin="shouldUseCrossOrigin ? 'anonymous' : undefined"
            @error="(($event.target as HTMLImageElement).style.display = 'none')" />
          <span v-else>{{ companyInitials }}</span>
        </div>

        <!-- Title + company -->
        <div class="flex-1 min-w-0">
          <h3
            class="text-base font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {{ job.title }}
          </h3>
          <div class="mt-1 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
            <Building2 class="w-3.5 h-3.5 shrink-0" />
            <span class="truncate font-medium">{{ job.companyName }}</span>
          </div>
        </div>

        <!-- Save button -->
        <button type="button"
          class="shrink-0 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" :class="isSaved
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            " :aria-label="isSaved ? t('jobs.unsave', 'Unsave') : t('jobs.save', 'Save')"
          @click.stop="emit('save', job)">
          <BookmarkCheck v-if="isSaved" class="w-5 h-5" />
          <Bookmark v-else class="w-5 h-5" />
        </button>
      </div>

      <!-- Summary -->
      <p class="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
        {{ descriptionSnippet }}
      </p>

      <!-- Meta badges -->
      <div class="mt-4 flex flex-wrap gap-2">
        <BaseBadge variant="primary" size="sm" v-if="job.location">
          <MapPin class="w-3 h-3 mr-1" />
          {{ job.location }}
        </BaseBadge>
        <BaseBadge variant="success" size="sm" v-if="salaryDisplay">
          <Banknote class="w-3 h-3 mr-1" />
          {{ salaryDisplay }}
        </BaseBadge>
        <BaseBadge variant="info" size="sm" v-if="jobTypeLabel">
          <Briefcase class="w-3 h-3 mr-1" />
          {{ jobTypeLabel }}
        </BaseBadge>
        <BaseBadge variant="warning" size="sm" v-if="seniorityLabel || experienceLabel">
          <Clock class="w-3 h-3 mr-1" />
          {{ seniorityLabel || experienceLabel }}
        </BaseBadge>
      </div>

      <!-- Skills -->
      <div v-if="skillsDisplay.length" class="mt-3 flex flex-wrap gap-1.5">
        <span v-for="skill in skillsDisplay" :key="skill"
          class="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-md">
          {{ skill }}
        </span>
        <span v-if="hasMoreSkills" class="px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          +{{ (job.skills || []).length - 5 }}
        </span>
      </div>

      <!-- Footer -->
      <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span v-if="postedDate">{{ postedDate }}</span>
          <span v-if="job.source" class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/50">
            {{ job.source }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button v-if="job.sourceUrl" type="button"
            class="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
            :title="t('jobs.viewOriginal', 'View original')" @click.stop="openSource">
            <ExternalLink class="w-4 h-4" />
          </button>

          <button type="button"
            class="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            @click.stop="emit('view', job)">
            {{ t('jobs.viewDetails', 'View Details') }}
          </button>

          <button type="button" :disabled="isApplied"
            class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-sm" :class="isApplied
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20'
              " @click.stop="emit('apply', job)">
            {{ isApplied ? t('jobs.applied', 'Applied') : t('jobs.applyNow', 'Apply Now') }}
          </button>
        </div>
      </div>
    </div>
  </article>
</template>
