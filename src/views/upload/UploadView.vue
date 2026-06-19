<template>
  <MainLayout>
    <div class="flex flex-col min-h-full">
      <div class="relative overflow-hidden rounded-2xl">
        <div class="absolute inset-0
           bg-linear-to-b
           from-black/0
           via-black/10
           via-40%
           to-black">
        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           STEPPER
      ═══════════════════════════════════════════ -->
      <div
        class="bg-white border-b border-slate-200 dark:bg-slate-800 dark:border-slate-700 py-5 px-12 sticky top-16 z-20">
        <div class="max-w-3xl mx-auto">
          <BaseStepper :steps="steps" :current-step="currentStep" direction="horizontal" :compact="false" />
        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           STEP CONTENT
      ═══════════════════════════════════════════ -->
      <div class="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">

        <!-- ─────────────────────────────────────────
             STEP 1: UPLOAD
        ───────────────────────────────────────── -->
        <div v-if="currentStep === 1" class="p-8 max-w-screen-xl mx-auto">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-1">{{ t('upload.step1.title') }}</h1>
            <p class="text-slate-500 dark:text-slate-400 text-sm">{{ t('upload.step1.subtitle') }}</p>
          </div>
          <div class="grid grid-cols-12 gap-6">
            <!-- Drop Zone + JD -->
            <div class="col-span-8 space-y-5">
              <div @dragover.prevent="isDragging = true" @dragleave="isDragging = false" @drop.prevent="handleDrop"
                @click="triggerFileInput"
                :class="['bg-white dark:bg-slate-800 border-2 border-dashed rounded-2xl cursor-pointer hover:shadow-md transition-shadow group', isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-600']">
                <input ref="fileInput" type="file" accept=".pdf,.doc,.docx" class="hidden" @change="handleFileSelect" />
                <div class="flex flex-col items-center justify-center py-16 px-8 text-center">
                  <div
                    class="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                    <FileUp class="w-10 h-10 text-blue-500" />
                  </div>
                  <h2 class="text-2xl font-bold text-white mb-2">{{ t('upload.step1.dropzone.title') }}</h2>
                  <p class="text-gray-400 text-sm mb-7 max-w-sm">{{ t('upload.step1.dropzone.subtitle') }}</p>
                  <BaseButton variant="primary" size="sm" @click.stop="triggerFileInput">
                    {{ t('upload.step1.dropzone.pickFiles') }}
                  </BaseButton>
                </div>

                <!-- Selected file -->
                <div v-if="selectedFile" class="mx-6 mb-4 p-4 bg-blue-50 rounded-xl">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <FileText class="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-gray-900">{{ selectedFile.name }}</p>
                        <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
                      </div>
                    </div>
                    <button @click.stop="removeFile" class="p-1.5 hover:bg-blue-100 rounded-lg">
                      <X class="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                <!-- Formats -->
                <div class="border-t border-gray-100 px-6 py-4">
                  <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{{
                    t('upload.step1.dropzone.acceptedFormats') }}</p>
                  <div class="flex gap-3">
                    <div
                      class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-gray-50">
                      <div class="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center"><span
                          class="text-white text-[8px] font-bold">P</span></div>
                      PDF
                    </div>
                    <div
                      class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-gray-50">
                      <div class="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center"><span
                          class="text-white text-[8px] font-bold">W</span></div>
                      {{ t('upload.step1.dropzone.word') }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- JD textarea -->
              <div
                class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl p-6 shadow-sm">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText class="w-4 h-4 text-blue-600" /> {{ t('upload.step1.jd.title') }}
                  </h3>
                  <span class="text-xs text-slate-400">{{ t('upload.step1.jd.hint') }}</span>
                </div>
                <BaseTextarea v-model="jobDescription" :rows="5" :placeholder="t('upload.step1.jd.placeholder')"
                  resize="vertical" />
              </div>

              <!-- Auto-Extraction banner -->
              <div
                class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl px-5 py-4 flex items-center gap-4">
                <div
                  class="w-12 h-12 bg-white rounded-full border border-blue-100 shadow-sm flex items-center justify-center">
                  <Sparkles class="w-5 h-5 text-blue-600" />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-white">{{ t('upload.step1.autoExtract.title') }}</p>
                  <p class="text-xs text-gray-400">{{ t('upload.step1.autoExtract.subtitle') }}</p>
                </div>
              </div>
            </div>

            <!-- Extraction Preview -->
            <div
              class="col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl shadow-sm flex flex-col overflow-hidden">
              <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                <h3 class="font-bold text-slate-900 dark:text-white text-lg">{{ t('upload.step1.preview.title') }}</h3>
              </div>
              <div class="flex-1 flex flex-col">
                <!-- PDF Preview -->
                <div v-if="pdfBlobUrl && selectedFile?.type === 'application/pdf'" class="flex-1 min-h-[300px]">
                  <PdfViewer :src="pdfBlobUrl" class="h-full" />
                </div>
                <div v-else-if="selectedFile?.type !== 'application/pdf'"
                  class="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <FileText class="w-16 h-16 text-blue-400 mb-4" />
                  <p class="font-semibold text-white mb-1">{{ selectedFile?.name || t('upload.step1.preview.noFile')
                  }}</p>
                  <p class="text-xs text-gray-400">{{ t('upload.step1.preview.noPreviewWord') }}</p>
                </div>
                <div v-else-if="isUploading" class="flex-1 flex flex-col items-center justify-center p-6">
                  <Loader2 class="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                  <p class="font-semibold text-gray-700 mb-1">{{ t('upload.step1.preview.uploading') }}</p>
                  <p class="text-xs text-gray-400">{{ uploadProgress }}%</p>
                  <BaseProgress :value="uploadProgress" color="blue" size="sm" class="w-full mt-4" />
                </div>
                <div v-else-if="candidateProfile"
                  class="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div class="w-full text-left">
                    <div class="flex items-center gap-2 text-teal-600 mb-4">
                      <CheckCircle class="w-5 h-5" />
                      <span class="font-semibold">{{ t('upload.step1.preview.extracted') }}</span>
                    </div>
                    <div class="space-y-3">
                      <div class="flex items-center gap-2">
                        <User class="w-4 h-4 text-gray-400" />
                        <span class="text-sm text-gray-700 font-medium">{{ candidateProfile.fullName || 'N/A' }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <Mail class="w-4 h-4 text-gray-400" />
                        <span class="text-sm text-gray-600">{{ candidateProfile.email || 'N/A' }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <Briefcase class="w-4 h-4 text-gray-400" />
                        <span class="text-sm text-gray-600">{{ candidateProfile.totalExperienceYears || 0 }} {{
                          t('upload.step1.preview.yearsExp') }}</span>
                      </div>
                      <div class="mt-3">
                        <p class="text-xs text-gray-400 mb-2">{{ t('upload.step1.preview.skillsLabel') }} ({{
                          candidateProfile.skills?.length || 0 }})</p>
                        <div class="flex flex-wrap gap-1">
                          <BaseBadge v-for="skill in (candidateProfile.skills || []).slice(0, 6)" :key="skill"
                            variant="primary" size="sm">{{ skill }}</BaseBadge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Monitor class="w-7 h-7 text-gray-300" />
                  </div>
                  <p class="font-semibold text-gray-700 mb-1">{{ t('upload.step1.preview.noDataTitle') }}</p>
                  <p class="text-xs text-gray-400">{{ t('upload.step1.preview.noDataSubtitle') }}</p>
                </div>
              </div>
              <div class="border-t border-gray-100 p-5">
                <BaseButton variant="primary" class="w-full" :disabled="!candidateProfile || isUploading"
                  :loading="isUploading" @click="goNext">
                  Proceed to Analysis
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Error message -->
          <div v-if="error"
            class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-300 text-sm">
            {{ error }}
          </div>
        </div>

        <!-- ─────────────────────────────────────────
             STEP 2: EXTRACT & VERIFY
        ───────────────────────────────────────── -->
        <div v-if="currentStep === 2" class="flex h-full relative" :key="'step2-' + cvDocument?.id">
          <!-- Loading overlay -->
          <div v-if="isProcessing" class="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
            <div class="text-center">
              <Loader2 class="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p class="font-semibold text-gray-700">{{ t('upload.step2.loading') }}</p>
            </div>
          </div>

          <div class="flex-1 p-8 space-y-6 overflow-y-auto pb-24">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">{{ t('upload.step2.title') }}</h2>
                <p class="text-gray-500 text-sm mt-1">{{ t('upload.step2.subtitle') }}</p>
              </div>
              <BaseBadge variant="success" size="sm">
                <span class="w-1.5 h-1.5 rounded-full bg-current mr-1"></span>
                {{ t('upload.step2.aiConfidence') }}: {{ Math.round(candidateProfile?.aiScore || 85) }}%
              </BaseBadge>
            </div>

            <!-- Photo Upload -->
            <div class="flex flex-col items-center">
              <div class="relative mb-3">
                <div
                  class="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
                  <img v-if="editableFields.photoUrl || photoPreview" :src="photoPreview || editableFields.photoUrl"
                    alt="Profile Photo" class="w-full h-full object-cover" />
                  <Image v-else class="w-8 h-8 text-gray-300" />
                </div>
                <button v-if="editableFields.photoUrl || photoPreview" @click="removePhoto"
                  class="absolute -top-1 -right-1 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shadow-sm">
                  <X class="w-3 h-3" />
                </button>
                <button @click="triggerPhotoInput"
                  class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm">
                  <Upload class="w-3 h-3" />
                </button>
              </div>
              <input ref="photoInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden"
                @change="handlePhotoSelect" />
              <p class="text-xs text-gray-400 text-center">{{ t('upload.photo.hint') }}</p>
            </div>

            <!-- Personal Information -->
            <section class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div class="flex items-center justify-between mb-5">
                <div class="flex items-center gap-2">
                  <User class="w-5 h-5 text-blue-600" />
                  <h3 class="text-lg font-bold text-gray-900">{{ t('upload.step2.personalInfo') }}</h3>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <BaseInput v-model="editableFields.fullName" type="text" :label="t('upload.step2.fullName')" />
                <BaseInput v-model="editableFields.email" type="email" :label="t('upload.step2.email')" />
                <BaseInput v-model="editableFields.phone" type="tel" :label="t('upload.step2.phone')" />
                <BaseInput v-model="editableFields.address" type="text" :label="t('upload.step2.location')" />
                <BaseInput v-model="editableFields.linkedinUrl" type="url" :label="t('upload.step2.linkedin')"
                  class="col-span-2" />
                <BaseInput v-model="editableFields.githubUrl" type="url" :label="t('upload.step2.github')" />
                <BaseInput v-model="editableFields.portfolioUrl" type="url" :label="t('upload.step2.portfolio')" />
              </div>
            </section>

            <!-- Work Experience -->
            <section class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div class="flex items-center justify-between mb-5">
                <div class="flex items-center gap-2">
                  <Briefcase class="w-5 h-5 text-blue-600" />
                  <h3 class="text-lg font-bold text-gray-900">{{ t('upload.step2.workExperience') }}</h3>
                </div>
                <BaseButton variant="secondary" size="sm" @click="addWorkExperience">
                  <Plus class="w-4 h-4 inline mr-1" /> {{ t('upload.step2.add') }}
                </BaseButton>
              </div>
              <div class="space-y-6">
                <div v-for="(exp, idx) in editableFields.workExperiences" :key="idx"
                  class="relative pl-6 border-l-2 border-blue-100">
                  <button @click="removeWorkExperience(idx)"
                    class="absolute -right-2 top-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200">
                    <X class="w-3 h-3" />
                  </button>
                  <div class="grid grid-cols-2 gap-3 mb-3">
                    <BaseInput v-model="exp.position" type="text" :label="t('upload.step2.position')" />
                    <BaseInput v-model="exp.companyName" type="text" :label="t('upload.step2.company')" />
                    <BaseInput v-model="exp.startDate" type="text" :label="t('upload.step2.startDate')" />
                    <BaseInput v-model="exp.endDate" type="text" :label="t('upload.step2.endDate')" />
                    <div class="col-span-2">
                      <label class="text-xs text-gray-400 font-semibold block mb-1">{{ t('upload.step2.description')
                        }}</label>
                      <BaseTextarea v-model="exp.description" :rows="2" resize="none" />
                    </div>
                  </div>
                </div>
                <div v-if="!editableFields.workExperiences.length" class="text-center py-8 text-gray-400">
                  {{ t('upload.step2.noWorkExperience') }}
                </div>
              </div>
            </section>

            <!-- Education -->
            <section class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div class="flex items-center justify-between mb-5">
                <div class="flex items-center gap-2">
                  <GraduationCap class="w-5 h-5 text-blue-600" />
                  <h3 class="text-lg font-bold text-gray-900">{{ t('upload.step2.education') }}</h3>
                </div>
                <BaseButton variant="secondary" size="sm" @click="addEducation">
                  <Plus class="w-4 h-4 inline mr-1" /> {{ t('upload.step2.add') }}
                </BaseButton>
              </div>
              <div class="space-y-4">
                <div v-for="(edu, idx) in editableFields.educations" :key="idx"
                  class="relative p-4 bg-gray-50 rounded-lg">
                  <button @click="removeEducation(idx)"
                    class="absolute -right-2 -top-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200">
                    <X class="w-3 h-3" />
                  </button>
                  <div class="grid grid-cols-2 gap-3">
                    <BaseInput v-model="edu.degree" type="text" :label="t('upload.step2.degree')" />
                    <BaseInput v-model="edu.schoolName" type="text" :label="t('upload.step2.institution')" />
                    <BaseInput v-model="edu.major" type="text" :label="t('upload.step2.major')" />
                    <BaseInput v-model="edu.endDate" type="text" :label="t('upload.step2.year')" />
                  </div>
                </div>
                <div v-if="!editableFields.educations.length" class="text-center py-8 text-gray-400">
                  {{ t('upload.step2.noEducation') }}
                </div>
              </div>
            </section>

            <!-- Technical Skills -->
            <section class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div class="flex items-center justify-between mb-5">
                <div class="flex items-center gap-2">
                  <Brain class="w-5 h-5 text-blue-600" />
                  <h3 class="text-lg font-bold text-gray-900">{{ t('upload.step2.technicalSkills') }}</h3>
                </div>
              </div>
              <BaseTagInput v-model="editableFields.skills" :placeholder="t('upload.step2.addSkillPlaceholder')" />
            </section>

            <!-- Summary -->
            <section class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div class="flex items-center gap-2 mb-4">
                <FileText class="w-5 h-5 text-blue-600" />
                <h3 class="text-lg font-bold text-gray-900">{{ t('upload.step2.professionalSummary') }}</h3>
              </div>
              <BaseTextarea v-model="editableFields.summary" :rows="4" resize="none" />
            </section>

            <!-- Projects -->
            <section class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div class="flex items-center justify-between mb-5">
                <div class="flex items-center gap-2">
                  <FolderOpen class="w-5 h-5 text-blue-600" />
                  <h3 class="text-lg font-bold text-gray-900">{{ t('upload.step2.projects') }}</h3>
                </div>
                <BaseButton variant="secondary" size="sm" @click="addProject">
                  <Plus class="w-4 h-4 inline mr-1" /> {{ t('upload.step2.add') }}
                </BaseButton>
              </div>
              <div class="space-y-5">
                <div v-for="(proj, idx) in editableFields.projects" :key="idx"
                  class="relative pl-6 border-l-2 border-blue-100">
                  <button @click="removeProject(idx)"
                    class="absolute -right-2 top-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200">
                    <X class="w-3 h-3" />
                  </button>
                  <div class="grid grid-cols-2 gap-3 mb-3">
                    <BaseInput v-model="proj.projectName" type="text" :label="t('upload.step2.projectName')" />
                    <BaseInput v-model="proj.role" type="text" :label="t('upload.step2.role')" />
                    <BaseInput v-model="proj.projectUrl" type="url" :label="t('upload.step2.url')" class="col-span-2" />
                    <div class="col-span-2">
                      <label class="text-xs text-gray-400 font-semibold block mb-1">{{ t('upload.step2.description')
                        }}</label>
                      <BaseTextarea v-model="proj.description" :rows="2" resize="none" />
                    </div>
                  </div>
                </div>
                <div v-if="!editableFields.projects.length" class="text-center py-8 text-gray-400">
                  {{ t('upload.step2.noProjects') }}
                </div>
              </div>
            </section>

            <!-- Certificates -->
            <section class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div class="flex items-center justify-between mb-5">
                <div class="flex items-center gap-2">
                  <Award class="w-5 h-5 text-blue-600" />
                  <h3 class="text-lg font-bold text-gray-900">{{ t('upload.step2.certificates') }}</h3>
                </div>
                <BaseButton variant="secondary" size="sm" @click="addCertificate">
                  <Plus class="w-4 h-4 inline mr-1" /> {{ t('upload.step2.add') }}
                </BaseButton>
              </div>
              <div class="space-y-4">
                <div v-for="(cert, idx) in editableFields.certificates" :key="idx"
                  class="relative p-4 bg-gray-50 rounded-lg">
                  <button @click="removeCertificate(idx)"
                    class="absolute -right-2 -top-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200">
                    <X class="w-3 h-3" />
                  </button>
                  <div class="grid grid-cols-2 gap-3">
                    <BaseInput v-model="cert.certificateName" type="text" :label="t('upload.step2.certificateName')" />
                    <BaseInput v-model="cert.organization" type="text" :label="t('upload.step2.organization')" />
                    <BaseInput v-model="cert.issueDate" type="text" :label="t('upload.step2.issueDate')" />
                    <BaseInput v-model="cert.expiryDate" type="text" :label="t('upload.step2.expiryDate')" />
                  </div>
                </div>
                <div v-if="!editableFields.certificates.length" class="text-center py-8 text-gray-400">
                  {{ t('upload.step2.noCertificates') }}
                </div>
              </div>
            </section>

            <!-- Languages -->
            <section class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div class="flex items-center gap-2 mb-4">
                <Globe class="w-5 h-5 text-blue-600" />
                <h3 class="text-lg font-bold text-gray-900">{{ t('upload.step2.languages') }}</h3>
              </div>
              <BaseTagInput v-model="editableFields.languages"
                :placeholder="t('upload.step2.addLanguagePlaceholder')" />
            </section>
          </div>

          <!-- PDF Preview Panel -->
          <div class="w-[420px] bg-white border-l border-gray-200 flex flex-col shrink-0">
            <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText class="w-4 h-4 text-gray-400" /> {{ cvDocument?.originalFileName ||
                  t('upload.step2.cvPreview') }}
              </div>
              <BaseButton variant="secondary" size="sm" @click="downloadOptimizedPdf" :disabled="isDownloading">
                <Loader2 v-if="isDownloading" class="w-3 h-3 animate-spin" />
                <Download v-else class="w-3 h-3" />
                Download
              </BaseButton>
            </div>
            <div class="flex-1 bg-gray-100 overflow-hidden">
              <PdfViewer v-if="pdfBlobUrl && !pdfLoadError && cvDocument?.fileType === 'PDF'" :src="pdfBlobUrl"
                class="h-full" />
              <div v-else-if="isPdfLoading" class="flex flex-col items-center justify-center h-full p-6 text-center">
                <Loader2 class="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
                <p class="text-sm text-gray-500">{{ t('upload.step2.loadingPdf') }}</p>
              </div>
              <div v-else-if="pdfLoadError" class="flex flex-col items-center justify-center h-full p-6 text-center">
                <FileX class="w-12 h-12 text-red-400 mb-3" />
                <p class="text-sm font-medium text-gray-700 mb-1">{{ t('upload.step2.cannotLoadPdf') }}</p>
                <p class="text-xs text-gray-400">{{ t('upload.step2.tryReload') }}</p>
              </div>
              <div v-else-if="!cvDocument" class="flex flex-col items-center justify-center h-full p-6 text-center">
                <FileText class="w-12 h-12 text-gray-300 mb-3" />
                <p class="text-sm font-medium text-gray-500">{{ t('upload.step2.noCvFile') }}</p>
                <p class="text-xs text-gray-400">{{ t('upload.step2.uploadToSeePreview') }}</p>
              </div>
              <div v-else-if="cvDocument?.fileType === 'DOCX'"
                class="flex flex-col items-center justify-center h-full p-6 text-center">
                <FileText class="w-12 h-12 text-blue-400 mb-3" />
                <p class="text-sm font-medium text-gray-700 mb-1">{{ t('upload.step2.docxFile') }}</p>
                <p class="text-xs text-gray-400">{{ t('upload.step2.previewNotAvailable') }}</p>
                <BaseButton variant="primary" size="sm" @click="downloadOptimizedPdf" :disabled="isDownloading"
                  class="mt-3">
                  <Loader2 v-if="isDownloading" class="w-3 h-3 animate-spin inline mr-1" />
                  Download
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <!-- ─────────────────────────────────────────
             STEP 3: ANALYSIS RESULTS
        ───────────────────────────────────────── -->
        <div v-if="currentStep === 3" class="p-8 max-w-screen-xl mx-auto">
          <!-- JD Warning Banner -->
          <div v-if="!jobDescription.trim()"
            class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-bold text-amber-800">{{ t('upload.noJdWarning') }}</p>
              <p class="text-xs text-amber-600 mt-0.5">{{ t('upload.noJdWarningDesc') }}</p>
            </div>
          </div>

          <div class="flex items-center justify-between mb-6">
            <h2 class="text-3xl font-bold text-gray-900">{{ t('upload.step3.title') }}</h2>
            <div class="flex items-center gap-2 text-blue-600 font-semibold text-sm">
              <CheckCircle class="w-4 h-4" /> {{ t('upload.step3.verified') }}
            </div>
          </div>
          <div class="grid grid-cols-12 gap-6">
            <!-- Left: scores + feedback -->
            <div class="col-span-8 space-y-6">
              <div class="grid grid-cols-2 gap-6">
                <!-- Score ring -->
                <div
                  class="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
                  <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{{
                    t('upload.step3.overallScore') }}</p>
                  <BaseScoreRing :score="matchResult?.matchScore || candidateProfile?.aiScore || 0" size="md"
                    color="blue" />
                  <span class="mt-4 px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold">{{
                    getScoreLabel(matchResult?.matchScore || candidateProfile?.aiScore || 0) }}</span>
                </div>

                <!-- Match Dimensions -->
                <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">{{
                    t('upload.step3.matchDimensions') }}</p>
                  <div class="space-y-4">
                    <div v-for="dim in matchDimensions" :key="dim.label">
                      <div class="flex justify-between text-sm mb-1.5">
                        <span class="font-semibold text-gray-700">{{ dim.label }}</span>
                        <span class="text-blue-600 font-bold">{{ dim.value }}%</span>
                      </div>
                      <BaseProgress :value="dim.value" color="blue" size="sm" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Strengths & Gaps -->
              <div class="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <div class="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <div class="flex items-center gap-2 text-teal-600 mb-4">
                      <CheckCircle class="w-5 h-5" />
                      <h3 class="font-bold text-gray-900 text-lg">{{ t('upload.step3.strengths') }}</h3>
                    </div>
                    <ul class="space-y-3">
                      <li v-for="s in strengths" :key="s" class="flex gap-3 text-sm text-gray-500">
                        <span class="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 shrink-0"></span>{{ s }}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div class="flex items-center gap-2 text-red-500 mb-4">
                      <AlertTriangle class="w-5 h-5" />
                      <h3 class="font-bold text-gray-900 text-lg">{{ t('upload.step3.gaps') }}</h3>
                    </div>
                    <ul class="space-y-3">
                      <li v-for="g in gaps" :key="g" class="flex gap-3 text-sm text-gray-500">
                        <span class="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 shrink-0"></span>{{ g }}
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="border-t border-gray-100 pt-6">
                  <div class="flex items-center gap-2 text-blue-600 mb-4">
                    <Sparkles class="w-5 h-5" />
                    <h3 class="font-bold text-gray-900 text-lg">{{ t('upload.step3.aiRecommendations') }}</h3>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div v-for="rec in recommendations" :key="rec.title"
                      class="p-4 rounded-lg bg-blue-50 border border-blue-100">
                      <p class="text-sm font-bold text-blue-700 mb-1">{{ rec.title }}</p>
                      <p class="text-xs text-gray-500">{{ rec.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Insights sidebar -->
            <div class="col-span-4 space-y-4">
              <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div class="flex items-center justify-between mb-5">
                  <h3 class="font-bold text-gray-900">{{ t('upload.step3.aiSummary') }}</h3>
                </div>
                <p class="text-sm text-gray-600 leading-relaxed mb-4">
                  {{ matchResult?.summary || candidateProfile?.aiSummary || 'No summary available' }}
                </p>
                <div v-if="candidateProfile?.suggestedPositions?.length" class="mt-4">
                  <p class="text-xs font-bold text-gray-400 uppercase mb-2">{{ t('upload.step3.suggestedPositions') }}
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <BaseBadge v-for="pos in candidateProfile.suggestedPositions" :key="pos" variant="success"
                      size="sm">{{ pos }}</BaseBadge>
                  </div>
                </div>
              </div>

              <!-- Matched/Missing Skills -->
              <div v-if="matchResult" class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <p class="text-xs font-bold text-gray-400 uppercase mb-3">{{ t('upload.step3.matchedSkills') }}</p>
                <div class="flex flex-wrap gap-1 mb-4">
                  <BaseBadge v-for="skill in matchResult.matchedSkills" :key="skill" variant="success" size="sm">{{
                    skill }}</BaseBadge>
                </div>
                <p class="text-xs font-bold text-gray-400 uppercase mb-3">{{ t('upload.step3.missingSkills') }}</p>
                <div class="flex flex-wrap gap-1">
                  <BaseBadge v-for="skill in matchResult.missingSkills" :key="skill" variant="danger" size="sm">{{ skill
                    }}</BaseBadge>
                </div>
              </div>

              <!-- File card + CTA -->
              <div class="bg-blue-600 rounded-xl p-5 text-white flex items-center gap-4">
                <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <FileText class="w-6 h-6" />
                </div>
                <div class="flex-1">
                  <p class="font-bold">{{ cvDocument?.originalFileName || t('upload.step3.defaultFilename') }}</p>
                  <p class="text-blue-200 text-xs mt-0.5">{{ t('upload.step3.score') }}: {{
                    Math.round(matchResult?.matchScore ||
                      candidateProfile?.aiScore || 0) }}%</p>
                </div>
              </div>

              <!-- Proceed to Export CTA -->
              <div class="bg-linear-gradient-to-br from-teal-500 to-blue-600 rounded-xl p-5 text-white">
                <div class="flex items-center gap-2 mb-2">
                  <FileDown class="w-5 h-5" />
                  <h3 class="font-bold text-base">{{ t('upload.step3.exportTitle') }}</h3>
                </div>
                <p class="text-blue-100 text-xs mb-4">{{ t('upload.step3.exportDesc') }}</p>
                <BaseButton variant="secondary" class="w-full" @click="proceedToExport">
                  <Download class="w-4 h-4" /> {{ t('upload.step3.chooseTemplateExport') }}
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <!-- ─────────────────────────────────────────
             STEP 4: OPTIMIZATION
        ───────────────────────────────────────── -->
        <div v-if="currentStep === 4" class="p-8 max-w-screen-2xl mx-auto">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-3xl font-bold text-gray-900">{{ t('upload.step4.title') }}</h2>
              <p class="text-gray-500 text-sm mt-1">{{ t('upload.step4.subtitle') }}</p>
            </div>
            <div class="flex items-center gap-3">
              <BaseButton variant="secondary" @click="skipOptimization">
                {{ t('upload.skipOptimize') }}
              </BaseButton>
              <BaseButton variant="primary" @click="downloadOptimizedPdf" :disabled="isDownloading || !cvDocument"
                :loading="isDownloading">
                <Download v-if="!isDownloading" class="w-4 h-4" /> {{ isDownloading ? t('upload.step4.generating') :
                  t('upload.step4.downloadPdf') }}
              </BaseButton>
            </div>
          </div>

          <!-- Full CV Comparison -->
          <div class="mt-6 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Eye class="w-5 h-5 text-blue-600" />
                <h3 class="font-bold text-gray-900">{{ t('upload.step4.comparison') }}</h3>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-semibold rounded-lg">{{
                  t('upload.step4.original') }}</span>
                <span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-lg">{{
                  t('upload.step4.optimized') }}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 divide-x divide-gray-100">
              <!-- Left: Original CV Form -->
              <div class="p-8 bg-gray-50/50 max-h-[700px] overflow-y-auto">
                <div class="cv-preview bg-white shadow-sm">
                  <div class="cv-header">
                    <h1 class="cv-name">{{ editableFields.fullName || 'Your Name' }}</h1>
                    <div class="cv-contact-row">
                      <span v-if="editableFields.email" class="cv-contact-item">{{ editableFields.email }}</span>
                      <span v-if="editableFields.phone" class="cv-contact-item">{{ editableFields.phone }}</span>
                      <span v-if="editableFields.address" class="cv-contact-item">{{ editableFields.address }}</span>
                    </div>
                    <div v-if="editableFields.linkedinUrl" class="cv-link">{{ editableFields.linkedinUrl }}</div>
                  </div>

                  <div v-if="editableFields.summary" class="cv-content-section">
                    <h2 class="cv-section-title">{{ t('upload.step4.cvSummary') }}</h2>
                    <p class="cv-text">{{ editableFields.summary }}</p>
                  </div>

                  <div v-if="editableFields.skills.length > 0" class="cv-content-section">
                    <h2 class="cv-section-title">{{ t('upload.step4.cvSkills') }}</h2>
                    <div class="cv-skills-list">
                      <span v-for="skill in editableFields.skills" :key="skill" class="cv-skill-tag">{{ skill }}</span>
                    </div>
                  </div>

                  <div v-if="editableFields.workExperiences.length > 0" class="cv-content-section">
                    <h2 class="cv-section-title">{{ t('upload.step4.cvWorkExperience') }}</h2>
                    <div v-for="(exp, idx) in editableFields.workExperiences" :key="idx" class="cv-experience-item">
                      <div class="cv-exp-header">
                        <span class="cv-exp-position">{{ exp.position || t('upload.step4.position') }}</span>
                        <span class="cv-exp-company">{{ exp.companyName || t('upload.step4.company') }}</span>
                      </div>
                      <div class="cv-exp-date">{{ exp.startDate }}{{ exp.endDate ? ` - ${exp.endDate}` : ` -
                        ${t('upload.step4.present')}` }}
                      </div>
                      <p v-if="exp.description" class="cv-text">{{ exp.description }}</p>
                    </div>
                  </div>

                  <div v-if="editableFields.educations.length > 0" class="cv-content-section">
                    <h2 class="cv-section-title">{{ t('upload.step4.cvEducation') }}</h2>
                    <div v-for="(edu, idx) in editableFields.educations" :key="idx" class="cv-education-item">
                      <div class="cv-exp-header">
                        <span class="cv-exp-position">{{ edu.degree || t('upload.step4.degree') }}</span>
                        <span class="cv-exp-company">{{ edu.schoolName || t('upload.step4.school') }}</span>
                      </div>
                      <div class="cv-exp-date">
                        {{ [edu.major, edu.endDate].filter(Boolean).join(' - ') }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right: Optimized CV Form -->
              <div class="p-8 bg-green-50/30 max-h-[700px] overflow-y-auto">
                <div v-if="isOptimizing" class="flex flex-col items-center justify-center py-20">
                  <Loader2 class="w-12 h-12 text-blue-500 animate-spin mb-4" />
                  <p class="text-gray-500 font-medium">{{ t('upload.step4.generatingCv') }}</p>
                </div>
                <div v-else-if="optimizeResult" class="cv-preview cv-preview-optimized">
                  <div class="cv-header">
                    <h1 class="cv-name cv-name-optimized">{{ editableFields.fullName || t('upload.step4.yourName') }}
                    </h1>
                    <div class="cv-contact-row">
                      <span v-if="editableFields.email" class="cv-contact-item">{{ editableFields.email }}</span>
                      <span v-if="editableFields.phone" class="cv-contact-item">{{ editableFields.phone }}</span>
                      <span v-if="editableFields.address" class="cv-contact-item">{{ editableFields.address }}</span>
                    </div>
                    <div v-if="editableFields.linkedinUrl" class="cv-link">{{ editableFields.linkedinUrl }}</div>
                  </div>

                  <div class="cv-content-section">
                    <h2 class="cv-section-title">
                      {{ t('upload.step4.cvSummary') }}
                      <span class="cv-ai-badge">{{ t('upload.step4.aiEnhanced') }}</span>
                    </h2>
                    <p class="cv-text cv-text-improved">{{ getOptimizedSummary() }}</p>
                  </div>

                  <div class="cv-content-section">
                    <h2 class="cv-section-title">
                      {{ t('upload.step4.cvSkills') }}
                      <span class="cv-ai-badge">{{ t('upload.step4.aiEnhanced') }}</span>
                    </h2>
                    <div class="cv-skills-list">
                      <span v-for="skill in getOptimizedSkills()" :key="skill" class="cv-skill-tag cv-skill-improved">{{
                        skill
                        }}</span>
                    </div>
                  </div>

                  <div class="cv-content-section">
                    <h2 class="cv-section-title">
                      {{ t('upload.step4.cvWorkExperience') }}
                      <span class="cv-ai-badge">{{ t('upload.step4.aiEnhanced') }}</span>
                    </h2>
                    <div v-for="(exp, idx) in editableFields.workExperiences" :key="idx" class="cv-experience-item">
                      <div class="cv-exp-header">
                        <span class="cv-exp-position">{{ exp.position || t('upload.step4.position') }}</span>
                        <span class="cv-exp-company">{{ exp.companyName || t('upload.step4.company') }}</span>
                      </div>
                      <div class="cv-exp-date">{{ exp.startDate }}{{ exp.endDate ? ` - ${exp.endDate}` : ` -
                        ${t('upload.step4.present')}` }}
                      </div>
                      <p v-if="exp.description" class="cv-text cv-text-improved">{{
                        getOptimizedDescription(exp.description,
                          idx) }}</p>
                    </div>
                  </div>

                  <div class="cv-content-section">
                    <h2 class="cv-section-title">{{ t('upload.step4.cvEducation') }}</h2>
                    <div v-for="(edu, idx) in editableFields.educations" :key="idx" class="cv-education-item">
                      <div class="cv-exp-header">
                        <span class="cv-exp-position">{{ edu.degree || t('upload.step4.degree') }}</span>
                        <span class="cv-exp-company">{{ edu.schoolName || t('upload.step4.school') }}</span>
                      </div>
                      <div class="cv-exp-date">
                        {{ [edu.major, edu.endDate].filter(Boolean).join(' - ') }}
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="flex flex-col items-center justify-center py-20 text-center">
                  <Sparkles class="w-16 h-16 text-gray-300 mb-4" />
                  <p class="text-gray-400 font-medium">{{ t('upload.step4.clickOptimize') }}</p>
                  <BaseButton variant="primary" size="sm" @click="startOptimization" class="mt-3">
                    <Sparkles class="w-4 h-4" /> {{ t('upload.optimizeWithAi') }}
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>

          <!-- Optimization Instructions -->
          <div v-if="optimizeResult" class="mt-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 class="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Pencil class="w-4 h-4 text-orange-500" />{{ t('upload.step4.additionalInstructions') }}
            </h3>
            <div class="flex gap-4">
              <BaseTextarea v-model="optimizationInstructions" :placeholder="t('upload.step4.instructionsPlaceholder')"
                :rows="3" resize="vertical" class="flex-1" />
              <BaseButton variant="primary" @click="reOptimize" :disabled="isOptimizing" :loading="isOptimizing"
                class="shrink-0">
                <RefreshCw :class="['w-5 h-5', isOptimizing && 'animate-spin']" />
                <span>{{ isOptimizing ? t('upload.step4.optimizing') : t('upload.step4.reOptimize') }}</span>
              </BaseButton>
            </div>
          </div>

          <!-- Optimization Score & Highlights -->
          <div v-if="optimizeResult" class="mt-6 grid grid-cols-3 gap-6">
            <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <p class="text-xs font-bold text-gray-400 uppercase mb-4">{{ t('upload.step4.optimizationScore') }}</p>
              <div class="flex items-center gap-4">
                <div class="text-4xl font-bold text-blue-600">{{ optimizeResult?.optimizationScore || 0 }}</div>
                <div class="text-sm text-gray-400">/ 100</div>
              </div>
              <BaseProgress :value="optimizeResult?.optimizationScore || 0" color="blue" size="md" class="mt-3" />
            </div>

            <div class="col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <p class="text-xs font-bold text-gray-400 uppercase mb-4">{{ t('upload.step4.aiImprovements') }}</p>
              <div class="grid grid-cols-2 gap-4">
                <div v-for="h in optimizationHighlights" :key="h.title" class="flex items-center gap-3">
                  <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', h.bg]">
                    <component :is="h.icon" :class="['w-5 h-5', h.color]" />
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900 text-sm">{{ h.title }}</p>
                    <p class="text-xs text-gray-500">{{ h.desc }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ─────────────────────────────────────────
             STEP 5: EXPORT CV TEMPLATES
        ───────────────────────────────────────── -->
        <div v-if="currentStep === 5" class="p-8 max-w-screen-xl mx-auto">
          <div class="mb-6">
            <h2 class="text-3xl font-bold text-gray-900">{{ t('upload.exportTitle') }}</h2>
            <p class="text-gray-500 text-sm mt-1">{{ t('upload.exportDesc') }}</p>
          </div>

          <!-- CV Photo Card -->
          <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
            <h3 class="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Image class="w-4 h-4 text-blue-600" />
              {{ t('upload.photo.sectionTitle') }}
            </h3>
            <div class="flex items-center gap-6">
              <div class="flex flex-col items-center">
                <div
                  class="w-28 h-28 rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
                  <img v-if="editableFields.photoUrl || photoPreview" :src="photoPreview || editableFields.photoUrl"
                    alt="CV Photo" class="w-full h-full object-cover" />
                  <Image v-else class="w-10 h-10 text-gray-300" />
                </div>
                <p v-if="isUploadingPhoto" class="text-xs text-blue-500 mt-2">{{ t('upload.photo.uploading') }}</p>
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-600 mb-3">{{ t('upload.photo.step5Desc') }}</p>
                <div class="flex items-center gap-3">
                  <BaseButton variant="primary" size="sm" @click="triggerPhotoInput">
                    <Upload class="w-4 h-4" />
                    {{ t('upload.photo.uploadPhoto') }}
                  </BaseButton>
                  <BaseButton v-if="editableFields.photoUrl" variant="secondary" size="sm" @click="removePhoto">
                    <X class="w-4 h-4" />
                    {{ t('upload.photo.removePhoto') }}
                  </BaseButton>
                </div>
                <p class="text-xs text-gray-400 mt-2">{{ t('upload.photo.allowedFormats') }}</p>
              </div>
            </div>
            <input ref="photoInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden"
              @change="handlePhotoSelect" />
          </div>

          <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <CvTemplateSelector :template-data="cvTemplateData" @cancel="goBack" @downloaded="handleCvDownloaded" />
          </div>
        </div>

      </div>

      <!-- ═══════════════════════════════════════════
           FOOTER ACTION BAR
      ═══════════════════════════════════════════ -->
      <footer
        class="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-12 h-20 flex items-center justify-between shrink-0 sticky bottom-0 z-20">
        <BaseButton variant="ghost" @click="goBack" :disabled="currentStep === 1">
          <ArrowLeft class="w-4 h-4" /> {{ t('common.back') }}
        </BaseButton>
        <div class="flex items-center gap-4">
          <!-- Step 1 -->
          <BaseButton v-if="currentStep === 1" variant="primary" @click="goNext" :disabled="!canProceed"
            :loading="isProcessing">
            {{ t('upload.step1.proceed') }}
            <ArrowRight v-if="!isProcessing" class="w-4 h-4" />
          </BaseButton>
          <!-- Step 2 -->
          <BaseButton v-else-if="currentStep === 2" variant="primary" @click="goNext" :disabled="isProcessing"
            :loading="isProcessing">
            {{ isProcessing ? t('upload.step2.analyzing') : t('upload.step2.reviewWithJd') }}
            <ArrowRight v-if="!isProcessing" class="w-4 h-4" />
          </BaseButton>
          <!-- Step 3: no footer button -->
          <div v-else-if="currentStep === 3" class="text-sm text-slate-500">
            {{ t('upload.step3.footerHint') }}
          </div>
          <!-- Step 4 -->
          <BaseButton v-else-if="currentStep === 4" variant="primary" @click="proceedToExport">
            <Download class="w-4 h-4" /> {{ t('upload.step4.exportCvTemplate') }}
          </BaseButton>
          <!-- Step 5 -->
          <div v-else-if="currentStep === 5" class="text-sm text-slate-500">
            {{ t('upload.step5.footerHint') }}
          </div>
        </div>
      </footer>

    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import MainLayout from '@/layouts/MainLayout.vue';
import PdfViewer from '@/components/common/PdfViewer.vue';
import CvTemplateSelector from '@/components/cv-templates/CvTemplateSelector.vue';
import BaseStepper from '@/components/base/BaseStepper.vue';
import { BaseButton, BaseInput, BaseBadge, BaseTextarea, BaseTagInput, BaseProgress, BaseScoreRing } from '@/components/base';
import cvService from '@/api/cvService';
import imageService from '@/api/imageService';
import type {
  CvDocumentResponse,
  CandidateProfileResponse,
  JdMatchResponse,
  OptimizeCvResponse,
  WorkExperienceResponse,
  EducationResponse,
  CertificateResponse,
  ProjectResponse,
  OptimizationHighlight
} from '@/api/cvService';

import {
  FileUp, FileText, X, Sparkles, Monitor,
  Plus, User, Briefcase, GraduationCap, Brain,
  CheckCircle, AlertTriangle, ArrowLeft, ArrowRight,
  Download, Pencil, RefreshCw, Star, TrendingUp, KeyRound, Paintbrush, CheckCheck,
  Loader2, Mail, FileX, Eye, FileDown, Award, Globe, FolderOpen, Image, Upload
} from 'lucide-vue-next';
import { useCvTemplate } from '@/composables/useCvTemplate';

const { t } = useI18n();
const currentStep = ref(1);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const isDragging = ref(false);
const jobDescription = ref('');
const isUploading = ref(false);
const isOptimizing = ref(false);
const isProcessing = ref(false);
const isDownloading = ref(false);
const uploadProgress = ref(0);
const error = ref('');
const hasReviewedWithJd = ref(false);
const photoInput = ref<HTMLInputElement | null>(null);
const isUploadingPhoto = ref(false);
const photoPreview = ref<string | null>(null);

const pdfBlobUrl = ref<string | null>(null);
const pdfLoadError = ref(false);
const isPdfLoading = ref(false);
const optimizedPdfBlobUrl = ref<string | null>(null);

const cvDocument = ref<CvDocumentResponse | null>(null);
const candidateProfile = ref<CandidateProfileResponse | null>(null);
const matchResult = ref<JdMatchResponse | null>(null);
const optimizeResult = ref<OptimizeCvResponse | null>(null);

const { fillFromEditable } = useCvTemplate();
const cvTemplateData = computed(() => fillFromEditable(editableFields));

const resetAllState = () => {
  cvDocument.value = null;
  candidateProfile.value = null;
  matchResult.value = null;
  optimizeResult.value = null;
  hasReviewedWithJd.value = false;

  editableFields.fullName = '';
  editableFields.email = '';
  editableFields.phone = '';
  editableFields.address = '';
  editableFields.linkedinUrl = '';
  editableFields.githubUrl = '';
  editableFields.portfolioUrl = '';
  editableFields.photoUrl = '';
  editableFields.summary = '';
  editableFields.totalExperienceYears = 0;
  editableFields.skills = [];
  editableFields.workExperiences = [];
  editableFields.educations = [];
  editableFields.projects = [];
  editableFields.certificates = [];
  editableFields.languages = [];

  if (pdfBlobUrl.value) { window.URL.revokeObjectURL(pdfBlobUrl.value); pdfBlobUrl.value = null; }
  if (optimizedPdfBlobUrl.value) { window.URL.revokeObjectURL(optimizedPdfBlobUrl.value); optimizedPdfBlobUrl.value = null; }
  pdfLoadError.value = false;
  optimizationInstructions.value = '';
  error.value = '';
};

const steps = computed(() => [
  { label: t('upload.steps.upload') },
  { label: t('upload.steps.extractVerify') },
  { label: t('upload.steps.analysis') },
  { label: t('upload.steps.optimize') },
  { label: t('upload.steps.export') },
]);

const canProceed = computed(() => {
  if (isProcessing.value || isUploading.value) return false;
  switch (currentStep.value) {
    case 1: return !!candidateProfile.value;
    case 2: return true;
    case 3: return true;
    case 4: return true;
    case 5: return true;
    default: return true;
  }
});

const editableFields = reactive({
  fullName: '', email: '', phone: '', address: '',
  linkedinUrl: '', githubUrl: '', portfolioUrl: '',
  photoUrl: '', summary: '', totalExperienceYears: 0,
  skills: [] as string[],
  workExperiences: [] as { companyName: string; position: string; startDate: string; endDate: string; description: string }[],
  educations: [] as { schoolName: string; degree: string; major: string; startDate: string; endDate: string }[],
  projects: [] as { projectName: string; role: string; description: string; projectUrl: string; technologies: string[] }[],
  certificates: [] as { certificateName: string; organization: string; issueDate: string; expiryDate: string }[],
  languages: [] as string[],
});

const optimizationInstructions = ref('');

const matchDimensions = computed(() => [
  { label: t('upload.step3.dimSkillMatching'), value: Math.round((matchResult.value?.matchScore || candidateProfile.value?.aiScore || 75) * 0.9) },
  { label: t('upload.step3.dimExperienceRelevance'), value: Math.round((candidateProfile.value?.aiScore || 75) * 0.85) },
  { label: t('upload.step3.dimCultureFit'), value: Math.round((candidateProfile.value?.aiScore || 75) * 0.95) },
]);

const strengths = computed(() => {
  const list: string[] = [];
  if (candidateProfile.value?.skills?.length) list.push(t('upload.step3.strongSkills', { skills: candidateProfile.value.skills.slice(0, 3).join(', ') }));
  if (candidateProfile.value?.totalExperienceYears && candidateProfile.value.totalExperienceYears > 2) list.push(t('upload.step3.experiencedPro', { years: candidateProfile.value.totalExperienceYears }));
  if (candidateProfile.value?.suggestedPositions?.length) list.push(t('upload.step3.fitsWell', { positions: candidateProfile.value.suggestedPositions.slice(0, 2).join(', ') }));
  if (!list.length) list.push(t('upload.step3.wellStructured'));
  return list;
});

const gaps = computed(() => {
  if (matchResult.value?.missingSkills?.length) return matchResult.value.missingSkills.map((s: string) => t('upload.step3.missingSkill', { skill: s }));
  return [];
});

const recommendations = computed(() => {
  const recs = [];
  if (!candidateProfile.value?.summary) recs.push({ title: t('upload.step3.recAddSummary'), description: t('upload.step3.recAddSummaryDesc') });
  if (!candidateProfile.value?.skills?.length || candidateProfile.value.skills.length < 5) recs.push({ title: t('upload.step3.recExpandSkills'), description: t('upload.step3.recExpandSkillsDesc') });
  recs.push({ title: t('upload.step3.recQuantify'), description: t('upload.step3.recQuantifyDesc') });
  recs.push({ title: t('upload.step3.recOptimizeFormat'), description: t('upload.step3.recOptimizeFormatDesc') });
  return recs;
});

const optimizationHighlights = computed(() => {
  if (optimizeResult.value?.highlights) {
    return optimizeResult.value.highlights.map((h: OptimizationHighlight) => ({ title: h.title, desc: h.description, icon: getIconByName(h.icon), bg: 'bg-blue-50', color: 'text-blue-600' }));
  }
  return [
    { title: 'ATS Keywords', desc: 'Integrated high-impact industry terms.', icon: KeyRound, bg: 'bg-teal-50', color: 'text-teal-600' },
    { title: 'Action Verbs', desc: 'Used metric-driven action verbs.', icon: TrendingUp, bg: 'bg-blue-50', color: 'text-blue-600' },
    { title: 'Content Structure', desc: 'Optimized layout and structure.', icon: Paintbrush, bg: 'bg-orange-50', color: 'text-orange-500' },
    { title: 'Grammar Check', desc: 'Verified grammar and punctuation.', icon: CheckCheck, bg: 'bg-gray-100', color: 'text-gray-500' },
  ];
});

const getOptimizedSummary = (): string => {
  if (!optimizeResult.value?.optimizedContent) return editableFields.summary || '';
  const summaryPatterns = [/(?:summary|profile|objective)[:\s]*([^\n]+(?:\n[^\n]+){0,3})/i, /([A-Z][^.!?]*?(?:experience|skills|expertise|achievements)[^.!?]*[.!?])/i];
  for (const pattern of summaryPatterns) {
    const match = optimizeResult.value.optimizedContent.match(pattern);
    if (match && match[1]) {
      const improvedSummary = match[1].trim();
      if (improvedSummary.length > 20 && improvedSummary !== editableFields.summary) return improvedSummary;
    }
  }
  const lines = optimizeResult.value.optimizedContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 50 && !trimmed.match(/^(skills?|experience|education|work|company|position|date)/i)) return trimmed;
  }
  return editableFields.summary || 'Experienced professional with strong technical skills.';
};

