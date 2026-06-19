<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  ArrowLeft,
  Upload,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Send,
  ExternalLink,
  Globe,
  Building2,
  MapPin,
  Banknote,
} from 'lucide-vue-next';
import MainLayout from '@/layouts/MainLayout.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseBadge from '@/components/base/BaseBadge.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import { jobService } from '@/api/jobMatchingService';
import { jobApplicationService } from '@/api/jobApplicationService';
import type { JobResponse } from '@/api/jobMatchingService';
import type { JobApplicationRequest } from '@/api/jobApplicationService';
import { formatFileSize } from '@/api/jobApplicationService';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const jobId = computed(() => route.params.id as string);

// Form state
const job = ref<JobResponse | null>(null);
const isLoading = ref(true);
const form = ref<JobApplicationRequest>({
  jobId: '',
  fullName: '',
  email: '',
  phone: '',
  coverLetter: '',
});
const cvFile = ref<File | null>(null);
const cvPreview = ref<{ name: string; size: number } | null>(null);
const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);
const submitSuccess = ref(false);
const submitError = ref('');
const maxSize = 10 * 1024 * 1024; // 10MB

const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

async function loadJob() {
  isLoading.value = true;
  try {
    job.value = await jobService.getJobById(jobId.value);
    form.value.jobId = jobId.value;
  } catch (e) {
    console.error('Failed to load job:', e);
  } finally {
    isLoading.value = false;
  }
}

function handleCvDrop(e: DragEvent) {
  e.preventDefault();
  const file = e.dataTransfer?.files?.[0];
  if (file) validateAndSetCv(file);
}

function handleCvSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) validateAndSetCv(file);
}

function validateAndSetCv(file: File) {
  errors.value = { ...errors.value, cv: '' };
  if (file.size > maxSize) {
    errors.value = { ...errors.value, cv: t('apply.cvTooBig', 'CV must not exceed 10MB') };
    return;
  }
  if (!allowedTypes.includes(file.type)) {
    errors.value = { ...errors.value, cv: t('apply.cvWrongType', 'Only PDF or Word documents are accepted') };
    return;
  }
  cvFile.value = file;
  cvPreview.value = { name: file.name, size: file.size };
}

function removeCv() {
  cvFile.value = null;
  cvPreview.value = null;
  errors.value = { ...errors.value, cv: '' };
}

function validate(): boolean {
  const e: Record<string, string> = {};
  if (!form.value.fullName?.trim()) e.fullName = t('apply.errFullName', 'Full name is required');
  if (!form.value.email?.trim()) e.email = t('apply.errEmail', 'Email is required');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) e.email = t('apply.errEmailInvalid', 'Email is invalid');
  if (!form.value.phone?.trim()) e.phone = t('apply.errPhone', 'Phone number is required');
  errors.value = e;
  return Object.keys(e).length === 0;
}

