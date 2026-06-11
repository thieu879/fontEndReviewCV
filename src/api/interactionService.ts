import api from './axios';
import type { APIResponse, PageResponse } from './cvService';

export type InteractionType =
  | 'VIEW_PROFILE'
  | 'DOWNLOAD_CV'
  | 'ADD_COMMENT'
  | 'RATE'
  | 'SHORTLIST'
  | 'REMOVE_SHORTLIST'
  | 'SHARE'
  | 'EXPORT'
  | 'SEARCH';

export interface InteractionLogResponse {
  id: string;
  userId: string;
  userName: string;
  candidateProfileId: string;
  candidateFullName: string;
  type: InteractionType;
  metadata?: string;
  createdAt: string;
}

export const interactionService = {
  async getMyActivity(page = 0, size = 20): Promise<PageResponse<InteractionLogResponse>> {
    const response = await api.get<APIResponse<PageResponse<InteractionLogResponse>>>(
      '/interactions/me',
      { params: { page, size } }
    );
    return response.data.data;
  },

  async getCandidateActivity(
    candidateProfileId: string,
    page = 0,
    size = 20
  ): Promise<PageResponse<InteractionLogResponse>> {
    const response = await api.get<APIResponse<PageResponse<InteractionLogResponse>>>(
      `/interactions/candidate/${candidateProfileId}`,
      { params: { page, size } }
    );
    return response.data.data;
  },
};

export default interactionService;
