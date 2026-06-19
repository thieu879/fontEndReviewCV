import api from './axios';
import type { APIResponse, PageResponse } from './cvService';

// ============================================
// Job Types
// ============================================
export interface JobResponse {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  description: string;
  requirements?: string;
  benefits?: string;
  salary?: string;
  salaryMin?: string;
  salaryMax?: string;
  currency?: string;
  experienceLevel?: string;
  jobType?: string;
  industry?: string;
  skills: string[];
  technologies: string[];
  education: string[];
  certifications: string[];
  languages: string[];
  seniority?: string;
  englishLevel?: string;
  source?: string;
  sourceUrl?: string;
  active: boolean;
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
}

export interface SavedJobResponse {
  id: string;
  jobId: string;
  userId: string;
  note: string;
  tag: string;
  createdAt: string;
  updatedAt: string;
  job?: JobResponse;
}

export interface SaveJobRequest {
  jobId: string;
  note?: string;
  tag?: string;
}

// ============================================
// CV Analysis Types
// ============================================
export interface CvAnalysisResponse {
  id?: string;
  candidateName: string;
  jobTitle: string;
  experienceYears: number;
  seniority: string;
  englishLevel: string;
  industry: string;
  skills: string[];
  technologies: string[];
  languages: string[];
  education: string[];
  certifications: string[];
  strengths: string[];
  recommendedRoles: string[];
  summary: string;
  fileName?: string;
  fileSize?: number;
  createdAt?: string;
}

// ============================================
// Job Match Result Types
// ============================================
export interface JobMatchResult {
  jobId: string;
  matchScore: number;
  level: string;
  label: string;
  color: string;
  matchedSkills: string[];
  missingSkills: string[];
  reason?: string;
  skillsScore?: number;
  experienceScore?: number;
  titleScore?: number;
  educationScore?: number;
  certificationScore?: number;
  keywordScore?: number;
  job?: JobResponse;
}

export interface JobMatchResponse {
  analysis: CvAnalysisResponse;
  matches: JobMatchResult[];
  careerAdvice?: string;
  improvementSuggestions?: string[];
  totalJobsAnalyzed: number;
  matchThreshold: number;
}

export interface CareerAdviceResponse {
  currentMatchScore: string;
  advice: string;
}

// ============================================
// Job Matching Service
// ============================================
export const jobMatchingService = {
  /**
   * Upload CV and get matching jobs
   */
  matchCvWithJobs: async (file: File): Promise<JobMatchResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<APIResponse<JobMatchResponse>>(
      '/jobs/ai-match',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  },

  /**
   * Analyze CV only (no matching)
   */
  analyzeCv: async (file: File): Promise<CvAnalysisResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<APIResponse<CvAnalysisResponse>>(
      '/jobs/ai-match/analyze',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  },

  /**
   * Get career advice for a CV
   */
  getCareerAdvice: async (file: File): Promise<CareerAdviceResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<APIResponse<CareerAdviceResponse>>(
      '/jobs/ai-match/advice',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  },
};

// ============================================
// Job Service
// ============================================
export const jobService = {
  getAllJobs: async (page = 0, size = 20, q?: string): Promise<PageResponse<JobResponse>> => {
    const params: Record<string, string | number> = { page, size };
    if (q) params.q = q;
    const response = await api.get<APIResponse<PageResponse<JobResponse>>>('/jobs', { params });
    return response.data.data;
  },

  getAllJobsList: async (): Promise<JobResponse[]> => {
    const response = await api.get<APIResponse<JobResponse[]>>('/jobs/all');
    return response.data.data;
  },

  getJobById: async (id: string): Promise<JobResponse> => {
    const response = await api.get<APIResponse<JobResponse>>(`/jobs/${id}`);
    return response.data.data;
  },

  countActiveJobs: async (): Promise<number> => {
    const response = await api.get<APIResponse<number>>('/jobs/count');
    return response.data.data;
  },
};

// ============================================
// Saved Job Service
// ============================================
export const savedJobService = {
  saveJob: async (request: SaveJobRequest): Promise<SavedJobResponse> => {
    const response = await api.post<APIResponse<SavedJobResponse>>('/jobs/save', request);
    return response.data.data;
  },

  saveJobById: async (jobId: string): Promise<SavedJobResponse> => {
    const response = await api.post<APIResponse<SavedJobResponse>>(`/jobs/save/${jobId}`);
    return response.data.data;
  },

  unsaveJob: async (jobId: string): Promise<void> => {
    await api.delete(`/jobs/save/${jobId}`);
  },

  isSaved: async (jobId: string): Promise<boolean> => {
    const response = await api.get<APIResponse<boolean>>(`/jobs/save/check/${jobId}`);
    return response.data.data;
  },

  getSavedJobIds: async (): Promise<Set<string>> => {
    const response = await api.get<APIResponse<string[]>>('/jobs/save/ids');
    return new Set(response.data.data || []);
  },

  getSavedJobs: async (page = 0, size = 20): Promise<PageResponse<SavedJobResponse>> => {
    const response = await api.get<APIResponse<PageResponse<SavedJobResponse>>>('/jobs/save', {
      params: { page, size },
    });
    return response.data.data;
  },

  getSavedJobsList: async (): Promise<SavedJobResponse[]> => {
    const response = await api.get<APIResponse<SavedJobResponse[]>>('/jobs/save/list');
    return response.data.data;
  },
};

export default jobMatchingService;
