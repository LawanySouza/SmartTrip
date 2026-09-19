import React, { useState } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  type = 'text',
  id,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const isPassword = type === 'password';

  return (
    <div className="flex flex-col w-full gap-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {leftIcon && (
          <span className="absolute left-3.5 text-on-surface-variant pointer-events-none flex items-center">
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={`w-full rounded-xl border bg-surface-container-low px-3.5 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            leftIcon ? 'pl-10' : ''
          } ${isPassword || rightIcon ? 'pr-10' : ''} ${
            error
              ? 'border-error ring-1 ring-error/50'
              : 'border-outline/40 hover:border-outline focus-visible:border-primary'
          } ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-on-surface-variant hover:text-on-surface p-1 rounded transition-colors"
            title={showPassword ? 'Ocultar senha' : 'Ver senha'}
            tabIndex={-1}
          >
            <span className="material-symbols-outlined text-[18px]">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}

        {!isPassword && rightIcon && (
          <span className="absolute right-3.5 text-on-surface-variant flex items-center">
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <span id={`${inputId}-error`} className="text-xs text-error font-medium" role="alert">
          {error}
        </span>
      )}

      {!error && helperText && (
        <span id={`${inputId}-helper`} className="text-xs text-on-surface-variant/70">
          {helperText}
        </span>
      )}
    </div>
  );
};
