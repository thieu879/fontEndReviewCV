<script setup lang="ts">
defineProps<{
  count?: number;
}>();
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="i in (count ?? 4)"
      :key="i"
      class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm animate-pulse"
    >
      <div class="flex items-start gap-4">
        <!-- Logo skeleton -->
        <div class="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
        <!-- Title + company -->
        <div class="flex-1 space-y-2">
          <div class="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div class="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div class="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
      </div>
      <!-- Description -->
      <div class="mt-3 space-y-2">
        <div class="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div class="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
      <!-- Badges -->
      <div class="mt-4 flex gap-2">
        <div class="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        <div class="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        <div class="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
      </div>
      <!-- Skills -->
      <div class="mt-3 flex gap-1.5">
        <div class="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div class="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div class="h-4 w-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
      <!-- Footer -->
      <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div class="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div class="flex gap-2">
          <div class="h-7 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div class="h-7 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
</template>
