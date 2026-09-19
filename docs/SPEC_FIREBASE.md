# SPEC Técnica — Integração Firebase do SmartTrip

**Versão:** 1.0  
**Status:** Aprovada para implementação  
**Dependência:** SPEC Mestre (RF-001 a RF-022), SPEC Operacional, SPEC Interface-Base

---

## 1. Visão Geral

O SmartTrip utiliza dois produtos Firebase como infraestrutura principal de back-end:

| Produto | Papel |
|---------|-------|
| **Firebase Authentication** | Identidade do usuário (cadastro, login, sessão, logout) |
| **Cloud Firestore** | Persistência de dados (perfil, períodos de folga, roteiros, preferências) |

Ambos são consumidos exclusivamente via **Firebase Client SDK** no browser (React/Vite). O **Firebase Admin SDK** é reservado para uso futuro em Vercel Functions (rotas de API server-side) e **jamais deve ser incluído no bundle do browser**.

> ATENÇÃO: Nenhuma chave de serviço (service account JSON) deve existir no repositório ou ser transmitida ao browser. A segurança de dados depende das **Firestore Security Rules**, não do sigilo das chaves públicas.

---

## 2. Diferença: Client SDK vs. Admin SDK

```
BROWSER (React/Vite)                SERVER (Vercel Function / Node)
----------------------------------  ----------------------------------
firebase/app              <-->      firebase-admin
firebase/auth                       (Service Account JSON)
firebase/firestore

Autenticado pelo USUÁRIO            Autenticado pela APLICAÇÃO
Limitado pelas Rules                Ignora Rules (privilégio total)
Chaves PÚBLICAS (VITE_)             Chave PRIVADA (nunca no git)
```

### Regras de ouro

1. **Jamais** importe `firebase-admin` em código que rodará no browser.
2. **Jamais** use chave de conta de serviço em variável `VITE_*`.
3. O Admin SDK só existe quando/se houver rotas de API no servidor (fase pós-MVP).
4. A `GEMINI_API_KEY` segue a mesma regra: **sem prefixo `VITE_`**, exclusiva do servidor.

---

## 3. Variáveis de Ambiente

### 3.1 Classificação

| Variável | Lado | Pública? | Risco se exposta |
|----------|------|----------|------------------|
| `VITE_FIREBASE_API_KEY` | Browser | ✅ Sim¹ | Baixo (protegida por Rules) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Browser | ✅ Sim | Baixo |
| `VITE_FIREBASE_PROJECT_ID` | Browser | ✅ Sim | Baixo |
| `VITE_FIREBASE_STORAGE_BUCKET` | Browser | ✅ Sim | Baixo |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Browser | ✅ Sim | Baixo |
| `VITE_FIREBASE_APP_ID` | Browser | ✅ Sim | Baixo |
| `GEMINI_API_KEY` | Servidor | ❌ Não | **Alto** (cobrança ilimitada) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Servidor | ❌ Não | **Crítico** (acesso total ao banco) |

¹ As chaves `VITE_FIREBASE_*` são intencionalmente públicas por design do Firebase. Segurança real é garantida pelas **Security Rules**.

### 3.2 Arquivos por Ambiente

| Arquivo | Versionado? | Propósito |
|---------|-------------|-----------|
| `.env.example` | ✅ Sim | Template sem valores — documentação |
| `.env.local` | ❌ Não (gitignore) | Valores de desenvolvimento local |
| `.env.preview` | ❌ Não | Preview deploys (Vercel) |
| `.env.production` | ❌ Não | Produção — configurado no painel Vercel |

> AVISO: **Nunca** use o mesmo `VITE_FIREBASE_PROJECT_ID` em development e production.
> Crie projetos Firebase distintos: `smarttrip-dev` e `smarttrip-prod`.

### 3.3 Estratégia por Ambiente

```
development  -->  .env.local           -->  projeto Firebase: smarttrip-dev
preview      -->  Vercel env (preview)  -->  projeto Firebase: smarttrip-dev
production   -->  Vercel env (prod)     -->  projeto Firebase: smarttrip-prod
```

---

## 4. Arquivos e Módulos Conceituais

### 4.1 Estrutura de arquivos

