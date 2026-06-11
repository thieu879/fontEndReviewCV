<template>
  <div class="min-h-screen bg-white dark:bg-slate-900 font-sans transition-colors duration-200">
    <!-- Navigation -->
    <nav
      class="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-100 dark:border-slate-800 transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <router-link to="/home" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-500/20">
            <FileText class="w-4 h-4 text-white" />
          </div>
          <span class="font-bold text-slate-900 dark:text-white text-sm transition-colors">CV Analyzer AI</span>
        </router-link>
        <div class="hidden md:flex items-center gap-8">
          <a href="#features"
            class="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">
            {{ t("home.features") }}
          </a>
          <a href="#how-it-works"
            class="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">
            {{ t("home.howItWorks") }}
          </a>
          <a href="#intelligence"
            class="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">
            {{ t("home.intelligence") }}
          </a>
          <a href="#pricing"
            class="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">
            {{ t("home.pricing") || "Pricing" }}
          </a>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-4">
          <!-- Theme toggle -->
          <button @click="toggleTheme"
            class="w-9 h-9 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle theme">
            <Sun v-if="theme === 'dark'" class="w-5 h-5 text-amber-400" />
            <Moon v-else class="w-5 h-5 text-slate-600" />
          </button>

          <!-- User is logged in -->
          <template v-if="isAuthenticated">
            <router-link to="/profile" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div class="text-right">
                <div class="text-sm font-semibold text-slate-900 dark:text-white transition-colors">{{ userName }}</div>
                <div class="text-xs text-slate-500 dark:text-slate-400 transition-colors">{{ userRoleText }}</div>
              </div>
              <BaseAvatar :name="userName" :src="userAvatar" size="md" status="online" />
            </router-link>
            <button @click="handleLogout"
              class="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg font-medium transition-colors">
              {{ t("nav.logout") || "Logout" }}
            </button>
          </template>

          <!-- User is not logged in -->
          <template v-else>
            <router-link to="/login"
              class="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">
              {{ t("auth.login") }}
            </router-link>
            <router-link to="/register"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-blue-500/10 dark:shadow-none">
              {{ t("home.getStarted") || "Get Started" }}
            </router-link>
          </template>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-32 pb-20 px-6 bg-white dark:bg-slate-900 transition-colors duration-200">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div
              class="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 dark:bg-blue-950/40 dark:border-blue-900 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold mb-6 uppercase tracking-wide transition-colors">
              <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              {{ t("home.nextGenIntelligence") || "Next-Gen Intelligence" }}
            </div>
            <h1
              class="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-5 transition-colors">
              {{ t("home.heroTitle") || "Revolutionize Recruitment with" }}
              <span class="text-blue-600 dark:text-blue-400">{{ t("home.aiPowered") || "AI-Powered" }}</span>
              {{ t("home.cvIntelligence") || "CV Intelligence" }}
            </h1>
            <p class="text-base text-slate-500 dark:text-slate-400 mb-8 leading-relaxed max-w-md transition-colors">
              {{ t("home.heroDesc") || "Extract structured data, analyze candidate fit, and make faster hiring decisions with our enterprise - grade AI engine." }}
            </p>
            <div class="flex items-center gap-4">
              <router-link to="/register"
                class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm shadow-blue-500/10">
                {{ t("home.getStarted") || "Get Started" }}
                <ArrowRight class="w-4 h-4" />
              </router-link>
              <button
                class="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 rounded-lg font-semibold text-sm transition-colors bg-white dark:bg-slate-800">
                <div
                  class="w-7 h-7 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center transition-colors">
                  <Play class="w-3 h-3 text-slate-500 dark:text-slate-400 ml-0.5" />
                </div>
                {{ t("home.watchDemo") || "Watch Demo" }}
              </button>
            </div>
          </div>

          <!-- Hero Visual -->
          <div class="relative">
            <div
              class="bg-slate-900 dark:bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 dark:border-slate-800 transition-colors duration-200">
              <!-- Mock Dashboard Header -->
              <div class="bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-800">
                <div class="w-3 h-3 rounded-full bg-red-400"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div class="w-3 h-3 rounded-full bg-green-400"></div>
                <div class="ml-4 flex-1 bg-slate-700/60 rounded text-xs text-slate-400 px-3 py-1">
                  cv-analyzer.ai/dashboard
                </div>
              </div>
              <div class="p-6 bg-slate-900">
                <!-- Sidebar + Content mock -->
                <div class="flex gap-4">
                  <div class="w-28 space-y-2">
                    <div class="h-6 bg-blue-600 rounded text-xs text-white flex items-center px-2 font-medium">
                      Dashboard
                    </div>
                    <div class="h-6 bg-slate-800 rounded"></div>
                    <div class="h-6 bg-slate-800 rounded"></div>
                    <div class="h-6 bg-slate-800 rounded"></div>
                  </div>
                  <div class="flex-1 space-y-3">
                    <div class="grid grid-cols-3 gap-2">
                      <div class="bg-slate-800 rounded-lg p-3">
                        <div class="text-[10px] text-slate-400">CVs Analyzed</div>
                        <div class="text-base font-bold text-white">1,284</div>
                      </div>
                      <div class="bg-slate-800 rounded-lg p-3">
                        <div class="text-[10px] text-slate-400">Match Rate</div>
                        <div class="text-base font-bold text-green-400">94%</div>
                      </div>
                      <div class="bg-slate-800 rounded-lg p-3">
                        <div class="text-[10px] text-slate-400">Time Saved</div>
                        <div class="text-base font-bold text-blue-400">87%</div>
                      </div>
                    </div>
                    <!-- Chart mock -->
                    <div class="bg-slate-800 rounded-lg p-3">
                      <div class="text-[10px] text-slate-400 mb-2">Pipeline Overview</div>
                      <div class="flex items-end gap-1 h-16">
                        <div class="flex-1 bg-blue-600 rounded-sm" style="height: 40%"></div>
                        <div class="flex-1 bg-blue-500 rounded-sm" style="height: 65%"></div>
                        <div class="flex-1 bg-blue-600 rounded-sm" style="height: 50%"></div>
                        <div class="flex-1 bg-blue-400 rounded-sm" style="height: 80%"></div>
                        <div class="flex-1 bg-blue-600 rounded-sm" style="height: 60%"></div>
                        <div class="flex-1 bg-blue-500 rounded-sm" style="height: 90%"></div>
                        <div class="flex-1 bg-blue-400 rounded-sm" style="height: 70%"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Floating card -->
            <div
              class="absolute -bottom-4 -right-4 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-3 flex items-center gap-3 transition-colors duration-200">
              <div
                class="w-8 h-8 bg-green-100 dark:bg-emerald-950/60 rounded-lg flex items-center justify-center transition-colors">
                <CheckCircle class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div class="text-xs font-bold text-slate-900 dark:text-white transition-colors">Candidate Match</div>
                <div class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold transition-colors">96.4% Match
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trusted By -->
    <section
      class="py-10 border-y border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 transition-colors duration-200">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <p
          class="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold mb-6 transition-colors">
          {{ t("home.trustedBy") || "Trusted by forward-thinking HR teams" }}
        </p>
        <div class="flex items-center justify-center gap-10 flex-wrap">
          <span v-for="brand in ['GlobalTech', 'Finpro', 'Datasource', 'Compose', 'Lumira']" :key="brand"
            class="text-slate-300 dark:text-slate-600 font-bold text-sm tracking-wide uppercase transition-colors select-none">
            {{ brand }}
          </span>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-24 px-6 bg-white dark:bg-slate-900 transition-colors duration-200">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-3 transition-colors">
            {{ t("home.enterpriseGrade") || "Enterprise-Grade Extraction" }}
          </h2>
          <p class="text-slate-500 dark:text-slate-400 max-w-md mx-auto transition-colors">
            {{ t("home.enterpriseGradeDesc") || "Streamline your high-volume recruitment cycles with specialized AI models trained for maximum accuracy" }}
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="feature in features" :key="feature.title"
            class="border border-slate-200 dark:border-slate-700/80 rounded-2xl p-7 hover:shadow-md dark:hover:border-slate-600 transition-all bg-white dark:bg-slate-800 shadow-sm">
            <div
              :class="`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${feature.iconBg} dark:bg-slate-700/60 transition-colors`">
              <component :is="feature.icon" :class="`w-5 h-5 ${feature.iconColor} dark:text-slate-200`" />
            </div>
            <h3 class="font-bold text-slate-900 dark:text-white mb-2 transition-colors">{{ feature.title }}</h3>
            <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed transition-colors">{{ feature.desc }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="py-24 px-6 bg-slate-50 dark:bg-slate-800/40 transition-colors duration-200">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-3 transition-colors">
          {{ t("home.efficientProcess") || "Efficient 3-Step Process" }}
        </h2>
        <p class="text-slate-500 dark:text-slate-400 mb-16 transition-colors">
          {{ t("home.simplePowerful") || "Simple, powerful, repeatable." }}
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <!-- connector line -->
          <div
            class="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-slate-200 dark:bg-slate-700 z-0 transition-colors">
          </div>
          <div v-for="(step, i) in steps" :key="step.title" class="relative z-10">
            <div :class="`w-16 h-16 rounded-full border-2 flex items-center justify-center mx-auto mb-5 text-sm font-bold transition-all duration-200
              ${i === 2
                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
              }`">
              0{{ i + 1 }}
            </div>
            <h3 class="font-bold text-slate-900 dark:text-white mb-2 transition-colors">{{ step.title }}</h3>
            <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed transition-colors">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="py-24 px-6 bg-white dark:bg-slate-900 transition-colors duration-200">
      <div class="max-w-5xl mx-auto text-center">
        <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-3 transition-colors">
          {{ t("home.pricingTitle") || "Transparent Pricing for Teams of All Sizes" }}
        </h2>
        <p class="text-slate-500 dark:text-slate-400 mb-14 transition-colors">
          {{ t("home.pricingDesc") || "Choose the perfect plan to streamline your recruitment intelligence." }}
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          <div v-for="plan in plans" :key="plan.name" :class="`rounded-2xl border p-8 text-left flex flex-col transition-all duration-200 bg-white dark:bg-slate-800
            ${plan.featured
              ? 'border-blue-600 dark:border-blue-500 shadow-xl shadow-blue-100/60 dark:shadow-none relative md:scale-[1.02]'
              : 'border-slate-200 dark:border-slate-700/80 shadow-sm'
            }`">
            <div v-if="plan.featured" class="absolute -top-3 left-1/2 -translate-x-1/2">
              <span
                class="bg-blue-600 dark:bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
                {{ t("home.mostPopular") || "Most Popular" }}
              </span>
            </div>
            <div class="mb-6">
              <h3 class="font-bold text-slate-900 dark:text-white mb-1 transition-colors">{{ plan.name }}</h3>
              <p class="text-slate-400 dark:text-slate-500 text-xs transition-colors">{{ plan.desc }}</p>
            </div>
            <div class="mb-6">
              <span v-if="plan.price !== 'Custom'"
                class="text-4xl font-bold text-slate-900 dark:text-white transition-colors">
                ${{ plan.price }}
              </span>
              <span v-else class="text-4xl font-bold text-slate-900 dark:text-white transition-colors">Custom</span>
              <span v-if="plan.price !== 'Custom'"
                class="text-slate-400 dark:text-slate-500 text-sm transition-colors">/mo</span>
            </div>
            <ul class="space-y-3 mb-8 flex-1">
              <li v-for="f in plan.features" :key="f"
                class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 transition-colors">
                <CheckCircle class="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                {{ f }}
              </li>
            </ul>
            <router-link v-if="!isAuthenticated" to="/register" :class="`w-full py-3 rounded-xl font-semibold text-sm transition-colors text-center block
              ${plan.featured
                ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-sm'
                : 'border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800'
              }`">
              {{ plan.cta }}
            </router-link>
            <router-link v-else to="/dashboard" :class="`w-full py-3 rounded-xl font-semibold text-sm transition-colors text-center block
              ${plan.featured
                ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-sm'
                : 'border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800'
              }`">
              {{ t("home.goToDashboard") || "Go to Dashboard" }}
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section
      class="mx-6 mb-16 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-indigo-900 overflow-hidden shadow-xl shadow-blue-500/5">
      <div class="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">
          {{ t("home.readyToTransform") || "Ready to transform your hiring?" }}
        </h2>
        <p class="text-blue-100 dark:text-slate-200 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
          {{ t("home.joinTeams") || "Join hundreds of innovative recruitment teams using CV Analyzer AI to cut processing time by 85%." }}
        </p>
        <router-link v-if="!isAuthenticated" to="/register"
          class="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-bold text-sm transition-colors mb-4 shadow-md">
          {{ t("home.getStartedNow") || "Get Started Now" }}
        </router-link>
        <router-link v-else to="/dashboard"
          class="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-bold text-sm transition-colors mb-4 shadow-md">
          {{ t("home.goToDashboard") || "Go to Dashboard" }}
        </router-link>
        <p class="text-blue-200 dark:text-slate-400 text-xs">
          {{ t("home.freeTrial") || "Free 14-day trial • No credit card required • GDPR Compliant" }}
        </p>
      </div>
    </section>

    <!-- Footer -->
    <footer
      class="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 pt-12 pb-8 transition-colors duration-200">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <router-link to="/home" class="flex items-center gap-2 mb-3">
              <div class="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <FileText class="w-4 h-4 text-white" />
              </div>
              <span class="font-bold text-slate-900 dark:text-white text-sm transition-colors">CV Analyzer AI</span>
            </router-link>
            <p class="text-slate-400 dark:text-slate-500 text-xs leading-relaxed max-w-xs transition-colors">
              {{ t("home.footerDesc") || "Enterprise-grade recruitment intelligence designed to help high-growth companies identify and hire top talent with unmatched precision." }}
            </p>
          </div>
          <div>
            <h4
              class="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-4 uppercase tracking-wide transition-colors">
              {{ t("home.product") || "Product" }}
            </h4>
            <ul class="space-y-2">
              <li v-for="link in [
                t('home.features') || 'Features',
                t('nav.pricing') || 'Pricing',
                t('home.documentation') || 'Documentation',
              ]" :key="link">
                <a href="#"
                  class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 text-sm transition-colors">
                  {{ link }}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4
              class="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-4 uppercase tracking-wide transition-colors">
              {{ t("home.company") || "Company" }}
            </h4>
            <ul class="space-y-2">
              <li v-for="link in [
                t('home.contactSales') || 'Contact Sales',
                t('nav.security') || 'Security',
                t('home.status') || 'Status',
              ]" :key="link">
                <a href="#"
                  class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 text-sm transition-colors">
                  {{ link }}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div
          class="border-t border-slate-100 dark:border-slate-800 pt-6 flex items-center justify-between transition-colors duration-200">
          <p class="text-slate-400 dark:text-slate-500 text-xs transition-colors">
            {{ t("home.copyright") || "© 2026 CV Analyzer AI. Precision Recruitment Intelligence. All rights reserved."
            }}
          </p>
          <div class="flex gap-4">
            <a href="#"
              class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 text-xs transition-colors">
              {{ t("home.privacyPolicy") || "Privacy Policy" }}
            </a>
            <a href="#"
              class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 text-xs transition-colors">
              {{ t("home.termsOfService") || "Terms of Service" }}
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  FileText,
  ArrowRight,
  Play,
  CheckCircle,
  Brain,
  BarChart2,
  Sun,
  Moon,
} from "lucide-vue-next";
import { useAuth } from "@/composables/useAuth";
import { useTheme } from "@/composables/useTheme";
import BaseAvatar from "@/components/base/BaseAvatar.vue";

const { t } = useI18n();
const { user, isAuthenticated, checkAuth, logout } = useAuth();
const { theme, toggleTheme } = useTheme();

// Computed properties for user info
const userName = computed(() => {
  return user.value?.name || user.value?.username || user.value?.email || "Guest";
});

const userRoleText = computed(() => {
  const role = user.value?.role || "";
  const roleMap: Record<string, string> = {
    admin: t("nav.admin") || "Administrator",
    recruiter: t("home.recruiter") || "Recruiter",
    user: t("home.user") || "User",
  };
  return roleMap[role] || "User";
});

const userAvatar = computed(() => {
  return user.value?.avatar || null;
});

const handleLogout = async () => {
  await logout();
};

onMounted(async () => {
  await checkAuth();
});

const features = [
  {
    title: t("home.instantExtraction") || "Instant Extraction",
    desc:
      t("home.instantExtractionDesc") ||
      "Automatically pull name, skills, experience, and contact info from any CV format including PDF, Word, and text files.",
    icon: FileText,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: t("home.smartMatchScoring") || "Smart Match Scoring",
    desc:
      t("home.smartMatchScoringDesc") ||
      "Compare candidates against job requirements instantly with neural-link logic that understands context beyond keywords.",
    icon: Brain,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    title: t("home.operationalInsights") || "Operational Insights",
    desc:
      t("home.operationalInsightsDesc") ||
      "Track recruitment trends and pipeline health with admin dashboards designed for data-driven talent acquisition leads.",
    icon: BarChart2,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
  },
];

const steps = [
  {
    title: t("home.upload") || "Upload",
    desc:
      t("home.uploadDesc") ||
      "Bulk upload CVs directly or via your existing ATS integration.",
  },
  {
    title: t("home.analyze") || "Analyze",
    desc:
      t("home.analyzeDesc") ||
      "Our AI engine processes files to extract data and score suitability.",
  },
  {
    title: t("home.review") || "Review",
    desc:
      t("home.reviewDesc") ||
      "Receive structured reports and prioritize the best talent instantly.",
  },
];

const plans = [
  {
    name: "Starter",
    desc: "Ideal for startups and small teams.",
    price: "49",
    features: ["100 CVs/mo", "Basic AI Extraction", "Email Support"],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Professional",
    desc: "For growing HR teams and agencies.",
    price: "149",
    features: ["500 CVs/mo", "Advanced AI Analysis", "Priority Support", "API Access"],
    cta: "Get Started",
    featured: true,
  },
  {
    name: "Enterprise",
    desc: "For large-scale recruitment needs.",
    price: "Custom",
    features: [
      "Unlimited CVs",
      "Dedicated AI Models",
      "24/7 Support",
      "Custom Integrations",
    ],
    cta: "Contact Sales",
    featured: false,
  },
];
</script>