const getOptimizedSkills = (): string[] => {
  if (!optimizeResult.value?.optimizedContent) return editableFields.skills;
  const skillsMatch = optimizeResult.value.optimizedContent.match(/skills?[:\s]*([^\n]+(?:\n[^\n]+)*?)(?:\n\n|\n(?:experience|work|education))/i);
  if (skillsMatch && skillsMatch[1]) {
    const skillsText = skillsMatch[1];
    const skills = skillsText.split(/[,\n|•·]+/).map((s: string) => s.trim()).filter(Boolean);
    const originalLower = editableFields.skills.map((s: string) => s.toLowerCase());
    const optimizedSkills = skills.filter((s: string) => s.length > 1 && s.length < 50 && !originalLower.includes(s.toLowerCase()));
    return [...editableFields.skills, ...optimizedSkills.slice(0, 5)];
  }
  return editableFields.skills;
};

const getOptimizedDescription = (original: string, _index: number): string => {
  if (!optimizeResult.value?.optimizedContent) return original;
  const content = optimizeResult.value.optimizedContent;
  const expPatterns = [/(?:responsibilities|achievements|key contributions)[:\s]*([^\n]+(?:\n[^\n]+)*?)(?:\n\n|\n(?:education|skills|$))/i, /(?:increased|improved|led|developed|managed|achieved|implemented)[^.!?]+[.!?]/gi];
  const improvements: string[] = [];
  for (const pattern of expPatterns) { const matches = content.match(pattern); if (matches) improvements.push(...matches); }
  if (improvements.length > 0) {
    const uniqueImprovements = improvements.filter((imp, idx, arr) => arr.indexOf(imp) === idx);
    const additionalPoints = uniqueImprovements.slice(0, 2).map(imp => `• ${imp.trim()}`);
    if (additionalPoints.length > 0) return `${original}\n${additionalPoints.join('\n')}`;
  }
  return original;
};

