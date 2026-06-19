import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { cookieStorage } from '@/api/axios'
import { useAuthGuard } from '@/composables/useAuthGuard'

const routes: RouteRecordRaw[] = [
  // Auth routes
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false, layout: 'auth' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { requiresAuth: false, layout: 'auth' }
  },
  
  // Admin routes
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/AdminDashboardView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('@/views/admin/UserManagementView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' }
  },
  {
    path: '/admin/audit',
    name: 'AdminAudit',
    component: () => import('@/views/admin/AuditLogsView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' }
  },
  {
    path: '/admin/jobs',
    name: 'AdminJobs',
    component: () => import('@/views/admin/JobManagementView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' }
  },
  {
    path: '/admin/scraping/sources',
    name: 'AdminScrapingSources',
    component: () => import('@/views/admin/ScrapingSourcesView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' }
  },
  {
    path: '/admin/scraping-sources',
    redirect: '/admin/scraping/sources'
  },
  {
    path: '/admin/scraping/logs',
    name: 'AdminScrapingLogs',
    component: () => import('@/views/admin/ScrapingLogsView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' }
  },
  {
    path: '/admin/scraping-logs',
    redirect: '/admin/scraping/logs'
  },
  {
    path: '/admin/ai/config',
    name: 'AdminAIConfig',
    component: () => import('@/views/admin/AIConfigView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' }
  },
  {
    path: '/admin/ai/usage',
    name: 'AdminAIUsage',
    component: () => import('@/views/admin/AIUsageView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' }
  },
  {
    path: '/admin/reports',
    name: 'AdminReports',
    component: () => import('@/views/admin/ReportsView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' }
  },
  {
    path: '/admin/applications',
    name: 'AdminApplications',
    component: () => import('@/views/admin/ApplicationManagementView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' }
  },
  {
    path: '/admin/notifications',
    name: 'AdminNotifications',
    component: () => import('@/views/admin/NotificationCenterView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' }
  },

  // Public routes
  {
    path: '/',
    alias: '/home',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: false, layout: 'main' }
  },
  
  // User routes (authenticated)
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { requiresAuth: true, layout: 'main' }
  },
  {
    path: '/upload',
    name: 'Upload',
    component: () => import('@/views/upload/UploadView.vue'),
    meta: { requiresAuth: true, layout: 'main' }
  },
  {
    path: '/mycvs',
    name: 'MyCVs',
    component: () => import('@/views/mycvs/MyCVsView.vue'),
    meta: { requiresAuth: true, layout: 'main' }
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: () => import('@/views/analysis/AnalysisView.vue'),
    meta: { requiresAuth: true, layout: 'main' }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/search/SearchView.vue'),
    meta: { requiresAuth: true, layout: 'main' }
  },
  {
    path: '/shortlist',
    name: 'Shortlist',
    component: () => import('@/views/shortlist/ShortlistView.vue'),
    meta: { requiresAuth: true, layout: 'main' }
  },
  {
    path: '/ai-job-matching',
    name: 'AIJobMatching',
    component: () => import('@/views/jobs/AIJobMatchingView.vue'),
    meta: { requiresAuth: true, layout: 'main' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/ProfileView.vue'),
    meta: { requiresAuth: true, layout: 'main' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/settings/SettingsView.vue'),
    meta: { requiresAuth: true, layout: 'main' }
  },

  // Job routes
  {
    path: '/jobs',
    name: 'JobListing',
    component: () => import('@/views/jobs/JobListingView.vue'),
    meta: { requiresAuth: false, layout: 'main' }
  },
  {
    path: '/jobs/:id',
    name: 'JobDetail',
    component: () => import('@/views/jobs/JobDetailView.vue'),
    meta: { requiresAuth: false, layout: 'main' }
  },
  {
    path: '/jobs/:id/apply',
    name: 'JobApply',
    component: () => import('@/views/jobs/JobApplyView.vue'),
    meta: { requiresAuth: true, layout: 'main' }
  },
  {
    path: '/jobs/saved',
    name: 'SavedJobs',
    component: () => import('@/views/jobs/SavedJobsView.vue'),
    meta: { requiresAuth: true, layout: 'main' }
  },

  // Auth routes (password reset)
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/auth/ForgotPasswordView.vue'),
    meta: { requiresAuth: false, layout: 'auth' }
  },
  {
    path: '/verify-otp',
    name: 'VerifyOTP',
    component: () => import('@/views/auth/VerifyOTPView.vue'),
    meta: { requiresAuth: false, layout: 'auth' }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/auth/ResetPasswordView.vue'),
    meta: { requiresAuth: false, layout: 'auth' }
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach((to, _from, next) => {
  const { isAuthenticated, isAdmin } = useAuthGuard()
  const isAuth = isAuthenticated()

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuth) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // Check if route requires admin
  if (to.meta.requiresAdmin && !isAdmin()) {
    // Redirect non-admin users to home or dashboard
    next({ name: 'Home' })
    return
  }

  // Redirect authenticated users away from login
  if (to.name === 'Login' && isAuth) {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router
