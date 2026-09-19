# SPEC Técnica — Autenticação Firebase do SmartTrip

**Versão:** 1.0
**Status:** Aprovada para implementação
**Dependências:** SPEC Mestre (RF-001 a RF-005), SPEC Firebase (SPEC_FIREBASE.md)
**Arquivo de tipos base:** `src/types/user.ts`

---

## 1. Visão Geral

A autenticação do SmartTrip é integralmente gerenciada pelo **Firebase Authentication** com o
provedor e-mail/senha. Ao autenticar-se, o Firebase emite um **ID Token JWT** que identifica
o usuário em todas as chamadas subsequentes ao Firestore e às futuras Vercel Functions.

### Princípios de segurança não negociáveis

1. **O `uid` jamais é fornecido pelo cliente.** Toda operação que precisa do `uid` o obtém de
   `auth.currentUser.uid` (Client SDK) ou do token verificado (Admin SDK no servidor).
   O cliente nunca envia `userId` em um body ou query string.

2. **As Security Rules são a última linha de defesa.** Mesmo com o ponto 1, as Rules garantem
   isolamento mesmo que um bug permita um `uid` inválido chegar ao Firestore.

3. **Papel padrão `user`.** Todo novo cadastro recebe `role: 'user'` atribuído pelo servidor
   (ou pelas Security Rules) no documento `/users/{uid}`. O cliente nunca escreve o campo `role`.

4. **Autoelevação de papel é impossível.** As Security Rules bloqueiam qualquer escrita no campo
   `role` por parte do próprio usuário. Elevação para `admin` só ocorre via Admin SDK
   (Vercel Function com service account), nunca por requisição do browser.

---

## 2. Contratos de Tipos

### 2.1 Extensão de `UserProfile` para persistência no Firestore

```typescript
// src/types/user.ts — adicionar os campos abaixo ao UserProfile existente

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  // --- campos existentes ---
  name:     string;
  email:    string;           // imutável após criação
  avatar:   string;           // URL do Storage ou string vazia
  isPro?:   boolean;
  savedTripsCount?: number;
  preferences?: UserPreferences;
  createdAt?: string;         // ISO 8601 para uso no client
  updatedAt?: string;

  // --- campos a adicionar para integração Firebase ---
  uid?:     string;           // uid do Firebase Auth (lido, nunca escrito pelo cliente)
  role?:    UserRole;         // 'user' por padrão; 'admin' somente via Admin SDK
  emailVerified?: boolean;    // espelha Firebase Auth
}
```

### 2.2 Resultado padrão de operações de autenticação

```typescript
// src/services/firebase/auth.ts

export interface AuthResult {
  uid:           string;
  email:         string;
  name:          string;
  emailVerified: boolean;
}

export interface AuthError {
  code:    string;   // código original Firebase: 'auth/wrong-password'
  message: string;   // mensagem mapeada em português
}
```

### 2.3 Contexto de autenticação React

```typescript
// src/contexts/AuthContext.tsx

export interface AuthContextValue {
  user:        UserProfile | null;   // null = não autenticado
  firebaseUser: FirebaseUser | null; // instância raw do Firebase Auth
  loading:     boolean;              // true durante resolução inicial da sessão
  signUp:      (email: string, password: string, name: string) => Promise<void>;
  signIn:      (email: string, password: string) => Promise<void>;
  signOut:     () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
```

---

## 3. Módulos e Responsabilidades

```
src/
├── services/
│   └── firebase/
│       ├── config.ts          ← singleton do app Firebase (ver SPEC_FIREBASE)
│       ├── auth.ts            ← funções puras de autenticação
│       └── errors.ts          ← mapeamento de códigos de erro → pt-BR
├── contexts/
│   └── AuthContext.tsx        ← Provider + hook useAuth()
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx ← HOC/wrapper de proteção de rota
└── services/
    └── user.service.ts        ← criação e leitura do perfil no Firestore
```

### Responsabilidade de cada módulo

