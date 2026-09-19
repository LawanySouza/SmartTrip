/**
 * Serviço de perfil de usuário no Cloud Firestore.
 * SPEC: SPEC_AUTH.md §4.1 (fluxo de cadastro), §3 (criação idempotente)
 *
 * SEGURANÇA:
 * - uid sempre obtido de auth.currentUser — nunca de parâmetro externo
 * - role: 'user' é hardcoded — nunca aceito do formulário
 * - Criação idempotente: verifica existência antes de escrever
 */
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './firebase/firestore';
import type { UserProfile, UserRole } from '../types/user';

// Preferências padrão para novos usuários
const DEFAULT_PREFERENCES: NonNullable<UserProfile['preferences']> = {
  travelStyle:        'moderate',
  budget:             'moderate',
  preferredInterests: [],
  restrictions:       [],
  currency:           'BRL',
};

/**
 * Cria o documento de perfil em /users/{uid} de forma idempotente.
 * Se o documento já existir, retorna o perfil existente sem sobrescrever.
 *
 * SEGURANÇA: role é hardcoded como 'user' — não aceito de nenhum parâmetro.
 */
export async function createUserProfile(
  uid: string,
  name: string,
  email: string,
): Promise<UserProfile> {
  const ref = doc(db, 'users', uid);
  const snapshot = await getDoc(ref);

  // ── Idempotência: já existe → retorna sem sobrescrever ───────────────────
  if (snapshot.exists()) {
    const data = snapshot.data() as UserProfile & { createdAt?: Timestamp; updatedAt?: Timestamp };
    return normalizeProfile(uid, data);
  }

  // ── Criação: role hardcoded — nunca vem do cliente ──────────────────────
  const role: UserRole = 'user'; // NUNCA alterar para aceitar parâmetro externo

  const profileData = {
    name,
    email,               // vem do Firebase Auth (credential.user.email), não do form
    avatar:              '',
    isPro:               false,
    savedTripsCount:     0,
    role,                // 'user' — hardcoded; Security Rules também bloqueiam alteração
    emailVerified:       false,
    preferences:         DEFAULT_PREFERENCES,
    createdAt:           serverTimestamp(),
    updatedAt:           serverTimestamp(),
  };

  await setDoc(ref, profileData);

  // Retorna perfil com campos de string para uso imediato no cliente
  return {
    uid,
    name,
    email,
    avatar:          '',
    isPro:           false,
    savedTripsCount: 0,
    role:            'user',
    emailVerified:   false,
    preferences:     DEFAULT_PREFERENCES,
    createdAt:       new Date().toISOString(),
    updatedAt:       new Date().toISOString(),
  };
}

/**
 * Lê o perfil de um usuário do Firestore.
 * Retorna null se não encontrado.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, 'users', uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  const data = snapshot.data() as UserProfile & { createdAt?: Timestamp; updatedAt?: Timestamp };
  return normalizeProfile(uid, data);
}

/**
 * Atualiza campos editáveis do perfil.
 * NÃO permite alteração de: email, role, uid, createdAt (defendido também pelas Rules).
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<Pick<UserProfile, 'name' | 'avatar' | 'isPro' | 'preferences' | 'savedTripsCount'>>,
): Promise<void> {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// ── Helpers internos ────────────────────────────────────────────────────────

/** Converte Timestamps Firestore para strings ISO e adiciona uid ao perfil. */
function normalizeProfile(
  uid: string,
  data: UserProfile & { createdAt?: Timestamp; updatedAt?: Timestamp },
): UserProfile {
  const toIso = (v: Timestamp | string | undefined): string | undefined => {
    if (v && typeof v === 'object' && 'toDate' in v) {
      return (v as Timestamp).toDate().toISOString();
    }
    return v as string | undefined;
  };
  return {
    ...data,
    uid,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}
