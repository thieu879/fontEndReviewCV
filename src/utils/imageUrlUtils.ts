// ============================================
// Cloudinary URL Utils
//
// Client-side utilities để tạo Cloudinary transformation URLs
// mà không cần gọi backend API.
//
// Ví dụ:
//   import { CloudinaryUrl } from '@/utils/imageUrlUtils';
//   const thumb = CloudinaryUrl.thumbnail(avatarUrl, 200);
//   const optimized = CloudinaryUrl.resize(photoUrl, 800, 600, 'fill');
// ============================================

export interface TransformOptions {
  width?: number;
  height?: number;
  crop?: ImageCropMode;
  quality?: ImageQuality;
  format?: ImageFormat;
  gravity?: ImageGravity;
  radius?: string | number;
  blur?: number;
  effect?: string;
}

export type ImageCropMode = 'fill' | 'fit' | 'scale' | 'thumb' | 'crop' | 'limit' | 'pad' | 'imagga_scale';
export type ImageQuality = 'auto' | 'auto:best' | 'auto:eco' | 'auto:low' | '50' | '60' | '70' | '80' | '90' | '100' | number;
export type ImageFormat = 'auto' | 'webp' | 'avif' | 'png' | 'jpg' | 'jpeg' | 'gif' | 'bmp';
export type ImageGravity = 'auto' | 'face' | 'face:center' | 'center' | 'north' | 'south' | 'east' | 'west' | 'north_east' | 'north_west' | 'south_east' | 'south_west';

const CLOUD_NAME = 'dcunbzpkh';

function isCloudinaryUrl(url: string): boolean {
  return url != null && url.includes('cloudinary.com');
}

function buildParams(options: TransformOptions): string {
  const parts: string[] = [];

  if (options.width) parts.push(`w_${options.width}`);
  if (options.height) parts.push(`h_${options.height}`);
  if (options.crop) parts.push(`c_${options.crop}`);
  if (options.gravity) parts.push(`g_${options.gravity}`);
  if (options.quality) parts.push(`q_${options.quality}`);
  if (options.format) parts.push(`f_${options.format}`);
  if (options.radius) parts.push(`r_${options.radius}`);
  if (options.blur) parts.push(`e_blur:${options.blur}`);
  if (options.effect) parts.push(`e_${options.effect}`);

  return parts.join(',');
}

/**
 * Trích xuất public_id từ Cloudinary URL.
 * Ví dụ:
 *   https://res.cloudinary.com/dcunbzpkh/image/upload/v1234/avatars/abc123.jpg
 *   -> "avatars/abc123"
 */
export function extractPublicId(url: string): string | null {
  if (!isCloudinaryUrl(url)) return null;

  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\?|$|\.)/);
    if (match && match[1]) {
      let publicId = match[1];
      // Bỏ version prefix nếu regex chưa bắt
      publicId = publicId.replace(/^v\d+\//, '');
      return publicId;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Tạo Cloudinary transformation URL từ URL gốc (client-side).
 * Hoạt động với mọi URL Cloudinary.
 *
 * @param url   Cloudinary URL gốc
 * @param opts  Các tùy chọn transform
 * @returns     URL mới với transformation đã áp dụng
 *
 * @example
 *   CloudinaryUrl.transform(avatarUrl, { width: 200, height: 200, crop: 'fill', gravity: 'face' })
 *   // -> https://res.cloudinary.com/dcunbzpkh/image/upload/w_200,h_200,c_fill,g_face,f_auto,q_auto/avatars/abc123
 */
export function transform(url: string, opts: TransformOptions): string {
  if (!isCloudinaryUrl(url)) return url;

  const publicId = extractPublicId(url);
  if (!publicId) return url;

  const params = buildParams(opts);
  if (!params) return url;

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${params}/${publicId}`;
}

/**
 * Tạo thumbnail (crop fill, gravity face, quality auto).
 * @param url   Cloudinary URL gốc
 * @param size  Kích thước (width = height = size)
 */
export function thumbnail(url: string, size: number = 100): string {
  return transform(url, {
    width: size,
    height: size,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    format: 'auto',
  });
}

/**
 * Resize ảnh (fit vào kích thước, không crop).
 * @param url     Cloudinary URL gốc
 * @param width   Chiều rộng
 * @param height  Chiều cao
 */
export function fit(url: string, width: number, height: number): string {
  return transform(url, {
    width,
    height,
    crop: 'fit',
    quality: 'auto',
    format: 'auto',
  });
}

/**
 * Resize ảnh với crop fill (crop từ giữa).
 * @param url     Cloudinary URL gốc
 * @param width   Chiều rộng
 * @param height  Chiều cao
 */
export function fill(url: string, width: number, height: number): string {
  return transform(url, {
    width,
    height,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto',
  });
}

/**
 * Scale ảnh (giữ tỷ lệ, resize không crop).
 * @param url     Cloudinary URL gốc
 * @param width   Chiều rộng tối đa
 */
export function scale(url: string, width: number): string {
  return transform(url, {
    width,
    crop: 'scale',
    quality: 'auto',
    format: 'auto',
  });
}

/**
 * Tạo URL với format cụ thể (chuyển sang webp/avif/png...).
 * @param url    Cloudinary URL gốc
 * @param format Format mong muốn: 'webp', 'avif', 'png', 'jpg'
 */
export function format(url: string, format: ImageFormat): string {
  return transform(url, { format, quality: 'auto' });
}

/**
 * Tạo blur placeholder URL (dùng cho lazy loading).
 * @param url   Cloudinary URL gốc
 * @param blur  Mức độ blur (1-2000), default 200
 */
export function blur(url: string, blur: number = 200): string {
  return transform(url, {
    width: 30,
    quality: 30,
    format: 'auto',
    blur,
  });
}

/**
 * Tạo avatar URL hoàn chỉnh (400x400, circle, face gravity).
 * @param url  Cloudinary URL gốc
 */
export function avatar(url: string): string {
  return transform(url, {
    width: 400,
    height: 400,
    crop: 'fill',
    gravity: 'face',
    radius: 'max',
    quality: 'auto',
    format: 'auto',
  });
}

/**
 * Kiểm tra URL có phải từ Cloudinary không.
 */
export function isCloudinary(imageUrl: string): boolean {
  return isCloudinaryUrl(imageUrl);
}

/**
 * CloudinaryUrl object — gộp tất cả methods.
 * @example
 *   import { CloudinaryUrl } from '@/utils/imageUrlUtils';
 *   const thumb = CloudinaryUrl.thumbnail(user.avatar, 100);
 *   const optimized = CloudinaryUrl.transform(photoUrl, { width: 800, format: 'webp' });
 */
export const CloudinaryUrl = {
  transform,
  thumbnail,
  fit,
  fill,
  scale,
  format,
  blur,
  avatar,
  isCloudinary,
  extractPublicId,
};
