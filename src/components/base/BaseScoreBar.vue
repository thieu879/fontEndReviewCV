<template>
  <div class="flex items-center gap-3">
    <div
      :class="['flex-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden', barHeight]"
    >
      <div
        :class="['h-full rounded-full transition-all duration-500 ease-out', barColor]"
        :style="{ width: `${Math.min(Math.max(score, 0), 100)}%` }"
      />
    </div>
    <span
      v-if="showLabel"
      :class="['text-sm font-bold tabular-nums shrink-0', labelColor]"
    >
      {{ Math.round(score) }}%
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  score?: number;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}>(), {
  score: 0,
  size: 'sm',
  showLabel: true,
});

const barHeight = computed(() => props.size === 'sm' ? 'h-1.5' : 'h-2');

const barColor = computed(() => {
  if (props.score >= 80) return 'bg-green-500 dark:bg-green-400';
  if (props.score >= 60) return 'bg-amber-500 dark:bg-amber-400';
  return 'bg-red-500 dark:bg-red-400';
});

const labelColor = computed(() => {
  if (props.score >= 80) return 'text-green-600 dark:text-green-400';
  if (props.score >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
});
</script>
