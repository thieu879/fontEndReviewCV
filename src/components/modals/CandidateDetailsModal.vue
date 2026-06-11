<template>
  <BaseModal
    :is-open="isOpen"
    :title="candidate?.fullName || t('candidateModal.noName')"
    size="xl"
    :show-header="true"
    :no-padding="true"
    :close-on-overlay="true"
    @close="close"
  >
    <div v-if="candidate" class="col-span-4 flex flex-col max-h-[75vh]
         bg-white dark:bg-slate-900
         border border-slate-200 dark:border-slate-700
         rounded-2xl shadow-sm overflow-hidden">

      <!-- ─── Hero Banner ─── -->
      <div class="relative px-6 pt-6 pb-8 flex-shrink-0
            bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700
            dark:from-slate-800 dark:via-slate-800 dark:to-slate-900">
        <!-- Decorative circles -->
        <div class="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div class="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"></div>

        <div class="relative flex items-start gap-5">
          <!-- Avatar -->
          <div class="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-white/20 flex-shrink-0">
            {{ initials }}
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 class="text-2xl font-bold text-white mb-1">{{ candidate.fullName || t('candidateModal.noName') }}</h2>
                <p class="text-blue-100 font-medium mb-3">{{ candidate.suggestedPositions?.[0] || t('candidateModal.undetermined') }}</p>
                <div class="flex items-center gap-4 text-sm text-blue-100 flex-wrap">
                  <span v-if="candidate.email" class="flex items-center gap-1.5">
                    <Mail class="w-4 h-4 opacity-70" />
                    {{ candidate.email }}
                  </span>
                  <span v-if="candidate.phone" class="flex items-center gap-1.5">
                    <Phone class="w-4 h-4 opacity-70" />
                    {{ candidate.phone }}
                  </span>
                  <span v-if="candidate.address" class="flex items-center gap-1.5">
                    <MapPin class="w-4 h-4 opacity-70" />
                    {{ candidate.address }}
                  </span>
                </div>
              </div>

              <!-- Score & Actions -->
              <div class="flex flex-col items-end gap-3">
                <div class="text-center">
                  <div :class="['text-5xl font-black mb-1', scoreColorClass]">{{ Math.round(candidate.aiScore || 0) }}%</div>
                  <div class="text-xs text-blue-200 font-medium">{{ t('candidateModal.aiMatchScore') }}</div>
                </div>
                <div class="flex gap-2">
                  <!-- Shortlist Button -->
                  <button
                    @click="toggleShortlist"
                    :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                      isShortlisted
                        ? 'bg-amber-400 text-amber-900 hover:bg-amber-300 shadow-lg shadow-amber-400/30'
                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20'
                    ]"
                  >
                    <Bookmark :class="['w-4 h-4', isShortlisted ? 'fill-current' : '']" />
                    {{ isShortlisted ? t('candidateModal.saved') : t('candidateModal.save') }}
                  </button>
                  <!-- Download CV -->
                  <button @click="downloadCV"
                    class="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 text-white hover:bg-white/30 rounded-xl text-xs font-semibold transition-all backdrop-blur-sm border border-white/20">
                    <Download class="w-4 h-4" />
                    {{ t('candidateModal.downloadCV') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats Row -->
        <div class="relative grid grid-cols-4 gap-4 mt-6">
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
            <div class="text-xl font-bold text-white">{{ candidate.totalExperienceYears || 0 }}</div>
            <div class="text-xs text-blue-200">{{ t('candidateModal.yearsExperience') }}</div>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
            <div class="text-xl font-bold text-white">{{ candidate.skills?.length || 0 }}</div>
            <div class="text-xs text-blue-200">{{ t('candidateModal.skills') }}</div>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
            <div class="text-xl font-bold text-white">{{ candidate.educations?.length || 0 }}</div>
            <div class="text-xs text-blue-200">{{ t('candidateModal.education') }}</div>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
            <div class="text-xl font-bold text-white">{{ ratingStats.averageScore > 0 ? ratingStats.averageScore.toFixed(1) : '-' }}</div>
            <div class="text-xs text-blue-200">{{ t('candidateModal.rating') }} ({{ ratingStats.totalRatings }})</div>
          </div>
        </div>
      </div>

      <!-- ─── Tabs Navigation ─── -->
      <div class="flex border-b border-slate-200 dark:border-slate-700
            px-6 bg-white dark:bg-slate-800 flex-shrink-0">
        <button
          v-for="tab in tabs" :key="tab.id"
          @click="activeTab = tab.id"
          :class="['relative px-4 py-3 text-sm font-semibold transition-colors flex items-center gap-2',
            activeTab === tab.id
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
          <span v-if="tab.badge" :class="['ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
            activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
          ]">
            {{ tab.badge }}
          </span>
          <div v-if="activeTab === tab.id"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full">
          </div>
        </button>
      </div>

      <!-- ─── Tab Content ─── -->
      <div class="flex-1 overflow-y-auto px-6 py-5
            bg-slate-50 dark:bg-slate-900">

        <!-- ── TAB: Tổng quan ── -->
        <div v-show="activeTab === 'overview'" class="space-y-6">
          <!-- Summary -->
          <div v-if="candidate.summary" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <h3 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText class="w-4 h-4 text-slate-400 dark:text-slate-500" /> {{ t('candidateModal.summary') }}
            </h3>
            <p class="text-slate-700 dark:text-slate-300 leading-relaxed"></p>{{ candidate.summary }}
          </div>

          <!-- AI Summary -->
          <div v-if="candidate.aiSummary" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <h3 class="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap class="w-4 h-4" /> {{ t('candidateModal.aiAnalysis') }}
            </h3>
            <p class="text-slate-700 dark:text-slate-300 leading-relaxed">{{ candidate.aiSummary }}</p>
          </div>

          <!-- Skills -->
          <div>
            <h3 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{{ t('candidateModal.skills') }}</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="skill in candidate.skills" :key="skill"
                class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                {{ skill }}
              </span>
              <span v-if="!candidate.skills?.length" class="text-slate-400 dark:text-slate-500 text-sm">{{ t('candidateModal.noSkills') }}</span>
            </div>
          </div>

          <!-- Suggested Positions -->
          <div v-if="candidate.suggestedPositions?.length">
            <h3 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{{ t('candidateModal.suggestedPositions') }}</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="pos in candidate.suggestedPositions" :key="pos"
                class="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-semibold">
                {{ pos }}
              </span>
            </div>
          </div>

          <!-- Languages -->
          <div v-if="candidate.languages?.length">
            <h3 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{{ t('candidateModal.languages') }}</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="lang in candidate.languages" :key="lang"
                class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium">
                {{ lang }}
              </span>
            </div>
          </div>

          <!-- Links -->
          <div v-if="candidate.linkedinUrl || candidate.githubUrl || candidate.portfolioUrl">
            <h3 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{{ t('candidateModal.links') }}</h3>
            <div class="flex gap-3 flex-wrap">
              <a v-if="candidate.linkedinUrl" :href="candidate.linkedinUrl" target="_blank"
                class="flex items-center gap-2 px-4 py-2.5 bg-[#0077b5] text-white rounded-xl text-sm font-semibold hover:bg-[#006399] transition-colors">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                LinkedIn
              </a>
              <a v-if="candidate.githubUrl" :href="candidate.githubUrl" target="_blank"
                class="flex items-center gap-2 px-4 py-2.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                GitHub
              </a>
              <a v-if="candidate.portfolioUrl" :href="candidate.portfolioUrl" target="_blank"
                class="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors">
                <Globe class="w-4 h-4" />
                Portfolio
              </a>
            </div>
          </div>
        </div>

        <!-- ── TAB: Kinh nghiệm ── -->
        <div v-show="activeTab === 'experience'" class="space-y-6">

          <!-- Work Experience -->
          <div>
            <h3
              class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Briefcase class="w-4 h-4" />
              {{ t('candidateModal.workExperience') }}
            </h3>

            <div v-if="candidate.workExperiences?.length" class="space-y-4">

              <div v-for="exp in candidate.workExperiences" :key="exp.id || exp.companyName"
                class="relative pl-8 pb-4 border-l-2 border-slate-200 dark:border-slate-700 last:pb-0">

                <div
                  class="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900">
                </div>

                <div
                  class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                  <div class="flex items-start justify-between gap-3 mb-2">

                    <div>
                      <p class="font-bold text-slate-900 dark:text-slate-100 text-base">
                        {{ exp.position || t('candidateModal.noPosition') }}
                      </p>

                      <p class="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                        {{ exp.companyName || t('candidateModal.noCompany') }}
                      </p>
                    </div>

                    <span
                      class="text-xs whitespace-nowrap px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                      {{ exp.startDate || '?' }}
                      —
                      {{ exp.currentJob ? t('candidateModal.current') : (exp.endDate || '?') }}
                    </span>

                  </div>

                  <p v-if="exp.description" class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mt-2">
                    {{ exp.description }}
                  </p>

                  <div v-if="exp.technologies?.length" class="flex flex-wrap gap-1.5 mt-3">
                    <span v-for="tech in exp.technologies" :key="tech"
                      class="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                      {{ tech }}
                    </span>
                  </div>

                </div>
              </div>

            </div>

            <div v-else
              class="text-center py-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Briefcase class="w-10 h-10 mx-auto mb-2 text-slate-400 dark:text-slate-500" />
              <p class="text-slate-500 dark:text-slate-400">
                {{ t('candidateModal.noWorkExperience') }}
              </p>
            </div>
          </div>

          <!-- Education -->
          <div>
            <h3
              class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <GraduationCap class="w-4 h-4" />
              {{ t('candidateModal.education') }}
            </h3>

            <div v-if="candidate.educations?.length" class="space-y-4">

              <div v-for="edu in candidate.educations" :key="edu.id || edu.schoolName"
                class="relative pl-8 pb-4 border-l-2 border-slate-200 dark:border-slate-700 last:pb-0">

                <div
                  class="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-green-500 ring-4 ring-white dark:ring-slate-900">
                </div>

                <div
                  class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                  <div class="flex items-start justify-between gap-3 mb-2">

                    <div>
                      <p class="font-bold text-slate-900 dark:text-slate-100 text-base">
                        {{ edu.degree || edu.major || 'Không rõ bằng cấp' }}
                      </p>

                      <p class="text-green-600 dark:text-green-400 font-semibold text-sm">
                        {{ edu.schoolName || 'Không rõ trường' }}
                      </p>
                    </div>

                    <span
                      class="text-xs whitespace-nowrap px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                      {{ edu.startDate || '?' }}
                      —
                      {{ edu.endDate || '?' }}
                    </span>

                  </div>

                  <div v-if="edu.gpa" class="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-300 mt-1">
                    <Star class="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    GPA: {{ edu.gpa }}
                  </div>

                  <p v-if="edu.description" class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mt-2">
                    {{ edu.description }}
                  </p>

                </div>
              </div>

            </div>

            <div v-else
              class="text-center py-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <GraduationCap class="w-10 h-10 mx-auto mb-2 text-slate-400 dark:text-slate-500" />
              <p class="text-slate-500 dark:text-slate-400">
                {{ t('candidateModal.noWorkExperience') }}
              </p>
            </div>
          </div>

          <!-- Certificates -->
          <div v-if="candidate.certificates?.length">
            <h3
              class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award class="w-4 h-4" />
              {{ t('candidateModal.certificates') }}
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">

              <div v-for="cert in candidate.certificates" :key="cert.id || cert.name"
                class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                <p class="font-bold text-slate-900 dark:text-slate-100">
                  {{ cert.name || t('candidateModal.unknownCertificate') }}
                </p>

                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {{ cert.issuer || '' }}
                  {{ cert.dateObtained ? `• ${cert.dateObtained}` : '' }}
                </p>

                <p v-if="cert.description" class="text-sm text-slate-600 dark:text-slate-300 mt-2">
                  {{ cert.description }}
                </p>
              </div>

            </div>
          </div>

          <!-- Projects -->
          <div v-if="candidate.projects?.length">
            <h3
              class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FolderGit2 class="w-4 h-4" />
              {{ t('candidateModal.projects') }}
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">

              <div v-for="proj in candidate.projects" :key="proj.id || proj.name"
                class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                <p class="font-bold text-slate-900 dark:text-slate-100">
                  {{ proj.name || t('candidateModal.unknownProject') }}
                </p>

                <p v-if="proj.description" class="text-sm text-slate-600 dark:text-slate-300 mt-2">
                  {{ proj.description }}
                </p>

                <div v-if="proj.technologies?.length" class="flex flex-wrap gap-2 mt-3">
                  <span v-for="tech in proj.technologies" :key="tech"
                    class="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                    {{ tech }}
                  </span>
                </div>

              </div>

            </div>
          </div>

        </div>

        <!-- ── TAB: Feedback ── -->
        <div v-show="activeTab === 'feedback'" class="space-y-6">

          <!-- Rating Section (Bọc trong container mới của bạn) -->
          <div
            class="col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl shadow-sm flex flex-col overflow-hidden p-5">

            <!-- Header Rating -->
            <div
              class="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-700/50 dark:to-orange-950/20 rounded-2xl p-5 border border-amber-100 dark:border-slate-700">
              <h3
                class="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <StarIcon class="w-4 h-4" /> {{ t('candidateModal.yourRating') }}
              </h3>

              <!-- Stars + Stats inline -->
              <div class="flex items-start gap-6 mb-4 flex-wrap sm:flex-nowrap">
                <!-- Left: Star rating -->
                <div>
                  <div v-if="userRating"
                    class="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 mb-2">
                    <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {{ userRating }}/5 {{ t('candidateModal.yourRatingNote') }}
                  </div>
                  <div class="flex items-center gap-1">
                    <button v-for="star in 5" :key="star" @click="setRating(star)" :class="['text-2xl transition-all hover:scale-110',
                      star <= (hoveredStar || userRating || 0) ? 'text-amber-400' : 'text-gray-300 dark:text-slate-600'
                    ]" @mouseenter="hoveredStar = star" @mouseleave="hoveredStar = 0">
                      <Star
                        :class="['w-8 h-8 transition-colors', star <= (hoveredStar || userRating || 0) ? 'fill-current' : '']" />
                    </button>
                    <span class="ml-2 text-sm text-gray-500 dark:text-slate-400 font-medium">
                      {{ ratingLabels[userRating || 0] }}
                    </span>
                  </div>
                </div>

                <!-- Right: Community stats -->
                <div class="flex items-center gap-4 pl-6 border-l border-amber-200 dark:border-slate-700">
                  <div class="text-center">
                    <div class="text-3xl font-black text-gray-900 dark:text-white">
                      {{ ratingStats.averageScore > 0 ? ratingStats.averageScore.toFixed(1) : '-' }}
                    </div>
                    <div class="flex items-center justify-center gap-0.5 mt-0.5">
                      <Star v-for="star in 5" :key="star"
                        :class="['w-3 h-3', star <= Math.round(ratingStats.averageScore) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-slate-700']" />
                    </div>
                    <p class="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{{ ratingStats.totalRatings }} {{
                      t('candidateModal.totalRatings') }}</p>
                  </div>
                  <div class="space-y-1">
                    <div v-for="count in [5, 4, 3, 2, 1]" :key="count" class="flex items-center gap-1.5">
                      <span class="text-[10px] text-gray-400 dark:text-slate-500 w-3">{{ count }}</span>
                      <div class="w-16 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div class="h-full bg-amber-400 rounded-full"
                          :style="{ width: ratingStats.totalRatings > 0 ? `${(ratingStats.counts?.[count] || 0) / ratingStats.totalRatings * 100}%` : '0%' }">
                        </div>
                      </div>
                      <span class="text-[10px] text-gray-400 dark:text-slate-500 w-3">{{ ratingStats.counts?.[count] ||
                        0 }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Comment input + Submit -->
              <div
                class="bg-white/70 dark:bg-slate-800/70 rounded-xl border border-amber-200 dark:border-slate-700 p-4 mt-4">
                <p class="text-xs text-gray-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                  <MessageSquare class="w-3 h-3" />
                  {{ t('candidateModal.ratingAsComment') }}
                </p>
                <div class="flex gap-3">
                  <div
                    class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {{ currentUserInitials }}
                  </div>
                  <div class="flex-1">
                    <textarea v-model="newComment" :placeholder="t('candidateModal.ratingNotePlaceholder')" rows="3"
                      class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-500/30 focus:border-amber-300 dark:focus:border-amber-500 resize-none"
                      @keydown.ctrl.enter="submitComment"></textarea>
                    <div class="flex items-center justify-between mt-2">
                      <p class="text-xs text-gray-400 dark:text-slate-500">{{ t('candidateModal.ctrlEnterToSend') }}</p>
                      <button @click="submitComment" :disabled="!tempRating && !userRating"
                        class="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 dark:disabled:bg-amber-800/50 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
                        <Loader2 v-if="submittingComment" class="w-4 h-4 animate-spin" />
                        <Send v-else class="w-4 h-4" />
                        {{ userRating ? t('candidateModal.update') : t('candidateModal.submitComment') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Community Ratings + Comments List -->
          <div v-if="loadingComments" class="flex items-center justify-center py-8">
            <Loader2 class="w-6 h-6 animate-spin text-blue-500" />
          </div>

          <div v-else-if="comments.length === 0"
            class="text-center py-10 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-transparent dark:border-slate-700">
            <MessageSquare class="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
            <p class="text-gray-500 dark:text-slate-400 font-medium">{{ t('candidateModal.noComments') }}</p>
            <p class="text-gray-400 dark:text-slate-500 text-sm">{{ t('candidateModal.beFirstToComment') }}</p>
          </div>

          <div v-else class="space-y-3">
            <div v-for="comment in comments" :key="comment.id"
              class="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 hover:border-gray-200 dark:hover:border-slate-600 transition-colors">
              <div class="flex items-start gap-3">
                <div :class="['w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 bg-gradient-to-br',
                  getAvatarGradient(comment.userName)
                ]">
                  {{ getInitials(comment.userName) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-3 mb-1.5">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-bold text-gray-900 dark:text-white text-sm">{{ comment.userName }}</span>
                      <!-- Rating stars from comment content -->
                      <span v-if="getRatingFromComment(comment.content)" class="flex items-center gap-0.5">
                        <Star v-for="star in 5" :key="star"
                          :class="['w-3 h-3', star <= (getRatingFromComment(comment.content) || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-slate-700']" />
                      </span>
                      <span v-if="comment.isEdited" class="text-[10px] text-gray-400 dark:text-slate-500">({{
                        t('candidateModal.edited') }})</span>
                      <span class="text-[10px] text-gray-400 dark:text-slate-500">{{ formatDate(comment.createdAt)
                        }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <button @click="startEditComment(comment)"
                        class="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors">
                        <Pencil class="w-3.5 h-3.5" />
                      </button>
                      <button @click="removeComment(comment.id)"
                        class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors">
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <!-- Edit Mode -->
                  <div v-if="editingCommentId === comment.id" class="space-y-2">
                    <textarea v-model="editingContent" rows="3"
                      class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 resize-none"></textarea>
                    <div class="flex gap-2">
                      <button @click="saveEditComment(comment.id)" :disabled="!editingContent.trim() || savingComment"
                        class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                        {{ t('common.save') }}
                      </button>
                      <button @click="cancelEditComment"
                        class="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                        {{ t('common.cancel') }}
                      </button>
                    </div>
                  </div>

                  <!-- Normal Content -->
                  <p v-else class="text-gray-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{{
                    getCommentText(comment.content) }}</p>

                  <!-- Reply Toggle -->
                  <div class="flex items-center gap-3 mt-2">
                    <button v-if="comment.replyCount > 0" @click="toggleReplies(comment)"
                      class="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                      <ChevronDown
                        :class="['w-3.5 h-3.5 transition-transform', repliesOpen[comment.id] ? 'rotate-180' : '']" />
                      {{ comment.replyCount }} {{ t('candidateModal.replies') }}
                    </button>
                    <button @click="startReply(comment)"
                      class="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                      <CornerDownRight class="w-3.5 h-3.5" />
                      {{ t('candidateModal.reply') }}
                    </button>
                  </div>

                  <!-- Reply Input -->
                  <div v-if="replyingToId === comment.id"
                    class="mt-3 pl-4 border-l-2 border-blue-100 dark:border-blue-900 space-y-2">
                    <textarea v-model="replyContent"
                      :placeholder="t('candidateModal.replyTo', { name: comment.userName })" rows="2"
                      class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 resize-none"></textarea>
                    <div class="flex gap-2">
                      <button @click="submitReply(comment.id)" :disabled="!replyContent.trim() || submittingReply"
                        class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                        {{ t('candidateModal.send') }}
                      </button>
                      <button @click="cancelReply"
                        class="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                        {{ t('common.cancel') }}
                      </button>
                    </div>
                  </div>

                  <!-- Replies List -->
                  <div v-if="repliesOpen[comment.id] && commentReplies[comment.id]?.length"
                    class="mt-3 space-y-3 pl-4 border-l-2 border-blue-100 dark:border-blue-900">
                    <div v-for="reply in commentReplies[comment.id]" :key="reply.id" class="flex items-start gap-2.5">
                      <div :class="['w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 bg-gradient-to-br',
                        getAvatarGradient(reply.userName)
                      ]">
                        {{ getInitials(reply.userName) }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="font-bold text-gray-800 dark:text-slate-200 text-xs">{{ reply.userName }}</span>
                          <span v-if="reply.isEdited" class="text-[10px] text-gray-400 dark:text-slate-500">({{
                            t('candidateModal.edited') }})</span>
                          <span class="text-[10px] text-gray-400 dark:text-slate-500">{{ formatDate(reply.createdAt)
                            }}</span>
                          <button @click="removeComment(reply.id)"
                            class="ml-auto p-1 text-gray-300 dark:text-slate-600 hover:text-red-400 transition-colors">
                            <Trash2 class="w-3 h-3" />
                          </button>
                        </div>
                        <p class="text-gray-600 dark:text-slate-400 text-xs leading-relaxed">{{
                          getCommentText(reply.content) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Load More -->
          <button v-if="hasMoreComments" @click="loadMoreComments"
            class="w-full py-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:bg-blue-50 dark:hover:bg-slate-800/5xl rounded-xl transition-colors">
            {{ t('candidateModal.loadMoreComments') }}
          </button>
        </div>

        <!-- ── TAB: Hoạt động ── -->
        <div v-show="activeTab === 'activity'" class="space-y-4">
          <!-- Loading State -->
          <div v-if="loadingActivity" class="flex items-center justify-center py-8">
            <Loader2 class="w-6 h-6 animate-spin text-blue-500" />
          </div>

          <!-- Empty State -->
          <div v-else-if="activityLogs.length === 0"
            class="text-center py-10 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-transparent dark:border-slate-700">
            <Activity class="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
            <p class="text-gray-500 dark:text-slate-400 font-medium">{{ t('candidateModal.noActivity') }}</p>
          </div>

          <!-- Activity Logs Timeline -->
          <div v-else class="space-y-0">
            <div v-for="(log, index) in activityLogs" :key="log.id" class="relative pl-8 pb-6 last:pb-0">

              <!-- Timeline connector (Đường nối mốc thời gian) -->
              <div v-if="index < activityLogs.length - 1"
                class="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gray-100 dark:bg-slate-700">
              </div>

              <!-- Timeline dot (Chấm tròn mốc thời gian) -->
              <!-- Lưu ý: Bạn cần đảm bảo hàm getActivityDotColor(log.type) trả về mã màu hợp lý, hoặc ring-white chuyển thành ring-white dark:ring-slate-900 để không lộ viền trắng -->
              <div :class="['absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900',
                getActivityDotColor(log.type)
              ]">
                <component :is="getActivityIcon(log.type)" class="w-3 h-3 text-white" />
              </div>

              <!-- Activity Card -->
              <div
                class="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-4 hover:shadow-sm dark:hover:border-slate-600 transition-all">
                <div class="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                  <div class="min-w-0 flex-1">
                    <p class="text-sm text-gray-900 dark:text-slate-200 leading-relaxed">
                      <span class="font-bold text-gray-900 dark:text-white">{{ log.userName }}</span>
                      {{ getActivityText(log.type) }}
                    </p>
                    <p class="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{{ formatDate(log.createdAt) }}</p>
                  </div>

                  <!-- Badge phân loại hoạt động -->
                  <!-- Lưu ý: Đảm bảo hàm getActivityBadgeClass(log.type) có hỗ trợ sẵn các class dark: chủ động, ví dụ: 'dark:bg-blue-950/40 dark:text-blue-400' -->
                  <span
                    :class="['px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0', getActivityBadgeClass(log.type)]">
                    {{ getActivityTypeName(log.type) }}
                  </span>
                </div>
              </div>

            </div>
          </div>

          <!-- Load More Button -->
          <button v-if="hasMoreActivity" @click="loadMoreActivity"
            class="w-full py-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:bg-blue-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
            {{ t('candidateModal.loadMoreComments') }}
          </button>
        </div>

      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between px-6 pb-5 -mx-6 -mb-5 bg-gray-50 border-t border-gray-100">
        <div class="flex gap-2">
          <button
            @click="toggleShortlist"
            :class="['flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border',
              isShortlisted
                ? 'bg-amber-400 text-amber-900 border-amber-400 shadow-sm hover:bg-amber-300'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            ]"
          >
            <Bookmark :class="['w-4 h-4', isShortlisted ? 'fill-current' : '']" />
            {{ isShortlisted ? t('candidateModal.saved') : t('candidateModal.save') }}
          </button>
          <button @click="downloadCV"
            class="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors">
            <Download class="w-4 h-4" />
            {{ t('candidateModal.downloadCV') }}
          </button>
        </div>
        <button @click="close"
          class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors">
          {{ t('candidateModal.close') }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseModal from '@/components/common/BaseModal.vue';
import commentService, { type CommentResponse } from '@/api/commentService';
import ratingService, { type RatingResponse } from '@/api/ratingService';
import shortlistService from '@/api/shortlistService';
import interactionService, { type InteractionLogResponse, type InteractionType } from '@/api/interactionService';
import type { CandidateProfileResponse } from '@/api/cvService';
import {
  MapPin, Mail, Phone, Zap, FileText, Star, Bookmark, Download, Send,
  Loader2, MessageSquare, Pencil, Trash2, CornerDownRight, ChevronDown,
  Briefcase, GraduationCap, Award, FolderGit2, Globe, Activity, Eye,
  Star as StarIcon, Heart, Share2, X
} from 'lucide-vue-next';
import { store } from '@/store';

const { t } = useI18n();

interface Props {
  isOpen: boolean;
  candidate?: CandidateProfileResponse | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'close'): void }>();

// ─── User Info ─────────────────────────────────────────────────────────────
const currentUser = computed(() => store.getState().auth.user);
const currentUserInitials = computed(() => {
  const name = currentUser.value?.name || currentUser.value?.username || 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
});

// ─── Tabs ───────────────────────────────────────────────────────────────────
const activeTab = ref('overview');
const tabs = computed(() => [
  { id: 'overview', label: t('candidateModal.overview'), icon: FileText, badge: null },
  { id: 'experience', label: t('candidateModal.experience'), icon: Briefcase, badge: null },
  { id: 'feedback', label: t('candidateModal.feedback'), icon: MessageSquare, badge: (totalComments.value > 0 || ratingStats.totalRatings > 0) ? totalComments.value + ratingStats.totalRatings : null },
  { id: 'activity', label: t('candidateModal.activity'), icon: Activity, badge: null },
]);

// ─── Shortlist ───────────────────────────────────────────────────────────────
const isShortlisted = ref(false);
const checkingShortlist = ref(false);

const toggleShortlist = async () => {
  if (!props.candidate?.id) return;
  try {
    if (isShortlisted.value) {
      await shortlistService.removeFromShortlist(props.candidate.id);
      isShortlisted.value = false;
    } else {
      await shortlistService.addToShortlist({ candidateProfileId: props.candidate.id });
      isShortlisted.value = true;
    }
  } catch (error) {
    console.error('Shortlist error:', error);
  }
};

const checkShortlist = async () => {
  if (!props.candidate?.id) return;
  checkingShortlist.value = true;
  try {
    isShortlisted.value = await shortlistService.isShortlisted(props.candidate.id);
  } catch (error) {
    isShortlisted.value = false;
  } finally {
    checkingShortlist.value = false;
  }
};

// ─── Rating ─────────────────────────────────────────────────────────────────
const userRating = ref<number>(0);
const tempRating = ref(0);
const hoveredStar = ref(0);
const submittingComment = ref(false);
const ratingStats = reactive<{ averageScore: number; totalRatings: number; counts?: Record<number, number> }>({
  averageScore: 0, totalRatings: 0
});

const ratingLabels = computed(() => [
  '',
  t('candidateModal.ratingLabels.1'),
  t('candidateModal.ratingLabels.2'),
  t('candidateModal.ratingLabels.3'),
  t('candidateModal.ratingLabels.4'),
  t('candidateModal.ratingLabels.5'),
]);
const scoreColorClass = computed(() => {
  const score = props.candidate?.aiScore || 0;
  if (score >= 80) return 'text-emerald-300';
  if (score >= 60) return 'text-amber-300';
  return 'text-red-300';
});

const setRating = (star: number) => {
  userRating.value = star;
  tempRating.value = star;
};

const deleteRating = async () => {
  if (!props.candidate?.id) return;
  submittingComment.value = true;
  try {
    const uid = currentUser.value?.id;
    const userComment = comments.value.find(c => c.userId === uid);
    if (userComment) {
      await commentService.deleteComment(userComment.id);
    }
    userRating.value = 0;
    newComment.value = '';
    tempRating.value = 0;
    await loadComments();
    computeRatingStats();
  } catch (error) {
    console.error('Delete rating error:', error);
  } finally {
    submittingComment.value = false;
  }
};

const loadRatingStats = async () => {
  if (!props.candidate?.id) return;
  try {
    const data = await ratingService.getRating(props.candidate.id);
    ratingStats.averageScore = data.averageScore || 0;
    ratingStats.totalRatings = data.totalRatings || 0;
  } catch {
    ratingStats.averageScore = 0;
    ratingStats.totalRatings = 0;
  }
};

const computeRatingStats = () => {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  let sum = 0;
  for (const c of comments.value) {
    const r = getRatingFromComment(c.content);
    if (r !== null) {
      counts[r] = (counts[r] || 0) + 1;
      total++;
      sum += r;
    }
  }
  ratingStats.totalRatings = total;
  ratingStats.averageScore = total > 0 ? sum / total : 0;
  ratingStats.counts = counts;
};

const loadUserRating = () => {
  const uid = currentUser.value?.id;
  if (!uid) return;
  const userComment = comments.value.find(c => c.userId === uid);
  if (userComment) {
    const r = getRatingFromComment(userComment.content);
    if (r !== null) {
      userRating.value = r;
      newComment.value = getCommentText(userComment.content);
    }
  }
};

// ─── Comments ───────────────────────────────────────────────────────────────
const comments = ref<CommentResponse[]>([]);
const commentReplies = reactive<Record<string, CommentResponse[]>>({});
const repliesOpen = reactive<Record<string, boolean>>({});
const newComment = ref('');
const editingCommentId = ref<string | null>(null);
const editingContent = ref('');
const savingComment = ref(false);
const replyingToId = ref<string | null>(null);
const replyContent = ref('');
const submittingReply = ref(false);
const loadingComments = ref(false);
const totalComments = ref(0);
const commentsPage = ref(0);
const hasMoreComments = computed(() => comments.value.length < totalComments.value);

const submitComment = async () => {
  if (!newComment.value.trim() || !props.candidate?.id) return;
  if (!tempRating.value && !userRating.value) return;
  submittingComment.value = true;
  try {
    const ratingValue = userRating.value || tempRating.value;
    const content = buildCommentContent(ratingValue, newComment.value.trim());
    const comment = await commentService.createComment({
      candidateProfileId: props.candidate.id,
      content
    });
    comments.value.unshift(comment);
    totalComments.value++;
    userRating.value = ratingValue;
    newComment.value = '';
    tempRating.value = 0;
    computeRatingStats();
  } catch (error) {
    console.error('Submit comment error:', error);
  } finally {
    submittingComment.value = false;
  }
};

const buildCommentContent = (rating: number, text: string): string => {
  return `[⭐${rating}/5]\n${text}`;
};

const getRatingFromComment = (content: string): number | null => {
  const match = content.match(/\[⭐(\d)\/5\]/);
  return match ? parseInt(match[1]) : null;
};

const getCommentText = (content: string): string => {
  return content.replace(/\[⭐\d\/5\]\n?/, '');
};

const startEditComment = (comment: CommentResponse) => {
  editingCommentId.value = comment.id;
  editingContent.value = getCommentText(comment.content);
};

const cancelEditComment = () => {
  editingCommentId.value = null;
  editingContent.value = '';
};

const saveEditComment = async (commentId: string) => {
  if (!editingContent.value.trim()) return;
  savingComment.value = true;
  try {
    const comment = comments.value.find(c => c.id === commentId);
    const existingRating = getRatingFromComment(comment?.content || '');
    const newContent = existingRating
      ? buildCommentContent(existingRating, editingContent.value.trim())
      : editingContent.value.trim();
    const updated = await commentService.updateComment(commentId, { content: newContent });
    const idx = comments.value.findIndex(c => c.id === commentId);
    if (idx >= 0) comments.value[idx] = updated;
    cancelEditComment();
  } catch (error) {
    console.error('Save edit error:', error);
  } finally {
    savingComment.value = false;
  }
};

const removeComment = async (commentId: string) => {
  if (!confirm(t('common.confirmDelete') + '?')) return;
  try {
    await commentService.deleteComment(commentId);
    comments.value = comments.value.filter(c => c.id !== commentId);
    totalComments.value = Math.max(0, totalComments.value - 1);
  } catch (error) {
    console.error('Delete comment error:', error);
  }
};

const toggleReplies = async (comment: CommentResponse) => {
  repliesOpen[comment.id] = !repliesOpen[comment.id];
  if (repliesOpen[comment.id] && !commentReplies[comment.id]) {
    try {
      commentReplies[comment.id] = await commentService.getReplies(comment.id);
    } catch (error) {
      commentReplies[comment.id] = [];
    }
  }
};

const startReply = (comment: CommentResponse) => {
  replyingToId.value = comment.id;
  replyContent.value = '';
};

const cancelReply = () => {
  replyingToId.value = null;
  replyContent.value = '';
};

const submitReply = async (parentId: string) => {
  if (!replyContent.value.trim() || !props.candidate?.id) return;
  submittingReply.value = true;
  try {
    const reply = await commentService.createComment({
      candidateProfileId: props.candidate.id,
      content: replyContent.value.trim(),
      parentId
    });
    if (!commentReplies[parentId]) commentReplies[parentId] = [];
    commentReplies[parentId].push(reply);
    const idx = comments.value.findIndex(c => c.id === parentId);
    if (idx >= 0) comments.value[idx].replyCount++;
    cancelReply();
  } catch (error) {
    console.error('Submit reply error:', error);
  } finally {
    submittingReply.value = false;
  }
};

const loadComments = async () => {
  if (!props.candidate?.id) return;
  loadingComments.value = true;
  try {
    const data = await commentService.getComments(props.candidate.id, commentsPage.value, 10);
    if (commentsPage.value === 0) {
      comments.value = data.content;
    } else {
      comments.value.push(...data.content);
    }
    totalComments.value = data.totalElements;
    computeRatingStats();
    loadUserRating();
  } catch (error) {
    console.error('Load comments error:', error);
  } finally {
    loadingComments.value = false;
  }
};

const loadMoreComments = () => {
  commentsPage.value++;
  loadComments();
};

// ─── Activity Timeline ──────────────────────────────────────────────────────
const activityLogs = ref<InteractionLogResponse[]>([]);
const loadingActivity = ref(false);
const activityPage = ref(0);
const hasMoreActivity = ref(true);

const loadActivity = async () => {
  if (!props.candidate?.id) return;
  loadingActivity.value = true;
  try {
    const data = await interactionService.getCandidateActivity(props.candidate.id, activityPage.value, 15);
    if (activityPage.value === 0) {
      activityLogs.value = data.content;
    } else {
      activityLogs.value.push(...data.content);
    }
    hasMoreActivity.value = !data.last;
  } catch (error) {
    console.error('Load activity error:', error);
  } finally {
    loadingActivity.value = false;
  }
};

const loadMoreActivity = () => {
  activityPage.value++;
  loadActivity();
};

const getActivityIcon = (type: InteractionType) => {
  const map: Record<string, any> = {
    VIEW_PROFILE: Eye,
    ADD_COMMENT: MessageSquare,
    RATE: StarIcon,
    SHORTLIST: Bookmark,
    REMOVE_SHORTLIST: Bookmark,
    DOWNLOAD_CV: Download,
    SHARE: Share2,
  };
  return map[type] || Activity;
};

const getActivityDotColor = (type: InteractionType): string => {
  const map: Record<string, string> = {
    VIEW_PROFILE: 'bg-blue-500',
    ADD_COMMENT: 'bg-green-500',
    RATE: 'bg-amber-500',
    SHORTLIST: 'bg-purple-500',
    REMOVE_SHORTLIST: 'bg-gray-400',
    DOWNLOAD_CV: 'bg-cyan-500',
    SHARE: 'bg-indigo-500',
  };
  return map[type] || 'bg-gray-400';
};

const getActivityBadgeClass = (type: InteractionType): string => {
  const map: Record<string, string> = {
    VIEW_PROFILE: 'bg-blue-100 text-blue-700',
    ADD_COMMENT: 'bg-green-100 text-green-700',
    RATE: 'bg-amber-100 text-amber-700',
    SHORTLIST: 'bg-purple-100 text-purple-700',
    REMOVE_SHORTLIST: 'bg-gray-100 text-gray-600',
    DOWNLOAD_CV: 'bg-cyan-100 text-cyan-700',
    SHARE: 'bg-indigo-100 text-indigo-700',
  };
  return map[type] || 'bg-gray-100 text-gray-600';
};

const getActivityTypeName = (type: InteractionType): string => {
  const map: Record<string, string> = {
    VIEW_PROFILE: 'View Profile',
    ADD_COMMENT: 'Comment',
    RATE: t('candidateModal.rating'),
    SHORTLIST: t('candidateModal.save'),
    REMOVE_SHORTLIST: 'Unsave',
    DOWNLOAD_CV: 'Download CV',
    SHARE: 'Share',
  };
  return t(`candidateModal.${type.toLowerCase()}`, map[type] || type);
};

const getActivityText = (type: InteractionType): string => {
  const map: Record<string, string> = {
    VIEW_PROFILE: t('candidateModal.viewProfile'),
    ADD_COMMENT: t('candidateModal.commented'),
    RATE: t('candidateModal.rated'),
    SHORTLIST: t('candidateModal.shortlisted'),
    REMOVE_SHORTLIST: t('candidateModal.unshortlisted'),
    DOWNLOAD_CV: t('candidateModal.downloadedCV'),
    SHARE: t('candidateModal.shared'),
  };
  return map[type] || 'interacted';
};

// ─── Utils ──────────────────────────────────────────────────────────────────
const initials = computed(() => {
  const name = props.candidate?.fullName;
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
});

const gradients = [
  'from-blue-500 to-purple-500',
  'from-green-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-pink-500 to-rose-500',
  'from-indigo-500 to-violet-500',
];

const getAvatarGradient = (name: string) => {
  const idx = name && name.length > 0 ? name.charCodeAt(0) % gradients.length : 0;
  return gradients[Math.abs(idx)] + ' ' + gradients[Math.abs(idx)];
};

const getInitials = (name: string) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return t('candidateModal.justNow');
  if (minutes < 60) return t('candidateModal.minutesAgo', { n: minutes });
  if (hours < 24) return t('candidateModal.hoursAgo', { n: hours });
  if (days < 7) return t('candidateModal.daysAgo', { n: days });
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const downloadCV = () => {
  console.log('Download CV for:', props.candidate?.cvDocumentId);
};

const close = () => emit('close');

// ─── Watchers ────────────────────────────────────────────────────────────────
watch(() => props.isOpen, async (open) => {
  if (open && props.candidate) {
    activeTab.value = 'overview';
    commentsPage.value = 0;
    activityPage.value = 0;
    comments.value = [];
    activityLogs.value = [];
    userRating.value = 0;
    tempRating.value = 0;
    await Promise.all([
      checkShortlist(),
      loadRatingStats(),
      loadComments(),
      loadActivity(),
    ]);
  }
});

watch(activeTab, (tab) => {
  if ((tab === 'feedback') && comments.value.length === 0) loadComments();
  if (tab === 'activity' && activityLogs.value.length === 0) loadActivity();
});
</script>
