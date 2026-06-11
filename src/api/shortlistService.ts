import api from './axios';
import type { APIResponse, PageResponse } from './cvService';

export interface ShortlistResponse {
  id: string;
  candidateProfileId: string;
  candidateFullName: string;
  candidateEmail: string;
  candidateAvatar?: string;
  aiScore?: number;
  suggestedPosition: string;
  totalExperienceYears: number;
  note: string;
  tag: string;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  userRating?: number;
}

export interface ShortlistRequest {
  candidateProfileId: string;
  note?: string;
  tag?: string;
}

export const shortlistService = {
  async addToShortlist(request: ShortlistRequest): Promise<ShortlistResponse> {
    const response = await api.post<APIResponse<ShortlistResponse>>('/shortlist', request);
    return response.data.data;
  },

  async removeFromShortlist(candidateProfileId: string): Promise<void> {
    await api.delete(`/shortlist/candidate/${candidateProfileId}`);
  },

  async isShortlisted(candidateProfileId: string): Promise<boolean> {
    const response = await api.get<APIResponse<boolean>>(
      `/shortlist/check/${candidateProfileId}`
    );
    return response.data.data;
  },

  async getUserShortlist(page = 0, size = 20): Promise<PageResponse<ShortlistResponse>> {
    const response = await api.get<APIResponse<PageResponse<ShortlistResponse>>>('/shortlist', {
      params: { page, size },
    });
    return response.data.data;
  },

  async getByTag(tag: string): Promise<ShortlistResponse[]> {
    const response = await api.get<APIResponse<ShortlistResponse[]>>(`/shortlist/tag/${tag}`);
    return response.data.data;
  },

  async updateNote(
    candidateProfileId: string,
    note?: string,
    tag?: string
  ): Promise<ShortlistResponse> {
    const response = await api.put<APIResponse<ShortlistResponse>>(
      `/shortlist/candidate/${candidateProfileId}`,
      null,
      { params: { note, tag } }
    );
    return response.data.data;
  },
};

export default shortlistService;
