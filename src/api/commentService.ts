import api from './axios';
import type { APIResponse, PageResponse } from './cvService';

export interface CommentResponse {
  id: string;
  candidateProfileId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  parentId?: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  replyCount: number;
}

export interface CreateCommentRequest {
  candidateProfileId: string;
  content: string;
  parentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export const commentService = {
  async createComment(request: CreateCommentRequest): Promise<CommentResponse> {
    const response = await api.post<APIResponse<CommentResponse>>('/comments', request);
    return response.data.data;
  },

  async updateComment(commentId: string, request: UpdateCommentRequest): Promise<CommentResponse> {
    const response = await api.put<APIResponse<CommentResponse>>(`/comments/${commentId}`, request);
    return response.data.data;
  },

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  },

  async getComments(candidateProfileId: string, page = 0, size = 10): Promise<PageResponse<CommentResponse>> {
    const response = await api.get<APIResponse<PageResponse<CommentResponse>>>(
      `/comments/candidate/${candidateProfileId}`,
      { params: { page, size } }
    );
    return response.data.data;
  },

  async getReplies(commentId: string): Promise<CommentResponse[]> {
    const response = await api.get<APIResponse<CommentResponse[]>>(`/comments/${commentId}/replies`);
    return response.data.data;
  },
};

export default commentService;
