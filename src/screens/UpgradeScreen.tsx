import React, { useState } from 'react';
import { ScreenType } from '../types';
import { IMAGES } from '../data/mockData';

interface UpgradeScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export const UpgradeScreen: React.FC<UpgradeScreenProps> = ({ onNavigate }) => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="flex flex-col w-full pb-20">
      <div className="flex flex-col items-center text-center mt-1 mb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary mb-3 shadow-xs">
          <span
            className="material-symbols-outlined text-[16px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <span className="font-label-sm text-label-sm tracking-wider uppercase font-bold">
            Potencialize suas viagens com IA
          </span>
        </div>

        <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight max-w-xs mb-2 leading-tight font-bold">
          Desbloqueie Roteiros Ilimitados & Ajustes em Tempo Real
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm px-2">
          Tenha a IA do SmartTrip reajustando automaticamente seus passeios com clima ao vivo,
          reservas e descontos exclusivos.
        </p>

        {/* Mensal / Anual Switch */}
        <div className="w-full max-w-xs mt-5 p-1 bg-surface-container rounded-full flex items-center shadow-inner relative border border-surface-container-high">
          <button
            type="button"
            onClick={() => setIsAnnual(false)}
            className={`flex-1 py-2 rounded-full font-label-md text-label-md transition-all duration-200 ${
              !isAnnual
                ? 'bg-surface-container-lowest text-on-surface font-bold shadow-xs'
                : 'text-on-surface-variant'
            }`}
          >
            Mensal
          </button>
          <button
            type="button"
            onClick={() => setIsAnnual(true)}
            className={`flex-1 py-2 rounded-full font-label-md text-label-md transition-all duration-200 flex items-center justify-center gap-1.5 ${
              isAnnual
                ? 'bg-surface-container-lowest text-on-surface font-bold shadow-xs'
                : 'text-on-surface-variant'
            }`}
          >
            <span>Anual</span>
            <span className="bg-secondary text-on-secondary text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              -25%
            </span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full">
        {/* Card SmartTrip PRO */}
        <div className="relative bg-surface-container-lowest rounded-2xl p-5 shadow-xl border border-secondary-container/30 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-gradient-to-br from-secondary-container/20 to-on-tertiary-container/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary shadow-sm">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  travel_explore
                </span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface leading-tight font-bold">
                  SmartTrip PRO
                </h3>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Experiência definitiva
                </span>
              </div>
            </div>
            <span className="bg-secondary-container text-on-secondary font-label-sm text-label-sm px-2.5 py-1 rounded-full uppercase tracking-wider font-bold shadow-xs">
              Mais Popular
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 my-3">
            {isAnnual && (
              <span className="font-body-md text-body-md text-outline line-through">
                R$ 39,90
              </span>
            )}
            <div className="flex items-baseline">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">R$</span>
              <span className="font-display-lg-mobile text-display-lg-mobile text-on-surface font-extrabold tracking-tight ml-0.5">
                {isAnnual ? '29,90' : '39,90'}
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">/mês</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface-variant font-label-md text-label-md mb-4 w-fit">
            <span
              className="material-symbols-outlined text-secondary-container text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span>
              {isAnnual
                ? 'Faturado R$ 358,80/ano • 7 dias grátis'
                : 'Cobrança mensal recorrente • Cancele quando quiser'}
            </span>
          </div>

          <div className="space-y-2.5 pt-1 pb-4">
            {[
              'Roteiros ilimitados no mundo inteiro',
              'Adaptação automática ao clima em tempo real',
              'Concierge IA 24/7 para reservas e gastronomia',
              'Modo Offline e Exportação PDF de alta fidelidade',
              'Colaboração em grupo (até 10 viajantes)',
              'Até 15% de desconto em experiências parceiras',
            ].map((feature) => (
              <div key={feature} className="flex items-start gap-2.5">
                <span
                  className="material-symbols-outlined text-secondary-container text-[18px] shrink-0 mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span className="font-body-md text-body-md text-on-surface font-medium">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onNavigate('checkout')}
            className="w-full h-12 rounded-xl bg-secondary-container hover:bg-secondary text-on-secondary font-label-lg text-label-lg font-bold shadow-md active:scale-[0.99] flex items-center justify-center gap-2 transition-all"
          >
            <span>Iniciar Teste Grátis de 7 Dias</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
          <p className="font-body-sm text-body-sm text-center text-on-surface-variant mt-2.5">
            Cancele a qualquer momento com apenas 1 clique.
          </p>
        </div>

        {/* Passe Viagem Única */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">airplane_ticket</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Passe Viagem Única
                </h3>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Sem assinatura mensal
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight">
                R$ 29,90
              </div>
              <div className="font-label-sm text-label-sm text-on-surface-variant">
                Pagamento único
              </div>
            </div>
          </div>

          <div className="space-y-2 py-2 mb-4">
            {[
              '1 Roteiro inteligente 100% completo',
              'Exportação PDF offline para celular',
              'Sincronização com Google Agenda & Apple',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-outline text-[16px]">check</span>
                <span className="font-body-md text-body-md">{item}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onNavigate('checkout')}
            className="w-full h-11 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold transition-colors active:scale-[0.99]"
          >
            Selecionar Este
          </button>
        </div>
      </div>

      {/* Social Proof & Testimonial */}
      <div className="mt-6 flex flex-col gap-3">
        <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-container flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-secondary-container">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
              ))}
              <span className="font-label-md text-label-md font-bold text-on-surface ml-1">
                4.9/5
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              +12.000 viajantes ativos
            </span>
          </div>

          <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-xl">
            <img
              src={IMAGES.mariana}
              alt="Mariana S."
              className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-surface-container-highest"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <p className="font-body-sm text-body-sm text-on-surface italic line-clamp-2">
                “Economizei mais de 10 horas organizando minha viagem a Salvador e Paris!”
              </p>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                Mariana S. • Nômade Digital
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 py-2 text-on-surface-variant">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-outline">lock</span>
            <span className="font-label-sm text-label-sm font-medium">Pagamento Criptografado</span>
          </div>
          <span className="text-outline">•</span>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-outline">shield</span>
            <span className="font-label-sm text-label-sm font-medium">Garantia Incondicional</span>
          </div>
        </div>
      </div>
    </div>
  );
};
