/**
 * ForgotPasswordScreen — integração com Firebase Authentication.
 * SPEC: SPEC_AUTH.md §4.4 (recuperação de senha)
 *
 * SEGURANÇA: Mensagem de feedback idêntica para e-mail existente e inexistente
 * (anti-enumeração — sendPasswordReset silencia 'auth/user-not-found').
 */
import React, { useState } from 'react';
import { ScreenType } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ForgotPasswordScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onNavigate }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail]         = useState('');
  const [isSent, setIsSent]       = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await resetPassword(email);
      // Sempre exibe confirmação — e-mail existente ou não (anti-enumeração)
      setIsSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-20 max-w-sm mx-auto pt-4 space-y-5">
      {/* Icon */}
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-secondary mb-3 shadow-xs">
          <span className="material-symbols-outlined text-[32px]">lock_reset</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
          Recuperar Senha
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Informe seu e-mail cadastrado para enviarmos as instruções de redefinição.
        </p>
      </div>

      {!isSent ? (
        <>
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="forgot-email" className="font-label-md text-label-md text-on-surface font-semibold">
                E-mail cadastrado
              </label>
              <div className="relative flex items-center">
                <input
                  id="forgot-email"
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
                  <span>Enviando link seguro…</span>
                </>
              ) : (
                <>
                  <span>Enviar Link de Recuperação</span>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </>
              )}
            </button>
          </form>
        </>
      ) : (
        /* Confirmação — mensagem idêntica para existente e inexistente (anti-enumeração) */
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-secondary">
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              mark_email_read
            </span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Instruções Enviadas
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Se este e-mail estiver cadastrado, você receberá as instruções em breve.
              Verifique sua caixa de entrada ou lixo eletrônico.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setIsSent(false); setEmail(''); }}
            className="font-label-md text-label-md text-secondary font-semibold hover:underline mt-1"
          >
            Tentar outro e-mail
          </button>
        </div>
      )}

      {/* Back to Login */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="inline-flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant hover:text-on-surface font-semibold"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Voltar para o Login</span>
        </button>
      </div>
    </div>
  );
};
