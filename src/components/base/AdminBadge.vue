<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary'

const props = withDefaults(defineProps<{
  variant?: Variant
  label: string
  size?: 'sm' | 'md'
  dot?: boolean
}>(), {
  variant: 'neutral',
  size: 'sm',
  dot: false
})

const sizeClass = computed(() =>
  props.size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
)

const classes = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-1 ring-green-200 dark:ring-green-800/50'
    case 'warning':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 ring-1 ring-yellow-200 dark:ring-yellow-800/50'
    case 'danger':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800/50'
    case 'info':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800/50'
    case 'primary':
      return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-200 dark:ring-indigo-800/50'
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700'
  }
})

const dotClass = computed(() => {
  switch (props.variant) {
    case 'success': return 'bg-green-500'
    case 'warning': return 'bg-yellow-500'
    case 'danger': return 'bg-red-500'
    case 'info': return 'bg-blue-500'
    case 'primary': return 'bg-indigo-500'
    default: return 'bg-slate-400'
  }
})
</script>

<template>
  <span :class="['inline-flex items-center gap-1 rounded-full font-medium', classes, sizeClass]">
    <span v-if="dot" :class="['w-1.5 h-1.5 rounded-full', dotClass]" />
    {{ label }}
  </span>
</template>
