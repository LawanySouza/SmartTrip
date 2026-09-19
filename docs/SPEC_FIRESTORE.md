# SPEC Técnica — Modelagem Cloud Firestore do SmartTrip (MVP)

**Versão:** 1.0  
**Status:** Especificação Técnica de Banco de Dados  
**Dependências:** SPEC Mestre, SPEC Operacional, SPEC Firebase, SPEC Autenticação  

---

## 1. Visão Geral e Princípios Arquiteturais

Esta especificação define o modelo de dados completo do **Cloud Firestore** para o SmartTrip (MVP), cobrindo as 5 entidades essenciais:
1. `users` (Perfil e Identidade de Negócio)
2. `availability` (Períodos de Folga, Férias e Feriados)
3. `preferences` (Preferências de Estilo, Orçamento e Ritmo de Viagem)
4. `trips` (Roteiros de Viagem)
5. `itineraryItems` (Atividades Granulares do Roteiro)

### 1.1 Princípios de Decisão: Coleção Raiz vs. Subcoleção

No Firestore, a decisão entre **Coleção Raiz** (`/collection/{id}`) e **Subcoleção** (`/parent/{id}/subcollection/{subId}`) afeta segurança, custo de leitura/escrita, concorrência e escalabilidade:

| Critério | Coleção Raiz | Subcoleção |
| :--- | :--- | :--- |
| **Isolamento de Segurança** | Requer `resource.data.userId == request.auth.uid` em cada documento. | Nativo pelo path: `/users/{userId}/...` com `request.auth.uid == userId`. |
| **Consultas de Coleção** | Consultas globais ou multi-usuário são diretas (`collection(db, 'trips')`). | Consultas entre pais diferentes exigem *Collection Group Queries* e índices dedicados. |
| **Limites de Tamanho** | Não impacta documentos pais. | Não impacta documentos pais (cada documento tem limite próprio de 1 MB). |
| **Exclusão em Cascata** | Desacoplado; remoção do usuário não bloqueia documentos órfãos. | Firestore **não** apaga subcoleções automaticamente ao deletar o pai (exige cleanup em cascata). |
| **Uso no SmartTrip** | Entidades de primeiro nível ou públicas (`users`, `trips`). | Entidades estritamente privadas ou dependentes do ciclo de vida do pai (`availability`, `preferences`, `itineraryItems`). |

### 1.2 Regras contra Desnormalização sem Justificativa

A desnormalização em bancos NoSQL deve ser uma decisão consciente para economizar leituras críticas ou garantir consistência histórica (snapshots), e **não** um hábito descontrolado:
- **Permitida:**
  - `userSnapshot` dentro de `trips` apenas se dados históricos não puderem mudar retrospectivamente.
  - Campos agregados numéricos (`savedTripsCount`) quando a contagem evita queries de listagem com custo alto.
- **Proibida:**
  - Duplicar dados volumosos mutáveis (ex: nome, avatar) em múltiplas entidades sem rotina de sincronização.
  - Criar arrays de IDs que possam crescer indefinidamente (risco de estourar o limite de 1 MB).

---

## 2. Modelagem Detalhada por Entidade

---

### 2.1 Entidade: `users`

Representa o perfil da conta e identidade de negócio da pessoa usuária no SmartTrip.

#### Caminho (Path)
`/users/{uid}` (Coleção Raiz; o ID do documento é **obrigatoriamente o UID do Firebase Auth**).

#### Justificativa Estrutural
Coleção de raiz. O ID determinístico (`uid`) garante que cada conta do Firebase Auth possua no máximo 1 documento de perfil, dispensando buscas por e-mail para encontrar o usuário e permitindo regras de segurança 1:1 imediatas.

#### Campos e Tipos

