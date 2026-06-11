import api from './axios';

export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status: number;
}

export interface UserPreferences {
  preferences?: {
    language?: string;
    theme?: 'light' | 'dark';
    emailNotificationEnabled?: boolean;
    systemNotificationEnabled?: boolean;
    analysisCompleteNotification?: boolean;
    newCandidateNotification?: boolean;
    reminderNotification?: boolean;
    allowSearch?: boolean;
    publicCV?: boolean;
    showEmail?: boolean;
    compactMode?: boolean;
  };
  language?: string;
  theme?: 'light' | 'dark';
  emailNotificationEnabled?: boolean;
  systemNotificationEnabled?: boolean;
  analysisCompleteNotification?: boolean;
  newCandidateNotification?: boolean;
  reminderNotification?: boolean;
  allowSearch?: boolean;
  publicCV?: boolean;
  showEmail?: boolean;
  compactMode?: boolean;
}

export interface NotificationSettings {
  email: boolean;
  analysisComplete: boolean;
  newCandidate: boolean;
  reminders: boolean;
  push: boolean;
}

export interface PrivacySettings {
  allowSearch: boolean;
  publicCV: boolean;
  showEmail: boolean;
}

export interface AppearanceSettings {
  language: string;
  theme: 'light' | 'dark';
  compactMode: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange?: string;
}

export interface DataExport {
  format: 'JSON' | 'CSV' | 'PDF';
  includeCVs: boolean;
  includeProfiles: boolean;
  includeAnalysis: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const settingsService = {
  async getPreferences(): Promise<UserPreferences> {
    const response = await api.get<APIResponse<UserPreferences>>('/auth/me');
    return response.data.data?.preferences || {};
  },

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await api.put<APIResponse<{ preferences: UserPreferences }>>(
      `/users/${userId}/preferences`,
      preferences
    );
    return response.data.data?.preferences || {};
  },

  async updateNotificationSettings(userId: string, settings: NotificationSettings): Promise<void> {
    await api.put(`/users/${userId}/preferences`, {
      emailNotificationEnabled: settings.email,
      systemNotificationEnabled: settings.push,
      analysisCompleteNotification: settings.analysisComplete,
      newCandidateNotification: settings.newCandidate,
      reminderNotification: settings.reminders
    });
  },

  async updatePrivacySettings(userId: string, settings: PrivacySettings): Promise<void> {
    await api.put(`/users/${userId}/preferences`, {
      allowSearch: settings.allowSearch,
      publicCV: settings.publicCV,
      showEmail: settings.showEmail
    });
  },

  async updateAppearanceSettings(userId: string, settings: AppearanceSettings): Promise<void> {
    await api.put(`/users/${userId}/preferences`, {
      language: settings.language,
      theme: settings.theme,
      compactMode: settings.compactMode
    });
  },

  async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/auth/change-password', data);
    return response.data;
  },

  async sendResetPasswordOtp(email: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPasswordWithOtp(data: {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/auth/reset-password', {
      email: data.email,
      otp: data.otp,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword
    });
    return response.data;
  },

  async enableTwoFactor(): Promise<{ success: boolean; message: string; qrCode?: string }> {
    const response = await api.post<{ success: boolean; message: string; qrCode?: string }>(
      '/users/enable-2fa'
    );
    return response.data;
  },

  async disableTwoFactor(): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
      '/users/disable-2fa'
    );
    return response.data;
  },

  async exportData(data: DataExport): Promise<Blob> {
    const response = await api.post(
      '/users/export-data',
      data,
      { responseType: 'blob' }
    );
    return response.data;
  },

  async importData(file: File): Promise<{ success: boolean; message: string; imported: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<APIResponse<{ imported: number }>>(
      '/users/import-data',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return { success: true, message: 'Import thành công', imported: response.data.data?.imported || 0 };
  },

  async deleteAllData(): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(
      '/users/delete-all-data'
    );
    return response.data;
  },

  async deleteAccount(userId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/users/${userId}`
    );
    return response.data;
  }
};

export default settingsService;
