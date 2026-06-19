<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Bot, Save, AlertCircle, Check, RefreshCw,
  Sliders, Settings as SettingsIcon
} from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminHeader from '@/components/sidebar/AdminHeader.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { adminAIApi } from '@/api/adminService'

const { t } = useI18n()

interface AIConfiguration {
  id: string
  configKey: string
  displayName: string
  description: string
  configType: string
  configValue: Record<string, any>
  category: string
  isActive: boolean
}

const configs = ref<AIConfiguration[]>([])
const isLoading = ref(false)
const error = ref('')
const success = ref('')
const isModalOpen = ref(false)
const selected = ref<AIConfiguration | null>(null)
const editValue = ref('')

const weights = ref({
  skills: 40,
  experience: 30,
  title: 20,
  education: 10
})
const weightsTotal = computed(() =>
  Number(weights.value.skills) + Number(weights.value.experience) + Number(weights.value.title) + Number(weights.value.education)
)

const fetchConfigs = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const res = await adminAIApi.getConfigurations({ size: 100 })
    if (res.data.success) {
      const data = res.data.data
      configs.value = (data.content || []).map((c: any) => ({
        id: c.id,
        configKey: c.configKey,
        displayName: c.displayName || c.configKey,
        description: c.description || '',
        configType: c.configType || 'JSON',
        configValue: typeof c.configValue === 'string' ? JSON.parse(c.configValue || '{}') : (c.configValue || {}),
        category: c.category || 'MODEL',
        isActive: Boolean(c.isActive)
      }))
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    isLoading.value = false
  }
}

const fetchWeights = async () => {
  try {
    const res = await adminAIApi.getScoringWeights()
    if (res.data.success && res.data.data) {
      const w = res.data.data
      weights.value = {
        skills: w.skill ?? w.skills ?? 40,
        experience: w.experience ?? 30,
        title: w.title ?? 20,
        education: w.education ?? 10
      }
    }
  } catch {
    // use defaults
  }
}

const openEdit = (c: AIConfiguration) => {
  selected.value = c
  editValue.value = JSON.stringify(c.configValue, null, 2)
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selected.value = null
}

const saveConfig = async () => {
  if (!selected.value) return
  let parsed: any
  try {
    parsed = JSON.parse(editValue.value)
  } catch {
    error.value = 'Invalid JSON'
    return
  }
  try {
    const res = await adminAIApi.updateConfiguration(selected.value.id, {
      configValue: parsed,
      isActive: selected.value.isActive
    })
    if (res?.data?.success) {
      success.value = t('admin.ai.saveSuccess')
      setTimeout(() => (success.value = ''), 3000)
      closeModal()
      fetchConfigs()
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  }
}

const saveWeights = async () => {
  if (weightsTotal.value !== 100) {
    error.value = t('admin.ai.totalMustEqual100')
    return
  }
  try {
    await adminAIApi.updateScoringWeights(weights.value)
    success.value = t('admin.ai.weightsSaved')
    setTimeout(() => (success.value = ''), 3000)
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  }
}

onMounted(() => {
  fetchConfigs()
  fetchWeights()
})
</script>

<template>
  <AdminLayout>
    <AdminHeader />

    <div class="p-4 md:p-6">
      <div class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          {{ t('admin.ai.configTitle') }}
        </h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          {{ t('admin.ai.configSubtitle') }}
        </p>
      </div>

      <div v-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl flex items-center gap-2">
        <AlertCircle class="w-5 h-5 text-red-500 shrink-0" />
        <span class="text-red-700 dark:text-red-400 text-sm">{{ error }}</span>
      </div>
      <div v-if="success" class="mb-4 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-xl flex items-center gap-2">
        <Check class="w-5 h-5 text-green-500 shrink-0" />
        <span class="text-green-700 dark:text-green-400 text-sm">{{ success }}</span>
      </div>

      <!-- Scoring weights -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-6 transition-colors">
        <h3 class="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Sliders class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          {{ t('admin.ai.scoringWeights') }}
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ t('admin.ai.scoringWeightsDesc') }}</p>

        <div class="grid md:grid-cols-4 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {{ t('admin.ai.skillWeight') }}
            </label>
            <input v-model.number="weights.skills" type="number" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {{ t('admin.ai.experienceWeight') }}
            </label>
            <input v-model.number="weights.experience" type="number" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {{ t('admin.ai.titleWeight') }}
            </label>
            <input v-model.number="weights.title" type="number" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {{ t('admin.ai.educationWeight') }}
            </label>
            <input v-model.number="weights.education" type="number" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <p :class="['text-sm font-medium', weightsTotal === 100 ? 'text-green-600 dark:text-green-400' : 'text-red-500']">
            Total: {{ weightsTotal }} / 100
          </p>
          <BaseButton variant="primary" :disabled="weightsTotal !== 100" @click="saveWeights">
            <Save class="w-4 h-4 mr-2" />
            {{ t('admin.ai.saveWeights') }}
          </BaseButton>
        </div>
      </div>

      <!-- Configurations -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Bot class="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {{ t('admin.ai.configurations') }}
            </h3>
            <BaseButton variant="secondary" size="sm" @click="fetchConfigs">
              <RefreshCw class="w-4 h-4" />
            </BaseButton>
          </div>
        </div>

        <div v-if="isLoading" class="p-6 space-y-3">
          <div v-for="i in 4" :key="i" class="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
        </div>

        <div v-else-if="!configs.length" class="p-12 text-center text-slate-400 dark:text-slate-500 text-sm">
          {{ t('admin.ai.noConfigurations') }}
        </div>

        <div v-else class="divide-y divide-slate-200 dark:divide-slate-700">
          <div
            v-for="c in configs"
            :key="c.id"
            class="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <code class="text-xs font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                    {{ c.configKey }}
                  </code>
                  <span class="text-xs text-slate-500 dark:text-slate-400">
                    {{ t(`admin.ai.categories.${c.category}`, c.category) }}
                  </span>
                </div>
                <p class="font-medium text-slate-900 dark:text-white">{{ c.displayName }}</p>
                <p v-if="c.description" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ c.description }}</p>
              </div>
              <BaseButton variant="secondary" size="sm" @click="openEdit(c)">
                <SettingsIcon class="w-4 h-4" />
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BaseModal :is-open="isModalOpen" :title="selected?.displayName || ''" size="lg" @close="closeModal">
      <div v-if="selected" class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Value (JSON)
          </label>
          <textarea
            v-model="editValue"
            rows="12"
            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs"
          />
        </div>
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="selected.isActive" class="rounded text-blue-600" />
          <span class="text-sm text-slate-700 dark:text-slate-300">{{ t('admin.ai.isActive') }}</span>
        </label>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="closeModal">{{ t('common.cancel') }}</BaseButton>
        <BaseButton variant="primary" @click="saveConfig">{{ t('admin.ai.saveSuccess') === 'Configuration saved' ? 'Save' : t('common.save') }}</BaseButton>
      </template>
    </BaseModal>
  </AdminLayout>
</template>
