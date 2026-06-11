<template>
  <label
    :for="inputId"
    class="inline-flex items-center gap-2.5 cursor-pointer select-none"
    :class="[disabled && 'opacity-50 cursor-not-allowed']"
  >
    <div class="relative">
      <input
        :id="inputId"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        class="sr-only peer"
        @change="toggle"
      />
      <div
        :class="[
          'w-5 h-5 rounded border-2 transition-all duration-150 flex items-center justify-center',
          modelValue
            ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500'
            : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500',
          disabled && 'cursor-not-allowed'
        ]"
      >
        <Check
          v-if="modelValue"
          class="w-3 h-3 text-white"
          stroke-width="3"
        />
      </div>
    </div>
    <span v-if="label" class="text-sm font-medium text-slate-700 dark:text-slate-200">
      {{ label }}
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Check } from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  modelValue?: boolean;
  disabled?: boolean;
  label?: string;
}>(), {
  modelValue: false,
  disabled: false,
});

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const inputId = computed(() => `checkbox-${Math.random().toString(36).slice(2, 9)}`);

const toggle = () => {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue);
  }
};
</script>