| Campo | Tipo | Obrigatório | Descrição / Restrições |
| :--- | :--- | :--- | :--- |
| `uid` | `string` | Sim | Espelho do UID de autenticação. Imutável. |
| `name` | `string` | Sim | Nome de exibição (mínimo 2, máximo 80 caracteres). |
| `email` | `string` | Sim | E-mail registrado no Firebase Auth. Imutável pelo cliente. |
| `avatar` | `string` | Sim | URL do avatar ou string de avatar fallback. |
| `role` | `string` | Sim | Papel no sistema (`'user'` ou `'admin'`). Imutável pelo cliente. |
| `isPro` | `boolean` | Sim | Flag indicando plano Pro/Premium. Padrão `false`. |
| `savedTripsCount` | `number` | Não | Contador agregado de viagens salvas (inteiro >= 0). |
| `emailVerified` | `boolean` | Não | Espelho do status de verificação de e-mail do Auth. |
| `createdAt` | `timestamp` | Sim | Timestamp gerado no servidor na criação. Imutável. |
| `updatedAt` | `timestamp` | Sim | Timestamp gerado no servidor na última alteração. |

#### Proprietário (Owner)
O próprio usuário autenticado cujo `request.auth.uid == uid`.

#### Timestamps
- `createdAt`: Preenchido exclusivamente com `serverTimestamp()` no momento do primeiro cadastro.
- `updatedAt`: Preenchido exclusivamente com `serverTimestamp()` a cada mutação de perfil.

#### Índices Esperados
- **Automáticos (Single-field):** `email`, `role`, `createdAt`.
- **Compostos:** Nenhum necessário no MVP (acesso prioritário por ID do documento: `doc(db, 'users', uid)`).

#### Exemplo de Documento (`/users/U7xK9pL2vNmQ4wR8`)
```json
{
  "uid": "U7xK9pL2vNmQ4wR8",
  "name": "Mariana Souza",
  "email": "mariana.souza@smarttrip.com.br",
  "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana",
  "role": "user",
  "isPro": false,
  "savedTripsCount": 3,
  "emailVerified": true,
  "createdAt": "2026-03-10T14:20:00.000Z",
  "updatedAt": "2026-09-15T09:12:30.000Z"
}
```

#### Regras de Leitura e Escrita
```javascript
match /users/{userId} {
  // Leitura: usuário lê seu próprio perfil; administradores podem ler qualquer um
  allow read: if isOwner(userId) || isAdmin();

  // Criação: somente se autenticado com o mesmo UID, com role 'user' e isPro false
  allow create: if isOwner(userId) 
                && request.resource.data.role == 'user'
                && request.resource.data.isPro == false
                && request.resource.data.createdAt == request.time
                && request.resource.data.updatedAt == request.time;

  // Atualização: não pode autoelevar role nem alterar email ou createdAt
  allow update: if isOwner(userId)
                && request.resource.data.role == resource.data.role
                && request.resource.data.isPro == resource.data.isPro
                && request.resource.data.email == resource.data.email
                && request.resource.data.createdAt == resource.data.createdAt
                && request.resource.data.updatedAt == request.time;

  // Exclusão: proibida para clientes comuns (somente via backend/Admin SDK)
  allow delete: if isAdmin();
}
```

#### Estratégia de Exclusão
- **Soft Delete vs Hard Delete:** No MVP, utiliza-se deleção lógica (`deletedAt: timestamp`) ou retenção bloqueada no cliente. A exclusão definitiva (LGPD) é acionada via Cloud Function autenticada ao deletar o usuário no Firebase Auth, expurgando em cascata as subcoleções.

#### Risco de Duplicação
- **Nulo:** O uso do UID do Firebase Auth como chave do documento garante chave única natural e criação idempotente.

#### Consultas Previstas
1. Obter perfil do usuário logado:  
   `getDoc(doc(db, 'users', currentUid))`

---

### 2.2 Entidade: `preferences`

Configurações e parâmetros de personalização que o algoritmo de geração do SmartTrip utiliza (estilo de viagem, orçamento, interesses e restrições).

#### Caminho (Path)
`/users/{uid}/settings/preferences`  
*(Documento singleton em subcoleção estruturada `settings` do usuário)*