const proceedToExport = async () => { if (currentStep.value === 3 || currentStep.value === 4) currentStep.value = 5; };

const startOptimization = async () => {
  error.value = '';
  try {
    isOptimizing.value = true;
    const result = await cvService.optimizeCv({ cvDocumentId: cvDocument.value!.id, instructions: optimizationInstructions.value || undefined, jobDescription: jobDescription.value || undefined });
    optimizeResult.value = result;
    if (result.updatedProfile) { mapProfileToEditable(result.updatedProfile); candidateProfile.value = result.updatedProfile; }
    currentStep.value = 5;
  } catch (err: any) { console.error('Optimization error:', err); error.value = t('upload.step4.errorOptimizeFailed'); }
  finally { isOptimizing.value = false; }
};

const skipOptimization = () => { currentStep.value = 5; };

const goNext = async () => {
  error.value = '';
  if (currentStep.value === 1) { if (!candidateProfile.value) { error.value = t('upload.step1.errorNoCv'); return; } }
  else if (currentStep.value === 2) { await analyzeWithJd(); }
  if (currentStep.value < 5) currentStep.value++;
  if (currentStep.value === 2 && cvDocument.value) loadPdfPreview();
};

const goBack = () => {
  if (currentStep.value === 5) { currentStep.value = 4; return; }
  if (currentStep.value === 4) { optimizeResult.value = null; optimizationInstructions.value = ''; currentStep.value = 3; return; }
  if (currentStep.value > 1) {
    currentStep.value--;
    if (currentStep.value === 1) { matchResult.value = null; optimizeResult.value = null; optimizationInstructions.value = ''; }
    if (currentStep.value === 3) { optimizeResult.value = null; }
  }
};

