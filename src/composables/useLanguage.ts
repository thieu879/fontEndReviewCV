import { ref, computed, watch } from 'vue';
import i18n from '@/i18n';

export type Locale = 'en' | 'vi';

// Shared state - singleton
const currentLocale = ref<Locale>((localStorage.getItem('locale') as Locale) || 'vi');

// vue-i18n Composition API: locale is a Ref but TS types may not reflect it correctly
// Use type assertion to handle the typing mismatch
type LocaleRef = { value: Locale };

// Sync initial i18n locale with currentLocale
(i18n.global.locale as unknown as LocaleRef).value = currentLocale.value;

// Watch for external changes (e.g., user changes language somewhere else)
watch(currentLocale, (newLocale) => {
  (i18n.global.locale as unknown as LocaleRef).value = newLocale;
});

export function useLanguage() {
  const language = computed(() => currentLocale.value);
  const isVietnamese = computed(() => currentLocale.value === 'vi');
  const isEnglish = computed(() => currentLocale.value === 'en');

  const setLanguage = (lang: Locale) => {
    currentLocale.value = lang;
    (i18n.global.locale as unknown as LocaleRef).value = lang;
    localStorage.setItem('locale', lang);
  };

  const toggleLanguage = () => {
    const newLang = currentLocale.value === 'vi' ? 'en' : 'vi';
    setLanguage(newLang);
  };

  const languages = [
    { code: 'vi' as const, name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en' as const, name: 'English', flag: '🇬🇧' }
  ];

  return {
    language,
    isVietnamese,
    isEnglish,
    setLanguage,
    toggleLanguage,
    languages
  };
}

export default useLanguage;
