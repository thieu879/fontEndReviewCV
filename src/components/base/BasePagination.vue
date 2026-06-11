<template>
  <div class="flex items-center justify-center gap-1">
    <!-- First / Prev -->
    <button
      @click="goToPage(0)"
      :disabled="currentPage === 0"
      :class="btnBaseClass"
      :title="t('pagination.first') || 'First'"
    >
      <ChevronsLeft class="w-4 h-4" />
    </button>
    <button
      @click="goToPage(currentPage - 1)"
      :disabled="currentPage === 0"
      :class="btnBaseClass"
      :title="t('pagination.prev') || 'Previous'"
    >
      <ChevronLeft class="w-4 h-4" />
    </button>

    <!-- Page numbers -->
    <template v-for="p in visiblePages" :key="p">
      <span v-if="p === '...'" :class="['px-2 py-2 text-slate-400 select-none', sizeClass]">...</span>
      <button
        v-else
        @click="goToPage((p as number) - 1)"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors min-w-[40px]',
          p === currentPage + 1
            ? 'bg-blue-600 text-white shadow-sm'
            : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200',
          sizeClass
        ]"
      >
        {{ p }}
      </button>
    </template>

    <!-- Next / Last -->
    <button
      @click="goToPage(currentPage + 1)"
      :disabled="currentPage >= totalPages - 1"
      :class="btnBaseClass"
      :title="t('pagination.next') || 'Next'"
    >
      <ChevronRight class="w-4 h-4" />
    </button>
    <button
      @click="goToPage(totalPages - 1)"
      :disabled="currentPage >= totalPages - 1"
      :class="btnBaseClass"
      :title="t('pagination.last') || 'Last'"
    >
      <ChevronsRight class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const props = withDefaults(defineProps<{
  currentPage?: number;
  totalPages?: number;
  maxVisible?: number;
  size?: 'sm' | 'md';
}>(), {
  currentPage: 0,
  totalPages: 1,
  maxVisible: 5,
  size: 'md',
});

const emit = defineEmits<{
  'update:currentPage': [page: number];
  'page-change': [page: number];
}>();

const { t } = useI18n();

const goToPage = (page: number) => {
  if (page < 0 || page >= props.totalPages) return;
  emit('update:currentPage', page);
  emit('page-change', page);
};

const btnBaseClass = computed(() => [
  'flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-lg',
  'hover:bg-slate-50 dark:hover:bg-slate-700/50',
  'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent',
  'text-slate-700 dark:text-slate-200 transition-colors',
  props.size === 'sm' ? 'px-2 py-1.5' : 'px-3 py-2',
]);

const sizeClass = computed(() => props.size === 'sm' ? 'text-xs' : 'text-sm');

const visiblePages = computed<(number | string)[]>(() => {
  const total = props.totalPages;
  const current = props.currentPage + 1;
  const max = props.maxVisible;

  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];
  const half = Math.floor(max / 2);
  let start = Math.max(2, current - half);
  let end = Math.min(total - 1, current + half);

  if (current <= half + 1) end = max - 2;
  if (current >= total - half - 1) start = total - max + 3;

  pages.push(1);
  if (start > 2) pages.push('...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('...');
  pages.push(total);

  return pages;
});
</script>
