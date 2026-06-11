<template>
  <div ref="cvRef" class="cv1">
    <!-- ═══ LEFT SIDEBAR ═══ -->
    <aside class="cv1-left">
      <div class="cv1-photo-wrap">
        <div class="cv1-photo">
          <img v-if="data.photoUrl" :src="data.photoUrl" alt="avatar" />
          <span v-else>👤</span>
        </div>
      </div>

      <div class="cv1-section">
        <div class="cv1-section-title">Contact</div>
        <div class="cv1-contact-item"><span>📞</span> {{ data.phone }}</div>
        <div class="cv1-contact-item"><span>✉️</span> {{ data.email }}</div>
        <div class="cv1-contact-item"><span>📍</span> {{ data.address }}</div>
        <div v-if="data.linkedinUrl" class="cv1-contact-item"><span>🔗</span> {{ data.linkedinUrl }}</div>
        <div v-if="data.githubUrl" class="cv1-contact-item"><span>🐙</span> {{ data.githubUrl }}</div>
        <div v-if="data.portfolioUrl" class="cv1-contact-item"><span>🌐</span> {{ data.portfolioUrl }}</div>
      </div>

      <div class="cv1-section">
        <div class="cv1-section-title">Skills</div>
        <div v-for="skill in data.skills" :key="skill" class="cv1-list-item">{{ skill }}</div>
      </div>

      <div class="cv1-section">
        <div class="cv1-section-title">Languages</div>
        <div v-for="lang in data.languages" :key="lang" class="cv1-list-item">{{ lang }}</div>
      </div>

      <div v-if="data.certificates.length" class="cv1-section">
        <div class="cv1-section-title">Certifications</div>
        <div v-for="cert in data.certificates" :key="cert.certificateName" class="cv1-cert-item">
          <div class="cv1-cert-name">{{ cert.certificateName }}</div>
          <div v-if="cert.organization" class="cv1-cert-org">{{ cert.organization }}</div>
        </div>
      </div>
    </aside>

    <!-- ═══ RIGHT CONTENT ═══ -->
    <main class="cv1-right">
      <header class="cv1-header">
        <div class="cv1-name">{{ data.fullName || 'Your Name' }}</div>
        <div v-if="data.totalExperienceYears" class="cv1-role">{{ data.totalExperienceYears }}+ Years Experience</div>
      </header>

      <div class="cv1-body">
        <!-- Profile -->
        <section v-if="data.summary" class="cv1-section-block">
          <div class="cv1-block-title">
            <div class="cv1-icon-circle">👤</div>
            Profile
          </div>
          <p class="cv1-profile-text">{{ data.summary }}</p>
        </section>

        <!-- Work Experience -->
        <section v-if="data.workExperiences.length" class="cv1-section-block">
          <div class="cv1-block-title">
            <div class="cv1-icon-circle">💼</div>
            Work Experience
          </div>
          <div v-for="job in data.workExperiences" :key="job.companyName + job.startDate" class="cv1-timeline-entry">
            <div class="cv1-dot"></div>
            <div class="cv1-entry-content">
              <div class="cv1-entry-header">
                <span class="cv1-company">{{ job.companyName }}</span>
                <span class="cv1-date">{{ job.startDate }}<template v-if="job.endDate"> – {{ job.endDate }}</template></span>
              </div>
              <div class="cv1-job-title">{{ job.position }}</div>
              <p v-if="job.description" class="cv1-exp-desc">{{ job.description }}</p>
            </div>
          </div>
        </section>

        <!-- Education -->
        <section v-if="data.educations.length" class="cv1-section-block">
          <div class="cv1-block-title">
            <div class="cv1-icon-circle">🎓</div>
            Education
          </div>
          <div v-for="edu in data.educations" :key="edu.schoolName + edu.degree" class="cv1-timeline-entry">
            <div class="cv1-dot"></div>
            <div class="cv1-entry-content">
              <div class="cv1-entry-header">
                <span class="cv1-company">{{ edu.degree }}</span>
                <span v-if="edu.endDate" class="cv1-date">{{ edu.endDate }}</span>
              </div>
              <div class="cv1-job-title">{{ edu.schoolName }}</div>
              <div v-if="edu.major" class="cv1-gpa">{{ edu.major }}</div>
            </div>
          </div>
        </section>

        <!-- Projects -->
        <section v-if="data.projects.length" class="cv1-section-block">
          <div class="cv1-block-title">
            <div class="cv1-icon-circle">🚀</div>
            Projects
          </div>
          <div v-for="proj in data.projects" :key="proj.projectName" class="cv1-timeline-entry">
            <div class="cv1-dot"></div>
            <div class="cv1-entry-content">
              <div class="cv1-entry-header">
                <span class="cv1-company">{{ proj.projectName }}</span>
              </div>
              <p v-if="proj.description" class="cv1-exp-desc">{{ proj.description }}</p>
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