const triggerFileInput = () => fileInput.value?.click();

const handleFileSelect = (e: Event) => {
  const inputEl = e.target as HTMLInputElement;
  if (inputEl.files?.[0]) { resetAllState(); selectedFile.value = inputEl.files[0]; error.value = ''; }
};

const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  if (e.dataTransfer?.files?.[0]) {
    const file = e.dataTransfer.files[0];
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (validTypes.includes(file.type)) { resetAllState(); selectedFile.value = file; error.value = ''; }
    else { error.value = t('upload.step1.errorInvalidFile'); }
  }
};

const removeFile = () => { resetAllState(); selectedFile.value = null; if (fileInput.value) fileInput.value.value = ''; };
const formatFileSize = (b: number) => b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
const triggerPhotoInput = () => photoInput.value?.click();

const handlePhotoSelect = async (e: Event) => {
  const inputEl = e.target as HTMLInputElement;
  const file = inputEl.files?.[0];
  if (!file) return;
  if (!imageService.isValidAvatar(file)) { error.value = t('upload.photo.invalidFile'); return; }
  try {
    photoPreview.value = await imageService.fileToDataUrl(file);
    isUploadingPhoto.value = true;
    error.value = '';
    const result = await imageService.uploadAvatar(file);
    editableFields.photoUrl = result.url;
  } catch (err) { console.error('Photo upload error:', err); error.value = t('upload.photo.uploadFailed'); }
  finally { isUploadingPhoto.value = false; if (photoInput.value) photoInput.value.value = ''; }
};

