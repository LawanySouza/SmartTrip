import React, { useState } from 'react';
import { ScreenType, UserProfile } from '../types';
import { IMAGES, SAVED_TRIPS, TRENDING_DESTINATIONS } from '../data/mockData';

interface HomeScreenProps {
  user: UserProfile;
  onNavigate: (screen: ScreenType) => void;
  onSelectDestination?: (dest: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  onNavigate,
  onSelectDestination,
}) => {
  const [promptText, setPromptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);

  const handleChipClick = (suggestion: string) => {
    setPromptText(`Roteiro focado em ${suggestion} para 4 dias`);
  };

  const handleGenerate = () => {
    if (!promptText.trim()) {
      setPromptText('5 dias em Salvador com cultura, praias e gastronomia típica');
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      if (onSelectDestination) {
        onSelectDestination(promptText);
      }
      onNavigate('new_trip');
    }, 1200);
  };

  const handleSelectTrip = (tripId: string) => {
    if (tripId === 'rio') {
      onNavigate('itinerary');
    } else {
      onNavigate('trip_details');
    }
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-24">
      {/* Greeting & Mood do Viajante */}
      <section className="flex flex-col gap-1.5 pt-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container w-fit shadow-xs">
          <span className="material-symbols-outlined text-[16px] text-secondary">
            flight_takeoff
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Modo Explorador Ativo
          </span>
        </div>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface tracking-tight">
          Olá, {user.name}! ✨
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Onde será sua próxima aventura extraordinária?
        </p>
      </section>

      {/* Card Destaque Assistente IA Generativo */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container-highest via-surface-container to-surface-container-high p-4 sm:p-5 shadow-sm border border-surface-container-high/80">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-secondary-container/15 blur-2xl pointer-events-none" />
        <div className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full bg-on-tertiary-container/15 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center shadow-xs text-secondary">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
              </div>
              <div>
                <span className="font-headline-sm text-headline-sm text-on-surface block leading-tight">
                  Planejar com IA
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Roteiros sob medida em segundos
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest text-secondary font-label-sm text-label-sm shadow-xs font-semibold">
              Pro v2.4
            </span>
          </div>

          {/* Quick Prompt Input Box */}
          <div className="flex flex-col gap-1.5 pt-1">
            <label
              htmlFor="ai-prompt-input"
              className="font-label-md text-label-md text-on-surface-variant"
            >
              Descreva sua ideia de viagem
            </label>
            <div className="relative flex items-center bg-surface-container-lowest rounded-xl p-1.5 shadow-xs border border-surface-container-high/50 focus-within:ring-2 focus-within:ring-secondary-container/30 transition-all">
              <span className="material-symbols-outlined text-on-surface-variant pl-2 text-[20px]">
                near_me
              </span>
              <input
                id="ai-prompt-input"
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="Ex: 5 dias em Buenos Aires com gastronomia e tango..."
                className="w-full bg-transparent px-2.5 py-2 text-on-surface font-body-sm text-body-sm focus:outline-none placeholder:text-outline"
              />
              <button
                type="button"
                id="btn-voice-prompt"
                onClick={() => {
                  setIsMicActive(!isMicActive);
                  if (!promptText) {
                    setPromptText('7 dias de roadtrip pela Costa Amalfitana e Capri...');
                  }
                }}
                aria-label="Gravar comando de voz"
                className={`min-h-[38px] min-w-[38px] rounded-lg flex items-center justify-center transition-all ${
                  isMicActive
                    ? 'bg-secondary-container text-on-secondary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>
            </div>
          </div>

          {/* Quick Chips Sugestões */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
            {[
              { label: 'Rota Gastronômica', icon: '✨' },
              { label: 'Escapada de Fim de Semana', icon: '🏖️' },
              { label: 'Mochilão Econômico', icon: '🎒' },
              { label: 'Cultura & Museus', icon: '🏛️' },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleChipClick(chip.label)}
                className="quick-chip whitespace-nowrap px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm shadow-xs active:scale-95 transition-all border border-surface-container"
              >
                {chip.icon} {chip.label}
              </button>
            ))}
          </div>

          {/* CTA Principal IA */}
          <button
            type="button"
            id="btn-generate-ai"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full min-h-[48px] rounded-xl bg-secondary-container hover:bg-secondary text-on-secondary flex items-center justify-center gap-2 font-label-lg text-label-lg shadow-md active:scale-[0.99] transition-all disabled:opacity-80"
          >
            {isGenerating ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">
                  progress_activity
                </span>
                <span>Sintetizando seu roteiro personalizado...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">
                  temp_preferences_custom
                </span>
                <span>Criar Novo Roteiro Inteligente</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Próxima Viagem (Card de Status Vivo) */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              flight
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Próxima Viagem
            </h2>
          </div>
          <span className="font-label-sm text-label-sm text-secondary font-semibold bg-secondary-fixed/50 px-2 py-0.5 rounded-full">
            Em 14 dias
          </span>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col group">
          {/* Imagem Header Card com Badge */}
          <div
            className="relative w-full h-36 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.02]"
            style={{ backgroundImage: `url('${IMAGES.rioSunset}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                Roteiro Pronto
              </span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
              <div>
                <h3 className="font-headline-md text-headline-md leading-tight text-white drop-shadow font-bold">
                  Rio de Janeiro
                </h3>
                <p className="font-label-sm text-label-sm text-white/90">
                  12 a 16 de Novembro • 5 dias
                </p>
              </div>
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-white font-label-sm text-label-sm">
                <span
                  className="material-symbols-outlined text-[16px] text-secondary-fixed-dim"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  wb_sunny
                </span>
                <span>27°C</span>
              </div>
            </div>
          </div>

          {/* Métricas e Barra de Progresso do Roteiro */}
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between font-label-sm text-label-sm">
              <span className="text-on-surface-variant flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">
                  checklist
                </span>
                Planejamento Concluído
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                85%
              </span>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
              <div
                className="h-full rounded-full bg-secondary-container transition-all duration-700"
                style={{ width: '85%' }}
              />
            </div>

            {/* Quick Summary Chips */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2 rounded-xl bg-surface-container flex flex-col items-center justify-center text-center">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Atividades
                </span>
                <span className="font-label-lg text-label-lg text-on-surface font-bold">
                  14 spots
                </span>
              </div>
              <div className="p-2 rounded-xl bg-surface-container flex flex-col items-center justify-center text-center">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Est. Gasto
                </span>
                <span className="font-label-lg text-label-lg text-on-surface font-bold">
                  R$ 2.450
                </span>
              </div>
              <div className="p-2 rounded-xl bg-surface-container flex flex-col items-center justify-center text-center">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Reservas
                </span>
                <span className="font-label-lg text-label-lg text-secondary font-bold">
                  3 pendentes
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('itinerary')}
              className="w-full min-h-[44px] rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all font-semibold"
            >
              <span>Abrir Cronograma Diário</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Roteiros Recentes (Carrossel Horizontal Snap) */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              history_edu
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Roteiros Salvos
            </h2>
          </div>
          <button
            onClick={() => onNavigate('itinerary')}
            className="font-label-sm text-label-sm text-secondary flex items-center gap-0.5 font-semibold hover:underline"
          >
            <span>Ver todos</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        {/* Lista Horizontal */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 snap-x snap-mandatory">
          {/* Card 1: Lisboa */}
          <div
            onClick={() => handleSelectTrip('lisboa')}
            className="snap-start flex-shrink-0 w-64 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container overflow-hidden flex flex-col cursor-pointer active:scale-98 transition-transform"
          >
            <div
              className="h-28 w-full bg-cover bg-center relative"
              style={{ backgroundImage: `url('${IMAGES.lisbon}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-surface-container-lowest/90 font-label-sm text-label-sm text-on-surface font-semibold shadow-xs">
                7 Dias
              </span>
              <span className="absolute bottom-2 left-2.5 font-headline-sm text-headline-sm text-white font-bold drop-shadow">
                Lisboa Histórica
              </span>
            </div>
            <div className="p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                <span className="flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    euro
                  </span>
                  Médio (€ 120/dia)
                </span>
                <span className="flex items-center gap-0.5 text-on-surface font-semibold">
                  <span
                    className="material-symbols-outlined text-[15px] text-secondary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  4.9
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                Miradouros, rota dos pastéis de Belém, passeios a pé em Alfama e Sintra.
              </p>
            </div>
          </div>

          {/* Card 2: Santiago */}
          <div
            onClick={() => handleSelectTrip('santiago')}
            className="snap-start flex-shrink-0 w-64 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container overflow-hidden flex flex-col cursor-pointer active:scale-98 transition-transform"
          >
            <div
              className="h-28 w-full bg-cover bg-center relative"
              style={{ backgroundImage: `url('${IMAGES.santiago}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-surface-container-lowest/90 font-label-sm text-label-sm text-on-surface font-semibold shadow-xs">
                4 Dias
              </span>
              <span className="absolute bottom-2 left-2.5 font-headline-sm text-headline-sm text-white font-bold drop-shadow">
                Santiago & Vinhedos
              </span>
            </div>
            <div className="p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                <span className="flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    payments
                  </span>
                  Econômico
                </span>
                <span className="flex items-center gap-0.5 text-on-surface font-semibold">
                  <span
                    className="material-symbols-outlined text-[15px] text-secondary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  4.8
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                Degustação no Valle del Maipo, Sky Costanera e gastronomia de Bellavista.
              </p>
            </div>
          </div>

          {/* Card 3: Tóquio & Kyoto */}
          <div
            onClick={() => handleSelectTrip('kyoto')}
            className="snap-start flex-shrink-0 w-64 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container overflow-hidden flex flex-col cursor-pointer active:scale-98 transition-transform"
          >
            <div
              className="h-28 w-full bg-cover bg-center relative"
              style={{ backgroundImage: `url('${IMAGES.kyoto}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-surface-container-lowest/90 font-label-sm text-label-sm text-on-surface font-semibold shadow-xs">
                10 Dias
              </span>
              <span className="absolute bottom-2 left-2.5 font-headline-sm text-headline-sm text-white font-bold drop-shadow">
                Tóquio & Kyoto
              </span>
            </div>
            <div className="p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                <span className="flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    wallet
                  </span>
                  Premium
                </span>
                <span className="flex items-center gap-0.5 text-on-surface font-semibold">
                  <span
                    className="material-symbols-outlined text-[15px] text-secondary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  5.0
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                Templos ancestrais, Shinkansen de alta velocidade e cafés futuristas em Shibuya.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Inspirações da IA (Tendências com Badges) */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-secondary text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              travel_explore
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Tendências Recomendadas para Você
            </h2>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Baseado em suas viagens culturais recentes e preferências climáticas.
          </p>
        </div>

        {TRENDING_DESTINATIONS.map((trend) => (
          <div
            key={trend.id}
            onClick={() => {
              if (onSelectDestination) onSelectDestination(trend.title);
              onNavigate('new_trip');
            }}
            className="p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container flex gap-3.5 items-center active:scale-[0.99] transition-all cursor-pointer hover:border-secondary-container/40"
          >
            <div
              className="w-20 h-20 rounded-xl bg-cover bg-center flex-shrink-0 relative overflow-hidden shadow-xs"
              style={{ backgroundImage: `url('${trend.imageUrl}')` }}
            />
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-headline-sm text-headline-sm text-on-surface truncate font-bold">
                  {trend.title}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm whitespace-nowrap">
                  {trend.temp}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
                {trend.desc}
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium">
                  {trend.discount}
                </span>
                <span className="text-secondary font-label-sm text-label-sm font-semibold flex items-center ml-auto">
                  Explorar Rota <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
