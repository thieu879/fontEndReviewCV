<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Plus, Edit, Trash2, FileText, AlertCircle, Check,
  RefreshCw, Eye, EyeOff
} from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminHeader from '@/components/sidebar/AdminHeader.vue'
import AdminTable from '@/components/base/AdminTable.vue'
import AdminBadge from '@/components/base/AdminBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { adminContentApi } from '@/api/adminService'

const { t } = useI18n()

interface ContentBlock {
  id: string
  slug: string
  title: string
  content: string
  contentType: string
  section: string
  sortOrder: number
  isActive: boolean
  isFeatured: boolean
}

const searchQuery = ref('')
const blocks = ref<ContentBlock[]>([])
const totalElements = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const isLoading = ref(false)
const error = ref('')
const success = ref('')
const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const selected = ref<ContentBlock | null>(null)
const saving = ref(false)

const form = ref({
  title: '',
  slug: '',
  content: '',
  section: 'HOME',
  contentType: 'TEXT',
  sortOrder: 0,
  isActive: true,
  isFeatured: false
})

const columns = computed(() => [
  { key: 'title', label: t('admin.content.titleField') },
  { key: 'slug', label: t('admin.content.slug'), hideOn: 'md' as const },
  { key: 'section', label: t('admin.content.section') },
  { key: 'type', label: t('admin.content.contentType'), hideOn: 'sm' as const },
  { key: 'status', label: t('admin.content.isActive') },
  { key: 'actions', label: t('admin.content.actions'), align: 'right' as const }
])

const fetchList = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const res = await adminContentApi.getAll({
      page: currentPage.value - 1,
      size: pageSize.value
    })
    if (res.data.success) {
      const data = res.data.data
      blocks.value = (data.content || []).map((b: any) => ({
        id: b.id,
        slug: b.slug || '',
        title: b.title || '',
        content: b.content || '',
        contentType: b.contentType || 'TEXT',
        section: b.section || 'HOME',
        sortOrder: b.sortOrder ?? 0,
        isActive: Boolean(b.isActive),
        isFeatured: Boolean(b.isFeatured)
      }))
      totalElements.value = data.totalElements ?? blocks.value.length
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    isLoading.value = false
  }
}

const flash = (msg: string) => {
  success.value = msg
  setTimeout(() => (success.value = ''), 3000)
}

const openCreate = () => {
  selected.value = null
  form.value = { title: '', slug: '', content: '', section: 'HOME', contentType: 'TEXT', sortOrder: 0, isActive: true, isFeatured: false }
  modalType.value = 'create'
  isModalOpen.value = true
}

const openEdit = (b: ContentBlock) => {
  selected.value = b
  form.value = {
    title: b.title,
    slug: b.slug,
    content: b.content,
    section: b.section,
    contentType: b.contentType,
    sortOrder: b.sortOrder,
    isActive: b.isActive,
    isFeatured: b.isFeatured
  }
  modalType.value = 'edit'
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selected.value = null
}

