<template>
  <span :class="[
    'inline-flex items-center gap-1.5 font-semibold transition-colors',
    pill ? 'rounded-full px-3 py-1 text-xs' : 'rounded-lg px-2.5 py-1 text-xs',
    sizeClass,
    variantClass,
  ]">
    <span v-if="dot" :class="['w-1.5 h-1.5 rounded-full', dotColorClass]" />
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  dot?: boolean;
  pill?: boolean;
}>(), {
  variant: 'default',
  size: 'sm',
  dot: false,
  pill: false,
});

const sizeClass = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-3 py-1' }[props.size];
const variantClass = {
  default: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200',
  primary: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  success: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  warning: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  danger: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  info: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',
}[props.variant];
const dotColorClass = {
  default: 'bg-slate-400',
  primary: 'bg-blue-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-cyan-500',
}[props.variant];
</script>
