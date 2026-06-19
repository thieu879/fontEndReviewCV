<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  AlertCircle, Check, Mail,
  Search, Lock, Unlock
} from 'lucide-vue-next'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminHeader from '@/components/sidebar/AdminHeader.vue'
import AdminTable from '@/components/base/AdminTable.vue'
import AdminBadge from '@/components/base/AdminBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { adminUsersApi } from '@/api/adminService'

const { t } = useI18n()

interface User {
  id: string
  username: string
  email: string
  fullName: string
  role: string
  status: string
  emailVerified: boolean
  createdAt: string
  lastLogin?: string | null
}

const searchQuery = ref('')
const searchInput = ref('')
const selectedStatus = ref('')
const isModalOpen = ref(false)
const modalType = ref<'ban' | 'unban'>('ban')
const selectedUser = ref<User | null>(null)
const isLoading = ref(false)
const error = ref('')
const success = ref('')

const statuses = computed(() => [
  { value: '', label: t('admin.users.allStatuses') },
  { value: 'ACTIVE', label: t('admin.users.statuses.ACTIVE') },
  { value: 'INACTIVE', label: t('admin.users.statuses.INACTIVE') },
  { value: 'SUSPENDED', label: t('admin.users.statuses.SUSPENDED') },
  { value: 'BANNED', label: t('admin.users.statuses.BANNED') }
])

const users = ref<User[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalElements = ref(0)

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const onSearchInput = () => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    searchQuery.value = searchInput.value.trim()
    currentPage.value = 1
    fetchUsers()
  }, 350)
}

const fetchUsers = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await adminUsersApi.getAll({
      page: currentPage.value - 1,
      size: pageSize.value,
      search: searchQuery.value || undefined,
      status: selectedStatus.value || undefined
    })
    if (response.data?.success) {
      const content = response.data.data?.content || []
      users.value = content.map((u: any) => {
        const roleName = u.primaryRole
          || (Array.isArray(u.roles) && u.roles.length > 0 ? u.roles[0] : null)
          || 'CANDIDATE'
        return {
          id: u.id,
          username: u.username,
          email: u.email,
          fullName: u.fullName || u.profile?.fullName || u.username,
          role: roleName,
          status: u.status || (u.enabled ? 'ACTIVE' : 'BANNED'),
          emailVerified: u.emailVerified || false,
          createdAt: u.createdAt,
          lastLogin: u.lastLoginAt || u.lastLogin || null
        }
      })
      totalElements.value = response.data.data?.totalElements ?? users.value.length
    } else {
      error.value = response.data?.message || t('admin.common.error')
    }
  } catch (err: any) {
    console.error('[UserManagement] fetchUsers error:', err)
    error.value = err.response?.data?.message || t('admin.common.error')
  } finally {
    isLoading.value = false
  }
}

const openBanModal = (user: User) => {
  selectedUser.value = user
  modalType.value = 'ban'
  isModalOpen.value = true
}

const openUnbanModal = (user: User) => {
  selectedUser.value = user
  modalType.value = 'unban'
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedUser.value = null
  error.value = ''
}

const showSuccess = (msg: string) => {
  success.value = msg
  setTimeout(() => (success.value = ''), 3000)
}

const showError = (msg: string) => {
  error.value = msg
  setTimeout(() => (error.value = ''), 4000)
}

const handleBan = async () => {
  if (!selectedUser.value) return
  try {
    const response = await adminUsersApi.banUser(selectedUser.value.id)
    if (response.data?.success) {
      showSuccess(t('admin.users.banSuccess'))
      closeModal()
      await fetchUsers()
    } else {
      error.value = response.data?.message || t('admin.common.error')
    }
  } catch (err: any) {
    console.error('[UserManagement] ban error:', err)
    error.value = err.response?.data?.message || t('admin.common.error')
  }
}

