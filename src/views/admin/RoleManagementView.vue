<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Shield, Edit, Trash2, AlertCircle, Check, Plus, RefreshCw,
  Lock
} from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminHeader from '@/components/sidebar/AdminHeader.vue'
import AdminTable from '@/components/base/AdminTable.vue'
import AdminBadge from '@/components/base/AdminBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { adminRolesApi } from '@/api/adminService'

const { t } = useI18n()

interface AdminRole {
  id: string
  name: string
  displayName: string
  description: string
  permissions: string[]
  level: number
  isSystem: boolean
  isActive: boolean
}

const searchQuery = ref('')
const roles = ref<AdminRole[]>([])
const totalElements = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const isLoading = ref(false)
const error = ref('')
const success = ref('')
const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const selected = ref<AdminRole | null>(null)
const saving = ref(false)

const form = ref({
  name: '',
  displayName: '',
  description: '',
  level: 1,
  isActive: true,
  permissions: [] as string[]
})

const allPermissionKeys = computed(() => [
  'DASHBOARD_VIEW', 'USERS_VIEW', 'USERS_EDIT', 'USERS_DELETE',
  'RECRUITERS_VIEW', 'RECRUITERS_EDIT', 'CANDIDATES_VIEW',
  'JOBS_VIEW', 'JOBS_EDIT', 'JOBS_DELETE', 'JOBS_APPROVE',
  'APPLICATIONS_VIEW', 'SCRAPING_VIEW', 'SCRAPING_EDIT', 'SCRAPING_RUN',
  'AI_VIEW', 'AI_EDIT', 'CONTENT_VIEW', 'CONTENT_EDIT',
  'REPORTS_VIEW', 'NOTIFICATIONS_VIEW', 'NOTIFICATIONS_SEND',
  'AUDIT_VIEW', 'ROLES_VIEW', 'ROLES_EDIT', 'SETTINGS_VIEW', 'SETTINGS_EDIT'
])

const columns = computed(() => [
  { key: 'name', label: t('admin.roles.name') },
  { key: 'display', label: t('admin.roles.displayName'), hideOn: 'sm' as const },
  { key: 'level', label: t('admin.roles.level') },
  { key: 'permissions', label: t('admin.roles.permissions') },
  { key: 'status', label: t('admin.roles.isActive') },
  { key: 'actions', label: t('admin.roles.actions'), align: 'right' as const }
])

const fetchRoles = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const res = await adminRolesApi.getAll({
      page: currentPage.value - 1,
      size: pageSize.value
    })
    if (res.data.success) {
      const data = res.data.data
      roles.value = (data.content || []).map((r: any) => ({
        id: r.id,
        name: r.name || '',
        displayName: r.displayName || r.name || '',
        description: r.description || '',
        permissions: Array.isArray(r.permissions) ? r.permissions : [],
        level: r.level ?? 0,
        isSystem: Boolean(r.isSystem),
        isActive: r.isActive !== false
      }))
      totalElements.value = data.totalElements ?? roles.value.length
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
  form.value = { name: '', displayName: '', description: '', level: 1, isActive: true, permissions: [] }
  modalType.value = 'create'
  isModalOpen.value = true
}

const openEdit = (r: AdminRole) => {
  selected.value = r
  form.value = {
    name: r.name,
    displayName: r.displayName,
    description: r.description,
    level: r.level,
    isActive: r.isActive,
    permissions: [...r.permissions]
  }
  modalType.value = 'edit'
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selected.value = null
}

