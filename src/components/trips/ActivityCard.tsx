import React, { useState } from 'react';
import { Activity } from '../../types';

export interface ActivityCardProps {
  activity: Activity;
  onUpdate?: (updated: Activity) => void;
  onDelete?: (id: string) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(activity.title);
  const [editDescription, setEditDescription] = useState(activity.description);
  const [editTime, setEditTime] = useState(activity.suggestedTime || '09:00');

  const categoryStyles: Record<string, { label: string; color: string; icon: string }> = {
    culture: { label: 'Cultura', color: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300', icon: 'museum' },
    food: { label: 'Gastronomia', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300', icon: 'restaurant' },
    nature: { label: 'Natureza', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300', icon: 'park' },
    leisure: { label: 'Lazer', color: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300', icon: 'attractions' },
    transport: { label: 'Transporte', color: 'bg-slate-500/15 text-slate-700 dark:text-slate-300', icon: 'flight_takeoff' },
    other: { label: 'Passeio', color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300', icon: 'explore' },
  };

  const currentCategory = categoryStyles[activity.category] || categoryStyles.other;

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        ...activity,
        title: editTitle,
        description: editDescription,
        suggestedTime: editTime,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(activity.title);
    setEditDescription(activity.description);
    setEditTime(activity.suggestedTime || '09:00');
    setIsEditing(false);
  };

  return (
    <div className="relative flex flex-col p-4 rounded-2xl bg-surface-container-low border border-outline/30 shadow-xs hover:border-outline/60 transition-all duration-200 text-left gap-2.5">
      {isEditing ? (
        // Modo Edição Inline (Human-in-the-Loop)
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-primary tracking-wider">
              Editando Atividade
            </span>
            <input
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className="text-xs px-2 py-1 rounded-lg border border-outline/40 bg-surface-container"
            />
          </div>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full text-sm font-bold px-2.5 py-1.5 rounded-lg border border-primary/50 bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Título da atração"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={2}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-outline/40 bg-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Descrição ou dicas"
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={handleCancel}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-primary text-on-primary shadow-xs"
            >
              Confirmar
            </button>
          </div>
        </div>
      ) : (
        // Modo Visualização Padrão
        <>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-surface-container-highest text-[11px] font-bold text-on-surface">
                {activity.suggestedTime || 'Horário flexível'}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${currentCategory.color}`}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {currentCategory.icon}
                </span>
                {currentCategory.label}
              </span>
            </div>

            {/* Ações Rápidas de Curadoria Humana */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded transition-colors"
                title="Editar esta atividade"
                aria-label={`Editar ${activity.title}`}
              >
                <span className="material-symbols-outlined text-[17px]">edit</span>
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(activity.id)}
                  className="p-1 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"
                  title="Remover do roteiro"
                  aria-label={`Excluir ${activity.title}`}
                >
                  <span className="material-symbols-outlined text-[17px]">delete</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <h4 className="text-sm font-bold text-on-surface leading-snug">
              {activity.title}
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {activity.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-on-surface-variant/80 border-t border-surface-container/60">
            {activity.estimatedDuration && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {activity.estimatedDuration}
              </span>
            )}
            {activity.estimatedCost && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">payments</span>
                {activity.estimatedCost}
              </span>
            )}
            {activity.locationName && (
              <span className="flex items-center gap-1 text-primary">
                <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                {activity.locationName}
              </span>
            )}
          </div>

          {activity.tips && (
            <div className="p-2 rounded-xl bg-surface-container-high/60 border border-outline/20 text-[11px] text-on-surface flex items-start gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-secondary shrink-0 mt-0.5">
                lightbulb
              </span>
              <span className="leading-snug">{activity.tips}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
