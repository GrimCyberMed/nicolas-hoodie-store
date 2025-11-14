'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { onAuthStateChange } from '@/lib/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Check auth status on mount
    checkAuth();

    // Listen to auth state changes
    const subscription = onAuthStateChange((user) => {
      if (user) {
        checkAuth();
      } else {
        useAuthStore.setState({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuth]);

  return <>{children}</>;
}