const removePhoto = () => { editableFields.photoUrl = ''; photoPreview.value = null; };

const uploadAndAnalyze = async () => {
  if (!selectedFile.value) return;
  isUploading.value = true;
  isProcessing.value = true;
  uploadProgress.value = 0;
  error.value = '';
  try {
    const progressInterval = setInterval(() => { if (uploadProgress.value < 90) uploadProgress.value += 15; }, 500);
    const cvResponse = await cvService.uploadAndAnalyze(selectedFile.value);
    cvDocument.value = cvResponse;
    await pollForProcessingStatus(cvResponse.id);
    let profile = null;
    let retryCount = 0;
    const maxRetries = 5;
    while (!profile && retryCount < maxRetries) {
      try { const apiResponse = await cvService.getCandidateProfile(cvResponse.id); profile = apiResponse; }
      catch (profileErr) { retryCount++; if (retryCount < maxRetries) await new Promise(resolve => setTimeout(resolve, 2000)); }
    }
    if (!profile) throw new Error(t('upload.step1.errorTimeout'));
    candidateProfile.value = profile;
    mapProfileToEditable(profile);
    clearInterval(progressInterval);
    uploadProgress.value = 100;
  } catch (err: any) { console.error('Upload error:', err); error.value = err.response?.data?.message || err.message || t('upload.step1.errorUploadFailed'); }
  finally { isUploading.value = false; isProcessing.value = false; }
};

