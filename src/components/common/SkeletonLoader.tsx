import React from 'react';

export interface SkeletonLoaderProps {
  type?: 'card' | 'line' | 'avatar' | 'timeline';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  count = 1,
  className = '',
}) => {
  const items = Array.from({ length: count });

  if (type === 'line') {
    return (
      <div className={`space-y-2 w-full ${className}`}>
        {items.map((_, i) => (
          <div
            key={i}
            className="h-4 bg-surface-container-high/80 rounded-md animate-pulse"
            style={{ width: `${Math.max(60, 100 - i * 15)}%` }}
          />
        ))}
      </div>
    );
  }

  if (type === 'avatar') {
    return (
      <div className="w-10 h-10 rounded-full bg-surface-container-high animate-pulse shrink-0" />
    );
  }

  if (type === 'timeline') {
    return (
      <div className={`space-y-3 w-full ${className}`}>
        {items.map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-surface-container border border-surface-container-high/40 animate-pulse flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 bg-surface-container-high rounded" />
              <div className="h-3 w-16 bg-surface-container-high rounded" />
            </div>
            <div className="h-4 w-3/4 bg-surface-container-high rounded" />
            <div className="h-3 w-full bg-surface-container-high rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 w-full ${className}`}>
      {items.map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-2xl bg-surface-container-low border border-surface-container animate-pulse flex flex-col gap-3"
        >
          <div className="h-32 w-full bg-surface-container-high rounded-xl" />
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-surface-container-high rounded" />
            <div className="h-4 w-12 bg-surface-container-high rounded-full" />
          </div>
          <div className="h-3 w-48 bg-surface-container-high rounded" />
        </div>
      ))}
    </div>
  );
};
