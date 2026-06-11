<template>
  <AuthLayout mode="forgot">
    <div
      class="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xl dark:shadow-2xl/50 overflow-hidden text-center p-8 md:p-10 transition-colors duration-200">

      <div
        class="mx-auto w-14 h-14 bg-blue-100 dark:bg-blue-950/50 rounded-full flex items-center justify-center mb-6 transition-colors">
        <RotateCcw class="w-7 h-7 text-blue-600 dark:text-blue-400" />
      </div>

      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">Forgot Password?</h2>
      <p class="text-slate-500 dark:text-slate-400 mb-8 text-sm transition-colors">
        Enter your email address and we'll send<br />you an OTP to reset your password.
      </p>

      <form @submit.prevent="handleForgot" class="space-y-6 text-left">
        <div v-if="errorMessage"
          class="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 text-sm transition-colors">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage"
          class="p-3 bg-green-50 dark:bg-emerald-950/30 border border-green-200 dark:border-emerald-900/50 rounded-lg text-green-600 dark:text-emerald-400 text-sm transition-colors">
          {{ successMessage }}
        </div>

        <BaseInput v-model="email" type="email" :placeholder="t('auth.emailPlaceholder') || 'name@company.com'"
          :label="t('auth.email') || 'Email Address'">
          <template #prefix>
            <Mail class="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </template>
        </BaseInput>

        <BaseButton variant="primary" type="submit" :loading="isLoading" class="w-full shadow-sm shadow-blue-500/10">
          {{ isLoading ? 'Sending...' : 'Send OTP' }}
        </BaseButton>

        <div class="text-center mt-6">
          <router-link to="/login"
            class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
            <span>&larr;</span> Back to Sign In
          </router-link>
        </div>
      </form>
    </div>

    <div
      class="mt-16 opacity-40 dark:opacity-20 mix-blend-multiply dark:mix-blend-screen flex justify-center transition-opacity">
      <div class="relative w-32 h-32">
        <div
          class="absolute inset-0 bg-slate-300 dark:bg-slate-700 transform -skew-y-12 rotate-45 rounded-xl opacity-50 scale-75 transition-colors">
        </div>
        <div
          class="absolute inset-0 bg-slate-400 dark:bg-slate-600 transform -skew-y-12 rotate-45 rounded-xl opacity-60 translate-y-4 scale-90 transition-colors">
        </div>
        <div
          class="absolute inset-0 bg-slate-500 dark:bg-slate-500 transform -skew-y-12 rotate-45 rounded-xl opacity-70 translate-y-8 transition-colors">
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { RotateCcw, Mail } from 'lucide-vue-next'
import AuthLayout from '../../layouts/AuthLayout.vue'
import { authService } from '../../api/authService'
import { BaseInput, BaseButton } from '@/components/base'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()
const email = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleForgot = async () => {
  if (!email.value) {
    errorMessage.value = 'Please enter your email address.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await authService.forgotPassword({ email: email.value })

    if (response.success) {
      successMessage.value = 'OTP has been sent to your email. Please check your inbox.'
      setTimeout(() => {
        router.push('/reset-password')
      }, 2000)
    } else {
      errorMessage.value = response.message
    }
  } catch (error) {
    errorMessage.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>