const handleUnban = async () => {
  if (!selectedUser.value) return
  try {
    const response = await adminUsersApi.unbanUser(selectedUser.value.id)
    if (response.data?.success) {
      showSuccess(t('admin.users.unbanSuccess'))
      closeModal()
      await fetchUsers()
    } else {
      error.value = response.data?.message || t('admin.common.error')
    }
  } catch (err: any) {
    console.error('[UserManagement] unban error:', err)
    error.value = err.response?.data?.message || t('admin.common.error')
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchUsers()
}

const handleFilterChange = () => {
  currentPage.value = 1
  fetchUsers()
}

const handleResetFilters = () => {
  searchInput.value = ''
  searchQuery.value = ''
  selectedStatus.value = ''
  currentPage.value = 1
  fetchUsers()
}

const roleVariant = (role: string) => {
  switch (role.toUpperCase()) {
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return 'danger'
    case 'RECRUITER':
      return 'info'
    case 'CANDIDATE':
      return 'neutral'
    default:
      return 'neutral'
  }
}

const statusVariant = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'INACTIVE':
      return 'warning'
    case 'SUSPENDED':
    case 'BANNED':
      return 'danger'
    default:
      return 'neutral'
  }
}

const formatDate = (iso?: string | null) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString()
  } catch {
    return '—'
  }
}

const columns = computed(() => [
  { key: 'user', label: t('admin.users.user') },
  { key: 'role', label: t('admin.users.role') },
  { key: 'status', label: t('admin.users.status') },
  { key: 'verified', label: t('admin.users.emailVerified'), hideOn: 'sm' as const },
  { key: 'created', label: t('admin.users.createdAt'), hideOn: 'md' as const },
  { key: 'actions', label: t('admin.users.actions'), align: 'right' as const }
])

const modalTitle = computed(() => {
  switch (modalType.value) {
    case 'ban':
      return t('admin.users.banConfirmTitle')
    case 'unban':
      return t('admin.users.unbanConfirmTitle')
  }
  return ''
})

onMounted(fetchUsers)
</script>

