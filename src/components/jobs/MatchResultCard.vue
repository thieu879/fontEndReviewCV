<template>
  <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
    <div class="p-6 space-y-4">
      <!-- Header -->
      <div class="flex items-start gap-3">
        <div class="w-12 h-12 rounded-xl overflow-hidden bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0">
          <img v-if="job?.companyLogo" :src="job.companyLogo" :alt="job.companyName" class="w-full h-full object-contain" @error="onLogoError" />
          <Building2 v-else class="w-5 h-5 text-slate-400" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-slate-900 dark:text-white text-base line-clamp-2">
            {{ job?.title || t('aiJobMatching.viewJob') }}
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
            {{ job?.companyName || '—' }}
          </p>
        </div>
        <MatchScoreBadge :score="match.matchScore" size="sm" />
      </div>

      <!-- Meta info -->
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div v-if="job?.location" class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <MapPin class="w-3.5 h-3.5 text-slate-400" />
          <span class="truncate">{{ job.location }}</span>
        </div>
        <div v-if="job?.salary" class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <DollarSign class="w-3.5 h-3.5 text-emerald-500" />
          <span class="truncate font-semibold">{{ job.salary }}</span>
        </div>
        <div v-if="job?.experienceLevel" class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <Briefcase class="w-3.5 h-3.5 text-slate-400" />
          <span class="truncate">{{ job.experienceLevel }}</span>
        </div>
        <div v-if="job?.source" class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <Globe class="w-3.5 h-3.5 text-slate-400" />
          <span class="truncate">{{ job.source }}</span>
        </div>
      </div>

      <!-- Score breakdown -->
      <div v-if="hasScoreBreakdown" class="grid grid-cols-3 gap-1.5 text-center">
        <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/40">
          <p class="text-[10px] font-bold uppercase text-slate-400">{{ t('aiJobMatching.skillsScore') }}</p>
          <p class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ Math.round(match.skillsScore || 0) }}%</p>
        </div>
        <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/40">
          <p class="text-[10px] font-bold uppercase text-slate-400">{{ t('aiJobMatching.experienceScore') }}</p>
          <p class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ Math.round(match.experienceScore || 0) }}%</p>
        </div>
        <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/40">
          <p class="text-[10px] font-bold uppercase text-slate-400">{{ t('aiJobMatching.titleScore') }}</p>
          <p class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ Math.round(match.titleScore || 0) }}%</p>
        </div>
      </div>

      <!-- AI Reason -->
      <div v-if="match.reason" class="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-900/40">
        <div class="flex items-start gap-2">
          <Sparkles class="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p class="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-0.5">{{ t('aiJobMatching.aiInsight') }}</p>
            <p class="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {{ match.reason }}
            </p>
          </div>
        </div>
      </div>

      <!-- Skills -->
      <div v-if="match.matchedSkills.length > 0 || match.missingSkills.length > 0" class="space-y-2">
        <div v-if="match.matchedSkills.length > 0">
          <p class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">{{ t('aiJobMatching.matchedSkills') }}</p>
          <div class="flex flex-wrap gap-1">
            <SkillTag v-for="s in match.matchedSkills.slice(0, 6)" :key="'m-' + s" variant="success" size="xs">
              <CheckCircle2 class="w-3 h-3" />
              {{ s }}
            </SkillTag>
            <span v-if="match.matchedSkills.length > 6" class="text-[10px] text-slate-500 self-center">
              +{{ match.matchedSkills.length - 6 }} {{ t('aiJobMatching.more') }}
            </span>
          </div>
        </div>
        <div v-if="match.missingSkills.length > 0">
          <p class="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5">{{ t('aiJobMatching.missingSkills') }}</p>
          <div class="flex flex-wrap gap-1">
            <SkillTag v-for="s in match.missingSkills.slice(0, 6)" :key="'x-' + s" variant="warning" size="xs">
              <AlertCircle class="w-3 h-3" />
              {{ s }}
            </SkillTag>
            <span v-if="match.missingSkills.length > 6" class="text-[10px] text-slate-500 self-center">
              +{{ match.missingSkills.length - 6 }} {{ t('aiJobMatching.more') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
        <button
          @click="$emit('view', match)"
          class="flex-1 min-w-[100px] h-10 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <FileText class="w-3.5 h-3.5" />
          {{ t('aiJobMatching.viewJob') }}
        </button>
        <button
          @click="handleSave"
          :disabled="isSaving"
          class="flex-1 min-w-[100px] h-10 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          :class="isSaved
            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
            : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'"
        >
          <Bookmark v-if="!isSaved" class="w-3.5 h-3.5" />
          <BookmarkCheck v-else class="w-3.5 h-3.5" />
          {{ isSaved ? t('aiJobMatching.saved') : t('aiJobMatching.save') }}
        </button>
        <button
          @click="handleApply"
          class="flex-1 min-w-[100px] h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
        >
          <ExternalLink class="w-3.5 h-3.5" />
          {{ t('aiJobMatching.applyNow') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Building2, MapPin, DollarSign, Briefcase, Globe, Sparkles,
  CheckCircle2, AlertCircle, FileText, Bookmark, BookmarkCheck, ExternalLink
} from 'lucide-vue-next';
import MatchScoreBadge from './MatchScoreBadge.vue';
import SkillTag from './SkillTag.vue';
import type { JobMatchResult } from '@/api/jobMatchingService';

const { t } = useI18n();

const props = defineProps<{
  match: JobMatchResult;
  isSaved?: boolean;
  isSaving?: boolean;
  applyUrl?: string | null;
}>();

const emit = defineEmits<{
  (e: 'view', match: JobMatchResult): void;
  (e: 'save', match: JobMatchResult): void;
  (e: 'unsave', match: JobMatchResult): void;
}>();

const logoError = ref(false);
const onLogoError = () => { logoError.value = true; };

const job = computed(() => props.match.job);

const hasScoreBreakdown = computed(() =>
  props.match.skillsScore != null ||
  props.match.experienceScore != null ||
  props.match.titleScore != null
);

const handleSave = () => {
  if (props.isSaved) emit('unsave', props.match);
  else emit('save', props.match);
};

const handleApply = () => {
  const url = props.applyUrl || job.value?.sourceUrl;
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
};
</script>