const pollForProcessingStatus = async (cvId: string, maxAttempts = 30) => {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    try { const doc = await cvService.getById(cvId); cvDocument.value = doc; if (doc.status === 'SUCCESS') return; if (doc.status === 'FAILED') throw new Error(doc.errorMessage || 'CV processing failed'); uploadProgress.value = Math.min(90, 30 + (i * 5)); }
    catch (e) { if (i > 5) throw e; }
  }
  throw new Error('Processing timeout. Please try again.');
};

const mapProfileToEditable = (profile: CandidateProfileResponse) => {
  editableFields.fullName = profile.fullName || '';
  editableFields.email = profile.email || '';
  editableFields.phone = profile.phone || '';
  editableFields.address = profile.address || '';
  editableFields.linkedinUrl = profile.linkedinUrl || '';
  editableFields.githubUrl = profile.githubUrl || '';
  editableFields.portfolioUrl = profile.portfolioUrl || '';
  editableFields.photoUrl = profile.photoUrl || '';
  editableFields.summary = profile.summary || '';
  editableFields.totalExperienceYears = profile.totalExperienceYears || 0;
  editableFields.skills = profile.skills ? [...profile.skills] : [];
  editableFields.workExperiences = (profile.workExperiences || []).map((exp: WorkExperienceResponse) => ({ companyName: exp.companyName || '', position: exp.position || '', startDate: exp.startDate || '', endDate: exp.endDate || '', description: exp.description || '' }));
  editableFields.educations = (profile.educations || []).map((edu: EducationResponse) => ({ schoolName: edu.schoolName || '', degree: edu.degree || '', major: edu.major || '', startDate: edu.startDate || '', endDate: edu.endDate || '' }));
  editableFields.projects = (profile.projects || []).map((proj: ProjectResponse) => ({ projectName: proj.projectName || '', role: proj.role || '', description: proj.description || '', projectUrl: proj.projectUrl || '', technologies: proj.technologies ? [...proj.technologies] : [] }));
  editableFields.certificates = (profile.certificates || []).map((cert: CertificateResponse) => ({ certificateName: cert.certificateName || '', organization: cert.organization || '', issueDate: cert.issueDate || '', expiryDate: cert.expiryDate || '' }));
  editableFields.languages = profile.languages ? [...profile.languages] : [];
};

