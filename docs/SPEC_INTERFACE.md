# SPEC da Interface-Base do SmartTrip

> **Projeto**: SmartTrip - Assistente Inteligente de Viagens  
> **Documento**: Especificação Funcional e Visual da Interface-Base (UI/UX)  
> **Versão**: 1.0.0 | **Status**: Vigente  
> **Referência Cruzada**: [`docs/SPEC_MESTRE.md`](SPEC_MESTRE.md) | [`docs/SPEC_OPERACIONAL.md`](SPEC_OPERACIONAL.md)  

---

## 1. Visão Geral da Interface e Design System

Esta especificação define os contratos de interface, fluxos de navegação, arquitetura de componentes, comportamentos responsivos e critérios de aceite das telas do MVP do **SmartTrip**.

A interface adota a abordagem **Mobile-First** com ampliação fluida para layouts desktop, seguindo uma estética visual moderna, limpa e contextual (tons de azul safira, esmeralda suave, superfícies em glassmorphism sutil e alto contraste para legibilidade em ambientes externos sob luz natural).

> [!IMPORTANT]
> Nesta fase, a interface opera exclusivamente através de **contratos de dados e mocks locais tipados**, sem conexão real aos serviços de backend (Firebase/Gemini/APIs). Toda a reatividade de estado é tratada por gerenciadores locais de interface (React State/Context).

---

## 2. Mapa Geral de Telas e Acesso

| Rota | Nome da Tela | Visibilidade | Objetivo Principal |
|---|---|:---:|---|
| `/` | Landing Page / Home Pública | **Pública** | Apresentar a proposta de valor, demonstrar o funcionamento e direcionar para cadastro/login. |
| `/login` | Autenticação | **Pública** | Permitir acesso seguro via e-mail/senha ou Google OAuth. |
| `/register` | Cadastro | **Pública** | Registro de novos usuários com dados essenciais. |
| `/dashboard` | Painel Principal | **Privada** | Hub central do usuário com resumo de folgas, próximas viagens e atalho rápido para criação. |
| `/profile` | Perfil e Preferências | **Privada** | Gestão de dados pessoais e parametrização das preferências padrão de viagem. |
| `/availability` | Gestão de Folgas | **Privada** | Cadastro e visualização de períodos livres, férias e feriados para viagens. |
| `/explore` | Criação & Descoberta | **Privada** | Seleção de destino, consulta meteorológica, POIs e parâmetros de geração de roteiro. |
| `/trips` | Minhas Viagens | **Privada** | Listagem, filtros e gestão (exclusão, status) de viagens salvas. |
| `/trips/[id]` | Detalhes & Revisão Humana | **Privada** | Cronograma diário em turnos com interface interativa de edição e curadoria. |

---

## 3. Catálogo de Componentes Reutilizáveis

Para assegurar consistência visual e manutenibilidade, a interface-base baseia-se nos seguintes componentes fundamentais:

```
src/components/
├── common/
│   ├── Button.tsx              # Botão com variantes (primary, secondary, danger, ghost), suporte a loading e ícones
│   ├── Input.tsx               # Campo de entrada com label, erro inline e suporte a ícone de ação
│   ├── Select.tsx              # Seletor estilizado para opções únicas
│   ├── ChipGroup.tsx           # Seletor de múltipla escolha para tags, interesses e orçamentos
│   ├── Modal.tsx               # Diálogo modal acessível com backdrop e interceptação de foco
│   ├── EmptyState.tsx          # Card amigável com ícone ilustrativo, título, descrição e botão de ação
│   ├── SkeletonLoader.tsx      # Bloqueio de carregamento pulsante imitando o formato final do card
│   └── Toast.tsx               # Mensagem temporária flutuante de sucesso, alerta ou erro
├── layout/
│   ├── Header.tsx              # Barra de navegação superior (variantes pública e privada com avatar)
│   ├── BottomNav.tsx           # Barra de navegação móvel fixa (Dashboard, Explorar, Viagens, Perfil)
│   └── Container.tsx           # Contêiner responsivo com limites de largura máxima (max-w-7xl)
└── trips/
    ├── TripCard.tsx            # Card de resumo de viagem com imagem, destino, datas e status
    ├── WeatherBadge.tsx        # Pílula informativa de temperatura e condição meteorológica
    ├── ActivityCard.tsx        # Card de atividade do itinerário com edição inline e exclusão
    └── ShiftAccordion.tsx      # Bloco expansível de turno (Manhã, Tarde, Noite)
```

