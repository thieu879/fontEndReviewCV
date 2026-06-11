export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'recruiter' | 'user';
  roleNames?: string[];
  createdAt: string;
  username?: string;
  phone?: string;
  address?: string;
  company?: string;
  jobTitle?: string;
  enabled?: boolean;
  emailVerified?: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: 'light' | 'dark';
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
  };
}

export interface CV {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  analysisResult?: AnalysisResult;
}

export interface AnalysisResult {
  id: string;
  cvId: string;
  predictedRole: string;
  skills: string[];
  experience: number;
  education: string;
  aiMatchScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  analyzedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  avatar?: string;
  skills: string[];
  experience: number;
  education: string;
  predictedRole: string;
  aiMatchScore: number;
  cvUrl?: string;
  appliedAt: string;
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
}

// ── CV Document Types ──────────────────────────────────────────────────────

export type CvStatus = 'UPLOADED' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
export type FileType = 'PDF' | 'DOCX';

export interface CvDocument {
  id: string;
  userId: string;
  originalFileName: string;
  storedFileName?: string;
  fileUrl?: string;
  fileType: FileType;
  fileSize: number;
  status: CvStatus;
  errorMessage?: string;
  candidateProfileId?: string;
  extractedText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkExperience {
  id?: string;
  companyName?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  currentJob?: boolean;
  description?: string;
  responsibilities?: string[];
  technologies?: string[];
}

export interface Education {
  id?: string;
  schoolName?: string;
  degree?: string;
  major?: string;
  startDate?: string;
  endDate?: string;
  gpa?: number;
  description?: string;
}

export interface CertificateInfo {
  id?: string;
  name?: string;
  issuer?: string;
  dateObtained?: string;
  description?: string;
}

export interface ProjectInfo {
  id?: string;
  name?: string;
  description?: string;
  technologies?: string[];
  role?: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  cvDocumentId: string;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  summary?: string;
  totalExperienceYears?: number;
  skills: string[];
  educations: Education[];
  workExperiences: WorkExperience[];
  projects: ProjectInfo[];
  certificates: CertificateInfo[];
  languages: string[];
  suggestedPositions: string[];
  aiScore?: number;
  aiSummary?: string;
  manuallyEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JdMatchRequest {
  cvDocumentId: string;
  jobDescription: string;
}

export interface JdMatchResponse {
  cvDocumentId: string;
  matchScore: number;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
}

export interface AnalysisResult {
  id: string;
  cvId: string;
  overallScore: number;
  skillMatchScore: number;
  experienceMatchScore: number;
  cultureFitScore: number;
  strengths: string[];
  gaps: string[];
  recommendations: { title: string; description: string }[];
  insights: {
    title: string;
    description: string;
    type: string;
    icon?: string;
    color?: string;
    border?: string;
  }[];
}

export interface OptimizeCvRequest {
  cvDocumentId: string;
  instructions?: string;
  targetRole?: string;
  jobDescription?: string;
}

export interface OptimizationHighlight {
  title: string;
  description: string;
  icon: string;
}

export interface OptimizeCvResponse {
  cvDocumentId: string;
  optimizedContent: string;
  fileUrl?: string;
  fileType?: string;
  optimizationScore: number;
  highlights: OptimizationHighlight[];
}

export interface ProcessingStatus {
  cvDocumentId: string;
  status: CvStatus;
  progressPercentage: number;
  currentStep: string;
  message: string;
}

export interface SearchFilters {
  targetRole: string;
  requiredSkills: string[];
  minExperience: number;
  maxExperience: number;
  education: string;
  minAiMatchScore: number;
  location: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  action: string;
  user: string;
  details: string;
  levelClass?: string;
}

export interface StatCard {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}
