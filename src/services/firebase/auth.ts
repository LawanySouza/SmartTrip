/**
 * Funções puras de Firebase Authentication.
 * SPEC: SPEC_AUTH.md §3, §4
 *
 * SEGURANÇA:
 * - uid sempre vem de auth.currentUser — nunca de parâmetro externo
 * - Nenhuma senha ou token é registrado em logs
 * - Erros são convertidos para pt-BR antes de serem relançados
 */
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
  type Unsubscribe,
} from 'firebase/auth';
import app from './config';
import { mapAuthError } from './errors';

export const auth = getAuth(app);

// ── Tipos exportados ────────────────────────────────────────────────────────

export interface AuthResult {
  uid:           string;
  email:         string;
  name:          string;
  emailVerified: boolean;
}

// ── Funções de autenticação ─────────────────────────────────────────────────

/**
 * Cadastro com e-mail e senha.
 * Cria conta no Firebase Auth e atualiza displayName.
 * O campo `role` é definido fora deste módulo (user.service.ts) — nunca pelo formulário.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
): Promise<AuthResult> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    return {
      uid:           credential.user.uid,
      email:         credential.user.email ?? email,
      name,
      emailVerified: credential.user.emailVerified,
    };
  } catch (error) {
    // Re-lança com mensagem mapeada; não loga senha ou token
    throw new Error(mapAuthError(error));
  }
}

/**
 * Login com e-mail e senha.
 */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return {
      uid:           credential.user.uid,
      email:         credential.user.email ?? email,
      name:          credential.user.displayName ?? '',
      emailVerified: credential.user.emailVerified,
    };
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
}

/**
 * Logout — limpa sessão local do Firebase Auth.
 */
export async function signOutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
}

/**
 * Envio de e-mail de recuperação de senha.
 * Retorna void mesmo se o e-mail não existir (anti-enumeração).
 */
export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    const code = (error as { code?: string })?.code ?? '';
    // Silencia 'user-not-found' intencionalmente (anti-enumeração)
    if (code === 'auth/user-not-found') return;
    throw new Error(mapAuthError(error));
  }
}

/**
 * Retorna o usuário autenticado atual (snapshot síncrono).
 * Null se não autenticado.
 */
export function getCurrentFirebaseUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Registra observer de mudança de estado de autenticação.
 * Retorna função de cleanup (unsubscribe).
 * Deve ser chamado apenas uma vez no AuthContext.
 */
export function onAuthChange(
  callback: (user: FirebaseUser | null) => void,
): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}
