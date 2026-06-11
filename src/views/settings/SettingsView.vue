<template>
  <MainLayout>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">{{ t('settings.title') }}</h1>
      <p class="text-gray-500 dark:text-slate-400">{{ t('settings.subtitle') || 'Manage your account and application settings' }}</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <Loader2 class="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      <span class="ml-3 text-gray-500 dark:text-slate-400">{{ t('settings.loadingSettings') || 'Loading settings...' }}</span>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Sidebar -->
        <div class="lg:col-span-3">
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-sm border border-gray-100 dark:border-slate-700 sticky top-6">
            <nav class="space-y-1">
              <button
                v-for="item in computedMenuItems"
                :key="item.id"
                @click="activeMenu = item.id"
                :class="[
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left',
                  activeMenu === item.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                ]"
              >
                <component :is="item.icon" class="w-5 h-5" />
                <span class="font-medium">{{ item.label }}</span>
              </button>
            </nav>
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-9">

          <!-- Account Settings -->
          <div v-if="activeMenu === 'account'" class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <h2 class="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">{{ t('settings.accountInfo') || 'Account Information' }}</h2>

            <div :class="['flex items-center gap-6 pb-6 mb-6 border-b', 'border-gray-100 dark:border-slate-700']">
              <div class="relative">
                <div class="w-24 h-24 rounded-2xl overflow-hidden">
                  <img v-if="currentAvatar" :src="currentAvatar" alt="Avatar" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                    {{ initials }}
                  </div>
                </div>
                <button @click="triggerAvatarUpload" class="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600">
                  <Camera class="w-4 h-4 text-gray-600 dark:text-slate-300" />
                </button>
                <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-slate-100">{{ profile.name }}</h3>
                <p class="text-gray-500 dark:text-slate-400">{{ profile.email }}</p>
                <button @click="triggerAvatarUpload" class="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">{{ t('settings.changeAvatar') || 'Change Avatar' }}</button>
              </div>
            </div>

            <form @submit.prevent="saveAccount" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BaseInput v-model="profile.name" type="text" :label="(t('profile.fullName') || 'Full Name')" />
                <BaseInput v-model="profile.email" type="email" :label="(t('profile.email') || 'Email')" disabled />
                <BaseInput v-model="profile.phone" type="tel" :label="(t('profile.phone') || 'Phone')" />
                <BaseInput v-model="profile.address" type="text" :label="(t('profile.address') || 'Address')" />
              </div>
              <div class="flex justify-end">
                <BaseButton type="submit" variant="primary" :loading="isSaving">
                  {{ isSaving ? (t('settings.saving') || 'Saving...') : (t('settings.saveChanges') || 'Save Changes') }}
                </BaseButton>
              </div>
            </form>
          </div>

          <!-- Notifications Settings -->
          <div v-if="activeMenu === 'notifications'" class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <h2 class="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">{{ t('settings.notificationsSettings') || 'Notification Settings' }}</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                    <Mail class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-slate-100">{{ t('settings.emailNotifications') || 'Email Notifications' }}</p>
                    <p class="text-sm text-gray-500 dark:text-slate-400">{{ t('settings.receiveEmailNotifications') || 'Receive notifications via email' }}</p>
                  </div>
                </div>
                <BaseToggle v-model="notifications.email" variant="checkbox" @update:model-value="saveNotifications" />
              </div>
              <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                    <CheckCircle class="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-slate-100">{{ t('settings.analysisComplete') || 'Analysis Complete' }}</p>
                    <p class="text-sm text-gray-500 dark:text-slate-400">{{ t('settings.notifyWhenCvAnalyzed') || 'Notify when CV is analyzed' }}</p>
                  </div>
                </div>
                <BaseToggle v-model="notifications.analysisComplete" variant="checkbox" @update:model-value="saveNotifications" />
              </div>
              <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                    <UserPlus class="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-slate-100">{{ t('settings.newCandidates') || 'New Candidates' }}</p>
                    <p class="text-sm text-gray-500 dark:text-slate-400">{{ t('settings.notifyNewCandidates') || 'Notify when there are matching new candidates' }}</p>
                  </div>
                </div>
                <BaseToggle v-model="notifications.newCandidate" variant="checkbox" @update:model-value="saveNotifications" />
              </div>
              <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center">
                    <Bell class="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-slate-100">{{ t('settings.reminders') || 'Reminders' }}</p>
                    <p class="text-sm text-gray-500 dark:text-slate-400">{{ t('settings.reminderDescription') || 'Reminder about scheduled work' }}</p>
                  </div>
                </div>
                <BaseToggle v-model="notifications.reminders" variant="checkbox" @update:model-value="saveNotifications" />
              </div>
            </div>
          </div>

          <!-- Privacy Settings -->
          <div v-if="activeMenu === 'privacy'" class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <h2 class="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">{{ t('settings.privacySettings') || 'Privacy Settings' }}</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                    <Search class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-slate-100">{{ t('settings.allowSearch') || 'Allow Search' }}</p>
                    <p class="text-sm text-gray-500 dark:text-slate-400">{{ t('settings.allowSearchDescription') || 'Allow others to find your profile' }}</p>
                  </div>
                </div>
                <BaseToggle v-model="privacy.allowSearch" variant="checkbox" @update:model-value="savePrivacy" />
              </div>
              <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                    <Globe class="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-slate-100">{{ t('settings.publicCv') || 'Public CV' }}</p>
                    <p class="text-sm text-gray-500 dark:text-slate-400">{{ t('settings.publicCvDescription') || 'Allow viewing of your CV' }}</p>
                  </div>
                </div>
                <BaseToggle v-model="privacy.publicCV" variant="checkbox" @update:model-value="savePrivacy" />
              </div>
              <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                    <Eye class="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-slate-100">{{ t('settings.showEmail') || 'Show Email' }}</p>
                    <p class="text-sm text-gray-500 dark:text-slate-400">{{ t('settings.showEmailDescription') || 'Allow showing email on profile' }}</p>
                  </div>
                </div>
                <BaseToggle v-model="privacy.showEmail" variant="checkbox" @update:model-value="savePrivacy" />
              </div>
            </div>
          </div>

          <!-- Appearance Settings -->
          <div v-if="activeMenu === 'appearance'" class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <h2 class="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">{{ t('settings.appearance') || 'Appearance' }}</h2>
            <div class="space-y-6">
              <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div>
                  <p class="font-medium text-gray-900 dark:text-slate-100">{{ t('settings.language') || 'Language' }}</p>
                  <p class="text-sm text-gray-500 dark:text-slate-400">{{ t('settings.chooseLanguage') || 'Choose display language' }}</p>
                </div>
                <select v-model="appearance.language" @change="saveAppearance" class="px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200">
                  <option value="vi">{{ t('settings.vietnamese') || 'Tiếng Việt' }}</option>
                  <option value="en">{{ t('settings.english') || 'English' }}</option>
                </select>
              </div>
              <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div>
                  <p class="font-medium text-gray-900 dark:text-slate-100">{{ t('settings.themeMode') || 'Theme Mode' }}</p>
                  <p class="text-sm text-gray-500 dark:text-slate-400">{{ t('settings.chooseTheme') || 'Choose display mode' }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <Sun class="w-4 h-4 text-gray-500 dark:text-slate-400" />
                  <BaseToggle :model-value="theme === 'dark'" variant="button" :active-icon="Moon" :inactive-icon="Sun" @update:model-value="toggleThemeMode" />
                  <Moon class="w-4 h-4 text-gray-500 dark:text-slate-400" />
                </div>
              </div>
              <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div>
                  <p class="font-medium text-gray-900 dark:text-slate-100">{{ t('settings.compactMode') || 'Compact Mode' }}</p>
                  <p class="text-sm text-gray-500 dark:text-slate-400">{{ t('settings.compactModeDescription') || 'Display more content on screen' }}</p>
                </div>
                <BaseToggle v-model="appearance.compactMode" variant="checkbox" @update:model-value="saveAppearance" />
              </div>
            </div>
          </div>

          <!-- Security Settings -->
          <div v-if="activeMenu === 'security'" class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <h2 class="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">{{ t('settings.security') || 'Security' }}</h2>
            <div class="space-y-6">
              <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center">
                    <Lock class="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-slate-100">{{ t('settings.changePassword') || 'Change Password' }}</p>
                    <p class="text-sm text-gray-500 dark:text-slate-400">{{ t('settings.changePasswordDescription') || 'Update password to protect your account' }}</p>
                  </div>
                </div>
                <BaseButton variant="secondary" size="sm" @click="openPasswordModal">
                  {{ t('settings.changePassword') || 'Change Password' }}
                </BaseButton>
              </div>
              <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                    <Smartphone class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-slate-100">{{ t('settings.twoFactorAuth') || 'Two-Factor Authentication' }}</p>
                    <p class="text-sm text-gray-500 dark:text-slate-400">{{ t('settings.twoFactorDescription') || 'Add extra security layer for your account' }}</p>
                  </div>
                </div>
                <BaseToggle v-model="security.twoFactor" variant="checkbox" @update:model-value="saveSecurity" />
              </div>
              <div class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle class="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p class="font-medium text-amber-900 dark:text-amber-200">{{ t('settings.deleteAccount') || 'Delete Account' }}</p>
                    <p class="text-sm text-amber-700 dark:text-amber-300 mb-3">{{ t('settings.deleteAccountWarning') || 'Permanently delete account and all related data. This action cannot be undone.' }}</p>
                    <BaseButton variant="danger" size="sm" @click="confirmDeleteAccount">
                      {{ t('settings.deleteAccount') || 'Delete Account' }}
                    </BaseButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Data Settings -->
          <div v-if="activeMenu === 'data'" class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <h2 class="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">{{ t('settings.dataManagement') || 'Data & Export/Import' }}</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                    <Download class="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-slate-100">{{ t('settings.exportData') || 'Export Data' }}</p>
                    <p class="text-sm text-gray-500 dark:text-slate-400">{{ t('settings.exportDataDescription') || 'Download all your data' }}</p>
                  </div>
                </div>
                <BaseButton variant="secondary" size="sm" :loading="isExporting" @click="exportData">
                  <Download class="w-4 h-4" />
                  {{ t('settings.exportData') || 'Export Data' }}
                </BaseButton>
              </div>
              <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                    <Upload class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-slate-100">{{ t('settings.importData') || 'Import Data' }}</p>
                    <p class="text-sm text-gray-500 dark:text-slate-400">{{ t('settings.importDataDescription') || 'Upload data from file' }}</p>
                  </div>
                </div>
                <BaseButton variant="secondary" size="sm" @click="triggerImportUpload">
                  {{ t('settings.importData') || 'Import Data' }}
                </BaseButton>
                <input ref="importInput" type="file" accept=".json,.csv" class="hidden" @change="handleImport" />
              </div>
              <div class="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center">
                    <Trash2 class="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p class="font-medium text-red-900 dark:text-red-200">{{ t('settings.deleteAllData') || 'Delete All Data' }}</p>
                    <p class="text-sm text-red-700 dark:text-red-300">{{ t('settings.deleteAllDataDescription') || 'Permanently delete all CVs and analysis results' }}</p>
                  </div>
                </div>
                <BaseButton variant="danger" size="sm" @click="confirmDeleteAllData">
                  {{ t('settings.deleteData') || 'Delete Data' }}
                </BaseButton>
              </div>
            </div>
          </div>

        </div>
      </div>
    </template>

    <!-- Change Password Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-slate-100">{{ t('settings.changePassword') || 'Change Password' }}</h3>
          <button @click="closePasswordModal" class="text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200">
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Mode Selection -->
        <div v-if="passwordMode === 'select'" class="space-y-4">
          <p class="text-gray-600 dark:text-slate-400 mb-4">{{ t('settings.selectPasswordMethod') || 'Select password change method:' }}</p>
          <button @click="passwordMode = 'withOld'" class="w-full p-4 border border-gray-200 dark:border-slate-600 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/70 transition-colors">
                <KeyRound class="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p class="font-semibold text-gray-900 dark:text-slate-100">{{ t('settings.enterOldPassword') || 'Enter Old Password' }}</p>
                <p class="text-sm text-gray-500 dark:text-slate-400">{{ t('settings.confirmWithCurrentPassword') || 'Confirm with current password' }}</p>
              </div>
            </div>
          </button>
          <button @click="passwordMode = 'forgot'" class="w-full p-4 border border-gray-200 dark:border-slate-600 rounded-xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/70 transition-colors">
                <Mail class="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p class="font-semibold text-gray-900 dark:text-slate-100">{{ t('settings.forgotPassword') || 'Forgot Password' }}</p>
                <p class="text-sm text-gray-500 dark:text-slate-400">{{ t('settings.sendOtpViaEmail') || 'Send OTP code via email' }}</p>
              </div>
            </div>
          </button>
        </div>

        <!-- With Old Password Form -->
        <form v-else-if="passwordMode === 'withOld'" @submit.prevent="changePasswordWithOld" class="space-y-4">
          <div>
            <BaseInput v-model="passwordForm.currentPassword" type="password" :label="(t('settings.currentPassword') || 'Current Password')" required />
          </div>
          <div>
            <BaseInput v-model="passwordForm.newPassword" type="password" :label="(t('settings.newPassword') || 'New Password')" required />
            <div v-if="passwordForm.newPassword" class="mt-2">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-gray-500 dark:text-slate-400">{{ t('settings.strength') || 'Strength' }}:</span>
                <span :class="{
                  'text-red-600 dark:text-red-400': passwordStrength.label === 'Yếu',
                  'text-yellow-600 dark:text-yellow-400': passwordStrength.label === 'Trung bình',
                  'text-green-600 dark:text-green-400': passwordStrength.label === 'Mạnh'
                }" class="text-xs font-medium">{{ passwordStrength.label }}</span>
              </div>
              <div class="h-1.5 w-full bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                <div :class="passwordStrength.color" class="h-full rounded-full transition-all" :style="{ width: passwordStrength.level + '%' }"></div>
              </div>
            </div>
          </div>
          <div>
            <BaseInput v-model="passwordForm.confirmPassword" type="password" :label="(t('settings.confirmNewPassword') || 'Confirm New Password')" required />
          </div>
          <div class="flex gap-3 pt-4">
            <BaseButton variant="secondary" type="button" class="flex-1" @click="passwordMode = 'select'">
              Quay lại
            </BaseButton>
            <BaseButton variant="primary" type="submit" class="flex-1" :loading="isChangingPassword">
              {{ isChangingPassword ? (t('settings.processing') || 'Processing...') : (t('settings.changePassword') || 'Change Password') }}
            </BaseButton>
          </div>
        </form>

        <!-- Forgot Password (OTP) Form -->
        <form v-else-if="passwordMode === 'forgot'" @submit.prevent="handleSendOtp" class="space-y-4">
          <div v-if="otpStep === 'email'">
            <BaseInput v-model="forgotForm.email" type="email" label="Email xác thực" placeholder="Nhập email của bạn" required />
            <p class="text-xs text-gray-500 dark:text-slate-400 mt-2">{{ t('settings.otpWillBeSent') || 'OTP code will be sent to your email' }}</p>
          </div>
          <div v-else-if="otpStep === 'otp'">
            <p class="text-sm text-gray-600 dark:text-slate-400 mb-4">{{ t('settings.otpSentTo') || 'OTP code has been sent to:' }} <strong>{{ forgotForm.email }}</strong></p>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{{ t('settings.enterOtp') || 'Enter OTP' }}</label>
              <div class="flex gap-2">
                <input v-for="(_, index) in 6" :key="index" v-model="forgotForm.otpDigits[index]"
                  type="text" maxlength="1"
                  class="w-12 h-12 text-center text-xl font-bold border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                />
              </div>
              <div class="flex justify-between items-center mt-3">
                <p v-if="otpError" class="text-xs text-red-500 dark:text-red-400">{{ otpError }}</p>
                <p v-else class="text-xs text-gray-500 dark:text-slate-400">Không nhận được mã?</p>
                <button type="button" @click="resendOtp" :disabled="resendCooldown > 0" class="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium disabled:text-gray-400 dark:disabled:text-slate-600">
                  {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : (t('settings.resendCode') || 'Resend code') }}
                </button>
              </div>
            </div>
            <BaseInput v-model="forgotForm.newPassword" type="password" :label="(t('settings.newPassword') || 'New Password')" required />
            <div class="mt-4">
              <BaseInput v-model="forgotForm.confirmPassword" type="password" :label="(t('settings.confirmNewPassword') || 'Confirm New Password')" required />
            </div>
          </div>
          <div v-else-if="otpStep === 'success'" class="text-center py-4">
            <div class="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle class="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">{{ t('settings.passwordChanged') || 'Password Changed Successfully!' }}</h4>
            <p class="text-gray-500 dark:text-slate-400 mb-4">{{ t('settings.loginWithNewPassword') || 'You can login with your new password' }}</p>
            <BaseButton variant="primary" class="w-full" @click="goToLogin">
              Đăng nhập ngay
            </BaseButton>
          </div>
          <div v-if="otpStep !== 'success'" class="flex gap-3 pt-4">
            <BaseButton v-if="otpStep === 'otp'" variant="secondary" type="button" class="flex-1" @click="otpStep = 'email'; forgotForm.otpDigits = ['', '', '', '', '', '']; otpError = ''">
              Quay lại
            </BaseButton>
            <BaseButton
              :variant="otpStep === 'email' ? 'primary' : 'primary'"
              type="submit"
              class="flex-1"
              :loading="isChangingPassword"
            >
              {{ otpStep === 'email' ? (t('settings.sendOtp') || 'Send OTP') : (isChangingPassword ? (t('settings.processing') || 'Processing...') : (t('common.confirm') || 'Confirm')) }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast Notification -->
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
import { ref, computed, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import MainLayout from '@/layouts/MainLayout.vue';
import profileService from '@/api/profileService';
import settingsService from '@/api/settingsService';
import { store, updateUser } from '@/store';
import { cookieStorage } from '@/api/axios';
import { CloudinaryUrl } from '@/utils/imageUrlUtils';
import { useAuth } from '@/composables/useAuth';
import { useLanguage } from '@/composables/useLanguage';
import { useTheme } from '@/composables/useTheme';
import { BaseToggle, BaseInput, BaseButton } from '@/components/base';
import {
  User, Bell, Shield, Palette, Lock, Database, Camera, Mail, CheckCircle,
  UserPlus, Search, Globe, Eye, Sun, Moon, Smartphone, AlertTriangle,
  Download, Upload, Trash2, X, Loader2, AlertCircle, KeyRound
} from 'lucide-vue-next';

const { t } = useI18n();
const { user, checkAuth, refreshUser } = useAuth();
const { language, setLanguage } = useLanguage();
const { theme, setTheme } = useTheme();

const isLoading = ref(true);
const isSaving = ref(false);
const isChangingPassword = ref(false);
const isExporting = ref(false);
const showPasswordModal = ref(false);
const avatarInput = ref<HTMLInputElement | null>(null);
const importInput = ref<HTMLInputElement | null>(null);

const passwordMode = ref<'select' | 'withOld' | 'forgot'>('select');
const otpStep = ref<'email' | 'otp' | 'success'>('email');
const resendCooldown = ref(0);
const otpError = ref('');

const activeMenu = ref('account');
const toast = reactive({ show: false, message: '', type: 'success' as 'success' | 'error' });

const passwordForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' });
const forgotForm = reactive({ email: '', otpDigits: ['', '', '', '', '', ''] as string[], newPassword: '', confirmPassword: '' });


const passwordStrength = computed(() => {
  const pwd = passwordForm.newPassword || forgotForm.newPassword;
  if (!pwd) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 2) return { level: 33, label: 'Yếu', color: 'bg-red-500' };
  if (score <= 4) return { level: 66, label: 'Trung bình', color: 'bg-yellow-500' };
  return { level: 100, label: 'Mạnh', color: 'bg-green-500' };
});

const computedMenuItems = computed(() => [
  { id: 'account', label: t('settings.account') || 'Account', icon: User },
  { id: 'notifications', label: t('settings.notifications'), icon: Bell },
  { id: 'privacy', label: t('settings.privacy') || 'Privacy', icon: Shield },
  { id: 'appearance', label: t('settings.appearance'), icon: Palette },
  { id: 'security', label: t('settings.security'), icon: Lock },
  { id: 'data', label: t('settings.data') || 'Data', icon: Database },
]);

const profile = ref({ name: '', email: '', phone: '', address: '' });
const initials = computed(() => profile.value.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U');

const currentAvatar = computed(() => {
  const avatar = user.value?.avatar || null;
  if (!avatar) return null;
  if (CloudinaryUrl.isCloudinary(avatar)) return CloudinaryUrl.thumbnail(avatar, 192);
  return avatar;
});

const notifications = ref({ email: true, analysisComplete: true, newCandidate: false, reminders: true, push: false });
const privacy = ref({ allowSearch: true, publicCV: false, showEmail: true });
const appearance = ref({ language: language.value, theme: theme.value as 'light' | 'dark', compactMode: false });
const security = ref({ twoFactor: false });

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => { toast.show = false; }, 3000);
};