#### Justificativa Estrutural
- **Por que subcoleção e não documento embutido em `users`?**  
  Embora o payload seja enxuto (~300 bytes), isolar `preferences` em `/users/{uid}/settings/preferences` proporciona:
  1. **Separação de responsabilidades e controle fino de permissões:** Atualizar preferências não exige permissão de gravação no perfil principal do usuário (`/users/{uid}`), prevenindo vetores de mutação acidental de campos sensíveis de conta (`email`, `isPro`, `role`).
  2. **Cache e payload:** A tela `/profile` ou o assistente `/new_trip` podem subscrever apenas às preferências sem re-renderizar dados de conta.
  3. **Idempotência simples:** Caminho determinístico fixo `settings/preferences` garante cardinalidade 1:1 estrita.

#### Campos e Tipos

| Campo | Tipo | Obrigatório | Descrição / Restrições |
| :--- | :--- | :--- | :--- |
| `travelStyle` | `string` | Sim | Ritmo da viagem: `'relaxed'` \| `'moderate'` \| `'intense'`. |
| `budget` | `string` | Sim | Nível de gastos: `'budget'` \| `'moderate'` \| `'luxury'`. |
| `preferredInterests`| `array[string]` | Sim | Lista de tags de interesse (ex: `['gastronomia', 'historia']`). |
| `restrictions` | `array[string]` | Sim | Restrições alimentares ou mobilidade (ex: `['vegetariano']`). |
| `currency` | `string` | Sim | Código monetário ISO (ex: `'BRL'`, `'USD'`, `'EUR'`). |
| `homeAirport` | `string` | Não | Código IATA ou cidade de origem preferencial (ex: `'GRU'`). |
| `updatedAt` | `timestamp` | Sim | Data/hora da última alteração das preferências. |

#### Proprietário (Owner)
O usuário identificado no path `{uid}`.

#### Timestamps
- `updatedAt`: Atualizado com `serverTimestamp()` a cada salvamento.

#### Índices Esperados
- Apenas índices automáticos (documento único pontual acessado diretamente pelo caminho).

#### Exemplo de Documento (`/users/U7xK9pL2vNmQ4wR8/settings/preferences`)
```json
{
  "travelStyle": "moderate",
  "budget": "moderate",
  "preferredInterests": [
    "Gastronomia típica",
    "Centro Histórico & Cultura",
    "Passeios ao ar livre"
  ],
  "restrictions": [
    "Vegetariano",
    "Evitar escadas longas"
  ],
  "currency": "BRL",
  "homeAirport": "GRU",
  "updatedAt": "2026-09-12T18:00:00.000Z"
}
```

#### Regras de Leitura e Escrita
```javascript
match /users/{userId}/settings/preferences {
  allow read, write: if isOwner(userId);
  
  allow write: if isOwner(userId)
               && request.resource.data.travelStyle in ['relaxed', 'moderate', 'intense']
               && request.resource.data.budget in ['budget', 'moderate', 'luxury']
               && request.resource.data.preferredInterests is list
               && request.resource.data.restrictions is list
               && request.resource.data.updatedAt == request.time;
}
```

#### Estratégia de Exclusão
- Deletado automaticamente caso a conta do usuário seja removida. Não há exclusão individual de preferências pela interface (apenas reset para os valores padrão com `setDoc`).

#### Risco de Duplicação
- **Inexistente:** O documento possui ID fixo (`preferences`) sob o nó `/users/{uid}/settings/`.

#### Consultas Previstas
1. Carregar preferências do usuário logado:  
   `getDoc(doc(db, 'users', currentUid, 'settings', 'preferences'))`
2. Salvar/Atualizar preferências:  
   `setDoc(doc(db, 'users', currentUid, 'settings', 'preferences'), preferencesData, { merge: true })`

---

### 2.3 Entidade: `availability`

Períodos livres, férias agendadas, feriados prolongados e folgas cadastradas pelo viajante para planejar roteiros compatíveis.

#### Caminho (Path)
`/users/{uid}/availability/{availabilityId}`  
*(Subcoleção sob o usuário)*

#### Justificativa Estrutural
Subcoleção sob `/users/{uid}`. Disponibilidade é um dado estritamente pessoal, sem compartilhamento com outros usuários no MVP. Subcoleções mantêm os dados isolados por proprietário, garantindo segurança na raiz da regra e eliminando o risco de vazamento de datas pessoais.

#### Campos e Tipos

