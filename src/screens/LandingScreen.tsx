import React from 'react';
import { ScreenType, DemoStateType } from '../types';
import { Button } from '../components/common/Button';
import { MOCK_TRIP_DETAILS } from '../data/mockData';
import { ActivityCard } from '../components/trips/ActivityCard';
import { WeatherBadge } from '../components/trips/WeatherBadge';
import { SkeletonLoader } from '../components/common/SkeletonLoader';

interface LandingScreenProps {
  onNavigate: (screen: ScreenType) => void;
  demoState?: DemoStateType;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onNavigate, demoState = 'normal' }) => {
  if (demoState === 'loading') {
    return (
      <div className="flex flex-col w-full max-w-4xl mx-auto gap-6 py-12 px-4">
        <SkeletonLoader type="line" count={4} />
        <SkeletonLoader type="card" count={2} />
      </div>
    );
  }

  if (demoState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center gap-4">
        <span className="material-symbols-outlined text-4xl text-error">cloud_off</span>
        <h2 className="text-xl font-bold text-on-surface">Falha ao carregar destaques da landing page</h2>
        <p className="text-sm text-on-surface-variant">Modo de demonstração de erro ativo.</p>
        <Button variant="primary" onClick={() => onNavigate('/')}>Recarregar</Button>
      </div>
    );
  }

  const demoDay = MOCK_TRIP_DETAILS.itinerary[0];

  return (
    <div className="flex flex-col w-full text-left pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-14 px-2">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex flex-col gap-4 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/80 text-on-secondary text-xs font-semibold w-fit">
              <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
              Assistente de Viagens Inteligente
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-on-surface leading-[1.15]">
              Roteiros sob medida para o{' '}
              <span className="text-primary underline decoration-secondary decoration-4">
                tempo real
              </span>{' '}
              que você tem.
            </h1>

            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              O SmartTrip une seus períodos de folga, dados meteorológicos e inteligência contextual do Google Gemini para criar itinerários dia a dia com curadoria humana total.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => onNavigate('/register')}
                icon={<span className="material-symbols-outlined text-[20px]">flight_takeoff</span>}
              >
                Começar Gratuitamente
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate('/login')}
              >
                Já tenho conta
              </Button>
            </div>

            <div className="flex items-center gap-4 pt-4 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                Sem cartão de crédito
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                Curadoria 100% editável
              </span>
            </div>
          </div>

          {/* Card Flutuante de Demonstração */}
          <div className="flex-1 w-full max-w-md">
            <div className="p-4 rounded-3xl bg-surface-container border border-outline/30 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-primary uppercase">Demonstração Interativa</span>
                  <h3 className="text-base font-black text-on-surface">{MOCK_TRIP_DETAILS.destination.name}</h3>
                </div>
                <WeatherBadge temperature={28} condition="Ensolarado" />
              </div>

              <div className="p-3 rounded-2xl bg-surface-container-low border border-outline/20">
                <span className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1 mb-2">
                  <span className="material-symbols-outlined text-[14px]">wb_sunny</span>
                  {demoDay.theme}
                </span>
                <ActivityCard activity={demoDay.shifts.afternoon[0]} />
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigate('/explore')}
                className="w-full"
              >
                Testar Gerador de Viagem
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pilares de Valor */}
      <section className="py-12 border-t border-surface-container">
        <div className="max-w-4xl mx-auto px-2">
          <div className="text-center max-w-xl mx-auto mb-8 flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-on-surface">Planejar uma viagem não deveria levar 8 horas</h2>
            <p className="text-xs sm:text-sm text-on-surface-variant">Três pilares projetados para economizar seu tempo e evitar imprevistos.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-surface-container-low border border-outline/20 flex flex-col gap-2.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">calendar_month</span>
              </div>
              <h3 className="text-sm font-bold text-on-surface">Folgas e Feriados Reais</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Cadastre seus feriados prolongados e férias. O roteiro é gerado precisamente no intervalo disponível.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-low border border-outline/20 flex flex-col gap-2.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">thermostat</span>
              </div>
              <h3 className="text-sm font-bold text-on-surface">Previsão Climática</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Passeios ao ar livre em dias de sol e atrações fechadas ou museus em dias com previsão de chuva.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-low border border-outline/20 flex flex-col gap-2.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">edit_note</span>
              </div>
              <h3 className="text-sm font-bold text-on-surface">Curadoria Humana Total</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                A IA monta o rascunho em segundos, mas você edita, reordena, exclui e adiciona o que preferir.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
