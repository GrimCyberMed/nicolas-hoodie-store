import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-muted';
  
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        className
      )}
    />
  );
}

// Preset skeleton components
export function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <Skeleton className="w-full aspect-square" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-border">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" className="w-12 h-12" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </td>
      <td className="py-4 px-4"><Skeleton className="h-4 w-16" /></td>
      <td className="py-4 px-4"><Skeleton className="h-4 w-20" /></td>
      <td className="py-4 px-4"><Skeleton className="h-4 w-16" /></td>
      <td className="py-4 px-4"><Skeleton className="h-6 w-20" /></td>
      <td className="py-4 px-4"><Skeleton className="h-6 w-24" /></td>
      <td className="py-4 px-4">
        <div className="flex gap-2 justify-end">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </td>
    </tr>
  );
}
