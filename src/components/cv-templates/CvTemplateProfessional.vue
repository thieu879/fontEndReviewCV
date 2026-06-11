<template>
  <div ref="cvRef" class="cv4">
    <!-- ═══ LEFT SIDEBAR ═══ -->
    <aside class="cv4-left">
      <div class="cv4-photo-wrap">
        <div class="cv4-photo">
          <img v-if="data.photoUrl" :src="data.photoUrl" alt="avatar" />
          <span v-else>👤</span>
        </div>
      </div>

      <!-- Mục tiêu -->
      <div v-if="data.summary" class="cv4-section">
        <div class="cv4-section-title">Objective</div>
        <p class="cv4-objective">{{ data.summary }}</p>
      </div>

      <!-- Học vấn -->
      <div v-if="data.educations.length" class="cv4-section">
        <div class="cv4-section-title">Education</div>
        <div v-for="edu in data.educations" :key="edu.schoolName + edu.degree" class="cv4-edu-item">
          <div class="cv4-edu-name">{{ edu.schoolName }}</div>
          <div v-if="edu.major" class="cv4-edu-major">{{ edu.major }}</div>
          <div v-if="edu.endDate" class="cv4-edu-date">{{ edu.endDate }}</div>
          <div v-if="edu.degree" class="cv4-edu-degree">{{ edu.degree }}</div>
        </div>
      </div>

      <!-- Skills -->
      <div v-if="data.skills.length" class="cv4-section">
        <div class="cv4-section-title">Skills</div>
        <div v-for="skill in data.skills" :key="skill" class="cv4-skill-item">{{ skill }}</div>
      </div>

      <!-- Languages -->
      <div v-if="data.languages.length" class="cv4-section">
        <div class="cv4-section-title">Languages</div>
        <div v-for="lang in data.languages" :key="lang" class="cv4-lang-item">{{ lang }}</div>
      </div>
    </aside>

    <!-- ═══ RIGHT CONTENT ═══ -->
    <main class="cv4-right">
      <!-- Header -->
      <header class="cv4-header">
        <div class="cv4-name">{{ data.fullName || 'Your Name' }}</div>
        <div v-if="data.totalExperienceYears" class="cv4-role">{{ data.totalExperienceYears }}+ Years Experience</div>
        <div class="cv4-contact-grid">
          <div v-if="data.phone" class="cv4-contact-item">
            <span>📞</span> {{ data.phone }}
          </div>
          <div v-if="data.email" class="cv4-contact-item">
            <span>✉️</span> {{ data.email }}
          </div>
          <div v-if="data.address" class="cv4-contact-item">
            <span>📍</span> {{ data.address }}
          </div>
          <div v-if="data.githubUrl" class="cv4-contact-item">
            <span>🐙</span>
            <a :href="data.githubUrl" target="_blank">{{ data.githubUrl }}</a>
          </div>
          <div v-if="data.linkedinUrl" class="cv4-contact-item">
            <span>🔗</span> {{ data.linkedinUrl }}
          </div>
          <div v-if="data.portfolioUrl" class="cv4-contact-item">
            <span>🌐</span> {{ data.portfolioUrl }}
          </div>
        </div>
      </header>

      <div class="cv4-body">
        <!-- Kinh nghiệm -->
        <section v-if="data.workExperiences.length" class="cv4-section-block">
          <div class="cv4-block-title">Work Experience</div>
          <div v-for="exp in data.workExperiences" :key="exp.companyName + exp.startDate" class="cv4-timeline-entry">
            <div class="cv4-dot"></div>
            <div class="cv4-entry-content">
              <div class="cv4-entry-header">
                <span class="cv4-company">{{ exp.companyName }}</span>
                <span class="cv4-date">{{ exp.startDate }}<template v-if="exp.endDate"> – {{ exp.endDate }}</template></span>
              </div>
              <div class="cv4-exp-role">{{ exp.position }}</div>
              <p v-if="exp.description" class="cv4-bullet-desc">{{ exp.description }}</p>
            </div>
          </div>
        </section>

        <!-- Projects -->
        <section v-if="data.projects.length" class="cv4-section-block">
          <div class="cv4-block-title">Projects</div>
          <div v-for="proj in data.projects" :key="proj.projectName" class="cv4-timeline-entry">
            <div class="cv4-dot"></div>
            <div class="cv4-entry-content">
              <div class="cv4-entry-header">
                <span class="cv4-company">{{ proj.projectName }}</span>
              </div>
              <p v-if="proj.description" class="cv4-bullet-desc">{{ proj.description }}</p>
            </div>
          </div>
        </section>

        <!-- Certificates -->
        <section v-if="data.certificates.length" class="cv4-section-block">
          <div class="cv4-block-title">Certifications</div>
          <div v-for="cert in data.certificates" :key="cert.certificateName" class="cv4-cert-item">
            <span class="cv4-cert-name">{{ cert.certificateName }}</span>
            <span v-if="cert.organization" class="cv4-cert-org"> — {{ cert.organization }}</span>
            <span v-if="cert.issueDate" class="cv4-cert-date"> ({{ cert.issueDate }})</span>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { CvTemplateData, TemplateColorOption } from '@/composables/useCvTemplate';