| Campo | Tipo | Obrigatório | Descrição / Restrições |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Sim | Identificador único da folga (UUID ou Firestore Auto-ID). |
| `userId` | `string` | Sim | UID do usuário proprietário (redundância segura). |
| `title` | `string` | Sim | Rótulo descritivo (ex: `"Férias de Julho"`, `"Páscoa"`). |
| `startDate` | `string` | Sim | Data inicial em formato ISO `"YYYY-MM-DD"`. |
| `endDate` | `string` | Sim | Data final em formato ISO `"YYYY-MM-DD"`. |
| `durationDays` | `number` | Sim | Quantidade de dias corridos do período (inteiro >= 1). |
| `type` | `string` | Sim | Categoria: `'vacation'` \| `'holiday'` \| `'long_weekend'` \| `'other'`. |
| `status` | `string` | Sim | Estado: `'planned'` \| `'confirmed'` \| `'used'`. |
| `notes` | `string` | Não | Observações e anotações do viajante (máx. 500 caracteres). |
| `linkedTripId` | `string` | Não | ID da viagem associada a este período, se houver. |
| `createdAt` | `timestamp` | Sim | Timestamp de criação no servidor. |
| `updatedAt` | `timestamp` | Sim | Timestamp de atualização no servidor. |

#### Proprietário (Owner)
O usuário especificado na hierarquia de path `{uid}` e no campo `userId`.

#### Timestamps
- `createdAt`: `serverTimestamp()` no momento da inserção.
- `updatedAt`: `serverTimestamp()` em qualquer alteração de datas ou status.

#### Índices Esperados
1. **Single-field:** `startDate` (ASC), `endDate` (ASC), `type`.
2. **Índice Composto (Subcoleção):**
   - Coleção: `availability`
   - Campos: `startDate` (ASC) + `createdAt` (DESC)  
   - Propósito: Listar próximas folgas cronologicamente.

#### Exemplo de Documento (`/users/U7xK9pL2vNmQ4wR8/availability/av_987xyz123`)
```json
{
  "id": "av_987xyz123",
  "userId": "U7xK9pL2vNmQ4wR8",
  "title": "Férias de Inverno",
  "startDate": "2026-07-10",
  "endDate": "2026-07-24",
  "durationDays": 15,
  "type": "vacation",
  "status": "confirmed",
  "notes": "Período aprovado pelo RH. Foco em destinos de serra.",
  "linkedTripId": "trip_serragaucha_2026",
  "createdAt": "2026-04-01T10:00:00.000Z",
  "updatedAt": "2026-04-01T10:00:00.000Z"
}
```

#### Regras de Leitura e Escrita
```javascript
match /users/{userId}/availability/{availabilityId} {
  allow read: if isOwner(userId);
  
  allow create: if isOwner(userId)
                && request.resource.data.userId == userId
                && request.resource.data.durationDays > 0
                && request.resource.data.startDate <= request.resource.data.endDate
                && request.resource.data.createdAt == request.time
                && request.resource.data.updatedAt == request.time;

  allow update: if isOwner(userId)
                && request.resource.data.userId == userId
                && request.resource.data.createdAt == resource.data.createdAt
                && request.resource.data.updatedAt == request.time;

  allow delete: if isOwner(userId);
}
```

#### Estratégia de Exclusão
- **Hard Delete:** O usuário pode remover uma folga diretamente pela tela `/availability`. Se a folga estiver vinculada a um roteiro existente (`linkedTripId`), a aplicação avisa o usuário antes de confirmar a exclusão.

#### Risco de Duplicação
- **Médio (sobreposição de datas):** A interface deve validar antes da gravação se há conflito ou sobreposição de datas com períodos já cadastrados, alertando o usuário sobre folgas concorrentes.

#### Consultas Previstas
1. Listar folgas futuras do usuário ordenadas por data:  
   `query(collection(db, 'users', uid, 'availability'), where('endDate', '>=', todayIso), orderBy('startDate', 'asc'))`
2. Obter detalhes de um período específico:  
   `getDoc(doc(db, 'users', uid, 'availability', availabilityId))`

---

### 2.4 Entidade: `trips`

Roteiro de viagem consolidado, contendo destino, datas, metadados de configuração e resumo do plano.