| Módulo | Responsabilidade | O que NÃO faz |
|--------|------------------|---------------|
| `auth.ts` | Operações Firebase Auth puras | Não acessa Firestore, não conhece React |
| `errors.ts` | Traduz códigos Firebase → pt-BR | Não formata UI, não loga |
| `AuthContext` | Estado global de autenticação | Não contém lógica de negócio |
| `ProtectedRoute` | Redireciona não autenticados | Não valida papéis (fase MVP) |
| `user.service.ts` | CRUD do documento `/users/{uid}` | Não chama Firebase Auth |

---

## 4. Fluxos de Autenticação

### 4.1 Cadastro (`/register`)

```
[Browser]                        [Firebase Auth]          [Cloud Firestore]
    │                                   │                        │
    │  createUserWithEmailAndPassword() │                        │
    │──────────────────────────────────►│                        │
    │  ◄── UserCredential (uid, email)  │                        │
    │                                   │                        │
    │  updateProfile({ displayName })   │                        │
    │──────────────────────────────────►│                        │
    │  ◄── void                         │                        │
    │                                   │                        │
    │  setDoc(/users/{uid}, {...})       │   ◄── escrita do perfil inicial
    │──────────────────────────────────────────────────────────►│
    │  ◄── void                                                  │
    │                                                            │
    │  [redireciona para /dashboard]
```

**Documento criado em `/users/{uid}`:**
```typescript
{
  name:          displayName,          // vem do formulário
  email:         user.email,           // vem do Firebase Auth (não do formulário)
  avatar:        '',
  isPro:         false,
  role:          'user',               // SEMPRE 'user' na criação; nunca aceito do cliente
  emailVerified: false,
  preferences:   defaultPreferences,
  savedTripsCount: 0,
  createdAt:     serverTimestamp(),
  updatedAt:     serverTimestamp(),
}
```

> IMPORTANTE: O campo `role` é definido aqui pelo código da aplicação, não pelo usuário.
> As Security Rules bloqueiam qualquer tentativa de o cliente sobrescrever `role`.

### 4.2 Login (`/login`)

```
[Browser]                        [Firebase Auth]          [Cloud Firestore]
    │                                   │                        │
    │  signInWithEmailAndPassword()     │                        │
    │──────────────────────────────────►│                        │
    │  ◄── UserCredential               │                        │
    │                                   │                        │
    │  getDoc(/users/{uid})             │                        │
    │──────────────────────────────────────────────────────────►│
    │  ◄── UserProfile snapshot                                  │
    │                                                            │
    │  [hidrata AuthContext com user]
    │  [redireciona para /dashboard ou returnUrl]
```

**Comportamento de sessão:**
- O Firebase Auth persiste a sessão no `localStorage` por padrão (modo `LOCAL`).
- `onAuthStateChanged` dispara ao carregar a página e restaura o estado sem novo login.
- O ID Token é renovado automaticamente pelo SDK a cada hora.

### 4.3 Logout

```
[Browser]                        [Firebase Auth]          [AuthContext]
    │                                   │                        │
    │  signOut()                        │                        │
    │──────────────────────────────────►│                        │
    │  ◄── void                         │                        │
    │                                   │                        │
    │  setUser(null) ──────────────────────────────────────────►│
    │  [redireciona para /login]
```

**Após logout:**
- `auth.currentUser` retorna `null`
- `AuthContext.user` retorna `null`
- Qualquer rota protegida redireciona para `/login`
- Cache local do Firestore é preservado (off-line) mas inacessível sem re-autenticação

### 4.4 Recuperação de Senha (`/forgot-password`)

```
[Browser]                        [Firebase Auth]          [Serviço de E-mail]
    │                                   │                        │
    │  sendPasswordResetEmail(email)    │                        │
    │──────────────────────────────────►│                        │
    │                                   │──── envia e-mail ─────►│
    │  ◄── void (sempre, mesmo e-mail   │                        │
    │       inexistente — anti-enum.)   │
    │                                   │
    │  [exibe: "Se este e-mail existir, você receberá as instruções."]
```

