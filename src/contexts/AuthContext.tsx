/**
 * AuthContext — estado global de autenticação do SmartTrip.
 * SPEC: SPEC_AUTH.md §3 (AuthContextValue), §6 (onAuthStateChanged)
 *
 * SEGURANÇA:
 * - onAuthStateChanged registrado UMA ÚNICA VEZ (sem memory leak)
 * - loading=true durante resolução inicial (evita flash de redirect)
 * - uid sempre de firebaseUser.uid — nunca de parâmetro externo
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  signUpWithEmail,
  signInWithEmail,
  signOutUser,
  sendPasswordReset,
  onAuthChange,
} from '../services/firebase/auth';
import {
  createUserProfile,
  getUserProfile,
} from '../services/user.service';
import type { UserProfile } from '../types/user';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface AuthContextValue {
  user:          UserProfile | null;
  firebaseUser:  FirebaseUser | null;
  loading:       boolean;
  signUp:        (email: string, password: string, name: string) => Promise<void>;
  signIn:        (email: string, password: string) => Promise<void>;
  logout:        () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// ── Contexto ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]                 = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading]           = useState(true);

  // Observer de sessão — registrado uma única vez
  useEffect(() => {
    const unsubscribe = onAuthChange(async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          const profile = await getUserProfile(fbUser.uid);
          // Perfil pode não existir se foi criado em outra aba; usa fallback mínimo
          setUser(
            profile ?? {
              uid:           fbUser.uid,
              name:          fbUser.displayName ?? '',
              email:         fbUser.email ?? '',
              avatar:        fbUser.photoURL ?? '',
              emailVerified: fbUser.emailVerified,
              role:          'user',
            },
          );
        } catch {
          // Erro de rede: mantém fbUser mas user null para forçar retry
          setUser(null);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe; // cleanup obrigatório — evita memory leak
  }, []);

  // ── Operações ───────────────────────────────────────────────────────────────

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const result = await signUpWithEmail(email, password, name);
      // Criação idempotente do perfil — role: 'user' hardcoded no service
      const profile = await createUserProfile(result.uid, result.name, result.email);
      setUser(profile);
    },
    [],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await signInWithEmail(email, password);
    const profile = await getUserProfile(result.uid);
    setUser(
      profile ?? {
        uid:   result.uid,
        name:  result.name,
        email: result.email,
        avatar: '',
        role:  'user',
      },
    );
  }, []);

  const logout = useCallback(async () => {
    await signOutUser();
    setUser(null);
    setFirebaseUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordReset(email);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, firebaseUser, loading, signUp, signIn, logout, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook de acesso ao contexto de autenticação.
 * Lança erro se usado fora do AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return ctx;
}
