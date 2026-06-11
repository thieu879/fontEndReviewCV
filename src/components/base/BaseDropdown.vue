<template>
  <div class="relative inline-block" ref="dropdownRef">
    <div @click="toggle" class="cursor-pointer">
      <slot name="trigger" />
    </div>
    <Transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
      <div v-if="isOpen" :class="[
        'absolute z-50 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1',
        align === 'right' ? 'right-0' : 'left-0',
      ]" :style="{ minWidth: width }">
        <template v-for="(item, idx) in items" :key="idx">
          <div v-if="item.divider" class="border-t border-slate-100 dark:border-slate-700 my-1" />
          <button v-else @click="handleSelect(item)" :disabled="item.disabled" :class="[
            'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors',
            item.danger
              ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700',
            item.disabled && 'opacity-50 cursor-not-allowed',
          ]">
            <component v-if="item.icon" :is="item.icon" class="w-4 h-4 shrink-0" />
            {{ item.label }}
          </button>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface DropdownItem {
  label: string;
  value: string | number;
  icon?: any;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

const props = withDefaults(defineProps<{
  items: DropdownItem[];
  align?: 'left' | 'right';
  width?: string;
}>(), {
  align: 'left',
  width: '200px',
});

const emit = defineEmits<{ select: [item: DropdownItem] }>();

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const toggle = () => { isOpen.value = !isOpen.value; };

const handleSelect = (item: DropdownItem) => {
  if (item.disabled) return;
  emit('select', item);
  isOpen.value = false;
};

const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>