> SEGURANÇA: A mensagem de feedback é **sempre a mesma**, independente de o e-mail existir ou não.
> Isso previne enumeração de e-mails cadastrados (user enumeration attack).

---

## 5. Proteção de Rotas

### 5.1 Classificação de rotas

| Rota | Tipo | Comportamento se não autenticado |
|------|------|----------------------------------|
| `/` | Pública | Acesso livre |
| `/login` | Pública (redirect) | Se autenticado → `/dashboard` |
| `/register` | Pública (redirect) | Se autenticado → `/dashboard` |
| `/forgot-password` | Pública | Acesso livre |
| `/dashboard` | **Privada** | Redireciona para `/login?returnUrl=/dashboard` |
| `/profile` | **Privada** | Redireciona para `/login` |
| `/availability` | **Privada** | Redireciona para `/login` |
| `/explore` | **Privada** | Redireciona para `/login` |
| `/trips` | **Privada** | Redireciona para `/login` |
| `/trips/[id]` | **Privada** | Redireciona para `/login` |

### 5.2 Contrato do `ProtectedRoute`

```typescript
// src/components/auth/ProtectedRoute.tsx — CONCEITUAL

interface ProtectedRouteProps {
  children: React.ReactNode;
  // futuro: requiredRole?: UserRole;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // 1. Aguarda resolução da sessão antes de qualquer decisão
  if (loading) return <FullPageSpinner />;

  // 2. Não autenticado → redireciona preservando a URL de destino
  if (!user) {
    const returnUrl = encodeURIComponent(window.location.pathname);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
  }

  // 3. Autenticado → renderiza o conteúdo
  return <>{children}</>;
}
```

**Por que aguardar `loading`:** O Firebase Auth resolve a sessão de forma assíncrona na carga
inicial. Sem o guard de `loading`, rotas privadas redirecionam para `/login` por um frame
mesmo com o usuário autenticado, causando flash indesejado.

### 5.3 Redirecionamento de volta após login

```typescript
// Dentro de LoginScreen após signIn bem-sucedido:
const params = new URLSearchParams(window.location.search);
const returnUrl = params.get('returnUrl') ?? '/dashboard';

// Validação de segurança: só redireciona para rotas internas
const safeUrl = returnUrl.startsWith('/') ? returnUrl : '/dashboard';
navigate(safeUrl, { replace: true });
```

---

## 6. Gerenciamento de Sessão

### 6.1 Observer de sessão (`onAuthStateChanged`)

```typescript
// src/contexts/AuthContext.tsx — CONCEITUAL

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Busca o perfil completo no Firestore (inclui role, isPro, preferences)
      const profile = await getUserProfile(firebaseUser.uid);
      setUser(profile);
      setFirebaseUser(firebaseUser);
    } else {
      setUser(null);
      setFirebaseUser(null);
    }
    setLoading(false);
  });

  return unsubscribe; // limpa o listener ao desmontar
}, []);
```

**Regras do observer:**
- Chamado **uma única vez** no `AuthContext`; nunca em componentes filhos.
- O cleanup `return unsubscribe` é obrigatório para evitar memory leak.
- `loading` começa como `true` e só vira `false` após o primeiro disparo do observer.

### 6.2 Persistência de sessão

| Modo Firebase | Comportamento | Uso no SmartTrip |
|---------------|---------------|------------------|
| `LOCAL` (padrão) | Persiste entre abas e fechamento do browser | ✅ MVP |
| `SESSION` | Persiste apenas na aba atual | — |
| `NONE` | Sem persistência (cada load exige login) | — |

### 6.3 Renovação do ID Token

O SDK renova o token automaticamente antes de expirar (ciclo de 1 hora). Em chamadas futuras
para Vercel Functions, o token deve ser obtido com `getIdToken(true)` para forçar renovação
antes de enviar na header `Authorization: Bearer <token>`.

---

## 7. Mensagens de Erro — Catálogo Completo

### 7.1 Erros de Autenticação (pt-BR)

