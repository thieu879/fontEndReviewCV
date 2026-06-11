import api from './axios';

export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status: number;
}

export interface UserProfileResponse {
  id: string;
  username: string;
  email: string;
  provider: string;
  status: string;
  enabled: boolean;
  accountNonLocked: boolean;
  emailVerified: boolean;
  deleted: boolean;
  lastLoginAt: string;
  roleIds: string[];
  profile: {
    fullName?: string;
    phone?: string;
    avatarUrl?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    city?: string;
    country?: string;
    company?: string;
    jobTitle?: string;
  };
  preferences: {
    language?: string;
    theme?: string;
    emailNotificationEnabled?: boolean;
    systemNotificationEnabled?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  country?: string;
  company?: string;
  jobTitle?: string;
}

export interface UpdatePreferencesRequest {
  language?: string;
  theme?: string;
  emailNotificationEnabled?: boolean;
  systemNotificationEnabled?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileStats {
  totalCVs: number;
  analyzedCVs: number;
  avgMatchScore: number;
  pendingCVs: number;
}

export const profileService = {
  async getProfile(): Promise<UserProfileResponse> {
    const response = await api.get<APIResponse<UserProfileResponse>>('/auth/me');
    return response.data.data;
  },

  async getProfileById(userId: string): Promise<UserProfileResponse> {
    const response = await api.get<APIResponse<UserProfileResponse>>(`/users/${userId}`);
    return response.data.data;
  },

  async updateProfile(userId: string, data: UpdateProfileRequest): Promise<UserProfileResponse> {
    const response = await api.put<APIResponse<UserProfileResponse>>(`/users/${userId}/profile`, data);
    return response.data.data;
  },

  async updatePreferences(userId: string, data: UpdatePreferencesRequest): Promise<UserProfileResponse> {
    const response = await api.put<APIResponse<UserProfileResponse>>(`/users/${userId}/preferences`, data);
    return response.data.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/auth/change-password', data);
    return response.data;
  },

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{ avatarUrl: string }>('/users/me/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteAccount(userId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(`/users/${userId}`);
    return response.data;
  },

  async getProfileStats(userId: string): Promise<ProfileStats> {
    const response = await api.get<APIResponse<ProfileStats>>(`/users/${userId}/stats`);
    return response.data.data;
  },

  async verifyEmail(email: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/auth/send-verify-email-otp', null, {
      params: { email }
    });
    return response.data;
  }
};

export default profileService;
