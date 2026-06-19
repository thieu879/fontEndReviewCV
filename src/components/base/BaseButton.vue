<template>
  <button :type="type" :disabled="disabled || loading" :class="[
    'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none',
    sizeClasses[size],
    variantClasses[variant],
    (disabled || loading) && 'opacity-50 cursor-not-allowed',
    fullWidth && 'w-full'
  ]">
    <span v-if="loading" :class="['inline-block animate-spin', spinnerSize[size]]">
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
  primary:
    'bg-btn-primary hover:bg-btn-primary-hover text-btn-primary-text focus-visible:ring-border-focus shadow-sm',

  secondary:
    'bg-btn-secondary hover:bg-btn-secondary-hover text-btn-secondary-text focus-visible:ring-border-focus',

  outline:
    'border-2 border-border-focus text-link hover:bg-app-hover focus-visible:ring-border-focus',

  ghost:
    'text-body-sub hover:bg-app-hover focus-visible:ring-border-focus',

  danger:
    'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500 shadow-sm',
};
</script>