const analyzeWithJd = async () => {
  if (!cvDocument.value) return;
  isProcessing.value = true;
  error.value = '';
  try { if (jobDescription.value.trim()) { matchResult.value = await cvService.matchWithJd({ cvDocumentId: cvDocument.value.id, jobDescription: jobDescription.value }); hasReviewedWithJd.value = true; } else hasReviewedWithJd.value = false; }
  catch (err: any) { console.error('Analysis error:', err); }
  finally { isProcessing.value = false; }
};

const optimizeCv = async () => {
  if (!cvDocument.value) return;
  isOptimizing.value = true;
  error.value = '';
  try {
    const result = await cvService.optimizeCv({ cvDocumentId: cvDocument.value.id, instructions: optimizationInstructions.value || undefined, jobDescription: jobDescription.value || undefined });
    optimizeResult.value = result;
    if (result.updatedProfile) { mapProfileToEditable(result.updatedProfile); candidateProfile.value = result.updatedProfile; }
    currentStep.value = 5;
  } catch (err: any) { console.error('Optimization error:', err); error.value = t('upload.step4.errorOptimizeFailed'); }
  finally { isOptimizing.value = false; }
};

const reOptimize = async () => { await optimizeCv(); };

const downloadOptimizedPdf = async () => {
  if (!cvDocument.value) return;
  try { isDownloading.value = true; await cvService.downloadCv(cvDocument.value.id, cvDocument.value.originalFileName); }
  catch (err: any) { console.error('Download error:', err); error.value = t('upload.step4.errorDownloadFailed'); }
  finally { isDownloading.value = false; }
};