#### Caminho (Path)
`/trips/{tripId}` (Coleção Raiz)

#### Justificativa Estrutural
- **Por que Coleção Raiz e não subcoleção de `/users/{uid}/trips`?**  
  1. **Suporte a Compartilhamento e Modo Público:** O SmartTrip prevê a tela `/explore` (roteiros inspiracionais da comunidade) e compartilhamento de roteiros via link com amigos ou família (modo visualização sem login obrigatório).  
  2. Com `/trips/{tripId}`, um roteiro com `visibility: 'public'` pode ser lido diretamente por qualquer usuário sem necessidade de *Collection Group Query* com permissões complexas.
  3. No caso de viagens privadas, a consulta `query(collection(db, 'trips'), where('userId', '==', currentUid))` é simples, eficiente e atende à listagem do `/dashboard` e `/trips`.

#### Campos e Tipos

| Campo | Tipo | Obrigatório | Descrição / Restrições |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Sim | Identificador único do roteiro (ID do documento). |
| `userId` | `string` | Sim | UID do proprietário autor da viagem. |
| `title` | `string` | Sim | Título da viagem (ex: `"7 Dias em Buenos Aires"`). |
| `destination` | `map` | Sim | Objeto estruturado com `name` (string), `country` (string), `latitude` (number), `longitude` (number). |
| `period` | `map` | Sim | Objeto estruturado com `startDate` (ISO string), `endDate` (ISO string) e `totalDays` (number). |
| `config` | `map` | Sim | Configurações usadas: `pace` (string), `budget` (string), `interests` (array), `restrictions` (array). |
| `status` | `string` | Sim | Estado: `'draft'` \| `'saved'` \| `'completed'` \| `'archived'`. |
| `visibility` | `string` | Sim | Visibilidade: `'private'` \| `'shared'` \| `'public'`. |
| `weatherSummary` | `map` | Não | Previsão climática compilada (temperatura média, condição, alerta). |
| `daysCount` | `number` | Sim | Total de dias planejados no itinerário. |
| `totalEstimatedCost` | `string` | Não | Resumo do orçamento estimado (ex: `"R$ 4.200,00"`). |
| `coverImageUrl` | `string` | Não | Imagem de capa temática do destino. |
| `generationMeta` | `map` | Não | Metadados do LLM (modelo, tokens, promptVersion, timestamp). |
| `createdAt` | `timestamp` | Sim | Data e hora de criação no servidor. |
| `updatedAt` | `timestamp` | Sim | Data e hora de atualização no servidor. |

#### Proprietário (Owner)
Usuário cujo UID coincide com o campo `userId`.

#### Timestamps
- `createdAt`: `serverTimestamp()` no salvamento inicial.
- `updatedAt`: `serverTimestamp()` a cada alteração de título, status ou itens.

#### Índices Esperados
1. **Single-field:** `userId`, `status`, `visibility`, `createdAt`.
2. **Compostos:**
   - `userId` (ASC) + `createdAt` (DESC) — Listagem das viagens do usuário no dashboard.
   - `userId` (ASC) + `status` (ASC) + `createdAt` (DESC) — Filtro por status (ex: "Minhas viagens ativas").
   - `visibility` (ASC) + `createdAt` (DESC) — Feed da tela `/explore` para viagens públicas.

#### Exemplo de Documento (`/trips/trip_bue_2026_xyz`)
```json
{
  "id": "trip_bue_2026_xyz",
  "userId": "U7xK9pL2vNmQ4wR8",
  "title": "Exploração Cultural em Buenos Aires",
  "destination": {
    "name": "Buenos Aires",
    "country": "Argentina",
    "latitude": -34.6037,
    "longitude": -58.3816
  },
  "period": {
    "startDate": "2026-10-10",
    "endDate": "2026-10-15",
    "totalDays": 6
  },
  "config": {
    "pace": "moderate",
    "budget": "moderate",
    "interests": ["Gastronomia típica", "Tango & Espetáculos", "Cafés Históricos"],
    "restrictions": []
  },
  "status": "saved",
  "visibility": "private",
  "weatherSummary": {
    "tempMin": 14,
    "tempMax": 23,
    "condition": "Ensolarado com noites amenas",
    "recommendation": "Levar casaco leve para as noites em San Telmo"
  },
  "daysCount": 6,
  "totalEstimatedCost": "R$ 3.800,00",
  "coverImageUrl": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849",
  "generationMeta": {
    "model": "gemini-2.5-flash",
    "promptVersion": "v1.2",
    "generatedAt": "2026-09-19T14:30:00.000Z"
  },
  "createdAt": "2026-09-19T14:30:00.000Z",
  "updatedAt": "2026-09-19T14:30:00.000Z"
}
```

