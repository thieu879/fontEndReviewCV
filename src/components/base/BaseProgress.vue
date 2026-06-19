<template>
  <div class="flex items-center gap-3">
    <div :class="['flex-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden', heightClass]">
      <div :class="['h-full rounded-full transition-all duration-500 ease-out', barColorClass]"
        :style="{ width: `${Math.min(Math.max(value, 0), 100)}%` }" />
    </div>
    <span v-if="showLabel" :class="['text-sm font-semibold tabular-nums', labelColorClass]">
      {{ Math.round(value) }}%
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  value?: number;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'slate';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}>(), {
  value: 0,
  color: 'blue',
  size: 'md',
  showLabel: false,
});

const heightClass = computed(() => ({
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}[props.size]));

const barColorClass = computed(() => ({
  blue: 'bg-blue-500 dark:bg-blue-400',
  green: 'bg-emerald-500 dark:bg-emerald-400',
  yellow: 'bg-amber-500 dark:bg-amber-400',
  red: 'bg-red-500 dark:bg-red-400',
  purple: 'bg-purple-500 dark:bg-purple-400',
  slate: 'bg-slate-400 dark:bg-slate-300',
}[props.color]));

const labelColorClass = computed(() => ({
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-emerald-600 dark:text-emerald-400',
  yellow: 'text-amber-600 dark:text-amber-400',
  red: 'text-red-600 dark:text-red-400',
  purple: 'text-purple-600 dark:text-purple-400',
  slate: 'text-slate-600 dark:text-slate-300',
}[props.color]));
</script>