```typescript
// src/services/firebase/errors.ts

export const AUTH_ERRORS: Record<string, string> = {
  // Cadastro
  'auth/email-already-in-use':
    'Este e-mail já está cadastrado. Tente fazer login.',
  'auth/invalid-email':
    'Formato de e-mail inválido.',
  'auth/weak-password':
    'Senha muito fraca. Use ao menos 8 caracteres com letras e números.',
  'auth/operation-not-allowed':
    'Este método de login não está habilitado.',

  // Login
  'auth/wrong-password':
    'Senha incorreta. Verifique e tente novamente.',
  'auth/user-not-found':
    'Nenhuma conta encontrada com este e-mail.',
  'auth/invalid-credential':
    'E-mail ou senha incorretos.',          // versão moderna do Firebase
  'auth/user-disabled':
    'Esta conta foi desativada. Entre em contato com o suporte.',

  // Limites
  'auth/too-many-requests':
    'Muitas tentativas seguidas. Aguarde alguns minutos antes de tentar novamente.',
  'auth/quota-exceeded':
    'Limite de operações atingido. Tente mais tarde.',

  // Rede
  'auth/network-request-failed':
    'Falha de conexão. Verifique sua internet e tente novamente.',

  // Token / Sessão
  'auth/id-token-expired':
    'Sua sessão expirou. Faça login novamente.',
  'auth/user-token-expired':
    'Sua sessão expirou. Faça login novamente.',
  'auth/invalid-user-token':
    'Sessão inválida. Faça login novamente.',

  // Recuperação de senha
  'auth/expired-action-code':
    'O link de redefinição expirou. Solicite um novo.',
  'auth/invalid-action-code':
    'Link de redefinição inválido ou já utilizado.',
};

export function mapAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  return AUTH_ERRORS[code] ?? 'Ocorreu um erro inesperado. Tente novamente.';
}
```

### 7.2 Apresentação na UI

| Contexto | Componente | Posição |
|----------|-----------|---------|
| Campo inválido (email/senha) | `<Input error="..." />` | Abaixo do campo |
| Erro da operação (ex: wrong-password) | `<Toast>` ou inline alert | Topo do formulário |
| Erro de rede | `<Toast>` persistente | Topo do formulário |
| Sessão expirada | Redirect + `<Toast>` | Após redirect para /login |

---

## 8. Papel de Usuário (Role) e Prevenção de Autoelevação

### 8.1 Arquitetura de papéis

```
         CRIAÇÃO                      ELEVAÇÃO
    ┌─────────────────┐          ┌──────────────────────┐
    │  createAccount()│          │  Admin SDK           │
    │  role = 'user'  │          │  (Vercel Function)   │
    │  (hardcoded)    │          │  setRole(uid,'admin')│
    └─────────────────┘          └──────────────────────┘
             │                            │
             ▼                            ▼
    /users/{uid}.role = 'user'   /users/{uid}.role = 'admin'
             │                            │
             └─────── Security Rule ──────┘
                   bloqueio de auto-escrita
```

### 8.2 Security Rule para proteção do campo `role`

```javascript
// Em firestore.rules — regra de update de /users/{uid}
allow update: if isAuthenticated()
              && isOwner(uid)
              // Bloqueia qualquer tentativa de alterar 'role' pelo próprio usuário:
              && !request.resource.data.diff(resource.data)
                   .affectedKeys().hasAny(['role', 'email', 'createdAt']);
```

### 8.3 Leitura do papel no cliente

O papel é lido do documento Firestore `/users/{uid}.role`, nunca do token JWT diretamente
(a menos que custom claims sejam implementados em fase futura). O cliente **lê** o papel
mas **nunca o envia** como dado de entrada para operações.

### 8.4 Extensão futura: custom claims para `admin`

```typescript
// FUTURO — via Vercel Function com Admin SDK
// admin-sdk/setAdminRole.ts

import { getAuth } from 'firebase-admin/auth';

export async function elevateToAdmin(uid: string): Promise<void> {
  await getAuth().setCustomUserClaims(uid, { role: 'admin' });
  // Também atualiza o documento Firestore para consistência
  await updateUserRole(uid, 'admin');
}
```

