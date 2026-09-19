import React from 'react';

export interface ChipOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  subtitle?: string;
}

export interface ChipGroupProps {
  label?: string;
  options: ChipOption[];
  selected: string | string[];
  onChange: (value: string) => void;
  multiple?: boolean;
  className?: string;
}

export const ChipGroup: React.FC<ChipGroupProps> = ({
  label,
  options,
  selected,
  onChange,
  multiple = false,
  className = '',
}) => {
  const isSelected = (val: string) => {
    if (multiple && Array.isArray(selected)) {
      return selected.includes(val);
    }
    return selected === val;
  };

  return (
    <div className={`flex flex-col gap-2 w-full text-left ${className}`}>
      {label && (
        <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          {label}
        </span>
      )}

      <div
        className="flex flex-wrap gap-2"
        role={multiple ? 'group' : 'radiogroup'}
        aria-label={label}
      >
        {options.map((opt) => {
          const active = isSelected(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              role={multiple ? 'checkbox' : 'radio'}
              aria-checked={active}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 flex items-center gap-2 border select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                active
                  ? 'bg-secondary-container border-secondary text-on-secondary shadow-xs font-semibold'
                  : 'bg-surface-container-low border-outline/30 text-on-surface hover:bg-surface-container hover:border-outline/60'
              }`}
            >
              {opt.icon && <span className="text-sm shrink-0">{opt.icon}</span>}
              <div className="flex flex-col text-left">
                <span>{opt.label}</span>
                {opt.subtitle && (
                  <span className="text-[10px] opacity-75">{opt.subtitle}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
