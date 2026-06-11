import api from './axios';

export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status: number;
}

export interface TrendItem {
  day: string;
  count: number;
  height: number;
  active: boolean;
}

export interface RecentCandidate {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: string;
  score: number;
  status: string;
  statusClass: string;
  barColor: string;
  avatarBg: string;
  createdAt: string;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  totalCvs: number;
  analyzedCvs: number;
}

export interface DashboardResponse {
  totalUploaded: number;
  analyzed: number;
  processing: number;
  failed: number;
  averageAiScore: number;
  highMatchCandidates: number;
  uploadTrend: TrendItem[];
  recentCandidates: RecentCandidate[];
  skillsDistribution: Record<string, number>;
  rolesDistribution: Record<string, number>;
  user: UserSummary;
}

export interface AdminTrendItem {
  label: string;
  value: number;
  height: number;
}

export interface AdminActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  bgColor: string;
  iconColor: string;
}

export interface AdminActiveUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  activity: string;
}

export interface AdminLogItem {
  id: string;
  time: string;
  action: string;
  user: string;
  details: string;
  level: string;
  levelClass: string;
}

export interface AdminDashboardResponse {
  totalUsers: number;
  totalCVs: number;
  totalAnalyses: number;
  activeToday: number;
  userGrowthPercentage: number;
  cvGrowthPercentage: number;
  analysisGrowthPercentage: number;
  weeklyAnalysisTrend: AdminTrendItem[];
  skillsDistribution: Record<string, number>;
  rolesDistribution: Record<string, number>;
  recentActivities: AdminActivityItem[];
  activeUsers: AdminActiveUser[];
  recentLogs: AdminLogItem[];
}

export const dashboardService = {
  async getDashboard(): Promise<DashboardResponse> {
    const response = await api.get<APIResponse<DashboardResponse>>('/dashboard');
    return response.data.data;
  },

  async getAdminDashboard(): Promise<AdminDashboardResponse> {
    const response = await api.get<APIResponse<AdminDashboardResponse>>('/admin/dashboard');
    return response.data.data;
  },
};

export default dashboardService;
