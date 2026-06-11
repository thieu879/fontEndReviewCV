<template>
  <div class="pdf-viewer flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden">
    <!-- Toolbar -->
    <div class="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-4">
        <span class="text-sm font-medium text-gray-700">
          {{ currentPage }} / {{ totalPages }}
        </span>
        <div class="flex items-center gap-1">
          <button
            @click="previousPage"
            :disabled="currentPage <= 1"
            class="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <ChevronLeft class="w-5 h-5 text-gray-600" />
          </button>
          <button
            @click="nextPage"
            :disabled="currentPage >= totalPages"
            class="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            <ChevronRight class="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="zoomOut"
          :disabled="scale <= 0.5"
          class="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Zoom out"
        >
          <ZoomOut class="w-5 h-5 text-gray-600" />
        </button>
        <span class="text-sm text-gray-600 min-w-[4rem] text-center">{{ Math.round(scale * 100) }}%</span>
        <button
          @click="zoomIn"
          :disabled="scale >= 3"
          class="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Zoom in"
        >
          <ZoomIn class="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>

    <!-- PDF Canvas Container -->
    <div class="flex-1 overflow-auto p-4 flex justify-center">
      <div v-if="isLoading" class="flex items-center justify-center h-full">
        <div class="text-center">
          <Loader2 class="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
          <p class="text-gray-500 text-sm">Loading PDF...</p>
        </div>
      </div>
      <div v-else-if="error" class="flex items-center justify-center h-full">
        <div class="text-center text-red-500">
          <AlertCircle class="w-12 h-12 mx-auto mb-3" />
          <p class="font-medium">{{ error }}</p>
        </div>
      </div>
      <canvas
        v-else
        ref="canvasRef"
        class="shadow-lg bg-white"
        :style="{ maxWidth: '100%', height: 'auto' }"
      ></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import * as pdfjsLib from 'pdfjs-dist';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-vue-next';

// Configure PDF.js worker - use local worker from public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

interface Props {
  src: string;
  page?: number;
}

const props = withDefaults(defineProps<Props>(), {
  page: 1,
});

const emit = defineEmits<{
  (e: 'loaded', totalPages: number): void;
  (e: 'error', error: string): void;
  (e: 'page-change', page: number): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);

const pdfDoc = ref<pdfjsLib.PDFDocumentProxy | null>(null);
const currentPage = ref(props.page);
const totalPages = ref(0);
const scale = ref(1.0);
const isLoading = ref(false);
const error = ref('');

const renderPage = async (pageNum: number) => {
  if (!pdfDoc.value || !canvasRef.value) return;

  try {
    const page = await pdfDoc.value.getPage(pageNum);
    const viewport = page.getViewport({ scale: scale.value });

    const canvas = canvasRef.value;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;
  } catch (err) {
    console.error('Error rendering page:', err);
    error.value = 'Failed to render page';
  }
};

const loadPdf = async (url: string) => {
  isLoading.value = true;
  error.value = '';

  try {
    const loadingTask = pdfjsLib.getDocument(url);
    pdfDoc.value = await loadingTask.promise;
    totalPages.value = pdfDoc.value.numPages;
    emit('loaded', totalPages.value);
    await renderPage(currentPage.value);
  } catch (err: any) {
    console.error('Error loading PDF:', err);
    error.value = err.message || 'Failed to load PDF';
    emit('error', error.value);
  } finally {
    isLoading.value = false;
  }
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    renderPage(currentPage.value);
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    renderPage(currentPage.value);
  }
};

const zoomIn = () => {
  if (scale.value < 3) {
    scale.value = Math.min(3, scale.value + 0.25);
    renderPage(currentPage.value);
  }
};

const zoomOut = () => {
  if (scale.value > 0.5) {
    scale.value = Math.max(0.5, scale.value - 0.25);
    renderPage(currentPage.value);
  }
};

watch(() => props.src, (newSrc) => {
  if (newSrc) {
    currentPage.value = props.page;
    loadPdf(newSrc);
  }
});

watch(() => props.page, (newPage) => {
  if (newPage && newPage !== currentPage.value && pdfDoc.value) {
    currentPage.value = newPage;
    renderPage(currentPage.value);
  }
});

watch(currentPage, (newPage) => {
  emit('page-change', newPage);
});

onMounted(() => {
  if (props.src) {
    loadPdf(props.src);
  }
});
</script>
