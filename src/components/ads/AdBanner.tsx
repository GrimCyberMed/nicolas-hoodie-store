'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Advertisement {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  call_to_action: string;
  position: 'left_sidebar' | 'right_sidebar' | 'banner_top' | 'banner_bottom';
  priority: number;
  target_page: string;
  is_active: boolean;
}

interface AdBannerProps {
  position: 'banner_top' | 'banner_bottom';
  targetPage?: string;
  className?: string;
}

export function AdBanner({ position, targetPage = 'all', className = '' }: AdBannerProps) {
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAd();
  }, [position, targetPage]);

  const fetchAd = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('position', position)
        .eq('is_active', true)
        .or(`target_page.eq.all,target_page.eq.${targetPage}`)
        .lte('start_date', new Date().toISOString())
        .order('priority', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching banner ad:', error);
      }

      if (data) {
        setAd(data);
        // Track impression
        trackImpression(data.id);
      }
    } catch (error) {
      console.error('Error fetching ad:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackImpression = async (adId: string) => {
    try {
      await supabase.rpc('increment_ad_impressions', { ad_id: adId });
    } catch (error) {
      // Silently fail - don't break the UI for tracking errors
      console.error('Error tracking impression:', error);
    }
  };

  const trackClick = async () => {
    if (!ad) return;
    try {
      await supabase.rpc('increment_ad_clicks', { ad_id: ad.id });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  if (isLoading || !ad) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      <Link 
        href={ad.link_url} 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={trackClick}
        className="block relative w-full overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow"
      >
        <div className="relative w-full h-24 md:h-32 lg:h-40">
          <Image
            src={ad.image_url}
            alt={ad.title}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
            <div className="p-4 md:p-6 text-white">
              <h3 className="text-lg md:text-xl font-bold mb-1">{ad.title}</h3>
              {ad.description && (
                <p className="text-sm md:text-base opacity-90 mb-2 hidden sm:block">
                  {ad.description}
                </p>
              )}
              <span className="inline-block px-4 py-1.5 bg-white text-black text-sm font-medium rounded-full hover:bg-opacity-90 transition-colors">
                {ad.call_to_action}
              </span>
            </div>
          </div>
        </div>
      </Link>
      <div className="text-xs text-muted-foreground text-right mt-1 opacity-50">
        Ad
      </div>
    </div>
  );
}
