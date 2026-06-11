import { ref, computed } from 'vue';

export type TemplateId = 'professional' | 'modern' | 'minimal' | 'classic';
export type TemplateColor =
  | 'blue'
  | 'teal'
  | 'purple'
  | 'orange'
  | 'green'
  | 'red';

export interface TemplateColorOption {
  id: TemplateColor;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  light: string;
  dark: string;
}

export interface CvTemplateData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  photoUrl: string;
  summary: string;
  totalExperienceYears: number;
  skills: string[];
  workExperiences: Array<{
    companyName: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  educations: Array<{
    schoolName: string;
    degree: string;
    major: string;
    endDate: string;
  }>;
  projects: Array<{
    projectName: string;
    description: string;
  }>;
  certificates: Array<{
    certificateName: string;
    organization: string;
    issueDate: string;
  }>;
  languages: string[];
}

const selectedTemplateId = ref<TemplateId>('professional');
const selectedColorId = ref<TemplateColor>('blue');

const COLOR_OPTIONS: TemplateColorOption[] = [
  { id: 'blue',   name: 'Blue',   primary: '#1d4ed8', secondary: '#3b82f6', accent: '#93c5fd', light: '#eff6ff', dark: '#1e3a8a' },
  { id: 'teal',  name: 'Teal',   primary: '#0f766e', secondary: '#14b8a6', accent: '#5eead4', light: '#f0fdfa', dark: '#134e4a' },
  { id: 'purple',name: 'Purple', primary: '#7c3aed', secondary: '#a78bfa', accent: '#c4b5fd', light: '#f5f3ff', dark: '#4c1d95' },
  { id: 'orange',name: 'Orange', primary: '#c2410c', secondary: '#f97316', accent: '#fdba74', light: '#fff7ed', dark: '#7c2d12' },
  { id: 'green', name: 'Green',  primary: '#15803d', secondary: '#22c55e', accent: '#86efac', light: '#f0fdf4', dark: '#14532d' },
  { id: 'red',   name: 'Red',    primary: '#b91c1c', secondary: '#ef4444', accent: '#fca5a5', light: '#fef2f2', dark: '#7f1d1d' },
];

const TEMPLATE_META = [
  {
    id: 'professional' as TemplateId,
    name: 'Navy Sidebar',
    description: 'Two-column navy sidebar with photo, skills, and timeline experience',
    preview: 'professional',
  },
  {
    id: 'modern' as TemplateId,
    name: 'Serif Dark',
    description: 'Elegant serif dark sidebar with education, expertise, and language sections',
    preview: 'modern',
  },
  {
    id: 'minimal' as TemplateId,
    name: 'Minimal B&W',
    description: 'Clean minimal layout with centered header and black footer',
    preview: 'minimal',
  },
  {
    id: 'classic' as TemplateId,
    name: 'Tech Vietnamese',
    description: 'Two-column beige sidebar with objective, education, skills, and tech experience',
    preview: 'classic',
  },
];

export function useCvTemplate() {
  const currentColor = computed(
    () => COLOR_OPTIONS.find(c => c.id === selectedColorId.value) ?? COLOR_OPTIONS[0]
  );

  const selectTemplate = (id: TemplateId) => {
    selectedTemplateId.value = id;
  };

  const selectColor = (id: TemplateColor) => {
    selectedColorId.value = id;
  };

  const   fillFromEditable = (fields: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    linkedinUrl: string;
    githubUrl: string;
    portfolioUrl: string;
    photoUrl: string;
    summary: string;
    totalExperienceYears: number;
    skills: string[];
    workExperiences: Array<{ companyName: string; position: string; startDate: string; endDate: string; description: string }>;
    educations: Array<{ schoolName: string; degree: string; major: string; startDate: string; endDate: string }>;
    projects: Array<{ projectName: string; role: string; description: string; projectUrl: string; technologies: string[] }>;
    certificates: Array<{ certificateName: string; organization: string; issueDate: string; expiryDate: string }>;
    languages: string[];
  }): CvTemplateData => {
    return {
      fullName: fields.fullName,
      email: fields.email,
      phone: fields.phone,
      address: fields.address,
      linkedinUrl: fields.linkedinUrl,
      githubUrl: fields.githubUrl || '',
      portfolioUrl: fields.portfolioUrl || '',
      photoUrl: fields.photoUrl || '',
      summary: fields.summary,
      totalExperienceYears: fields.totalExperienceYears,
      skills: fields.skills,
      workExperiences: fields.workExperiences.map(e => ({
        companyName: e.companyName,
        position: e.position,
        startDate: e.startDate,
        endDate: e.endDate,
        description: e.description,
      })),
      educations: fields.educations.map(e => ({
        schoolName: e.schoolName,
        degree: e.degree,
        major: e.major,
        endDate: e.endDate,
      })),
      projects: fields.projects.map(p => ({
        projectName: p.projectName,
        description: p.description,
      })),
      certificates: fields.certificates.map(c => ({
        certificateName: c.certificateName,
        organization: c.organization,
        issueDate: c.issueDate,
      })),
      languages: fields.languages,
    };
  };

  return {
    selectedTemplateId,
    selectedColorId,
    currentColor,
    colorOptions: COLOR_OPTIONS,
    templateMeta: TEMPLATE_META,
    selectTemplate,
    selectColor,
    fillFromEditable,
  };
}
