<template>
  <div class="relative inline-flex items-center cursor-pointer select-none" :class="[disabled && 'opacity-50 cursor-not-allowed']">
    <!-- Checkbox (sr-only) for the form value -->
    <input
      v-if="variant === 'checkbox'"
      :id="inputId"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="sr-only peer"
      @change="toggle"
    />
    <!-- Hidden radio for button variant -->
    <input
      v-else
      :id="inputId"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="sr-only"
      @change="toggle"
    />

    <!-- Checkbox toggle track -->
    <div
      v-if="variant === 'checkbox'"
      :class="[
        'relative w-11 h-6 rounded-full transition-colors duration-200',
        modelValue
          ? 'bg-blue-600 dark:bg-blue-500'
          : 'bg-gray-200 dark:bg-slate-600',
        disabled && 'cursor-not-allowed'
      ]"
      @click="!disabled && toggle()"
    >
      <div
        :class="[
          'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
          modelValue ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0.5',
        ]"
      />
    </div>

    <!-- Button toggle track -->
    <button
      v-else
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      :class="[
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
        modelValue ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-slate-600',
        disabled && 'cursor-not-allowed'
      ]"
      @click="!disabled && toggle()"
    >
      <span
        :class="[
          'inline-flex h-4 w-4 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200',
          modelValue ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0.5 rtl:-translate-x-0.5'
        ]"
      >
        <component :is="modelValue ? activeIcon : inactiveIcon" v-if="activeIcon || inactiveIcon" :class="['w-2.5 h-2.5', modelValue ? activeColor : inactiveColor]" />
      </span>
    </button>

    <!-- Label text -->
    <label v-if="$slots.default" :for="inputId" class="ml-3 text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
      <slot />
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  modelValue?: boolean;
  disabled?: boolean;
  variant?: 'checkbox' | 'button';
  activeIcon?: any;
  inactiveIcon?: any;
  activeColor?: string;
  inactiveColor?: string;
}>(), {
  modelValue: false,
  disabled: false,
  variant: 'checkbox',
  activeIcon: null,
  inactiveIcon: null,
  activeColor: 'text-blue-600',
  inactiveColor: 'text-yellow-500',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const inputId = computed(() => `toggle-${Math.random().toString(36).slice(2, 9)}`);

const toggle = () => {
  const newValue = !props.modelValue;
  emit('update:modelValue', newValue);
};
</script>
