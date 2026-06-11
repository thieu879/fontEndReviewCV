<template>
  <div :class="[
    'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all',
    radiusClass,
    shadowClass,
    paddingClass,
    hover && 'hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 cursor-pointer',
  ]">
    <div v-if="$slots.header" class="border-b border-slate-100 dark:border-slate-700 -mx-6 -mt-6 mb-4 px-6 pt-5">
      <slot name="header" />
    </div>
    <slot />
    <div v-if="$slots.footer" class="border-t border-slate-100 dark:border-slate-700 mt-4 pt-4">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  hover?: boolean;
}>(), {
  padding: 'md',
  shadow: 'sm',
  radius: 'lg',
  border: true,
  hover: false,
});

const paddingClass = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' }[props.padding];
const shadowClass = { none: '', sm: 'shadow-sm', md: 'shadow-md', lg: 'shadow-lg' }[props.shadow];
const radiusClass = { none: 'rounded-none', sm: 'rounded-lg', md: 'rounded-xl', lg: 'rounded-2xl', xl: 'rounded-3xl' }[props.radius];
</script>
