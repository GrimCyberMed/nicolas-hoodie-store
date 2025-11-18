'use client';

import { useEffect, useState } from 'react';
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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);
  const [siteTheme, setSiteTheme] = useState<SiteTheme | null>(null);

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
          console.error('Error fetching active theme:', error);
          return;
        }

        if (data) {
          setSiteTheme(data);
          applyThemeColors(data);
        }
      } catch (error) {
        console.error('Error fetching theme:', error);
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

  // Convert hex color to RGB values
  const hexToRgb = (hex: string): string => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r} ${g} ${b}`;
  };

  // Apply theme colors as CSS variables
  const applyThemeColors = (themeData: SiteTheme) => {
    const root = document.documentElement;

    if (themeData.primary_color) {
      root.style.setProperty('--color-primary', hexToRgb(themeData.primary_color));
    }

    if (themeData.secondary_color) {
      root.style.setProperty('--color-secondary', hexToRgb(themeData.secondary_color));
    }

    if (themeData.accent_color) {
      root.style.setProperty('--color-accent', hexToRgb(themeData.accent_color));
    }

    if (themeData.background_color) {
      root.style.setProperty('--color-background', hexToRgb(themeData.background_color));
    }

    if (themeData.text_color) {
      root.style.setProperty('--color-foreground', hexToRgb(themeData.text_color));
    }

    if (themeData.font_family) {
      root.style.setProperty('--font-family', themeData.font_family);
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
    }

    console.log(`Theme applied: ${themeData.name}`);
  };

  return <>{children}</>;
}
