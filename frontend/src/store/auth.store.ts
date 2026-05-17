import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Role } from '../types';

interface AuthState {
  userId: number | null;
  role: Role | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (payload: { userId: number; role: Role; accessToken: string }) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      role: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: ({ userId, role, accessToken }) =>
        set({ userId, role, accessToken, isAuthenticated: true }),
      setAccessToken: (accessToken) => set({ accessToken, isAuthenticated: true }),
      clearAuth: () =>
        set({ userId: null, role: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => localStorage),
      // tokens stay in memory; persist only identity claims
      partialize: (state) => ({
        userId: state.userId,
        role: state.role,
      }),
    }
  )
);
