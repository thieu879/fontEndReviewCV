<template>
  <div :class="['relative inline-flex shrink-0', sizeClass]">
    <img
      v-if="src && !imgError"
      :src="src"
      :alt="name || 'Avatar'"
      class="w-full h-full object-cover"
      :class="shapeClass"
      crossorigin="anonymous"
      @error="imgError = true"
    />
    <div
      v-else
      :class="['w-full h-full flex items-center justify-center font-bold text-white', shapeClass, gradientClass]"
    >
      {{ initials }}
    </div>
    <span
      v-if="status"
      :class="['absolute rounded-full border-2 border-white dark:border-slate-800', dotSizeClass, statusColor]"
      :style="statusDotPosition"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(defineProps<{
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
  fallback?: string;
  shape?: 'circle' | 'rounded';
  gradient?: string;
}>(), {
  src: null,
  name: '',
  size: 'md',
  status: undefined,
  fallback: '',
  shape: 'circle',
  gradient: 'default',
});

const imgError = ref(false);

const sizeClass = { xs: 'w-6 h-6', sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12', xl: 'w-16 h-16' }[props.size];
const dotSizeClass = { xs: 'w-1.5 h-1.5', sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3', xl: 'w-4 h-4' }[props.size];

const shapeClass = computed(() =>
  props.shape === 'rounded' ? 'rounded-xl' : 'rounded-full'
);

const gradientClass = computed(() => {
  if (props.gradient && props.gradient !== 'default') return props.gradient;
  const map: Record<string, string> = {
    blue: 'bg-gradient-to-br from-blue-500 to-purple-500',
    green: 'bg-gradient-to-br from-green-500 to-teal-500',
    amber: 'bg-gradient-to-br from-amber-500 to-orange-500',
    pink: 'bg-gradient-to-br from-pink-500 to-rose-500',
    indigo: 'bg-gradient-to-br from-indigo-500 to-violet-500',
  };
  return map[props.gradient] || 'bg-gradient-to-br from-blue-500 to-purple-500';
});

const initials = computed(() => {
  const n = props.name || props.fallback || '?';
  const parts = n.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return n.substring(0, 2).toUpperCase();
});

const statusColor = {
  online: 'bg-emerald-500',
  offline: 'bg-slate-400',
  busy: 'bg-red-500',
  away: 'bg-amber-500',
}[props.status || 'offline'];

const statusDotPosition = computed(() => {
  if (props.shape === 'rounded') {
    return { bottom: '-2px', right: '-2px' };
  }
  return {};
});
</script>