#### Regras de Leitura e Escrita
```javascript
match /trips/{tripId} {
  // Leitura: proprietário, administrador ou qualquer pessoa se o roteiro for público
  allow read: if isOwner(resource.data.userId) 
              || resource.data.visibility == 'public'
              || isAdmin();

  // Criação: autenticado, declarando-se proprietário, com timestamps válidos
  allow create: if isAuthenticated()
                && request.resource.data.userId == request.auth.uid
                && request.resource.data.daysCount > 0
                && request.resource.data.createdAt == request.time
                && request.resource.data.updatedAt == request.time;

  // Atualização: apenas o proprietário pode editar
  allow update: if isOwner(resource.data.userId)
                && request.resource.data.userId == resource.data.userId
                && request.resource.data.createdAt == resource.data.createdAt
                && request.resource.data.updatedAt == request.time;

  // Exclusão: apenas o proprietário ou admin
  allow delete: if isOwner(resource.data.userId) || isAdmin();
}
```

#### Estratégia de Exclusão
- **Opção recomendada para MVP:** Exclusão lógica com transição de status (`status: 'archived'`), permitindo recuperação em caso de clique acidental.
- **Hard Delete:** Caso o usuário opte por "Excluir permanentemente", aciona-se um `writeBatch` que remove o documento `/trips/{tripId}` e todos os documentos da subcoleção `/trips/{tripId}/itineraryItems`.

#### Risco de Duplicação
- **Baixo:** Cada geração por IA recebe um ID exclusivo gerado pelo cliente (`crypto.randomUUID()`) ou pelo Firestore `doc()`, evitando colisões mesmo em cliques rápidos.

#### Consultas Previstas
1. Minhas viagens recentes (Dashboard):  
   `query(collection(db, 'trips'), where('userId', '==', uid), orderBy('createdAt', 'desc'), limit(10))`
2. Viagens por status:  
   `query(collection(db, 'trips'), where('userId', '==', uid), where('status', '==', 'saved'), orderBy('createdAt', 'desc'))`
3. Feed público (Explore):  
   `query(collection(db, 'trips'), where('visibility', '==', 'public'), orderBy('createdAt', 'desc'), limit(20))`

---

### 2.5 Entidade: `itineraryItems`

Atividades individuais, pontos turísticos, restaurantes e deslocamentos que compõem cada dia do roteiro de uma viagem.

#### Caminho (Path)
`/trips/{tripId}/itineraryItems/{itemId}`  
*(Subcoleção sob a viagem)*

#### Justificativa Estrutural: Subcoleção vs. Array Embutido
- **Análise Arquitetural:**
  - *Abordagem de Array embutido em `trips.itinerary`:* O roteiro completo (dias e turnos) poderia residir dentro de um array no documento pai da viagem. Para um roteiro de 5 dias (~30 atividades), o documento totalizaria menos de 40 KB (bem abaixo de 1 MB).
  - *Abordagem de Subcoleção (`itineraryItems`):*
    1. **Edição Granular e Concorrência:** Permite atualizar, reordenar ou excluir uma única atividade (ex: alterar horário ou marcar como concluída) sem regravar o documento de 40 KB inteiro.
    2. **Escalabilidade:** Viagens longas (15 a 30 dias) ou roteiros hiperdetalhados não correm risco de degradação de performance por payload desnecessário.
    3. **Operações Offline e Mobile:** Facilidade para sincronizar itens pontuais alterados.
  - **Decisão Técnica para o MVP:**  
    Modelar como **Subcoleção `/trips/{tripId}/itineraryItems/{itemId}`** para gravação e mutações pontuais de atividades, mantendo no documento pai `/trips/{tripId}` apenas os dados agregados (`daysCount`, `weatherSummary`, `totalEstimatedCost`).