<template>
  <AdminLayout>
    <AdminHeader />

    <div class="p-4 md:p-6">
      <!-- Header -->
      <div class="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {{ t('admin.users.title') }}
          </h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {{ t('admin.users.subtitle') }}
          </p>
        </div>
      </div>

      <!-- Standalone Search -->
      <div class="mb-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div class="md:col-span-6">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {{ t('common.search') }}
            </label>
            <div class="relative">
              <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                v-model="searchInput"
                @input="onSearchInput"
                type="text"
                :placeholder="t('admin.users.searchPlaceholder')"
                class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          <div class="md:col-span-4">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {{ t('admin.users.filterStatus') }}
            </label>
            <select
              v-model="selectedStatus"
              @change="handleFilterChange"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>

          <div class="md:col-span-2 flex">
            <BaseButton variant="secondary" full-width @click="handleResetFilters">
              {{ t('admin.search.clearFilter') }}
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Error/Success Messages -->
      <div
        v-if="error"
        class="mb-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl flex items-center gap-2"
      >
        <AlertCircle class="w-5 h-5 text-red-500 shrink-0" />
        <span class="text-red-700 dark:text-red-400 text-sm">{{ error }}</span>
      </div>
      <div
        v-if="success"
        class="mb-4 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-xl flex items-center gap-2"
      >
        <Check class="w-5 h-5 text-green-500 shrink-0" />
        <span class="text-green-700 dark:text-green-400 text-sm">{{ success }}</span>
      </div>

      <!-- Table -->
      <AdminTable
        :items="users"
        :columns="columns"
        :is-loading="isLoading"
        :total-elements="totalElements"
        :page="currentPage"
        :page-size="pageSize"
        :empty-title="t('admin.users.noUsers')"
        @page-change="handlePageChange"
      >
        <template #rows="{ items }">
          <tr
            v-for="user in items"
            :key="user.id"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {{ (user.fullName || user.username || '?').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-slate-900 dark:text-white truncate">
                    {{ user.fullName || user.username }}
                  </p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                    <Mail class="w-3 h-3 shrink-0" />
                    {{ user.email }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <AdminBadge :variant="roleVariant(user.role)" :label="t(`admin.users.roles.${user.role}`, user.role)" />
            </td>
            <td class="px-4 py-3">
              <AdminBadge :variant="statusVariant(user.status)" :label="t(`admin.users.statuses.${user.status}`, user.status)" :dot="true" />
            </td>
            <td class="px-4 py-3 hidden md:table-cell">
              <span v-if="user.emailVerified" class="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                {{ t('admin.users.verified') }}
              </span>
              <span v-else class="text-slate-400 dark:text-slate-500 text-sm">
                {{ t('admin.users.unverified') }}
              </span>
            </td>
            <td class="px-4 py-3 hidden lg:table-cell text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {{ formatDate(user.createdAt) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <button
                  v-if="user.status !== 'BANNED' && user.status !== 'SUSPENDED'"
                  @click="openBanModal(user)"
                  class="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  :title="t('admin.users.ban')"
                >
                  <Lock class="w-4 h-4 text-red-500" />
                </button>
                <button
                  v-else
                  @click="openUnbanModal(user)"
                  class="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
                  :title="t('admin.users.unban')"
                >
                  <Unlock class="w-4 h-4 text-green-500" />
                </button>
              </div>
            </td>
          </tr>
        </template>
      </AdminTable>
    </div>

    <!-- Modal: Ban Confirmation -->
    <BaseModal
      :is-open="isModalOpen && modalType === 'ban'"
      :title="modalTitle"
      :show-footer="true"
      @close="closeModal"
    >
      <div class="space-y-4">
        <div class="flex flex-col items-center text-center py-2">
          <div class="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <Lock class="w-7 h-7 text-red-500" />
          </div>
          <p class="text-slate-600 dark:text-slate-400 mb-3 text-sm">
            {{ t('admin.users.banConfirmMessage') }}
          </p>
          <div class="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p class="font-semibold text-slate-900 dark:text-white">
              {{ selectedUser?.fullName || selectedUser?.username }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ selectedUser?.email }}
            </p>
          </div>
        </div>

        <div
          v-if="error"
          class="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-lg text-red-600 dark:text-red-400 text-sm"
        >
          {{ error }}
        </div>
      </div>

      <template #footer>
        <BaseButton variant="secondary" @click="closeModal">{{ t('common.cancel') }}</BaseButton>
        <BaseButton variant="danger" @click="handleBan">
          <Lock class="w-4 h-4 mr-1.5" />
          {{ t('admin.users.ban') }}
        </BaseButton>
      </template>
    </BaseModal>

    <!-- Modal: Unban Confirmation -->
    <BaseModal
      :is-open="isModalOpen && modalType === 'unban'"
      :title="modalTitle"
      :show-footer="true"
      @close="closeModal"
    >
      <div class="space-y-4">
        <div class="flex flex-col items-center text-center py-2">
          <div class="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <Unlock class="w-7 h-7 text-green-500" />
          </div>
          <p class="text-slate-600 dark:text-slate-400 mb-3 text-sm">
            {{ t('admin.users.unbanConfirmMessage') }}
          </p>
          <div class="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p class="font-semibold text-slate-900 dark:text-white">
              {{ selectedUser?.fullName || selectedUser?.username }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ selectedUser?.email }}
            </p>
          </div>
        </div>

        <div
          v-if="error"
          class="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-lg text-red-600 dark:text-red-400 text-sm"
        >
          {{ error }}
        </div>
      </div>

      <template #footer>
        <BaseButton variant="secondary" @click="closeModal">{{ t('common.cancel') }}</BaseButton>
        <BaseButton variant="primary" @click="handleUnban">
          <Unlock class="w-4 h-4 mr-1.5" />
          {{ t('admin.users.unban') }}
        </BaseButton>
      </template>
    </BaseModal>
  </AdminLayout>
</template>
