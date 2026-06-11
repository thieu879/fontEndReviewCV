import api from './axios';
import type { APIResponse, CandidateProfileResponse, PageResponse } from './cvService';

export interface SearchFilters {
  keyword?: string;
  skills?: string[];
  targetRoleKeyword?: string;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  minAiScore?: number;
  maxAiScore?: number;
  certificates?: string[];
  manuallyEditedOnly?: boolean;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  page?: number;
  size?: number;
}

export interface SearchSuggestionResponse {
  popularSkills: string[];
  suggestedRoles: string[];
  popularLocations: string[];
  recentSearches: string[];
}

export interface SearchStats {
  totalCandidates: number;
  myCandidates: number;
  highMatchCandidates: number;
  recentCandidates: {
    id: string;
    fullName: string;
    aiScore: number;
    createdAt: string;
  }[];
}

export const searchService = {
  async searchCandidates(filters: SearchFilters): Promise<PageResponse<CandidateProfileResponse>> {
    const response = await api.post<APIResponse<PageResponse<CandidateProfileResponse>>>(
      '/search/candidates',
      filters
    );
    return response.data.data;
  },

  async getSuggestions(): Promise<SearchSuggestionResponse> {
    const response = await api.get<APIResponse<SearchSuggestionResponse>>(
      '/search/candidates/suggestions'
    );
    return response.data.data;
  },

  async getAllSkills(): Promise<string[]> {
    const response = await api.get<APIResponse<string[]>>(
      '/search/candidates/skills'
    );
    return response.data.data;
  },

  async getAllRoles(): Promise<string[]> {
    const response = await api.get<APIResponse<string[]>>(
      '/search/candidates/roles'
    );
    return response.data.data;
  },

  async getSearchStats(): Promise<SearchStats> {
    const response = await api.get<APIResponse<SearchStats>>(
      '/search/candidates/stats'
    );
    return response.data.data;
  },

  async quickSearch(keyword: string): Promise<CandidateProfileResponse[]> {
    const response = await api.post<APIResponse<PageResponse<CandidateProfileResponse>>>(
      '/search/candidates',
      {
        keyword,
        page: 0,
        size: 10,
        sortBy: 'aiScore',
        sortDirection: 'DESC'
      }
    );
    return response.data.data?.content || [];
  }
};

export default searchService;
