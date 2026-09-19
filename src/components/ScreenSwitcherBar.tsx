import React, { useState } from 'react';
import { ScreenType } from '../types';

interface ScreenSwitcherBarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const ScreenSwitcherBar: React.FC<ScreenSwitcherBarProps> = ({
  currentScreen,
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const screens: { id: ScreenType; label: string; icon: string; category: string }[] = [
    { id: 'home', label: '1. Início', icon: 'explore', category: 'Principal' },
    { id: 'new_trip', label: '2. Novo Roteiro', icon: 'auto_awesome', category: 'Criação' },
    { id: 'itinerary', label: '3. Meus Roteiros', icon: 'map', category: 'Itinerário' },
    { id: 'trip_details', label: '4. Detalhes Roteiro', icon: 'folder_shared', category: 'Itinerário' },
    { id: 'upgrade', label: '5. Plano Upgrade', icon: 'stars', category: 'Assinatura' },
    { id: 'checkout', label: '6. Checkout Seguro', icon: 'credit_card', category: 'Assinatura' },
    { id: 'success', label: '7. Sucesso PRO', icon: 'verified', category: 'Assinatura' },
    { id: 'login', label: '8. Login', icon: 'login', category: 'Conta' },
    { id: 'register', label: '9. Cadastro', icon: 'person_add', category: 'Conta' },
    { id: 'forgot_password', label: '10. Recuperar Senha', icon: 'vpn_key', category: 'Conta' },
  ];

  return (
    <div className="w-full bg-primary-container text-white text-xs border-b border-white/10 z-50 relative">
      <div className="max-w-4xl mx-auto px-3 py-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="font-label-sm font-semibold uppercase tracking-wider text-[#bec6e0] shrink-0 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
            Telas do App:
          </span>
          {screens.map((s) => (
            <button
              key={s.id}
              onClick={() => onNavigate(s.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                currentScreen === s.id
                  ? 'bg-secondary-container text-on-secondary font-semibold shadow-sm'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="shrink-0 p-1 text-white/70 hover:text-white rounded hover:bg-white/10 md:hidden"
          title="Ver lista de telas"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isOpen ? 'expand_less' : 'menu_open'}
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="p-3 bg-surface-container-lowest text-on-surface border-b border-surface-container shadow-lg md:hidden">
          <p className="font-label-sm text-on-surface-variant mb-2">Navegue pelas 10 telas desenhadas:</p>
          <div className="grid grid-cols-2 gap-2">
            {screens.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  onNavigate(s.id);
                  setIsOpen(false);
                }}
                className={`p-2 rounded-lg text-left flex items-center gap-2 text-xs transition-colors ${
                  currentScreen === s.id
                    ? 'bg-secondary-container text-on-secondary font-bold'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
                <span className="truncate">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
