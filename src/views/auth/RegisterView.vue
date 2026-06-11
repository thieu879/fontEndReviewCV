<template>
  <AuthLayout mode="register">
    <div
      class="w-full max-w-6xl mx-auto flex flex-col-reverse lg:flex-row bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl shadow-xl overflow-hidden min-h-[600px] transition-colors duration-200">

      <div
        class="hidden lg:flex lg:w-1/2 p-8 relative flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 border-r border-slate-100 dark:border-slate-700/50 transition-colors duration-200">
        <div class="w-full max-w-md relative">
          <div
            class="rounded-xl overflow-hidden shadow-2xl relative border border-transparent dark:border-slate-700/50">
            <div class="absolute inset-0 bg-blue-900/40 mix-blend-multiply z-10"></div>
            <div
              class="absolute inset-0 bg-gradient-to-t from-slate-950 via-blue-900/40 to-transparent dark:from-slate-950 dark:via-slate-900/60 z-20">
            </div>
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Professional" class="w-full object-cover brightness-100 dark:brightness-90" />

            <div class="absolute bottom-0 left-0 right-0 p-6 z-30">
              <h3 class="text-white text-2xl font-bold mb-2">Precision in Talent Acquisition</h3>
              <p class="text-blue-100 dark:text-slate-300 text-sm">
                Join thousands of HR professionals using AI to identify top-tier talent with mathematical certainty.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4 mt-6">
            <div
              class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700/80 transition-colors">
              <div class="text-blue-600 dark:text-blue-400 mb-2">
                <BarChart3 class="w-5 h-5" />
              </div>
              <p class="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Accuracy
              </p>
              <p class="text-slate-900 dark:text-white font-bold text-lg">99.4%</p>
            </div>

            <div
              class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700/80 transition-colors">
              <div class="text-blue-600 dark:text-blue-400 mb-2">
                <Zap class="w-5 h-5" />
              </div>
              <p class="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                Processing</p>
              <p class="text-slate-900 dark:text-white font-bold text-lg">&lt; 2s</p>
            </div>

            <div
              class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700/80 transition-colors">
              <div class="text-blue-600 dark:text-blue-400 mb-2">
                <ShieldCheck class="w-5 h-5" />
              </div>
              <p class="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                Compliance</p>
              <p class="text-slate-900 dark:text-white font-bold text-lg">GDPR</p>
            </div>
          </div>
        </div>
      </div>

      <div
        class="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-slate-800 transition-colors duration-200">
        <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">Create Account</h2>


        <form @submit.prevent="handleRegister" class="space-y-4">
          <div v-if="errorMessage"
            class="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 text-sm transition-colors">
            {{ errorMessage }}
          </div>

          <BaseInput v-model="fullName" type="text" :label="t('auth.fullName') || 'Full Name'"
            placeholder="Enter your full name" />

          <BaseInput v-model="email" type="email" :label="t('auth.email') || 'Email Address'"
            placeholder="name@company.com" />

          <BaseInput v-model="username" type="text" :label="t('auth.username') || 'Username'" placeholder="jdoe_hr" />

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors">Password</label>
            <BaseInput v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••">
              <template #suffix>
                <button type="button" @click="showPassword = !showPassword"
                  class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <Eye v-if="showPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </template>
            </BaseInput>

            <div class="mt-2 flex items-center justify-between text-xs">
              <span class="text-slate-500 dark:text-slate-400 transition-colors">Password Strength</span>
              <span :class="{
                'text-red-600 dark:text-red-400': passwordStrength.label === 'Weak',
                'text-yellow-600 dark:text-yellow-400': passwordStrength.label === 'Medium',
                'text-emerald-600 dark:text-emerald-400': passwordStrength.label === 'Strong'
              }" class="font-semibold transition-colors">{{ passwordStrength.label }}</span>
            </div>
            <div class="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
              <div :class="passwordStrength.color" class="h-full rounded-full transition-all duration-300"
                :style="{ width: passwordStrength.level + '%' }"></div>
            </div>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 transition-colors">Include at least 12 characters,
              a number,
              and a symbol.</p>
          </div>

          <BaseInput v-model="confirmPassword" type="password" :label="t('auth.confirmPassword') || 'Confirm Password'"
            placeholder="••••••••" />

          <BaseButton variant="primary" type="submit" :loading="isLoading"
            class="w-full mt-4 shadow-sm shadow-blue-500/10">
            {{ isLoading ? 'Creating Account...' : 'Create Account' }}
          </BaseButton>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span
                class="px-2 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs tracking-wider uppercase font-medium transition-colors">
                Or register with
              </span>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-4">
            <button
              class="w-full flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600/80 transition-colors">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" class="h-4 w-4 mr-2" />
              <span class="text-sm font-medium">Google</span>
            </button>
            <button
              class="w-full flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600/80 transition-colors">
              <Briefcase class="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
              <span class="text-sm font-medium">SSO</span>
            </button>
          </div>
        </div>

        <p class="mt-6 text-center text-sm text-slate-600 dark:text-slate-400 transition-colors">
          Already have an account?
          <router-link to="/login"
            class="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Sign
            In</router-link>
        </p>

      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, BarChart3, Zap, ShieldCheck, Briefcase } from 'lucide-vue-next'
import AuthLayout from '../../layouts/AuthLayout.vue'
import { useAuth } from '../../composables/useAuth'
import { BaseInput, BaseButton } from '@/components/base'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { register } = useAuth()
const { t } = useI18n()

const fullName = ref('')
const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const passwordStrength = computed(() => {
  const pwd = password.value
  if (pwd.length === 0) return { level: 0, label: '', color: '' }

  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[a-z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  if (score <= 2) return { level: 33, label: 'Weak', color: 'bg-red-500' }
  if (score <= 4) return { level: 66, label: 'Medium', color: 'bg-yellow-500' }
  return { level: 100, label: 'Strong', color: 'bg-emerald-500' }
})

const handleRegister = async () => {
  errorMessage.value = ''

  if (!fullName.value || !email.value || !username.value || !password.value || !confirmPassword.value) {
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
    const result = await register({
      fullName: fullName.value,
      email: email.value,
      username: username.value,
      password: password.value
    })

    if (result.success) {
      localStorage.setItem('pendingRegistrationEmail', email.value)
      localStorage.setItem('registrationVerification', 'true')
      router.push('/verify-otp')
    } else {
      errorMessage.value = result.message
    }
  } catch (error) {
    errorMessage.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>