<script setup lang="ts">
import { computed } from 'vue';
import {
  Send,
  Eye,
  MessageCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  type LucideIcon,
} from 'lucide-vue-next';
import type { ApplicationStatus } from '@/api/jobApplicationService';
import { STATUS_META } from '@/api/jobApplicationService';

const props = defineProps<{
  status: ApplicationStatus;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}>();

const meta = computed(() => STATUS_META[props.status] ?? STATUS_META.APPLIED);

const iconCmp: Record<string, LucideIcon> = {
  send: Send,
  eye: Eye,
  'message-circle': MessageCircle,
  'check-circle': CheckCircle2,
  'x-circle': XCircle,
  'rotate-ccw': RotateCcw,
};
const Icon = computed(() => iconCmp[meta.value.icon] ?? Send);

const colorClasses = computed(() => {
  const c = meta.value.color;
  return {
    blue: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/30',
    indigo:
      'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/30',
    purple:
      'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-500/10 dark:text-purple-300 dark:ring-purple-400/30',
    green:
      'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30',
    red: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/30',
    gray: 'bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-700/40 dark:text-slate-300 dark:ring-slate-400/30',
  }[c];
});

const sizeClass = computed(() =>
  props.size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
);
</script>

<template>
  <span
    class="inline-flex items-center gap-1 font-semibold rounded-full ring-1 ring-inset"
    :class="[colorClasses, sizeClass]"
  >
    <component v-if="showIcon !== false" :is="Icon" class="w-3.5 h-3.5" />
    {{ meta.label }}
  </span>
</template>