const loadSettings = async () => {
  try {
    const userProfile = await profileService.getProfile();
    profile.value = { name: userProfile.profile?.fullName || user.value?.name || '', email: userProfile.email || '', phone: userProfile.profile?.phone || '', address: userProfile.profile?.address || '' };
    if (userProfile.preferences) {
      const savedTheme = (userProfile.preferences.theme as 'light' | 'dark') || 'light';
      appearance.value = { language: (userProfile.preferences.language || language.value) as 'en' | 'vi', theme: savedTheme, compactMode: false };
      setTheme(savedTheme);
    }
  } catch (error) { console.error('Failed to load settings:', error); }
};

const saveAccount = async () => {
  if (!user.value?.id) return;
  isSaving.value = true;
  try {
    await profileService.updateProfile(user.value.id, { fullName: profile.value.name, phone: profile.value.phone, address: profile.value.address });
    await refreshUser();
    showToast(t('settings.accountUpdated') || 'Cập nhật tài khoản thành công!');
  } catch (error) { showToast(t('settings.updateFailed') || 'Cập nhật thất bại', 'error'); }
  finally { isSaving.value = false; }
};

const saveNotifications = async () => { if (!user.value?.id) return; try { await settingsService.updateNotificationSettings(user.value.id, notifications.value); showToast(t('settings.notificationsUpdated') || 'Cập nhật thông báo thành công!'); } catch (error) { showToast(t('settings.updateFailed') || 'Cập nhật thất bại', 'error'); } };
const savePrivacy = async () => { if (!user.value?.id) return; try { await settingsService.updatePrivacySettings(user.value.id, privacy.value); showToast(t('settings.privacyUpdated') || 'Cập nhật quyền riêng tư thành công!'); } catch (error) { showToast(t('settings.updateFailed') || 'Cập nhật thất bại', 'error'); } };
const saveAppearance = async () => { if (!user.value?.id) return; try { setLanguage(appearance.value.language as 'en' | 'vi'); setTheme(appearance.value.theme); await settingsService.updateAppearanceSettings(user.value.id, appearance.value); showToast(t('settings.appearanceUpdated') || 'Cập nhật giao diện thành công!'); } catch (error) { showToast(t('settings.updateFailed') || 'Cập nhật thất bại', 'error'); } };
const saveSecurity = async () => { if (!user.value?.id) return; try { if (security.value.twoFactor) { await settingsService.enableTwoFactor(); } else { await settingsService.disableTwoFactor(); } showToast(t('settings.securityUpdated') || 'Cập nhật bảo mật thành công!'); } catch (error) { showToast(t('settings.updateFailed') || 'Cập nhật thất bại', 'error'); } };
const toggleThemeMode = () => { setTheme(theme.value === 'light' ? 'dark' : 'light'); };