#### Campos e Tipos

| Campo | Tipo | Obrigatório | Descrição / Restrições |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Sim | Identificador único do item. |
| `tripId` | `string` | Sim | ID da viagem à qual pertence (referência cruzada). |
| `dayNumber` | `number` | Sim | Dia da viagem (1 para o primeiro dia, 2 para o segundo, etc.). |
| `date` | `string` | Sim | Data civil no formato ISO `"YYYY-MM-DD"`. |
| `shift` | `string` | Sim | Turno do dia: `'morning'` \| `'afternoon'` \| `'night'`. |
| `order` | `number` | Sim | Ordem sequencial de execução dentro do turno (0, 1, 2...). |
| `title` | `string` | Sim | Título da atividade (ex: `"Visita ao Teatro Colón"`). |
| `description` | `string` | Sim | Descrição concisa e orientações práticas. |
| `category` | `string` | Sim | Categoria: `'culture'` \| `'food'` \| `'nature'` \| `'leisure'` \| `'transport'` \| `'other'`. |
| `suggestedTime` | `string` | Sim | Horário sugerido no formato `"HH:mm"` (ex: `"10:00"`). |
| `estimatedDuration`| `string`| Sim | Duração estimada (ex: `"1h30min"`). |
| `estimatedCost` | `string` | Sim | Custo estimado monetário formatado (ex: `"R$ 80,00"`). |
| `locationName` | `string` | Não | Nome do estabelecimento ou atração. |
| `address` | `string` | Não | Endereço ou ponto de referência. |
| `coordinates` | `geopoint` \| `map` | Não | Posição geográfica (`latitude`, `longitude`) para mapa. |
| `tips` | `string` | Não | Dica prática de viajante (ex: `"Comprar ingresso antecipado online"`). |
| `isCompleted` | `boolean` | Sim | Flag se o viajante já realizou a atividade. Padrão `false`. |
| `createdAt` | `timestamp` | Sim | Timestamp de criação. |
| `updatedAt` | `timestamp` | Sim | Timestamp de atualização. |

#### Proprietário (Owner)
Herdado da viagem pai: o proprietário é o `userId` do documento `/trips/{tripId}`.

#### Timestamps
- `createdAt`: `serverTimestamp()`.
- `updatedAt`: `serverTimestamp()`.

#### Índices Esperados
1. **Composto de Subcoleção:**
   - Coleção: `itineraryItems`
   - Campos: `dayNumber` (ASC) + `order` (ASC)  
   - Propósito: Buscar todos os itens de uma viagem ordenados cronologicamente por dia e ordem de execução.

#### Exemplo de Documento (`/trips/trip_bue_2026_xyz/itineraryItems/item_tc_001`)
```json
{
  "id": "item_tc_001",
  "tripId": "trip_bue_2026_xyz",
  "dayNumber": 1,
  "date": "2026-10-10",
  "shift": "morning",
  "order": 1,
  "title": "Visita Guiada ao Teatro Colón",
  "description": "Tour histórico por uma das salas de ópera com melhor acústica do mundo.",
  "category": "culture",
  "suggestedTime": "10:00",
  "estimatedDuration": "1h15min",
  "estimatedCost": "R$ 90,00",
  "locationName": "Teatro Colón",
  "address": "Cerrito 628, C1010 CABA",
  "coordinates": {
    "latitude": -34.6011,
    "longitude": -58.3831
  },
  "tips": "Agendar no site oficial com 48h de antecedência para conseguir vaga em português.",
  "isCompleted": false,
  "createdAt": "2026-09-19T14:30:00.000Z",
  "updatedAt": "2026-09-19T14:30:00.000Z"
}
```

