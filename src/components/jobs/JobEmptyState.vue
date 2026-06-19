<script setup lang="ts">
import { Briefcase, SearchX, Inbox } from 'lucide-vue-next';
import BaseButton from '@/components/base/BaseButton.vue';
import { useI18n } from 'vue-i18n';

const props = withDefaults(
  defineProps<{
    variant?: 'no-results' | 'no-applications' | 'no-saved';
    title?: string;
    description?: string;
    actionLabel?: string;
  }>(),
  { variant: 'no-results' },
);

const emit = defineEmits<{ (e: 'action'): void }>();
const { t } = useI18n();

const iconCmp = {
  'no-results': SearchX,
  'no-applications': Briefcase,
  'no-saved': Inbox,
} as const;

const Icon = iconCmp[props.variant];

const finalTitle = () => props.title ?? t(`jobs.empty.${props.variant}.title`);
const finalDesc = () => props.description ?? t(`jobs.empty.${props.variant}.description`);
const finalAction = () => props.actionLabel ?? t(`jobs.empty.${props.variant}.action`);
</script>

<template>
  <div
    class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center"
  >
    <div
      class="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center mb-5"
    >
      <component :is="Icon" class="w-10 h-10 text-slate-400 dark:text-slate-500" />
    </div>
    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">
      {{ finalTitle() }}
    </h3>
    <p class="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
      {{ finalDesc() }}
    </p>
    <BaseButton v-if="finalAction()" variant="primary" size="md" @click="emit('action')">
      {{ finalAction() }}
    </BaseButton>
  </div>
</template>
