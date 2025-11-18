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

interface AdSidebarProps {
  position: 'left_sidebar' | 'right_sidebar';
  targetPage?: string;
  className?: string;
  maxAds?: number;
}

export function AdSidebar({ 
  position, 
  targetPage = 'all', 
  className = '',
  maxAds = 2 
}: AdSidebarProps) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, [position, targetPage]);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('position', position)
        .eq('is_active', true)
        .or(`target_page.eq.all,target_page.eq.${targetPage}`)
        .lte('start_date', new Date().toISOString())
        .order('priority', { ascending: false })
        .limit(maxAds);

      if (error) {
        console.error('Error fetching sidebar ads:', error);
        return;
      }

      if (data && data.length > 0) {
        setAds(data);
        // Track impressions for all ads
        data.forEach((ad: Advertisement) => trackImpression(ad.id));
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackImpression = async (adId: string) => {
    try {
      await supabase.rpc('increment_ad_impressions', { ad_id: adId });
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  };

  const trackClick = async (adId: string) => {
    try {
      await supabase.rpc('increment_ad_clicks', { ad_id: adId });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  if (isLoading || ads.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {ads.map((ad) => (
        <div key={ad.id} className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <Link 
            href={ad.link_url} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => trackClick(ad.id)}
            className="block"
          >
            {/* Image */}
            <div className="relative w-full h-40">
              <Image
                src={ad.image_url}
                alt={ad.title}
                fill
                className="object-cover"
                sizes="300px"
              />
            </div>
            
            {/* Content */}
            <div className="p-4">
              <h4 className="font-bold text-foreground text-sm mb-1">
                {ad.title}
              </h4>
              {ad.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {ad.description}
                </p>
              )}
              <span className="inline-block w-full text-center px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors">
                {ad.call_to_action}
              </span>
            </div>
          </Link>
          <div className="text-xs text-muted-foreground text-center pb-2 opacity-50">
            Sponsored
          </div>
        </div>
      ))}
    </div>
  );
}
