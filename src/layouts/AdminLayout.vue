<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { Menu, X } from 'lucide-vue-next'
import AdminSidebar from '@/components/sidebar/AdminSidebar.vue'

const { t } = useI18n()

const isMobileOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileOpen.value = !isMobileOpen.value
}

const closeMobileMenu = () => {
  isMobileOpen.value = false
}

const handleResize = () => {
  if (window.innerWidth >= 1024) {
    isMobileOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
    <!-- Mobile Header -->
    <header
      class="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 z-50 flex items-center px-4 transition-colors"
    >
      <button
        @click="toggleMobileMenu"
        class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
      >
        <Menu v-if="!isMobileOpen" class="w-6 h-6" />
        <X v-else class="w-6 h-6" />
      </button>
      <span class="ml-4 font-semibold text-lg text-slate-900 dark:text-white">
        {{ t('admin.title') }}
      </span>
    </header>

    <!-- Mobile Overlay -->
    <div
      v-if="isMobileOpen"
      class="lg:hidden fixed inset-0 bg-black/50 z-40"
      @click="closeMobileMenu"
    />

    <!-- Layout: Sidebar + Content flex row -->
    <div class="flex min-h-screen pt-16 lg:pt-0">
      <!-- Sidebar: sticky trên desktop, overlay drawer trên mobile -->
      <AdminSidebar
        :sidebar-title="t('admin.title')"
        :is-drawer="isMobileOpen"
        @item-click="closeMobileMenu"
      />

      <!-- Main Content -->
      <main class="flex-1 min-w-0 transition-all duration-300">
        <slot />
      </main>
    </div>
  </div>
</template>
