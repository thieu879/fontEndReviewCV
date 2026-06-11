<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-sm font-semibold text-slate-700 dark:text-slate-200">
      {{ label }}<span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <div
      :class="[
        'flex flex-wrap gap-2 p-3 bg-white dark:bg-slate-700 border rounded-xl min-h-[42px]',
        error
          ? 'border-red-300 dark:border-red-600 focus-within:ring-2 focus-within:ring-red-100 dark:focus-within:ring-red-900'
          : 'border-slate-200 dark:border-slate-600 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/50 focus-within:border-blue-400 dark:focus-within:border-blue-500',
        disabled && 'opacity-50 cursor-not-allowed'
      ]"
    >
      <span
        v-for="(tag, idx) in modelValue"
        :key="idx"
        class="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-semibold"
      >
        {{ tag }}
        <button
          v-if="!disabled"
          type="button"
          @click="removeTag(idx)"
          class="hover:text-blue-900 dark:hover:text-blue-200 transition-colors"
        >
          <X class="w-3 h-3" />
        </button>
      </span>
      <input
        v-if="!disabled && (!maxTags || modelValue.length < maxTags)"
        v-model="newTag"
        type="text"
        :placeholder="modelValue.length === 0 ? placeholder : ''"
        class="flex-1 min-w-[80px] bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
        @keyup.enter.prevent="addTag"
        @keydown.comma.prevent="addTag"
        @keydown.backspace="handleBackspace"
      />
      <span
        v-if="maxTags && modelValue.length >= maxTags && !disabled"
        class="flex items-center text-xs text-slate-400 self-center"
      >
        {{ modelValue.length }}/{{ maxTags }}
      </span>
    </div>
    <p v-if="error" class="text-xs text-red-600 dark:text-red-400">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-slate-400">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { X } from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  modelValue?: string[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  hint?: string;
  required?: boolean;
  maxTags?: number;
}>(), {
  modelValue: () => [],
  placeholder: 'Type and press Enter...',
  disabled: false,
});

const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>();

const newTag = ref('');

const addTag = () => {
  const tag = newTag.value.trim();
  if (!tag) return;
  if (props.modelValue.includes(tag)) {
    newTag.value = '';
    return;
  }
  emit('update:modelValue', [...props.modelValue, tag]);
  newTag.value = '';
};

const removeTag = (idx: number) => {
  const updated = [...props.modelValue];
  updated.splice(idx, 1);
  emit('update:modelValue', updated);
};

const handleBackspace = () => {
  if (newTag.value === '' && props.modelValue.length > 0) {
    removeTag(props.modelValue.length - 1);
  }
};
</script>
