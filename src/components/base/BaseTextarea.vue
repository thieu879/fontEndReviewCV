<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="inputId" class="text-sm font-semibold text-slate-700 dark:text-slate-200">
      {{ label }}<span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <textarea
      :id="inputId"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :rows="rows"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      :class="[
        'w-full bg-white dark:bg-slate-700 border rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:slate-400 transition-all outline-none',
        resizeClass,
        error
          ? 'border-red-300 dark:border-red-600 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900'
          : 'border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-400 dark:focus:border-blue-500',
        disabled && 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800',
      ]"
    />
    <p v-if="error" class="text-xs text-red-600 dark:text-red-400">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-slate-400">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  modelValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  error?: string;
  label?: string;
  hint?: string;
  required?: boolean;
  rows?: number;
  resize?: 'none' | 'vertical' | 'both';
}>(), {
  modelValue: '',
  placeholder: '',
  disabled: false,
  readonly: false,
  required: false,
  rows: 4,
  resize: 'none',
});

defineEmits<{ 'update:modelValue': [value: string] }>();

const inputId = computed(() => `textarea-${Math.random().toString(36).slice(2, 9)}`);

const resizeClass = computed(() => ({
  none: 'resize-none',
  vertical: 'resize-y',
  both: 'resize',
}[props.resize]));
</script>
