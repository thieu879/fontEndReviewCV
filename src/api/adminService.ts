import axios from './axios'

export interface DashboardStats {
  totalUsers: number
  totalCandidates: number
  totalRecruiters: number
  totalJobs: number
  totalApplications: number
  totalCvAnalyses: number
  activeJobs: number
  pendingApprovals: number
  userGrowthTrend: Array<{ date: string; count: number }>
  applicationTrend: Array<{ date: string; count: number }>
  jobPostingTrend: Array<{ date: string; count: number }>
  topRecruiters: Array<{ id: string; companyName: string; activeJobsCount: number; totalApplications: number; averageResponseRate: number }>
  mostViewedJobs: Array<{ id: string; title: string; companyName: string; viewCount: number; applicationCount: number }>
  lastUpdated: string
}

export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface User {
  id: string
  username: string
  email: string
  fullName: string
  role: string
  status: string
  emailVerified: boolean
  createdAt: string
  lastLogin: string
}

export interface Recruiter {
  id: string
  companyName: string
  email: string
  website: string
  location: string
  industry: string
  verificationStatus: string
  activeJobs: number
  totalApplications: number
  responseRate: number
  joinedAt: string
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  salary: string
  jobType: string
  status: string
  postedAt: string
  applications: number
  views: number
}

export interface Candidate {
  id: string
  fullName: string
  email: string
  location: string
  skills: string[]
  experience: string
  cvStatus: string
  matchScore: number
  applications: number
  lastActive: string
}

export interface AuditLog {
  id: string
  actorUserId: string
  actorUsername: string
  action: string
  targetId: string
  targetType: string
  ipAddress: string
  userAgent: string
  oldData: Record<string, unknown>
  newData: Record<string, unknown>
  createdAt: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  type: string
  priority: number
  isActive: boolean
  sendEmail: boolean
  sendPush: boolean
  scheduledAt: string
  expiresAt: string
  createdAt: string
  viewCount: number
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: string
  isRead: boolean
  isSent: boolean
  createdAt: string
}

export interface ScrapingSource {
  id: string
  name: string
  url: string
  sourceType: string
  isEnabled: boolean
  isActive: boolean
  selector: string
  cronExpression: string
  maxPages: number
  successCount: number
  failureCount: number
  lastStatusCode: number
  lastRunAt: string
  nextRunAt: string
  lastError: string
  priority: number
  createdBy: string
  updatedAt: string
  createdAt: string
}

export interface AIConfiguration {
  id: string
  configKey: string
  displayName: string
  description: string
  configType: string
  configValue: Record<string, unknown>
  category: string
  isActive: boolean
}

export interface AIUsageLog {
  id: string
  userId: string
  operation: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
  processingTimeMs: number
  isSuccess: boolean
  createdAt: string
}

export interface SystemSettings {
  id: string
  settingKey: string
  settingValue: string
  settingType: string
  category: string
  description: string
  isEncrypted: boolean
}

export interface AdminRole {
  id: string
  name: string
  displayName: string
  description: string
  permissions: string[]
  level: number
  isSystem: boolean
  isActive: boolean
}

export interface ContentBlock {
  id: string
  slug: string
  title: string
  content: string
  contentType: string
  section: string
  sortOrder: number
  isActive: boolean
  isFeatured: boolean
}

// Dashboard API
export const adminDashboardApi = {
  getStats: () => axios.get('/admin/dashboard'),
  getRealtimeStats: () => axios.get('/admin/dashboard/realtime'),
  getUserGrowth: (days = 30) => axios.get(`/admin/dashboard/user-growth?days=${days}`),
  getApplicationTrend: (days = 30) => axios.get(`/admin/dashboard/application-trend?days=${days}`),
  getTopRecruiters: (limit = 10) => axios.get(`/admin/dashboard/top-recruiters?limit=${limit}`),
  getMostViewedJobs: (limit = 10) => axios.get(`/admin/dashboard/most-viewed-jobs?limit=${limit}`),
  getActivityFeed: (limit = 20) => axios.get(`/admin/dashboard/activity-feed?limit=${limit}`),
}