O cliente nunca chama esta função diretamente. Ela só existe como endpoint protegido no servidor.

---

## 9. Prevenção de Confiança em `userId` do Cliente

### 9.1 Anti-padrão (nunca fazer)

```typescript
// ❌ ERRADO — aceitar uid do cliente
async function saveTrip(userId: string, trip: Trip) {
  await setDoc(doc(db, 'users', userId, 'trips', trip.id), trip);
  // Qualquer usuário autenticado poderia passar qualquer userId
}
```

### 9.2 Padrão correto (sempre usar)

```typescript
// ✅ CORRETO — uid sempre vem do Firebase Auth
import { getAuth } from 'firebase/auth';

async function saveTrip(trip: Trip) {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error('Usuário não autenticado');

  await setDoc(doc(db, 'users', uid, 'trips', trip.id), trip);
  // uid vem do token verificado pelo Firebase, não de entrada externa
}
```

### 9.3 Defesa em profundidade

| Camada | Mecanismo | Garante |
|--------|-----------|---------|
| **Client SDK** | `auth.currentUser.uid` hardcoded no path | uid correto na maioria dos casos |
| **Security Rules** | `request.auth.uid == uid` no path | Isolamento mesmo com bug de client |
| **Admin SDK** (futuro) | Token verificado com `admin.auth().verifyIdToken()` | uid autêntico no servidor |

---

## 10. Critérios de Aceite

### CA-AUTH-01: Cadastro
- [ ] Formulário valida e-mail (formato) e senha (mín. 8 chars) antes de chamar Firebase
- [ ] Cadastro bem-sucedido cria conta no Firebase Auth
- [ ] Documento `/users/{uid}` é criado com `role: 'user'` e `createdAt: serverTimestamp()`
- [ ] Campo `email` no Firestore vem de `user.email` (Firebase), não do input do formulário
- [ ] Cadastro com e-mail duplicado exibe: *"Este e-mail já está cadastrado. Tente fazer login."*
- [ ] Após cadastro, usuário é redirecionado para `/dashboard`

### CA-AUTH-02: Login
- [ ] Login bem-sucedido restaura `AuthContext.user` com dados do Firestore
- [ ] Login com senha errada exibe erro em português sem revelar qual campo está incorreto
- [ ] `loading` é `true` durante a operação; botão de submit é desabilitado
- [ ] Após login, `returnUrl` é respeitado (ex: `?returnUrl=/trips`)
- [ ] `returnUrl` externo (ex: `http://evil.com`) é ignorado → redireciona para `/dashboard`

### CA-AUTH-03: Logout
- [ ] Logout limpa `AuthContext.user` (= null)
- [ ] Após logout, qualquer rota privada redireciona para `/login`
- [ ] Após logout, novo acesso à `/login` não mostra dados do usuário anterior

### CA-AUTH-04: Recuperação de Senha
- [ ] Formulário aceita qualquer string como e-mail sem revelar se existe cadastro
- [ ] Mensagem de feedback é idêntica para e-mail existente e inexistente
- [ ] E-mail de redefinição é enviado para e-mail existente
- [ ] Link expirado exibe: *"O link de redefinição expirou. Solicite um novo."*

### CA-AUTH-05: Sessão
- [ ] Reload da página mantém o usuário autenticado
- [ ] `loading = true` durante resolução inicial da sessão (evita flash de redirect)
- [ ] `onAuthStateChanged` é registrado apenas uma vez (sem memory leak)
- [ ] Sessão expirada redireciona para `/login` com toast de aviso

### CA-AUTH-06: Proteção de Rotas
- [ ] Acesso a `/dashboard` sem autenticação redireciona para `/login?returnUrl=/dashboard`
- [ ] Acesso a `/login` com autenticação ativa redireciona para `/dashboard`
- [ ] `ProtectedRoute` não renderiza filhos enquanto `loading = true`

