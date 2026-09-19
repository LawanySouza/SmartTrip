# SPEC Operacional: Inicialização, Padronização e Reprodutibilidade do Repositório SmartTrip

> **Projeto**: SmartTrip - Assistente Inteligente de Viagens  
> **Documento**: Especificação Operacional de Inicialização e Governança Técnica  
> **Versão**: 1.0.0  
> **Status**: Vigente  
> **Referência Cruzada**: [`docs/SPEC_MESTRE.md`](SPEC_MESTRE.md)  

---

## 1. Objetivo e Escopo

Esta especificação estabelece os requisitos operacionais, critérios verificáveis de reprodutibilidade e normas de governança técnica para que qualquer desenvolvedor, instrutor ou aluno consiga clonar, instalar, configurar, validar e evoluir o repositório **SmartTrip** de forma determinística, sem atrito de ambiente e em conformidade estrita com a **SPEC Mestre**.

---

## 2. Requisitos de Ambiente e Runtime

### 2.1 Versão do Node.js
- **Critério E-01 (Versão Homologada)**: O runtime oficial é o **Node.js LTS** nas linhas **v20.x** (mínimo `v20.18.0`) ou **v22.x** (recomendado `v22.14.0+`).
- **Critério E-02 (Verificação Automatizável)**:
  ```bash
  node -e "const [m] = process.versions.node.split('.').map(Number); if (m < 20) { console.error('Node.js >= 20.18.0 é obrigatório. Versão atual:', process.version); process.exit(1); } else { console.log('Node.js OK:', process.version); }"
  ```
- **Critério E-03 (Bloqueio de Versões)**: Versões do Node.js inferiores a `20.0.0` são terminantemente rejeitadas por incompatibilidade com as dependências do Vite 8 e Tailwind CSS v4.

### 2.2 Gerenciador de Pacotes e Resolução de Dependências
- **Critério E-04 (Gerenciador Padrão)**: O gerenciador oficial e exclusivo é o **`npm`** (versão `>= 10.8.0`).
- **Critério E-05 (Flag de Instalação Obrigatória)**: Devido à transição de peer dependencies entre ferramentas do ecossistema React 19 e Vite 8, a instalação de dependências deve ser executada obrigatoriamente com a flag de compatibilidade:
  ```bash
  npm install --legacy-peer-deps
  ```
- **Critério E-06 (Integridade do Lockfile)**: O arquivo `package-lock.json` deve ser mantido versionado no repositório. Nenhuma instalação limpa pode alterar hashes ou gerar diffs não intencionais no lockfile.

---

## 3. Scripts Obrigatórios do Repositório

O arquivo `package.json` deve conter obrigatoriamente os seguintes scripts padronizados:

| Script | Comando Executado | Critério Verificável de Sucesso | Código de Saída Esperado |
|---|---|---|:---:|
| `npm run dev` | `vite --port=3000 --host=0.0.0.0` | Servidor HTTP local ativo respondendo `200 OK` em `http://localhost:3000` | N/A (daemon) |
| `npm run lint` | `tsc --noEmit` | Checagem estática de tipos sem erros ou avisos não suprimidos | `0` |
| `npm run build` | `vite build` | Geração do diretório `dist/` contendo `dist/index.html` e bundles JS/CSS válidos | `0` |
| `npm run preview` | `vite preview` | Servidor de teste local servindo a pasta `dist/` gerada pelo build | N/A (daemon) |
| `npm run clean` | `rm -rf dist server.js` | Remoção completa de diretórios e artefatos temporários de build | `0` |

---

## 4. Estratégia de Variáveis de Ambiente e Segredos

### 4.1 Política do `.env.example`
- **Critério ENV-01 (Ausência Total de Valores)**: O arquivo `.env.example` deve conter **exclusivamente nomes de variáveis acompanhados do sinal de igual sem qualquer valor pré-preenchido** (formato `CHAVE=`).
- **Critério ENV-02 (Documentação Inline)**: Cada bloco de variáveis deve possuir comentários explicativos indicando a finalidade e a URL do console onde a credencial deve ser obtida.
- **Critério ENV-03 (Catálogo Obrigatório de Chaves)**:
  ```env
  # Google Gemini AI API Key (https://aistudio.google.com/)
  GEMINI_API_KEY=

  # Firebase Client Configuration (Firebase Console > Project Settings)
  VITE_FIREBASE_API_KEY=
  VITE_FIREBASE_AUTH_DOMAIN=
  VITE_FIREBASE_PROJECT_ID=
  VITE_FIREBASE_STORAGE_BUCKET=
  VITE_FIREBASE_MESSAGING_SENDER_ID=
  VITE_FIREBASE_APP_ID=

  # URL base da aplicação
  APP_URL=
  ```
- **Critério ENV-04 (Teste Verificável de Template Limpo)**:
  ```bash
  # Nenhuma linha de atribuição pode conter caracteres além de espaços após o '='
  node -e "const fs = require('fs'); const lines = fs.readFileSync('.env.example', 'utf8').split('\n'); const filled = lines.filter(l => l.includes('=') && !l.startsWith('#') && l.split('=')[1].trim() !== ''); if (filled.length > 0) { console.error('.env.example contém valores proibidos:', filled); process.exit(1); } else { console.log('.env.example 100% limpo'); }"
  ```