---

## 4. Especificação Detalhada das Telas do MVP

---

### 4.1 Rota: `/` (Landing Page / Home Pública)

- **Classificação**: Pública.
- **Objetivo**: Encantar o visitante, comunicar a proposta de valor ("Planeje viagens sob medida no tempo que você tem"), exibir demonstração interativa mockada e direcionar para conversão (`/register` ou `/login`).
- **Navegação**:
  - Clique em "Começar Gratuitamente" ou "Criar Roteiro" ➔ redireciona para `/register`.
  - Clique em "Já tenho uma conta" ou "Entrar" ➔ redireciona para `/login`.
  - Clique em "Explorar Demonstração" ➔ rola até a seção interativa de demonstração na própria página.
- **Elementos Obrigatórios**:
  1. Header público com logotipo SmartTrip, link "Como Funciona" e botões "Entrar" e "Criar Conta".
  2. Hero section com chamada de impacto, subtítulo explicativo e CTA de alta visibilidade.
  3. Demonstração interativa (mock de um roteiro de 3 dias em Salvador com clima e turnos).
  4. Seção de 3 pilares: Adequação a Folgas Reais, IA Contextual com Clima, Curadoria Humana Total.
  5. Footer com links institucionais, copyright e link para documentação técnica.
- **Layout Desktop e Mobile**:
  - *Mobile (< 768px)*: Layout linear em coluna única; hero com texto centralizado seguido do mockup empilhado; botões full-width; menu hamburger simplificado.
  - *Desktop (>= 768px)*: Hero com grid de 2 colunas (coluna esquerda com texto e CTAs; coluna direita com card dinâmico interativo flutuante); menu superior horizontal com ações visíveis.
- **Estados da Tela**:
  - *Padrão*: Renderização fluida imediata de todo o conteúdo estático.
  - *Loading*: Não aplicável (conteúdo estático sem dependência de APIs no primeiro paint).
  - *Error*: Não aplicável.
- **Acessibilidade Básica**:
  - Contraste de cores do botão primário de no mínimo 4.5:1 contra o fundo.
  - Heading 1 único para a proposta de valor. Links com textos descritivos (evitar "clique aqui").
- **Mocks Utilizados**: Roteiro modelo ("Fim de Semana em Salvador - 3 dias") em `MOCK_DEMO_TRIP`.
- **Critérios de Aceite**:
  - **CA-UI-001**: O visitante sem autenticação consegue visualizar a página inicial completa e seus links de navegação.
  - **CA-UI-002**: O clique no CTA primário conduz inequivocamente para a tela `/register`.

---

### 4.2 Rota: `/login` (Autenticação)

- **Classificação**: Pública (redireciona para `/dashboard` se já autenticado).
- **Objetivo**: Permitir acesso autenticado ao sistema via e-mail e senha ou botão social Google.
- **Navegação**:
  - Sucesso na autenticação ➔ redireciona para `/dashboard`.
  - Clique em "Criar uma conta" ➔ redireciona para `/register`.
  - Clique em "Esqueceu a senha?" ➔ abre modal ou tela de recuperação de acesso.
- **Elementos Obrigatórios**:
  1. Logotipo e mensagem de boas-vindas ("Que bom ver você de volta!").
  2. Botão proeminente "Entrar com Google" (OAuth).
  3. Divisor visual "ou continue com e-mail".
  4. Campo `E-mail` (tipo email, com validação de formato).
  5. Campo `Senha` (tipo password, com botão alternar visibilidade 👁️).
  6. Botão primário "Acessar Plataforma".
  7. Link para recuperação de senha e link de transição para `/register`.
- **Layout Desktop e Mobile**:
  - *Mobile*: Card ocupando a largura total da tela com margens de 16px, botões grandes e touch-friendly (mínimo 44px de altura).
  - *Desktop*: Card centralizado com largura máxima de 440px em fundo com gradiente sutil, ou layout dividido (lado esquerdo com foto de viagem inspiradora, lado direito com formulário).
- **Estados da Tela**:
  - *Vazio/Padrão*: Campos em branco com placeholders explicativos.
  - *Loading*: Botão "Acessar Plataforma" exibe spinner e desabilita cliques; botão Google desabilitado.
  - *Error*: Mensagem em destaque acima dos campos ("E-mail ou senha incorretos") com bordas avermelhadas nos inputs.
