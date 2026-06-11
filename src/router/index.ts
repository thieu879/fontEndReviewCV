import { createRouter, createWebHistory } from 'vue-router';
import { store, setCredentials } from '../store';
import cookieStorage from '../utils/cookieStorage';
import { useTheme } from '@/composables/useTheme';

// Initialize theme before app renders (prevents flash of wrong theme)
useTheme();

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-otp', '/'];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      name: 'Home',
      component: () => import('../views/HomeView.vue')
    },
    // Auth routes
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/auth/RegisterView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: () => import('../views/auth/ForgotPasswordView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/verify-otp',
      name: 'VerifyOTP',
      component: () => import('../views/auth/VerifyOTPView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: () => import('../views/auth/ResetPasswordView.vue'),
      meta: { requiresAuth: false }
    },
    // Protected routes
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/dashboard/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/upload',
      name: 'Upload',
      component: () => import('../views/upload/UploadView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/mycvs',
      name: 'MyCVs',
      component: () => import('../views/mycvs/MyCVsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/analysis',
      name: 'Analysis',
      component: () => import('../views/analysis/AnalysisView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import('../views/search/SearchView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/shortlist',
      name: 'Shortlist',
      component: () => import('../views/shortlist/ShortlistView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/profile/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/settings/SettingsView.vue'),
      meta: { requiresAuth: true }
    },
    // Admin routes
    {
      path: '/admin',
      name: 'AdminDashboard',
      component: () => import('../views/admin/AdminDashboardView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/users',
      name: 'UserManagement',
      component: () => import('../views/admin/UserManagementView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/candidates',
      name: 'CandidatesManagement',
      component: () => import('../views/admin/CandidatesView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/reports',
      name: 'Reports',
      component: () => import('../views/admin/ReportsView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/logs',
      name: 'SystemLogs',
      component: () => import('../views/admin/SystemLogsView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    // Catch all - redirect to home
    {
      path: '/:pathMatch(.*)*',
      redirect: '/home'
    }
  ]
});

// Navigation guard
router.beforeEach(async (to, _from, next) => {
  const accessToken = cookieStorage.getItem('accessToken');
  const refreshToken = cookieStorage.getItem('refreshToken');
  const isAuthenticated = !!accessToken && !!refreshToken;
  
  // Khôi phục user từ cookie và cập nhật store
  if (isAuthenticated && !store.getState().auth.user) {
    const userStr = cookieStorage.getItem('user');
    if (userStr) {
      try {
        const storedUser = JSON.parse(userStr);
        store.dispatch(setCredentials({ user: storedUser, token: accessToken || '' }));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
  }
  
  const user = store.getState().auth.user;
  const isAdmin = user?.role === 'admin';

  // Public routes (no auth required)
  if (publicRoutes.includes(to.path)) {
    if (isAuthenticated && (to.path === '/login' || to.path === '/register')) {
      // If already logged in, redirect to dashboard
      return next('/dashboard');
    }
    return next();
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      // Not authenticated, redirect to login
      return next('/login');
    }

    // Check if route requires admin role
    if (to.meta.requiresAdmin && !isAdmin) {
      // Not admin, redirect to dashboard
      return next('/dashboard');
    }
  }

  next();
});

export default router;
