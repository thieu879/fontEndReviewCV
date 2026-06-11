<template>
  <BaseModal :is-open="isOpen" :title="'Xem nhanh: ' + (candidate?.name || '')" size="lg" @close="close">
    <div v-if="candidate" class="space-y-6 text-slate-700 dark:text-slate-200">

      <!-- Header -->
      <div class="flex items-start gap-6">

        <div
          class="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-md">
          {{ initials }}
        </div>

        <div class="flex-1">

          <div class="flex items-center gap-3 mb-2">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">
              {{ candidate.name }}
            </h3>

            <span :class="[
              'px-3 py-1 rounded-full text-sm font-semibold border',
              scoreBgClass
            ]">
              <span :class="['font-bold', scoreClass]">
                {{ candidate.aiMatchScore }}%
              </span>
              Match
            </span>
          </div>

          <p class="text-slate-500 dark:text-slate-400 mb-1">
            {{ candidate.predictedRole }}
          </p>

          <div class="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">

            <span class="flex items-center gap-1">
              <MapPin class="w-4 h-4" />
              {{ candidate.location }}
            </span>

            <span class="flex items-center gap-1">
              <Mail class="w-4 h-4" />
              {{ candidate.email }}
            </span>

          </div>

        </div>
      </div>

      <!-- Skills -->
      <div>
        <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Kỹ năng
        </h4>

        <div class="flex flex-wrap gap-2">
          <span v-for="skill in candidate.skills" :key="skill"
            class="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-600">
            {{ skill }}
          </span>
        </div>
      </div>

      <!-- Info cards -->
      <div class="grid grid-cols-2 gap-4">

        <div class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">Kinh nghiệm</p>
          <p class="text-lg font-semibold text-slate-900 dark:text-white">
            {{ candidate.experience }} năm
          </p>
        </div>

        <div class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">Học vấn</p>
          <p class="text-lg font-semibold text-slate-900 dark:text-white">
            {{ candidate.education }}
          </p>
        </div>

      </div>

      <!-- Strengths -->
      <div>
        <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Điểm mạnh
        </h4>

        <ul class="space-y-2">
          <li v-for="(strength, index) in candidate.strengths" :key="index"
            class="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
            <CheckCircle class="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            {{ strength }}
          </li>
        </ul>
      </div>

      <!-- Weaknesses -->
      <div>
        <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Điểm cần cải thiện
        </h4>

        <ul class="space-y-2">
          <li v-for="(weakness, index) in candidate.weaknesses" :key="index"
            class="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
            <AlertCircle class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            {{ weakness }}
          </li>
        </ul>
      </div>

    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex items-center justify-end gap-3">

        <button @click="close"
          class="px-5 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          Đóng
        </button>

        <button @click="viewDetails"
          class="px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors shadow-sm">
          Xem chi tiết
        </button>

      </div>
    </template>

  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseModal from '@/components/common/BaseModal.vue';
import { MapPin, Mail, CheckCircle, AlertCircle } from 'lucide-vue-next';
import type { Candidate } from '@/types';

interface Props {
  isOpen: boolean;
  candidate?: Candidate | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'view-details', candidate: Candidate): void;
}>();

const initials = computed(() => {
  if (!props.candidate?.name) return '?';
  return props.candidate.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const scoreClass = computed(() => {
  const score = props.candidate?.aiMatchScore || 0;
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
});

const scoreBgClass = computed(() => {
  const score = props.candidate?.aiMatchScore || 0;
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-yellow-100';
  return 'bg-red-100';
});

const close = () => {
  emit('close');
};

const viewDetails = () => {
  if (props.candidate) {
    emit('view-details', props.candidate);
  }
};
</script>
