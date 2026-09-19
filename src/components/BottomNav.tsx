import React from 'react';
import { ScreenType } from '../types';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const tabs = [
    { id: 'home' as ScreenType, label: 'Início', icon: 'explore' },
    { id: 'new_trip' as ScreenType, label: 'Novo Roteiro', icon: 'auto_awesome' },
    { id: 'itinerary' as ScreenType, label: 'Meus Roteiros', icon: 'map' },
    { id: 'trip_details' as ScreenType, label: 'Explorar', icon: 'public' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-surface-container shadow-[0_-4px_20px_rgba(11,28,48,0.06)]">
      <div className="max-w-md mx-auto h-16 px-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = currentScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex-1 min-h-[48px] flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                isActive
                  ? 'text-on-surface font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface opacity-75 hover:opacity-100'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {tab.icon}
                </span>
                {isActive && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 bg-secondary-container rounded-full" />
                )}
              </div>
              <span className="font-label-sm text-label-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
