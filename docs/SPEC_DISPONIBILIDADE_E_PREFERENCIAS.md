# SPEC Conjunta — Períodos de Folga (Disponibilidade) e Preferências de Viagem

**Versão:** 1.0  
**Status:** Especificação Técnica e Funcional  
**Dependências:** SPEC Mestre, SPEC Interface, SPEC Firestore, SPEC Autenticação  
**Módulos Abrangidos:** Gestão de Folgas (`/availability`), Perfil & Preferências (`/profile`), Assistente de Viagens (`/new_trip`)

---

## 1. Visão Geral e Objetivos do Negócio

O valor central do **SmartTrip** reside na geração de roteiros sob medida para a disponibilidade temporal e o perfil real de cada pessoa viajante. Essa proposta apoia-se em dois pilares indissociáveis:
1. **Períodos de Folga (Disponibilidade Temporal):** Conhecer exatamente quando o usuário está livre (férias, feriados prolongados, fins de semana estendidos), eliminando a necessidade de pesquisas genéricas de "viagens de 7 dias" desconectadas do calendário pessoal.
2. **Preferências de Viagem (Perfil Comportamental e Logístico):** Parametrizar gostos, restrições financeiras, modos de transporte e tolerância climática para que o motor de inteligência artificial (Gemini) selecione destinos e atividades perfeitamente compatíveis.

---

## 2. Parte A — Períodos de Folga (Disponibilidade)

### 2.1 Modelo Conceitual e Campos

O período de folga representa um intervalo no calendário no qual o usuário está disponível para viajar.

- **Caminho de Persistência no Firestore:** `/users/{uid}/availability/{availabilityId}`
- **Subcoleção privada:** Isolamento nativo por usuário.

#### Tabela de Atributos

| Campo | Tipo | Obrigatório | Validações / Restrições |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Sim | Identificador único (auto-gerado pelo Firestore ou UUID v4). |
| `userId` | `string` | Sim | UID do autor; deve coincidir com `request.auth.uid`. |
| `title` | `string` | Sim | Min. 2, máx. 60 caracteres (ex: `"Férias de Julho"`, `"Feriado da Proclamação"`). |
| `startDate` | `string` | Sim | Formato civil ISO 8601 `"YYYY-MM-DD"`. |
| `endDate` | `string` | Sim | Formato civil ISO 8601 `"YYYY-MM-DD"`; `endDate >= startDate`. |
| `durationDays` | `number` | Sim | Inteiro `>= 1`; cálculo: `(endDate - startDate) em dias + 1`. Máx. 90 dias. |
| `type` | `string` | Sim | Enum: `'vacation'` \| `'holiday'` \| `'long_weekend'` \| `'other'`. |
| `status` | `string` | Sim | Enum: `'planned'` (planejada) \| `'confirmed'` (aprovada) \| `'used'` (utilizada). |
| `notes` | `string` | Não | Texto livre para anotações do viajante (máx. 500 caracteres). |
| `linkedTripId` | `string` | Não | ID de um documento em `/trips/{tripId}` originado deste período. |
| `createdAt` | `timestamp` | Sim | `serverTimestamp()`, imutável após inserção. |
| `updatedAt` | `timestamp` | Sim | `serverTimestamp()`, atualizado a cada mutação. |

---

### 2.2 Regras de Validação de Intervalos

1. **Formato Estrito de Data:** As datas devem ser manipuladas exclusivamente como strings no formato civil `"YYYY-MM-DD"`. Nunca serializar horários locais ou UTC com horas (`"2026-07-10T14:30:00Z"`), prevenindo discrepâncias decorrentes de fusos horários locais.
2. **Consistência Cronológica:**
   - `startDate <= endDate`.
   - Se `startDate == endDate`, a duração é de exatamente 1 dia (`durationDays = 1`).
3. **Limite de Duração:** Para prevenir erros de digitação (ex: selecionar 2036 por engano), `durationDays <= 90`. Períodos superiores a 90 dias exigem confirmação explícita ou desdobramento em múltiplos períodos.
4. **Datas no Passado:**
   - A criação de períodos com `endDate < dataAtual` é permitida apenas como histórico (com badge informativo `"Período Passado"`), mas gera aviso se o usuário tentar gerar um novo roteiro com datas retroativas.

---

### 2.3 Tratamento e Política de Conflitos de Períodos (Overlapping)

Dois períodos $A$ e $B$ do mesmo usuário estão em sobreposição quando:
$$\max(A.startDate, B.startDate) \le \min(A.endDate, B.endDate)$$

#### Matriz de Política de Conflito