- **Acessibilidade Básica**:
  - Tags `<label>` explicitamente vinculadas a cada `<input>` via `id`/`htmlFor`.
  - Anúncio de erro com `aria-live="polite"`.
- **Mocks Utilizados**: Credenciais de demonstração pré-configuradas em memória (`aluno@smarttrip.com` / `senha123`).
- **Critérios de Aceite**:
  - **CA-UI-003**: Formulário impede submissão se o e-mail não possuir formato válido ou se a senha estiver em branco.
  - **CA-UI-004**: Ao preencher as credenciais mockadas e submeter, o usuário é direcionado para `/dashboard`.

---

### 4.3 Rota: `/register` (Cadastro de Usuário)

- **Classificação**: Pública (redireciona para `/dashboard` se já autenticado).
- **Objetivo**: Realizar o registro inicial do viajante com dados essenciais de perfil.
- **Navegação**:
  - Sucesso no cadastro ➔ redireciona para `/dashboard` (com mensagem de boas-vindas e incentivo ao cadastro de folgas).
  - Clique em "Já possuo conta" ➔ redireciona para `/login`.
- **Elementos Obrigatórios**:
  1. Cabeçalho explicativo ("Crie sua conta no SmartTrip").
  2. Botão "Cadastre-se com Google".
  3. Campos: `Nome Completo`, `E-mail`, `Senha` e `Confirmar Senha`.
  4. Indicador visual de força da senha (fraca, média, forte).
  5. Checkbox de ciência dos Termos de Uso e Política de Privacidade.
  6. Botão de submissão "Criar Minha Conta".
- **Layout Desktop e Mobile**:
  - Idêntico ao padrão de `/login` para garantir consistência da experiência de onboarding.
- **Estados da Tela**:
  - *Padrão*: Formulário limpo.
  - *Loading*: Botão desabilitado com indicador de carregamento.
  - *Error*: Feedback imediato em caso de senhas divergentes ou e-mail já em uso.
- **Acessibilidade Básica**:
  - Mensagens de erro de validação associadas ao campo via `aria-describedby`.
- **Mocks Utilizados**: Validação local em memória simulando criação instantânea de conta.
- **Critérios de Aceite**:
  - **CA-UI-005**: Bloqueia submissão caso as senhas informadas nos dois campos sejam diferentes.
  - **CA-UI-006**: Ao submeter formulário válido, cria estado local de sessão e transiciona para `/dashboard`.

---

### 4.4 Rota: `/dashboard` (Painel Principal)

- **Classificação**: Privada (requer autenticação ativa).
- **Objetivo**: Atuar como centro de comando do usuário, apresentando um panorama de suas próximas viagens, atalho imediato para criação de novo itinerário e folgas disponíveis.
- **Navegação**:
  - Clique em "Planejar Nova Viagem" ➔ direciona para `/explore`.
  - Clique no card de uma viagem ➔ direciona para `/trips/[id]`.
  - Clique em "Ver Todas as Viagens" ➔ direciona para `/trips`.
  - Clique em "Gerenciar Folgas" ➔ direciona para `/availability`.
- **Elementos Obrigatórios**:
  1. Header autenticado com saudação personalizada ("Olá, [Nome]! Para onde vamos agora?") e avatar do usuário.
  2. Banner/Card de destaque de ação primária: "Criar Novo Roteiro com IA" com botão chamativo.
  3. Seção "Próxima Viagem": Card detalhado da viagem mais próxima (destino, data, dias restantes, resumo do clima).
  4. Seção "Suas Folgas Ativas": Lista compacta das próximas folgas cadastradas com atalho para adicionar nova.
  5. Barra de navegação inferior (BottomNav) no mobile e menu lateral/topo no desktop.
- **Layout Desktop e Mobile**:
  - *Mobile*: Layout empilhado em uma coluna; carrossel horizontal de cards de viagens; BottomNav fixo na base.
  - *Desktop*: Grid de 3 colunas (coluna principal 2/3 com banner e próximas viagens; coluna lateral 1/3 com painel de folgas e atalhos rápidos de perfil).
- **Estados da Tela**:
  - *Vazio*: Se não houver viagens, exibe `EmptyState` ("Você ainda não tem viagens planejadas. Que tal criar uma agora?") com botão direto para `/explore`.
  - *Loading*: Exibição de `SkeletonLoader` imitando o formato dos cards de viagens e painel de folgas.
  - *Error*: Card de falha com botão "Tentar Novamente".
