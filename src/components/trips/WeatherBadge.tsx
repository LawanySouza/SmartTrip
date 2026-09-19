import React from 'react';

export interface WeatherBadgeProps {
  temperature?: number;
  condition?: string;
  rainProbability?: number;
  className?: string;
}

export const WeatherBadge: React.FC<WeatherBadgeProps> = ({
  temperature = 28,
  condition = 'Ensolarado',
  rainProbability = 10,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container/90 text-on-secondary text-xs font-semibold shadow-2xs backdrop-blur-xs select-none ${className}`}
      title={`Previsão: ${condition}, ${temperature}°C, chuva: ${rainProbability}%`}
    >
      <span className="material-symbols-outlined text-[15px]">wb_sunny</span>
      <span>{temperature}°C</span>
      <span className="opacity-60">•</span>
      <span className="text-[11px] font-medium opacity-90">{condition}</span>
      {rainProbability > 30 && (
        <span className="text-[10px] text-blue-200 ml-0.5">({rainProbability}% 🌧️)</span>
      )}
    </div>
  );
};
