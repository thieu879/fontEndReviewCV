<template>
  <div>
    <!-- Template Selection -->
    <div class="mb-6">
      <h3 class="text-sm font-bold text-gray-700 mb-3">{{ t('upload.chooseTemplate') }}</h3>
      <div class="grid grid-cols-4 gap-3">
        <button
          v-for="tmpl in templateMeta"
          :key="tmpl.id"
          @click="selectTemplate(tmpl.id)"
          :class="[
            'relative rounded-xl border-2 p-3 text-left transition-all hover:shadow-md',
            selectedTemplateId === tmpl.id
              ? 'border-blue-500 bg-blue-50 shadow-sm'
              : 'border-gray-200 bg-white hover:border-gray-300'
          ]"
        >
          <!-- Mini preview -->
          <div :class="['mini-preview mb-3 rounded-lg overflow-hidden', getPreviewBg(tmpl.id)]">
            <div class="mini-header" :style="{ background: getHeaderColor(tmpl.id) }">
              <div class="mini-avatar"></div>
              <div class="mini-name-line"></div>
            </div>
            <div class="mini-body">
              <div class="mini-sidebar" v-if="tmpl.id === 'professional' || tmpl.id === 'classic'"></div>
              <div class="mini-content">
                <div class="mini-line short"></div>
                <div class="mini-line"></div>
                <div class="mini-line medium"></div>
                <div class="mini-line"></div>
              </div>
            </div>
          </div>

          <div class="text-center">
            <p :class="['text-sm font-bold', selectedTemplateId === tmpl.id ? 'text-blue-600' : 'text-gray-700']">
              {{ tmpl.name }}
            </p>
            <p class="text-xs text-gray-400 mt-0.5 leading-tight">{{ tmpl.description }}</p>
          </div>

          <div v-if="selectedTemplateId === tmpl.id"
            class="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <Check class="w-3 h-3 text-white" />
          </div>
        </button>
      </div>
    </div>

    <!-- Color Selection -->
    <div class="mb-6">
      <h3 class="text-sm font-bold text-gray-700 mb-3">{{ t('upload.chooseColor') }}</h3>
      <div class="flex gap-2">
        <button
          v-for="col in colorOptions"
          :key="col.id"
          @click="selectColor(col.id)"
          :title="col.name"
          :class="[
            'w-9 h-9 rounded-full transition-all flex items-center justify-center',
            selectedColorId === col.id
              ? 'ring-2 ring-offset-2 scale-110'
              : 'hover:scale-105'
          ]"
          :style="{ background: col.primary, '--tw-ring-color': col.primary }"
        >
          <Check v-if="selectedColorId === col.id" class="w-4 h-4 text-white" />
        </button>
      </div>
    </div>

    <!-- Live Preview -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-bold text-gray-700">{{ t('upload.preview') }}</h3>
        <span class="text-xs text-gray-400">
          {{ templateMeta.find(t => t.id === selectedTemplateId)?.name }}
          · {{ colorOptions.find(c => c.id === selectedColorId)?.name }}
        </span>
      </div>
      <div class="bg-gray-100 rounded-xl p-4 overflow-auto max-h-[440px] flex justify-center">
        <div class="scale-[0.52] origin-top-left w-[192%]">
          <CvTemplateProfessional v-if="selectedTemplateId === 'professional'" :data="templateData" :color="currentColor" />
          <CvTemplateModern v-else-if="selectedTemplateId === 'modern'" :data="templateData" :color="currentColor" />
          <CvTemplateMinimal v-else-if="selectedTemplateId === 'minimal'" :data="templateData" :color="currentColor" />
          <CvTemplateClassic v-else-if="selectedTemplateId === 'classic'" :data="templateData" :color="currentColor" />
        </div>
      </div>
    </div>

    <!-- Action -->
    <div class="flex gap-3 justify-end pt-2 border-t border-gray-200">
      <button @click="$emit('cancel')"
        class="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
        {{ t('common.cancel') }}
      </button>
      <button @click="handleDownload"
        :disabled="isGenerating"
        class="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50">
        <Loader2 v-if="isGenerating" class="w-4 h-4 animate-spin" />
        <Download v-else class="w-4 h-4" />
        {{ isGenerating ? t('upload.generatingPdf') : t('upload.downloadPdf') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Check, Download, Loader2 } from 'lucide-vue-next';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useCvTemplate } from '@/composables/useCvTemplate';
