// Cookie storage với security flags
const cookieStorage = {
  getItem(key: string): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieKey, value] = cookie.trim().split('=');
      if (cookieKey === key) {
        return decodeURIComponent(value);
      }
    }
    return null;
  },

  setItem(key: string, value: string, days?: number): void {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = `; expires=${date.toUTCString()}`;
    }
    // HttpOnly=false vì cần JS access, nhưng dùng SameSite=Strict để bảo mật
    document.cookie = `${key}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Strict`;
  },

  removeItem(key: string): void {
    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict`;
  },

  hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }
};

export default cookieStorage;
