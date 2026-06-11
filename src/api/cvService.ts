import api from './axios';

// ============================================
// API Response wrapper
// ============================================
export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status: number;
}

// ============================================
// Shared Types
// ============================================
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ============================================
// CV Document Types
// ============================================
export interface CvDocumentResponse {
  id: string;
  userId: string;
  originalFileName: string;
  fileUrl?: string;
  fileType: 'PDF' | 'DOCX';
  fileSize: number;
  status: 'UPLOADED' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  errorMessage?: string;
  candidateProfileId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Candidate Profile Types
// ============================================
export interface WorkExperienceResponse {
  companyName?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  currentJob?: boolean;
  description?: string;
  responsibilities?: string[];
  technologies?: string[];
}

export interface EducationResponse {
  schoolName?: string;
  degree?: string;
  major?: string;
  startDate?: string;
  endDate?: string;
  gpa?: number;
  description?: string;
}

export interface CertificateResponse {
  certificateName?: string;
  organization?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface ProjectResponse {
  projectName?: string;
  role?: string;
  description?: string;
  projectUrl?: string;
  githubUrl?: string;
  technologies?: string[];
}

export interface CandidateProfileResponse {
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
  photoUrl?: string;
  summary?: string;
  totalExperienceYears?: number;
  skills: string[];
  educations: EducationResponse[];
  workExperiences: WorkExperienceResponse[];
  projects: ProjectResponse[];
  certificates: CertificateResponse[];
  languages: string[];
  suggestedPositions: string[];
  aiScore?: number;
  aiSummary?: string;
  manuallyEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// JD Match Types
// ============================================
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

// ============================================
// Optimize CV Types
// ============================================
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
  updatedProfile?: CandidateProfileResponse;
}

// ============================================
// Processing Status Types
// ============================================
export interface ProcessingStatusResponse {
  cvDocumentId: string;
  status: string;
  progressPercentage: number;
  currentStep: string;
  message: string;
}

// ============================================
// CV Service
// ============================================
const cvService = {
  /**
   * Upload and analyze CV file
   */
  uploadAndAnalyze: async (file: File): Promise<CvDocumentResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<APIResponse<CvDocumentResponse>>('/cv-documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  /**
   * Get CV document by ID
   */
  getById: async (id: string): Promise<CvDocumentResponse> => {
    const response = await api.get<APIResponse<CvDocumentResponse>>(`/cv-documents/${id}`);
    return response.data.data;
  },

  /**
   * Get all CV documents for current user
   */
  getAllByUser: async (): Promise<CvDocumentResponse[]> => {
    const response = await api.get<APIResponse<CvDocumentResponse[]>>('/cv-documents/user/me');
    return response.data.data;
  },

  /**
   * Get all CV documents for a specific user
   */
  getAllByUserId: async (userId: string): Promise<CvDocumentResponse[]> => {
    const response = await api.get<APIResponse<CvDocumentResponse[]>>(`/cv-documents/user/${userId}`);
    return response.data.data;
  },

  /**
   * Get candidate profile by CV document ID
   */
  getCandidateProfile: async (cvDocumentId: string): Promise<CandidateProfileResponse> => {
    const response = await api.get<APIResponse<CandidateProfileResponse>>(`/cv-documents/${cvDocumentId}/profile`);
    return response.data.data;
  },

  /**
   * Get candidate profile by ID
   */
  getCandidateProfileById: async (id: string): Promise<CandidateProfileResponse> => {
    const response = await api.get<APIResponse<CandidateProfileResponse>>(`/candidate-profiles/${id}`);
    return response.data.data;
  },

  /**
   * Match CV with Job Description
   */
  matchWithJd: async (request: JdMatchRequest): Promise<JdMatchResponse> => {
    const response = await api.post<APIResponse<JdMatchResponse>>('/cv-documents/match-jd', request);
    return response.data.data;
  },

  /**
   * Optimize CV using AI
   */
  optimizeCv: async (request: OptimizeCvRequest): Promise<OptimizeCvResponse> => {
    const response = await api.post<APIResponse<OptimizeCvResponse>>('/candidate-profiles/optimize', request);
    return response.data.data;
  },

  /**
   * Get processing status
   */
  getProcessingStatus: async (cvDocumentId: string): Promise<ProcessingStatusResponse> => {
    const response = await api.get<APIResponse<ProcessingStatusResponse>>(`/candidate-profiles/cv/${cvDocumentId}/status`);
    return response.data.data;
  },

  /**
   * Reprocess CV
   */
  reprocess: async (cvId: string): Promise<CvDocumentResponse> => {
    const response = await api.post<APIResponse<CvDocumentResponse>>(`/cv-documents/${cvId}/reprocess`);
    return response.data.data;
  },

  /**
   * Delete CV document
   */
  delete: async (cvId: string): Promise<void> => {
    await api.delete(`/cv-documents/${cvId}`);
  },

  /**
   * Get PDF blob URL for preview
   * Returns a blob URL that can be used with PDF.js
   */
  getPdfBlobUrl: async (cvId: string): Promise<string> => {
    const response = await api.get(`/cv-documents/${cvId}/download`, {
      responseType: 'blob',
    });
    
    const contentType = String(response.headers['content-type'] || 'application/pdf');
    const blob = new Blob([response.data], { type: contentType });
    return window.URL.createObjectURL(blob);
  },

  /**
   * Download CV file as PDF
   */
  downloadCv: async (cvId: string, originalFileName: string): Promise<void> => {
    const response = await api.get(`/cv-documents/${cvId}/download`, {
      responseType: 'blob',
    });
    
    const contentType = String(response.headers['content-type'] || 'application/pdf');
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = originalFileName || `cv-${cvId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default cvService;
