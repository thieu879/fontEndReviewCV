<template>
  <AuthLayout mode="login">
    <div
      class="w-full max-w-6xl mx-auto flex flex-col lg:flex-row bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl shadow-xl overflow-hidden min-h-[600px] transition-colors duration-200">

      <div
        class="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-slate-800 transition-colors duration-200">
        <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">Welcome Back</h2>
        <p class="text-slate-500 dark:text-slate-400 mb-8 text-sm transition-colors">Precision hiring starts with
          intelligent insights.</p>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div v-if="errorMessage"
            class="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {{ errorMessage }}
          </div>

          <BaseInput v-model="email" type="email" :placeholder="t('auth.emailPlaceholder') || 'name@company.com'"
            :error="emailError">
            <template #prefix>
              <Mail class="w-5 h-5 text-slate-400 dark:text-slate-500" />
            </template>
          </BaseInput>

          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between items-center">
              <label class="text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors">Password</label>
              <router-link to="/forgot-password"
                class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                Forgot password?
              </router-link>
            </div>
            <BaseInput v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••">
              <template #prefix>
                <Lock class="w-5 h-5 text-slate-400 dark:text-slate-500" />
              </template>
              <template #suffix>
                <button type="button" @click="showPassword = !showPassword"
                  class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <Eye v-if="showPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </template>
            </BaseInput>
          </div>

          <BaseCheckbox v-model="rememberMe" label="Remember me" class="text-slate-700 dark:text-slate-300" />

          <BaseButton variant="primary" type="submit" :loading="isLoading"
            class="w-full mt-2 shadow-sm shadow-blue-500/10">
            {{ isLoading ? 'Signing In...' : 'Sign In to Dashboard' }}
          </BaseButton>
        </form>

        <div class="mt-8">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span
                class="px-2 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs tracking-wider uppercase font-medium transition-colors">
                Or continue with
              </span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-4">
            <button
              class="w-full flex items-center justify-center px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600/80 transition-colors">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" class="h-5 w-5 mr-2" />
              <span class="text-sm font-medium">Google</span>
            </button>
            <button
              class="w-full flex items-center justify-center px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600/80 transition-colors">
              <Building class="h-5 w-5 mr-2 text-slate-500 dark:text-slate-400" />
              <span class="text-sm font-medium">Enterprise SSO</span>
            </button>
          </div>
        </div>

        <p class="mt-8 text-center text-sm text-slate-600 dark:text-slate-400 transition-colors">
          Don't have an account?
          <router-link to="/register"
            class="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            Start free trial
          </router-link>
        </p>
      </div>

      <div
        class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-slate-900 dark:to-blue-950 p-12 relative overflow-hidden items-center justify-center transition-colors duration-200">
        <div
          class="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40 dark:opacity-20 animate-blob">
        </div>
        <div
          class="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-400 dark:bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40 dark:opacity-20 animate-blob animation-delay-2000">
        </div>

        <div class="relative z-10 w-full max-w-md">
          <div
            class="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-5 shadow-2xl mb-6 transform -rotate-2 hover:rotate-0 transition-all duration-300 border border-transparent dark:border-slate-700/50">
            <div class="flex items-center mb-4">
              <div
                class="w-10 h-10 rounded-full overflow-hidden mr-3 border-2 border-white dark:border-slate-700 shadow-sm">
                <img src="https://i.pravatar.cc/150?img=47" alt="Alex Rivera" class="w-full h-full object-cover" />
              </div>
              <div>
                <h4 class="text-slate-900 dark:text-white font-semibold text-sm transition-colors">Alex Rivera</h4>
                <p class="text-slate-500 dark:text-slate-400 text-xs transition-colors">Lead Technical Recruiter</p>
              </div>
            </div>
            <div class="space-y-2">
              <div class="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div class="h-full bg-blue-600 dark:bg-blue-500 w-[92%] rounded-full"></div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-blue-700 dark:text-blue-400 font-bold text-xs transition-colors">Match Score:
                  92%</span>
                <span
                  class="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-semibold transition-colors">Highly
                  Recommended</span>
              </div>
            </div>
          </div>

          <div
            class="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl transform translate-x-8 hover:-translate-x-2 transition-all duration-300 border border-transparent dark:border-slate-700/50">
            <h4 class="text-blue-600 dark:text-blue-400 font-semibold mb-4 text-lg transition-colors">AI Sentiment
              Analysis
            </h4>
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-emerald-50 dark:bg-emerald-950/40 rounded-lg p-3 transition-colors">
                <p class="text-emerald-800 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                  Growth
                  Mindset</p>
                <p class="text-emerald-600 dark:text-emerald-400 font-semibold text-lg">Strong</p>
              </div>
              <div class="bg-blue-50 dark:bg-blue-950/40 rounded-lg p-3 transition-colors">
                <p class="text-blue-800 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">Culture
                  Fit
                </p>
                <p class="text-blue-600 dark:text-blue-400 font-semibold text-lg">High</p>
              </div>
            </div>
          </div>

          <div class="mt-12 text-white">
            <h3 class="text-2xl font-bold mb-3">Trusted by Fortune 500 Recruiting Teams</h3>
            <p class="text-blue-100 dark:text-slate-300 text-sm leading-relaxed transition-colors">
              Our proprietary LLM analyzes over 50,000 resumes daily, ensuring you never miss top-tier talent.
            </p>
          </div>
        </div>
      </div>

    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, Eye, EyeOff, Building } from 'lucide-vue-next'
import AuthLayout from '../../layouts/AuthLayout.vue'
import { useAuth } from '../../composables/useAuth'
import { BaseInput, BaseButton, BaseCheckbox } from '@/components/base'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { login, fetchCurrentUser } = useAuth()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const emailError = ref('')
const rememberMe = ref(false)

const handleLogin = async () => {
  emailError.value = ''
  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter both email and password.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await login(email.value, password.value)

    if (result.success) {
      fetchCurrentUser().catch(err => console.log('[Login] Fetch user failed:', err))
      router.push('/home')
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