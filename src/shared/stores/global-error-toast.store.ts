import { create } from 'zustand';

export type GlobalErrorToastMessage = {
  id: number;
  message: string;
};

type GlobalErrorToastState = {
  error: GlobalErrorToastMessage | null;
  showError: (message: string) => void;
  dismissError: (id: number) => void;
};

let nextToastId = 0;

export const useGlobalErrorToastStore = create<GlobalErrorToastState>((set) => ({
  error: null,
  showError: (message) => set({ error: { id: ++nextToastId, message } }),
  dismissError: (id) =>
    set((state) => (state.error?.id === id ? { error: null } : state)),
}));

export function showGlobalErrorToast(message: string) {
  useGlobalErrorToastStore.getState().showError(message);
}
