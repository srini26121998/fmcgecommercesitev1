import { create } from 'zustand';

interface GlobalLoaderState {
  activeRequests: number;
  startLoading: () => void;
  stopLoading: () => void;
}

export const useGlobalLoaderStore = create<GlobalLoaderState>((set) => ({
  activeRequests: 0,
  startLoading: () => set((state) => ({ activeRequests: state.activeRequests + 1 })),
  stopLoading: () => set((state) => ({ activeRequests: Math.max(0, state.activeRequests - 1) })),
}));