const changePasswordWithOld = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) { showToast(`${t('settings.newPassword') || 'New Password'} ${t('settings.notMatch') || 'không khớp'}`, 'error'); return; }
  if (passwordForm.newPassword.length < 8) { showToast(t('settings.passwordMinLength') || 'Mật khẩu phải có ít nhất 8 ký tự', 'error'); return; }
  isChangingPassword.value = true;
  try {
    const response = await settingsService.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword, confirmPassword: passwordForm.confirmPassword });
    if (response.success) { closePasswordModal(); showToast(t('settings.passwordChangeSuccess') || 'Đổi mật khẩu thành công!'); }
    else { showToast(response.message || (t('settings.passwordChangeFailed') || 'Đổi mật khẩu thất bại'), 'error'); }
  } catch (error: any) { showToast(error.response?.data?.message || (t('settings.currentPasswordIncorrect') || 'Mật khẩu hiện tại không đúng'), 'error'); }
  finally { isChangingPassword.value = false; }
};

const sendOtp = async () => {
  if (!forgotForm.email) { showToast(t('settings.enterEmail') || 'Vui lòng nhập email', 'error'); return; }
  isChangingPassword.value = true;
  try {
    const response = await settingsService.sendResetPasswordOtp(forgotForm.email);
    if (response.success) { otpStep.value = 'otp'; startResendCooldown(); }
    else { showToast(response.message || (t('settings.otpSendFailed') || 'Gửi OTP thất bại'), 'error'); }
  } catch (error: any) { showToast(error.response?.data?.message || (t('settings.otpSendFailed') || 'Gửi OTP thất bại'), 'error'); }
  finally { isChangingPassword.value = false; }
};