```
src/
├── services/
│   ├── firebase/
│   │   ├── config.ts          ← inicialização singleton do app Firebase
│   │   ├── auth.ts            ← funções de autenticação
│   │   ├── firestore.ts       ← cliente Firestore + helpers de coleções
│   │   └── index.ts           ← barrel: re-exporta auth, firestore
│   ├── user.service.ts        ← CRUD de perfil de usuário
│   ├── timeOff.service.ts     ← CRUD de períodos de folga
│   └── trip.service.ts        ← CRUD de roteiros
firestore.rules                ← Security Rules (versionadas no git)
.firebaserc                    ← aliases de projeto dev/prod
firebase.json                  ← configuração de deploy das rules
```

### 4.2 `src/services/firebase/config.ts` — Inicialização Singleton

**Responsabilidade:** Criar e exportar a instância única do Firebase App, prevenindo a exceção
`Firebase: Firebase App named '[DEFAULT]' already exists`.

**Contrato conceitual:**

```typescript
// CONCEITUAL — não implementar até esta SPEC ser aprovada

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Padrão anti-duplicata: reutiliza app existente em Hot Module Replacement
const app: FirebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

export default app;
```

**Validação de ambiente (guard obrigatório):**

```typescript
const REQUIRED_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
] as const;

if (import.meta.env.DEV) {
  REQUIRED_VARS.forEach((key) => {
    if (!import.meta.env[key]) {
      console.error(`[SmartTrip] Variável de ambiente ausente: ${key}`);
    }
  });
}
```

**Riscos mitigados:**
- HMR do Vite pode re-executar o módulo → `getApps().length === 0` evita dupla inicialização.
- Variável ausente causaria `projectId: undefined` silencioso → guard com `console.error` em DEV.

### 4.3 `src/services/firebase/auth.ts`

**Responsabilidade:** Exportar a instância do `Auth` e funções de identidade utilizadas pela UI.

**Funções a expor:**

| Função | RF | Descrição |
|--------|-----|-----------|
| `signUpWithEmail(email, password, name)` | RF-001 | Cadastro + `updateProfile` |
| `signInWithEmail(email, password)` | RF-002 | Login por e-mail |
| `signOut()` | RF-003 | Logout e limpeza de estado local |
| `onAuthChange(callback)` | RF-004 | Observer de sessão para contexto React |
| `resetPassword(email)` | RF-005 | Envio de e-mail de redefinição |
| `getCurrentUser()` | — | Snapshot síncrono do usuário atual |

**Regras de implementação:**
- Toda função deve retornar `Promise<void>` ou `Promise<User>` com tipagem explícita.
- Erros Firebase (`auth/wrong-password`, `auth/email-already-in-use`) devem ser mapeados
  para mensagens em português antes de serem relançados para a UI.
- `onAuthChange` deve ser chamado apenas uma vez, no `AuthContext`.

### 4.4 `src/services/firebase/firestore.ts`

**Responsabilidade:** Exportar a instância do Firestore e helpers de coleções tipadas.

**Helpers de coleções:**

```typescript
// CONCEITUAL
import { collection, CollectionReference } from 'firebase/firestore';

export const collections = {
  users:    () => collection(db, 'users')    as CollectionReference<UserProfile>,
  timeOffs: (uid: string) =>
              collection(db, 'users', uid, 'timeOffs') as CollectionReference<TimeOff>,
  trips:    (uid: string) =>
              collection(db, 'users', uid, 'trips')    as CollectionReference<Trip>,
};
```

**Por que helpers:** Evita erros de digitação em nomes de coleção e centraliza refatoração.

---

## 5. Modelo de Dados no Firestore

### 5.1 Hierarquia de Coleções

```
/users/{uid}                          ← documento de perfil
  /timeOffs/{timeOffId}               ← subcoleção: períodos de folga
  /trips/{tripId}                     ← subcoleção: roteiros
```

### 5.2 Documento `/users/{uid}`

```typescript
{
  name:        string,
  email:       string,            // imutável após criação
  avatarUrl:   string | null,
  isPro:       boolean,
  preferences: {
    travelStyle: 'relaxed' | 'moderate' | 'intense',
    budget:      'budget' | 'moderate' | 'luxury',
    interests:   string[],
    restrictions: string[],
    currency:    'BRL' | 'USD' | 'EUR',
  },
  createdAt:   Timestamp,         // serverTimestamp() — imutável
  updatedAt:   Timestamp,         // serverTimestamp() em toda atualização
}
```

### 5.3 Documento `/users/{uid}/trips/{tripId}`

