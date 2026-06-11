<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
    <!-- Header -->
    <header
      class="w-full bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-4 px-6 md:px-12 flex justify-between items-center z-10 relative">
      <router-link to="/home" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <FileText class="w-4 h-4 text-white" />
        </div>
        <span class="font-bold text-slate-900 dark:text-white text-sm tracking-tight">CV Analyzer AI</span>
      </router-link>

      <div class="flex items-center gap-6">
        <!-- Theme toggle -->
        <button @click="toggleTheme"
          class="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          :title="theme === 'dark' ? 'Chuyển sáng' : 'Chuyển tối'">
          <Sun v-if="theme === 'dark'" class="w-5 h-5" />
          <Moon v-else class="w-5 h-5" />
        </button>

        <template v-if="mode === 'login' || mode === 'register'">
          <a href="#"
            class="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-medium transition-colors">Trợ
            giúp</a>
          <router-link to="/login"
            class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-2 transition-colors">
            <span>&larr;</span> Quay lại đăng nhập
          </router-link>
        </template>
        <template v-else>
          <router-link to="/login"
            class="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-medium flex items-center gap-2 transition-colors">
            <span>&larr;</span> Quay lại đăng nhập
          </router-link>
        </template>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer
      class="w-full py-6 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <div>&copy; 2024 CV Analyzer AI. Precision HR Technologies.</div>
      <div class="flex gap-6 mt-4 md:mt-0">
        <a href="#" class="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Chính sách bảo mật</a>
        <a href="#" class="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Điều khoản dịch vụ</a>
        <a href="#" class="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Bảo mật</a>
        <a href="#" class="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Hỗ trợ</a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { FileText, Sun, Moon } from 'lucide-vue-next';
import { useTheme } from '@/composables/useTheme';

defineProps<{
  mode?: 'login' | 'register' | 'forgot' | 'verify' | 'reset';
}>();

const { theme, toggleTheme } = useTheme();
</script>
