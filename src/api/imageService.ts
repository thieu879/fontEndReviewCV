import api from './axios';

// ============================================
// Types
// ============================================

export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status: number;
}

export interface ImageUploadResponse {
  url: string;
  publicId: string;
  folder: string;
  fileSize: number;
  format: string;
  width?: number;
  height?: number;
}

export type ImageCropMode = 'fill' | 'fit' | 'scale' | 'thumb' | 'crop' | 'limit';
export type ImageQuality = 'auto' | 'auto:best' | 'auto:eco' | 'auto:low' | '50' | '60' | '70' | '80' | '90' | '100';
export type ImageFormat = 'auto' | 'webp' | 'avif' | 'png' | 'jpg' | 'jpeg';

// ============================================
// Image Service
// ============================================
const imageService = {

  // ============================================
  // Upload
  // ============================================

  /**
   * Upload ảnh đơn lẻ lên Cloudinary qua backend.
   * Backend sẽ trả về URL đã upload thành công.
   */
  upload: async (file: File, folder: string = 'general'): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await api.post<APIResponse<ImageUploadResponse>>('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  /**
   * Upload avatar — tự động resize 400x400, circle crop, quality auto.
   */
  uploadAvatar: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<APIResponse<ImageUploadResponse>>('/images/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  /**
   * Upload nhiều ảnh cùng lúc (tối đa 10).
   */
  uploadMultiple: async (files: File[], folder: string = 'general'): Promise<ImageUploadResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('folder', folder);

    const response = await api.post<APIResponse<ImageUploadResponse[]>>('/images/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  // ============================================
  // Transform (server-side URL generation)
  // ============================================

  /**
   * Tạo URL với transformation phía backend.
   * Backend sẽ tạo Cloudinary transformation URL.
   */
  transform: async (
    url: string,
    options: {
      width?: number;
      height?: number;
      crop?: ImageCropMode;
      quality?: ImageQuality;
      format?: ImageFormat;
    } = {}
  ): Promise<string> => {
    const params = new URLSearchParams({ url });
    if (options.width) params.append('width', String(options.width));
    if (options.height) params.append('height', String(options.height));
    if (options.crop) params.append('crop', options.crop);
    if (options.quality) params.append('quality', options.quality);
    if (options.format) params.append('format', options.format);

    const response = await api.get<APIResponse<{ url: string }>>(`/images/transform?${params}`);
    return response.data.data.url;
  },

  /**
   * Tạo thumbnail URL (100x100, crop fill, quality auto).
   */
  getThumbnail: async (url: string, size: number = 100): Promise<string> => {
    const response = await api.get<APIResponse<{ url: string }>>(
      `/images/thumbnail?url=${encodeURIComponent(url)}&size=${size}`
    );
    return response.data.data.url;
  },

  // ============================================
  // Delete
  // ============================================

  /**
   * Xóa ảnh khỏi Cloudinary bằng URL.
   */
  delete: async (url: string): Promise<boolean> => {
    const response = await api.delete('/images', {
      params: { url },
    });
    return response.data.success;
  },

  /**
   * Xóa ảnh khỏi Cloudinary bằng public_id.
   */
  deleteByPublicId: async (publicId: string): Promise<boolean> => {
    const response = await api.delete('/images/by-public-id', {
      params: { publicId },
    });
    return response.data.success;
  },

  // ============================================
  // Info
  // ============================================

  /**
   * Lấy thông tin chi tiết của ảnh (kích thước, format, created_at...).
   */
  getInfo: async (publicId: string): Promise<Record<string, unknown>> => {
    const response = await api.get<APIResponse<Record<string, unknown>>>('/images/info', {
      params: { publicId },
    });
    return response.data.data;
  },

  // ============================================
  // Validation helpers
  // ============================================

  /**
   * Kiểm tra file có phải là ảnh hợp lệ không.
   */
  isValidImage(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      console.warn(`Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}`);
      return false;
    }

    if (file.size > maxSize) {
      console.warn(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max: 10MB`);
      return false;
    }

    return true;
  },

  /**
   * Validate avatar (chỉ JPEG, PNG, WebP, max 5MB).
   */
  isValidAvatar(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return false;
    }

    if (file.size > maxSize) {
      return false;
    }

    return true;
  },

  /**
   * Chuyển File sang Data URL (để preview trước khi upload).
   */
  fileToDataUrl: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};

export default imageService;
