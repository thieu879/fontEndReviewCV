import axios from 'axios';
import { store } from '../store';
import cookieStorage from '../utils/cookieStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

const subscribeTokenRefresh = (resolve: (token: string) => void, reject: (err: any) => void) => {
  refreshSubscribers.push({ resolve, reject });
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(({ resolve }) => resolve(token));
  refreshSubscribers = [];
};

const onRefreshFailed = (error: any) => {
  refreshSubscribers.forEach(({ reject }) => reject(error));
  refreshSubscribers = [];
};

// Helper function để clear auth và redirect
function clearAuthAndRedirect() {
  cookieStorage.removeItem('accessToken');
  cookieStorage.removeItem('refreshToken');
  cookieStorage.removeItem('user');
  store.dispatch({ type: 'auth/logout' });
  
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
}

api.interceptors.request.use(
  (config) => {
    // Lấy token từ cookie trước, fallback sang store
    let token = cookieStorage.getItem('accessToken');
    if (!token) {
      token = store.getState().auth.token;
    }
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Bỏ qua refresh cho request login/register/refresh-token
      if (originalRequest.url?.includes('/auth/login') || 
          originalRequest.url?.includes('/auth/register') ||
          originalRequest.url?.includes('/auth/refresh-token')) {
        return Promise.reject(error);
      }

      // Nếu đang refresh, queue request và chờ
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(
            (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            (err: any) => {
              reject(err);
            }
          );
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = cookieStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          console.warn('No refresh token available, logging out...');
          clearAuthAndRedirect();
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          { refreshToken },
          { withCredentials: true }
        );

        if (response.data.success && response.data.data) {
          const newAccessToken = response.data.data.accessToken;
          const newRefreshToken = response.data.data.refreshToken;

          // Cập nhật token mới vào cookie
          cookieStorage.setItem('accessToken', newAccessToken, 1); // 1 ngày
          if (newRefreshToken) {
            cookieStorage.setItem('refreshToken', newRefreshToken, 7); // 7 ngày
          }
          store.dispatch({ type: 'auth/setToken', payload: newAccessToken });

          onTokenRefreshed(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
        
        console.warn('Refresh token response invalid, logging out...');
        clearAuthAndRedirect();
        return Promise.reject(error);
      } catch (refreshError: any) {
        console.error('Token refresh failed:', refreshError.response?.data?.message || refreshError.message);
        onRefreshFailed(refreshError);
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { cookieStorage, subscribeTokenRefresh, onRefreshFailed };
