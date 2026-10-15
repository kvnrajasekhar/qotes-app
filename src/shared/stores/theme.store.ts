import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import { feedStorage } from '../lib/storage';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeState {
  /** User's in-app choice. Only honoured inside the authenticated app. */
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

/** Adapts the MMKV / localStorage wrapper in shared/lib/storage to zustand's StateStorage. */
const stateStorage: StateStorage = {
  getItem: (name) => feedStorage.getString(name) ?? null,
  setItem: (name, value) => feedStorage.set(name, value),
  removeItem: (name) => feedStorage.delete(name),
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'system',
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: 'qotes-theme-preference',
      storage: createJSONStorage(() => stateStorage),
    },
  ),
);
