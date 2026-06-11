<template>
  <BaseModal :is-open="isOpen" :title="t('confirmDelete.title')" size="sm" :show-footer="true" @close="close">
    <div class="text-center py-4">

      <!-- Icon -->
      <div class="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Trash2 class="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>

      <!-- Title -->
      <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {{ t('confirmDelete.title') }}
      </h3>

      <!-- Description -->
      <p class="text-slate-500 dark:text-slate-400 leading-relaxed">
        {{ message || t('confirmDelete.defaultMessage') }}
      </p>

      <!-- Warning hint -->
      <div class="mt-4 flex items-center justify-center gap-1 text-xs text-red-500 dark:text-red-400 font-medium">
        <AlertTriangle class="w-3.5 h-3.5" />
        {{ t('confirmDelete.warning') }}
      </div>

    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">

        <!-- Cancel -->
        <BaseButton variant="secondary" @click="close">
          {{ t('confirmDelete.cancel') }}
        </BaseButton>

        <!-- Confirm delete -->
        <BaseButton variant="danger" @click="confirm">
          {{ t('confirmDelete.confirm') }}
        </BaseButton>

      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/components/common/BaseModal.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import { Trash2, AlertTriangle } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

interface Props {
  isOpen: boolean;
  message?: string;
}

withDefaults(defineProps<Props>(), {
  message: ''
});

const { t } = useI18n();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm'): void;
}>();

const close = () => emit('close');
const confirm = () => emit('confirm');
</script>
