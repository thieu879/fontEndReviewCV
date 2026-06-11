import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';
import i18n from './i18n';

// Initialize dark mode class on <html> BEFORE Vue mounts
// This ensures Tailwind v4 dark: variants work correctly
const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
const initialTheme = savedTheme ?? (prefersDark ? 'dark' : 'light');
if (initialTheme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

const app = createApp(App);

app.use(router);
app.use(i18n);
app.mount('#app');
