<template>
  <div ref="cvRef" class="cv2">
    <!-- ═══ LEFT SIDEBAR ═══ -->
    <aside class="cv2-left">
      <div class="cv2-photo-wrap">
        <div class="cv2-photo">
          <img v-if="data.photoUrl" :src="data.photoUrl" alt="avatar" />
          <span v-else>👤</span>
        </div>
      </div>

      <div class="cv2-section">
        <div class="cv2-section-title">Contact</div>
        <div class="cv2-contact-label">Phone</div>
        <div class="cv2-contact-value">{{ data.phone }}</div>
        <div class="cv2-contact-label">Email</div>
        <div class="cv2-contact-value">{{ data.email }}</div>
        <div class="cv2-contact-label">Address</div>
        <div class="cv2-contact-value">{{ data.address }}</div>
        <div v-if="data.linkedinUrl">
          <div class="cv2-contact-label">LinkedIn</div>
          <div class="cv2-contact-value">{{ data.linkedinUrl }}</div>
        </div>
      </div>

      <div class="cv2-section">
        <div class="cv2-section-title">Education</div>
        <div v-for="edu in data.educations" :key="edu.schoolName + edu.degree" class="cv2-edu-item">
          <div class="cv2-edu-date">{{ edu.endDate || edu.schoolName }}</div>
          <div class="cv2-edu-degree">{{ edu.degree }}</div>
          <div v-if="edu.schoolName" class="cv2-edu-school">{{ edu.schoolName }}</div>
          <div v-if="edu.major" class="cv2-edu-major">{{ edu.major }}</div>
        </div>
      </div>

      <div class="cv2-section">
        <div class="cv2-section-title">Expertise</div>
        <div v-for="skill in data.skills" :key="skill" class="cv2-skill-item">{{ skill }}</div>
      </div>

      <div class="cv2-section">
        <div class="cv2-section-title">Language</div>
        <div v-for="lang in data.languages" :key="lang" class="cv2-lang-item">{{ lang }}</div>
      </div>
    </aside>

    <!-- ═══ RIGHT CONTENT ═══ -->
    <main class="cv2-right">
      <header class="cv2-header">
        <div class="cv2-name">{{ data.fullName || 'Your Name' }}</div>
        <div v-if="data.totalExperienceYears" class="cv2-role">{{ data.totalExperienceYears }}+ Years Experience</div>
        <p v-if="data.summary" class="cv2-summary">{{ data.summary }}</p>
      </header>

      <div class="cv2-body">
        <!-- Experience -->
        <section v-if="data.workExperiences.length">
          <div class="cv2-section-title cv2-body-title">Experience</div>
          <div v-for="exp in data.workExperiences" :key="exp.companyName + exp.startDate" class="cv2-exp-entry">
            <div class="cv2-dot"></div>
            <div class="cv2-entry-content">
              <div class="cv2-exp-date">{{ exp.startDate }}<template v-if="exp.endDate"> – {{ exp.endDate }}</template></div>
              <div class="cv2-exp-company">{{ exp.companyName }}</div>
              <div class="cv2-exp-role">{{ exp.position }}</div>
              <p v-if="exp.description" class="cv2-exp-text">{{ exp.description }}</p>
            </div>
          </div>
        </section>

        <!-- Projects -->
        <section v-if="data.projects.length" style="margin-top: 2rem">
          <div class="cv2-section-title cv2-body-title">Projects</div>
          <div v-for="proj in data.projects" :key="proj.projectName" class="cv2-exp-entry">
            <div class="cv2-dot"></div>
            <div class="cv2-entry-content">
              <div class="cv2-exp-role">{{ proj.projectName }}</div>
              <p v-if="proj.description" class="cv2-exp-text">{{ proj.description }}</p>
            </div>
          </div>
        </section>

        <!-- Certificates -->
        <section v-if="data.certificates.length" style="margin-top: 2rem">
          <div class="cv2-section-title cv2-body-title">Certifications</div>
          <div class="cv2-ref-grid">
            <div v-for="cert in data.certificates" :key="cert.certificateName" class="cv2-cert-item">
              <div class="cv2-cert-name">{{ cert.certificateName }}</div>
              <div v-if="cert.organization" class="cv2-cert-org">{{ cert.organization }}</div>
              <div v-if="cert.issueDate" class="cv2-cert-date">{{ cert.issueDate }}</div>
            </div>
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

