import React, { useEffect } from 'react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
  duration = 3500,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      bg: 'bg-emerald-600 text-white',
      icon: 'check_circle',
    },
    info: {
      bg: 'bg-primary text-on-primary',
      icon: 'info',
    },
    warning: {
      bg: 'bg-amber-600 text-white',
      icon: 'warning',
    },
    error: {
      bg: 'bg-error text-on-error',
      icon: 'error',
    },
  }[type];

  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border border-white/15 text-xs font-medium backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 select-none ${typeConfig.bg}`}
      role="status"
      aria-live="polite"
    >
      <span className="material-symbols-outlined text-[18px]">
        {typeConfig.icon}
      </span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:opacity-75 p-0.5 rounded transition-opacity"
        title="Dispensar"
      >
        <span className="material-symbols-outlined text-[14px]">close</span>
      </button>
    </div>
  );
};
