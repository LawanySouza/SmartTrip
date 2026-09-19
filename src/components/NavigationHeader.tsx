import React from 'react';
import { ScreenType, UserProfile } from '../types';
import { IMAGES } from '../data/mockData';

interface NavigationHeaderProps {
  currentScreen: ScreenType;
  user: UserProfile;
  onNavigate: (screen: ScreenType) => void;
  onGoBack?: () => void;
  title?: string;
  showBack?: boolean;
  onLogout?: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentScreen,
  user,
  onNavigate,
  onGoBack,
  title,
  showBack,
  onLogout,
}) => {
  const isAuthScreen = currentScreen === 'login' || currentScreen === 'register' || currentScreen === 'forgot_password';

  const getScreenLabel = () => {
    if (title) return title;
    switch (currentScreen) {
      case 'home':
        return 'Início';
      case 'new_trip':
        return 'Novo Roteiro';
      case 'itinerary':
        return 'Meus Roteiros';
      case 'trip_details':
        return 'Detalhes Do Roteiro';
      case 'upgrade':
        return 'Plano Upgrade';
      case 'checkout':
        return 'Pagamento Checkout';
      case 'success':
        return 'Confirmacao Sucesso';
      case 'login':
        return 'Login';
      case 'register':
        return 'Cadastro';
      case 'forgot_password':
        return 'Recuperação';
      default:
        return 'SmartTrip';
    }
  };

  const handleBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      onNavigate('home');
    }
  };

  return (
    <header className="fixed top-0 w-full z-40 bg-surface/85 backdrop-blur-xl border-b border-surface-container-high/60 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-between">
        {/* Left Side: Back button + Logo + Title */}
        <div className="flex items-center gap-1.5 min-w-0">
          {showBack && (
            <button
              onClick={handleBack}
              aria-label="Voltar"
              className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
          )}

          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <img
              src={IMAGES.logo}
              alt="SmartTrip Logo"
              className="h-8 w-auto object-contain shrink-0"
              referrerPolicy="no-referrer"
            />
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight truncate font-bold">
              SmartTrip
            </span>
          </div>
        </div>

        {/* Right Side: Status/Title badge + Profile / Auth */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="font-label-md text-label-md text-on-surface-variant hidden xs:inline-block">
            {getScreenLabel()}
          </span>

          {isAuthScreen ? (
            <button
              onClick={() => onNavigate(currentScreen === 'login' ? 'register' : 'login')}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary active:scale-95 transition-transform"
              title="Alternar login/cadastro"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              {onLogout && (
                <button
                  onClick={onLogout}
                  aria-label="Sair da conta"
                  title="Sair"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                </button>
              )}
              <button
                onClick={() => onNavigate('/profile')}
                aria-label="Perfil de Usuário"
                className="relative p-0.5 rounded-full border-2 border-transparent hover:border-secondary-container active:scale-95 transition-all"
                title="Ver Perfil & Preferências"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover shadow-sm"
                  referrerPolicy="no-referrer"
                />
                {user.isPro && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-secondary-container border-2 border-surface rounded-full flex items-center justify-center">
                    <span className="w-1 h-1 bg-on-secondary rounded-full"></span>
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
