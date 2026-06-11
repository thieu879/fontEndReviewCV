<template>
  <MainLayout>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">{{ t('shortlist.title') || 'Saved Shortlist' }}</h1>
      <p class="text-slate-500 dark:text-slate-400">{{ t('shortlist.subtitle') || 'Candidates you saved to track later' }}</p>
    </div>

    <!-- Filter Bar -->
    <div
      class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 mb-6 flex items-center gap-3 flex-wrap transition-colors duration-200">
      <div class="flex items-center gap-2 flex-1 min-w-[200px]">
        <Filter class="w-4 h-4 text-slate-400 dark:text-slate-500" />
        <span class="text-sm font-medium text-slate-600 dark:text-slate-300">{{ t('search.filters') }}:</span>

        <BaseInput v-model="searchName" type="search" :placeholder="t('shortlist.searchByName') || 'Search by name...'"
          @update:model-value="debouncedFetch" class="w-48" />
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <button v-for="tag in availableTags" :key="tag"
          @click="selectedTag = selectedTag === tag ? '' : tag; fetchShortlist()" :class="['px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
            selectedTag === tag
              ? 'bg-amber-400 text-amber-950 border-amber-400 shadow-sm dark:bg-amber-500 dark:border-amber-500 dark:text-amber-950'
              : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-700 dark:hover:text-amber-400'
          ]">
          {{ tag }}
        </button>
      </div>

      <span class="text-sm text-slate-400 dark:text-slate-500 sm:ml-auto">
        {{ totalElements }} {{ t('shortlist.candidatesCount') || 'candidates' }}
      </span>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <Loader2 class="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      <span class="ml-3 text-slate-500 dark:text-slate-400">{{ t('shortlist.loading') || 'Loading shortlist...' }}</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="shortlist.length === 0"
      class="col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl shadow-sm flex flex-col overflow-hidden p-16 text-center transition-colors duration-200">
      <Bookmark class="w-20 h-20 text-gray-200 dark:text-slate-700 mx-auto mb-6" />
      <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">
        {{ t('shortlist.emptyTitle') || 'No saved candidates yet' }}
      </h3>
      <p class="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto text-sm leading-relaxed">
        {{ t('shortlist.emptyDescription') || 'When you save a candidate from search, they will appear here for easier tracking.' }}
      </p>
      <div class="mt-auto">
        <router-link to="/search"
          class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-500/10 dark:shadow-none">
          <Search class="w-4 h-4" />
          {{ t('shortlist.goSearch') || 'Search candidates' }}
        </router-link>
      </div>

    </div>

    <!-- Shortlist Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="item in shortlist" :key="item.id"
        class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-600 hover:border-amber-200 hover:shadow-md transition-all group shadow-sm flex flex-col overflow-hidden">
        <div class="p-5 flex-1">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <BaseAvatar :name="item.candidateFullName" size="lg" shape="rounded" />
              <div>
                <p class="font-bold text-slate-900 dark:text-white">{{ item.candidateFullName || (t('shortlist.unnamed')
                  || 'Unnamed') }}</p>
                <p class="text-xs text-blue-600 dark:text-blue-400 font-medium">{{ item.suggestedPosition ||
                  (t('shortlist.undeterminedPosition') || 'Undetermined position') }}</p>
              </div>
            </div>
            <BaseBadge v-if="item.aiScore"
              :variant="item.aiScore >= 80 ? 'success' : item.aiScore >= 60 ? 'warning' : 'default'" size="sm">{{
                Math.round(item.aiScore) }}%</BaseBadge>
          </div>

          <!-- Tags -->
          <div v-if="item.tag" class="flex flex-wrap gap-1.5 mb-3">
            <BaseBadge variant="warning" size="sm">{{ item.tag }}</BaseBadge>
          </div>

          <!-- Note Preview -->
          <div v-if="item.note" class="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 mb-4">
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">{{ t('shortlist.note') || 'Note' }}:</p>
            <p class="text-sm text-slate-700 dark:text-slate-200 line-clamp-2">{{ item.note }}</p>
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 mb-4">
            <span class="flex items-center gap-1">
              <MessageSquare class="w-3.5 h-3.5" />
              {{ item.commentCount }} {{ t('shortlist.comments') || 'comments' }}
            </span>
            <span class="flex items-center gap-1">
              <Star class="w-3.5 h-3.5" />
              {{ item.userRating ? `${item.userRating}/5` : (t('shortlist.notRated') || 'Not rated') }}
            </span>
            <span>{{ item.totalExperienceYears || 0 }} {{ t('shortlist.yearsExp') || 'years exp' }}</span>
          </div>
        </div>

        <!-- Card Actions -->
        <div
          class="border-t border-slate-200 dark:border-slate-600 px-5 py-3 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/50">
          <BaseButton variant="primary" size="sm" class="flex-1" @click="openDetails(item)">
            {{ t('shortlist.viewDetails') || 'View details' }}
          </BaseButton>
          <BaseButton variant="secondary" size="sm" @click="editNote(item)">
            <Pencil class="w-3.5 h-3.5" />
          </BaseButton>
          <BaseButton variant="danger" size="sm" @click="removeItem(item)">
            <Trash2 class="w-3.5 h-3.5" />
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center mt-6">
      <BasePagination
        v-model:current-page="currentPage"
        :total-pages="totalPages"
        @page-change="goToPage"
      />
    </div>

    <!-- Edit Note Modal -->
    <BaseModal :is-open="showEditNote" :title="t('shortlist.updateNote') || 'Update note'" size="sm" @close="showEditNote = false">
      <div class="space-y-4">
        <BaseInput
          v-model="editingTag"
          type="text"
          :label="t('shortlist.tag') || 'Tag'"
          :placeholder="t('shortlist.tagPlaceholder') || 'E.g. Potential, Interview, Follow up...'"
        />
        <BaseTextarea
          v-model="editingNote"
          :rows="4"
          :label="t('shortlist.note') || 'Note'"
          :placeholder="t('shortlist.notePlaceholder') || 'Your remarks about this candidate...'"
        />
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="showEditNote = false">
          {{ t('common.cancel') }}
        </BaseButton>
        <BaseButton variant="primary" :loading="savingNote" @click="saveNote">
          {{ t('common.save') }}
        </BaseButton>
      </template>
    </BaseModal>

    <!-- Candidate Details Modal -->
    <CandidateDetailsModal :is-open="showDetails" :candidate="selectedCandidate" @close="showDetails = false" />

    <!-- Delete Confirmation Modal -->
    <ConfirmDeleteModal
      :is-open="showDeleteModal"
      :message="t('shortlist.removeConfirm', { name: deletingItem?.candidateFullName || (t('shortlist.unnamed') || 'Unnamed') })"
      @close="showDeleteModal = false"
      @confirm="confirmRemove"
    />
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import MainLayout from '@/layouts/MainLayout.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import CandidateDetailsModal from '@/components/modals/CandidateDetailsModal.vue';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal.vue';
import shortlistService, { type ShortlistResponse } from '@/api/shortlistService';
import cvService from '@/api/cvService';
import { BaseAvatar, BaseBadge, BaseButton, BaseInput, BasePagination, BaseTextarea } from '@/components/base';
import {
  Bookmark, Search, Filter, Pencil, Trash2, Star, MessageSquare,
  Loader2
} from 'lucide-vue-next';
import type { CandidateProfileResponse } from '@/api/cvService';

