import api, { cookieStorage } from './axios';
import { store, setCredentials, setToken } from '../store';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  username: string;
  password: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface UserProfile {
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  address?: string;
  company?: string;
  jobTitle?: string;
}

export interface AuthUser {
  id: string;
  username?: string;
  email: string;
  profile?: UserProfile;
  roleIds?: string[];
  roleNames?: string[];
  createdAt?: string;
  enabled?: boolean;
  emailVerified?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken?: string;
    tokenType?: string;
    expiresIn?: number;
    user: AuthUser;
  };
}

export interface APIError {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

// Helper function để extract primary role từ roleNames
// roleNames có thể là ["ROLE_ADMIN", "ROLE_USER"] hoặc ["ADMIN", "USER"]
// Kết quả luôn là lowercase và không có prefix ROLE_
function extractPrimaryRole(roleNames: string[] | undefined): string {
  if (!roleNames || roleNames.length === 0) {
    return 'user';
  }
  const primary = roleNames[0];
  // Nếu có prefix ROLE_, loại bỏ nó
  const cleaned = primary.startsWith('ROLE_') ? primary.substring(5) : primary;
  return cleaned.toLowerCase();
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        usernameOrEmail: credentials.email,
        password: credentials.password
      });
      
      if (response.data.success && response.data.data) {
        const userData = response.data.data;
        const accessToken = userData.accessToken;
        const refreshToken = userData.refreshToken;

        // Lưu accessToken và refreshToken vào cookie
        cookieStorage.setItem('accessToken', accessToken, 1); // 1 ngày
        cookieStorage.setItem('refreshToken', refreshToken || '', 7); // 7 ngày

        // Lấy primary role từ roleNames (backend đã trả về role names đầy đủ)
        const primaryRole = extractPrimaryRole(userData.user.roleNames);

        // Lưu thông tin user vào store
        store.dispatch(setCredentials({
          user: {
            id: userData.user.id,
            name: userData.user.profile?.fullName || userData.user.username || '',
            email: userData.user.email,
            avatar: userData.user.profile?.avatarUrl,
            role: primaryRole as 'admin' | 'recruiter' | 'user',
            createdAt: userData.user.createdAt || new Date().toISOString()
          },
          token: accessToken
        }));

        // Lưu user vào cookie để persist khi reload
        const userInfo = {
          id: userData.user.id,
          name: userData.user.profile?.fullName || userData.user.username || '',
          email: userData.user.email,
          avatar: userData.user.profile?.avatarUrl,
          role: primaryRole
        };
        cookieStorage.setItem('user', JSON.stringify(userInfo), 7);
      }
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', {
        fullName: data.fullName,
        email: data.email,
        username: data.username,
        password: data.password,
        confirmPassword: data.password
      });

      if (response.data.success && response.data.data) {
        const userData = response.data.data;
        const accessToken = userData.accessToken;
        const refreshToken = userData.refreshToken;

        // Chỉ lưu token nếu có giá trị hợp lệ (null khi đăng ký chưa xác thực email)
        if (accessToken) {
          cookieStorage.setItem('accessToken', accessToken, 1);
        }
        if (refreshToken) {
          cookieStorage.setItem('refreshToken', refreshToken, 7);
        }

        // Lấy primary role từ roleNames (backend đã trả về role names đầy đủ)
        const primaryRole = extractPrimaryRole(userData.user.roleNames);

        // Lưu thông tin user vào store
        store.dispatch(setCredentials({
          user: {
            id: userData.user.id,
            name: userData.user.profile?.fullName || data.fullName || '',
            email: userData.user.email,
            avatar: userData.user.profile?.avatarUrl,
            role: primaryRole as 'admin' | 'recruiter' | 'user',
            createdAt: userData.user.createdAt || new Date().toISOString()
          },
          token: accessToken || ''
        }));

        // Lưu user vào cookie để persist khi reload
        const userInfo = {
          id: userData.user.id,
          name: userData.user.profile?.fullName || data.fullName || '',
          email: userData.user.email,
          avatar: userData.user.profile?.avatarUrl,
          role: primaryRole
        };
        cookieStorage.setItem('user', JSON.stringify(userInfo), 7);

        localStorage.setItem('pendingRegistrationEmail', data.email);
      }

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  async verifyOTP(data: VerifyOTPRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/verify-otp', {
        email: data.email,
        otp: data.otp
      });

      if (response.data.success && response.data.data) {
        const userData = response.data.data;
        cookieStorage.setItem('accessToken', userData.accessToken, 1);
        cookieStorage.setItem('refreshToken', userData.refreshToken || '', 7);
        localStorage.removeItem('pendingRegistrationEmail');
      }

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Xác thực OTP thất bại. Vui lòng thử lại.';
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // Verify email đăng ký và đăng nhập luôn
  async verifyEmailAndLogin(data: VerifyEmailRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/verify-email-login', {
        email: data.email,
        otp: data.otp
      });

      if (response.data.success && response.data.data) {
        const userData = response.data.data;
        const accessToken = userData.accessToken;
        const refreshToken = userData.refreshToken;

        // Lưu accessToken và refreshToken vào cookie
        cookieStorage.setItem('accessToken', accessToken, 1);
        cookieStorage.setItem('refreshToken', refreshToken || '', 7);

        // Lấy primary role từ roleNames (backend đã trả về role names đầy đủ)
        const primaryRole = extractPrimaryRole(userData.user.roleNames);

        // Lưu thông tin user vào store
        store.dispatch(setCredentials({
          user: {
            id: userData.user.id,
            name: userData.user.profile?.fullName || userData.user.username || '',
            email: userData.user.email,
            avatar: userData.user.profile?.avatarUrl,
            role: primaryRole as 'admin' | 'recruiter' | 'user',
            createdAt: userData.user.createdAt || new Date().toISOString()
          },
          token: accessToken
        }));

        // Lưu user vào cookie để persist khi reload
        const userInfo = {
          id: userData.user.id,
          name: userData.user.profile?.fullName || userData.user.username || '',
          email: userData.user.email,
          avatar: userData.user.profile?.avatarUrl,
          role: primaryRole
        };
        cookieStorage.setItem('user', JSON.stringify(userInfo), 7);
        localStorage.removeItem('pendingRegistrationEmail');
      }

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Xác thực email thất bại. Vui lòng thử lại.';
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  async resendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>('/auth/resend-otp', { email });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gửi lại OTP thất bại. Vui lòng thử lại.';
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>('/auth/forgot-password', { email: data.email });

      if (response.data.success) {
        localStorage.setItem('passwordResetEmail', data.email);
        localStorage.setItem('isPasswordReset', 'true');
      }

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.';
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  async resetPassword(data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      const storedEmail = localStorage.getItem('passwordResetEmail') || data.email;

      const response = await api.post<{ success: boolean; message: string }>('/auth/reset-password', {
        email: storedEmail,
        otp: data.otp,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword || data.newPassword
      });

      localStorage.removeItem('passwordResetEmail');
      localStorage.removeItem('passwordResetOtp');
      localStorage.removeItem('isPasswordReset');

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.';
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = cookieStorage.getItem('refreshToken');
      
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      this.clearAuthData();
      store.dispatch({ type: 'auth/logout' });
      window.location.href = '/login';
    }
  },

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = cookieStorage.getItem('refreshToken');
      if (!refreshToken) {
        return null;
      }

      const response = await api.post<AuthResponse>('/auth/refresh-token', {
        refreshToken
      });

      if (response.data.success && response.data.data) {
        const newAccessToken = response.data.data.accessToken;
        const newRefreshToken = response.data.data.refreshToken;

        // Cập nhật cookie với token mới
        cookieStorage.setItem('accessToken', newAccessToken, 1);
        
        if (newRefreshToken) {
          cookieStorage.setItem('refreshToken', newRefreshToken, 7);
        }

        store.dispatch(setToken(newAccessToken));
        return newAccessToken;
      }
      return null;
    } catch (error) {
      this.clearAuthData();
      store.dispatch({ type: 'auth/logout' });
      return null;
    }
  },

  clearAuthData(): void {
    // Xóa cookie
    cookieStorage.removeItem('accessToken');
    cookieStorage.removeItem('refreshToken');
    cookieStorage.removeItem('user');
    
    // Xóa localStorage (chỉ dùng cho OTP, password reset)
    localStorage.removeItem('pendingRegistrationEmail');
    localStorage.removeItem('passwordResetEmail');
    localStorage.removeItem('passwordResetOtp');
    localStorage.removeItem('isPasswordReset');
  },

  getStoredEmail(): string {
    return localStorage.getItem('pendingRegistrationEmail') || 
           localStorage.getItem('passwordResetEmail') || 
           '';
  },

  isAuthenticated(): boolean {
    const accessToken = cookieStorage.getItem('accessToken');
    const refreshToken = cookieStorage.getItem('refreshToken');
    return !!accessToken && !!refreshToken;
  },

  async getCurrentUser(): Promise<any> {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }
};

export default authService;
