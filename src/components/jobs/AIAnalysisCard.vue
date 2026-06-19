<template>
  <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
    <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-sm">
        <Sparkles class="w-5 h-5 text-white" />
      </div>
      <div class="flex-1">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">CV Analysis</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Extracted by AI from your CV</p>
      </div>
      <BaseBadge variant="success" size="sm" pill>
        <CheckCircle2 class="w-3 h-3 mr-1" /> Analyzed
      </BaseBadge>
    </div>

    <div v-if="analysis" class="p-6 space-y-6">
      <!-- Candidate Header -->
      <div class="flex items-start gap-4">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-sm">
          {{ initials }}
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">
            {{ analysis.candidateName || 'Unknown candidate' }}
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
            {{ analysis.jobTitle || 'Role not detected' }}
          </p>
          <div class="flex flex-wrap items-center gap-2 mt-2">
            <span v-if="analysis.experienceYears > 0" class="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
              <Briefcase class="w-3 h-3" /> {{ analysis.experienceYears }} years exp
            </span>
            <span v-if="analysis.seniority" class="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md capitalize">
              <Award class="w-3 h-3" /> {{ analysis.seniority }}
            </span>
            <span v-if="analysis.englishLevel" class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md capitalize">
              <Globe class="w-3 h-3" /> English: {{ analysis.englishLevel }}
            </span>
            <span v-if="analysis.industry" class="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md">
              <Building2 class="w-3 h-3" /> {{ analysis.industry }}
            </span>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div v-if="analysis.summary" class="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">
        <p class="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
          {{ analysis.summary }}
        </p>
      </div>

      <!-- Skills -->
      <div v-if="analysis.skills.length > 0 || analysis.technologies.length > 0">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Skills & Technologies</h4>
        <div class="flex flex-wrap gap-1.5">
          <SkillTag v-for="t in analysis.technologies" :key="'t-' + t" variant="primary" size="sm">{{ t }}</SkillTag>
          <SkillTag v-for="s in analysis.skills" :key="'s-' + s" variant="default" size="sm">{{ s }}</SkillTag>
        </div>
      </div>

      <!-- Education / Languages -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-if="analysis.education.length > 0">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <GraduationCap class="w-3.5 h-3.5" /> Education
          </h4>
          <ul class="space-y-1.5">
            <li v-for="e in analysis.education" :key="e" class="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
              <span class="w-1 h-1 rounded-full bg-blue-500 mt-2 shrink-0" /> {{ e }}
            </li>
          </ul>
        </div>
        <div v-if="analysis.languages.length > 0">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Globe class="w-3.5 h-3.5" /> Languages
          </h4>
          <ul class="space-y-1.5">
            <li v-for="l in analysis.languages" :key="l" class="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
              <span class="w-1 h-1 rounded-full bg-emerald-500 mt-2 shrink-0" /> {{ l }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Certifications -->
      <div v-if="analysis.certifications.length > 0">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
          <Award class="w-3.5 h-3.5" /> Certifications
        </h4>
        <div class="flex flex-wrap gap-1.5">
          <SkillTag v-for="c in analysis.certifications" :key="c" variant="warning" size="sm">{{ c }}</SkillTag>
        </div>
      </div>

      <!-- Recommended Roles -->
      <div v-if="analysis.recommendedRoles.length > 0">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
          <Target class="w-3.5 h-3.5" /> Recommended Roles
        </h4>
        <div class="flex flex-wrap gap-1.5">
          <SkillTag v-for="r in analysis.recommendedRoles" :key="r" variant="success" size="sm">{{ r }}</SkillTag>
        </div>
      </div>

      <!-- Strengths -->
      <div v-if="analysis.strengths.length > 0">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
          <TrendingUp class="w-3.5 h-3.5" /> Key Strengths
        </h4>
        <ul class="space-y-1.5">
          <li v-for="s in analysis.strengths" :key="s" class="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
            <CheckCircle2 class="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> {{ s }}
          </li>
        </ul>
      </div>
    </div>

    <div v-else class="p-10 text-center text-slate-500">
      <Sparkles class="w-10 h-10 mx-auto mb-3 text-slate-300" />
      <p class="text-sm">No analysis yet. Upload a CV to get started.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  Sparkles, CheckCircle2, Briefcase, Award, Globe, Building2,
  GraduationCap, Target, TrendingUp
} from 'lucide-vue-next';
import BaseBadge from '@/components/base/BaseBadge.vue';
import SkillTag from './SkillTag.vue';
import type { CvAnalysisResponse } from '@/api/jobMatchingService';

const props = defineProps<{
  analysis: CvAnalysisResponse | null;
}>();

const initials = computed(() => {
  if (!props.analysis?.candidateName) return '?';
  const parts = props.analysis.candidateName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
});
</script>