import type { CvTemplateData } from '@/composables/useCvTemplate';
import CvTemplateProfessional from './CvTemplateProfessional.vue';
import CvTemplateModern from './CvTemplateModern.vue';
import CvTemplateMinimal from './CvTemplateMinimal.vue';
import CvTemplateClassic from './CvTemplateClassic.vue';

const props = defineProps<{
  templateData: CvTemplateData;
}>();
const { t } = useI18n();

const emit = defineEmits<{
  cancel: [];
  downloaded: [];
}>();

const {
  selectedTemplateId,
  selectedColorId,
  currentColor,
  colorOptions,
  templateMeta,
  selectTemplate,
  selectColor,
} = useCvTemplate();

const isGenerating = ref(false);

const getPreviewBg = (id: string): string => {
  const bgs: Record<string, string> = {
    professional: 'bg-blue-50',
    modern: 'bg-slate-50',
    minimal: 'bg-white',
    classic: 'bg-gray-50',
  };
  return bgs[id] ?? 'bg-white';
};

const getHeaderColor = (id: string): string => {
  const cols: Record<string, string> = {
    professional: '#1e2a3a',
    modern: '#1e2430',
    minimal: '#111111',
    classic: '#1a1a2e',
  };
  return cols[id] ?? '#1e2a3a';
};

const handleDownload = async () => {
  isGenerating.value = true;
  try {
    // Create offscreen container
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;z-index:-1;opacity:0;pointer-events:none;overflow:visible;';
    document.body.appendChild(container);

    // Mount template component
    const { createApp, h, nextTick } = await import('vue');
    const { default: Pro } = await import('./CvTemplateProfessional.vue');
    const { default: Mod } = await import('./CvTemplateModern.vue');
    const { default: Min } = await import('./CvTemplateMinimal.vue');
    const { default: Cls } = await import('./CvTemplateClassic.vue');

    const componentMap: Record<string, any> = {
      professional: Pro,
      modern: Mod,
      minimal: Min,
      classic: Cls,
    };

    const component = componentMap[selectedTemplateId.value];
    const app = createApp(h(component, { data: props.templateData, color: currentColor.value }));
    app.mount(container);
    await nextTick();

    // Wait for Vue to finish rendering (including v-bind reactive updates)
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    // Find the cv element inside mounted app
    const cvEl = container.querySelector('[class*="cv"]') as HTMLElement;
    if (!cvEl) {
      throw new Error('CV template element not found');
    }

    const canvas = await html2canvas(cvEl, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const name = (props.templateData.fullName || 'CV').replace(/\s+/g, '_');
    pdf.save(`${name}_${selectedTemplateId.value}.pdf`);

    app.unmount();
    document.body.removeChild(container);

    emit('downloaded');
  } catch (err) {
    console.error('PDF generation error:', err);
    alert(t('upload.generatingFailed'));
  } finally {
    isGenerating.value = false;
  }
};
</script>

<style scoped>
/* Mini template previews */
.mini-preview {
  height: 80px;
  display: flex;
  flex-direction: column;
}

.mini-header {
  height: 28px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 7px;
}

.mini-avatar {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  flex-shrink: 0;
}

.mini-name-line {
  height: 5px;
  width: 55%;
  background: rgba(255,255,255,0.6);
  border-radius: 3px;
}

.mini-body {
  flex: 1;
  display: flex;
}

.mini-sidebar {
  width: 28%;
  background: rgba(0,0,0,0.04);
}

.mini-content {
  flex: 1;
  padding: 4px 5px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.mini-line {
  height: 3px;
  background: rgba(0,0,0,0.08);
  border-radius: 2px;
  width: 100%;
}

.mini-line.short { width: 50%; }
.mini-line.medium { width: 72%; }
</style>