| Cenário de Conflito | Classificação | Ação do Sistema |
| :--- | :--- | :--- |
| **Sobreposição Total Exata** ($A = B$) | Erro de Duplicação | **Bloqueio total:** Não permite cadastrar folga idêntica à já existente. |
| **Sobreposição Parcial** (ex: Férias englobam um feriado cadastrado) | Conflito Informativo | **Permissivo com Alerta:** Exibe modal informativo: *"Você já possui a folga '{title}' no intervalo de {data1} a {data2}. Deseja consolidar ou manter ambos?"*. |
| **Mesma Folga Vinculada a Viagem** | Conflito de Roteiro | Se o período já possui `linkedTripId`, alertar que a edição das datas pode invalidar o roteiro de viagem previamente gerado. |

---

### 2.4 UX e Interações (Períodos de Folga)

- **Tela `/availability`:**
  1. **Cabeçalho:** Resumo estatístico do ano (ex: *"Total de 28 dias livres cadastrados em 2026"*).
  2. **Seletor de Visualização:** Alternância entre **Lista Cronológica** (padrão) e **Calendário Anual**.
  3. **Lista de Cards:**
     - Badge por tipo com cores distintas (Férias = Azul Esmeralda; Feriado = Âmbar; Fim de Semana = Lilás).
     - Exibição destacada de data inicial, final e contagem de dias úteis e de fim de semana.
     - Botão de ação rápida: *"Gerar Roteiro para esta Folga"* ➔ redireciona para `/new_trip` com período pré-selecionado.
  4. **Ações no Item:** Menu de contexto com *Editar* e *Excluir*.
  5. **Modal de Criação/Edição:**
     - Campos de entrada: Título, Tipo, Range Picker de datas, Notas.
     - Alerta visual instantâneo em caso de sobreposição detectada antes de clicar em salvar.
  6. **Modal de Exclusão:**
     - Se `linkedTripId` estiver presente: *"Atenção: Esta folga está associada à viagem '{tripName}'. A exclusão da folga não removerá o roteiro, mas desvinculará o período."*

---

## 3. Parte B — Preferências de Viagem

### 3.1 Modelo Conceitual e Campos

O documento de preferências parametriza o algoritmo de recomendação e geração de roteiros com base no perfil do viajante.

- **Caminho de Persistência no Firestore:** `/users/{uid}/settings/preferences` (Documento singleton determinístico).

#### Tabela de Atributos

| Campo | Tipo | Obrigatório | Enum / Valores Válidos | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `travelStyle` | `string` | Sim | `'relaxed'` \| `'moderate'` \| `'intense'` | Ritmo de atividades diárias (poucas paradas vs. cronograma cheio). |
| `budget` | `string` | Sim | `'budget'` \| `'moderate'` \| `'luxury'` | Faixa de gastos para hospedagem, refeições e ingressos. |
| `preferredInterests` | `array[string]` | Sim | Lista de slugs (min. 1, máx. 10) | Interesses prioritários (ex: `['gastronomia', 'cultura', 'natureza']`). |
| `restrictions` | `array[string]` | Sim | Lista de strings | Restrições de saúde, dieta ou mobilidade (ex: `['vegetariano', 'acessibilidade_motora']`). |
| `transportationModes` | `array[string]` | Sim | Subconjunto de: `['walking', 'public_transit', 'rideshare', 'rental_car']` | Meios de transporte que o usuário aceita utilizar no destino. |
| `preferredClimate` | `string` | Sim | `'warm'` \| `'mild'` \| `'cool'` \| `'any'` | Clima predileto: Quente/Praia, Ameno/Temperado, Frio de Montanha, ou Indiferente. |
| `maxTravelDistance` | `string` | Sim | `'regional'` (até 500km) \| `'national'` (até 2500km) \| `'continental'` (até 6000km) \| `'global'` (ilimitado) | Raio máximo de deslocamento a partir da cidade de origem. |
| `homeAirport` | `string` | Não | Código IATA ou cidade (máx. 50 caracteres) | Local de partida habitual (ex: `"GRU"`, `"São Paulo - SP"`). |
| `currency` | `string` | Sim | `'BRL'` \| `'USD'` \| `'EUR'` | Moeda base de exibição de estimativas financeiras. |
| `updatedAt` | `timestamp` | Sim | `serverTimestamp()` | Data/hora da última atualização. |

---

### 3.2 Vocabulário Controlado de Interesses e Transporte

#### Interesses Permitidos (Slugs Padronizados)
- `culture_history` (Cultura, Museus e Centros Históricos)
- `gastronomy_wine` (Gastronomia Típica e Enologia)
- `nature_parks` (Natureza, Parques e Trilhas)
- `beaches_coast` (Praias e Litoral)
- `nightlife_shows` (Vida Noturna, Bares e Shows)
- `shopping_markets` (Compras, Mercados e Feiras Locais)
- `wellness_spa` (Relaxamento, Spas e Bem-Estar)
- `family_kids` (Atividades Familiares e Crianças)
- `adventure_sports` (Aventura e Ecoturismo)
- `photography_views` (Mirantes e Pontos Fotográficos)

