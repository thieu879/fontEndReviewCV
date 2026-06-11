<template>
  <AuthLayout mode="verify">
    <div
      class="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xl dark:shadow-2xl/50 overflow-hidden text-center p-8 md:p-10 transition-colors duration-200">

      <div
        class="mx-auto w-14 h-14 bg-blue-100 dark:bg-blue-950/50 rounded-full flex items-center justify-center mb-6 transition-colors">
        <ShieldCheck class="w-7 h-7 text-blue-600 dark:text-blue-400" />
      </div>

      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">
        {{ isRegistrationVerification ? 'Xác thực Email' : 'Verify OTP' }}
      </h2>
      <p class="text-slate-500 dark:text-slate-400 mb-8 text-sm transition-colors">
        {{ isRegistrationVerification
          ? 'Nhập mã OTP đã được gửi đến email của bạn để kích hoạt tài khoản.'
          : "We've sent a 6-digit code to " + maskedEmail
        }}
      </p>

      <div v-if="successMessage"
        class="p-3 bg-green-50 dark:bg-emerald-950/30 border border-green-200 dark:border-emerald-900/50 rounded-lg text-green-600 dark:text-emerald-400 text-sm text-center mb-4 transition-colors">
        {{ successMessage }}
      </div>

      <form @submit.prevent="handleVerify" class="space-y-8 text-left">
        <div v-if="errorMessage"
          class="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 text-sm text-center transition-colors">
          {{ errorMessage }}
        </div>

        <div class="flex justify-between gap-2">
          <input v-for="(_digit, index) in otp" :key="index" type="text" maxlength="1" v-model="otp[index]"
            @input="handleInput($event, index)" @keydown="handleKeyDown($event, index)" @paste="handlePaste"
            ref="otpInputs" :disabled="isLoading"
            class="w-12 h-12 text-center text-xl font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:text-slate-400 dark:disabled:text-slate-600" />
        </div>

        <BaseButton variant="primary" type="submit" :loading="isLoading" class="w-full shadow-sm shadow-blue-500/10">
          {{ isLoading ? 'Verifying...' : (isRegistrationVerification ? 'Xác thực & Đăng nhập' : 'Verify & Proceed') }}
        </BaseButton>

        <div class="text-center mt-6">
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-2 transition-colors">Didn't receive the code?</p>
          <button type="button" @click="handleResend" :disabled="!canResend || isLoading" :class="canResend
            ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
            : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'"
            class="text-sm font-semibold transition-colors focus:outline-none">
            {{ canResend ? 'Resend Code' : `Resend Code in ${resendCooldown}s` }}
          </button>
        </div>
      </form>

      <div class="mt-6 text-center border-t border-slate-100 dark:border-slate-700/60 pt-4">
        <router-link to="/login"
          class="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium transition-colors">
          Quay lại đăng nhập
        </router-link>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ShieldCheck } from 'lucide-vue-next'
import AuthLayout from '../../layouts/AuthLayout.vue'
import { authService } from '../../api/authService'
import { BaseButton } from '@/components/base'

const router = useRouter()
const otp = ref(['', '', '', '', '', ''])
const otpInputs = ref<HTMLInputElement[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const resendCooldown = ref(60)
const canResend = ref(false)
const maskedEmail = ref('')
const isRegistrationVerification = ref(false)

const maskedEmailValue = (email: string) => {
  if (!email) return 'your email'
  const [localPart, domain] = email.split('@')
  if (!domain) return email
  const masked = localPart.charAt(0) + '***'
  return masked + '@' + domain
}

onMounted(() => {
  const storedEmail = authService.getStoredEmail()
  maskedEmail.value = maskedEmailValue(storedEmail)
  isRegistrationVerification.value = localStorage.getItem('registrationVerification') === 'true'

  if (!storedEmail && !isRegistrationVerification.value) {
    router.push('/forgot-password')
    return
  }

  startResendTimer()
})

watch(otp, (newOtp) => {
  const fullCode = newOtp.join('')
  if (fullCode.length === 6 && !fullCode.includes('')) {
    handleVerify()
  }
}, { deep: true })

const startResendTimer = () => {
  resendCooldown.value = 60
  canResend.value = false
  const interval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(interval)
      canResend.value = true
    }
  }, 1000)
}

const handleInput = (e: Event, index: number) => {
  const target = e.target as HTMLInputElement
  const value = target.value.replace(/\D/g, '')
  if (value) {
    otp.value[index] = value.charAt(0)
    if (index < 5 && otpInputs.value[index + 1]) {
      otpInputs.value[index + 1].focus()
    }
  }
}

const handleKeyDown = (e: KeyboardEvent, index: number) => {
  if (e.key === 'Backspace' && !otp.value[index] && index > 0) {
    otp.value[index] = '' // Clear current cell first
    otpInputs.value[index - 1].focus()
  }
}

const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const pastedData = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6)
  if (pastedData) {
    for (let i = 0; i < 6; i++) {
      otp.value[i] = pastedData.charAt(i) || ''
    }
    if (pastedData.length === 6 && otpInputs.value[5]) {
      otpInputs.value[5].focus()
    }
  }
}

const handleVerify = async () => {
  const code = otp.value.join('')
  if (code.length !== 6) {
    errorMessage.value = 'Please enter the complete 6-digit code.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const email = authService.getStoredEmail()
    if (!email) {
      errorMessage.value = 'Session expired. Please request a new OTP.'
      router.push('/forgot-password')
      return
    }

    if (isRegistrationVerification.value) {
      const response = await authService.verifyEmailAndLogin({
        email,
        otp: code
      })

      if (response.success) {
        successMessage.value = 'Xác thực thành công! Đang chuyển đến trang chính...'
        localStorage.removeItem('registrationVerification')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        errorMessage.value = response.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.'
        otp.value = ['', '', '', '', '', '']
        otpInputs.value[0]?.focus()
      }
    } else {
      const response = await authService.resetPassword({
        email,
        otp: code,
        newPassword: '',
        confirmPassword: ''
      })

      if (response.success || response.message === 'OTP is valid, please set a new password') {
        router.push('/reset-password')
      } else {
        errorMessage.value = response.message || 'Invalid or expired OTP code.'
        otp.value = ['', '', '', '', '', '']
        otpInputs.value[0]?.focus()
      }
    }
  } catch (error: any) {
    const message = error.response?.data?.message || 'Invalid or expired OTP code.'
    errorMessage.value = message
    otp.value = ['', '', '', '', '', '']
    otpInputs.value[0]?.focus()
  } finally {
    isLoading.value = false
  }
}

const handleResend = async () => {
  if (!canResend.value) return

  try {
    const email = authService.getStoredEmail()
    if (!email) {
      errorMessage.value = 'Session expired. Please request a new OTP.'
      return
    }

    if (isRegistrationVerification.value) {
      const response = await authService.resendOTP(email)
      if (response.success) {
        startResendTimer()
        errorMessage.value = ''
        successMessage.value = 'Mã OTP mới đã được gửi đến email của bạn.'
      } else {
        errorMessage.value = response.message || 'Failed to resend OTP. Please try again.'
      }
    } else {
      await authService.resendOTP(email)
      startResendTimer()
      errorMessage.value = ''
    }
  } catch (error) {
    errorMessage.value = 'Failed to resend OTP. Please try again.'
  }
}
</script>