import api from './axios';
import type { APIResponse, CandidateProfileResponse, PageResponse } from './cvService';

export interface AnalysisFilterRequest {
  targetRole?: string;
  minAiScore?: number;
  maxAiScore?: number;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  skills?: string[];
  educationLevels?: string[];
  locations?: string[];
  searchKeyword?: string;
  manuallyEditedOnly?: boolean;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  page?: number;
  size?: number;
}

export interface AnalysisOverview {
  totalCandidates: number;
  analyzedCandidates: number;
  pendingCandidates: number;
  failedCandidates: number;
  averageAiScore: number;
  highMatchCandidates: number;
  skillsDistribution: Record<string, number>;
  rolesDistribution: Record<string, number>;
  experienceDistribution: Record<string, number>;
  recentAnalysis: {
    id: string;
    fullName: string;
    aiScore: number;
    suggestedPositions: string[];
    createdAt: string;
  }[];
  trends: {
    weeklyNew: number;
    monthlyNew: number;
    topRole: string;
  };
}

export interface AiScoreStats {
  average: number;
  high: number;
  medium: number;
  low: number;
  highPercentage: number;
}

export interface TrendData {
  date: string;
  count: number;
}

export const analysisService = {
  async getOverview(): Promise<AnalysisOverview> {
    const response = await api.get<APIResponse<AnalysisOverview>>(
      '/analysis/overview'
    );
    return response.data.data;
  },

  async getAnalyzedCandidates(filters?: AnalysisFilterRequest): Promise<PageResponse<CandidateProfileResponse>> {
    const response = await api.post<APIResponse<PageResponse<CandidateProfileResponse>>>(
      '/analysis/candidates',
      filters || {}
    );
    return response.data.data;
  },

  async getSkillsStats(): Promise<Record<string, number>> {
    const response = await api.get<APIResponse<Record<string, number>>>(
      '/analysis/stats/skills'
    );
    return response.data.data;
  },

  async getRolesStats(): Promise<Record<string, number>> {
    const response = await api.get<APIResponse<Record<string, number>>>(
      '/analysis/stats/roles'
    );
    return response.data.data;
  },

  async getExperienceStats(): Promise<Record<string, number>> {
    const response = await api.get<APIResponse<Record<string, number>>>(
      '/analysis/stats/experience'
    );
    return response.data.data;
  },

  async getEducationStats(): Promise<Record<string, number>> {
    const response = await api.get<APIResponse<Record<string, number>>>(
      '/analysis/stats/education'
    );
    return response.data.data;
  },

  async getAiScoreStats(): Promise<AiScoreStats> {
    const response = await api.get<APIResponse<AiScoreStats>>(
      '/analysis/stats/ai-scores'
    );
    return response.data.data;
  },

  async getTrends(days: number = 30): Promise<TrendData[]> {
    const response = await api.get<APIResponse<TrendData[]>>(
      `/analysis/trends?days=${days}`
    );
    return response.data.data;
  },

  async getTopCandidates(limit: number = 10, minScore: number = 80): Promise<CandidateProfileResponse[]> {
    const response = await api.get<APIResponse<CandidateProfileResponse[]>>(
      `/analysis/top-candidates?limit=${limit}&minScore=${minScore}`
    );
    return response.data.data;
  }
};

export default analysisService;
