<template>
  <div :class="[
    'inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-bold border transition-all',
    sizeClass,
    variantClass
  ]">
    <div :class="['w-2 h-2 rounded-full', dotColorClass]" />
    <span>{{ score }}%</span>
    <span v-if="showLabel" class="font-semibold opacity-90">— {{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = withDefaults(defineProps<{
  score: number;
  level?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}>(), {
  size: 'md',
  showLabel: true,
});

const { t } = useI18n();
const roundedScore = computed(() => Math.round(props.score));

const score = computed(() => roundedScore.value);

const variantConfig = computed(() => {
  if (props.score >= 90) {
    return {
      classes: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      dot: 'bg-emerald-500',
      labelKey: 'aiJobMatching.excellentMatch',
    };
  }
  if (props.score >= 70) {
    return {
      classes: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      dot: 'bg-blue-500',
      labelKey: 'aiJobMatching.goodMatch',
    };
  }
  if (props.score >= 50) {
    return {
      classes: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      dot: 'bg-amber-500',
      labelKey: 'aiJobMatching.potentialMatch',
    };
  }
  return {
    classes: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
    labelKey: 'aiJobMatching.lowMatch',
  };
});

const label = computed(() => props.label || t(variantConfig.value.labelKey));
const variantClass = computed(() => variantConfig.value.classes);
const dotColorClass = computed(() => variantConfig.value.dot);

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'text-xs px-2.5 py-1';
  if (props.size === 'lg') return 'text-base px-4 py-2';
  return 'text-sm px-3 py-1.5';
});
</script>