const save = async () => {
  if (!form.value.name.trim()) {
    error.value = t('validation.required')
    return
  }
  saving.value = true
  error.value = ''
  try {
    const payload = {
      name: form.value.name,
      displayName: form.value.displayName,
      description: form.value.description,
      level: form.value.level,
      isActive: form.value.isActive,
      permissions: form.value.permissions
    }
    const res = modalType.value === 'create'
      ? await adminRolesApi.create(payload)
      : await adminRolesApi.update(selected.value!.id, payload)
    if (res?.data?.success) {
      flash(t(modalType.value === 'create' ? 'admin.roles.createSuccess' : 'admin.roles.updateSuccess'))
      closeModal()
      fetchRoles()
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    saving.value = false
  }
}

const handleDelete = async (r: AdminRole) => {
  if (r.isSystem) {
    error.value = t('admin.roles.deleteConfirm')
    return
  }
  if (!confirm(t('admin.roles.deleteConfirm'))) return
  try {
    await adminRolesApi.delete(r.id)
    flash(t('admin.roles.deleteSuccess'))
    fetchRoles()
  } catch (err: any) {
    error.value = err.response?.data?.message || t('admin.common.error')
  }
}

const toggleAllPermissions = () => {
  if (form.value.permissions.length === allPermissionKeys.value.length) {
    form.value.permissions = []
  } else {
    form.value.permissions = [...allPermissionKeys.value]
  }
}

const handleSearch = () => { currentPage.value = 1 }
const handlePageChange = (p: number) => { currentPage.value = p; fetchRoles() }

const filtered = computed(() => {
  if (!searchQuery.value) return roles.value
  const q = searchQuery.value.toLowerCase()
  return roles.value.filter(
    (r) =>
      (r.name || '').toLowerCase().includes(q) ||
      (r.displayName || '').toLowerCase().includes(q)
  )
})

onMounted(fetchRoles)
</script>

<template>
  <AdminLayout>
    <AdminHeader />

    <div class="p-4 md:p-6">
      <div class="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {{ t('admin.roles.title') }}
          </h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {{ t('admin.roles.subtitle') }}
          </p>
        </div>
        <BaseButton variant="primary" @click="openCreate">
          <Plus class="w-4 h-4 mr-2" />
          {{ t('admin.roles.createNew') }}
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
        :search-placeholder="t('admin.roles.name')"
        v-model:search-model-value="searchQuery"
        :total-elements="totalElements"
        :page="currentPage"
        :page-size="pageSize"
        :empty-title="t('admin.roles.noRoles')"
        @search="handleSearch"
        @page-change="handlePageChange"
      >
        <template #toolbar>
          <BaseButton variant="secondary" @click="fetchRoles">
            <RefreshCw class="w-4 h-4" />
          </BaseButton>
        </template>

        <template #rows="{ items }">
          <tr v-for="r in items" :key="r.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div :class="['w-9 h-9 rounded-lg flex items-center justify-center shrink-0', r.isSystem ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-indigo-100 dark:bg-indigo-900/30']">
                  <Lock v-if="r.isSystem" class="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <Shield v-else class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-slate-900 dark:text-white truncate">{{ r.name }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ r.description }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 hidden md:table-cell text-sm text-slate-700 dark:text-slate-300">{{ r.displayName }}</td>
            <td class="px-4 py-3">
              <AdminBadge :variant="'info'" :label="String(r.level)" />
            </td>
            <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
              {{ r.permissions.length }}
            </td>
            <td class="px-4 py-3">
              <AdminBadge :variant="r.isActive ? 'success' : 'neutral'" :label="r.isActive ? t('admin.common.active') : t('admin.common.inactive')" :dot="true" />
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <button @click="openEdit(r)" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" :title="t('common.edit')">
                  <Edit class="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </button>
                <button
                  v-if="!r.isSystem"
                  @click="handleDelete(r)"
                  class="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  :title="t('common.delete')"
                >
                  <Trash2 class="w-4 h-4 text-red-500" />
                </button>
              </div>
            </td>
          </tr>
        </template>
      </AdminTable>
    </div>

    <BaseModal :is-open="isModalOpen" :title="modalType === 'create' ? t('admin.roles.createNew') : t('admin.roles.edit')" size="lg" @close="closeModal">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('admin.roles.name') }}</label>
            <BaseInput v-model="form.name" type="text" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('admin.roles.displayName') }}</label>
            <BaseInput v-model="form.displayName" type="text" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('admin.roles.description') }}</label>
          <BaseInput v-model="form.description" type="text" />
        </div>
        <div class="grid grid-cols-2 gap-3 items-end">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ t('admin.roles.level') }}</label>
            <input v-model.number="form.level" type="number" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
          <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" v-model="form.isActive" class="rounded text-blue-600" />
            {{ t('admin.roles.isActive') }}
          </label>
        </div>
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ t('admin.roles.permissions') }}</label>
            <button type="button" @click="toggleAllPermissions" class="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              {{ form.permissions.length === allPermissionKeys.length ? t('admin.roles.deselectAll') : t('admin.roles.selectAll') }}
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <label
              v-for="key in allPermissionKeys"
              :key="key"
              class="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 p-1.5 rounded"
            >
              <input
                type="checkbox"
                :value="key"
                v-model="form.permissions"
                class="rounded text-blue-600"
              />
              <span>{{ t(`admin.roles.permissions.${key}`, key) }}</span>
            </label>
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="closeModal">{{ t('common.cancel') }}</BaseButton>
        <BaseButton variant="primary" @click="save" :disabled="saving">{{ t('common.save') }}</BaseButton>
      </template>
    </BaseModal>
  </AdminLayout>
</template>
