<template>
  <div class="inline-flex items-center gap-2">
    <span :class="['inline-block animate-spin text-blue-600 dark:text-blue-400', sizeClass]" aria-label="Loading">
      <svg class="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </span>
    <span v-if="label" class="text-sm text-slate-600 dark:text-slate-300 font-medium">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}>(), {
  size: 'md',
});

const sizeClass = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[props.size];
</script>
