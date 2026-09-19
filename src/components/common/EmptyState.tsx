import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-surface-container-low border border-dashed border-outline/40 gap-3 w-full my-4 ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center text-primary shadow-xs">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <div className="flex flex-col gap-1 max-w-sm">
        <h3 className="text-base font-bold text-on-surface">{title}</h3>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