.cv2 {
  display: flex;
  width: 794px;
  min-height: 1123px;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 13px;
  line-height: 1.55;
  background: #fff;
}

/* ══ LEFT SIDEBAR ══ */
.cv2-left {
  width: 230px;
  min-width: 230px;
  background: v-bind('color?.primary || "#1e2430"');
  color: #c8d0dc;
  padding-bottom: 2rem;
}

.cv2-photo-wrap {
  padding: 2rem 1.5rem 1.5rem;
  display: flex;
  justify-content: center;
}

.cv2-photo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #2e3d50;
  border: 3px solid #3a5070;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.8rem;
  overflow: hidden;
}

.cv2-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cv2-section {
  padding: 1rem 1.5rem 0.2rem;
}

.cv2-section-title {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: v-bind('color?.primary || "#ffffff"');
  margin-bottom: 0.75rem;
}

.cv2-body-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.08rem;
  font-weight: 700;
  color: v-bind('color?.dark || "#1a1a2e"');
  letter-spacing: 0;
  text-transform: none;
  border-bottom: 1.5px solid v-bind('color?.accent || "#dde"');
  padding-bottom: 0.3rem;
  margin-bottom: 1rem;
}

.cv2-contact-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: #7a94a8;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-top: 0.55rem;
}

.cv2-contact-value {
  font-size: 0.76rem;
  color: #b8c8d8;
  word-break: break-all;
}

.cv2-edu-item {
  margin-bottom: 0.75rem;
}

.cv2-edu-date {
  font-size: 0.7rem;
  color: #6a8aa0;
}

.cv2-edu-degree {
  font-size: 0.78rem;
  font-weight: 700;
  color: #d4dce8;
  line-height: 1.3;
}

.cv2-edu-school {
  font-size: 0.72rem;
  color: #8aaac0;
}

.cv2-edu-major {
  font-size: 0.71rem;
  color: #7a9aaa;
}

.cv2-skill-item {
  font-size: 0.76rem;
  color: #b8c8d8;
  margin-bottom: 0.3rem;
  padding-left: 0.9rem;
  position: relative;
}

.cv2-skill-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #4a6a88;
}

.cv2-lang-item {
  font-size: 0.78rem;
  color: #c0ccd8;
  padding: 0.28rem 0;
  border-bottom: 1px solid #2a3848;
}

.cv2-lang-item:last-child {
  border-bottom: none;
}

/* ══ RIGHT CONTENT ══ */
.cv2-right {
  flex: 1;
}

.cv2-header {
  padding: 2.2rem 2rem 1.5rem;
  border-bottom: 2px solid #eee;
}

.cv2-name {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 2rem;
  font-weight: 700;
  color: v-bind('color?.dark || "#1a1a2e"');
  letter-spacing: 0.5px;
}

.cv2-role {
  font-size: 0.82rem;
  color: #555;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  margin-top: 0.2rem;
}

.cv2-summary {
  font-size: 0.79rem;
  color: #555;
  line-height: 1.7;
  margin-top: 0.85rem;
  text-align: justify;
}

.cv2-body {
  padding: 1.5rem 2rem;
}

.cv2-exp-entry {
  display: flex;
  gap: 0.85rem;
  margin-bottom: 1.2rem;
}

.cv2-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid v-bind('color?.primary || "#5a7a98"');
  background: #fff;
  flex-shrink: 0;
  margin-top: 0.35rem;
}

.cv2-entry-content {
  flex: 1;
}

.cv2-exp-date {
  font-size: 0.72rem;
  color: #7a94a8;
  font-weight: 600;
}

.cv2-exp-company {
  font-size: 0.79rem;
  color: v-bind('color?.secondary || "#888"');
}

.cv2-exp-role {
  font-weight: 700;
  font-size: 0.84rem;
  color: v-bind('color?.dark || "#1a1a2e"');
  margin: 0.2rem 0 0.4rem;
}

.cv2-exp-text {
  font-size: 0.77rem;
  color: #555;
  line-height: 1.65;
  text-align: justify;
  margin: 0;
}

.cv2-ref-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.cv2-cert-item {
  margin-bottom: 0.5rem;
}

.cv2-exp-cert-name {
  font-weight: 700;
  font-size: 0.84rem;
  color: v-bind('color?.dark || "#1a1a2e"');
}

.cv2-cert-org, .cv2-cert-date {
  font-size: 0.72rem;
  color: #777;
}
</style>
