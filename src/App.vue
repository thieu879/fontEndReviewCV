<template>
  <div class="min-h-screen bg-white dark:bg-slate-900 font-sans antialiased">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';

// Initialize theme on app mount
useTheme();
</script>
