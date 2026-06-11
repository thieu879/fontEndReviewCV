export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-yellow-100';
  return 'bg-red-100';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Role utilities

// Map role IDs (UUID) to role names
export const ROLE_ID_TO_NAME: Record<string, string> = {};

// Map role name (ADMIN, RECRUITER, USER) to role key (admin, recruiter, user)
export const ROLE_NAME_TO_KEY: Record<string, string> = {
  'ADMIN': 'admin',
  'RECRUITER': 'recruiter',
  'USER': 'user',
};

export const ROLE_NAME_TO_VIETNAMESE: Record<string, string> = {
  admin: 'Quản trị viên',
  recruiter: 'Nhà tuyển dụng',
  user: 'Người dùng',
};

export const getRoleKey = (roleName: string | undefined): string => {
  if (!roleName) return 'user';
  return ROLE_NAME_TO_KEY[roleName.toUpperCase()] || roleName.toLowerCase();
};

export const getRoleName = (roleIdOrName: string | undefined): string => {
  if (!roleIdOrName) return 'user';

  // Nếu đã là role key (admin, recruiter, user)
  if (ROLE_NAME_TO_VIETNAMESE[roleIdOrName.toLowerCase()]) {
    return roleIdOrName.toLowerCase();
  }

  // Nếu là role name (ADMIN, RECRUITER, USER)
  return getRoleKey(roleIdOrName);
};

export const getRoleDisplayName = (roleIdOrName: string | undefined): string => {
  const roleName = getRoleName(roleIdOrName);
  return ROLE_NAME_TO_VIETNAMESE[roleName] || 'Người dùng';
};