### CA-AUTH-07: Segurança de Papel
- [ ] `role: 'user'` é atribuído pelo código, nunca aceito do formulário
- [ ] Security Rule bloqueia update do campo `role` pelo próprio usuário
- [ ] Campo `email` do Firestore é imutável após criação (bloqueado por Rule)
- [ ] `uid` em paths do Firestore sempre vem de `auth.currentUser.uid`

### CA-AUTH-08: Isolamento entre usuários
- [ ] Usuário A não pode ler `/users/{uid_B}`
- [ ] Usuário A não pode escrever em `/users/{uid_B}/trips`
- [ ] Usuário não autenticado recebe `PERMISSION_DENIED` em qualquer leitura

---

## 11. Testes

### 11.1 Usuários de teste

```typescript
// test/fixtures/users.ts

export const USER_A = {
  uid:      'test-uid-alice',
  email:    'alice@smarttrip.test',
  password: 'Alice@2026!',
  name:     'Alice Teste',
};

export const USER_B = {
  uid:      'test-uid-bob',
  email:    'bob@smarttrip.test',
  password: 'Bob@2026!',
  name:     'Bob Teste',
};
```

### 11.2 Testes unitários — `auth.ts`

| # | Função | Cenário | Resultado esperado |
|---|--------|---------|-------------------|
| U-01 | `signUpWithEmail` | E-mail novo + senha forte | Resolve com `AuthResult` |
| U-02 | `signUpWithEmail` | E-mail já cadastrado | Rejeita com `auth/email-already-in-use` mapeado para pt-BR |
| U-03 | `signUpWithEmail` | Senha com < 8 chars | Rejeita com `auth/weak-password` mapeado |
| U-04 | `signInWithEmail` | Credenciais corretas | Resolve com `AuthResult` |
| U-05 | `signInWithEmail` | Senha errada | Rejeita com `auth/wrong-password` mapeado |
| U-06 | `signInWithEmail` | E-mail inexistente | Rejeita com `auth/user-not-found` mapeado |
| U-07 | `signOut` | Usuário autenticado | `auth.currentUser` é null após resolução |
| U-08 | `resetPassword` | E-mail existente | Resolve sem revelar sucesso ao chamador |
| U-09 | `mapAuthError` | Código desconhecido | Retorna mensagem genérica em pt-BR |

### 11.3 Testes de Security Rules — isolamento entre usuários

```typescript
// test/firestore-rules/auth-isolation.test.ts
// Usando @firebase/rules-unit-testing

describe('Isolamento entre usuários', () => {

  it('USER_A lê seu próprio perfil → OK', async () => {
    const db = getFirestoreAs(USER_A);
    await assertSucceeds(getDoc(doc(db, 'users', USER_A.uid)));
  });

  it('USER_A lê perfil do USER_B → NEGADO', async () => {
    const db = getFirestoreAs(USER_A);
    await assertFails(getDoc(doc(db, 'users', USER_B.uid)));
  });

  it('USER_A escreve trip no próprio perfil → OK', async () => {
    const db = getFirestoreAs(USER_A);
    await assertSucceeds(
      setDoc(doc(db, 'users', USER_A.uid, 'trips', 'trip-1'), {
        destination: { name: 'Salvador', latitude: -12.97, longitude: -38.50, country: 'BR' },
        period: { startDate: '2026-10-20', endDate: '2026-10-23', totalDays: 4 },
        config: { pace: 'moderate', budget: 'moderate', interests: [], restrictions: [] },
        status: 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  });

  it('USER_A escreve trip no perfil do USER_B → NEGADO', async () => {
    const db = getFirestoreAs(USER_A);
    await assertFails(
      setDoc(doc(db, 'users', USER_B.uid, 'trips', 'trip-1'), { status: 'draft' })
    );
  });

  it('USER_A tenta alterar role para admin → NEGADO', async () => {
    const db = getFirestoreAs(USER_A);
    await assertFails(
      updateDoc(doc(db, 'users', USER_A.uid), { role: 'admin' })
    );
  });

  it('USER_A tenta alterar email → NEGADO', async () => {
    const db = getFirestoreAs(USER_A);
    await assertFails(
      updateDoc(doc(db, 'users', USER_A.uid), { email: 'hacker@evil.com' })
    );
  });

  it('Usuário não autenticado lê qualquer doc → NEGADO', async () => {
    const db = getFirestoreAsUnauthenticated();
    await assertFails(getDoc(doc(db, 'users', USER_A.uid)));
  });

  it('Usuário não autenticado lê coleção trips → NEGADO', async () => {
    const db = getFirestoreAsUnauthenticated();
    await assertFails(
      getDocs(collection(db, 'users', USER_A.uid, 'trips'))
    );
  });
});
```

