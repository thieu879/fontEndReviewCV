<template>
  <div
    class="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:border-blue-200 dark:hover:border-slate-600 transition-all cursor-pointer"
    @click="$emit('click', candidate)">
    <div class="flex items-start gap-4 mb-4">
      <div
        class="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
        {{ initials }}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-1">
          <h3 class="font-semibold text-gray-900 dark:text-white truncate">{{ candidate.name }}</h3>

          <!-- Điểm AI Match Score linh hoạt Light / Dark -->
          <span :class="['px-2 py-1 rounded-lg text-xs font-bold', scoreBgClass]">
            <span :class="['font-bold', scoreClass]">{{ candidate.aiMatchScore }}%</span>
          </span>
        </div>
        <p class="text-sm text-gray-500 dark:text-slate-400 truncate">{{ candidate.predictedRole }}</p>
      </div>
    </div>

    <!-- Thông tin địa điểm & kinh nghiệm -->
    <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400 mb-4">
      <span class="flex items-center gap-1">
        <MapPin class="w-4 h-4 text-gray-400 dark:text-slate-500" />
        {{ candidate.location }}
      </span>
      <span class="flex items-center gap-1">
        <Briefcase class="w-4 h-4 text-gray-400 dark:text-slate-500" />
        {{ candidate.experience }} năm
      </span>
    </div>

    <!-- Danh sách Skills -->
    <div class="mb-4">
      <div class="flex flex-wrap gap-1.5">
        <span v-for="skill in displayedSkills" :key="skill"
          class="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-lg text-xs font-medium">
          {{ skill }}
        </span>
        <span v-if="candidate.skills.length > 3"
          class="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 rounded-lg text-xs font-medium">
          +{{ candidate.skills.length - 3 }}
        </span>
      </div>
    </div>

    <!-- Nút Xem nhanh -->
    <button @click.stop="$emit('preview', candidate)"
      class="w-full py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 text-blue-600 dark:text-blue-400 rounded-xl transition-colors text-sm font-medium">
      Xem nhanh
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MapPin, Briefcase } from 'lucide-vue-next';
import type { Candidate } from '@/types';

interface Props {
  candidate: Candidate;
}

const props = defineProps<Props>();

defineEmits<{
  (e: 'click', candidate: Candidate): void;
  (e: 'preview', candidate: Candidate): void;
}>();

const initials = computed(() => {
  return props.candidate.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const displayedSkills = computed(() => {
  return props.candidate.skills.slice(0, 3);
});

// Cập nhật mã màu chữ để hiển thị tốt trên cả nền sáng lẫn nền tối (sử dụng dark:)
const scoreClass = computed(() => {
  const score = props.candidate.aiMatchScore;
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
});

// Cập nhật màu nền Badge điểm số để dịu mắt hơn khi ở Dark Mode (sử dụng dark:bg-.../20 hoặc /30)
const scoreBgClass = computed(() => {
  const score = props.candidate.aiMatchScore;
  if (score >= 80) return 'bg-green-100 dark:bg-green-950/30';
  if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-950/30';
  return 'bg-red-100 dark:bg-red-950/30';
});
</script>