- **Acessibilidade Básica**:
  - Navegação entre cards via tecla `Tab`. Cards com atributos `role="article"` e títulos acessíveis.
- **Mocks Utilizados**: `MOCK_USER`, `MOCK_TRIPS[0]` e `MOCK_TIME_OFFS`.
- **Critérios de Aceite**:
  - **CA-UI-007**: Exibe o nome do usuário autenticado e a contagem real de viagens mockadas disponíveis.
  - **CA-UI-008**: Apresenta estado vazio com call-to-action caso a lista de viagens esteja zerada.

---

### 4.5 Rota: `/profile` (Perfil e Preferências de Viagem)

- **Classificação**: Privada.
- **Objetivo**: Permitir a consulta e edição dos dados cadastrais do viajante e configurar suas preferências padrão (ritmo, orçamento, interesses e restrições).
- **Navegação**:
  - Alterações salvas ➔ exibe toast de sucesso e mantém na página.
  - Clique em "Sair da Conta" ➔ executa logout e redireciona para `/`.
- **Elementos Obrigatórios**:
  1. Seção de Identificação: Foto de avatar, nome, e-mail (somente leitura se OAuth) e estilo de viajante.
  2. Seletor de Ritmo de Viagem padrão: Chips para `Relaxado` (1 a 2 passeios/dia), `Moderado` (3 a 4 passeios/dia) e `Intenso` (dia cheio).
  3. Seletor de Orçamento padrão: Chips para `Econômico ($)`, `Conforto ($$)`, `Luxo ($$$)`.
  4. Grade de Interesses (múltipla seleção): `Gastronomia`, `Cultura e Museus`, `Natureza e Trilhas`, `Vida Noturna`, `Compras`, `Praias`.
  5. Campo de Restrições Especiais: Tags/texto livre (ex: "Vegetariano", "Mobilidade reduzida").
  6. Seletor de Moeda preferencial: `BRL (R$)`, `USD ($)`, `EUR (€)`.
  7. Botão primário "Salvar Preferências" e botão de perigo "Desconectar da Conta".
- **Layout Desktop e Mobile**:
  - *Mobile*: Seções empilhadas verticalmente com espaçamento confortável; botões de seleção grandes e fáceis de tocar.
  - *Desktop*: Painel central com abas ou seções lado a lado (Dados Pessoais à esquerda; Preferências de Viagem à direita).
- **Estados da Tela**:
  - *Padrão*: Exibe os dados atuais do usuário pré-selecionados.
  - *Loading*: Skeletons nos blocos de preferências enquanto carrega os dados.
  - *Sucesso/Erro*: Toast flutuante confirmando "Preferências atualizadas com sucesso!".
- **Acessibilidade Básica**:
  - Grupos de chips de rádio/checkbox com atributos `role="radiogroup"` ou `role="group"` e suporte a navegação por setas do teclado.
- **Mocks Utilizados**: `MOCK_USER.preferences`.
- **Critérios de Aceite**:
  - **CA-UI-009**: Usuário consegue alternar chips de ritmo e interesses e visualizar a alteração refletida na interface.
  - **CA-UI-010**: O acionamento de "Salvar" exibe notificação de sucesso sem recarregar a página.

---

### 4.6 Rota: `/availability` (Gestão de Períodos de Folga)

- **Classificação**: Privada.
- **Objetivo**: Centralizar o cadastro, visualização e remoção de períodos de descanso (férias, pontes e feriados prolongados) para alimentar o motor de planejamento.
- **Navegação**:
  - Clique em "Planejar Viagem com esta Folga" ➔ redireciona para `/explore` com as datas da folga pré-preenchidas.
  - Clique em "Voltar" ➔ retorna ao `/dashboard`.
- **Elementos Obrigatórios**:
  1. Cabeçalho com título "Meus Períodos de Folga" e botão de ação "+ Nova Folga".
  2. Modal/Formulário de Cadastro de Folga contendo:
     - Título da folga (ex: "Feriado Tiradentes", "Férias de Julho");
     - Data de Início e Data de Fim (com cálculo automático em tempo real do número de dias);
     - Tipo de Folga (dropdown: Férias, Feriado Nacional, Ponte/Fim de Semana, Outro);
     - Campo opcional de anotações.
  3. Lista de Folgas Cadastradas em formato de cards ou timeline cronológica:
     - Badge do tipo de folga;
     - Período legível (ex: "12 a 15 de Outubro de 2026 • 4 dias");
     - Botão de ação direta "Planejar Viagem";
     - Botão de exclusão (ícone de lixeira com confirmação).
