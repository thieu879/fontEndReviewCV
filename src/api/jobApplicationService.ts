import api from './axios';
import type { APIResponse, PageResponse } from './cvService';
import type { JobResponse } from './jobMatchingService';

// ====================== Types ======================

export type ApplicationStatus =
  | 'APPLIED'
  | 'REVIEWING'
  | 'INTERVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface JobApplicationResponse {
  id: string;
  userId: string;
  jobId: string;

  // Job snapshot
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  location?: string;
  salary?: string;
  sourceUrl?: string;
  job?: JobResponse;

  // Applicant info
  fullName: string;
  email: string;
  phone?: string;

  // Documents
  cvFileName?: string;
  cvFileUrl?: string;
  cvFileSize?: number;
  coverLetter?: string;

  // Lifecycle
  status: ApplicationStatus;
  statusLabel: string;
  statusColor: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  withdrawnAt?: string;
  employerNote?: string;
}

export interface JobApplicationRequest {
  jobId: string;
  fullName: string;
  email: string;
  phone?: string;
  coverLetter?: string;
}

export interface ApplicationStatsResponse {
  total: number;
  applied: number;
  reviewing: number;
  interview: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
  grouped: Record<string, number>;
}

// ====================== Helpers ======================

const unwrap = <T>(promise: Promise<{ data: APIResponse<T> }>): Promise<T> =>
  promise.then((res) => res.data.data);

const toFormData = (application: JobApplicationRequest, cvFile?: File | null): FormData => {
  const fd = new FormData();
  fd.append('application', new Blob([JSON.stringify(application)], { type: 'application/json' }));
  if (cvFile) fd.append('cv', cvFile);
  return fd;
};

// ====================== Service ======================

export const jobApplicationService = {
  apply(jobId: string, request: JobApplicationRequest, cvFile?: File | null) {
    return unwrap(
      api.post<APIResponse<JobApplicationResponse>>(
        `/applications/apply/${jobId}`,
        toFormData(request, cvFile),
        { headers: { 'Content-Type': 'multipart/form-data' } },
      ),
    );
  },

  reapply(jobId: string, request: JobApplicationRequest, cvFile?: File | null) {
    return unwrap(
      api.post<APIResponse<JobApplicationResponse>>(
        `/applications/reapply/${jobId}`,
        toFormData(request, cvFile),
        { headers: { 'Content-Type': 'multipart/form-data' } },
      ),
    );
  },

  list(status?: ApplicationStatus | null, page = 0, size = 20) {
    return unwrap(
      api.get<APIResponse<PageResponse<JobApplicationResponse>>>('/applications', {
        params: { status, page, size },
      }),
    );
  },

  getById(id: string) {
    return unwrap(api.get<APIResponse<JobApplicationResponse>>(`/applications/${id}`));
  },

  hasApplied(jobId: string) {
    return unwrap(api.get<APIResponse<boolean>>(`/applications/check/${jobId}`));
  },

  withdraw(id: string) {
    return unwrap(api.post<APIResponse<JobApplicationResponse>>(`/applications/${id}/withdraw`));
  },

  stats() {
    return unwrap(api.get<APIResponse<ApplicationStatsResponse>>('/applications/stats'));
  },
};

// ====================== UI Helpers ======================

export const STATUS_META: Record<
  ApplicationStatus,
  { label: string; color: 'blue' | 'indigo' | 'purple' | 'green' | 'red' | 'gray'; icon: string }
> = {
  APPLIED: { label: 'Applied', color: 'blue', icon: 'send' },
  REVIEWING: { label: 'Reviewing', color: 'indigo', icon: 'eye' },
  INTERVIEW: { label: 'Interview', color: 'purple', icon: 'message-circle' },
  ACCEPTED: { label: 'Accepted', color: 'green', icon: 'check-circle' },
  REJECTED: { label: 'Rejected', color: 'red', icon: 'x-circle' },
  WITHDRAWN: { label: 'Withdrawn', color: 'gray', icon: 'rotate-ccw' },
};

export const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
};

export const timeAgo = (iso?: string): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
};
