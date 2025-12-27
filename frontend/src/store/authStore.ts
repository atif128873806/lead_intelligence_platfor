import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      setToken: (token) => {
        localStorage.setItem('token', token);
        set({ token, isAuthenticated: !!token });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Sync with localStorage token on rehydration
        if (state) {
          const storedToken = localStorage.getItem('token');
          if (storedToken && !state.token) {
            state.token = storedToken;
            state.isAuthenticated = true;
          } else if (!storedToken) {
            state.token = null;
            state.isAuthenticated = false;
          }
        }
      },
    }
  )
);
