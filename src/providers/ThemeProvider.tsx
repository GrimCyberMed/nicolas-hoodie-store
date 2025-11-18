'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';
import { supabase } from '@/lib/supabase';

interface SiteTheme {
  id: string;
  name: string;
  theme_type: string;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  background_color: string | null;
  text_color: string | null;
  font_family: string | null;
  custom_css: string | null;
}

// Map theme names to CSS data attribute values
const themeNameToSlug = (name: string): string => {
  return name.toLowerCase().replace(/['']/g, '').replace(/\s+/g, '-');
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);

  // Handle light/dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch and apply active site theme from database
  useEffect(() => {
    async function fetchActiveTheme() {
      try {
        const { data, error } = await supabase
          .from('site_themes')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          // If no theme found or error, use default (no site-theme attribute)
          document.documentElement.removeAttribute('data-site-theme');
          return;
        }

        if (data) {
          applySiteTheme(data);
        }
      } catch (error) {
        // Use default theme on error
        document.documentElement.removeAttribute('data-site-theme');
      }
    }

    fetchActiveTheme();

    // Subscribe to theme changes
    const channel = supabase
      .channel('site_themes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_themes',
        },
        () => {
          // Refetch theme when changes occur
          fetchActiveTheme();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Apply site theme using data attribute for CSS-based theming
  const applySiteTheme = (themeData: SiteTheme) => {
    const root = document.documentElement;
    const themeSlug = themeNameToSlug(themeData.name);
    
    // Set the site theme attribute for CSS-based theming
    // This allows proper light/dark mode support via CSS
    if (themeData.name === 'Default Theme') {
      // Remove site theme attribute for default theme
      root.removeAttribute('data-site-theme');
    } else {
      root.setAttribute('data-site-theme', themeSlug);
    }

    // Apply font family if specified
    if (themeData.font_family) {
      root.style.setProperty('--font-family', themeData.font_family);
    } else {
      root.style.removeProperty('--font-family');
    }

    // Apply custom CSS if provided
    if (themeData.custom_css) {
      let customStyleElement = document.getElementById('site-theme-custom-css');
      if (!customStyleElement) {
        customStyleElement = document.createElement('style');
        customStyleElement.id = 'site-theme-custom-css';
        document.head.appendChild(customStyleElement);
      }
      customStyleElement.textContent = themeData.custom_css;
    } else {
      // Remove custom CSS if not provided
      const customStyleElement = document.getElementById('site-theme-custom-css');
      if (customStyleElement) {
        customStyleElement.remove();
      }
    }
  };

  return <>{children}</>;
}
