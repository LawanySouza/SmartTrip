import React from 'react';
import { Trip } from '../../types';
import { WeatherBadge } from './WeatherBadge';

export interface TripCardProps {
  trip: Trip;
  onSelect: (tripId: string) => void;
  onDelete?: (tripId: string) => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onSelect, onDelete }) => {
  const statusLabels: Record<string, { label: string; color: string }> = {
    saved: { label: 'Salvo', color: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300' },
    completed: { label: 'Concluído', color: 'bg-blue-500/20 text-blue-800 dark:text-blue-300' },
    draft: { label: 'Rascunho', color: 'bg-amber-500/20 text-amber-800 dark:text-amber-300' },
    archived: { label: 'Arquivado', color: 'bg-slate-500/20 text-slate-800 dark:text-slate-300' },
  };

  const statusInfo = statusLabels[trip.status] || statusLabels.saved;

  return (
    <div
      onClick={() => onSelect(trip.id)}
      className="group relative flex flex-col rounded-2xl bg-surface-container-low border border-outline/30 overflow-hidden shadow-xs hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer text-left"
      role="article"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(trip.id)}
    >
      {/* Imagem / Banner do Destino */}
      <div className="relative h-36 w-full bg-gradient-to-tr from-primary/30 via-secondary-container/40 to-surface-container-high flex items-end p-3 overflow-hidden">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        <div className="relative z-10 flex items-center justify-between w-full">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold backdrop-blur-md ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
          {trip.weatherForecast && (
            <WeatherBadge
              temperature={trip.weatherForecast.averageTemp}
              condition="Previsto"
            />
          )}
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="flex flex-col p-4 gap-2 flex-1 justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors">
              {trip.destination.name}
            </h3>
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(trip.id);
                }}
                className="p-1 rounded-md text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                title="Excluir viagem"
                aria-label={`Excluir viagem para ${trip.destination.name}`}
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            )}
          </div>
          <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">date_range</span>
            {trip.period.startDate} até {trip.period.endDate} • {trip.period.totalDays} dias
          </p>
        </div>

        {/* Tags de Preferências */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-surface-container">
          <span className="px-2 py-0.5 rounded-md bg-surface-container text-[10px] font-semibold text-on-surface-variant uppercase">
            Ritmo: {trip.config.pace}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-surface-container text-[10px] font-semibold text-on-surface-variant uppercase">
            Orçamento: {trip.config.budget}
          </span>
          {trip.config.interests.slice(0, 2).map((item, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-secondary-container/40 text-[10px] font-medium text-on-secondary-container"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
