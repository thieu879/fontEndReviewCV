<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="handleClose"></div>

        <div :class="[
          'relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden',
          sizeClasses
        ]">
          <div v-if="showHeader"
            class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
            <h2 class="text-xl font-bold text-gray-900 dark:text-slate-100">{{ title }}</h2>
            <button @click="handleClose"
              class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
              <X class="w-5 h-5 text-gray-500 dark:text-slate-400" />
            </button>
          </div>

          <div :class="['p-6', noPadding ? 'p-0' : '']">
            <slot></slot>
          </div>

          <div v-if="showFooter"
            class="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
            <slot name="footer">
              <button @click="handleClose"
                class="px-5 py-2.5 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-xl transition-colors font-medium">
                {{ cancelText }}
              </button>
              <button @click="handleConfirm" :class="[
                'px-5 py-2.5 text-white rounded-xl transition-colors font-medium',
                confirmClass
              ]">
                {{ confirmText }}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue';
import { X } from 'lucide-vue-next';

interface Props {
  isOpen: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showHeader?: boolean;
  showFooter?: boolean;
  cancelText?: string;
  confirmText?: string;
  confirmClass?: string;
  noPadding?: boolean;
  closeOnOverlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  size: 'md',
  showHeader: true,
  showFooter: false,
  cancelText: 'Hủy',
  confirmText: 'Xác nhận',
  confirmClass: 'bg-blue-600 hover:bg-blue-700',
  noPadding: false,
  closeOnOverlay: true
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm'): void;
}>();

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-full max-w-md';
    case 'md': return 'w-full max-w-2xl';
    case 'lg': return 'w-full max-w-4xl';
    case 'xl': return 'w-full max-w-6xl';
    case 'full': return 'w-full max-w-[90vw] h-[90vh]';
    default: return 'w-full max-w-2xl';
  }
});

const handleClose = () => {
  if (props.closeOnOverlay || props.showHeader) {
    emit('close');
  }
};

const handleConfirm = () => {
  emit('confirm');
};

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close');
  }
};

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from>div:last-child,
.modal-leave-to>div:last-child {
  transform: scale(0.95) translateY(20px);
}
</style>
