import React from 'react';
import { ScreenType, DemoStateType, UserProfile } from '../types';
import { Button } from '../components/common/Button';
import { TripCard } from '../components/trips/TripCard';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { MOCK_SAVED_TRIPS, MOCK_TIME_OFFS } from '../data/mockData';

interface DashboardScreenProps {
  user: UserProfile;
  onNavigate: (screen: ScreenType) => void;
  demoState?: DemoStateType;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  onNavigate,
  demoState = 'normal',
}) => {
  if (demoState === 'loading') {
    return (
      <div className="flex flex-col w-full gap-5 pb-20 text-left">
        <SkeletonLoader type="line" count={2} />
        <SkeletonLoader type="card" count={2} />
      </div>
    );
  }

  if (demoState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center gap-3 my-8 rounded-2xl bg-error/10 border border-error/20">
        <span className="material-symbols-outlined text-3xl text-error">error</span>
        <h3 className="text-base font-bold text-on-surface">Falha ao carregar dados do painel</h3>
        <p className="text-xs text-on-surface-variant">Modo de demonstração de erro ativo.</p>
        <Button variant="primary" size="sm" onClick={() => onNavigate('/dashboard')}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const trips = demoState === 'empty' ? [] : MOCK_SAVED_TRIPS;
  const timeOffs = demoState === 'empty' ? [] : MOCK_TIME_OFFS;
  const nextTrip = trips[0];

  return (
    <div className="flex flex-col w-full gap-6 pb-24 text-left">
      {/* Saudação e Header de Ação */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-surface-container-low border border-outline/30 shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container/60 text-on-secondary text-[11px] font-bold w-fit">
            <span className="material-symbols-outlined text-[14px]">flight_takeoff</span>
            Painel do Viajante
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">
            Olá, {user.name}! ✨
          </h1>
          <p className="text-xs text-on-surface-variant">
            Pronto para planejar sua próxima escapada sem complicação?
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => onNavigate('/explore')}
          icon={<span className="material-symbols-outlined text-[18px]">auto_awesome</span>}
          className="shrink-0"
        >
          Planejar Nova Viagem
        </Button>
      </section>

      {/* Grid Principal do Dashboard */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Coluna da Esquerda: Próxima Viagem (2 colunas) */}
        <section className="md:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">near_me</span>
              Próxima Viagem
            </h2>
            {trips.length > 0 && (
              <button
                onClick={() => onNavigate('/trips')}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Ver todas ({trips.length})
              </button>
            )}
          </div>

          {nextTrip ? (
            <TripCard
              trip={nextTrip}
              onSelect={(id) => onNavigate('/trips/[id]')}
            />
          ) : (
            <EmptyState
              icon="luggage"
              title="Nenhuma viagem planejada ainda"
              description="Escolha um destino e aproveite suas próximas folgas com um roteiro gerado em segundos."
              actionLabel="Criar Meu Primeiro Roteiro"
              onAction={() => onNavigate('/explore')}
            />
          )}
        </section>

        {/* Coluna da Direita: Folgas Ativas (1 coluna) */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">event_available</span>
              Suas Folgas Ativas
            </h2>
            <button
              onClick={() => onNavigate('/availability')}
              className="text-xs font-semibold text-secondary hover:underline"
            >
              Gerenciar
            </button>
          </div>

          {timeOffs.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {timeOffs.map((to) => (
                <div
                  key={to.id}
                  className="p-3.5 rounded-2xl bg-surface-container-low border border-outline/30 flex flex-col gap-1.5 hover:border-secondary transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface">{to.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container/40 text-[10px] font-bold text-on-secondary">
                      {to.durationDays} dias
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    {to.startDate} a {to.endDate}
                  </p>
                  <button
                    onClick={() => onNavigate('/explore')}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 mt-1"
                  >
                    <span>Viajar nesta data</span>
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="event_busy"
              title="Sem folgas cadastradas"
              description="Cadastre seus próximos feriados ou férias para que o SmartTrip monte roteiros com precisão."
              actionLabel="+ Cadastrar Folga"
              onAction={() => onNavigate('/availability')}
            />
          )}
        </section>
      </div>
    </div>
  );
};