// Users API
export const adminUsersApi = {
  getAll: (params?: { page?: number; size?: number; search?: string; role?: string; status?: string }) =>
    axios.get('/admin/users', { params }),
  getById: (id: string) => axios.get(`/admin/users/${id}`),
  create: (data: Record<string, any>) => axios.post('/admin/users', data),
  update: (id: string, data: Record<string, any>) => axios.put(`/admin/users/${id}`, data),
  delete: (id: string) => axios.delete(`/admin/users/${id}`),
  resetPassword: (id: string) => axios.post(`/admin/users/${id}/reset-password`),
  banUser: (id: string) => axios.post(`/admin/users/${id}/ban`),
  unbanUser: (id: string) => axios.post(`/admin/users/${id}/unban`),
}

// Recruiters API
export const adminRecruitersApi = {
  getAll: (params?: { page?: number; size?: number; search?: string; status?: string }) =>
    axios.get('/admin/recruiters', { params }),
  getById: (id: string) => axios.get(`/admin/recruiters/${id}`),
  approve: (id: string) => axios.post(`/admin/recruiters/${id}/approve`),
  reject: (id: string) => axios.post(`/admin/recruiters/${id}/reject`),
  suspend: (id: string) => axios.post(`/admin/recruiters/${id}/suspend`),
}

// Jobs API
export const adminJobsApi = {
  getAll: (params?: { page?: number; size?: number; search?: string; status?: string }) =>
    axios.get('/admin/jobs', { params }),
  getById: (id: string) => axios.get(`/admin/jobs/${id}`),
  approve: (id: string) => axios.post(`/admin/jobs/${id}/approve`),
  reject: (id: string) => axios.post(`/admin/jobs/${id}/reject`),
  feature: (id: string) => axios.post(`/admin/jobs/${id}/feature`),
  delete: (id: string) => axios.delete(`/admin/jobs/${id}`),
}

// Candidates API
export const adminCandidatesApi = {
  getAll: (params?: { page?: number; size?: number; search?: string }) =>
    axios.get('/admin/candidates', { params }),
  getById: (id: string) => axios.get(`/admin/candidates/${id}`),
  ban: (id: string) => axios.post(`/admin/candidates/${id}/ban`),
  unban: (id: string) => axios.post(`/admin/candidates/${id}/unban`),
  export: () => axios.get('/admin/candidates/export', { responseType: 'blob' }),
}

// Audit Logs API
export const adminAuditApi = {
  getAll: (params?: { page?: number; size?: number; userId?: string; action?: string; startDate?: string; endDate?: string }) =>
    axios.get('/admin/audit-logs', { params }),
  getById: (id: string) => axios.get(`/admin/audit-logs/${id}`),
  getStats: () => axios.get('/admin/audit-logs/stats'),
}

// Announcements API
export const adminAnnouncementsApi = {
  getAll: (params?: { page?: number; size?: number; type?: string; isActive?: boolean }) =>
    axios.get('/admin/announcements', { params }),
  getById: (id: string) => axios.get(`/admin/announcements/${id}`),
  create: (data: Partial<Announcement>) => axios.post('/admin/announcements', data),
  update: (id: string, data: Partial<Announcement>) => axios.put(`/admin/announcements/${id}`, data),
  delete: (id: string) => axios.delete(`/admin/announcements/${id}`),
  publish: (id: string) => axios.post(`/admin/announcements/${id}/publish`),
}

// Notifications API
export const adminNotificationsApi = {
  getAll: (params?: { page?: number; size?: number; userId?: string; isRead?: boolean }) =>
    axios.get('/admin/notifications', { params }),
  create: (data: Partial<Notification>) => axios.post('/admin/notifications', data),
  sendBulk: (data: { userIds: string[] } & Partial<Notification>) => axios.post('/admin/notifications/bulk', data),
  sendToRole: (role: string, data: Partial<Notification>) => axios.post(`/admin/notifications/role/${role}`, data),
  markAsRead: (id: string) => axios.post(`/admin/notifications/${id}/read`),
  delete: (id: string) => axios.delete(`/admin/notifications/${id}`),
}