### 11.4 Testes de integração — fluxos end-to-end

| # | Fluxo | Passos | Resultado esperado |
|---|-------|--------|--------------------|
| E-01 | Cadastro completo | Preencher form → submit → reload | Usuário logado em `/dashboard` após reload |
| E-02 | Login → Logout → Acesso privado | Logar, deslogar, acessar `/trips` | Redirect para `/login` |
| E-03 | Login → acessar `/login` | Usuário logado navega para `/login` | Redirect automático para `/dashboard` |
| E-04 | Acessar rota privada sem login | Acessar `/dashboard` direto na URL | Redirect para `/login?returnUrl=/dashboard` |
| E-05 | `returnUrl` externo | `?returnUrl=http://evil.com` | Redirect para `/dashboard` (ignora externo) |
| E-06 | Reload com sessão ativa | Reload da página | Usuário mantido sem flash de redirect |
| E-07 | Cadastro com e-mail duplicado | Mesmo e-mail duas vezes | Erro visível em pt-BR; sem exceção não tratada |
| E-08 | Recuperação de senha | E-mail inexistente | Mensagem idêntica ao caso de e-mail existente |

### 11.5 Comandos para executar os testes

```bash
# Testes de Security Rules (requer emulador)
firebase emulators:start --only firestore &
npm run test:rules

# Testes unitários de auth.ts
npm run test:unit -- --testPathPattern=auth

# Testes E2E (Playwright / Cypress — fase futura)
npm run test:e2e
```

---

## 12. Riscos Específicos de Autenticação

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Flash de redirect (loading não aguardado) | Alta | Baixo | `if (loading) return <Spinner>` em ProtectedRoute |
| Enumeração de e-mails via erro de login | Média | Médio | Mensagem genérica: "E-mail ou senha incorretos" |
| `userId` enviado pelo cliente | Média | Crítico | Sempre usar `auth.currentUser.uid`; Rules como backup |
| Autoelevação de papel | Baixa | Crítico | Rule bloqueia escrita em `role` pelo próprio user |
| Memory leak do observer | Média | Baixo | `return unsubscribe` no useEffect |
| `returnUrl` open redirect | Baixa | Médio | Validar que começa com `/` antes de redirecionar |
| ID Token expirado em request | Baixa | Baixo | `getIdToken(true)` antes de chamar API server-side |
| Acesso a dados após logout | Baixa | Médio | `signOut()` + `setUser(null)` na mesma operação |

---

## 13. Ordem de Implementação Recomendada

```
1. errors.ts         → mapeamento de códigos pt-BR
       ↓
2. auth.ts           → signUp, signIn, signOut, resetPassword
       ↓
3. user.service.ts   → createUserProfile, getUserProfile
       ↓
4. AuthContext.tsx   → Provider + hook useAuth()
       ↓
5. Testar isolamento → testes de Security Rules com USER_A e USER_B
       ↓
6. ProtectedRoute    → guarda de rotas com loading guard
       ↓
7. LoginScreen       → integração real (remover mock)
8. RegisterScreen    → integração real (remover mock)
9. ForgotPassword    → integração real
       ↓
10. Testes E2E       → fluxos E-01 a E-08
```
