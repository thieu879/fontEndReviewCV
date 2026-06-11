import { ref } from 'vue';

interface ModalState {
  isOpen: boolean;
  data?: any;
}

const modals = ref<Record<string, ModalState>>({
  quickPreview: { isOpen: false },
  candidateDetails: { isOpen: false },
  uploadCV: { isOpen: false },
  confirmDelete: { isOpen: false },
  shareResult: { isOpen: false },
});

export function useModal() {
  const openModal = (modalName: string, data?: any) => {
    modals.value[modalName] = { isOpen: true, data };
  };

  const closeModal = (modalName: string) => {
    if (modals.value[modalName]) {
      modals.value[modalName].isOpen = false;
      modals.value[modalName].data = undefined;
    }
  };

  const toggleModal = (modalName: string) => {
    if (modals.value[modalName]) {
      modals.value[modalName].isOpen = !modals.value[modalName].isOpen;
    }
  };

  return {
    modals,
    openModal,
    closeModal,
    toggleModal
  };
}
