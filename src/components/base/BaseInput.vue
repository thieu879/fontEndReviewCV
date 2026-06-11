<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="inputId" class="text-sm font-semibold text-slate-700 dark:text-slate-200">
      {{ label }}<span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <div class="relative">
      <div v-if="$slots.prefix"
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <slot name="prefix" />
      </div>
      <input :id="inputId" :type="type" :value="modelValue" :placeholder="placeholder" :disabled="disabled"
        :readonly="readonly" :required="required"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" :class="[
          'w-full bg-white dark:bg-slate-700 border rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:slate-400 transition-all outline-none',
          error
            ? 'border-red-300 dark:border-red-600 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900'
            : 'border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-400 dark:focus:border-blue-500',
          disabled && 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800',
          $slots.prefix && 'pl-10',
          $slots.suffix && 'pr-10',
        ]" />
      <div v-if="$slots.suffix" class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <slot name="suffix" />
      </div>
    </div>
    <p v-if="error" class="text-xs text-red-600 dark:text-red-400">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-slate-400">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'search';
  placeholder?: string;
  modelValue?: string | number;
  disabled?: boolean;
  readonly?: boolean;
  error?: string;
  label?: string;
  hint?: string;
  required?: boolean;
}>(), {
  type: 'text',
  placeholder: '',
  modelValue: '',
  disabled: false,
  readonly: false,
  required: false,
});

defineEmits<{ 'update:modelValue': [value: string] }>();

const inputId = computed(() => `input-${Math.random().toString(36).slice(2, 9)}`);
</script>
