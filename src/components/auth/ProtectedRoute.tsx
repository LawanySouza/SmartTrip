/**
 * ProtectedRoute — wrapper de proteção de rotas privadas.
 * SPEC: SPEC_AUTH.md §5.2
 *
 * Adapta-se ao sistema de navegação por estado do SmartTrip (sem React Router).
 * Aguarda resolução do loading antes de qualquer decisão (evita flash de redirect).
 */
import React, { useEffect, type ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { ScreenType } from '../../types';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Função de navegação global do App.tsx */
  onNavigate: (screen: ScreenType) => void;
}

export function ProtectedRoute({ children, onNavigate }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Redireciona para login quando não autenticado — após resolução do loading
  useEffect(() => {
    if (!loading && !user) {
      onNavigate('login');
    }
  }, [loading, user, onNavigate]);

  // Fase 1: aguarda resolução da sessão Firebase
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <span
          className="material-symbols-outlined text-[40px] text-secondary animate-spin"
          aria-label="Carregando sessão"
        >
          progress_activity
        </span>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Verificando sessão…
        </p>
      </div>
    );
  }

  // Fase 2: não autenticado — renderiza null enquanto o useEffect redireciona
  if (!user) return null;

  // Fase 3: autenticado — renderiza o conteúdo protegido
  return <>{children}</>;
}
