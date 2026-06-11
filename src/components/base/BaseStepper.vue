<template>
  <div :class="direction === 'vertical' ? 'flex flex-col gap-0' : 'flex items-center justify-between'">
    <template v-for="(step, i) in steps" :key="i">
      <div :class="['flex flex-col items-center gap-1.5', direction === 'vertical' && 'flex-row gap-3']">
        <div :class="[
          'rounded-full flex items-center justify-center font-bold text-sm transition-all',
          stateClass(i) === 'completed' && 'bg-teal-500 text-white ring-4 ring-teal-100 dark:ring-teal-900',
          stateClass(i) === 'active' && 'bg-blue-600 text-white ring-4 ring-blue-50 dark:ring-blue-900/50',
          stateClass(i) === 'pending' && 'bg-slate-100 dark:bg-slate-700 text-slate-400',
          !compact && 'w-10 h-10',
          compact && 'w-8 h-8 text-xs',
        ]">
          <svg v-if="stateClass(i) === 'completed'" class="w-5 h-5" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span v-else>{{ i + 1 }}</span>
        </div>
        <span :class="[
          'text-xs font-semibold uppercase tracking-wide',
          stateClass(i) === 'completed' && 'text-teal-600 dark:text-teal-400',
          stateClass(i) === 'active' && 'text-blue-600 dark:text-blue-400',
          stateClass(i) === 'pending' && 'text-slate-400',
          direction === 'vertical' && 'text-sm normal-case tracking-normal',
        ]">
          {{ step.label }}
        </span>
        <span v-if="step.description && direction === 'vertical'" class="text-xs text-slate-400">
          {{ step.description }}
        </span>
      </div>
      <div v-if="i < steps.length - 1" :class="[
        'flex-1 transition-colors',
        direction === 'horizontal' ? 'h-0.5 mx-3 mb-5' : 'w-0.5 h-8 ml-5',
        stateClass(i) === 'completed' ? 'bg-teal-400 dark:bg-teal-600' : stateClass(i) === 'active' ? 'bg-blue-300 dark:bg-blue-700' : 'bg-slate-200 dark:bg-slate-600',
      ]" />
    </template>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  steps: { label: string; icon?: any; description?: string }[];
  currentStep: number;
  direction?: 'horizontal' | 'vertical';
  compact?: boolean;
  status?: 'idle' | 'loading';
}>(), {
  direction: 'horizontal',
  compact: false,
  status: 'idle',
});

const stateClass = (i: number) => {
  if (props.currentStep > i + 1) return 'completed';
  if (props.currentStep === i + 1) return 'active';
  return 'pending';
};
</script>
