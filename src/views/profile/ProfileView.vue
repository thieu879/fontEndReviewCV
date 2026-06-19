<template>
  <MainLayout>
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <Loader2 class="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      <span class="ml-3 text-slate-500 dark:text-slate-400">{{ t('common.loading') }}</span>
    </div>

    <template v-else>
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">{{ t('profile.title') }}</h1>
        <p class="text-slate-500 dark:text-slate-400">{{ t('profile.subtitle') }}</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column - Profile Card -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <div class="text-center pb-6 border-b border-gray-100 dark:border-slate-700">
              <div class="relative inline-block mb-4">
                <div class="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-4xl font-bold mx-auto overflow-hidden">
                  <img v-if="userAvatar || avatarPreview" :src="avatarPreview || userAvatar" crossorigin="anonymous" alt="Avatar" class="w-full h-full object-cover" />
                  <template v-else>{{ userInitials }}</template>
                </div>
                <button @click="triggerAvatarUpload" :disabled="isUploadingAvatar"
                  class="absolute bottom-0 right-0 w-10 h-10 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50">
                  <Loader2 v-if="isUploadingAvatar" class="w-5 h-5 text-gray-600 animate-spin" />
                  <Camera v-else class="w-5 h-5 text-gray-600" />
                </button>
                <input ref="avatarInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleAvatarUpload" />
              </div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-slate-100">{{ userName }}</h2>
              <p class="text-gray-500 dark:text-slate-400 mb-3">{{ userEmail }}</p>
              <BaseBadge variant="info" size="sm">{{ userRoleText }}</BaseBadge>
            </div>

            <div class="py-6 space-y-4">
              <div v-for="item in profileInfo" :key="item.label" class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                  <component :is="item.icon" class="w-5 h-5 text-gray-500 dark:text-slate-400" />
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-slate-400">{{ item.label }}</p>
                  <p class="text-sm font-medium text-gray-900 dark:text-slate-100">{{ item.value }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Details -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Statistics -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">{{ t('dashboard.statsOverview') }}</h3>
            <div class="grid grid-cols-3 gap-4">
            <StatCard :title="t('cv.myCvs')" :value="stats.totalCVs" :change="''" icon="FileText" />
            <StatCard :title="t('cv.completed')" :value="stats.analyzedCVs" :change="''" icon="CheckCircle2" />
            <StatCard :title="t('analysis.score')" :value="`${stats.avgMatchScore}%`" :change="''" icon="TrendingUp" />
            </div>
          </div>

          <!-- Edit Profile Form -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-6">{{ t('profile.updateProfile') }}</h3>
            <form @submit.prevent="saveProfile" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BaseInput v-model="editForm.fullName" type="text" :label="t('profile.fullName')" />
                <BaseInput v-model="editForm.email" type="email" :label="t('profile.email')" disabled />
                <BaseInput v-model="editForm.phone" type="tel" :label="t('profile.phone')" />
                <BaseInput v-model="editForm.address" type="text" :label="t('profile.address')" />
                <BaseInput v-model="editForm.company" type="text" :label="t('profile.company')" />
                <BaseInput v-model="editForm.jobTitle" type="text" :label="t('profile.position')" />
              </div>
              <div class="flex justify-end gap-4">
                <BaseButton variant="secondary" type="button" @click="resetForm">
                  {{ t('common.cancel') }}
                </BaseButton>
                <BaseButton variant="primary" type="submit" :loading="isSaving">
                  {{ isSaving ? t('common.loading') : t('common.save') }}
                </BaseButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </template>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" :class="['fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-lg z-50 flex items-center gap-3', toast.type === 'success' ? 'bg-green-600 dark:bg-green-700 text-white' : 'bg-red-600 dark:bg-red-700 text-white']">
        <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5" />
        <AlertCircle v-else class="w-5 h-5" />
        {{ toast.message }}
      </div>
    </transition>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import MainLayout from '@/layouts/MainLayout.vue';
import StatCard from '@/components/common/StatCard.vue';
import { BaseBadge, BaseButton, BaseInput } from '@/components/base';
import profileService from '@/api/profileService';
import mycvsService from '@/api/mycvsService';
import imageService from '@/api/imageService';
import { CloudinaryUrl } from '@/utils/imageUrlUtils';
import { useAuth } from '@/composables/useAuth';
import { store, updateUser } from '@/store';
import { cookieStorage } from '@/api/axios';
import { Camera, Mail, Phone, MapPin, Building, Briefcase, Loader2, CheckCircle, AlertCircle } from 'lucide-vue-next';

const { t } = useI18n();
const { user, checkAuth, updateUserProfile, refreshUser } = useAuth();

const isLoading = ref(true);
const isSaving = ref(false);
const isUploadingAvatar = ref(false);
const avatarInput = ref<HTMLInputElement | null>(null);
const avatarPreview = ref<string | null>(null);

const stats = ref({ totalCVs: 0, analyzedCVs: 0, avgMatchScore: 0 });

const toast = reactive({ show: false, message: '', type: 'success' as 'success' | 'error' });

const userName = computed(() => editForm.fullName || user.value?.name || user.value?.username || user.value?.email || 'Guest');

const userEmail = computed(() => user.value?.email || editForm.email || '');

const userRoleText = computed(() => {
  const role = user.value?.role || '';
  const roleMap: Record<string, string> = { admin: 'Quản trị viên', recruiter: 'Nhà tuyển dụng', user: 'Người dùng' };
  return roleMap[role] || 'User';
});

const userInitials = computed(() => {
  const name = userName.value;
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
});

const userAvatar = computed(() => {
  const avatar = user.value?.avatar || null;
  if (!avatar) return null;
  if (CloudinaryUrl.isCloudinary(avatar)) return CloudinaryUrl.thumbnail(avatar, 256);
  return avatar;
});

const profileInfo = computed(() => [
  { label: t('profile.email'), value: userEmail.value, icon: Mail },
  { label: t('profile.phone'), value: editForm.phone || user.value?.phone || t('common.required'), icon: Phone },
  { label: t('profile.address'), value: editForm.address || user.value?.address || t('common.required'), icon: MapPin },
  { label: t('profile.company'), value: editForm.company || user.value?.company || t('common.required'), icon: Building },
  { label: t('profile.position'), value: editForm.jobTitle || user.value?.jobTitle || t('common.required'), icon: Briefcase },
]);

const editForm = reactive({ fullName: '', email: '', phone: '', address: '', company: '', jobTitle: '' });

const syncFormFromUser = () => {
  if (user.value) {
    editForm.fullName = user.value.name || (user.value as any).profile?.fullName || '';
    editForm.email = user.value.email || '';
    editForm.phone = (user.value as any).phone || (user.value as any).profile?.phone || '';
    editForm.address = (user.value as any).address || (user.value as any).profile?.address || '';
    editForm.company = (user.value as any).company || (user.value as any).profile?.company || '';
    editForm.jobTitle = (user.value as any).jobTitle || (user.value as any).profile?.jobTitle || '';
  }
};

const resetForm = () => syncFormFromUser();

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.message = t(message as any) || message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => { toast.show = false; }, 3000);
};

