<template>
  <MainLayout>
    <div class="flex flex-col h-full">

      <!-- Body: 2-column layout (filters + results) -->
      <div class="flex flex-1 overflow-hidden">

        <!-- ─── Filters Panel ─── -->
        <aside
          class="w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col overflow-y-auto shrink-0 p-5 transition-colors duration-200">
          <!-- Header Filters -->
          <div class="flex items-center justify-between mb-5">
            <h2 class="font-bold text-slate-900 dark:text-white">{{ t('search.filters') }}</h2>
            <button @click="resetFilters"
              class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              {{ t('common.reset') }}
            </button>
          </div>

          <div class="space-y-5">
            <!-- Search Keyword -->
            <div>
              <BaseInput v-model="searchKeyword" type="search" :placeholder="t('search.searchPlaceholder')"
                @update:model-value="debouncedSearch">
                <template #prefix>
                  <Search class="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </template>
                <template #suffix>
                  <button v-if="searchKeyword" @click="searchKeyword = ''; debouncedSearch()"
                    class="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                    <X class="w-3.5 h-3.5" />
                  </button>
                </template>
              </BaseInput>
            </div>

            <!-- Target Role - Free text input -->
            <div>
              <BaseInput v-model="filters.targetRoleKeyword" type="text"
                :placeholder="t('search.targetRolePlaceholder') || 'VD: Frontend, Backend...'"
                @update:model-value="debouncedSearch">
                <template #prefix>
                  <Briefcase class="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </template>
              </BaseInput>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ t('search.targetRoleHint') }}</p>
            </div>

            <!-- Required Skills -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">{{
                t('search.requiredSkills') }}</label>

              <!-- Badges (Kỹ năng đã chọn) -->
              <div v-if="filters.skills && filters.skills.length > 0" class="flex flex-wrap gap-2 mb-2">
                <BaseBadge v-for="skill in filters.skills" :key="skill" variant="primary" size="sm" class="pr-1.5">
                  <span class="mr-1">{{ skill }}</span>
                  <button @click="removeSkill(skill)"
                    class="hover:text-blue-900 dark:hover:text-blue-200 ml-0.5 inline-flex">
                    <X class="w-3 h-3" />
                  </button>
                </BaseBadge>
              </div>

              <BaseInput v-model="newSkill" type="text" :placeholder="t('search.addSkill')"
                @keydown.enter.prevent="addSkill" />

              <!-- Suggested Skills (Kỹ năng gợi ý) -->
              <div v-if="suggestedSkills.length > 0 && (!filters.skills || filters.skills.length < 10)" class="mt-2">
                <p class="text-xs text-slate-400 dark:text-slate-500 mb-1">{{ t('search.suggested') || 'Gợi ý:' }}</p>
                <div class="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar">
                  <button
                    v-for="skill in suggestedSkills.filter((s: string) => !filters.skills?.includes(s)).slice(0, 20)"
                    :key="skill" @click="filters.skills!.push(skill); debouncedSearch()"
                    class="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs hover:bg-blue-100 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                    + {{ skill }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Experience Range -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ t('search.experience')
                  }}</label>
                <span class="text-xs text-slate-500 dark:text-slate-400">{{ filters.minExperienceYears || 0 }} - {{
                  filters.maxExperienceYears || 15 }}+</span>
              </div>
              <div class="flex gap-2 mb-2">
                <BaseInput v-model="filters.minExperienceYears" type="number" :placeholder="t('common.from') || 'Từ'"
                  @update:model-value="debouncedSearch" />
                <BaseInput v-model="filters.maxExperienceYears" type="number" :placeholder="t('common.to') || 'Đến'"
                  @update:model-value="debouncedSearch" />
              </div>
            </div>

            <!-- AI Match Score -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">{{
                t('search.aiMatchScore') }}</label>
              <div class="flex items-center gap-2">
                <button v-for="score in [80, 90, 95]" :key="score"
                  @click="filters.minAiScore = filters.minAiScore === score ? undefined : score; debouncedSearch()"
                  :class="['flex-1 py-2 rounded-xl text-sm font-semibold border transition-all',
                    filters.minAiScore === score
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm dark:bg-blue-500 dark:border-blue-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  ]">
                  {{ score }}%+
                </button>
              </div>
              <button v-if="filters.minAiScore" @click="filters.minAiScore = undefined; debouncedSearch()"
                class="mt-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 block">
                {{ t('search.clearFilter') }}
              </button>
            </div>

            <!-- Manually Edited Only -->
            <div class="text-slate-700 dark:text-slate-200">
              <BaseCheckbox v-model="filters.manuallyEditedOnly" @update:model-value="debouncedSearch">
                {{ t('search.manuallyEditedOnly') }}
              </BaseCheckbox>
            </div>
          </div>

          <!-- Apply / Reset Footer Buttons -->
          <div class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <BaseButton variant="primary" size="md" full-width @click="applyFilters">
              {{ t('search.applyFilters') }}
            </BaseButton>
            <BaseButton variant="secondary" size="md" full-width @click="resetFilters">
              {{ t('search.resetAll') }}
            </BaseButton>
          </div>
        </aside>

        <!-- ─── Candidates Grid ─── -->
        <main class="flex-1 overflow-y-auto p-5 bg-gray-50 dark:bg-slate-900">
          <!-- Loading -->
          <div v-if="isLoading" class="flex items-center justify-center py-20">
            <Loader2 class="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
            <span class="ml-3 text-slate-500 dark:text-slate-400">{{ t('search.searching') }}</span>
          </div>

          <template v-else>
            <!-- Search Summary Bar -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="font-bold text-slate-900 dark:text-white">{{ t('search.candidates') }}</h2>
                <span class="text-blue-600 dark:text-blue-400 font-semibold text-sm">{{ totalElements.toLocaleString() }} {{ t('search.matchesFound') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <select
                  v-model="sortOption"
                  @change="onSortChange"
                  class="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="aiScore,DESC">{{ t('search.scoreHighLow') }}</option>
                  <option value="aiScore,ASC">{{ t('search.scoreLowHigh') }}</option>
                  <option value="createdAt,DESC">{{ t('search.newest') }}</option>
                  <option value="createdAt,ASC">{{ t('search.oldest') }}</option>
                  <option value="totalExperienceYears,DESC">{{ t('search.expMost') }}</option>
                </select>
                <button
                  @click="toggleView"
                  class="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <LayoutGrid v-if="viewMode === 'list'" class="w-4 h-4" />
                  <List v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Active Filters Tags -->
            <div v-if="activeFilterTags.length > 0" class="flex flex-wrap gap-2 mb-4">
              <BaseBadge
                v-for="tag in activeFilterTags"
                :key="tag.key + tag.value"
                variant="primary"
                size="sm"
                class="pr-1"
              >
                <span class="mr-1">{{ tag.label }}</span>
                <button @click="removeFilterTag(tag)" class="hover:text-blue-900 inline-flex">
                  <X class="w-3 h-3" />
                </button>
              </BaseBadge>
              <button @click="resetFilters" class="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 underline">
                {{ t('search.clearAll') }}
              </button>
            </div>

            <!-- Empty State -->
            <div v-if="candidates.length === 0"
              class="bg-white dark:bg-slate-900/50 rounded-2xl p-12 text-center border border-transparent dark:border-slate-800 transition-colors duration-200">
              <!-- Icon Tìm kiếm -->
              <Search class="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />

              <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {{ t('search.noResults') }}
              </h3>
              <p class="text-slate-500 dark:text-slate-400 mb-4 max-w-sm mx-auto text-sm">
                {{ t('search.adjustFilters') }}
              </p>
              <BaseButton variant="primary" @click="resetFilters">
                {{ t('search.resetFilters') }}
              </BaseButton>
            </div>

            <!-- Candidates Grid View -->
            <div v-if="viewMode === 'grid' && candidates.length > 0"
              class="grid grid-cols-2 gap-4 transition-colors duration-200">
              <div v-for="c in candidates" :key="c.id"
                class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 hover:shadow-md hover:border-blue-100 dark:hover:border-slate-600 transition-all cursor-pointer"
                @click="openPreview(c)">
                <!-- Top Section: Avatar + Name + Score -->
                <div class="flex items-start justify-between mb-3 gap-2">
                  <div class="flex items-center gap-3 min-w-0">
                    <BaseAvatar :name="c.fullName" size="md" shape="circle" class="shrink-0" />
                    <div class="min-w-0">
                      <p class="font-semibold text-slate-900 dark:text-white text-sm truncate">{{ c.fullName ||
                        t('search.noName') }}</p>
                      <p class="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">{{
                        c.suggestedPositions?.[0] || t('search.notSpecified') }}</p>
                    </div>
                  </div>
                  <!-- Badge Điểm AI Score -->
                  <BaseBadge :variant="getScoreVariant(c.aiScore)" size="sm" pill class="shrink-0">
                    {{ Math.round(c.aiScore || 0) }}%
                  </BaseBadge>
                </div>

                <!-- Location Section -->
                <div class="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mb-3">
                  <MapPin class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span class="truncate">{{ c.address || t('search.noLocation') }}</span>
                </div>

                <!-- Skills List Section -->
                <div class="flex flex-wrap gap-1.5 mb-4">
                  <BaseBadge v-for="skill in (c.skills || []).slice(0, 4)" :key="skill" variant="default" size="sm">
                    {{ skill }}
                  </BaseBadge>
                  <BaseBadge v-if="(c.skills || []).length > 4" variant="default" size="sm">
                    +{{ (c.skills || []).length - 4 }}
                  </BaseBadge>
                </div>

                <!-- Footer Card Section: Experience & Action Button -->
                <div
                  class="border-t border-slate-100 dark:border-slate-700 pt-3 flex items-center justify-between gap-2">
                  <span class="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                    {{ c.totalExperienceYears || 0 }} {{ t('search.yearsExp') }}
                  </span>
                  <button
                    class="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold shrink-0 transition-colors"
                    @click.stop="openPreview(c)">
                    {{ t('search.quickPreview') }}
                  </button>
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
          </template>
        </main>

      </div>
    </div>
  </MainLayout>

  <!-- Candidate Details Modal -->
  <CandidateDetailsModal
    :is-open="showPreview"
    :candidate="selectedCandidate"
    @close="showPreview = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import MainLayout from '@/layouts/MainLayout.vue';
import searchService, { type SearchFilters } from '@/api/searchService';
import type { CandidateProfileResponse } from '@/api/cvService';
import CandidateDetailsModal from '@/components/modals/CandidateDetailsModal.vue';
import {
  BaseAvatar, BaseBadge, BaseButton, BaseCheckbox,
  BaseInput, BasePagination
} from '@/components/base';
import {
  Search, X, Briefcase, MapPin, Loader2,
  LayoutGrid, List
} from 'lucide-vue-next';

const { t } = useI18n();

const isLoading = ref(false);
const searchKeyword = ref('');
const newSkill = ref('');
const suggestedSkills = ref<string[]>([]);
const viewMode = ref<'grid' | 'list'>('grid');
const sortOption = ref('aiScore,DESC');
const showPreview = ref(false);
const selectedCandidate = ref<CandidateProfileResponse | null>(null);

const filters = reactive<SearchFilters>({
  targetRoleKeyword: '',
  skills: [],
  minExperienceYears: undefined,
  maxExperienceYears: undefined,
  minAiScore: undefined,
  maxAiScore: undefined,
  manuallyEditedOnly: false,
  sortBy: 'aiScore',
  sortDirection: 'DESC',
  page: 0,
  size: 20
});

const candidates = ref<CandidateProfileResponse[]>([]);
const totalElements = ref(0);
const totalPages = ref(0);
const currentPage = ref(0);

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const activeFilterTags = computed(() => {
  const tags: { key: string; value: any; label: string }[] = [];
  if (searchKeyword.value) tags.push({ key: 'keyword', value: searchKeyword.value, label: `"${searchKeyword.value}"` });
  if (filters.targetRoleKeyword) tags.push({ key: 'targetRole', value: filters.targetRoleKeyword, label: `${t('search.targetRole')}: ${filters.targetRoleKeyword}` });
  if (filters.skills?.length) filters.skills.forEach((s: string) => tags.push({ key: 'skill', value: s, label: s }));
  if (filters.minExperienceYears) tags.push({ key: 'minExp', value: filters.minExperienceYears, label: `Exp ${filters.minExperienceYears}+ ${t('search.yearsExp')}` });
  if (filters.minAiScore) tags.push({ key: 'minScore', value: filters.minAiScore, label: `${t('search.aiMatchScore')} ${filters.minAiScore}%+` });
  if (filters.manuallyEditedOnly) tags.push({ key: 'edited', value: true, label: t('search.manuallyEditedOnly') });
  return tags;
});

const getScoreVariant = (score?: number) => {
  if (!score) return 'default';
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'danger';
};

const fetchCandidates = async () => {
  isLoading.value = true;
  try {
    const requestFilters: SearchFilters = {
      keyword: searchKeyword.value || undefined,
      targetRoleKeyword: filters.targetRoleKeyword || undefined,
      skills: filters.skills && filters.skills.length > 0 ? filters.skills : undefined,
      minExperienceYears: filters.minExperienceYears || undefined,
      maxExperienceYears: filters.maxExperienceYears || undefined,
      minAiScore: filters.minAiScore || undefined,
      manuallyEditedOnly: filters.manuallyEditedOnly || undefined,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
      page: currentPage.value,
      size: 20
    };

    const result = await searchService.searchCandidates(requestFilters);
    candidates.value = result.content;
    totalElements.value = result.totalElements;
    totalPages.value = result.totalPages;
  } catch (error) {
    console.error('Failed to search candidates:', error);
    candidates.value = [];
  } finally {
    isLoading.value = false;
  }
};

const fetchSkillsSuggestions = async () => {
  try {
    const skills = await searchService.getAllSkills();
    suggestedSkills.value = skills.slice(0, 50);
  } catch (error) {
    console.error('Failed to fetch skills:', error);
  }
};

const addSkill = () => {
  if (newSkill.value.trim() && !filters.skills?.includes(newSkill.value.trim())) {
    if (!filters.skills) filters.skills = [];
    filters.skills.push(newSkill.value.trim());
    newSkill.value = '';
    debouncedSearch();
  }
};

const removeSkill = (skill: string) => {
  if (filters.skills) {
    filters.skills = filters.skills.filter((s: string) => s !== skill);
    debouncedSearch();
  }
};

const removeFilterTag = (tag: { key: string; value: any }) => {
  switch (tag.key) {
    case 'keyword': searchKeyword.value = ''; break;
    case 'targetRole': filters.targetRoleKeyword = ''; break;
    case 'skill': if (filters.skills) filters.skills = filters.skills.filter((s: string) => s !== tag.value); break;
    case 'minExp': filters.minExperienceYears = undefined; break;
    case 'minScore': filters.minAiScore = undefined; break;
    case 'edited': filters.manuallyEditedOnly = false; break;
  }
  debouncedSearch();
};

const resetFilters = () => {
  filters.targetRoleKeyword = '';
  filters.skills = [];
  filters.minExperienceYears = undefined;
  filters.maxExperienceYears = undefined;
  filters.minAiScore = undefined;
  filters.manuallyEditedOnly = false;
  searchKeyword.value = '';
  currentPage.value = 0;
  fetchCandidates();
};

const applyFilters = () => {
  currentPage.value = 0;
  fetchCandidates();
};

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 0;
    fetchCandidates();
  }, 400);
};

const onSortChange = () => {
  const [sortBy, sortDir] = sortOption.value.split(',');
  filters.sortBy = sortBy;
  filters.sortDirection = sortDir as 'ASC' | 'DESC';
  debouncedSearch();
};

const goToPage = (page: number) => {
  currentPage.value = page;
  fetchCandidates();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const openPreview = (candidate: CandidateProfileResponse) => {
  selectedCandidate.value = candidate;
  showPreview.value = true;
};

const toggleView = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid';
};

onMounted(async () => {
  await Promise.all([fetchCandidates(), fetchSkillsSuggestions()]);
});
</script>
