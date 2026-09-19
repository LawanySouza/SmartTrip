import React, { useState } from 'react';
import { ScreenType } from '../types';
import { IMAGES, WEATHER_FORECAST, SALVADOR_TIMELINE_DAY2 } from '../data/mockData';

interface ItineraryScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export const ItineraryScreen: React.FC<ItineraryScreenProps> = ({ onNavigate }) => {
  const [selectedDay, setSelectedDay] = useState(2);
  const [showToast, setShowToast] = useState<string | null>(null);

  const days = [
    { num: 1, label: 'Dia 1 • Chegada' },
    { num: 2, label: 'Dia 2 • Pelourinho & Farol' },
    { num: 3, label: 'Dia 3 • Itapuã' },
    { num: 4, label: 'Dia 4 • Museus' },
    { num: 5, label: 'Dia 5 • Ilha dos Frades' },
    { num: 6, label: 'Dia 6 • Despedida' },
  ];

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 2500);
  };

  return (
    <div className="flex flex-col w-full gap-4 pb-28 relative">
      {/* Toast alert */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-on-primary px-4 py-2 rounded-full font-label-md text-label-md shadow-lg flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-[18px] text-secondary-container">
            check_circle
          </span>
          <span>{showToast}</span>
        </div>
      )}

      {/* Header Card */}
      <section className="flex flex-col gap-2.5 bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-tertiary-container">
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <span className="font-label-sm text-label-sm tracking-wide uppercase font-bold">
              Roteiro Otimizado por IA
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onNavigate('trip_details')}
              className="px-2.5 py-1 text-xs font-label-sm font-semibold rounded-full bg-surface-container text-secondary hover:bg-surface-variant flex items-center gap-1"
              title="Ver detalhes de colaboração e orçamento"
            >
              <span className="material-symbols-outlined text-[14px]">tune</span>
              <span>Ajustes</span>
            </button>
            <button
              type="button"
              onClick={() => triggerToast('Link de compartilhamento copiado!')}
              aria-label="Compartilhar roteiro"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container text-on-surface-variant active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
            Salvador Cultural & Praias
          </h2>
          <div className="flex items-center gap-2 text-on-surface-variant flex-wrap pt-0.5">
            <span className="font-label-md text-label-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                calendar_today
              </span>
              6 Dias
            </span>
            <span className="inline-block w-1 h-1 rounded-full bg-outline-variant" />
            <span className="font-label-md text-label-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                payments
              </span>
              R$ 2.280 estimado
            </span>
            <span className="inline-block w-1 h-1 rounded-full bg-outline-variant" />
            <span className="font-label-md text-label-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                place
              </span>
              18 atrações próximas
            </span>
          </div>
        </div>
      </section>

      {/* Widget Clima Integrado */}
      <section className="flex flex-col gap-2.5 bg-surface-container-low p-4 rounded-2xl shadow-xs border border-surface-container">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1.5 font-semibold">
            <span className="material-symbols-outlined text-[18px] text-on-tertiary-container">
              partly_cloudy_day
            </span>
            Previsão Dinâmica em Salvador
          </span>
          <span className="font-label-sm text-label-sm text-secondary font-bold bg-secondary-fixed/50 px-2 py-0.5 rounded-full">
            IA Ativa
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {WEATHER_FORECAST.map((w, idx) => {
            const isHighlight = idx === 1; // Quarta
            return (
              <div
                key={w.dayName}
                className={`flex flex-col items-center justify-center p-2 rounded-xl shadow-xs transition-all ${
                  isHighlight
                    ? 'bg-surface-container-highest border border-secondary-container/40 ring-1 ring-secondary-container/30'
                    : 'bg-surface-container-lowest border border-surface-container'
                }`}
              >
                <span
                  className={`font-label-sm text-label-sm ${
                    isHighlight ? 'text-on-surface font-bold' : 'text-on-surface-variant'
                  }`}
                >
                  {w.dayName}
                </span>
                <span className="material-symbols-outlined text-[20px] text-secondary my-1">
                  {w.icon}
                </span>
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  {w.temp}°C
                </span>
              </div>
            );
          })}
        </div>

        {/* Notificação Clima IA */}
        <div className="flex items-start gap-2 bg-tertiary-fixed text-on-tertiary-fixed p-3 rounded-xl border border-on-tertiary-container/20">
          <span className="material-symbols-outlined text-[18px] text-on-tertiary-container mt-0.5 shrink-0">
            psychology
          </span>
          <p className="font-body-sm text-body-sm leading-snug">
            <strong className="font-semibold text-on-tertiary-fixed">
              Ajuste inteligente de Quinta-Feira:
            </strong>{' '}
            Chuva prevista. Realocamos museus para ambientes fechados e antecipamos a praia para
            Quarta!
          </p>
        </div>
      </section>

      {/* Abas Seletor de Dias */}
      <section className="overflow-x-auto -mx-4 px-4 no-scrollbar">
        <div className="flex items-center gap-2 min-w-max pb-1" id="day-selector">
          {days.map((d) => {
            const isActive = selectedDay === d.num;
            return (
              <button
                key={d.num}
                type="button"
                onClick={() => setSelectedDay(d.num)}
                className={`px-4 py-2 rounded-full font-label-md text-label-md shadow-xs active:scale-95 transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary text-on-primary font-bold shadow-md'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-surface-container'
                }`}
              >
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
                )}
                {d.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Map Preview Resumo */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-surface-container group">
        <div
          className="w-full h-36 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url('${IMAGES.salvadorMap}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-container/90 via-transparent to-transparent flex items-end p-3.5">
          <div className="flex items-center justify-between w-full">
            <span className="text-on-primary font-label-md text-label-md flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-[18px] text-secondary-fixed">
                route
              </span>
              Trajeto do Dia {selectedDay}: 4 paradas (5.4 km)
            </span>
            <span className="bg-surface-container-lowest/90 backdrop-blur text-on-surface font-label-sm text-label-sm px-2.5 py-1 rounded-full font-bold">
              ± 22 min caminhada
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Dia 2 */}
      <div className="flex flex-col gap-4 relative pt-1">
        {SALVADOR_TIMELINE_DAY2.map((item, index) => {
          const isLast = index === SALVADOR_TIMELINE_DAY2.length - 1;
          return (
            <div key={item.id} className="flex gap-3.5">
              {/* Coluna do Horário */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-label-md text-label-md font-bold shadow-xs ${
                    item.time === '12h' || item.time === '17h'
                      ? 'bg-secondary-container text-on-secondary'
                      : 'bg-surface-container-highest text-on-surface'
                  }`}
                >
                  {item.time}
                </div>
                {!isLast && <div className="w-0.5 flex-1 bg-surface-container-high my-1.5" />}
              </div>

              {/* Card do Itinerário */}
              <div className="flex flex-col flex-1 bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container gap-2.5">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">
                    {item.badge}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">near_me</span>
                    {item.location}
                  </span>
                </div>

                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold leading-snug">
                  {item.title}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {item.subtitle}
                </p>

                {/* Rating / Price bar */}
                {item.price && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low text-on-surface">
                    <span className="font-body-sm text-body-sm flex items-center gap-1.5 text-on-surface-variant font-medium">
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        restaurant
                      </span>
                      {item.price}
                    </span>
                    <span className="font-label-sm text-label-sm text-secondary font-bold">
                      {item.tip}
                    </span>
                  </div>
                )}

                {/* Photo Tip Callout */}
                {item.id === 't3' && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary-container text-on-primary-container">
                    <span className="material-symbols-outlined text-[18px] text-on-tertiary-container shrink-0">
                      tips_and_updates
                    </span>
                    <span className="font-body-sm text-body-sm text-inverse-on-surface">
                      <strong>Dica de Foto:</strong> Suba no mirante lateral da Estação Superior
                      para enquadrar a baía e os saveiros.
                    </span>
                  </div>
                )}

                {/* Image if available */}
                {item.imageUrl && (
                  <div className="rounded-xl overflow-hidden h-32 w-full mt-1 relative group">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    {item.tip && (
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-container/85 via-transparent to-transparent flex items-end p-2.5">
                        <span className="text-on-primary font-label-sm text-label-sm font-medium">
                          • {item.tip}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 left-0 right-0 z-30 px-4 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className="flex items-center gap-2.5 p-1.5 rounded-full bg-surface-container-lowest/95 backdrop-blur-md shadow-xl border border-surface-container">
            <button
              type="button"
              onClick={() => triggerToast('Carregando mapa interativo com 4 paradas...')}
              className="flex-1 min-h-[48px] px-4 rounded-full bg-primary hover:bg-neutral-800 text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-2 active:scale-98 transition-all font-semibold"
            >
              <span className="material-symbols-outlined text-[20px]">map</span>
              <span>Ver Rota no Mapa</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('trip_details')}
              className="min-h-[48px] px-5 rounded-full bg-secondary-container hover:bg-secondary text-on-secondary font-label-lg text-label-lg flex items-center justify-center gap-1.5 active:scale-98 transition-all font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Personalizar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
