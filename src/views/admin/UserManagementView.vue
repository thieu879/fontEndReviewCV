<template>
  <AdminLayout>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white mb-2">Quản lý người dùng</h1>
        <p class="text-slate-400">Quản lý tài khoản và phân quyền người dùng</p>
      </div>
      <button class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium flex items-center gap-2">
        <Plus class="w-5 h-5" />
        Thêm người dùng
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Users class="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-white">1,234</p>
            <p class="text-sm text-slate-400">Tổng người dùng</p>
          </div>
        </div>
      </div>
      <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
            <UserCheck class="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-white">892</p>
            <p class="text-sm text-slate-400">Đang hoạt động</p>
          </div>
        </div>
      </div>
      <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <Shield class="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-white">12</p>
            <p class="text-sm text-slate-400">Quản trị viên</p>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      <div class="p-4 border-b border-slate-700 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Tìm kiếm người dùng..."
              class="w-64 pl-9 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            v-model="roleFilter"
            class="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả vai trò</option>
            <option value="admin">Quản trị viên</option>
            <option value="recruiter">Nhà tuyển dụng</option>
            <option value="user">Người dùng</option>
          </select>
        </div>
        <div class="flex items-center gap-2 text-sm text-slate-400">
          <span>{{ filteredUsers.length }} người dùng</span>
        </div>
      </div>

      <div v-if="filteredUsers.length > 0">
        <UserTableRow
          v-for="user in filteredUsers"
          :key="user.id"
          :user="user"
          @edit="editUser"
          @delete="confirmDelete"
        />
      </div>

      <div v-else class="p-12 text-center">
        <Users class="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-slate-300 mb-2">Không có người dùng</h3>
        <p class="text-slate-500">Không tìm thấy người dùng nào phù hợp</p>
      </div>

      <div class="p-4 border-t border-slate-700 flex items-center justify-between">
        <p class="text-sm text-slate-400">Hiển thị 1-10 của {{ filteredUsers.length }} người dùng</p>
        <div class="flex items-center gap-2">
          <button class="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 transition-colors">
            <ChevronLeft class="w-5 h-5 text-slate-400" />
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
          <button class="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 transition-colors">2</button>
          <button class="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 transition-colors">
            <ChevronRight class="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>

    <ConfirmDeleteModal
      :is-open="showDeleteModal"
      message="Người dùng này sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?"
      @close="showDeleteModal = false"
      @confirm="deleteUser"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import UserTableRow from '@/components/cards/UserTableRow.vue';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal.vue';
import { Plus, Search, Users, UserCheck, Shield, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import type { User } from '@/types';

const searchQuery = ref('');
const roleFilter = ref('');
const showDeleteModal = ref(false);
const selectedUser = ref<User | null>(null);

const users = ref<User[]>([
  { id: '1', name: 'Admin System', email: 'admin@cvanalyzer.com', role: 'admin', createdAt: '2024-01-01' },
  { id: '2', name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', role: 'recruiter', createdAt: '2024-01-05' },
  { id: '3', name: 'Trần Thị B', email: 'tranthib@example.com', role: 'user', createdAt: '2024-01-10' },
  { id: '4', name: 'Lê Văn C', email: 'levanc@example.com', role: 'user', createdAt: '2024-01-12' },
  { id: '5', name: 'Phạm Thị D', email: 'phamthid@example.com', role: 'recruiter', createdAt: '2024-01-14' },
]);

const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesRole = !roleFilter.value || user.role === roleFilter.value;
    return matchesSearch && matchesRole;
  });
});

const editUser = (user: User) => {
  console.log('Edit user:', user);
};

const confirmDelete = (user: User) => {
  selectedUser.value = user;
  showDeleteModal.value = true;
};

const deleteUser = () => {
  if (selectedUser.value) {
    users.value = users.value.filter(u => u.id !== selectedUser.value?.id);
    showDeleteModal.value = false;
    selectedUser.value = null;
  }
};
</script>
