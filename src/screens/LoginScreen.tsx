/**
 * LoginScreen — integração com Firebase Authentication.
 * SPEC: SPEC_AUTH.md §4.2 (fluxo de login)
 *
 * SEGURANÇA: Nunca loga email/senha. Erros mapeados para pt-BR pelo AuthContext.
 */
import React, { useState } from 'react';
import { ScreenType } from '../types';
import { IMAGES } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

interface LoginScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onLoginSuccess: (email: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate, onLoginSuccess }) => {
  const { signIn } = useAuth();
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signIn(email, password);
      onLoginSuccess(email);
      onNavigate('home');
    } catch (err) {
      // err.message já está mapeado para pt-BR pelo AuthContext → auth.ts
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-20 max-w-sm mx-auto pt-2 space-y-5">
      {/* Header & Brand */}
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center p-2 mb-3 shadow-xs">
          <img
            src={IMAGES.logo}
            alt="SmartTrip Logo"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
          Bem-vindo de volta
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Acesse seus roteiros inteligentes e viagens salvas.
        </p>
      </div>

      {/* Erro inline */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 p-3 rounded-xl bg-error-container text-on-error-container font-body-sm text-body-sm border border-error/20"
        >
          <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="font-label-md text-label-md text-on-surface font-semibold">
            E-mail
          </label>
          <div className="relative flex items-center">
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              className="w-full h-12 bg-surface-container-low rounded-xl px-3 pl-10 font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-secondary/30 transition-all font-medium"
            />
            <span className="material-symbols-outlined absolute left-3 text-[20px] text-outline">
              mail
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="font-label-md text-label-md text-on-surface font-semibold">
              Senha
            </label>
            <button
              type="button"
              onClick={() => onNavigate('forgot_password')}
              className="font-label-sm text-label-sm text-secondary hover:underline font-semibold"
            >
              Esqueceu a senha?
            </button>
          </div>
          <div className="relative flex items-center">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="w-full h-12 bg-surface-container-low rounded-xl px-3 pl-10 pr-10 font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-secondary/30 transition-all font-medium"
            />
            <span className="material-symbols-outlined absolute left-3 text-[20px] text-outline">
              lock
            </span>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              className="material-symbols-outlined absolute right-3 text-[20px] text-outline hover:text-on-surface"
            >
              {showPassword ? 'visibility_off' : 'visibility'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-secondary-container hover:bg-secondary text-on-secondary font-label-lg text-label-lg font-bold shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-80"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">
                progress_activity
              </span>
              <span>Entrando…</span>
            </>
          ) : (
            <>
              <span>Entrar na Minha Conta</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="text-center pt-2">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Não tem uma conta?{' '}
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="text-secondary font-semibold hover:underline"
          >
            Cadastre-se gratuitamente
          </button>
        </p>
      </div>
    </div>
  );
};
