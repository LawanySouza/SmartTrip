import React from 'react';
import { ScreenType } from '../types';

interface SuccessScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col w-full pb-20 items-center text-center space-y-5 pt-4">
      {/* Celebration Badge & Icon */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary animate-bounce">
          <span
            className="material-symbols-outlined text-[48px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified
          </span>
        </div>
        <span className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-secondary-container text-on-secondary shadow-md flex items-center justify-center">
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
        </span>
      </div>

      <div className="flex flex-col gap-1 max-w-sm px-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold mx-auto mb-1">
          <span>Assinatura Ativada</span>
        </div>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface tracking-tight font-bold">
          Parabéns, Camila! ✨
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Seu plano <strong className="text-on-surface font-semibold">SmartTrip PRO</strong> está
          ativo com 7 dias grátis. Aproveite todo o poder da nossa IA de viagens!
        </p>
      </div>

      {/* Recibo Rápido / Voucher */}
      <div className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container text-left space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              receipt_long
            </span>
            <span className="font-label-md text-label-md text-on-surface font-bold">
              Comprovante do Pedido
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
            #ST-849204
          </span>
        </div>

        <div className="space-y-2 font-body-sm text-body-sm">
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant">Plano</span>
            <span className="font-semibold text-on-surface">Anual SmartTrip PRO</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant">Cobrado Hoje</span>
            <span className="font-bold text-secondary">R$ 0,00 (Período de Teste)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant">Primeira Cobrança</span>
            <span className="text-on-surface">Em 7 dias (R$ 338,80/ano)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant">Cartão Final</span>
            <span className="text-on-surface font-mono">•••• 4289</span>
          </div>
        </div>
      </div>

      {/* Grid de Benefícios Imediatos */}
      <div className="w-full grid grid-cols-2 gap-2 text-left">
        <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container flex flex-col gap-1">
          <span className="material-symbols-outlined text-secondary text-[22px]">explore</span>
          <span className="font-label-md text-label-md text-on-surface font-bold">
            Roteiros Ilimitados
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Sem restrições de cidades ou destinos.
          </span>
        </div>

        <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container flex flex-col gap-1">
          <span className="material-symbols-outlined text-secondary text-[22px]">cloud_sync</span>
          <span className="font-label-md text-label-md text-on-surface font-bold">
            Ajuste Climático
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Reorganização automática em caso de chuva.
          </span>
        </div>

        <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container flex flex-col gap-1">
          <span className="material-symbols-outlined text-secondary text-[22px]">download</span>
          <span className="font-label-md text-label-md text-on-surface font-bold">Modo Offline</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Mapas e PDFs salvos no aparelho.
          </span>
        </div>

        <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container flex flex-col gap-1">
          <span className="material-symbols-outlined text-secondary text-[22px]">group</span>
          <span className="font-label-md text-label-md text-on-surface font-bold">
            Colaboração PRO
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Até 10 amigos editando juntos.
          </span>
        </div>
      </div>

      {/* Ações */}
      <div className="w-full flex flex-col gap-2.5 pt-2">
        <button
          type="button"
          onClick={() => onNavigate('itinerary')}
          className="w-full h-12 rounded-xl bg-secondary-container hover:bg-secondary text-on-secondary font-label-lg text-label-lg font-bold shadow-md active:scale-[0.99] flex items-center justify-center gap-2 transition-all"
        >
          <span>Abrir Salvador Cultural & Praias</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('new_trip')}
          className="w-full h-12 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-lg text-label-lg font-semibold active:scale-[0.99] flex items-center justify-center gap-2 transition-all"
        >
          <span className="material-symbols-outlined text-[18px] text-secondary">
            auto_awesome
          </span>
          <span>Criar Outro Roteiro com IA</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="w-full py-2.5 text-on-surface-variant hover:text-on-surface font-label-md text-label-md font-medium"
        >
          Voltar para a Página Inicial
        </button>
      </div>
    </div>
  );
};
