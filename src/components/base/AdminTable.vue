<script setup lang="ts" generic="T">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, Inbox } from 'lucide-vue-next'
import BasePagination from './BasePagination.vue'

interface ColumnDef {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
  width?: string
  hideOn?: 'sm' | 'md' | 'lg'
}

interface Props {
  items: T[]
  columns: ColumnDef[]
  isLoading?: boolean
  searchPlaceholder?: string
  searchModelValue?: string
  totalElements?: number
  page?: number
  pageSize?: number
  emptyTitle?: string
  emptyDescription?: string
  rowKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  page: 1,
  pageSize: 10,
  totalElements: 0,
  rowKey: 'id'
})

const emit = defineEmits<{
  'update:searchModelValue': [value: string]
  'page-change': [page: number]
  'search': []
}>()

const { t } = useI18n()

const totalPages = computed(() =>
  Math.max(1, Math.ceil((props.totalElements ?? 0) / (props.pageSize ?? 10)))
)

const onSearchInput = (e: Event) => {
  emit('update:searchModelValue', (e.target as HTMLInputElement).value)
}

const onSearchEnter = () => emit('search')

const onPageChange = (p: number) => emit('page-change', p)
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
    <!-- Search bar slot -->
    <div
      v-if="$slots.toolbar || searchPlaceholder"
      class="p-4 border-b border-slate-200 dark:border-slate-700"
    >
      <div class="flex flex-col md:flex-row md:items-center gap-3">
        <div v-if="searchPlaceholder" class="flex-1 min-w-0">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              :value="searchModelValue"
              type="search"
              :placeholder="searchPlaceholder"
              class="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              @input="onSearchInput"
              @keydown.enter="onSearchEnter"
            />
          </div>
        </div>
        <slot name="toolbar" />
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="p-6 space-y-3">
      <div
        v-for="i in 6"
        :key="i"
        class="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"
      />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!items?.length"
      class="py-16 px-6 text-center"
    >
      <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
        <Inbox class="w-7 h-7 text-slate-400 dark:text-slate-500" />
      </div>
      <p class="font-medium text-slate-900 dark:text-white">
        {{ emptyTitle ?? t('admin.common.noData') }}
      </p>
      <p v-if="emptyDescription" class="text-sm text-slate-500 dark:text-slate-400 mt-1">
        {{ emptyDescription }}
      </p>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="[
                'px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap',
                col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                col.hideOn === 'sm' ? 'hidden md:table-cell' : '',
                col.hideOn === 'md' ? 'hidden lg:table-cell' : '',
                col.hideOn === 'lg' ? 'hidden xl:table-cell' : ''
              ]"
              :style="col.width ? { width: col.width } : {}"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          <slot
            name="rows"
            :items="items"
          />
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="!isLoading && totalPages > 1"
      class="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
    >
      <p class="text-xs text-slate-500 dark:text-slate-400">
        {{ t('admin.common.page') }} {{ page }} {{ t('admin.common.of') }} {{ totalPages }}
      </p>
      <BasePagination
        :current-page="page"
        :total-pages="totalPages"
        @page-change="onPageChange"
      />
    </div>
  </div>
</template>
