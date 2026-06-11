<template>
  <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">{{ title }}</p>
        <p class="text-3xl font-bold text-gray-900 dark:text-slate-100">{{ value }}</p>
        <div class="flex items-center gap-1 mt-2">
          <TrendingUp v-if="changeType === 'positive'" class="w-4 h-4 text-green-500" />
          <TrendingDown v-else-if="changeType === 'negative'" class="w-4 h-4 text-red-500" />
          <Minus v-else class="w-4 h-4 text-gray-400 dark:text-slate-500" />
          <span :class="[
            'text-sm font-medium',
            changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 
            changeType === 'negative' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-slate-400'
          ]">
            {{ change }}
          </span>
          <span class="text-sm text-gray-400 dark:text-slate-500">so với tháng trước</span>
        </div>
      </div>
      <div :class="[
        'w-14 h-14 rounded-2xl flex items-center justify-center',
        bgColor
      ]">
        <component :is="icon" :class="['w-7 h-7', iconColor]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next';
import { computed } from 'vue';

interface Props {
  title: string;
  value: string | number;
  change: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: any;
}

const props = withDefaults(defineProps<Props>(), {
  changeType: 'neutral'
});

const bgColor = computed(() => {
  const isDark = document.documentElement.classList.contains('dark');
  switch (props.changeType) {
    case 'positive': return isDark ? 'bg-green-900/50' : 'bg-green-100';
    case 'negative': return isDark ? 'bg-red-900/50' : 'bg-red-100';
    default: return isDark ? 'bg-blue-900/50' : 'bg-blue-100';
  }
});

const iconColor = computed(() => {
  switch (props.changeType) {
    case 'positive': return 'text-green-600 dark:text-green-400';
    case 'negative': return 'text-red-600 dark:text-red-400';
    default: return 'text-blue-600 dark:text-blue-400';
  }
});
</script>
