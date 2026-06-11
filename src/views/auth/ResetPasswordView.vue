<template>
  <AuthLayout mode="reset">
    <div class="flex flex-col items-center w-full max-w-md">
      <div
        class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xl dark:shadow-2xl/50 overflow-hidden text-center p-8 md:p-10 z-10 transition-colors duration-200">

        <div
          class="mx-auto w-14 h-14 bg-blue-100 dark:bg-blue-950/50 rounded-full flex items-center justify-center mb-6 transition-colors">
          <ShieldCheck class="w-7 h-7 text-blue-600 dark:text-blue-400" />
        </div>

        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">Reset Password</h2>
        <p class="text-slate-500 dark:text-slate-400 mb-8 text-sm transition-colors">
          Enter the OTP from your email and create a new password.
        </p>

        <form @submit.prevent="handleReset" class="space-y-5 text-left">
          <div v-if="errorMessage"
            class="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 text-sm transition-colors">
            {{ errorMessage }}
          </div>

          <BaseInput v-model="otp" type="text" :label="t('auth.otpCode') || 'OTP Code'" placeholder="Enter 6-digit OTP"
            maxlength="6" />

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors">New
              Password</label>
            <BaseInput v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••">
              <template #suffix>
                <button type="button" @click="showPassword = !showPassword"
                  class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <Eye v-if="showPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </template>
            </BaseInput>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors">Confirm New
              Password</label>
            <BaseInput v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="••••••••">
              <template #suffix>
                <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                  class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <Eye v-if="showConfirmPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </template>
            </BaseInput>
          </div>

          <div
            class="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl mt-6 border border-transparent dark:border-slate-700/40 transition-colors">
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors">Password
                Strength</span>
              <span :class="{
                'text-red-600 dark:text-red-400': passwordStrength.label === 'Weak',
                'text-yellow-600 dark:text-yellow-400': passwordStrength.label === 'Fair',
                'text-blue-600 dark:text-blue-400': passwordStrength.label === 'Good',
                'text-emerald-600 dark:text-emerald-400': passwordStrength.label === 'Strong'
              }" class="text-xs font-bold transition-colors">{{ passwordStrength.label }}</span>
            </div>

            <div class="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
              <div :class="passwordStrength.color" class="h-full rounded-full transition-all duration-300"
                :style="{ width: passwordStrength.level + '%' }"></div>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs">
              <div
                :class="passwordStrength.requirements.length ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'"
                class="flex items-center transition-colors">
                <CheckCircle2 v-if="passwordStrength.requirements.length" class="w-3.5 h-3.5 mr-1.5" />
                <Circle v-else class="w-3.5 h-3.5 mr-1.5" />
                <span>At least 8 characters</span>
              </div>
              <div
                :class="passwordStrength.requirements.special ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'"
                class="flex items-center transition-colors">
                <CheckCircle2 v-if="passwordStrength.requirements.special" class="w-3.5 h-3.5 mr-1.5" />
                <Circle v-else class="w-3.5 h-3.5 mr-1.5" />
                <span>One special character</span>
              </div>
              <div
                :class="passwordStrength.requirements.uppercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'"
                class="flex items-center transition-colors">
                <CheckCircle2 v-if="passwordStrength.requirements.uppercase" class="w-3.5 h-3.5 mr-1.5" />
                <Circle v-else class="w-3.5 h-3.5 mr-1.5" />
                <span>One uppercase letter</span>
              </div>
              <div
                :class="passwordStrength.requirements.number ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'"
                class="flex items-center transition-colors">
                <CheckCircle2 v-if="passwordStrength.requirements.number" class="w-3.5 h-3.5 mr-1.5" />
                <Circle v-else class="w-3.5 h-3.5 mr-1.5" />
                <span>One number</span>
              </div>
            </div>
          </div>

          <BaseButton variant="primary" type="submit" :loading="isLoading"
            class="w-full mt-2 shadow-sm shadow-blue-500/10">
            {{ isLoading ? 'Resetting...' : 'Reset Password' }}
          </BaseButton>

          <div class="mt-6 flex justify-center border-t border-slate-100 dark:border-slate-700/60 pt-6">
            <div class="flex items-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
              <Shield class="w-4 h-4 mr-1.5 text-slate-400 dark:text-slate-500" />
              Secured by enterprise-grade encryption
            </div>
          </div>
        </form>
      </div>

      <div
        class="mt-8 rounded-xl overflow-hidden shadow-lg border border-transparent dark:border-slate-700/50 relative w-full h-32 flex items-center justify-center">
        <div class="absolute inset-0 bg-slate-950/50 dark:bg-slate-950/70 mix-blend-multiply z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          alt="Cyber Security" class="w-full h-full object-cover absolute inset-0 brightness-100 dark:brightness-75" />
        <div
          class="relative z-20 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-6 py-2 rounded-full font-semibold text-blue-900 dark:text-blue-300 text-sm border border-transparent dark:border-slate-700/40 transition-colors">
          Your data privacy is our highest priority
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, CheckCircle2, Circle, Shield, ShieldCheck } from 'lucide-vue-next'
import AuthLayout from '../../layouts/AuthLayout.vue'
import { authService } from '../../api/authService'
import { BaseInput, BaseButton } from '@/components/base'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()
const otp = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const passwordStrength = computed(() => {
  const pwd = password.value
  if (pwd.length === 0) return { level: 0, label: '', color: '', requirements: { length: false, special: false, uppercase: false, number: false } }

  const requirements = {
    length: pwd.length >= 8,
    special: /[^A-Za-z0-9]/.test(pwd),
    uppercase: /[A-Z]/.test(pwd),
    number: /[0-9]/.test(pwd)
  }

  let score = 0
  if (requirements.length) score++
  if (requirements.special) score++
  if (requirements.uppercase) score++
  if (requirements.number) score++

  let level = 0
  let label = ''
  let color = ''

  if (score <= 1) { level = 25; label = 'Weak'; color = 'bg-red-500' }
  else if (score <= 2) { level = 50; label = 'Fair'; color = 'bg-yellow-500' }
  else if (score <= 3) { level = 75; label = 'Good'; color = 'bg-blue-500' }
  else { level = 100; label = 'Strong'; color = 'bg-emerald-500' }

  return { level, label, color, requirements }
})

const handleReset = async () => {
  errorMessage.value = ''

  if (!otp.value || otp.value.length !== 6) {
    errorMessage.value = 'Please enter the 6-digit OTP from your email.'
    return
  }

  if (!password.value || !confirmPassword.value) {
    errorMessage.value = 'Please fill in all fields.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  if (password.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters long.'
    return
  }

  isLoading.value = true

  try {
    const email = authService.getStoredEmail()
    if (!email) {
      errorMessage.value = 'Session expired. Please request a new OTP.'
      setTimeout(() => router.push('/forgot-password'), 2000)
      return
    }

    const response = await authService.resetPassword({
      email,
      otp: otp.value,
      newPassword: password.value,
      confirmPassword: confirmPassword.value
    })

    if (response.success) {
      localStorage.removeItem('passwordResetEmail')
      localStorage.removeItem('isPasswordReset')
      router.push('/login')
    } else {
      errorMessage.value = response.message
    }
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'An unexpected error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>