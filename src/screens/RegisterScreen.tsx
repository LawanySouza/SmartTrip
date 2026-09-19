/**
 * RegisterScreen — integração com Firebase Authentication.
 * SPEC: SPEC_AUTH.md §4.1 (fluxo de cadastro)
 *
 * SEGURANÇA:
 * - role NÃO está no formulário — é hardcoded como 'user' no user.service
 * - email vem de credential.user.email (Firebase), não do input
 * - Nenhuma senha é logada
 */
import React, { useState } from 'react';
import { ScreenType } from '../types';
import { IMAGES } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

interface RegisterScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onRegisterSuccess: (name: string, email: string) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigate,
  onRegisterSuccess,
}) => {
  const { signUp } = useAuth();
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const getPasswordStrength = () => {
    if (!password) return { label: '', color: 'bg-surface-container', width: '0%' };
    if (password.length < 6)  return { label: 'Fraca',          color: 'bg-error',              width: '33%' };
    if (password.length < 10) return { label: 'Média',          color: 'bg-secondary',           width: '66%' };
    return                           { label: 'Forte & Segura', color: 'bg-secondary-container', width: '100%' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) return;
    if (password.length < 8) {
      setError('Senha muito fraca. Use ao menos 8 caracteres com letras e números.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      // signUp → signUpWithEmail (firebase/auth) + createUserProfile (role:'user' hardcoded)
      await signUp(email, password, name.trim());
      onRegisterSuccess(name.trim(), email);
      onNavigate('home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-20 max-w-sm mx-auto pt-2 space-y-5">
      {/* Header */}
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
          Crie sua conta SmartTrip
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Comece a planejar viagens com roteiros otimizados por inteligência artificial.
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {/* Nome */}
        <div className="flex flex-col gap-1">
          <label htmlFor="reg-name" className="font-label-md text-label-md text-on-surface font-semibold">
            Nome Completo
          </label>
          <div className="relative flex items-center">
            <input
              id="reg-name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Camila Albuquerque"
              className="w-full h-12 bg-surface-container-low rounded-xl px-3 pl-10 font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-secondary/30 transition-all font-medium"
            />
            <span className="material-symbols-outlined absolute left-3 text-[20px] text-outline">
              person
            </span>
          </div>
        </div>

        {/* E-mail */}
        <div className="flex flex-col gap-1">
          <label htmlFor="reg-email" className="font-label-md text-label-md text-on-surface font-semibold">
            E-mail
          </label>
          <div className="relative flex items-center">
            <input
              id="reg-email"
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

        {/* Senha */}
        <div className="flex flex-col gap-1">
          <label htmlFor="reg-password" className="font-label-md text-label-md text-on-surface font-semibold">
            Senha
          </label>
          <div className="relative flex items-center">
            <input
              id="reg-password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crie uma senha forte (mínimo 8 caracteres)"
              className="w-full h-12 bg-surface-container-low rounded-xl px-3 pl-10 font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-secondary/30 transition-all font-medium"
            />
            <span className="material-symbols-outlined absolute left-3 text-[20px] text-outline">
              lock
            </span>
          </div>
          {password && (
            <div className="flex items-center gap-2 pt-1">
              <div className="h-1.5 flex-1 bg-surface-container rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all duration-300`}
                  style={{ width: strength.width }}
                />
              </div>
              <span className="text-[11px] font-label-sm font-semibold text-on-surface-variant">
                {strength.label}
              </span>
            </div>
          )}
        </div>

        {/* Termos */}
        <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            required
            className="w-4 h-4 rounded text-secondary accent-secondary focus:ring-0 mt-0.5"
          />
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Concordo com os <strong className="text-on-surface">Termos de Uso</strong> e{' '}
            <strong className="text-on-surface">Política de Privacidade</strong> do SmartTrip.
          </span>
        </label>

        <button
          type="submit"
          disabled={isLoading || !agreeTerms}
          className="w-full h-12 rounded-xl bg-secondary-container hover:bg-secondary text-on-secondary font-label-lg text-label-lg font-bold shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">
                progress_activity
              </span>
              <span>Criando sua conta…</span>
            </>
          ) : (
            <>
              <span>Criar Conta Gratuita</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="text-center pt-2">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Já possui conta?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="text-secondary font-semibold hover:underline"
          >
            Fazer login
          </button>
        </p>
      </div>
    </div>
  );
};