// Scraping API
export const adminScrapingApi = {
  getSources: (params?: { page?: number; size?: number; isEnabled?: boolean }) =>
    axios.get('/admin/scraping/sources', { params }),
  getSourceById: (id: string) => axios.get(`/admin/scraping/sources/${id}`),
  createSource: (data: Partial<ScrapingSource>) => axios.post('/admin/scraping/sources', data),
  updateSource: (id: string, data: Partial<ScrapingSource>) => axios.put(`/admin/scraping/sources/${id}`, data),
  deleteSource: (id: string) => axios.delete(`/admin/scraping/sources/${id}`),
  enableSource: (id: string) => axios.post(`/admin/scraping/sources/${id}/enable`),
  disableSource: (id: string) => axios.post(`/admin/scraping/sources/${id}/disable`),
  runSource: (id: string) => axios.post(`/admin/scraping/sources/${id}/run`),
  runAll: () => axios.post('/admin/scraping/run-all'),
  getLogs: (params?: { page?: number; size?: number; sourceId?: string; status?: string }) =>
    axios.get('/admin/scraping/logs', { params }),
  getAuthStatus: () => axios.get('/admin/scraping/auth/status'),
  refreshAuth: () => axios.post('/admin/scraping/auth/refresh'),
}

// AI Management API
export const adminAIApi = {
  getConfigurations: (params?: { page?: number; size?: number; category?: string }) =>
    axios.get('/admin/ai/configurations', { params }),
  getConfigurationById: (id: string) => axios.get(`/admin/ai/configurations/${id}`),
  updateConfiguration: (id: string, data: Partial<AIConfiguration>) =>
    axios.put(`/admin/ai/configurations/${id}`, data),
  getScoringWeights: () => axios.get('/admin/ai/scoring-weights'),
  updateScoringWeights: (weights: Record<string, number>) =>
    axios.put('/admin/ai/scoring-weights', weights),
  getUsageLogs: (params?: { page?: number; size?: number; userId?: string; startDate?: string; endDate?: string }) =>
    axios.get('/admin/ai/usage-logs', { params }),
  getUsageStats: (params?: { startDate?: string; endDate?: string }) =>
    axios.get('/admin/ai/usage-stats', { params }),
}

// System Settings API
export const adminSettingsApi = {
  getAll: (params?: { page?: number; size?: number; category?: string }) =>
    axios.get('/admin/settings', { params }),
  getByKey: (key: string) => axios.get(`/admin/settings/${key}`),
  update: (key: string, data: Record<string, any>) =>
    axios.put(`/admin/settings/${key}`, data),
  getGeneral: () => axios.get('/admin/settings/general'),
  getEmail: () => axios.get('/admin/settings/email'),
  getAI: () => axios.get('/admin/settings/ai'),
  getSecurity: () => axios.get('/admin/settings/security'),
}

// Roles & Permissions API
export const adminRolesApi = {
  getAll: (params?: { page?: number; size?: number; search?: string }) =>
    axios.get('/admin/roles', { params }),
  getById: (id: string) => axios.get(`/admin/roles/${id}`),
  create: (data: Partial<AdminRole>) => axios.post('/admin/roles', data),
  update: (id: string, data: Partial<AdminRole>) => axios.put(`/admin/roles/${id}`, data),
  delete: (id: string) => axios.delete(`/admin/roles/${id}`),
  getPermissions: (roleId: string) => axios.get(`/admin/roles/${roleId}/permissions`),
}

// Content Management API
export const adminContentApi = {
  getAll: (params?: { page?: number; size?: number; section?: string; contentType?: string }) =>
    axios.get('/admin/content', { params }),
  getById: (id: string) => axios.get(`/admin/content/${id}`),
  getBySlug: (slug: string) => axios.get(`/admin/content/slug/${slug}`),
  create: (data: Partial<ContentBlock>) => axios.post('/admin/content', data),
  update: (id: string, data: Partial<ContentBlock>) => axios.put(`/admin/content/${id}`, data),
  delete: (id: string) => axios.delete(`/admin/content/${id}`),
  toggleStatus: (id: string) => axios.post(`/admin/content/${id}/toggle`),
}

// Reports API
export const adminReportsApi = {
  getAvailable: () => axios.get('/admin/reports'),
  getReport: (type: string, params?: { startDate?: string; endDate?: string }) =>
    axios.get(`/admin/reports/${type}`, { params }),
  exportExcel: (type: string, params?: { startDate?: string; endDate?: string }) =>
    axios.post(`/admin/reports/${type}/export/excel`, null, { params }),
  exportPdf: (type: string, params?: { startDate?: string; endDate?: string }) =>
    axios.post(`/admin/reports/${type}/export/pdf`, null, { params }),
}