#### Modos de Transporte
- `walking` (Caminhada a pé — priorizar roteiros com atrações próximas)
- `public_transit` (Metrô, trem e ônibus urbanos)
- `rideshare` (Uber, táxi e transporte por aplicativo)
- `rental_car` (Aluguel de automóvel ou veículo próprio)

---

### 3.3 UX e Interações (Preferências de Viagem)

- **Tela `/profile` (Aba ou Seção "Preferências de Viagem"):**
  1. **Cards Selecionáveis de Ritmo:** 3 cards ilustrados (*Tranquilo*, *Equilibrado*, *Acelerado*) com seleção visual por borda destacada e ícone.
  2. **Faixa de Orçamento:** Seletor visual (*Econômico* $, *Conforto* $$, *Exclusivo* $$$).
  3. **Chips de Interesses:** Grade de tags clicáveis com limite visual dinâmico (*"Selecionados: 4/10"*).
  4. **Seleção de Modos de Transporte:** Checkboxes estilizados com ícones representativos.
  5. **Clima e Distância:** Dropdowns acessíveis com labels claros e descrições contextuais de cada opção.
  6. **Botão de Salvamento Flutuante ou no Rodapé:** Indicador de estado (*"Salvar Preferências"*, *"Salvando..."*, *"Salvo com sucesso!"*).
  7. **Botão Restaurar Padrões:** Redefine para o perfil moderado padrão mediante confirmação.

---

## 4. Persistência e Regras de Segurança no Firestore

### 4.1 Paths Oficiais
- **Disponibilidade:** `/users/{uid}/availability/{availabilityId}`
- **Preferências:** `/users/{uid}/settings/preferences`