const saveProfile = async () => {
  isSaving.value = true;
  try {
    const result = await updateUserProfile({ fullName: editForm.fullName, phone: editForm.phone, address: editForm.address, company: editForm.company, jobTitle: editForm.jobTitle });
    if (result.success) { await refreshUser(); showToast('notifications.profileUpdated', 'success'); }
    else { showToast(result.message || 'notifications.error', 'error'); }
  } catch (error) { showToast('notifications.error', 'error'); }
  finally { isSaving.value = false; }
};

const triggerAvatarUpload = () => { avatarInput.value?.click(); };

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  if (!imageService.isValidAvatar(file)) { showToast('Avatar phải là file JPEG, PNG hoặc WebP và dung lượng không quá 5MB', 'error'); target.value = ''; return; }
  avatarPreview.value = await imageService.fileToDataUrl(file);
  isUploadingAvatar.value = true;
  try {
    const result = await profileService.uploadAvatar(file);
    if (result.avatarUrl) {
      const newUser = { ...user.value, avatar: result.avatarUrl };
      user.value = newUser;
      const currentUser = JSON.parse(cookieStorage.getItem('user') || '{}');
      currentUser.avatar = result.avatarUrl;
      cookieStorage.setItem('user', JSON.stringify(currentUser), 7);
      store.dispatch(updateUser({ avatar: result.avatarUrl }));
      await nextTick();
      avatarPreview.value = null;
      showToast('notifications.profileUpdated', 'success');
    }
  } catch (error: any) { avatarPreview.value = null; showToast(error.response?.data?.message || 'notifications.error', 'error'); }
  finally { isUploadingAvatar.value = false; target.value = ''; }
};

const fetchStats = async () => {
  if (!user.value?.id) return;
  try {
    const cvs = await mycvsService.getMyCVs();
    stats.value.totalCVs = cvs.length;
    stats.value.analyzedCVs = cvs.filter(c => c.status === 'SUCCESS').length;
    const scores = cvs.filter(c => (c as any).candidateProfile?.aiScore).map(c => (c as any).candidateProfile!.aiScore!);
    stats.value.avgMatchScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  } catch (error) { console.error('Failed to fetch stats:', error); }
};

onMounted(async () => { await checkAuth(); syncFormFromUser(); await fetchStats(); isLoading.value = false; });
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { transform: translateX(100%); opacity: 0; }
</style>