const startResendCooldown = () => { resendCooldown.value = 60; const interval = setInterval(() => { resendCooldown.value--; if (resendCooldown.value <= 0) clearInterval(interval); }, 1000); };
const resendOtp = async () => { if (resendCooldown.value > 0) return; await sendOtp(); };
const handleSendOtp = async () => { if (otpStep.value === 'email') { await sendOtp(); } else if (otpStep.value === 'otp') { await confirmResetPassword(); } };
const confirmResetPassword = async () => {
  const otp = forgotForm.otpDigits.join('');
  if (otp.length !== 6) { otpError.value = t('settings.enter6Digits') || 'Vui lòng nhập đủ 6 chữ số'; return; }
  if (!forgotForm.newPassword) { showToast(t('settings.enterNewPassword') || 'Vui lòng nhập mật khẩu mới', 'error'); return; }
  if (forgotForm.newPassword !== forgotForm.confirmPassword) { showToast(`${t('settings.newPassword') || 'New Password'} ${t('settings.notMatch') || 'không khớp'}`, 'error'); return; }
  if (forgotForm.newPassword.length < 8) { showToast(t('settings.passwordMinLength') || 'Mật khẩu phải có ít nhất 8 ký tự', 'error'); return; }
  isChangingPassword.value = true;
  try {
    const response = await settingsService.resetPasswordWithOtp({ email: forgotForm.email, otp, newPassword: forgotForm.newPassword, confirmPassword: forgotForm.confirmPassword });
    if (response.success) { otpStep.value = 'success'; }
    else { otpError.value = response.message || (t('settings.otpInvalid') || 'Mã OTP không hợp lệ'); }
  } catch (err: any) { otpError.value = err.response?.data?.message || (t('settings.otpVerificationFailed') || 'Xác thực OTP thất bại'); }
  finally { isChangingPassword.value = false; }
};