### 4.2 Política do `.env.local`
- **Critério ENV-05 (Segregação Local)**: Credenciais reais devem residir unicamente no arquivo local `.env.local`, criado manualmente pelo desenvolvedor por cópia do `.env.example`.
- **Critério ENV-06 (Não Versionamento Compulsório)**: O `.env.local` nunca deve ser adicionado ao índice do Git (`git add`), sob nenhuma hipótese.

---

## 5. Regras Normativas do `.gitignore`

O `.gitignore` deve garantir o bloqueio multinível de segredos, caches e artefatos de sistema operacional:

```gitignore
# Dependências
node_modules/
.pnp
.pnp.js

# Build e Distribuição
dist/
build/
coverage/

# Variáveis de Ambiente e Segredos (NUNCA versionar)
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env*.local
.env*
!.env.example

# Credenciais e Certificados
*.pem
*.key
*.cert
serviceAccountKey*.json
*firebase-adminsdk*.json

# Logs e Diagnósticos
*.log
npm-debug.log*
yarn-debug.log*
firebase-debug.log*
firestore-debug.log*

# Frameworks e Cloud Deployments
.vercel/
.firebase/

# Sistema Operacional e IDEs
.DS_Store
Thumbs.db
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea/
```

### Critério Verificável de Bloqueio de Segredos:
```bash
git check-ignore -v .env.local serviceAccountKey.json credentials.pem
# A saída deve retornar correspondência positiva no .gitignore para todos os arquivos sensíveis.
```

---

## 6. Convenção de Branches

Para assegurar rastreabilidade com a **SPEC Mestre**, as branches devem seguir a nomenclatura padronizada baseada em tipos e identificadores estáveis:

### 6.1 Estrutura do Nome da Branch
`tipo/<id-da-spec>-<descricao-curta-kebab>`

### 6.2 Prefixos Autorizados
- `feature/`: Implementação de História de Usuário (`feature/US-001-cadastro-login`, `feature/US-004-gestao-folgas`, `feature/US-009-geracao-gemini`).
- `fix/`: Correção de bug em requisito funcional (`fix/RF-007-validacao-datas-folga`, `fix/RF-014-json-schema-gemini`).
- `docs/`: Alteração ou adição de documentações (`docs/spec-operacional`, `docs/atualizacao-readme`).
- `refactor/`: Refatoração estrutural sem alteração funcional (`refactor/scaffolding-servicos`).
- `chore/`: Atualização de dependências ou configurações de build (`chore/upgrade-vite-config`).

### 6.3 Regra de Integração
- A branch padrão e de produção é a `main`.
- Nenhuma branch secundária pode ser integrada diretamente sem antes passar pela validação de `npm run lint` e `npm run build` com código de saída 0.

---

## 7. Convenção de Commits (Conventional Commits 1.0.0)

Todo commit deve seguir o padrão semântico com vinculação obrigatória ao ID da SPEC:

### 7.1 Formato da Mensagem
```text
<tipo>(<escopo>): <descrição no imperativo e minúsculo> [<ID_SPEC>]
```

### 7.2 Tipos Permitidos
- `feat`: Nova funcionalidade do produto (`feat(auth): implementa login social com google [US-002]`).
- `fix`: Correção de defeito em funcionalidade existente (`fix(trips): corrige calculo de duracao em dias [RF-015]`).
- `docs`: Modificações exclusivamente em documentação (`docs(readme): adiciona guia de instalacao local`).
- `refactor`: Refatoração interna de código (`refactor(types): alinha modelo de trip com a spec [RF-021]`).
- `test`: Criação ou atualização de testes (`test(auth): valida rejeicao de payload invalido`).
- `chore`: Alterações em ferramentas de build, configs ou pacotes (`chore(deps): adiciona stubs de servicos`).

### 7.3 Regras Sintáticas Verificáveis
1. A primeira linha (título) não pode ultrapassar **72 caracteres**.
2. O verbo deve estar no modo **imperativo afirmativo** em português ("adiciona", "corrige", "implementa", e não "adicionado" ou "adicionando").
3. Não deve haver ponto final ao término do título.
4. Quando associado a um requisito ou história, deve incluir o identificador entre colchetes no final: `[US-xxx]`, `[RF-xxx]` ou `[RN-xxx]`.

---

## 8. Requisitos Normativos para o README.md

O `README.md` raiz deve atender compulsoriamente aos seguintes critérios estruturais:

1. **Identificação Clara**: Título do projeto e subtítulo explicativo com escopo de produto em até 2 linhas.
2. **Link Direto para a SPEC**: Link relativo funcional para [`docs/SPEC_MESTRE.md`](SPEC_MESTRE.md).
3. **Quadro de Tecnologias**: Tabela ou lista com todas as tecnologias centrais e suas respectivas versões de runtime.
4. **Pré-requisitos Explícitos**: Declaração das versões mínimas homologadas de Node.js e npm.
5. **Quickstart em 3 Passos**:
   - Passo 1: Instalação (`npm install --legacy-peer-deps`);
   - Passo 2: Configuração de ambiente (`cp .env.example .env.local`);
   - Passo 3: Inicialização (`npm run dev`).
