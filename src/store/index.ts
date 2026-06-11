import { configureStore, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { ref, onUnmounted } from 'vue';
import type { CV, Candidate, User, SearchFilters } from '@/types';

interface DashboardState {
  dashboardData: any | null;
  adminDashboardData: any | null;
  isLoadingDashboard: boolean;
  isLoadingAdminDashboard: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AppState {
  cvs: CV[];
  candidates: Candidate[];
  searchFilters: SearchFilters;
  isLoading: boolean;
  error: string | null;
}

const initialDashboardState: DashboardState = {
  dashboardData: null,
  adminDashboardData: null,
  isLoadingDashboard: false,
  isLoadingAdminDashboard: false,
};

const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false
};

const initialAppState: AppState = {
  cvs: [],
  candidates: [],
  searchFilters: {
    targetRole: '',
    requiredSkills: [],
    minExperience: 0,
    maxExperience: 10,
    education: '',
    minAiMatchScore: 0,
    location: ''
  },
  isLoading: false,
  error: null
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: initialDashboardState,
  reducers: {
    setDashboardData: (state, action: PayloadAction<any>) => {
      state.dashboardData = action.payload;
    },
    setAdminDashboardData: (state, action: PayloadAction<any>) => {
      state.adminDashboardData = action.payload;
    },
    setLoadingDashboard: (state, action: PayloadAction<boolean>) => {
      state.isLoadingDashboard = action.payload;
    },
    setLoadingAdminDashboard: (state, action: PayloadAction<boolean>) => {
      state.isLoadingAdminDashboard = action.payload;
    },
    clearDashboardData: (state) => {
      state.dashboardData = null;
      state.adminDashboardData = null;
    }
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    }
  }
});

const appSlice = createSlice({
  name: 'app',
  initialState: initialAppState,
  reducers: {
    setCVs: (state, action: PayloadAction<CV[]>) => {
      state.cvs = action.payload;
    },
    addCV: (state, action: PayloadAction<CV>) => {
      state.cvs.unshift(action.payload);
    },
    updateCV: (state, action: PayloadAction<CV>) => {
      const index = state.cvs.findIndex(cv => cv.id === action.payload.id);
      if (index !== -1) {
        state.cvs[index] = action.payload;
      }
    },
    deleteCV: (state, action: PayloadAction<string>) => {
      state.cvs = state.cvs.filter(cv => cv.id !== action.payload);
    },
    setCandidates: (state, action: PayloadAction<Candidate[]>) => {
      state.candidates = action.payload;
    },
    addCandidate: (state, action: PayloadAction<Candidate>) => {
      state.candidates.unshift(action.payload);
    },
    setSearchFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
      state.searchFilters = { ...state.searchFilters, ...action.payload };
    },
    resetSearchFilters: (state) => {
      state.searchFilters = initialAppState.searchFilters;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const {
  setDashboardData,
  setAdminDashboardData,
  setLoadingDashboard,
  setLoadingAdminDashboard,
  clearDashboardData
} = dashboardSlice.actions;

export const { setCredentials, logout, updateUser, setToken } = authSlice.actions;
export const {
  setCVs,
  addCV,
  updateCV,
  deleteCV,
  setCandidates,
  addCandidate,
  setSearchFilters,
  resetSearchFilters,
  setLoading,
  setError
} = appSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    app: appSlice.reducer,
    dashboard: dashboardSlice.reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export function useAppSelector<T>(selector: (state: RootState) => T) {
  const state = ref(selector(store.getState()));
  const unsubscribe = store.subscribe(() => {
    state.value = selector(store.getState()) as T;
  });

  onUnmounted(() => {
    unsubscribe();
  });

  return state;
}

export function useAppDispatch() {
  return store.dispatch;
}

// Modal state management
const modalStates = ref<Record<string, { isOpen: boolean; data?: any }>>({
  quickPreview: { isOpen: false },
  candidateDetails: { isOpen: false },
  uploadCV: { isOpen: false },
  confirmDelete: { isOpen: false },
  shareResult: { isOpen: false }
});

export function useModal() {
  const openModal = (modalName: string, data?: any) => {
    if (modalStates.value[modalName] !== undefined) {
      modalStates.value[modalName] = { isOpen: true, data };
    }
  };

  const closeModal = (modalName: string) => {
    if (modalStates.value[modalName] !== undefined) {
      modalStates.value[modalName] = { isOpen: false, data: undefined };
    }
  };

  const toggleModal = (modalName: string) => {
    if (modalStates.value[modalName] !== undefined) {
      modalStates.value[modalName].isOpen = !modalStates.value[modalName].isOpen;
    }
  };

  const getModalState = (modalName: string) => {
    return {
      value: modalStates.value[modalName] || { isOpen: false }
    };
  };

  return {
    modalStates,
    openModal,
    closeModal,
    toggleModal,
    getModalState
  };
}