const handleCvDownloaded = () => { console.log('CV PDF downloaded successfully'); };

const addWorkExperience = () => { editableFields.workExperiences.push({ companyName: '', position: '', startDate: '', endDate: '', description: '' }); };
const removeWorkExperience = (idx: number) => { editableFields.workExperiences.splice(idx, 1); };
const addEducation = () => { editableFields.educations.push({ schoolName: '', degree: '', major: '', startDate: '', endDate: '' }); };
const removeEducation = (idx: number) => { editableFields.educations.splice(idx, 1); };
const addProject = () => { editableFields.projects.push({ projectName: '', role: '', description: '', projectUrl: '', technologies: [] }); };
const removeProject = (idx: number) => { editableFields.projects.splice(idx, 1); };
const addCertificate = () => { editableFields.certificates.push({ certificateName: '', organization: '', issueDate: '', expiryDate: '' }); };
const removeCertificate = (idx: number) => { editableFields.certificates.splice(idx, 1); };

const getScoreLabel = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Strong';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Partial';
  return 'Low';
};

const getIconByName = (iconName: string) => {
  const icons: Record<string, any> = { 'key': KeyRound, 'trending': TrendingUp, 'format': Paintbrush, 'check': CheckCheck, 'star': Star, 'graduation': GraduationCap };
  return icons[iconName] || Star;
};

const loadPdfPreview = async () => {
  if (pdfBlobUrl.value) { window.URL.revokeObjectURL(pdfBlobUrl.value); pdfBlobUrl.value = null; }
  pdfLoadError.value = false;
  if (selectedFile.value && currentStep.value === 1) { if (selectedFile.value.type === 'application/pdf') pdfBlobUrl.value = window.URL.createObjectURL(selectedFile.value); return; }
  if (cvDocument.value?.id && cvDocument.value.fileType === 'PDF') {
    isPdfLoading.value = true;
    try { pdfBlobUrl.value = await cvService.getPdfBlobUrl(cvDocument.value.id); }
    catch (err) { console.error('Failed to load PDF preview:', err); pdfLoadError.value = true; }
    finally { isPdfLoading.value = false; }
  }
};

watch(selectedFile, (newFile) => { if (newFile) { candidateProfile.value = null; cvDocument.value = null; matchResult.value = null; optimizeResult.value = null; loadPdfPreview(); uploadAndAnalyze(); } });
watch(candidateProfile, (newProfile) => { if (newProfile) mapProfileToEditable(newProfile); });
watch(cvDocument, (newDoc) => { if (newDoc && currentStep.value >= 2) loadPdfPreview(); }, { immediate: true });
watch(currentStep, (step) => { if (step >= 2 && cvDocument.value) loadPdfPreview(); });
onUnmounted(() => { if (pdfBlobUrl.value) window.URL.revokeObjectURL(pdfBlobUrl.value); if (optimizedPdfBlobUrl.value) window.URL.revokeObjectURL(optimizedPdfBlobUrl.value); });
</script>

<style scoped>
.cv-preview {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 24px;
  border-radius: 8px;
  max-width: 100%;
}

.cv-preview-optimized {
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
  border: 2px solid #86efac;
}

.cv-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.cv-preview-optimized .cv-header {
  border-bottom-color: #86efac;
}

.cv-name {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.cv-name-optimized {
  color: #166534;
}

.cv-contact-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 16px;
  font-size: 12px;
  color: #6b7280;
}

.cv-link {
  font-size: 11px;
  color: #3b82f6;
  margin-top: 4px;
}

.cv-content-section {
  margin-bottom: 18px;
}

.cv-section-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
  padding-bottom: 4px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cv-preview-optimized .cv-section-title {
  color: #166534;
  border-bottom-color: #bbf7d0;
}

.cv-ai-badge {
  font-size: 9px;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.cv-text {
  font-size: 12px;
  color: #4b5563;
  line-height: 1.6;
}

.cv-text-improved {
  color: #166534;
  position: relative;
}

.cv-text-improved::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #10b981 0%, #34d399 100%);
  border-radius: 2px;
}

.cv-skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cv-skill-tag {
  font-size: 11px;
  padding: 4px 10px;
  background: #f3f4f6;
  color: #4b5563;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
}

.cv-skill-improved {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border-color: #6ee7b7;
  font-weight: 500;
}

.cv-experience-item {
  margin-bottom: 14px;
  padding-left: 12px;
  border-left: 2px solid #e5e7eb;
}

.cv-preview-optimized .cv-experience-item {
  border-left-color: #86efac;
}

.cv-exp-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 2px;
}

.cv-exp-position {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}

.cv-exp-company {
  font-size: 12px;
  color: #6b7280;
}

.cv-exp-date {
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 6px;
}

.cv-education-item {
  margin-bottom: 10px;
  padding-left: 12px;
  border-left: 2px solid #e5e7eb;
}

.cv-preview-optimized .cv-education-item {
  border-left-color: #86efac;
}
</style>