```typescript
{
  destination: { name: string, latitude: number, longitude: number, country: string },
  period:      { startDate: string, endDate: string, totalDays: number }, // ISO 8601
  config:      { pace: string, budget: string, interests: string[], restrictions: string[] },
  itinerary:   ItineraryDay[],    // array JSON (output do Gemini)
  status:      'draft' | 'saved' | 'completed',
  createdAt:   Timestamp,
  updatedAt:   Timestamp,
  geminiPrompt: string,           // prompt enviado (auditoria)
  geminiModel:  string,           // ex: 'gemini-2.0-flash'
}
```

---

## 6. Estratégia para Timestamps

> IMPORTANTE: Use `serverTimestamp()` do Firestore para `createdAt` e `updatedAt`.
> **Nunca** use `new Date()` ou `Date.now()` para campos de banco de dados.

**Motivo:** `serverTimestamp()` usa o relógio do servidor Firebase, evitando discrepâncias
entre fusos horários de clientes diferentes.

```typescript
import { serverTimestamp, Timestamp } from 'firebase/firestore';

// Criação:
await addDoc(tripsRef, {
  ...tripData,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

// Atualização:
await updateDoc(tripRef, {
  status: 'saved',
  updatedAt: serverTimestamp(),
});

// Leitura → Date JavaScript:
const date: Date = (doc.data().createdAt as Timestamp).toDate();
```

**Datas de viagem** (startDate, endDate) são strings ISO 8601 (`'2026-10-20'`), **não Timestamps**.

---

## 7. Security Rules — Requisito Obrigatório

> CRÍTICO: A aplicação **não pode ir para produção** sem Security Rules revisadas e testadas.
> Rules permissivas (modo teste) expiram em 30 dias e expõem todos os dados.

### 7.1 Princípio de menor privilégio

Cada regra deve garantir:
1. **Autenticação**: `request.auth != null`
2. **Propriedade**: `request.auth.uid == uid` (via hierarquia da coleção)
3. **Validação de dados**: campos obrigatórios e tipos no `request.resource.data`

### 7.2 Rules conceituais para o MVP

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(uid) {
      return request.auth.uid == uid;
    }

    match /users/{uid} {
      allow read:   if isAuthenticated() && isOwner(uid);
      allow create: if isAuthenticated() && isOwner(uid)
                    && request.resource.data.email == request.auth.token.email;
      allow update: if isAuthenticated() && isOwner(uid)
                    && !request.resource.data.diff(resource.data)
                       .affectedKeys().hasAny(['createdAt', 'email']);
      allow delete: if false; // exclusão somente via Admin SDK

      match /timeOffs/{timeOffId} {
        allow read, write: if isAuthenticated() && isOwner(uid);
      }

      match /trips/{tripId} {
        allow read:   if isAuthenticated() && isOwner(uid);
        allow create: if isAuthenticated() && isOwner(uid)
                      && request.resource.data.keys().hasAll(
                           ['destination', 'period', 'config', 'status', 'createdAt']
                         );
        allow update: if isAuthenticated() && isOwner(uid);
        allow delete: if isAuthenticated() && isOwner(uid);
      }
    }

    // Bloquear tudo que não foi mapeado explicitamente
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 7.3 Testes obrigatórios de Security Rules

Suite com `@firebase/rules-unit-testing`:

| Cenário | Expectativa |
|---------|-------------|
| Não autenticado lê `/users/{uid}` | `PERMISSION_DENIED` |
| Usuário A lê documento do Usuário B | `PERMISSION_DENIED` |
| Usuário lê seu próprio perfil | `OK` |
| Criar trip com campos obrigatórios | `OK` |
| Criar trip sem `destination` | `PERMISSION_DENIED` |
| Alterar `createdAt` em update | `PERMISSION_DENIED` |
| Deletar próprio trip | `OK` |
| Acessar coleção não mapeada | `PERMISSION_DENIED` |

---

## 8. Tratamento de Erros Firebase

### 8.1 Mapeamento Auth → pt-BR

```typescript
// src/services/firebase/errors.ts
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use':   'Este e-mail já está cadastrado.',
  'auth/invalid-email':          'E-mail inválido.',
  'auth/weak-password':          'Senha muito fraca. Use ao menos 8 caracteres.',
  'auth/wrong-password':         'Senha incorreta.',
  'auth/user-not-found':         'Nenhuma conta encontrada com este e-mail.',
  'auth/too-many-requests':      'Muitas tentativas. Aguarde alguns minutos.',
  'auth/network-request-failed': 'Sem conexão com a internet.',
  'auth/user-disabled':          'Esta conta foi desativada.',
};

export function mapAuthError(code: string): string {
  return AUTH_ERROR_MESSAGES[code] ?? 'Ocorreu um erro inesperado. Tente novamente.';
}
```

