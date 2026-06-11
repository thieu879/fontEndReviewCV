<template>
  <button :type="type" :disabled="disabled || loading" :class="[
    'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-blue-600 text-white border border-blue-500/20 shadow-sm hover:bg-blue-500 hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none',
    sizeClasses,
    variantClasses,
    (disabled || loading) && 'opacity-50 cursor-not-allowed',
    fullWidth && 'w-full'
  ]">
    <span v-if="loading" :class="['inline-block animate-spin', spinnerSize]">
      <svg class="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </span>
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  fullWidth: false,
  type: 'button',
});

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const spinnerSize = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-500 shadow-sm',
  secondary: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 focus-visible:ring-slate-400',
  outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus-visible:ring-blue-500',
  ghost: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus-visible:ring-slate-400',
  danger: 'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500 shadow-sm',
};
</script>