const openPasswordModal = () => { showPasswordModal.value = true; passwordMode.value = 'select'; otpStep.value = 'email'; resetPasswordForms(); };
const closePasswordModal = () => { showPasswordModal.value = false; resetPasswordForms(); };
const resetPasswordForms = () => { passwordMode.value = 'select'; otpStep.value = 'email'; passwordForm.currentPassword = ''; passwordForm.newPassword = ''; passwordForm.confirmPassword = ''; forgotForm.email = ''; forgotForm.otpDigits = ['', '', '', '', '', '']; forgotForm.newPassword = ''; forgotForm.confirmPassword = ''; otpError.value = ''; resendCooldown.value = 0; };
const goToLogin = () => { closePasswordModal(); window.location.href = '/login'; };

const exportData = async () => { isExporting.value = true; try { const blob = await settingsService.exportData({ format: 'JSON', includeCVs: true, includeProfiles: true, includeAnalysis: true }); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `cvreview-export-${new Date().toISOString().split('T')[0]}.json`; document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a); showToast(t('settings.exportSuccess') || 'Xuất dữ liệu thành công!'); } catch (error) { showToast(t('settings.exportFailed') || 'Xuất dữ liệu thất bại', 'error'); } finally { isExporting.value = false; } };
const triggerImportUpload = () => { importInput.value?.click(); };
const handleImport = async (event: Event) => { const target = event.target as HTMLInputElement; const file = target.files?.[0]; if (!file) return; try { const result = await settingsService.importData(file); showToast(`${t('settings.importSuccess') || 'Nhập thành công'} ${result.imported} ${t('settings.records') || 'bản ghi'}!`); } catch (error) { showToast(t('settings.importFailed') || 'Nhập dữ liệu thất bại', 'error'); } target.value = ''; };