6. **Catálogo de Scripts**: Tabela com todos os comandos disponíveis no `package.json` e o que cada um realiza.
7. **Árvore de Diretórios Anotada**: Diagrama visual da estrutura de pastas descrevendo a responsabilidade de cada diretório.
8. **Matriz de Rastreabilidade**: Seção indicando a fase atual do Roadmap da SPEC e próximas etapas.

---

## 9. Critérios de Reprodutibilidade do Ambiente

Um ambiente de desenvolvimento do SmartTrip é formalmente considerado **reproduzível** quando satisfaz todos os critérios abaixo:

- **REP-001 (Instalação Zero-State Determinística)**: A execução de `npm install --legacy-peer-deps` a partir de um clone limpo (sem pasta `node_modules`) conclui com código de saída `0` e sem alterar o arquivo `package-lock.json`.
- **REP-002 (Independência de Plataforma / SO)**: Todos os scripts (`dev`, `lint`, `build`, `clean`) funcionam com paridade idêntica em **Windows (PowerShell)**, **macOS (zsh/bash)** e **Linux (bash)**, sem caminhos absolutos hardcoded no código fonte.
- **REP-003 (Zero Dependências Globais)**: Nenhuma ferramenta de compilação ou checagem (`tsc`, `vite`, `tailwindcss`) exige instalação global no sistema operacional do usuário; todas são executadas via dependências locais do projeto.
- **REP-004 (Resiliência Sem Chaves Reais no Setup Inicial)**: A aplicação em desenvolvimento (`npm run dev`) inicia com sucesso mesmo na ausência de chaves reais no `.env.local`, operando com fallbacks e stubs informativos sem lançar exceções não tratadas no carregamento da SPA.
- **REP-005 (Validação de Tipos 100% Limpa)**: O comando `npm run lint` executa sem nenhum erro de compilação TypeScript com `strict: true`.
- **REP-006 (Geração de Bundle de Produção)**: O comando `npm run build` conclui com código `0`, gerando a pasta `dist/` contendo arquivos compilados sem referências a caminhos de máquina local.

---

## 10. Checklist de Onboarding para Outro Aluno (Clone, Install & Run)

Este checklist serve como roteiro formal de validação para qualquer novo colaborador:

```markdown
### Checklist de Verificação de Entrada (Passo a Passo)

- [ ] **Passo 1: Clonar o Repositório**
  - Comando: `git clone <URL_DO_REPOSITORIO> smarttrip`
  - Verificação: Pasta `smarttrip` criada contendo `docs/`, `src/`, `package.json` e `README.md`.

- [ ] **Passo 2: Validar Versão do Node.js**
  - Comando: `node -v`
  - Critério: Versão retornada deve ser `>= v20.18.0` (ex: `v22.14.0`).

- [ ] **Passo 3: Validar Versão do npm**
  - Comando: `npm -v`
  - Critério: Versão retornada deve ser `>= 10.8.0`.

- [ ] **Passo 4: Instalar Dependências do Projeto**
  - Comando: `npm install --legacy-peer-deps`
  - Critério: Código de saída `0`; pasta `node_modules` gerada sem erros impeditivos de peer dependency.

- [ ] **Passo 5: Criar Arquivo de Variáveis Locais**
  - Comando: `cp .env.example .env.local` (Linux/Mac) ou `Copy-Item .env.example .env.local` (PowerShell)
  - Critério: Arquivo `.env.local` presente na raiz do projeto.

- [ ] **Passo 6: Auditar Proteção de Segredos no Git**
  - Comando: `git status --short`
  - Critério: O arquivo `.env.local` NÃO pode aparecer na lista de arquivos modificados ou não rastreados.

- [ ] **Passo 7: Executar Checagem Estática de Tipos (Lint)**
  - Comando: `npm run lint`
  - Critério: Execução de `tsc --noEmit` finalizada com código `0` e zero erros de tipo.

- [ ] **Passo 8: Executar Compilação de Produção (Build)**
  - Comando: `npm run build`
  - Critério: Pasta `dist/` gerada contendo `dist/index.html` e artefatos compilados; código de saída `0`.

- [ ] **Passo 9: Iniciar o Servidor de Desenvolvimento**
  - Comando: `npm run dev`
  - Critério: Mensagem no terminal `VITE v8.x.x ready in ... ms` exibindo `http://localhost:3000`.

- [ ] **Passo 10: Validar Renderização no Navegador**
  - Ação: Acessar `http://localhost:3000` no Google Chrome, Firefox ou Edge.
  - Critério: Interface SPA do SmartTrip carregada com o cabeçalho, tela inicial e barra de navegação visíveis sem tela branca (White Screen of Death) ou exceções no console do desenvolvedor.
```