.cv1 {
  display: flex;
  width: 794px;
  min-height: 1123px;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 13px;
  line-height: 1.55;
  background: #fff;
}

/* ══ LEFT SIDEBAR ══ */
.cv1-left {
  width: 240px;
  min-width: 240px;
  background: v-bind('color?.primary || "#1e2a3a"');
  color: #c8d4e0;
  padding-bottom: 2rem;
}

.cv1-photo-wrap {
  padding: 2rem 1.5rem 1.5rem;
}

.cv1-photo {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: #2e3d50;
  border: 4px solid #3a5070;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  overflow: hidden;
}

.cv1-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cv1-section {
  padding: 1.1rem 1.5rem 0.3rem;
}

.cv1-section-title {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #fff;
  border-bottom: 1px solid #3a4a5e;
  padding-bottom: 0.4rem;
  margin-bottom: 0.75rem;
}

.cv1-contact-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.77rem;
  color: v-bind('color?.light || "#a8bcc8"');
  margin-bottom: 0.45rem;
  word-break: break-all;
}

.cv1-list-item {
  font-size: 0.77rem;
  color: v-bind('color?.light || "#a8bcc8"');
  margin-bottom: 0.32rem;
  padding-left: 0.9rem;
  position: relative;
}

.cv1-list-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: v-bind('color?.secondary || "#5a7a98"');
}

.cv1-cert-item {
  margin-bottom: 0.4rem;
}

.cv1-cert-name {
  font-size: 0.77rem;
  color: #c8d4e0;
  font-weight: 600;
}

.cv1-cert-org {
  font-size: 0.71rem;
  color: #7a94a8;
}

/* ══ RIGHT CONTENT ══ */
.cv1-right {
  flex: 1;
}

.cv1-header {
  background: v-bind('color?.primary || "#1e2a3a"');
  padding: 2.5rem 2rem 1.8rem;
}

.cv1-name {
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.cv1-role {
  font-size: 0.82rem;
  color: #7a94a8;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  margin-top: 0.25rem;
}

.cv1-body {
  padding: 1.8rem 2rem;
}

.cv1-section-block {
  margin-bottom: 1.7rem;
}

.cv1-block-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: v-bind('color?.primary || "#1e2a3a"');
  border-bottom: 1.5px solid #dde3ea;
  padding-bottom: 0.4rem;
  margin-bottom: 1rem;
}

.cv1-icon-circle {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: v-bind('color?.primary || "#1e2a3a"');
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.cv1-profile-text {
  font-size: 0.81rem;
  color: #444;
  line-height: 1.7;
  text-align: justify;
}

.cv1-timeline-entry {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.cv1-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid v-bind('color?.secondary || "#6c8daf"');
  background: #fff;
  flex-shrink: 0;
  margin-top: 0.4rem;
}

.cv1-entry-content {
  flex: 1;
}

.cv1-entry-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.cv1-company {
  font-weight: 700;
  font-size: 0.85rem;
  color: v-bind('color?.dark || "#1e2a3a"');
}

.cv1-date {
  font-size: 0.73rem;
  color: v-bind('color?.secondary || "#6c8daf"');
  font-style: italic;
  white-space: nowrap;
  flex-shrink: 0;
}

.cv1-job-title {
  font-size: 0.79rem;
  color: #555;
  margin: 0.15rem 0 0.4rem;
}

.cv1-exp-desc {
  font-size: 0.77rem;
  color: #444;
  line-height: 1.65;
  margin: 0;
  text-align: justify;
}

.cv1-gpa {
  font-size: 0.77rem;
  color: #444;
  margin-top: 0.2rem;
}
</style>
