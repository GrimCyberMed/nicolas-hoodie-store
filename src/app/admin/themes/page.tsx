'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

interface SiteTheme {
  id: string;
  name: string;
  description: string;
  theme_type: 'default' | 'holiday' | 'seasonal' | 'promotional' | 'custom';
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
  is_default: boolean;
  priority: number;
  created_at: string;
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<SiteTheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState<SiteTheme | null>(null);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const { data, error } = await supabase
        .from('site_themes')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;
      setThemes(data || []);
      
      // Find active theme
      const active = data?.find((t: SiteTheme) => t.is_active);
      if (active) setActiveTheme(active);
    } catch (error) {
      console.error('Error fetching themes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const activateTheme = async (themeId: string) => {
    try {
      // Deactivate all themes
      await supabase
        .from('site_themes')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

      // Activate selected theme
      const { error } = await supabase
        .from('site_themes')
        .update({ is_active: true })
        .eq('id', themeId);

      if (error) throw error;
      
      fetchThemes();
      
      // Theme will be applied automatically via realtime subscription
      // Show success message
      alert('Theme activated successfully! The changes will apply across the site.');
    } catch (error) {
      console.error('Error activating theme:', error);
      alert('Failed to activate theme');
    }
  };

  const getThemeTypeBadge = (type: string) => {
    const colors = {
      default: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      holiday: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      seasonal: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      promotional: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      custom: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[type as keyof typeof colors] || colors.custom;
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Site Themes</h1>
        <p className="text-muted-foreground mt-1">
          Manage and activate site themes. {activeTheme && `Currently active: ${activeTheme.name}`}
        </p>
      </div>

      {/* Active Theme Notice */}
      {activeTheme && (
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Currently Active: {activeTheme.name}
              </h2>
              <p className="text-muted-foreground text-sm">
                {activeTheme.description || 'No description'}
              </p>
            </div>
            <div className="flex gap-2">
              {activeTheme.primary_color && (
                <div
                  className="w-12 h-12 rounded-lg border-2 border-border"
                  style={{ backgroundColor: activeTheme.primary_color }}
                  title="Primary Color"
                />
              )}
              {activeTheme.secondary_color && (
                <div
                  className="w-12 h-12 rounded-lg border-2 border-border"
                  style={{ backgroundColor: activeTheme.secondary_color }}
                  title="Secondary Color"
                />
              )}
              {activeTheme.accent_color && (
                <div
                  className="w-12 h-12 rounded-lg border-2 border-border"
                  style={{ backgroundColor: activeTheme.accent_color }}
                  title="Accent Color"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Theme Management</p>
            <p>
              Themes are pre-configured in the database. Click "Activate" to switch to a different theme.
              Holiday themes can be scheduled to activate automatically during specific dates.
            </p>
          </div>
        </div>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.length === 0 ? (
          <div className="col-span-full bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
            No themes found. Please run the database migration to create default themes.
          </div>
        ) : (
          themes.map((theme) => (
            <div 
              key={theme.id} 
              className={`bg-card border-2 rounded-lg p-6 transition-all ${
                theme.is_active 
                  ? 'border-accent shadow-lg' 
                  : 'border-border hover:border-accent/50'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-lg mb-1">{theme.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getThemeTypeBadge(theme.theme_type)}`}>
                      {theme.theme_type}
                    </span>
                    {theme.is_active && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </span>
                    )}
                    {theme.is_default && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {theme.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {theme.description}
                </p>
              )}

              {/* Color Palette */}
              <div className="mb-4">
                <div className="text-xs font-medium text-muted-foreground mb-2">Color Palette</div>
                <div className="grid grid-cols-5 gap-2">
                  {theme.primary_color && (
                    <div>
                      <div
                        className="w-full h-12 rounded border border-border"
                        style={{ backgroundColor: theme.primary_color }}
                      />
                      <div className="text-xs text-center mt-1 text-muted-foreground">Primary</div>
                    </div>
                  )}
                  {theme.secondary_color && (
                    <div>
                      <div
                        className="w-full h-12 rounded border border-border"
                        style={{ backgroundColor: theme.secondary_color }}
                      />
                      <div className="text-xs text-center mt-1 text-muted-foreground">Secondary</div>
                    </div>
                  )}
                  {theme.accent_color && (
                    <div>
                      <div
                        className="w-full h-12 rounded border border-border"
                        style={{ backgroundColor: theme.accent_color }}
                      />
                      <div className="text-xs text-center mt-1 text-muted-foreground">Accent</div>
                    </div>
                  )}
                  {theme.background_color && (
                    <div>
                      <div
                        className="w-full h-12 rounded border border-border"
                        style={{ backgroundColor: theme.background_color }}
                      />
                      <div className="text-xs text-center mt-1 text-muted-foreground">Background</div>
                    </div>
                  )}
                  {theme.text_color && (
                    <div>
                      <div
                        className="w-full h-12 rounded border border-border"
                        style={{ backgroundColor: theme.text_color }}
                      />
                      <div className="text-xs text-center mt-1 text-muted-foreground">Text</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Priority */}
              <div className="text-sm text-muted-foreground mb-4">
                <strong className="text-foreground">Priority:</strong> {theme.priority}
              </div>

              {/* Action */}
              {!theme.is_active && (
                <Button
                  onClick={() => activateTheme(theme.id)}
                  className="w-full"
                  variant="outline"
                >
                  Activate Theme
                </Button>
              )}
              {theme.is_active && (
                <div className="w-full px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-center font-medium">
                  Currently Active
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Additional Info */}
      <div className="mt-8 p-6 bg-muted rounded-lg">
        <h3 className="font-bold text-foreground mb-3">Available Themes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <strong className="text-foreground">Default:</strong> Standard theme
          </div>
          <div>
            <strong className="text-foreground">Christmas:</strong> Red & green festive colors
          </div>
          <div>
            <strong className="text-foreground">Halloween:</strong> Orange & black spooky theme
          </div>
          <div>
            <strong className="text-foreground">Valentine's Day:</strong> Pink & red romantic theme
          </div>
          <div>
            <strong className="text-foreground">Black Friday:</strong> Black & gold high-contrast
          </div>
          <div>
            <strong className="text-foreground">Summer:</strong> Bright & sunny theme
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Note: Theme colors defined in the database will override the default CSS variables when activated.
          For full theme support, ensure your components use Tailwind CSS color utilities.
        </p>
      </div>
    </div>
  );
}
