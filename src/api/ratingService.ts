import api from './axios';
import type { APIResponse } from './cvService';

export interface RatingResponse {
  id: string;
  candidateProfileId: string;
  userId?: string;
  userName?: string;
  score?: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
  averageScore: number;
  totalRatings: number;
}

export interface RateCandidateRequest {
  candidateProfileId: string;
  score: number;
  note?: string;
}

export const ratingService = {
  async rate(request: RateCandidateRequest): Promise<RatingResponse> {
    const response = await api.post<APIResponse<RatingResponse>>('/ratings', request);
    return response.data.data;
  },

  async getRating(candidateProfileId: string): Promise<RatingResponse> {
    const response = await api.get<APIResponse<RatingResponse>>(
      `/ratings/candidate/${candidateProfileId}`
    );
    return response.data.data;
  },

  async deleteRating(candidateProfileId: string): Promise<void> {
    await api.delete(`/ratings/candidate/${candidateProfileId}`);
  },
};

export default ratingService;