async function handleSubmit() {
  if (!validate()) return;
  isSubmitting.value = true;
  submitError.value = '';
  try {
    await jobApplicationService.apply(jobId.value, form.value, cvFile.value);
    submitSuccess.value = true;
  } catch (err: any) {
    submitError.value =
      err?.response?.data?.message ||
      err?.message ||
      t('apply.errSubmit', 'Failed to submit application. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
}

function goToApplications() {
  router.push({ name: 'SavedJobs' });
}

function openOriginalSite() {
  if (job.value?.sourceUrl) {
    window.open(job.value.sourceUrl, '_blank', 'noopener,noreferrer');
  }
}

function goToJobs() {
  router.push({ name: 'JobListing' });
}

const salaryDisplay = computed(() => {
  if (!job.value) return '';
  if (job.value.salary?.trim()) return job.value.salary;
  if (job.value.salaryMin || job.value.salaryMax) {
    const c = job.value.currency || 'USD';
    return `${job.value.salaryMin || '?'} - ${job.value.salaryMax || '?'} ${c}`;
  }
  return '';
});

const jobTypes = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
};

onMounted(loadJob);
</script>

<template>
  <MainLayout>
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 -m-6">
      <!-- Loading -->
      <div v-if="isLoading" class="max-w-4xl mx-auto px-6 py-10 animate-pulse">
        <div class="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-8"></div>
        <div class="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
      </div>

      <!-- Success state -->
      <div
        v-else-if="submitSuccess"
        class="max-w-2xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center"
      >
        <div class="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mb-6">
          <CheckCircle2 class="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {{ t('apply.successTitle', 'Application Submitted!') }}
        </h2>
        <p class="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
          {{ t('apply.successDesc', 'Your application has been submitted successfully. You can track its status in your Applications dashboard.') }}
        </p>
        <div class="flex items-center gap-3">
          <BaseButton variant="primary" size="md" @click="goToApplications">
            <FileText class="w-4 h-4 mr-2" />
            {{ t('apply.viewApplications', 'View My Applications') }}
          </BaseButton>
          <BaseButton variant="secondary" size="md" @click="goToJobs">
            {{ t('apply.browseJobs', 'Browse More Jobs') }}
          </BaseButton>
        </div>
      </div>

      <template v-else-if="job">
        <!-- Header -->
        <div class="max-w-4xl mx-auto px-6 pt-8 pb-4">
          <button
            type="button"
            class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6"
            @click="router.back()"
          >
            <ArrowLeft class="w-4 h-4" />
            {{ t('common.back', 'Back') }}
          </button>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
            {{ t('apply.title', 'Apply for this position') }}
          </h1>
        </div>

        <div class="max-w-4xl mx-auto px-6 pb-12 grid lg:grid-cols-[1fr_340px] gap-8">
          <!-- Application form -->
          <main>
            <BaseCard padding="lg" shadow="md" class="rounded-2xl">
              <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6">
                {{ t('apply.formTitle', 'Your Information') }}
              </h2>

              <!-- Error banner -->
              <div
                v-if="submitError"
                class="mb-5 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl flex items-start gap-3"
              >
                <AlertCircle class="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p class="text-sm text-red-700 dark:text-red-300">{{ submitError }}</p>
              </div>

              <form @submit.prevent="handleSubmit" class="space-y-5">
                <!-- Full name -->
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                    {{ t('apply.fullName', 'Full Name') }} <span class="text-red-500">*</span>
                  </label>
                  <BaseInput
                    v-model="form.fullName"
                    type="text"
                    :placeholder="t('apply.fullNamePlaceholder', 'Enter your full name')"
                    :error="errors.fullName"
                  />
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                    {{ t('apply.email', 'Email') }} <span class="text-red-500">*</span>
                  </label>
                  <BaseInput
                    v-model="form.email"
                    type="email"
                    :placeholder="t('apply.emailPlaceholder', 'your.email@example.com')"
                    :error="errors.email"
                  />
                </div>

                <!-- Phone -->
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                    {{ t('apply.phone', 'Phone Number') }} <span class="text-red-500">*</span>
                  </label>
                  <BaseInput
                    v-model="form.phone"
                    type="tel"
                    :placeholder="t('apply.phonePlaceholder', '+84...')"
                    :error="errors.phone"
                  />
                </div>

                <!-- CV Upload -->
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                    {{ t('apply.cv', 'Upload CV') }}
                    <span class="text-slate-400 font-normal text-xs ml-1">(PDF or Word, max 10MB)</span>
                  </label>

                  <!-- CV Preview (if selected) -->
                  <div
                    v-if="cvPreview"
                    class="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl mb-2"
                  >
                    <div class="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                      <FileText class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {{ cvPreview.name }}
                      </p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">
                        {{ formatFileSize(cvPreview.size) }}
                      </p>
                    </div>
                    <button type="button" class="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded" @click="removeCv">
                      <X class="w-4 h-4 text-slate-500" />
                    </button>
                  </div>

                  <!-- Drop zone -->
                  <div
                    :class="[
                      'relative border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer',
                      errors.cv
                        ? 'border-red-300 dark:border-red-500/50 bg-red-50 dark:bg-red-500/5'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-500/5',
                    ]"
                    @dragover.prevent
                    @drop="handleCvDrop"
                    @click="($refs.cvInput as HTMLInputElement).click()"
                  >
                    <Upload class="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p class="text-sm text-slate-600 dark:text-slate-400">
                      {{ t('apply.dropCv', 'Drop your CV here or click to browse') }}
                    </p>
                    <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {{ t('apply.cvFormats', 'PDF or Word document, up to 10MB') }}
                    </p>
                    <input
                      ref="cvInput"
                      type="file"
                      class="hidden"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      @change="handleCvSelect"
                    />
                  </div>
                  <p v-if="errors.cv" class="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle class="w-3 h-3" />
                    {{ errors.cv }}
                  </p>
                </div>

                <!-- Cover letter -->
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                    {{ t('apply.coverLetter', 'Cover Letter') }}
                    <span class="text-slate-400 font-normal text-xs ml-1">({{ t('apply.optional', 'Optional') }})</span>
                  </label>
                  <textarea
                    v-model="form.coverLetter"
                    rows="5"
                    :placeholder="t('apply.coverLetterPlaceholder', 'Introduce yourself and explain why you are a great fit for this role...')"
                    class="w-full px-4 py-3 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 resize-none transition-shadow"
                  ></textarea>
                  <p class="mt-1 text-xs text-slate-400 dark:text-slate-500 text-right">
                    {{ (form.coverLetter || '').length }} / 5000
                  </p>
                </div>

                <!-- Submit -->
                <div class="pt-2">
                  <BaseButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    :loading="isSubmitting"
                    :disabled="isSubmitting"
                    full-width
                  >
                    <Send class="w-4 h-4 mr-2" />
                    {{ t('apply.submit', 'Submit Application') }}
                  </BaseButton>
                </div>
              </form>
            </BaseCard>
          </main>

          <!-- Job summary sidebar -->
          <aside class="space-y-4">
            <div
              class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
            >
              <div class="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
              <div class="p-5 space-y-3">
                <h3 class="font-bold text-slate-900 dark:text-white text-base line-clamp-2">
                  {{ job.title }}
                </h3>
                <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Building2 class="w-4 h-4 shrink-0" />
                  <span class="font-medium">{{ job.companyName }}</span>
                </div>
                <div v-if="job.location" class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <MapPin class="w-4 h-4 shrink-0" />
                  <span>{{ job.location }}</span>
                </div>
                <div v-if="salaryDisplay" class="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Banknote class="w-4 h-4 shrink-0" />
                  <span>{{ salaryDisplay }}</span>
                </div>
                <BaseBadge v-if="job.jobType" variant="info" size="sm">
                  {{ jobTypes[job.jobType as keyof typeof jobTypes] || job.jobType }}
                </BaseBadge>
              </div>
            </div>

            <!-- Apply on original site -->
            <div
              v-if="job.sourceUrl"
              class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5"
            >
              <p class="text-sm text-slate-600 dark:text-slate-400 mb-3">
                {{ t('apply.orApplyOnSite', 'Or apply directly on the employer\'s website:') }}
              </p>
              <button
                type="button"
                class="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                @click="openOriginalSite"
              >
                <Globe class="w-4 h-4" />
                {{ t('apply.applyOnOriginal', 'Apply on') }} {{ job.source || 'Original Site' }}
                <ExternalLink class="w-3 h-3 ml-1" />
              </button>
            </div>

            <!-- Info -->
            <div class="bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/30 p-4">
              <h4 class="font-semibold text-blue-900 dark:text-blue-300 text-sm mb-2">
                {{ t('apply.infoTitle', 'What happens next?') }}
              </h4>
              <ul class="text-xs text-blue-800 dark:text-blue-400 space-y-1.5">
                <li class="flex items-start gap-2">
                  <CheckCircle2 class="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {{ t('apply.info1', 'Your application is saved in your dashboard') }}
                </li>
                <li class="flex items-start gap-2">
                  <CheckCircle2 class="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {{ t('apply.info2', 'Track status: Applied → Reviewing → Interview') }}
                </li>
                <li class="flex items-start gap-2">
                  <CheckCircle2 class="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {{ t('apply.info3', 'Withdraw or reapply anytime from your dashboard') }}
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </template>

      <!-- Job not found -->
      <div v-else class="max-w-4xl mx-auto px-6 py-20 text-center">
        <AlertCircle class="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {{ t('jobs.notFound', 'Job not found') }}
        </h2>
        <BaseButton variant="primary" @click="goToJobs">
          {{ t('jobs.browseJobs', 'Browse Jobs') }}
        </BaseButton>
      </div>
    </div>
  </MainLayout>
</template>
