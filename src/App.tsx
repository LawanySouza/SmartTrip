/**
 * App.tsx — raiz da aplicação SmartTrip.
 * Integrado com AuthProvider e ProtectedRoute conforme SPEC_AUTH.md §5.
 *
 * Rotas privadas: home, new_trip, itinerary, trip_details, upgrade, checkout, success
 * Rotas públicas: login, register, forgot_password
 */
import React, { useState } from 'react';
import { ScreenType, UserProfile } from './types';
import { MOCK_USER } from './data/mockData';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { NavigationHeader } from './components/NavigationHeader';
import { BottomNav } from './components/BottomNav';
import { ScreenSwitcherBar } from './components/ScreenSwitcherBar';
import { HomeScreen } from './screens/HomeScreen';
import { NewTripScreen } from './screens/NewTripScreen';
import { ItineraryScreen } from './screens/ItineraryScreen';
import { TripDetailsScreen } from './screens/TripDetailsScreen';
import { UpgradeScreen } from './screens/UpgradeScreen';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { SuccessScreen } from './screens/SuccessScreen';
import { AvailabilityScreen } from './screens/AvailabilityScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';

// ── Inner App (tem acesso ao AuthContext) ────────────────────────────────────

function AppInner() {
  const { user: authUser, logout } = useAuth();

  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [history, setHistory] = useState<ScreenType[]>(['home']);
  const [selectedDestination, setSelectedDestination] = useState<string>('Salvador, Bahia, Brasil');

  // Usuário exibido no header: preferência para o perfil do Firebase Auth,
  // fallback para MOCK_USER durante o período de transição pré-Firebase
  const displayUser: UserProfile = authUser ?? MOCK_USER;

  const navigateTo = (newScreen: ScreenType) => {
    setHistory((prev) => [...prev, newScreen]);
    setCurrentScreen(newScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBack = () => {
    if (history.length > 1) {
      const nextHistory = [...history];
      nextHistory.pop();
      const previousScreen = nextHistory[nextHistory.length - 1];
      setHistory(nextHistory);
      setCurrentScreen(previousScreen);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigateTo('home');
    }
  };

  const handleLoginSuccess = (_email: string) => {
    // Estado do usuário é gerenciado pelo AuthContext — sem ação adicional necessária
  };

  const handleRegisterSuccess = (_name: string, _email: string) => {
    // Estado do usuário é gerenciado pelo AuthContext — sem ação adicional necessária
  };

  const handleLogout = async () => {
    await logout();
    navigateTo('login');
  };

  const handleDestinationSelect = (dest: string) => {
    setSelectedDestination(dest);
  };

  const PRIVATE_SCREENS: ScreenType[] = [
    'home', 'new_trip', 'itinerary', 'trip_details',
    'upgrade', 'checkout', 'success',
  ];

  const showBottomNav =
    currentScreen === 'home' ||
    currentScreen === 'new_trip' ||
    currentScreen === 'itinerary' ||
    currentScreen === 'trip_details';

  const showBackButton = currentScreen !== 'home';

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'home':           return 'Início';
      case 'new_trip':       return 'Novo Roteiro';
      case 'itinerary':      return 'Meus Roteiros';
      case 'trip_details':   return 'Detalhes Do Roteiro';
      case 'upgrade':        return 'Plano Upgrade';
      case 'checkout':       return 'Pagamento Checkout';
      case 'success':        return 'Confirmação Sucesso';
      case 'login':          return 'Login';
      case 'register':       return 'Cadastro';
      case 'forgot_password': return 'Recuperar Acesso';
      default:               return undefined;
    }
  };

  const isPrivate = PRIVATE_SCREENS.includes(currentScreen);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center selection:bg-secondary-container selection:text-on-secondary">
      {/* Top Helper Bar for Immediate Inspection of All Screens */}
      <ScreenSwitcherBar currentScreen={currentScreen} onNavigate={navigateTo} />

      {/* Main Top Navigation Header */}
      <NavigationHeader
        currentScreen={currentScreen}
        user={displayUser}
        onNavigate={navigateTo}
        onGoBack={handleGoBack}
        showBack={showBackButton}
        title={getScreenTitle()}
        onLogout={authUser ? handleLogout : undefined}
      />

      {/* Main Screen Content Viewport */}
      <main className="w-full max-w-md mx-auto px-4 pt-20 pb-6 flex-1 flex flex-col">

        {/* ── Telas Privadas (requerem autenticação) ── */}
        {isPrivate && (
          <ProtectedRoute onNavigate={navigateTo}>
            {currentScreen === 'home' && (
              <HomeScreen
                user={displayUser}
                onNavigate={navigateTo}
                onSelectDestination={handleDestinationSelect}
              />
            )}
            {currentScreen === 'new_trip' && (
              <NewTripScreen
                onNavigate={navigateTo}
                initialDestination={selectedDestination}
              />
            )}
            {currentScreen === 'itinerary' && (
              <ItineraryScreen onNavigate={navigateTo} />
            )}
            {currentScreen === 'trip_details' && (
              <TripDetailsScreen onNavigate={navigateTo} />
            )}
            {currentScreen === 'upgrade' && (
              <UpgradeScreen onNavigate={navigateTo} />
            )}
            {currentScreen === 'checkout' && (
              <CheckoutScreen onNavigate={navigateTo} />
            )}
            {currentScreen === 'success' && (
              <SuccessScreen onNavigate={navigateTo} />
            )}
            {currentScreen === '/availability' && (
              <AvailabilityScreen onNavigate={navigateTo} />
            )}
            {currentScreen === '/profile' && (
              <ProfileScreen
                user={displayUser}
                onUpdateUser={() => {}}
                onNavigate={navigateTo}
              />
            )}
          </ProtectedRoute>
        )}

        {/* ── Telas Públicas ── */}
        {currentScreen === 'login' && (
          <LoginScreen
            onNavigate={navigateTo}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
        {currentScreen === 'register' && (
          <RegisterScreen
            onNavigate={navigateTo}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}
        {currentScreen === 'forgot_password' && (
          <ForgotPasswordScreen onNavigate={navigateTo} />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      {showBottomNav && (
        <BottomNav currentScreen={currentScreen} onNavigate={navigateTo} />
      )}
    </div>
  );
}

// ── Root com AuthProvider ────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
