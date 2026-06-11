<template>
  <div class="relative inline-flex items-center justify-center" :class="sizeWrapper">
    <svg :class="['-rotate-90', sizeSvg]" :viewBox="viewBox">
      <!-- Track circle -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="transparent"
        :stroke="trackColor"
        :stroke-width="strokeWidth"
      />
      <!-- Progress circle -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="transparent"
        :stroke="progressColor"
        :stroke-width="progressStrokeWidth"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        class="transition-all duration-700 ease-out"
      />
    </svg>
    <!-- Center label -->
    <div class="absolute inset-0 flex items-center justify-center">
      <span :class="['font-bold tabular-nums', sizeLabel]">{{ Math.round(score) }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple' | 'red';
}>(), {
  score: 0,
  size: 'md',
  color: 'blue',
});

const sizeConfig = computed(() => ({
  sm: { svg: 'w-16 h-16', wrapper: 'w-16 h-16', center: 28, radius: 24, stroke: 4, progressStroke: 6, label: 'text-sm' },
  md: { svg: 'w-32 h-32', wrapper: 'w-32 h-32', center: 64, radius: 56, stroke: 8, progressStroke: 10, label: 'text-3xl' },
  lg: { svg: 'w-40 h-40', wrapper: 'w-40 h-40', center: 80, radius: 70, stroke: 10, progressStroke: 12, label: 'text-4xl' },
}[props.size]));

const sizeSvg = computed(() => sizeConfig.value.svg);
const sizeWrapper = computed(() => sizeConfig.value.wrapper);
const center = computed(() => sizeConfig.value.center);
const radius = computed(() => sizeConfig.value.radius);
const strokeWidth = computed(() => sizeConfig.value.stroke);
const progressStrokeWidth = computed(() => sizeConfig.value.progressStroke);
const sizeLabel = computed(() => sizeConfig.value.label);
const viewBox = computed(() => `0 0 ${center.value * 2} ${center.value * 2}`);

const circumference = computed(() => 2 * Math.PI * radius.value);

const dashOffset = computed(() => {
  return circumference.value - (circumference.value * Math.min(Math.max(props.score, 0), 100)) / 100;
});

const trackColor = computed(() => {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? '#1e293b' : '#f1f5f9';
});

const progressColor = computed(() => ({
  blue: '#2563eb',
  green: '#16a34a',
  purple: '#9333ea',
  red: '#dc2626',
}[props.color]));
</script>
