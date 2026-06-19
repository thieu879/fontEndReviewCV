<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Inbox } from 'lucide-vue-next';
import MainLayout from '@/layouts/MainLayout.vue';
import JobCard from '@/components/jobs/JobCard.vue';
import JobListSkeleton from '@/components/jobs/JobListSkeleton.vue';
import JobEmptyState from '@/components/jobs/JobEmptyState.vue';
import { savedJobService, type JobResponse } from '@/api/jobMatchingService';
import type { SavedJobResponse } from '@/api/jobMatchingService';

const router = useRouter();
const { t, locale } = useI18n();

const savedJobs = ref<SavedJobResponse[]>([]);
const isLoading = ref(true);
const removingId = ref<string | null>(null);

const validSavedJobs = computed(() => savedJobs.value.filter((sj) => !!sj.job));
const unavailableJobs = computed(() => savedJobs.value.filter((sj) => !sj.job));

async function loadSavedJobs() {
  isLoading.value = true;
  try {
    savedJobs.value = await savedJobService.getSavedJobsList();
  } catch (e) {
    console.error('Failed to load saved jobs:', e);
    savedJobs.value = [];
  } finally {
    isLoading.value = false;
  }
}

async function handleSave(job: JobResponse) {
  if (!job.id) return;
  removingId.value = job.id;
  try {
    await savedJobService.unsaveJob(job.id);
    savedJobs.value = savedJobs.value.filter((sj) => sj.jobId !== job.id);
  } catch (e) {
    console.error('Failed to remove saved job:', e);
  } finally {
    removingId.value = null;
  }
}

async function handleRemoveUnavailable(sj: SavedJobResponse) {
  removingId.value = sj.id;
  try {
    await savedJobService.unsaveJob(sj.jobId);
    savedJobs.value = savedJobs.value.filter((s) => s.id !== sj.id);
  } catch (e) {
    console.error('Failed to remove unavailable saved job:', e);
  } finally {
    removingId.value = null;
  }
}

function handleView(job: JobResponse) {
  if (!job?.id) {
    console.warn('SavedJobsView.handleView: missing job id', job);
    return;
  }
  router.push({ name: 'JobDetail', params: { id: job.id } });
}

function handleApply(job: JobResponse) {
  if (!job?.id) {
    console.warn('SavedJobsView.handleApply: missing job id', job);
    return;
  }
  router.push({ name: 'JobDetail', params: { id: job.id } });
}

function formatDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale.value === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

onMounted(loadSavedJobs);
</script>

<template>
  <MainLayout>
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 -m-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 px-6 py-8">
        <div class="max-w-6xl mx-auto">
          <div class="flex items-center gap-3 mb-1">
            <div class="p-2 bg-white/10 rounded-xl">
              <Inbox class="w-6 h-6 text-white" />
            </div>
            <h1 class="text-2xl font-bold text-white">
              {{ t('savedJobs.pageTitle', 'Saved Jobs') }}
            </h1>
          </div>
          <p class="text-white/80 text-sm">
            {{
              t(
                'savedJobs.pageSubtitle',
                'Bookmark jobs you like to apply later. They will appear here.',
              )
            }}
          </p>
        </div>
      </div>

      <div class="max-w-6xl mx-auto px-6 py-6">
        <!-- Loading skeleton -->
        <JobListSkeleton v-if="isLoading" :count="4" />

        <!-- Empty state -->
        <JobEmptyState
          v-else-if="savedJobs.length === 0"
          variant="no-saved"
          @action="router.push({ name: 'JobListing' })"
        />

        <!-- Saved jobs list -->
        <div v-else class="space-y-4">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ validSavedJobs.length }}
            {{ validSavedJobs.length === 1 ? 'job saved' : 'jobs saved' }}
            <span v-if="unavailableJobs.length" class="text-amber-600 dark:text-amber-400 ml-2">
              ({{ unavailableJobs.length }}
              {{ unavailableJobs.length === 1 ? 'no longer available' : 'no longer available' }})
            </span>
          </p>

          <JobCard
            v-for="sj in validSavedJobs"
            :key="sj.id"
            :job="(sj.job as JobResponse)"
            :is-saved="true"
            @save="handleSave"
            @view="handleView"
            @apply="handleApply"
          />

          <!-- Unavailable saved jobs (job was deleted from backend) -->
          <div
            v-if="unavailableJobs.length"
            class="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700"
          >
            <p class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
              {{ t('savedJobs.unavailableTitle', 'No longer available') }}
            </p>
            <div class="space-y-2">
              <div
                v-for="sj in unavailableJobs"
                :key="sj.id"
                class="flex items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl opacity-75"
              >
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {{ t('savedJobs.deletedJob', 'This job has been removed') }}
                  </p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {{ t('savedJobs.savedOn', 'Saved on') }}
                    {{ formatDate(sj.createdAt) }}
                  </p>
                </div>
                <button
                  type="button"
                  class="px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  @click="handleRemoveUnavailable(sj)"
                >
                  {{ t('savedJobs.remove', 'Remove') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
