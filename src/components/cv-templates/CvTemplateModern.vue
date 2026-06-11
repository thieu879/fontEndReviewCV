<template>
  <div ref="cvRef" class="cv3">
    <!-- ═══ HEADER ═══ -->
    <header class="cv3-header">
      <div class="cv3-name">{{ data.fullName || 'Your Name' }}</div>
      <div v-if="data.totalExperienceYears" class="cv3-role">{{ data.totalExperienceYears }}+ Years Experience</div>
      <div class="cv3-contact-bar">
        <div v-if="data.phone" class="cv3-contact-item">
          <span>📞</span> {{ data.phone }}
        </div>
        <div v-if="data.email" class="cv3-contact-item">
          <span>✉️</span> {{ data.email }}
        </div>
        <div v-if="data.address" class="cv3-contact-item">
          <span>📍</span> {{ data.address }}
        </div>
        <div v-if="data.linkedinUrl" class="cv3-contact-item">
          <span>🔗</span> {{ data.linkedinUrl }}
        </div>
      </div>
    </header>

    <!-- ═══ BODY ═══ -->
    <div class="cv3-body">

      <!-- About Me -->
      <section v-if="data.summary" class="cv3-section">
        <div class="cv3-section-title">About Me</div>
        <hr class="cv3-divider" />
        <p class="cv3-text">{{ data.summary }}</p>
      </section>

      <!-- Education -->
      <section v-if="data.educations.length" class="cv3-section">
        <div class="cv3-section-title">Education</div>
        <hr class="cv3-divider" />
        <div v-for="edu in data.educations" :key="edu.schoolName + edu.degree" class="cv3-entry">
          <div v-if="edu.schoolName" class="cv3-entry-meta">{{ edu.schoolName }}<template v-if="edu.endDate"> | {{ edu.endDate }}</template></div>
          <div class="cv3-entry-title">{{ edu.degree }}</div>
          <p v-if="edu.major" class="cv3-text">{{ edu.major }}</p>
        </div>
      </section>

      <!-- Work Experience -->
      <section v-if="data.workExperiences.length" class="cv3-section">
        <div class="cv3-section-title">Work Experience</div>
        <hr class="cv3-divider" />
        <div v-for="job in data.workExperiences" :key="job.companyName + job.startDate" class="cv3-entry">
          <div class="cv3-entry-meta">{{ job.companyName }}<template v-if="job.startDate"> | {{ job.startDate }}<template v-if="job.endDate"> – {{ job.endDate }}</template></template></div>
          <div class="cv3-entry-title">{{ job.position }}</div>
          <p v-if="job.description" class="cv3-text">{{ job.description }}</p>
        </div>
      </section>

      <!-- Skills -->
      <section v-if="data.skills.length" class="cv3-section">
        <div class="cv3-section-title">Skills</div>
        <hr class="cv3-divider" />
        <div class="cv3-skills-grid">
          <div v-for="skill in data.skills" :key="skill" class="cv3-skill-item">{{ skill }}</div>
        </div>
      </section>

      <!-- Projects -->
      <section v-if="data.projects.length" class="cv3-section">
        <div class="cv3-section-title">Projects</div>
        <hr class="cv3-divider" />
        <div v-for="proj in data.projects" :key="proj.projectName" class="cv3-entry">
          <div class="cv3-entry-title">{{ proj.projectName }}</div>
          <p v-if="proj.description" class="cv3-text">{{ proj.description }}</p>
        </div>
      </section>

    </div>

    <!-- ═══ FOOTER ═══ -->
    <div class="cv3-footer"></div>
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

.cv3 {
  display: flex;
  flex-direction: column;
  width: 794px;
  min-height: 1123px;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 13px;
  line-height: 1.55;
  background: #fff;
  color: #111;
}

/* ══ HEADER ══ */
.cv3-header {
  padding: 2.5rem 3rem 0;
  text-align: center;
}

.cv3-name {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: v-bind('color?.dark || "#111111"');
}

.cv3-role {
  font-size: 0.84rem;
  color: #555;
  letter-spacing: 0.5px;
  margin-top: 0.2rem;
}

.cv3-contact-bar {
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  border-top: 1.5px solid v-bind('color?.primary || "#222222"');
  border-bottom: 1.5px solid v-bind('color?.primary || "#222222"');
  padding: 0.5rem 3rem;
  margin-top: 0.7rem;
  flex-wrap: wrap;
}

.cv3-contact-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.77rem;
  color: #333;
}

/* ══ BODY ══ */
.cv3-body {
  padding: 1rem 3rem;
  flex: 1;
}

.cv3-section {
  margin-bottom: 1.4rem;
}

.cv3-section-title {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: v-bind('color?.dark || "#111111"');
  margin-bottom: 0.3rem;
}

.cv3-divider {
  border: none;
  border-top: 1px solid v-bind('color?.accent || "#cccccc"');
  margin: 0.3rem 0 0.85rem;
}

.cv3-entry {
  margin-bottom: 1rem;
}

.cv3-entry-meta {
  font-size: 0.72rem;
  color: #777;
  margin-bottom: 0.05rem;
}

.cv3-entry-title {
  font-weight: 700;
  font-size: 0.82rem;
  color: #111;
  margin-bottom: 0.2rem;
}

.cv3-text {
  font-size: 0.78rem;
  color: #444;
  line-height: 1.65;
  margin: 0;
}

/* Skills */
.cv3-skills-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.15rem 1.5rem;
}

.cv3-skill-item {
  font-size: 0.77rem;
  color: #444;
  padding-left: 0.9rem;
  position: relative;
  margin-bottom: 0.18rem;
}

.cv3-skill-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: v-bind('color?.primary || "#111111"');
}

/* ══ FOOTER ══ */
.cv3-footer {
  background: v-bind('color?.primary || "#222222"');
  height: 28px;
  margin-top: auto;
}
</style>
