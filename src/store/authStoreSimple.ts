import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { simpleSignIn, simpleSignOut, getSimpleCurrentUser, type SimpleAuthUser } from '@/lib/auth-simple';

interface SimpleAuthState {
  user: SimpleAuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: SimpleAuthUser | null) => void;
}

export const useSimpleAuthStore = create<SimpleAuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const { user } = await simpleSignIn(email, password);
          set({ 
            user, 
            isAuthenticated: true,
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await simpleSignOut();
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });
          const user = await getSimpleCurrentUser();
          set({ 
            user, 
            isAuthenticated: !!user,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false 
          });
        }
      },

      setUser: (user: SimpleAuthUser | null) => {
        set({ 
          user, 
          isAuthenticated: !!user 
        });
      },
    }),
    {
      name: 'simple-auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
