import { ref, computed } from 'vue';
import { store, setCredentials, setToken } from '../store';
import { authService } from '../api/authService';
import api from '../api/axios';
import { cookieStorage } from '../api/axios';

const user = ref<any>(null);
const token = ref<string | null>(null);
const isLoading = ref(false);

interface StoredUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

// Khởi tạo auth state từ cookie
const initializeAuth = () => {
  const accessToken = cookieStorage.getItem('accessToken');
  const refreshToken = cookieStorage.getItem('refreshToken');
  const userStr = cookieStorage.getItem('user');
  
  if (accessToken) {
    token.value = accessToken;
    store.dispatch(setToken(accessToken));
  }
  
  if (userStr) {
    try {
      const storedUser: StoredUser = JSON.parse(userStr);
      user.value = storedUser;
      store.dispatch(setCredentials({ 
        user: storedUser as any, 
        token: accessToken || '' 
      }));
    } catch (e) {
      console.error('Failed to parse stored user:', e);
    }
  }
  
  // Trả về true nếu có token
  return !!accessToken && !!refreshToken;
};

initializeAuth();

// Login
const login = async (email: string, password: string) => {
  isLoading.value = true;

  try {
    const response = await authService.login({ email, password });
    
    // authService đã lưu token vào cookie và store rồi
    // Chỉ cần kiểm tra success và return
    if (response.success) {
      return { success: true, message: response.message };
    } else {
      return { success: false, message: response.message };
    }
  } catch (err: any) {
    return { success: false, message: err.response?.data?.message || 'Đăng nhập thất bại' };
  } finally {
    isLoading.value = false;
  }
};

// Register
const register = async (data: { fullName: string; email: string; username: string; password: string }) => {
  isLoading.value = true;

  try {
    const response = await authService.register(data);

    // authService đã lưu token vào cookie và store rồi
    if (response.success) {
      return { success: true, message: response.message };
    } else {
      return { success: false, message: response.message };
    }
  } catch (err: any) {
    return { success: false, message: err.response?.data?.message || 'Đăng ký thất bại' };
  } finally {
    isLoading.value = false;
  }
};

// Fetch current user từ API bằng token (gọi sau khi login thành công)
const fetchCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    
    if (response.data.success && response.data.data) {
      const userData = response.data.data;
      const profileData = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        name: userData.profile?.fullName || userData.username || '',
        avatar: userData.profile?.avatarUrl,
        phone: userData.profile?.phone,
        address: userData.profile?.address,
        company: userData.profile?.company,
        jobTitle: userData.profile?.jobTitle,
        // Lấy primary role từ roleNames, xử lý cả 2 format: "ROLE_ADMIN" và "ADMIN"
        role: (() => {
          const roleNames = userData.roleNames || [];
          if (roleNames.length === 0) return 'user';
          const primary = roleNames[0];
          // Loại bỏ prefix ROLE_ nếu có
          return primary.startsWith('ROLE_') 
            ? primary.substring(5).toLowerCase() 
            : primary.toLowerCase();
        })(),
        createdAt: userData.createdAt,
        enabled: userData.enabled,
        emailVerified: userData.emailVerified
      };

      user.value = profileData;
      store.dispatch(setCredentials({
        user: profileData,
        token: cookieStorage.getItem('accessToken') || ''
      }));
      cookieStorage.setItem('user', JSON.stringify(profileData), 7);

      return profileData;
    }
    return null;
  } catch (err) {
    console.error('[useAuth] Failed to fetch current user:', err);
    return null;
  }
};

// Fetch user profile từ API (theo userId)
const fetchUserProfile = async (userId: string) => {
  try {
    const response = await api.get(`/users/${userId}`);
    
    if (response.data.success && response.data.data) {
      const userData = response.data.data;
      const profileData = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        name: userData.profile?.fullName || userData.username || '',
        avatar: userData.profile?.avatarUrl,
        phone: userData.profile?.phone,
        address: userData.profile?.address,
        company: userData.profile?.company,
        jobTitle: userData.profile?.jobTitle,
        // Lấy primary role từ roleNames, xử lý cả 2 format: "ROLE_ADMIN" và "ADMIN"
        role: (() => {
          const roleNames = userData.roleNames || [];
          if (roleNames.length === 0) return 'user';
          const primary = roleNames[0];
          // Loại bỏ prefix ROLE_ nếu có
          return primary.startsWith('ROLE_') 
            ? primary.substring(5).toLowerCase() 
            : primary.toLowerCase();
        })(),
        createdAt: userData.createdAt,
        enabled: userData.enabled,
        emailVerified: userData.emailVerified
      };

      // Cập nhật store
      store.dispatch(setCredentials({
        user: profileData,
        token: cookieStorage.getItem('accessToken') || ''
      }));

      // Lưu user vào cookie để persist khi reload
      cookieStorage.setItem('user', JSON.stringify(profileData), 7);

      return profileData;
    }
    return null;
  } catch (err) {
    console.error('Failed to fetch user profile:', err);
    return null;
  }
};

// Refresh user data
const refreshUser = async () => {
  if (!user.value?.id) return;
  
  const profile = await fetchUserProfile(user.value.id);
  if (profile) {
    user.value = profile;
  }
};

// Update user profile
const updateUserProfile = async (data: any) => {
  if (!user.value?.id) return { success: false, message: 'User not found' };

  try {
    const response = await api.put(`/users/${user.value.id}/profile`, data);
    
    if (response.data.success) {
      await refreshUser();
      return { success: true, message: 'Cập nhật thành công' };
    }
    return { success: false, message: response.data.message };
  } catch (err: any) {
    return { success: false, message: err.response?.data?.message || 'Cập nhật thất bại' };
  }
};

// Logout
const logout = async () => {
  await authService.logout();
  user.value = null;
  token.value = null;
  cookieStorage.removeItem('user');
  store.dispatch({ type: 'auth/logout' });
};

// Kiểm tra auth và fetch user nếu có token
const checkAuth = async () => {
  const accessToken = cookieStorage.getItem('accessToken');
  const userStr = cookieStorage.getItem('user');

  if (accessToken && userStr) {
    try {
      const storedUser = JSON.parse(userStr);
      token.value = accessToken;
      user.value = storedUser;
      
      store.dispatch(setCredentials({ user: storedUser, token: accessToken }));
      
      // Fetch fresh data từ API để đảm bảo data mới nhất
      await refreshUser();
      return true;
    } catch (e) {
      console.error('Failed to parse stored user:', e);
    }
  }
  
  return false;
};

// Computed
const isAuthenticated = computed(() => !!user.value && !!token.value);

export function useAuth() {
  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    updateUserProfile,
    checkAuth,
    fetchUserProfile,
    fetchCurrentUser
  };
}

export default useAuth;
