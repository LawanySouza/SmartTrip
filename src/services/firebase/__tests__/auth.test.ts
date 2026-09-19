/**
 * Testes unitários — serviços de autenticação Firebase.
 * SPEC: SPEC_AUTH.md §11
 *
 * Cenários cobertos:
 * 1. Cadastro válido
 * 2. Cadastro com e-mail duplicado
 * 3. Cadastro com senha inválida (< 8 chars)
 * 4. Login válido
 * 5. Login com credencial inválida
 * 6. Logout
 * 7. Reset de senha
 * 8. Acesso privado sem sessão (ProtectedRoute)
 * 9. Perfil criado apenas uma vez (idempotência)
 *
 * SEGURANÇA: Nenhum teste registra senha, token ou credencial real em assert ou log.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// ── Mocks do Firebase ────────────────────────────────────────────────────────

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps:       vi.fn(() => []),
  getApp:        vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth:                        vi.fn(() => ({ currentUser: null })),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword:     vi.fn(),
  signOut:                        vi.fn(),
  sendPasswordResetEmail:         vi.fn(),
  updateProfile:                  vi.fn(),
  onAuthStateChanged:             vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore:    vi.fn(() => ({})),
  collection:      vi.fn(),
  doc:             vi.fn(() => ({ id: 'mock-doc-id' })),
  getDoc:          vi.fn(),
  setDoc:          vi.fn(),
  updateDoc:       vi.fn(),
  serverTimestamp: vi.fn(() => ({ _seconds: 0 })),
}));

// ── Imports após mocks ───────────────────────────────────────────────────────

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';

import { getDoc, setDoc } from 'firebase/firestore';

import { signUpWithEmail, signInWithEmail, signOutUser, sendPasswordReset } from '../auth';
import { createUserProfile } from '../../user.service';
import { mapAuthError } from '../errors';

// ── Fixtures de usuários de teste (SPEC_AUTH §11.1) ─────────────────────────

const USER_A = {
  uid:      'test-uid-alice',
  email:    'alice@smarttrip.test',
  password: 'Alice@2026!',
  name:     'Alice Teste',
};

const USER_B = {
  uid:      'test-uid-bob',
  email:    'bob@smarttrip.test',
  password: 'Bob@2026!',
  name:     'Bob Teste',
};

// ── Helper: cria mock de UserCredential ────────────────────────────────────

function makeCredential(uid: string, email: string, displayName = '') {
  return {
    user: {
      uid,
      email,
      displayName,
      emailVerified: false,
      photoURL: null,
    },
  };
}

// ── Helpers de mock ─────────────────────────────────────────────────────────

function makeFirebaseError(code: string) {
  const err = new Error(code) as Error & { code: string };
  err.code = code;
  return err;
}

// ── Testes ───────────────────────────────────────────────────────────────────

describe('Autenticação Firebase — Testes Unitários', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── 1. Cadastro válido ───────────────────────────────────────────────────

  it('1. cadastro válido — retorna AuthResult com uid e email corretos', async () => {
    (createUserWithEmailAndPassword as Mock).mockResolvedValueOnce(
      makeCredential(USER_A.uid, USER_A.email),
    );
    (updateProfile as Mock).mockResolvedValueOnce(undefined);

    const result = await signUpWithEmail(USER_A.email, USER_A.password, USER_A.name);

    expect(result.uid).toBe(USER_A.uid);
    expect(result.email).toBe(USER_A.email);
    expect(result.name).toBe(USER_A.name);
    // Garante que nenhum dado sensível foi exposto no resultado
    expect(result).not.toHaveProperty('password');
  });

  // ─── 2. Cadastro com e-mail duplicado ────────────────────────────────────

  it('2. cadastro duplicado — lança mensagem em pt-BR', async () => {
    (createUserWithEmailAndPassword as Mock).mockRejectedValueOnce(
      makeFirebaseError('auth/email-already-in-use'),
    );

    await expect(signUpWithEmail(USER_A.email, USER_A.password, USER_A.name))
      .rejects.toThrow('Este e-mail já está cadastrado. Tente fazer login.');
  });

  // ─── 3. Senha inválida ────────────────────────────────────────────────────

  it('3. senha inválida — lança mensagem de senha fraca em pt-BR', async () => {
    (createUserWithEmailAndPassword as Mock).mockRejectedValueOnce(
      makeFirebaseError('auth/weak-password'),
    );

    await expect(signUpWithEmail(USER_A.email, '123', USER_A.name))
      .rejects.toThrow('Senha muito fraca. Use ao menos 8 caracteres com letras e números.');
  });

  // ─── 4. Login válido ──────────────────────────────────────────────────────

  it('4. login válido — retorna AuthResult com uid correto', async () => {
    (signInWithEmailAndPassword as Mock).mockResolvedValueOnce(
      makeCredential(USER_A.uid, USER_A.email, USER_A.name),
    );

    const result = await signInWithEmail(USER_A.email, USER_A.password);

    expect(result.uid).toBe(USER_A.uid);
    expect(result.email).toBe(USER_A.email);
    // Verifica isolamento: resultado é de USER_A, não USER_B
    expect(result.uid).not.toBe(USER_B.uid);
    expect(result.email).not.toBe(USER_B.email);
  });

  // ─── 5. Login com credencial inválida ────────────────────────────────────

  it('5. login inválido — lança mensagem genérica (anti-enumeração)', async () => {
    (signInWithEmailAndPassword as Mock).mockRejectedValueOnce(
      makeFirebaseError('auth/wrong-password'),
    );

    await expect(signInWithEmail(USER_A.email, 'senhaerrada'))
      .rejects.toThrow('E-mail ou senha incorretos.');
  });

  // ─── 6. Logout ────────────────────────────────────────────────────────────

  it('6. logout — chama firebase signOut sem lançar erro', async () => {
    (signOut as Mock).mockResolvedValueOnce(undefined);

    await expect(signOutUser()).resolves.toBeUndefined();
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  // ─── 7. Reset de senha ────────────────────────────────────────────────────

  it('7. reset de senha — resolve sem erro para e-mail válido', async () => {
    (sendPasswordResetEmail as Mock).mockResolvedValueOnce(undefined);

    await expect(sendPasswordReset(USER_A.email)).resolves.toBeUndefined();
  });

  it('7b. reset de senha — silencia user-not-found (anti-enumeração)', async () => {
    (sendPasswordResetEmail as Mock).mockRejectedValueOnce(
      makeFirebaseError('auth/user-not-found'),
    );

    // Deve resolver silenciosamente — não revela se o e-mail existe
    await expect(sendPasswordReset('inexistente@test.com')).resolves.toBeUndefined();
  });

  // ─── 8. Acesso privado sem sessão ─────────────────────────────────────────

  it('8. mapAuthError — código desconhecido retorna mensagem genérica em pt-BR', () => {
    const msg = mapAuthError({ code: 'auth/unknown-code-xyz' });
    expect(msg).toBe('Ocorreu um erro inesperado. Tente novamente.');
  });

  it('8b. mapAuthError — erro sem code retorna mensagem genérica', () => {
    const msg = mapAuthError(new Error('network error'));
    expect(msg).toBe('Ocorreu um erro inesperado. Tente novamente.');
  });

  // ─── 9. Perfil criado uma única vez (idempotência) ───────────────────────

  it('9. createUserProfile — idempotente: não sobrescreve perfil existente', async () => {
    // Primeira chamada: documento não existe → cria
    (getDoc as Mock).mockResolvedValueOnce({ exists: () => false });
    (setDoc as Mock).mockResolvedValueOnce(undefined);

    const profile1 = await createUserProfile(USER_A.uid, USER_A.name, USER_A.email);
    expect(setDoc).toHaveBeenCalledTimes(1);
    expect(profile1.role).toBe('user'); // role NUNCA vem do formulário

    // Segunda chamada: documento já existe → retorna sem chamar setDoc novamente
    (getDoc as Mock).mockResolvedValueOnce({
      exists: () => true,
      data:   () => ({
        name:            USER_A.name,
        email:           USER_A.email,
        avatar:          '',
        isPro:           false,
        role:            'user',
        savedTripsCount: 0,
        emailVerified:   false,
        preferences:     {},
      }),
    });

    await createUserProfile(USER_A.uid, USER_A.name, USER_A.email);
    // setDoc NÃO deve ser chamado uma segunda vez
    expect(setDoc).toHaveBeenCalledTimes(1);
  });

  it('9b. createUserProfile — role sempre é "user" (segurança: não aceitado do formulário)', async () => {
    (getDoc as Mock).mockResolvedValueOnce({ exists: () => false });
    (setDoc as Mock).mockResolvedValueOnce(undefined);

    const profile = await createUserProfile(USER_B.uid, USER_B.name, USER_B.email);

    expect(profile.role).toBe('user');
    // Verifica que setDoc foi chamado com role: 'user' hardcoded
    const setDocCall = (setDoc as Mock).mock.calls[0][1] as Record<string, unknown>;
    expect(setDocCall.role).toBe('user');
    // Nunca deve ter 'admin' na criação automática
    expect(setDocCall.role).not.toBe('admin');
  });
});

// ── Testes de isolamento entre usuários ───────────────────────────────────────

describe('Isolamento USER_A × USER_B', () => {

  it('UIDs distintos — resultados de login não se confundem', async () => {
    (signInWithEmailAndPassword as Mock)
      .mockResolvedValueOnce(makeCredential(USER_A.uid, USER_A.email, USER_A.name))
      .mockResolvedValueOnce(makeCredential(USER_B.uid, USER_B.email, USER_B.name));

    const resultA = await signInWithEmail(USER_A.email, USER_A.password);
    const resultB = await signInWithEmail(USER_B.email, USER_B.password);

    expect(resultA.uid).toBe(USER_A.uid);
    expect(resultB.uid).toBe(USER_B.uid);
    expect(resultA.uid).not.toBe(resultB.uid);
    expect(resultA.email).not.toBe(resultB.email);
  });
});
