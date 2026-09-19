# Política de Git e Fluxo de Trabalho em Equipe — SmartTrip

**Versão:** 1.0  
**Público-alvo:** Equipe de Alunos e Desenvolvedores do SmartTrip  
**Objetivo:** Estabelecer um fluxo de trabalho simples, previsível e profissional, evitando conflitos de merge, código quebrado na branch principal e vazamento de credenciais.

---

## 1. Estrutura de Branches

Adotamos uma versão simplificada e enxuta do **GitHub Flow**, ideal para times acadêmicos com entregas contínuas e ágeis.

```
       [feature/RF-006-availability] ─────────────┐ (PR com review)
      /                                           ▼
main ─────────────────────────────────────────── [Merge] ─────────► (Deploy Automático)
      \                                           ▲
       [fix/login-error-message] ─────────────────┘
```

### 1.1 Branch Principal (`main`)
- **Regra de Ouro:** A branch `main` representa o código de **produção**. Ela deve estar **sempre estável, compilando e com todos os testes passando**.
- **Proteção:** **É expressamente proibido fazer `git push` direto na `main`**. Qualquer alteração entra exclusivamente via **Pull Request (PR)** aprovado.

### 1.2 Branches de Trabalho (`feature/`, `fix/`, etc.)
Toda nova funcionalidade ou correção deve ser desenvolvida em uma branch separada, criada sempre a partir da versão mais recente da `main`:

```bash
git checkout main
git pull origin main
git checkout -b feature/nome-da-tarefa
```

#### Padrão de Nomenclatura das Branches

| Tipo | Padrão | Exemplo | Quando Usar |
| :--- | :--- | :--- | :--- |
| **Nova Funcionalidade** | `feature/RF-XXX-descricao-curta` | `feature/RF-006-availability` | Nova tela, serviço ou integração descrita na SPEC. |
| **Correção de Bug** | `fix/descricao-do-problema` | `fix/firebase-timestamp-null` | Correção de defeito em funcionalidade já existente. |
| **Refatoração** | `refactor/modulo-alvo` | `refactor/user-service-types` | Melhoria de código ou tipagem sem alterar o comportamento. |
| **Documentação** | `docs/nome-do-documento` | `docs/spec-firestore-update` | Criação ou atualização de especificações e README. |
| **Testes** | `test/escopo-do-teste` | `test/auth-integration-cases` | Adição ou aprimoramento de suítes de testes unitários. |

---

## 2. Granularidade e Tamanho da Entrega

PRs gigantescas (acima de 500 linhas alteradas) tornam o Code Review superficial, aumentam conflitos de merge e atrasam o projeto.

### 2.1 Tamanho Recomendado
- **Ideal:** Entre **100 e 350 linhas de código** alteradas por PR.
- **Limite Máximo Aceitável:** 500 linhas (com justificativa, como inclusão de mock inicial).
- **Tempo Máximo de Vida da Branch:** No máximo **2 a 3 dias** de trabalho. Se a tarefa for muito grande, quebre-a em sub-tarefas atômicas.

### 2.2 Regra de Ouro: Uma Única Responsabilidade por PR
> **NÃO misture funcionalidades distintas no mesmo Pull Request!**

- ❌ **Incorreto:** Um PR que implementa a tela de Folgas (`/availability`), corrige um bug no Login e aproveita para mudar as cores do botão no Header.
- ✅ **Correto:** 
  1. PR 1: `feature/RF-006-availability-screen` (apenas folgas)
  2. PR 2: `fix/login-validation-error` (apenas correção de login)
  3. PR 3: `refactor/header-button-styles` (apenas ajuste de estilo)

---

## 3. Padrão de Mensagens de Commit

Adotamos a convenção **Conventional Commits** simplificada em português ou inglês, incluindo a referência ao Requisito da SPEC (`RF-XXX` ou `RN-XXX`).

### 3.1 Estrutura
```
<tipo>(<escopo>): <descrição no imperativo> [RF-XXX]

[corpo opcional explicando o motivo da alteração]
```

### 3.2 Tipos Permitidos
- `feat`: Nova funcionalidade para a pessoa usuária.
- `fix`: Correção de um bug.
- `refactor`: Mudança de código que não altera funcionalidade nem corrige bug.
- `test`: Criação ou ajuste de testes automatizados.
- `docs`: Alteração apenas em arquivos de documentação (Markdown).
- `chore`: Atualização de dependências, scripts de build ou configs.

### 3.3 Exemplos Práticos
```bash
# Bom: Claro, no imperativo, apontando o requisito
git commit -m "feat(availability): implementa validacao de sobreposicao de folgas [RF-006]"
git commit -m "fix(auth): corrige mapeamento de erro para email inexistente [RF-002]"
git commit -m "test(preferences): adiciona cenarios de selecao multipla de interesses"

# Ruim: Vago, genérico, sem rastreabilidade
git commit -m "ajustes"
git commit -m "subindo código"
git commit -m "arrumando o que quebrou"
```

---

## 4. Proibição Absoluta de Secrets (Credenciais e Chaves)

> ⚠️ **ATENÇÃO CRÍTICA DE SEGURANÇA:**  
> Nenhuma chave privada, token de API com cobrança, senha ou arquivo de credenciais de serviço pode ser comitado no Git!