#### Regras de Leitura e Escrita
As permissões são validadas consultando o documento pai `trips`:
```javascript
match /trips/{tripId}/itineraryItems/{itemId} {
  // Helper que consulta a viagem pai
  function getTrip() {
    return get(/databases/$(database)/documents/trips/$(tripId)).data;
  }

  // Leitura: permitida se a viagem pai for pública ou do proprietário
  allow read: if isOwner(getTrip().userId) 
              || getTrip().visibility == 'public' 
              || isAdmin();

  // Escrita/Edição/Deleção: apenas o proprietário da viagem pai
  allow write: if isOwner(getTrip().userId) || isAdmin();
}
```

#### Estratégia de Exclusão
- **Exclusão individual:** Exclui o documento diretamente via `deleteDoc(doc(db, 'trips', tripId, 'itineraryItems', itemId))`.
- **Exclusão em cascata (remoção da viagem):** Quando uma viagem é deletada permanentemente, executa-se um `writeBatch` deletando todos os documentos de `itineraryItems` associados.

#### Risco de Duplicação
- **Mitigação:** Cada item possui um ID gerado na criação do plano. Na reordenação (drag & drop), atualiza-se apenas os campos `order` e `shift` via batch update.

#### Consultas Previstas
1. Obter todos os itens de uma viagem ordenados por dia e sequência:  
   `query(collection(db, 'trips', tripId, 'itineraryItems'), orderBy('dayNumber', 'asc'), orderBy('order', 'asc'))`
2. Filtrar itens de um dia específico:  
   `query(collection(db, 'trips', tripId, 'itineraryItems'), where('dayNumber', '==', 1), orderBy('order', 'asc'))`

---

## 3. Matriz de Autorização por Entidade

A tabela abaixo sintetiza os privilégios de acesso no Cloud Firestore para cada perfil de usuário:

| Entidade | Visitante Anônimo | Usuário Autenticado (Proprietário) | Usuário Autenticado (Outro) | Administrador (`role == 'admin'`) |
| :--- | :--- | :--- | :--- | :--- |
| **`users`** | ❌ Negado | ✅ Ler próprio perfil<br>✅ Atualizar dados permitidos<br>❌ Alterar `role`/`isPro`/`email` | ❌ Negado | ✅ Leitura total<br>✅ Deleção/Gestão |
| **`preferences`** | ❌ Negado | ✅ Leitura e Gravação total das suas configurações | ❌ Negado | ✅ Leitura total |
| **`availability`** | ❌ Negado | ✅ Leitura, Criação, Atualização e Deleção (CRUD total) | ❌ Negado | ✅ Leitura total |
| **`trips`** | ✅ Ler viagens públicas (`visibility == 'public'`) | ✅ CRUD total em suas viagens (`userId == auth.uid`) | ✅ Ler apenas viagens com `visibility == 'public'`<br>❌ Escrita negada | ✅ Leitura total<br>✅ Moderação / Deleção |
| **`itineraryItems`** | ✅ Ler itens se a viagem pai for pública | ✅ CRUD total nos itens da sua viagem | ✅ Ler apenas se a viagem pai for pública<br>❌ Escrita negada | ✅ Leitura total<br>✅ Moderação |

---

## 4. Síntese dos Índices Compostos Necessários (`firestore.indexes.json`)

Para que as consultas complexas do MVP funcionem sem erro de índice ausente, o arquivo de configuração deve conter:

```json
{
  "indexes": [
    {
      "collectionGroup": "availability",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "startDate", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "trips",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "trips",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "trips",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "visibility", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "itineraryItems",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "dayNumber", "order": "ASCENDING" },
        { "fieldPath": "order", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## 5. Resumo das Decisões de Modelagem

1. **Coleções Raiz (`users`, `trips`):** Adotadas quando há necessidade de IDs universais conhecidos (`users/{uid}`) ou necessidade de compartilhamento público e busca global (`trips` com filtro `visibility == 'public'`).
2. **Subcoleções (`availability`, `preferences`, `itineraryItems`):** Adotadas para dados dependentes do ciclo de vida da entidade pai, com forte isolamento de propriedade e permissões herdadas diretamente da hierarquia de caminhos.
3. **Evitar desnormalizações precoces:** O roteiro não duplica os dados cadastrais do usuário além do `userId`; itens de itinerário residem em subcoleção para permitir mutação pontual (drag-and-drop, checks de conclusão) sem regravar o documento inteiro de viagem.