### 8.2 Erros Firestore

| Código | Causa | Ação |
|--------|-------|------|
| `permission-denied` | Rule bloqueou | Verificar autenticação e Rules |
| `unavailable` | Offline | Retry com back-off exponencial |
| `not-found` | Documento inexistente | Criar antes de atualizar |
| `quota-exceeded` | Cota do plano excedida | Alertar administrador |

---

## 9. Firebase Storage (Extensão Pós-MVP)

Storage não integra o MVP. Quando implementado:

- **Caminho**: `/avatars/{uid}/profile.jpg`
- **Rules**: apenas o próprio usuário lê/escreve
- **Limite**: 5 MB por arquivo, validado via Rules
- **Variável**: `VITE_FIREBASE_STORAGE_BUCKET` já está no `.env.example`

---

## 10. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Credenciais no repositório | Média | Crítico | `.gitignore` para `.env.local`; scan no CI |
| Rules permissivas em produção | Alta | Crítico | Testes de Rules obrigatórios antes do deploy |
| Dupla inicialização do Firebase | Alta | Baixo | `getApps().length === 0` |
| `serverTimestamp()` null no cliente | Média | Baixo | `Timestamp.now()` como fallback de leitura |
| GEMINI_API_KEY exposta no bundle | Baixa | Crítico | Nunca usar prefixo `VITE_`; apenas via API Route |
| Custo inesperado do Firestore | Baixa | Médio | Alertas de orçamento no Console Firebase |
| Índices compostos ausentes | Média | Baixo | Criar índices antes de queries com `orderBy+where` |

---

## 11. Critérios de Aceite

### CA-FB-01: Inicialização
- [ ] App Firebase inicializa sem erro em dev, preview e prod
- [ ] `getApps().length === 0` previne exceção de app duplicado
- [ ] Variáveis ausentes emitem `console.error` claro em DEV

### CA-FB-02: Autenticação
- [ ] Cadastro cria conta + documento `/users/{uid}` no Firestore
- [ ] Login restaura sessão após reload da página
- [ ] Logout limpa estado local e redireciona para `/login`
- [ ] Erros de auth exibem mensagem em português
- [ ] Redefinição de senha envia e-mail

### CA-FB-03: Firestore
- [ ] Perfil do usuário é lido/escrito apenas pelo próprio usuário
- [ ] Roteiros são listados, criados e excluídos com sucesso
- [ ] `createdAt` e `updatedAt` usam `serverTimestamp()`
- [ ] Nenhuma query falha por índice ausente

### CA-FB-04: Security Rules
- [ ] Suite de testes com `@firebase/rules-unit-testing` passa 100%
- [ ] Usuário não autenticado não lê nenhum dado
- [ ] Usuário A não acessa dados do Usuário B
- [ ] Campos `createdAt` e `email` são imutáveis após criação

### CA-FB-05: Segurança de Variáveis
- [ ] `GEMINI_API_KEY` não aparece no bundle gerado pelo `vite build`
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` nunca existe no repositório
- [ ] `.env.example` contém apenas chaves sem valores

### CA-FB-06: Ambientes
- [ ] Dev usa projeto Firebase distinto de Produção
- [ ] Build de produção lê variáveis do painel Vercel
- [ ] Preview deploy usa projeto de dev (não produção)

---

## 12. Ordem de Implementação Recomendada

```
1. config.ts        → Singleton + guard de variáveis
       ↓
2. auth.ts          → Funções de autenticação
       ↓
3. firestore.ts     → Helpers de coleção tipados
       ↓
4. Security Rules   → Escrever + testar com rules-unit-testing
       ↓
5. user.service.ts  → CRUD de perfil
       ↓
6. AuthContext      → Observer de sessão (onAuthChange)
       ↓
7. ProtectedRoute   → Redirecionamento de rotas privadas
       ↓
8. timeOff.service + trip.service → CRUD completo
       ↓
9. Deploy staging   → Validação E2E com dados reais
```

> DICA: Implemente e valide as Security Rules **antes** de integrar os serviços na UI.
> Testar Rules com dados reais de produção é tarde demais.
