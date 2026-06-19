<template>
  <span :class="[
    'inline-flex items-center gap-1.5 rounded-md font-semibold transition-colors',
    sizeClass,
    variantClass,
    isInteractive && 'cursor-pointer hover:opacity-80'
  ]">
    <slot name="prefix" />
    <slot />
    <slot name="suffix" />
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'xs' | 'sm' | 'md';
  isInteractive?: boolean;
}>(), {
  variant: 'default',
  size: 'sm',
  isInteractive: false,
});

const sizeClass = {
  xs: 'text-[10px] px-2 py-0.5',
  sm: 'text-xs px-2.5 py-1',
  md: 'text-sm px-3 py-1.5',
};

const variantClass = {
  default: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200',
  primary: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  success: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  warning: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  danger: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  info: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',
  outline: 'bg-transparent border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300',
};
</script>
