export const APP_NAME = 'CV Analyzer AI';
export const APP_VERSION = '1.0.0';

export const ROUTES = {
  HOME: '/home',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_OTP: '/verify-otp',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  UPLOAD: '/upload',
  MY_CVS: '/mycvs',
  ANALYSIS: '/analysis',
  SEARCH: '/search',
  SHORTLIST: '/shortlist',
  AI_JOB_MATCHING: '/ai-job-matching',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_CANDIDATES: '/admin/candidates',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_LOGS: '/admin/logs',
} as const;

export const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const FILE_LIMITS = {
  MAX_CV_SIZE_MB: 10,
  MAX_AVATAR_SIZE_MB: 5,
  ALLOWED_CV_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_AVATAR_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

export const CV_STATUS = {
  UPLOADED: 'UPLOADED',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const;

export const ROLES = {
  ADMIN: 'admin',
  RECRUITER: 'recruiter',
  USER: 'user',
} as const;

export const ROLE_DISPLAY = {
  admin: 'Quản trị viên',
  recruiter: 'Nhà tuyển dụng',
  user: 'Người dùng',
} as const;

export const MATCH_THRESHOLDS = {
  EXCELLENT: 90,
  STRONG: 75,
  GOOD: 60,
  PARTIAL: 40,
} as const;

export const NAV_ITEMS = [
  { path: '/dashboard', labelKey: 'nav.dashboard', icon: 'LayoutDashboard' },
  { path: '/upload', labelKey: 'nav.upload', icon: 'Upload' },
  { path: '/mycvs', labelKey: 'nav.myCvs', icon: 'FileText' },
  { path: '/analysis', labelKey: 'nav.analysis', icon: 'BarChart3' },
  { path: '/search', labelKey: 'nav.search', icon: 'Search' },
  { path: '/shortlist', labelKey: 'nav.shortlist', icon: 'Bookmark' },
  { path: '/ai-job-matching', labelKey: 'nav.aiJobMatching', icon: 'Sparkles' },
  { path: '/profile', labelKey: 'nav.profile', icon: 'User' },
  { path: '/settings', labelKey: 'nav.settings', icon: 'Settings' },
] as const;

export const ADMIN_NAV_ITEMS = [
  { path: '/admin', label: 'Tổng quan', icon: 'LayoutDashboard' },
  { path: '/admin/users', label: 'Người dùng', icon: 'Users' },
  { path: '/admin/candidates', label: 'Ứng viên', icon: 'UserCog' },
  { path: '/admin/reports', label: 'Báo cáo', icon: 'BarChart3' },
  { path: '/admin/logs', label: 'Nhật ký', icon: 'ClipboardList' },
] as const;