1. **Arquivos Proibidos no Git:**
   - `.env.local`, `.env.preview`, `.env.production`
   - Chaves de serviço JSON do Firebase (`service-account.json`)
   - `GEMINI_API_KEY` (chave privada que gera cobrança financeira)
2. **Uso de Templates:**
   - Apenas o arquivo `.env.example` pode e deve ser commitado no repositório, contendo os nomes das variáveis com **valores em branco**.
3. **Se você acidentalmente comitar uma chave:**
   - Comunique a equipe imediatamente no canal de comunicação.
   - **Revogue a chave imediatamente** no console do provedor (Google AI Studio ou Firebase Console). Simplesmente apagar o arquivo em um novo commit **NÃO** remove a chave do histórico do Git.

---

## 5. Rastreabilidade com a SPEC do SmartTrip

Todo Pull Request deve estar formalmente associado a pelo menos um Requisito Funcional (`RF`), Requisito Não-Funcional (`RNF`) ou Regra de Negócio (`RN`) presentes em:
- [SPEC Mestre (`docs/SPEC_MESTRE.md`)](file:///c:/Users/Aluno/Downloads/smarttrip/docs/SPEC_MESTRE.md)
- [SPEC de Interface (`docs/SPEC_INTERFACE.md`)](file:///c:/Users/Aluno/Downloads/smarttrip/docs/SPEC_INTERFACE.md)
- [SPEC Firestore (`docs/SPEC_FIRESTORE.md`)](file:///c:/Users/Aluno/Downloads/smarttrip/docs/SPEC_FIRESTORE.md)
- [SPEC de Disponibilidade & Preferências (`docs/SPEC_DISPONIBILIDADE_E_PREFERENCIAS.md`)](file:///c:/Users/Aluno/Downloads/smarttrip/docs/SPEC_DISPONIBILIDADE_E_PREFERENCIAS.md)

**Como fazer:**
- No título do PR: `feat: Gestão de Períodos de Folga [RF-006]`
- No corpo do PR: Link para a seção correspondente da SPEC e menção aos critérios de aceite atendidos.

---

## 6. Conteúdo Mínimo de um Pull Request (PR)

Ao abrir um PR para a branch `main`, o autor é responsável por preencher o template contendo:
1. **Título Padronizado:** Claro e com a tag do requisito.
2. **Descrição / Motivação:** Resumo de 2 a 4 frases sobre o que foi feito e por que.
3. **Requisitos Atendidos:** Lista dos IDs das especificações (ex: `RF-006`, `RN-002`).
4. **Principais Alterações Técnicas:** Lista em tópicos dos arquivos ou módulos alterados.
5. **Evidência de Testes:**
   - Print ou log do terminal demonstrando `npm run lint` sem erros (código 0).
   - Print ou log do terminal demonstrando `npm run test` com os testes passando.
   - Captura de tela ou GIF demonstrando a funcionalidade na interface (quando envolver tela).

---

## 7. Checklist de Code Review (Revisão por Pares)

Pelo menos **1 colega de equipe (Peer Reviewer)** deve revisar e aprovar o PR antes de realizar o merge. O revisor deve inspecionar:

- [ ] **Rastreabilidade:** O PR resolve exatamente o que o requisito da SPEC pediu?
- [ ] **Sem Secrets:** Nenhum token, senha, chave privada ou arquivo `.env.local` foi incluído no diff?
- [ ] **Escopo Limpo:** Há apenas arquivos pertinentes a essa funcionalidade? (Sem arquivos temporários, lixo ou formatações acidentais em arquivos não relacionados).
- [ ] **Tipagem TypeScript:** O código compila sem `any` desnecessário e sem supressões do compilador (`@ts-ignore`)?
- [ ] **Sem `console.log` esquecido:** Todos os logs de depuração temporários foram removidos?
- [ ] **Boas Práticas de UI:** O layout respeita responsividade básica (desktop e mobile) e estados de carregamento/erro?
- [ ] **Testes Incluídos:** Há testes unitários cobrindo cenários felizes e casos de erro?
- [ ] **Build e Testes Verificados:** A suíte de testes passou localmente no branch do revisor ou no CI?

---

## 8. Definition of Done (DoD) para Realizar o Merge

Uma funcionalidade só é considerada **Pronta (Done)** e apta para merge na branch `main` quando todos os critérios abaixo forem atendidos:

1. ✅ **Código Implementado:** Alinhado 100% com a SPEC de referência.
2. ✅ **Lint Aprovado:** Comando `npm run lint` executa com código 0 (zero erros de tipagem).
3. ✅ **Testes Automatizados Aprovados:** Comando `npm run test` executa e passa todos os testes unitários da aplicação.
4. ✅ **Build de Produção Aprovado:** Comando `npm run build` gera os pacotes em `dist/` sem falhas.
5. ✅ **Branch Atualizada com a `main`:** Sem conflitos pendentes com a branch principal.
6. ✅ **Revisão Aprovada:** Pelo menos 1 aprovação (Review Approved) de outro membro do time.
7. ✅ **Método de Merge:** Recomendado **Squash and Merge** para manter o histórico da `main` linear e limpo.