- **Layout Desktop e Mobile**:
  - *Mobile*: Cards verticais ocupando 100% da largura; botão flutuante ou fixo no topo para adicionar nova folga.
  - *Desktop*: Tabela moderna ou grid de cards com 2 colunas; modal centralizado para adição rápida de datas.
- **Estados da Tela**:
  - *Vazio*: `EmptyState` ("Você ainda não cadastrou períodos de folga. Adicione suas próximas folgas para planejar viagens perfeitas.").
  - *Loading*: Skeletons imitando cards de folga.
  - *Error de Validação*: Mensagem de bloqueio caso `Data Final < Data Inicial` com texto em vermelho "A data de término deve ser posterior à data de início".
- **Acessibilidade Básica**:
  - Inputs de data com suporte nativo a datepicker acessível (`type="date"`).
- **Mocks Utilizados**: `MOCK_TIME_OFFS`.
- **Critérios de Aceite**:
  - **CA-UI-011**: O formulário impede a adição de folga se a data final for anterior à data inicial.
  - **CA-UI-012**: O clique no botão de exclusão de uma folga remove o item da lista localmente com feedback visual.

---

### 4.7 Rota: `/explore` (Criação & Descoberta de Viagem)

- **Classificação**: Privada.
- **Objetivo**: Tela central do fluxo de criação do roteiro. Reúne a escolha de destino com autocompletar, geolocalização opcional, seleção de período (ou vínculo com folga), previsão climática e seleção preliminar de POIs antes de disparar o motor de IA.
- **Navegação**:
  - Clique em "Gerar Roteiro com IA" ➔ transiciona para estado de loading contextual e, após processamento, redireciona para a tela de curadoria `/trips/[id]`.
  - Clique em "Cancelar" ➔ retorna ao `/dashboard`.
- **Elementos Obrigatórios**:
  1. Assistente em 3 Etapas Visuais:
     - **Etapa 1: Destino e Origem**: Campo de busca com autocompletar de cidades e botão "Usar minha localização atual".
     - **Etapa 2: Datas & Clima**: Seletor de datas ou dropdown para puxar de uma folga existente; card dinâmico com resumo do clima previsto no período (temperaturas e probabilidade de chuva).
     - **Etapa 3: Preferências & POIs**: Ajuste fino do ritmo para esta viagem específica e lista de atrações sugeridas no destino com seleção ("Quero visitar").
  2. Botão de Ação Primária: "Gerar Roteiro Inteligente 🪄".
- **Layout Desktop e Mobile**:
  - *Mobile*: Formulário passo a passo (Wizard) ou scroll vertical fluido bem demarcado; cards de POI em carrossel horizontal; botão de geração fixado no rodapé durante a rolagem.
  - *Desktop*: Layout em duas colunas sincronizadas (coluna da esquerda com formulário e seletores; coluna da direita com pré-visualização dinâmica do card de destino, clima e atrações selecionadas).
- **Estados da Tela**:
  - *Padrão*: Campos prontos para inserção.
  - *Geolocalização em Andamento*: Spinner sutil no campo de origem e mensagem "Obtendo localização...".
  - *Loading de Geração com IA*: Tela de sobreposição (overlay) moderna com progresso em etapas animadas ("Consultando histórico climático...", "Filtrando melhores atrações...", "Estruturando manhã, tarde e noite...").
  - *Error*: Alerta caso o destino não seja localizado ou campos obrigatórios estejam vazios.
- **Acessibilidade Básica**:
  - O modal de loading de geração com IA deve anunciar as etapas para leitores de tela utilizando `aria-live="assertive"`.
- **Mocks Utilizados**: `MOCK_DESTINATIONS`, `MOCK_WEATHER_FORECAST`, `MOCK_POIS`.
- **Critérios de Aceite**:
  - **CA-UI-013**: O botão de gerar roteiro permanece desabilitado enquanto destino ou datas válidas não forem preenchidos.
  - **CA-UI-014**: Ao clicar em "Gerar Roteiro Inteligente", a interface exibe o estado de loading progressivo antes de direcionar para a tela de itinerário.

