import { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

export function StatsCard({ title, value, icon, trend, description }: StatsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-secondary">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-secondary">vs last month</span>
            </div>
          )}
          
          {description && (
            <p className="text-sm text-secondary mt-2">{description}</p>
          )}
        </div>
        
        <div className="text-accent opacity-80">{icon}</div>
      </div>
    </Card>
  );
}