const save = async () => {
  if (!form.value.title.trim()) {
    error.value = t('validation.required')
    return
  }
  saving.value = true
  error.value = ''
  try {
    const payload = { ...form.value }
    const res = modalType.value === 'create'
      ? await adminContentApi.create(payload)
      : await adminContentApi.update(selected.value!.id, payload)
    if (res?.data?.success) {
      flash(t(modalType.value === 'create' ? 'admin.content.createSuccess' : 'admin.content.updateSuccess'))
      closeModal()
      fetchList()
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    saving.value = false
  }
}

const handleToggle = async (b: ContentBlock) => {
  try {
    await adminContentApi.toggleStatus(b.id)
    flash(t('admin.content.toggleSuccess'))
    fetchList()
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  }
}

const handleDelete = async (b: ContentBlock) => {
  if (!confirm(t('admin.content.deleteConfirm'))) return
  try {
    await adminContentApi.delete(b.id)
    flash(t('admin.content.deleteSuccess'))
    fetchList()
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  }
}

const handleSearch = () => { currentPage.value = 1 }
const handlePageChange = (p: number) => { currentPage.value = p; fetchList() }

const filtered = computed(() => {
  if (!searchQuery.value) return blocks.value
  const q = searchQuery.value.toLowerCase()
  return blocks.value.filter(
    (b) => (b.title || '').toLowerCase().includes(q) || (b.slug || '').toLowerCase().includes(q)
  )
})

onMounted(fetchList)
</script>

<template>
  <AdminLayout>
    <AdminHeader />

    <div class="p-4 md:p-6">
      <div class="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {{ t('admin.content.title') }}
          </h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {{ t('admin.content.subtitle') }}
          </p>
        </div>
        <BaseButton variant="primary" @click="openCreate">
          <Plus class="w-4 h-4 mr-2" />
          {{ t('admin.content.createNew') }}
        </BaseButton>
      </div>

      <div v-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl flex items-center gap-2">
        <AlertCircle class="w-5 h-5 text-red-500 shrink-0" />
        <span class="text-red-700 dark:text-red-400 text-sm">{{ error }}</span>
      </div>
      <div v-if="success" class="mb-4 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-xl flex items-center gap-2">
        <Check class="w-5 h-5 text-green-500 shrink-0" />
        <span class="text-green-700 dark:text-green-400 text-sm">{{ success }}</span>
      </div>

      <AdminTable
        :items="filtered"
        :columns="columns"
        :is-loading="isLoading"
        :search-placeholder="t('admin.content.titleField')"
        v-model:search-model-value="searchQuery"
        :total-elements="totalElements"
        :page="currentPage"
        :page-size="pageSize"
        :empty-title="t('admin.content.noContent')"
        @search="handleSearch"
        @page-change="handlePageChange"
      >
        <template #toolbar>
          <BaseButton variant="secondary" @click="fetchList">
            <RefreshCw class="w-4 h-4" />
          </BaseButton>
        </template>

        <template #rows="{ items }">
          <tr v-for="b in items" :key="b.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                  <FileText class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-slate-900 dark:text-white truncate">{{ b.title }}</p>
                  <p v-if="b.isFeatured" class="text-xs text-yellow-600 dark:text-yellow-400">★ Featured</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 hidden lg:table-cell">
              <code class="text-xs font-mono px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                {{ b.slug }}
              </code>
            </td>
            <td class="px-4 py-3">
              <AdminBadge :variant="'info'" :label="t(`admin.content.sections.${b.section}`, b.section)" />
            </td>
            <td class="px-4 py-3 hidden md:table-cell">
              <span class="text-xs text-slate-700 dark:text-slate-300">
                {{ t(`admin.content.types.${b.contentType}`, b.contentType) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <AdminBadge :variant="b.isActive ? 'success' : 'neutral'" :label="b.isActive ? t('admin.common.active') : t('admin.common.inactive')" :dot="true" />
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <button @click="openEdit(b)" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" :title="t('common.edit')">
                  <Edit class="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </button>
                <button @click="handleToggle(b)" class="p-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors" :title="b.isActive ? t('admin.content.isActive') : t('admin.content.isActive')">
                  <Eye v-if="b.isActive" class="w-4 h-4 text-blue-500" />
                  <EyeOff v-else class="w-4 h-4 text-slate-400" />
                </button>
                <button @click="handleDelete(b)" class="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors" :title="t('common.delete')">
                  <Trash2 class="w-4 h-4 text-red-500" />
                </button>
              </div>
            </td>
          </tr>
        </template>
      </AdminTable>
    </div>

    <BaseModal :is-open="isModalOpen" :title="modalType === 'create' ? t('admin.content.createNew') : t('admin.content.edit')" size="lg" @close="closeModal">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('admin.content.titleField') }}</label>
            <BaseInput v-model="form.title" type="text" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('admin.content.slug') }}</label>
            <BaseInput v-model="form.slug" type="text" placeholder="my-block" />
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('admin.content.section') }}</label>
            <select v-model="form.section" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
              <option value="HOME">{{ t('admin.content.sections.HOME') }}</option>
              <option value="ABOUT">{{ t('admin.content.sections.ABOUT') }}</option>
              <option value="PRICING">{{ t('admin.content.sections.PRICING') }}</option>
              <option value="BLOG">{{ t('admin.content.sections.BLOG') }}</option>
              <option value="FOOTER">{{ t('admin.content.sections.FOOTER') }}</option>
              <option value="HERO">{{ t('admin.content.sections.HERO') }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('admin.content.contentType') }}</label>
            <select v-model="form.contentType" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
              <option value="TEXT">{{ t('admin.content.types.TEXT') }}</option>
              <option value="HTML">{{ t('admin.content.types.HTML') }}</option>
              <option value="MARKDOWN">{{ t('admin.content.types.MARKDOWN') }}</option>
              <option value="IMAGE">{{ t('admin.content.types.IMAGE') }}</option>
              <option value="VIDEO">{{ t('admin.content.types.VIDEO') }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('admin.content.sortOrder') }}</label>
            <input v-model.number="form.sortOrder" type="number" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('admin.content.content') }}</label>
          <textarea v-model="form.content" rows="6" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm" />
        </div>
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" v-model="form.isActive" class="rounded text-blue-600" />
            {{ t('admin.content.isActive') }}
          </label>
          <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" v-model="form.isFeatured" class="rounded text-blue-600" />
            {{ t('admin.content.isFeatured') }}
          </label>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="closeModal">{{ t('common.cancel') }}</BaseButton>
        <BaseButton variant="primary" @click="save" :disabled="saving">{{ t('common.save') }}</BaseButton>
      </template>
    </BaseModal>
  </AdminLayout>
</template>
