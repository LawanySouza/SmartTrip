# SmartTrip ✈️

> **Assistente Inteligente de Viagens com Curadoria Humana e IA Generativa**  
> Desenvolvido como projeto final do curso de IA Generativa.  
> Documento mestre de especificação: [`docs/SPEC_MESTRE.md`](docs/SPEC_MESTRE.md)  
> Especificação operacional de inicialização: [`docs/SPEC_OPERACIONAL.md`](docs/SPEC_OPERACIONAL.md)  
> Especificação da interface-base (UI/UX): [`docs/SPEC_INTERFACE.md`](docs/SPEC_INTERFACE.md)

---

## 🌟 Visão Geral

O **SmartTrip** é uma aplicação web focada em simplificar o planejamento de viagens. Utilizando modelos de inteligência artificial de ponta (**Google Gemini**), o assistente combina o perfil do viajante, seus períodos reais de folga, dados meteorológicos e atrações imperdíveis para estruturar roteiros dia a dia, preservando a **revisão humana** antes do salvamento definitivo.

A arquitetura é orientada pela **SPEC Mestre**, garantindo conformidade com regras de negócio rígidas, isolamento de dados no **Firebase** e deploy serverless na **Vercel**.

---

## 🛠️ Stack Tecnológica

- **Frontend**: React 19, TypeScript (ES2022 / strict), Tailwind CSS v4, Lucide Icons, Framer Motion
- **Build Tool**: Vite 8
- **Autenticação & Banco de Dados**: Firebase Authentication, Cloud Firestore (regras em `firestore.rules`)
- **Inteligência Artificial**: Google Gemini API via `@google/genai` com Structured Outputs (JSON Schema)
- **Meteorologia & Dados**: Open-Meteo API
- **Hospedagem & CI/CD**: Vercel

---

## 📁 Estrutura de Pastas e Módulos

```
smarttrip/
├── docs/                             # Documentação técnica e de produto
│   └── SPEC_MESTRE.md                # SPEC mestre oficial (20 seções com IDs estáveis)
├── public/                           # Assets estáticos
├── src/
│   ├── components/                   # Componentes reutilizáveis de UI
│   │   ├── BottomNav.tsx             # Navegação inferior mobile
│   │   ├── NavigationHeader.tsx      # Barra de navegação superior
│   │   └── ScreenSwitcherBar.tsx     # Barra de inspeção das telas
│   ├── data/                         # Mock data mantido para desenvolvimento visual
│   │   └── mockData.ts
│   ├── screens/                      # Telas da aplicação mapeadas para as US
│   │   ├── HomeScreen.tsx            # Tela inicial e busca rápida
│   │   ├── NewTripScreen.tsx         # Formulário de preferências e destino
│   │   ├── ItineraryScreen.tsx       # Listagem e curadoria de roteiros
│   │   ├── TripDetailsScreen.tsx     # Detalhes diários do roteiro
│   │   ├── LoginScreen.tsx           # Tela de autenticação
│   │   ├── RegisterScreen.tsx        # Cadastro de novos usuários
│   │   └── ForgotPasswordScreen.tsx  # Recuperação de acesso
│   ├── services/                     # Camada de integração com serviços externos (scaffolding)
│   │   ├── firebase/                 # Firebase Auth & Firestore client stub
│   │   ├── gemini/                   # Google Gemini AI client stub
│   │   └── weather/                  # Open-Meteo weather client stub
│   ├── types/                        # Contratos de tipos da SPEC Mestre
│   │   ├── user.ts                   # Usuário, perfil e preferências (RF-005, RF-008)
│   │   ├── timeOff.ts                # Períodos de folga e feriados (RF-006, RF-007)
│   │   ├── trip.ts                   # Viagens, dias e atividades (RF-015, RF-016, RF-021)
│   │   ├── weather.ts                # Dados e previsões climáticas (RF-011)
│   │   └── index.ts                  # Ponto central de exportação dos tipos
│   ├── App.tsx                       # Componente raiz da SPA
│   ├── main.tsx                      # Ponto de montagem React
│   └── index.css                     # Estilos globais e tokens Tailwind
├── .env.example                      # Template de variáveis sem valores sensíveis
├── .gitignore                        # Proteção de credenciais, logs e caches
├── firestore.rules                   # Regras de segurança conceituais do Firestore
├── package.json                      # Dependências e scripts do projeto
├── tsconfig.json                     # Configuração de checagem do compilador TypeScript
└── vite.config.ts                    # Configurações do bundler Vite
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js**: v20+ ou v22+ (LTS recomendado)
- **npm**: v10+

### 1. Clonar e Instalar Dependências
```bash
git clone <url-do-repositorio>
cd smarttrip
npm install --legacy-peer-deps
```

### 2. Configurar Variáveis de Ambiente
Copie o template `.env.example` para `.env.local` e configure suas credenciais:
```bash
cp .env.example .env.local
```
> **Nota de Segurança**: O arquivo `.env.local` está incluído no `.gitignore` e **nunca** deve ser comitado.

### 3. Executar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse a aplicação no navegador em: `http://localhost:3000`

---

## 🧪 Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento Vite na porta 3000 |
| `npm run lint` | Executa a checagem estática de tipos com `tsc --noEmit` |
| `npm run build` | Compila o bundle otimizado de produção em `dist/` |
| `npm run preview` | Inicia um servidor local servindo a pasta `dist/` gerada |
| `npm run clean` | Remove artefatos de compilação anteriores |

---

## 🗺️ Rastreabilidade com a SPEC Mestre

O desenvolvimento segue o Roadmap Incremental da **SPEC Mestre** ([docs/SPEC_MESTRE.md](docs/SPEC_MESTRE.md)):

- **Fase 0 (Atual)**: Setup, infraestrutura, contratos de tipos e scaffolding de segurança. ✅
- **Fase 1 (Próxima)**: Autenticação via Firebase Auth, tela de Perfil e Gestão de Folgas (`US-001`, `US-002`, `US-003`, `US-004`).
- **Fase 2**: Busca de Destino, Geolocalização, Clima Open-Meteo e POIs (`US-005`, `US-006`, `US-007`, `US-008`).
- **Fase 3**: Motor de IA com Google Gemini e Tela de Revisão Humana (`US-009`, `US-010`).
- **Fase 4**: Persistência atômica no Firestore e Gestão de Viagens (`US-011`, `US-012`, `US-013`).
- **Fase 5**: Hardening de segurança, testes e deploy de produção na Vercel (`US-015`, `CA-001` a `CA-007`).
- **Fase 6**: Evoluções Pós-MVP (compartilhamento, feed social, calendário).