const { t } = useI18n();

const isLoading = ref(false);
const shortlist = ref<ShortlistResponse[]>([]);
const totalElements = ref(0);
const totalPages = ref(0);
const currentPage = ref(0);

const searchName = ref('');
const selectedTag = ref('');
const availableTags = computed(() => [
  t('shortlist.tagPotential') || 'Potential',
  t('shortlist.tagInterview') || 'Interview',
  t('shortlist.tagRejected') || 'Rejected',
  t('shortlist.tagWaiting') || 'Waiting feedback'
]);

const showEditNote = ref(false);
const editingItem = ref<ShortlistResponse | null>(null);
const editingNote = ref('');
const editingTag = ref('');
const savingNote = ref(false);

const showDetails = ref(false);
const selectedCandidate = ref<CandidateProfileResponse | null>(null);

const showDeleteModal = ref(false);
const deletingItem = ref<ShortlistResponse | null>(null);

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const fetchShortlist = async () => {
  isLoading.value = true;
  try {
    const result = await shortlistService.getUserShortlist(currentPage.value, 12);
    let items = result.content;

    if (searchName.value) {
      const q = searchName.value.toLowerCase();
      items = items.filter((i: ShortlistResponse) => i.candidateFullName?.toLowerCase().includes(q));
    }
    if (selectedTag.value) {
      items = items.filter((i: ShortlistResponse) => i.tag === selectedTag.value);
    }

    shortlist.value = items;
    totalElements.value = result.totalElements;
    totalPages.value = result.totalPages;
  } catch (error) {
    console.error('Failed to fetch shortlist:', error);
    shortlist.value = [];
  } finally {
    isLoading.value = false;
  }
};

const debouncedFetch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 0;
    fetchShortlist();
  }, 400);
};

const goToPage = (page: number) => {
  currentPage.value = page;
  fetchShortlist();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const openDetails = async (item: ShortlistResponse) => {
  try {
    const profile = await cvService.getCandidateProfileById(item.candidateProfileId);
    selectedCandidate.value = profile;
    showDetails.value = true;
  } catch (error) {
    console.error('Failed to load candidate:', error);
  }
};

const editNote = (item: ShortlistResponse) => {
  editingItem.value = item;
  editingNote.value = item.note || '';
  editingTag.value = item.tag || '';
  showEditNote.value = true;
};

const saveNote = async () => {
  if (!editingItem.value) return;
  savingNote.value = true;
  try {
    await shortlistService.updateNote(
      editingItem.value.candidateProfileId,
      editingNote.value || undefined,
      editingTag.value || undefined
    );
    const idx = shortlist.value.findIndex(s => s.id === editingItem.value?.id);
    if (idx >= 0) {
      shortlist.value[idx] = {
        ...shortlist.value[idx],
        note: editingNote.value,
        tag: editingTag.value
      };
    }
    showEditNote.value = false;
  } catch (error) {
    console.error('Failed to save note:', error);
  } finally {
    savingNote.value = false;
  }
};

const removeItem = (item: ShortlistResponse) => {
  deletingItem.value = item;
  showDeleteModal.value = true;
};

const confirmRemove = async () => {
  if (!deletingItem.value) return;
  try {
    await shortlistService.removeFromShortlist(deletingItem.value.candidateProfileId);
    shortlist.value = shortlist.value.filter(s => s.id !== deletingItem.value?.id);
    totalElements.value = Math.max(0, totalElements.value - 1);
  } catch (error) {
    console.error('Failed to remove:', error);
  } finally {
    showDeleteModal.value = false;
    deletingItem.value = null;
  }
};

onMounted(() => {
  fetchShortlist();
});
</script>
