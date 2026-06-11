import api from './axios';
import type { CvDocumentResponse, CandidateProfileResponse } from './cvService';

export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status: number;
}

export interface CvStats {
  totalCVs: number;
  successCount: number;
  processingCount: number;
  failedCount: number;
  averageAiScore: number;
  topMatchRate: number;
  storageUsed: number;
  storageLimit: number;
  recentTrend: string;
}

export interface MyCVWithProfile {
  id: string;
  userId: string;
  originalFileName: string;
  fileUrl?: string;
  fileType: 'PDF' | 'DOCX';
  fileSize: number;
  status: 'UPLOADED' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  errorMessage?: string;
  candidateProfileId?: string;
  candidateProfile?: CandidateProfileResponse;
  createdAt: string;
  updatedAt: string;
}

export const mycvsService = {
  async getMyCVs(): Promise<MyCVWithProfile[]> {
    const response = await api.get<APIResponse<CvDocumentResponse[]>>('/cv-documents/user/me');
    return response.data.data || [];
  },

  async getMyCVsWithProfiles(): Promise<MyCVWithProfile[]> {
    const response = await api.get<APIResponse<CvDocumentResponse[]>>('/cv-documents/user/me');
    const cvs = response.data.data || [];
    
    const cvsWithProfiles = await Promise.all(
      cvs.map(async (cv) => {
        if (cv.candidateProfileId) {
          try {
            const profileResponse = await api.get<APIResponse<CandidateProfileResponse>>(
              `/candidate-profiles/${cv.candidateProfileId}`
            );
            return { ...cv, candidateProfile: profileResponse.data.data } as MyCVWithProfile;
          } catch (e) {
            return cv as MyCVWithProfile;
          }
        }
        return cv as MyCVWithProfile;
      })
    );
    
    return cvsWithProfiles;
  },

  async getCVById(cvId: string): Promise<MyCVWithProfile> {
    const response = await api.get<APIResponse<CvDocumentResponse>>(`/cv-documents/${cvId}`);
    const cv = response.data.data;
    
    if (cv.candidateProfileId) {
      try {
        const profileResponse = await api.get<APIResponse<CandidateProfileResponse>>(
          `/candidate-profiles/${cv.candidateProfileId}`
        );
        return { ...cv, candidateProfile: profileResponse.data.data } as MyCVWithProfile;
      } catch (e) {
        return cv as MyCVWithProfile;
      }
    }
    
    return cv as MyCVWithProfile;
  },

  async deleteCV(cvId: string): Promise<void> {
    await api.delete(`/cv-documents/${cvId}`);
  },

  async reprocessCV(cvId: string): Promise<CvDocumentResponse> {
    const response = await api.post<APIResponse<CvDocumentResponse>>(`/cv-documents/${cvId}/reprocess`);
    return response.data.data;
  },

  async getCVStats(): Promise<CvStats> {
    const response = await api.get<APIResponse<CvStats>>('/cv-documents/user/me/stats');
    return response.data.data;
  },

  async downloadCV(cvId: string, originalFileName: string): Promise<void> {
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

  async getCVBlobUrl(cvId: string): Promise<string> {
    const response = await api.get(`/cv-documents/${cvId}/download`, {
      responseType: 'blob',
    });
    
    const contentType = String(response.headers['content-type'] || 'application/pdf');
    const blob = new Blob([response.data], { type: contentType });
    return window.URL.createObjectURL(blob);
  }
};

export default mycvsService;
