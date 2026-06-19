<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Home, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div class="text-center px-6">
      <div class="text-8xl font-bold text-slate-200 dark:text-slate-800 mb-4">404</div>
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Page Not Found</h1>
      <p class="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div class="flex items-center justify-center space-x-4">
        <button
          @click="router.back()"
          class="flex items-center px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
        >
          <ArrowLeft class="w-4 h-4 mr-2" />
          Go Back
        </button>
        <router-link
          to="/"
          class="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Home class="w-4 h-4 mr-2" />
          Home
        </router-link>
      </div>
    </div>
  </div>
</template>
