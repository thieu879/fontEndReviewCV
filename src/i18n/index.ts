import { createI18n } from 'vue-i18n';
import en from '../locales/en.json';
import vi from '../locales/vi.json';

export type MessageSchema = typeof en;

const savedLocale = localStorage.getItem('locale') || 'vi';

const i18n = createI18n<[MessageSchema], 'en' | 'vi'>({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'vi',
  messages: {
    en,
    vi
  }
});

export default i18n;