defineProps<{
  data: CvTemplateData;
  color?: TemplateColorOption;
}>();

const cvRef = ref<HTMLElement | null>(null);
defineExpose({ cvRef });
</script>

<style scoped>
* { box-sizing: border-box; }

.cv4 {
  display: flex;
  width: 794px;
  min-height: 1123px;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 12.5px;
  line-height: 1.55;
  background: #fff;
}

/* ══ LEFT SIDEBAR ══ */
.cv4-left {
  width: 230px;
  min-width: 230px;
  background: v-bind('color?.light || "#f4f4ee"');
  padding-bottom: 2rem;
}

.cv4-photo-wrap {
  padding: 1.6rem 1.5rem 1rem;
}

.cv4-photo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: v-bind('color?.light || "#d4d0c8"');
  border: 4px solid v-bind('color?.accent || "#c0bdb0"');
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.8rem;
  overflow: hidden;
}

.cv4-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cv4-section {
  padding: 0.9rem 1.4rem 0.2rem;
}

.cv4-section-title {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: v-bind('color?.dark || "#1a1a2e"');
  border-bottom: 2px solid v-bind('color?.primary || "#1a1a2e"');
  padding-bottom: 0.28rem;
  margin-bottom: 0.7rem;
}

.cv4-objective {
  font-size: 0.76rem;
  color: #444;
  line-height: 1.65;
  margin: 0;
}

.cv4-edu-item {
  margin-bottom: 0.6rem;
}

.cv4-edu-name {
  font-weight: 700;
  font-size: 0.79rem;
  color: v-bind('color?.dark || "#1a1a2e"');
}

.cv4-edu-major {
  font-size: 0.74rem;
  color: #555;
}

.cv4-edu-date {
  font-size: 0.71rem;
  color: #777;
  margin-bottom: 0.2rem;
}

.cv4-edu-degree {
  font-size: 0.71rem;
  color: #555;
}

.cv4-skill-item {
  font-size: 0.75rem;
  color: #444;
  margin-bottom: 0.32rem;
  padding-left: 0.9rem;
  position: relative;
  line-height: 1.45;
}

.cv4-skill-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #888;
}

.cv4-lang-item {
  font-size: 0.76rem;
  color: #444;
  padding: 0.25rem 0;
  border-bottom: 1px solid #ddd;
}

.cv4-lang-item:last-child {
  border-bottom: none;
}

/* ══ RIGHT CONTENT ══ */
.cv4-right {
  flex: 1;
}

.cv4-header {
  background: v-bind('color?.primary || "#1a1a2e"');
  padding: 1.8rem 1.8rem 1.4rem;
}

.cv4-name {
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.cv4-role {
  font-size: 0.78rem;
  color: #7a9fc0;
  letter-spacing: 3px;
  margin-top: 0.3rem;
}

.cv4-contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem 0.5rem;
  margin-top: 1rem;
}

.cv4-contact-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.74rem;
  color: #a8bcd0;
}

.cv4-contact-item a {
  color: #6ab0e0;
  text-decoration: none;
}

.cv4-contact-item a:hover {
  text-decoration: underline;
}

.cv4-body {
  padding: 1.3rem 1.8rem;
}

.cv4-section-block {
  margin-bottom: 1.3rem;
}

.cv4-block-title {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: v-bind('color?.dark || "#1a1a2e"');
  border-bottom: 2px solid v-bind('color?.primary || "#1a1a2e"');
  padding-bottom: 0.28rem;
  margin-bottom: 0.85rem;
}

.cv4-timeline-entry {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.9rem;
}

.cv4-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid v-bind('color?.primary || "#1a1a2e"');
  background: #fff;
  flex-shrink: 0;
  margin-top: 0.4rem;
}

.cv4-entry-content {
  flex: 1;
}

.cv4-entry-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.cv4-company {
  font-weight: 700;
  font-size: 0.82rem;
  color: v-bind('color?.dark || "#1a1a2e"');
}

.cv4-date {
  font-size: 0.71rem;
  color: #7a94a8;
  font-style: italic;
  white-space: nowrap;
  flex-shrink: 0;
}

.cv4-exp-role {
  font-size: 0.75rem;
  color: #555;
  margin: 0.1rem 0 0.35rem;
}

.cv4-bullet-desc {
  font-size: 0.74rem;
  color: #444;
  margin: 0;
  line-height: 1.6;
  text-align: justify;
}

.cv4-cert-item {
  font-size: 0.76rem;
  color: #444;
  margin-bottom: 0.4rem;
}

.cv4-cert-name {
  font-weight: 700;
  color: v-bind('color?.dark || "#1a1a2e"');
}

.cv4-cert-org, .cv4-cert-date {
  font-size: 0.72rem;
  color: #777;
}
</style>