const confirmDeleteAccount = () => { if (confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) { if (confirm('Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn. Tiếp tục?')) { deleteAccount(); } } };
const deleteAccount = async () => { if (!user.value?.id) return; try { await settingsService.deleteAccount(user.value.id); window.location.href = '/login'; } catch (error) { showToast(t('settings.deleteAccountFailed') || 'Xóa tài khoản thất bại', 'error'); } };
const confirmDeleteAllData = () => { if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác.')) { if (confirm('Tất cả CV và kết quả phân tích sẽ bị xóa vĩnh viễn. Tiếp tục?')) { deleteAllData(); } } };
const deleteAllData = async () => { try { await settingsService.deleteAllData(); showToast(t('settings.dataDeleted') || 'Xóa dữ liệu thành công!'); window.location.reload(); } catch (error) { showToast(t('settings.dataDeleteFailed') || 'Xóa dữ liệu thất bại', 'error'); } };
const triggerAvatarUpload = () => { avatarInput.value?.click(); };
const handleAvatarUpload = async (event: Event) => { const target = event.target as HTMLInputElement; const file = target.files?.[0]; if (!file) return; try { const result = await profileService.uploadAvatar(file); if (result.avatarUrl) { const newUser = { ...user.value, avatar: result.avatarUrl }; user.value = newUser; const currentUserData = JSON.parse(cookieStorage.getItem('user') || '{}'); currentUserData.avatar = result.avatarUrl; cookieStorage.setItem('user', JSON.stringify(currentUserData), 7); store.dispatch(updateUser({ avatar: result.avatarUrl })); showToast(t('settings.avatarUpdated') || 'Cập nhật ảnh đại diện thành công!'); } } catch (error) { showToast(t('settings.avatarUploadFailed') || 'Tải lên ảnh thất bại', 'error'); } finally { target.value = ''; } };

onMounted(async () => { await checkAuth(); await loadSettings(); isLoading.value = false; });
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { transform: translateX(100%); opacity: 0; }
</style>