### 4.2 Regras de Segurança (Firestore Security Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /users/{userId} {
      // Regras de perfil omitidas por brevidade...

      // ── Subcoleção: availability ──
      match /availability/{availabilityId} {
        allow read: if isOwner(userId);
        
        allow create: if isOwner(userId)
                      && request.resource.data.userId == userId
                      && request.resource.data.title.size() >= 2
                      && request.resource.data.title.size() <= 60
                      && request.resource.data.startDate <= request.resource.data.endDate
                      && request.resource.data.durationDays >= 1
                      && request.resource.data.durationDays <= 90
                      && request.resource.data.type in ['vacation', 'holiday', 'long_weekend', 'other']
                      && request.resource.data.createdAt == request.time
                      && request.resource.data.updatedAt == request.time;

        allow update: if isOwner(userId)
                      && request.resource.data.userId == userId
                      && request.resource.data.startDate <= request.resource.data.endDate
                      && request.resource.data.durationDays >= 1
                      && request.resource.data.createdAt == resource.data.createdAt
                      && request.resource.data.updatedAt == request.time;

        allow delete: if isOwner(userId);
      }

      // ── Subcoleção singleton: settings/preferences ──
      match /settings/preferences {
        allow read: if isOwner(userId);
        
        allow write: if isOwner(userId)
                     && request.resource.data.travelStyle in ['relaxed', 'moderate', 'intense']
                     && request.resource.data.budget in ['budget', 'moderate', 'luxury']
                     && request.resource.data.preferredInterests is list
                     && request.resource.data.preferredInterests.size() >= 1
                     && request.resource.data.preferredInterests.size() <= 10
                     && request.resource.data.transportationModes is list
                     && request.resource.data.preferredClimate in ['warm', 'mild', 'cool', 'any']
                     && request.resource.data.maxTravelDistance in ['regional', 'national', 'continental', 'global']
                     && request.resource.data.currency in ['BRL', 'USD', 'EUR']
                     && request.resource.data.updatedAt == request.time;
      }
    }
  }
}
```

---

## 5. Matriz de Autorização e Acesso

| Recurso | Usuário Anônimo | Usuário Proprietário (`auth.uid == userId`) | Outro Usuário Autenticado | Administrador (`role == 'admin'`) |
| :--- | :--- | :--- | :--- | :--- |
| **`availability` (Read)** | ❌ 403 Forbidden | ✅ Permitido (apenas suas folgas) | ❌ 403 Forbidden | ✅ Permitido para suporte |
| **`availability` (Create/Edit)** | ❌ 403 Forbidden | ✅ Permitido com validação | ❌ 403 Forbidden | ❌ Bloqueado (dado pessoal) |
| **`availability` (Delete)** | ❌ 403 Forbidden | ✅ Permitido | ❌ 403 Forbidden | ✅ Permitido em moderação |
| **`preferences` (Read)** | ❌ 403 Forbidden | ✅ Permitido | ❌ 403 Forbidden | ✅ Permitido |
| **`preferences` (Write)** | ❌ 403 Forbidden | ✅ Permitido com validação de enums | ❌ 403 Forbidden | ❌ Bloqueado |

---

## 6. Critérios de Aceite (Gherkin)

### Cenário 1: Cadastro de nova folga com datas válidas
```gherkin
Dado que o usuário está autenticado no SmartTrip
E acessa a tela "/availability"
Quando preenche o título com "Férias de Verão"
E seleciona o período de "2026-12-10" até "2026-12-24"
E escolhe o tipo "vacation"
E clica em "Salvar Folga"
Então o sistema deve persistir o documento em "/users/{uid}/availability/{id}"
E calcular a duração como 15 dias
E exibir o card do período na lista ordenado cronologicamente
E exibir notificação de sucesso "Período cadastrado com sucesso"
```

### Cenário 2: Rejeição de intervalo com data inicial posterior à final
```gherkin
Dado que o usuário está no formulário de criação de folga
Quando seleciona a data inicial "2026-10-15" e data final "2026-10-10"
Então o sistema deve desabilitar o botão "Salvar"
E exibir mensagem de erro inline "A data de início não pode ser posterior à data de término"
E nenhuma gravação deve ser enviada ao Firestore
```

### Cenário 3: Detecção de conflito de períodos sobrepostos
```gherkin
Dado que o usuário já possui cadastrado o período A de "2026-07-01" até "2026-07-15"
Quando tenta cadastrar o período B de "2026-07-10" até "2026-07-20"
Então o sistema deve detectar a sobreposição de 6 dias (10 a 15 de julho)
E exibir modal de confirmação avisando sobre o conflito
E permitir que o usuário escolha entre "Ajustar Datas" ou "Salvar Mesmo Assim"
```

### Cenário 4: Exclusão de folga vinculada a roteiro existente
```gherkin
Dado que a folga "Carnaval 2026" possui um "linkedTripId" associado
Quando o usuário clica em "Excluir"
Então o sistema deve abrir um modal de alerta informando que a viagem existente não será apagada
E ao confirmar a exclusão, o documento da folga é removido do Firestore
E a viagem correspondente tem seu status mantido
```

### Cenário 5: Atualização e persistência de preferências de viagem
```gherkin
Dado que o usuário acessa a seção de preferências em "/profile"
Quando altera o estilo para "intense"
E seleciona o orçamento "budget"
E adiciona os interesses "gastronomy_wine" e "adventure_sports"
E define o clima preferido como "cool"
E clica em "Salvar Preferências"
Então o sistema grava os dados em "/users/{uid}/settings/preferences" com merge: true
E preenche o campo "updatedAt" com o timestamp do servidor
E ao recarregar a página, os novos valores são restaurados com fidelidade
```

### Cenário 6: Tentativa de ultrapassar limite de interesses
```gherkin
Dado que o usuário já selecionou 10 interesses
Quando clica no 11º chip de interesse
Então o sistema não deve selecionar o 11º chip
E deve exibir tooltip de aviso "Limite máximo de 10 interesses atingido"
```

---

## 7. Casos Extremos e Tratamento de Erros (Edge Cases)

| Caso Extremo | Descrição do Risco | Tratamento Obrigatório |
| :--- | :--- | :--- |
| **Folga de 1 Dia Único** | `startDate == endDate`. Risco de `durationDays = 0` por cálculo ingênuo. | A fórmula deve somar 1 dia fechado: `(end - start) + 1 = 1`. A interface deve exibir *"1 dia de folga"*. |
| **Ano Bissexto e Virada de Ano** | Folga cruzando 28/29 de fevereiro ou 31/12 a 01/01 (ex: Reveillon). | Uso de bibliotecas ou cálculo nativo com `Date.UTC` para subtrair milissegundos sem salto de fuso. |
| **Fusos Horários Locais** | Usuário cadastra folga viajando entre fusos (-03:00 vs +09:00). | Persistência estrita em formato civil `"YYYY-MM-DD"`. Não utilizar timestamps com hora na chave de data. |
| **Notas com Texto Extenso** | Usuário cola texto gigante no campo `notes`. | Truncar e limitar estritamente no formulário com `maxLength={500}` e contador regressivo de caracteres. |
| **Interrupção de Conexão (Offline)** | Usuário salva preferências sem conexão à internet. | Firestore Client SDK mantém cache offline (IndexedDB) e sincroniza automaticamente assim que a conexão retornar. |
| **Conflito de Concorrência** | Usuário abre duas abas e edita preferências simultaneamente. | A última gravação prevalece (`LWW - Last Write Wins`), com `serverTimestamp()` garantindo a ordenação temporal. |
| **Remoção de Conta do Usuário** | Exclusão da conta pelo Firebase Auth. | Cloud Function expurga em cascata `/users/{uid}/availability` e `/users/{uid}/settings/preferences`. |