---

### 4.8 Rota: `/trips` (Minhas Viagens)

- **Classificação**: Privada.
- **Objetivo**: Exibir o histórico completo de viagens salvas pelo usuário, organizadas por status, permitindo busca rápida e gerenciamento.
- **Navegação**:
  - Clique em um card de viagem ➔ abre os detalhes em `/trips/[id]`.
  - Clique em "Nova Viagem" ➔ direciona para `/explore`.
- **Elementos Obrigatórios**:
  1. Barra superior com título "Minhas Viagens", campo de busca textual e botão "+ Novo Roteiro".
  2. Abas de Filtro: `Todas`, `Próximas Viagens` e `Concluídas/Passadas`.
  3. Grid de Viagens com cards contendo:
     - Imagem de capa do destino;
     - Título e localidade formatada (ex: "Férias em Gramado • RS");
     - Período e contagem total de dias;
     - Badge climático (temperatura média e ícone);
     - Tag de status (`Salvo`, `Rascunho`, `Concluído`);
     - Menu de ações contextuais (Visualizar, Excluir).
  4. Modal de Confirmação de Exclusão ("Tem certeza que deseja excluir esta viagem? Esta ação não pode ser desfeita.").
- **Layout Desktop e Mobile**:
  - *Mobile*: Lista vertical com cards touch-friendly; ações secundárias acessíveis via menu de 3 pontinhos.
  - *Desktop*: Grid responsivo com 2 ou 3 colunas conforme a largura do viewport; hover effects elegantes com elevação do card.
- **Estados da Tela**:
  - *Vazio*: `EmptyState` com chamada convidativa para criar a primeira viagem.
  - *Loading*: Grid com 6 `SkeletonLoader` imitando cards de viagem.
  - *Busca sem Resultados*: "Nenhuma viagem encontrada com o termo pesquisado".
- **Acessibilidade Básica**:
  - Todos os cards possuem foco visível (`focus-visible:ring-2`) e descrição acessível.
- **Mocks Utilizados**: `MOCK_SAVED_TRIPS`.
- **Critérios de Aceite**:
  - **CA-UI-015**: As abas de filtro alternam corretamente a listagem entre próximas viagens e viagens passadas.
  - **CA-UI-016**: A confirmação no modal de exclusão remove o card correspondente da listagem local.

---

### 4.9 Rota: `/trips/[id]` (Detalhes & Revisão Humana do Roteiro)

- **Classificação**: Privada.
- **Objetivo**: Apresentar o itinerário estruturado gerado pela IA, operando como a interface essencial de **Curadoria Humana (Human-in-the-Loop)**. Permite que o usuário inspecione cada dia e turno, edite detalhes das atividades, exclua sugestões inadequadas, adicione novas atividades manuais e salve a versão final aprovada.
- **Navegação**:
  - Clique em "Voltar" ➔ retorna para `/trips` ou `/dashboard`.
  - Clique em "Salvar Roteiro" ➔ persiste alterações locais e exibe toast de confirmação.
  - Clique em "Imprimir / Exportar" ➔ aciona impressão amigável do navegador.
- **Elementos Obrigatórios**:
  1. Cabeçalho da Viagem: Imagem de capa em banner, nome do destino, datas formatadas, badge de clima do período e resumo de ritmo/orçamento.
  2. Barra de Ações: Botão primário "Salvar Roteiro", botão secundário "Adicionar Atividade", botão de impressão/compartilhar.
  3. Seletor/Navegador de Dias: Carrossel ou tabs horizontais (`Dia 1`, `Dia 2`, `Dia 3`, ...), cada um exibindo data e tema do dia (ex: "Dia 1 - Centro Histórico").
  4. Cronograma em Turnos (Manhã, Tarde, Noite):
     - Cartões de atividade contendo: horário sugerido, título da atração, descrição, categoria (cultura, gastronomia, lazer), custo estimado, tempo de duração e dica de clima;
     - Botão de edição inline (permite alterar título, descrição e horário diretamente no card);
     - Botão de excluir atividade (com ícone de lixeira);
     - Botão "+ Adicionar atividade neste turno".
  5. Modal de Adição/Edição de Atividade: Formulário simples com título, turno, horário sugerido, categoria e notas.
- **Layout Desktop e Mobile**:
  - *Mobile*: Linha do tempo vertical contínua; tabs de dias deslizantes horizontalmente; cards de atividade empilhados com botões de edição touch-friendly; barra de salvar fixada no rodapé.
  - *Desktop*: Visualização em duas áreas: navegador de dias fixo à esquerda ou no topo; linha do tempo central detalhada com cards expansíveis e visualização lado a lado.
- **Estados da Tela**:
  - *Padrão (Modo Visualização/Edição)*: Todas as atividades renderizadas com opções de edição instantânea.
  - *Loading*: Skeletons de timeline vertical enquanto recupera os dados da viagem mockada.
  - *Salvamento em Andamento*: Botão "Salvando..." com spinner sutil.
  - *Viagem Não Encontrada (404)*: Tela amigável com mensagem "Roteiro não encontrado" e botão para voltar a `/trips`.
- **Acessibilidade Básica**:
  - A timeline utiliza semântica ordenada (`<ol>`, `<li>`), botões com `aria-label` claros ("Editar atividade Visita ao Pelourinho", "Excluir atividade...").
- **Mocks Utilizados**: `MOCK_TRIP_DETAILS` (estrutura compatível com `Trip` definida em `src/types/trip.ts`).
- **Critérios de Aceite**:
  - **CA-UI-017**: O usuário consegue editar o título de qualquer atividade e ver a alteração refletida imediatamente no card.
  - **CA-UI-018**: O usuário consegue remover uma atividade sugerida pela IA e a timeline é reordenada sem falhas.
  - **CA-UI-019**: O usuário consegue adicionar uma nova atividade manual ao turno desejado via modal/formulário rápido.
  - **CA-UI-020**: O botão "Salvar Roteiro" atualiza o estado da viagem para `saved` e emite confirmação visual (toast).

---

## 5. Estratégia de Dados Mock para a Interface-Base

Nesta fase de desenvolvimento da interface-base, todos os dados exibidos são estritamente originados de arquivos locais em `src/data/mockData.ts`, em conformidade com as interfaces definidas em `src/types/`:

| Contrato TypeScript | Objeto Mock Homologado | Dados Representados |
|---|---|---|
| `UserProfile` (`src/types/user.ts`) | `MOCK_USER` | Usuário logado: nome "Camila Silva", e-mail, avatar e preferências padrão. |
| `TimeOff[]` (`src/types/timeOff.ts`) | `MOCK_TIME_OFFS` | 3 períodos de folga: Feriado Tiradentes (4 dias), Férias de Inverno (10 dias), Recesso Natalino (5 dias). |
| `WeatherForecastSummary` (`src/types/weather.ts`) | `MOCK_WEATHER` | Previsão de 4 dias para Salvador/BA: 27°C médio, chance de chuva 20%, ensolarado. |
| `Trip[]` (`src/types/trip.ts`) | `MOCK_SAVED_TRIPS` | Lista de 3 viagens salvas: Salvador (Próxima), Gramado (Concluída), Rio de Janeiro (Rascunho). |
| `Trip` (`src/types/trip.ts`) | `MOCK_TRIP_DETAILS` | Roteiro detalhado de 4 dias em Salvador com 3 turnos diários completos para curadoria humana. |

> [!NOTE]
> Nenhum dado mockado possui persistência em banco de dados externo nesta fase. O estado de alterações em memória é mantido via hooks de estado do React, servindo de fundação para a futura conexão com Firebase e Gemini.

---

## 6. Diretrizes de Acessibilidade e Responsividade Global

- **Grid e Breakpoints**:
  - Mobile: `< 640px` (coluna única, navegação por BottomNav, touch targets `>= 44px`).
  - Tablet: `640px` a `1024px` (grid de 2 colunas, navegação híbrida).
  - Desktop: `>= 1024px` (layout expandido com sidebar ou header completo, contêiner central `max-w-6xl`).
- **Navegação por Teclado**: Todo componente interativo (botões, cards clicáveis, chips, modais) deve possuir anel de foco evidente (`focus-visible:ring-2 focus-visible:ring-primary`).
- **Contraste de Cores**: Todo texto e ícone deve cumprir a razão de contraste mínima de `4.5:1` para texto normal e `3:1` para texto grande, em conformidade com WCAG 2.1 nível AA.
- **Fechamento de Modais**: Todo modal deve ser fechável com a tecla `Escape` ou clique no backdrop, devolvendo o foco ao elemento acionador.
